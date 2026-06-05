---
title: Research report for verify
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 1
external_analogue_found: true
external_corpora_searched: [gstack skill set (qa/design-review/simulate-users), in-repo review.md exemplar, in-repo lens-dispatch reference]
researcher_adequacy_note: |
  verify is a stage orchestrator, structurally a twin of the existing review.md node — its
  closest external analogue is review itself plus the gstack pre-merge verification habit of
  running /qa and /design-review on a built change before it lands. I lifted the dispatch-and-gate
  shape from review.md (already in-repo, the named exemplar) and confirmed the three verification
  modalities are real, distinct gstack skills: qa (browser behaviour), design-review (visual), and
  simulate-users (AI-agent experience, already a node at graph/simulate-users). Edges were
  determined by the backbone insertion point: verify sits between review and reconcile, composes
  into dev-sprint at stage verify, invokes the three modalities, precedes reconcile, and carries a
  can-follow review corrective loop with the full three-part contract. primitive/mode is unambiguous
  (skill ↔ collaborative — it holds an operator gate, mirroring review). Goals were straightforward
  to frame as outcomes (escaped-defect rate, cost-to-run, signal quality) because verify is a gate,
  measured the same way review is. The one judgment call: verify is a SEPARATE stage from review,
  not a mode of it — review vets the diff (static, pre-build-output), verify vets the running built
  thing (dynamic, behavioural/visual/experiential). Translator should keep verify orchestration-only,
  never performing qa/design-review/simulate-users work itself, exactly as review never performs lens
  analysis itself.
---

# Research report for verify

## Identity

**Candidate id:** verify
**Candidate title:** Verify
**Scope:** The verification-stage orchestrator of the dev-sprint backbone, inserted as a NEW stage
between `review` and `reconcile` (the backbone becomes `plan → build → review → VERIFY → reconcile →
land → debrief`). verify dispatches the three verification modalities — `qa` (browser behaviour),
`design-review` (visual), `simulate-users` (AI-agent experience) — over the **running built thing**,
consolidates their verdicts into one ranked finding set with a coverage note, surfaces a single
**verification gate**, and owns the corrective loop back to `review`/`build` on a confirmed defect.
It performs NO modality work itself (no browsing, no visual grading, no simulation) — exactly as
`review` performs no dimension analysis itself. Excludes: static diff review (that is `review`), the
spec-reality diff (that is `reconcile`), and the gate's carrier write (PM/operator work at the gate).

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Behavioural, visual, and experiential defects are caught against the running build before it lands, not by real users or a later stage | Escaped-defect rate for defects of a kind a verification modality could observe (broken flow, visual regression, experience gap) traced to a verified change, vs the pre-verify transcript baseline | Escaped-defect rate measurably below baseline over N sprints; if verify never lowers it, the stage is cut or restructured |
| The verification pass is cheap enough — wall-clock + operator attention — to run on every material change rather than be skipped | verify cycle-time and operator-effort per pass (questions/decisions fired; time invoke→verdict); modality-skip rate when the trigger was met | Cost stays low enough that verify is not routinely skipped; trends down or holds as modalities are added |
| The consolidated verdict is actionable signal, not three separate noisy reports the operator must reconcile by hand | Signal-to-noise — consolidated findings actioned (fixed/deferred) vs suppressed at the gate; cross-modality duplicates collapsed per pass | Actioned-finding fraction stays high; a rising dismissal rate is the cut/tune signal |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** verify holds an operator-facing verification gate and walks the consolidated
fix-loop with the operator — it engages the live main thread, exactly as `review` does. It is not
an isolated, prompt-describable unit returning only a summary (that is its dispatched modalities,
e.g. `simulate-users`, which IS an agent). A stage orchestrator that surfaces a gate is a skill.
`skill ↔ collaborative` per the agreement table.

**`determinism:`** `generative`

**Rationale:** consolidation, severity-weighting, and the verdict involve judgment over
heterogeneous modality returns; the gate is a judgment call. Not a fixed-input/fixed-output
algorithm. Generative, matching `review`.

## Contract

**Input:** the operator's invocation (optional mode token, a target = the running built thing / a
deploy or local URL, an intent/requirements summary or plan pointer), the upstream review verdict
and triaged findings, and the carrier (read for context only — the work-item or standalone IU).

**Output:** the consolidated, ranked verification finding set across the three modalities, a
coverage note (which modalities ran / were skipped with the unmet trigger / failed to return), a
verification **verdict**, the fix-loop outcome (confirmed defects routed back to `review`/`build`),
and a stage-complete signal the projection reads to advance `current_stage`. No carrier write.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| in-repo `graph/review/review.md` | the dispatch-and-gate stage-orchestrator shape | yes | dispatch-and-gate-shape.md (notes) |
| in-repo `graph/_refs/lens-dispatch.md` | the fan-out / merge / triage / route reduction | yes | — (referenced, not lifted) |
| gstack skill set (`qa`, `design-review`) | the verification modalities a built change is run through pre-merge | yes | — (those are the qa + design-review sibling nodes) |
| gstack `simulate-users` / `graph/simulate-users` | the AI-agent-experience verification modality | yes | — (already a node; verify invokes it) |

**External analogue found:** verify is the in-repo `review` orchestrator pattern applied to a
different finding source (the running build vs the static diff), combined with the real gstack
habit of running qa + design-review + a simulation pass on a built change before landing. The
pattern is established (review.md), the modalities are real (gstack skills), and the insertion point
is the named backbone change. Not authored from design docs alone.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/dispatch-and-gate-shape.md` | keep | the orchestrator shape lifted from review.md — fan-out to a family, consolidate, gate, own the fix-loop, never do the work yourself |

## Keep / Drop

**Kept (absorbed into body):**
- The dispatch-and-gate orchestration shape (scope → fan out → consolidate → present → gate → fix-loop).
- The "orchestration only, never perform the modality work" discipline.
- The lean-context rule: collect compact verdicts from the modalities, not full analyses.
- The corrective loop with the three-part `can-follow` contract (exit / max-attempt / labelled re-entry).

**Dropped (out of scope):**
- The per-modality method (how qa browses, how design-review grades, how simulate-users runs a persona) — those live in the modality nodes.
- The static diff review — that is `review`, upstream.
- The spec-reality diff and adjudication — that is `reconcile`, downstream.

**Edge only (separate node):**
- `qa`, `design-review`, `simulate-users` are dispatched modalities — `invokes` edges, each its own node.

## Overlaps and seams

- **← `review`** (`can-follow`, corrective loop): a confirmed defect at verify re-enters the
  review→build correction; verify also *follows* review on the happy path (review precedes verify —
  but that `review → verify` re-point is authored by another agent, NOT here).
- **→ `reconcile`** (`precedes`): on a clean/all-accepted verification verdict, the work moves to reconcile.
- **invokes `qa` / `design-review` / `simulate-users`**: the three modalities verify consolidates.
- Mirrors `review`'s seam shape exactly: invokes its family, precedes the next stage, carries a corrective `can-follow`.

## Fit

Single node. It owns its own branching (modality selection, consolidation, gate, fix-loop routing)
and has a distinct measurable goal (escaped behavioural/visual/experiential defects vs baseline)
separate from `review`'s (escaped static-diff defects) and `reconcile`'s (spec-reality drift). It is
a stage, not a mode of review: review vets the *diff* before the build output exists in runnable
form; verify vets the *running built thing*. Different finding source, different modality family,
different measurable outcome → its own stage.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| invokes | qa | dispatches the browser-behaviour verification modality |
| invokes | design-review | dispatches the visual verification modality |
| invokes | simulate-users | dispatches the AI-agent-experience verification modality (existing node) |
| composes-into | dev-sprint (stage: verify) | verify is the new verify stage of the dev-sprint backbone |
| references | instrumentation-preamble (`load: import`) | the enter/exit emit contract every node imports |
| references | findings-schema (`load: import`) | the per-finding contract the consolidated verdict conforms to |
| precedes | reconcile | on a clean verdict, the work moves to reconcile |
| can-follow | review | the corrective loop: a confirmed defect re-enters review→build; carries the three-part contract |

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — confirmed (holds an operator gate).

**`goals:` as outcomes:** all three read as outcomes (escaped-defect rate; cost-to-run; signal
quality), each with a metric and an earns-keep threshold. None are activities.

**Edge targets resolvable:** `qa` and `design-review` are authored in this same wave (siblings);
`simulate-users`, `reconcile`, `review` exist; `dev-sprint` is an arc (composes-into, not resolved);
`instrumentation-preamble` and `findings-schema` exist in `graph/_refs/`.

## Open questions

- The `review → verify` happy-path `precedes` edge is re-pointed by a SEPARATE agent (review's own
  frontmatter), not here. verify declares only its own `can-follow review` (corrective) and
  `precedes reconcile`. Do not edit review.
- Whether verify should ever run a *cheaper* mode for a small AFK incremental slice (mirroring
  review's autofix/headless) is left to the body's mode discussion; no incremental `composes-into`
  is declared until the verify stage is wired into the incremental arc by a later pass (F7).
