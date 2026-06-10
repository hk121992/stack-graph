---
title: Research report for triage
type: research-report
status: complete
authored: 2026-06-04
last_updated: 2026-06-10
amended:
  - date: 2026-06-10
    hint: "D67 / loop-runner-design §10 — triage becomes the raise-time capture-and-decide node: 'raise an IU' trigger; technical/bug-shaped route tie-breaker; writes the definition body (Context + Decisions) on the carrier; propose-don't-interrogate question discipline; the cold-handoff test invariant; specify-slice now formalise-and-enforce (unattended in a dispatched session). Edges unchanged."
sources_lifted: 0
external_analogue_found: true
external_corpora_searched:
  - operator skill set (~/.claude/skills — office-hours intake/routing, plan-eng-review, plan-ceo-review, learn)
  - be-civic curator family (bc-handbook-curator)
  - Pocock language + tracer-bullet corpora (tooling/sg-language-reviewer/source-material; graph/build/source-material)
  - in-repo graph nodes + docs (graph/, docs/incremental-improvement-design.md — design INPUT, not an analogue)
researcher_adequacy_note: |
  The settled design (docs/incremental-improvement-design.md §1/§3/§4/§8/§9) is the authoritative
  DESIGN INPUT, not an external analogue — it cannot corroborate the node against how the routing
  job is really done. The genuine external analogue is the operator's own office-hours skill: a real
  .claude skill whose entry classifies an incoming request and routes it down one of two paths
  (Startup vs Builder mode, SKILL.md L894–898) by reading signals, and whose "upgrade mid-session"
  rule (L1115: Builder→Startup when the request turns out to be a real company) is the exact shape of
  triage's incremental→wholesale escalation. office-hours also models the intake→/plan-* handoff
  (L258). No verbatim lift was taken: office-hours is product-specific (YC diagnostic prose) and
  carries no reusable contract — the analogue value is the routing/escalation SHAPE, recorded here,
  not text. The tracer-bullet discipline triage routes INTO already lives verbatim in
  graph/build/source-material (Pragmatic Programmer + aihero), so it is not re-lifted. primitive=skill /
  mode=collaborative is unambiguous (a route decision is a judgment the operator confirms). Goals framed
  as outcomes cleanly (correct routing; no standalone-IU misuse). Recommendation: proceed to translator.
---

# Research report for triage

## Identity

**Candidate id:** triage
**Candidate title:** Triage
**Scope:** `triage` is the **entry** of the incremental-improvement arc (`incremental`). It takes an
identified improvement and applies the wholesale-vs-incremental route rule (design doc §1): one
understood vertical slice → **incremental** (scaffold a standalone-IU carrier-lite at
`improvements-root`, hand to `specify-slice`); needs a design decision, decomposes into >1 slice, or
belongs on the strategic surface → **wholesale** (escalate to the dev-sprint front; NO standalone IU
created). It owns the route decision and the instance scaffold only — it does **not** write the IU's
content fields (that is `specify-slice`) and does **not** run the sprint front itself (it hands off).
Out of scope: any build/review/land behaviour; the IU content contract; the auto-feed implementation
from `triage-source` (input-gated, Fork D — the binding is read, the auto-spawn is not built).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Every improvement is routed to the right loop — a single understood slice goes incremental, a design/decomposition/tracked-work change goes wholesale. | Share of triaged items that reach their terminal state in the loop triage chose without a later re-route (incremental item that should have been a work-item, or a promote after build). | Mis-routes (later re-routes / promotes-after-build) trend toward zero over N items; if triage's route is routinely overturned downstream, the route rule or the node is not earning its place. |
| A standalone IU is never created for work that should be a work-item — the light loop never silently grows into a sprint. | Count of standalone IUs that later grow a design fork or a second slice and must be promoted (design doc Fork E) post-scaffold. | Post-scaffold promotions stay rare; a rising rate means triage is admitting wholesale work as incremental and the tie-breakers need tightening. |
| Wholesale changes are escalated cleanly with provenance, not built as a degenerate slice — the dev-sprint front receives them with a recorded source link. | Share of escalations that carry a two-way provenance link (work-item ↔ source) vs escalations recorded as prose only. | Every escalation carries the provenance bridge (design doc §9 R5); an escalation that loses the link is a defect. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** `triage` owns a **route decision** — a judgment over the §1 rule and three
tie-breakers ("does it need design?" / "does it decompose?" / "would a stakeholder track it?") — that
the operator confirms before any carrier is created, and which carries an irreversible-ish
consequence (creating a carrier in the wrong loop costs a later promote). That is collaborative
current-context work, not an isolated autonomous task that returns a digest. It engages the operator
(especially on the AFK fast-path decision and on confirming a `triage-source` candidate), so it is a
**skill** (`collaborative`), matching the two existing front nodes `align-context` and `specify`.

**`determinism:`** `generative`

**Rationale:** The route is a judgment, not an algorithm — the same words can describe an incremental
slice or a wholesale capability depending on whether a design fork is latent. Judgment → `generative`.

## Contract

**Input:** An identified improvement — an operator note, a handbook-curator drift finding, or a
`learn`/recall hit. Optionally a `triage-source` binding pointing at the queue the candidate was
raised from (input-gated; the operator confirms the candidate). The harness bindings for
`improvements-root` / `improvements-manifest` (where a standalone IU is scaffolded) and the
`IU-schema` standalone shape (the frontmatter stub it writes).

**Output:** Exactly one of two outcomes.
- **Incremental** — a scaffolded standalone-IU **instance file** at `improvements-root/<id>.md`
  (frontmatter stub per the IU-schema standalone shape: `channel: incremental`, `lifecycle_state:
  proposed`, `status: planned`, the `improves` target, empty `gate_decisions`), an entry added to the
  `improvements-manifest`, handed to `specify-slice` (which fills the content fields). A node-exit
  event with outcome `routed-incremental`.
- **Wholesale** — an **escalation** to the dev-sprint front (`escalates align-context`):
  create-or-reuse a work-item carrier, record the two-way provenance link, create **no** standalone
  IU. A node-exit event with outcome `escalated-wholesale`.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| operator skills — `office-hours` (`~/.claude/skills/office-hours/SKILL.md`) | a real entry skill that classifies an incoming request and routes it to one of N paths, with an escalation when the request outgrows the light path | **yes** | — (no lift; analogue is shape, not reusable text — see note) |
| operator skills — `plan-eng-review`, `plan-ceo-review` | the escalation target — what a "wholesale" review/design path looks like as a real skill | yes (context) | — |
| operator skills — `learn` | a real `triage-source` candidate store (recall/learnings feeding improvements, Fork D) | yes (context) | — |
| be-civic curator family — `bc-handbook-curator` | a real curator that raises improvements/drift as candidates a triage step could consume | yes (context) | — |
| Pocock tracer-bullet corpus — `graph/build/source-material/*tracer*` | the vertical-slice/AFK discipline triage routes INTO (already lifted for `build`) | yes (already in-repo) | — (already lifted under build, not re-lifted) |
| Pocock language corpus — `tooling/sg-language-reviewer/source-material/pocock-*` | the description-shape + prose-economy standard for the node's surfaces | yes | — (the standard, applied; not node content) |
| in-repo — `docs/incremental-improvement-design.md`, `graph/` | the settled design + the front nodes it collapses | yes | — (design INPUT, explicitly NOT an external analogue) |

**The external analogue found.** `office-hours` is the genuine counterpart. Its entry **classifies**
the request — "Startup, intrapreneurship → Startup mode; hackathon, open source, learning → Builder
mode" (SKILL.md L894–898) — by reading signals about what kind of thing the request is, exactly as
`triage` reads "does it need design / decompose / get tracked?" to pick incremental vs wholesale. Its
mid-session **upgrade** rule — "the user starts in builder mode but says 'actually I think this could
be a real company'… upgrade to Startup mode" (L1115) — is the live shape of `triage`'s
incremental→wholesale **escalation**: a lighter path discovering it should have been the heavier one.
And `office-hours` hands off to the heavier planning path (`/plan-*`, L258), as `triage` escalates to
the sprint front. No verbatim lift: office-hours is YC-diagnostic, product-specific prose with no
reusable contract — the value is the routing+escalation **shape**, recorded here, not its text. The
tracer-bullet/vertical-slice discipline that defines a *valid* incremental slice was already lifted
verbatim for `build` (`graph/build/source-material/{pragmatic-programmer,aihero}-tracer-bullets.md`),
so it is cited, not re-lifted.

## Source inventory

No new files lifted into `graph/triage/source-material/`. The routing analogue (`office-hours`) is a
shape, not reusable text; the tracer-bullet methodology already lives in `graph/build/source-material/`.
This is a searched-and-recorded zero-lift, not a skipped step — see the table above.

## Keep / Drop

**Kept (absorbed into body):**
- The §1 route rule + the three tie-breakers (does it need design / decompose / get tracked).
- The two-outcome branch (incremental → scaffold + hand to `specify-slice`; wholesale → escalate).
- The scaffold contract: write the standalone-IU stub per the IU-schema standalone shape
  (`channel: incremental`, `lifecycle_state: proposed`, `status: planned`, `improves`, empty
  `gate_decisions`), add the manifest entry.
- The "light by design" fast-path: an obvious AFK slice may pass straight through with a thin check.
- The `triage-source` seed (input-gated; operator confirms) — read the binding now, auto-feed off.
- The escalation discipline (create-or-reuse work-item, record provenance, no standalone IU).

**Dropped (out of scope):**
- Writing the IU content fields (`goal`/`files`/`acceptance`/`acceptance_check`/`verification`) and
  setting `slice_type` — that is `specify-slice`'s job (triage only stubs the frontmatter).
- The vertical-slice/testing INVARIANT enforcement — enforced at `specify-slice`/validate, not here.
- The tracer-bullet inner loop — `build`'s discipline.
- The auto-feed implementation from `triage-source` — input-gated (Fork D); build the read, not the spawn.

**Edge only (separate node):**
- `specify-slice` — the next stage (incremental branch); a `precedes` edge.
- `align-context` — the dev-sprint front entry (wholesale branch); an `escalates` edge.
- `IU-schema`, `bindings-contract`, `instrumentation-preamble` — references the node consumes.

## Overlaps and seams

- **`triage` → `specify-slice`** (`precedes`): the incremental branch hands the scaffolded standalone
  IU to `specify-slice`, which fills its content fields and enforces the slice invariants. The
  reciprocal `can-follow triage` is authored on `specify-slice`'s side (parallel author).
- **`triage` → `align-context`** (`escalates`, cross-arc): the wholesale branch hands off to the
  dev-sprint front entry. Per the edge taxonomy this is **not** `precedes` (design doc §9 R3): it is
  excluded from arc traversal and stage projection so an escalation never reads as ordinary
  next-stage flow. Runtime behaviour (create-or-reuse the work-item carrier; record two-way
  provenance; create no standalone IU) is body prose, not edge metadata.
- **`triage` ↔ the curator family** (no edge): a handbook-curator drift finding can *seed* a candidate
  via the `triage-source` binding (a convention read on demand, like the carrier bindings in
  `align-context`), not a `references`/`invokes` edge. Recorded as a binding read in prose.

## Fit

A single node. It owns its own branching — the two-way incremental/wholesale route is real control
flow with a distinct, separately-measurable goal (correct routing; no standalone-IU misuse) that no
existing node carries. It is not absorbed into `specify-slice` (which assumes the route is already
**incremental** and writes content) and not into `align-context` (which is the wholesale front entry,
the escalation target — folding triage there would erase the light path). One node, one primitive
(D34): the AFK fast-path and the `triage-source` seed are **branches in the one body**, not separate
nodes.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | incremental (stage: triage) | triage is the entry stage of the `incremental` arc; the arc is the derived union of these edges (design doc §4). |
| references | IU-schema (`load: import`) | triage writes the standalone-IU frontmatter stub; it needs the standalone shape in context at author time → import. |
| references | bindings-contract (`load: on-demand`) | triage resolves `improvements-root` / `improvements-manifest` / `triage-source` only when it scaffolds/seeds → on-demand. |
| references | instrumentation-preamble (`load: import`) | every backbone node imports the enter/exit emit contract. |
| precedes | specify-slice | the incremental branch's normal next stage (process edge, in-arc). |
| escalates | align-context | the wholesale branch's one-way cross-arc handoff to the dev-sprint front entry (design doc §9 R3). |

No `invokes` (triage runs no agent), no `loads`, no `can-follow` (triage is the entry — nothing in the
incremental arc precedes it; the `triage-source` seed is a binding read, not a process edge),
no `maintains`, no `overlay`.

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` → `collaborative`. Agrees.

**`goals:` as outcomes:** all three read as outcomes (right-loop routing; no standalone-IU misuse;
clean escalation with provenance), each with a metric and an earns-keep threshold. No activity-framed
goal.

**Edge targets resolvable:** `incremental` (arc, derived — resolves once the arc's edges are indexed),
`IU-schema` / `bindings-contract` / `instrumentation-preamble` (exist in `graph/_refs/`),
`align-context` (exists). `specify-slice` is authored in the **same batch** (parallel) — the `precedes`
edge is authored now as part of the self-contained arc edge-set (design doc §8 step 8); it resolves
once the sibling lands.

## Open questions

- **`specify-slice` co-authoring.** The `precedes specify-slice` edge targets a sibling authored in
  parallel. If `specify-slice`'s id changes, this edge must follow. (Resolved at validate when both land.)
- **`escalates` arc note.** The escalation creates-or-reuses a work-item carrier and records two-way
  provenance — that runtime behaviour is body prose, not edge metadata (per the taxonomy). The body
  states it; the spec (`02-graph-spec` escalates semantics) is the canonical source.

---

## Amendment — 2026-06-10 (D67 / loop-runner-design §10): raise-time capture-and-decide

**Why.** The loop-runner design (`docs/loop-runner-design.md`) dispatches a batch of standalone IUs,
one fresh agent session per IU, running `specify-slice (unattended) → build → review` against the
carrier file alone. For that to be safe, each IU must be **decision-complete from raise time** — no
operator question can surface mid-loop. Rounds 1–2 first resolved this by attended intake; the
**operator redesign (§10)** moved it upstream instead: **all operator questions happen at `triage`,
on the spot, in the session that already holds the context.** `triage` is reinforced as the
human-facing capture node; `specify-slice` is lightened to a mechanical formalise-and-enforce pass
that returns to the dispatched session with nothing left to ask. The operator explicitly kept both
front nodes (a proposed fuse-and-retire was rejected). This is the **human-facing vs mechanical**
split, not route-vs-define.

**What changed in the node (all within the existing scope — no new schema field, no edge change):**

1. **Trigger — the "raise an IU" phrase.** The `description` and `when-to-use` gain the operator
   routing signal: when something comes up mid-session and the operator says *raise it*, this node
   captures and decides on the spot. This is the field-true trigger (§10: "I say raise the IU and
   the agent asks me any questions to define it on the spot").

2. **Route rule — the technical/bug-shaped tie-breaker.** Added as the decisive tie-breaker (§10):
   **incremental = work whose specification is derivable from the carrier + codebase with no
   product/design judgment; anything needing a product decision ⇒ wholesale.** This sharpens the
   three existing tie-breakers (design? / decompose? / tracked?) with the loop-scope discriminator
   the operator named.

3. **Incremental branch reshaped — capture, don't defer.** Triage still scaffolds the same identity
   stub (`id`, `title`, `channel: incremental`, `improves`, `lifecycle_state: proposed`,
   `status: planned`, empty `gate_decisions`) — the writer split is unchanged. But it now ALSO
   writes the **definition body** on the carrier:
   - `## Context` — harvested from the live conversation: observed vs expected, repro, error
     output, file/scope pointers — **verbatim evidence, never "see this conversation"** (a fresh
     agent has no access to it).
   - `## Decisions` — every call settled in the raise conversation, **including the AFK/HITL call**
     (formalised later as `slice_type`/`hitl_point` by `specify-slice`; the *decision* is recorded
     here so loop-runner's intake pre-park can read it).
   These are **body sections on the carrier**, not new schema fields — `goal/files/acceptance/
   acceptance_check/size/slice_type/verification` stay `specify-slice`'s content fields, and triage
   still writes no lifecycle past `proposed`.

4. **Question-shape discipline — propose, don't interrogate.** Harvest first; derive what the repo
   can answer (may note `explore` for mechanical detail); ask the operator **only the genuine
   remaining decisions — typically 0–2 questions**, because the raising session already holds the
   context. This replaces the old "ask one specific question when tie-breakers disagree" with a
   fuller capture-then-ask discipline (the route question is one case of it).

5. **New invariant — the cold-handoff test.** Triage may **not** hand off a carrier that fails it:
   *a fresh agent with only this carrier file + repo access could implement and prove the slice.*
   Checklist: outcome-framed intent in Context; evidence verbatim; scope pointers real; **no
   unresolved decision left in prose** — an unresolved fork is settled now, escalated, or the IU is
   not raised. This is homed in `IU-schema` as the loop-eligibility invariant (a `proposed` stub
   without a passing definition body is a valid intra-conversation state but **never loop-eligible**).

6. **Handoff text — specify-slice now formalise-and-enforce, unattended.** The arc is unchanged
   (`precedes specify-slice`), but `specify-slice` now runs as formalise-and-enforce — typically
   UNATTENDED inside a loop-runner-dispatched session. The body says triage's capture is what makes
   that possible: a **decision-complete carrier = loop-eligible**. Triage still writes NO content
   fields and no lifecycle past `proposed`.

7. **Goals.** Added a fourth goal covering **decision-completeness at raise** (the new invariant's
   measurable face): share of dispatched IUs that route out `blocked: insufficiently-defined` or
   generate mid-loop operator questions — trends to zero; a rising rate means triage's capture is
   failing its invariant. The three existing goals still hold (correct routing; no standalone-IU
   misuse; clean escalation with provenance) and are kept.

8. **Edges — unchanged.** `composes-into incremental @triage`; `references` (IU-schema import,
   bindings-contract on-demand, instrumentation-preamble import, work-item-schema on-demand);
   `precedes specify-slice`; `escalates align-context`. The frontmatter edge **comment block** is
   updated to reflect the new shape (capture-and-decide; the definition body is written here; the
   cold-handoff test gates the handoff).

**External analogue still holds.** `office-hours` remains the genuine counterpart — its entry
classifies and routes, and its mid-session upgrade rule is the incremental→wholesale escalation
shape. The reshape adds a *capture* responsibility (harvest the live conversation), for which
`office-hours`'s own intake-interview discipline (probe to get the requirements complete before
handing to `/plan-*`) is the same shape: ask enough to make the downstream handoff self-sufficient.
No new lift — the analogue value is shape, recorded here.

**Keep / Drop deltas.**
- **Newly kept (absorbed into body):** the "raise an IU" trigger phrase; the technical/bug-shaped
  route tie-breaker; the `## Context` + `## Decisions` definition-body write; the propose-don't-
  interrogate question discipline; the cold-handoff test invariant; the decision-complete ⇒
  loop-eligible framing of the handoff to `specify-slice`.
- **Still dropped (unchanged):** the IU content fields and `slice_type` *formalisation* (specify-
  slice's — triage records the *decision*, specify-slice *renders* it); the vertical-slice/testing
  invariant enforcement (specify-slice/validate); the tracer-bullet inner loop (build); the
  auto-feed implementation from `triage-source` (input-gated).

## Review fix-pass — round 3 (2026-06-10)

Design §11 fixes applied to the canonical: the `## Decisions` capture now includes any inter-IU
dependency ("depends on `<id>`, or none") and the cold-handoff checklist gains the
dependencies-named-or-none item (R3-M2). loop-runner now declares `invokes: triage` for its
intake define-now fallback (R3-M3) — no edge change on triage's side (targets declare no inbound
edge).
