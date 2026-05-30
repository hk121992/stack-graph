---
title: Research report for lens-maintainability
type: research-report
status: complete
authored: 2026-05-30
last_updated: 2026-05-30
amended: []
sources_lifted: 7
researcher_adequacy_note: |
  Lifted seven sources: CE's ce-maintainability-reviewer (the closest direct analog — an
  always-on autonomous persona agent dedicated to the structural-quality dimension),
  CE's ce-code-simplicity-reviewer (the YAGNI/minimalism slice — needless complexity,
  premature abstraction, dead code, duplication), gstack's review/checklist.md (the
  maintainability-relevant diff checks + the suppression/false-positive list this lens is
  measured on), a curated plan-eng-review excerpt (the target: doc structural-debt-at-the-
  doc-stage signal), CE's persona-catalog.md (the always-on family framing + sibling
  boundaries), and CE's findings-schema.json + subagent-template.md (the shared
  finding/dispatch contract the lens conforms to but does not own). Edges were determined
  from the locked family decisions and the lens-correctness sibling template: the only
  structural edge is composes-into the dev-sprint arc at the review stage (with
  design/plan as additional consumers via their own stages); the finding contract is
  injected as a {{findings-schema}}-style resolver BLOCK, not a references edge; there is
  deliberately no edge to lens-dispatch (dispatch invokes the lens one-way — a back-edge
  would be an illegal structural cycle, D4). Confidence in primitive: agent / mode:
  autonomous / determinism: generative is HIGH — every source models the lens as
  fanned-out-to in isolated context, returning structured findings without conversing, and
  the hunt is judgment not algorithm. The goals were framed as outcomes (structural traps
  caught before they ossify; change-cost/rework avoided vs baseline; finding precision —
  real change-cost not subjective style noise) rather than the activity "reviews code for
  maintainability." The one item to carry forward with extra weight: this lens is the
  family member MOST at risk of noise, so the suppression discipline (a finding must name a
  concrete future change-cost; suppress anything a linter/formatter catches or that is
  cosmetic taste) is load-bearing, not decorative. Recommendation: proceed to translator —
  the shape mirrors the settled lens-correctness sibling; carry the target-parameterisation
  (diff vs doc) and the precision-over-recall bias into the body.
---

# Research report for lens-maintainability

## Identity

**Candidate id:** lens-maintainability
**Candidate title:** Maintainability lens

**Scope:** One dimension of stack-graph's shared review lens-family (D27). An autonomous
agent the review orchestrator (the `lens-dispatch` block) fans out to in an isolated
context; it reads a target and returns structured findings, never conversing with the
operator. It hunts **structure and change-cost**: needless complexity, tight coupling,
duplicated logic that should be consolidated, dead code, leaky or wrong abstractions,
oversized units (functions/modules doing too much), unclear control flow that impedes
change, and naming that genuinely obscures intent. It is **`target`-parameterised**:
`target = diff` (the review stage — the structural regression already exists in the
changed code) or `target = doc` (the design/plan stage — the structural debt is baked
into the proposed approach before any code exists). It is **one** family member; it does
**not** own family orchestration, fan-out, dedup, or severity-routing (those live in the
`lens-dispatch` block and `merge-triage`). It explicitly does **not** own correctness
(logic/edge-case/state → `lens-correctness`), security (injection/authz/secrets →
`lens-security`), test coverage (→ `lens-tests`), or performance (→ `lens-performance`):
its lane is *structure and change-cost only*. Its defining discipline is **precision over
recall** — it is the family member most at risk of style/nit noise, so a finding must name
a concrete future change-cost ("the next change to X must touch N places because of this
duplication"); anything a linter/formatter catches, cosmetic naming, import ordering, or
"this file is long" without a concrete cost is suppressed silently. When in doubt,
suppress.

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Maintainability traps (duplication, leaky abstraction, oversized unit, dead code, tight coupling) are caught and consolidated before they ossify into load-bearing debt | true-positive findings per review that survive merge-triage (confidence ≥ 75, not dropped by the validator) | sustains a non-trivial survived-finding rate AND a measurable drop in change-cost/rework attributable to un-flagged structural debt vs the pre-lens baseline over N sprints |
| The change lands without baking in structural debt that makes the next change cost more, rather than that cost being discovered later as rework | change-cost / rework attributable to structural debt the lens did not flag (e.g. a later diff forced to touch N call-sites because of un-consolidated duplication) vs the transcript baseline | attributable-rework rate below baseline; if the lens never lowers it, it is cut or merged |
| Findings name real change-cost, not subjective style noise — this lens is the family member most at risk of noise, so precision is paramount | false-positive / suppression rate at merge-triage (findings dropped by dedup, confidence-gate, or validator) | precision high enough that the lens's findings stay in the actionable tier rather than being routinely demoted to advisory or noise; a maintainability lens that floods the operator with style nits is worse than no lens |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** Every source models this as a sub-agent the orchestrator spawns in an
**isolated** context (CE's `ce-maintainability-reviewer` is a `model: inherit` always-on
review persona with read-only tools — Read/Grep/Glob/Bash — that returns JSON and makes no
operator-facing prose; gstack's checklist lists the "Maintainability specialist" as a
parallel-subagent category distinct from the main-agent inline checks; the CE
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

**Rationale:** The hunt is **judgment**, not a fixed algorithm — "is this complexity
essential or accidental?", "does this abstraction earn its keep?", "will the next change
cost more because of this structure?" These are calls a linter cannot make (and where a
linter *can* make them — formatting, import order, raw line count — the lens explicitly
defers, because those are mechanical and noise). Two runs over the same diff can surface
different findings; the calibration (the confidence anchors plus the concrete-change-cost
test) is a self-applied behavioural rubric, not a deterministic computation. (Contrast the
measure-vs-baseline nodes like `benchmark`/`health`, which are deterministic.) The
**aggregation** that consumes the findings (dedup → corroborate → confidence-gate →
severity-route) is deterministic, but that lives in `merge-triage`/`lens-dispatch`, not in
this node.

## Contract

**Input:** A spawn bundle from the consuming stage's dispatch block: the `target`
(`diff` or `doc`) and its contents, scope-rules (what is in/out of the change; base-ref
markers; untracked-scope notes), an optional intent/requirements summary, and the
injected finding contract (schema + severity scale + confidence anchors). Read-only tools
(Read, Grep, Glob, git/gh inspection); it may read code/context **outside** the target to
confirm a finding (e.g. grep for a sibling of a duplicated helper to count the call-sites
a future change would have to touch, or confirm a "premature" abstraction really has one
consumer).

**Output:** Structured findings conforming to the shared finding contract — per finding:
`title`, `severity` (P0–P3), `file`, `line`, `why_it_matters`, `autofix_class`, `owner`,
`requires_verification`, `confidence` (0/25/50/75/100 anchored), `evidence[]`,
`pre_existing`, optional `suggested_fix` (which for this lens must be a **concrete
reframe** — what to delete, split, inline, or consolidate, not "consider refactoring");
plus top-level `reviewer: "maintainability"`, `residual_risks[]`, `testing_gaps[]`.
Self-suppresses anything below the report threshold (anchors 0/25 dropped silently; 50
surfaces only as P0 or via soft-bucket routing) — and, for this lens specifically,
suppresses any finding that cannot name a concrete change-cost. No operator-facing prose;
no mutation of the target. (Doc-target findings reframe "file:line" to the doc location /
section but keep the same schema.)

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/ce-maintainability-reviewer.md` | keep | Primary model for the body: the structural hunt-list (complexity moved-not-removed, code-judo, spaghetti growth, oversized units, wrong-layer/leaked logic, thin wrappers, premature abstraction, indirection, dead code, coupling, naming, type-holes), per-anchor maintainability calibration, the don't-flag list, the concrete-reframe `suggested_fix` discipline. |
| `source-material/ce-code-simplicity-reviewer.md` | keep (partial) | Source for the YAGNI/needless-complexity slice: inline single-use code, remove premature generalisations and "just in case" code, collapse nested conditionals, remove dead/commented-out code, challenge every abstraction. Its prose "Simplification Analysis" output format is **dropped** — the lens emits the shared findings JSON. |
| `source-material/gstack-review-checklist.md` | keep (partial) | Source for the **suppression / false-positive list** (the precision discipline this lens is most measured on) + the Dead Code and Completeness-Gaps items where they read as structural. SQL/race/TOCTOU/column-name/type-coercion are correctness-owned; SQL/shell-injection/XSS/SSRF are security-owned — **edge-only / sibling-boundary**, not absorbed. |
| `source-material/gstack-plan-eng-review-maintainability-excerpt.md` | keep (partial) | Source for the `target: doc` mode — DRY/flag-repetition, essential-vs-accidental complexity, the 8-files/2-new-classes complexity smell, rolls-custom-where-a-built-in-exists, diagram-maintenance-is-part-of-the-change. Curated excerpt; the rest of the 93KB skill is operator-collaborative scaffolding, dropped. |
| `source-material/ce-persona-catalog.md` | keep (framing) | The always-on family framing + sibling boundaries; informs activation and the don't-double-flag discipline. Not absorbed as body text — it is family context. |
| `source-material/ce-findings-schema.json` | edge-only (block) | The shared finding contract. Injected as a `{{findings-schema}}`-style resolver BLOCK, NOT absorbed and NOT a `references` edge. |
| `source-material/ce-subagent-template.md` | edge-only (block) | The dispatch/spawn contract + confidence-anchor rubric. Owned by `lens-dispatch` (a block); the lens body references the anchors via the same block injection, not as its own content. |

## Keep / Drop

**Kept (absorbed into body):**
- The structural hunt-list: needless complexity (complexity moved not removed, code-judo
  misses, spaghetti growth of ad-hoc conditionals/flags into shared paths); duplicated
  logic that should be consolidated; dead/unreachable code (commented-out, unused exports,
  unreachable branches, shims for unreleased paths); leaky or wrong abstractions
  (feature-specific logic in general-purpose modules, premature abstraction with one
  consumer, thin/identity wrappers, single-subclass base classes, >2 delegation hops);
  oversized units (functions/modules doing too much); tight coupling (circular deps, shared
  mutable state, importing another module's internals); naming that genuinely obscures
  intent.
- The YAGNI slice: inline single-use code, remove "just in case" / extensibility points
  with zero consumers, challenge generic solutions to specific problems.
- The `target: doc` disposition: essential-vs-accidental complexity, the 8-files/2-new-
  classes complexity smell, DRY/flag-repetition in the proposed approach, rolls-custom-
  where-a-built-in-exists, duplicates-an-existing-canonical-flow — flagged before code
  exists.
- The non-flag / suppression discipline (the lens's defining feature): NO formatting,
  import ordering, cosmetic naming, "this file is long" by itself, or anything a
  linter/formatter catches; NO domain-mirroring complexity, justified multi-consumer
  abstractions, framework-mandated patterns, style-only taste, or philosophy-without-a-
  concrete-fix; plus the gstack suppression list (harmless redundancy, no comments-for-
  thresholds, consistency-only changes, harmless no-ops, anything-already-addressed-in-diff).
  A finding MUST name a concrete future change-cost.
- The self-applied confidence calibration for maintainability (anchor 100 = mechanical:
  dead code on an unreachable branch, explicit `any`/`@ts-ignore` in new code, a duplicate
  helper next to a canonical function you can name; 75 = objectively visible structural
  regression — a wrapper with no added behaviour, a special-case branch in a busy shared
  function, indirection added without reducing concepts; 50 = judgment-based naming/boundary
  placement, suppress unless P1; ≤25 = suppress).
- The `suggested_fix`-as-concrete-reframe discipline: name what to delete, split, inline,
  or consolidate, not "consider refactoring."

**Dropped (out of scope):**
- All gstack/CE harness scaffolding: preamble, telemetry, AskUserQuestion flows, skill
  routing, gbrain/learnings wiring, checkpoint mode, version/CI-pipeline specifics, the
  design-doc detection and office-hours offer, ExitPlanMode gates — these are
  product/harness, not factory-general, and most belong to the consuming stage, not the
  lens.
- The orchestration: fan-out, persona selection, dedup, cross-reviewer corroboration,
  severity-routing, validator gate — owned by `lens-dispatch` / `merge-triage`.
- The code-simplicity reviewer's prose "Simplification Analysis" / LOC-reduction-estimate
  output format — the lens emits the shared findings JSON, not a narrative report.
- The collaborative plan-review interaction (one-section-at-a-time, AskUserQuestion
  scope-reduction gate, ExitPlanMode) — that is the `plan`/`design`/`review` skills, not
  the autonomous lens.
- Product-specific magic numbers used as hard rules (e.g. the literal "1000 lines"
  file-size threshold): kept as *signal* (oversized units, file-size regression) but
  reframed to the change-cost test rather than a hardcoded line count, since a fixed count
  is product/harness taste and risks exactly the "this file is long" noise the lens must
  suppress.

**Edge only (separate node / block):**
- The finding contract (schema, severity scale, confidence anchors) → a build-time
  **block** injected via a resolver placeholder, not a node and not a `references` edge.
- The sibling lenses (`lens-correctness`, `lens-security`, `lens-tests`,
  `lens-performance`) → they are peers in the family, not things this node points at; the
  boundary between them is documented (don't double-flag), but there is no edge between
  siblings.

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
- **Sibling seam:** maintainability's lane is *structure / change-cost only*. It defers
  the failure/wrong-result framing to `lens-correctness` (a swallowed error is a
  correctness defect; the *duplicated swallow-handler* is maintainability), the exploit
  framing to `lens-security`, the runtime-cost framing to `lens-performance` (an N+1 is a
  perf finding; the *shared path it was bolted into* is maintainability), and test-code
  coverage to `lens-tests`. Where a region is both structurally messy and (say) slow, the
  lens keeps only the structure/change-cost angle and lets the sibling keep its own.
  Cross-reviewer corroboration (handled by merge-triage) is the intended mechanism when
  two lenses flag the same region.
- **Harness seam:** product-specific lenses attach to the family as harness **overlays**
  (a new lens node + an edge registering it with the dispatch catalog); the vendored
  family — including this node — is never mutated. A product wanting a hardcoded line-count
  rule, for instance, adds it in its harness, not here.

## Fit

**Single node, target-parameterised — confirmed.** Apply the
[decomposition](../../handbook/content/07-decomposition/) discriminator: it owns its own
branching (the structural hunt and its calibration), has a distinct measurable goal
(change-cost/rework attributable to un-flagged structural debt; survived true positives),
and is reused by ≥2 consumers (review, design, plan) — all three granularity signals
(reuse, cohesion, just-in-time) point to "own node." The diff-vs-doc split is **not** a
node split: per D27 and the graph-map decision, collapse the doc/diff duplication into
**one parameterised lens** with a `target` mode in the body (modes-as-nodes in the
authoring view; renders as one agent file with a target branch). The CE
maintainability-reviewer and code-simplicity-reviewer overlap heavily (structural quality
vs YAGNI minimalism) but are **one dimension** for stack-graph's purposes — they are
absorbed into a single lens, not split into two nodes, because they share a goal
(change-cost) and a suppression discipline. It is a **leaf** in the structural skeleton:
fanned-out-to, returns a summary, edges minimal.

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

**`goals:` as outcomes:** All three read as outcomes (structural traps caught before they
ossify; change-cost/rework vs baseline; precision/trustworthiness), each with a metric and
an earns-keep threshold. None are activities ("reviews code for maintainability" was
explicitly rephrased to the outcome "maintainability traps caught and consolidated before
they ossify").

**Edge targets resolvable:** `dev-sprint` is the arc (composes-into targets an arc, which
the maintainer does not resolve to a file — per 02-graph-spec). No edge targets a block
or a missing node. The finding contract is intentionally a body placeholder, not an edge.

## Open questions

- **Finding contract as block, not edge (deliberate).** The shared `findings-schema` /
  `severity-scale` / `confidence-anchors` enter the body via a `{{findings-schema}}`-style
  resolver placeholder, NOT a `references` edge — because the validator resolves
  `references` targets to node files and these are build-time blocks. Flagged so the
  translator writes the placeholder in the body and does not invent an edge. (Carried from
  the family decisions.)
- **Target parameterisation in the body.** `target ∈ {diff, doc}` is a body mode (one
  agent file with a branch), not separate nodes. The doc mode also shifts ordering
  (design/plan surface findings sequentially while a human edits the doc) — but that
  ordering is set by the consuming stage's dispatch, not by the lens. Translator: model
  `target` as a parameter the lens reads, keep the hunt identical, only the
  location-vocabulary (file:line vs doc-section) and the "code exists vs code proposed"
  framing differ.
- **Precision over recall is the design centre (not a footnote).** This lens is the
  family member most prone to noise — structural taste is subjective, and a linter already
  catches the cheap stuff. The body must make the concrete-change-cost test a hard gate:
  every finding names "the next change to X must touch N places / pay cost Y because of
  this structure," and anything that cannot is suppressed silently. Flagged so the
  translator weights the suppression section heavily and does NOT soften it into a polite
  "prefer to avoid" — when in doubt, suppress.
- **No hardcoded line-count threshold.** CE's source uses a literal "1000 lines"
  file-size rule. Reframed to the change-cost test (oversized unit that a future change
  must wade through), NOT a fixed count — a hardcoded count is product/harness taste and
  risks the exact "this file is long" noise the lens must suppress. A product wanting a
  literal threshold adds it as a harness overlay. Flagged so the translator does not
  re-import the magic number into the factory-general body.
- **Sibling boundary is wider for this lens than for correctness.** Maintainability brushes
  every sibling (a duplicated *swallow-handler* vs the correctness *swallow*; a slow path
  *bolted into a shared module* vs the perf cost itself; a *premature security abstraction*
  vs the exploit). The resolution is the same framing-split + corroboration as correctness,
  but the body should be explicit that maintainability keeps ONLY the structure/change-cost
  angle and never the failure/exploit/runtime-cost angle. Not a blocker for authoring.
- **Model tier.** CE runs maintainability at the inherited (session) model, like the other
  always-on personas. If a `model:` field is authored, lean to a strong tier (structural
  judgment is hard); otherwise omit and let the consuming stage decide at dispatch.
  (Optional native field, not required — mirrors the lens-correctness decision.)
