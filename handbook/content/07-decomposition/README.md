---
title: Decomposition principles
type: reference
read-when: Deciding how to break an arc into nodes, edges, and inline elements.
related: [graph-spec, maintenance-skill, concepts]
---

# Decomposition principles

How to break an arc into the graph: what becomes a node, what becomes an edge, what stays
inline, and where the boundaries fall. Adapted from the Be Civic corpus authoring rules
(they transfer; the inversions are noted).

## Node, edge, or inline

The discriminator (from the corpus `skill-vs-path.md` branching test):

- **Node** — it owns its **own branching and sequencing**. Give it a step that decides
  between alternatives or runs an ordered procedure, and it is a unit of its own.
- **Edge** — it is merely **reached or invoked** by another node, with no independent
  control flow of its own. Model the relationship, not a node (`loads`, `invokes`,
  `composes-into`, `references`).
- **Inline** — a one-shot reference, an **MCP call**, or an **execution surface** (a
  headless browser, a worktree) in a node's body. Worth neither a node nor an edge — it has
  no control flow; the node calling it owns the judgment. Ride a native primitive where one
  exists (e.g. `isolation: 'worktree'`) rather than building a node for it. An edge appears
  only when the thing invoked is itself node-like (a script with its own logic →
  an `invokes` edge).

## Node anatomy

A node is a single canonical markdown file (`canonical-shape.md`): **graph frontmatter**
(the typed edge arrays) **+ an imperative body + inline tags**. The one file is
**dual-consumer** — it renders in the authoring/review view and builds into the vendored
plugin. Keep the frontmatter the structural truth; keep the body the instructions.

Voice is imperative (`voice-and-style.md`), with one inversion from the corpus:
stack-graph nodes are **operator/dev-internal, so internal references are allowed** — the
opposite of the customer-facing corpus rule.

## Skill or agent — the context axis

Once a span is a node, **context** picks the primitive (see [concepts](../01-concepts/)): a
**skill** loads into the *current* context (use when the step needs the live main thread);
an **agent** runs in an *isolated* context and returns a summary (use when the work does not
benefit from the main thread, is describable in a prompt, or is parallelizable). They
compose — a skill can dispatch agents; an agent can preload skills. Collaborative-vs-
autonomous is the usual correlate, not the rule. Decide this at decomposition time; it
changes the node's contract and its instrumentation, not just its label.

## Granularity — the sizing rule

Decompose a span into its own node when **any** of these hold (adapted from the Be Civic
granularity rule):

- **Reuse** — it is referenced by **≥2 consumers** (extract it; define once).
- **Cohesion** — it is **self-contained with its own branching** (a distinct, cohesive unit).
- **Just-in-time** — a consumer needs only **part** of it (split so each consumer pulls only
  what it needs).

Keep it **inline** when it is **used once and trivial** (≤2–3 simple actions, no independent
goal). **Flatten** deep recursion — decompose by *need*, not by aesthetic. A different
collaborative/autonomous (context) nature is also a split signal.

Granularity is **two-view** (see [graph-spec](../02-graph-spec/)): the authoring view may
treat a skill's **modes** as nodes; the render collapses or expands them. Cut by the rule
above; let the render decide the file shape.

## Let goals draw the boundary

A node must have a **stated outcome and a way to measure it** (the loop, see
[analytics](../06-analytics/)). Use that as a decomposition test: if you cannot say what a
candidate node *achieves* and how you would know it earned its keep, the boundary is in the
wrong place — widen or narrow it until the node has a measurable job. Boundaries chosen this
way are the ones the loop can later evaluate, merge, or cut.

## Stay process-agnostic

The discriminator and the anatomy name **structure, not domain**. "Owns its own
branching," "reached or invoked," "measurable outcome" hold for any process. Resist
baking dev-specifics (code, tests, commits) into the decomposition rules themselves —
those belong in the dev-domain *nodes*, never in how nodes are *cut*. If a decomposition
rule only makes sense for software, it is mis-stated.
