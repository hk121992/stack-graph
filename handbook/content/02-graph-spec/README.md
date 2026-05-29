---
title: Graph specification
type: spec
read-when: Defining or implementing the node/edge model, the node schema, or storage.
related: [concepts, decomposition, plugin-spec]
status: v0.0.0 — 2026-05-29
---

# Graph specification

**Status: scaffold — spec to be authored.** This is the core; the rest of the system
hangs off it.

## Will cover

- **Node taxonomy** — which `.claude` primitives are nodes (skills, agents, commands,
  hooks, settings, output-styles, CLAUDE.md/memory, MCP), and at what granularity.
- **Edge taxonomy** — typed edges (loads / invokes / composes-into / references /
  precedes-can-follow / overlay), which are directed, and how **cycles** are represented.
- **Inline (non-node/edge) elements** — MCP calls and small references inline in a node
  body (an edge only when invoking something node-like, e.g. a script). Precedent: the
  Be Civic corpus inline tags (`<Skill>`, `<Ref>`, `<VV>`).
- **The node-file schema** — a single canonical markdown file (graph frontmatter +
  imperative body) that serves *both* the renderer and the plugin-builder.
- **Storage** — files are canonical (`.claude`-compatible); the graph is a derived lens,
  not a separate store.

## Open questions this section owns

- **Q1 — node taxonomy + granularity:** one node per skill, or modes/junctions as sub-nodes?
- **Q2 — edge taxonomy + cyclic semantics:** which edges are directed; how cycles are modelled.
- **Q3 — the dual-consumer node schema:** the frontmatter superset that renders *and* builds.

## Adapt from the Be Civic corpus

- `skill-vs-path.md`'s branching test → the **node / edge / inline discriminator**.
- `canonical-shape.md` → **node anatomy** (frontmatter edge-arrays + body + inline tags).
- **Difference:** the corpus graph is a DAG; stack-graph is **cyclic** — keep structural
  edges acyclic, allow process edges (`precedes`/`can-follow`) to loop.
