---
title: Research report for product-dashboard-curator
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
sources_lifted: 4
researcher_adequacy_note: |
  Sources are the PM-pack design docs (no source-material/ dir — this node is specified
  directly by the design, like its sibling strategy-curator): the product-dashboard design
  (§2 work ledger, §6 relationships), the PM function design (the delivery coupling), the
  graph map (the product-dashboard-curator row + Edges-at-a-glance), and the two refs it
  imports (work-item-schema, okr-schema). Edges fall straight out of the graph-map row and
  were each confirmed to resolve on disk: invokes pr-author + queue-checker (the shared
  graduation machinery, both node files present); references work-item-schema + okr-schema
  (import) + bundling-rules (on-demand) — all present in graph/_refs/. primitive/mode = skill
  / collaborative is unambiguous: it is the operator-facing dispatcher of the curator family,
  the exact shape of the already-authored strategy-curator and handbook-curator siblings.
  Goals were straightforward to frame as outcomes (laddered + problem-framed content; durable
  record / no destructive loss; small forward view; single gated content path with zero
  state/gate writes). The one thing to watch on render: the **content-only contract** must read
  as a hard line in the body (no current_dev_stage write, no lifecycle advance, no gate
  decision) — it is the node's defining constraint and the reason it carries no composes-into.
  Recommendation: proceed; the node is a faithful sibling of strategy-curator tuned to the
  work-ledger surface.
---

# Research report for product-dashboard-curator

## Identity

**Candidate id:** product-dashboard-curator
**Candidate title:** Product-dashboard curator
**Scope:** The collaborative skill that maintains the **work-item content** of the
**product-dashboard's work ledger** (D49) — the one ledger of work items (carriers, D44) rendered
across the forward view (idea → exploring → committed), the in-flight zone, and the durable
record. It maintains each work item's **content half**: the problem/opportunity statement,
`outcome_link`, `value_prop_link`, `risk_state`, `tier`, the solution summary (only once
committed), `links`, `disposition`, and the thin **sprint-record** beside the ledger — all
graduated through the curator graduation machinery (a labelled PR via `pr-author`, after a
`queue-checker` duplicate check). It is the downstream **delivery-coupling** (loop B) curator. The
work ledger is overlay-bound to the product's own home, and the **maturity stage** (D45) sets the
default tier and the evidence bar `risk_state` is recorded against.

**Excludes — the defining contract (D49, work-item-schema):** it maintains **content only**. It
does **not** write `current_dev_stage` (projected from the dev-sprint traversal — node-enter/-exit
events tagged with the carrier, operator-overridable), does **not** advance `lifecycle_state`
(advanced at **gates** — operator go/no-go), and does **not** decide or append `gate_decisions[]`
(operator-appended). It also excludes the **vision & strategy** panel and the **OKR/progress**
layer (the strategy/discovery loop's `strategy-curator` + the outcome layer — adjacent surfaces,
read here for `outcome_link` but not owned). The work-item and objective *structures* are not
restated in the body — they live in the `work-item-schema` / `okr-schema` references (imported).

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Every work item is problem-framed and ladders to an objective — its problem/why is stated, `outcome_link` points at a real OKR, `value_prop_link` at a VPC job/pain/gain — so the contribution rollup is trustworthy, not a guess. | share of items with a populated problem + an authored `outcome_link`; share of forward-view items still problem-framed (not solution-locked) before committed. | untethered/solution-locked items trend toward zero; the by-contribution rollup never relies on an inferred link. |
| The work ledger is the durable record — killed/parked items survive with a `disposition`, record content is kept once shipped, and a later session reads *why* without re-deriving. | work items destructively deleted (target 0); share of parked/killed items carrying a `disposition`; share of shipped items whose record content survived the ship. | the destructive-delete count stays at zero; the anti-portfolio + record content are intact for audit. |
| The forward view stays a small, fast-flowing workspace — stale bets culled or re-validated, nothing lingers as backlog inventory, what is in Now is genuinely committed. | forward-view size over time; age of the oldest forward-view item; share of Now items with a crystallised solution summary. | the forward view does not grow into a hoarded backlog; stale items are culled on a cadence. |
| Content changes reach the ledger through one gated path, never a side-edit — and the curator never writes projected stage or a gate decision. | share of content changes via a curator-graduated PR vs out-of-band; duplicate ledger PRs (target ~0); curator writes to `current_dev_stage`/`lifecycle_state`/`gate_decisions` (target 0). | out-of-band edits trend toward zero; the curator is the single content write path with zero state/gate writes — the projected-stage / operator-gate contract holds. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** The **operator-facing dispatcher** for the work-ledger's content — the operator (or
an agent on their behalf) invokes it with a mode and it runs that mode's branch, pausing at the
judgment points (is a raw idea worth a work item and how is the problem framed; which objective an
item serves; whether a forward-view bet is stale; a killed item's disposition reason). It engages
the live main thread and shares state — the collaborative side of the context axis, hence a
**skill**. It is a deliberate **sibling of `strategy-curator` and `handbook-curator`** (both
`skill` / `collaborative`); the graph map states "curators are sibling skills, not one
parameterised node". The autonomous work (composing a PR body, the duplicate check) is delegated
to the **agents** it invokes (`pr-author`, `queue-checker`), keeping this node squarely
collaborative.

**`determinism:`** `generative`

**Rationale:** Its core work is **judgment** — framing a raw idea as a problem (not a solution),
deciding whether an item ladders and is ready, recording a maturity-scaled `risk_state`, judging a
stale forward-view bet, phrasing a disposition. None is a fixed input→output transform. Mirrors
the sibling curators, both generative.

## Contract

**Input:** an operator invocation naming a **mode** (`triage` / `add-item` / `reprioritise` /
`sprint-plan` / `record-disposition`) and the relevant focus (a raw idea, a work-item id, a set of
forward-view items, the committed set for a sprint, an item being parked/killed). Overlay-supplied
context: the **work-ledger home**, the **objectives/OKR home** (so `outcome_link` resolves), the
**maturity stage** (sets the default tier + evidence bar), and the graduation **repo + label**.
Imports `work-item-schema` + `okr-schema`; reads `bundling-rules` on demand at the graduation step.

**Output:**
- **`triage`** — a raw idea framed as a **problem-shaped work item** placed in the forward view,
  with a seeded `outcome_link` / `value_prop_link` / `risk_state` / `tier`, graduated as a
  labelled PR. (No lifecycle advance — placement is content, not a gate.)
- **`add-item`** — a new work item opened with its content fields and authored links, graduated.
- **`reprioritise`** — re-framed forward-view priority/zone for items whose content changed, plus
  stale bets culled (moved to a disposition, **not** deleted) or re-validated; graduated.
- **`sprint-plan`** — the thin **sprint-record** (goal · items · evidence/shipped · decision)
  assembled beside the ledger as a *view* (reads the projected traversal; writes no stage),
  graduated.
- **`record-disposition`** — a parked/killed item closed out with a `disposition` reason, retained
  (kept, not deleted), graduated.

All five graduate **content** through one path; none writes projected stage, advances lifecycle,
or records a gate.

## Source inventory

No `source-material/` dir — this node is specified directly by the PM-pack design (as its sibling
`strategy-curator` was). The defining sources:

| file | status | notes |
|------|--------|-------|
| `docs/product-dashboard-design.md` | keep (defining) | §2 the work ledger (forward view + record + sprint-record §2.5); §2.3 the entry = carrier state **+** record content, split by who-writes; §6 "the curator(s)" — *content only, not projected stage, not gates*. The authoritative source for what the node maintains and the content/state line. Drop the rendering / Vision / Progress-panel detail (adjacent surfaces, not this node). |
| `docs/product-management-design.md` | keep | The delivery coupling (loop B): the carrier state model, gates as operator records, the maturity × tier dial, the product-dashboard surface row ("product-dashboard-curator, light gate"), and the BC roadmap-curator prior art it generalises. Drop the strategy/discovery loop, the outcome layer, and the product-lens (separate nodes/surfaces). |
| `docs/pm-graph-map.md` | keep (edge-defining) | The **product-dashboard-curator row** (primitive, modes, the exact target edge set), Edges-at-a-glance (invokes pr-author + queue-checker; references work-item-schema + okr-schema import; **does NOT composes-into dev-sprint** — stage is projected). Every edge below traces here. Drop the rows for the other PM nodes. |
| `graph/_refs/work-item-schema.md` + `graph/_refs/okr-schema.md` | keep (imported) | The work-item structure (content fields + the who-writes split + invariants) and the objective structure (`outcome_link` target). Imported, not restated in the body. |

## Keep / Drop

**Kept (absorbed into body):**
- **The content/state contract** — the node maintains the work item's **content half** (problem,
  `outcome_link`, `value_prop_link`, `risk_state`, `tier`, solution-once-committed, `links`,
  `disposition`, sprint-record); it never writes `current_dev_stage` (projected), advances
  `lifecycle_state` (gates), or records `gate_decisions` (operator). This is the node's defining
  constraint, stated as a hard line up front and re-stated in Hard constraints.
- **The five modes as body branches** (D34): `triage` (frame a raw idea as a problem) → `add-item`
  (open with links) → `reprioritise` (move forward-view items, cull stale bets) → `sprint-plan`
  (assemble the sprint-record view) → `record-disposition` (close out parked/killed, kept).
- **Problem-framed until committed + laddered** (Torres / SVPG / D38-D39 authored link) — the
  solution summary lands only at `committed`; every `outcome_link` is an authored link to a real
  objective, never inferred.
- **Durable record / never delete** — killed and parked items are retained with a `disposition`
  (the anti-portfolio); record content is kept once shipped. A hard constraint, not advice.
- **The forward view as a small, fast-flowing workspace** — low inventory, high function; stale
  bets culled or re-validated (the AI-world "kill the backlog" discipline, D32/D49).
- **The graduation machinery, reused** — content changes land via a labelled PR composed by
  `pr-author`, after a `queue-checker` duplicate/collision check, exactly as the sibling curators
  graduate. The curator is the **single content write path** to the work-ledger surface.
- **Overlay generalisation** — the work-ledger home, the objectives home, the maturity stage, and
  the repo/label are all overlay-supplied; the same node serves any product's work ledger (no BC
  literals).

**Dropped (out of scope / product-specific):**
- BC names, paths, tiers, the 12-stage lifecycle ordering, and toolchain — the canonical node is
  general; the work-item structure lives in `work-item-schema`.
- The **vision & strategy** panel and the **OKR/progress** layer — the strategy/discovery loop's
  `strategy-curator` + the outcome layer; read here (for `outcome_link`) but not owned.
- The dashboard's **rendering** of the four surfaces (largely a read/assembled surface) — not the
  curator's content job.

**Edge only (separate node):**
- **Composing the graduation PR description** → `pr-author`. `invokes`, from the shared graduation
  steps.
- **The duplicate / collision queue check before opening a PR** → `queue-checker`. `invokes`, from
  the shared graduation steps (mirrors the sibling curators).

## Overlaps and seams

- **vs `strategy-curator` / `handbook-curator`** — the deliberate siblings. All three are surface
  curators graduating via the same machinery (`pr-author` + `queue-checker` + the curator refs).
  They differ only in surface + modes: strategy-curator maintains the canvas, handbook-curator
  maintains canon, this maintains the work-ledger content. **No edge** between them — parallel
  members of the curator family, not a pipeline.
- **✗ `dev-sprint` (NO `composes-into` edge).** The carrier's `current_dev_stage` +
  `transition_history` are **projected from the dev-sprint traversal**, not written by a stage or a
  curator (D44, D49, work-item-schema). The PM↔dev interface is *projection + the gate/debrief
  decisions*, not a `composes-into` edge from this curator to the dev-sprint. The graph map states
  this explicitly. The seam is described in prose (the content/state contract), not an edge.
- **→ `pr-author`** (`invokes`, from graduation) — hands the settled content edits, receives a PR
  body string. The graduation seam (same as the sibling curators). Already exists.
- **→ `queue-checker`** (`invokes`, from graduation) — duplicate/collision check before the PR
  opens. Already exists.
- **← gates (no edge).** `lifecycle_state` advances at operator gates, each appending a
  `gate_decision`. This is an operator decision, **not a node** and not a write-edge to the curator
  — described in the content/state contract, no edge authored.
- **← `debrief` (no edge authored here).** The loop-close: `debrief` writes outcomes back to the
  work item's `lifecycle_state` (→ shipped → live) and to the strategy hypotheses. This is an
  inbound process flow from the dev-sprint debrief fleet; per the design it is prose and the edge
  is **deferred** (F7 — the debrief fleet's process edges, matching the sibling curators' inbound
  flow). The curator does not own this write.
- **`outcome_link` → the outcome layer (`okr-schema`)** — a `references` import: the curator reads
  the objectives home (overlay-bound) so `outcome_link` resolves to a real objective. Not a write
  to the outcome layer (the strategy loop owns it); a read/link target.
- **Surfaces (overlay binding, not edges)** — the **work-ledger home**, the **objectives home**,
  and the **maturity stage** are overlay-bound workspace state the node *reads* (path-agnostic
  `Read`); they are harness bindings, not graph nodes/edges. This mirrors exactly how
  strategy-curator declares "maintains the strategy-canvas surface" via its overlay-bound canvas
  home — surface-maintenance is an overlay binding stated in the body, **not** a `maintains` edge
  (the `maintains` edge type is reserved for handbook-references).

## Fit

**Single node — confirmed.** It owns its own branching (five modes) and sequencing (frame → open →
reprioritise → sprint-plan → close-out, all over one surface), and it states distinct measurable
goals (laddered + problem-framed content; durable record / zero destructive loss; a small forward
view; one gated content path with zero state/gate writes). It is a sibling of two already-authored
nodes of the same shape (`strategy-curator`, `handbook-curator`) — the strongest fit signal: the
curator-cell decomposition (D40) is proven, and this is the same cell tuned to the work-ledger
surface.

**Modes stay body branches (D34), not nodes.** None of the five earns its own separable measurable
goal that would force a split — they are content operations on one ledger sharing the graduation
path. The PR-*composition* (`pr-author`) and the duplicate-*check* (`queue-checker`) **are** their
own nodes — correctly `invokes` edges, not absorbed branches (each is autonomous, isolated,
reused by the other curators — the decomposition reuse/cohesion test).

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| invokes | pr-author | the graduation steps compose the labelled-PR description for settled content edits (same path as the sibling curators). Resolvable now — `graph/pr-author/pr-author.md`. |
| invokes | queue-checker | the graduation steps check for a duplicate/colliding open ledger PR before opening one (mirrors the sibling curators). Resolvable now — `graph/queue-checker/queue-checker.md`. |
| references | work-item-schema (`load: import`) | the carrier structure — the content fields, the who-writes split, and the invariants the modes enforce. Short, must-always-be-present (every mode touches it) → `import` (per the graph map's load-dial table). Resolvable now — `graph/_refs/work-item-schema.md`. |
| references | okr-schema (`load: import`) | the objective structure — the target `outcome_link` points at, and the laddering invariant. Short, must-always-be-present → `import`. Resolvable now — `graph/_refs/okr-schema.md`. |
| references | bundling-rules (`load: on-demand`) | the curator decides what content edits to bundle into one ledger PR before it calls pr-author — the same gate the sibling curators apply. Consulted at the graduation step → `on-demand`. Resolvable now — `graph/_refs/bundling-rules.md`. (Mirrors strategy-curator, which carries `bundling-rules` for the same reason; `what-belongs` / `pr-description-shape` are left to pr-author.) |

**Omitted deliberately:**
- **`composes-into dev-sprint`** — explicitly **NOT** an edge (graph map; D44/D49). The carrier's
  `current_dev_stage` is projected from traversal; the curator writes content only and holds no
  write-edge to the carrier or the dev-sprint. This is the node's defining structural property.
- **`maintains`** — reserved for **handbook-references** (validator + schema). The work-ledger is a
  *workspace surface*, not a handbook-reference, so surface-maintenance is declared by the
  overlay-bound home in the body (mirroring strategy-curator's strategy-canvas), **not** a
  `maintains` edge.
- **`precedes` / `can-follow`** into the gate/debrief loop — deferred to prose (the inbound
  gate-advance + debrief-outcome flows are operator/debrief writes, not curator edges), matching
  the sibling curators' established pattern (F7).

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — agrees (skills engage the
operator; this is the operator-facing dispatcher). Matches the siblings `strategy-curator` /
`handbook-curator`.

**`goals:` as outcomes:** all four read as outcomes (items laddered + problem-framed; the ledger is
a durable record with zero destructive loss; the forward view stays small; content lands via one
gated path with zero state/gate writes), each with a metric and an earns-keep threshold. None are
activities. The one to watch on render: the fourth goal must stay an *outcome* (the content/state
contract holds — zero state/gate writes) rather than sliding to an activity ("opens PRs").

**Edge targets resolvable:** `invokes` set is `pr-author` / `queue-checker` — both present as node
files (verified on disk). `references` set is `work-item-schema` / `okr-schema` (import) +
`bundling-rules` (on-demand) — all present in `graph/_refs/` (verified on disk). No `external` and
no forward references; everything resolves now.

## Open questions

- **A single parameterised `surface-curator`?** strategy-curator, handbook-curator, and this node
  share the graduation machinery and differ only in surface + modes. Whether one parameterised
  curator could replace all three is a named open refinement (graph map) — left for review, not
  resolved here. Current decision: sibling skills (matches the design + the two authored siblings).
- **`debrief` / gate inbound flow.** The loop-close (debrief writes lifecycle/outcome; gates advance
  lifecycle) is described in prose and the edges are deferred (F7), matching the sibling curators.
  When the debrief-fleet process edges into loop B are wired, revisit whether any inbound `triggers`
  / `can-follow` should be authored — but the curator still must not *write* state, so most likely
  these remain non-curator edges.
- **The sprint-record's home.** Whether the sprint-record is a sub-surface of the work-ledger home
  or a sibling surface is an overlay/harness concern (BC's `sprints/*.md` prior art); the node
  treats it as a view assembled beside the ledger and reads the projected traversal — confirmed
  general, no factory decision needed.
