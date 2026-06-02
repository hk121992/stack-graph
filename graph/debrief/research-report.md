---
title: Research report for debrief
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 2
---

# Research report for debrief

## Identity

The loop-close backbone stage — a collaborative `skill` that runs after the live-confirmed
gate advances the carrier to `live`. Debrief orchestrates three fleet agents
(`measure-outcomes`, `capture-learnings`, `log-decision`) to read outcomes back against
the work-item's `outcome_link`, capture durable learnings, and seed the next sprint. It
holds no carrier write-edge and does not advance `lifecycle_state`. The loop closes
through shared authored homes (D38), not through a direct edge to any curator.

## Sources

1. `docs/dev-sprint-backbone-design.md` — the authoritative `### debrief` spec section:
   goal, modes (`measure`/`learn`/`seed-next`), edges, the no-lifecycle-advance rule, the
   PM feedback loop via shared homes (D38), the fleet, and the F7 prose for
   `can-follow land` and `align-context can-follow debrief`.
2. `docs/graph-map.md` — the debrief backbone row ("measure outcomes, capture learnings,
   amend/route, seed next") and the debrief fleet under Shared sub-nodes
   (`measure-outcomes`, `capture-learnings`, `log-decision` with their consumed-by entries).

## Decisions

### Primitive: skill, mode: collaborative, determinism: generative

Debrief is the operator-facing orchestrator of the close. It surfaces outcome verdicts and
learning proposals to the operator, pauses for confirmation of the seed candidate, and
invokes `log-decision` at judgment points. Collaborative and generative — not autonomous,
not deterministic. The autonomous deterministic work is in `measure-outcomes`; the
generative curation is in `capture-learnings`; this node is the dispatcher.

### No carrier write-edge; no lifecycle_state advance

`lifecycle_state` was advanced from `shipped` to `live` by the **live-confirmed gate at
land's exit** — that is the gate's job, not debrief's. Debrief reads the carrier for
context only; `current_stage` is projected from the traversal; debrief writes nothing to
the carrier. This is consistent with the governed model (D44): no stage holds a write-edge
to the carrier.

### Edges declared

- **`composes-into dev-sprint @debrief`** — formal; target is the arc derived from
  the backbone stages.
- **`invokes measure-outcomes`** — formal; target confirmed at `graph/measure-outcomes/`.
- **`invokes capture-learnings`** — formal; target confirmed at `graph/capture-learnings/`.
- **`invokes log-decision`** — formal; target confirmed at `graph/log-decision/`.
- **`can-follow land` (debrief)** — F7 prose; `land` is being built in the same wave
  but is not yet a resolvable sibling at this node's authoring time. Declared in node body
  as prose; to become a formal `can-follow` entry in the frontmatter at the wiring pass.
- **`align-context can-follow debrief`** — F7 prose; declared in the node body; the
  wiring pass promotes it when both endpoints are confirmed built.

### No edge to product-dashboard-curator or strategy-curator

The loop closes via shared authored homes (D38), not a direct edge. Debrief writes
outcome evidence to the work-item record and decisions to `docs/decisions.md`/recall;
those curators sweep those homes on their own cadence. A direct edge would couple the
sprint's close to the curator's sweep cadence and imply a synchronous handoff that does
not exist. No edge declared; this is a hard design call, not a deferral.

### Fleet sub-nodes are leaf agents; no `composes-into` from them

`measure-outcomes`, `capture-learnings`, and `log-decision` are leaf agents invoked by
debrief. They do not `composes-into` debrief or the arc. Debrief holds the `invokes`
edges; the fleet nodes hold no back-edge. This is consistent with how the graph-map
describes them (all three under "Shared sub-nodes", all three listed as consumed by
`debrief`).

## Goals (outcomes)

The debrief closes the sprint honestly: outcomes are verdicted (not left open), learnings
are captured and routed (not accumulated silently), decisions are logged (not re-derived
next sprint), and the next sprint opens with a grounded seed rather than a blank slate.
The earns-keep across all four goals is compounding — each sprint's debrief builds the
substrate the next sprint reads.
