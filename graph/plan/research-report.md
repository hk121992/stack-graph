---
title: Research report for plan
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 2
researcher_adequacy_note: |
  Sources are docs/dev-sprint-backbone-design.md (§ plan — goal, modes, edges, carrier
  handling) and docs/graph-map.md (the plan backbone row, the Lens family section, and the
  Lens-consumer invariant). These are the authoritative design docs; no source-material/
  directory is needed. Edge targets verified on disk: explore, IU-schema, lens-dispatch,
  findings-schema, severity-scale, confidence-anchors all exist. Process neighbours
  (specify, build) do not yet exist — those edges are deferred per F7. The primitive/mode
  decision is clear: operator-in-loop planning is collaborative. Goals were framed as
  measurable outcomes with earns-keep thresholds. Recommendation: synthesise directly.
---

# Research report for plan

## Identity

**Candidate id:** plan

**Candidate title:** Plan

**Scope:** The `plan` backbone stage of the dev-sprint arc. It takes a settled design +
spec amendment and produces a staged, dependency-annotated plan — one implementation unit
per buildable child workstream. It teaches planning principles, dispatches the lens family
over the plan doc (sequential, plan-review), and holds the operator in the loop throughout.
It does NOT write the carrier (no write-edge per D44); the `children[]` field is populated
by the curator and/or projected when build spawns child work-units.

## Goals

| outcome | metric | earns-keep |
|---|---|---|
| A staged, dependency-annotated plan is produced before build — rework from unsequenced or under-specified work trends down. | Build-stage rework events traced to planning gaps (missing deps, wrong sequencing, thin acceptance criteria) per sprint. | Build-stage planning-rework stays below the pre-plan baseline over N sprints; if plan never lowers it, the stage is cut or restructured. |
| Each implementation unit carries a complete IU-schema record — goal, files, dependencies, acceptance, size — so build can operate autonomously without re-asking what plan already settled. | Share of IUs entering build with all five IU-schema fields populated; build-stage "what does this IU mean?" re-asks per sprint. | Re-ask rate trends toward zero; a routine re-ask is a plan quality gap, flagged at lens review. |
| Planning principles are taught in-session — the operator leaves with an understanding of how the plan was sequenced and why. | Operator-acknowledged understanding of the sequencing rationale; downstream re-planning traced to a principle the operator didn't understand at plan time. | Downstream re-planning from misunderstood sequencing trends toward zero over N sprints. |
| The plan is checked by the lens family before advancing — plan-level risks surface here, not at build. | Share of plan sessions where the lens family surfaced ≥1 actioned finding; risks left unexamined at plan that bit at build. | Plan-stage lens findings measurably displace later build/review findings; a lens pass that routinely surfaces nothing real is a tune/cut signal. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** Planning is operator-in-loop: the operator holds the context on intent,
priorities, and constraints that no autonomous pass can substitute. The skill loads into
the current context; the operator reviews and approves the plan before build. Autonomous
is wrong — the commit-to-build gate sits right after plan, and the plan artefact feeds
it. Collaborative is the only honest mode.

**`determinism:`** `generative`

**Rationale:** Decomposing a design into a dependency-annotated IU breakdown, sequencing
workstreams, and dispatching the lens panel all require generative judgment. The output
(the plan doc) is not computed from fixed inputs — it is synthesised from design docs,
spec touchpoints, context, and the lens findings.

## Contract

**Input:** The carrier (for `lifecycle_state`, prior history, objective, parent/child
decomposition — read-only), the settled design doc and spec amendment from `specify`, an
optional mode token (`compose` / `deepen` / `re-plan`), and any re-entry context (in
`re-plan` mode, the prior plan doc + the build-stage signal that triggered re-entry).

**Output:** A **plan doc** on a harness surface — an ordered set of implementation units
each conforming to the IU-schema (id, goal, files, dependencies, acceptance, size), with
explicit sequencing rationale and dependency annotations. The ranked lens findings over
the plan doc are surfaced and actioned in-session. No carrier write.

## Source inventory

| file | status | notes |
|---|---|---|
| `docs/dev-sprint-backbone-design.md` | keep | Primary source — the plan section, carrier model, gates, F7 seams |
| `docs/graph-map.md` | keep | Plan row in backbone table, lens-consumer invariant, lens family |

## Keep / Drop

**Kept (absorbed into body):**
- The three modes: `compose` (default), `deepen` (hard/novel), `re-plan` (loop re-entry from build)
- Carrier read-only contract (D44): plan reads the carrier; it does NOT write it
- Lens-consumer invariant: hold finding-contract refs (`findings-schema`, `severity-scale`, `confidence-anchors`, `load: import`) + `lens-dispatch` (`load: on-demand`); dispatch with `target: plan` sequential (strategy-first, then parallel)
- `invokes explore` — for context gaps in the plan phase
- `references IU-schema (import)` — the plan↔build field contract
- F7 prose: `can-follow specify` and `precedes build` (process neighbours do not yet exist on disk)
- F7 prose: `plan can-follow build` (the re-plan loop — build does not yet exist)
- The earns-keep for the commit-to-build gate: the plan is what the gate decides against; plan earning its keep means the gate approves more plans and fewer re-plans

**Dropped (out of scope):**
- The commit-to-build gate itself — it is an operator decision at the `plan → build` boundary, not authored in the plan node
- Build's autonomous span — that is `build`'s concern
- The other backbone stages (reconcile, land, debrief) — separate nodes

**Edge only (separate node):**
- `explore` — a separate agent node; plan `invokes` it
- The lens agents — they `composes-into @plan` from their own side; plan does not direct-invoke them

## Overlaps and seams

- **← `specify`**: plan follows a settled spec amendment (`can-follow specify`); deferred F7
  (specify exists but is upstream; the `precedes plan` edge should be on specify's side — not
  yet there, pending backbone wiring wave).
- **→ `build`**: plan precedes build; deferred F7 (backbone wiring wave — both exist but process edges are wired in that wave).
- **plan ←→ build (re-plan loop)**: `plan can-follow build` is the re-plan entry; deferred F7 (backbone wiring wave).
- **lens family**: lenses already declare `composes-into @plan` — this node existing resolves
  those 10 pending `@plan` edges. Plan does not direct-invoke the lenses; it reaches them
  through `lens-dispatch` with `target: plan`.
- **IU-schema**: the field contract plan produces and build consumes — `references` edge
  (`load: import`).

## Fit

Single node — one primitive, one collaborative skill. The three modes (compose / deepen /
re-plan) are body branches; they do not earn separate goals or metrics. The lens dispatch
is a procedural phase within the body, not a separate node. The node's boundary is clean:
it starts after `specify` and ends at the plan doc + lens findings, ready for the
commit-to-build gate.

## Edges

| edge type | target id | rationale |
|---|---|---|
| `invokes` | `explore` | plan fans out explore for context gaps (repo / learnings / framework-docs) before decomposing |
| `composes-into` | `dev-sprint` (stage: plan) | plan is the backbone's planning stage |
| `references` | `IU-schema` (`load: import`) | the plan↔build field contract — always-present, short invariant; plan holds it and teaches it |
| `references` | `lens-dispatch` (`load: on-demand`) | the fan-out/merge procedure — read at the step of need |
| `references` | `findings-schema` (`load: import`) | the finding contract, passed into each lens spawn prompt |
| `references` | `severity-scale` (`load: import`) | the P0–P3 severity definitions — must-present alongside findings-schema |
| `references` | `confidence-anchors` (`load: import`) | the 0/25/50/75/100 confidence rubric — must-present |
| (F7) `can-follow` | `specify` | process — plan follows a settled spec amendment; deferred to backbone wiring wave per task brief |
| (F7) `precedes` | `build` | plan precedes build — deferred to backbone wiring wave |
| (F7) `can-follow` | `build` | the re-plan loop — deferred to backbone wiring wave |

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — consistent.

**`goals:` as outcomes:** All four goals state what plan achieves (build-rework reduction,
IU completeness, principle transfer, risk surfacing) and how to measure it, not the steps
plan runs.

**Edge targets resolvable:**
- `explore` → `graph/explore/explore.md` ✓
- `IU-schema` → `graph/_refs/IU-schema.md` ✓
- `lens-dispatch` → `graph/_refs/lens-dispatch.md` ✓
- `findings-schema` → `graph/_refs/findings-schema.md` ✓
- `severity-scale` → `graph/_refs/severity-scale.md` ✓
- `confidence-anchors` → `graph/_refs/confidence-anchors.md` ✓
- `specify` → `graph/specify/specify.md` ✓ (exists; F7-deferred per task brief — backbone wiring wave)
- `build` → `graph/build/build.md` ✓ (exists; F7-deferred per task brief — backbone wiring wave)
- `dev-sprint` → arc, not a node file — skipped per spec ✓
- `composes-into dev-sprint @plan` → resolves the pending `@plan` lens edges ✓

## Open questions

- **All process edges deferred**: all three inter-stage process edges (`can-follow specify`,
  `precedes build`, `can-follow build` re-plan) are deferred to the backbone wiring wave per
  the task brief. All target nodes exist on disk; the edges are wired when that wave runs.
  The wiring wave also adds `specify precedes plan` on specify's side.
- **Re-plan loop semantics**: `plan can-follow build` is the entry for `re-plan` mode.
  The exit criterion (what build-stage signal triggers re-entry) is described in the
  `re-plan` mode body and should be enforced when the edge is wired (with an explicit
  `max-attempt` + escalation label per the backbone design).
