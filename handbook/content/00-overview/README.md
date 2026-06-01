---
title: stack-graph handbook
type: index
read-when: Orienting to stack-graph — what it is and how this handbook is organised.
related: [concepts, graph-spec, devops, overview/authoring, overview/maintenance, plugin-spec]
---

# stack-graph handbook

stack-graph is **the factory**: a general, process-agnostic system that models an agent
operating environment as a graph of its `.claude` primitives and the arcs that
traverse them, then instruments and improves them through a PR-gated loop. A product is
what *runs inside* the factory.

The model is specified; node authoring is the next phase. The *why* behind each decision
lives in [`docs/`](../../../docs/) — the handbook states the resolved model, not its
derivation ([`01-authoring`](01-authoring.md)).

## How to navigate

Read [`index.json`](../index.json) first — it lists every page with a `read-when` hint
and `related[]` edges. Then read the sections relevant to your task.

## Sections

- **01-concepts** — the mental model: primitives, the graph, processes, the loop, generality.
- **02-graph-spec** — node/edge/inline taxonomy, cyclic semantics, the node schema, storage.
- **03-plugin-spec** — packaging, the handbook→plugin build/vendor pipeline, install.
- **04-harness-spec** — what a harness is; the additive local-overlay customisation model.
- **05-maintenance-skill** — the `sg-graph-maintainer` skill that authors and maintains the graph.
- **06-analytics** — instrumentation (preamble/hooks), conformance, the transcript baseline.
- **07-decomposition** — principles for decomposing a process into the graph.
- **08-devops** — how stack-graph develops itself; PR discipline; the two loops.

## First principles (locked)

- Factory ≠ product; this repo stays general.
- Nodes are real `.claude` primitives (Claude Directory taxonomy), not any product's terms.
- Canonical = real `.claude` files; the graph is the authoring/review lens; the plugin is
  vendored from the handbook.
- The graph is cyclic. Not everything is a node/edge (MCP calls are usually inline).
- Customisation is an additive local overlay; the vendored graph is never mutated.
