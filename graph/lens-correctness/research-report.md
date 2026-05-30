---
title: Research report for lens-correctness
type: research-report
status: complete
authored: 2026-05-30
last_updated: 2026-05-30
amended: []
sources_lifted: 6
researcher_adequacy_note: |
  Lifted six sources: CE's ce-correctness-reviewer (the closest direct analog — an
  autonomous persona agent dedicated to the correctness dimension), gstack's
  review/checklist.md (the concrete diff-target hunt-list + suppression list), CE's
  findings-schema.json + subagent-template.md (the shared finding/dispatch contract the
  lens conforms to but does not own), CE's persona-catalog.md (the always-on family
  framing), and a curated plan-eng-review excerpt (the target: doc correctness-at-the-
  doc-stage signal). Edges were determined from docs/graph-map.md and the explicit
  modelling guidance: the only structural edge is composes-into the dev-sprint arc at the
  review stage (with design/plan as additional consumers via their own stages); the
  finding contract is injected as a {{findings-schema}}-style resolver BLOCK, not a
  references edge; there is deliberately no edge to lens-dispatch (dispatch invokes the
  lens one-way — a back-edge would be an illegal structural cycle, D4). Confidence in
  primitive: agent / mode: autonomous / determinism: generative is HIGH — every source
  models the lens as fanned-out-to in isolated context, returning structured findings
  without conversing, and the hunt is judgment not algorithm. The goals were
  straightforward to frame as outcomes (defects caught before they escape to build/land;
  true-positive survival through triage vs an escaped-defect baseline) rather than the
  activity "reviews code for correctness." Recommendation: proceed to translator — the
  shape is well-attested and the modelling decisions are settled; the one item to carry
  forward is the target-parameterisation (diff vs doc) as a body mode, noted in Open
  questions.
---

# Research report for lens-correctness

## Identity

**Candidate id:** lens-correctness
**Candidate title:** Correctness lens

**Scope:** One dimension of stack-graph's shared review lens-family (D27). An autonomous
agent the review orchestrator (the `lens-dispatch` block) fans out to in an isolated
context; it reads a target and returns structured findings, never conversing with the
operator. It hunts **logic and behavioural correctness**: logic errors, missed edge
cases, off-by-one / boundary mistakes, incorrect state handling and invalid state
transitions, swallowed or mishandled errors, broken error propagation, race conditions /
TOCTOU and ordering assumptions, null/undefined propagation, and contract violations
between caller and callee. It is **`target`-parameterised**: `target = diff` (the review
stage — trace concrete values through the changed code) or `target = doc` (the
design/plan stage — find missing edge cases, unhandled error/state paths, and
completeness gaps in the proposed logic before any code exists). It is **one** family
member; it does **not** own family orchestration, fan-out, dedup, or severity-routing
(those live in the `lens-dispatch` block and `merge-triage`). It explicitly does **not**
own security (injection/authz/secrets → `lens-security`), test coverage
(→ `lens-tests`), maintainability/complexity (→ `lens-maintainability`), or performance
(→ `lens-performance`); where checks straddle (e.g. SQL-string-interpolation, LLM-output
trust boundaries) it defers the security framing to its sibling and keeps only the
correctness framing (wrong result, swallowed failure).

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Real correctness defects (logic, edge-case, state, swallowed-error, boundary, race) are caught before they reach the build/land stages | true-positive findings per review that survive merge-triage (confidence ≥ 75 and not dropped by the validator) | sustains a non-trivial survived-finding rate AND a measurable drop in escaped correctness defects vs the pre-lens baseline over N sprints |
| The change lands with its correctness defects already surfaced, not discovered in production | escaped-correctness-defect rate (defects traced to a reviewed change that the lens did not flag) vs the transcript baseline | escaped-defect rate below baseline; if the lens never lowers it, it is cut or merged |
| Findings are trustworthy enough to action, not noise the operator must wade through | false-positive / suppression rate at merge-triage (findings dropped by dedup, confidence-gate, or validator) | precision high enough that the lens's findings are kept in the actionable tier rather than routinely demoted to advisory |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** Every source models this as a sub-agent the orchestrator spawns in an
**isolated** context (CE's `ce-correctness-reviewer` is a `model: inherit` reviewer agent
with read-only tools that returns JSON and makes no operator-facing prose; the CE
subagent-template spawns it via the platform Agent primitive with a scope-rules +
output-contract bundle). It is fanned-out-to, runs unattended, and returns a structured
summary (findings JSON) — the textbook autonomous-agent shape from
[concepts](../../handbook/content/01-concepts/) and the discriminator in
[decomposition](../../handbook/content/07-decomposition/) (the work does not benefit from
the live main thread, is fully describable in a prompt, and is parallelisable across the
lens family). It does **not** engage the operator — that is the consuming stage's job
(review/design/plan are the collaborative skills; the lens is their isolated worker).
Confidence is HIGH; there was no real ambiguity. The `primitive: agent` ↔ `mode:
autonomous` pairing satisfies the schema agreement constraint.

**`determinism:`** `generative`

**Rationale:** The hunt is **judgment**, not a fixed algorithm — "mentally execute the
code, trace inputs through branches, ask what happens when this value is X." Two runs
over the same diff can surface different findings; the calibration (the confidence
anchors) is a self-applied behavioural rubric, not a deterministic computation. (Contrast
the measure-vs-baseline nodes like `benchmark`/`health`, which are deterministic.) The
**aggregation** that consumes the findings (dedup → corroborate → confidence-gate →
severity-route) is deterministic, but that lives in `merge-triage`/`lens-dispatch`, not
in this node.

## Contract

**Input:** A spawn bundle from the consuming stage's dispatch block: the `target`
(`diff` or `doc`) and its contents, scope-rules (what is in/out of the change; base-ref
markers; untracked-scope notes), an optional intent/requirements summary, and the
injected finding contract (schema + severity scale + confidence anchors). Read-only tools
(Read, Grep, Glob, git/gh inspection); it may read code/context **outside** the target to
confirm a finding (e.g. trace a new enum value through every consumer, or check whether a
caller can actually pass null).

**Output:** Structured findings conforming to the shared finding contract — per finding:
`title`, `severity` (P0–P3), `file`, `line`, `why_it_matters`, `autofix_class`, `owner`,
`requires_verification`, `confidence` (0/25/50/75/100 anchored), `evidence[]`,
`pre_existing`, optional `suggested_fix`; plus top-level `reviewer: "correctness"`,
`residual_risks[]`, `testing_gaps[]`. Self-suppresses anything below the report threshold
(anchors 0/25 dropped silently; 50 surfaces only as P0 or via soft-bucket routing). No
operator-facing prose; no mutation of the target. (Doc-target findings reframe "file:line"
to the doc location / section but keep the same schema.)

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/ce-correctness-reviewer.md` | keep | Primary model for the body: hunt-list, per-anchor correctness calibration, non-flag list, output shape. |
| `source-material/gstack-review-checklist.md` | keep (partial) | Source for concrete diff-target checks (enum completeness, race/TOCTOU, status-transition atomicity, column-name safety, time-window, type-coercion, completeness gaps, swallowed errors) + the suppression/false-positive list. SQL-safety / shell-injection / XSS items are **edge-only** (owned by `lens-security`). |
| `source-material/gstack-plan-eng-review-correctness-excerpt.md` | keep (partial) | Source for the `target: doc` mode — edge-case/error-path/completeness disposition. Curated excerpt; the rest of the 93KB skill is operator-collaborative scaffolding, dropped. |
| `source-material/ce-persona-catalog.md` | keep (framing) | The always-on family framing + sibling boundaries; informs activation and the don't-double-flag discipline. Not absorbed as body text — it is family context. |
| `source-material/ce-findings-schema.json` | edge-only (block) | The shared finding contract. Injected as a `{{findings-schema}}`-style resolver BLOCK, NOT absorbed and NOT a `references` edge. |
| `source-material/ce-subagent-template.md` | edge-only (block) | The dispatch/spawn contract + confidence-anchor rubric. Owned by `lens-dispatch` (a block); the lens body references the anchors via the same block injection, not as its own content. |

## Keep / Drop

**Kept (absorbed into body):**
- The correctness hunt-list: off-by-one/boundary, null/undefined propagation, race
  conditions/TOCTOU/ordering, invalid state transitions and half-updated post-error
  state, broken error propagation (swallowed errors, fallback values that mask failures,
  wrong-handler error-code mapping), intent-vs-implementation mismatch.
- The concrete diff checks from the gstack checklist that are correctness (not security):
  enum/value completeness traced through every consumer, status-transition atomicity,
  column/field-name safety, time-window safety, type-coercion at boundaries, completeness
  gaps.
- The `target: doc` disposition: handle more edge cases not fewer, complete error paths,
  flag completeness gaps in the proposed logic, "implementation detail is where strategy
  breaks down."
- The non-flag / suppression discipline: no style/naming/perf/defensive-check-for-
  can't-be-null findings; the gstack suppression list (harmless redundancy, tuned
  thresholds, constrained-input edge cases, already-addressed-in-diff).
- The self-applied confidence calibration for correctness (anchor 100 = verifiable from
  code alone; 75 = full traceable execution path with a concrete consequence; 50 =
  depends on unseen caller; ≤25 = suppress).

**Dropped (out of scope):**
- All gstack/CE harness scaffolding: preamble, telemetry, AskUserQuestion flows, skill
  routing, gbrain/learnings wiring, checkpoint mode, version/CI-pipeline specifics — these
  are product/harness, not factory-general, and most belong to the consuming stage, not
  the lens.
- The orchestration: fan-out, persona selection, dedup, cross-reviewer corroboration,
  severity-routing, validator gate — owned by `lens-dispatch` / `merge-triage`.
- The collaborative plan-review interaction (one-section-at-a-time, ExitPlanMode gates) —
  that is the `plan`/`design`/`review` skills, not the autonomous lens.

**Edge only (separate node / block):**
- The finding contract (schema, severity scale, confidence anchors) → a build-time
  **block** injected via a resolver placeholder, not a node and not a `references` edge.
- The sibling lenses (`lens-security`, `lens-tests`, `lens-maintainability`, etc.) → they
  are peers in the family, not things this node points at; the boundary between them is
  documented (don't double-flag), but there is no edge between siblings.

## Overlaps and seams

- **Upstream seam (dispatch → lens):** the `lens-dispatch` block (in the consuming
  stage's body) **invokes** this lens, one-way, passing the target + scope + contract.
  This lens declares **no** back-edge to dispatch — a back-edge would be a structural
  cycle (D4). (Dispatch is a block, not a node, so even an `invokes` from the lens would
  be unresolvable.)
- **Downstream seam (lens → merge):** the lens returns findings to `merge-triage`
  (dedup/corroborate/gate/route), which is the dispatch machinery, not a node this lens
  edges to. The lens's only job is to emit conformant findings.
- **Arc seam (lens → arc):** the lens **composes-into** the `dev-sprint` arc at the
  `review` stage (its primary home); `design` and `plan` are additional consumers (it
  composes into those stages too, with `target: doc`). Per graph-map, lenses compose into
  the arc **via their consuming stage**, not into the dispatch block.
- **Sibling seam:** correctness deliberately overlaps with `lens-security` on a few
  checks (SQL interpolation, LLM-output trust). Resolution: correctness keeps only the
  "wrong result / swallowed failure" framing; security keeps the exploit framing.
  Cross-reviewer corroboration (handled by merge-triage) is the intended mechanism when
  both flag the same region.
- **Harness seam:** product-specific lenses attach to the family as harness **overlays**
  (a new lens node + an edge registering it with the dispatch catalog); the vendored
  family — including this node — is never mutated.

## Fit

**Single node, target-parameterised — confirmed.** Apply the
[decomposition](../../handbook/content/07-decomposition/) discriminator: it owns its own
branching (the correctness hunt and its calibration), has a distinct measurable goal
(escaped-correctness-defect rate; survived true positives), and is reused by ≥2 consumers
(review, design, plan) — all three granularity signals (reuse, cohesion, just-in-time)
point to "own node." The diff-vs-doc split is **not** a node split: per D27 and the
graph-map decision, collapse CE's doc/diff duplication into **one parameterised lens** with
a `target` mode in the body (modes-as-nodes in the authoring view; renders as one agent
file with a target branch). It is a **leaf** in the structural skeleton: fanned-out-to,
returns a summary, edges minimal.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | `dev-sprint` (stage: review) | Primary home: the review stage fans out to this lens over a diff. Per graph-map, lenses compose into the arc via their consuming stage. |
| composes-into | `dev-sprint` (stage: design) | Additional consumer: design fans out to this lens over the design doc (`target: doc`). |
| composes-into | `dev-sprint` (stage: plan) | Additional consumer: plan-review fans out to this lens over the plan doc (`target: doc`, sequential surfacing). |

**Deliberately NO other edges:**
- **No edge to `lens-dispatch`.** Dispatch is a block that `invokes` the lens one-way;
  the lens must not point back (structural cycle, D4; and the target is a block, not a
  resolvable node file).
- **No `references` edge for the finding contract.** `findings-schema` / `severity-scale`
  / `confidence-anchors` are **blocks** injected via a `{{findings-schema}}`-style
  resolver placeholder in the body. Declaring a `references` edge to a block would fail
  validation (the validator resolves `references` targets to node files). This is a
  deliberate modelling choice (see Open questions).
- **No `invokes` / `loads`.** The lens calls no other node and loads no other node into
  its context (it reads target + injected contract; everything else is inline read-only
  tool use / MCP-style inspection).
- **No `precedes` / `can-follow`.** It is a fanned-out-to leaf; it has no process
  position of its own. The process flow (review↔build correction loop) lives on the
  consuming stage, not the lens.

## Conformance

**`primitive:`↔`mode:` agreement:** `agent` ↔ `autonomous` — agrees (schema-valid).

**`goals:` as outcomes:** All three read as outcomes (defects caught before escape;
escaped-defect rate vs baseline; precision/trustworthiness), each with a metric and an
earns-keep threshold. None are activities ("reviews code for correctness" was explicitly
rephrased to the outcome "real correctness defects caught before they reach build/land").

**Edge targets resolvable:** `dev-sprint` is the arc (composes-into targets an arc, which
the maintainer does not resolve to a file — per 02-graph-spec). No edge targets a block
or a missing node. The finding contract is intentionally a body placeholder, not an edge.

## Open questions

- **Finding contract as block, not edge (deliberate).** The shared `findings-schema` /
  `severity-scale` / `confidence-anchors` enter the body via a `{{findings-schema}}`-style
  resolver placeholder, NOT a `references` edge — because the validator resolves
  `references` targets to node files and these are build-time blocks. Flagged so the
  translator writes the placeholder in the body and does not invent an edge. (Carried from
  the modelling guidance.)
- **Target parameterisation in the body.** `target ∈ {diff, doc}` is a body mode (one
  agent file with a branch), not separate nodes. The doc mode also shifts ordering
  (design/plan surface findings sequentially while a human edits the doc) — but that
  ordering is set by the consuming stage's dispatch, not by the lens. Translator: model
  `target` as a parameter the lens reads, keep the hunt identical, only the
  location-vocabulary (file:line vs doc-section) and the "code exists vs code proposed"
  framing differ.
- **Sibling boundary with `lens-security`.** A handful of checks (SQL string
  interpolation, LLM-output trust boundary) appear on both the correctness hunt-list and
  the security hunt-list. The intended resolution is framing-split + cross-reviewer
  corroboration at merge-triage, but if double-flagging proves noisy the boundary may need
  tightening. Not a blocker for authoring; note in the body that correctness keeps the
  wrong-result/swallowed-failure framing and leaves the exploit framing to security.
- **Model tier.** CE runs correctness at the inherited (session) model — one of the
  highest-stakes personas — rather than the mid-tier used for other reviewers. If a
  `model:` field is authored, lean to the strongest available tier; otherwise omit and let
  the consuming stage decide at dispatch. (Optional native field, not required.)
