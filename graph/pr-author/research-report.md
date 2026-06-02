---
title: Research report for pr-author
type: research-report
status: complete
authored: 2026-05-31
last_updated: 2026-05-31
amended: []
sources_lifted: 2
---

# Research report for pr-author

## Identity

A stateless agent that composes the PR description — the proposal surface — for a canon change,
per the `pr-description-shape` and the `what-belongs` gates. Returns the body as a string; writes
nothing. Part of the curator cell (D40); also a shared sub-node used by the `specify` and
`reconcile` dev-sprint stages.

## Sources

1. `tooling/sg-handbook-curator/agents/pr-author.md` — primary; lifted and generalised.
2. `bc-handbook-curator/agents/pr-author.md` — the mature original (the section shape, the
   "recommendation not question", the 300-word bar).

## Decisions

- **primitive: agent, mode: autonomous, determinism: generative.** Synthesises prose from settled
  inputs — judgment, isolated, prompt-describable. Returns a string; does not open the PR (the
  dispatcher does) and does not compose the title.
- **Edges.** `composes-into dev-sprint @ specify` and `@ reconcile` (graph-map: both stages use
  pr-author for their spec/reconcile PRs). `references pr-description-shape (on-demand)` and
  `what-belongs (on-demand)` — the shape it fills and the gate it refuses violations against.
  Invoked by `handbook-curator` (raise) — the curator owns that `invokes` edge.
- **Refusal contract preserved.** If an input edit violates a gate (inferable / unresolved content
  in a body), it returns an error object rather than authoring — lifted from both sources.

## Goals (outcomes)

The PR description is a **sufficient proposal** — the operator decides without reading the diff or
asking follow-ups; and it stays **terse** (under the word bar, no diff-restatement, no filler).
