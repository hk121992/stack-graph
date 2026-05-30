---
title: Concepts
type: reference
read-when: You need the shared mental model before reading any spec.
related: [graph-spec, decomposition, harness-spec, overview]
---

# Concepts

The shared mental model. stack-graph models an agent operating environment as a **graph
of Claude primitives** and the **arcs** that traverse them, then **improves that graph on
evidence** through a measured loop. This page fixes the vocabulary every spec below
depends on.

## Primitives

The nodes of the graph are real `.claude` elements — the Claude Directory taxonomy,
nothing invented: **skills, agents** (subagents), **commands, hooks, rules, settings,
output-styles, CLAUDE.md / memory, agent-memory, MCP servers**, and native **workflows**.
The taxonomy tracks Claude's own and grows with it — `rules`, `workflows`, and
`agent-memory` are recent additions; `commands` are legacy, folded into the skills
mechanism. Where a thing already has a Claude name, we use it; we do not coin node-type
vocabulary. A node *is* a primitive.

Storage is canonical `.claude`-compatible files. **The graph is a derived lens over those
files, not a separate store** — the same file serves the renderer (the authoring/review
view) and the plugin-builder (the vendored output). A node maps **1:1 to one rendered
primitive** (D34): one node ⟷ one skill / agent / script file. A node's **modes** are
branches in its body, never separate nodes; reuse is a right-sized primitive or a
**reference**, each itself 1:1. The "two views" are two readings of the *same file* (graph
frontmatter + native primitive), not a difference in node count (see
[graph-spec](../02-graph-spec/)).

## Node, edge, inline

Not everything is a node or an edge. Three-way distinction (the discriminator lives in
[decomposition](../07-decomposition/)):

- **Node** — a primitive that owns its own branching and sequencing (a skill, an agent).
  Addressable and instrumented.
- **Edge** — a typed relationship between nodes: `loads`, `invokes`, `composes-into`,
  `references`, `precedes` / `can-follow`, `overlay`. Directed unless noted.
- **Inline** — small references, MCP calls, and **execution surfaces** (a headless browser,
  a worktree) that live in a node's body, not worth a node or edge of their own. Ride a
  native primitive where one exists rather than rebuilding it. (Precedent: the Be Civic
  corpus inline tags.)

## Arc

An **arc is a named, possibly-cyclic traversal over nodes** — the unit of work the operator
invokes. (The term replaces "workflow", which now collides with Claude's native
`/workflows`; see below.)

- It is expressed by **process edges** (`precedes` / `can-follow`) over nodes; branches
  are conditional process edges; **loops are first-class** — the graph is cyclic, not a
  DAG. Structural edges (`loads`, `composes-into`) stay acyclic; only process edges loop.
- An arc is not a new primitive. Its **stages** — for the dev sprint: align context,
  design, specify, plan, build, review, reconcile, land, debrief — are spans of the
  traversal, named for navigation, not a fourth element beside node/edge/inline.
- **Arc vs Claude `/workflows`.** Claude's native `/workflows` is a different thing — a JS
  script that orchestrates subagents. An arc renders to a **skill/command**; native
  workflows are an *optional run-time executor* for an arc's autonomous fan-out, not the
  arc itself.

## Skill or agent — the context axis

The load-bearing distinction that decides **which primitive a node is** is **context**:

- A **skill** loads its instructions into the **current** context — use it when the step
  needs the live main thread (operator questions, decisions, sign-off, shared state).
- An **agent** runs in an **isolated** context and returns only a summary — use it when the
  work does not benefit from the main thread, is describable in a prompt, is parallelizable,
  or should be kept off the thread.

They **compose**: an agent can preload skills; a skill can fork to an isolated context and
dispatch agents. Collaborative-vs-autonomous is the usual *correlate* (collaborative steps
tend to be skills, autonomous ones agents), not the rule. As a pattern the collaboration is
front-loaded (aligning intent and design, which can take rounds and, on a new problem,
days) and returns to close (review, debrief); the long autonomous spans are the build. A
node declares this nature; it drives the primitive and how the node is instrumented.

## The loop

stack-graph does not just model the graph — it improves it, on evidence.

- Every node declares **goals (outcomes, not activities) and the metrics that show it
  earns its keep**; runs are instrumented deterministically (see [analytics](../06-analytics/)).
  A node that never changes an outcome is visible and can be cut or merged.
- The cycle: **instrument → review → reconcile → amend the graph.** Findings and decisions
  feed back into the next arc.
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
  by adding an **entry node or an edge** — additive only. Shared node *families* (e.g. a
  set of review lenses) are extended this way: a product drops in its own family member and
  an edge, never editing the vendored set.
- A directory sees the global vendored graph **+** its ancestors' overlays **+** its own.
  The **scoped view is generated at runtime** (a preamble), because it depends on the
  working directory; a single **global record** is generated across all `.claude`
  directories for administration and analytics only.

## Generality stance

Dev is the **first** process domain stack-graph models, not the only one (Q7 guardrail):

- The core abstraction — **primitives, typed edges, arc-as-cyclic-traversal, the loop** —
  names nothing about software.
- Domain lives only in **nodes and edges** (a "run the tests" node, a "PR" edge), never in
  the graph or loop machinery. A non-dev domain drops in by supplying its own nodes. **If
  anything in the core mentions code, tests, or commits, that is a bug in the
  abstraction**, not a feature.
