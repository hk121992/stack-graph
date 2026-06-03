---
title: Research report for product-dashboard-curator
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: "Backfill external-analogue search: lifted 4 files (bc-roadmap-curator, bc-roadmap-discipline, bc-handbook-curator, ce-product-pulse); added External analogues searched table, Source inventory update, Challenge findings section, updated researcher adequacy note."
sources_lifted: 4
external_analogue_found: true
external_corpora_searched:
  - "be-civic operational harness (bc-workspace/.claude/agents/*, bc-operations/bc-skills/)"
  - "be-civic handbook (bc-workspace/handbook/content/06-workspace/)"
  - "CE plugin (ce-plugin/plugins/compound-engineering/skills/)"
  - "gstack live skills (~/.claude/skills/gstack/)"
  - "Published best practice: Teresa Torres / producttalk.org (Opportunity Solution Tree, continuous discovery)"
  - "Published best practice: SVPG / svpg.com (opportunity backlog, outcome-driven work items)"
  - "Published best practice: Scrum.org / ScrumAlliance (product backlog refinement)"
researcher_adequacy_note: |
  External search covered all four corpora in the task brief plus web. The primary
  analogue found is bc-roadmap-curator (be-civic operational harness) — explicitly
  named in the node's own description as the prior art it generalises. A second
  strong source is the be-civic handbook page bc-roadmap-discipline, which gives the
  concrete data model (id/tier/stage/opened/shipped frontmatter) and the 12-stage
  lifecycle that the node generalises. bc-handbook-curator was lifted as the real
  operational sibling-curator whose graduation machinery (queue-checker + pr-author +
  labelled PRs) is the claimed structural counterpart. ce-product-pulse was lifted
  from the CE plugin as the closest CE-world analogue to product-level reporting and
  backlog grounding; it is not a direct counterpart but surfaces discipline gaps. The
  gstack live skills set (retro, landing-report, ship, document-release, investigate)
  was searched; none address the curator/backlog-content-maintenance job directly —
  they are delivery/report skills, not ledger-content curators. Web search confirmed
  Torres' Opportunity Solution Tree and SVPG's opportunity-backlog as the published
  methodology the node operationalises; SVPG URLs returned 403, so the Torres
  producttalk.org fetch succeeded and is cited. Challenge findings are the core new
  value: bc-roadmap-discipline reveals that the real prior art schema has NO
  problem/why, no outcome_link, no value_prop_link, no risk_state, no disposition —
  the generalisation claim is correct but these are additions, not distillations, and
  the node should name them as such. The bc-handbook-curator lift grounds the
  graduation-machinery claim and exposes a mode-set gap (no `integrate` / `queue`
  equivalents for the work-ledger surface). Recommendation: proceed to translator with
  the challenge findings applied; the content/state contract is the node's strongest
  claim and is well-grounded; the mode-completeness gap is an open question for the
  operator.
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

## External analogues searched

Record of the real-world search. This section grounds the Challenge findings section below.

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| be-civic operational harness (`bc-workspace/.claude/agents/`) | `bc-roadmap-curator` — the named prior art, agent that manages be-civic roadmap items + sprint files | yes | `bc-roadmap-curator.md` |
| be-civic handbook (`bc-workspace/handbook/content/06-workspace/`) | `05-roadmap-discipline.md` — the data model and lifecycle the roadmap-curator is governed by | yes | `bc-roadmap-discipline.md` |
| be-civic operational harness (`bc-operations/bc-skills/bc-handbook-curator/`) | `bc-handbook-curator` — the real operational sibling-curator (handbook surface); same graduation machinery | yes | `bc-handbook-curator.md` |
| CE plugin (`ce-plugin/plugins/compound-engineering/skills/`) | `ce-product-pulse` — closest CE analogue for product-level reporting / backlog grounding; `ce-strategy` for OKR layer | yes (ce-product-pulse); ce-strategy examined but not lifted | `ce-product-pulse.md` |
| gstack live skills (`~/.claude/skills/gstack/`) | retro, landing-report, ship, document-release, investigate — any skill that curates a product work ledger or maintains a durable item record | no direct counterpart (delivery/report skills, not ledger-content curators) | — |
| Published best practice: Teresa Torres / producttalk.org | Opportunity Solution Tree: problem-framing discipline, laddering to outcomes, disposition/culling | yes (producttalk.org fetch succeeded; SVPG 403) | not lifted verbatim (web fetch summary used in challenge findings) |
| Published best practice: SVPG / svpg.com | opportunity backlog, outcome-driven framing, anti-portfolio concept | partial (403 on direct pages; summary from search results) | — |
| Published best practice: Scrum.org / ScrumAlliance | product backlog refinement best practices, problem-framing discipline | found; confirms problem-vs-solution framing as standard practice | — |

**Primary analogue:** `source-material/bc-roadmap-curator.md` (be-civic operational harness) — the
explicitly named prior art. The roadmap-discipline handbook page (`source-material/bc-roadmap-discipline.md`)
is the strongest challenge source: it exposes the concrete schema the node claims to generalise.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/bc-roadmap-curator.md` | keep (defining — prior art) | The minimal agent stub: defines PR labelling convention (`--label Roadmap`), points at roadmap-discipline for schema. Its brevity is itself a finding: the real curator is a thin wrapper that defers all discipline to the handbook page, whereas product-dashboard-curator carries the discipline inline. |
| `source-material/bc-roadmap-discipline.md` | keep (challenge — schema reference) | The canonical be-civic data model: `id/title/tier/stage/opened/shipped/spec_pr/build_plan/notes_md_path` frontmatter, the 12-stage lifecycle, sprint conventions, branch model. KEY CHALLENGE SOURCE: the schema has no `problem/why`, no `outcome_link`, no `value_prop_link`, no `risk_state`, no `disposition` — these are additions by product-dashboard-curator, not distillations. Also: the be-civic lifecycle allows direct-push to main for ops-trio surfaces; product-dashboard-curator requires labelled PRs for all content changes, a stronger gating rule. |
| `source-material/bc-handbook-curator.md` | keep (sibling-curator analogue) | The real operational sibling-curator — same graduation machinery (queue-checker + pr-author + labelled PRs). CHALLENGE SOURCE: bc-handbook-curator has a `queue` mode (read-only queue view), an `integrate` mode (operator weekly triage across all open PRs), and a `refresh-index` mode — none of which have equivalents in product-dashboard-curator. Exposes the mode-completeness gap for operator triage of queued ledger PRs. Also: strict `what-belongs.md` gatekeeping reference and a `decision-doc` mode for pivot-shaped decisions — neither has an analogue in the node. |
| `source-material/ce-product-pulse.md` | edge-only (different domain — analytics, not ledger content) | ce-product-pulse is a time-windowed analytics/tracing report skill, not a ledger-content curator. Different job. CHALLENGE SOURCE: first-run interview with hard pushback rules (SMART bar), strategy-seeded grounding from STRATEGY.md, explicit cadence/scheduling recommendation, read-only discipline. These discipline patterns are absent from product-dashboard-curator. ce-product-pulse also shows what a mature skill does for its "stale data" equivalent: it applies the 15-minute trailing buffer and update cadence — product-dashboard-curator has no equivalent cadence recommendation for the `reprioritise` mode. |
| In-repo design docs (product-dashboard-design.md, pm-graph-map.md, etc.) | keep (defining — used in original report) | These remain the authoritative factory sources. Not external analogues — cannot challenge the node. |

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
- bc-roadmap-discipline's `spec_pr` / `build_plan` / `notes_md_path` fields — product-specific;
  absorbed into the generic `links` field in `work-item-schema`.

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

## Challenge findings

These findings come from comparing the node against its real external analogues and published best
practice. They identify where the node is weaker than its counterparts, what it omits, and what
claims are unsupported or under-specified.

### CF-1 — The "generalises bc-roadmap-curator" claim understates the delta (HIGH)

**Finding:** The node description says it "generalises Be Civic's roadmap-curator — the prior art."
The real bc-roadmap-curator (`source-material/bc-roadmap-curator.md`) is a thin agent stub (24
lines) that defers all discipline to the handbook. The actual prior-art schema
(`source-material/bc-roadmap-discipline.md`) has fields `id / title / tier / stage / opened /
shipped / spec_pr / build_plan / notes_md_path` — **no `problem/why`, no `outcome_link`, no
`value_prop_link`, no `risk_state`, no `disposition`**. The node adds all five. The node should
accurately describe these as **additions** to the prior art (informed by Torres/SVPG) rather than
distillations of it — the claim "generalises" risks implying the prior art already contained
problem-framing and laddering, which it did not.

**Recommendation:** Amend the node body's opening sentence to distinguish what is generalised
(graduation machinery, tier, sprint-record, PR-gating) from what is added (problem-framing,
`outcome_link`, `value_prop_link`, `risk_state`, `disposition`). The latter are the node's unique
contribution; the prior art provides the structural skeleton only.

---

### CF-2 — No operator-triage / queue-view mode (MEDIUM)

**Finding:** The real sibling curator `bc-handbook-curator` has a `queue` mode (read-only print of
the open PR queue with collision detection) and an `integrate` mode (operator weekly triage walk
across all open PRs, merge in confirmed order). Product-dashboard-curator has no equivalent. In a
real harness with multiple concurrent agents opening ledger PRs, the operator has no way to see
the queue depth, collisions, or age without going to GitHub directly. bc-handbook-curator treats
this as a first-class mode; the omission is a functional gap.

**Recommendation:** Add a `queue` mode (read-only: show open ledger PRs with collision detection)
as an optional future mode, or at minimum call it out in Open questions. If the graduation
machinery is shared (same `queue-checker` + `pr-author`), the `queue` mode is likely a thin
wrapper around a queue-checker call — low cost to add. A weekly `integrate`-equivalent for the
work ledger may be lower priority (the ledger is one surface, not a multi-repo queue).

---

### CF-3 — No reprioritise cadence recommendation; stale-bet culling is under-specified (MEDIUM)

**Finding:** The node's `reprioritise` mode says "stale bets culled or re-validated" but gives no
cadence guidance. The real prior art (`bc-roadmap-discipline.md`) specifies sprint cadence
(biweekly post-launch, ≤5 medium items). Teresa Torres' continuous discovery practice specifies
refreshing the opportunity space every 3-4 customer interviews (roughly monthly). ce-product-pulse
specifies a scheduling/cadence recommendation in its Phase 1 interview and proactively offers to
set up a recurring run. The node tells the operator nothing about when to run `reprioritise`
or what signals should trigger it. Without a cadence anchor, the mode is reactive rather than
systematic — which is how backlogs accumulate.

**Recommendation:** Add a cadence note to the `reprioritise` mode body: the operator should run it
at the start of each sprint or when a customer discovery session materially shifts the evidence
base. Name the signals ("forward view has grown past N items", "oldest item hasn't had evidence
advance in X sprints") that should trigger an unscheduled cull. This is the Torres cadence pattern
applied to the work-ledger surface.

---

### CF-4 — `triage` mode lacks a pushback / quality bar (MEDIUM)

**Finding:** The `triage` mode frames the raw idea as a problem-shaped work item and surfaces
whether it is worth a work item at all. But there is no specified pushback discipline analogous to
the SMART bar in ce-product-pulse (Specific, Measurable, Actionable, Relevant, Timely applied to
each metric), the Torres pushback rule ("Is there more than one way to address this? If not, it is
a solution"), or the SVPG opportunity assessment questions ("What problem are we trying to solve?",
"Who are we trying to solve it for?", "How will we know if we succeed?"). The mode gives the
curator latitude to frame the problem, but no rule about *when to refuse* (e.g. an item that can
only be stated as a feature with no observable outcome is not ready). Without an explicit refusal
criterion, `triage` has no teeth — it becomes a transcription service rather than a quality gate.

**Recommendation:** Add an explicit triage refusal criterion to the mode body: an item that cannot
be stated as a problem/opportunity (i.e. only a feature label) or that cannot be laddered to any
objective must be returned to the operator as "not ready for a work item" rather than framed under
duress. One test from Torres applies directly: "Is there more than one way to address this? If
not, it is a solution disguised as an opportunity." This refusal rule is present implicitly in the
two invariants section but should be stated in the mode steps as an explicit stop gate.

---

### CF-5 — The sprint-record / sprint-plan mode conflates two distinct jobs (LOW-MEDIUM)

**Finding:** The real be-civic sprint model (`bc-roadmap-discipline.md`) separates the sprint file
(`sprints/YYMMDD-SNN-<name>.md`) from the item files (`items/<id>.md`). The sprint file carries
goal, items, and retro — the sprint record as a standalone document. The node's `sprint-plan` mode
assembles "a thin view beside the ledger" — but the distinction between "a view" (read-only
assembly) and "an authored sprint-record document" (write output) is not sharp. The body says
"reads the projected traversal; writes no stage" but does not specify what file or format the
sprint-record output takes. If the sprint-record is a written document (as in be-civic), it has a
home path, a naming convention, and a graduation path. If it is a rendered view with no persistent
file, it has no graduation path. The current body sits between these two, which is a seam risk.

**Recommendation:** Clarify in the `sprint-plan` mode whether the sprint-record is (a) a file
written to a harness-supplied `sprints/` path (analogous to be-civic's sprint files — graduated as
a labelled PR) or (b) an ephemeral assembled view that lives only in the current session. If (a),
the mode needs a graduation step and a harness binding for the sprint home path. If (b), it is not
a curator output at all — and the graduation step in the mode body is misleading (what is being
PRed?). The current description says "graduated via the graduation steps" which implies (a), but
"a view assembled beside the ledger" implies (b).

---

### CF-6 — No `what-belongs` equivalent gate for ledger content (LOW)

**Finding:** The real `bc-handbook-curator` has a strict `what-belongs.md` reference (linked from
the `raise` mode) that gatekeeps what may be added to the handbook. Each proposed edit is tested
against principles: "Is this inferable from context?" / "Does each line earn its token cost?" /
"Is the content canonical-and-resolved, or proposed/unresolved?" These are enforced at the mode
level — the curator refuses to author a PR that violates them. Product-dashboard-curator has no
equivalent quality-gate reference. The bundling-rules reference (`on-demand` at graduation) covers
bundling hygiene but not content quality. A work item that is not problem-framed or not laddered
is supposed to be refused, but this rule is stated as a body invariant rather than an importable
reference that can be kept current independently.

**Recommendation:** Consider a `ledger-content-rules` reference (analogous to `what-belongs.md`)
that makes the triage + add-item refusal criteria explicit, importable, and independently
maintainable. At minimum, the two invariants (problem-framed + laddered; never delete) should be
tested at each mutating mode as an explicit pre-flight step, not merely stated in the preamble.

---

### CF-7 — Torres OST discipline: sub-opportunity framing absent (LOW)

**Finding:** Teresa Torres' Opportunity Solution Tree structures opportunities hierarchically —
sub-opportunities (moments in a customer journey, pain points within a larger problem space) nest
under parent opportunities, which nest under the outcome. The node's `work-item-schema` carries a
flat ledger of items. The forward view (later/next/now) provides a temporal ordering but no
hierarchical relationship between items (e.g. "item A is a sub-opportunity of item B which serves
objective C"). In real product work, a cluster of related items that together address one large
opportunity is a common structure — and the node has no way to express or enforce it. This is not
a blocking gap for v0.1.0, but it is the main structural difference from the Torres model.

**Recommendation:** Track as an open question: should `work-item-schema` support a `parent_item`
link (an item pointing to a higher-level work item that it sub-addresses), enabling a shallow
hierarchy? This would bring the ledger closer to the OST model and make contribution rollups more
precise. Defer to v0.2.0 or the first harness that exercises the node.

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
  general, no factory decision needed. **But see CF-5: the distinction between a view and an authored
  file needs to be resolved before the `sprint-plan` mode is rendered.**
- **`queue` mode for the work ledger.** bc-handbook-curator has a `queue` mode (read-only PR queue
  view with collision detection). Should product-dashboard-curator gain a `queue` mode? The
  queue-checker is already invoked at each mode's graduation step; a `queue` mode would be a thin
  wrapper. Low cost, concrete operator value. (See CF-2.)
- **Triage refusal criterion as an importable reference.** Should the problem-framing and laddering
  invariants be extracted into a `ledger-content-rules` reference (analogous to `what-belongs.md`)
  so they can be kept current independently and loaded on demand? (See CF-6.)
- **`work-item-schema` sub-opportunity link.** Should schema v0.2.0 add a `parent_item` field
  enabling shallow OST-style hierarchy in the ledger? (See CF-7.)
