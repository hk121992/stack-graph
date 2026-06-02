---
title: Research report for strategy-curator
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended:
  - { date: 2026-06-01, note: "Experience-thread carve-out (docs/experience-thread-design.md). DROPPED the `invokes: simulate-users` edge — simulate-users is now the experience thread's *verification* node, NOT a PM/discovery evidence source. `gather-evidence`'s evidence is `explore` (desk/landscape/market) + **real discovery** (real-user evidence, scaled by maturity stage), not simulate-users. Everything else unchanged: modes (hypothesise/gather-evidence/assess/refresh-canvas); invokes explore/pr-author/queue-checker; references vpc-schema/bmc-schema/four-risks/bundling-rules/handbook; the never-delete lifecycle; the four goals. Touched: Identity, Contract, Keep/Drop (Edge only), Overlaps and seams, Edges, Conformance, Open questions." }
sources_lifted: 5
researcher_adequacy_note: |
  AMENDED 2026-06-01 for the experience-thread carve-out. No new source was lifted — the
  amendment is the removal of one `invokes` edge, grounded in docs/experience-thread-design.md
  (simulate-users is re-homed to the experience thread as a *verification* node; it is NOT a
  PM/discovery evidence source). The change: DROP `invokes: simulate-users` from
  `gather-evidence`. The curator's evidence sources are now **`explore`** (desk / landscape /
  market research, an autonomous read-only agent it invokes) **+ real discovery** — real-user
  evidence, at the rigour the product's maturity stage demands (discovery: reasoned conviction;
  validation: real user signal; scale: measured data). The four-risks discipline is unchanged
  (it still flags the riskiest value/viability assumption and aims gather-evidence there), but
  the means of clearing a value/usability risk is real discovery, not a simulated-user run.
  Everything else is preserved: the four modes, the remaining three `invokes` edges
  (explore/pr-author/queue-checker), all five `references` (vpc-schema/bmc-schema/four-risks/
  bundling-rules/handbook), the never-delete lifecycle, and the four outcome goals.
  `skill` / `collaborative` / `generative` are unchanged and still correct. The earlier open
  item — "should simulate-users be `invokes` while its file is authored in parallel" — is now
  resolved by REMOVAL (the edge is gone, not pending). Recommendation: proceed to translator —
  re-render to drop the edge and the simulate-users mentions in the body; the change is
  surgical and low-risk.
---

# Research report for strategy-curator

## Identity

**Candidate id:** strategy-curator
**Candidate title:** Strategy curator
**Scope:** The collaborative skill that maintains the **strategy canvas** — the Value
Proposition Canvas (jobs / pains / gains + value map) + the Business Model Canvas (nine
blocks) + product strategy — via the **Strategyzer evidence-first test-and-learn loop**. It
is the top of the strategy/discovery arc (Arc A). Its job: frame testable claims about the
market / users / jobs / value / model, run evidence into findings, record those findings so
every canvas item carries an explicit evidence state (and is **confirmed / killed /
superseded / pivoted — never deleted**), and graduate canvas changes through the curator
graduation machinery (a labelled PR via `pr-author`). It maintains the canvas as a workspace
**surface** (overlay-bound to the product's own canvas home), and evidence rigour scales with
the product's **maturity stage** (discovery → validation → scale).

**Excludes:** the *evidence-production* itself — desk / landscape / market research is
`explore` (invoked, not absorbed), and **real-user discovery** is the operator's real-evidence
work, scaled by maturity stage. (**`simulate-users` is NOT an evidence source for this node** —
it is the experience thread's *verification* node, re-homed there in the experience-thread
carve-out; this curator does not invoke it.) Also excludes the downstream **delivery** side
(the roadmap, gates, the product lens — Arc B, separate nodes); the **outcome layer** (OKRs /
north-star — set alongside, read by `debrief`, not owned here); and the canvas *schemas*
themselves (the VPC/BMC structure lives in `vpc-schema` / `bmc-schema` references, consulted,
not restated in the body).

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| The strategy canvas stays current and trustworthy — its claims reflect the latest evidence, and a downstream decision (a roadmap item, a product-lens review) can read it without re-verifying. | drift between the canvas and the latest findings (stale claims that a later session contradicts); share of downstream Arc-B reads that had to re-derive strategy the canvas should have held. | stale-claim rate trends down; the canvas is the trusted single source the front reads without re-checking. |
| Every canvas item carries an **explicit evidence state** — no assumed item is silently treated as confirmed, and no hypothesis is ever destructively lost. | share of canvas items with an explicit state (`assumed` / `tested` / `confirmed`) vs untagged (target: all tagged); count of hypotheses destructively edited or deleted (target: 0 — killed/superseded items are retained for audit). | every item is state-tagged; the destructive-edit count stays at zero; the audit trail survives every pivot. |
| The **riskiest** value and viability assumptions are identified and put to evidence first — discovery effort lands where the evidence is weakest, not where it is easiest. | share of evidence cycles aimed at the assumption the four-risks lens flagged weakest vs an easier one; open value/viability risks closed per cycle. | the weakest-first discipline holds (cycles target the flagged risk); open value/viability risks trend toward cleared at the maturity-appropriate rigour. |
| Canvas changes reach the canvas through **one gated path** (hypothesise → gather → assess → graduate-PR), never a bespoke side-edit. | share of canvas changes that landed via a curator-graduated PR vs edited out-of-band; duplicate/colliding canvas PRs opened (target ~0). | out-of-band canvas edits trend toward zero; the curator is the single write path to the canvas surface. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** This is the **operator-facing dispatcher** for the strategy/discovery loop —
the operator (or an agent on their behalf) invokes it with a mode and it runs that mode's
branch, pausing for the operator at the judgment points (which hypothesis to frame, whether a
finding **confirms / kills / supersedes / pivots** a claim, whether a value proposition's fit
is now evidenced). It engages the live main thread and shares state; that is the collaborative
side of the context axis, hence a **skill**. It is also a deliberate **sibling of
`handbook-curator`** (both are surface curators sharing the graduation machinery — stated in
`pm-graph-map.md`: "curators are sibling skills, not one parameterised node"), and
handbook-curator is `skill` / `collaborative`. No ambiguity: the autonomous work (doing desk /
landscape research, composing a PR body, the duplicate-check) is delegated to **agents** it
invokes (`explore`, `pr-author`, `queue-checker`), which keeps this node squarely
collaborative.

**`determinism:`** `generative`

**Rationale:** Its core work is **judgment** — reasoning about what a finding means for a
hypothesis (confirm vs kill vs supersede vs pivot), framing a testable claim, ranking which
assumption is riskiest, and phrasing a canvas amendment. None of that is a fixed
input→output transform. (`refresh-canvas` has a mechanical flavour — regenerate the canvas
view from its sources — but it is a body branch, not a separate node, and the node as a whole
is generative; mirrors handbook-curator, also generative.)

## Contract

**Input:** an operator invocation naming a **mode** (`hypothesise` / `gather-evidence` /
`assess` / `refresh-canvas`) and the relevant focus (a canvas block or value-proposition, a
hypothesis id, a finding to record). Overlay-supplied context: the **canvas home** (the
workspace surface this product maintains — bound, never hardcoded), the **maturity stage**
(discovery / validation / scale — sets the evidence bar), the graduation **repo + label**,
and the `handbook` reference (overlay-resolved to the product's canon). Loads the
`vpc-schema` / `bmc-schema` / `four-risks` references at the step of need.

**Output:**
- **`hypothesise`** — one or more **testable claims** written into the canvas as items with
  state `assumed`, each tied to specific profile/block items, with the riskiest flagged (via
  the four-risks lens).
- **`gather-evidence`** — **findings**, produced by invoking `explore` (desk / landscape /
  market research) and/or gathering **real-user discovery** evidence at the maturity-scaled
  rigour, linked back to the hypotheses they bear on, carrying an evidence state/strength.
  (Not simulate-users — that is the experience thread's verification node, not a PM evidence
  source.)
- **`assess`** — an updated canvas: each affected item moved to **confirmed / killed /
  superseded / pivoted** (never deleted — killed/superseded items retained with a status and,
  for supersede, a pointer to the successor), with the change **graduated** as a labelled PR
  (via `pr-author`, after a `queue-checker` duplicate check).
- **`refresh-canvas`** — a regenerated canvas/dashboard view from its sources (idempotent;
  reports the delta or "no change").

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/bc-bmd-CLAUDE.md` | keep | The closest BC analogue (the bmd-curator config). Keep the **evidence-first stance**, the canonical-markdown discipline, and the **post-pivot lifecycle pointer** (never destructively edit). Drop the BC codes (ES/F/H), the `build_data.py` build step, the secrets/branch specifics — product/BC-specific. |
| `source-material/bc-bmd-README.md` | keep | The fullest workflow + canvas-structure source. Keep the **hypothesise → collect-evidence → ingest → analyse loop** and the **evidence strength/type** idea (generalised to an evidence *state*). Drop the nine BC block names verbatim (they live in `bmc-schema` now), the SQLite/scripts toolchain, and the BC product framing. |
| `source-material/bc-bmd-discipline.md` | keep | The **entity model** (hypothesis / finding / evidence-session) and the **never-delete lifecycle** (`invalidated` / `superseded_by`). This is the spine of `assess`. Drop the BC ID formats and the `data/*.json` build/commit mechanics. |
| `source-material/pm-product-management-design.md` | keep | The general Arc A design — the loop, the four-risks lens, the maturity ladder governing evidence strength, the curator-maintained surfaces table. The authoritative source for *what the node is*. Drop the Arc B / outcome-layer / roadmap content (separate nodes / surfaces) and the BC-asset table (prior art, not body). |
| `source-material/pm-graph-map.md` | keep (edge-defining) | The **strategy-curator row** (primitive, modes, the exact target edge set), the curators-are-siblings note, the references load-dial table, the Arc-A-first sequencing. Every edge below traces here. Drop the rows for the other three PM nodes (separate nodes). |

## Keep / Drop

**Kept (absorbed into body):**
- The **evidence-first principle** — every canvas claim traces to a finding; an `assumed` item
  is never silently treated as true (from bmd-CLAUDE.md / vpc-schema / bmc-schema).
- The **test-and-learn loop** as four mode branches: `hypothesise` (frame testable claims) →
  `gather-evidence` (run evidence) → `assess` (record findings; confirm/kill/supersede/pivot;
  update the canvas) → `refresh-canvas` (regenerate the view). (D34: modes are body branches.)
- The **never-delete lifecycle** — killed and superseded hypotheses are **retained with a
  status** (and a successor pointer for supersede); the audit trail across pivots is the point
  (from bmd-discipline.md). This is a hard constraint, not advice.
- **The four-risks discipline** — `hypothesise` flags the riskiest value/viability assumption
  and `gather-evidence` aims there first; the lens is consulted as a prompt discipline (import).
- **Maturity-scaled rigour** — the evidence bar (`assess` accepts) scales with the product's
  maturity stage (discovery = reasoned conviction or early signal; validation = real user
  signal; scale = measured data) — a stage the node reads via binding, never assumes. (The
  earlier "discovery = simulated-users" wording is dropped: simulate-users is the experience
  thread, not this curator's evidence source.)
- **The graduation machinery, reused** — canvas changes land via a labelled PR composed by
  `pr-author`, after a `queue-checker` duplicate/collision check, exactly as handbook-curator
  graduates canon. The curator is the **single write path** to the canvas surface.
- **Overlay generalisation** — the canvas home, the maturity stage, the repo/label, and the
  `handbook` reference are all overlay-supplied; the same node serves any product's strategy
  surface (no BC literals).

**Dropped (out of scope / product-specific):**
- All BC names, paths, codes, and toolchain: `ES-/F-/H-` id formats, the BMC nine-block names
  verbatim, `build_data.py` / SQLite / `sync_bmd.py`, the CF-deploy + branch + secrets
  specifics, the BC product framing. The canonical node is general.
- The **schema content** itself — the VPC sides and the BMC nine blocks are not restated in
  the body; they live in `vpc-schema` / `bmc-schema` (consulted via `references`).
- The **outcome layer** (OKRs / north-star / KPIs), the **roadmap / gates / product lens**
  (Arc B), and the **personas surface** — adjacent nodes/surfaces, not this node.

**Edge only (separate node):**
- **Desk / landscape / market research** → `explore` (the existing read-only context agent).
  `invokes` edge, from `gather-evidence`. The curator's evidence-production agent.
- **(REMOVED) running a user simulation → `simulate-users`** — previously an `invokes` edge
  from `gather-evidence`. **Dropped in the experience-thread carve-out**: simulate-users is the
  experience thread's *verification* node, not a PM/discovery evidence source. `gather-evidence`
  now draws on `explore` + **real-user discovery** (maturity-scaled), not a simulated-user run.
  (The simulate-users node still exists; this curator simply no longer invokes it.)
- **Composing the graduation PR description** → `pr-author`. `invokes` edge, from `assess`.
- **The duplicate / collision queue check before opening a PR** → `queue-checker`. `invokes`
  edge, from `assess` (mirrors handbook-curator's `raise`).

## Overlaps and seams

- **vs `handbook-curator`** — the deliberate sibling. Both are surface curators that graduate
  changes via the same machinery (`pr-author` + `queue-checker` + the curator refs
  `what-belongs` / `pr-description-shape` / `bundling-rules`). They differ only in surface and
  modes: handbook-curator maintains canon (sweep/raise/queue/integrate); strategy-curator
  maintains the canvas (hypothesise/gather-evidence/assess/refresh-canvas). No edge between
  them — they are parallel members of the curator family, not a pipeline. (The shared
  graduation refs are a likely dependency — see Open questions.)
- **✗ `simulate-users` (NO edge — removed in the experience-thread carve-out).** The curator
  previously invoked simulate-users from `gather-evidence` for value+usability evidence. That
  edge is **dropped**: simulate-users is the experience thread's *verification* node, not a
  PM/discovery evidence source. The curator's value/usability evidence is now **real-user
  discovery** (maturity-scaled), and its landscape/market evidence is `explore`. No edge
  between strategy-curator and simulate-users in either direction. (An experience finding can
  still loop back to a strategy hypothesis — but via `debrief` routing, the same inbound
  confirm/kill flow described below, not via a direct curator→simulate-users invoke.)
- **→ `explore`** (`invokes`, from `gather-evidence`) — hands a scoped research brief,
  receives a distilled digest (desk/landscape/market evidence). The curator's evidence-
  production agent. Already exists.
- **→ `pr-author`** (`invokes`, from `assess`) — hands the settled canvas edits, receives a PR
  body string. The graduation seam (same as handbook-curator). Already exists.
- **→ `queue-checker`** (`invokes`, from `assess`) — duplicate/collision check before the PR
  opens. Already exists.
- **← `debrief`** (no edge authored here) — the loop-close: `debrief` writes outcomes back to
  **confirm / kill** strategy hypotheses. This is an inbound process flow from the dev-sprint
  debrief fleet; per the design it is described in prose and the edge is **deferred** (the
  debrief fleet's process edges into Arc A are an F7 item, like handbook-curator's session-end
  `triggers` hook).
- **Surfaces (inline / binding, not edges)** — the **canvas** home and the **maturity stage**
  are overlay-bound workspace state the node *reads* (via path-agnostic `Read`); they are
  harness bindings, not graph nodes/edges.

## Fit

**Single node — confirmed.** It owns its own branching (four modes) and sequencing (the
test-and-learn loop), and it states distinct measurable goals (canvas currency, evidence-state
coverage, riskiest-first, single graduation path). It is a sibling of an already-authored node
of the same shape (handbook-curator), which is the strongest fit signal: the curator-cell
decomposition (D40) is proven, and this is the same cell tuned to a different surface.

**Modes stay body branches (D34), not nodes.** None of the four modes earns its own separable
measurable goal that would force a split — they are stages of one loop sharing the canvas and
the graduation path. `refresh-canvas` is the most mechanical, but it is a regenerate-the-view
branch, not an independent unit. The evidence-*production* (`explore`) and the
PR-*composition* (`pr-author`, `queue-checker`) **are** their own nodes — correctly modelled as
`invokes` edges, not absorbed branches (each is autonomous, isolated, parallelizable, and
reused by other callers — the decomposition reuse/cohesion test). (simulate-users is also its
own node, but it is **not** invoked by this curator — it belongs to the experience thread.)

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| invokes | explore | `gather-evidence` runs desk / landscape / market research via the existing read-only context agent. The curator's evidence-production agent. Resolvable now. |
| invokes | pr-author | `assess` graduates settled canvas edits — invokes pr-author to compose the labelled-PR description (same graduation path as handbook-curator). Resolvable now. |
| invokes | queue-checker | `assess` checks for a duplicate/colliding open canvas PR before opening one (mirrors handbook-curator's `raise` step). The scope_hint flagged this as a "consider"; confirmed IN — graduation needs the same duplicate gate. Resolvable now. |
| references | vpc-schema (`load: on-demand`) | The Value Proposition Canvas structure (jobs/pains/gains + value map + fit). Larger, consulted within `hypothesise` / `assess` — on-demand, not every invocation. Resolvable now. |
| references | bmc-schema (`load: on-demand`) | The Business Model Canvas nine blocks. Larger, consulted when working a model block — on-demand. Resolvable now. |
| references | four-risks (`load: import`) | The discovery lens (value / usability / feasibility / viability). Short, must always be present so every hypothesise/assess pass applies it — `import` (per the design map's load-dial table). Resolvable now. |
| references | handbook (`load: on-demand`, `external: true`) | The product's curated canon — the curator navigates the product's own handbook/decisions at the step of need; overlay-resolved, factory ships only the pointer. Same external reference handbook-curator and explore carry. (No factory file — validation/build skip it.) |

**Removed (experience-thread carve-out):** `invokes: simulate-users` — simulate-users is the
experience thread's verification node, not a PM evidence source; the curator's evidence is
`explore` + real discovery (see *Edge only* and *Overlaps and seams*). After the amendment the
`invokes` set is exactly `explore` / `pr-author` / `queue-checker`.

**Omitted deliberately:** `composes-into` — strategy-curator is the **top of the
strategy/discovery arc (Arc A)** and no parent arc node exists yet (F7); per the scope_hint,
omit it for now (handbook-curator likewise carries no `composes-into` for the same reason —
it is its own maintenance cell). `precedes` / `can-follow` into the debrief loop are deferred
to prose (the inbound confirm/kill flow), matching the established pattern.

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — agrees (skills engage the
operator; this is the operator-facing dispatcher). Matches the sibling handbook-curator.

**`goals:` as outcomes:** all four read as outcomes (canvas stays current/trustworthy; every
item carries an explicit evidence state with zero destructive loss; the riskiest assumptions
are tested first; changes land via one gated path), each with a metric and an earns-keep
threshold. None are activities. None had to be reframed under protest — the "explicit evidence
state / never delete" goal is the one to watch the translator keeps as an *outcome* (the
canvas is trustworthy) rather than letting it slide to an activity ("tags items").

**Edge targets resolvable:** after the amendment the `invokes` set is `explore` / `pr-author` /
`queue-checker` — all present as node files (verified). `vpc-schema`, `bmc-schema`,
`four-risks`, `bundling-rules` — present as references in `graph/_refs/` (verified on disk).
`handbook` — `external: true`, correctly absent from the factory (harness-supplied). The
`simulate-users` edge is **removed**, so the earlier forward-reference concern no longer
applies (there is nothing to resolve).

## Open questions

- **`simulate-users` edge — RESOLVED by removal (experience-thread carve-out).** The
  `invokes: simulate-users` edge was dropped: simulate-users is the experience thread's
  verification node, not a PM/discovery evidence source. The curator's evidence is `explore` +
  real-user discovery. No forward reference remains; `index` + `validate` have nothing to
  resolve for it. (Superseded — kept here as the audit trail of the change.)
- **Shared graduation references (`what-belongs` / `pr-description-shape` / `bundling-rules`).**
  handbook-curator carries these three as `references` (on-demand) because *it* applies the
  gates in `raise`. strategy-curator graduates the *same way* via `pr-author` (which itself
  references `pr-description-shape` + `what-belongs`). Question for the translator: does
  strategy-curator's `assess` apply the **bundling** / **what-belongs** gates *itself* (and so
  carry those refs too), or does it lean entirely on `pr-author` for the description-shape and
  only itself enforce bundling? Recommendation: carry **`bundling-rules`** (on-demand) at
  minimum, since the curator decides what to bundle into one canvas PR before it calls
  pr-author; leave `what-belongs` / `pr-description-shape` to pr-author. Flagged rather than
  hardcoded — the scope_hint's target reference set did not list them, so the translator/
  operator should confirm.
- **`refresh-canvas` mechanics.** Whether the canvas/dashboard is regenerated by a small
  script the node invokes (an `invokes` edge to a `script` node) or by the node reading sources
  and rewriting the view inline. BC used a `build_data.py` script; the general node should not
  assume a build step. Recommendation: keep it **inline** in the body for now (the node reads
  the canvas sources and regenerates the view), and let a harness that wants a build script add
  it via overlay — do not author a factory script node yet. Translator to confirm.
- **The "canvas" as one surface vs VPC + BMC + strategy as three.** The design treats the
  strategy/canvas as a single surface holding VPC + BMC + strategy/positioning. Confirm the
  node maintains them as **one** surface (one graduation path) rather than splitting per
  sub-canvas. Recommendation: one surface (matches the design's surfaces table and the BC bmd
  instance); the sub-structure is the schema references' concern, not separate nodes.
