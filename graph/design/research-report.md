---
title: Research report for design
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: "Backfill external analogue search: lifted gstack/plan-design-review, ce-brainstorm, ce-frontend-design; added External analogues searched section; updated Source inventory; added Challenge findings section; updated researcher_adequacy_note."
sources_lifted: 7
external_analogue_found: true
external_corpora_searched:
  - "gstack live skills (plan-design-review, design-consultation, design-review, design-shotgun)"
  - "CE plugin skills (ce-brainstorm, ce-frontend-design, ce-plan)"
  - "be-civic harness (all SKILL.md files — no design-equivalent found)"
  - "Published best practice: SVPG product discovery (svpg.com), ADR best practices (AWS, martinfowler.com, adr.github.io), Design Sprint methodology (designsprint.academy)"
researcher_adequacy_note: |
  2026-06-03 backfill. External corpora searched: (1) gstack live skills — plan-design-review is
  the primary analogue (collaborative, operator-interactive, multi-pass lens/dimension review over a
  design artefact before implementation); design-consultation, design-review, design-shotgun are
  also scoped and characterised but target visual/UI contexts rather than abstract item design.
  (2) CE plugin — ce-brainstorm is a secondary analogue (scope-assessment, rigor probes, synthesis
  checkpoint, mode taxonomy that directly parallels lightweight/standard/deep/experience); ce-plan
  and ce-frontend-design lifted as tertiary sources. (3) be-civic harness — no design-equivalent
  skill found. (4) Published best practice — SVPG product discovery (four-risk model, PM+designer+eng
  from the start, discovery-before-delivery principle, cross-functional yet lean team); ADR practice
  (single-decision scope, append-only records, design-doc separation from decision record, structured
  alternatives + confidence); Design Sprint methodology (decider role, problem-framing before sprint,
  evidence-based decisions). Three files lifted verbatim: gstack-plan-design-review-SKILL.md,
  ce-brainstorm-SKILL.md, ce-frontend-design-SKILL.md. Originals listed in _provenance.json.
  Confidence that external_analogue_found:true is high — plan-design-review is a strong real-world
  counterpart. Challenge findings focus on three structural gaps the analogues expose: (a) the scope
  checkpoint before dispatch (analogues gate the operator before the lens fan-out; the node does
  not); (b) absence of an evidence-state / confidence discipline at the design-question level
  (ADR/SVPG both require explicit confidence + alternatives considered); (c) missing resume/scope-
  detection pre-flight analogous to plan-design-review's UI-scope gate and ce-brainstorm's domain
  classifier. Recommendation: translator should review Challenge findings before finalising the node
  body; the scope-checkpoint gap is the most actionable candidate for a node amendment.
---

# Research report for design

## Identity

**Candidate id:** design
**Candidate title:** Design
**Scope:** The **shared product-management + engineering/design front** of the dev-sprint — the
collaborative stage where the product lens and the code/design lenses converge over the **same
carrier + experience-contract** to resolve the load-bearing design questions for a work-item
*by intended outcome*, before specify/plan/build. It owns: interrogating the design question to a
resolution by outcome; dispatching the **shared lens family over the design doc** (strategy-first
then parallel) to check the solution against value/feasibility/correctness at the *item altitude*;
producing a **design doc with an explicit Spec touchpoints table** ready for `specify`; and, for an
experience-bearing item, **authoring/refining the experience-contract** (UX invariants + failure
modes + AX budgets + intended tool-path) to the harness surface. It **excludes**: gathering raw
context (that is `explore`, which design invokes); performing any lens dimension itself (the lens
agents own that, dispatched via `lens-dispatch`); the product-strategy check itself (the
**product-lens**, built separately in the PM pack, which composes into `@design` from its own
side); authoring the canonical spec amendment (`specify`); and advancing the carrier's lifecycle
or recording a gate decision (PM/operator gates, never a stage's job). Design **reads** the carrier
and the contract and **writes** the design doc / touchpoints / contract to **harness surfaces
only** — it carries no carrier write-edge.

## Goals

The four governed goals (per `docs/dev-sprint-front-design.md` → `## design`), as outcomes:

| outcome | metric | earns-keep |
|---------|--------|------------|
| Load-bearing design questions are resolved by intended outcome before specify/plan/build, not left to surface as rework downstream. | design decisions recorded per session; design-rework after specify/plan traced to a question that was left unresolved at design. | downstream design-rework below the pre-front baseline over N sprints; if design never lowers it, the stage is cut or restructured. |
| The solution is checked against value-prop / target-user **and** code-correctness / feasibility *at the item altitude* (the four risks examined at the item scope), so item-level risks are surfaced at design rather than at build. | share of design sessions where the lens family + the product-lens surfaced ≥1 actioned finding; risks left unexamined at design that bit at build. | design-stage findings measurably displace later build/review findings; a design pass that routinely surfaces nothing real is a cut/tune signal. |
| A design doc carrying an explicit **Spec touchpoints** table is produced, ready for `specify`. | share of design sessions producing a touchpoints table; touchpoints `specify` later finds missing. | `specify` rarely has to reconstruct touchpoints from scratch. |
| For an experience-bearing item, the **experience-contract** is authored/refined at design (not discovered missing at verify). | share of experience-bearing items whose contract was authored/refined at design vs discovered missing/stale when `simulate-users` runs at verify. | `simulate-users` rarely runs against a missing or stale contract. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale (governed).** Design is the interaction-heavy front of the dev-sprint where PM and
eng/design think *together* — operator rounds, decisions, sign-off, and shared live state. That is
exactly the skill side of the context axis (`01-concepts` → *Skill or agent*): it loads into the
**current** context and keeps the operator in the loop. It mirrors `review` (a collaborative
orchestrating skill that consumes `lens-dispatch` and owns operator interaction) and sits in the
collaborative front family with `align-context` and `specify`. There is no ambiguity here — the
governed decisions fix `primitive: skill`, `mode: collaborative`. An agent (isolated, returns a
summary) would be wrong: design *is* the place the collaboration happens.

**`determinism:`** `generative`

**Rationale (governed).** Design produces judgement under uncertainty — resolving open design
questions by reasoning about intended outcomes, framing a solution, and authoring a contract. The
output is not a fixed function of its inputs (unlike a script or a deterministic reducer). Governed
as `generative`. (The *dispatch* reduction it borrows from `lens-dispatch` is deterministic from
the lens returns inward, but that determinism lives in the reference, not in design's own
reasoning, which is generative.)

## Contract

**Input:** an operator invocation carrying a **mode token** (`lightweight` / `standard` / `deep` /
`experience`), the **carrier** (the roadmap item / work-item — read for its `lifecycle_state`,
prior `transition_history`, the objective it serves, and any parent/child decomposition) read via
bindings (no edge — a harness surface), the **experience-contract** for an experience-bearing item
(read via the external `experience-contract` reference; the harness overlay binds it), and an
intent / design-question summary (often handed forward by `align-context`). Design **invokes
`explore`** for any scoped context gaps. It holds the **finding contract** (`findings-schema` /
`severity-scale` / `confidence-anchors`, imported) and the **`lens-dispatch`** reference
(on-demand), and reaches the product's **handbook + decisions** through the external `handbook`
reference (on-demand).

**Output:** a **design doc** that records the resolved design decisions and carries an explicit
**Spec touchpoints** table (spec doc / section / relationship), ready for `specify`; the **ranked,
routed lens findings** over that doc (from the dispatch), surfaced and actioned in-session; and —
in `experience` mode — an **authored/refined experience-contract** (conforming to
`experience-contract-schema`: session-shape invariants, named failure modes, AX budgets, intended
tool-path, each with an evidence state) written to the harness surface via bindings. All artefacts
are written to **harness surfaces**, not the carrier; completing design is the signal the
projection/curator picks up to advance `current_stage`. Design surfaces the **product-strategy
seam** in prose (the product-lens composes in from the PM side) but never invokes or edges to it.

## External analogues searched

Real-world search performed 2026-06-03. Corpora searched: gstack live skills; CE plugin skills;
be-civic harness; published best practice (SVPG, ADR literature, Design Sprint methodology).

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills (`~/.claude/skills/gstack/`) | Skills named `design*`, `plan-design*` — real collaborative design-front workflow analogues | yes | `gstack-plan-design-review-SKILL.md` |
| gstack live skills | `design-consultation`, `design-review`, `design-shotgun` — scope and characterise | yes (characterised, not lifted) | not lifted — target visual/UI domains, not abstract item design |
| CE plugin skills (`ce-plugin/plugins/compound-engineering/skills/`) | `ce-brainstorm`, `ce-frontend-design`, `ce-plan` — collaborative design/requirements front | yes | `ce-brainstorm-SKILL.md`, `ce-frontend-design-SKILL.md` |
| be-civic harness (`projects/be-civic/`) | All `SKILL.md` files — any design or pre-build front equivalent | no design-equivalent found | — |
| SVPG / Marty Cagan published best practice | Product discovery process: PM+designer+eng collaboration, four-risk model, discovery precedes delivery | yes (characterised, not lifted) | — (web content, not a local file) |
| ADR best practice (AWS 2025, martinfowler.com, adr.github.io) | ADR structure, single-decision scope, design-doc separation, alternatives + confidence | yes (characterised, not lifted) | — (web content) |
| Design Sprint methodology (designsprint.academy) | Design sprint phases, decider role, problem-framing before sprint, product operating model | yes (characterised, not lifted) | — (web content) |

**Summary of what was found.** The gstack `plan-design-review` skill is the primary real-world
counterpart to this node: it owns the collaborative design/review front over a plan artefact before
implementation, dispatches multi-dimensional review passes (7 passes; each rated 0-10 with
find-and-fix loops), holds the operator in the loop via AskUserQuestion gates, and produces an
improved plan doc ready for implementation. It differs in domain (visual/UI dimensions vs abstract
item-altitude risks) and resolution mechanism (0-10 rating per dimension vs lens-dispatch fan-out)
but is structurally analogous. CE `ce-brainstorm` is a secondary analogue covering the
requirements-front of the same job with an explicit scope-assessment, rigor-probe discipline
(evidence/specificity/counterfactual/attachment gaps), and a synthesis checkpoint before the
artefact is written — its mode taxonomy (Lightweight/Standard/Deep/Deep-product) directly parallels
this node's modes. SVPG product discovery and ADR practice are published best practices that
ground the domain's methodology.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `docs/dev-sprint-front-design.md` (`## design` + `## Governed decisions`) | keep | the authoritative governed spec for this node — modes, edges, goals, carrier rule, lens reuse, seams. Followed to the letter. In-repo design doc (not an external analogue). |
| `docs/graph-map.md` (lens family + design row + lens-consumer invariant) | keep | fixes the lens-family shape (one dispatch reference + lens agents `target`-parameterised), the lens-consumer invariant (hold the finding contract + `lens-dispatch`, pass the contract into each spawn prompt), and design's `composes / invokes` summary. In-repo. |
| `docs/experience-thread-design.md` | keep | the experience-contract is authored/refined at design; the UX+AX shape; the contract is harness-supplied (external); design is where it lands in the dev-sprint span. In-repo. |
| `docs/product-management-design.md` | keep (seam) | design is the shared PM+eng/design front; the product-lens composes into the front from the PM side, built separately — design leaves the seam in prose, no edge. In-repo. |
| `source-material/gstack-plan-design-review-SKILL.md` | keep | **primary external analogue** — real collaborative design-front skill that orchestrates multi-dimensional review over a plan artefact, holds the operator in the loop, produces an improved doc ready for the next stage. Challenges the node on: scope checkpoint, confidence/rating discipline per dimension, explicit gate before dispatch, visual verification step. |
| `source-material/ce-brainstorm-SKILL.md` | keep | **secondary external analogue** — real collaborative requirements-front skill with explicit scope assessment, rigor probes (evidence/specificity/counterfactual/attachment), synthesis checkpoint, and mode taxonomy that parallels this node's modes. Challenges the node on: pre-dispatch scoping gate, rigor probe discipline, resume/continuity support. |
| `source-material/ce-frontend-design-SKILL.md` | keep (partial) | **tertiary analogue** — real design-to-implementation front with visual thesis, content plan, interaction plan, and litmus check before verification. Domain is narrower (visual/frontend). Challenges the node on: the three pre-build planning statements as a scope checkpoint before the main phase. |

## Keep / Drop

**Kept (absorbed into body):**
- The four **modes** as body branches: `lightweight` (resolve inline, light doc, always-on doc
  lenses only) · `standard` (default: explore for gaps; dispatch the lens family over the doc
  strategy-first then parallel; author doc + touchpoints) · `deep` (novel/contested: multiple
  operator rounds, adversarial lens on) · `experience` (author/refine the experience-contract —
  the thread-spanning branch).
- The **lens-dispatch consumption** with `target: doc`, **strategy-first then parallel**, passing
  the finding contract into each lens's spawn prompt — identical in shape to how `review` consumes
  the same reference with `target: diff`.
- The **Spec touchpoints table** discipline (inlined for now; extracting a `spec-touchpoints-table`
  reference is deferred — minor).
- The **experience-contract authoring/refinement** in `experience` mode, conforming to
  `experience-contract-schema` (the four parts + evidence state).
- The **carrier-projected prose**: design reads the carrier for context and reads/refines the
  contract; it writes the design doc / touchpoints / contract to harness surfaces; it does **not**
  write the carrier — completing design is the signal the projection/curator picks up; advancing
  `lifecycle_state` and recording a `gate_decision` are PM/operator decisions, not design's job.
- The **product-strategy seam in prose**: the product-lens composes into `@design` from the PM
  side (built separately) — design names the seam but holds no edge to a node that does not yet
  exist (F7).

**Dropped (out of scope):**
- Performing any lens dimension itself — owned by the lens agents (dispatched, not done here).
- Authoring the canonical spec amendment — that is `specify` (design `precedes specify`).
- Advancing the carrier / recording a gate decision — PM/operator gates, not a stage's job.
- Raw context gathering — `explore` (invoked), not done in design's own window.
- The product-strategy check itself — the product-lens (PM pack), composing in from its own side.
- Visual mockup generation (gstack plan-design-review) — that is a UI/visual-context concern
  outside this node's domain; the node operates at the abstract item-altitude level.
- The 0-10 rating-per-dimension loop (gstack) — that is the visual review's mechanism; this node
  uses the lens-dispatch fan-out which is more general.

**Edge only (separate node):**
- The lens family — design depends on the `lens-dispatch` **reference** (not an invoke of the
  lenses); the lenses declare `composes-into @design` from their own side.
- `explore` — invoked for scoped context gaps.
- The **product-lens** is node-like but built separately and composes in from the PM side — per F7
  it is **seam-in-prose with no edge** until it exists.

## Overlaps and seams

- **← `align-context`** (`can-follow`): design follows align-context, which has aligned intent +
  constraints and (in spec-layout) captured a starting touchpoint set. Design consumes that intent
  and does not re-explore the same ground (the front gathers context once).
- **→ `specify`** (`precedes`): design hands the design doc + the explicit touchpoints table to
  specify, which turns it into the canonical spec amendment. Authored now (both endpoints exist).
- **→ the lens family** (via the `lens-dispatch` reference, `target: doc`): design fans out the
  active lenses over the design doc, strategy-first then parallel, passing the finding contract
  into each spawn prompt; the dispatch reduces the returns to one ranked, routed set design
  surfaces and actions. **One-way through the reference — design does not direct-invoke the
  lenses** (they `composes-into @design` from their side; verified in
  `graph/lens-correctness/lens-correctness.md`). Identical pattern to `review` over a diff.
- **→ `explore`** (`invokes`): scoped, isolated context gathering for any gaps before/while
  resolving the design question.
- **product-lens seam** (PM pack, no edge — F7): the CEO/founder/strategy review composes into the
  shared front from the PM side — *right problem? serves the value proposition and the target
  user? serves which objective?* Design **describes** this seam in prose and leaves the strategy
  check to the product-lens; it adds **no edge** to a node that does not yet exist.
- **carrier surface** (no edge — projected model): design reads the carrier (its `lifecycle_state`,
  prior `transition_history`, the objective it serves) via bindings and reads/refines the
  experience-contract via the external reference; it writes the doc / touchpoints / contract to
  harness surfaces. It carries **no carrier write-edge**; `current_stage` is projected from the
  observed traversal, not written by design.
- **`precedes plan`** (deferred — F7): described in prose only; the edge is authored when `plan`
  exists.

## Fit

A single node. It owns its own branching (the four modes) and sequencing (explore → resolve →
dispatch the lens panel → author doc/touchpoints; the `experience` branch additionally
authors/refines the contract). It states distinct, separately-measurable goals (design-rework
displacement; item-altitude risk surfacing; a touchpoints table; a contract authored at design).
It mirrors the established collaborative-orchestrator shape of `review` (consume `lens-dispatch`,
own operator interaction and routing, do no dimension analysis itself). No split is warranted: the
modes are branches of one skill (one node ⟷ one primitive, D34), not separate nodes — none earns
its own independent measurable goal that would promote it to a sibling node.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | dev-sprint (`stage: design`) | design is the dev-sprint's design stage; the arc is derived from these `composes-into` + process edges. |
| invokes | explore | scoped, isolated context gathering for gaps (read-only agent), as in the schema example and the backbone table. |
| references | lens-dispatch (`load: on-demand`) | the shared fan-out/merge/triage/route procedure design follows with `target: doc`; on-demand (larger, conditional — not every mode dispatches). |
| references | findings-schema (`load: import`) | the finding contract passed into each lens's spawn prompt; import (short, must-always-be-present invariant) — the lens-consumer invariant. |
| references | severity-scale (`load: import`) | finding contract; import — same invariant. |
| references | confidence-anchors (`load: import`) | finding contract; import — same invariant. |
| references | handbook (`load: on-demand, external: true`) | reaches the product's handbook + decisions for settled intent/rationale; external (harness-supplied; factory ships only the pointer — D41). |
| references | experience-contract-schema (`load: on-demand`) | the **shape** design authors the contract by (factory reference); on-demand (consulted in the `experience` branch). |
| references | experience-contract (`load: on-demand, external: true`) | the **harness's** contract content design reads/refines; external (harness-supplied; same surface `simulate-users` grades against). |
| can-follow | align-context | design follows the alignment stage (endpoint exists; authored now). |
| precedes | specify | design hands its doc + touchpoints to specify (endpoint exists; authored now). |

**Deliberately absent:** any `invokes` of the lenses (they compose into `@design`; design follows
the dispatch reference); any edge to the **product-lens** (built separately, seam-in-prose, F7);
any **carrier write-edge** (projected model — design reads the carrier, writes only harness
surfaces); `precedes plan` (deferred — F7, prose).

## Conformance

**`primitive:`↔`mode:` agreement:** `primitive: skill` ↔ `mode: collaborative` — agree (the
collaborative front orchestrator, mirroring `review`).

**`goals:` as outcomes:** all four read as outcomes (questions-resolved-by-outcome; item-altitude
risk surfacing; a touchpoints table produced; a contract authored at design), each with a metric
and an earns-keep threshold — carried through from the governed spec.

**Edge targets resolvable:** `explore` ✔ (`graph/explore/`), `lens-dispatch` ✔ (`graph/_refs/`),
`findings-schema` / `severity-scale` / `confidence-anchors` ✔ (`graph/_refs/`),
`experience-contract-schema` ✔ (`graph/_refs/`), `handbook` ✔ (external — factory ships the
pointer, no file to resolve), `experience-contract` ✔ (external — harness-supplied, no factory
file), `align-context` / `specify` — **sibling front nodes authored in the same pass**; both are
governed endpoints and resolve once that pass lands (they exist as design docs and are authored
alongside design). `dev-sprint` is an arc (derived, not a file — the maintainer does not resolve it
to a file). No unresolved targets that are not part of this same front-authoring pass.

## Challenge findings

Findings from comparing this node against its real-world analogues (gstack plan-design-review,
ce-brainstorm, SVPG product discovery practice, ADR discipline). These challenge the node's current
design and are offered for the operator's consideration — they are not automatic amendments.

### CF-1 (high): Missing scope-gate / pre-dispatch checkpoint — weaker than counterpart

**Finding.** Both primary analogues gate the operator before the main work phase. Gstack
`plan-design-review` requires the operator to respond to an AskUserQuestion confirming scope before
any lens/review pass fires (Step 0D: "I've rated this plan N/10 on design completeness. The biggest
gaps are X, Y, Z. I'll review all 7 dimensions. Want me to focus on specific areas?"). CE
`ce-brainstorm` requires a synthesis checkpoint (Phase 2.5) — the operator's last opportunity to
correct scope before the artefact lands. Neither analogue dispatches its fan-out without an
operator confirmation of scope and focus.

This node dispatches the lens family (Phase 2) without a corresponding gate: it surfaces findings
and "actions them in-session" but there is no explicit operator confirmation of which design
questions are load-bearing before the dispatch fires. In practice the operator enters a live
collaborative session and the collaborative nature provides implicit consent — but compared to the
analogues this is structural, not explicit.

**Risk.** The lens family can fire over the wrong framing of the design question, wasting a
fan-out. In a deep item with multiple possible framings, an unconfirmed frame going into the
dispatch is the same failure mode ce-brainstorm's synthesis checkpoint was built to prevent ("the
team prototypes fast, but they prototype the wrong thing" — SVPG).

**Recommendation.** Add an explicit scope confirmation step between Phase 1 (frame the design
question) and Phase 2 (dispatch). After Phase 1 resolves the load-bearing questions, surface them
to the operator and get explicit confirmation of the framing before Phase 2 fires. This is a
one-question gate, not a full AskUserQuestion protocol, but it brings the node's pattern in line
with the analogues. Least-invasive addition: a "Confirm framing" sub-step at the end of Phase 1
for `standard` and `deep` modes (lightweight is already one-pass by design).

### CF-2 (medium): No per-decision confidence or alternatives discipline — scope gap vs ADR/SVPG

**Finding.** ADR best practice (AWS 2025, martinfowler.com, adr.github.io) requires each design
decision to carry: the considered alternatives, the decision criteria / constraints, and a
confidence level. SVPG product discovery similarly requires "getting assumptions out on the table
and figuring out which ones are correct" — making assumption confidence explicit, not implicit.

The node's design doc records "resolved design decisions" (Phase 3) but the canonical form only
requires recording what was decided, not the alternatives considered or the confidence the resolver
has in the decision. When a decision turns out wrong at specify or plan, there is no confidence
signal to trace it to — the design doc reads as resolved when the resolver's actual confidence may
have been low.

**Risk.** Two failure modes: (a) a low-confidence design decision is committed to the harness
surface and propagates through specify/plan before the uncertainty is surfaced; (b) the spec
touchpoints table carries a "supersede" relationship but there is no record of why the prior spec
section was superseded, making specify's reconciliation harder.

**Recommendation.** The design doc format (currently under-specified in the node body — it says
"record the resolved design decisions" without specifying the per-decision shape) should carry
at minimum: the design question, the decision, the confidence level (`assumed` / `tested` /
`confirmed` — mirroring the evidence-state the experience-contract already uses for invariants),
and the primary alternative considered. This aligns with the experience-contract's own evidence
discipline and with ADR practice. Note: this is additive to the existing body and does not change
the node's structure — it deepens Phase 3's output contract.

### CF-3 (medium): No scope-detection pre-flight — weaker than counterpart

**Finding.** Gstack `plan-design-review` opens with a UI-scope detection step (PRE-REVIEW SYSTEM
AUDIT + UI Scope Detection): if the plan involves none of {new UI screens, changes to existing UI,
user-facing interactions, frontend changes, design system changes}, it exits early. CE `ce-brainstorm`
runs a domain classifier (Phase 0.1b) that routes non-software brainstorms to a different reference
and routes "clear requirements" (Phase 0.2) to a fast path. Both analogues classify the incoming
item before committing to the full workflow.

This node has a mode token (`lightweight` / `standard` / `deep` / `experience`) as the
equivalent, but it is **operator-supplied**, not inferred. The node does not read the carrier to
determine whether the mode token is appropriate for the item, or whether the item is in fact
design-requiring (vs. a trivial change, a pure refactor with no design questions, or an already-
resolved design). An operator invoking `standard` on a trivial change runs the full lens dispatch
unnecessarily.

**Risk.** Mode mismatch: a trivial change goes through standard/deep mode; a genuinely novel item
goes through lightweight. The analogues detect this and correct it; the node relies entirely on the
operator's mode choice.

**Recommendation.** Add a brief carrier-read pre-flight at the start of Phase 1 that infers the
appropriate mode from the carrier's `lifecycle_state`, complexity signals, and the aligned intent
summary, then surfaces the inferred mode to the operator for confirmation or override. This is
analogous to ce-brainstorm's scope assessment (Phase 0.3) and keeps the operator from having to
pre-classify before invoking. The mode token becomes a suggestion/override rather than the sole
source of truth.

### CF-4 (low): Resume / continuity not addressed — missing best practice

**Finding.** CE `ce-brainstorm` opens with an explicit resume check (Phase 0.1): if an existing
brainstorm document is found for the same topic, it confirms with the user before resuming vs
starting fresh. A resumed brainstorm continues from its existing decisions and updates the existing
document rather than creating a duplicate. Gstack `plan-design-review` similarly checks for prior
design review cycles in the git log and is more aggressive on areas previously flagged.

This node does not describe what happens when invoked on a carrier that already has a design doc
on the harness surface from a previous session. The contract says "write the design doc to a
harness surface via bindings" but does not specify whether this overwrites, amends, or versions
the prior doc.

**Risk.** On a second invocation of `design` for the same carrier (e.g., after a decision changes
at specify and the item is sent back), the prior design doc's reasoning is silently overwritten or
duplicated, losing the evolution history.

**Recommendation.** Add a sentence to Phase 1 or the "What you read" section: if the harness
surface already carries a design doc for this carrier, read it as context before framing the
design question; note what has changed since the prior pass and author the updated doc as an
amendment to the prior, not a full replacement.

### CF-5 (low): Unsupported claim — "resolves by intended outcome" needs a checking mechanism

**Finding.** The node states "resolve each design question by intended outcome — reason from what
the item is meant to achieve to the design decision." SVPG product discovery practice insists on
making this testable: "identify your assumptions, get them out on the table, and figure out quickly
which ones are correct." The `resolve by intended outcome` principle is correct but the node does
not specify how the resolver verifies that a design decision actually serves the intended outcome
vs. is rationalised as doing so.

CE `ce-brainstorm` operationalises this with explicit rigor probes: the specificity gap probe
("name a person you've actually watched hit this"), the evidence gap probe ("most concrete thing
someone has already done about this"), and the counterfactual gap probe ("what do teams do today
when this breaks"). These probes prevent outcome-reasoning from becoming retrospective
rationalisation.

**Risk.** The node can produce a design doc where all decisions are framed as "by intended outcome"
but none have been tested against the outcome — they are the designer's assumptions dressed as
decisions.

**Recommendation.** This is an operator-level concern more than a structural node change, but the
node body could add a Phase 1 step analogous to ce-brainstorm's rigor probes: before resolving
each load-bearing design question, briefly surface the assumption the resolution rests on and
whether it is `assumed` / `tested` / `confirmed` — connecting to the confidence discipline in CF-2.
The `deep` mode already implies multiple operator rounds with adversarial lenses; making the
assumption-surfacing step explicit in `standard` and `deep` modes would close this gap.

## Open questions

- **Sibling-endpoint ordering.** `can-follow align-context` and `precedes specify` reference the
  two sibling front nodes authored in the same pass. If design lands before its siblings, validate
  will flag the two endpoints until they exist — expected and transient within the pass.
- **`spec-touchpoints-table` extraction** is deferred (minor): touchpoints are inlined in the body
  for now; promoting the table to its own reference is a later, low-value refactor.
- **`experience` mode depth.** The `experience` branch authors/refines the contract to the schema;
  the exact AX metric set + budgets live in the harness's contract content (per
  `experience-contract-schema`, the harness fills the content), so design carries only the shape +
  the discipline to fill/refine it, not a fixed metric list.
- **CF-1 scope gate.** Whether to add an explicit scope-confirmation step at the end of Phase 1 is
  an operator decision — the node is well-governed and the collaborative mode provides implicit
  consent in practice. The challenge finding is offered for consideration; the translator should
  raise it with the operator before amending the node body.
- **CF-2 per-decision confidence.** The design doc format is currently under-specified. Adding a
  confidence + alternatives field per decision would align with ADR practice and the
  experience-contract's own evidence-state discipline, but is a scope change to Phase 3's output.
