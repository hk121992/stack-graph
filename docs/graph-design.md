---
title: Dev-sprint graph — working design
status: working draft — 2026-05-30
---

# Dev-sprint graph — working design

The working surface for designing the `dev-sprint` arc as a graph, before any node is
authored. A **design doc** (`docs/`), not canonical: locked decisions land in
[`decisions.md`](decisions.md); the canonical model lives in the
[handbook](../handbook/content/). Each Part-B section **seeds** that element's eventual
`graph/<id>/research-report.md` when we author it.

Binding decisions: **D22** (one graph, granularity-flexible authoring view, modes-as-nodes),
**D23** (decompose on reuse / cohesion / just-in-time; inline if trivial; flatten deep),
**D24** (skill = current context, agent = isolated context returning a summary; they compose),
**D25** (shared blocks = define-once resolvers), goals as **outcome / metric / earns-keep**.

---

## Part A — cross-cutting

### Arc shape

| # | Stage | Goal | Collab? |
|---|---|---|---|
| 1 | align-context | Intent + constraints correctly shared before design | collaborative |
| 2 | design | Load-bearing questions resolved by outcome; design doc out | collaborative |
| 3 | specify | Design turned into a canonical spec amendment | seam |
| 4 | plan | Breakpoint-structured plan the build runs autonomously | seam |
| 5 | build | Planned change implemented to spec, checkpointed | autonomous |
| 6 | review | Independent verification; findings triaged | collaborative |
| 7 | reconcile | Review + reality reconciled vs spec; decisions logged | seam |
| 8 | land | Verified change shipped to prod and confirmed healthy | autonomous + gate |
| 9 | debrief | Outcomes measured, learnings + graph amended (the loop) | collaborative |

Loops (`can-follow`): `review→build`, `reconcile→build`, `debrief→align-context`. Note the
loop hands a **scoped delta** (a findings queue) back to a **single fixer in `build`** — review
never mutates.

### The recurring architecture (validated across all wave-1 nodes)

Every heavy node resolved to the **same shape**: an **orchestrator skill on the main thread**
(owns the operator relationship, judgment, git/index, the gates) that **fans out isolated
agents** for parallelizable / read-heavy / independent sub-work (which return only a summary).
This is D24 made concrete and is the backbone pattern — adopt it as the default.

### Shared sub-node layer (reused across stages)

Research surfaced a layer of **reusable nodes invoked by many stages** — the reuse dimension
D23 predicted:

| Shared node | Consumed by | Type leaning |
|---|---|---|
| **explore / gather-context / research** | align-context, design, plan, build | agent (isolated, read-only) |
| **lens family** (correctness, security, tests, maintainability, perf, adversarial, design, DX…) | design (doc), **plan (plan-review, sequential)**, review (diff) | agent per lens |
| **browse** (headless-browser tool) | qa, design-review, canary, benchmark, scrape | **inline tool / ext binary — NOT a node** (`{{browser.exec}}` resolver) |
| **worktree-isolation** | build, review, reconcile | **native `isolation:worktree` (inline) + `.worktreeinclude`**; script fallback |
| **debug.investigate-probe** (read-only hypothesis probe) | debug (×N parallel) | agent |
| **spec-diff** (build ↔ spec touchpoint) | specify, review, reconcile | agent/check |
| **log-decision** (→ two-layer decisions store) | design, reconcile, debrief | shared writer |
| **measure-outcomes / capture-learnings** | debrief (review?) | agent |
| **pr-author / drift-detector** | specify, reconcile (curator family) | agent |
| **IU-schema** (Implementation-Unit field contract) | plan (writer) ↔ build (reader) | shared block |

A lens appears in **two homes** — a plan-stage lens (on the design doc) and a review-stage child
(on the diff). Security and design each appear twice. That is a **define-once / reuse** case
(D25 shared node), not duplication. **Product-specific lenses** (a stack's own reviewers) are
**harness overlays**, not factory nodes.

### Sub-arc inventory (refined by wave 1)

| Sub-arc | Invoked by | Standalone? | Notes |
|---|---|---|---|
| debug | build, review | yes | one node + child `investigate-probe`; Iron Law (no fix without root cause) |
| code-review | review | yes | static diff; orchestrator skill → reviewer **agents**; back-ends (codex/mistral) pluggable |
| qa | review | yes | live browser; fix-loop is a skill; `qa-only` is a **mode** |
| security | review (diff-gated) + standalone | yes | **two homes**: a persona inside code-review *and* the whole-surface `cso` audit — one shared persona node |
| design (review) | design (plan lens) + review (runtime sibling) | yes | runtime twin of qa, shares `browse`; also a plan-stage lens |
| research | align-context, design, build | yes | the explore/gather-context fan-out |
| ship / deploy / canary | land | yes | canary shares `browse` |
| **browse** (NEW — promoted) | qa, design-review, canary, benchmark | — | most-reused primitive; its own node |

**code-review vs qa = two arcs** (confirmed): different tools (diff vs live browser),
opposite verify semantics (re-diff vs re-click). Siblings under `review`, parallelizable.

### Shared-asset / resolver catalog (D25 — refined)

Recurring define-once blocks the nodes consume: `instrumentation-preamble` (D20),
`gbrain-load`, `outcome-gate` (the AskUserQuestion decision-brief shape — every gating node),
`decision-classifier` (mechanical/taste/challenge), `lens-dispatch` / `subagent-review-template`,
`findings-schema` + `severity-scale` (P0–P3) + `confidence-anchors`, `merge-triage`
(dedup→corroborate→gate→partition), `cross-model-challenge`, `iron-law`, `causal-chain-gate`,
`escalation-3-strike`, `structured-report`, `scope-lock` / `blast-radius`, `checkpoint-commit`,
`test-discipline`, `base-ref` / `merge-base`, `qa-methodology`, `git-branch-setup`.

### Ways-of-working conventions (confirmed)

Collaborative stages (align-context, design, specify, plan, reconcile, debrief) run in the
**main thread**; **build** and **review** fan out to **isolated agents**; **explore** agents do
read-heavy context gathering; **gbrain** for recall; operator **gates** at stage seams. The
orchestrator never reads what an agent could read.

**Sub-agent vs agent-team (the "talk test").** Default every fan-out to a **sub-agent** (own
context, reports back to the caller, cheap). Promote a workstream to an **agent-team** only when the
workers must *debate* — competing hypotheses, cross-checking review, mid-flight shared state (and
accept that teams are experimental + costlier). Documented rule (`~/.claude/references/subagents.md`,
`code.claude.com/docs/en/agent-teams`). Model by tier: judgment→opus, mechanical→sonnet, discovery→haiku.

### Rendering & native workflows (D28 / D29)

A stack-graph **arc** (a named, possibly-cyclic traversal over nodes — formerly "workflow")
renders to a **skill/command** (Claude-orchestrated; composes all primitives). Claude's native
`/workflows` is a different thing — a research-preview JS script that orchestrates **subagents
only**, Claude-authored, no public schema — so it is **not** our store. Posture: the graph is the
**plan-time map**; native workflows + subagents are an **optional run-time executor** for the
autonomous fan-out (the review lens fleet, parallel build units), assembled at plan time.
**Backlog:** vendor **playbooks** — native-workflow templates for the multi-agent stages (design,
plan, build) — learn-as-we-go, then refine.

---

## Part B — per-element research (wave 1)

> Verdicts and open questions preserved verbatim from the research pass. Seams (specify, plan,
> reconcile, land, debrief) and remaining sub-arcs (security, design, research,
> ship/deploy/canary, browse) follow in wave 2.

### align-context

- **Scope.** Establish a shared, *correct* model of intent + constraints before design. Three
  jobs: gather existing context; interrogate intent (outcome-scenario + forcing questions);
  emit an agreed intent/constraints/open-questions statement. Excludes proposing a solution
  (→design), authoring requirements (→specify), and "should we build it" market validation
  (a separate upstream idea-triage).
- **Goals.** Shared correct intent (≤1 correction round at gate); binding constraints surfaced
  early (late-surfaced trends to zero); context loaded not re-derived; open questions parked not
  assumed.
- **Prior art.** ADAPT `office-hours` (forcing questions + gbrain preload; drop market framing);
  ADOPT spec-first TRIAGE as a **spec-touchpoints mode**; ADAPT `ce-strategy` (read-grounding-
  if-exists), `ce-ideate` (subject-identifiability gate, question budget), `ce-brainstorm`
  (scope-tiered ceremony, one-question-per-turn). Conflict: CE splits the funnel into 3 skills,
  gstack collapses to one — **recommend one stage with ceremony modes**.
- **Decomposition.** One node + **extract `gather-context`** (reused by design/specify, JIT).
  Ceremony tiers (lightweight/standard/deep) + spec overlay = **modes in one node**.
- **Primitive.** Skill (live thread), invoking `gather-context` agents.
- **Contract.** In: free-form request + repo + recall. Out: intent-and-constraints statement
  (goal, constraints, scope boundary, parked questions, spec touchpoints) + operator-confirmed gate.
- **Edges.** precedes `design`; `debrief→align-context` loop-in; invokes `gather-context`;
  loads spec/handbook `index.json`; references the canonical spec (mandatory in spec mode).
- **Shared assets.** gbrain-load, instrumentation-preamble, forcing-questions, index-read,
  outcome-gate.
- **Open Qs.** (1) align/specify boundary — agreement only, or a requirements seed? (2) ceremony
  modes-in-node vs split deep out. (3) question budget + unsprintable escape hatch.
  (4) extract `gather-context` now or JIT. (5) spec-touchpoints core vs overlay. (6) which
  forcing questions survive an already-greenlit sprint. (7) debrief→align payload.

### design

- **Scope.** Aligned frame in → reviewed **design doc** out: surface design questions, classify
  load-bearing, resolve critical **by outcome**, auto-decide the rest, run the review lenses.
  Excludes premise-setting (align), spec (specify), task breakdown (plan).
- **Goals.** Load-bearing decisions resolved by operator on outcome grounds (not silently);
  non-critical auto-resolved; a design doc specify/plan consume without re-deriving; blind spots
  caught pre-code (lens coverage).
- **Prior art.** ADAPT `autoplan` (sequential classify-then-surface, single final gate, 6
  decision principles); ADAPT the `plan-*-review` family (dimensional rating, **conditional
  activation**); ADOPT CE `ce-doc-review` (**lenses = parallel isolated agents**, consolidate,
  per-finding routing) as the lens-execution model; ADOPT cross-model outside-voice
  (informational-until-approved); ADOPT stack-graph's own design method as governing.
  **Conflict:** gstack runs lenses sequentially in-thread; CE runs them parallel-isolated.
- **Decomposition (the lens question — ANSWERED).** **Lenses are separate nodes (parallel
  reviewer agents), not modes of one design node** — they pass all three D23 tests (reused
  pre-build *and* post-build; cohesive distinct goals; JIT-activated) + D24 (parallel, isolated).
  **One nuance:** the **CEO/strategy lens runs first** (it changes scope), then design/eng/DX
  fan out in parallel — a hybrid of gstack-ordering + CE-fanout. CEO scope postures
  (EXPANSION/SELECTIVE/HOLD/REDUCTION) stay **modes inside the strategy lens**.
- **Primitive.** `design` orchestrator = skill; lenses = agents (parallel, conditional); classifier
  = shared block.
- **Contract.** In: aligned frame + repo context + scope signals. Out: design doc (shape, chosen
  approach + rejected alternatives, resolved decisions, parked questions, lens findings,
  `## Spec touchpoints`) + restore point + auto-decision audit log.
- **Edges.** precedes `specify`; `can-follow` align (and review/reconcile→design for shape-level
  rethink); invokes research-context agents + lens agents; composes the lens nodes + cross-model
  block.
- **Shared assets.** decision-classifier, outcome-gate, lens-dispatch, cross-model-challenge,
  design-doc-template, scope-detection.
- **Open Qs.** (1) strategy-lens-first hybrid vs all-parallel vs all-sequential. (2) CEO postures
  modes vs nodes. (3) premise-challenge home (align vs design). (4) who emits the amendment
  proposal (design touchpoints vs specify). (5) outside-voice default-on vs gated. (6) per-lens
  model routing.

### build

- **Scope.** Approved plan → feature-complete, tested tree: env/branch setup, JIT context, the
  per-unit loop (implement→test→checkpoint), parallel fan-out, continuous checkpointing, invoking
  `debug` on failure. Excludes planning, the review gate, reconcile, merge/deploy.
- **Goals.** Planned units implemented to spec, tree green; operator off-thread during the span
  (interrupts only at breakpoints/unrecoverable failure); progress never lost (every unit a
  checkpoint); failures root-caused not patched.
- **Prior art.** ADOPT gstack auto-mode + continuous checkpoint (the spine); ADAPT
  `context-save`/`restore` (resume at breakpoints); **ADOPT CE `ce-work` wholesale** (plan-as-
  decision-artifact, execution-strategy table inline/serial/parallel, Parallel Safety Check,
  per-unit loop, incremental-commit); ADAPT `ce-worktree` (its own node); REJECT `ce-work-beta`
  Codex delegation (but note the **executor is a swappable seam**); ADOPT `debug` as invoked node;
  ADAPT CE researcher agents as JIT explore.
- **Decomposition.** Parent `build` + extract `debug` (3/3 D23 triggers), `explore`,
  `worktree-isolation`; `parallel-dispatch` inline-now / extract-on-second-consumer; per-unit loop
  inline. Execution strategy = modes (`build:inline|serial|parallel`).
- **Primitive.** `build` = skill (owns git/tasks/gates); fan-out children = agents;
  `worktree-isolation` = deterministic script.
- **Contract.** In: approved plan + branch state + optional resume context. Out: green tree on a
  feature branch, per-unit verification satisfied, handoff summary. Artefacts: incremental/WIP
  commits, merged worktree branches, optional context-save. Plan body never mutated.
- **Edges.** follows `plan`; precedes `review`; `review→build` + `reconcile→build` loops-in;
  invokes `debug`, `explore`, per-unit workers; composes `worktree-isolation`.
- **Shared assets.** git-branch-setup, checkpoint-commit, test-discipline, parallel-safety-check,
  plan-reading.
- **Open Qs.** (1) `debug` build-owned vs top-level sibling (recommend sibling). (2) parallel-
  dispatch inline vs extracted. (3) execution-strategy modes-as-nodes vs internal table.
  (4) executor as node parameter? (5) where simplify-as-you-go lives (light in-loop + heavier in
  review). (6) breakpoint granularity (phase gates vs per-unit).

### review

- **Scope.** Orchestrate independent verification before landing: scope detection, reviewer
  fan-out, merge/dedup/triage, severity+route, verdict, kick the `review→build` loop. Excludes
  applying fixes (build), planning, landing, reconcile. **Review triages and routes; it does not
  mutate.**
- **Goals.** Defects caught before landing (escaped-defect rate); findings actionable & true (low
  false-positive); independent judgment (isolated context, not author's blind spots); fast enough
  to run every sprint (parallel fan-out).
- **Prior art.** ADOPT CE `ce-code-review` as the backbone (parallel persona sub-agents → merge/
  dedup/confidence-gate/triage in-thread → verdict → single fixer); ADOPT the CE reviewer fleet
  (lens = agent, per-lens model tiering); ADAPT gstack `review` as one lens; ADAPT `codex`/`mistral`
  → a `review-external` cross-model lens; ADAPT `cso` (security lens with its own modes); ADAPT
  `qa`/`design-review` as invoked runtime lenses; REJECT `autoplan` sequential fan-out *for code
  review* (but it's the right shape for **plan-review** — a different species, see open Qs).
- **Decomposition (ANSWERED).** Split — thin `review` orchestrator + a fleet of parallel reviewer-
  agent lens nodes: `review-correctness` (always), `review-tests` (always), `review-maintainability`
  (always), `review-security` / `review-performance` / `review-adversarial` (conditional),
  `review-external` (cross-model), `review-design` / `review-qa` (invoked runtime sub-arcs).
  Conditional selection is **agent judgment in the orchestrator**, not a static list.
- **Primitive.** orchestrator = skill; each lens = agent. Modes: interactive / autofix /
  report-only / headless. Merge/triage **deterministic by spec** (stable fingerprints, fixed
  promotion/tie-break) → auditable re-runs.
- **Contract.** In: change (branch/PR/`base:<ref>` diff) + intent + optional plan + mode. Out:
  verdict (Ready / Ready-with-fixes / Not-ready) + triaged deduped confidence-gated findings
  (severity, file:line, confidence, autofix-class, owner, suggested-fix, reviewer(s)) + coverage
  stats. Artefacts: per-run dir with per-lens detail + merged findings + metadata (head_sha →
  downstream can verify artifact matches HEAD).
- **Edges.** follows `build`; precedes `reconcile`; `review→build` loop (bounded re-review,
  `max_rounds: 2`); invokes runtime/cross-model lenses; composes the reviewer-agent nodes.
- **Shared assets.** findings-schema, severity-scale, confidence-anchors, subagent-review-template,
  merge-triage, diff-scope.
- **Open Qs.** (1) lens roster — lean core + conditional + extension slot (recommend; product-
  specific lenses are **harness overlays**). (2) `review-external` one parameterised node vs
  per-provider. (3) validator gate (per-finding re-check) as node vs inline. (4) does "Not ready"
  hard-block `land` (recommend hard-block on P0/unmet-plan-requirements). (5) **plan-review vs
  code-review = two species, two homes** — sequential plan-review lives in `plan`/`design`,
  parallel code-review here.

### debug (sub-arc)

- **Scope.** Observed failure → reproduce → trace → confirm root cause → minimal fix + regression
  test → verify. **Iron Law: no fix without root cause.** Excludes pre-emptive QA, redesign (hands
  to design), PR-tier review, landing.
- **Goals.** Failure gone with the *actual* cause fixed (repro passes + regression test); cause
  understood not guessed (gap-free causal chain before any edit); investigation bounded (≤3
  hypotheses, blast-radius flagged >5 files).
- **Prior art.** ADAPT gstack `investigate` (phase backbone, Iron Law, scope-lock, 3-strike,
  structured report); **ADAPT CE `ce-debug` as primary** (triage-with-issue-fetch, trivial-bug
  fast-path, causal-chain gate, prediction discipline, smart-escalation table, parallel read-only
  probes, three-way user gate, reference-file split). Conflicts: keep CE's fast-path; express
  scope-lock as an **outcome** (defer the freeze/branch mechanism to render).
- **Decomposition.** **One node + extract `debug.investigate-probe`** (read-only parallel
  hypothesis probe — reused, self-contained). Reject splitting investigate/fix (no independent
  reuse; diagnosis-only is an early exit, not a boundary). Phases stay inline. Reference material
  (anti-patterns, techniques, defense-in-depth) = referenced assets, not nodes.
- **Primitive.** `debug` = skill (fix + gates + report mutate/need the thread);
  `investigate-probe` = agent. Deterministic guardrails (Iron-Law/3-strike/blast-radius) over
  judgment-led investigation.
- **Contract.** In: failure signal (trace / failing test / issue ref / NL) + optional invoking-
  stage handle. Out: DEBUG REPORT (problem / root-cause causal chain / fix or diagnosis-only /
  tests / prevention / confidence / status DONE|DONE_WITH_CONCERNS|BLOCKED). Artefacts: minimal
  fix diff + regression test.
- **Edges.** invoked-by `build` and `review` (pass `{signal, files, handle}`, blocks for status);
  invokes `investigate-probe` ×N; can-hand-off-to `design` (design-flaw branch); loads reference
  assets JIT; composes into dev-sprint only via build/review.
- **Shared assets.** iron-law, causal-chain-gate, escalation-3-strike, structured-report,
  scope-lock/blast-radius, issue-fetch, parallel-readonly-probe.
- **Open Qs.** (1) keep trivial fast-path (recommend yes). (2) scope-lock mechanism deferral.
  (3) `investigate-probe` as node (recommend yes). (4) who lands the fix (stop-at-fix when invoked;
  optional handoff standalone). (5) learnings capture → 06-analytics. (6) design-flaw handoff target.

### code-review (sub-arc)

- **Scope.** Static diff correctness-and-safety review — no app run. In: diff + repo text + intent.
  Out: findings (and, autofix mode, deterministic edits). Never navigates a browser.
- **Goals.** No correctness/safety regression reaches land; findings trustworthy not noise; cheap
  mechanical fixes auto-applied; independent second opinion on hard diffs (cross-model).
- **Prior art.** ADAPT gstack `review` (single-context checks → fold in as the lightweight tier);
  **ADOPT CE `ce-code-review`** (parallel persona agents, deterministic merge, autofix-class
  routing, 4 modes incl. headless envelope); ADOPT CE reviewer agents (persona = isolated agent;
  security = diff-gated persona); ADAPT `codex`/`mistral` as pluggable back-ends behind one node.
- **Decomposition.** Orchestrator node + **each reviewer persona its own node** (reused — security
  shared with `cso`; self-contained; JIT). External back-ends are nodes too. **code-review vs qa =
  two arcs.**
- **Primitive.** skill orchestrator → agent personas. Modes-as-nodes: interactive / autofix /
  report-only / headless. Scope-detect + merge + safe_auto routing deterministic.
- **Contract.** In: diff base + changed files + intent + optional `plan:` + mode. Out: ranked
  findings (severity, autofix-class, owner, confidence, pre-existing, suggested-fix) + pass/fail +
  report-only/headless envelope. Artefacts: run-id dir.
- **Edges.** `review` invokes in headless/report-only; standalone via `/review` or
  `ce-code-review`; `report-only` is the one mode safe to run **parallel with qa** on one checkout.
- **Shared assets.** base-ref/merge-base, intent-discovery, severity-scale + autofix-class,
  findings-envelope, outcome-gate.
- **Open Qs.** (1) one node with pluggable back-ends vs codex/mistral as sibling nodes (lean: one
  node, back-end param). (2) security persona shared between code-review and `cso` (lean: yes,
  define-once). (3) requirements-verification home — code-review vs reconcile.

### qa (sub-arc)

- **Scope.** Live behavioural testing: serve app, drive a real browser as a user, observe runtime
  + console; fix variant iteratively fixes source, commits atomically, re-verifies. **Runs the
  app** — the trait code-review lacks.
- **Goals.** App actually works for a user (before/after health score); bugs fixed with evidence
  (atomic commits + screenshots); right-sized effort (tiers); report-only path for read-only callers.
- **Prior art.** ADOPT gstack `/qa` (the test→fix→re-verify loop, 3 tiers, diff-aware route mapping,
  atomic commits, health score); ADOPT `/qa-only` **as a mode** (concurrency-safe, no mutation);
  ADOPT `browse` + `setup-browser-cookies` as **shared assets** (browse = the primitive);
  ADAPT CE `ce-test-browser` (file→route mapping, free-port discipline; specific CLI is harness
  detail).
- **Decomposition.** One node + `qa-only` **mode**; `browse` + `cookie-import` are separate reused
  nodes. **code-review vs qa = two arcs** (concur). Optional: push exhaustive read-only sweep
  to an isolated agent (hybrid).
- **Primitive.** skill orchestrator on the current thread (fix-loop mutates + commits — must live
  where build/reconcile live), built on the `browse` primitive; agent only for the read-only sweep.
  Low determinism (runtime) mitigated by tiers + screenshots/health-score (auditable).
- **Contract.** In: URL or branch (diff-aware) + tier + mode + optional auth + baseline. Out:
  before/after health score, issues with repro + screenshots, ship-readiness; fix mode → atomic
  commits.
- **Edges.** `review` invokes in report-only (concurrency-safe) or fix mode; standalone `/qa`,
  `/qa-only`, `ce-test-browser`; preconditions: running server (claim free port), cookie-import for
  authed surfaces; shares `browse` with canary/design-review.
- **Shared assets.** browse-primitive, cookie-import/auth-setup, qa-methodology, free-port-claim,
  severity/health-score schema.
- **Open Qs.** (1) `qa-only` mode vs node (lean: mode). (2) exhaustive sweep in isolated agent
  (lean: yes, hybrid). (3) does qa own runtime visual checks or `design-review` (lean: separate
  sibling, shared browse). (4) browser-tool identity (`browse` vs `agent-browser`) = harness detail,
  keep node tool-agnostic.

### Cluster note (code-review / qa / security / design)

**Four siblings under `review`**, discriminated by tool + verify-semantics: code-review (static,
diff), qa (runtime, browser), security (mostly static; **two homes** — a diff-gated persona inside
code-review *and* the whole-surface `cso` audit; one shared persona node), design-review (runtime
twin of qa, shares `browse`). Plan-level lenses (design/security on the *doc*) are a **different
attachment point** (design/specify/plan stages) — the same concern appears as both a plan lens and
a review child: a reuse case, not a collapse.

---

## Part B — seams (wave 2)

### specify

- **Scope.** Turn the approved design into a **canonical spec amendment** + name the spec
  touchpoints (the spec-first SPEC AMENDMENT phase). Conditional on a spec layout; degrades to a
  null record (`## Spec touchpoints — n/a`) elsewhere. Excludes the design (→design), merge (→reconcile).
- **Goals.** Spec stays ahead of code (amended before build); reviewers see design + amendment
  together; touchpoints explicit; amendments are PR proposals, never silent writes.
- **Prior art.** ADOPT be-civic spec-first discipline + amendment-process (touchpoints table; PR
  *is* the proposal; §-citation; "plans cite specs, specs never cite plans"); ADAPT
  `bc-handbook-curator spec-amend` mode (the enacting skill, de-Handbook-specific); ADAPT gstack
  (no specify stage — model the discipline as a conditional node + a path-gated `rules/*.md`
  fragment); REJECT CE (no spec substrate). Confirms `specify` is **not universal**.
- **Decomposition.** One node branching on spec-layout presence; touchpoints-table = shared block;
  pr-author / drift-detector = reused agent sub-nodes (from the curator family). Don't fold into design.
- **Primitive.** Collaborative skill (amendment wording is judgment + operator sign-off) over a
  deterministic mechanical floor (touchpoints present, §-citation format, structural-only, no-direct-push).
- **Contract.** In: approved design doc + named spec sections + spec-layout config (harness). Out:
  amendment proposal (PR, branch `spec/<desc>`) + touchpoints table + open questions. Null-case
  artefact when no spec layout.
- **Edges.** follows `design`; precedes `plan`; composes-into `review` (amendment co-attached);
  invokes pr-author / drift-detector; `reconcile` later merges + stamps `reconciled`.
- **Shared assets.** spec-touchpoints-table, reviewer-attachment, pr-description-shape, pr-author /
  drift-detector, spec-layout-config (harness overlay).
- **Open Qs.** (1) design emits touchpoints, specify emits the proposal — confirm the cut.
  (2) conditional node-that-degrades vs absent+rule (recommend present-but-degrades). (3) inline
  drift scan at specify vs reconcile-only. (4) generality guard — Handbook/label specifics → harness
  overlay. (5) render to `skills/` not legacy `commands/`.

### plan (pivotal)

- **Scope.** Design + amendment → a **breakpoint-structured execution plan** the autonomous build
  runs between gates. Two jobs no other stage owns: **(a) plan-time composition** — select the
  task's subgraph + structure the work into Implementation Units (the artefact a native-workflow
  *playbook* would later lower onto, D29); **(b) plan-review** — run lenses **sequentially** on the
  plan (the gstack `autoplan` species, distinct from review's parallel fan-out).
- **Goals.** Build runs a span autonomously with no mid-build "what did you mean?"; the plan is
  review-hardened before code; low re-plan rate.
- **Prior art.** ADOPT CE `ce-plan` Implementation-Unit schema (Goal/Files/Approach/Verification/
  Deferred — the build's input contract) + its parallel research fan-out + confidence-gap/deepening
  pass; ADOPT gstack `autoplan` sequential plan-review ("each builds on the previous") reusing the
  D27 lens family on the plan; ADAPT the `plan-*-review` four lenses (product-specific lenses →
  harness overlay); ADOPT be-civic SPRINT-PLAN ordering + spec-touchpoint traceability; native
  `/workflows` REJECTED as store / accepted as later executor.
- **Decomposition.** Thin orchestrator that **composes shared sub-nodes** (research/explore family,
  lens family, deepening) and inlines IU-writing. Modes: `compose` / `deepen` / `re-plan` (loop
  re-entry; U-IDs stable so re-plan amends in place).
- **Primitive.** Orchestrator skill; lenses + research = isolated agents (return a score + rewrite-delta).
- **Contract.** In: design + amendment + requirement IDs + scope. Out: **Implementation Units** +
  a **subgraph manifest** (which sub-nodes/agents build runs, batch structure by dependency DAG,
  breakpoints) + plan-review report + deferred list. **Invariant: plan output ≡ build input.**
- **Edges.** follows `specify`; precedes `build` (plan-approval gate on this edge); `review→build`
  and `reconcile→build` may bounce through `plan` (`re-plan`); composes lens family + research family.
- **Shared assets.** lens family (D27), research/explore family, worktree sub-node (build lowers onto
  it), IU-schema block, external-review gate (Codex/Mistral inline).
- **Open Qs.** (1) **subgraph-manifest fidelity** — implicit (i) / explicit-playbook-ready (ii) /
  hybrid (iii). **Recommend (iii)**: explicit batch+breakpoint structure, implicit agent selection,
  shaped so playbook-lowering is a later mechanical lift (don't depend on research-preview workflows
  now). (2) plan-review here, sequential — confirm the two-species split. (3) gated vs always-on
  deepening. (4) re-plan granularity (in-place U-ID amend vs full re-plan). (5) breakpoint authority
  (plan proposes from risk, operator approves).

### reconcile

- **Scope.** Make the **spec ?= reality**. After review verifies the diff is good, reconcile asks
  the orthogonal question — does the canonical record still describe what was built? Adjudicates each
  divergence (amend-spec / loop-to-build / accept), owns the `reconcile→build` loop + the **gate to
  land**, and writes the curated decisions store (D11). Spec-touching sprints only; else a
  decisions-log entry + pass-through.
- **Goals.** Spec never silently drifts (0 merged sprints with an unrecorded touchpoint change);
  every divergence adjudicated; ≥1 curated decision per spec sprint; loops closed before land.
- **Prior art.** ADOPT be-civic Phase-6 RECONCILIATION + amendment-as-PR + the `amends:`/`status:
  reconciled` record schema; ADAPT CE `ce-compound-refresh` (record-vs-reality, propose-don't-rewrite,
  Keep/Update/Consolidate/Replace/Delete dispositions); ADAPT gstack `/review` adjudication rubric
  (per-item verdict, conservative bar) — but reconcile is build-vs-spec, not diff-vs-plan; ADOPT D11
  (reconcile writes the curated layer).
- **Decomposition.** Orchestrator composing shared `spec-diff` (build↔spec, also specify/review),
  `log-decision` (also design/debrief), and a harness-overlay `spec-amend` primitive (delegate
  amendment mechanics). Modes: `draft` / `adjudicate` / `enact`.
- **Primitive.** Collaborative skill (adjudication is operator-owned) with an autonomous draft pass;
  spec-diff is deterministic, the verdict is judgment, the land-gate is a deterministic check.
- **Contract.** In: review divergence list + design doc + touchpoints + spec files. Out: spec ?=
  reality true (or an open loop item per gap) + ≥1 decisions entry. **Gate to land: no open
  `reconcile→build` / `review→build` item.** Missing touchpoints table → bounce to design.
- **Edges.** follows `review`; **owns `reconcile→build` loop**; precedes `land` (gated); composes
  `spec-diff`, `log-decision`, harness `spec-amend`.
- **Shared assets.** spec-diff, log-decision → two-layer decisions store, harness `spec-amend`, lens
  family (conformance lens), worktree (if re-build).
- **Open Qs.** (1) owns the gate, doesn't re-adjudicate review's correctness. (2) delegate amendment
  mechanics to a harness overlay (keeps factory general) — confirm. (3) per-item vs sprint-close
  (mode). (4) autonomy threshold (auto-accept exact matches / auto-amend mechanical drift; gate the
  rest). (5) decisions-entry schema (`amends:`/`status:`). (6) no-spec-layout still logs a decision.

### land

- **Scope.** Take the **verified tree** to production and confirm it healthy. A **thin orchestrator**
  over three sub-arcs — **ship** (tests→coverage→version→commit→PR), **deploy** (merge→deploy→wait),
  **canary** (post-deploy health) — plus the two human gates and the deploy report. gstack ships these
  as three separate battle-tested skills (`/ship` ends at "PR created"; `/land-and-deploy` takes over;
  `/canary` standalone) — the split is well-precedented.
- **Goals.** Verified change reaches prod confirmed-healthy; no irreversible merge without an informed
  gate; low toil (≤2 interrupts); clean rollback when prod is unhealthy.
- **Prior art.** ADOPT gstack `ship` (the ship sub-arc; ends at PR) + `land-and-deploy` (deploy sub-arc
  + the land skeleton: pre-flight→CI-wait→readiness-gate→merge→deploy→canary→revert→report); ADAPT
  `canary` (single-pass `--quick` inline in deploy; continuous loop is a separate opt-in arc); ADAPT
  `landing-report` (a read-only queue lens, not a stage), `setup-deploy` (harness overlay config); CE
  `ce-commit`/`ce-release-notes`/etc. REJECTED as separate core nodes (not installed; finer overlay
  decomposition only).
- **Decomposition.** **Split into ship / deploy / canary sub-arcs** (D23: all three pass reuse +
  cohesion + JIT; gstack already ships them separate), orchestrated by a thin `land`. Finer commit/
  release-notes/cleanup nodes deferred to harness overlay. canary leans on the shared `browse` primitive.
- **Primitive.** `land` = orchestrator skill (holds verdict/merge-SHA/report across sub-arcs); ship's
  review fan-out + canary's browse probes = isolated agents. Modes: deploy `staging-first|prod-direct|
  staging-only`, canary `quick|full`. Mechanical spine deterministic; gates + health judgment not.
- **Contract.** In: verified tree (staleness checked, not re-reviewed) + harness deploy-config. Out: a
  **deploy report** (`status, pr, merge_sha, deploy_status, *_s timings`) + ship metrics → consumed by
  debrief. Failure → `REVERTED` + revert SHA, or STOP with a named blocker.
- **Edges.** follows `reconcile`; invokes ship→deploy→canary; canary invokes `browse`; precedes
  `debrief`; **land→reconcile/build revert loop** (canary-fail/blocker bounces back — a real cycle).
- **Shared assets.** browse primitive, queue lens (next-version/landing-report), review-state lens,
  diff-scope, deploy-config (harness overlay), metrics sinks.
- **Open Qs.** (1) ship checks review staleness only (no double review) — confirm. (2) merge gate is a
  hard human gate by default; harness may opt into auto-merge. (3) staging-first auto-on when staging
  exists + code diff. (4) continuous canary always a follow-up, not in-arc. (5) finer commit/release/
  cleanup nodes = overlay. (6) ship/deploy/canary render to skills (standalone-invocable).

### debrief

- **Scope.** Close the arc: **measure** the sprint's declared outcomes off the instrumentation
  timeline, **capture** durable learnings into the two-layer decisions store, **amend/route**
  improvements (factory vs harness, PR-gated), and **seed** the next align-context. The sprint-scale
  half of the improvement loop (`06-analytics`: instrument→review→reconcile→amend). **Owns
  outcome-measurement** (it runs last, sees the whole traversal).
- **Boundary.** vs `reconcile`: reconcile makes *this change's* spec honest (pre-land, loops to
  build); debrief makes *the factory* smarter (post-land, loops to align-context). `document-release`
  belongs to reconcile, not debrief.
- **Goals.** Outcomes measured not asserted (% touched nodes with a computed metric; earns-keep
  breaches flagged); learnings curated + later recalled; improvements correctly routed + PR-gated;
  next sprint pre-seeded.
- **Prior art.** ADOPT gstack `retro` (timeline→trend→seed spine, retargeted at the graph event log +
  per-node metrics); ADAPT `learn` (capture+curate); ADAPT CE `ce-compound` (isolated-agent structured
  capture) + `ce-product-pulse` (read-only windowed measurement; but our thresholds are declared via
  earns-keep) + `ce-session-historian` (isolated synthesis agent — **must not call `Skill`**, CE #794)
  + `ce-compound-refresh` dispositions; ADOPT be-civic forcing-rule (finding → labelled PR, never
  silent); REJECT `document-release` (that's reconcile).
- **Decomposition.** **Two isolated sub-nodes + one inline step** under a collaborative orchestrator:
  `measure-outcomes` (agent, deterministic — event log + baseline) + `capture-learnings` (agent,
  generative, no-`Skill` constraint) + inline `amend/route` (orchestrator owns the control flow).
  Lightweight mode for thin sprints.
- **Primitive.** Orchestrator = collaborative skill, generative; `measure-outcomes` = deterministic
  agent; `capture-learnings` = generative agent. Measurement deterministic, interpretation collaborative.
- **Contract.** In: sprint window + touched node-ids + arc id + carried-in open questions. Out:
  measured outcome report + decisions entries + 0..n labelled PRs (`factory-loop`/`harness`/`graph`/
  `handbook`) + the carry-forward payload. Invariant: no finding silently dropped. Thin log →
  `insufficient-evidence`, never fabricate.
- **Edges.** follows `land`; **`debrief→align-context` loop** (the arc-closing back-edge); invokes
  measure-outcomes + capture-learnings; references decisions store + graph-record + event log;
  composes-into dev-sprint. **Factory vs harness routing** lives here (general→factory PR; specific→local).
- **Loop payload.** The `debrief→align-context` edge carries **pointers into the durable stores**
  (open questions, outcome verdicts, earns-keep flags, decisions delta, routing receipts) — recalled
  via gbrain, not a copied blob.
- **Shared assets.** instrumentation timeline + event log + baseline, graph-record, two-layer decisions
  store, per-node goals frontmatter, branch/label model + forcing rule, measure/capture fan-out family.
- **Open Qs.** (1) per-arc vs windowed cadence (lean per-arc + opt-in windowed). (2) earns-keep =
  propose-never-auto-cut. (3) decisions write PR-gated in steady state. (4) factory-promotion = flag
  only (locality). (5) is measure-outcomes shared with review or distinct. (6) lightweight mode for
  tiny sprints.

---

## Part C — shared layer (wave 3)

### lens-family (the highest-reuse subgraph)

- **Structure.** **N lens nodes (one per dimension, `target`-parameterised) + 1 shared
  dispatch/merge/triage node + inline shared assets** (findings-schema, severity-scale,
  confidence-anchors). Each lens = agent (isolated, returns structured findings); dispatch = skill in
  the consuming stage. **Collapse CE's doc/diff duplication into one parameterised lens per dimension**
  (`target ∈ {doc, diff}`, `document_type`, `origin`).
- **Core (always-on):** correctness, security (lower gate, P0@50 survives), tests, maintainability,
  adversarial. **Conditional:** performance, design, DX, runtime. Selection = orchestrator judgment.
- **Target & ordering** are per-consumer, set by the stage not the lens: **review (diff) = parallel
  fan-out + batch table; design/plan (doc) = parallel generation, sequential surfacing** (human edits
  the doc); plan-review suppresses re-litigation via `origin`.
- **Aggregation** (identical regardless of target): validate → dedup (fingerprint) → cross-reviewer
  corroboration → confidence-gate → severity-sort → route. Deterministic merge (auditable).
- **Prior art.** ADOPT CE reviewer fleet (`agents/ce-*-reviewer.md`) as the lens contract + its
  `findings-schema.json` + the `ce-code-review` Stage-5 merge machinery; ADAPT gstack `plan-eng-review`
  sequential doc-surfacing + `review`/`cso` hunt-lists; REJECT one-mega-reviewer.
- **Harness overlay.** A product adds a lens = a new lens-node + an edge registering it in the
  dispatch catalog; vendored family never mutated. (CE `ce-agent-native-reviewer` = the template.)
- **Open Qs.** collapse doc/diff files (recommend yes); dispatch one node vs fan-out+merge split;
  per-lens confidence-gate overrides (recommend yes — security's P0 floor); cross-stage corroboration
  (ties to D30 `agent-memory`).

### explore / research

- **Decomposition.** **ONE node, modes-as-nodes** — `repo` / `learnings` / `framework-docs` / `web` /
  `best-practices`. Shared contract (scoped-in, read-only, isolated, distilled-digest-out, token-capped);
  methodologies diverge per mode (JIT-loaded). Agent (isolated, returns digest — the Anthropic Explore
  pattern: return the conclusion, not file dumps).
- **Consumers.** align-context (`repo`,`learnings`), design (`web`,`best-practices`,`learnings`), plan
  (`repo`,`framework-docs`,`web`,`learnings` — parallel fan-out), build (`repo`,`framework-docs` JIT).
- **Inline tools, not siblings.** `browse`/`scrape` (web mode), `gbrain query` (learnings), Context7
  (framework-docs) are **inline MCP/tool calls in the mode body**, not nodes.
- **Prior art.** ADOPT CE researcher agents (repo/learnings/framework-docs/web/best-practices) + the
  web agent's research-value header + token-budget cap + untrusted-input handling; ADAPT learnings →
  gbrain substrate.
- **Open Qs.** modes as separate agent files vs one agent + mode-arg (recommend separate files for JIT
  + per-mode metrics); who writes findings back (read-only → reconcile/debrief persist); gbrain vs
  decisions-store precedence; parallel fan-out token cap.

### security (three homes)

- **Decomposition.** **ONE shared security node, modes-as-nodes** — `lens` (diff), `plan-lens` (doc),
  `daily` (whole-surface, 8/10 gate), `comprehensive` (whole-surface, 2/10). The lens and audit are the
  **same engine at different scope + gate** (gstack `cso`'s own `--diff × scope` matrix proves it). The
  **security persona is authored once** as a shared lens-family agent-node; the lens consumes it, the
  audit spawns it as its parallel verifier. (Three homes — wave-1 under-counted by missing plan-lens.)
- **Prior art.** ADAPT gstack `cso` (phase model, two-mode gate, FP catalog, parallel verifier, trend
  schema — strip gstack boilerplate); ADAPT CE `ce-security-reviewer` (diff lens) + ADOPT
  `ce-security-lens-reviewer` (plan lens); REJECT `ce-security-sentinel` (subsumed).
- **Harness overlay.** threat model (what's RESTRICTED, STRIDE components), secret-store reality (the
  bw-secrets broker discipline), trusted-source allowlists. The *rule* is factory-general; the *lists*
  are harness.
- **Primitive.** lens/plan-lens = agent; audit = skill (interactive) spawning verifier agents.
- **Open Qs.** reconcile CE vs cso findings schema to one; lens always-on vs conditional-trigger
  (recommend default-on, downgrade path); who owns the periodic schedule (arc, not security);
  plan-lens as mode vs distinct node; self-referential skill supply-chain scan.

### design-review (two nodes)

- **Decomposition.** **TWO nodes, not one with modes** — `design-review` (runtime visual-QA on the live
  app: fix-loop + atomic commits + before/after screenshots + `design-baseline.json`) and
  `plan-design-lens` (plan-stage: completeness rating + mockups, amends the plan). Distinct
  inputs/outputs/goals → D23 split. Both collaborative skills, generative.
- **vs qa.** Runtime twin of qa — **shares the `browse` primitive + fix-verify loop structure**, differs
  in the *lens* (visual/AI-slop vs behavioural). qa-methodology is qa-specific, not shared.
- **Shared block.** The ~500-line UX-principles body (Three Laws, Goodwill Reservoir, AI-Slop blacklist)
  is duplicated across both gstack skills → factor into a **`ux-principles` reference node**. `$D`
  designer binary = inline subprocess. DESIGN.md = harness overlay.
- **Prior art.** ADOPT gstack `design-review` + `plan-design-review`; ADOPT `design-consultation` as a
  `loads` prerequisite (creates DESIGN.md); `design-shotgun` = sibling exploration node.
- **Open Qs.** factor ux-principles (reference vs inline vs node); naming (`design-lens` vs
  `plan-design-review`); qa∥design-review run order; `$D` inline vs node.

### browse (NOT a node)

- **Verdict.** **browse is not a node — it is an inline tool / `invokes`-edge to a script.** It owns no
  branching; it's the execution surface, consumers own the judgment. The binary is an **external tool**
  (referenced asset / env-setup), never a `.claude` primitive node.
- **Tool-agnostic.** Concrete backend (gstack `$B` ~100ms/0-tokens default; CE `agent-browser`; Chrome
  MCP for auth-bound/interactive) is **harness detail** behind a `{{browser.exec}}` resolver. The
  `{{browser.setup}}` (binary-resolve + CDP-mode check) is a **define-once resolver snippet** (D25),
  emitted inline.
- **`setup-browser-cookies` IS a node** (interactive, own goal) — a JIT auth precondition consumers
  `invokes` only when not in CDP mode and the URL is auth-gated.
- **Consumers.** qa, design-review, canary, benchmark, scrape (all inline `$B` calls).
- **Open Qs.** `{{browser.setup}}` resolver vs inline-dup; auth as node vs a `requires-auth` edge type;
  alternate backends as `references` resolved by overlay; codified browser-skills earn nodes? (recommend
  `invokes`-edge scripts).

### worktree-isolation (ride the native primitive)

- **Verdict.** **Lean on Claude-native `isolation: 'worktree'` + `.worktreeinclude` (D30) as the primary
  path** — Claude manages create/copy/cleanup; for arc nodes it's **inline config on the Agent spawn**,
  not a node. `.worktreeinclude` (repo-root, committed) = a `references` endpoint. (D29: ride the
  primitive where strongest.)
- **Custom-script fallback = a `script` node** (`invokes`) only for: non-Claude harnesses, branch-aware
  `mise`/`direnv` trust, shared-file copy beyond `.worktreeinclude`. Prior art: CE `worktree-manager.sh`
  (ADOPT shell logic), `experiment-worktree.sh` shared-file copy, gstack `lib/worktree.ts` prune-stale.
- **Note.** Read-only reviewers don't need isolation (only committing agents do).
- **Open Qs.** is native `isolation:worktree` + `.worktreeinclude` stable (drives default-vs-fallback);
  is branch-aware trust needed for agents; script as node vs `{{WORKTREE_SCRIPT}}` resolver asset;
  reconcile parallel?

### plan — refinement (principles over manifest)

Per operator direction, `plan` teaches **principles**, not a rigid manifest. It emits a **staged,
dependency-annotated plan**, and the centre of gravity shifts from artefact-fidelity to teachable
how-to-plan. The six principles the node teaches:

1. **Stage by gates and risk**, not line count — breakpoints where a decision needs confirming, a risky
   step lands, or a phase completes (plan proposes from risk, operator approves).
2. **Divide into units with declared surfaces** (Goal / files-or-nodes-touched / verification /
   dependencies; stable U-IDs) — the declared surface makes parallelization *computable*.
3. **Parallelize via a Safety Check, not optimism** — default serial-by-dependency; promote to parallel
   only when units pass a **file/node-to-unit overlap check**; batch by the dependency DAG (cap ~5),
   split at stage boundaries, never split units sharing a surface. ("**Batch**" = CE's `ce-work` parallel-
   batch construct + Parallel Safety Check + worktree-isolated batches — the operator's inspiration.)
4. **Declare the agent per workstream, and choose sub-agent vs agent-team by the "talk test"** —
   **sub-agent by default** (own context, reports back, cheap); **agent-team only when the workstream is
   a debate** (competing hypotheses, cross-checking, mid-flight shared state; experimental + costly).
   Route model by tier (judgment→opus, mechanical→sonnet, discovery→haiku).
5. **Keep two species distinct** — plan-*composition* (this node) vs plan-*review* (sequential lens
   gauntlet it *invokes*, gstack `autoplan` style).
6. **Generalise, don't choreograph** — fix stages/units/surfaces/dependencies/agents/breakpoints; omit
   code, signatures, shell choreography (keeps the plan portable + process-agnostic).

gstack has **no batch artefact** — its equivalent is the CLAUDE.md "divide work by **context surface**"
forcing rule (a principle) + `autoplan`'s sequential review. This lands plan open-Q1 on **hybrid**:
explicit batch + breakpoint structure, declared-but-not-hard-bound agent selection.

---

## Capstone — the full graph map

_Next: assemble the complete node + edge + goal map (all ~25–30 nodes across backbone + shared layer +
sub-arcs, with primitive leanings and edges) as the single whole-picture view — then the comprehensive
handbook resync (D22–D30), then authoring._
