---
title: Research report for align-context
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 0
researcher_adequacy_note: |
  No source-material was lifted: align-context is authored directly from the governed design
  spec (docs/dev-sprint-front-design.md — the "## align-context" section + the "## Governed
  decisions" that apply to all three front stages) and the map (docs/graph-map.md), mirroring
  the shape and voice of two already-built nodes (graph/explore/explore.md, the agent it
  invokes; graph/review/review.md, a collaborative front skill that orchestrates a fan-out).
  The primitive/mode/determinism decision (skill · collaborative · generative) is high-confidence
  and pre-settled by the design ("All three: primitive: skill, mode: collaborative, determinism:
  generative"). Edges were determined directly from the design's "**Edges:**" line for the stage
  and are conservative: composes-into dev-sprint @align-context; invokes explore; references
  handbook (external, on-demand); precedes design (the one process edge with an existing endpoint,
  authored now). can-follow debrief is DEFERRED (F7 — debrief absent) and described in prose. The
  carrier touch is the governed "projected model": align-context READS the carrier and EMITS
  node-enter/-exit events, carries NO write-edge, and does NOT advance current_stage. The
  carrier / personas / value-prop reads are via BINDINGS (D49 — a convention, a reference read
  on demand), NOT edges — so they do not appear in the edge block. Goals were framed directly
  from the design's three goals as outcomes without difficulty. Recommendation: proceed to
  synthesis; the one item flagged for the translator is the deferred can-follow debrief edge
  (prose, not frontmatter) and the no-edge binding reads (prose, not frontmatter).
---

# Research report for align-context

The durable curation record for the `align-context` node — the **first** stage of the
dev-sprint arc and the first of the three collaborative **front** stages
(align-context → design → specify). Authored to the governed design in
`docs/dev-sprint-front-design.md`; the map is `docs/graph-map.md`. Mirrors
`graph/review/review.md` (a collaborative front skill that owns orchestration + operator
interaction and fans out to an isolated worker) and `graph/explore/explore.md` (the isolated
context-gathering agent align-context invokes) for node shape and voice.

## Identity

**Candidate id:** align-context
**Candidate title:** Align context

**Scope:** The collaborative **front** skill that establishes a **shared, correct intent and
the constraints** for a single roadmap item *before* design begins, and gathers the item's
context **once** so the rest of the front does not re-explore. It is the **first stage of the
dev-sprint** and the first of the three front stages it precedes (`design`, then `specify`).
The operator (or an agent on their behalf) invokes it with a roadmap item in hand and,
optionally, a mode token; align-context reads the item's carrier for context, fans `explore`
out to gather the repo / learnings / (and, in deeper modes) framework-docs / web /
best-practices context the front will need, interrogates the intent with the operator until it
is shared and correct, and hands a settled intent + constraints + a reused context digest
forward to `design`. It is the **per-task** context stage: it aligns the team on *this item*,
not the session — session-level orientation is harness instructions, not a node (governed
decision).

**Excludes:**
- **The context-gathering itself** — that is `explore` (an isolated read-only agent it
  invokes, not absorbs); align-context owns the *intent* conversation and the decision to reuse
  rather than re-gather, not the search methodology.
- **Resolving design questions / authoring a design doc** — that is the next stage, `design`
  (which it `precedes`); align-context settles *what and why*, design settles *how*.
- **Authoring the spec amendment** — that is `specify` (two stages downstream).
- **Advancing the carrier / passing a gate.** Entry into the in-delivery window is a PM gate;
  align-context operates *inside* that window. It **reads** the carrier and **emits** the
  built-in node-enter/-exit events; it carries **no write-edge** to the carrier and does **not**
  advance `current_stage` or record a `gate_decision`. Completing the stage is the signal the
  projection / curator picks up — the carrier touch is the governed **projected model** (see
  *Overlaps and seams*).
- **Session-level orientation** — per the governed decision, align-context is *per-task* context
  only; orienting a whole working session is harness instruction, not this node.

## Goals

What this node should achieve (as outcomes, not activities — lifted from the design's three
goals):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Intent and constraints are shared and correct before design begins — the front builds on a true statement of what the item is, not a mis-stated one. | design/specify rework traced to mis-stated intent; share of intent statements that survive to `specify` unamended. | "intent was wrong" rework falls below the pre-front baseline; the rate trends down over N sprints, or the stage is cut/restructured. |
| Context is gathered once and reused — the front does not re-explore the same ground stage after stage. | re-exploration rate across the front (design / specify re-deriving context align-context already gathered). | re-exploration across the front trends toward zero; a digest routinely re-gathered downstream is a signal the hand-off is failing. |
| The alignment is a real gate, not a rubber stamp — scope is settled here, not discovered late. | scope-change events after align-context closes (late scope surprises surfaced at design / specify / build that align-context should have caught). | late scope surprises trend down; an align-context that never reduces them is not earning its place. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** This is the context axis (D24 / 01-concepts "Skill or agent"). align-context sits
firmly on the **collaborative / skill** side: its core work is **interrogating intent with the
operator** — surfacing assumptions, asking the disambiguating questions, getting agreement that
the stated intent is correct — which needs the **live main thread** and operator sign-off, and
can take multiple rounds on a novel item. It loads into the current context, holds shared state
across the alignment conversation, and pauses for operator judgment at every intent decision.
This is the front-loaded collaboration the concepts page describes ("the collaboration is
front-loaded — aligning intent and design — and returns to close"). It is never the isolated,
returns-a-summary shape, so `agent` is ruled out. The design pre-settles this for all three
front stages: `primitive: skill`, `mode: collaborative`. High confidence, no ambiguity.

**`determinism:`** `generative`

**Rationale:** align-context exercises judgment throughout — what the real intent is beneath the
stated request, which constraints bind, what is ambiguous enough to surface, when the alignment
is solid enough to close, which mode the item warrants. None of that is a fixed input→output
mapping; it is reasoning over the item, the carrier, and the operator's answers. Pre-settled by
the design (`determinism: generative` for all three front stages). High confidence.

## Contract

**Input (the operator's invocation + what align-context reads):**
- A **roadmap item** (the carrier) in hand, optionally a **mode token**
  (`lightweight` / `standard` / `deep` / `spec`), and an **intent / request statement**.
- The **carrier** read for context — its `lifecycle_state` (to confirm the item is in the
  in-delivery window align-context operates inside) and prior `transition_history` (what has
  already happened to this item). Read-only; via the carrier's overlay binding.
- The **personas** and the **value-proposition** (the strategic substrate) read for context —
  who this is for and the value it is meant to deliver, so the intent is aligned to real users
  and value, not invented. Read-only; via their bindings (PM-owned surfaces — D43). **No edge:**
  these are harness-surfaced bindings (a convention, read on demand — D49), not factory
  references.
- The **handbook** (the curated canon — spec + decisions) read **on-demand** in the `spec` mode
  for settled intent and rationale, through the shared `handbook` external reference.
- Context **digests from `explore`**, fanned out to gather just what the front needs.

**Output (what align-context produces / surfaces / hands forward):**
- A **settled intent + constraints statement** for the item — shared with and signed off by the
  operator — that `design` builds on. This is the deliverable; it is written to a harness
  surface (the item's working notes / carrier context), **not** to the carrier state itself.
- A **reused context digest** — the explore findings, distilled — handed to `design` so the
  front does not re-explore.
- In the `spec` mode, a **starting touchpoint set** captured for `specify` (which sections of
  the spec the item is likely to touch).
- The built-in **node-enter / node-exit events** (the instrumentation preamble) — the only thing
  align-context "writes," and it is emitted, not a carrier mutation. Completing the stage is the
  observable signal the carrier projection / curator picks up to advance `current_stage`.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `docs/dev-sprint-front-design.md` (the `## align-context` section + the `## Governed decisions`) | keep (primary) | The governing design: goals, the four modes, the edge set, the carrier projected-model, the per-task-only scope. Authored directly to this — not lifted into source-material. |
| `docs/graph-map.md` (backbone row for `align-context`; the arc diagram; explore consumers) | keep | The map: align-context is backbone stage 1 (skill · C · "shared, correct intent + constraints before design"; invokes explore; modes lightweight/standard/deep/spec), `debrief → align-context` is the seed-next loop, and explore lists align-context among its consumers. |
| `graph/explore/explore.md` | keep (shape/voice mirror) | The agent align-context invokes; its spawn-bundle contract (scope/mode selector + target + scope-rules/planning-context summary) is the seam align-context fills. Mirrored for voice. |
| `graph/review/review.md` | keep (shape/voice mirror) | A collaborative front skill that owns orchestration + operator interaction and fans out to an isolated worker, deferring a process edge to a not-yet-built neighbour in prose (the build loop). The closest structural sibling. |

No `source-material/` directory: this node is authored from the settled in-repo design, not
from lifted external prior art.

## Keep / Drop

**Kept (absorbed into body):**
- The **three goals** as outcomes (shared/correct intent; context-once-reused; a real gate),
  each with its metric + earns-keep.
- The **four modes** as body branches (D34): `lightweight` (known small item; thin explore,
  one-turn intent confirm), `standard` (the default: read carrier + personas + value-prop;
  explore repo + learnings; interrogate intent), `deep` (novel/ambiguous: + explore
  framework-docs / web / best-practices; multiple operator rounds; surface assumptions), `spec`
  (spec-layout product: + read the relevant handbook sections + decisions for settled intent,
  capture a starting touchpoint set for `specify`).
- The **carrier projected-model** statement (governed): reads the carrier for context, emits
  node-enter/-exit events, no write-edge, does not advance `current_stage`; completing the stage
  is the signal the projection picks up.
- The **invoke-explore-don't-absorb** seam: align-context fans explore out (filling its spawn
  bundle — scope/mode selector + target + planning-context summary) and consumes the digest;
  it owns the intent conversation, not the search.
- The **gather-once / reuse** discipline that the whole front depends on (the front does not
  re-explore; align-context's digest is handed forward).
- The **per-task-only** scope boundary (session orientation is harness instruction, not a node).

**Dropped (out of scope):**
- The **design-question resolution and design-doc authoring** — `design`'s job (the stage
  align-context precedes).
- The **spec amendment / touchpoints authoring** — `specify`'s job; align-context only captures
  a *starting* touchpoint set in `spec` mode, it does not author the amendment.
- **Carrier mutation / gate decisions** — PM/operator decisions on the carrier surface, never a
  stage's job (the projected model).
- **Session-level orientation** — harness instruction (governed decision).

**Edge only (separate node / not absorbed):**
- **`explore`** — the context-gathering is its own node, reached by an `invokes` edge, not
  absorbed into align-context's body.
- **The handbook (curated canon)** — reached via the shared `handbook` external reference
  (`load: on-demand`), not absorbed.

**Binding, not an edge (read on demand, no edge):**
- The **carrier**, **personas**, and **value-proposition** are read through **harness-surfaced
  bindings** (a convention — a reference the node reads on demand; there is no runtime resolver,
  D49). Per the design, align-context "reads the carrier + personas + value-prop via bindings
  (no edge — harness surfaces)." Do **not** model these as `references` edges in the frontmatter;
  describe the binding reads in prose.

## Overlaps and seams

- **align-context → `explore` (invokes).** align-context fans `explore` out to gather just the
  context the front needs, filling explore's spawn bundle — the scope/mode selector (which of
  `repo` / `learnings` / `framework-docs` / `web` / `best-practices`), the target/question (the
  item under alignment), and a scope-rules / planning-context summary so the digest stays
  focused. explore returns a distilled digest; align-context consumes it and decides what to
  reuse. The `invokes` edge lives on **align-context** (the consumer), and explore already lists
  align-context among its consumers in the map — this closes one of the deferred-on-explore
  seams (explore declared no `invokes`/`composes-into` of its own; the edge is authored here, on
  the consuming stage). **This is the edge align-context owns into explore.**

- **align-context → `design` (precedes).** align-context settles intent + constraints and hands
  forward the reused context digest; `design` resolves the load-bearing design questions on that
  basis. Both endpoints exist (design is authored in the same front batch), so the `precedes`
  edge is **authored now** per the design ("author `align-context precedes design` ... now
  (endpoints exist)"). design carries the reciprocal `can-follow align-context`.

- **`debrief` → align-context (can-follow — DEFERRED, F7).** The dev-sprint closes by looping
  `debrief --can-follow→ align-context` (the seed-next-sprint loop, per the arc diagram and
  01-concepts cyclic semantics). `debrief` does not yet exist, so this **process edge is
  deferred** (F7) — **omit** it from the frontmatter and describe the behaviour in prose
  (align-context is re-entered when a debrief seeds the next sprint). Wire it in with `amend`
  once `debrief` is authored. (This mirrors review.md deferring its build/reconcile loop edges
  in prose.)

- **align-context ↔ the carrier (projected model — state mechanism, NOT an edge).** This is the
  governed carrier touch shared by all three front stages. align-context **reads** the carrier
  (its `lifecycle_state` and prior `transition_history`) for context and **emits** the built-in
  node-enter / node-exit events; it carries **no write-edge** to the carrier and does **not**
  advance `current_stage`. `current_stage` + `transition_history` are **projected from the
  observed traversal** by the carrier curator (a state mechanism — D44, never a `composes-into`
  edge), not written by a stage. Entering the in-delivery window is a PM **gate**; align-context
  operates inside that window and advances nothing. Completing the stage is simply the signal the
  projection / curator picks up. **No carrier edge in the frontmatter** — the carrier is not a
  node (02-graph-spec "The carrier"); the touch is a runtime read + emit, described in prose.

- **align-context ↔ the strategic substrate (personas, value-prop — bindings, NOT edges).** The
  personas and the value-proposition are PM-owned surfaces (D43) the operator maintains; the
  `standard`+ modes read them for context through their **harness bindings** so the intent is
  aligned to real users and value. These are convention bindings (read on demand, no resolver —
  D49), **not** `references` edges. Prose, not frontmatter.

- **align-context ↔ the handbook (curated canon — references edge).** The `spec` mode reads the
  product's spec sections + decisions for settled intent, through the shared `handbook`
  **external** reference (`load: on-demand`), overlay-resolved to the product's canon root + page
  index (D41). This *is* a `references` edge (the same one explore / strategy-curator / the
  curator family carry), distinct from the binding reads above.

## Fit

**Single node, four body branches — confirmed.** Apply the 07-decomposition discriminator and
D34: align-context owns its own branching (mode selection) and sequencing (read carrier →
fan explore → interrogate intent → settle + hand forward), so it is a node. The four modes
share one contract (establish shared/correct intent + constraints; gather context once; close a
real alignment) and the same earns-keep, differing only in **depth** — how thin or deep the
explore fan-out is, how many operator rounds, and whether the handbook/touchpoints work runs.
By D34 that makes them **branches in one skill body, not separate nodes**; there is no
node-count divergence between the authoring view and the rendered `.claude` skill. A mode would
graduate to its own 1:1 primitive only if it earned a *distinct measurable goal* — none does
today (all four serve the same three outcomes), so they stay branches. This mirrors `review`
(one skill, four interaction-policy modes) and `explore` (one agent, five source modes).

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| `invokes` | `explore` | align-context fans explore out to gather the front's context (repo / learnings, and in deeper modes framework-docs / web / best-practices). The consumer holds the `invokes` edge; explore returns a digest. Resolves to `graph/explore/explore.md` (exists). |
| `composes-into` | `dev-sprint` (`stage: align-context`) | align-context is the **first** backbone stage of the dev-sprint arc. `composes-into` targets the arc (a traversal derived from edges, not a node file) — validate skips arc resolution. |
| `references` | `handbook` (`load: on-demand`, `external: true`) | The curated-canon locator (spec + decisions), read on-demand in the `spec` mode for settled intent. `external: true` — harness-supplied, overlay-resolved (D41); the factory ships only the pointer, so validate/build skip it. |
| `precedes` | `design` | The next front stage. align-context hands settled intent + the reused context digest forward to design. Both endpoints exist (design authored in the same batch), so this process edge is authored now. Resolves to `graph/design/design.md` (authored in parallel; declared per the design). |

**Edges align-context does NOT declare (and why):**
- **`can-follow` ← `debrief`:** the seed-next-sprint loop. **DEFERRED (F7)** — `debrief` does not
  exist yet. Authoring a process edge to a non-existent node is a hard validate failure, not a
  forward reference. Omit; describe in prose; wire in via `amend` once `debrief` exists.
- **No `precedes`/`can-follow` to anything other than `design`:** align-context is the arc's
  first stage (nothing legitimately precedes it except the deferred debrief loop).
- **The carrier:** **NOT an edge.** The carrier is a runtime state model, not a node
  (02-graph-spec); align-context reads it + emits events (the projected model), it does not
  compose into it or write it. State mechanism, not a `composes-into` edge (D44).
- **personas / value-proposition:** **NOT edges.** Read via harness **bindings** (a convention,
  on-demand, no resolver — D49), not `references` edges.
- **`loads`:** none. align-context loads no other node into its context; it *invokes* explore
  (isolated) and *references* the handbook.

**A note on `precedes design` and authoring order.** The design instructs authoring
`align-context precedes design` now because both endpoints exist after the parallel front batch.
If `design` is validated *before* it is authored, the `precedes` target will not resolve and
validate will (correctly) fail. The orchestrator batch-validates all front nodes **together at
the end**, after `design` exists — so the edge resolves at that point. (If this node is ever
validated standalone before `design` lands, expect that one unresolved-target failure; it clears
once design is authored.)

## Conformance

**`primitive:`↔`mode:` agreement:** `primitive: skill` ↔ `mode: collaborative` — agree
(skill→collaborative, per the schema table). Confirmed; pre-settled by the design.

**`determinism:` valid:** `generative` — a valid value, and correct for a judgment-driven
intent-alignment skill. Confirmed.

**`goals:` as outcomes:** all three read as outcomes (shared/correct intent; context-once-reused;
a real gate), each with a metric and an earns-keep threshold — none read as activities.
Confirmed.

**Edge targets resolvable:**
- `invokes: explore` → `graph/explore/explore.md` — **resolves** (exists).
- `composes-into: dev-sprint` — an **arc**, skipped by validate (not a node file).
- `references: handbook` (`external: true`) — **skipped** by validate (harness-supplied; no
  factory file).
- `precedes: design` → `graph/design/design.md` — resolves **once design is authored** (same
  front batch); declared now per the design, validated in the end-of-batch sweep.
- `can-follow: debrief` — **not declared** (deferred, F7); prose only.

## Open questions

- **`precedes design` resolution timing.** Authored now per the design (endpoints exist after the
  parallel batch). Flag for the orchestrator: validate align-context **with** design in the
  end-of-batch sweep, not standalone before design lands, or the `precedes` target will not
  resolve. (Not a design defect — an authoring-order note.)
- **Binding read mechanics.** The carrier / personas / value-prop reads are convention bindings
  (D49 — no runtime resolver in v1). The body says "read your carrier / personas / value-prop
  binding"; the overlay supplies what each points at. Confirm at validate that these are **not**
  expected as `references` edges (they are prose binding reads, by governed design).
- **Touchpoints inlined.** The `spec` mode captures a starting touchpoint set inline (extracting a
  `spec-touchpoints-table` reference is deferred per the governed decision — minor). The body
  describes the touchpoint capture in prose; no reference edge for it yet.
