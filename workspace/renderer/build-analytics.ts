// Analytics surface (A3b-6) — thin + input-gated. Conformance / agent-experience
// (AX) / metric-trends-vs-earns-keep all derive from the carrier-tagged event log,
// which doesn't exist until the loop is exercised. So this surface renders the
// honest input-gated state now, and surfaces whatever the published projection
// snapshot carries (per-node last_used / traversals / AX) once it exists.
// Run: bun run workspace/renderer/build-analytics.ts [--projection <path>]

import {
  writeFileSync, mkdirSync, copyFileSync, existsSync, readFileSync, rmSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

import {
  renderMarkdown, assetBasenames, type CorePage,
} from "./vendor/bc-renderer-core/src/index.js";
import { renderSurfacePage } from "./shell-host.js";

const rendererDir = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.join(rendererDir, "..", "dist");
const surfaceDir = path.join(distRoot, "analytics");
const vendorAssetsDir = path.join(rendererDir, "vendor", "bc-renderer-core", "assets");
const brandDir = path.join(rendererDir, "brand");

function resolveProjectionPath(): string {
  const args = process.argv.slice(2);
  const i = args.indexOf("--projection");
  if (i !== -1 && args[i + 1]) return path.resolve(args[i + 1]);
  if (process.env["PORTAL_PROJECTION"]) return path.resolve(process.env["PORTAL_PROJECTION"]);
  return path.join(distRoot, "portal-projection.json");
}

function gitHead(): string | null {
  try { return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(); }
  catch { return null; }
}
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

interface Projection {
  provenance?: { commit?: string; generated_at?: string; generator_version?: string };
  nodes?: Record<string, { last_used?: string | null; traversals_30d?: number }>;
  ax?: Record<string, Record<string, unknown>>;
}

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

const projPath = resolveProjectionPath();
let proj: Projection | null = null;
let staleReason: string | null = null;
const head = gitHead();
if (!existsSync(projPath)) {
  staleReason = "No projection snapshot published — analytics are input-gated until the loop is exercised.";
} else {
  try {
    proj = JSON.parse(readFileSync(projPath, "utf8")) as Projection;
    const c = proj.provenance?.commit ?? null;
    if (!head || !c || c !== head) {
      staleReason = `Projection snapshot is stale (snapshot ${c?.slice(0, 7) ?? "—"} vs HEAD ${head?.slice(0, 7) ?? "—"}).`;
    }
  } catch (e) {
    staleReason = `Projection snapshot malformed: ${e}`;
  }
}

const nodeEntries = proj?.nodes ? Object.entries(proj.nodes) : [];
const hasData = nodeEntries.length > 0;

const intro = `## Analytics

The analytics surface reads the **carrier-tagged event log** the dev-sprint loop emits
(via the instrumentation preamble) and projects three views:

- **Conformance** — did traversals follow the authored graph (precedes/can-follow), and where did they diverge?
- **Agent experience (AX)** — per-node signals on how well each primitive served the agent.
- **Metric-trends vs earns-keep** — does each node still earn its place?

These are **input-gated**: they activate once the loop runs and events accumulate in
\`.stack-graph/\`. A sanitized projection snapshot is published on rebuild; this page joins it.`;

const { html: introHtml } = renderMarkdown(intro, {
  page: { path: "", fm: { title: "Analytics" }, raw: intro } as CorePage,
});

let dataHtml: string;
if (hasData) {
  const rows = nodeEntries
    .sort((a, b) => (b[1].traversals_30d ?? 0) - (a[1].traversals_30d ?? 0))
    .map(([id, n]) =>
      `<tr><td><code>${esc(id)}</code></td><td>${esc(n.last_used ?? "—")}</td><td>${n.traversals_30d ?? 0}</td></tr>`)
    .join("\n");
  const prov = proj?.provenance;
  dataHtml = `<h2>Node activity (from the projection snapshot)</h2>
<p class="analytics-prov">snapshot: ${esc(prov?.commit?.slice(0, 7) ?? "—")} · ${esc(prov?.generated_at ?? "—")}</p>
<table class="analytics-table"><thead><tr><th>node</th><th>last used</th><th>traversals (30d)</th></tr></thead>
<tbody>${rows}</tbody></table>`;
} else {
  dataHtml = `<div class="callout callout-info"><p><strong>Input-gated.</strong> ${esc(staleReason ?? "No event data yet.")}
Once the dev-sprint loop runs against this workspace and the projection snapshot is published,
node activity, conformance, and AX trends appear here.</p></div>`;
}

const banner = staleReason && hasData
  ? `<div class="callout callout-warning"><p>⚠ ${esc(staleReason)} The figures below may not reflect the current commit.</p></div>`
  : "";

const page: CorePage = { path: "", fm: { title: "Analytics", noindex: true }, raw: "", kind: "docs" };
const out = renderSurfacePage({
  slug: "",
  page,
  nav: [{ group: "Workspace", pages: [""] }],
  bodyHtml: banner + introHtml + dataHtml,
  pageLabel: () => "Analytics",
  extraHead: () => `<style>
.analytics-table { width:100%; border-collapse: collapse; margin-top: .5rem; }
.analytics-table th, .analytics-table td { text-align:left; padding:.4rem .6rem; border-bottom:1px solid var(--hair); font-size:.9rem; }
.analytics-prov { color: var(--mute); font-size:.8rem; }
</style>`,
});

mkdirSync(surfaceDir, { recursive: true });
writeFileSync(path.join(surfaceDir, "index.html"), out, "utf-8");
process.stdout.write(`analytics surface → workspace/dist/analytics/index.html (${hasData ? `${nodeEntries.length} nodes` : "input-gated, no data yet"})\n`);
