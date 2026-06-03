// Graph browser surface build (A3b-3).
//
// Renders the WHOLE stack-graph node/edge graph into the deployable surface at
// workspace/dist/graph/. Net-new (be-civic has no whole-graph browser); modelled
// on build-handbook.ts for paths, asset copying, the shell call, and output
// layout.
//
// Pipeline (design §1 graph browser + §5 build-data contract):
//   graph/graph-record.json (committed structure — the source of truth)
//     → emit DOT for all nodes + typed edges
//     → shell out to Graphviz (dot -Tsvg)
//     → post-process the SVG: tag node groups (data-node-id), strip <a> wrappers
//       (clicks open the sidebar, never navigate), tag edge groups
//       (data-from/data-to), inject two health "traffic-light" badges per node
//       (last-updated from git; last-used GREY/unknown — projection snapshot does
//        not exist yet, so this badge renders DEGRADED per the design contract)
//     → embed a per-node JSON sidecar + a hidden detail sidebar
//     → render through the branded shell (renderSurfacePage)
//
// The surface is self-contained: assets ship at the surface root
// (dist/graph/style.css …) and the page at dist/graph/index.html, mirroring the
// handbook surface so the relative asset-prefix works and the portal hub links
// across surfaces. Run: bun run workspace/renderer/build-graph.ts

import {
  readFileSync, writeFileSync, mkdirSync, copyFileSync,
  existsSync, rmSync, readdirSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, execFileSync } from "node:child_process";

import { assetBasenames, renderMarkdown, type CorePage, type NavGroup } from "./vendor/bc-renderer-core/src/index.js";
import { renderSurfacePage } from "./shell-host.js";

const rendererDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rendererDir, "..", "..");
const recordPath = path.join(repoRoot, "graph", "graph-record.json");
const graphDir = path.join(repoRoot, "graph");
const distRoot = path.join(rendererDir, "..", "dist");          // workspace/dist
const surfaceDir = path.join(distRoot, "graph");                // workspace/dist/graph
const vendorAssetsDir = path.join(rendererDir, "vendor", "bc-renderer-core", "assets");
const localAssetsDir = path.join(rendererDir, "assets");        // forked graph-browser.js lives here
const brandDir = path.join(rendererDir, "brand");

function ensureDir(dir: string) { mkdirSync(dir, { recursive: true }); }
function writeHtml(filePath: string, html: string) {
  ensureDir(path.dirname(filePath));
  writeFileSync(filePath, html, "utf-8");
}
const log = (m: string) => process.stdout.write(m + "\n");
const warn = (m: string) => process.stderr.write("[warn] " + m + "\n");

// ─── Record types (subset of graph-record.json we consume) ──────────────────

interface RecordEdge {
  from: string;
  to: string;
  type: string;
  stage?: string;
  load?: string;
  external?: boolean;
}
interface RecordNode {
  primitive: string;          // skill | agent | command | script
  mode?: string;
  title?: string;
  status?: string;
  edges?: Record<string, unknown>;
}
interface GraphRecord {
  node_count: number;
  edge_count: number;
  nodes: Record<string, RecordNode>;
  references?: Record<string, unknown>;
  edges: RecordEdge[];
}

// ─── Health (the two traffic-lights) ─────────────────────────────────────────

type Health = "green" | "amber" | "red" | "unknown";

/** Map a commit ISO timestamp → recency traffic-light. */
function recencyLight(iso: string | null): Health {
  if (!iso) return "unknown";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "unknown";
  const days = (Date.now() - then) / 86_400_000;
  if (days <= 30) return "green";
  if (days <= 90) return "amber";
  return "red";
}

const LIGHT_FILL: Record<Health, string> = {
  green:   "var(--health-green, #2e9e5b)",
  amber:   "var(--health-amber, #d9a514)",
  red:     "var(--health-red, #d64545)",
  unknown: "var(--health-unknown, #9b9b96)",
};

/** Resolve a node's authored file path: graph/<id>/<id>.md (convention). */
function nodeFileRel(id: string): string | null {
  const rel = path.join("graph", id, `${id}.md`);
  return existsSync(path.join(repoRoot, rel)) ? rel : null;
}

/**
 * last-updated, from git: the most recent commit touching the node's file.
 * Returns null when the file is untracked or git/history is unavailable
 * (e.g. a shallow checkout) — the badge then renders "unknown".
 */
function lastUpdatedISO(relFile: string | null): string | null {
  if (!relFile) return null;
  try {
    const out = execFileSync(
      "git", ["log", "-1", "--format=%cI", "--", relFile],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    return out || null;
  } catch {
    return null;
  }
}

// ─── DOT emission ────────────────────────────────────────────────────────────

// Node styling by primitive (kind). Fills reuse the vendored --node-*-fill
// tokens so the graph reads in theme; Graphviz needs concrete fallbacks inline.
// Concrete hex — Graphviz cannot resolve CSS custom properties (var()); it
// silently falls back to black, which is the black-on-black bug. Light chips +
// dark label read on both light and dark canvases. Legend swatches mirror these.
const KIND_STYLE: Record<string, { fill: string; stroke: string; shape: string }> = {
  skill:    { fill: "#ffffff", stroke: "#c7ccd0", shape: "box" },
  agent:    { fill: "#e8f1f3", stroke: "#b6ccd2", shape: "box" },
  script:   { fill: "#fff3c4", stroke: "#e6d28a", shape: "box" },
  _default: { fill: "#ffffff", stroke: "#c7ccd0", shape: "box" },
};

// Edge styling/colour by type. The structural edges share an ink tone; the two
// process edges (precedes / can-follow) are visually distinct (they are the only
// cyclic edges — 02-graph-spec) and composes-into is dashed (node→arc).
const EDGE_STYLE: Record<string, { color: string; style?: string; label: string }> = {
  "invokes":       { color: "#3b6fb0", label: "invokes" },
  "references":    { color: "#7a7872", style: "dashed", label: "references" },
  "composes-into": { color: "#9b8b1f", style: "dotted", label: "composes-into" },
  "precedes":      { color: "#2e9e5b", label: "precedes" },
  "can-follow":    { color: "#d9a514", style: "dashed", label: "can-follow (loop)" },
  "maintains":     { color: "#b06a3b", label: "maintains" },
  "overlay":       { color: "#8a5bd6", style: "dashed", label: "overlay" },
  "loads":         { color: "#3b6fb0", label: "loads" },
  "triggers":      { color: "#d64545", label: "triggers" },
  "seed-next":     { color: "#d9a514", style: "dashed", label: "seed-next" },
};
function edgeStyle(type: string) {
  return EDGE_STYLE[type] ?? { color: "var(--edge-stroke, #8a8884)", label: type };
}

function dotEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Build the DOT source for the whole graph. We only draw edges whose BOTH
 * endpoints are nodes in the record (references/external targets like
 * `handbook`, and arc targets like `dev-sprint`, are not nodes — they would be
 * floating endpoints, so we skip them here; the sidecar still lists every edge
 * including those, for the sidebar).
 */
function buildDot(rec: GraphRecord): { dot: string; drawnEdgeKeys: Set<string> } {
  const nodeIds = new Set(Object.keys(rec.nodes));
  const lines: string[] = [];
  lines.push("digraph stackgraph {");
  lines.push("  rankdir=LR;");
  lines.push("  bgcolor=\"transparent\";");
  lines.push("  pad=0.3;");
  lines.push("  nodesep=0.35;");
  lines.push("  ranksep=0.85;");
  lines.push('  node [fontname="Helvetica", fontsize=11, penwidth=1.1, margin="0.14,0.09", style="filled,rounded", fontcolor="#1b1d1f"];');
  lines.push('  edge [fontname="Helvetica", fontsize=8, penwidth=1.1, arrowsize=0.7];');

  // Nodes
  for (const id of Object.keys(rec.nodes).sort()) {
    const n = rec.nodes[id];
    const kind = n.primitive || "_default";
    const st = KIND_STYLE[kind] ?? KIND_STYLE._default;
    // Escape id + kind individually and keep the `\n` as a RAW DOT newline. Running
    // dotEscape over the whole label double-escaped the backslash, so Graphviz drew a
    // literal "\n" instead of a line break (QA finding).
    const labelText = `${dotEscape(id)}\\n(${dotEscape(kind)})`;
    lines.push(
      `  "${dotEscape(id)}" [label="${labelText}", shape=${st.shape}, ` +
      `fillcolor="${st.fill}", color="${st.stroke}"];`,
    );
  }

  // Edges (only node→node; sorted for stable output). De-dupe identical
  // from/to/type triples (composes-into may repeat per stage).
  const drawnEdgeKeys = new Set<string>();
  const seen = new Set<string>();
  const sorted = [...rec.edges].sort((a, b) =>
    (a.from + a.to + a.type).localeCompare(b.from + b.to + b.type),
  );
  for (const e of sorted) {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) continue; // skip non-node endpoints
    const key = `${e.from}|${e.to}|${e.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    drawnEdgeKeys.add(`${e.from}|${e.to}`);
    const st = edgeStyle(e.type);
    const styleAttr = st.style ? `, style=${st.style}` : "";
    // Cyclic process edges (can-follow / seed-next) must NOT drive rank order —
    // otherwise Graphviz lays them co-directionally on top of the precedes arrow
    // and the loop is invisible. constraint=false routes them as visible back-arcs.
    const constraintAttr =
      (e.type === "can-follow" || e.type === "seed-next") ? ", constraint=false" : "";
    // No `tooltip` — Graphviz wraps any edge carrying one in an <a> element;
    // we surface the edge type via the SVG <title> and the sidecar instead, so
    // the edge group stays a clean <g class="edge"> with no anchor.
    lines.push(
      `  "${dotEscape(e.from)}" -> "${dotEscape(e.to)}" ` +
      `[color="${st.color}"${styleAttr}${constraintAttr}];`,
    );
  }

  lines.push("}");
  return { dot: lines.join("\n"), drawnEdgeKeys };
}

// ─── Graphviz ────────────────────────────────────────────────────────────────

function runGraphviz(dot: string): string | null {
  const res = spawnSync("dot", ["-Tsvg"], { input: dot, encoding: "utf8" });
  // Graceful degrade: a consuming workspace may not have Graphviz installed.
  // Skip the graph SVG (render a notice) rather than failing the whole build.
  if (res.error && (res.error as NodeJS.ErrnoException).code === "ENOENT") {
    warn("Graphviz ('dot') not found on PATH — graph SVG skipped; the surface renders a notice. Install graphviz to enable the whole-graph view.");
    return null;
  }
  if (res.error || res.status !== 0) {
    const detail = res.error ? String(res.error.message) : (res.stderr || `exit ${res.status}`);
    throw new Error(
      `Graphviz failed. The 'dot' binary must be installed and on PATH ` +
      `(expected at /usr/bin/dot). Detail: ${detail}`,
    );
  }
  if (!res.stdout || !res.stdout.includes("<svg")) {
    throw new Error("Graphviz produced no <svg> output.");
  }
  return res.stdout;
}

// ─── SVG post-processing (string/token manipulation) ─────────────────────────

interface NodeBadges { lastUpdated: Health; lastUsed: Health; }

/**
 * Post-process the Graphviz SVG:
 *   - strip the XML/DOCTYPE preamble so the SVG inlines cleanly;
 *   - per node <g class="node">: add data-node-id; remove the <a xlink:href>
 *     wrapper (clicks open the sidebar, not navigation); inject two badge
 *     circles (last-updated + last-used);
 *   - per edge <g class="edge">: add data-from / data-to (parsed from the
 *     Graphviz <title>from&#45;&gt;to</title>).
 */
function postProcessSvg(
  svg: string,
  badges: Map<string, NodeBadges>,
): { svg: string; nodeIdCount: number } {
  // Drop everything before the opening <svg ...> (XML decl, DOCTYPE, comments).
  const svgOpen = svg.indexOf("<svg");
  let body = svgOpen >= 0 ? svg.slice(svgOpen) : svg;

  let nodeIdCount = 0;

  // Process each <g ...class="node"...> ... </g> block. Graphviz emits the
  // node id inside <title>…</title>. We match the whole group lazily.
  body = body.replace(
    /<g\b([^>]*\bclass="node"[^>]*)>([\s\S]*?)<\/g>/g,
    (_full, attrs: string, inner: string) => {
      const titleMatch = inner.match(/<title>([\s\S]*?)<\/title>/);
      const rawId = titleMatch ? decodeEntities(titleMatch[1].trim()) : "";
      const id = rawId;

      // Strip any <a ...xlink:href...> wrapper so clicks don't navigate; keep
      // its children (the shape + text). Graphviz only emits <a> when a URL is
      // set, but we defend regardless.
      let innerClean = inner
        .replace(/<a\b[^>]*>/g, "")
        .replace(/<\/a>/g, "");

      // Inject the two health badges near the node's text anchor. We compute a
      // placement from the node's <ellipse>/<polygon>/<path> if present; else
      // fall back to the <text> coordinates.
      const badgeSvg = id ? renderBadges(id, innerClean, badges.get(id)) : "";

      const safeId = id ? ` data-node-id="${escAttr(id)}"` : "";
      if (id) nodeIdCount++;
      return `<g${attrs}${safeId}>${innerClean}${badgeSvg}</g>`;
    },
  );

  // Process each edge group: add data-from / data-to from its <title>.
  body = body.replace(
    /<g\b([^>]*\bclass="edge"[^>]*)>([\s\S]*?)<\/g>/g,
    (_full, attrs: string, inner: string) => {
      const titleMatch = inner.match(/<title>([\s\S]*?)<\/title>/);
      let from = "", to = "";
      if (titleMatch) {
        const t = decodeEntities(titleMatch[1].trim());
        // Graphviz directed-edge title form: "from->to"
        const arrow = t.split("->");
        if (arrow.length === 2) { from = arrow[0].trim(); to = arrow[1].trim(); }
      }
      const dataAttrs = (from && to)
        ? ` data-from="${escAttr(from)}" data-to="${escAttr(to)}"`
        : "";
      return `<g${attrs}${dataAttrs}>${inner}</g>`;
    },
  );

  return { svg: body, nodeIdCount };
}

/** Decode the handful of XML entities Graphviz uses in <title>. */
function decodeEntities(s: string): string {
  return s
    .replace(/&#45;/g, "-")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function escAttr(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/'/g, "&#39;");
}

/**
 * Render the two badge circles for a node. We anchor them at the top-left of
 * the node's bounding shape, derived from the first <polygon>/<ellipse>/<path>
 * points in the node group. The fills use CSS custom properties (with concrete
 * fallbacks) so themes can re-tint. last-used is GREY/unknown (degraded).
 */
function renderBadges(id: string, innerClean: string, b: NodeBadges | undefined): string {
  const place = anchorPoint(innerClean);
  if (!place) return "";
  const { x, y } = place;
  const r = 3.4;
  const gap = 8.2;
  const updated = b?.lastUpdated ?? "unknown";
  const used = b?.lastUsed ?? "unknown";
  // Two small circles just inside the top-left corner of the node box.
  const cx1 = x + 7;
  const cy = y + 7;
  const cx2 = cx1 + gap;
  return (
    `<g class="node-health" aria-hidden="true">` +
    `<circle class="health-dot health-updated" data-state="${updated}" ` +
      `cx="${cx1.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" ` +
      `fill="${LIGHT_FILL[updated]}" stroke="rgba(0,0,0,0.25)" stroke-width="0.5"><title>last-updated: ${updated}</title></circle>` +
    `<circle class="health-dot health-used" data-state="${used}" ` +
      `cx="${cx2.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" ` +
      `fill="${LIGHT_FILL[used]}" stroke="rgba(0,0,0,0.25)" stroke-width="0.5"><title>last-used: ${used} (no projection snapshot)</title></circle>` +
    `</g>`
  );
}

/**
 * Find the top-left anchor of a node group from the first geometry element.
 * Graphviz boxes are <polygon points="x1,y1 x2,y2 …">; we take the min x / min y
 * (SVG y grows downward, so min y is the top). Falls back to <text x= y=>.
 */
function anchorPoint(inner: string): { x: number; y: number } | null {
  const poly = inner.match(/<polygon[^>]*\bpoints="([^"]+)"/);
  if (poly) {
    const pts = poly[1].trim().split(/\s+/).map((p) => p.split(",").map(Number));
    const xs = pts.map((p) => p[0]).filter((n) => !Number.isNaN(n));
    const ys = pts.map((p) => p[1]).filter((n) => !Number.isNaN(n));
    if (xs.length && ys.length) return { x: Math.min(...xs), y: Math.min(...ys) };
  }
  const ell = inner.match(/<ellipse[^>]*\bcx="([-\d.]+)"[^>]*\bcy="([-\d.]+)"[^>]*\brx="([-\d.]+)"[^>]*\bry="([-\d.]+)"/);
  if (ell) {
    const cx = Number(ell[1]), cy = Number(ell[2]), rx = Number(ell[3]), ry = Number(ell[4]);
    if (![cx, cy, rx, ry].some(Number.isNaN)) return { x: cx - rx, y: cy - ry };
  }
  const text = inner.match(/<text[^>]*\bx="([-\d.]+)"[^>]*\by="([-\d.]+)"/);
  if (text) {
    const x = Number(text[1]), y = Number(text[2]);
    if (![x, y].some(Number.isNaN)) return { x: x - 20, y: y - 14 };
  }
  return null;
}

// ─── Sidecar (per-node detail JSON) ──────────────────────────────────────────

/** Pull goals[] (outcome/metric) + description from a node file's frontmatter. */
function readNodeMeta(id: string): { description?: string; goals: { outcome?: string; metric?: string }[] } {
  const rel = nodeFileRel(id);
  if (!rel) return { goals: [] };
  let raw: string;
  try { raw = readFileSync(path.join(repoRoot, rel), "utf8"); }
  catch { return { goals: [] }; }
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return { goals: [] };
  const fm = fmMatch[1];

  // description: single-line scalar.
  let description: string | undefined;
  const descLine = fm.match(/^description:\s*(.+)$/m);
  if (descLine) description = descLine[1].trim().replace(/^["']|["']$/g, "");

  // goals: a YAML list of { outcome, metric, ... }. Light parse — collect
  // `- outcome:` / `metric:` pairs under the `goals:` key.
  const goals: { outcome?: string; metric?: string }[] = [];
  const goalsIdx = fm.search(/^goals:\s*$/m);
  if (goalsIdx >= 0) {
    const after = fm.slice(goalsIdx);
    const block = after.split(/\n(?=\S)/)[0]; // up to the next top-level key
    let cur: { outcome?: string; metric?: string } | null = null;
    for (const line of block.split("\n")) {
      const o = line.match(/^\s*-\s*outcome:\s*(.+)$/);
      const m = line.match(/^\s*metric:\s*(.+)$/);
      if (o) { cur = { outcome: o[1].trim() }; goals.push(cur); }
      else if (m && cur) { cur.metric = m[1].trim(); }
    }
  }
  return { description, goals };
}

interface SidecarEdge { id: string; type: string; stage?: string; load?: string; external?: boolean; }
interface SidecarNode {
  id: string;
  kind: string;
  title: string;
  description?: string;
  goals: { outcome?: string; metric?: string }[];
  edges_out: SidecarEdge[];
  edges_in: SidecarEdge[];
  file: string | null;
  document_html: string;
  directory: { name: string; role: string }[];
  health: { last_updated: { state: Health; iso: string | null }; last_used: { state: Health; note: string } };
}

/** Read the node's directory listing (with roles) + render its canonical document body —
 *  the artefact shown in the graph pop-out (directory summary + the skill/agent doc). */
function readNodeDocument(id: string): { html: string; directory: { name: string; role: string }[] } {
  const dir = path.join(repoRoot, "graph", id);
  const out = { html: "", directory: [] as { name: string; role: string }[] };
  if (!existsSync(dir)) return out;
  const roleFor = (name: string): string => {
    if (name === `${id}.md`) return "canonical node — the skill / agent";
    if (name === "research-report.md") return "source synthesis";
    if (name === "source-material") return "raw source material (local)";
    return "";
  };
  for (const name of readdirSync(dir).sort()) out.directory.push({ name, role: roleFor(name) });
  const nodePath = path.join(dir, `${id}.md`);
  if (existsSync(nodePath)) {
    const raw = readFileSync(nodePath, "utf8");
    const m = raw.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
    const body = m ? m[1] : raw;
    try { out.html = renderMarkdown(body, { page: { path: id, fm: {} as Record<string, unknown>, raw: body } }).html; }
    catch { out.html = ""; }
  }
  return out;
}

function buildSidecar(rec: GraphRecord, lastUpdated: Map<string, string | null>): {
  data: Record<string, SidecarNode>;
  badges: Map<string, NodeBadges>;
} {
  const data: Record<string, SidecarNode> = {};
  const badges = new Map<string, NodeBadges>();

  // Pre-bucket edges by endpoint.
  const out = new Map<string, SidecarEdge[]>();
  const inn = new Map<string, SidecarEdge[]>();
  for (const e of rec.edges) {
    const entryOut: SidecarEdge = { id: e.to, type: e.type, stage: e.stage, load: e.load, external: e.external };
    const entryIn: SidecarEdge = { id: e.from, type: e.type, stage: e.stage, load: e.load, external: e.external };
    if (!out.has(e.from)) out.set(e.from, []);
    out.get(e.from)!.push(entryOut);
    if (!inn.has(e.to)) inn.set(e.to, []);
    inn.get(e.to)!.push(entryIn);
  }

  for (const id of Object.keys(rec.nodes)) {
    const n = rec.nodes[id];
    const kind = n.primitive || "node";
    const meta = readNodeMeta(id);
    const doc = readNodeDocument(id);
    const iso = lastUpdated.get(id) ?? null;
    const updatedState = recencyLight(iso);
    const usedState: Health = "unknown"; // degraded — no projection snapshot exists yet
    badges.set(id, { lastUpdated: updatedState, lastUsed: usedState });
    data[id] = {
      id,
      kind,
      title: n.title || id,
      description: meta.description,
      goals: meta.goals,
      edges_out: (out.get(id) || []),
      edges_in: (inn.get(id) || []),
      file: nodeFileRel(id),
      document_html: doc.html,
      directory: doc.directory,
      health: {
        last_updated: { state: updatedState, iso },
        last_used: { state: usedState, note: "no projection snapshot yet — degraded" },
      },
    };
  }
  return { data, badges };
}

// ─── Page assembly ───────────────────────────────────────────────────────────

/** The legend + the snapshot-degraded banner + the figure + sidebar + sidecar. */
function buildBodyHtml(svg: string, sidecar: Record<string, SidecarNode>): string {
  const legendKinds = `
    <span class="lg-item"><span class="lg-swatch lg-skill"></span>skill</span>
    <span class="lg-item"><span class="lg-swatch lg-agent"></span>agent</span>
    <span class="lg-item"><span class="lg-swatch lg-script"></span>script</span>`;
  // Only the edge types actually drawn between nodes.
  const drawnTypes = new Set<string>();
  for (const n of Object.values(sidecar)) {
    for (const e of n.edges_out) if (sidecar[e.id]) drawnTypes.add(e.type);
  }
  const legendEdges = [...drawnTypes].sort().map((t) => {
    const st = edgeStyle(t);
    return `<span class="lg-item"><span class="lg-line" style="--lg-line-color:${st.color}"></span>${escAttr(st.label)}</span>`;
  }).join("");

  const banner =
    `<div class="snapshot-banner" role="note">` +
    `<strong>Projection snapshot unavailable.</strong> ` +
    `Structure and <em>last-updated</em> (git) render in full; ` +
    `<em>last-used</em> shows as <span class="health-key health-unknown"></span>unknown until a ` +
    `<code>portal-projection.json</code> snapshot is published.` +
    `</div>`;

  const legend =
    `<div class="graph-legend" aria-label="Graph legend">` +
      `<div class="lg-row"><span class="lg-title">Nodes</span>${legendKinds}</div>` +
      `<div class="lg-row"><span class="lg-title">Edges</span>${legendEdges}</div>` +
      `<div class="lg-row"><span class="lg-title">Health</span>` +
        `<span class="lg-item"><span class="health-key health-green"></span>fresh</span>` +
        `<span class="lg-item"><span class="health-key health-amber"></span>aging</span>` +
        `<span class="lg-item"><span class="health-key health-red"></span>stale</span>` +
        `<span class="lg-item"><span class="health-key health-unknown"></span>unknown</span>` +
      `</div>` +
    `</div>`;

  const figure =
    `<figure class="requires-graph" data-density-tier="dense">` +
      `<figcaption class="requires-graph-header">` +
        `<span class="requires-graph-eyebrow">Whole graph</span>` +
        `<span class="requires-graph-tier-chip" data-tier="dense">${Object.keys(sidecar).length} nodes</span>` +
      `</figcaption>` +
      `<div class="requires-graph-stage">${svg}</div>` +
    `</figure>`;

  const sidebar =
    `<aside id="graph-sidebar" hidden aria-label="Node detail">` +
      `<button type="button" id="graph-sidebar-close" class="gs-close" aria-label="Close detail">×</button>` +
      `<div id="graph-sidebar-body"></div>` +
    `</aside>`;

  const sidecarScript =
    `<script type="application/json" id="graph-data">` +
    // Escape </script> defensively.
    JSON.stringify(sidecar).replace(/<\//g, "<\\/") +
    `</script>`;

  return [
    `<p class="lede graph-intro">The whole stack-graph — every node (skill / agent / script) and the typed edges between them. ` +
      `Hover a node to highlight its lineage; click a node to open its detail.</p>`,
    banner,
    legend,
    figure,
    sidebar,
    sidecarScript,
  ].join("\n");
}

// ─── extraHead: surface-local CSS (sidebar + badges + legend) ────────────────

function extraHeadCss(): string {
  return `<style>
/* Graph-browser surface styles (A3b-3). Surface-local — never edits vendored style.css. */
:root {
  --health-green: #2e9e5b; --health-amber: #d9a514; --health-red: #d64545; --health-unknown: #9b9b96;
  /* legend swatches mirror the concrete node fills baked into the DOT */
  --node-1-fill: #ffffff; --node-2-fill: #e8f1f3; --node-central-fill: #fff3c4;
}
html.dark { --health-green: #46c279; --health-amber: #e7bb45; --health-red: #e76d6d; --health-unknown: #8b8b86;
  /* match the legend swatches to the (light, concrete) node fills in dark mode too —
     the vendored html.dark fills outrank :root, so re-assert here */
  --node-1-fill: #ffffff; --node-2-fill: #e8f1f3; --node-central-fill: #fff3c4; }

.graph-intro { margin-bottom: 0.8em; }

.snapshot-banner {
  border: 1px solid color-mix(in srgb, var(--health-amber) 45%, var(--hair));
  background: color-mix(in srgb, var(--health-amber) 9%, transparent);
  border-radius: 3px; padding: 0.55em 0.8em; margin: 0 0 1em;
  font-size: 0.82rem; color: var(--fg-soft);
}
.snapshot-banner code { font-size: 0.92em; }

.graph-legend {
  display: flex; flex-direction: column; gap: 0.35em;
  border: 1px solid var(--hair); border-radius: 3px;
  padding: 0.55em 0.8em; margin: 0 0 1em; font-size: 0.8rem;
}
.graph-legend .lg-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5em 1.1em; }
.graph-legend .lg-title {
  font-family: var(--display); font-size: 0.62rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em; color: var(--mute);
  min-width: 3.6em;
}
.graph-legend .lg-item { display: inline-flex; align-items: center; gap: 0.35em; color: var(--fg-soft); }
.lg-swatch { width: 13px; height: 13px; border-radius: 2px; border: 1px solid var(--node-1-stroke, #cfcdc6); display: inline-block; }
.lg-skill  { background: var(--node-1-fill, #fff); }
.lg-agent  { background: var(--node-2-fill, #eceae2); }
.lg-script { background: var(--node-central-fill, #fae042); }
.lg-line { width: 20px; height: 0; border-top: 2px solid var(--lg-line-color, var(--edge-stroke)); display: inline-block; }
.health-key { width: 11px; height: 11px; border-radius: 999px; display: inline-block; border: 1px solid rgba(0,0,0,0.2); }
.health-green { background: var(--health-green); } .health-amber { background: var(--health-amber); }
.health-red { background: var(--health-red); } .health-unknown { background: var(--health-unknown); }

/* node health badges drawn into the SVG */
.requires-graph svg .node-health .health-dot { transition: opacity 200ms ease; }
.requires-graph svg .node[data-node-id] { cursor: pointer; }

/* full-bleed graph: breathing room + a canvas that uses the viewport */
.layout-full-bleed .content { padding: 1.1rem 1.4rem 1.6rem; }
.requires-graph { margin: 0; }
.requires-graph-stage { height: calc(100vh - 240px); min-height: 460px; }
.graph-unavailable { padding: 1.5em; border: 1px dashed var(--hair); border-radius: 6px; color: var(--fg-soft); background: var(--code-bg); font-size: .9rem; }
.requires-graph svg .node[data-node-id]:hover path,
.requires-graph svg .node[data-node-id]:hover polygon { filter: brightness(0.97); }

/* detail sidebar */
#graph-sidebar {
  position: fixed; top: 0; right: 0; height: 100vh; width: min(680px, 52vw);
  background: var(--bg); border-left: 1px solid var(--hair);
  box-shadow: -8px 0 28px rgba(0,0,0,0.16);
  z-index: 50; overflow-y: auto; padding: 1.4em 1.3em 2em;
  font-size: 0.9rem;
}
#graph-sidebar[hidden] { display: none; }
.gs-close {
  position: absolute; top: 0.7em; right: 0.8em;
  background: none; border: 1px solid var(--hair); border-radius: 4px;
  width: 30px; height: 30px; font-size: 1.2rem; line-height: 1; cursor: pointer;
  color: var(--fg);
}
.gs-close:hover { border-color: var(--brand-gold); }
#graph-sidebar .gs-id { font-family: var(--display); font-size: 1.15rem; font-weight: 700; margin: 0 2em 0.15em 0; color: var(--fg); }
#graph-sidebar .gs-kind {
  display: inline-block; font-size: 0.66rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; padding: 0.12em 0.5em; border-radius: 999px;
  border: 1px solid var(--hair); color: var(--mute); margin-bottom: 0.7em;
}
#graph-sidebar .gs-section-title {
  font-family: var(--display); font-size: 0.64rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em; color: var(--mute);
  margin: 1.1em 0 0.4em;
}
#graph-sidebar p { margin: 0.3em 0; color: var(--fg-soft); }
#graph-sidebar .gs-goal { margin: 0.35em 0; padding-left: 0.7em; border-left: 2px solid var(--brand-gold); }
#graph-sidebar .gs-goal .gs-metric { color: var(--mute); font-size: 0.84em; }
#graph-sidebar .gs-edges { list-style: none; margin: 0.2em 0; padding: 0; }
#graph-sidebar .gs-edges li { margin: 0.2em 0; display: flex; gap: 0.5em; align-items: baseline; }
#graph-sidebar .gs-edge-type {
  font-size: 0.64rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  padding: 0.08em 0.42em; border-radius: 3px; white-space: nowrap;
  background: color-mix(in srgb, var(--edge-c, #8a8884) 16%, transparent);
  color: color-mix(in srgb, var(--edge-c, #8a8884) 72%, var(--fg));
  border: 1px solid color-mix(in srgb, var(--edge-c, #8a8884) 40%, transparent);
}
#graph-sidebar .gs-edge-target { color: var(--fg); }
#graph-sidebar .gs-edge-target.is-external { color: var(--mute); font-style: italic; }
#graph-sidebar .gs-edge-meta { color: var(--mute); font-size: 0.78em; }
#graph-sidebar .gs-health { display: flex; gap: 1.2em; margin: 0.4em 0; }
#graph-sidebar .gs-health .gs-h { display: flex; align-items: center; gap: 0.4em; font-size: 0.84rem; color: var(--fg-soft); }
#graph-sidebar .gs-file { font-size: 0.84rem; }
#graph-sidebar .gs-file code { word-break: break-all; }
#graph-sidebar .gs-empty { color: var(--mute); font-style: italic; }
#graph-sidebar .gs-dir { list-style: none; margin: .2em 0 0; padding: 0; }
#graph-sidebar .gs-dir li { font-size: .82rem; margin: .25em 0; }
#graph-sidebar .gs-dir code { font-family: var(--mono); font-size: .78rem; color: var(--fg); }
#graph-sidebar .gs-dir .gs-role { color: var(--mute); }
#graph-sidebar .gs-doc { margin-top: .5em; border-top: 1px solid var(--hair); padding-top: 1em; font-size: .88rem; line-height: 1.55; }
#graph-sidebar .gs-doc h1, #graph-sidebar .gs-doc h2, #graph-sidebar .gs-doc h3 { font-family: var(--display); line-height: 1.25; margin: 1em 0 .4em; color: var(--fg); }
#graph-sidebar .gs-doc h1 { font-size: 1.15rem; } #graph-sidebar .gs-doc h2 { font-size: 1rem; } #graph-sidebar .gs-doc h3 { font-size: .9rem; }
#graph-sidebar .gs-doc p, #graph-sidebar .gs-doc li { color: var(--fg-soft); }
#graph-sidebar .gs-doc pre { background: var(--code-bg); border: 1px solid var(--hair); border-radius: 4px; padding: .6em .7em; overflow-x: auto; font-size: .8rem; }
#graph-sidebar .gs-doc code { font-family: var(--mono); }
#graph-sidebar .gs-doc table { width: 100%; border-collapse: collapse; font-size: .82rem; }
#graph-sidebar .gs-doc th, #graph-sidebar .gs-doc td { border: 1px solid var(--hair); padding: .3em .5em; text-align: left; }
</style>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

if (!existsSync(recordPath)) throw new Error(`graph record not found at ${recordPath}`);
const rec = JSON.parse(readFileSync(recordPath, "utf8")) as GraphRecord;
const nodeIds = Object.keys(rec.nodes);
if (nodeIds.length === 0) throw new Error(`no nodes in ${recordPath}`);

log(`graph browser — ${nodeIds.length} nodes / ${rec.edges.length} edges → ${surfaceDir}`);

// Health: last-updated from git (per node file). last-used is degraded (no snapshot).
const lastUpdated = new Map<string, string | null>();
let gitOk = 0;
for (const id of nodeIds) {
  const iso = lastUpdatedISO(nodeFileRel(id));
  if (iso) gitOk++;
  lastUpdated.set(id, iso);
}
log(`  last-updated: ${gitOk}/${nodeIds.length} resolved from git; last-used: degraded (no projection snapshot)`);

// Build sidecar (also yields per-node badge states).
const { data: sidecar, badges } = buildSidecar(rec, lastUpdated);

// DOT → SVG → post-process. Degrades to a notice when Graphviz is absent.
const { dot } = buildDot(rec);
const rawSvg = runGraphviz(dot);
let svg: string;
let nodeIdCount = 0;
if (rawSvg === null) {
  svg = `<div class="graph-unavailable">The whole-graph view requires <strong>Graphviz</strong> (the <code>dot</code> binary) at build time. Install graphviz and rebuild to render the graph; the legend and per-node detail below still describe the model.</div>`;
} else {
  ({ svg, nodeIdCount } = postProcessSvg(rawSvg, badges));
  if (nodeIdCount !== nodeIds.length) {
    warn(`data-node-id count (${nodeIdCount}) != node count (${nodeIds.length}) — investigate.`);
  }
}

// Clean ONLY the graph surface dir (never the whole dist/).
if (existsSync(surfaceDir)) rmSync(surfaceDir, { recursive: true, force: true });
ensureDir(surfaceDir);

// Assets (surface-local copy): vendored renderer-core assets + brand + favicon.
for (const basename of assetBasenames) {
  const src = path.join(vendorAssetsDir, basename);
  if (existsSync(src)) copyFileSync(src, path.join(surfaceDir, basename));
  else warn(`asset missing: ${src}`);
}
for (const brandAsset of ["brand-overrides.css", "favicon.svg"]) {
  const src = path.join(brandDir, brandAsset);
  if (existsSync(src)) copyFileSync(src, path.join(surfaceDir, brandAsset));
}
// The forked graph viewer (this surface's interactivity).
const browserSrc = path.join(localAssetsDir, "graph-browser.js");
if (!existsSync(browserSrc)) {
  throw new Error(`graph-browser.js not found at ${browserSrc} — fork it from vendor/.../graph-viewer.js`);
}
copyFileSync(browserSrc, path.join(surfaceDir, "graph-browser.js"));

// Single-page nav.
const nav: NavGroup[] = [{ group: "Workspace", pages: [""] }];

const page: CorePage = {
  path: "",
  fm: { title: "Graph browser", description: "The whole stack-graph — nodes, typed edges, and per-node health." },
  raw: "",
  kind: "docs",
};

const bodyHtml = buildBodyHtml(svg, sidecar);

const html = renderSurfacePage({
  slug: "",
  page,
  nav,
  bodyHtml,
  showToc: false,
  layoutVariant: "full-bleed",
  pageLabel: () => "Graph browser",
  extraHead: () => extraHeadCss(),
  bodyScripts: () => `<script src="graph-browser.js" defer></script>`,
});

writeHtml(path.join(surfaceDir, "index.html"), html);

log(`\ngraph browser: built index.html (${nodeIdCount} node groups tagged, ${Object.keys(sidecar).length} sidecar entries).`);
