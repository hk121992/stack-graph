---
title: Concepts
type: reference
read-when: You need the shared mental model before reading any spec.
related: [graph-spec, decomposition, harness-spec, overview]
status: v0.1.0 — 2026-05-30
---

# Concepts

The shared mental model. stack-graph models an agent operating environment as a **graph
of Claude primitives** and the **workflows** that traverse them, then **improves that
graph on evidence** through a measured loop. This page fixes the vocabulary every spec
below depends on.

## Primitives

The nodes of the graph are real `.claude` elements — the Claude Directory taxonomy,
nothing invented: **skills, agents** (subagents), **slash-commands, hooks, settings,
output-styles, CLAUDE.md / memory, MCP servers**. Where a thing already has a Claude
name, we use it; we do not coin node-type vocabulary. A node *is* a primitive.

Storage is canonical `.claude`-compatible files. **The graph is a derived lens over those
files, not a separate store** — the same file serves the renderer (the authoring/review
view) and the plugin-builder (the vendored output).

## Node, edge, inline

Not everything is a node or an edge. Three-way distinction (the discriminator lives in
[decomposition](../07-decomposition/)):

- **Node** — a primitive that owns its own branching and sequencing (a skill, an agent).
  Addressable and instrumented.
- **Edge** — a typed relationship between nodes: `loads`, `invokes`, `composes-into`,
  `references`, `precedes` / `can-follow`, `overlay`. Directed unless noted.
- **Inline** — small references and MCP calls that live in a node's body, not worth a
  node or edge of their own. (Precedent: the Be Civic corpus inline tags.)

## Workflow

A **workflow is a named, possibly-cyclic traversal over nodes** — the unit of work the
operator invokes.

- It is expressed by **process edges** (`precedes` / `can-follow`) over nodes; branches
  are conditional process edges; **loops are first-class** — the graph is cyclic, not a
  DAG. Structural edges (`loads`, `composes-into`) stay acyclic; only process edges loop.
- A workflow is not a new primitive. Its **stages** — for the dev sprint: align context,
  design, specify, plan, build, review, reconcile, debrief — are spans of the traversal,
  named for navigation, not a fourth element beside node/edge/inline.

## Collaborative vs autonomous

The load-bearing distinction that decides **which primitive a node is**:

- **Collaborative** step — engages the operator (questions, decisions, sign-off) → a
  **skill**.
- **Autonomous** step — runs unattended to a result → an **agent**.

As a rule the collaboration is front-loaded (aligning intent and design, which can take
rounds and, on a new problem, days) and returns to close (review, debrief); the long
autonomous spans are the build. A node declares its collaborative/autonomous nature; that
declaration drives its primitive and how it is instrumented.

## The loop

stack-graph does not just model the graph — it improves it, on evidence.

- Every node declares **goals (outcomes, not activities) and the metrics that show it
  earns its keep**; runs are instrumented deterministically (see [analytics](../06-analytics/)).
  A node that never changes an outcome is visible and can be cut or merged.
- The cycle: **instrument → review → reconcile → amend the graph.** Findings and decisions
  feed back into the next traversal.
- **Two loops:** the **factory loop** — a consuming workspace raises general improvements
  as PRs *to* stack-graph — and the **harness loop** — product-specific improvements stay
  local. See [devops](../08-devops/).
- **Decisions are two-layer:** a curated **decisions store** (authoritative conclusions)
  over a **gbrain** recall substrate (the surrounding transcripts and reasoning). Curation
  and recall are different jobs; both are kept.

## Composition — factory and overlay

How one graph composes across a directory tree (mechanics in [harness-spec](../04-harness-spec/)):

- The factory vendors **one global graph** as a plugin; a consumer **never mutates** it.
- A harness **overlays** local modules in the same format, attaching to the global graph
  by adding an **entry node or an edge** — additive only.
- A directory sees the global vendored graph **+** its ancestors' overlays **+** its own.
  The **scoped view is generated at runtime** (a preamble), because it depends on the
  working directory; a single **global record** is generated across all `.claude`
  directories for administration and analytics only.

## Generality stance

Dev is the **first** process domain stack-graph models, not the only one (Q7 guardrail):

- The core abstraction — **primitives, typed edges, workflow-as-cyclic-traversal, the
  loop** — names nothing about software.
- Domain lives only in **nodes and edges** (a "run the tests" node, a "PR" edge), never in
  the graph or loop machinery. A non-dev domain drops in by supplying its own nodes. **If
  anything in the core mentions code, tests, or commits, that is a bug in the
  abstraction**, not a feature.
