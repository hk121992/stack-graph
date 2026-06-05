---
title: Build node — research report
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-04
amended:
  - date: 2026-06-03
    note: "Backfill — external analogue search added (ce-work, Anthropic best-practices, tracer-bullet methodology); source-material lifted; Challenge findings section authored; report deepened to full template structure."
  - date: 2026-06-03
    note: "Reconciliation fold-in — CF-1..CF-6 marked ACCEPTED/APPLY with resolutions (per docs/research-backfill-reconciliation.md A-cluster); D57 single-agent-implementable IU + tokens_per_iu emission folded into Contract + body-relevant sections; serial mode re-framed to one-IU-one-fresh-context default. CF-7 (low) left as-is. IU-schema now carries acceptance_check + the single-agent invariant (v0.2.0)."
  - date: 2026-06-04
    note: "Incremental-arc amend (D56, docs/incremental-improvement-design.md §4/§8.5/§9-R4) — build is now REUSED across two arcs. Added composes-into {incremental, stage: build} (second arc) + references carrier-interface (on-demand). Body gained an 'Incremental arc — build mode' section: the tracer-bullet inner loop (TRACER BULLET → INCREMENTAL → REFACTOR → DONE, vertical-not-horizontal + minimal-code rules, non-code analogue), the slice_type: HITL pause, and carrier consumption via the carrier-interface (reads carrier_kind/arc; standalone fields only behind a carrier_kind check; unit-complete + stage events carrier-keyed by id+kind+arc). Dev-sprint behaviour unchanged; review→build fix loop reused as-is. Node bumped v0.1.0 → v0.2.0."
  - date: 2026-06-05
    note: "test-discipline reference wiring — added references: test-discipline (load: on-demand). The Pocock-derived test-quality standard (graph/_refs/test-discipline.md) now governs the SHAPE of the tests build writes; build owns the RED→GREEN→REFACTOR ORDER, the reference owns test quality. Body gained a 'Test shape — test-discipline' bullet in the tracer-bullet loop. Surgical edge+pointer amend (not a full re-render); loop mechanics unchanged."
sources_lifted: 5
external_analogue_found: true
external_corpora_searched:
  - "CE plugin (ce-work, ce-work-beta, ce-worktree skills)"
  - "gstack live skills (investigate, ship)"
  - "be-civic operational harness (bc-operations, bc-workspace)"
  - "Anthropic Claude Code best-practices docs (code.claude.com/docs/en/best-practices)"
  - "aihero.dev tracer-bullets article"
  - "The Pragmatic Programmer tracer-bullets chapter (flylib.com)"
researcher_adequacy_note: |
  Six corpora were searched: the CE plugin skill tree (ce-work, ce-work-beta, ce-worktree —
  the primary analogue), the gstack live skill set (investigate, ship — partial analogues for
  autonomous span disciplines), the be-civic operational harness (no direct counterpart found),
  the Anthropic Claude Code best-practices documentation (canonical verification-gated done
  signal and adversarial review guidance), and two published methodology sources (aihero.dev
  tracer-bullets article and The Pragmatic Programmer tracer-bullets chapter). Five sources were
  lifted verbatim into source-material/. ce-work/SKILL.md is the strongest analogue — it
  directly implements the build node's job with more mechanical specificity than the node
  currently carries. Edges were determined from the node's existing frontmatter plus the
  seams visible in ce-work's input/output contract. Confidence in the skill/collaborative
  primitive-mode pair is high (build is clearly invoked in current context, not dispatched
  autonomously). Goals were straightforward to frame as outcomes against the IU acceptance-
  criteria pass rate and review re-entry rate. Recommendation: proceed to translator with the
  Challenge findings section as the primary input for node improvement — the gaps are
  actionable, not structural.
---

# Build — research report

## Identity

**Candidate id:** build
**Candidate title:** Build
**Scope:** The build node is the execution stage of the dev-sprint arc. It takes a settled plan — a carrier and the implementation units (IUs) it decomposes the work into — and delivers the planned change to spec across a long autonomous span. It opens collaboratively (read the work, confirm scope and mode), then hands off to an unattended autonomous span. The span completes when every IU passes its stated acceptance criteria, evidenced. Build does not plan, does not review, and does not write the carrier; it emits unit-complete and stage-complete events that the projection picks up. The node is explicitly bounded by the IU's `files` scope field — work outside that scope requires operator contact before expansion.

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Each implementation unit is delivered to its stated acceptance criteria, spec-faithfully, without operator hand-holding through the autonomous span. | IU acceptance-criteria pass-rate at handoff to review; review findings per IU traced to a spec deviation present in the implementation (not a spec gap). | Spec-deviation findings at review trend below the pre-build baseline over N sprints; a build span that routinely fails acceptance criteria it could have verified itself is a process gap, not a capability gap. |
| Rework is caught and fixed within the build span, not deferred to review. | Fraction of IUs requiring a review→build re-entry vs units where build caught and resolved the issue in-span; average re-entry count per IU. | Re-entry rate trends down as the span matures; a span that never self-corrects despite clear acceptance criteria is a calibration signal for the autonomous depth setting. |
| The per-IU build cost is measured so the single-agent context budget is an empirical dial and decomposition quality is observable (D57). | `tokens_per_iu` emitted on each unit-complete event into the analytics product-outcomes stream; `measure-outcomes` derives the distribution and the over-budget share against the harness budget. | Over-budget share trends toward zero as decomposition matures; a persistently high share is a `plan` decomposition-quality signal (IUs drawn too coarse), the same shape as "weak acceptance is a *plan* gap, not a *build* gap" — not a build capability gap. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** Build is invoked in the current operator context (not dispatched to an isolated agent), opens with a collaborative kick-off, and then runs an autonomous span. The collaborative opening and the requirement to surface blockers to the operator mean this is a skill, not an agent. The autonomous span is a *phase* of the skill, not a separate primitive — it runs within the same context, not in an isolated context window. The C→A (collaborative-to-autonomous) classification in the design doc is an internal phase transition, not a primitive change.

**`determinism:`** `generative`

**Rationale:** Build is generative: given an IU and its acceptance criteria, it synthesises the implementation. The acceptance criteria gate the output, but the implementation path is not predetermined.

## Contract

**Input:** A settled carrier with `lifecycle_state: committed` (or equivalent), its `children[]` IU records (each with `id`, `goal`, `files`, `dependencies`, `acceptance`, **`acceptance_check`** — the runnable command(s) that prove `acceptance`, now carried by `IU-schema` v0.2.0 — and `size`), and the operator's mode confirmation. Build imports the `IU-schema` reference and may invoke `explore` scoped to the IU's target area before the autonomous span begins.

**Default execution model (D57 / CF-3):** **one IU = one fresh agent context.** Serial-subagent dispatch for dependent sets (each subagent gets the IU's full context bundle, fresh context, returns a unit-complete summary); parallel-subagent for independent sets (the existing worktree-isolated path). Main-thread `inline` is the **exception** — a single tiny (XS/S) unit, or when the operator deliberately wants context carry-forward between two tightly-coupled units. The mode is confirmed at kick-off, but the default is fresh-context-per-IU, not main-thread serial.

**Output:** The IU set delivered — each unit passing its stated acceptance criteria, evidenced. A **unit-complete event per IU** carrying the IU `id`, the **raw output of the IU's `acceptance_check`** (test stdout / exit code — acceptance evidence is *shown, not asserted*, CF-1), and **`tokens_per_iu`** (the per-IU build token cost, emitted into the analytics product-outcomes event log — D57). A stage-complete event when all units are done. **Incremental commits** through the span — one conventional commit per IU on acceptance + tests-pass (CF-6). In the parallel path, a merged result assembled from per-worktree worker outputs in dependency order, after the worktree-teardown sequence (CF-5). A blocker report if a scope expansion or spec deviation cannot be resolved in-span.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| CE plugin — ce-work, ce-work-beta, ce-worktree skills | Implementation execution loop from a plan; inline/serial/parallel dispatch; worktree isolation; scope control; blocker surfacing | yes | ce-work-SKILL.md; ce-work-shipping-workflow.md |
| gstack live skills — investigate, ship | Autonomous span discipline; Iron Law no-fix-without-root-cause; acceptance-gated done signal | partial (investigate = debug arc, not build; ship = post-build) | — |
| be-civic operational harness (bc-operations, bc-workspace, be-civic-plugin-dev) | Operational counterpart to the build stage in a real harness | no direct counterpart found | — |
| Anthropic Claude Code best-practices docs (code.claude.com/docs/en/best-practices) | Verification-gated done signal; explore/plan/implement separation; adversarial review subagent; context management; parallel sessions; worktree pattern | yes | anthropic-best-practices-build-patterns.md |
| aihero.dev — tracer-bullets article | Tracer-bullet discipline for AI agents; scope discipline; vertical slicing; feedback loops; context-window constraints | yes | aihero-tracer-bullets.md |
| The Pragmatic Programmer — tracer-bullets chapter (flylib.com) | Tracer-bullet concept origin; done-signal definition; feedback-loop model; distinction from prototyping | yes | pragmatic-programmer-tracer-bullets.md |

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/ce-work-SKILL.md` | keep | Primary analogue. Directly implements the build node's job: input-from-plan, task-list loop, inline/serial/parallel strategy with worktree isolation, Parallel Safety Check, file-collision detection, per-IU incremental commit, 80%-done anti-pattern. Richer mechanical discipline than the current build node. |
| `source-material/ce-work-shipping-workflow.md` | edge-only | Covers the post-span quality/review/ship workflow — the part that comes after build completes. This is the `review` node's domain in stack-graph, not build's. Only the Phase 3 step "run tests, verify acceptance" has build-time relevance. |
| `source-material/anthropic-best-practices-build-patterns.md` | keep | Canonical Anthropic guidance on verification-gated done signals (the `/goal` condition and Stop hook model), adversarial review subagent, common failure patterns (trust-then-verify gap, infinite exploration), context management. Directly challenges the build node's acceptance-check and blocker-surfacing design. |
| `source-material/aihero-tracer-bullets.md` | keep | Applied challenge source: vertical slicing vs horizontal layering within an IU, mandatory feedback loops, "outrunning your headlights" failure mode. Challenges the build node's IU isolation model. |
| `source-material/pragmatic-programmer-tracer-bullets.md` | keep | Methodology source for the done-signal model: a tracer is complete when all components are connected end-to-end, not when effort is expended. Grounds the acceptance-driven done signal. Distinguishes tracer code (production-grade, lean) from prototype (disposable). |

## Keep / Drop

**Kept (absorbed into body from source material):**
- Verification-gated done signal, **evidence shown not asserted** (CF-1, ACCEPTED): build reads `acceptance_check` from the IU (now in `IU-schema`), runs it, and the unit-complete event carries the **raw output** (test stdout / exit code), not a prose assertion. Norm: "acceptance evidence is shown, not asserted."
- **In-span adversarial review** (CF-2, ACCEPTED, RECOMMENDED): after an IU passes its acceptance check and before emitting unit-complete, dispatch a lightweight fresh-context reviewer subagent against the IU diff + acceptance criteria. Cost-gated (recommended for M+ IUs). This is an **in-span pre-check**; it does **not** replace the downstream `review` stage. Described in prose as a dispatched subagent — not a graph node or edge.
- **One-IU-one-fresh-context as the default execution model** (CF-3 → D57, ACCEPTED): serial-subagent for 3+ dependent IUs (each subagent gets the IU's full context bundle, fresh context, returns a unit-complete summary), parallel-subagent for independent IUs (existing worktree-isolated path). Main-thread `inline` is reserved for a single tiny (XS/S) unit or deliberate context carry-forward between two tightly-coupled units. Serial-in-main-thread becomes the exception, not the rule.
- **Parallel Safety Check before parallel dispatch** (CF-4, ACCEPTED): (1) build a file-to-unit map from each candidate IU's `files`; (2) check for intersection; (3) overlap decision tree — overlap + worktree isolation available → proceed but log the predicted conflict for the merge step; overlap + isolation unavailable → downgrade that pair to serial with a logged reason; no overlap → safe. Name git-index contention + test interference as why shared-directory concurrency is unsafe.
- **Worktree teardown in the parallel post-merge sequence** (CF-5, ACCEPTED, order-bearing): unlock → remove worktree → `git branch -d` (lowercase `-d`). SAFETY: name the `-d` vs `-D` distinction explicitly — always lowercase `-d`, which refuses to delete unmerged branches.
- **Incremental-commit discipline within the autonomous span** (CF-6, ACCEPTED): commit per IU on acceptance + tests-pass, conventional message derived from the IU `goal`; in worktree-isolated parallel mode subagents commit within their branch, in shared-directory fallback only the orchestrator commits; no `WIP:` messages for these.
- **`tokens_per_iu` emission** (D57): build emits `tokens_per_iu` on each unit-complete event (the same event CF-1 adds raw evidence to) into the analytics product-outcomes event log. Self-contained in the build body — the analytics event log is the named destination; no new measure-outcomes / 06-analytics dependency or edge.
- Vertical slicing discipline (CF-7, low, unchanged): each IU should be an end-to-end slice, not a horizontal layer; the build span should catch integration failures within each IU, not defer them to review.
- **Incremental-arc build-mode (D56, ACCEPTED/APPLY):** when build is reached on the `incremental` arc with a `standalone-iu` carrier, it runs the **tracer-bullet inner loop** — TRACER BULLET (one test → RED → minimal code → GREEN, path proven end-to-end) → INCREMENTAL (each remaining acceptance behaviour: RED → GREEN, one test at a time, minimal code, no speculation) → REFACTOR under green → DONE (every acceptance condition is an observable passing test AND `verification.end_to_end` demonstrable → emit unit-complete). Ordering rule = **vertical not horizontal** (never all-tests-then-all-code); minimal-code rule; non-code-slice analogue = "one verifiable claim → one edit → confirm," `verification` fixture as the test. This is the build-mode for `arc: incremental` only; the dev-sprint multi-IU behaviour is unchanged. Maps onto build's existing acceptance-driven done signal — the addition is the ordering + minimal-code rules, not a schema field or new nodes. (Generalises CF-7's vertical-slice discipline into the incremental arc's delivery contract.)
- **`slice_type: HITL` pause (D56, ACCEPTED/APPLY):** build reads `slice_type` (a standalone-IU field) and **pauses at the named human decision point** when the slice is HITL; AFK runs unattended end-to-end. A HITL point that is a genuine design fork is a *promote* signal, not a build decision.
- **Carrier consumption via the carrier-interface (D56 / §9-R4, ACCEPTED/APPLY):** build consumes its carrier through the explicit **carrier-interface** — reads `carrier_kind`/`arc`, and the standalone fields (`improves`, `slice_type`, `verification`) **only behind a `carrier_kind` check**; never assumes work-item fields. unit-complete + stage events are **carrier-keyed** (carrier id + `carrier_kind` + `arc`) so the projection keeps the two arcs' `current_stage` separate.

**Dropped (out of scope for this node):**
- Phase 3-4 shipping workflow from ce-work (quality check → code review → PR creation): this is the `review` / `ship` nodes in stack-graph, not the build node's job.
- Figma design sync from ce-work: product-UI-specific, not general to the build node.
- Codex delegation mode from ce-work-beta: a ce-specific external-tool dispatch pattern; not a concept the build node needs to absorb.
- Branch/PR naming conventions from ce-work Phase 1 Step 2: pre-execution environment setup; belongs in the carrier/harness onboarding, not in the build execution span.

**Edge only (separate node):**
- `debug` — ce-work's "diagnose and fix" loop and gstack's `investigate` (Iron Law: no fix without root cause) both point to a needed `debug` node that build invokes when a unit fails acceptance and the failure is not immediately diagnosable. Already named in build's process seams as wave-2; the external evidence confirms the gap is real.
- `review` — ce-work's post-span quality check and adversarial review subagent are the job of the `review` node. Already modelled as a `precedes` edge from build.

## Overlaps and seams

- **← `plan`** (`can-follow`): plan produces the carrier + IU children that build consumes. The IU-schema contract is the seam. Deferred to wiring pass.
- **→ `review`** (`precedes`): build hands the delivered IU set to review. Seam: stage-complete event. Deferred to wiring pass.
- **← `review` / ← `reconcile`** (`can-follow`, loops): review findings and reconcile rework decisions re-enter build at a specific IU. Seam: the re-entering IU record + the finding or rework brief. Deferred to wiring pass.
- **→ `debug`** (`invokes`, wave 2): when a unit's acceptance check fails and the cause is not quickly diagnosable, build invokes debug (root-cause-first fix discipline). Not yet authored.
- **`explore`** (`invokes`): build invokes explore scoped to the IU's `files` set during kick-off. Already declared.
- **`IU-schema`** (`references`, import): the schema governs every IU build consumes. Already declared.
- **`carrier-interface`** (`references`, on-demand, D56): the field-set build may assume about its carrier across both arcs — reads `carrier_kind`/`arc` and the standalone fields only behind a `carrier_kind` check. Added by the incremental-arc amend.
- **→ `incremental` arc** (`composes-into`, D56): build is reused as the incremental arc's execution stage; the standalone slice runs in build's inline mode. The forward entry `specify-slice → build` lives on specify-slice's side (`precedes`).

## Fit

Build belongs as a single node. It owns the entire execution span from kick-off to stage-complete event, with clearly distinct internal phases (collaborative kick-off, autonomous span). The three modes (inline / serial / parallel) are branches of the one body — they share the same goal (deliver IUs to acceptance) and the same metric (IU pass-rate at handoff). No mode earns a separate goal that would justify splitting into its own primitive. The 07-decomposition discriminator confirms: build has its own branching (mode selection at kick-off), its own sequencing (IU dependency order), and a measurable goal distinct from plan and review.

## Edges

This is the **complete** edge set (both arcs) so a re-render does not drop pre-existing edges:

| edge type | target id | rationale |
|-----------|-----------|-----------|
| invokes | explore | build invokes explore scoped to the IU's files area during kick-off when codebase context is needed |
| composes-into | dev-sprint (stage: build) | build is the execution stage of the dev-sprint arc |
| composes-into | incremental (stage: build) | **(D56)** build is REUSED as the execution stage of the incremental arc — the standalone slice runs in build's inline mode; one node, two arcs (carries two `composes-into` entries) |
| references | IU-schema (`load: import`) | the IU-schema governs every implementation unit build consumes; must always be present |
| references | instrumentation-preamble (`load: import`) | build-level injection; consistent with sibling node treatment (design.md, specify.md) |
| references | carrier-interface (`load: on-demand`) | **(D56)** the explicit field-set a reused node may assume — build reads `carrier_kind`/`arc` and the standalone fields only behind a `carrier_kind` check; consumed on-demand, not always-present |
| references | test-discipline (`load: on-demand`) | the test-quality standard governing the shape of the tests build writes (behaviour through public interfaces, mock at boundaries); read at the test-writing step, not always-present. build owns the RED→GREEN→REFACTOR order; the reference owns test quality |
| can-follow | review | fix loop: a review finding triggers review→build re-entry. **REUSED for the incremental arc unchanged** — the same review→build corrective loop serves both arcs (no new edge) |
| can-follow | reconcile | rework loop: a reconcile rework decision triggers reconcile→build re-entry (dev-sprint only) |
| precedes | review | build hands off to review after stage-complete (both arcs) |

The forward edge `specify-slice → build` (the incremental arc's entry into build) is declared as
`precedes: build` on **specify-slice's** side per the repo convention (forward edges live on the
source) — build adds **no** `can-follow: specify-slice`.

*(Deferred edges: `can-follow plan`, `invokes debug`, `references .worktreeinclude` — see Process seams in the node body.)*

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` + `collaborative` is the correct pairing for a node that is invoked in the current context and opens with an operator interaction before running an autonomous span.

**`goals:` as outcomes:** All three goals read as outcomes (spec-faithful delivery measured against IU pass-rate; in-span rework measured against review re-entry rate; per-IU build cost measured against the over-budget share — D57), not activities. Earns-keep thresholds are stated.

**Edge targets resolvable:** `explore` exists (`graph/explore/explore.md`). `IU-schema` exists (`graph/_refs/IU-schema.md`). `dev-sprint` exists. `review` and `reconcile` are declared as deferred wiring-pass edges. `debug` is deferred (wave 2). `instrumentation-preamble` is a build-level injection consistent with sibling nodes.

## Open questions

- **Context-degradation mitigation for long spans.** RESOLVED via CF-3 → D57: one-IU-one-fresh-context is now the default execution model (serial-subagent for dependent sets, parallel-subagent for independent), with main-thread `inline` reserved for a single tiny unit or deliberate carry-forward.
- **Acceptance evidence standard.** RESOLVED via CF-1 + D57: `IU-schema` v0.2.0 carries an `acceptance_check` field (the runnable command); build runs it and the unit-complete event carries the **raw output** as evidence — shown, not asserted. Build additionally emits `tokens_per_iu` on the same event into the analytics product-outcomes log (D57). (The earlier `acceptance_evidence_type` framing is superseded by the simpler `acceptance_check` runnable-command field.)
- **Simplify pass between IU clusters.** STILL OPEN (CF-8, low). ce-work includes a "simplify as you go" step after every 2-3 IUs — a cross-unit consolidation pass. Build does not. Is this in scope for the build node or deferred to a post-review reconcile pass? Not part of the accepted reconciliation batch; left for a later pass.
- **Post-deploy monitoring section in output.** STILL OPEN. ce-work's shipping workflow requires a "Post-Deploy Monitoring & Validation" section in the PR description for every change. Stack-graph's build node has no equivalent artefact in its output contract. Is this a gap or intentionally deferred to the `ship` node? Not part of the accepted reconciliation batch.

---

## Challenge findings

This section documents where the `build` node is weaker than its real-world analogues, what best practice it omits, and what structural gaps the external sources surface. Each finding is specific and cites the analogue.

### CF-1 No runnable verification gate (severity: high) — **ACCEPTED / APPLY**

**Resolution (folded in).** `IU-schema` v0.2.0 now carries an `acceptance_check` field (the runnable command that proves `acceptance`). Build reads `acceptance_check`, runs it, and the unit-complete event carries its **raw output** (test stdout / exit code), not a prose assertion. Body norm: **"acceptance evidence is shown, not asserted."** Reflected in the Contract output + Keep list above.

**Gap.** The build node defines the done signal as "every acceptance criterion in its `acceptance` field is satisfied — observable, checked, not assumed." But it does not prescribe *how* build verifies the criterion or what form the evidence must take. The operator or downstream review node is left to infer this.

**Analogue.** Anthropic best-practices (`anthropic-best-practices-build-patterns.md`) is explicit: "Give Claude a way to verify its work... Give Claude something that produces a pass or fail, and the loop closes on its own." The doc distinguishes four gating levels: in-prompt (run and iterate), `/goal` condition (evaluated after every turn), Stop hook (deterministic script gate), and adversarial review subagent (fresh model, not the implementing model). ce-work (`ce-work-SKILL.md`, System-Wide Test Check) adds a specific 5-question checklist: What fires when this runs? Do tests exercise the real chain? Can failure leave orphaned state? What other interfaces expose this? Do error strategies align across layers?

**Missing.** Build's acceptance check is under-specified. The node should require that each IU's `acceptance` field name the runnable check (test command, build command, diff script) and that build executes it and emits the output as evidence, not a summary assertion. The current body says "evidenced" but does not define what evidence is.

**Recommendation.** Add an `acceptance_evidence` norm to the build body: the unit-complete event must carry the raw output of the acceptance check (test output, exit code, etc.), not a prose assertion. The `IU-schema` should carry an `acceptance_check` field (the runnable command) alongside the existing `acceptance` field (the criteria text).

---

### CF-2 No adversarial review within the build span (severity: high) — **ACCEPTED / APPLY (RECOMMENDED)**

**Resolution (folded in).** Add a RECOMMENDED in-span adversarial review: after an IU passes its acceptance check, before emitting unit-complete, dispatch a lightweight fresh-context reviewer subagent against the IU diff + acceptance criteria. Cost-gated (recommended for M+ IUs). This is an **in-span pre-check** and does **not** replace the downstream `review` stage. It is a dispatched subagent described in prose — **not** a graph node or edge.

**Gap.** Build's autonomous span has no internal cross-check step. The node says "catch and repair in-span" but does not prescribe a mechanism for self-verification that is not authored by the same model instance that did the implementing.

**Analogue.** Anthropic best-practices (`anthropic-best-practices-build-patterns.md`, "Add an adversarial review step") is explicit: "Before treating a task as done, have a subagent review the diff in a fresh context and report gaps. A reviewer running in a fresh subagent context sees only the diff and the criteria you give it, not the reasoning that produced the change, so it evaluates the result on its own terms." The Anthropic doc names this as particularly important for longer autonomous runs: "The longer Claude works unattended, the more an independent check matters."

**Missing.** Build dispatches worker agents for parallel IUs, but those agents are implementing agents, not review agents. The node currently hands off to review (a separate arc node) as the only cross-check, but Anthropic's guidance is that an in-span check (subagent reviewer against the IU diff and acceptance criteria) should precede the review handoff.

**Recommendation.** Add a post-IU verification step to the autonomous span: after each IU passes its acceptance check, before emitting the unit-complete event, dispatch a lightweight review subagent against the IU's diff and acceptance criteria. This is the gstack `investigate`/`review` pattern applied within the span. The step is optional (cost trade-off) but should be named as a recommended practice for M+ sized IUs.

---

### CF-3 Context degradation unaddressed for serial multi-IU spans (severity: medium) — **ACCEPTED / APPLY → D57**

**Resolution (folded in).** Generalised by **D57**: **one-IU-one-fresh-context is the DEFAULT execution model**, not a serial-mode tweak. Serial-subagent dispatch for 3+ dependent IUs (each subagent gets the IU's full context bundle, fresh context, returns a unit-complete summary); parallel-subagent for independent IUs (existing worktree-isolated path). Main-thread `inline` is reserved for a single tiny (XS/S) unit or when the operator deliberately wants context carry-forward between two tightly-coupled units. The `serial` mode is re-framed accordingly — "main thread one after another" becomes the **exception**, not the default.

**Gap.** Build's serial mode describes "multiple IUs, running in the main thread one after another." For long serial spans (5+ IUs), context accumulation is the primary failure mode — the Anthropic best-practices doc calls this "the most important resource to manage" and notes that "LLM performance degrades as context fills."

**Analogue.** ce-work (`ce-work-SKILL.md`, Phase 1 Step 4) explicitly addresses this: "Serial subagents — 3+ tasks with dependencies between them. Each subagent gets a fresh context window focused on one unit — prevents context degradation across many tasks." ce-work dispatches serial *subagents* (not the same main thread) for dependent IUs precisely because context degradation is a real quality risk across many tasks.

**Missing.** Build's serial mode conflates "run in dependency order" with "run in the main thread." The analogues treat serial subagent dispatch (fresh context per IU) as the standard approach for 3+ IUs, not an optimization.

**Recommendation.** Revise serial mode: for spans with 3+ IUs, the default should be serial *subagent* dispatch (each subagent gets the full IU context bundle and returns a unit-complete summary) rather than main-thread serial execution. Main-thread serial should be reserved for 1-2 IUs or explicitly when the operator wants context carry-forward between units (e.g., a schema migration immediately followed by the code that uses it, where the context of the first step genuinely informs the second).

---

### CF-4 No Parallel Safety Check before parallel dispatch (severity: medium) — **ACCEPTED / APPLY**

**Resolution (folded in).** Add a **Parallel Safety Check before parallel dispatch**: (1) build a file-to-unit map from each candidate IU's `files`; (2) check for intersection; (3) overlap decision tree — overlap + worktree isolation available → proceed but log the predicted conflict for the merge step; overlap + isolation unavailable → downgrade that pair to serial with a logged reason; no overlap → safe. Name **git-index contention + test interference** as the reason shared-directory concurrency is unsafe.

**Gap.** Build's parallel mode says "independent IUs" and "no shared `files`" as the precondition, but the check is described as a pre-flight condition assessed at kick-off from the IU `files` fields. The node does not define what to do when overlap is discovered.

**Analogue.** ce-work (`ce-work-SKILL.md`, Parallel Safety Check) is specific: (1) build a file-to-unit mapping from every candidate unit's `Files:` section; (2) check for intersection; (3) if overlap AND worktree isolation unavailable: downgrade to serial with a logged reason; (4) if overlap AND worktree isolation available: proceed, log the predicted conflict so the merge step knows which branches to expect conflicts on; (5) additional risks even with no file overlap: git index contention and test interference — worktree isolation eliminates both.

**Missing.** Build's parallel mode does not describe how to detect overlap, what the decision tree is when overlap is found, how to handle git index contention in a shared-directory fallback, or how to clean up per-IU worktrees after merge (unlock → remove worktree → delete branch).

**Recommendation.** Add the Parallel Safety Check procedure to the parallel mode section, including the file-to-unit mapping step, the overlap decision tree (worktree-isolated vs shared-directory fallback), and the post-batch worktree cleanup sequence.

---

### CF-5 No worktree cleanup discipline in parallel mode (severity: medium) — **ACCEPTED / APPLY**

**Resolution (folded in).** Add **worktree teardown** to the parallel post-merge sequence (order-bearing): unlock → remove worktree → `git branch -d` (lowercase `-d`). SAFETY: name the `-d` vs `-D` distinction explicitly — always lowercase `-d`, which refuses to delete unmerged branches.

**Gap.** Build's parallel mode describes "merges completed units in dependency order before review handoff" but does not describe how per-IU worktrees are cleaned up after merge.

**Analogue.** ce-work (`ce-work-SKILL.md`, after-batch steps for worktree-isolated mode): after merging each branch — (1) run the test suite; (2) remove each subagent's worktree: `git worktree unlock <path>` then `git worktree remove <path>`; (3) delete the branch: `git branch -d <branch>` (lowercase `-d` refuses to delete unmerged branches, which is the safety the analogue preserves). Orphan branches and unlocked worktrees accumulate silently if this step is omitted.

**Missing.** Build's parallel mode body has no worktree cleanup step.

**Recommendation.** Add explicit worktree teardown to the parallel mode post-merge sequence: unlock, remove worktree, delete branch. Name the `-d` vs `-D` distinction explicitly (always lowercase `-d` to preserve the unmerged-branch safety check).

---

### CF-6 No commitment to incremental commits during the span (severity: medium) — **ACCEPTED / APPLY**

**Resolution (folded in).** Add **incremental-commit discipline** to the autonomous span: commit per IU on acceptance + tests-pass, conventional message derived from the IU `goal`. In worktree-isolated parallel mode subagents commit within their branch; in shared-directory fallback only the orchestrator commits. No `WIP:` messages for these.

**Gap.** Build emits a unit-complete event after each IU passes acceptance, but the node does not describe the commit discipline within the span. The operator does not know whether build commits after each IU or accumulates all changes until stage-complete.

**Analogue.** ce-work (`ce-work-SKILL.md`, Phase 2 Incremental Commits): "Logical unit complete + tests pass → commit. Cannot write a meaningful commit message → wait." The commit discipline is explicit: commit only when the IU passes its acceptance check and tests pass; do not commit broken state; do not use 'WIP' messages for incremental commits. In worktree-isolated mode, subagents may stage and commit within their worktree branch; in shared-directory mode, subagents do not commit — the orchestrator stages after the full batch.

**Missing.** Build's body has no explicit commit discipline. This is a real operational gap: the operator cannot reason about the git state during a long span, and the review node may receive an undivided diff rather than per-IU commits.

**Recommendation.** Add an "Incremental checkpoints" norm to the autonomous span section: after each IU passes acceptance, commit with a conventional message derived from the IU `goal`. In worktree-isolated parallel mode, subagents commit within their branch; the orchestrator merges in dependency order. In shared-directory fallback, only the orchestrating span commits.

---

### CF-7 Vertical-slicing discipline absent from IU design (severity: low)

**Gap.** Build's IU model describes each IU as scoped to a `files` set with a `goal` and `acceptance` criteria, but does not prescribe that each IU should be an end-to-end slice (the tracer-bullet model). An IU scoped to "all model layer files" with no integration test is a horizontal layer, not a tracer bullet.

**Analogue.** aihero.dev (`aihero-tracer-bullets.md`): "AI's natural inclination is to build big layers in isolation. You need to make it do an end-to-end slice across all the vertical layers." The Pragmatic Programmer (`pragmatic-programmer-tracer-bullets.md`): a tracer is "completed" when all major components are connected and functioning end-to-end. Horizontal layers that defer integration to a later IU create the "outrunning your headlights" failure mode.

**Missing.** Build's body does not challenge IU scope at kick-off: it reads IUs and flags thin `acceptance` criteria, but it does not flag IUs that scope to a single layer without naming the integration surface.

**Recommendation.** Add to the kick-off phase: when reviewing IU scope, flag IUs whose `files` set spans a single layer (e.g., only model files, only view files) and whose `acceptance` criteria have no integration check. Suggest to the operator that the IU be expanded to include a thin end-to-end slice (one interface path through the affected layers) before the span begins.

---

### CF-8 No "simplify as you go" pass between IU clusters (severity: low)

**Gap.** Build has no simplification step between IU clusters. Over a long parallel or serial span, patterns can diverge across IUs (each subagent working in isolation), leaving the delivered set with duplicated patterns and unconsolidated code.

**Analogue.** ce-work (`ce-work-SKILL.md`, Phase 2 Simplify as You Go): "After completing a cluster of related implementation units (or every 2-3 units), review recently changed files for simplification opportunities — consolidate duplicated patterns, extract shared helpers, and improve code reuse and efficiency. This is especially valuable when using subagents, since each agent works with isolated context and can't see patterns emerging across units."

**Missing.** Build's body has no cross-IU simplification step.

**Recommendation.** Add a post-cluster simplification pass (every 2-3 IUs or at a natural phase boundary) to the autonomous span discipline. This is especially relevant for parallel mode where subagents cannot observe each other's emerging patterns.
