---
title: Research report for lens-tests
type: research-report
status: complete
authored: 2026-05-30
last_updated: 2026-05-30
amended:
  - date: 2026-06-05
    note: "test-discipline reference wiring — added references: test-discipline (load: on-demand). The Pocock-derived test-quality standard (graph/_refs/test-discipline.md) is now the NAMED source the lens grades against; the tuned inline hunt-list is preserved and reframed as that standard's review-time application (one body line added before the hunt-list). on-demand (not import) — the lens already operationalises the rubric inline, so the reference is the consultable source of truth, not doubled standing context. Surgical edge+pointer amend."
sources_lifted: 6
researcher_adequacy_note: |
  Lifted six sources: CE's ce-testing-reviewer (the closest direct analog — an
  autonomous persona agent dedicated to the tests/coverage dimension), gstack's
  review/checklist.md (the test-gap + coverage suppression items from the diff-target
  hunt-list), a curated plan-eng-review test-review excerpt (the target: doc
  coverage-at-the-doc-stage signal — trace-every-codepath, the test-quality rubric, the
  regression rule), CE's findings-schema.json + subagent-template.md (the shared
  finding/dispatch contract the lens conforms to but does not own), and CE's
  persona-catalog.md (the always-on family framing). Edges were determined from
  docs/graph-map.md and the explicit modelling guidance, identical to the sibling
  lens-correctness: the only structural edge is composes-into the dev-sprint arc at the
  review stage (with design/plan as additional consumers via their own stages); the
  finding contract (findings-schema / severity-scale / confidence-anchors) is a
  kind: reference artefact in graph/_refs/ that the dispatching stage passes into the
  lens via its spawn prompt — the lens declares NO contract edge of its own; there is
  deliberately no edge to lens-dispatch (dispatch invokes the
  lens one-way — a back-edge would be an illegal structural cycle, D4). Confidence in
  primitive: agent / mode: autonomous / determinism: generative is HIGH — the testing
  reviewer is modelled identically to the correctness reviewer (fanned-out-to in isolated
  context, returns structured findings without conversing, hunt is judgment not
  algorithm). The goals were straightforward to frame as outcomes (changed behaviour
  lands with adequate coverage; escaped defects attributable to an unflagged coverage gap
  vs a baseline; finding precision — real gaps not test-count theatre) rather than the
  activity "reviews tests." One dimension-specific judgment call: much of this lens's
  honest output is coverage gaps rather than P0/P1 findings, so the body leans on the
  top-level testing_gaps[] soft bucket heavily — noted in Contract and Open questions.
  Recommendation: proceed to translator — the shape mirrors the well-attested template
  sibling; carry forward the testing_gaps-heavy output disposition and the
  target-parameterisation (diff = coverage of changed code; doc = testability of the
  proposed design).
---

# Research report for lens-tests

## Identity

**Candidate id:** lens-tests
**Candidate title:** Tests lens

**Scope:** One dimension of stack-graph's shared review lens-family (D27). An autonomous
agent the review orchestrator (following the `lens-dispatch` reference) fans out to in an isolated
context; it reads a target and returns structured findings, never conversing with the
operator. It hunts **test quality and coverage**: missing coverage for changed behaviour,
weak or missing assertions (tests that run but assert nothing meaningful), untested
error/failure paths, untested edge cases and boundaries, over-mocking that tests the mock
not the behaviour, flaky / non-deterministic test constructs, tests asserting
implementation detail rather than observable behaviour, and missing regression tests for
a fixed bug. It is **`target`-parameterised**: `target = diff` (the review stage — confirm
each changed branch and behaviour is exercised by a meaningful assertion) or `target =
doc` (the design/plan stage — hunt the testability of the proposed design and the test
scenarios it implies, before any code or tests exist). It is **one** family member; it
does **not** own family orchestration, fan-out, dedup, or severity-routing (those live in
the `lens-dispatch` reference the dispatching stage follows). It explicitly does **not** own
logic-correctness (a wrong branch → `lens-correctness`; this lens flags "no test covers
this branch", not "this branch is wrong"), security (→ `lens-security`), performance
(→ `lens-performance`), or the maintainability of test-code structure (→
`lens-maintainability`) — though weak assertions and wrong-thing-tested **are** this
lens's, not maintainability's.

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Changed behaviour lands with adequate coverage — every new branch, error path, and edge case is exercised by a meaningful assertion before the change reaches build/land | true-positive coverage gaps and weak-assertion findings per review that survive merge-triage (confidence ≥ 75 / routed to testing_gaps and acted on, not dropped by the validator) | sustains a non-trivial survived-finding rate AND a measurable rise in coverage of changed behaviour vs the pre-lens baseline over N sprints |
| Escaped defects are not attributable to a coverage gap the lens failed to flag — the change does not break in production through a path no test (and no lens) covered | escaped-defect rate attributable to an unflagged coverage gap (a production defect traced to a changed path this lens did not flag as untested) vs the transcript baseline | escaped-via-coverage-gap rate below baseline; if the lens never lowers it, it is cut or merged |
| Findings are real coverage gaps, not test-count theatre — the lens does not nag for coverage that already exists or demand tests of trivial code | false-positive / suppression rate at merge-triage (findings dropped by dedup, confidence-gate, or validator; coverage-percentage nags and trivial-getter findings count against it) | precision high enough that the lens's findings stay in the actionable / soft-bucket tier rather than being routinely demoted or suppressed as noise |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** The testing reviewer is modelled identically to its correctness sibling —
a sub-agent the orchestrator spawns in an **isolated** context (CE's
`ce-testing-reviewer` is a `model: inherit` reviewer agent with read-only tools plus
Write, returns JSON, makes no operator-facing prose; the CE subagent-template spawns it
via the platform Agent primitive with a scope-rules + output-contract bundle). It is
fanned-out-to, runs unattended, and returns a structured summary (findings JSON) — the
textbook autonomous-agent shape from
[concepts](../../handbook/content/01-concepts/) and the discriminator in
[decomposition](../../handbook/content/07-decomposition/) (the work does not benefit from
the live main thread, is fully describable in a prompt, and is parallelisable across the
lens family). It does **not** engage the operator — that is the consuming stage's job
(review/design/plan are the collaborative skills; the lens is their isolated worker).
Confidence is HIGH; there was no real ambiguity. The `primitive: agent` ↔ `mode:
autonomous` pairing satisfies the schema agreement constraint.

**`determinism:`** `generative`

**Rationale:** The hunt is **judgment**, not a fixed algorithm — "trace each new branch
and confirm at least one test exercises it; distinguish tests that catch real regressions
from tests that provide false confidence." Whether an assertion is meaningful, whether a
mock has swallowed the behaviour under test, and whether a coverage gap matters are all
judgments; two runs over the same diff can surface different gaps. The calibration (the
confidence anchors) is a self-applied behavioural rubric, not a deterministic
computation. (Contrast a coverage-percentage tool, which is deterministic — and which
this lens explicitly does **not** emulate.) The **aggregation** that consumes the findings
(dedup → corroborate → confidence-gate → severity-route) is deterministic, but that lives
in `merge-triage`/`lens-dispatch`, not in this node.

## Contract

**Input:** A spawn bundle from the consuming stage's dispatch block: the `target`
(`diff` or `doc`) and its contents, scope-rules (what is in/out of the change; base-ref
markers; untracked-scope notes), an optional intent/requirements summary, and the
finding contract (schema + severity scale + confidence anchors) — references the
dispatching stage passes in via the spawn prompt, not authored or imported by the lens.
Read-only tools
(Read, Grep, Glob, git/gh inspection); it may read code/context **outside** the target to
confirm a finding (e.g. follow a changed function to the test file that should cover it,
or trace whether an integration test exercises a user flow the diff touches).

**Output:** Structured findings conforming to the shared finding contract — per finding:
`title`, `severity` (P0–P3), `file`, `line`, `why_it_matters`, `autofix_class`, `owner`,
`requires_verification`, `confidence` (0/25/50/75/100 anchored), `evidence[]`,
`pre_existing`, optional `suggested_fix`; plus top-level `reviewer: "tests"`,
`residual_risks[]`, `testing_gaps[]`. **This lens leans on `testing_gaps[]` heavily** —
much of its honest output is coverage gaps (a changed branch with no test, a user flow
with no integration test) that surface in the soft bucket rather than as P0/P1 findings;
a missing regression test for a fixed bug and a false-confidence assertion that masks a
real defect are the cases that escalate to a primary finding. Self-suppresses anything
below the report threshold (anchors 0/25 dropped silently; 50 surfaces only as P0 or via
soft-bucket routing). No operator-facing prose; no mutation of the target. (Doc-target
findings reframe "file:line" to the doc location / section but keep the same schema.)

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/ce-testing-reviewer.md` | keep | Primary model for the body: hunt-list (untested branches, false-confidence/no-meaningful-assertion tests, brittle implementation-coupled tests, untested error paths, behavioural-change-with-no-test), per-anchor coverage calibration, non-flag list (trivial getters/setters, test-style preferences, coverage-percentage targets, unchanged-code debt), output shape. |
| `source-material/gstack-review-checklist.md` | keep (partial) | Source for the test-gap diff-target items: the Test-Gaps specialist category, the Completeness-Gaps coverage line (missing negative-path / edge-case tests that mirror happy-path structure — "lake not ocean"), and the test suppressions ("this assertion could be tighter" when it already covers the behaviour; "test exercises multiple guards simultaneously" is fine; eval-threshold changes are tuned empirically; anything already addressed in the diff). The SQL/race/enum/logic items are **out of scope** (owned by `lens-correctness`/`lens-security`). |
| `source-material/gstack-plan-eng-review-test-excerpt.md` | keep (partial) | Source for the `target: doc` mode — the trace-every-codepath coverage audit, the user-flow/interaction/error-state/boundary coverage map, the test-quality scoring rubric (★★★ edge cases AND error paths / ★★ happy path only / ★ smoke test), the E2E-vs-unit-vs-eval decision matrix, and the mandatory regression rule. Curated excerpt; the rest of the 93KB skill is operator-collaborative scaffolding, dropped. |
| `source-material/ce-persona-catalog.md` | keep (framing) | The always-on family framing + sibling boundaries; informs activation and the don't-double-flag discipline (logic to correctness, perf to performance, test-code structure to maintainability). Not absorbed as body text — it is family context. |
| `source-material/ce-findings-schema.json` | reference (spawn-passed) | The shared finding contract. A `kind: reference` artefact in `graph/_refs/`, passed into the lens via its spawn prompt by the dispatching stage; NOT absorbed and NOT an edge the lens declares. |
| `source-material/ce-subagent-template.md` | reference (spawn-passed) | The dispatch/spawn contract + confidence-anchor rubric. The confidence anchors are a `kind: reference` (`graph/_refs/confidence-anchors.md`) the dispatching stage passes into the lens's spawn prompt; the lens does not author or import them. |

## Keep / Drop

**Kept (absorbed into body):**
- The test/coverage hunt-list: missing coverage for a changed branch/behaviour;
  weak-or-missing assertions (a test that runs but only asserts it doesn't throw, asserts
  truthiness instead of a specific value, or mocks so heavily it verifies the mock not the
  code); untested error/failure paths (the happy path is tested, the sad path is not);
  untested edge cases and boundaries (empty/single/max-length/zero); over-mocking;
  flaky/non-deterministic test constructs; tests asserting implementation detail (exact
  mock call-counts, private-method tests, snapshot tests on internal structures,
  order-assertions where order doesn't matter); behavioural-change-with-no-test-additions;
  missing regression test for a fixed bug.
- The `target: doc` disposition: trace every proposed codepath and confirm the design
  implies a test for each branch/error-path/user-flow; the test-quality rubric (edge cases
  AND error paths vs happy-path-only vs smoke); the E2E/eval/unit decision; "a user flow
  with no test is as much a gap as an untested if/else."
- The mandatory regression rule: a change that modifies existing behaviour (or fixes a
  bug) with no test covering the changed path demands a regression test — escalate, do not
  silently soft-bucket.
- The non-flag / suppression discipline: no trivial-getter/setter findings, no
  test-style-preference findings (describe/it vs test(), AAA, file layout), no
  coverage-percentage-target nags (flag specific untested branches that matter, not
  aggregate metrics), no findings against unchanged untested code (pre-existing debt);
  plus the gstack test suppressions (assertion already covers the behaviour;
  multiple-guards-in-one-test is fine; tuned eval thresholds; already-addressed-in-diff).
- The self-applied confidence calibration for coverage (anchor 100 = test gap verifiable
  from the diff alone, e.g. a new public function with no test file; 75 = a provable
  untested branch / visibly vacuous assertion a normal path will hit; 50 = coverage
  inferred from file structure/naming, can't be certain no test exists; ≤25 = suppress).

**Dropped (out of scope):**
- All gstack/CE harness scaffolding: preamble, telemetry, AskUserQuestion flows, skill
  routing, gbrain/learnings wiring, checkpoint mode, the test-framework-detection bash and
  test-generation step, version/CI-pipeline specifics — these are product/harness, not
  factory-general, and most belong to the consuming stage, not the lens. (The lens flags
  gaps; it does not run the suite or write the tests.)
- The orchestration: fan-out, persona selection, dedup, cross-reviewer corroboration,
  severity-routing, validator gate — owned by `lens-dispatch` / `merge-triage`.
- The collaborative plan-review interaction (one-section-at-a-time, the coverage-diagram
  deliverable, ExitPlanMode gates) — that is the `plan`/`design`/`review` skills, not the
  autonomous lens. (The lens borrows the trace-every-branch *judgment*, not the
  interactive ASCII-diagram artefact.)

**Reference / not absorbed:**
- The finding contract (schema, severity scale, confidence anchors) → a `kind: reference`
  artefact in `graph/_refs/`, passed into the lens by the dispatching stage's spawn
  prompt; the lens declares no edge to it.
- The sibling lenses (`lens-correctness`, `lens-security`, `lens-maintainability`,
  `lens-performance`) → they are peers in the family, not things this node points at; the
  boundary between them is documented (don't double-flag), but there is no edge between
  siblings.

## Overlaps and seams

- **Upstream seam (dispatch → lens):** the consuming stage, following the `lens-dispatch`
  reference, **spawns** this lens one-way, passing the target + scope + contract into its
  spawn prompt. This lens declares **no** back-edge to dispatch — a back-edge would be a
  structural cycle (D4). (`lens-dispatch` is a reference the host follows, not a node the
  lens edges to.)
- **Downstream seam (lens → merge):** the lens returns findings to `merge-triage`
  (dedup/corroborate/gate/route), which is the dispatch machinery, not a node this lens
  edges to. The lens's only job is to emit conformant findings — with coverage gaps
  routed to the `testing_gaps[]` soft bucket.
- **Arc seam (lens → arc):** the lens **composes-into** the `dev-sprint` arc at the
  `review` stage (its primary home); `design` and `plan` are additional consumers (it
  composes into those stages too, with `target: doc`). Per graph-map, lenses compose into
  the arc **via their consuming stage**, not into the dispatch block.
- **Sibling seam:** tests has a precise boundary with `lens-correctness` — when the lens
  notices a branch is *wrong*, it flags only "no test covers this branch" and leaves the
  logic verdict to correctness; correctness, conversely, may note a `testing_gap` but
  defers coverage adequacy to this lens. With `lens-maintainability`: the *structure* of
  test code (helpers, duplication, naming) is maintainability's, but a weak assertion or a
  test asserting the wrong thing is **this lens's** — that is a coverage-quality question,
  not a code-style one. Cross-reviewer corroboration (handled by merge-triage) is the
  intended mechanism when two lenses flag the same region.
- **Harness seam:** product-specific lenses attach to the family as harness **overlays**
  (a new lens node + an edge registering it with the dispatch catalog); the vendored
  family — including this node — is never mutated.
- **Reference seam (`test-discipline`):** the lens's test-quality rubric — behaviour through public
  interfaces, mock-at-boundaries, design-for-testability — is single-sourced from the
  `test-discipline` reference (`graph/_refs/`), consumed via a `references` edge (`load: on-demand`).
  The reference is the **named standard**; this lens's hunt-list is its review-time application
  (`target: diff` = coverage of changed code; `target: doc` = testability of the proposed design). The
  inline hunt-list is preserved (it is finely tuned) and reframed as "graded against `test-discipline`",
  not deleted in favour of the reference. Shared with `build`, which draws on the same standard for the
  *shape* of the tests it writes.

**Single node, target-parameterised — confirmed.** Apply the
[decomposition](../../handbook/content/07-decomposition/) discriminator: it owns its own
branching (the coverage hunt and its calibration), has a distinct measurable goal
(escaped-via-coverage-gap rate; survived true-positive gaps), and is reused by ≥2
consumers (review, design, plan) — all three granularity signals (reuse, cohesion,
just-in-time) point to "own node." The diff-vs-doc split is **not** a node split: per D27
and the graph-map decision, collapse CE's doc/diff duplication into **one parameterised
lens** with a `target` mode in the body (D34 — one node, one primitive; `target` is a body
branch of the single lens node, never a separate node). It is a **leaf** in the structural skeleton:
fanned-out-to, returns a summary, edges minimal.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | `dev-sprint` (stage: review) | Primary home: the review stage fans out to this lens over a diff. Per graph-map, lenses compose into the arc via their consuming stage. |
| composes-into | `dev-sprint` (stage: design) | Additional consumer: design fans out to this lens over the design doc (`target: doc`) to hunt the testability of the proposed design. |
| composes-into | `dev-sprint` (stage: plan) | Additional consumer: plan-review fans out to this lens over the plan doc (`target: doc`, sequential surfacing). |

**Deliberately NO other edges:**
- **No edge to `lens-dispatch`.** The dispatching stage follows the `lens-dispatch`
  reference to spawn the lens one-way; the lens must not point back (structural cycle, D4).
- **No `references` edge for the finding contract.** `findings-schema` / `severity-scale`
  / `confidence-anchors` are `kind: reference` artefacts in `graph/_refs/`; the lens does
  **not** depend on them. The dispatching stage owns the `references` edges (with
  `load: import`) and passes the contract into the lens's spawn prompt. This is a
  deliberate modelling choice (see Open questions).
- **No `invokes` / `loads`.** The lens calls no other node and loads no other node into
  its context (it reads the target + the spawn-passed contract; everything else is inline read-only
  tool use / MCP-style inspection).
- **No `precedes` / `can-follow`.** It is a fanned-out-to leaf; it has no process
  position of its own. The process flow (review↔build correction loop) lives on the
  consuming stage, not the lens.

## Conformance

**`primitive:`↔`mode:` agreement:** `agent` ↔ `autonomous` — agrees (schema-valid).

**`goals:` as outcomes:** All three read as outcomes (changed behaviour lands with
adequate coverage; escaped-via-coverage-gap rate vs baseline; finding precision — real
gaps not test-count theatre), each with a metric and an earns-keep threshold. None are
activities ("reviews tests for coverage" was explicitly rephrased to the outcome "changed
behaviour lands with adequate coverage").

**Edge targets resolvable:** `dev-sprint` is the arc (composes-into targets an arc, which
the maintainer does not resolve to a file — per 02-graph-spec). No edge targets a missing
node. The finding contract is intentionally spawn-passed by the dispatching stage, not an
edge this lens declares.

## Open questions

- **Finding contract = reference, spawn-passed (RESOLVED).** The shared `findings-schema` /
  `severity-scale` / `confidence-anchors` are `kind: reference` artefacts in `graph/_refs/`
  (D33). The lens declares **no** edge to them: the dispatching stage holds the `references`
  edges (`load: import`) and passes the contract into the lens's spawn prompt (CE's pattern).
  Resolved to the reference/spawn model — the translator must not write a `{{placeholder}}`
  in the body nor a `references`/`uses-block` edge on the lens.
- **Output skews to `testing_gaps[]`, not P0/P1.** Unlike correctness (whose output is
  mostly primary findings), much of this lens's honest output is coverage gaps that belong
  in the top-level `testing_gaps[]` soft bucket — a changed branch with no test is rarely a
  P0 in its own right. The escalation cases are: a missing regression test for a fixed bug,
  and a false-confidence assertion that masks a defect a real scenario will hit (those are
  primary findings). Translator: instruct the body to route coverage gaps to
  `testing_gaps[]` and reserve P0/P1 findings for the escalation cases.
- **Target parameterisation in the body.** `target ∈ {diff, doc}` is a body branch of the
  single lens node (D34 — one node, one primitive), not separate nodes. For `diff` the hunt is "is each changed
  branch/behaviour exercised by a meaningful assertion." For `doc` the hunt shifts to "is
  the proposed design testable, and what test scenarios does it imply" (no tests exist yet).
  Keep the hunt's spirit identical; only the location-vocabulary (file:line vs doc-section)
  and the "tests exist vs tests proposed" framing differ.
- **Sibling boundary with `lens-correctness` and `lens-maintainability`.** The crisp rule:
  this lens flags "no test covers this branch" (coverage) and "this test asserts nothing /
  asserts the wrong thing" (test quality); it does **not** flag "this branch is logically
  wrong" (→ correctness) or "this test file is poorly structured / duplicated" (→
  maintainability). Note in the body so the reviewer keeps the framing and lets
  cross-reviewer corroboration at merge-triage handle genuine overlaps.
- **Model tier.** CE runs testing at the inherited (session) model alongside correctness.
  If a `model:` field is authored, lean to the strongest available tier; otherwise omit and
  let the consuming stage decide at dispatch. (Optional native field, not required.)
