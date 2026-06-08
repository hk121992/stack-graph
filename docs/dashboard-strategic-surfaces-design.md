---
title: Dashboard strategic surfaces — design (the throughline)
status: design — APPROVED to build (T1/T2=B/T3 all decided 2026-06-06)
supersedes: none — extends docs/product-dashboard-design.md (D49)
---

# Dashboard strategic surfaces — design

The product-dashboard's strategic surfaces — **Vision & strategy** and **Progress** — currently render as
thin static-doc pages that do not cohere into a product *direction*. This design reworks them, plus the
**live links** that thread the whole surface into one coherent throughline, while keeping the factory
renderer general and resolving the strategy↔canvas redundancy.

It is an **amendment to `docs/product-dashboard-design.md` (D49)**, not a replacement: D49's four-question
frame, record-primary stance, one-carrier/three-projections rule, and three-analytics-namespace rule all
stand. This doc fills the gap D49 left open under §7 ("Rendering — how the four surfaces and the
contribution view render for the operator") and corrects a binding drift that produced the redundancy.

## Spec touchpoints

| Spec doc | Section | Relationship | Core / PM-pack |
|---|---|---|---|
| `01-concepts` | The outcome layer; the loop (discovery→delivery); carriers & gates | The throughline *is* the outcome layer made navigable: vision → bets → objectives → work → record. No new concept — a rendering of the existing model | Core |
| `docs/product-dashboard-design.md` | §3 Vision & strategy; §4 Progress; §6 Relationships; §7 open "Rendering" | Resolves the open "Rendering" question; reaffirms §3's `strategy.md = vision narrative` (not a BMC recreation); makes §4 Progress live | PM-pack |
| `graph/_refs/okr-schema.md` | Vision apex; objective fields; `key_results{metric,target,current}` | Vision-statement ownership clarified (apex lives here, once); progress bars read `key_results`; **optional** `strategy_link` proposed | PM-pack |
| `graph/_refs/work-item-schema.md` | `outcome_link`, `value_prop_link`, `risk_state` | No new field; clarifies `value_prop_link` MAY resolve to a canvas entry id; reverse-indexes rendered from these | PM-pack |
| `graph/_refs/bindings-contract.md` | `strategy-doc`, `objectives-doc`, `canvas-root` | `strategy-doc` re-scoped to the authored vision narrative; dashboard reads `canvas-root`/`canvas.json` for the bets rollup (no new key) | Harness |
| `03-plugin-spec` / `04-harness-spec` | Renderer capability; bound surfaces | New dashboard rendering capability documented as general; coordinated with the canvas-redesign chip (shared `canvas.json` contract) | Harness |

---

## 1. Diagnosis — why the surfaces are thin, and the redundancy's root cause

Three separate problems, one root cause.

**1a. Thin renders.** `build-dashboard.ts` renders `progress` and `strategy` largely as
`renderMarkdown(doc.body)` — a straight markdown→HTML pass. *(Accuracy note, eng M1: `renderProgressPage`
already has an `outcome_link` contribution rollup and an input-gated analytics block — so Progress is
"replace the markdown-dump body + a structured OKR-cascade parse + fix the existing rollup," not greenfield;
the `strategy` page is `strategy.md` and nothing else.)* Neither processes the *structure* the underlying
schemas carry (`key_results{metric,target,current}`, the OKR cascade, evidence state **and strength**). They
are documents, not surfaces.

**1b. The strategy↔canvas redundancy — root cause: a binding drift.** D49 / product-dashboard-design §3
*always* specified `strategy.md` as a **vision narrative** (vision · guiding policy · JTBD · north-star ·
open questions · decided/not-doing — the CE `STRATEGY.md` shape). But the be-civic harness's §17
course-correction bound `strategy-doc` to a **bmd-regenerated 173-hypothesis inventory** — the BMC/VPC
corpus rendered as prose. That is *exactly* the content the dedicated **canvas** surface renders as a grid.
So the dashboard "strategy" page and the canvas show the same bets, one as prose, one as a grid. The
redundancy is not a design flaw in D49; it is the harness binding having drifted from D49's own intent. The
fix is to **return `strategy-doc` to its specified role** and let the canvas own the bets.

**1c. No throughline.** Vision (objectives.md apex), bets (canvas/bmd), objectives (objectives.md),
work-items (ledger), and record (ledger) are five disconnected views. The authored links to connect them
*mostly already exist* in the schemas (§4) but are never *rendered* as navigable links. Nothing answers, at
a glance, "does this product have a coherent direction?"

---

## 2. The throughline — the spine of the redesign

The methodology the graph bakes in (Cagan/SVPG outcomes-over-output + empowered discovery; Osterwalder
evidence-based bets + the four risks; Blank validated learning) implies one spine the dashboard must make
navigable in both directions:

```
   WHY              WHAT BETS                 WHAT OUTCOMES            WHAT WE BUILD        WHAT WE SHIPPED
   vision   ──────► strategy / BMC+VPC ─────► objectives / OKRs ─────► work-ledger ───────► record + debriefs
            (the      bets by evidence         + north-star             (forward + in-       (shipped/live/
            apex)     (the canvas)             (the cascade)             flight)              parked/killed)

   ◄─────────────────────────────────────── traceability runs both ways ───────────────────────────────────►
   a bet → its evidence        an objective → the work advancing it        a work-item → its objective → bet
```

**The design principle: render the links, don't invent new stores.** The throughline is *almost entirely
expressible from authored fields that already exist* (§4). The redesign's job is to (a) render those fields
as live, navigable cross-links and rolled-up summaries, (b) compute the reverse indexes (objective→work,
bet→work) the schemas don't store but can be derived, and (c) add at most one small optional link to close
the one genuine gap (objective→bet). This honours D38 (authored-not-inferred): we render *authored* forward
links and *deterministic* reverse indexes of them — never fuzzy inference.

---

## 3. The surfaces

The product-dashboard stays one navigable space. The redesign reworks two pages, adds one, and threads
cross-links through all of them. Page IA (the routing taste decision is §8-T2):

| Slug | Page | Status |
|---|---|---|
| `""` | **Direction** — the throughline at a glance (the home) | **new** (T2=B: Direction-as-home) |
| `ledger` | Work ledger (Kanban + record) | **moved** from slug `""` → `/ledger` |
| `progress` | **Progress** — live OKR cascade + contribution | **reworked** |
| `strategy` | **Vision & strategy** — the Product Strategy thesis + linkage + bets rollup | **reworked** |
| `item/<id>` | Work-item detail | **enhanced** (cross-links) |

*Routing note (T2 = B, operator-decided 2026-06-06):* **Direction is the home** (slug `""`); the work-ledger
moves to `/ledger`. The dashboard leads with "is the product moving coherently?" — matching the T1 framing
that the Strategy thesis governs all decisions. One-time eng cost (handled in Phase 3): re-path the item→
objective / objective→work cross-links that are currently built relative to the ledger being root, and update
the surface `pages` list + nav.

### 3.1 Direction (the overview page + the ledger strip)

The answer to "does this product have coherent direction?" It is the **live check against the Product
Strategy thesis (§3.2)**: the thesis states the *intended* direction; this overview shows whether vision,
bets, objectives, work, and record actually cohere with it. Rendered as a **Direction** nav page (and
condensed into the direction strip atop the ledger). **Grouped into two labelled zones** so the discovery
posture is structurally co-equal with delivery, not outnumbered (design-review #4): a **Direction zone**
(vision · bets posture · objectives-as-bets-tested) above a **Delivery zone** (in-flight · recently shipped).
Each band is a compressed view of one surface, linking through to it:

1. **Vision** — the apex statement (from `objectives.md` vision, §4) + horizon. One line, durable.
2. **Bets posture** — *rolled up* from `canvas.json`, on **two distinct axes that must not be conflated**
   (council finding #1, the headline correction):
   - **Lifecycle state** — counts by `assumed / tested / confirmed / killed / superseded` (the
     hypothesis-lifecycle the canvas carries). This is *not* the evidence ladder.
   - **Evidence strength** — for tested/confirmed bets, the strength-rung distribution
     `weak / moderate / strong` = *synthetic / said-yes / did-yes* (per `four-risks` v0.2.0). A bet
     `confirmed` on **weak** evidence must never render the same as one confirmed on **observed
     behaviour** — surfacing strength alongside state is what stops the silent upgrade the dial-seam
     forbids.
   Plus, for the **four-risks coverage** glance: **value + viability** from `canvas.json`, **usability +
   feasibility** from the work-items' `risk_state` aggregate (the four-risks bridge splits across two
   surfaces — never present two canvas-derived risks as four, council finding #2), each shown with both
   its strength rung and the maturity bar. Plus a **demand-tested signal** (did-yes present / said-yes
   only / untested) so "demand never tested" never hides behind "awaiting trend data" (council finding
   #5; due at first-users maturity). Links to the canvas. **Reads `canvas.json` via the optional
   `renderer.canvas-root` binding; degrades gracefully (narrative + objectives only) when the canvas is
   not bound; never recreates the grid.**
3. **Objectives** — each objective with its key-result progress (current/target bars) and a count of the
   work advancing it. Links to Progress.
4. **In-flight** — what's building now (the `building` column, projected stage shown when fresh).
5. **Recently shipped & learned** — the last N record entries with their `outcome_link` and a debrief
   pointer. Links to the record.

This is the only genuinely *new* surface; everything in it is a rollup of data the other surfaces own, so it
introduces no new source of truth (consistent with D49's "assembled from multiple sources, a rendered
surface").

### 3.2 Vision & strategy — the Product Strategy thesis (reworked — the redundancy resolution)

**Operator framing (T1, decided):** this surface is the **Product Strategy thesis — the guiding document for
all product decisions**, the canonical reference that keeps the product moving in a *coherent direction*. It
is not a vision restatement and *not* the bmd inventory; it is the authored argument everything else ladders
to and is checked against. `strategy-doc` returns to (and is elevated within) its D49 §3 role. The page
renders, as structure (not a raw markdown dump):

- **Vision** — the long-term concept (composed from the `objectives.md` apex, §4, to avoid duplicating it).
- **The strategy thesis (the kernel)** — Rumelt's diagnosis → guiding policy → coherent action: *the bet on
  leverage* the product is making. This is the heart of the document — the test every objective, bet, and
  work-item is held against ("does this serve the thesis?").
- **Who & the job** — target users + JTBD (the personas the experience thread builds on).
- **Open questions / Decided · not-doing** — what discovery is chasing; explicit non-goals that keep the
  forward view coherent.
- **Bets — evidence rollup → the canvas.** A compact summary of the BMC/VPC bets on the two axes of §3.1
  band 2 (lifecycle state *and* evidence-strength rung) plus the split four-risks coverage, computed from
  `canvas.json`, with a prominent link to the canvas for the full grid. This is the linkage the canvas does
  **not** provide: strategy↔outcome↔work. The strategy page says *"here is our evidence posture; explore the
  bets on the canvas; here is how they ladder to our objectives and the work testing them."* **Riskiest-open
  ranking is conditional:** a true riskiest-first ordering (Strategyzer's *important-and-unevidenced* first)
  needs an **importance** signal *and* the **evidence-strength** rung to survive into `canvas.json` (§5,
  council finding #3); when those fields are present the rollup ranks; when absent it shows "open bets by
  state" and does not assert a riskiness order it cannot compute. It never re-renders the grid.

**Division of labour, settled:** the **canvas** owns *bets-by-evidence* (the grid, drill-down, per-block
theses — the separate canvas-redesign chip); the **strategy page** owns *the vision narrative + the linkage
from strategy to objectives and work + a rollup pointer into the canvas*. No overlap.

### 3.3 Progress (reworked — made live)

`objectives.md` rendered as a live OKR cascade, not a doc dump:

- **Vision apex** at the top (the single source, §4) — all objectives ladder to it.
- **Each objective** — statement; `key_results[]` as progress bars (`current` against `target`, per metric);
  `north_star_link`; `maturity_note`. *(Optional, §8-T3: the bet/block this objective tests, via
  `strategy_link`.)*
- **Contribution view (live)** — under each objective, the work advancing it: the reverse index of
  `outcome_link`, listing work-items with their lifecycle/projected stage, linking to each item. This is "an
  objective → the work advancing it," computed deterministically.
- **North-star + KPIs** — shown now if real signal exists; otherwise **input-gated**, honestly labelled
  ("awaiting first-user signal — targets and operator read shown; trend lights up when data lands"). Per
  D49's three-namespace rule, this is the **product-outcomes** stream only — never pooled with factory
  conformance or carrier projection.

### 3.4 Work-item detail (enhanced — the cross-links)

Each item already renders its fields; the redesign makes the links *navigable*:

- **→ its objective** (`outcome_link`) → which ladders to the vision.
- **→ the bet/VPC element it tests** (`value_prop_link`; in be-civic this already resolves to a canvas entry
  id, e.g. `H-CP-03`) → links into the canvas entry, showing the bet's evidence state.
- **→ its four-risks posture** (`risk_state`) rendered as the strength × maturity-bar grid.
- **→ its debrief / record** (`links.debrief`, `frozen_timeline`) when shipped.

### 3.5 Visual design & legibility — the rendering primitives (design-review)

The data model is right; the design-review's headline is that *what it looks like* must be pinned before
build, or density becomes clutter and honesty loses to green. The decisions:

- **One bets-posture primitive (design-review #1).** A single horizontal **stacked evidence bar** per
  posture: segment *colour* = lifecycle state; segment *opacity/saturation* = strength rung
  (confirmed-on-weak renders **pale**, confirmed-on-strong **solid**) — so the silent upgrade is *visually
  impossible*, satisfying council #1 structurally rather than in a footnote. Demand-tested = one badge above
  the bar (did-yes filled / said-yes ring / untested hollow). Four-risks coverage = a tiny 4-cell strip
  reusing the **existing `risk-pill` LED treatment** in `build-dashboard.ts`. One compact component, ~a
  screen-inch, glanceable — *not* a stack of count tables.
- **Honesty ≥ green (design-review #2).** Explicit hierarchy rule: the bets-posture bar gets **more weight**
  than objective progress bars (order ≠ weight); desaturate progress bars relative to the posture. The
  surface must read "are we de-risking?", not only "are we shipping?".
- **The spine breadcrumb (design-review #5).** A persistent thin stepper `vision ▸ bets ▸ objectives ▸ work
  ▸ record` atop every strategic surface, current location highlighted — turns "live links" into a navigable
  throughline and teaches the model. Shared, brand-neutral, cheap.
- **Drawer-vs-link rule (design-review #6).** Drawer = *peek within the same surface* (objective→its work
  items, item→IU — data already in the dashboard build). Link = *jump to another surface*: bet→canvas-entry
  **navigates** to `/canvas/#<entry>` (the canvas owns that data; duplicating its sidecar into the dashboard
  would violate the §3.2 division of labour). Reuses the existing `popout.js` only for same-surface peeks.
- **Demand-untested ≠ input-gated, by colour register (design-review #7, council #5).** Input-gated trend =
  neutral/grey "waiting" (matches the existing `progress-gated` convention — nobody's fault, data absent).
  Demand-never-tested = **amber actionable warning** (the existing stale-banner register) — it *is* a
  surfaceable gap. Different register = different meaning.
- **Designed degraded state (design-review #10).** When the canvas is unbound, band 2 renders a one-line
  "bets posture: canvas not bound" placeholder (consistent with the provenance-banner honesty convention) —
  never silently vanishes (which would falsely read as "no bets").

---

## 4. The data — what is authored, derived, and (maybe) added

The throughline runs almost entirely on **existing authored fields**. The table is the contract.

| Link in the throughline | Source | Status |
|---|---|---|
| work-item → objective | `work-item.outcome_link` → `objectives.md` objective id | **exists** (authored, required) |
| objective → vision | all objectives ladder to the single `okr-schema` vision apex | **exists** (authored) |
| work-item → bet/VPC element | `work-item.value_prop_link` → VPC/canvas entry id | **exists** (authored, optional) |
| work-item → four-risks | `work-item.risk_state` (strength × maturity) | **exists** (authored) |
| bet → its evidence (state) | `canvas.json` entry `evidence` lifecycle state + `refs` | **exists** (on canvas) |
| bet → its evidence (strength) | `canvas.json` entry strength rung (weak/moderate/strong) | **NEW field — absent today** (eng H1; the adapter already computes the `direct`/`interpreted` = did/said-yes signal but *discards* it — Phase 0.5 derives it) |
| bet → its importance | `canvas.json` entry importance/criticality (for riskiest-first) | **exists but un-normalised** — be-civic carries free-text ("critical now"); needs a generic ranked enum (eng H1) |
| objective → work advancing it | **reverse index** of `outcome_link` | **derived** (render-time, deterministic) |
| bet → work testing it | **reverse index** of `value_prop_link` | **derived** (render-time, deterministic) |
| bets posture rollup (state axis + strength axis) | aggregate over `canvas.json` entries | **derived** (render-time) |
| four-risks coverage (value/viability) | aggregate over `canvas.json` entries | **derived** (render-time) |
| four-risks coverage (usability/feasibility) | aggregate over work-items' `risk_state` | **derived** (render-time, council #2) |
| **objective → the bet it tests** | *no field today* | **gap** — see §8-T3 (`strategy_link`); council recommends add-now |

**Two schema clarifications (no structural change):**
- `okr-schema`: the **vision statement is owned by the apex here, once.** `strategy.md` carries the rest of
  the kernel (guiding policy, JTBD, open questions, decided) and the renderer composes the two. This removes
  a latent duplication (vision currently implied in both `strategy.md` §3 and `objectives.md`).
- `work-item-schema`: document that `value_prop_link` **may** resolve to a canvas entry id (a BMC/VPC
  hypothesis), which is how "work-item → bet" is expressed without a new field. (be-civic already does this.)

**One optional schema addition (the only genuine gap), surfaced as a taste decision (§8-T3):** an optional
`strategy_link` on an objective, pointing to the canvas bet/block it tests. Closes "an objective → the bet
it tests," completing the bidirectional spine. Optional and authored — absent ⇒ the renderer omits that one
link; nothing else depends on it. **The council recommends adding it now** (both Cagan and Blank), on two
grounds beyond symmetry: (a) it *is* the methodology's core claim — objectives exist to advance *validated*
bets (Cagan `objectives-okrs`); (b) **pivot legibility** — without it, a *killed* bet cannot surface
*upward* to the objective it undercut, so a demand-premise failure (Blank's pivot signal) has no home on the
spine (Blank `pivot`). Deferring it is still defensible at 2 objectives, but the bar is high because it is
the one seam the methodology most depends on.

**Evidence-model fields the rollup needs from `canvas.json` (council #1/#3):** the rollup's honesty depends
on `canvas.json` carrying, per entry, both the lifecycle `evidence` state **and** the evidence-strength rung
(weak/moderate/strong), and — for riskiest-first ranking — an importance/criticality signal. These already
exist conceptually in `vpc-schema`/`bmc-schema`/`four-risks`; §5 makes their presence in `canvas.json` an
explicit shared-contract requirement coordinated with the canvas chip.

---

## 5. Coordination with the canvas-redesign chip

The "Redesign BMC canvas: summary + drill-down" chip and this design share exactly one contract:
`canvas.json`. They are designed to **not overlap and not hard-couple**:

- The canvas chip enriches `canvas.json` with per-block **theses** and summary-cell rollups, and owns the
  *grid + drill-down*.
- This design's strategy-page and overview-page **bets rollup** reads, per `canvas.json` entry: the
  lifecycle **evidence state** (assumed/tested/confirmed/killed/superseded — already stable); the
  **evidence-strength rung** (weak/moderate/strong — council #1, must be present so "confirmed" can't mask
  weak evidence); and an **importance/criticality** signal (council #3, for riskiest-first ranking). The
  first exists today; the latter two are the **shared-contract requirement this design adds** — they exist
  in `vpc-schema`/`bmc-schema`/`four-risks` and in be-civic's `bmd/` corpus, so the canvas adapter
  (`refresh-canvas.ts`) must carry them into `canvas.json`. The dashboard does **not** hard-depend on the
  chip's *thesis* work; it degrades (state-axis only, no strength split, no ranking) if strength/importance
  are absent, and degrades fully (narrative + objectives only) if `canvas.json` is unbound.
- **Recommendation:** settle the `canvas.json` schema (state + strength + importance fields) *jointly* with
  the canvas chip before either rollup reader is built, so both surfaces read one agreed shape. The
  earlyvangelist **source-disposition** signal (Blank, medium — did-yes from a qualified buyer vs an
  unqualified read) is a candidate field for this same evidence model; flagged as a **first-users-maturity
  question for the canvas chip to own**, not built into the dashboard renderer now (§9).

---

## 6. Generality & no-drift compliance (the factory constraint)

- **`build-dashboard.ts` stays product-agnostic.** Every new render reads bound surfaces — `strategy-doc`,
  `objectives-doc`, `items-root`/`manifest-path`, and the canvas via the **optional `renderer.canvas-root`
  sub-key** (council factual flag: `canvas-root` is *not* a first-class required binding — it lives under the
  optional `renderer` block, line 49 of the contract). So the bets rollup is an **enhancement that lights up
  when the canvas is bound** and degrades gracefully otherwise — it never becomes a required dependency, and
  no new required binding key is introduced. No be-civic term, path, H-code grammar, or block code enters the
  renderer; the rollup is computed from generic evidence-state/strength enums, not be-civic's H-code scheme.
- **No-drift discipline.** New surfaces call `renderSurfacePage(opts)` (never `renderShell` directly);
  surface-specific CSS goes in the `extraHead` inline `<style>`; brand tokens are read via `var(--token)`,
  never re-declared. Cross-link/drawer behaviour reuses the shared `popout.js` + `.popout` DOM. Reverse-index
  computation and the rollup component are shared renderer logic, brand-neutral.
- **Additive overlay preserved.** No vendored node is mutated. The harness change is content/binding only
  (be-civic's `strategy.md` reverts from the bmd inventory to an authored narrative; `strategy-doc` keeps
  pointing at `strategy.md`). The bmd corpus is **not orphaned** — it remains the canvas source (satisfying
  §17's concern by a cleaner division, not by duplicating it into prose).
- **Held binding respected.** The work-ledger↔roadmap binding (Stage-5, deliberately held) is untouched;
  this design adds no dependency on it.
- **Canvas free-text is untrusted-ish input (eng M6).** The rollup surfaces only counts, enum-derived chrome,
  and **`esc()`'d short labels** — it must **never** `renderMarkdown` over a canvas entry's free-text `detail`.
  This keeps the (deferred) markdown-HTML sanitizer off the critical path and matches the renderer's existing
  `esc()` discipline. Hostile fixture: a canvas entry with `<script>`/markdown in `text`.

---

## 7. Spec amendments (proposal — attach to reviews alongside this doc)

Concrete, minimal:

1. **`docs/product-dashboard-design.md`** — fill the §7 open "Rendering" item with §3 of this doc (the four
   rendered surfaces + Direction overview + the cross-link contract). Reaffirm §3's `strategy.md = vision
   narrative`; add a note that a harness must **not** bind `strategy-doc` to a canvas/bmd inventory (the
   anti-redundancy rule).
2. **`graph/_refs/okr-schema.md`** — state that the **vision statement is owned by the apex** (single
   source); the dashboard composes it with the `strategy.md` kernel. *(If §8-T3 = yes:)* add the optional
   `strategy_link` field on an objective, pinned to a **canvas entry id** (resolvable, symmetric with
   `value_prop_link`), not a block code (eng L1).
3. **`graph/_refs/work-item-schema.md`** — document that `value_prop_link` may resolve to a canvas entry id
   (the work-item→bet expression).
4. **`graph/_refs/bindings-contract.md`** — clarify `strategy-doc` binds the **authored vision narrative**
   (not a canvas/bmd inventory); the dashboard reads the canvas via the **optional `renderer.canvas-root`
   sub-key** for the bets rollup and **must degrade gracefully when it is absent** (no new required key).
5. **`graph/_refs/four-risks.md` + the `canvas.json` contract** — affirm the **two-axis** rule (lifecycle
   state vs evidence-strength rung) the rollup must honour; name evidence-strength + importance as fields the
   canvas adapter carries into `canvas.json` (council #1/#3). Coordinate with the canvas chip.
6. **`03-plugin-spec` / `04-harness-spec`** — document the new dashboard rendering capability as general and
   the shared `canvas.json` read; coordinate wording with the canvas chip's amendments.
7. **`01-concepts`** — light touch only if the loop diagram benefits from naming the throughline; likely no
   change (the throughline is a rendering, not a new concept).

---

## 8. Build plan

Phased; each phase independently verifiable. Factory-first, harness-content second, verify last.

**Phase 0 — Spec amendments + reconciliation (no code).**
Land the §7 amendments as the design contract. Resolve §8 taste decisions with the operator first.

**Phase 0.5 — `canvas.json` evidence-model contract (joint with the canvas chip).**
- Settle the per-entry shape: lifecycle `evidence` state (exists) + evidence-strength rung
  (weak/moderate/strong) + importance/criticality (council #1/#3). Extend be-civic's `refresh-canvas.ts`
  adapter to carry strength + importance from `bmd/` into `canvas.json`. This gates the honest rollup.

**Phase 1 — Factory renderer: live Progress + cross-links (`build-dashboard.ts`). Genuinely parallel (no
canvas dependency).**
- **Prerequisite (eng H2):** parse objectives *structurally* and emit headings keyed on the authored
  objective **id** (`<h_ id="${esc(objective.id)}">`). The current `#${outcome_link}` contribution links
  **silently dangle in be-civic today** because `gfm-heading-id` slugs the full heading text, not the id.
  The id-keyed anchor is the prerequisite that makes every reverse-index/contribution link resolve.
- Rework `renderProgressPage` (replace+fix per eng M1): vision apex; per-objective key-result progress bars;
  **keep and fix** the existing `outcome_link` contribution rollup against id anchors; reuse the existing
  input-gated pattern for the north-star/KPI block.
- Enhance `item/<id>`: navigable cross-links (→ objective → vision; → canvas entry by **navigation**, design
  #6; risk_state grid; → debrief).
- Shared helpers: **single-pass** reverse-index builder (bucket by `outcome_link` and `value_prop_link` in
  one O(N) pass, eng M4); progress-bar + risk_state-grid + spine-breadcrumb components. Brand-neutral.

**Phase 2 — Factory renderer: Vision & strategy rework + bets rollup. Gated behind Phase 0.5.**
- Rework `renderStrategyPage`: structured vision narrative (compose vision apex + `strategy.md` kernel);
  who/JTBD; open-questions/decided; the **two-axis bets rollup** (state **and** strength rung, rendered as
  the single evidence-bar primitive §3.5) + **split four-risks coverage** (value/viability from
  `canvas.json`; usability/feasibility from work-item `risk_state`) + the **demand-tested signal**.
  Riskiest-first ranking only when importance+strength are present (else "open bets by state"). Build the
  page TOC from the known section headings, **not** `extractToc` over a now-mixed body (eng L4).
- **New plumbing (eng H3):** `build-dashboard.ts` has no canvas reader today and `build.sh` does not pass
  `canvas-root` to it. Add a `--canvas-root`/`CANVAS_ROOT` resolver to `build-dashboard.ts` (mirroring
  `resolveProjectionPath`) **and** wire `build.sh` to pass `${CANVAS_ROOT:+--canvas-root …}` to the
  dashboard step. The reader + rollup-aggregator is a **single shared helper, gated strictly behind 0.5**
  (eng M5), tolerant of the chip's enriched shape, and **graceful when the key/file is absent**.

**Phase 3 — Factory renderer: the Direction overview as home (T2=B). Consumes the Phase 2 shared helper.**
- New **Direction** page at slug `""` (the throughline bands in two labelled zones, §3.1, §3.5), each linking
  to its surface. Move the work-ledger to slug `ledger`. Update the surface `pages` list, the nav, and
  **re-path the relative cross-links** that assumed the ledger was root (item→objective, objective→work) so
  they resolve from the new page depths. Hostile-fixture every cross-link after the re-route.

**Phase 4 — Harness content (be-civic, in the content pack).**
- Rewrite be-civic's `strategy.md` from the bmd inventory to an authored vision narrative (vision apex stays
  in `objectives.md`; `strategy.md` = guiding policy + JTBD + open questions + decided). Keep `strategy-doc`
  pointing at `strategy.md`.
- Confirm the canvas is readable by the dashboard build via `renderer.canvas-root` (be-civic binds
  `canvas-root: bc-workspace/dashboard`).
- *(If §8-T3 = yes — council-recommended:)* add `strategy_link` to be-civic's two objectives.

**Phase 5 — Verify (throwaway rehearsal) + reconcile.**
- Build the rehearsal via `bc-workspace/scripts/build-workspace.sh` into the throwaway workdir; **do not
  deploy.** Visually verify the throughline coheres (overview → strategy → progress → item → record cross-
  links resolve; bets rollup matches the canvas; no thin-doc pages remain; redundancy gone).
- Run `/codex review` on the renderer diff; hostile-fixture (eng M3/M6) the new logic — **dangling links**
  (`outcome_link`→missing objective, `value_prop_link`/`strategy_link`→missing canvas entry: render a visible
  "unresolved" affordance, never a broken `<a>`, never crash, never fabricate a target); **objective with zero
  contributors**; **objective id ≠ heading slug** (the H2 case); missing/empty/unbound `canvas.json`; stale
  projection; canvas `text` with `<script>`/markup (must be `esc()`'d). No validator exists for these
  artefacts (eng M2), so degradation is render-time-only — it must be robust.
- Reconcile: log the decision in `docs/decisions.md`; update the spec docs amended in Phase 0 if the build
  revealed drift.

**Parallelism (corrected, eng M5):** **Phase 1** (Progress + cross-links + item detail) has **no canvas
dependency** and is genuinely parallel — start immediately. **Phases 2 and 3** both depend on **Phase 0.5**
(the `canvas.json` evidence-model shape) and share one canvas-reader + rollup helper — build that helper once,
strictly gated behind 0.5, and have 2/3 consume it. **Phase 4** (harness content) depends only on the binding
decisions in Phase 0, not on the renderer. **Phase 5** gates everything.

---

## 9. Anti-deferral ledger (honest laters)

- **Built now (buildable + needed):** the Direction overview; live Progress (OKR cascade + contribution
  view + progress bars); the reworked Vision & strategy (narrative + linkage + **two-axis bets rollup** +
  split four-risks coverage + demand-tested signal); the work-item cross-links; the redundancy resolution;
  the `objective→bet` link (§8-T3, council-recommended). All buildable from existing authored fields + the
  `canvas.json` strength/importance fields (which exist in `bmd/` — a render-time read, not new data) +
  render-time derived indexes.
- **Input-gated (data doesn't exist yet):** the north-star/KPI **trend** layer of Progress — needs
  first-user behavioural signal. Shown as targets + operator read now; trends light up when data lands.
  Crucially, **kept distinct from the demand-tested signal** (council #5): "no trend data yet" (input-gated)
  must not render the same as "demand never tested" (a real, surfaceable gap at first-users maturity).
- **Not-yet-needed at this maturity (named, not deferred-in-disguise):** the earlyvangelist **source-
  disposition** field (Blank — was the confirming evidence a qualified buyer?) — a candidate for the canvas
  chip's evidence model, not the dashboard renderer, revisited as work accrues; typed `evidence_refs`
  resolving to a findings schema; the debrief→strategy hypothesis **write-back edge** (P16 — the throughline
  makes the feedback-close *visible*, but the automated write-back stays deferred; named here so it is not
  assumed closed); market-type qualifiers on the coverage view (manifest O9 — scale-stage). None serves a
  current outcome at be-civic's first-users maturity (2 objectives, ~1 work-item); add as counts grow.

---

## 10. Taste decisions — operator resolutions

- **T1 — Strategy↔canvas resolution. DECIDED (2026-06-06): split roles, and elevate `strategy.md` to the
  Product Strategy thesis** — the guiding document for all product decisions, ensuring coherent direction
  (§3.2). Canvas owns bets-by-evidence; the strategy page owns the thesis + linkage + a rollup pointer into
  the canvas; be-civic's `strategy-doc` reverts from the bmd inventory to the authored thesis (bmd stays the
  canvas source).
- **T2 — Where the throughline lives (IA/routing). DECIDED (2026-06-06): Direction-as-home (B).** The
  Direction overview is the home (slug `""`); the work-ledger moves to `/ledger`. Leads with coherent
  direction, matching the T1 framing. One-time eng cost in Phase 3: re-path the relative cross-links and
  update the `pages` list + nav (the ledger is no longer root).
- **T3 — The `objective → bet` link (`strategy_link`). DECIDED (2026-06-06): add now** (council-reinforced
  by both Cagan and Blank) — it is the methodology's core claim (objectives advance *validated* bets) and it
  gives a *killed bet* a home upward to the objective it undercut (the pivot signal). No longer optional in
  the build: `okr-schema` gains the field; be-civic's two objectives author it (Phase 4).

---

## 11. Methodology grounding — council provenance (advisory, D48)

This design was audited by `sg-advisory-council convene pm` (seats: Cagan/SVPG, Osterwalder/Strategyzer,
Blank/Customer Development). The audit is **advisory, non-authoritative** — nothing auto-applied. Findings
incorporated above: the two-axis bets rollup (#1, all three seats), the split four-risks coverage (#2,
Cagan), conditional riskiest-first ranking + `canvas.json` strength/importance fields (#3, Osterwalder),
the `objective→bet` add-now recommendation (#4, Cagan+Blank), and the demand-tested signal distinct from
trend-gating (#5, Blank). Seam notes recorded: the four-risks bridge straddles canvas + work-items; the
evidence-strength × maturity dial; the feedback-close is rendered-visible but its write-back edge stays
deferred (P16). Faithful positives the audit affirmed: outcome-over-output spine, life-past-land,
vision-vs-strategy split, value-map-fit traceability, and the redundancy-as-binding-drift diagnosis.

**Design + engineering plan-review (also folded in).** A designer's-eye review added the rendering
discipline now in §3.5 (the single evidence-bar primitive, honesty≥green weighting, the spine breadcrumb,
the drawer-vs-link rule, the demand-vs-input-gated colour registers, the designed degraded state) and
**flipped the routing recommendation to the T2 hybrid** (keep ledger home + Direction page/strip). A staff-eng
review corrected the build plan against the actual code: the **dangling objective-anchor bug** (H2 — id-keyed
anchors are a prerequisite), the **strength rung being a new `canvas.json` field, not present** (H1), the
**missing canvas reader in `build-dashboard.ts`/`build.sh`** (H3), Progress being **replace-and-fix not
greenfield** (M1), the Phase-0.5→{2,3} gating (M5), `esc()`-only canvas free-text (M6), dangling-link
degradation + hostile fixtures (M3), and `strategy_link` pinned to an entry id (L1). The factory/harness split
was independently verified clean (no be-civic specifics in the renderer).
