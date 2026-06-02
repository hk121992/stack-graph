---
name: sg-vendor-build
description: Dev-time tooling for building the stack-graph plugin — runs the deterministic vendor pipeline that projects the authored graph (graph/<id>/<id>.md nodes + graph/_refs/ references) into the installable .claude plugin (skills/, agents/, references/, plugin.json). The build is a pure function of the graph: four stages — place references (per-consumer copy + host pointer; external refs ship the pointer only), strip+fold graph frontmatter into native .claude fields, place by primitive (skill -> skills/<id>/SKILL.md, agent -> agents/<id>.md), and an index-parity check against graph-record.json. Two gates — G1 idempotency/freshness (re-run is byte-identical; --check fails on drift) and G2 load-verify (native frontmatter valid, every @-import/backtick pointer resolves, no stray graph keys). Run via `bun run vendor` (write) or `bun run vendor:check` (CI freshness gate). Reads as instructions to Claude inside a Claude Code session. NOT a runtime skill shipped to product end-users; it builds what is shipped.
---

# sg-vendor-build

You are operating the `sg-vendor-build` skill. This file is your runtime contract:
the operator (or an agent acting on their behalf) wants the stack-graph plugin
**built** from the authored graph. There is no dispatcher binary and no daemon —
the build is a single deterministic script, `build/vendor.ts`, run via `bun`.
**Your job is to run it, read its gate output, and fix the graph (never the
generated output) until the build is clean.**

This skill builds the factory's shippable artefact. The `sg-` prefix encodes the
dev-time boundary: it is invoked by the operator or by an agent working *on*
stack-graph, never shipped to a product end-user. It pairs with the other
`tooling/` skills — `sg-graph-maintainer` authors the nodes and refs this build
consumes, and `sg-handbook-curator` maintains the spec this build implements.

Authoritative contracts this skill operationalises:

- `handbook/content/03-plugin-spec/README.md` — the build contract (the four
  stages, the strip-set, reference single-sourcing, the frontmatter mapping, the
  verification gate). **This is the source of truth; the script implements it.**
- `handbook/content/02-graph-spec/README.md` — "The node file" and "Storage &
  projection" (what the authored input is, and that files are canonical / the
  graph is a derived lens).

## What this skill is NOT for

- **Not for authoring or editing nodes or references.** That is
  `sg-graph-maintainer`. This build only *reads* `graph/` and *writes* the plugin
  tree. If the build fails because a node is malformed, fix the node via the
  maintainer, then re-run the build.
- **Not for rewriting `graph/graph-record.json`.** The maintainer's `index` mode
  owns the record. This build only **parity-checks** the emitted primitive set
  against it (Stage 4) — it never writes it.
- **Not the handbook render, hooks, or scripts.** Those stages of the plugin
  spec are deferred (see Scope below). This build covers nodes + references only.
- **Not for hand-editing anything under `skills/`, `agents/`, or `references/`.**
  Those trees are *generated*. A hand-edit is drift; `vendor:check` will fail it.
  The fix for unwanted output is always a change to the graph, then a re-build.

## How invoked

The build runs from the repo root via the root `package.json` scripts:

```bash
bun run vendor          # build: write the plugin tree, run G1 (self) + G2
bun run vendor:check    # freshness gate: do NOT write; fail (exit 1) on any drift
```

Equivalently, the script can be run directly: `bun run build/vendor.ts` /
`bun run build/vendor.ts --check`. No install step is needed — bun runs the
TypeScript natively, and the script has **no dependencies** (it parses only the
frontmatter keys it consumes; stripping is line-level).

## Inputs

| Input | Role |
|---|---|
| `graph/<id>/<id>.md` | the 28 node files (15 skill + 13 agent) — the canonical primitives with graph frontmatter |
| `graph/_refs/<id>.md` | the 16 shared references (single-source content) |
| `graph/graph-record.json` | the maintainer-owned record — read-only, for the Stage 4 parity check |
| `.claude-plugin/plugin.json` | the manifest — the build bumps `version` and trims the description |

The node file named after its directory (`graph/<id>/<id>.md`) is the canonical
node; `research-report.md` and `source-material/` in the same directory are
authoring inputs and are **ignored** by the build.

## Outputs

| Output | Holds |
|---|---|
| `skills/<id>/SKILL.md` | built skill nodes (15) |
| `agents/<id>.md` | built agent nodes (13) |
| `skills/<id>/references/<refid>.md` | per-skill reference copies (co-located bundle) |
| `references/<agent-id>/<refid>.md` | per-agent reference copies (plugin-root namespace) |
| `.claude-plugin/plugin.json` | `version` -> `0.1.0`, "Scaffold" tail dropped |

`marketplace.json` is left untouched.

**Why two reference homes.** A skill is a *directory* (`skills/<id>/`), and the
plugin spec explicitly allows supporting files alongside `SKILL.md`, so a skill's
refs sit in its own `references/` and import as `@references/<refid>.md`. An agent
is a *flat* `agents/<id>.md` file with no documented co-located-bundle convention,
and a nested `.md` under `agents/` risks being mis-registered by agent discovery —
so an agent's refs live in a plugin-root `references/<agent-id>/` namespace and are
reached as `../references/<agent-id>/<refid>.md` relative to the agent file. Both
are single-source-**per-consumer** copies (copy, not symlink), so one authored
source re-propagates to every consumer on each build.

## The four stages

The script projects each node file through four deterministic stages (a pure
function of the inputs — no per-build state):

1. **Place references.** For each `references` edge on the node, resolve
   `graph/_refs/<id>.md`, **copy** it into the consumer's bundle, and emit the
   host pointer: an `@`-import for `load: import` (eager, spliced at load) or a
   backtick relative path for `load: on-demand` (read at the step of need). A
   reference marked **`external: true`** (`handbook`, `personas`,
   `experience-contract`, `strategy-canvas`) is **skipped** — the factory ships
   only the body's "follow your `<id>` reference" prose; the harness overlay binds
   the target. The emitted pointers are gathered into an "Imported references" /
   "On-demand references" block appended to the body, sorted by id for stability.
2. **Strip + fold.** Drop the graph-only frontmatter keys
   (`edges`, `mode`, `determinism`, `goals`, `status`, `title`) plus the
   frontmatter group-comment lines; fold `when-to-use` into `description`
   (`… Use when: …`). Derive `name` from `id`. Keep `description`, `model`,
   `allowed-tools`/`tools`, `argument-hint` (passed through verbatim). The result
   is a clean native `.claude` frontmatter in a fixed key order.
3. **Place by primitive.** `skill` -> `skills/<id>/SKILL.md`;
   `agent` -> `agents/<id>.md`. A `script` or `command` primitive **aborts** the
   build (out of scope here — none are expected; the current graph has none).
4. **Index parity check.** Assert the emitted primitive set equals the node set
   in `graph-record.json` and that each primitive agrees. **The record is not
   rewritten** — a mismatch means the record is stale (re-run the maintainer's
   `index` mode) or a node was added/removed without re-indexing.

## The two gates

Both gates run on every invocation (G2 always; G1's freshness arm under `--check`).

- **G1 — idempotency / freshness.** The serialise is deterministic (fixed key
  order, `\n` newlines, a single terminal newline, ascii-stable comparison), so a
  re-run on unchanged source is **byte-identical**. `vendor:check` builds in memory
  and compares against the committed tree: it exits non-zero and lists every
  `differs:` / `missing:` / `stale:` file if the committed output has drifted from
  what the source would now produce. This is the CI gate — built output can never
  silently diverge from the graph.
- **G2 — load-verify.** Each emitted primitive must **load**: native frontmatter
  valid for its own schema (skill and agent both require `name` + `description`),
  **every** emitted `@`-import / backtick pointer resolves to a placed reference
  (resolved relative to the primitive file, following the same `../` Claude would),
  no placed copy is left without a pointer, and **no stray graph key** (`edges`,
  `mode`, `goals`, …, plus folded-away `id` / `when-to-use`) survives in the
  emitted frontmatter. A node that fails G2 fails the build (exit 1) and is not
  shipped.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | success (build written, or `--check` clean) |
| `1` | a gate failed — G1 drift under `--check`, or G2 load-verify |
| `2` | inputs could not be resolved, or a structural invariant broke (a `script`/`command` primitive, a missing non-external reference file, a Stage 4 parity mismatch) |

## Scope (and what is deferred)

**In scope:** 28 nodes (15 skill + 13 agent) + 16 references.

**Deferred (named, not yet built):**

- **Handbook render + the agent-facing `index.json` page-graph** (plugin spec
  "Handbook rendering"). No `handbook-reference` entries exist yet
  (`handbook_reference_count: 0`), so there is nothing to render.
- **Hooks** (`triggers` bindings -> `hooks/`) and **scripts** (`invokes` ->
  `lib/`). No hook or script nodes exist in the graph yet; a `script`/`command`
  primitive currently aborts the build by design.

When those inputs first appear, extend `build/vendor.ts` and this skill together,
and update the spec touchpoints in `03-plugin-spec`.

## How to run it (the loop)

1. **Build.** `bun run vendor`. Read the summary line — it reports the emitted
   counts, Stage 4 parity, and G2.
2. **On a gate failure**, read the listed offenders. **Fix the graph, not the
   output:**
   - G2 stray-key / missing-frontmatter -> fix the node frontmatter (via
     `sg-graph-maintainer amend`), re-run.
   - G2 unresolved pointer -> the body cites a `references/…` path with no backing
     edge, or an edge targets a missing/renamed ref. Reconcile the node's body and
     its `references` edges with the ref that actually exists in `graph/_refs/`.
   - Stage 4 parity -> a node was added/removed without re-indexing, or the record
     is stale. Run the maintainer's `index` mode, then re-build.
3. **Confirm idempotency.** `bun run vendor:check` must exit `0` (byte-identical
   to a fresh build). Run it twice if you want belt-and-braces.
4. **Do not commit from this skill** unless the operator asks. The build writes
   tracked output; landing it is a separate, operator-gated step.

## Hard constraints

- **The graph is the source; the plugin tree is generated.** Never hand-edit
  `skills/`, `agents/`, or `references/` — fix the graph and re-build.
- **The record is the maintainer's.** Stage 4 reads it; this build never writes it.
- **No dependencies, no install.** bun runs the TS natively; the script parses
  only the frontmatter keys it consumes and strips at the line level. Do not add a
  dependency or run any `install`.
- **External references ship as pointers only.** Never fabricate a file for
  `handbook` / `personas` / `experience-contract` / `strategy-canvas`; the harness
  supplies them.
- **Determinism is load-bearing.** Any change to the script must preserve
  byte-identical re-runs (stable key order, fixed newlines, sorted pointer blocks).
  If you change the serialise, re-run `vendor` then `vendor:check` and confirm `0`.

## Cross-references

- `handbook/content/03-plugin-spec/README.md` — the build contract (authoritative).
- `handbook/content/02-graph-spec/README.md` — the node file + storage/projection.
- `tooling/sg-graph-maintainer/SKILL.md` — authors the nodes/refs this consumes.
- `tooling/sg-handbook-curator/SKILL.md` — maintains the spec this implements.
- `build/vendor.ts` — the script itself (the header comment restates this contract).
