---
title: Research report for capture-learnings
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 2
---

# Research report for capture-learnings

## Identity

A generative curation agent — the second node in the debrief fleet. Invoked by `debrief` to
surface durable learnings from a sprint and route each to the appropriate knowledge home
(recall / curated canon / code-map). Returns a structured proposals list; writes nothing
directly. The learnings that belong in the curated canon are proposed to the handbook curator's
`raise` flow; those that belong in recall are proposed for the `reconcile`/`debrief` write
path (D31).

## Sources

1. `docs/graph-map.md` — canonical description: "curate durable learnings (no-`Skill`
   constraint)"; listed under Shared sub-nodes, consumed by `debrief`. The no-`Skill`
   constraint is explicit: this must be an agent, not a skill — the isolated context prevents
   the live thread from being loaded with every sprint's raw learnings, which is
   indiscriminate. Curation is judgment applied in isolation and returned as a proposal; it is
   not an operator dialogue.
2. `docs/dev-sprint-backbone-design.md` — debrief stage spec: "`capture-learnings` + wave 1";
   "the fleet records outcome evidence + learnings + decisions to their homes (D38)".
   The loop closes through shared authored homes, not a direct curator edge.

## Decisions

- **primitive: agent, mode: autonomous, determinism: generative.** Curation involves judgment
  (is a finding durable? which home does it belong in? is it already recorded?). Prompt-
  describable; isolated context (does not need the live sprint thread). Returns proposals only.
- **No `Skill` (no-`Skill` constraint).** The constraint in graph-map is explicit. A skill
  would load this into the main thread, making every learning visible to the full operator
  context. The agent shape keeps curation isolated and returned as a digest.
- **Edges.** Leaf agent — no `composes-into`. Writes nothing directly so no structural write
  edge. It `references handbook (on-demand, external: true)` — to check whether a proposed
  canon finding is already recorded before proposing it (D41 pattern). It reads the
  decisions-store inline (the `docs/decisions.md` path from the graph-record) to dedup
  before proposing there too; `decisions-store` ref is pending — F7 prose. No `invokes`:
  the write path (to recall via gbrain, to canon via handbook-curator raise) is proposed in
  the return value and enacted at the gate by the appropriate node, not by this agent.
- **Consumed by `debrief`.** `debrief` holds the `invokes capture-learnings` edge. This node
  declares no `composes-into`.

## Goals (outcomes)

Each sprint closes with a **curated proposals list** — learnings the sprint surfaced, classified
by home, checked for duplication, not a raw dump. Curation quality is the earns-keep: a
finding that is already recorded should not reappear; a finding that is genuinely new and
durable should not be dropped.
