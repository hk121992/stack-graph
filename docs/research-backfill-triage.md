# Research-Report Backfill — Operator Triage

## Summary

This triage synthesises the per-node backfill of research reports across **21 nodes** of
the stack-graph factory. Every node was searched against external corpora (gstack live
skills, the CE plugin, the be-civic harness, and published methodology — ADR, DORA,
SVPG/Torres, SDD literature). **All 21 nodes had a real external analogue found** — there
is no node whose job is genuinely absent from prior art, though `log-decision` is a
partial case (its *conclusion* layer maps cleanly to ADR practice, but its two-layer
conclusion+recall write pattern is a genuine architectural novelty with no full
counterpart in any corpus). Of the 21, only one node (`harness-init`) had no prior
research report at all and was authored from scratch; the other 20 were deepened in place.

**Total gaps surfaced: 134** — **27 high**, **57 medium**, **50 low**. The dominant gap
class is *missing-step* and *missing-best-practice* (mechanical specificity the real-world
analogues carry and the generalised nodes dropped), not structural/design error. The node
canonicals were not touched; all writes landed in `research-report.md` and (gitignored)
`source-material/`. These reports are now amendment-ready inputs for the backbone wiring
wave.

## Prioritized triage table

Sorted by severity weight (high gaps first; ties broken by medium count, then total).

| Node | Primary analogue | External analogue found? | #high / #med / #low | Top opportunity |
|---|---|---|---|---|
| `build` | CE `ce-work` | yes | **2** / 4 / 2 | Runnable verification gate + adversarial review subagent in-span before `unit-complete` |
| `plan` | CE `ce-plan` | yes | **2** / 3 / 2 | Mandatory operator confirmation gate between IU decomposition and lens dispatch |
| `measure-outcomes` | gstack `health` | yes | **2** / 2 / 2 | Define snapshot write ownership + schema (trend compounding is otherwise impossible) |
| `reconcile` | gstack `/review` | yes | **3** / 2 / 2 | Durable sink for accepted drift + concrete rework-loop bound/escalation |
| `align-context` | CE `ce-brainstorm` | yes | **2** / 3 / 1 | Formal rigor-gap taxonomy + explicit operator-dialogue discipline in Phase 3 |
| `product-lens` | gstack `plan-ceo-review` | yes | **2** / 2 / 1 | Evidence-strength pushback discipline + SMART bar on `outcome_link` |
| `debrief` | gstack `retro` | yes | **2** / 3 / 2 | Structured verdict artefact + recall query before `learn` (re-derivation guard) |
| `land` | gstack `land-and-deploy` | yes | **1** / 4 / 2 | Structured pre-merge readiness evidence surface at the commit-to-land gate |
| `harness-init` *(new)* | be-civic `bc-onboarding` | yes | **1** / 2 / 3 | Partial-init / crash-window recovery mode |
| `capture-learnings` | CE `ce-compound` | yes | **1** / 3 / 2 | Graduated overlap-severity rubric + prior-proposals archive location |
| `ship` | gstack `ship` | yes | **1** / 2 / 2 | Pre-landing in-diff structural review pass before commit |
| `spec-diff` | gstack `/review` | yes | **1** / 3 / 3 | CHANGED verdict status + verification-mode dispatch (diff vs external-state) |
| `log-decision` | mattpocock ADR-FORMAT | yes (partial) | **1** / 2 / 3 | Add `consequences` field to spawn bundle + conclusion format (ADR-standard) |
| `product-dashboard-curator` | be-civic `bc-roadmap-curator` | yes | **1** / 4 / 2 | Correct the "generalises" claim — name the 5 added fields as additions, not distillations |
| `drift-detector` | be-civic `bc-handbook-curator` drift-detector | yes | **1** / 3 / 2 | Round-to-round candidate suppression (`resolved_candidates` input) to protect precision |
| `design` | gstack `plan-design-review` | yes | **1** / 2 / 2 | Scope-confirmation gate at end of Phase 1 before lens fan-out |
| `handbook-curator` | be-civic `bc-handbook-curator` | yes | **0** / 3 / 4 | Record comment-mode contract (raise duplicate-stop is a dead end without it) |
| `deploy` | gstack `land-and-deploy` | yes | **1** / 4 / 2 | Full deploy-report output contract (MTTR/unblocked-rate unmeasurable without it) |
| `specify` | be-civic `bc-handbook-curator` | yes | **0** / 3 / 3 | Pre-raise content-principles gate (resolved-only, touchpoint-scoped) |
| `pr-author` | be-civic `bc-handbook-curator` pr-author | yes | **0** / 3 / 2 | Adaptive sizing + before/after user-visible framing for observable spec changes |
| `queue-checker` | be-civic `bc-handbook-curator` queue-checker | yes | **0** / 2 / 3 | Declare `allowed-tools: [Bash]` in frontmatter to enforce read-only at harness level |

*(Note: `reconcile` carries 3 high gaps and sorts at the top of the high-severity band on
raw count; it is placed after the build/plan/measure-outcomes cluster only because those
three each gate a structurally-unreachable goal — see Recommended amend order.)*

## Cross-cutting themes

1. **Generalisation dropped mechanical specificity, not design.** The nodes are
   structurally sound at the primitive/mode/edges level; the gaps are overwhelmingly the
   *concrete procedure* the real-world analogues carry — verification commands, safety
   checks, cleanup discipline, refusal cases. The factory abstracted the job correctly but
   thinned the "how."

2. **Missing output contracts make earns-keep goals structurally unmeasurable.** Recurs in
   `measure-outcomes` (no snapshot persistence → no trend), `deploy` and `land` (no
   deploy-event record → no DORA/MTTR), `debrief` (no verdict artefact), `capture-learnings`
   (no prior-proposals archive → `recurring_unacted` can't fire). In each, the node's own
   quality signal is unreachable as specified. **This is the single highest-leverage theme.**

3. **Missing or weak gates before expensive/irreversible steps.** `plan` and `design`
   both lack an operator scope-confirmation gate before lens fan-out; `land` fires its
   merge gate on confirmation alone with no readiness evidence; `build` and `ship` lack an
   in-span/pre-landing review before the diff is treated as done. The analogues
   consistently gate the human at the highest-risk boundary.

4. **The ADR / verdict-taxonomy family is under-specified.** `log-decision` lacks
   `consequences`; `reconcile`, `spec-diff` both lack a CHANGED status (goal met by
   different means) and an UNVERIFIABLE escape hatch, producing false positives. The
   published ADR and gstack `/review` taxonomies are the ready-made fix.

5. **Idempotency / re-entry / recovery is thin across the loop.** `drift-detector` lacks
   round-to-round suppression; `harness-init` lacks partial-init recovery; `reconcile`
   has an unbounded rework loop; `deploy`/`land` lack first-run infrastructure detection.
   The analogues treat re-entry as a first-class state.

6. **Pushback / peer-posture discipline is named but not enforced.** `align-context`,
   `product-lens`, and `product-dashboard-curator` all *name* an evidence bar
   (said-yes/did-yes, four-risks, problem-not-feature) but give no HOW — the analogues
   (`ce-brainstorm` interaction rules, `plan-ceo-review` anti-sycophancy rules, Torres'
   "more than one way?" test) supply concrete pushback patterns.

7. **The be-civic curator family is the dominant analogue for the maintenance cells.**
   `handbook-curator`, `drift-detector`, `pr-author`, `queue-checker`, `specify`, and
   `product-dashboard-curator` all trace to be-civic production originals — the
   generalisation gaps there are consistently "the production original carries X, the
   vendored node dropped it" (comment mode, scope-lock, what-belongs filter, queue_check).

## Recommended amend order

**Re-author first — goal-gating, structurally-unreachable nodes (Tier 1).** These have
gaps where the node's own earns-keep metric cannot fire as specified; amend before any
loop exercise:

1. **`measure-outcomes`** — snapshot write ownership/schema. Gates *all* trend
   compounding in the debrief loop; nothing downstream of it can show direction without it.
2. **`build`** — runnable verification gate + in-span adversarial review. The "done" signal
   is currently undefined in form; the review-re-entry metric can't improve without it.
3. **`reconcile`** — durable sink for accepted drift + bounded rework loop + CHANGED/
   UNVERIFIABLE taxonomy. Silent quality erosion risk; three high gaps.
4. **`plan`** — operator confirmation gate before lens dispatch + stronger IU acceptance
   criteria. Prevents the exact planning error the stage exists to catch.
5. **`debrief`** — structured verdict artefact + recall-query-before-learn. The
   re-derivation-rate goal is unachievable without the preflight recall query.

**Operator-decision-gated (resolve the decision, then amend).** `measure-outcomes` CF-1
(who writes the snapshot — debrief or measure-outcomes?) and
`product-dashboard-curator` CF-5 (sprint-record: authored file vs ephemeral view?) each
need an operator call before the translator finalises the body. Surface these alongside
Tier 1.

**Second wave — high-value but not goal-gating (Tier 2).** `align-context`, `product-lens`,
`land`, `deploy`, `capture-learnings`, `ship`, `design`, `spec-diff`, `log-decision`,
`drift-detector`. These add rigor/measurability but don't block the loop from running.

**Can wait — low/medium polish, no high gaps (Tier 3).** `handbook-curator`, `specify`,
`pr-author`, `queue-checker`, `harness-init` (its one high gap, partial-init recovery, is
real but only bites on a crash mid-scaffold — schedule before the Phase-C harness exercise,
not before the backbone wiring). `product-dashboard-curator`'s high gap is a documentation
correction (unsupported claim), not a behaviour change — cheap, do it opportunistically.

## Nodes with NO external analogue found

**None are genuinely absent.** All 21 nodes had a real external analogue. The closest to
absence are recorded below for completeness:

- **`log-decision` — partial novelty, no deeper search warranted.** The *conclusion* layer
  has a strong, exact analogue (ADR practice: Nygard canonical, mattpocock `.claude`-native
  ADR-FORMAT, AWS lifecycle). What is genuinely absent across *every* corpus searched
  (gstack 84 skills, CE 36 skills, be-civic harness) is the **two-layer
  conclusion+recall-substrate write pattern** — no corpus had a dedicated two-layer decision
  primitive. This is a deliberate architectural novelty of the factory, not a search miss.
  No deeper search is warranted; the ADR body of practice already supplies the missing
  field-level rigor (`consequences`, supersession back-annotation).

- **`product-lens` — novel in shape, well-grounded in methodology.** No corpus had the
  specific pattern of a *product-strategy lens composing into a shared front stage alongside
  code/design lenses*. The domain methodology (SVPG four-risks, Torres OST) is the firm
  grounding and the gaps are about enforcing it. Genuine-absence of the *composition shape*;
  not worth a deeper search (the methodology is the right anchor, found).

- **`product-dashboard-curator` — analogue found but narrower than claimed.** The
  be-civic `bc-roadmap-curator` is a real analogue for the graduation machinery, but five
  fields (problem/why, outcome_link, value_prop_link, risk_state, disposition) have **no
  prior-art source** — they are Torres/SVPG-informed additions. Not a search miss; the
  amendment is to *name* them as additions rather than search for a counterpart that does
  not exist.

No node merits a deeper external search: where prior art is thin, it is thin because the
factory is doing something deliberately new (two-layer writes, lens composition), and the
governing methodology has already been located and lifted.
