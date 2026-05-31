---
title: Research report for drift-detector
type: research-report
status: complete
authored: 2026-05-31
last_updated: 2026-05-31
amended: []
sources_lifted: 2
---

# Research report for drift-detector

## Identity

A stateless, read-only agent that scans a bounded set of canon pages for drift and returns a
structured candidate list. Part of the **curator cell** (D40): invoked by `handbook-curator`
(sweep + raise) and by the `specify` dev-sprint stage (amendment-collision scan).

## Sources

1. `tooling/sg-handbook-curator/agents/drift-detector.md` — the factory's own instance (primary;
   lifted near-verbatim, generalised off stack-graph-specific vocabulary).
2. `bc-handbook-curator/agents/drift-detector.md` (Be Civic) — the mature original the tooling
   was modelled on (the seven drift triggers, the `what-belongs` filter step).

## Decisions

- **primitive: agent, mode: autonomous, determinism: generative.** It applies judgment (is this
  real drift or a phrasing nit?) over read pages — generative, isolated, prompt-describable; the
  agent side of the context axis (D24). Returns a digest, not a mutation.
- **Edges.** `composes-into dev-sprint @ specify` (graph-map: specify invokes drift-detector for
  amendment-collision scans). `references what-belongs (on-demand)` — the gate filter it applies
  before emitting a `missing_content`/`ambiguous` candidate. It is *invoked by* `handbook-curator`
  — that structural link is the curator's `invokes` edge, not owned here. No curator/maintenance
  arc node exists yet, so no `composes-into` for that scope (F7) — described in prose.
- **Generalisation.** The trigger for "product-specific terminology that does not belong" is kept
  but stated generally (the harness names its own forbidden vocabulary via overlay), not with
  stack-graph's example list.

## Goals (outcomes)

Drift is surfaced **before it propagates** to a reader who would act on the stale content; and the
candidate list is **precise** (real drift, filtered against `what-belongs`, not phrasing nits).
