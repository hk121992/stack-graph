---
title: Research report for reconcile
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: Backfill — external corpus search, source-material lifted (3 files), External analogues searched section added, Challenge findings section added, researcher_adequacy_note updated.
sources_lifted: 3
external_analogue_found: true
external_corpora_searched:
  - "gstack live skills (/home/gstack/.claude/skills/gstack/) — review, ship, document-release, landing-report, land-and-deploy"
  - "CE plugin (/home/gstack/scratch/ce-plugin/plugins/compound-engineering/skills/) — ce-resolve-pr-feedback, ce-work, ce-work-beta, ce-code-review, ce-release-notes"
  - "be-civic harness (/home/gstack/projects/be-civic/) — bc-operations, bc-workspace, CLAUDE.md"
  - "Published best practice — Thoughtworks (spec-driven development), arxiv 2602.00180 (SDD framework), Agile DoD/AC literature (TechTarget, AgileSherpa, altexsoft)"
researcher_adequacy_note: |
  External search was performed across all four required corpora on 2026-06-03. The
  strongest analogue is the gstack /review skill's Plan Completion Audit + Scope Drift
  Detection (Step 1.5 and Plan File Discovery sections): it computes a DONE/PARTIAL/NOT-DONE/
  CHANGED/UNVERIFIABLE diff of plan vs reality, holds the operator via AskUserQuestion on
  HIGH-impact discrepancies, and offers three adjudication paths (A: stop and implement /
  B: ship anyway + P1 TODOs / C: intentionally dropped) — structurally identical to reconcile's
  three paths. The CE ce-resolve-pr-feedback full-mode is the second analogue: its finding
  triage, verdict taxonomy (fixed/declined/needs-human), loop bounding (3 rounds max), and
  conflict avoidance for parallel dispatch all represent real-world patterns that reconcile's
  design omits or underspecifies. The CE ce-work-beta shipping-workflow Phase 3 Residual Work
  Gate is a third analogue: its 'Accept and proceed' path explicitly mandates a durable residuals
  sink (PR body or docs/residual-review-findings/). Three files were lifted verbatim; be-civic
  files matched 'reconcil' in grep but only in sprint/roadmap prose, not as a functional primitive.
  Published SDD literature (Thoughtworks, arxiv 2602.00180) confirms the amendment-vs-rework
  decision fork and the 'living spec' discipline. Confidence in primitive/mode is high (collaborative
  skill confirmed by all analogues). Challenge findings are high-confidence and cite specific gaps
  against the lifted sources. Translator can proceed directly to synthesis; operator should review
  Challenge findings before v1.0.
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
design doc explicitly ("collaborative"). The gstack /review skill and CE ce-resolve-pr-feedback
are both collaborative (operator-in-loop at high-impact gates), confirming the primitive choice.

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

## External analogues searched

Record of the real-world search performed 2026-06-03 against all required corpora.

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills (`/home/gstack/.claude/skills/gstack/`) | grep for "reconcil", "spec.*gap", "drift", "adjudicat", "amend.*spec", "rework", "pre.*land", "commit.*gate" across all SKILL.md files | yes — `review` (Plan Completion Audit, Scope Drift Detection, high-impact gate), `ship` (scope-drift + plan completion + pre-landing review), `document-release` (post-ship doc sync) | `gstack-review-SKILL.md` (primary analogue) |
| CE plugin (`/home/gstack/scratch/ce-plugin/plugins/compound-engineering/skills/`) | same grep; targeted reads of `ce-resolve-pr-feedback/references/full-mode.md` and `ce-work-beta/references/shipping-workflow.md` | yes — `ce-resolve-pr-feedback` (finding triage + three-verdict adjudication + loop bounding), `ce-work-beta` shipping-workflow (Residual Work Gate + durable residuals sink) | `ce-resolve-pr-feedback-full-mode.md`, `ce-work-beta-shipping-workflow.md` |
| be-civic harness (`/home/gstack/projects/be-civic/`) | grep for "reconcil", "spec.*gap", "drift", "adjudicat" across .md files | matched sprint/roadmap prose only — no primitive implementing the reconcile job | — |
| Published best practice (web) | Thoughtworks "spec-driven development 2025"; arxiv 2602.00180 "Spec-Driven Development"; Agile "definition of done vs acceptance criteria"; "implementation drift adjudication rework loop" | yes — SDD literature confirms amendment-vs-rework fork, living-spec discipline, iterative validation gate; Agile DoD/AC confirms the gate-before-merge pattern | — (web; cited in Challenge findings) |

**Primary analogue:** gstack `/review` skill — its Plan Completion Audit (Step 1.5) and Scope Drift Detection sections implement the identical job at the pre-land stage: compute the intent-vs-built diff, classify findings, hold the operator at high-impact discrepancies with a structured three-path gate.

**Secondary analogues:** CE `ce-resolve-pr-feedback` (finding triage + bounded rework loop) and CE `ce-work-beta` shipping-workflow Residual Work Gate (explicit accept-and-record path).

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/gstack-review-SKILL.md` | keep | Primary analogue. Plan Completion Audit and Scope Drift Detection sections (lines 780–1036) are the strongest external counterpart to reconcile's draft + adjudicate + enact arc. Also confirms AskUserQuestion as the blocking gate mechanism. |
| `source-material/ce-resolve-pr-feedback-full-mode.md` | keep | Second analogue. Contributes: three-verdict taxonomy (fixed/declined/needs-human), explicit loop bounding (3 rounds then escalate), conflict-avoidance for parallel dispatch, structured decision_context for human-escalation items. |
| `source-material/ce-work-beta-shipping-workflow.md` | keep | Third analogue. Contributes: Residual Work Gate (4-path blocking gate after review), durable residuals-sink requirement (PR body or docs/residual-review-findings/), explicit recording obligation on 'Accept and proceed' path. |
| `docs/dev-sprint-backbone-design.md` (### reconcile + "The gates" + "Process-edge wiring") | keep | Authoritative design: modes, edges, goal, gate role, carrier contract. In-repo, not an external analogue. |
| `docs/graph-map.md` (reconcile backbone row + shared sub-nodes table) | keep | The reconcile row (invokes, goal summary) + sub-node entries confirm edge targets exist. In-repo, not an external analogue. |

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
- gstack `/review`'s commit/push/PR creation steps — those belong in `land` and `pr-author`.
- gstack `/review`'s Greptile integration and coverage audit — those are code-review concerns, not spec-reality concerns; belong in `review` or `build`.
- CE `ce-resolve-pr-feedback`'s cluster analysis and parallel dispatch — concern of the resolution agent (spec-diff), not the orchestrating skill.

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
invoked by reconcile) — not collapsed here. This is confirmed by the analogues: gstack
`/review` and CE `ce-work-beta` both keep the "compute diff + adjudicate + enact" arc as
a single skill, routing to separate sub-skills/agents for mechanical steps.

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

## Challenge findings

*These findings compare the current node canonical against the real-world analogues lifted above.
None modifies the canonical file — they are recommendations for the translator and operator.*

### CF-1 (high) — No verification taxonomy; findings lack severity classification
**Analogue:** gstack `/review` SKILL.md, Plan Completion Audit section (lines 918–928).

The analogue uses a five-status taxonomy: DONE / PARTIAL / NOT DONE / CHANGED / UNVERIFIABLE. Each status has a defined meaning and a verification dispatch rule (DIFF-VERIFIABLE vs CROSS-REPO vs EXTERNAL-STATE). Crucially, UNVERIFIABLE items carry an explicit manual-check requirement surfaced to the operator.

Reconcile's `draft` mode delegates comparison to `spec-diff` and describes its output as `satisfied / partial / missing / contradicted / out-of-scope`. This is a reasonable taxonomy, but the current canonical does not define severity (HIGH / MEDIUM / LOW) for findings, does not specify which findings block adjudication vs which are informational, and does not define a CHANGED/UNVERIFIABLE class for findings where the spec requirement was met by a different implementation than described.

**Specific gap:** There is no CHANGED status (analogous to "implemented differently but goal met") and no UNVERIFIABLE class (analogous to "cannot verify against the diff alone — requires manual check"). Without these, the operator cannot distinguish "built the wrong thing" from "built the right thing differently" — a high-impact silent ambiguity.

**Recommendation:** Add a severity field to the spec-diff output contract and define at least a CHANGED/ALTERED path alongside the existing amend/fix/accept. Define what "unverifiable" means for spec touchpoints that cannot be diff-checked.

---

### CF-2 (high) — Accepted drift has no durable sink
**Analogue:** CE `ce-work-beta` shipping-workflow (lines 53–56, "Accept and proceed" path).

The CE analogue is explicit: when findings are accepted, the accepted residuals must be recorded durably — either in the PR body (a "Known Residuals" section) or in `docs/residual-review-findings/<branch-or-head-sha>.md`. The durable record is a hard requirement, not optional. "The user has acknowledged the risk, but the findings must not live only in the transient session."

Reconcile's `accept` path says: "note the accepted drift in the stage output." This is a transient note — it lives in the conversation context, not in any durable store. After the session ends, the accepted drift is unrecoverable.

**Specific gap:** There is no durable sink for accepted drift. A future operator or auditor cannot determine which spec-reality gaps were knowingly accepted and which were simply never surfaced.

**Recommendation:** Add a durable-record step to the accept path. The natural sink is `docs/decisions.md` (already used by `log-decision`), where accepted items should be recorded alongside the adjudicated items. Or define a separate `reconcile-accepted-drift.md` in the work-item's artefacts. The record should include: the finding description, the spec touchpoint, and the operator's stated rationale for acceptance.

---

### CF-3 (high) — Rework loop is unbounded without a concrete escalation trigger
**Analogue:** CE `ce-resolve-pr-feedback` full-mode.md (lines 265–267, "After the second fix-verify cycle").

The CE analogue specifies: "After the second fix-verify cycle (3rd pass would begin): Stop looping. Surface remaining issues to the user with context about the recurring pattern." It provides a maximum round count and an explicit escalation: "Multiple rounds of feedback on [area/theme] suggest a deeper issue. Here's what we've fixed so far and what keeps appearing."

Reconcile's fix-build path says: "The loop is bounded — each pass resolves the identified gaps. If the same gaps recur across multiple passes, surface an escalation to the operator before re-entering build again." This is weaker: it names the concept but gives no concrete bound (how many passes?), no concrete escalation format, and no criterion for detecting "same gaps" vs new gaps that happen to look similar.

**Specific gap:** No concrete maximum pass count, no gap-identity criterion, and no required escalation format. An operator cannot tell when the loop is legitimately converging vs stuck.

**Recommendation:** Add a concrete loop bound (e.g., after 2 fix-build passes, stop and surface a recurring-pattern brief before re-entering). Define the gap-identity criterion: a gap "recurs" if its spec touchpoint and status (partial/missing/contradicted) appear in the same slot across two passes. Name the escalation artefact (e.g., a rework-loop-stall item in `log-decision`).

---

### CF-4 (medium) — adjudication gate lacks a structured decision context for human escalation
**Analogue:** CE `ce-resolve-pr-feedback` full-mode.md (lines 294–303, "needs-human" path).

The CE analogue defines a `decision_context` field returned by each resolution agent on a `needs-human` verdict: "what the reviewer said, what the agent investigated, why it needs a decision, concrete options with tradeoffs, and the agent's lean if it has one." The `decision_context` is presented to the operator for a fast decision.

Reconcile's `adjudicate` mode holds the operator in the loop for each finding, but there is no defined format for what reconcile presents when a finding cannot be cleanly adjudicated — e.g., when the spec is ambiguous and the operator needs additional context to decide amend-spec vs fix-build. The skill surfaces the `spec-diff` report and reconcile's interpretation, but does not define a structured format for hard/ambiguous cases.

**Specific gap:** No structured format for "I cannot recommend a path on this finding — here is the context you need." The operator may receive an unstructured wall of analysis text for hard cases, making fast decisions harder.

**Recommendation:** Define a structured escalation format for findings reconcile cannot confidently recommend a path for, analogous to CE's `decision_context`: finding description, spec touchpoint, what the build does, why the path is ambiguous, and reconcile's lean (if any). This becomes the input to the operator's AskUserQuestion gate.

---

### CF-5 (medium) — CHANGED status (good-enough alternative implementation) is absent
**Analogue:** gstack `/review` SKILL.md, Cross-Reference Against Diff section (line 923).

The gstack analogue defines CHANGED as: "The item was implemented using a different approach than the plan described, but the same goal is achieved." It instructs: "Be generous with CHANGED — if the goal is met by different means, that counts as addressed."

Reconcile's `satisfied / partial / missing / contradicted / out-of-scope` taxonomy has no equivalent of CHANGED. If the build implements a spec requirement correctly but using a different mechanism (e.g., the spec said "Redis queue" but the build uses Sidekiq), reconcile would classify this as `partial` or `contradicted`, potentially triggering an amend-spec adjudication that is actually unnecessary.

**Specific gap:** Treating valid alternative implementations as `contradicted` generates false-positive adjudication work and pollutes the spec-amendment queue with trivial amendments.

**Recommendation:** Add a CHANGED/ALTERED status to the `spec-diff` output contract and instruct reconcile's `draft` mode to present CHANGED findings with a "goal met by different means — no adjudication needed unless the operator objects" default path.

---

### CF-6 (low) — No "clean diff fast path" SLA
**Analogue:** gstack `/review` SKILL.md, Scope Drift Detection (line 832: "This is INFORMATIONAL — does not block the review").

The gstack analogue makes the clean-diff fast path explicit: scope drift is informational and does not block review. This is a deliberate design choice to prevent false-positive gates from slowing the flow.

Reconcile names the clean-diff fast path ("If all_satisfied: true with no unintended scope and no operator concerns, the diff is clean — skip to Phase 3 (enact), accept path") but does not make it equally explicit that a clean diff should be fast and non-interactive. An operator could interpret the current canonical as requiring operator confirmation even on a clean diff.

**Specific gap:** The clean-diff path could be misread as requiring explicit operator sign-off before surfacing the commit-to-land gate.

**Recommendation:** Strengthen the clean-diff language to match gstack's explicit "this is informational, does not gate" framing: on a clean diff, reconcile auto-advances to the commit-to-land gate presentation without requiring operator confirmation of the diff itself.

---

### CF-7 (low) — Spec-driven development literature: "every PR changing behavior must update the spec in the same PR" is not addressed
**Analogue:** Spec-Driven Development best practice (Thoughtworks 2025; arxiv 2602.00180).

The SDD literature identifies the single biggest failure mode as "write a spec once and never update it." The fix it names: "enforce a rule that every pull request changing behavior must update the spec in the same PR." The key discipline: the spec is a version-controlled living artifact, not a frozen planning output.

Reconcile's amend-spec path raises a separate PR to the spec-amendment queue for the curator's `integrate` gate. This is architecturally sound (gated spec changes) but creates an inherent temporal gap between code landing and spec updating. The current canonical does not address whether the work-item's spec-amendment PR is a blocking dependency for `land` or merely queued for later integration.

**Specific gap:** It is unclear whether landing the code without the spec amendment merged creates an intentional "spec lags code" state (acceptable if the queue drains fast) or an untracked drift state (a violation of the SDD discipline).

**Recommendation:** Add a note in the amend-spec path stating the current design's stance: spec amendments are queued separately and the code may land before the spec integrates. Name this as a known design choice with its rationale (gated queue integrity) rather than leaving it implicit. If the stance changes (e.g., spec must land with code), this becomes a blocking dependency on the curator's `integrate` gate.

---

## Open questions

- (From original report) None on design. F7 edges are deferred by instruction.
- (From backfill) CF-1: Should `spec-diff` add a CHANGED/ALTERED status and severity classification, or should `reconcile` interpret raw `spec-diff` output and assign these? This affects whether the contract change lands in `spec-diff.md` or `reconcile.md`.
- (From backfill) CF-2: Which store is the canonical durable sink for accepted drift — `docs/decisions.md` (via `log-decision`) or a separate artefact? If `log-decision` is the sink, the `log-decision` invocation in `adjudicate` mode already covers it; the gap is just the current omission of `accept`-path items from the `log-decision` call.
- (From backfill) CF-3: The rework loop bound — is 2 passes the right default, or does the backbone design intend a different mechanism? This may require an operator decision before the node reaches v1.0.
