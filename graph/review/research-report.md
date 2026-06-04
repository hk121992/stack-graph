---
title: Research report for review
type: research-report
status: complete
authored: 2026-05-30
last_updated: 2026-06-04
amended:
  - date: 2026-06-04
    note: |
      Incremental-arc amend (D56, maintenance-cluster batch). review is now SHARED across two
      arcs — it gains composes-into { id: incremental, stage: review } alongside the existing
      dev-sprint entry, and a forward precedes edge to land (the incremental arc goes
      review → land directly, with NO reconcile — the existing precedes: reconcile stays for the
      dev-sprint, so review now precedes [reconcile, land]; the arc context + carrier-keyed
      projection disambiguates which path a carrier took). Added a references edge to
      carrier-interface (load: on-demand) — review consumes its carrier through the explicit
      interface and must not assume work-item-only fields (outcome_link / children / risk_state)
      when carrier_kind is standalone-iu; events are carrier-keyed (carrier_id + carrier_kind +
      arc). Body gained an "Incremental arc" note: the same lens panel vets a standalone IU before
      land; the lens-tests panel is LOAD-BEARING here — it checks the vertical-slice + testing
      invariants HELD IN THE DELIVERED code (acceptance = observable passing tests,
      verification.end_to_end demonstrable, complete path not a horizontal fragment); confirmed
      defects loop back to build (the one corrective can-follow, reused unchanged); a small AFK
      slice may run review in a cheaper mode (autofix / headless). The review → build fix loop is
      reused unchanged. Bumped status to v0.2.0. All dev-sprint edges and behaviour preserved
      verbatim.
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
  the review stage, invokes the four always-on lens nodes, and a references edge to
  lens-dispatch with load: on-demand (review follows the reference to run the panel). The
  dispatch/merge/triage/route procedure is a reference the host follows, not re-implemented;
  review also depends on the finding-contract references (findings-schema / severity-scale /
  confidence-anchors) with load: import and passes them into each lens's spawn prompt.
  Confidence in primitive: skill /
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
body** — it is the `lens-dispatch` **reference** (`kind: reference`) that `review` depends on
via a `references` edge (`load: on-demand`) and *follows* to run the panel. `review` is one
instance of the graph's recurring **generate → evaluate → select** shape (generator: the
diff; judges: the lens family; selection: the dispatch merge/triage + the operator). It runs
in four modes — **interactive / autofix / report-only / headless** — authored as body branches.

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
logic; it lives in the `lens-dispatch` reference review follows (which is itself described as
"deterministic from the lens returns inward"). So the node as a whole is generative; the
deterministic part is delegated to the reference.

## Contract

**Input:** The operator's invocation (optionally a mode token and/or a base-ref/PR/branch
target and/or an intent/plan pointer); the working tree / branch under review. From these
`review` computes the **scope bundle**: the diff, the resolved base-ref, the in/out-of-scope
file list, untracked-scope notes, and a captured **intent / requirements summary** (from PR
body, commit log, plan file, or an operator question when ambiguous). This bundle is what it
carries as it follows the `lens-dispatch` reference to run the panel.

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
| `source-material/ce-code-review-SKILL.md` | keep | PRIMARY analog. Source for: the four modes (interactive/autofix/report-only/headless) and their rules; scope-the-target (Stage 1 base:/PR/branch/standalone); intent discovery (Stage 2) incl. the ambiguity question; conditional lens selection as agent judgment (Stage 3); the present/synthesise step (Stage 6); the mode-driven fix-loop (After Review). The Stage 4 spawn + Stage 5 merge mechanics are **drop / reference** — that is the `lens-dispatch` reference review follows, not review's body. |
| `source-material/gstack-review-SKILL.md` | keep (partial) | Secondary "review army" analog. Source for: scope-drift / intent-vs-delivered framing (Step 1.5); always-on + conditional + adaptive-gating specialist selection (Step 4.5); the Fix-First fix-loop (classify AUTO-FIX vs ASK, batch-ask, apply — Step 5); the generate→evaluate→select / cross-model corroboration shape. Heavy harness scaffolding (preamble, gbrain, telemetry, greptile, persistence, codex-specific bash) is **drop** — product/harness, not factory-general. |
| `source-material/ce-walkthrough.md` | keep (partial) | Source for the interactive-mode operator-interaction surface: the per-finding presentation format, the option menu (Apply/Defer/Skip/Acknowledge), and the unified completion-report structure. The fix-dispatch mechanics it references are review's body; the finding-format detail informs the present step. |
| `source-material/ce-tracker-defer.md` | keep (partial) | Source for the routing half of the fix-loop: routing classes (safe_auto/gated_auto/manual) in action and externalising deferred findings. The CE-specific tracker-sink probing (Linear/GitHub Issues) is **drop** — that is a harness concern; the factory-general signal is "route safe_auto/gated_auto/manual and loop confirmed defects back to build." |
| `source-material/ce-review-output-template.md` | keep (framing) | Source for the present step's shape: ranked findings by severity + the soft-bucket sections + verdict. Informs how review presents the reduced set; the exact CE table syntax is illustrative, not binding. |
| `source-material/ce-diff-scope.md` | keep | Source for the scope-rules contract review computes and passes into the panel (in/out of change, base-ref markers, untracked-scope notes). The scope bundle is review's first deliverable into the panel it runs by following `lens-dispatch`. |

## Keep / Drop

**Kept (absorbed into body):**
- **Scope the target.** Capture/resolve the diff + base-ref + in/out-of-scope file list +
  untracked notes; capture the intent/requirements summary (PR body / commit log / plan /
  operator question on ambiguity). This is the scope bundle handed into the panel.
- **The four modes** as body branches of the one skill (D34 — one node, one primitive): interactive
  (default; pause for intent, present findings, walk the fix-loop), autofix (apply safe_auto
  only, no questions), report-only (read-only, present and stop), headless (programmatic;
  apply safe_auto single-pass, return structured findings, no prompts).
- **Follow the `lens-dispatch` reference.** A `references` edge (`load: on-demand`) review
  *follows* to run the panel procedure: selection → fan-out → merge → triage → route.
  Review points at the reference and reads it at the step of need; it does not restate the
  dedup/corroborate/gate/route logic in its own body.
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

**Reference / not absorbed:**
- **The fan-out / spawn-sub-agents / merge / dedup / corroborate / confidence-gate /
  severity-route procedure** → this is the `lens-dispatch` **reference** (`kind: reference`),
  which review depends on via a `references` edge (`load: on-demand`) and *follows* to run
  the panel. NOT re-written into review's body; the dependency is a `references` edge, not an
  `invokes`/`uses-block` edge.
- **The lens agents themselves** (`lens-correctness`, `lens-security`, `lens-tests`,
  `lens-maintainability`) → separate nodes review **invokes**. (Review spawns them as it
  follows the dispatch reference; the structural intent "review runs these lenses" is
  recorded as `invokes` edges per the input's settled decision.)
- **The finding contract** (`findings-schema` / `severity-scale` / `confidence-anchors`) →
  `kind: reference` artefacts in `graph/_refs/`. Review **does** depend on them via
  `references` edges with `load: import` (it holds the contract) and passes them into each
  lens's spawn prompt so every lens emits to the same contract.

## Overlaps and seams

- **Arc seam (review → arc):** review **composes-into** `dev-sprint` at the `review` stage
  (its only home). Per graph-map this is how a stage attaches to the arc.
- **Panel seam (review → lenses):** review **invokes** the four always-on lens nodes. As it
  follows the `lens-dispatch` reference it spawns them in parallel and reduces their returns,
  passing each its target + scope + the finding contract via its spawn prompt; the `invokes`
  edges record the structural relationship (one-way; the lenses do not point back — that
  would be a structural cycle, D4).
- **Reference seam (review → dispatch):** review depends on `lens-dispatch` via a
  `references` edge (`load: on-demand`) and *follows* it to run the panel — the reference is
  a `kind: reference` artefact, not a block, and the edge is hand-authored in frontmatter.
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
design and plan over docs, so by the reuse rule it is its own define-once unit — here a
`kind: reference`, per D33, not a node). The four modes are **not** a node split (D34 — one
node, one primitive): they are body branches of the one skill. Review is an
**orchestrator** node — it owns control flow and delegates dimension analysis to the lens
agents and the reduction to the `lens-dispatch` reference it follows.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | `dev-sprint` (stage: review) | Review is the review backbone stage of the dev-sprint arc. composes-into targets the arc; the maintainer does not resolve it to a file. |
| composes-into | `incremental` (stage: review) | **Amend 2026-06-04.** Review is also the review stage of the incremental arc — the same lens panel vets a standalone IU before it lands. Shared node; second arc entry, not a duplicate. |
| invokes | `lens-correctness` | Always-on lens review runs over the diff (spawned as review follows the dispatch reference). |
| invokes | `lens-security` | Always-on lens (lower reporting gate) review runs over the diff. |
| invokes | `lens-tests` | Always-on lens review runs over the diff. On the incremental arc this lens is **load-bearing** — it checks the vertical-slice + testing invariants held in the delivered code. |
| invokes | `lens-maintainability` | Always-on lens review runs over the diff. |
| references (`load: on-demand`) | `lens-dispatch` | The panel procedure (selection/fan-out/merge/triage/route). Review *follows* this reference at the step of need to run the panel — a `kind: reference` artefact, hand-authored in frontmatter, NOT injected and NOT an `invokes`/`uses-block` edge. |
| references (`load: import`) | `findings-schema` | The per-finding contract. Review holds it (imported) and passes it into each lens's spawn prompt so every lens emits to the same schema. |
| references (`load: import`) | `severity-scale` | The severity scale. Imported by review and passed into each lens's spawn prompt. |
| references (`load: import`) | `confidence-anchors` | The confidence anchors. Imported by review and passed into each lens's spawn prompt. |
| references (`load: on-demand`) | `carrier-interface` | **Amend 2026-06-04.** The explicit carrier interface a reused node reads. Review is shared across the dev-sprint and incremental arcs; it consumes its carrier through this interface and must NOT assume work-item-only fields (`outcome_link` / `children` / `risk_state`) when `carrier_kind` is `standalone-iu`. Loaded on-demand (only the shared-node path needs it). |
| precedes | `reconcile` | Dev-sprint forward edge: review hands a verdict to reconcile. |
| precedes | `land` | **Amend 2026-06-04.** Incremental-arc forward edge: review → land directly, with **no reconcile**. The existing `precedes: reconcile` stays for the dev-sprint, so review now `precedes: [reconcile, land]`; the arc context + carrier-keyed projection disambiguates which path a carrier took. |

**Deliberately NO other edges (for now):**
- **`precedes` now authored (`reconcile`, `land`); the review→build fix loop stays on build's
  side.** The original report deferred all `precedes`/`can-follow` because `build`/`reconcile`
  did not exist. Those nodes now exist: review declares `precedes: [reconcile, land]`
  (dev-sprint → reconcile; incremental → land directly, no reconcile — amend 2026-06-04). The
  **review → build fix loop** is a `can-follow` declared on **build's** side (already wired in
  build's amend), so review still authors no `can-follow` of its own — confirmed defects re-enter
  build via that edge, and the behaviour holds for both arcs.
- **No edges to the conditional lenses** (performance/design/dx/runtime/adversarial/external)
  — **not yet authored**; do not invoke them yet. Wire each in as it is authored.
- **No edges to sub-arcs** (`qa`, `design-review`, `security` standalone) — not yet authored.
- **The finding contract is a `references` (`load: import`) edge, not absent.**
  `findings-schema` / `severity-scale` / `confidence-anchors` are `kind: reference`
  artefacts in `graph/_refs/`; review **does** depend on all three via `references` edges
  with `load: import` (it holds the contract and passes it into each lens's spawn prompt).
  These resolve cleanly — references targets are real files in `graph/_refs/`.
- **`lens-dispatch` is a `references` (`load: on-demand`) edge, not an `invokes`.** Dispatch
  is a `kind: reference` artefact, not a node — review *follows* it via a `references` edge
  to run the panel; it is never `invokes`d as a node.

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — agrees (schema-valid).

**`goals:` as outcomes:** All three read as outcomes (defects caught/fixed before landing vs
baseline; review cycle-time / operator-effort; panel signal-to-noise), each with a metric and
an earns-keep threshold. None are activities — "runs the review panel" was deliberately
reframed to the outcome "defects caught and fixed before landing."

**Edge targets resolvable:** `dev-sprint` is the arc (composes-into targets an arc, not
resolved to a file, per 02-graph-spec). The four lens targets exist as authored node files
(`graph/lens-{correctness,security,tests,maintainability}/`). The `references` targets
(`lens-dispatch`, `findings-schema`, `severity-scale`, `confidence-anchors`) exist as
`kind: reference` files in `graph/_refs/`. No `precedes` / `can-follow` targets are declared
(build/reconcile absent) — so no unresolvable edges.

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
  runtime, adversarial, external) are selected by the `lens-dispatch` reference at runtime
  but are **not yet authored** as nodes. Review declares no `invokes` to them yet; add each
  `invokes` edge as the lens is authored. The selection *logic* lives in the dispatch
  reference, not in review's edges — so review's body does not name them; only the edge set grows.
- **`lens-dispatch` carries the panel; the finding contract is review's to pass.** Translator:
  in review's body, *point at* the `lens-dispatch` reference (a `references` edge, `load:
  on-demand`) where the panel procedure runs — do not inject it. Review holds the finding
  contract (`findings-schema` / `severity-scale` / `confidence-anchors` — `references` edges,
  `load: import`) and passes it into each lens's spawn prompt; it does not restate the
  schema/scale/anchors in its own body, and there are no `{{placeholder}}` tokens anywhere.
- **Modes as body branches.** `mode ∈ {interactive, autofix, report-only, headless}` renders
  as branches of the one skill file (D34 — one node, one primitive; no modes-as-nodes).
  Keep the dispatch/merge/route logic out of every branch — it lives in the `lens-dispatch`
  reference; the branches differ only in operator-interaction and mutation policy (interactive:
  ask + walk; autofix: safe_auto only, no ask; report-only: no mutation; headless:
  safe_auto single-pass + structured return).
- **Sub-arc invocations out of scope this pass.** graph-map shows review also invoking `qa`,
  `design-review`, and standalone `security` as sub-arcs. None are authored yet; defer.
- **Model tier (optional native field).** Both analogs run the orchestrator at the inherited
  session model (it does selection, presentation, routing — high-stakes reasoning). If a
  `model:` field is authored, lean to the strongest available tier; otherwise omit.
