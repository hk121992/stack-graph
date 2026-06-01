---
title: Research report for reconcile
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 2
researcher_adequacy_note: |
  Source material is two authoritative design documents in the same repo: the
  dev-sprint-backbone-design.md (which has a dedicated ### reconcile section, the "The
  gates" table, and the "Process-edge wiring" section) and graph-map.md (the reconcile
  backbone row + the shared sub-nodes table). Coverage is complete for a backbone stage
  at this authoring wave — all modes, all edges, the carrier contract, and the gate role
  are settled by design. The primitive/mode decision is unambiguous: collaborative skill,
  matching every other close-thread backbone stage. Goals were easily framed as outcomes
  (the design's earns-keep is explicit). Two process edges — `can-follow review` and
  `precedes land` — are deferred F7 because `review` exists but `land` does not yet;
  named in prose. The rework loop edge (`precedes build`) is also deferred because the
  direction instruction ("defer inter-stage edges to the wiring pass") mandates F7 for
  inbound process edges even where the targets exist; noted accordingly. Confidence is
  high; translator can proceed directly to synthesis.
---

# Research report for reconcile

## Identity

**Candidate id:** `reconcile`
**Candidate title:** Reconcile
**Scope:** The `reconcile` backbone stage of the dev-sprint: post-review, pre-land. It
compares spec (design + specify output) against built reality, holds the operator-driven
adjudication of any drift, applies the chosen resolution path (amend-spec or fix-build),
and surfaces the **commit-to-land** gate. It owns the `reconcile → build` rework loop
on the fix-build path. It does **not** write the carrier (projected-state model, D44) and
it does not make the gate decision itself — it surfaces the gate and the decision is the
operator's. Scope excludes: the build stage, the land stage, and any lifecycle-state
write.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Spec-reality drift is caught at reconcile, before landing — not after. | Discrepancies surfaced pre-land vs discrepancies found post-hoc in production or a future audit. | Escape rate trends toward zero; if diffs never surface real issues the loop later confirms, the stage is retuned or cut. |
| The adjudication path (amend-spec vs fix-build vs accept) is an explicit operator decision at reconcile, never a silent default. | Share of reconcile sessions with a logged adjudication decision; sessions where the path was taken without a logged decision. | Silent decisions trend toward zero; every resolution path is traceable in `docs/decisions.md`. |
| Any spec amendment raised at reconcile reaches canon through the same gated path as a specify-stage amendment. | Share of reconcile-raised amendments that flow through the pr-author / curator queue vs out-of-band edits; duplicate/colliding spec PRs opened by reconcile (target ~0). | Out-of-band spec edits at reconcile trend toward zero; reconcile is a secondary canon-author path, never an exception to the gated queue. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** Reconcile holds operator interaction in its core — the adjudication in
`adjudicate` mode requires the operator to decide amend-spec vs fix-build, and `enact`
applies the operator-chosen path. It is the close-thread analogue of `specify` (another
collaborative skill). An autonomous agent shape is ruled out: the gate surfacing and the
adjudication are operator-in-loop decisions, not automatable work the node does solo.
Skills load into the current context — the operator stays present. This matches the
design doc explicitly ("collaborative").

**`determinism:`** `generative`

**Rationale:** The diff interpretation (what is real drift vs acceptable variance?) and
the amendment authoring (when the spec-amend path is chosen) require judgment. Even the
`draft` mode — where `spec-diff` does the mechanical comparison — requires reconcile to
interpret and present its structured output to the operator. Not deterministic.

## Contract

**Input:** The carrier (work-item), read for context — its `lifecycle_state`, prior
`transition_history`, the spec touchpoints (from design/specify), and a pointer to the
build artefacts (diff or changed files). Mode token (`draft` / `adjudicate` / `enact`)
from the operator; defaults to running all three in sequence when no token is given.

**Output:**
- `draft`: the structured spec-diff report (from `spec-diff`) surfaced to the operator,
  annotated with reconcile's interpretation of each finding.
- `adjudicate`: the operator's adjudication on each finding — amend-spec, fix-build, or
  accept — logged via `log-decision`.
- `enact`: the chosen path executed — spec amendment PR raised (via `pr-author`) or
  build rework loop re-entered; or a clean "all accepted" exit surfacing the
  commit-to-land gate.
- **All modes**: stage-complete signal (traversal event). No carrier write.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `docs/dev-sprint-backbone-design.md` (### reconcile + "The gates" + "Process-edge wiring") | keep | Authoritative design: modes, edges, goal, gate role, carrier contract. |
| `docs/graph-map.md` (reconcile backbone row + shared sub-nodes table) | keep | The reconcile row (invokes, goal summary) + spec-diff/log-decision/pr-author entries confirm edge targets exist. |

No source-material/ directory required — design documents in this repo are the
authoritative source; no external material was lifted.

## Keep / Drop

**Kept (absorbed into body):**
- The three-mode structure: `draft` / `adjudicate` / `enact`.
- The `commit-to-land` gate surfacing (reconcile surfaces it; the operator/gate decides).
- The operator-driven adjudication loop (amend-spec vs fix-build vs accept).
- The no-carrier-write contract (D44 — current_stage projected, not written here).
- The rework loop ownership (`reconcile → build` on the fix-build path).
- The secondary canon-author role via `pr-author` for spec amendments.
- The `handbook` external reference (on-demand, overlay-resolved to the product's canon).

**Dropped (out of scope):**
- The full carrier schema fields — those are the carrier spec (02-graph-spec); reconcile
  reads them, does not re-specify them.
- The gate mechanics (how `lifecycle_state` advances) — that is the gate + operator
  decision, not reconcile's body.
- The land sub-arc detail — that belongs in the `land` node.

**Edge only (separate node):**
- `spec-diff` — the mechanical comparison agent; reconcile invokes it.
- `log-decision` — the two-layer write agent; reconcile invokes it.
- `pr-author` — the PR description agent; reconcile invokes it for spec amendments.
- `build` — the rework target; reconcile precedes it on the fix-build path (deferred F7).
- `land` — the happy-path next stage; reconcile precedes it (deferred F7).
- `review` — the upstream stage; reconcile can-follow it (deferred F7).

## Overlaps and seams

**Upstream seam (review → reconcile):** `review` surfaces findings; `reconcile` picks up
the reviewed change + the spec touchpoints and asks whether spec = reality. The `can-follow
review` process edge is deferred F7 (review exists; inter-stage edges are wired in the
dedicated wiring pass).

**Downstream seam (reconcile → land):** On a clean diff or accepted-all adjudication,
reconcile surfaces the commit-to-land gate and hands off. The `precedes land` process edge
is deferred F7 (`land` does not exist yet).

**Rework seam (reconcile → build):** On a fix-build adjudication, reconcile re-enters
build. The `precedes build` (rework-loop direction) edge is deferred F7 per the
instruction to defer all inter-stage edges to the wiring pass.

**Spec-amendment seam (reconcile → specify queue):** On an amend-spec adjudication,
reconcile raises a spec amendment PR via `pr-author` into the same canon queue that
`specify` uses. Reconcile is a secondary canon-author; the `handbook` reference
(external, on-demand) is the shared locator.

**Revert seam (land → reconcile):** The `land → reconcile` revert loop (a `can-follow`
from `land`) is on the `land` node's side; reconcile need not declare it outbound.

## Fit

Single node. The three modes are branches of one skill — they share the same goal (close
the spec ↔ reality gap before landing), the same carrier read, and the same stage-complete
signal. No mode earns a separate measurable goal that would warrant splitting. The
`spec-diff`, `log-decision`, and `pr-author` agents are separate nodes (separate goals,
invoked by reconcile) — not collapsed here.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| `composes-into` | `dev-sprint` (stage: reconcile) | This is the reconcile stage of the dev-sprint arc. |
| `invokes` | `spec-diff` | Dispatches the spec-diff agent in `draft` mode to compute the build ↔ spec-touchpoint comparison. |
| `invokes` | `log-decision` | Records the adjudication decision (amend-spec / fix-build / accept) to the two-layer store. |
| `invokes` | `pr-author` | Composes the PR description for a spec amendment on the amend-spec path. |
| `references` | `handbook` (`load: on-demand`, `external: true`) | Overlay-resolved to the product's canon root + page index; needed when authoring a spec amendment to navigate the canon pages. |
| `can-follow` | `review` | **F7 — deferred to wiring pass.** Reconcile follows review; wired once the backbone process edges are wired end-to-end. |
| `precedes` | `land` | **F7 — deferred to wiring pass.** Reconcile's happy-path exit is land; `land` does not exist yet. |
| `precedes` | `build` | **F7 — deferred to wiring pass.** The rework loop re-enters build; wired in the backbone process-edge pass. |

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — confirmed.

**`goals:` as outcomes:** All three goals are outcome-framed (drift caught before landing;
adjudication explicit; amendment path gated). Each has an `earns-keep` threshold.

**Edge targets resolvable:**
- `dev-sprint` — arc, not resolved by validate (composes-into is skipped).
- `spec-diff` — exists at `graph/spec-diff/spec-diff.md`. Confirmed.
- `log-decision` — exists at `graph/log-decision/log-decision.md`. Confirmed.
- `pr-author` — exists at `graph/pr-author/pr-author.md`. Confirmed.
- `handbook` — external: true; validation skipped (harness-supplied). Confirmed.
- `review`, `land`, `build` — F7 deferred; not declared in edges frontmatter; described
  in body prose per the hard constraint.

## Open questions

- None. All design decisions are settled by the backbone design doc. The F7 edges are
  deferred by instruction; the wiring pass will resolve them once all backbone stages exist.
