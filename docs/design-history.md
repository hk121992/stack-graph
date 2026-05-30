---
title: Design history
status: v0.2.0 — 2026-05-30
---

# Design history

How the stack-graph model was arrived at, theme by theme. The corrections are part of the
record: where a first sketch was wrong, the wrong turn is kept so the reasoning survives.

## A factory, not a product

The starting reframe: rather than hand-tuning one agentic development workflow, **model the
agent operating environment itself as a graph of its primitives, and improve that graph on
evidence through a measured loop**. The general machinery — the graph, the loop, the
instrumentation — is the *factory*; a concrete product is what *runs inside* it. One
project builds the factory; another runs it. This keeps the reusable core separate from any
single product's specifics and lets the devops-improvement work proceed independently of
product work.

## The graph: primitives, not invented types

An early temptation was to coin a node-type vocabulary (orchestrator, worker, reference,
template, resolver). That was **rejected**: a node *is* a real Claude primitive — a skill,
an agent, a command, a script. Where a thing already has a Claude name, we use it; we don't
maintain a parallel taxonomy that would drift from Claude's own. Three elements suffice:
**node** (owns its own branching/sequencing), **edge** (a typed relationship), and
**inline** (small references and MCP calls that need neither). The graph is **cyclic** —
loops are first-class — but only the process edges (`precedes`/`can-follow`) may loop; the
structural skeleton stays acyclic.

The unifying realisation came last: **the graph is stored as extra frontmatter on the
canonical `.claude` files themselves.** Claude ignores the unknown keys, so a node file is
simultaneously a working primitive *and* a graph node. There is no separate graph database;
the record is *scanned* from the files. "The graph is a derived lens, not a store" became
literally true.

## The workflow shape, and a correction

The first sketch put the human "at the start and end only, with an autonomous middle." That
was **wrong, and corrected**: the design and context-alignment **front** is the *thick*
collaborative part — it runs in rounds and, on a new problem, can take days; getting context
aligned up front is the dominant success factor. **Autonomy belongs to the build**, which
runs long between *plan-defined breakpoints*. Collaboration then returns to **close** the
loop (review, debrief). This is why collaborative steps are **skills** and autonomous steps
are **agents**: the boundary is simply where the operator is in the loop.

## The design method

Design is not "auto-decide everything." The method is: **surface all the design questions
first, classify which are load-bearing** (they drive everything else), **resolve those
collaboratively** (in as many rounds and as much depth as each deserves), and **auto-decide
the rest**. The collaborative core is an *outcome-focused* one — walk the operator through
scenarios, ask what outcome they want in each, and derive the architecture and build
decisions from those outcomes rather than asking them to make technical choices.

## Composition across a tree

A single vendored factory graph composes with local customisation down a directory tree.
The mechanism was grounded in Claude's *actual* cascade, which turns out to be **partial**:
skills and `CLAUDE.md` cascade (up the tree, and lazily down); **agents, hooks, and settings
do not nest**. So the rule is **ride the cascade where it works, and generate a composed
view where it doesn't** — the per-directory scoped view is produced at a **runtime
preamble**, and a single **global record** is generated across all directories for
administration and analytics. Local customisation is an **additive overlay**: a harness
attaches its own nodes to the vendored graph via an entry node or an edge, and the vendored
graph is **never mutated**.

## The loop and analytics

Each node declares **goals as outcomes — not activities — and the metrics that show it earns
its keep**; a reviewer that never changes a diff is then visible and can be cut or merged.
Instrumentation is **deterministic** (a timeline scanned from real events), reserving model
judgment for interpretation. Two improvement loops run: a **factory loop** (a consuming
workspace raises general improvements as PRs to stack-graph) and a **harness loop**
(product-specific improvements stay local). Decisions are kept in **two layers** — a curated
decisions store of conclusions over a recall substrate (e.g. gbrain) of the surrounding
reasoning; curation and recall are different jobs.

## The build approach

Node files are produced by **hybrid generation**: an agent *synthesises* a node's canonical
from a durable **research-report** (the expensive curation that survives format churn), and
deterministic **resolvers** inject the shared blocks every node needs (instrumentation,
schemas, preamble). The render is **idempotency-gated** so the built output cannot drift
from its source. The two halves are drawn from prior art — a research-report→canonical
authoring lifecycle (`bc-corpus-creator`) and a template-plus-resolver skill generator.

## Tooling first

Before authoring any graph content, the **dev tooling** is stood up: a **maintainer** that
authors and maintains nodes, and a **curator** that maintains the handbook. They are kept
separate from the vendored output and marked with an `sg-` prefix, so dev-time tooling is
never confused with shipped, namespaced nodes.

## Completing the specs

With the conceptual core settled, the five remaining stub sections were authored. The pass
turned on a **discipline correction**: the handbook is the surface every agent reads
constantly, so it carries only the *resolved* model — no decision trails, no "open questions"
sections, no per-page `status:` line. The *why* and the alternatives weighed live in these
`docs/`. This matched stack-graph to the Be Civic authoring discipline and pulled the
authoring guide (`00-overview/01-authoring.md`) up from a stub to the canonical reference the
curator points at. (Node files still version themselves with `status:` — a node is a
different surface from a handbook page.)

Two customisation/observability questions were resolved by their **outcome**, not their
mechanism. Overlay power: **extend-only** — a harness may add nodes and edges into the
vendored graph but never shadow or re-route a vendored node, so the vendored graph behaves
identically everywhere and there is nothing to resolve. Analytics scope: **local-only** —
events never leave the workspace; the factory stays blind to a consumer's usage by
construction, and cross-workspace learning flows only as curated factory-loop PRs.

The mechanisms then followed from the locked decisions. The **build** is four deterministic
stages — resolve, strip, place, index — idempotency-gated so packaged output cannot drift
from the node files. **Instrumentation** is a build-injected preamble plus hooks, emitting
id-bound events to a local log; conformance is the observed traversal checked against a
workflow's process edges. **DevOps** fixed the `<kind>/<slug>` branch-and-label model and the
two-loop contribution path, which is itself the exit condition for the bootstrap-direct
interim. The **maintenance-skill** spec documented the contract the already-built
`sg-graph-maintainer` answers to, rather than inventing a second one.
