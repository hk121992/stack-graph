# stack-graph — project root

`stack-graph` is **the factory**: a general, process-agnostic system that models an
agent operating environment as a graph of its `.claude` primitives (skills, agents,
references, scripts, settings, hooks, MCP) and the workflows that traverse them, then
instruments and improves them via a PR-gated loop. A product is what **runs inside** the
factory — this repo is not the product, and stays general.

## Status: scaffold (pre-spec)

The handbook skeleton exists; the specifications are being authored. Treat every
`handbook/content/<section>/README.md` as a stub that states the section's purpose and
**parks the open questions it owns**. Do not assume a spec is settled until its section
says so.

## Handbook is canonical

`handbook/content/` is the canonical reference for what stack-graph is and how it's
built. **Read `handbook/content/index.json` at task start** — it lists every page with a
`read-when` hint and `related[]` edges — then read the sections relevant to your task.

| Section | Read when |
|---|---|
| `00-overview` | Orienting; how to navigate; how to author/maintain handbook pages |
| `01-concepts` | The mental model — primitives, the graph, processes, the loop, generality |
| `02-graph-spec` | The node/edge/inline model, cyclic semantics, the node schema |
| `03-plugin-spec` | Packaging, the handbook→plugin build/vendor pipeline, install |
| `04-harness-spec` | What a harness is; the additive local-overlay customisation model |
| `05-maintenance-skill` | The `sg-graph-maintainer` skill (modelled on bc-corpus-creator) |
| `06-analytics` | Instrumentation (preamble/hooks), conformance, the transcript baseline |
| `07-decomposition` | Principles for decomposing a process into the graph |
| `08-devops` | How stack-graph develops itself; PR discipline; the two loops |

## Locked design decisions

- **Factory / product split.** General here; product specifics live in the consuming
  workspace's *harness*, never in this repo.
- **Claude-primitive vocabulary**, not any product's terms. Nodes are real `.claude`
  elements (the Claude Directory taxonomy).
- **Canonical = real `.claude` files** (not gbrain). The graph is the authoring/review
  lens; the plugin is **vendored from the handbook**.
- **Plugin lives in its own repo, mounted as a submodule.** The clean, vendored-only
  plugin is `hk121992/stack-graph-plugin`, mounted at `stack-graph-plugin/`. `build/vendor.ts`
  reads `graph/` from the factory root and writes the plugin tree into the submodule; the
  plugin repo is never hand-edited. Clone with `--recurse-submodules`. (Mirrors be-civic's
  `*-plugin-dev ⊃ *-plugin` pattern, factory = wrapper.)
- **Graph is cyclic** (loops are first-class), not a DAG.
- **Not everything is a node/edge** — MCP calls are typically inline in a node.
- **Customisation = additive local overlay** (entry nodes + connecting edges); the
  vendored graph is never mutated.

## Building the graph — dev tooling

Three dev-time skills live in `tooling/` (kept separate from the vendored plugin in the
`stack-graph-plugin/` submodule) and install by per-skill symlink into `~/.claude/skills/`:

- **`sg-graph-maintainer`** — author and maintain graph nodes. Modes: `new` (gather
  source-material → write research-report → synthesise the canonical node file per
  `02-graph-spec`), `amend`, `validate`, `index`. Nodes are authored under `graph/<id>/`;
  the node file is a valid `.claude` primitive with graph frontmatter — **the graph is
  frontmatter, never a separate store**.
- **`sg-handbook-curator`** — maintain this handbook. Modes: `sweep` (drift scan),
  `raise` (labelled handbook PR), `refresh-index`. Enacts the forcing rule
  (`00-overview/02-maintenance.md`): on drift, raise a PR — never silently continue.
- **`sg-advisory-council`** — a **non-authoritative** methodology-grounding board. Modes:
  `convene` (read a pack's methodology-provenance manifest → dispatch the relevant
  source-custodian advisors — Cagan/SVPG, Osterwalder/Strategyzer, Blank/Customer
  Development — → surface fidelity/gap/grounding/seam findings), `roster`. Critiques **how
  the graph is built and the methodology baked in** — never the product, never gates,
  never auto-applies. Findings are suggestions the operator filters (D48).

Install once (from the repo root):

```bash
ln -s "$PWD/tooling/sg-graph-maintainer" ~/.claude/skills/sg-graph-maintainer
ln -s "$PWD/tooling/sg-handbook-curator"    ~/.claude/skills/sg-handbook-curator
ln -s "$PWD/tooling/sg-advisory-council"    ~/.claude/skills/sg-advisory-council
```

The repo is the source of truth; edits propagate through the symlink. **Contribution:**
during bootstrap, spec + tooling changes land by direct commit to `main`; once
`08-devops` fixes the branch/label model and the curator is exercised, handbook changes
move to labelled PRs via `/sg-handbook-curator raise`.

## Keep it clean

This repo is general and open-source-*able*. Keep product-specific references (paths,
sprint codes, commercial detail) out of it — those belong in the consuming workspace's
private notes, never here.
