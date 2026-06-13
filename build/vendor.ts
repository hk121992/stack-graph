#!/usr/bin/env -S bun run
/**
 * vendor.ts — project the authored graph (nodes + refs) into an installable
 * `.claude` plugin. Deterministic, idempotent, dependency-free; runs on bun.
 *
 * This is the stack-graph factory's build (Phase A2). It mirrors the shape of
 * `tooling/sg-handbook-curator/scripts/refresh-index.ts`: TS-on-bun, a minimal
 * line-level frontmatter parser (no YAML dependency — parse only the keys the
 * build consumes), `prior === next` idempotency, and an ascii-stable serialise
 * for the parity comparison.
 *
 * CONTRACT (the build contract is `handbook/content/03-plugin-spec/README.md`)
 * ---------------------------------------------------------------------------
 * The plugin is a SEPARATE repo, vendored into the factory as a git submodule at
 * `stack-graph-plugin/`. Inputs are read from the FACTORY root; outputs are written
 * into the submodule (the PLUGIN root = <factoryRoot>/stack-graph-plugin/).
 *
 * Inputs  (factory root resolved by walking up to the `graph/` + `handbook/` marker):
 *   graph/<id>/<id>.md          — 47 node files (28 skill + 19 agent)
 *   graph/_refs/<id>.md         — 28 shared references
 *   graph/graph-record.json     — the maintainer-owned record (read-only parity check)
 *   stack-graph-plugin/.claude-plugin/plugin.json — manifest (version bumped)
 *
 * Outputs (emitted into the plugin submodule at <factoryRoot>/stack-graph-plugin/):
 *   skills/<id>/SKILL.md        — built skill nodes (28)
 *   agents/<id>.md              — built agent nodes (19)
 *   skills/<id>/references/<refid>.md      — per-skill reference copies
 *   references/<agent-id>/<refid>.md       — per-agent reference copies
 *   workspace/renderer/…        — the workspace portal renderer (Stage 5, 0.5.0+)
 *   workspace/{build.sh,_headers,wrangler.jsonc} — the portal build orchestration
 *   workspace/graph/…           — the dev-loop graph data the graph surface renders
 *   .claude-plugin/plugin.json  — version + description updated
 *
 * THE STAGES (scope: 47 nodes + 28 refs + the vendored workspace renderer + the index-generator script)
 *   1. Place references. Per node `references` edge: resolve graph/_refs/<id>.md;
 *      SKIP external:true (handbook/personas/experience-contract/strategy-canvas —
 *      ship the pointer only). Copy (not symlink) the ref into the consumer's bundle
 *      and emit the host pointer: `@`-import for load:import, a backtick relative
 *      path for load:on-demand. Single-source per consumer.
 *   2. Strip + fold. Remove {edges, mode, determinism, goals, status, title} and the
 *      frontmatter group-comment lines; fold when-to-use into description. Keep name
 *      (from id), description, model, allowed-tools/tools, argument-hint.
 *   3. Place by primitive. skill -> skills/<id>/SKILL.md; agent -> agents/<id>.md.
 *      A `script` primitive aborts the build (none expected in this scope).
 *   4. Index check. Assert the emitted primitive set matches the node set in
 *      graph-record.json (parity only — the record is NOT rewritten; the maintainer
 *      owns it).
 *   5. Vendor the workspace render (0.5.0+). Binary-safe recursive copy of
 *      workspace/renderer/ + the build orchestration (build.sh/_headers/wrangler)
 *      + the dev-loop graph data (graph-record.json + each node's <id>/<id>.md) into
 *      <plugin>/workspace/. This carries the unified portal so a harness builds it
 *      from the plugin alone (04-harness "Instantiating a harness"; bindings:
 *      renderer/deploy-config). Self-contained tree; not run through the text
 *      primitive pipeline (it carries fonts/favicons), so it has its own clean +
 *      buffer-compare drift check.
 *
 * GATES
 *   G1 idempotency/freshness: deterministic serialise => re-run is byte-identical.
 *      `--check` exits non-zero if any committed output differs from a fresh build.
 *   G2 load-verify: each emitted primitive's native frontmatter is valid (skill:
 *      name+description; agent: name+description), every emitted @-import / backtick
 *      pointer path resolves on disk, and no stray graph keys remain. A failing node
 *      fails the build.
 *
 * Flags:
 *   (none)     write the plugin tree; run G1 (self-consistency) + G2.
 *   --check    do not write; compare a fresh in-memory build against committed
 *              output and exit non-zero on any drift (the freshness gate / CI).
 *
 * Exit codes:
 *   0  success
 *   1  a gate failed (G1 drift under --check, or G2 load-verify failure)
 *   2  repo root / inputs could not be resolved, or a structural invariant broke
 *      (e.g. a `script` primitive, a missing non-external reference file)
 */

import {
  readdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  mkdirSync,
  rmSync,
  statSync,
  existsSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ----------------------------------------------------------------------------
// Constants — the strip-set, the fold, the version bump, the layout.
// ----------------------------------------------------------------------------

/** Frontmatter keys that serve the graph lens / index / renderer — dropped from
 *  the built primitive (03-plugin-spec "Frontmatter mapping"). */
const GRAPH_ONLY_KEYS = new Set([
  "edges",
  "mode",
  "determinism",
  "goals",
  "status",
  "title",
]);

/** Native `.claude` keys carried through to the built primitive, in this fixed
 *  emit order (deterministic serialise). `name` is derived from `id`; `description`
 *  has `when-to-use` folded in. `id` is dropped (folded into `name`). */
const NATIVE_KEY_ORDER = [
  "name",
  "description",
  "model",
  "allowed-tools",
  "tools",
  "argument-hint",
];

const PLUGIN_VERSION = "0.11.1";

// The plugin lives in its own repo, vendored into the factory as a git submodule
// at this path. Inputs (graph/) are read from the factory root; outputs are written
// into <factoryRoot>/<PLUGIN_SUBDIR>/.
const PLUGIN_SUBDIR = "stack-graph-plugin";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface RefEdge {
  id: string;
  load: "import" | "on-demand";
  external: boolean;
}

interface NodeFile {
  id: string;
  primitive: string;
  /** Raw frontmatter scalar values, by key (for native passthrough + fold). */
  fm: Record<string, string>;
  /** Whether allowed-tools/tools/argument-hint were inline arrays/scalars — we
   *  carry the *verbatim* raw RHS string to avoid reserialising semantics. */
  fmRaw: Record<string, string>;
  references: RefEdge[];
  /** The body (everything after the closing frontmatter `---`), verbatim. */
  body: string;
  /** Source path, for diagnostics. */
  srcPath: string;
}

/** One file the build wants on disk: path (relative to repo root) + content. */
interface EmittedFile {
  relPath: string;
  content: string;
}

// ----------------------------------------------------------------------------
// Factory-root resolution (walk up for the graph/ + handbook/ marker).
// The plugin's .claude-plugin/ now lives in the submodule, so it is no longer a
// root marker; graph/ + handbook/ are the factory-stable markers.
// ----------------------------------------------------------------------------

function resolveRepoRoot(): string {
  let cur = SCRIPT_DIR;
  for (let i = 0; i < 12; i++) {
    if (existsSync(join(cur, "graph")) && existsSync(join(cur, "handbook"))) {
      return cur;
    }
    const parent = dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  fail(
    "vendor: cannot resolve factory root (no graph/ + handbook/ marker found walking up from " +
      SCRIPT_DIR +
      ").",
  );
}

// ----------------------------------------------------------------------------
// Frontmatter parsing — line-level, only the keys the build consumes.
// ----------------------------------------------------------------------------

/** Split a markdown file into [frontmatterBlock, body]. The body retains its
 *  leading newline-normalised form. Returns null if no frontmatter. */
function splitFrontmatter(raw: string): { block: string; body: string } | null {
  if (!raw.startsWith("---")) return null;
  // The closing delimiter is a line that is exactly `---` after the opening.
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return null;
  const block = raw.slice(4, end);
  // Body begins after the closing `---` line.
  let rest = raw.slice(end + 4); // skip "\n---"
  // Drop the remainder of the delimiter line (it may carry a trailing newline).
  const nl = rest.indexOf("\n");
  rest = nl >= 0 ? rest.slice(nl + 1) : "";
  return { block, body: rest };
}

/** Strip surrounding single/double quotes from a scalar RHS. */
function unquote(v: string): string {
  const t = v.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

/**
 * Parse the inline reference-edge objects out of the `edges:` -> `references:`
 * sub-block. The authored form is a YAML block list of inline objects:
 *
 *   edges:
 *     references:
 *       - { id: instrumentation-preamble, load: import }
 *       - { id: handbook, load: on-demand, external: true }
 *
 * We scan only inside `edges:` -> `references:` and only the `- { ... }` lines.
 */
function parseReferenceEdges(block: string): RefEdge[] {
  const lines = block.split("\n");
  const out: RefEdge[] = [];
  let inEdges = false;
  let inRefs = false;

  for (const line of lines) {
    // A non-indented, non-comment key ends the edges block.
    if (/^[A-Za-z][A-Za-z0-9_-]*\s*:/.test(line)) {
      inEdges = line.startsWith("edges:");
      inRefs = false;
      continue;
    }
    if (!inEdges) continue;
    // Inside edges: a 2-space-indented key. `references:` opens the sub-block;
    // any other 2-space key closes it.
    const subKey = line.match(/^\s{2}([a-z][a-z0-9_-]*)\s*:/);
    if (subKey) {
      inRefs = subKey[1] === "references";
      continue;
    }
    if (!inRefs) continue;
    // A reference entry: `- { id: X, load: Y[, external: true] }`. Be tolerant
    // of arbitrary inner whitespace.
    const obj = line.match(/^\s*-\s*\{(.*)\}\s*$/);
    if (!obj) continue;
    const inner = obj[1];
    const idM = inner.match(/\bid:\s*([A-Za-z0-9_-]+)/);
    const loadM = inner.match(/\bload:\s*([A-Za-z-]+)/);
    const extM = inner.match(/\bexternal:\s*(true|false)/);
    if (!idM) continue;
    const load = loadM && loadM[1] === "import" ? "import" : "on-demand";
    out.push({
      id: idM[1],
      load,
      external: !!extM && extM[1] === "true",
    });
  }
  return out;
}

/** Parse the top-level scalar native keys the build consumes. Block/structured
 *  keys (edges, goals) and frontmatter group-comments are ignored here. */
function parseNativeScalars(block: string): {
  fm: Record<string, string>;
  fmRaw: Record<string, string>;
} {
  const fm: Record<string, string> = {};
  const fmRaw: Record<string, string> = {};
  const lines = block.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Only top-level keys (column 0), never indented sub-keys, never comments.
    const m = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const rhsRaw = m[2];
    // A block-scalar indicator (`>-`, `>`, `|`, `|-`, …) opens a folded/literal
    // multi-line scalar: collect the indented continuation lines and fold them
    // into one space-joined string (descriptions are prose — folding is correct
    // for both styles here).
    if (/^[>|][+-]?\s*(#.*)?$/.test(rhsRaw.trim()) && rhsRaw.trim() !== "") {
      const folded: string[] = [];
      while (i + 1 < lines.length) {
        const next = lines[i + 1];
        if (next.trim() === "") {
          i++;
          continue;
        }
        if (!/^\s{2,}/.test(next)) break; // column-0 line ends the scalar
        folded.push(next.trim());
        i++;
      }
      if (folded.length > 0) {
        const value = folded.join(" ");
        fmRaw[key] = value;
        fm[key] = value;
      }
      continue;
    }
    // `edges`/`goals` open multi-line blocks — their RHS is empty; skip. Any
    // key whose RHS is empty is a block opener, not a scalar we carry.
    if (rhsRaw.trim() === "") continue;
    fmRaw[key] = rhsRaw.trim();
    fm[key] = unquote(rhsRaw);
  }
  return { fm, fmRaw };
}

function parseNodeFile(srcPath: string): NodeFile {
  const raw = readFileSync(srcPath, "utf-8");
  const split = splitFrontmatter(raw);
  if (!split) fail(`vendor: ${srcPath}: no frontmatter — not a valid node file.`);
  const { block, body } = split;
  const { fm, fmRaw } = parseNativeScalars(block);
  const references = parseReferenceEdges(block);

  const id = fm.id;
  const primitive = fm.primitive;
  if (!id) fail(`vendor: ${srcPath}: missing required \`id\` frontmatter.`);
  if (!primitive)
    fail(`vendor: ${srcPath}: missing required \`primitive\` frontmatter.`);

  return { id, primitive, fm, fmRaw, references, body, srcPath };
}

// ----------------------------------------------------------------------------
// Stage 2 — strip + fold -> the built frontmatter block.
// ----------------------------------------------------------------------------

/**
 * Build the native frontmatter for an emitted primitive: keep only the native
 * keys (NATIVE_KEY_ORDER), derive `name` from `id`, fold `when-to-use` into
 * `description`, and drop every graph-only key + frontmatter comment. The RHS of
 * pass-through keys (model, allowed-tools/tools, argument-hint) is carried
 * verbatim so we never re-serialise YAML semantics.
 */
function buildFrontmatter(node: NodeFile): string {
  const out: Record<string, string> = {};

  // name <- id
  out.name = node.id;

  // description, with when-to-use folded in as trigger guidance.
  const desc = node.fm.description ?? "";
  const wtu = node.fm["when-to-use"] ?? "";
  out.description = wtu ? `${desc} Use when: ${wtu}` : desc;

  // Pass-through native keys, verbatim RHS where present.
  for (const k of ["model", "allowed-tools", "tools", "argument-hint"]) {
    if (node.fmRaw[k] !== undefined) out[k] = node.fmRaw[k];
  }

  // Serialise in fixed order. description/name are quoted via JSON.stringify to
  // guarantee a safe single-line scalar regardless of punctuation; pass-through
  // keys keep their authored RHS.
  const lines: string[] = ["---"];
  for (const key of NATIVE_KEY_ORDER) {
    if (out[key] === undefined) continue;
    if (key === "name" || key === "description") {
      lines.push(`${key}: ${JSON.stringify(out[key])}`);
    } else {
      lines.push(`${key}: ${out[key]}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

// ----------------------------------------------------------------------------
// Stage 1 — references: per-consumer copy + host pointer block.
// ----------------------------------------------------------------------------

/**
 * The per-consumer references directory.
 *
 * `repoRel(refId)`     — path of a placed copy relative to the plugin/repo root.
 * `pointer(refId)`     — the path the host primitive uses to reach the copy,
 *                        relative to the primitive file itself.
 *
 * Skills get a co-located bundle (`skills/<id>/references/`) — the plugin spec
 * explicitly allows supporting files alongside SKILL.md, and `@references/<id>.md`
 * resolves from the SKILL.md. Agents are FLAT files in `agents/` with no
 * documented co-located-bundle convention, and nested `.md` under `agents/` risks
 * being mis-registered by agent discovery — so agent ref copies live in a
 * plugin-root `references/<agent-id>/` namespace, reached as `../references/<id>/…`
 * relative to `agents/<id>.md`. Both are single-source-per-consumer copies.
 */
function consumerRefsDir(node: NodeFile): {
  repoRel: (refId: string) => string;
  pointer: (refId: string) => string;
} {
  if (node.primitive === "skill") {
    return {
      repoRel: (refId) => join("skills", node.id, "references", `${refId}.md`),
      pointer: (refId) => `references/${refId}.md`,
    };
  }
  return {
    repoRel: (refId) => join("references", node.id, `${refId}.md`),
    pointer: (refId) => `../references/${node.id}/${refId}.md`,
  };
}

/**
 * Resolve + render a node's references. Returns:
 *  - files: the per-consumer ref copies to write (copy, not symlink),
 *  - pointerBlock: the markdown appended to the body so the host pointer resolves
 *    (an `@`-import per load:import ref; a backtick relative path per
 *    load:on-demand ref). External refs contribute neither — the body already
 *    carries the "follow your <id> reference" prose and the harness binds it.
 */
function placeReferences(
  node: NodeFile,
  refsRoot: string,
): { files: EmittedFile[]; pointerBlock: string; resolvedPaths: string[] } {
  const files: EmittedFile[] = [];
  const imports: string[] = [];
  const onDemand: string[] = [];
  const resolvedPaths: string[] = [];
  const dir = consumerRefsDir(node);

  // A ref may itself depend on another ref (a `references` edge in its own
  // frontmatter — e.g. test-discipline → architecture-doctrine). Follow those
  // edges transitively so the bundle is self-contained: a copied ref's pointer
  // must never dangle in an installed plugin. Transitive copies are always
  // on-demand (the node never declared them for `@`-import splicing).
  const visited = new Set<string>();
  const queue: { id: string; load: "import" | "on-demand"; via?: string }[] = [];
  for (const ref of node.references) {
    if (ref.external) continue; // ship the pointer prose only; harness supplies it.
    if (visited.has(ref.id)) continue;
    visited.add(ref.id);
    queue.push({ id: ref.id, load: ref.load });
  }

  while (queue.length > 0) {
    const ref = queue.shift()!;
    const srcRefPath = join(refsRoot, `${ref.id}.md`);
    if (!existsSync(srcRefPath)) {
      fail(
        `vendor: ${node.id}: non-external reference \`${ref.id}\`` +
          (ref.via ? ` (reached via \`${ref.via}\`)` : "") +
          ` has no file at graph/_refs/${ref.id}.md.`,
      );
    }
    const refContent = readFileSync(srcRefPath, "utf-8");
    const destRepoRel = dir.repoRel(ref.id); // path relative to the plugin root
    const pointer = dir.pointer(ref.id); // path relative to the primitive file
    files.push({ relPath: destRepoRel, content: refContent });
    resolvedPaths.push(destRepoRel);

    if (ref.load === "import") {
      imports.push(`@${pointer}`);
    } else {
      onDemand.push(
        "`" +
          pointer +
          "`" +
          ` — \`${ref.id}\`` +
          (ref.via ? ` (via \`${ref.via}\`)` : ""),
      );
    }

    // Enqueue the ref's own non-external references edges.
    const split = splitFrontmatter(refContent);
    if (split) {
      for (const sub of parseReferenceEdges(split.block)) {
        if (sub.external || visited.has(sub.id)) continue;
        visited.add(sub.id);
        queue.push({ id: sub.id, load: "on-demand", via: ref.id });
      }
    }
  }

  // Compose a stable, clearly-delimited pointer block. Order: imports (eager,
  // load-time) then on-demand (read at need). Sorted within each group by id for
  // determinism (declaration order in frontmatter is already stable, but sorting
  // makes the emitted block independent of edge ordering).
  imports.sort();
  onDemand.sort();
  const parts: string[] = [];
  if (imports.length > 0) {
    parts.push(
      "## Imported references\n\n" +
        "The following references are single-sourced into this primitive's bundle and " +
        "spliced at load (`@`-import). They are always present:\n\n" +
        imports.map((i) => i).join("\n"),
    );
  }
  if (onDemand.length > 0) {
    parts.push(
      "## On-demand references\n\n" +
        "Read these at the step of need (single-sourced into this primitive's bundle):\n\n" +
        onDemand.map((o) => `- ${o}`).join("\n"),
    );
  }
  const pointerBlock = parts.length > 0 ? "\n\n" + parts.join("\n\n") + "\n" : "";
  return { files, pointerBlock, resolvedPaths };
}

// ----------------------------------------------------------------------------
// Stage 3 — place by primitive.
// ----------------------------------------------------------------------------

function primitiveOutPath(node: NodeFile): string {
  switch (node.primitive) {
    case "skill":
      return join("skills", node.id, "SKILL.md");
    case "agent":
      return join("agents", `${node.id}.md`);
    case "script":
    case "command":
      fail(
        `vendor: ${node.id}: primitive \`${node.primitive}\` is out of scope for ` +
          `this build (28 skill+agent nodes only). Aborting.`,
      );
    // eslint-disable-next-line no-fallthrough
    default:
      fail(`vendor: ${node.id}: unknown primitive \`${node.primitive}\`.`);
  }
}

/** Assemble the full emitted primitive file: built frontmatter + verbatim body +
 *  the resolved-pointer block. Body trailing whitespace is trimmed to a single
 *  terminal newline for determinism. */
function assemblePrimitive(node: NodeFile, pointerBlock: string): string {
  const fmBlock = buildFrontmatter(node);
  const body = node.body.replace(/\s+$/, "");
  return `${fmBlock}\n\n${body}${pointerBlock}\n`;
}

// ----------------------------------------------------------------------------
// plugin.json — version + description bump.
// ----------------------------------------------------------------------------

function buildPluginManifest(root: string): EmittedFile {
  const p = join(root, ".claude-plugin", "plugin.json");
  const raw = readFileSync(p, "utf-8");
  const obj = JSON.parse(raw) as Record<string, unknown>;
  obj.version = PLUGIN_VERSION;
  // Drop the "Scaffold; specs in progress." tail from the description.
  if (typeof obj.description === "string") {
    obj.description = obj.description
      .replace(/\s*Scaffold; specs in progress\.?\s*$/i, "")
      .trim();
  }
  // Re-serialise with 2-space indent + trailing newline (matches the committed
  // style). Key order is preserved by JSON.parse/stringify round-trip.
  const content = JSON.stringify(obj, null, 2) + "\n";
  return { relPath: join(".claude-plugin", "plugin.json"), content };
}

// ----------------------------------------------------------------------------
// The build — pure: inputs -> the full set of emitted files.
// ----------------------------------------------------------------------------

interface BuildResult {
  files: EmittedFile[];
  nodes: NodeFile[];
  counts: { skills: number; agents: number; refCopies: number };
  /** node-id -> { primitive out path, resolved pointer paths } for G2. */
  emitted: Map<string, { outPath: string; pointers: string[] }>;
}

function runBuild(inputRoot: string, outputRoot: string): BuildResult {
  const graphDir = join(inputRoot, "graph");
  const refsRoot = join(graphDir, "_refs");

  // Discover node files: graph/<id>/<id>.md (the canonical node file is named
  // after its directory; research-report.md and source-material/ are excluded).
  const nodeDirs = readdirSync(graphDir).filter((name) => {
    if (name === "_refs") return false;
    const full = join(graphDir, name);
    return statSync(full).isDirectory();
  });

  const nodes: NodeFile[] = [];
  for (const id of nodeDirs.sort()) {
    const nodePath = join(graphDir, id, `${id}.md`);
    if (!existsSync(nodePath)) {
      fail(`vendor: graph/${id}/ has no canonical node file ${id}.md.`);
    }
    nodes.push(parseNodeFile(nodePath));
  }

  const files: EmittedFile[] = [];
  const emitted = new Map<string, { outPath: string; pointers: string[] }>();
  let skills = 0;
  let agents = 0;
  let refCopies = 0;

  for (const node of nodes) {
    const outPath = primitiveOutPath(node); // also validates the primitive
    const { files: refFiles, pointerBlock, resolvedPaths } = placeReferences(
      node,
      refsRoot,
    );
    files.push(...refFiles);
    refCopies += refFiles.length;

    const content = assemblePrimitive(node, pointerBlock);
    files.push({ relPath: outPath, content });

    if (node.primitive === "skill") skills++;
    else if (node.primitive === "agent") agents++;

    emitted.set(node.id, { outPath, pointers: resolvedPaths });
  }

  // plugin.json bump (the manifest lives in the plugin/output root).
  files.push(buildPluginManifest(outputRoot));

  return { files, nodes, counts: { skills, agents, refCopies }, emitted };
}

// ----------------------------------------------------------------------------
// Stage 4 — index parity check (read-only; the record is NOT rewritten).
// ----------------------------------------------------------------------------

function checkIndexParity(root: string, nodes: NodeFile[]): string[] {
  const errors: string[] = [];
  const recordPath = join(root, "graph", "graph-record.json");
  const record = JSON.parse(readFileSync(recordPath, "utf-8")) as {
    nodes: Record<string, { primitive: string }>;
  };
  const recordIds = new Set(Object.keys(record.nodes));
  const emittedIds = new Set(nodes.map((n) => n.id));

  for (const id of emittedIds) {
    if (!recordIds.has(id)) errors.push(`emitted node \`${id}\` is not in the record`);
  }
  for (const id of recordIds) {
    if (!emittedIds.has(id))
      errors.push(`record node \`${id}\` was not emitted by the build`);
  }
  // Primitive agreement.
  for (const node of nodes) {
    const rec = record.nodes[node.id];
    if (rec && rec.primitive !== node.primitive) {
      errors.push(
        `node \`${node.id}\`: primitive mismatch — file says \`${node.primitive}\`, ` +
          `record says \`${rec.primitive}\``,
      );
    }
  }
  return errors;
}

// ----------------------------------------------------------------------------
// G2 — load-verify each emitted primitive.
// ----------------------------------------------------------------------------

function loadVerify(root: string, build: BuildResult): string[] {
  const failures: string[] = [];
  // Index the emitted file contents for pointer-resolution checks.
  const emittedByRel = new Map<string, string>();
  for (const f of build.files) emittedByRel.set(f.relPath, f.content);

  for (const node of build.nodes) {
    const info = build.emitted.get(node.id)!;
    const content = emittedByRel.get(info.outPath);
    if (content === undefined) {
      failures.push(`${node.id}: emitted file ${info.outPath} missing from build set`);
      continue;
    }
    // 1. Native frontmatter present + valid for the primitive's own schema.
    const split = splitFrontmatter(content);
    if (!split) {
      failures.push(`${node.id}: emitted primitive has no frontmatter`);
      continue;
    }
    const fm = parseNativeScalars(split.block).fm;
    if (!fm.name) failures.push(`${node.id}: emitted primitive missing \`name\``);
    if (!fm.description)
      failures.push(`${node.id}: emitted primitive missing \`description\``);
    // (skills and agents share the name+description minimum; agents may also carry
    // model/tools but those are optional passthrough.)

    // 2. No stray graph keys leaked into the emitted frontmatter.
    for (const k of GRAPH_ONLY_KEYS) {
      const re = new RegExp(`^${k}\\s*:`, "m");
      if (re.test(split.block)) {
        failures.push(`${node.id}: stray graph key \`${k}\` in emitted frontmatter`);
      }
    }
    // `id` and `when-to-use` are folded away — they must not survive either.
    if (/^id\s*:/m.test(split.block))
      failures.push(`${node.id}: stray \`id\` key in emitted frontmatter (should fold to name)`);
    if (/^when-to-use\s*:/m.test(split.block))
      failures.push(
        `${node.id}: stray \`when-to-use\` key in emitted frontmatter (should fold to description)`,
      );

    // 3. Every emitted pointer path resolves to a placed file in the build set.
    //    Scan the body for `@`-import lines and backtick `…references…/<refid>.md`
    //    pointers, resolve each RELATIVE TO THE PRIMITIVE FILE, and require the
    //    resolved repo-relative path to be in the emitted set. Resolving against
    //    the primitive's own directory makes this layout-agnostic (it follows the
    //    same `../` that Claude follows).
    const primitiveDir = dirname(info.outPath); // e.g. "skills/<id>" or "agents"
    const pointerRe =
      /(?:^|[`@])((?:\.\.\/)*references\/[A-Za-z0-9_/-]+\.md)/gm;
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = pointerRe.exec(content)) !== null) {
      const rel = m[1];
      const repoRel = join(primitiveDir, rel); // normalises any leading ../
      if (seen.has(repoRel)) continue;
      seen.add(repoRel);
      if (!emittedByRel.has(repoRel)) {
        failures.push(
          `${node.id}: pointer \`${rel}\` does not resolve to a placed reference`,
        );
      }
    }
    // 4. Conversely, every placed ref copy for this node is pointed at (no orphan
    //    copies — a copy with no pointer is dead weight / a bug).
    for (const p of info.pointers) {
      if (!seen.has(p)) {
        failures.push(`${node.id}: placed reference ${p} has no host pointer`);
      }
    }
  }
  return failures;
}

// ----------------------------------------------------------------------------
// Write / check the build set.
// ----------------------------------------------------------------------------

/** The build-owned output trees, relative to the plugin root. Everything under
 *  these (except `.gitkeep`) is generated and safe to regenerate. */
const OUTPUT_TREES = ["skills", "agents", "references"];

/** Clean the generated subtrees so a removed node/ref leaves no stale file.
 *  Only the build-owned trees are touched. */
function cleanOutputs(root: string): void {
  for (const sub of OUTPUT_TREES) {
    const dir = join(root, sub);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (name === ".gitkeep") continue;
      rmSync(join(dir, name), { recursive: true, force: true });
    }
  }
}

function writeBuild(root: string, build: BuildResult): void {
  cleanOutputs(root);
  for (const f of build.files) {
    const abs = join(root, f.relPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, f.content, "utf-8");
  }
}

/** --check: compare the fresh build against committed files; collect drift. */
function checkBuild(root: string, build: BuildResult): string[] {
  const drift: string[] = [];
  const expected = new Set<string>();
  for (const f of build.files) {
    expected.add(f.relPath);
    const abs = join(root, f.relPath);
    if (!existsSync(abs)) {
      drift.push(`missing: ${f.relPath}`);
      continue;
    }
    const onDisk = readFileSync(abs, "utf-8");
    if (onDisk !== f.content) drift.push(`differs: ${f.relPath}`);
  }
  // Stale files: anything under a build-owned tree not in the expected set.
  for (const sub of OUTPUT_TREES) {
    const dir = join(root, sub);
    if (!existsSync(dir)) continue;
    walkFiles(dir, root, (rel) => {
      if (rel.endsWith(".gitkeep")) return;
      if (!expected.has(rel)) drift.push(`stale: ${rel}`);
    });
  }
  return drift;
}

function walkFiles(dir: string, root: string, cb: (rel: string) => void): void {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) walkFiles(abs, root, cb);
    else cb(abs.slice(root.length + 1));
  }
}

// ----------------------------------------------------------------------------
// Stage 5 — vendor the workspace render (0.5.0+).
//
// Binary-safe (the renderer ships woff2 fonts + png/ico favicons), so it runs
// OUTSIDE the text-based EmittedFile pipeline: a recursive byte-copy with its own
// clean (write) and Buffer-compare drift check (--check). The vendored tree lets a
// harness build the unified portal from the plugin alone, pointing the renderer at
// its bound surfaces (HANDBOOK_ROOT/DASHBOARD_ROOT/CANVAS_ROOT/BRAND_ROOT) and the
// co-located dev-loop graph (GRAPH_ROOT=<plugin>/workspace/graph).
// ----------------------------------------------------------------------------

/** The plugin-relative subtree this stage owns; cleaned + drift-checked on its own. */
const WORKSPACE_TREE = "workspace";

/** Enumerate (absolute source, plugin-relative dest) pairs for the workspace render. */
function workspaceFiles(factoryRoot: string): { src: string; rel: string }[] {
  const pairs: { src: string; rel: string }[] = [];

  // 1. The renderer tree, verbatim (TS + lib/ + vendor/ + brand/ + assets/ +
  //    fixtures/ + package.json). dist/ is build output and never present here.
  const rendererSrc = join(factoryRoot, "workspace", "renderer");
  walkFiles(rendererSrc, rendererSrc, (rel) => {
    pairs.push({ src: join(rendererSrc, rel), rel: join("workspace", "renderer", rel) });
  });

  // 2. The build orchestration alongside the renderer.
  for (const f of ["build.sh", "_headers", "wrangler.jsonc"]) {
    const src = join(factoryRoot, "workspace", f);
    if (existsSync(src)) pairs.push({ src, rel: join("workspace", f) });
  }

  // 3. The dev-loop graph data the graph surface renders: the record + each node's
  //    canonical <id>/<id>.md (the render reads descriptions/goals/doc-body from it;
  //    absent files only degrade the pop-out, but we ship them for the full surface).
  const recordSrc = join(factoryRoot, "graph", "graph-record.json");
  pairs.push({ src: recordSrc, rel: join("workspace", "graph", "graph-record.json") });
  const record = JSON.parse(readFileSync(recordSrc, "utf-8")) as { nodes: Record<string, unknown> };
  for (const id of Object.keys(record.nodes).sort()) {
    const src = join(factoryRoot, "graph", id, `${id}.md`);
    if (existsSync(src)) pairs.push({ src, rel: join("workspace", "graph", id, `${id}.md`) });
  }
  return pairs;
}

/** Write the workspace render into the plugin (clean its tree first). */
function writeWorkspace(factoryRoot: string, pluginRoot: string): number {
  const dest = join(pluginRoot, WORKSPACE_TREE);
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  const pairs = workspaceFiles(factoryRoot);
  for (const { src, rel } of pairs) {
    const abs = join(pluginRoot, rel);
    mkdirSync(dirname(abs), { recursive: true });
    copyFileSync(src, abs);
  }
  return pairs.length;
}

/** --check the workspace render: byte-compare expected files + flag stale ones. */
function checkWorkspace(factoryRoot: string, pluginRoot: string): string[] {
  const drift: string[] = [];
  const pairs = workspaceFiles(factoryRoot);
  const expected = new Set(pairs.map((p) => p.rel));
  for (const { src, rel } of pairs) {
    const abs = join(pluginRoot, rel);
    if (!existsSync(abs)) { drift.push(`missing: ${rel}`); continue; }
    if (!readFileSync(src).equals(readFileSync(abs))) drift.push(`differs: ${rel}`);
  }
  const destRoot = join(pluginRoot, WORKSPACE_TREE);
  if (existsSync(destRoot)) {
    walkFiles(destRoot, pluginRoot, (rel) => {
      if (rel.endsWith(".gitkeep")) return;
      if (!expected.has(rel)) drift.push(`stale: ${rel}`);
    });
  }
  return drift;
}

// ----------------------------------------------------------------------------
// Scripts stage — vendor the tooling scripts (handbook index generator).
//
// The index generator is a tooling script, not a `.claude` primitive (the build
// aborts on `primitive: script`), so it is byte-copied into the plugin like the
// workspace render: self-cleaning dest tree, recursive byte-copy, its own --check
// drift list. The consuming harness's curator overlay invokes the SAME vendored
// generator (parameterized by canon root) so every harness regenerates its index
// with one validated tool.
// ----------------------------------------------------------------------------

/** The plugin-relative subtree this stage owns; cleaned + drift-checked on its own. */
const SCRIPTS_TREE = "scripts";

/** Enumerate (absolute source, plugin-relative dest) pairs for the vendored scripts. */
function scriptsFiles(factoryRoot: string): { src: string; rel: string }[] {
  return [
    {
      src: join(
        factoryRoot,
        "tooling",
        "sg-handbook-curator",
        "scripts",
        "refresh-index.ts",
      ),
      rel: join("scripts", "refresh-index.ts"),
    },
  ];
}

/** Write the vendored scripts into the plugin (clean its tree first). */
function writeScripts(factoryRoot: string, pluginRoot: string): number {
  const dest = join(pluginRoot, SCRIPTS_TREE);
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  const pairs = scriptsFiles(factoryRoot);
  for (const { src, rel } of pairs) {
    const abs = join(pluginRoot, rel);
    mkdirSync(dirname(abs), { recursive: true });
    copyFileSync(src, abs);
  }
  return pairs.length;
}

/** --check the vendored scripts: byte-compare expected files + flag stale ones. */
function checkScripts(factoryRoot: string, pluginRoot: string): string[] {
  const drift: string[] = [];
  const pairs = scriptsFiles(factoryRoot);
  const expected = new Set(pairs.map((p) => p.rel));
  for (const { src, rel } of pairs) {
    const abs = join(pluginRoot, rel);
    if (!existsSync(abs)) { drift.push(`missing: ${rel}`); continue; }
    if (!readFileSync(src).equals(readFileSync(abs))) drift.push(`differs: ${rel}`);
  }
  const destRoot = join(pluginRoot, SCRIPTS_TREE);
  if (existsSync(destRoot)) {
    walkFiles(destRoot, pluginRoot, (rel) => {
      if (rel.endsWith(".gitkeep")) return;
      if (!expected.has(rel)) drift.push(`stale: ${rel}`);
    });
  }
  return drift;
}

// ----------------------------------------------------------------------------
// Helpers + main
// ----------------------------------------------------------------------------

function fail(msg: string): never {
  console.error(msg);
  process.exit(2);
}

function main(): void {
  const check = process.argv.includes("--check");
  const factoryRoot = resolveRepoRoot();
  const pluginRoot = join(factoryRoot, PLUGIN_SUBDIR);
  if (!existsSync(pluginRoot)) {
    fail(
      `vendor: plugin submodule not found at ${pluginRoot}. ` +
        `Run \`git submodule update --init ${PLUGIN_SUBDIR}\` first.`,
    );
  }

  const build = runBuild(factoryRoot, pluginRoot);

  // Stage 4 — index parity (structural; reads graph-record.json from the factory).
  const parityErrors = checkIndexParity(factoryRoot, build.nodes);
  if (parityErrors.length > 0) {
    console.error("vendor: index parity FAILED (Stage 4):");
    for (const e of parityErrors) console.error(`  - ${e}`);
    process.exit(2);
  }

  // G2 — load-verify (runs against the in-memory build set, before writing).
  const g2 = loadVerify(pluginRoot, build);
  if (g2.length > 0) {
    console.error("vendor: G2 load-verify FAILED:");
    for (const f of g2) console.error(`  - ${f}`);
    process.exit(1);
  }

  if (check) {
    // G1 freshness gate — primitives (text pipeline) + the vendored workspace render + scripts.
    const drift = [
      ...checkBuild(pluginRoot, build),
      ...checkWorkspace(factoryRoot, pluginRoot),
      ...checkScripts(factoryRoot, pluginRoot),
    ];
    if (drift.length > 0) {
      console.error("vendor --check: committed output is STALE vs a fresh build (G1):");
      for (const d of drift) console.error(`  - ${d}`);
      process.exit(1);
    }
    console.log(
      `vendor --check: clean — committed output matches a fresh build ` +
        `(${build.counts.skills} skills, ${build.counts.agents} agents, ` +
        `${build.counts.refCopies} reference copies + the vendored workspace render). ` +
        `G2 load-verify: pass.`,
    );
    return;
  }

  writeBuild(pluginRoot, build);
  const wsCount = writeWorkspace(factoryRoot, pluginRoot);
  const scriptsCount = writeScripts(factoryRoot, pluginRoot);
  console.log(
    `vendor: emitted ${build.counts.skills} skills + ${build.counts.agents} agents + ` +
      `${build.counts.refCopies} reference copies + ${wsCount} workspace-render files + ` +
      `${scriptsCount} vendored script(s); ` +
      `plugin.json -> ${PLUGIN_VERSION}. Stage 4 parity: pass. G2 load-verify: pass.`,
  );
}

main();
