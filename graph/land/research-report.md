---
title: Research report for land
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 2
researcher_adequacy_note: |
  Sources lifted: docs/dev-sprint-backbone-design.md (the `### land` section, "The gates"
  table, and "The land sub-arc — the open fork" resolution) and docs/graph-map.md (the
  backbone-stages row for land, the sub-arc rows for ship/deploy/canary, and "Edges at a
  glance"). Both sources are consistent and definitive. Key design calls: primitive=skill,
  mode=collaborative (land holds two operator gates, can never run unattended), three body
  modes (staging-first/prod-direct/staging-only, mirroring deploy), wave-1 scope = ship +
  deploy (wave 2 = canary, input-gated on prod traffic, BC pre-launch). Edge resolution:
  ship and deploy exist on disk at graph/ship/ and graph/deploy/ — invokes edges are
  declarable. canary does not exist — F7 prose only, no edge. Process edges (can-follow
  reconcile, precedes debrief, the revert can-follow reconcile) target non-existent siblings;
  all deferred to the wiring pass, F7 prose in body. No carrier write-edge (D44 — carrier
  write is gate-only). The commit-to-land gate is the intake; the live-confirmed gate is the
  exit — both operator decisions surfaced by land, not automated.
---

# Research report for land

## Identity

**Candidate id:** `land`
**Candidate title:** Land
**Scope:** The seventh backbone stage of the dev-sprint. Land takes a built and reconciled
change — cleared by the commit-to-land gate — and sequences the delivery sub-arc through to
a live, health-confirmed deployment. It holds two operator gates: **commit-to-land** (the
intake gate, advancing `in-delivery → shipped`) and **live-confirmed** (the exit gate,
advancing `shipped → live`). Wave-1 land invokes ship then deploy; canary is wave 2 (the
`live-confirmed` gate fires on deploy completion + any pre-launch smoke tests until canary
exists). Land does not write the carrier; the gates do, by design (D44).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Every cleared change reaches production (or a confirmed staging deploy) through a sequenced, gated path — not an ad-hoc push. | Share of changes that land via the ship → deploy sub-arc vs direct push; commit-to-land gate decisions recorded per item. | Direct-to-main pushes trend to zero; gate decisions are durable in the carrier. |
| Deploy failures and regressions surface in-session at land, not post-hoc. | Failures surfaced in-session vs found post-hoc by the operator checking CI independently; MTTR on land-time failures. | Post-hoc-discovered failures trend to zero over N sprints; revert paths are exercised quickly when triggered. |
| The live-confirmed exit is always an explicit operator decision, not an assumed automatic transition. | Share of land exits where the live-confirmed gate is explicitly recorded vs assumed; operator-reported surprises post-land. | Live-confirmed gate is recorded for every land exit; operator "I didn't know it was live" events reach zero. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** Land holds two hard operator gates — commit-to-land (intake) and
live-confirmed (exit). Neither can run unattended; the operator is the decision-maker at
both. Even the sub-arc steps (ship, deploy) surface decisions back through land before the
next step fires. Collaborative is required.

**`determinism:`** `generative`

**Rationale:** Gate framing, failure interpretation, and revert-or-proceed calls require
language judgment. The sub-arc steps themselves have deterministic phases (test run, merge,
pipeline poll), but land's orchestration and gate-surface prose are generative.

## Contract

**Input:** The work-item carrier (with a cleared commit-to-land gate decision already
recorded — confirmed prior to or at this session's start); the harness deploy-config overlay
(resolved by the harness; land reads it to know which mode to default to).

**Output:** The live-confirmed gate decision in the carrier; the deployment URL(s) (staging
and/or prod, per mode). In staging-only mode: the confirmed staging URL; the prod deploy is a
future land invocation.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `docs/dev-sprint-backbone-design.md` | keep | `### land` per-stage spec; "The gates" table; "The land sub-arc — the open fork" resolution (wave-1 = ship + deploy, wave-2 = canary, operator decided). Definitive. |
| `docs/graph-map.md` | keep | Backbone-stages table row for land; sub-arc rows for ship, deploy, canary; "Edges at a glance". Consistent with the design spec. |

## Keep / Drop

**Kept (absorbed into body):**
- Commit-to-land intake gate: operator decision, records `in-delivery → shipped` in the carrier.
- Live-confirmed exit gate: operator decision, records `shipped → live`.
- Sub-arc sequencing: invokes ship (tests → PR), then invokes deploy (merge → deploy → settle).
- Three modes (body branches): staging-first (default), prod-direct, staging-only — mirror deploy's
  three modes since deploy is the long phase land controls.
- Revert guidance: when deploy fails or post-deploy smoke tests fail, land surfaces the
  `reconcile` revert loop as the named arc path; it does not invoke reconcile itself.
- Carrier read-only: land reads the carrier for context + to confirm the commit-to-land gate
  decision was recorded; it writes no carrier field (D44).
- The gates are **operator decisions** — land surfaces the decision points; the gate mechanism
  records them, not land directly.

**Dropped (out of scope):**
- canary: wave 2, input-gated on prod traffic (BC is pre-launch; no live traffic to watch).
  Described in F7 prose; no edge until the canary node exists.
- Process edges to non-existent siblings (reconcile, debrief): deferred to the wiring pass.
- Carrier field writes: land holds no write-edge to the carrier (D44).

**Edge only / sub-arc:**
- `composes-into dev-sprint @land`: the backbone membership edge.
- `invokes ship`: ship exists at graph/ship/ — edge declarable.
- `invokes deploy`: deploy exists at graph/deploy/ — edge declarable.
- `invokes canary`: canary does not exist — F7 prose seam.
- `can-follow reconcile`: reconcile does not exist — F7 prose seam.
- `precedes debrief`: debrief does not exist — F7 prose seam.
- `can-follow reconcile` (the revert loop): same F7 seam, named separately in prose.

## Overlaps and seams

**Upstream — commit-to-land gate:** The gate is confirmed before (or at the start of) the
land session. The carrier's `gate_decisions[]` should already hold a `commit-to-land` entry
(from the reconcile stage, which owns the gate in D44/backbone spec). Land's intake is to
read it and confirm the cleared state — not to re-decide it.

**Downstream — live-confirmed gate:** The exit gate fires once deploy (and, in wave 2, canary)
confirms health. Until canary exists, the gate fires on deploy settle + a lightweight operator
smoke check. In staging-only mode, live-confirmed is not declared (the change is not live); land
documents this clearly.

**Revert loop:** If deploy fails or the post-deploy smoke check fails, land surfaces the
`reconcile` revert path. The `land → reconcile (revert)` can-follow edge wires in the backbone
wiring pass; described in body prose for now.

**Canary (wave 2):** Once canary exists (when BC has live prod traffic), it slots in after
deploy in the land body and the `invokes canary` edge is added via amend.

## Fit

Single node. Land is the gated container for the ship → deploy sequence; it owns the two
carrier-lifecycle gates and the mode dispatch. No sub-part earns its own measurable goal
outside the sub-arc nodes (ship, deploy) already authored — land orchestrates them, surfaces
the gates, and closes the lifecycle step. One node.

## Edges

| edge type | target id | status | rationale |
|-----------|-----------|--------|-----------|
| `composes-into` | `dev-sprint` (stage: land) | declarable | backbone membership |
| `invokes` | `ship` | declarable — exists at graph/ship/ | first sub-arc step |
| `invokes` | `deploy` | declarable — exists at graph/deploy/ | second sub-arc step |
| `invokes` | `canary` | **F7 prose — canary does not exist** | wave 2; input-gated |
| `can-follow` | `reconcile` | **F7 prose — reconcile does not exist** | happy-path intake; wiring pass |
| `precedes` | `debrief` | **F7 prose — debrief does not exist** | happy-path exit; wiring pass |
| `can-follow` | `reconcile` (revert loop) | **F7 prose — same target** | revert; wiring pass |

## Conformance

**`primitive:` ↔ `mode:` agreement:** `skill` ↔ `collaborative` — confirmed.

**`goals:` as outcomes:** All three goals are measurable outcome-frames (gated delivery path;
in-session failure surfacing; explicit live-confirmed gate) — confirmed.

**Edge targets resolvable:** `composes-into dev-sprint`, `invokes ship`, `invokes deploy` —
all resolvable on disk. `canary`, `reconcile`, `debrief` — all F7 prose, no frontmatter edge.

**No carrier write-edge:** land reads the carrier; the gate mechanism writes it — D44 held.

## Open questions

- Whether `land` should carry a `references` edge to an `instrumentation-preamble` ref once
  that ref is authored — add via amend in that wave.
- The `commit-to-land` gate: whether land confirms the gate was recorded by reconcile vs
  re-prompting the operator. Body treats it as "confirm the recorded gate decision at session
  start"; this can be refined once reconcile is authored.
- In `staging-only` mode: whether the `live-confirmed` gate fires at all (staging is not live).
  Body documents that staging-only defers the live-confirmed gate to a future prod deploy.
