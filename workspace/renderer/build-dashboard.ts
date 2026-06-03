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

function esc(s: unknown): string {
  // Total + context-safe: coerce (YAML may yield numbers/booleans), escape for HTML text
  // AND single/double-quoted attribute contexts.
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  /** true = SHA matches but the snapshot is EMPTY (no events yet) — input-gated, not stale */
  inputGated?: boolean;
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

  // Fresh = SHA matches. But a SHA-matching yet EMPTY snapshot is input-gated, not "live":
  // no dev-sprint events exist yet (the expected pre-exercise / factory / CI state).
  const empty =
    Object.keys(projection.carriers ?? {}).length === 0 &&
    Object.keys(projection.nodes ?? {}).length === 0;
  return { projection, fresh: true, staleReason: null, gitHead, inputGated: empty };
}

// ── Provenance banner ────────────────────────────────────────────────────────

function provenanceBanner(result: ProjectionResult): string {
  if (result.inputGated) {
    return `<div class="provenance-banner provenance-inputgated">
  <span class="provenance-icon">○</span>
  <div class="provenance-body">
    <strong>Projection input-gated</strong> — no dev-sprint events recorded yet; in-flight stages show as <em>pending</em>. Expected before the loop is exercised.
  </div>
</div>`;
  }
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

// ── Implementation units (IUs) — first-class, carved out of work items ─────────

interface IUFm {
  id: string;
  title?: string;
  parent?: string;            // omitted ⇒ standalone (incremental channel)
  channel?: string;           // sprint | incremental
  status?: string;            // planned | building | done | blocked
  size?: string;
  goal?: string;
  files?: string[];
  dependencies?: string[];
  acceptance?: string[];
  improves?: string;
  [k: string]: unknown;
}
interface IU { id: string; fm: IUFm; body: string; }

function loadIUs(): IU[] {
  const iusDir = path.join(dashRoot, "ius");
  if (!existsSync(iusDir)) return [];
  return readdirSync(iusDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => {
      const raw = readFileSync(path.join(iusDir, f), "utf-8");
      const { fm, body } = parseFrontmatter(raw);
      return { id: (fm as IUFm).id ?? f.replace(/\.md$/, ""), fm: fm as IUFm, body };
    });
}

function iuStatusPill(s?: string): string {
  const st = (s || "planned").toLowerCase();
  const cls = st === "done" ? "iu-st-done"
    : st === "building" ? "iu-st-building"
    : st === "blocked" ? "iu-st-blocked"
    : "iu-st-planned";
  return `<span class="iu-status ${cls}">${esc(st)}</span>`;
}

function iuCard(iu: IU): string {
  const files = (iu.fm.files || []).map((f) => `<code>${esc(f)}</code>`).join(" ");
  const acc = iu.fm.acceptance || [];
  return `<div class="iu-card">
  <div class="iu-head">
    <span class="iu-id">${esc(iu.id)}</span>
    ${iuStatusPill(iu.fm.status)}
    ${iu.fm.size ? `<span class="iu-size">${esc(iu.fm.size)}</span>` : ""}
  </div>
  <div class="iu-title">${esc(iu.fm.title || iu.id)}</div>
  ${iu.fm.goal ? `<div class="iu-goal">${esc(iu.fm.goal)}</div>` : ""}
  ${files ? `<div class="iu-files">${files}</div>` : ""}
  ${acc.length ? `<ul class="iu-acc">${acc.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
  ${iu.fm.improves ? `<div class="iu-improves">improves <code>${esc(iu.fm.improves)}</code></div>` : ""}
</div>`;
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
  ${item.fm.children?.length ? `<div class="card-iucount">${item.fm.children.length} implementation unit${item.fm.children.length === 1 ? "" : "s"} →</div>` : ""}
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
:root { --st-done: #2e9e6b; --st-building: #d9a514; --st-blocked: #d84a3f; --st-planned: #9aa0a6; }
.dashboard-lede { color: var(--mute); margin: 0 0 1.25em; }

/* ── Channel tabs (CSS-only, CSP-safe) ── */
.channels { position: relative; }
.ch-radio { position: absolute; opacity: 0; pointer-events: none; }
.ch-tabs { display: flex; gap: .25em; border-bottom: 1px solid var(--hair); margin-bottom: 1.5em; }
.ch-tab { font-family: var(--display); font-size: .9rem; font-weight: 600; cursor: pointer;
  padding: .5em .9em; color: var(--mute); border-bottom: 2px solid transparent; margin-bottom: -1px; }
.ch-tab:hover { color: var(--fg); }
#ch-sprint:checked ~ .ch-tabs label[for="ch-sprint"],
#ch-incr:checked ~ .ch-tabs label[for="ch-incr"] { color: var(--fg); border-bottom-color: var(--accent); }
.ch-panel { display: none; }
#ch-sprint:checked ~ .ch-panel-sprint { display: block; }
#ch-incr:checked ~ .ch-panel-incr { display: block; }

/* ── Provenance banner ── */
.provenance-banner { display: flex; align-items: flex-start; gap: .6em;
  background: color-mix(in srgb, var(--st-building) 9%, transparent);
  border: 1px solid color-mix(in srgb, var(--st-building) 40%, var(--hair));
  border-radius: 6px; padding: .7em 1em; margin-bottom: 1.5em; font-size: .85rem; color: var(--fg-soft); }
.provenance-inputgated { background: color-mix(in srgb, var(--st-planned) 10%, transparent);
  border-color: color-mix(in srgb, var(--st-planned) 35%, var(--hair)); }
.provenance-icon { flex-shrink: 0; }
.provenance-body { display: flex; flex-direction: column; gap: .2em; }
.provenance-detail { color: var(--mute); font-size: .92em; }

/* ── Kanban board ── */
.ledger-columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1em; margin-bottom: 1.5em; align-items: start; }
.ledger-column { background: var(--code-bg); border: 1px solid var(--hair); border-radius: 8px;
  padding: .85em; display: flex; flex-direction: column; gap: .6em; }
.ledger-column-header { font-family: var(--mono); font-size: .68rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .08em; color: var(--mute); }
.ledger-column-count { color: var(--mute); }
.ledger-column-empty { font-size: .82rem; color: var(--mute); font-style: italic; }
.ledger-record { margin-top: 1.5em; }
.ledger-record-header { font-family: var(--mono); font-size: .68rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .08em; color: var(--mute); margin-bottom: .6em; }
.ledger-record-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: .8em; }

/* ── Item cards ── */
.item-card { background: var(--bg); border: 1px solid var(--hair); border-radius: var(--r-md, 6px);
  padding: .75em .85em; display: flex; flex-direction: column; gap: .4em; }
.card-header { display: flex; align-items: flex-start; gap: .4em; flex-wrap: wrap; }
.card-title { font-weight: 600; font-size: .92rem; color: var(--fg); text-decoration: none; flex: 1 1 auto; }
.card-title:hover { color: var(--accent); }
.card-tags { display: flex; gap: .3em; flex-wrap: wrap; }
.card-meta { font-size: .76rem; color: var(--mute); }
.card-meta a { color: var(--accent); text-decoration: none; }
.card-stage { font-size: .78rem; color: var(--fg-soft); }
.card-iucount { font-size: .72rem; color: var(--mute); }
.card-disposition { font-size: .76rem; color: var(--mute); font-style: italic; }
.stage-stale { color: var(--st-building); }

/* ── Pills ── */
.lifecycle-tag, .tier-badge, .risk-pill, .iu-status, .iu-size {
  font-family: var(--mono); font-size: .68rem; border-radius: 999px; padding: .1em .55em; font-weight: 500; white-space: nowrap; }
.lifecycle-tag { background: var(--code-bg); border: 1px solid var(--hair); color: var(--fg-soft); }
.tier-badge { background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); }
.risk-low { background: color-mix(in srgb, var(--st-done) 14%, transparent); color: var(--st-done); }
.risk-moderate { background: color-mix(in srgb, var(--st-building) 16%, transparent); color: #9a7400; }
.risk-strong { background: color-mix(in srgb, var(--st-blocked) 14%, transparent); color: var(--st-blocked); }
.risk-unknown { background: var(--code-bg); color: var(--mute); }
.stale-tag { font-family: var(--mono); font-size: .66rem; background: color-mix(in srgb, var(--st-building) 18%, transparent);
  color: #9a7400; border-radius: 3px; padding: 0 4px; margin-left: .3em; }

/* ── IU cards + drill-down ── */
.iu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: .8em; margin: .5em 0 1em; }
.iu-card { border: 1px solid var(--hair); border-left: 3px solid var(--accent);
  border-radius: 0 var(--r-md, 6px) var(--r-md, 6px) 0; background: var(--code-bg); padding: .7em .8em; }
.iu-head { display: flex; align-items: center; gap: .4em; margin-bottom: .3em; }
.iu-id { font-family: var(--mono); font-size: .72rem; color: var(--accent); }
.iu-size { background: var(--bg); border: 1px solid var(--hair); color: var(--mute); }
.iu-status { color: #fff; }
.iu-st-done { background: var(--st-done); }
.iu-st-building { background: var(--st-building); color: #3a2e00; }
.iu-st-blocked { background: var(--st-blocked); }
.iu-st-planned { background: var(--st-planned); }
.iu-title { font-weight: 600; font-size: .9rem; color: var(--fg); margin-bottom: .25em; }
.iu-goal { font-size: .82rem; color: var(--fg-soft); margin-bottom: .35em; }
.iu-files code, .iu-improves code { font-family: var(--mono); font-size: .72rem; background: var(--bg);
  border: 1px solid var(--hair); border-radius: 3px; padding: 0 .3em; }
.iu-acc { margin: .35em 0 0; padding-left: 1.1em; font-size: .8rem; color: var(--fg-soft); }
.iu-acc li { margin: .15em 0; }
.iu-improves { font-size: .76rem; color: var(--mute); margin-top: .35em; }
.iu-empty { color: var(--mute); font-style: italic; }

/* ── Detail page ── */
.item-detail-meta { display: flex; flex-wrap: wrap; gap: .5em; margin-bottom: 1.5em; align-items: center; }
.meta-row { font-size: .82rem; display: flex; gap: .4em; align-items: center; color: var(--fg-soft); }
.meta-label { color: var(--mute); font-weight: 600; font-size: .92em; }
.meta-row a { color: var(--accent); text-decoration: none; }
.gate-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .6em; }
.gate-entry { border-left: 3px solid var(--hair); padding-left: .75em; font-size: .9rem; }
.gate-header { font-weight: 600; display: flex; gap: .5em; align-items: center; }
.gate-go { color: var(--st-done); }
.gate-nogo { color: var(--st-blocked); }
.gate-meta, .gate-evidence { font-size: .8rem; color: var(--mute); margin-top: .15em; }
.gate-conditions { font-size: .8rem; font-style: italic; color: #9a7400; margin-top: .15em; }
.frozen-timeline, .progress-gated { background: var(--code-bg); border: 1px solid var(--hair);
  border-radius: 6px; padding: .8em 1em; margin-top: 1em; }
.frozen-title { font-family: var(--mono); font-size: .68rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: .06em; color: var(--mute); margin-bottom: .5em; }
.timeline-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .3em; }
.timeline-entry { font-size: .84rem; display: flex; gap: .75em; }
.timeline-stage { font-weight: 600; min-width: 90px; font-family: var(--mono); font-size: .8rem; }
.timeline-at { color: var(--mute); }
.risk-detail-table th { font-size: .8rem; text-align: left; color: var(--mute); padding: .2em .5em; }
.risk-detail-table td { font-size: .84rem; padding: .2em .5em; }
.progress-gated { color: var(--fg-soft); font-size: .88rem; }
.okr-kr-table { width: 100%; border-collapse: collapse; margin-top: .5em; font-size: .84rem; }
.okr-kr-table th { text-align: left; color: var(--mute); font-size: .8rem; padding: .3em .5em; border-bottom: 1px solid var(--hair); }
.okr-kr-table td { padding: .35em .5em; border-bottom: 1px solid var(--hair); }
</style>
`;

// ── Work-ledger index page ────────────────────────────────────────────────────

function renderLedgerPage(
  items: WorkItem[],
  proj: ProjectionResult,
  nav: NavGroup[],
  labelFn: (s: string) => string,
  standaloneIUs: IU[],
): string {
  const columns: LedgerColumn[] = ["now", "building", "next", "later"];
  const grouped: Record<LedgerColumn, WorkItem[]> = {
    now: [], next: [], later: [], building: [], record: [],
  };
  for (const item of items) grouped[lifecycleToColumn(item.fm.lifecycle_state)].push(item);

  const banner = provenanceBanner(proj);

  const columnsHtml = columns.map((col) => {
    const colItems = grouped[col];
    const cardsHtml = colItems.length
      ? colItems.map((it) => itemCard(it, proj, `item/${it.id}/`)).join("\n")
      : `<div class="ledger-column-empty">—</div>`;
    return `<div class="ledger-column">
  <div class="ledger-column-header">${esc(COLUMN_LABELS[col])} <span class="ledger-column-count">${colItems.length}</span></div>
  ${cardsHtml}
</div>`;
  }).join("\n");

  const recordItems = grouped.record;
  const recordCardsHtml = recordItems.length
    ? `<div class="ledger-record-grid">${recordItems.map((it) => itemCard(it, proj, `item/${it.id}/`)).join("\n")}</div>`
    : `<p class="ledger-column-empty">No closed items yet.</p>`;

  // Incremental channel — standalone IUs grouped by build status.
  const incrCols: Array<[string, string]> = [
    ["building", "Building"], ["planned", "Planned"], ["blocked", "Blocked"], ["done", "Done"],
  ];
  const incrGrouped: Record<string, IU[]> = { building: [], planned: [], blocked: [], done: [] };
  for (const iu of standaloneIUs) {
    const s = (iu.fm.status || "planned").toLowerCase();
    (incrGrouped[s] ?? incrGrouped["planned"]).push(iu);
  }
  const incrHtml = standaloneIUs.length
    ? `<div class="ledger-columns">${incrCols
        .filter(([k]) => incrGrouped[k].length)
        .map(([k, label]) => `<div class="ledger-column">
  <div class="ledger-column-header">${esc(label)} <span class="ledger-column-count">${incrGrouped[k].length}</span></div>
  ${incrGrouped[k].map(iuCard).join("\n")}
</div>`).join("\n")}</div>`
    : `<p class="ledger-column-empty">No standalone improvements yet. The incremental-improvement workflow files them here.</p>`;

  const bodyHtml = `${banner}
<p class="dashboard-lede">One ledger across the lifecycle, in two channels: sprint work items (each decomposing into implementation units) and standalone incremental improvements.</p>
<div class="channels">
  <input type="radio" name="ch" id="ch-sprint" class="ch-radio" checked>
  <input type="radio" name="ch" id="ch-incr" class="ch-radio">
  <div class="ch-tabs">
    <label class="ch-tab" for="ch-sprint">Sprint · ${items.length}</label>
    <label class="ch-tab" for="ch-incr">Incremental improvement · ${standaloneIUs.length}</label>
  </div>
  <section class="ch-panel ch-panel-sprint">
    <div class="ledger-columns">
${columnsHtml}
    </div>
    <div class="ledger-record">
      <div class="ledger-record-header">${esc(COLUMN_LABELS.record)}</div>
      ${recordCardsHtml}
    </div>
  </section>
  <section class="ch-panel ch-panel-incr">
    ${incrHtml}
  </section>
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
    layoutVariant: "app",
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
    <span class="${cls}">${esc((g.decision ?? "?").toUpperCase())}</span>
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
  const entries = (ft.transitions ?? []).map((t) =>
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
  childIUs: IU[],
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

<h2>Implementation units</h2>
${childIUs.length ? `<div class="iu-grid">${childIUs.map(iuCard).join("\n")}</div>` : `<p class="iu-empty">No implementation units carved out yet.</p>`}

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
    layoutVariant: "app",
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

// IUs — first-class units. Group sprint IUs under their parent; collect standalone (incremental).
const ius = loadIUs();
const iusByParent = new Map<string, IU[]>();
const standaloneIUs: IU[] = [];
for (const iu of ius) {
  if (iu.fm.parent) {
    if (!iusByParent.has(iu.fm.parent)) iusByParent.set(iu.fm.parent, []);
    iusByParent.get(iu.fm.parent)!.push(iu);
  } else {
    standaloneIUs.push(iu);
  }
}
log(`  loaded ${ius.length} implementation units (${standaloneIUs.length} standalone)`);

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
const ledgerHtml = renderLedgerPage(items, projResult, nav, labelFn, standaloneIUs);
writeHtml(path.join(surfaceDir, "index.html"), ledgerHtml);
log("  [page] dashboard (work ledger index)");

// ── Render: per-item pages ────────────────────────────────────────────────────
for (const item of items) {
  const html = renderItemDetailPage(item, projResult, nav, labelFn, iusByParent.get(item.id) ?? []);
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
