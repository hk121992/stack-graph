---
title: Dev-sprint backbone — authoring spec (plan / build / reconcile / land / debrief)
status: working draft — 2026-06-05
---

# Dev-sprint backbone — authoring spec

The five missing backbone stages and the process-edge wiring that makes the dev-sprint loop real
end-to-end. The front (`align-context`/`design`/`specify`) and the review cell (`review` + four lenses)
exist; this completes **`plan → build → review → reconcile → land → debrief`**. The canonical arc + the
9-stage sketch live in [`graph-map.md`](graph-map.md) ("The arc", "Backbone stages"); this doc **resolves
what the map left open** — the gates, build's autonomous span, the projected-stage wiring through the
backbone, debrief's PM feedback, and the deferred (F7) process edges. Mirror `graph/review/review.md` +
the front nodes for node shape/voice; mirror [`dev-sprint-front-design.md`](dev-sprint-front-design.md)
for the governed-decisions format.

## Verify-stage insertion (now wired)

Since the original draft, a **`verify`** stage was inserted between `review` and `reconcile`, so the
backbone sequence is now **`plan → build → review → verify → reconcile → land → debrief`**. `verify`
proves the built change against its *running* behaviour: a `verify` skill dispatches the verification
modalities (`qa`, `design-review`, `simulate-users`), consolidates their verdicts behind one
**verification gate**, and owns a corrective `can-follow → review` loop — mirroring the review cell's
lens dispatch, but over the running build. The happy-path edges re-point accordingly: **`review →
verify`** and **`verify → reconcile`** replace the old direct `review → reconcile` (the
`review → verify` edge is declared on `review`'s frontmatter; `verify → reconcile` on `verify`'s).
The wave-2 visual-design and measure-vs-baseline nodes below are now built, not prose seams.

## The F7 IOU this pays

`plan` is already referenced by **10 `composes-into @plan` edges** (the four lenses + `product-lens`) with
no `plan` node — the biggest outstanding F7 debt in the graph. Building the backbone resolves it and wires
the backbone `precedes`/`can-follow` edges the front + review cell have been deferring.

## Governed model (carried from the front + the carrier spec)

- **Carrier = projected.** Each backbone stage **reads** the work-item (carrier) for context and **emits**
  node-enter/-exit events; `current_stage` + `transition_history` are **projected** from that traversal —
  no stage holds a carrier write-edge (D44). The stages are what make the projection real end-to-end.
- **Gates are operator decisions**, not nodes: a gate advances `lifecycle_state` and appends a
  `gate_decision`; rigour is set by the maturity × tier dial (D45).
- **F7 now payable.** Author the backbone process edges now that all endpoints will exist; the front's
  deferred `specify precedes plan` and the review cell's `build → review → reconcile` + fix-loop edges
  wire in **this wave**.

## The gates (lifecycle_state × stage boundary)

The carrier lifecycle (`idea → discovery → defined → committed → in-delivery → shipped → live`) maps onto
the arc. Three operator **gates** sit at the commitment boundaries; one transition is **traversal-derived**
(not gated):

| gate | boundary | transition | the decision |
|---|---|---|---|
| **commit-to-build** | `plan → build` | `defined → committed` | the **plan** is worth building (decided once the plan exists, not before) |
| **commit-to-land** | `reconcile → land` | `in-delivery → shipped` | the built + reconciled change is ready to ship |
| **live-confirmed** | `land → debrief` (land's exit) | `shipped → live` | deployed, canary-healthy, confirmed live |

`committed → in-delivery` is **traversal-derived** — it is simply *entering `build`*, projected from the
traversal, **not** a gate (the commit-to-build gate already recorded the commitment; entering build is its
consequence). Upstream `idea → discovery → defined` are PM discovery gates, before/at the front — out of
backbone scope. Pre-launch maturity runs the gates light (D45); a `T1` item may fast-track.

## Per-stage spec

Each: `primitive: skill`, `composes-into dev-sprint @<stage>`, reads the carrier (no write-edge), emits
traversal events. Goals are outcome-framed with an earns-keep (detail at node-authoring time).

### plan (skill, collaborative)
- **Goal:** a staged, dependency-annotated plan; one workstream per buildable child; planning principles
  taught. *Earns-keep:* build-stage rework from unsequenced/under-specified work trends down.
- **Modes:** `compose` (default) · `deepen` (hard/novel) · `re-plan` (the `plan → build` loop re-entry).
- **Edges:** `invokes explore`; uses the **lens family** at `target: plan` (sequential, plan-review) via
  the `lens-dispatch` reference + the finding-contract refs (the lens-consumer invariant — same as
  `review`/`design`); `references` `IU-schema` (import — the Implementation-Unit contract plan↔build).
  Resolves the 10 pending `@plan` lens edges. `can-follow specify`; `precedes build`.
- **Carrier:** produces the **impl-unit breakdown** as the plan artifact. It does **not** write the
  carrier — `children[]` is populated as **content by the curator** (from the plan) and/or **projected**
  when `build` spawns the child work-units as their own traversals. `plan` writes the plan, not the carrier.

### build (skill, collaborative → autonomous)
- **Goal:** the planned change implemented to spec, checkpointed across a long autonomous span.
  *Earns-keep:* spec-faithful output; rework caught in-span, not at review.
- **Modes:** `inline` (one small unit, main thread) · `serial` · `parallel` (per-unit worker agents in
  worktrees). The C→A span: collaborative to kick off, autonomous through the build.
- **Edges:** `invokes debug` (the Iron-Law fix path) + `explore`; consumes `worktree-isolation` (inline)
  + per-unit workers; `references` `IU-schema` (import) + `.worktreeinclude`. `can-follow plan`;
  `precedes review`; **inbound loops** `review → build` (fix) + `reconcile → build` (rework) +
  `plan → build` (re-plan).

### reconcile (skill, collaborative)
- **Goal:** spec ?= reality after build/review; owns the `reconcile → build` loop and the
  **commit-to-land** gate. *Earns-keep:* spec drift caught before landing, not after.
- **Modes:** `draft` (compute the diff) · `adjudicate` (operator decides amend-spec vs fix-build) ·
  `enact` (apply the chosen path).
- **Edges:** `invokes spec-diff` (build ↔ spec-touchpoint comparison) + `log-decision`; `invokes pr-author`
  for any spec amendment; `references handbook` (external, on-demand). `can-follow review`;
  `precedes land`; `precedes build` (rework loop).

### land (skill, collaborative + gate)
- **Goal:** the verified change to prod, confirmed healthy. Holds **commit-to-land** intake +
  **live-confirmed** exit. *Earns-keep:* clean deploys; reverts rare and fast.
- **Modes:** `staging-first` (default) · `prod-direct` · `staging-only`.
- **Edges:** `invokes ship`, `invokes deploy`, `invokes canary` (the land sub-arc — **now wired**;
  `canary` exists as a node but its prod-traffic baseline stays input-gated per the operator decision
  below). `can-follow reconcile`; `precedes debrief`; `precedes reconcile` (the `land → reconcile` revert
  loop).

### debrief (skill, collaborative)
- **Goal:** measure outcomes vs the work-item's `outcome_link`, capture learnings, route amendments, seed
  the next sprint — the loop close. *Earns-keep:* outcomes actually read back; learnings reused.
- **Modes:** `measure` · `learn` · `seed-next`.
- **Edges:** `invokes measure-outcomes` + `capture-learnings` + `log-decision` (the debrief fleet).
  `can-follow land`; seed-next is `align-context can-follow debrief`. **PM feedback (the loop close):**
  `debrief` does **not** advance `lifecycle_state` (the `live-confirmed` gate already did `shipped → live`).
  Its fleet records **outcome evidence + learnings + decisions** to their homes (the work-item record /
  `decisions` / recall); the **product-dashboard-curator** and **strategy-curator** read those homes on
  their next sweep — the loop closes through the **shared authored homes** (D38), **not** a direct
  `debrief → curator` edge.

## Sub-nodes & sub-arcs the backbone needs

Per `graph-map.md`. Split by what the **loop skeleton** needs vs enhancements:

- **Wave 1 (loop-critical, build now):** `spec-diff`, `log-decision`, `measure-outcomes`,
  `capture-learnings` (agents), and the `IU-schema` reference. These let the loop traverse, reconcile, and
  close.
- **Wave 2 (enhancements — now built + wired):** `debug` + `investigate-probe`; the land sub-arc
  `ship`/`deploy`/`canary`; `optimise` (generate-measure-select, with an AX-optimise mode that uses
  `simulate-users` as evaluator); the crystallizing measure-vs-baseline `benchmark`/`health`/`canary`;
  and the **`verify`** span (skill dispatching `qa`/`design-review`/`simulate-users`) plus the
  visual-design thread (`design-shotgun`@design, `design-implement`@build). These exist as nodes with
  real edges now — the prose seams below are resolved, not deferred.

## Process-edge wiring (the F7 payment — author this wave)

**Happy path (`precedes`):** `specify→plan`, `plan→build`, `build→review`, `review→verify`,
`verify→reconcile`, `reconcile→land`, `land→debrief`. **Corrective loops (`can-follow`, each with an
exit criterion + max-attempt/escalation + a labelled re-entry event):** `build can-follow review` (fix),
`verify can-follow review` (re-verify after a review-stage fix), `build can-follow reconcile` (rework),
`reconcile can-follow land` (revert), `plan can-follow build` (re-plan). **Seed-next:**
`align-context can-follow debrief`. The front's deferred `specify→plan` and the review cell's
`build→review` resolve here; the inserted `verify` stage re-points the old `review→reconcile` into
`review→verify` + `verify→reconcile`. Happy-path edges are `precedes`; corrective re-entries are
`can-follow`, so the traversal stays directed and every loop is explicit, bounded, and escalatable —
not an open cycle.

## Build sequencing

1. **Wave 1 — the delivery loop.** Author `plan`, `build`, `reconcile`, `land`, `debrief` + the wave-1
   sub-nodes + `IU-schema`; wire the process edges; validate + index. The carrier traverses end-to-end,
   `current_stage` projects, the commit-to-build + commit-to-land gates fire, the reconcile loop works, and
   `debrief` measures + closes. **How far `land` goes is the fork below** — to `shipped` (build `ship` now;
   `land` tests + PRs + holds the gate) or to `live` (also build `deploy`/`canary` now). `land` does real
   work either way; we do **not** claim `live` without `deploy`/`canary`.
2. **Wave 2 — sub-arcs + crystallizing nodes (now built):** `debug`/`investigate-probe`,
   `ship`/`deploy`/`canary`, `optimise`, the crystallizing `benchmark`/`health`/`canary`, the `verify`
   span, and the visual-design thread (`design-shotgun`/`design-implement`). Each replaced an F7 prose
   seam with a real edge.

## Open questions / forks for the operator

- **`build`'s shape — resolved:** one `build` skill with an autonomous span + inline worker agents
  (matches graph-map's `skill C→A`); an orchestrator + separate `worker` node is deferred until a worker
  earns its own goal/metrics. (Codex concurred.)
- **Gate model — resolved:** the three gates above + `committed → in-delivery` traversal-derived
  (commit-to-build moved to `plan → build`; the `specify → plan` double-boundary dropped). (Codex's fix.)
- **The land sub-arc — the open fork.** Anti-deferral splits it cleanly: `ship` (tests → PR) is **wave 1**
  (every change PRs); `canary` (post-deploy health on *live* prod) is **wave 2** — BC is pre-launch with no
  traffic to watch, so it is genuinely **input-gated**, not deferred. The real call is **`deploy`** (merge →
  deploy): wave 1 if BC deploys through this loop now (e.g. staging/preview), else wave 2. `land` is a real,
  gated stage either way — Codex: don't fake it. **Decided (operator): wave-1 `land` = `ship` + `deploy`**
(deploys to staging/preview + holds the commit-to-land + live-confirmed gates); **`canary` → wave 2**
(input-gated on prod traffic).

## Spec touchpoints

| Spec doc | Section | Relationship | Core / pack |
|---|---|---|---|
| `02-graph-spec` | The carrier; cyclic semantics | Backbone stages are the traversal that projects `current_stage`; the loops exercise cyclic process edges | Core |
| `01-concepts` | The loop; carriers & gates; maturity dial | The backbone *is* the dev loop; the three gates instance the gate model | Core |
| `07-decomposition` | Curator-over-carrier; the context axis | `build`/`review` fan out to isolated agents; front/close run in-thread — the skill/agent axis | Core |
| `06-analytics` | Instrumentation; the rendered analytics surface | Every backbone stage emits the traversal events the projection + debrief metrics consume; `verify`/`simulate-users` feed the `experience-contract` conformance tally; the measure-vs-baseline nodes feed the `metrics`→`trends` channel | Core |
| *(decisions)* | D44, D45, F7 | Applies the carrier + projected-stage (D44), the gate dial (D45); pays the F7 edge IOUs | — |
