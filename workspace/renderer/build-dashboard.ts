// Dashboard surface build (A3b-4).
//
// Renders the product-dashboard (work-ledger-first) into the deployable
// surface at workspace/dist/dashboard/. Reads from a configurable
// work-ledger root (default: workspace/renderer/fixtures/dashboard/;
// override with --root <path> or env DASHBOARD_ROOT).
//
// Page layout:
//   dashboard/             — work ledger index (now/next/later columns + record)
//   dashboard/item/<id>/   — per-item detail
//   dashboard/progress/    — objectives / OKRs / north-star
//   dashboard/strategy/    — vision & strategy
//
// The join: portal-projection.json supplies current_stage for in-delivery
// items. The degraded-mode contract: if the snapshot is absent OR its commit
// differs from the current git HEAD, all snapshot-sourced fields render as
// "unknown" and a visible provenance banner appears. The authored layer always
// renders in full — no panel blanks on a missing snapshot.
//
// Run:
//   bun run workspace/renderer/build-dashboard.ts
//   bun run workspace/renderer/build-dashboard.ts --root /path/to/surface

import {
  readFileSync, writeFileSync, mkdirSync, copyFileSync,
  existsSync, rmSync, readdirSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

import {
  parseFrontmatter, renderMarkdown, extractToc, assetBasenames,
  type CorePage,
} from "./vendor/bc-renderer-core/src/index.js";
import type { NavGroup } from "./vendor/bc-renderer-core/src/index.js";
import { renderSurfacePage } from "./shell-host.js";

// ── Path setup ───────────────────────────────────────────────────────────────

const rendererDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rendererDir, "..", "..");
const distRoot = path.join(rendererDir, "..", "dist");
const surfaceDir = path.join(distRoot, "dashboard");
const vendorAssetsDir = path.join(rendererDir, "vendor", "bc-renderer-core", "assets");
const brandDir = path.join(rendererDir, "brand");

// ── CLI / env root override ──────────────────────────────────────────────────

function resolveRoot(): string {
  const args = process.argv.slice(2);
  const rootIdx = args.indexOf("--root");
  if (rootIdx !== -1 && args[rootIdx + 1]) {
    return path.resolve(args[rootIdx + 1]);
  }
  if (process.env["DASHBOARD_ROOT"]) {
    return path.resolve(process.env["DASHBOARD_ROOT"]);
  }
  return path.join(rendererDir, "fixtures", "dashboard");
}

const dashRoot = resolveRoot();

// Projection snapshot path. Assembly points this at the *published* snapshot
// (workspace/dist/portal-projection.json) via --projection, decoupled from the
// ledger root so publishing never pollutes the source ledger/fixture.
function resolveProjectionPath(): string {
  const args = process.argv.slice(2);
  const i = args.indexOf("--projection");
  if (i !== -1 && args[i + 1]) return path.resolve(args[i + 1]);
  if (process.env["PORTAL_PROJECTION"]) return path.resolve(process.env["PORTAL_PROJECTION"]);
  return path.join(dashRoot, "portal-projection.json");
}
const projectionPath = resolveProjectionPath();

// ── Helpers ──────────────────────────────────────────────────────────────────

function ensureDir(dir: string) { mkdirSync(dir, { recursive: true }); }
function writeHtml(filePath: string, html: string) {
  ensureDir(path.dirname(filePath));
  writeFileSync(filePath, html, "utf-8");
}
const log = (m: string) => process.stdout.write(m + "\n");
const warn = (m: string) => process.stderr.write("[warn] " + m + "\n");

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Types ────────────────────────────────────────────────────────────────────

interface GateDecision {
  gate: string;
  decision: string;
  owner: string;
  timestamp: string;
  evidence_refs?: string[];
  confidence?: string;
  conditions?: string | null;
  override?: string;
}

interface FrozenTimeline {
  final_stage: string;
  captured_at: string;
  transitions: Array<{ stage: string; at: string }>;
}

interface RiskState {
  value?: string;
  feasibility?: string;
  usability?: string;
  viability?: string;
  evidence_note?: string;
}

interface WorkItemFm {
  id: string;
  title: string;
  lifecycle_state: string;
  tier?: string;
  outcome_link?: string;
  value_prop_link?: string;
  risk_state?: RiskState;
  gate_decisions?: GateDecision[];
  stage_override?: string;
  children?: string[];
  frozen_timeline?: FrozenTimeline;
  links?: {
    spec_pr?: string | null;
    build_prs?: string[];
    debrief?: string | null;
  };
  disposition?: string;
  [k: string]: unknown;
}

interface ManifestItem {
  id: string;
  file: string;
  title: string;
  lifecycle_state: string;
  tier?: string;
  outcome_link?: string;
}

interface PortalProjection {
  provenance: {
    commit: string;
    generated_at: string;
    generator_version: string;
  };
  carriers: Record<string, {
    current_stage: string | null;
    transition_summary: Array<{ stage: string; at: string }>;
  }>;
  nodes: Record<string, { last_used: string | null; traversals_30d: number }>;
  ax: Record<string, unknown>;
}

interface WorkItem {
  id: string;
  fm: WorkItemFm;
  body: string;
  sourcePath: string;
}

// ── Lifecycle mapping ────────────────────────────────────────────────────────
// Design: later = idea/discovery; next = defined; now = committed;
//         building = in-delivery; record = shipped/live/parked/killed

type LedgerColumn = "now" | "next" | "later" | "building" | "record";

function lifecycleToColumn(state: string): LedgerColumn {
  switch (state) {
    case "idea":
    case "discovery": return "later";
    case "defined":   return "next";
    case "committed": return "now";
    case "in-delivery": return "building";
    case "shipped":
    case "live":
    case "parked":
    case "killed":    return "record";
    default:          return "later";
  }
}

// Column display labels
const COLUMN_LABELS: Record<LedgerColumn, string> = {
  now:      "Now — committed",
  next:     "Next — defined",
  later:    "Later — explore",
  building: "Building — in delivery",
  record:   "Record — shipped / live / parked / killed",
};

// ── Git HEAD resolution ──────────────────────────────────────────────────────

function getGitHead(): string | null {
  try {
    return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf-8" }).trim();
  } catch {
    return null;
  }
}

// ── Projection loading ───────────────────────────────────────────────────────

interface ProjectionResult {
  projection: PortalProjection | null;
  /** true = snapshot present AND commit matches current HEAD */
  fresh: boolean;
  /** human-readable staleness reason, or null when fresh */
  staleReason: string | null;
  gitHead: string | null;
}

function loadProjection(): ProjectionResult {
  const snapshotPath = projectionPath;
  const gitHead = getGitHead();

  if (!existsSync(snapshotPath)) {
    return {
      projection: null,
      fresh: false,
      staleReason: "No portal-projection.json found — snapshot absent.",
      gitHead,
    };
  }

  let projection: PortalProjection;
  try {
    projection = JSON.parse(readFileSync(snapshotPath, "utf-8")) as PortalProjection;
  } catch (e) {
    return {
      projection: null,
      fresh: false,
      staleReason: `portal-projection.json is malformed: ${e}`,
      gitHead,
    };
  }

  const snapshotCommit = projection.provenance?.commit ?? null;
  if (!gitHead || !snapshotCommit || snapshotCommit !== gitHead) {
    const reason = !gitHead
      ? "Could not determine git HEAD (not in a git repo?)."
      : !snapshotCommit
      ? "Snapshot has no commit recorded."
      : `Snapshot commit ${snapshotCommit.slice(0, 8)} ≠ HEAD ${gitHead.slice(0, 8)}.`;
    return { projection, fresh: false, staleReason: reason, gitHead };
  }

  return { projection, fresh: true, staleReason: null, gitHead };
}

// ── Provenance banner ────────────────────────────────────────────────────────

function provenanceBanner(result: ProjectionResult): string {
  if (result.fresh) return "";
  const { projection, staleReason, gitHead } = result;
  const generatedAt = projection?.provenance?.generated_at ?? "unknown";
  const snapshotCommit = projection?.provenance?.commit
    ? projection.provenance.commit.slice(0, 8)
    : "—";
  const headShort = gitHead ? gitHead.slice(0, 8) : "unknown";

  return `<div class="provenance-banner">
  <span class="provenance-icon">⚠</span>
  <div class="provenance-body">
    <strong>Snapshot stale or absent</strong> — projected fields (current_stage) shown as <em>unknown</em>.
    <span class="provenance-detail">${esc(staleReason ?? "")} Snapshot: ${esc(generatedAt)} @ <code>${esc(snapshotCommit)}</code> · HEAD: <code>${esc(headShort)}</code></span>
  </div>
</div>`;
}

// ── Item loading ─────────────────────────────────────────────────────────────

function loadItems(): WorkItem[] {
  const itemsDir = path.join(dashRoot, "items");
  if (!existsSync(itemsDir)) throw new Error(`items/ not found at ${itemsDir}`);

  const files = readdirSync(itemsDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  return files.map((f) => {
    const sourcePath = path.join(itemsDir, f);
    const raw = readFileSync(sourcePath, "utf-8");
    const { fm, body } = parseFrontmatter(raw);
    return { id: (fm as WorkItemFm).id ?? f.replace(/\.md$/, ""), fm: fm as WorkItemFm, body, sourcePath };
  });
}

function loadMarkdownDoc(filePath: string): { fm: Record<string, unknown>; body: string } | null {
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, "utf-8");
  const { fm, body } = parseFrontmatter(raw);
  return { fm, body };
}

// ── Stage display ────────────────────────────────────────────────────────────

function stageDisplay(
  item: WorkItem,
  proj: ProjectionResult,
): { label: string; stale: boolean } {
  if (item.fm.lifecycle_state !== "in-delivery") {
    return { label: "—", stale: false };
  }
  if (item.fm.stage_override) {
    return { label: item.fm.stage_override + " (override)", stale: false };
  }
  if (proj.fresh && proj.projection) {
    const carrier = proj.projection.carriers[item.id];
    if (carrier?.current_stage) {
      return { label: carrier.current_stage, stale: false };
    }
  }
  return { label: "unknown", stale: true };
}

// ── Tier badge ───────────────────────────────────────────────────────────────

function tierBadge(tier?: string): string {
  if (!tier) return "";
  const cls = tier === "T1" ? "tier-t1" : tier === "T2" ? "tier-t2" : "tier-t3";
  return `<span class="tier-badge ${cls}">${esc(tier)}</span>`;
}

// ── Risk pill ────────────────────────────────────────────────────────────────

function riskPill(risk?: RiskState): string {
  if (!risk) return "";
  const levels = [risk.value, risk.feasibility, risk.usability, risk.viability]
    .filter(Boolean) as string[];
  const worst = levels.includes("low") ? "low"
    : levels.includes("moderate") ? "moderate"
    : levels.includes("unknown") ? "unknown"
    : "strong";
  const cls = worst === "low" ? "risk-low"
    : worst === "moderate" ? "risk-moderate"
    : worst === "strong" ? "risk-strong"
    : "risk-unknown";
  return `<span class="risk-pill ${cls}">risk: ${esc(worst)}</span>`;
}

// ── Item card (for ledger) ────────────────────────────────────────────────────

function itemCard(item: WorkItem, proj: ProjectionResult, detailSlug: string): string {
  const stage = stageDisplay(item, proj);
  const staleClass = stage.stale ? " stage-stale" : "";

  const stageHtml = item.fm.lifecycle_state === "in-delivery"
    ? `<div class="card-stage${staleClass}">stage: <strong>${esc(stage.label)}</strong>${stage.stale ? ' <span class="stale-tag">stale</span>' : ""}</div>`
    : "";

  const outcomeHtml = item.fm.outcome_link
    ? `<div class="card-meta">→ <a href="../../progress/#${esc(item.fm.outcome_link)}">${esc(item.fm.outcome_link)}</a></div>`
    : "";

  const dispositionHtml = item.fm.disposition
    ? `<div class="card-disposition">${esc(item.fm.disposition)}</div>`
    : "";

  return `<div class="item-card lifecycle-${esc(item.fm.lifecycle_state)}">
  <div class="card-header">
    <a class="card-title" href="${esc(detailSlug)}">${esc(item.fm.title)}</a>
    ${tierBadge(item.fm.tier)}
    ${riskPill(item.fm.risk_state)}
  </div>
  <div class="card-tags">
    <span class="lifecycle-tag">${esc(item.fm.lifecycle_state)}</span>
  </div>
  ${stageHtml}
  ${outcomeHtml}
  ${dispositionHtml}
</div>`;
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function buildNav(items: WorkItem[]): NavGroup[] {
  const itemPages: string[] = items.map((it) => `item/${it.id}`);
  return [
    {
      group: "Product dashboard",
      pages: [
        "dashboard",
        { group: "Work items", pages: itemPages },
        "progress",
        "strategy",
      ],
    },
  ];
}

function pageLabel(items: WorkItem[]): (slug: string) => string {
  const map = new Map<string, string>([
    ["dashboard", "Work ledger"],
    ["progress",  "Progress"],
    ["strategy",  "Vision & strategy"],
    ...items.map((it): [string, string] => [`item/${it.id}`, it.fm.title]),
  ]);
  return (slug: string) => map.get(slug) ?? slug.split("/").pop() ?? slug;
}

// ── Inline styles for the dashboard layout ────────────────────────────────────

const DASHBOARD_STYLES = `
<style>
/* ── Provenance banner ── */
.provenance-banner {
  display: flex; align-items: flex-start; gap: .6em;
  background: var(--color-warning-bg, #fef3c7);
  border: 1px solid var(--color-warning-border, #d97706);
  border-radius: 6px; padding: .75em 1em; margin-bottom: 1.5em;
  font-size: .875em; color: var(--color-text, #1a1a1a);
}
.dark .provenance-banner {
  background: #422006; border-color: #92400e; color: #fef3c7;
}
.provenance-icon { font-size: 1.1em; line-height: 1.4; flex-shrink: 0; }
.provenance-body { display: flex; flex-direction: column; gap: .25em; }
.provenance-detail { color: var(--color-text-muted, #555); margin-top: .2em; }
.dark .provenance-detail { color: #d6b989; }

/* ── Ledger columns ── */
.ledger-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25em; margin-bottom: 2em;
}
.ledger-column { background: var(--color-surface, #f9f9f9); border-radius: 8px; padding: 1em; }
.dark .ledger-column { background: #1e1e1e; }
.ledger-column-header { font-size: .8em; font-weight: 700; text-transform: uppercase;
  letter-spacing: .06em; color: var(--color-text-muted, #666); margin-bottom: .75em; }
.ledger-column-empty { font-size: .85em; color: var(--color-text-muted, #888); font-style: italic; }

/* ── Record section ── */
.ledger-record { margin-top: 2em; }
.ledger-record-header { font-size: .8em; font-weight: 700; text-transform: uppercase;
  letter-spacing: .06em; color: var(--color-text-muted, #666); margin-bottom: .75em; }
.ledger-record-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1em;
}

/* ── Item cards ── */
.item-card {
  background: var(--color-bg, #fff); border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px; padding: .85em 1em; display: flex; flex-direction: column; gap: .4em;
}
.dark .item-card { background: #111; border-color: #333; }
.card-header { display: flex; align-items: flex-start; gap: .4em; flex-wrap: wrap; }
.card-title { font-weight: 600; font-size: .95em; color: var(--color-link, #2563eb);
  text-decoration: none; flex: 1 1 auto; }
.card-title:hover { text-decoration: underline; }
.card-tags { display: flex; gap: .3em; flex-wrap: wrap; }
.card-meta { font-size: .78em; color: var(--color-text-muted, #666); }
.card-stage { font-size: .8em; }
.card-disposition { font-size: .78em; color: var(--color-text-muted, #666); font-style: italic; }
.stage-stale { color: var(--color-warning, #b45309); }

/* ── Badges / tags ── */
.lifecycle-tag { font-size: .72em; background: #e0e7ff; color: #3730a3;
  border-radius: 4px; padding: 1px 6px; font-weight: 600; }
.dark .lifecycle-tag { background: #1e1b4b; color: #a5b4fc; }
.lifecycle-in-delivery .lifecycle-tag { background: #dbeafe; color: #1d4ed8; }
.lifecycle-shipped    .lifecycle-tag { background: #d1fae5; color: #065f46; }
.lifecycle-live       .lifecycle-tag { background: #d1fae5; color: #065f46; }
.lifecycle-parked     .lifecycle-tag { background: #f3f4f6; color: #374151; }
.lifecycle-killed     .lifecycle-tag { background: #fee2e2; color: #991b1b; }

.stale-tag { font-size: .75em; background: #fef3c7; color: #92400e;
  border-radius: 3px; padding: 0 4px; margin-left: .3em; font-weight: 600; }
.dark .stale-tag { background: #422006; color: #fcd34d; }

.tier-badge { font-size: .72em; border-radius: 4px; padding: 1px 6px; font-weight: 700; }
.tier-t1 { background: #fef9c3; color: #713f12; }
.dark .tier-t1 { background: #422006; color: #fde68a; }
.tier-t2 { background: #e0e7ff; color: #3730a3; }
.tier-t3 { background: #f3f4f6; color: #374151; }

.risk-pill { font-size: .72em; border-radius: 4px; padding: 1px 6px; }
.risk-low      { background: #fee2e2; color: #991b1b; }
.risk-moderate { background: #fef3c7; color: #92400e; }
.risk-strong   { background: #d1fae5; color: #065f46; }
.risk-unknown  { background: #f3f4f6; color: #374151; }

/* ── Detail page ── */
.item-detail-meta { display: flex; flex-wrap: wrap; gap: .5em; margin-bottom: 1.5em; }
.meta-row { font-size: .85em; display: flex; gap: .4em; align-items: center; }
.meta-label { color: var(--color-text-muted, #666); font-weight: 600; font-size: .8em; }
.gate-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .6em; }
.gate-entry { border-left: 3px solid var(--color-border, #e5e7eb); padding-left: .75em; font-size: .9em; }
.gate-header { font-weight: 700; display: flex; gap: .5em; align-items: center; }
.gate-go   { color: #065f46; }
.gate-nogo { color: #991b1b; }
.gate-meta { font-size: .8em; color: var(--color-text-muted, #666); margin-top: .15em; }
.gate-evidence { font-size: .8em; color: var(--color-text-muted, #666); margin-top: .15em; }
.gate-conditions { font-size: .8em; font-style: italic; color: #b45309; margin-top: .15em; }
.frozen-timeline { background: var(--color-surface, #f9f9f9); border-radius: 6px;
  padding: .85em 1em; margin-top: 1em; }
.dark .frozen-timeline { background: #1e1e1e; }
.frozen-title { font-size: .8em; font-weight: 700; text-transform: uppercase;
  letter-spacing: .05em; color: var(--color-text-muted, #666); margin-bottom: .5em; }
.timeline-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .3em; }
.timeline-entry { font-size: .85em; display: flex; gap: .75em; }
.timeline-stage { font-weight: 600; min-width: 80px; }
.timeline-at { color: var(--color-text-muted, #666); }
.risk-detail-table th { font-size: .8em; text-align: left; color: var(--color-text-muted, #666); padding: .2em .5em; }
.risk-detail-table td { font-size: .85em; padding: .2em .5em; }
.progress-gated { background: var(--color-surface, #f9f9f9); border-radius: 6px;
  padding: .85em 1em; font-size: .9em; color: var(--color-text-muted, #666);
  border-left: 3px solid var(--color-border, #e5e7eb); }
.dark .progress-gated { background: #1a1a1a; }

/* ── OKR cards ── */
.okr-kr-table { width: 100%; border-collapse: collapse; margin-top: .5em; font-size: .85em; }
.okr-kr-table th { text-align: left; color: var(--color-text-muted, #666); font-size: .8em; padding: .3em .5em; border-bottom: 1px solid var(--color-border, #e5e7eb); }
.okr-kr-table td { padding: .35em .5em; border-bottom: 1px solid var(--color-border, #f3f4f6); }
</style>
`;

// ── Work-ledger index page ────────────────────────────────────────────────────

function renderLedgerPage(
  items: WorkItem[],
  proj: ProjectionResult,
  nav: NavGroup[],
  labelFn: (s: string) => string,
): string {
  const columns: LedgerColumn[] = ["now", "building", "next", "later"];
  const recordStates = ["shipped", "live", "parked", "killed"];

  const grouped: Record<LedgerColumn, WorkItem[]> = {
    now: [], next: [], later: [], building: [], record: [],
  };
  for (const item of items) {
    const col = lifecycleToColumn(item.fm.lifecycle_state);
    grouped[col].push(item);
  }

  const banner = provenanceBanner(proj);

  // Forward columns (now / building / next / later)
  const columnsHtml = columns.map((col) => {
    const colItems = grouped[col];
    const cardsHtml = colItems.length
      ? colItems.map((it) => itemCard(it, proj, `item/${it.id}/`)).join("\n")
      : `<div class="ledger-column-empty">—</div>`;
    return `<div class="ledger-column">
  <div class="ledger-column-header">${esc(COLUMN_LABELS[col])}</div>
  ${cardsHtml}
</div>`;
  }).join("\n");

  // Record section (shipped/live/parked/killed — anti-portfolio: keep killed)
  const recordItems = grouped.record;
  const recordCardsHtml = recordItems.length
    ? `<div class="ledger-record-grid">${recordItems.map((it) => itemCard(it, proj, `item/${it.id}/`)).join("\n")}</div>`
    : `<p class="ledger-column-empty">No closed items yet.</p>`;

  const bodyHtml = `${banner}
<p class="lede">One ledger of every work item across its lifecycle. Forward workspace on the left; durable record below.</p>

<div class="ledger-columns">
${columnsHtml}
</div>

<div class="ledger-record">
  <div class="ledger-record-header">${esc(COLUMN_LABELS.record)}</div>
  ${recordCardsHtml}
</div>`;

  const page: CorePage = {
    path: "dashboard",
    fm: { title: "Work ledger", description: "Forward view + durable record of every work item." },
    raw: "",
    kind: "dashboard",
  };

  return renderSurfacePage({
    slug: "dashboard",
    page,
    nav,
    bodyHtml,
    pageLabel: labelFn,
    suppressHeader: false,
    extraHead: () => DASHBOARD_STYLES,
  });
}

// ── Per-item detail page ──────────────────────────────────────────────────────

function renderGateDecisions(gates?: GateDecision[]): string {
  if (!gates || gates.length === 0) return "<p>No gate decisions recorded.</p>";
  const items = gates.map((g) => {
    const cls = g.decision === "go" ? "gate-go" : "gate-nogo";
    const evidenceHtml = g.evidence_refs?.length
      ? `<div class="gate-evidence">Evidence: ${g.evidence_refs.map((e) => esc(e)).join(", ")}</div>`
      : "";
    const conditionsHtml = g.conditions
      ? `<div class="gate-conditions">Conditions: ${esc(g.conditions)}</div>`
      : "";
    return `<li class="gate-entry">
  <div class="gate-header">
    <span>${esc(g.gate)}</span>
    <span class="${cls}">${esc(g.decision.toUpperCase())}</span>
    <span class="tier-badge">${esc(g.confidence ?? "")}</span>
  </div>
  <div class="gate-meta">${esc(g.owner)} · ${esc(g.timestamp)}</div>
  ${evidenceHtml}
  ${conditionsHtml}
</li>`;
  }).join("\n");
  return `<ul class="gate-list">${items}</ul>`;
}

function renderFrozenTimeline(ft?: FrozenTimeline): string {
  if (!ft) return "";
  const entries = ft.transitions.map((t) =>
    `<li class="timeline-entry"><span class="timeline-stage">${esc(t.stage)}</span><span class="timeline-at">${esc(t.at)}</span></li>`
  ).join("\n");
  return `<div class="frozen-timeline">
  <div class="frozen-title">Frozen timeline (committed at close)</div>
  <ul class="timeline-list">
    ${entries}
    <li class="timeline-entry"><span class="timeline-stage">${esc(ft.final_stage)} (final)</span><span class="timeline-at">${esc(ft.captured_at)}</span></li>
  </ul>
</div>`;
}

function renderRiskDetail(risk?: RiskState): string {
  if (!risk) return "<p>No risk state recorded.</p>";
  const dims = [
    ["Value", risk.value],
    ["Feasibility", risk.feasibility],
    ["Usability", risk.usability],
    ["Viability", risk.viability],
  ].filter(([, v]) => v) as [string, string][];
  const rows = dims.map(([k, v]) =>
    `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`
  ).join("\n");
  const noteHtml = risk.evidence_note
    ? `<p style="font-size:.85em;margin-top:.5em">${esc(risk.evidence_note)}</p>`
    : "";
  return `<table class="risk-detail-table"><tbody>${rows}</tbody></table>${noteHtml}`;
}

function renderItemDetailPage(
  item: WorkItem,
  proj: ProjectionResult,
  nav: NavGroup[],
  labelFn: (s: string) => string,
): string {
  const slug = `item/${item.id}`;
  const stage = stageDisplay(item, proj);
  const banner = provenanceBanner(proj);

  // Transition summary from projection (for in-delivery items)
  let transitionHtml = "";
  if (item.fm.lifecycle_state === "in-delivery") {
    if (proj.fresh && proj.projection) {
      const carrier = proj.projection.carriers[item.id];
      if (carrier?.transition_summary?.length) {
        const entries = carrier.transition_summary.map((t) =>
          `<li class="timeline-entry"><span class="timeline-stage">${esc(t.stage)}</span><span class="timeline-at">${esc(t.at)}</span></li>`
        ).join("\n");
        transitionHtml = `<h3>Dev-stage traversal (from snapshot)</h3><ul class="timeline-list">${entries}</ul>`;
      }
    } else {
      transitionHtml = `<p class="stage-stale">Dev-stage traversal: unknown (snapshot stale or absent).</p>`;
    }
  }

  // Links section
  const links = item.fm.links;
  const linksHtml = links
    ? [
        links.spec_pr ? `<div class="meta-row"><span class="meta-label">Spec PR:</span> ${esc(links.spec_pr)}</div>` : "",
        links.build_prs?.length ? `<div class="meta-row"><span class="meta-label">Build PRs:</span> ${links.build_prs.map((p) => esc(p)).join(", ")}</div>` : "",
        links.debrief ? `<div class="meta-row"><span class="meta-label">Debrief:</span> ${esc(links.debrief)}</div>` : "",
      ].filter(Boolean).join("\n")
    : "";

  // Render the markdown body
  let bodyRendered = "";
  if (item.body.trim()) {
    const result = renderMarkdown(item.body, { page: { path: slug, fm: item.fm as Record<string, unknown>, raw: item.body } });
    bodyRendered = result.html;
  }

  const stageRowHtml = item.fm.lifecycle_state === "in-delivery"
    ? `<div class="meta-row"><span class="meta-label">Current stage:</span>
        <span class="${stage.stale ? "stage-stale" : ""}">${esc(stage.label)}${stage.stale ? ' <span class="stale-tag">stale</span>' : ""}</span>
       </div>`
    : "";

  const bodyHtml = `${banner}
<div class="item-detail-meta">
  <div class="meta-row">${tierBadge(item.fm.tier)}</div>
  <div class="meta-row"><span class="lifecycle-tag">${esc(item.fm.lifecycle_state)}</span></div>
  ${item.fm.outcome_link ? `<div class="meta-row"><span class="meta-label">Outcome:</span> <a href="../../progress/#${esc(item.fm.outcome_link)}">${esc(item.fm.outcome_link)}</a></div>` : ""}
  ${item.fm.value_prop_link ? `<div class="meta-row"><span class="meta-label">Value prop:</span> ${esc(item.fm.value_prop_link)}</div>` : ""}
  ${stageRowHtml}
  ${riskPill(item.fm.risk_state)}
  ${linksHtml}
  ${item.fm.disposition ? `<div class="meta-row"><span class="meta-label">Disposition:</span> ${esc(item.fm.disposition)}</div>` : ""}
</div>

<h2>Body</h2>
${bodyRendered || "<p><em>No narrative body.</em></p>"}

<h2>Gate decisions</h2>
${renderGateDecisions(item.fm.gate_decisions)}

<h2>Risk state</h2>
${renderRiskDetail(item.fm.risk_state)}

${transitionHtml ? `<h2>Dev-stage traversal</h2>\n${transitionHtml}` : ""}

${item.fm.frozen_timeline ? `<h2>Frozen timeline</h2>\n${renderFrozenTimeline(item.fm.frozen_timeline)}` : ""}
`;

  const page: CorePage = {
    path: slug,
    fm: { title: item.fm.title, description: item.fm.lifecycle_state + " · " + (item.fm.tier ?? "") },
    raw: "",
    kind: "work-item",
    toc: [],
  };

  return renderSurfacePage({
    slug,
    page,
    nav,
    bodyHtml,
    pageLabel: labelFn,
    showToc: false,
    extraHead: () => DASHBOARD_STYLES,
  });
}

// ── Progress page ─────────────────────────────────────────────────────────────

function renderProgressPage(
  items: WorkItem[],
  objDoc: { fm: Record<string, unknown>; body: string } | null,
  nav: NavGroup[],
  labelFn: (s: string) => string,
): string {
  let bodyHtml = "";

  // Render objectives markdown
  if (objDoc) {
    const result = renderMarkdown(objDoc.body, {
      page: { path: "progress", fm: objDoc.fm as Record<string, unknown>, raw: objDoc.body },
    });
    bodyHtml += result.html;
  } else {
    bodyHtml += "<p><em>No objectives.md found.</em></p>";
  }

  // Contribution rollup: items per outcome_link
  const rollup = new Map<string, WorkItem[]>();
  for (const item of items) {
    const key = item.fm.outcome_link ?? "(no outcome link)";
    const arr = rollup.get(key) ?? [];
    arr.push(item);
    rollup.set(key, arr);
  }

  bodyHtml += `<h2>Contribution rollup (authored outcome links)</h2>`;
  for (const [outcomeId, linked] of rollup.entries()) {
    const pills = linked.map((it) =>
      `<span class="lifecycle-tag lifecycle-${esc(it.fm.lifecycle_state)}">${esc(it.fm.title)}</span>`
    ).join(" ");
    bodyHtml += `<div style="margin-bottom:.75em"><a href="#${esc(outcomeId)}"><strong>${esc(outcomeId)}</strong></a><div style="margin-top:.3em;display:flex;flex-wrap:wrap;gap:.3em">${pills}</div></div>`;
  }

  // Input-gated analytics note
  bodyHtml += `<h2>Strategic analytics</h2>
<div class="progress-gated">
  <strong>Input-gated</strong> — the strategic product-analytics layer (north-star trend, KPI dashboards)
  lights up when real user signal exists. Pre-launch, the targets + our own read of them are the honest measure.
  See objectives above for the current read.
</div>`;

  const page: CorePage = {
    path: "progress",
    fm: { title: "Progress", description: "Objectives, OKRs, north-star, and contribution rollup." },
    raw: "",
    kind: "progress",
  };

  return renderSurfacePage({
    slug: "progress",
    page,
    nav,
    bodyHtml,
    pageLabel: labelFn,
    showToc: true,
    extraHead: () => DASHBOARD_STYLES,
  });
}

// ── Strategy page ─────────────────────────────────────────────────────────────

function renderStrategyPage(
  stratDoc: { fm: Record<string, unknown>; body: string } | null,
  nav: NavGroup[],
  labelFn: (s: string) => string,
): string {
  let bodyHtml = "";
  let toc: CorePage["toc"] = [];

  if (stratDoc) {
    const page: CorePage = {
      path: "strategy",
      fm: stratDoc.fm as Record<string, unknown>,
      raw: stratDoc.body,
    };
    const result = renderMarkdown(stratDoc.body, { page });
    toc = extractToc(result.html);
    bodyHtml = result.html;
  } else {
    bodyHtml = "<p><em>No strategy.md found.</em></p>";
  }

  const page: CorePage = {
    path: "strategy",
    fm: stratDoc?.fm as Record<string, unknown> ?? { title: "Vision & strategy" },
    raw: "",
    kind: "strategy",
    toc,
  };

  return renderSurfacePage({
    slug: "strategy",
    page,
    nav,
    bodyHtml,
    pageLabel: labelFn,
    showToc: true,
    extraHead: () => DASHBOARD_STYLES,
  });
}

// ── Main build ────────────────────────────────────────────────────────────────

if (!existsSync(dashRoot)) throw new Error(`Dashboard root not found: ${dashRoot}`);

log(`dashboard surface — root: ${dashRoot}`);

// Clean + recreate the surface dir (never remove whole dist/)
if (existsSync(surfaceDir)) rmSync(surfaceDir, { recursive: true, force: true });
ensureDir(surfaceDir);

// Copy assets (same pattern as build-handbook.ts)
for (const basename of assetBasenames) {
  const src = path.join(vendorAssetsDir, basename);
  if (existsSync(src)) copyFileSync(src, path.join(surfaceDir, basename));
  else warn(`asset missing: ${src}`);
}
for (const brandAsset of ["brand-overrides.css", "favicon.svg"]) {
  const src = path.join(brandDir, brandAsset);
  if (existsSync(src)) copyFileSync(src, path.join(surfaceDir, brandAsset));
}

// Load data
const items = loadItems();
log(`  loaded ${items.length} work items`);

const projResult = loadProjection();
if (projResult.fresh) {
  log(`  snapshot: fresh (commit matches HEAD ${projResult.gitHead?.slice(0, 8)})`);
} else {
  log(`  snapshot: stale/absent — ${projResult.staleReason}`);
}

const objDoc = loadMarkdownDoc(path.join(dashRoot, "objectives.md"));
const stratDoc = loadMarkdownDoc(path.join(dashRoot, "strategy.md"));

const nav = buildNav(items);
const labelFn = pageLabel(items);

// ── Render: work-ledger index ─────────────────────────────────────────────────
const ledgerHtml = renderLedgerPage(items, projResult, nav, labelFn);
writeHtml(path.join(surfaceDir, "index.html"), ledgerHtml);
log("  [page] dashboard (work ledger index)");

// ── Render: per-item pages ────────────────────────────────────────────────────
for (const item of items) {
  const html = renderItemDetailPage(item, projResult, nav, labelFn);
  writeHtml(path.join(surfaceDir, "item", item.id, "index.html"), html);
  log(`  [page] item/${item.id} — ${item.fm.title}`);
}

// ── Render: progress page ─────────────────────────────────────────────────────
const progressHtml = renderProgressPage(items, objDoc, nav, labelFn);
writeHtml(path.join(surfaceDir, "progress", "index.html"), progressHtml);
log("  [page] progress");

// ── Render: strategy page ─────────────────────────────────────────────────────
const strategyHtml = renderStrategyPage(stratDoc, nav, labelFn);
writeHtml(path.join(surfaceDir, "strategy", "index.html"), strategyHtml);
log("  [page] strategy");

log(`\ndashboard: built ${3 + items.length} pages → ${surfaceDir}`);
if (!projResult.fresh) {
  log(`WARNING: snapshot stale — ${projResult.staleReason}`);
}
