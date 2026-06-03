---
title: Research report for align-context
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: Backfill external analogue search — CE ce-brainstorm + Anthropic best-practices lifted; challenge findings added; External analogues searched table authored; frontmatter fields set.
sources_lifted: 2
external_analogue_found: true
external_corpora_searched:
  - gstack live skills (office-hours, context-save, context-restore, investigate, retro, learn)
  - CE plugin skills (ce-brainstorm, ce-plan, ce-work, ce-work-beta, ce-strategy, ce-sessions)
  - be-civic plugin skills (bc-onboarding, bc-discovery, bc-path-traversal, bc-session-close)
  - Anthropic published best-practice (code.claude.com/docs/en/best-practices)
  - Anthropic research (building-effective-agents, trustworthy-agents, effective-context-engineering-for-ai-agents)
researcher_adequacy_note: |
  External search covered all mandated corpora: gstack live skills (office-hours, context-save,
  context-restore are session-level tools, not task intent-alignment tools — no analogue); CE plugin
  (ce-brainstorm is the strongest structural analogue — it operationalises the same job at product
  level: interrogate intent, surface rigor gaps, align scope before any downstream execution; ce-plan
  and ce-work were also inspected); be-civic (bc-onboarding is authentication/setup, not intent
  alignment — no analogue); Anthropic published docs (best-practices "Explore first/plan/code" and
  "Let Claude interview you" patterns are the canonical Anthropic-blessed form of what align-context
  operationalises; building-effective-agents and trustworthy-agents confirm the pattern). Two sources
  lifted verbatim. The challenge findings reveal six substantive gaps where the node is weaker than
  its analogues: missing a formal rigor-gap taxonomy, under-specified operator dialogue discipline,
  no peer-level scope challenge, absence of integration-check before closing, no clear exit condition
  for the alignment conversation, and weak description of the non-solicitation discipline (asking vs
  telling). Primitive/mode (skill, collaborative, generative) is high confidence and confirmed by
  the analogues. Goals are correctly framed as outcomes. Recommend: proceed to translator; the
  amendment target is the Phase 3 body (operator interaction discipline) — the gap is real and
  actionable.
---

# Research report for align-context

The durable curation record for the `align-context` node — the **first** stage of the
dev-sprint arc and the first of the three collaborative **front** stages
(align-context → design → specify). Authored to the governed design in
`docs/dev-sprint-front-design.md`; the map is `docs/graph-map.md`. Mirrors
`graph/review/review.md` (a collaborative front skill that owns orchestration + operator
interaction and fans out to an isolated worker) and `graph/explore/explore.md` (the isolated
context-gathering agent align-context invokes) for node shape and voice.

Backfilled 2026-06-03: external analogue search conducted; two sources lifted into
`graph/align-context/source-material/`; challenge findings and External analogues searched
sections added.

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

Confirmed by the analogues: both CE `ce-brainstorm` and Anthropic's "Let Claude interview you"
pattern are explicitly collaborative — they run in the main thread, hold state across turns,
and block until the operator agrees.

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

## External analogues searched

Record of the real-world search — what was searched, what was found, and what was lifted.

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills: `office-hours` | Pre-task intent framing, scope alignment before work begins | Partial — office-hours does YC-style demand validation (what is worth building), not task-level intent alignment before execution | — |
| gstack live skills: `context-save`, `context-restore` | Session-level intent preservation and handoff | No — these are session-continuity tools (save/restore working state), not intent-alignment | — |
| gstack live skills: `investigate`, `retro`, `learn`, `health`, `landing-report` | Pre-work scoping or intent-clarification phases | No — these are post-hoc or diagnostic, not pre-task alignment | — |
| CE plugin: `ce-brainstorm` | Collaborative pre-work intent clarification, scope assessment, rigor-gap probing, operator dialogue before downstream execution | **Yes — primary external analogue.** ce-brainstorm operationalises the same job at product level: assess scope tiers, probe for rigor gaps, run collaborative dialogue to align on *what* before any execution, produce a durable artifact | `ce-brainstorm-SKILL.md` |
| CE plugin: `ce-plan`, `ce-work` | Pre-execution planning phase, context read-once pattern | Partial — ce-plan's Phase 0 "Source and Scope" + ce-work's "Input Triage" Phase 0 have intent-routing logic; not a direct analogue but corroborate the scope-triage pattern | — |
| CE plugin: `ce-strategy`, `ce-sessions` | Strategic grounding before work, session-history context | No — ce-strategy maintains a product anchor doc; ce-sessions searches past sessions. Neither is a per-task alignment stage | — |
| be-civic: `bc-onboarding`, `bc-discovery`, `bc-path-traversal`, `bc-session-close` | Work-item intake, intent clarification, procedure matching | No — be-civic's intake is domain-specific procedure matching + auth setup, not a general task intent-alignment stage | — |
| Anthropic published best-practice: code.claude.com/docs/en/best-practices | "Explore first, then plan, then code" pattern; "Let Claude interview you" pattern; subagent investigation pattern | **Yes — canonical Anthropic-blessed form of the pattern.** Three sections directly operationalise what align-context does: the Explore→Plan phase separation, the AskUserQuestion interview pattern for pre-task spec-writing, and the subagent-for-investigation pattern | `anthropic-claude-code-best-practices-explore-plan-code.md` |
| Anthropic research: building-effective-agents, trustworthy-agents | Pre-task scope alignment, ambiguity handling, clarification-before-action doctrine | Yes — confirms the "clarify before proceeding" doctrine; describes the plan-mode oversight pattern; distinguishes resolvable gaps from preference/intent gaps that only the user can settle. Not lifted verbatim (online doc, summarised) | — |
| Anthropic research: effective-context-engineering-for-ai-agents | Context-gathering once vs re-gathering; just-in-time retrieval | Partial — addresses "just in time" context retrieval and token efficiency; does not address intent alignment; corroborates the "gather once" discipline but from a different angle | — |
| Agile methodology: Scrum Definition of Ready (scrum.org) | Pre-sprint intent alignment gate; criteria for work-item readiness | Searched but web pages returned empty content. DoR is the relevant agile analogue (see Challenge findings) — it gates work into a sprint on verified intent, acceptance criteria, and scope clarity. Not lifted (page fetch failed) | — |

**Primary external analogue:** CE `ce-brainstorm` (`source-material/ce-brainstorm-SKILL.md`) is
the strongest real-world counterpart. It is a live, deployed skill in the CE plugin that does
exactly the same job as align-context but at product/feature level rather than per-task/work-item
level: it runs collaborative dialogue with the operator before any execution begins, assesses
scope (lightweight/standard/deep tiers — directly mirrors align-context's four modes), probes
for rigor gaps, settles intent, and hands a durable artifact forward. The structural seams
(scope-tier branching, operator interrogation, rigor-probe list, integration check before
closing) are the concrete patterns align-context should match or consciously diverge from.

**Secondary external analogue:** Anthropic's own best-practices page (lifted as
`source-material/anthropic-claude-code-best-practices-explore-plan-code.md`) describes the
canonical "Explore → Plan → Code" separation and the "Let Claude interview you" pattern, which
is the published, first-party design principle behind what align-context operationalises. This
gives the node a first-party grounding from Anthropic and corroborates the design decisions.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `docs/dev-sprint-front-design.md` (the `## align-context` section + the `## Governed decisions`) | keep (primary design input) | The governing design: goals, the four modes, the edge set, the carrier projected-model, the per-task-only scope. This is design input, not an external analogue. |
| `docs/graph-map.md` (backbone row for `align-context`; the arc diagram; explore consumers) | keep (design input) | The map: align-context is backbone stage 1. Design input, not external analogue. |
| `graph/explore/explore.md` | keep (shape/voice mirror) | The agent align-context invokes; its spawn-bundle contract. Internal sibling, not external analogue. |
| `graph/review/review.md` | keep (shape/voice mirror) | Closest structural sibling in the factory graph. Internal sibling. |
| `source-material/ce-brainstorm-SKILL.md` | **keep (primary external analogue)** | CE plugin's pre-work intent-clarification skill. Lifted verbatim 2026-06-03. Key sections: scope-tier assessment (§0.3), rigor-gap taxonomy (§1.2), collaborative dialogue discipline (§1.3 Interaction Rules), integration-check before exit (§1.3 "Before exiting Phase 1.3"). |
| `source-material/anthropic-claude-code-best-practices-explore-plan-code.md` | **keep (secondary external analogue)** | Anthropic best-practices "Explore → Plan → Code" + "Let Claude interview you" patterns. Lifted verbatim 2026-06-03. Canonical Anthropic-blessed form of the pre-execution intent phase. |

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
explore fan-out is, how many operator rounds the alignment takes, and whether the handbook /
touchpoint work runs.
By D34 that makes them **branches in one skill body, not separate nodes**; there is no
node-count divergence between the authoring view and the rendered `.claude` skill. A mode would
graduate to its own 1:1 primitive only if it earned a *distinct measurable goal* — none does
today (all four serve the same three outcomes), so they stay branches. This mirrors `review`
(one skill, four interaction-policy modes) and `explore` (one agent, five source modes).

The analogue comparison confirms fit: ce-brainstorm uses identical tier branching
(lightweight / standard / deep) inside one skill rather than three separate skills — the same
structure. The Anthropic best-practices pattern uses a mode-sensitive callout ("if you could
describe the diff in one sentence, skip the plan") rather than a separate primitive.

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

## Challenge findings

These findings are derived by comparing align-context against its primary external analogues
(CE `ce-brainstorm` SKILL.md and Anthropic's published best-practices "Explore first / Let Claude
interview you" patterns) and against the Agile "Definition of Ready" principle. They identify
where the node is weaker than real-world practice and what the node body may be missing.

### CF1 — No formal rigor-gap taxonomy (severity: high)

**Counterpart:** `ce-brainstorm` §1.2 ("Product Pressure Test") names four explicit rigor-gap
lenses per scope tier: evidence gap, specificity gap, counterfactual gap, attachment gap (and
durability gap at product tier). Each gap maps to a specific probe question and a specific
failure mode that downstream stages will encounter if the gap is not closed.

**align-context's gap:** Phase 3 ("Interrogate the intent to alignment") names four general
activities ("surface assumptions", "ask disambiguating questions", "reconcile with personas",
"settle scope") but does NOT name the category of gaps to look for or the specific probe that
closes each one. The node tells Claude *that* it should interrogate, not *what classes of
ambiguity* to probe for. This means the alignment conversation will find what happens to be
obvious, rather than systematically closing the gaps that actually cause rework downstream.

**Recommendation:** Phase 3 of the node body should add a rigor-gap taxonomy — at minimum:
intent gap (is the stated intent actually what the operator wants?), scope-boundary gap (what is
explicitly out?), constraint gap (what binds this item technically, product-wise, or in time?),
and user-alignment gap (does this item serve a real persona?). Map these to the mode tiers.

### CF2 — Under-specified operator dialogue discipline (severity: high)

**Counterpart:** `ce-brainstorm` §1.3 Interaction Rules prescribes: one question per turn, prefer
the platform's blocking question tool, open-ended questions only when genuinely open (and only
when specific enough to elicit a substantive answer), do not narrate the form choice, no
yes/no traps, no warmth wrappers. The Anthropic best-practices "interview" pattern specifies
using `AskUserQuestion`, keeping interviewing until everything is covered, and then writing a
spec. Both specify *how* the dialogue runs, not just that it should happen.

**align-context's gap:** Phase 3 specifies *what* the alignment conversation must cover but
gives almost no guidance on *how* the dialogue should be conducted. There is no equivalent of
"one question per turn", no guidance on using `AskUserQuestion`, no guidance on what makes a
question too vague to be useful, and no discipline preventing Claude from firing a battery of
questions in one turn (which dilutes the answers and signals to the operator that the stage is
not holding them accountable).

**Recommendation:** Add an interaction discipline section to Phase 3 or as a preamble to the
phase. At minimum: one question per turn; use the platform's blocking question tool; prefer
specific, answerable questions over open-ended sweeps; do not stack sub-questions.

### CF3 — No peer-level scope challenge (severity: medium)

**Counterpart:** `ce-brainstorm` explicitly instructs Claude to "be a thinking partner — suggest
alternatives, challenge assumptions, and explore what-ifs instead of only extracting
requirements." The Anthropic "interview" pattern specifies: "Don't ask obvious questions, dig
into the hard parts I might not have considered." `office-hours` takes the strongest stance:
anti-sycophancy rules, explicit pushback posture ("state your position AND what evidence would
change it").

**align-context's gap:** Phase 3 instructs Claude to "surface assumptions" and "ask
disambiguating questions", but the body does not ask Claude to *challenge* the stated intent or
push back on it. Alignment can pass by rubber-stamping the operator's first statement if the
operator sounds confident. There is no instruction to name a mismatch ("this item as stated
does not serve the stated persona"), take a position, or propose an alternative framing.

**Recommendation:** Add to Phase 3 a brief "peer posture" instruction: if the stated intent has
a detectable gap (misaligned to persona, scope that is broader than the mode warrants, an
assumption that, if wrong, would send design off-track), name it and give the operator the
opportunity to correct it or explicitly accept the gap. Align-context should be a peer reviewer,
not a passive recorder.

### CF4 — No integration check before closing (severity: medium)

**Counterpart:** `ce-brainstorm` §1.3 specifies a mandatory "integration check" before exiting
Phase 1: "Mentally combine what the user has said so far and surface any non-obvious consequences
the dialogue hasn't probed. If user-stated X plus user-stated Y plus your-default-Z produces a
downstream effect the user is unlikely to have tracked through one-question-at-a-time dialogue,
probe it now."

**align-context's gap:** Phase 3 continues until "the operator agrees the intent statement is
correct and the constraints are settled" but there is no integration-check step before closing.
A complete alignment conversation might still miss the interaction between two constraints (e.g.
"this item must ship by Friday" AND "this item touches auth" — neither is problematic alone, but
together they may make the scope negotiation urgent) if each is addressed separately and no
synthesis step is performed.

**Recommendation:** Add an integration check before Phase 4 (Settle and hand forward): before
closing, combine the settled intent + constraints and identify any non-obvious interactions
between them that the operator has not been alerted to. If one is found, surface it as a final
probe.

### CF5 — Unclear exit condition for the alignment conversation (severity: medium)

**Counterpart:** `ce-brainstorm` specifies: "**Exit condition:** Continue until the idea is clear
AND no integration-check questions are pending, OR the user explicitly wants to proceed." The
Anthropic interview pattern says: "Keep interviewing until we've covered everything." Both give
Claude a concrete exit condition that prevents premature closing.

**align-context's gap:** Phase 3 says "Continue until the operator agrees the intent statement is
correct and the constraints are settled." This is operator-gated but not agent-enforced — it
depends on the operator saying "yes" rather than requiring Claude to verify that the gaps it
identified are actually closed. On a lightweight item with a confident operator, Claude may
accept a one-word acknowledgment as "agreement" and close before the gaps are genuinely settled.

**Recommendation:** Specify a two-part exit condition: (a) all rigor gaps identified in the
opening are closed (operator has explicitly addressed them or Claude has verified they don't
apply), AND (b) the operator explicitly agrees the intent is correct. Only when both conditions
hold does the alignment close. On lightweight items, condition (a) may have zero gaps — that is
fine and fast; the point is that the check is explicit, not implicit.

### CF6 — No explicit non-solicitation discipline (severity: low)

**Counterpart:** Anthropic's "Let Claude interview you" pattern specifies that after the spec is
complete, Claude should "start a fresh session to execute it" — the spec phase and the execution
phase are separated to prevent context bleed and premature action. `ce-brainstorm` enforces this
by being a standalone skill that explicitly does not implement code ("This skill does not
implement code. It explores, clarifies, and documents decisions for later planning or
execution.").

**align-context's gap:** The node body states that align-context "does not perform the context
search yourself" and "does not resolve the design questions or author a design doc", but it does
not include a matching hard statement that *prohibits Claude from starting to propose design
solutions during the alignment conversation*. On a novel item, an eager Claude running this
stage might surface candidate implementation approaches while "surfacing assumptions" — which
both confirms assumptions AND predisposes the design toward a direction before the intent is
settled.

**Recommendation:** Add a brief hard boundary: during the alignment conversation, do not propose
design approaches or implementation directions. The alignment closes when the intent is settled;
design candidates arrive in the `design` stage. Surface assumptions as questions, not as
embedded proposals.

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
- **Challenge finding remediation.** CF1–CF6 above are findings for the node body (align-context.md),
  not this report. None of them require changing the edges, primitive, mode, or goals. They
  are Phase 3 body improvements. An `amend` pass on the node canonical is the appropriate
  follow-on; this report's job is to name them.
- **Agile DoR as a parallel.** The Scrum "Definition of Ready" is a meaningful external parallel —
  it gates work items from entering execution on verified intent + acceptance criteria + scope
  clarity + estimability, and is designed to prevent the same failure mode align-context targets
  (rework from mis-stated intent). The scrum.org page fetch failed during this research session;
  a follow-on search could lift the DoR criteria as a third source to deepen CF1 (rigor-gap
  taxonomy). Low priority — the CE and Anthropic analogues already make the gaps concrete.
