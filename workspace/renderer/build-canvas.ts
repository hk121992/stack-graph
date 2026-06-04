// Canvas surface (WS4) — the Business Model Canvas + Value Proposition Canvas.
//
// Renders the strategy canvas (Strategyzer: BMC nine blocks + VPC value-map /
// customer-profile + fit) into workspace/dist/canvas/. Reads a JSON seed
// (default: fixtures/canvas/canvas.json; override --root <dir> or CANVAS_ROOT).
// The strategy-curator skill is the eventual write path; this is the read surface.
// Each entry carries an evidence state (assumed | tested | confirmed) — the model
// is a set of bets, not facts (bmc-schema / vpc-schema).
// Run: bun run workspace/renderer/build-canvas.ts [--root <dir>]

import {
  writeFileSync, mkdirSync, copyFileSync, existsSync, readFileSync, rmSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assetBasenames, type CorePage } from "./vendor/bc-renderer-core/src/index.js";
import { renderSurfacePage } from "./shell-host.js";

const rendererDir = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.join(rendererDir, "..", "dist");
const surfaceDir = path.join(distRoot, "canvas");
const vendorAssetsDir = path.join(rendererDir, "vendor", "bc-renderer-core", "assets");
const brandDir = path.join(rendererDir, "brand");

function resolveRoot(): string {
  const args = process.argv.slice(2);
  const i = args.indexOf("--root");
  if (i !== -1 && args[i + 1]) return path.resolve(args[i + 1]);
  if (process.env["CANVAS_ROOT"]) return path.resolve(process.env["CANVAS_ROOT"]);
  return path.join(rendererDir, "fixtures", "canvas");
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

interface Entry {
  id?: string; text: string; evidence?: string; detail?: string;
  importance?: string;   // VPC profile items (jobs/pains/gains) — vpc-schema
  addresses?: string[];  // value-map items → the profile items they address
  refs?: string[];       // links to supporting hypotheses / findings — bmc-schema
}
interface FitClaim { claim: string; evidence?: string }
interface CanvasData {
  title?: string; note?: string;
  bmc: Record<string, Entry[]>;
  vpc: Record<string, Entry[] | string>;
  fit?: { problem_solution?: FitClaim; product_market?: FitClaim };
}

function evPill(ev?: string): string {
  const e = (ev || "assumed").toLowerCase();
  const cls = e === "confirmed" ? "ev-confirmed" : e === "tested" ? "ev-tested" : "ev-assumed";
  return `<span class="ev ${cls}">${esc(e)}</span>`;
}

// Per-entry detail sidecar (read by popout.js); populated as entries render.
const sidecar: Record<string, { code: string; html: string }> = {};
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "entry";
}
function entryDetailHtml(e: Entry, group: string): string {
  const refs = (e.refs || []).map((r) => `<code>${esc(r)}</code>`).join(" ");
  const addresses = (e.addresses || []).map((a) => `<li>${esc(a)}</li>`).join("");
  return [
    group ? `<div class="po-group">${esc(group)}</div>` : "",
    `<h2 class="po-title">${esc(e.text)}</h2>`,
    `<div class="po-badges">${evPill(e.evidence)}${e.importance ? `<span class="ev ev-importance">importance: ${esc(e.importance)}</span>` : ""}</div>`,
    e.detail
      ? `<div class="po-section"><div class="po-label">Why this bet</div><p>${esc(e.detail)}</p></div>`
      : `<div class="po-section"><p>No further detail recorded yet — the strategy-curator fills this in.</p></div>`,
    addresses ? `<div class="po-section"><div class="po-label">Addresses</div><ul>${addresses}</ul></div>` : "",
    refs ? `<div class="po-section"><div class="po-label">Supporting evidence</div><p>${refs}</p></div>` : "",
  ].filter(Boolean).join("\n");
}
function entries(list: Entry[] | undefined, group: string): string {
  if (!list || !list.length) return `<li class="cv-empty">—</li>`;
  return list.map((e) => {
    const id = e.id || `${slugify(group)}-${slugify(e.text)}`;
    sidecar[id] = { code: id, html: entryDetailHtml(e, group) };
    return `<li data-popout="${esc(id)}" role="button" tabindex="0">${esc(e.text)} ${evPill(e.evidence)}</li>`;
  }).join("\n");
}

function block(cls: string, label: string, list: Entry[] | undefined): string {
  return `<div class="cv-cell ${cls}">
  <div class="cv-cell-label">${esc(label)}</div>
  <ul class="cv-list">${entries(list, label)}</ul>
</div>`;
}

// ── Load ───────────────────────────────────────────────────────────────────
const root = resolveRoot();
const dataPath = path.join(root, "canvas.json");
if (!existsSync(dataPath)) throw new Error(`canvas seed not found at ${dataPath}`);
const data = JSON.parse(readFileSync(dataPath, "utf8")) as CanvasData;
const b = data.bmc;
const v = data.vpc as Record<string, Entry[]>;

// ── Assets ─────────────────────────────────────────────────────────────────
if (existsSync(surfaceDir)) rmSync(surfaceDir, { recursive: true, force: true });
mkdirSync(surfaceDir, { recursive: true });
for (const a of assetBasenames) {
  const src = path.join(vendorAssetsDir, a);
  if (existsSync(src)) copyFileSync(src, path.join(surfaceDir, a));
}
for (const a of ["brand-overrides.css", "favicon.svg"]) {
  const src = path.join(brandDir, a);
  if (existsSync(src)) copyFileSync(src, path.join(surfaceDir, a));
}

// ── BMC grid (Strategyzer layout) ────────────────────────────────────────────
const bmcHtml = `<div class="bmc">
  ${block("bmc-kp", "Key partnerships", b.key_partnerships)}
  ${block("bmc-ka", "Key activities", b.key_activities)}
  ${block("bmc-kr", "Key resources", b.key_resources)}
  ${block("bmc-vp", "Value propositions", b.value_propositions)}
  ${block("bmc-cr", "Customer relationships", b.customer_relationships)}
  ${block("bmc-ch", "Channels", b.channels)}
  ${block("bmc-cs", "Customer segments", b.customer_segments)}
  ${block("bmc-co", "Cost structure", b.cost_structure)}
  ${block("bmc-re", "Revenue streams", b.revenue_streams)}
</div>`;

// ── VPC (value map □ + customer profile ○) ───────────────────────────────────
const vpcHtml = `<div class="vpc">
  <div class="vpc-side">
    <div class="vpc-side-title"><span class="vpc-glyph">▢</span> Value map</div>
    ${block("", "Products & services", v.products_services)}
    ${block("", "Pain relievers", v.pain_relievers)}
    ${block("", "Gain creators", v.gain_creators)}
  </div>
  <div class="vpc-side">
    <div class="vpc-side-title"><span class="vpc-glyph">◯</span> Customer profile</div>
    ${block("", "Customer jobs", v.customer_jobs)}
    ${block("", "Pains", v.pains)}
    ${block("", "Gains", v.gains)}
  </div>
</div>`;

const segment = typeof data.vpc.segment === "string" ? data.vpc.segment : "";

const popoutSidecar = JSON.stringify({ items: sidecar }).replace(/<\//g, "<\\/");
const popoutHtml = `<aside class="popout" data-open="false" aria-hidden="true">
  <div class="popout-backdrop" data-close></div>
  <div class="popout-panel" role="dialog" aria-modal="true" aria-label="Canvas entry detail">
    <div class="popout-head"><span class="popout-code">—</span><button class="popout-close" type="button" data-close aria-label="Close detail">×</button></div>
    <div class="popout-body"></div>
  </div>
</aside>
<script type="application/json" id="popout-data">${popoutSidecar}</script>`;

const f = data.fit;
const fitHtml = f
  ? `<h2>Fit</h2>
<div class="cv-fit">
  ${f.problem_solution ? `<div class="cv-fit-row"><div class="cv-fit-label">Problem–solution ${evPill(f.problem_solution.evidence)}</div><p>${esc(f.problem_solution.claim)}</p></div>` : ""}
  ${f.product_market ? `<div class="cv-fit-row"><div class="cv-fit-label">Product–market ${evPill(f.product_market.evidence)}</div><p>${esc(f.product_market.claim)}</p></div>` : ""}
</div>`
  : "";

const bodyHtml = `<p class="cv-lede">${esc(data.note ?? "The strategy canvas — bets recorded by evidence state.")} <span class="cv-hint">Click any entry for detail.</span></p>
<div class="cv-legend"><span class="cv-legend-title">Evidence</span> ${evPill("assumed")} ${evPill("tested")} ${evPill("confirmed")}</div>

<h2>Business Model Canvas</h2>
${bmcHtml}

<h2>Value Proposition Canvas</h2>
${segment ? `<p class="cv-segment">Segment: <strong>${esc(segment)}</strong></p>` : ""}
${vpcHtml}

${fitHtml}
${popoutHtml}`;

const CSS = `<style>
.cv-lede { color: var(--mute); margin: 0 0 .8em; }
.cv-legend { display:flex; align-items:center; gap:.5em; margin-bottom:1.5em; font-size:.8rem; }
.cv-legend-title { font-family: var(--mono); font-size:.66rem; text-transform:uppercase; letter-spacing:.08em; color: var(--mute); }
.cv-segment { color: var(--fg-soft); font-size:.9rem; }
.ev { font-family: var(--mono); font-size:.62rem; border-radius:999px; padding:.05em .5em; white-space:nowrap; }
.ev-assumed { background: color-mix(in srgb, #9aa0a6 20%, transparent); color: var(--mute); border:1px solid color-mix(in srgb,#9aa0a6 40%, transparent); }
.ev-tested { background: color-mix(in srgb, #d9a514 18%, transparent); color:#9a7400; border:1px solid color-mix(in srgb,#d9a514 40%, transparent); }
.ev-confirmed { background: color-mix(in srgb, #2e9e6b 16%, transparent); color:#2e9e6b; border:1px solid color-mix(in srgb,#2e9e6b 40%, transparent); }

.bmc { display:grid; grid-template-columns: repeat(5, 1fr); grid-auto-rows: minmax(110px, auto); gap:.55em; margin-bottom: 2em; }
.cv-cell { border:1px solid var(--hair); border-radius:6px; padding:.6em .7em; background: var(--code-bg); min-width:0; }
.cv-cell-label { font-family: var(--mono); font-size:.64rem; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color: var(--mute); margin-bottom:.45em; }
.cv-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.4em; }
.cv-list li { font-size:.82rem; color: var(--fg-soft); line-height:1.4; }
.cv-list li[data-popout] { border-radius:4px; padding:.05em .25em; margin:0 -.25em; transition: background .12s; }
.cv-list li[data-popout]:hover { color: var(--fg); background: color-mix(in srgb, var(--accent) 8%, transparent); }
.cv-empty { color: var(--mute); font-style:italic; }
.cv-hint { color: var(--mute); font-size:.85em; }
.bmc-kp { grid-column:1; grid-row:1 / span 2; }
.bmc-ka { grid-column:2; grid-row:1; }
.bmc-kr { grid-column:2; grid-row:2; }
.bmc-vp { grid-column:3; grid-row:1 / span 2; border-color: color-mix(in srgb, var(--accent) 35%, var(--hair)); }
.bmc-cr { grid-column:4; grid-row:1; }
.bmc-ch { grid-column:4; grid-row:2; }
.bmc-cs { grid-column:5; grid-row:1 / span 2; }
.bmc-co { grid-column:1 / 4; }
.bmc-re { grid-column:4 / 6; }

.vpc { display:grid; grid-template-columns: 1fr 1fr; gap:1em; margin-bottom:1.5em; }
.vpc-side { display:flex; flex-direction:column; gap:.55em; }
.vpc-side-title { font-family: var(--display); font-weight:600; font-size:.95rem; color: var(--fg); display:flex; align-items:center; gap:.4em; }
.vpc-glyph { color: var(--accent); }
.cv-fit { border:1px solid var(--hair); border-left:3px solid var(--accent); border-radius:0 6px 6px 0; background: var(--code-bg); padding:.8em 1em; font-size:.9rem; color: var(--fg-soft); }
.cv-fit-row { margin-bottom:.7em; } .cv-fit-row:last-child { margin-bottom:0; }
.cv-fit-label { font-weight:600; color: var(--fg); margin-bottom:.2em; display:flex; align-items:center; gap:.5em; }
.cv-fit-row p { margin:0; }
.ev-importance { background: var(--code-bg); color: var(--mute); border:1px solid var(--hair); }

@media (max-width: 900px) {
  .bmc { grid-template-columns: 1fr 1fr; }
  .bmc-kp,.bmc-ka,.bmc-kr,.bmc-vp,.bmc-cr,.bmc-ch,.bmc-cs,.bmc-co,.bmc-re { grid-column:auto; grid-row:auto; }
  .vpc { grid-template-columns: 1fr; }
}
</style>`;

const page: CorePage = {
  path: "",
  fm: { title: "Business model", description: "Business Model + Value Proposition canvas — bets by evidence state.", noindex: true },
  raw: "",
  kind: "docs",
};

const out = renderSurfacePage({
  slug: "",
  page,
  nav: [{ group: "Workspace", pages: [""] }],
  bodyHtml,
  pageLabel: () => "Business model",
  showToc: false,
  layoutVariant: "app",
  bodyScripts: () => `<script src="/popout.js" defer></script>`,
  extraHead: () => CSS,
});

writeFileSync(path.join(surfaceDir, "index.html"), out, "utf-8");
process.stdout.write(`canvas surface → workspace/dist/canvas/index.html (BMC 9 blocks + VPC + fit)\n`);
