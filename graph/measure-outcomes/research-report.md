---
title: Research report for measure-outcomes
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 2
---

# Research report for measure-outcomes

## Identity

A deterministic measurement agent — one of the three nodes in the debrief fleet. Invoked by
`debrief` to compute per-work-item and per-node metrics against each node's `earns-keep`
criterion, reading the instrumentation timeline. Returns a structured metrics report; writes
nothing. It is explicitly **not judgment** — its job is to emit numbers and trend points, not
to assess whether an outcome is good. The assessment is the operator's.

## Sources

1. `docs/graph-map.md` — canonical description: "compute per-node metrics vs earns-keep off
   the timeline (deterministic)"; "Measure vs baseline (evidence sources)" cross-cutting
   pattern; listed under Shared sub-nodes, consumed by `debrief`.
2. `docs/dev-sprint-backbone-design.md` — debrief stage spec: "`measure-outcomes` + wave 1";
   "PM feedback (the loop close)": the fleet records outcome evidence to shared homes.

## Decisions

- **primitive: agent, mode: autonomous, determinism: deterministic.** Reads the traversal
  event timeline and the earns-keep declarations, computes metrics, returns a report. No
  operator interaction; fully prompt-describable from the spawn bundle; isolated context
  appropriate. Marked `deterministic` — it runs reads and arithmetic, not generative
  synthesis. (Though LLM-hosted, the *shape* of the operation is deterministic.)
- **Edges.** Leaf agent — no `composes-into`, no `invokes` (no sub-agents it fires). It
  `references decisions-store (on-demand)` to read the `outcome_link` and the earns-keep
  lines for each touched node; `decisions-store` is not yet authored (`_refs/` file absent)
  — F7 prose only until the ref exists. The `instrumentation-preamble` ref (the timeline
  source) is similarly pending. Both edge targets are real per the graph-map; the edges are
  declared in prose here, to become formal edges when their targets land.
- **Consumed by `debrief`.** `debrief` holds the `invokes measure-outcomes` edge. This node
  does not declare a `composes-into` — it is a leaf.
- **Pattern alignment.** Fits the "Measure vs baseline (evidence sources)" pattern
  (`graph-map.md`) — the same shape as `benchmark` / `canary` / `health`: run a target,
  capture numbers, diff against a stored baseline, emit a trend point. Unlike those three it
  is **not crystallizing** (no product-specific manifest): it reads the general graph-record
  earns-keep fields and the instrumentation timeline, both of which are factory-level
  constructs.

## Goals (outcomes)

The debrief ends with **hard numbers** against the earns-keep of each node the sprint
touched — not a narrative summary, not a vibes read. And the trend is compounding: the
next sprint's debrief can compare against this one's output.
