---
title: Research report for specify-slice
type: research-report
status: complete
authored: 2026-06-04
last_updated: 2026-06-04
sources_lifted: 0
external_analogue_found: true
external_corpora_searched:
  - operator .claude skill set (plan-eng-review, plan-ceo-review, office-hours)
  - Pocock skill corpus (sg-language-reviewer/source-material — caveman, write-a-skill, ica-LANGUAGE)
  - be-civic consuming harness (~/projects/be-civic)
  - in-repo dev-sprint front (align-context / design / specify / plan) — design input, not an analogue
researcher_adequacy_note: |
  The external search found a strong, honest counterpart: the operator's `plan-eng-review`
  skill is the real-world analogue of the collapsed front. Its "Step 0: Scope Challenge"
  ("minimum set of changes," ruthless about scope creep, a hard complexity-check STOP gate at
  8+ files / 2+ new services) is exactly the promote/escalate signal this node owns, and its
  dedicated Tests review section is the testing invariant restated. No verbatim source was
  lifted because the analogue is a *process shape* (a gate + a scope challenge), not reusable
  body text — lifting it would import gstack-specific preamble machinery that violates the
  factory's keep-it-general rule. Pocock's `caveman` Auto-Clarity Exception is the verbatim
  doctrinal root for the AFK/HITL + safety-exception discipline (recorded in the language
  standard already). be-civic has no specify-slice analogue — its matches were roadmap/spec
  docs, not a slice-spec skill — a searched-and-absent finding. Edges are high-confidence:
  they are dictated by the design doc §8 step 4 build spec and the just-authored contracts
  (IU-schema, carrier-interface). primitive: skill / mode: collaborative is unambiguous (the
  node engages the operator to write and gate the slice spec). Goals were straightforward to
  frame as outcomes against the design's stated rejection criteria. Recommendation: proceed to
  translator.
---

# Research report for specify-slice

## Identity

**Candidate id:** specify-slice
**Candidate title:** Specify slice
**Scope:** The single collapsed front stage of the `incremental` improvement loop. It takes a
`proposed` standalone IU from `triage` and turns it into a build-ready, well-specified vertical
slice — writing the standalone-IU content fields (`goal`, `files`, `acceptance`,
`acceptance_check`, `slice_type`, `verification`) and enforcing the vertical-slice + testing +
single-slice invariants *before* build. It replaces the dev-sprint's four-stage front
(`align-context → design → specify → plan`) for a single, understood slice. It **excludes**: any
design-fork resolution or decomposition (those are the `escalate`/promote signal, not this node's
job); the full lens panel (the rigor moves to `review`); and any carrier-lifecycle/gate write (the
gate is `land`'s, the lifecycle writers are split per the IU-schema three-writers rule).

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| A standalone IU enters build as a well-specified vertical slice, so build never invents the slice boundary or the test contract. | Share of slices entering build with all standalone-IU content fields populated (incl. `acceptance_check` + `verification`); build-stage "what is this slice / where are the tests?" re-asks per loop. | Build-stage re-asks trend toward zero; a routine re-ask is a specify-slice quality gap. |
| Horizontal slices are rejected here, not downstream — a slice that only asserts one layer's shape (a schema exists, a signature is present) never reaches build. | Share of slices rejected/reshaped at specify-slice for failing the vertical-slice test; horizontal slices caught later at review/validate that should have been caught here. | Horizontal-slice escapes to review trend toward zero over N loops; if specify-slice never catches one, the gate is not earning its cost. |
| A slice that turns out to need a design fork or to decompose is escalated to the dev-sprint front, never quietly built as a standalone IU. | Escalation events traced to a fork/decomposition surfaced at specify-slice; standalone IUs later found to have smuggled a multi-slice change through. | Mis-routed multi-slice/fork work caught at specify-slice rather than mid-build; the light loop never silently grows into a sprint. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** This node engages the operator to author the slice spec and to make the
vertical-slice / AFK-vs-HITL / escalate-vs-build calls — it is interactive judgment work over a
shared artefact, exactly the collaborative `skill` shape (per `07-decomposition`'s context axis:
collaborative → skill, current context). It owns control flow (write fields → enforce invariants →
optional single lens → escalate-or-precede-build), so it is a node, not a reference. It mirrors the
front nodes it collapses (`align-context`, `design`, `specify`, `plan` are all `skill` /
`collaborative`). No ambiguity.

**`determinism:`** `generative`

**Rationale:** The work is judgment — is this a complete vertical path? does the acceptance carry
an observable test? is this AFK or HITL? is there a hidden design fork? — not a fixed
input→output transform. Generative, like every front stage.

## Contract

**Input:** A `proposed` standalone IU instance file scaffolded by `triage` (frontmatter stub at
`improvements-root`, with `improves`, `channel: incremental`, `lifecycle_state: proposed`), plus
the operator's intent for the slice. Optionally a `target`/scope nudge and an AFK/HITL hint.

**Output:** The same standalone-IU instance file with its **content fields authored**
(`goal`, `files`, `acceptance`, `acceptance_check`, `slice_type`, `verification`) and the
vertical-slice + testing + single-slice invariants enforced; the slice tagged `AFK`/`HITL` (a HITL
slice names the human decision point + the stage). Either a **build-ready slice** (hand forward to
`build` via `precedes`) **or** an **escalation** to the dev-sprint front (`escalates align-context`)
when a design fork or decomposition emerged. No carrier-lifecycle write, no gate decision. The
node-enter/-exit instrumentation events.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| operator `.claude` skills — `plan-eng-review` | the real "lock in the execution plan before build" stage: scope challenge, test coverage, edge cases, the de-scope/STOP gate | **yes** | — (process-shape analogue, not liftable body text) |
| operator `.claude` skills — `office-hours`, `plan-ceo-review` | a "should this even be built / is it one thing" framing pass | partial | — (closer to `triage`'s route decision than to slice-spec) |
| Pocock corpus — `caveman` Auto-Clarity Exception | the AFK/HITL + safety-exception discipline (drop terseness for irreversible/security/order-bearing) | **yes** | already in `sg-language-reviewer/source-material` (the doctrinal root) |
| be-civic harness (`~/projects/be-civic`) | a `specify-slice` / standalone-IU / vertical-slice authoring skill | **no** | — |
| in-repo dev-sprint front (align/design/specify/plan) | the four stages this node collapses | n/a (design input) | — (input, not an external analogue) |

The strongest external analogue is **`plan-eng-review`**. Its **Step 0: Scope Challenge** is the
real-world shape of this node's escalate-or-build decision: "*What is the minimum set of changes
that achieves the stated goal?*", "be ruthless about scope creep," and a **hard complexity STOP
gate** ("if the plan touches more than 8 files or introduces more than 2 new classes/services …
STOP … propose a minimal version … ask whether to reduce or proceed") — which is precisely the
**promote/escalate** signal when a "slice" turns out to be wholesale. Its dedicated **Tests review
section** is the testing invariant restated as a real review discipline. Nothing was lifted
verbatim because the analogue is a *process shape* (a gate + a scope challenge), and its body is
welded to gstack's preamble/AskUserQuestion machinery — importing it would break the factory's
keep-it-general rule. **be-civic has no analogue** (its matches were roadmap/spec docs, not a
slice-spec skill) — a real searched-and-absent finding, not silence.

## Source inventory

| file | status | notes |
|------|--------|-------|
| (none lifted) | — | The two real analogues (`plan-eng-review` Step-0 gate; Pocock `caveman` Auto-Clarity Exception) are process-shape / already-vendored doctrine; nothing is liftable as new verbatim body text without importing product-specific machinery. |

## Keep / Drop

**Kept (absorbed into body):**
- The collapsed-front job: write the standalone-IU content fields for one slice (from design §4 + §8 step 4).
- The vertical-slice invariant enforcement (reject a horizontal slice) and the testing invariant (≥1 observable test; `verification` names the tests; done = tests pass AND independently verifiable) — from IU-schema's standalone-only invariants.
- The single-slice invariant + the escalate-on-fork/decompose decision — the `plan-eng-review` Step-0 STOP gate, expressed as the `escalates` edge.
- AFK/HITL tagging with AFK preference; a HITL slice names the human decision point + the stage — from IU-schema `slice_type` + Pocock.
- The optional single coherence lens for an L-ish/contested slice only, off by default for AFK/S (design Fork G), reusing `lens-dispatch` with `target` = the IU spec.
- Optional scoped context fill via `invokes explore`.
- The import of the instrumentation preamble; no carrier write (projected-stage model).

**Dropped (out of scope):**
- The full lens panel over a plan doc — there is no plan doc; the rigor moves to `review`.
- Any carrier-lifecycle / gate write — `proposed` is `triage`'s, `in-delivery` is the build-enter event's, the terminal transition is `land`'s gate. (IU-schema three-writers split.)
- Decomposition / design-fork resolution — that is the escalate signal, handed to the dev-sprint front, not done here.

**Edge only (separate node):**
- `explore` — the scoped context-gatherer; reached via `invokes`, not absorbed.
- The dev-sprint front entry (`align-context`) — reached via the one-way `escalates` edge, not absorbed.
- `triage` (upstream) and `build` (downstream) — process seams (`can-follow` / `precedes`).

## Overlaps and seams

- **← `triage`** (`can-follow`): triage scaffolds the `proposed` standalone-IU stub and routes incremental work here; specify-slice receives it and authors the content fields. Reciprocal of triage's `precedes specify-slice`.
- **→ `build`** (`precedes`): a build-ready vertical slice hands forward to `build` (which runs it in `inline` mode, the tracer-bullet inner loop). Build consumes `improves`/`files`/`acceptance`/`acceptance_check`/`verification`/`slice_type` through the carrier-interface.
- **⤴ `align-context`** (`escalates`): when a design fork or a decomposition emerges, escalate one-way to the dev-sprint front entry — create-or-reuse a work-item carrier, close the standalone IU as `dropped` (reason promoted). This is a cross-arc handoff, excluded from arc traversal/stage projection (it must not read as ordinary next-stage flow).
- **References:** `IU-schema` (import — the standalone shape + invariants it enforces, read every run); `carrier-interface` (on-demand — the carrier id+kind+arc projection key + the per-kind field set); `instrumentation-preamble` (import — the emit contract); `lens-dispatch` (on-demand — only when the optional single coherence lens fires).
- **`composes-into`** `{ id: incremental, stage: specify-slice }` — the second arc, derived from the union of `composes-into {id: incremental}` edges.

## Fit

This is **one node**, not a split. It owns one coherent span of control flow (write fields →
enforce invariants → optionally run one lens → escalate-or-precede-build) and a single measurable
goal (a build-ready vertical slice, horizontal slices rejected). The design (§4) explicitly
collapses four front stages into this one for a single slice — splitting it back into sub-nodes
would re-import the dev-sprint weight the incremental loop exists to avoid. The optional lens is a
branch in the one body (a dial), not a second node. Per `07-decomposition`: it owns its own
branching, has a distinct measurable goal, and is sized to one collaborative span — a single node.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | incremental (stage: specify-slice) | the only/collapsed front stage of the incremental arc |
| invokes | explore | scoped, read-only context fill for the slice (same pattern as the front nodes) |
| references | IU-schema (`load: import`) | the standalone shape + the vertical-slice/testing/single-slice invariants it writes and enforces; read every run |
| references | carrier-interface (`load: on-demand`) | the carrier id+kind+arc projection key and the per-kind field set; read at the seam |
| references | instrumentation-preamble (`load: import`) | the node enter/exit emit contract every backbone node imports |
| references | lens-dispatch (`load: on-demand`) | only when the optional single coherence lens fires (L-ish/contested slice; off by default) |
| can-follow | triage | receives the `proposed` standalone IU triage scaffolded and routed here |
| precedes | build | hands the build-ready vertical slice forward to build |
| escalates | align-context | one-way cross-arc promote when a design fork / decomposition emerges (close standalone IU as dropped, create-or-reuse a work-item) |

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` → `collaborative`. Agrees.

**`goals:` as outcomes:** all three read as outcomes (a build-ready slice; horizontal slices
rejected; fork/decomposition escalated), each with a metric and an earns-keep threshold. No
activity-framed goal.

**Edge targets resolvable:** `incremental` (arc, derived from the new `composes-into` union),
`explore`, `IU-schema`, `carrier-interface`, `instrumentation-preamble`, `lens-dispatch`, `triage`,
`build`, `align-context` all exist (or, for `triage`, are authored in the same Wave-B batch — the
arc resolves once the batch lands). `escalates` is the just-added edge type in the taxonomy
(Wave A).

## Open questions

- **`triage` co-dependency.** `can-follow triage` resolves once the sibling `triage` node lands in
  the same Wave-B batch. If validate runs before `triage` exists, the edge is a pending endpoint
  (note for the driver; not a defect).
- **`lens-dispatch` `target` value.** The reference today takes `target: diff | doc`. This node
  passes the **IU spec** as the target. The design (§4) phrases it as `target: plan`; the spec is
  IU-shaped, not a plan doc. Translator/operator may want `lens-dispatch` to gain an explicit
  `iu-spec`/`slice` target value later; for now reuse `doc` semantics over the IU spec and name the
  seam in prose. (Off by default for AFK/S, so this is low-traffic.)
- **`escalates` runtime behaviour** (create-or-reuse the work-item carrier; close the standalone IU
  as `dropped`, reason promoted; record the two-way provenance link) is spec prose, not edge
  metadata — the body names it; the carrier mechanics live in the harness.
