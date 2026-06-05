---
title: Concepts
type: reference
read-when: You need the shared mental model before reading any spec.
related: [graph-spec, decomposition, harness-spec, overview, analytics, analytics/recall-substrate]
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
primitive**: one node ⟷ one skill / agent / script file. A node's **modes** are
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
  `references`, `maintains`, `precedes` / `can-follow`, `overlay`. Directed unless noted.
- **Inline** — small references, MCP calls, and **execution surfaces** (a headless browser,
  a worktree) that live in a node's body, not worth a node or edge of their own. Ride a
  native primitive where one exists rather than rebuilding it.

## The reference layer

Shared content is a **reference** — a single-source native artefact a node depends on,
never an injected block. References come in two **kinds**:

- A **standard reference** — operational content (a schema, a protocol, a checklist) that
  nodes consume but that is not, on its own, operator-facing.
- A **handbook-reference** — canonical, top-level "how the system works" content that
  *also* renders into the handbook for an operator to review.

The **handbook is the rendered union of the handbook-references** — one navigable, numbered
artefact — composed from the **vendored** (factory) entries plus a harness's **local**
entries, each tagged by **ownership**. Factory entries are **dominant and read-only** to a
harness: a local entry may only **extend** a factory topic (add to it), never redefine or
contradict it, and that boundary is enforced, not advised. Every reference is itself a 1:1
artefact (one file) depended on via a `references` edge; a handbook-reference is kept current
by the nodes that hold a **`maintains`** edge into it. The mechanics — kinds, ownership,
`extends`, the `maintains` edge, numbering, and how the union renders — are in
[graph-spec](../02-graph-spec/) and [harness-spec](../04-harness-spec/).

## Zone matrix

A **zone matrix** is a **lens** over a product (it *examines*; it does not traverse — it is not an
arc). It crosses two axes and reads the product at their intersections:

- **Verticals** — the product's **customer-facing experiences** (the end-to-end journeys a user
  lives through). Verticals are **product-owned**: how the product is *experienced*.
- **Horizontals** — the product's **architecture layers** (the technical strata a change cuts
  across). Horizontals are **engineering-owned**: how the product is *built*.
- A **zone** (a cell) is the **intersection** of one vertical and one horizontal — one experience
  as it lands in one layer. A zone is **derived, not authored**: the region of the
  [code-map](../06-analytics/) where a vertical's scope and a horizontal's scope overlap, resolved
  at read time, never a stored grid.

The axes are **references**, not new node kinds: each axis entry names its scope and points at the
contract/spec that governs it; a rule attaches to part of the matrix by *referencing* the axis
entries it concerns ([graph-spec](../02-graph-spec/)). The axes are **harness content** — a
product's experiences and layers are product-specific ([harness-spec](../04-harness-spec/)).

**The vertical is the unit of work, ship, and test; the cell is the unit of rule-resolution.**
Because the experience is the governing goal, an agent reasons **down a column** — one vertical
across the horizontals it touches — holding the UX as the end, tracing the path and cross-layer
dependencies, resolving each cell's rules as it goes. A change is built across a column and
**graded by the column's experience test** (the per-vertical UX test, [analytics](../06-analytics/)).
A too-large column splits into **thinner verticals, never horizontal layers**.

**Two-tier testing — a forward reference, not built here.** Cheap **per-cell unit checks** sit
under a single **governing per-vertical UX test**. The factory leaves this a **seam**: the testing
layer is **input-gated** and realised in a harness, not the factory.

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
- **Reserve "arc" for the traversal.** A function or concern that relates to an arc without
  being one is named for *how* it relates: a continuous **loop** (it maintains state, not a
  start-to-finish pass), a **coupling** (it feeds and reads an arc at points), a **thread**
  (it spans an arc's stages), or a **lens** (it examines, it does not traverse). These attach
  to arcs; they are not new arcs.
- **Arc vs Claude `/workflows`.** Claude's native `/workflows` is a different thing — a JS
  script that orchestrates subagents. An arc renders to a **skill/command**; native
  workflows are an *optional run-time executor* for an arc's autonomous fan-out, not the
  arc itself.

## Carriers and gates

Work travels an arc as a **carrier** — a work-item that holds its own **state**, not a
single scalar position. A carrier records its **lifecycle state** (where the work is in its
life — proposed, in flight, delivered, parked, …), its **current stage** in the arc while in
flight, any **decomposition** into child work-units (one parent fans out into the units that
implement it, each with its own stage), the **gate decisions** it has passed, and a
**transition history**. That structure is what lets an arc loop, re-enter, skip, fan out, or
abandon work without losing the thread — a scalar "stage" cannot represent any of those.

A **gate** is a go/no-go transition on a carrier, recorded as a **decision** — the call, who
made it, when, the evidence it rested on, and any conditions or override. Gate rigour is set
by a **maturity × tier dial**: a per-process **maturity** posture sets the *default* evidence
bar, and a per-item **tier** overrides it (a high-risk item is gated hard even in an early,
low-rigour process; a routine item fast-tracks even in a mature one). The carrier, its
stages, and what each gate weighs are **domain** — the schema is general
([graph-spec](../02-graph-spec/)); a delivery process's work item is one carrier.

### Two loops by weight

A heavyweight loop is not the only shape. Alongside the full traversal — front, carrier,
several gates, debrief — a **lighter loop** runs a single, already-understood vertical slice:
no design fork to settle, no decomposition, deliverable on its own. The light loop *is* a
loop instance of the same machinery, not a separate system. Its carrier is a **carrier-lite**
— a minimal lifecycle and **one** gate — and that gate instances the same gate model run at
**minimum rigour** on the maturity × tier dial. Choosing wholesale versus incremental is a
**routing decision over the same loop machinery**, not a fork into a second one: an
understood single slice takes the light path; a change that needs a design decision, splits
into more than one slice, or belongs on the strategic surface takes the full one. The
carrier-lite is stored off the strategic work-ledger, in its own surface; its instance shape
is the [graph-spec](../02-graph-spec/) carrier-instance variant.

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

## Experience

A product built in the factory is itself an **agent operating environment**, so verifying it
behaves as intended is the same kind of problem the factory solves for itself. The
**experience thread** runs personas and scenarios against the **probabilistic** product and
grades two dimensions:

- **UX** — the **output** the product produces, against an intended **experience contract**
  (the invariants and failure modes the experience must hold).
- **AX (agent experience)** — the product agent's own **traversal**: the tools it reaches
  for, the friction it hits, and the **tokens and latency to the outcome** (the optimisation
  target is the same outcome for fewer tokens, faster).

AX measurement is the **same traversal instrumentation the factory runs on its own graph**
([analytics](../06-analytics/)), pointed at the product. Experience testing is *verification*
— does the built thing behave? — distinct from deciding *what* to build. Detail:
[decomposition](../07-decomposition/).

## Composition — factory and overlay

How one graph composes across a directory tree (mechanics in [harness-spec](../04-harness-spec/)):

- The factory vendors **one global graph** as a plugin; a consumer **never mutates** it.
- A harness **overlays** local modules in the same format, attaching to the global graph
  by adding an **entry node or an edge** — additive only. Shared node *families* (e.g. a
  set of review lenses) are extended this way: a product drops in its own family member and
  an edge, never editing the vendored set. The same **extend-only** discipline governs the
  reference layer: local handbook-references extend vendored ones, never replace them.
- Because every locally-authored element lives in the single org-root `.claude`, there
  is nothing to merge per directory — no scoped or composed view is generated. A single
  **global record** is generated across `.claude` for administration and analytics only.

## Generality stance

Dev is the **first** process domain stack-graph models, not the only one:

- The core abstraction — **primitives, typed edges, arc-as-cyclic-traversal, carriers and
  gates, the reference layer, the loop** — names nothing about software.
- A consuming workspace's **functions** (engineering, product, marketing, …) are
  **processes over the graph** — an arc, a continuous loop, a coupling, a thread, or a lens —
  never new primitives. A function drops in by supplying its own nodes, references, and
  edges; its methodology (how *that* function works) is a **pack**, not core doctrine.
- Domain lives only in **nodes, references, and edges** (a "run the tests" node, a "PR"
  edge), never in the graph or loop machinery. **If anything in the core mentions code,
  tests, commits, or a particular method, that is a bug in the abstraction**, not a feature.
