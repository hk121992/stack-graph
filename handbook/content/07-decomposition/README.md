---
title: Decomposition principles
type: reference
read-when: Deciding how to break a workflow into nodes, edges, and inline elements.
related: [graph-spec, maintenance-skill, concepts]
status: v0.1.0 — 2026-05-30
---

# Decomposition principles

How to break a workflow into the graph: what becomes a node, what becomes an edge, what
stays inline, and where the boundaries fall. Adapted from the Be Civic corpus authoring
rules (they transfer; the inversions are noted).

## Node, edge, or inline

The discriminator (from the corpus `skill-vs-path.md` branching test):

- **Node** — it owns its **own branching and sequencing**. Give it a step that decides
  between alternatives or runs an ordered procedure, and it is a unit of its own.
- **Edge** — it is merely **reached or invoked** by another node, with no independent
  control flow of its own. Model the relationship, not a node (`loads`, `invokes`,
  `composes-into`, `references`).
- **Inline** — a one-shot reference or an **MCP call** in a node's body. Worth neither a
  node nor an edge. An edge appears only when the thing invoked is itself node-like (e.g.
  a script with its own logic).

## Node anatomy

A node is a single canonical markdown file (`canonical-shape.md`): **graph frontmatter**
(the typed edge arrays) **+ an imperative body + inline tags**. The one file is
**dual-consumer** — it renders in the authoring/review view and builds into the vendored
plugin. Keep the frontmatter the structural truth; keep the body the instructions.

Voice is imperative (`voice-and-style.md`), with one inversion from the corpus:
stack-graph nodes are **operator/dev-internal, so internal references are allowed** — the
opposite of the customer-facing corpus rule.

## Skill or agent

Once a span is a node, its **collaborative/autonomous** nature picks the primitive
(see [concepts](../01-concepts/)): operator-in-the-loop → **skill**; runs unattended to a
result → **agent**. Decide this at decomposition time; it changes the node's contract and
its instrumentation, not just its label.

## Granularity

The recurring choice is **generic-with-branches** (one node that decides between variants
internally) vs **one-node-per-variant**. Prefer generic-with-branches until a variant
earns its own node by having distinct branching, distinct inputs/outputs, or a distinct
goal. Heuristics for the **atomic unit**:

- A node is **atomic** when splitting it would create an edge you would never traverse on
  its own — the halves are only ever run together.
- **Split** when a span owns **distinct branching**, or a **distinct goal you would
  measure separately** (below), or a different collaborative/autonomous nature.

## Let goals draw the boundary

A node must have a **stated outcome and a way to measure it** (the loop, see
[analytics](../06-analytics/)). Use that as a decomposition test: if you cannot say what a
candidate node *achieves* and how you would know it earned its keep, the boundary is in
the wrong place — widen or narrow it until the node has a measurable job. Boundaries
chosen this way are the ones the loop can later evaluate, merge, or cut.

## Stay process-agnostic

The discriminator and the anatomy name **structure, not domain**. "Owns its own
branching," "reached or invoked," "measurable outcome" hold for any process. Resist
baking dev-specifics (code, tests, commits) into the decomposition rules themselves —
those belong in the dev-domain *nodes*, never in how nodes are *cut*. If a decomposition
rule only makes sense for software, it is mis-stated.
