---
title: Research report for plan
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: "Backfill external analogue search: ce-plan (CE plugin), be-civic sprint W24, Anthropic skill authoring best-practice; added External analogues searched table, deepened Source inventory, added Challenge findings section. sources_lifted updated to 5."
  - date: 2026-06-03
    note: "build-spine/D57 footprint: Phase-1 field-fill now produces acceptance_check (7-field IU set); added the single-agent-implementable decomposition criterion (harness-tunable ~100k budget; size re-anchored to single-agent fit, L/XL = probably split; tokens_per_iu over-budget share as plan decomposition-quality signal); updated the IU-completeness goal to 'all required fields incl. acceptance_check'. Cross-ref D57 / docs/iu-sizing-design.md. node-edit only, no new edges. CF-1..CF-5 left untouched per scope."
sources_lifted: 5
external_analogue_found: true
external_corpora_searched:
  - "CE plugin (compound-engineering/skills/ce-plan/SKILL.md + references/)"
  - "gstack live skills (autoplan, plan-eng-review, office-hours, plan-ceo-review)"
  - "be-civic operational harness (bc-workspace-devops-stubs-beta/roadmap/sprints/)"
  - "Anthropic Claude Code best-practices docs (code.claude.com/docs/en/best-practices)"
  - "Anthropic Skill authoring best-practices (platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)"
  - "Published planning methodology: INVEST / vertical-slice (web search)"
researcher_adequacy_note: |
  The original 2026-06-01 report was synthesised from in-repo design docs only (dev-sprint-backbone-design.md
  and docs/graph-map.md) — a known contract gap. This 2026-06-03 backfill searched all required corpora:
  (1) CE plugin ce-plan SKILL.md — 766 lines, the closest real counterpart — was lifted verbatim;
  (2) ce-plan's universal-planning.md reference was also lifted; (3) be-civic sprint W24 was lifted as a
  real operational plan artefact from the consuming harness; (4) Anthropic Claude Code best-practices and
  skill-authoring best-practices were fetched; (5) gstack skills (autoplan, plan-eng-review) were read but
  not lifted (they are plan-review/meta-review skills, not plan-production skills — different job). Web search
  confirmed INVEST / vertical-slice as the published methodology behind the decomposition discipline. The
  external_analogue_found flag is true: ce-plan is a real, deployed counterpart doing substantially the same
  job. Challenge findings (see below) are grounded in concrete ce-plan features the stack-graph plan node
  lacks or handles differently. Recommendation: proceed to translator with awareness of challenge findings;
  the node is sound but several gaps warrant amendment proposals before the backbone wiring wave.
---

# Research report for plan

## Identity

**Candidate id:** plan

**Candidate title:** Plan

**Scope:** The `plan` backbone stage of the dev-sprint arc. It takes a settled design +
spec amendment and produces a staged, dependency-annotated plan — one implementation unit
per buildable child workstream. It teaches planning principles, dispatches the lens family
over the plan doc (sequential, plan-review), and holds the operator in the loop throughout.
It does NOT write the carrier (no write-edge per D44); the `children[]` field is populated
by the curator and/or projected when build spawns child work-units.

## Goals

| outcome | metric | earns-keep |
|---|---|---|
| A staged, dependency-annotated plan is produced before build — rework from unsequenced or under-specified work trends down. | Build-stage rework events traced to planning gaps (missing deps, wrong sequencing, thin acceptance criteria) per sprint. | Build-stage planning-rework stays below the pre-plan baseline over N sprints; if plan never lowers it, the stage is cut or restructured. |
| Each implementation unit carries a complete IU-schema record — goal, files, dependencies, acceptance, `acceptance_check`, size — so build can operate autonomously without re-asking what plan already settled. | Share of IUs entering build with all required IU-schema fields populated, incl. `acceptance_check`; build-stage "what does this IU mean?" re-asks per sprint. | Re-ask rate trends toward zero; a routine re-ask is a plan quality gap, flagged at lens review. |
| Planning principles are taught in-session — the operator leaves with an understanding of how the plan was sequenced and why. | Operator-acknowledged understanding of the sequencing rationale; downstream re-planning traced to a principle the operator didn't understand at plan time. | Downstream re-planning from misunderstood sequencing trends toward zero over N sprints. |
| The plan is checked by the lens family before advancing — plan-level risks surface here, not at build. | Share of plan sessions where the lens family surfaced ≥1 actioned finding; risks left unexamined at plan that bit at build. | Plan-stage lens findings measurably displace later build/review findings; a lens pass that routinely surfaces nothing real is a tune/cut signal. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** Planning is operator-in-loop: the operator holds the context on intent,
priorities, and constraints that no autonomous pass can substitute. The skill loads into
the current context; the operator reviews and approves the plan before build. Autonomous
is wrong — the commit-to-build gate sits right after plan, and the plan artefact feeds
it. Collaborative is the only honest mode.

**`determinism:`** `generative`

**Rationale:** Decomposing a design into a dependency-annotated IU breakdown, sequencing
workstreams, and dispatching the lens panel all require generative judgment. The output
(the plan doc) is not computed from fixed inputs — it is synthesised from design docs,
spec touchpoints, context, and the lens findings.

## Contract

**Input:** The carrier (for `lifecycle_state`, prior history, objective, parent/child
decomposition — read-only), the settled design doc and spec amendment from `specify`, an
optional mode token (`compose` / `deepen` / `re-plan`), and any re-entry context (in
`re-plan` mode, the prior plan doc + the build-stage signal that triggered re-entry).

**Output:** A **plan doc** on a harness surface — an ordered set of implementation units
each conforming to the IU-schema (id, goal, files, dependencies, acceptance,
`acceptance_check`, size), with explicit sequencing rationale and dependency annotations.
`acceptance_check` is the runnable command that proves each IU's `acceptance` — build runs
it and shows the raw output as the done-evidence. The ranked lens findings over the plan
doc are surfaced and actioned in-session. No carrier write.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| CE plugin (`compound-engineering/skills/ce-plan/`) | Full planning skill — IU decomposition, sequencing, review dispatch, re-plan loop, operator gates | yes — primary analogue | `ce-plan-SKILL.md` |
| CE plugin (`ce-plan/references/universal-planning.md`) | Domain-agnostic quality criteria for plan artefacts | yes | `ce-plan-universal-planning.md` |
| gstack live skills: `autoplan`, `plan-eng-review`, `plan-ceo-review`, `office-hours` | Plan-production skill (not plan-review) | no — these are review-of-a-plan skills, not produce-a-plan skills; different job | — |
| be-civic operational harness (`roadmap/sprints/`) | Real operational plan artefact from the consuming product — what the output looks like at harness level | yes — sprint W24 | `be-civic-sprint-W24.md` |
| Anthropic Claude Code best-practices (`code.claude.com/docs/en/best-practices`) | Canonical Explore→Plan→Implement→Commit pattern; plan-validate-execute; subagents for investigation | yes — web-fetched, not lifted verbatim; key findings noted in Challenge section | — |
| Anthropic Skill authoring best-practices (`platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices`) | Operator-in-loop patterns, feedback loops, degrees-of-freedom model, plan-validate-execute | yes — web-fetched, key findings noted in Challenge section | — |
| Published methodology: INVEST / vertical slices / Mike Cohn (web search) | Story decomposition criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable); GWT acceptance criteria | yes — web search, not lifted verbatim; informs Challenge section | — |

**No in-repo docs are counted as external analogues.** The prior report had zero external
corpora searched; this backfill corrects that gap.

## Source inventory

| file | status | notes |
|---|---|---|
| `docs/dev-sprint-backbone-design.md` | keep | Primary in-repo source — plan section, carrier model, gates, F7 seams |
| `docs/graph-map.md` | keep | Plan row in backbone table, lens-consumer invariant, lens family |
| `source-material/ce-plan-SKILL.md` | keep (challenge) | Compound Engineering's deployed plan skill — 766-line real counterpart. Used to challenge the node on missing features (test scenarios, explicit blocking-question gate, brainstorm-to-plan handoff, scoping synthesis, output format, plan doc naming convention, distribution check). |
| `source-material/ce-plan-universal-planning.md` | keep (challenge) | ce-plan's domain-agnostic quality criteria — reveals actionability, time-awareness, contingency coverage as quality dimensions not explicitly named in the node. |
| `source-material/be-civic-sprint-W24.md` | keep (reference) | Real operational sprint plan from the consuming harness. Shows: numbered deliverables list, out-of-scope section with reasons, critical-path wave diagram (parallel subagents), entry/exit verification gates checklist, sprint log. Confirms what a plan artefact looks like in production. |

## Keep / Drop

**Kept (absorbed into body):**
- The three modes: `compose` (default), `deepen` (hard/novel), `re-plan` (loop re-entry from build)
- Carrier read-only contract (D44): plan reads the carrier; it does NOT write it
- Lens-consumer invariant: hold finding-contract refs (`findings-schema`, `severity-scale`, `confidence-anchors`, `load: import`) + `lens-dispatch` (`load: on-demand`); dispatch with `target: plan` sequential (strategy-first, then parallel)
- `invokes explore` — for context gaps in the plan phase
- `references IU-schema (import)` — the plan↔build field contract
- Phase-1 IU field-fill: plan produces all seven IU-schema fields per unit — `id`, `goal`,
  `files`, `dependencies`, `acceptance`, `acceptance_check`, `size`. `acceptance_check` is the
  runnable command that proves the unit's `acceptance`; build runs it and shows the raw output
  as done-evidence. A unit with `acceptance` but no `acceptance_check` is an incomplete IU.
- Phase-1 decomposition criterion (D57): each IU is sized to be a **single-agent-implementable
  unit** — buildable by one fresh agent within its best-work context budget ("one agent, bounded
  fresh context, split diligently"). The budget is a **harness-tunable dial** (~100k default;
  principle durable, number model-dependent — verify, don't bake in). A unit whose context (files
  + tests + impl) would overflow the budget is too coarse — split it. This re-anchors the `size`
  field's meaning: `size` is a single-agent-fit signal, and `L`/`XL` read as "probably split,"
  not a raw effort estimate. Downstream measurement: build emits `tokens_per_iu` per unit-complete
  event, and a persistently high over-budget share signals plan drew IUs too coarse — a plan
  decomposition-quality signal that `measure-outcomes` derives and `debrief` reads back.
- F7 prose: `can-follow specify` and `precedes build` (process neighbours do not yet exist on disk)
- F7 prose: `plan can-follow build` (the re-plan loop — build does not yet exist)
- The earns-keep for the commit-to-build gate: the plan is what the gate decides against

**Dropped (out of scope):**
- The commit-to-build gate itself — it is an operator decision at the `plan → build` boundary, not authored in the plan node
- Build's autonomous span — that is `build`'s concern
- The other backbone stages (reconcile, land, debrief) — separate nodes

**Edge only (separate node):**
- `explore` — a separate agent node; plan `invokes` it
- The lens agents — they `composes-into @plan` from their own side; plan does not direct-invoke them

## Overlaps and seams

- **← `specify`**: plan follows a settled spec amendment (`can-follow specify`); deferred F7
  (specify exists but is upstream; the `precedes plan` edge should be on specify's side — not
  yet there, pending backbone wiring wave).
- **→ `build`**: plan precedes build; deferred F7 (backbone wiring wave — both exist but process edges are wired in that wave).
- **plan ←→ build (re-plan loop)**: `plan can-follow build` is the re-plan entry; deferred F7 (backbone wiring wave).
- **lens family**: lenses already declare `composes-into @plan` — this node existing resolves
  those 10 pending `@plan` edges. Plan does not direct-invoke the lenses; it reaches them
  through `lens-dispatch` with `target: plan`.
- **IU-schema**: the field contract plan produces and build consumes — `references` edge
  (`load: import`).

## Fit

Single node — one primitive, one collaborative skill. The three modes (compose / deepen /
re-plan) are body branches; they do not earn separate goals or metrics. The lens dispatch
is a procedural phase within the body, not a separate node. The node's boundary is clean:
it starts after `specify` and ends at the plan doc + lens findings, ready for the
commit-to-build gate.

## Edges

| edge type | target id | rationale |
|---|---|---|
| `invokes` | `explore` | plan fans out explore for context gaps (repo / learnings / framework-docs) before decomposing |
| `composes-into` | `dev-sprint` (stage: plan) | plan is the backbone's planning stage |
| `references` | `IU-schema` (`load: import`) | the plan↔build field contract — always-present, short invariant; plan holds it and teaches it |
| `references` | `lens-dispatch` (`load: on-demand`) | the fan-out/merge procedure — read at the step of need |
| `references` | `findings-schema` (`load: import`) | the finding contract, passed into each lens spawn prompt |
| `references` | `severity-scale` (`load: import`) | the P0–P3 severity definitions — must-present alongside findings-schema |
| `references` | `confidence-anchors` (`load: import`) | the 0/25/50/75/100 confidence rubric — must-present |
| (F7) `can-follow` | `specify` | process — plan follows a settled spec amendment; deferred to backbone wiring wave per task brief |
| (F7) `precedes` | `build` | plan precedes build — deferred to backbone wiring wave |
| (F7) `can-follow` | `build` | the re-plan loop — deferred to backbone wiring wave |

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — consistent.

**`goals:` as outcomes:** All four goals state what plan achieves (build-rework reduction,
IU completeness, principle transfer, risk surfacing) and how to measure it, not the steps
plan runs.

**Edge targets resolvable:**
- `explore` → `graph/explore/explore.md` ✓
- `IU-schema` → `graph/_refs/IU-schema.md` ✓
- `lens-dispatch` → `graph/_refs/lens-dispatch.md` ✓
- `findings-schema` → `graph/_refs/findings-schema.md` ✓
- `severity-scale` → `graph/_refs/severity-scale.md` ✓
- `confidence-anchors` → `graph/_refs/confidence-anchors.md` ✓
- `specify` → `graph/specify/specify.md` ✓ (exists; F7-deferred per task brief — backbone wiring wave)
- `build` → `graph/build/build.md` ✓ (exists; F7-deferred per task brief — backbone wiring wave)
- `dev-sprint` → arc, not a node file — skipped per spec ✓
- `composes-into dev-sprint @plan` → resolves the pending `@plan` lens edges ✓

## Open questions

- **All process edges deferred**: all three inter-stage process edges (`can-follow specify`,
  `precedes build`, `can-follow build` re-plan) are deferred to the backbone wiring wave per
  the task brief. All target nodes exist on disk; the edges are wired when that wave runs.
  The wiring wave also adds `specify precedes plan` on specify's side.
- **Re-plan loop semantics**: `plan can-follow build` is the entry for `re-plan` mode.
  The exit criterion (what build-stage signal triggers re-entry) is described in the
  `re-plan` mode body and should be enforced when the edge is wired (with an explicit
  `max-attempt` + escalation label per the backbone design).
- **D57 / single-agent-implementable IUs (build-spine footprint)**: the Phase-1 field-fill set
  now produces `acceptance_check` (seven fields), and the decomposition criterion is single-agent
  fit against a harness-tunable context budget (~100k default). Translator: re-anchor the `size`
  field's meaning to that fit and carry the `tokens_per_iu` over-budget share as the
  decomposition-quality signal. Grounding: `docs/decisions.md` D57 and `docs/iu-sizing-design.md`
  (Spec touchpoints → `plan` Phase 1); the updated `graph/_refs/IU-schema.md` (v0.2.0) holds the
  field + invariant this node produces against. No new edges — plan already holds the IU-schema
  `references` edge.
- **See Challenge findings below** — several gaps identified against ce-plan that are
  candidates for amendment proposals before the backbone wiring wave.

## Challenge findings

These findings compare the `plan` node against its real-world analogue (ce-plan) and
published best practice. They are surfaced here for operator consideration; the canonical
node file is unchanged.

### CF-1 — Missing explicit operator confirmation gate before lens dispatch (high)

**Analogue:** ce-plan Phase 0.7 / Phase 5.1.5 require a mandatory operator confirmation
gate before advancing to research / plan-write. The gate is not advisory — the skill
hard-blocks until the user confirms or redirects. The format is a structured "scoping
synthesis": a scope claim at affirm-or-redirect level that the operator must confirm.

**Gap in `plan`:** Phase 2 of the node says "Surface the draft units to the operator
before advancing to the lens phase. Invite them to challenge the decomposition" — but
this is advisory, not a hard gate. The node does not specify what the operator's
confirmation looks like, when exactly it fires, or what happens if no blocking tool is
available.

**Recommendation:** Add a mandatory confirmation gate between Phase 2 and Phase 3. The
gate should be a structured summary of the draft decomposition at an affirm-or-redirect
level (analogous to ce-plan's scoping synthesis), fired via the platform's blocking
question tool, before the lens dispatch. Without this gate, a flawed decomposition
advances to lens review without the operator seeing the scope claim explicitly.

### CF-2 — IU acceptance criteria weaker than published best practice (high)

**Analogue:** ce-plan Phase 3.5 requires per-unit test scenarios categorised into happy
path / edge cases / error paths / integration scenarios — specific enough that "an
implementer knows exactly what to test without inventing coverage themselves." The
INVEST methodology (cited in published best practice) requires Testable as one of six
story quality criteria, with concrete conditions of satisfaction / GWT acceptance criteria.

**Gap in `plan`:** The `acceptance` field in IU-schema is defined as "observable
conditions (tests pass, behaviour X holds, endpoint returns Y)" — a correct definition but
substantially thinner than ce-plan's test-scenario categorisation. The node does not
require categorisation into happy path / edge / error / integration scenarios. A one-line
acceptance criterion satisfies the schema even though it will produce under-tested build
units.

**Recommendation:** Strengthen the `acceptance` field guidance in the node body: require
categorisation into at minimum happy-path and error-path scenarios; flag units with
single-line acceptance criteria as plan quality gaps at lens review. Consider referencing
INVEST's Testable criterion.

### CF-3 — No plan doc naming convention or harness surface routing (medium)

**Analogue:** ce-plan Phase 3.1 specifies a deterministic naming convention
(`docs/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.md`) and creates the
directory if missing. The be-civic sprint W24 shows how a real harness surface (sprint
doc with frontmatter) is structured with explicit canonical-plan / canonical-design
pointer fields. The Anthropic best-practices doc mentions naming sessions descriptively
for discoverability.

**Gap in `plan`:** The node says "write the plan doc to a harness surface" but says
nothing about what that surface is, where it lives, what it's named, or what frontmatter
it carries. The bindings contract / harness-init scaffold the empty surface skeleton, but
the node gives no guidance on how to populate the surface pointer or name the artefact.

**Recommendation:** Add a Phase 4 note specifying: the plan doc should carry a
machine-readable frontmatter (date, work-item id, status) so the curator can project it;
the harness surface pointer is resolved from the bindings; the artefact name should be
deterministic and stable across re-plans (a re-plan overwrites the same file, not a new
one, so `build` and the curator maintain a stable reference).

### CF-4 — `deepen` mode lacks adversarial lens activation spec (medium)

**Analogue:** ce-plan Phase 5.3 (Confidence Check and Deepening) specifies precisely
when the deepening pass fires (plan depth × risk profile × thin-local-grounding override ×
load-bearing-external-research override), which sub-agents to dispatch per section gap,
and how to merge findings. The adversarial lens is one of several conditional lenses; the
dispatch is condition-driven, not just depth-driven.

**Gap in `plan`:** The `deepen` mode body says "run the dispatch with the adversarial lens
active (and any other conditional lenses the complexity triggers)" — but the conditions
under which the adversarial lens fires are not specified. The node defers to `lens-dispatch`
for selection, but the lens-dispatch reference does not name adversarial-lens activation
conditions explicitly.

**Recommendation:** Specify the adversarial-lens activation conditions in the `deepen`
mode body (or in lens-dispatch): architectural uncertainty, contested scope boundaries,
novel dependency graphs, cross-cutting changes, or a plan-depth classification of Deep.
Without explicit conditions, the adversarial lens either fires every time (waste) or never
fires in practice.

### CF-5 — No scoping synthesis / call-out output before plan is committed (medium)

**Analogue:** ce-plan Phase 0.7 (solo) and Phase 5.1.5 (brainstorm-sourced) both require
a pre-commit scoping synthesis — a scope claim the operator can affirm or redirect before
the plan document is written to disk. The synthesis explicitly distinguishes Stated /
Inferred / Out-of-scope and surfaces only the forks where operator input materially changes
the plan.

**Gap in `plan`:** The node's four phases do not include a distinct pre-finalise synthesis
step. Phase 4 finalises the plan doc and surfaces lens findings, but there is no structured
"here is the scope claim, do you want to redirect?" moment before the plan is written.
The operator may approve a plan that contains inferred scope decisions they would have
redirected if asked explicitly.

**Recommendation:** Add a structured scope-claim output at the end of Phase 2 (before
the lens dispatch fires) that names: what the plan covers, what it defers, and any
inferred decomposition choices that could go another way. This parallels the scoping
synthesis in ce-plan and gives the operator a cheap checkpoint before the more expensive
lens pass runs.

### CF-6 — Plan depth classification absent (low)

**Analogue:** ce-plan Phase 0.6 classifies work into Lightweight / Standard / Deep before
any research or decomposition runs. The depth classification drives: how much operator
interaction is required, whether external research is needed, which review sections apply,
and whether the confidence check gate fires. This is a prerequisite for right-sizing the
plan pass.

**Gap in `plan`:** The node does not classify plan depth before running. The `compose` /
`deepen` / `re-plan` mode distinction is operator-supplied, not inferred from the work. A
`compose` invocation on a Deep plan will get the same treatment as a Lightweight one unless
the operator explicitly supplies `deepen`. This risks under-planning complex work.

**Recommendation:** Add a depth classification step at the start of Phase 1 (or as a
Phase 0). If the design doc + spec amendment indicates cross-cutting scope, architectural
uncertainty, or multiple teams/surfaces, auto-escalate to `deepen` mode and notify the
operator. This mirrors ce-plan's automatic depth reclassification at Phase 1.4b.

### CF-7 — No explicit pipeline / headless mode (low)

**Analogue:** ce-plan has explicit headless-mode routing throughout: operator confirmation
gates are skipped, inferred bets route to an `## Assumptions` section instead of
call-outs, output format is forced to markdown, post-generation menu is skipped. This
makes ce-plan usable in automated pipelines (LFG, CI, cron) without blocking.

**Gap in `plan`:** The node does not specify a headless / pipeline mode. In the
stack-graph model, the loop can trigger plan autonomously (e.g., as part of a
debrief-fleet or scheduled re-plan). Without a headless mode spec, the operator-in-loop
assumption bakes in a synchronous human at every plan invocation.

**Recommendation:** Add a headless mode: when invoked from an automated context (no
synchronous operator), skip the operator confirmation gates, auto-choose the
decomposition based on the carrier + design doc, write the plan doc with an `## Assumptions`
section, and complete without waiting for confirmation. This is consistent with the
`autonomous` extension pattern already discussed in D44.
