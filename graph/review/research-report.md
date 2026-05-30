---
title: Research report for review
type: research-report
status: complete
authored: 2026-05-30
last_updated: 2026-05-30
amended: []
sources_lifted: 6
researcher_adequacy_note: |
  Lifted six sources across the two reference orchestrators: CE's ce-code-review SKILL.md
  (the PRIMARY analog — the cleanest collaborative-skill orchestrator: mode detection,
  scope, intent, reviewer selection, parallel spawn, merge/triage/route, synthesise+present,
  mode-driven fix-loop) plus its walkthrough / tracker-defer / review-output-template /
  diff-scope references (the operator-interaction + routing + present + scope halves), and
  gstack's review SKILL.md (the secondary "review army" analog corroborating the same
  scope→fan-out→merge→fix-loop→adversarial shape). Edges were determined directly from the
  settled modelling decisions in the input and graph-map: composes-into the dev-sprint arc at
  the review stage, invokes the four always-on lens nodes, and a uses-block placeholder for
  {{lens-dispatch}} (derived by the index from the body token, NOT hand-authored as an edge);
  the dispatch/merge/triage/route procedure is INJECTED, not re-implemented, so review carries
  no findings-schema/severity/confidence edges of its own. Confidence in primitive: skill /
  mode: collaborative / determinism: generative is HIGH and explicitly locked by the input —
  both analogs model review as an operator-in-loop orchestrator that pauses for intent capture
  and fix-loop decisions, and the orchestration judgment (selection, presentation, routing) is
  generative even though the merge/triage step it injects is deterministic. The three goals
  were straightforward to frame as outcomes (escaped-defect reduction, review cycle-time /
  operator-effort, panel signal-to-noise) rather than the activity "runs the review panel."
  Recommendation: proceed to translator — the shape is well-attested and the modelling is
  settled. The one ordering constraint to carry forward is a real finding: the backbone
  precedes/can-follow edges (build→review→reconcile and the review→build fix loop) CANNOT be
  authored yet because build and reconcile do not exist and the validator resolves those
  targets to node files; they are deferred and noted in Open questions.
---

# Research report for review

## Identity

**Candidate id:** review
**Candidate title:** Review

**Scope:** The `review` backbone stage of the dev-sprint arc — a **collaborative
orchestrator skill** that runs the review lens-panel before a change lands. It **scopes the
target** (the diff + base-ref + intent), **selects and fans out** to the active lens agents,
**reduces** their returns to one ranked, routed finding set, **presents** findings to the
operator, and **owns the fix-loop** back to build. It explicitly does **not** itself perform
any dimension analysis — the lens agents (`lens-correctness`, `lens-security`, `lens-tests`,
`lens-maintainability`, and conditional lenses as authored) own that. `review` owns
**orchestration + operator interaction + routing**. The deterministic fan-out / dedup /
corroborate / confidence-gate / severity-route machinery is **not re-implemented in the
body** — it is the `{{lens-dispatch}}` block, injected at build. `review` is one instance of
the graph's recurring **generate → evaluate → select** shape (generator: the diff; judges:
the lens family; selection: merge-triage + the operator). It runs in four modes —
**interactive / autofix / report-only / headless** — authored as body branches.

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Defects are caught and fixed before the change lands, rather than escaping to production / a later stage | escaped-defect rate (defects traced to a reviewed change that the panel did not surface or the fix-loop did not resolve) vs the pre-review transcript baseline | escaped-defect rate measurably below baseline over N sprints; if review never lowers it, the stage is cut or restructured |
| The review is cheap enough — in wall-clock and operator attention — to run on every change rather than be skipped | review cycle-time and operator-effort per review (operator decisions / questions fired per review; time from invoke to verdict) | cycle-time / operator-effort low enough that review is not routinely skipped; trends down or holds as the lens family grows |
| The panel surfaces actionable signal, not noise the operator must wade through | signal-to-noise: actionable findings actioned (fixed or deliberately deferred) vs findings suppressed/dismissed at the gate, per review | the actioned-finding fraction stays high (operators act on what surfaces); a rising dismissal rate is the cut/tune signal |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** Both analogs model the review orchestrator as a collaborative,
operator-in-loop skill, and the input locks this. CE's ce-code-review is a skill whose
default (interactive) mode pauses for intent disambiguation (Stage 2), fires the After-Review
routing question, and walks findings one-by-one with the operator (Apply/Defer/Skip/
Acknowledge); gstack's review batch-asks the operator about ASK-classified findings (Step 5c).
The orchestrator runs in the **current** context because it needs the live main thread for
intent capture, finding presentation, and fix-loop decisions, and it holds shared state across
the fan-out → present → fix cycle — the textbook **skill** (not agent) choice per
01-concepts' context axis. The fanned-out lenses are the autonomous agents; `review` is the
collaborative skill that dispatches them. The non-interactive modes (autofix / report-only /
headless) suppress the operator interaction but are body branches of the same skill, not a
separate primitive — `mode: collaborative` describes the node's default and load-bearing
nature. `primitive: skill` ↔ `mode: collaborative` satisfies the schema agreement constraint.

**`determinism:`** `generative`

**Rationale:** The orchestration judgment is generative: capturing and summarising intent,
selecting which conditional lenses a diff warrants (agent judgment, not keyword matching, per
both analogs), presenting/prioritising findings, and routing fix-loop decisions all require
reasoning that two runs may do differently. The one deterministic sub-procedure — the merge /
dedup / corroborate / confidence-gate / severity-route reduction — is **not** review's own
logic; it lives in the injected `{{lens-dispatch}}` block (which is itself described as
"deterministic from the lens returns inward"). So the node as a whole is generative; the
deterministic part is delegated.

## Contract

**Input:** The operator's invocation (optionally a mode token and/or a base-ref/PR/branch
target and/or an intent/plan pointer); the working tree / branch under review. From these
`review` computes the **scope bundle**: the diff, the resolved base-ref, the in/out-of-scope
file list, untracked-scope notes, and a captured **intent / requirements summary** (from PR
body, commit log, plan file, or an operator question when ambiguous). This bundle is what it
hands into `{{lens-dispatch}}`.

**Output:** The presented review — one **ranked, routed finding set** (ordered actionable
findings with severity + autofix_class + owner) plus the **soft buckets** (advisory findings,
residual risks, testing gaps) and a coverage note (which lenses ran / were skipped / failed)
and a verdict. In mutating modes it also produces **applied fixes** (the safe_auto class,
auto-applied) and the **fix-loop outcome**: gated_auto/manual findings routed per operator
decision, with confirmed defects looping back to `build`. In report-only / headless modes the
finding set is emitted without mutation. The shape of the finding set is the finding contract
the lenses emit (consumed, not owned, by review).

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/ce-code-review-SKILL.md` | keep | PRIMARY analog. Source for: the four modes (interactive/autofix/report-only/headless) and their rules; scope-the-target (Stage 1 base:/PR/branch/standalone); intent discovery (Stage 2) incl. the ambiguity question; conditional lens selection as agent judgment (Stage 3); the present/synthesise step (Stage 6); the mode-driven fix-loop (After Review). The Stage 4 spawn + Stage 5 merge mechanics are **drop/edge-only** — that is `{{lens-dispatch}}`, not review's body. |
| `source-material/gstack-review-SKILL.md` | keep (partial) | Secondary "review army" analog. Source for: scope-drift / intent-vs-delivered framing (Step 1.5); always-on + conditional + adaptive-gating specialist selection (Step 4.5); the Fix-First fix-loop (classify AUTO-FIX vs ASK, batch-ask, apply — Step 5); the generate→evaluate→select / cross-model corroboration shape. Heavy harness scaffolding (preamble, gbrain, telemetry, greptile, persistence, codex-specific bash) is **drop** — product/harness, not factory-general. |
| `source-material/ce-walkthrough.md` | keep (partial) | Source for the interactive-mode operator-interaction surface: the per-finding presentation format, the option menu (Apply/Defer/Skip/Acknowledge), and the unified completion-report structure. The fix-dispatch mechanics it references are review's body; the finding-format detail informs the present step. |
| `source-material/ce-tracker-defer.md` | keep (partial) | Source for the routing half of the fix-loop: routing classes (safe_auto/gated_auto/manual) in action and externalising deferred findings. The CE-specific tracker-sink probing (Linear/GitHub Issues) is **drop** — that is a harness concern; the factory-general signal is "route safe_auto/gated_auto/manual and loop confirmed defects back to build." |
| `source-material/ce-review-output-template.md` | keep (framing) | Source for the present step's shape: ranked findings by severity + the soft-bucket sections + verdict. Informs how review presents the reduced set; the exact CE table syntax is illustrative, not binding. |
| `source-material/ce-diff-scope.md` | keep | Source for the scope-rules contract review computes and passes into the panel (in/out of change, base-ref markers, untracked-scope notes). The scope bundle is review's first deliverable into `{{lens-dispatch}}`. |

## Keep / Drop

**Kept (absorbed into body):**
- **Scope the target.** Capture/resolve the diff + base-ref + in/out-of-scope file list +
  untracked notes; capture the intent/requirements summary (PR body / commit log / plan /
  operator question on ambiguity). This is the scope bundle handed into the panel.
- **The four modes** as body branches (modes-as-nodes rendered into one skill): interactive
  (default; pause for intent, present findings, walk the fix-loop), autofix (apply safe_auto
  only, no questions), report-only (read-only, present and stop), headless (programmatic;
  apply safe_auto single-pass, return structured findings, no prompts).
- **Run `{{lens-dispatch}}`.** A body placeholder where the injected panel procedure does
  selection → fan-out → merge → triage → route. Review's body **references** this, it does
  not restate the dedup/corroborate/gate/route logic.
- **Present the ranked findings + soft buckets to the operator** (interactive/report-only):
  the ranked actionable set + advisory/residual-risks/testing-gaps + coverage note + verdict.
- **The fix-loop.** Auto-apply safe_auto; route gated_auto/manual per operator decision (or
  per mode in non-interactive runs); on confirmed defects, loop back to `build`. The
  per-finding operator menu (Apply/Defer/Skip/Acknowledge) is the interactive surface.

**Dropped (out of scope):**
- All harness scaffolding from gstack: preamble, gbrain/learnings wiring, telemetry,
  greptile triage, review-log persistence, codex-specific bash invocations, specialist
  hit-rate stats files, continuous-checkpoint mode — these are product/harness, not the
  factory-general orchestrator.
- CE's tracker-sink probing (Linear/GitHub Issues detection, bulk-preview) — a harness-level
  externalisation surface; the factory keeps only the routing-class semantics.
- PR-platform plumbing (gh pr checkout, fork-safe base-ref bash, PR metadata projection) —
  execution detail that belongs to inline tool use / the harness, not the node's logic.

**Edge only / block (not absorbed):**
- **The fan-out / spawn-sub-agents / merge / dedup / corroborate / confidence-gate /
  severity-route procedure** → this is the `{{lens-dispatch}}` **block**, injected via a body
  placeholder and recorded as a `uses-block` edge by the index (D33). NOT re-written into
  review's body, NOT an invokes/references edge.
- **The lens agents themselves** (`lens-correctness`, `lens-security`, `lens-tests`,
  `lens-maintainability`) → separate nodes review **invokes**. (The dispatch block is what
  actually spawns them at runtime, but the structural intent "review runs these lenses" is
  recorded as `invokes` edges per the input's settled decision.)
- **The finding contract** (`findings-schema` / `severity-scale` / `confidence-anchors`) →
  blocks owned by the lenses / dispatch; review consumes the returns and does not declare its
  own edges to them (they reach review indirectly through `{{lens-dispatch}}`).

## Overlaps and seams

- **Arc seam (review → arc):** review **composes-into** `dev-sprint` at the `review` stage
  (its only home). Per graph-map this is how a stage attaches to the arc.
- **Panel seam (review → lenses):** review **invokes** the four always-on lens nodes. At
  runtime the injected `{{lens-dispatch}}` block is what spawns them in parallel and reduces
  their returns; the `invokes` edges record the structural relationship (one-way; the lenses
  do not point back — that would be a structural cycle, D4).
- **Block seam (review → dispatch):** review consumes `{{lens-dispatch}}` via a body
  placeholder → a `uses-block` edge derived by the index, never hand-authored.
- **Process seams (DEFERRED):** the backbone flow is build → review → reconcile, with the
  review → build fix loop (and reconcile → build rework). These are `precedes` / `can-follow`
  edges to `build` and `reconcile` — **both of which do not exist yet**. The validator
  resolves process-edge targets to node files, so authoring them now fails validation. They
  are deferred (see Open questions) and wired when build/reconcile are authored.
- **Sub-arc seam (future):** graph-map shows review also invoking sub-arc skills (`qa`,
  `design-review`, `security` standalone) and conditional lenses. None of those are in scope
  for this authoring pass per the input (conditional lenses not yet authored; sub-arcs not
  yet authored). Wire them as they land.
- **Harness seam:** product-specific lenses attach to the panel as harness **overlays** (a
  new lens node + an edge registering it with the dispatch catalog); the vendored review node
  and lens family are never mutated.

## Fit

**Single node — confirmed.** Apply the 07-decomposition discriminator: review owns its own
branching and sequencing (scope → dispatch → present → fix-loop, with four mode branches),
has a distinct measurable goal (escaped-defect rate; cycle-time/effort; signal-to-noise), and
is the orchestrator the operator invokes — all the granularity signals point to "own node."
The dispatch/merge/triage/route machinery is deliberately **factored out** (it is reused by
design and plan over docs, so by the reuse rule it is its own define-once unit — here a block,
per D33/D25, not a node). The four modes are **not** a node split: per the two-views model
they are body branches in the authoring view that render into one skill. Review is an
**orchestrator** node — it owns control flow and delegates dimension analysis to the lens
agents and the reduction to the dispatch block.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | `dev-sprint` (stage: review) | Review is the review backbone stage of the dev-sprint arc. composes-into targets the arc; the maintainer does not resolve it to a file. |
| invokes | `lens-correctness` | Always-on lens review runs over the diff (via the injected dispatch). |
| invokes | `lens-security` | Always-on lens (lower reporting gate) review runs over the diff. |
| invokes | `lens-tests` | Always-on lens review runs over the diff. |
| invokes | `lens-maintainability` | Always-on lens review runs over the diff. |
| uses-block | `lens-dispatch` | Review injects `{{lens-dispatch}}` in its body (selection/fan-out/merge/triage/route). Recorded by the index from the body placeholder per D33 — NOT hand-authored, NOT an invokes/references edge. Listed here for the translator's awareness; the dependency lives in the body token. |

**Deliberately NO other edges (for now):**
- **No `precedes` / `can-follow`.** The backbone build→review→reconcile edges and the
  review→build fix loop target `build` and `reconcile`, which **do not exist yet**; the
  validator resolves these to node files, so authoring them now fails. **Deferred** — wire
  when build/reconcile are authored. (This is a real incremental-authoring ordering
  constraint — see Open questions.)
- **No edges to the conditional lenses** (performance/design/dx/runtime/adversarial/external)
  — **not yet authored**; do not invoke them yet. Wire each in as it is authored.
- **No edges to sub-arcs** (`qa`, `design-review`, `security` standalone) — not yet authored.
- **No `references` edge for the finding contract.** `findings-schema` / `severity-scale` /
  `confidence-anchors` are blocks reached indirectly through `{{lens-dispatch}}`; review
  declares no edge to them. (A `references` edge would fail validation — it resolves to node
  files; these are blocks.)
- **No `invokes` to `lens-dispatch`.** Dispatch is a block, not a node — it is consumed via
  the body placeholder (uses-block), never invoked as a node.

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — agrees (schema-valid).

**`goals:` as outcomes:** All three read as outcomes (defects caught/fixed before landing vs
baseline; review cycle-time / operator-effort; panel signal-to-noise), each with a metric and
an earns-keep threshold. None are activities — "runs the review panel" was deliberately
reframed to the outcome "defects caught and fixed before landing."

**Edge targets resolvable:** `dev-sprint` is the arc (composes-into targets an arc, not
resolved to a file, per 02-graph-spec). The four lens targets exist as authored node files
(`graph/lens-{correctness,security,tests,maintainability}/`). `lens-dispatch` is a block
reached via a body placeholder (uses-block, derived — not a node-file edge). No `precedes` /
`can-follow` targets are declared (build/reconcile absent) — so no unresolvable edges.

## Open questions

- **Process edges deferred — incremental-authoring ordering constraint (REAL FINDING).** The
  backbone `precedes`/`can-follow` edges (build → review → reconcile, and the review → build
  fix loop) cannot be authored until `build` and `reconcile` exist, because the validator
  resolves process-edge targets to node files and would fail on dangling targets. They are
  intentionally omitted now. **Translator: do not invent them.** They must be added (likely
  via `mode: amend`) once build and reconcile are authored. This ordering constraint applies
  to any node authored before its process neighbours and is worth surfacing as a general
  authoring-sequence note for the maintainer.
- **Conditional lenses wire in later.** The conditional lenses (performance, design, dx,
  runtime, adversarial, external) are selected by the injected `{{lens-dispatch}}` at runtime
  but are **not yet authored** as nodes. Review declares no `invokes` to them yet; add each
  `invokes` edge as the lens is authored. The selection *logic* lives in the dispatch block,
  not in review's edges — so review's body does not name them; only the edge set grows.
- **`{{lens-dispatch}}` is the single placeholder; the finding-contract blocks reach review
  only through it.** Translator: write the `{{lens-dispatch}}` token in the body where the
  panel procedure runs, and do NOT also inline `{{findings-schema}}`/`{{severity-scale}}`/
  `{{confidence-anchors}}` in review's body — those are the lenses'/dispatch's, consumed by
  review as returns, not authored into review.
- **Modes as body branches.** `mode ∈ {interactive, autofix, report-only, headless}` renders
  as branches in the one skill file (modes-as-nodes in the authoring view, collapsed at
  render). Keep the dispatch/merge/route logic out of every branch — it is the injected
  block; the branches differ only in operator-interaction and mutation policy (interactive:
  ask + walk; autofix: safe_auto only, no ask; report-only: no mutation; headless:
  safe_auto single-pass + structured return).
- **Sub-arc invocations out of scope this pass.** graph-map shows review also invoking `qa`,
  `design-review`, and standalone `security` as sub-arcs. None are authored yet; defer.
- **Model tier (optional native field).** Both analogs run the orchestrator at the inherited
  session model (it does selection, presentation, routing — high-stakes reasoning). If a
  `model:` field is authored, lean to the strongest available tier; otherwise omit.
