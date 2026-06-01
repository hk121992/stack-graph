---
title: Research report for design
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 4
researcher_adequacy_note: |
  Sources lifted: docs/dev-sprint-front-design.md (the governed `## design` section + the
  locked `## Governed decisions` — this is the authoritative spec for the node and is followed
  to the letter), docs/graph-map.md (the lens-family shape, the lens-consumer invariant, and
  design's row in the backbone table), docs/experience-thread-design.md (the experience
  contract authored/refined at design; the UX+AX shape; the dev-sprint integration that puts
  contract-authoring here), docs/product-management-design.md (design is the shared PM+eng/design
  front; the product-lens composes in from the PM side; the carrier state model design reads but
  does not write). Edges were determined directly from the governed decisions, cross-checked
  against the two endpoints that already exist as nodes (review's lens-dispatch consumption,
  explore as the invoked context-gatherer) and the lenses' own `composes-into @design`
  declarations (verified in graph/lens-correctness/lens-correctness.md), which is why design
  must NOT direct-invoke the lenses — it follows the dispatch reference exactly as review does.
  Confidence in `skill` / `collaborative` / `generative` is high (governed + matches the
  front-stage family). Goals were straightforward to frame as outcomes — the governed spec
  already states all four as outcome + metric + earns-keep, so the report carries them through
  with light editing for the node's voice. Two structural calls are deferred-by-design (the
  product-lens seam stays prose with NO edge per F7; `precedes plan` is deferred per F7) and one
  carrier rule is load-bearing (design reads the carrier + contract, writes only to harness
  surfaces, carries NO carrier write-edge — the projected model). Recommendation to the
  translator: render the four modes as body branches (lightweight / standard / deep /
  experience), put the lens-dispatch consumption in the standard/deep branches with `target:
  doc` and strategy-first-then-parallel ordering, and reserve a dedicated `experience` branch for
  authoring/refining the contract to the schema. The change is faithful to the governed design;
  no scope was cut.
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

## Source inventory

| file | status | notes |
|------|--------|-------|
| `docs/dev-sprint-front-design.md` (`## design` + `## Governed decisions`) | keep | the authoritative governed spec for this node — modes, edges, goals, carrier rule, lens reuse, seams. Followed to the letter. |
| `docs/graph-map.md` (lens family + design row + lens-consumer invariant) | keep | fixes the lens-family shape (one dispatch reference + lens agents `target`-parameterised), the lens-consumer invariant (hold the finding contract + `lens-dispatch`, pass the contract into each spawn prompt), and design's `composes / invokes` summary. |
| `docs/experience-thread-design.md` | keep | the experience-contract is authored/refined at design; the UX+AX shape; the contract is harness-supplied (external); design is where it lands in the dev-sprint span. |
| `docs/product-management-design.md` | keep (seam) | design is the shared PM+eng/design front; the **product-lens** (a skill) composes into the front from the PM side, built separately — design leaves the seam in prose, no edge; design reads the carrier state model + VPC/personas/strategy/OKR via bindings, writes none of them. |

No `source-material/` directory: this node is authored directly from the four governed design docs
above (the front design is already-decided spec, not raw source to be distilled), exactly as the
sibling front-stage authoring is sourced from `dev-sprint-front-design.md`.

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
