---
title: Product-dashboard — two coherent surfaces (the strip-back)
decision: D65
status: design — pending review gates (council + design + eng)
supersedes-in-part: docs/dashboard-strategic-surfaces-design.md (D64) — see §11
extends: docs/product-dashboard-design.md (D49)
mockup: docs/mockups/product-dashboard/ (flat HTML — open index.html)
---

# Product-dashboard — two coherent surfaces

The product-dashboard had become "many different types of UI; it doesn't feel like one coherent surface."
This design strips it back to **two surfaces** — the **Work ledger** and **Strategy** — and makes everything
else arrive **in place** (drawers, pop-outs, expand) so the UI's links mirror, one-for-one, the artefact links
the graph process already defines. It is a **reduction** of D64's five-page throughline, not another layer:
D64's data model, evidence rollup, honesty rules, and degraded states all carry forward unchanged — only
*where they render* changes.

The companion artifact is a **flat HTML mockup** at `docs/mockups/product-dashboard/` (§10) — the visual
source of truth; this document is its written rationale.

## Spec touchpoints

| Spec doc | Section | Relationship | Core / pack |
|---|---|---|---|
| `docs/product-dashboard-design.md` | §1 single strategic surface; §7 Rendering | Re-resolves §7 from five-pages-stepped to two-surfaces-with-in-place-disclosure; reaffirms §1, record-primary, the three-analytics-namespace rule | PM-pack |
| `docs/dashboard-strategic-surfaces-design.md` (D64) | §3 surfaces; §3.5 rendering primitives; §8 build plan; §10 T2 | **Superseded in part** (§11): the page IA (Direction-as-home, separate Progress, spine-as-stepper, item page) is replaced; the components (posture bar, four-risks coverage, degraded states) are preserved | PM-pack |
| `01-concepts` | The outcome layer; the loop | No change — the throughline is a rendering, not a concept (confirm in curator sweep) | Core |
| `06-analytics` | Stream namespacing; the rendered analytics surface | **No edit; a no-drift check** — in-place disclosure must keep the input-gated north-star trend namespaced from carrier projection + factory conformance | Core |
| `03-plugin-spec` | "renders … as five pages" (~l.100) | **Amend** — five-page → two-surface + in-place model; keep the canvas-binding + graceful-degradation paragraph | Core (boundary) |
| `04-harness-spec` | "composed, navigable space" (~l.247) | **Amend** — keep the phrasing, drop the five-page implication, keep the `strategy-doc` anti-redundancy rule | Core |
| `graph/_refs/okr-schema.md` | vision apex; `strategy_link` | **No change** — both power in-place objective↔bet disclosure | PM-pack |
| `graph/_refs/work-item-schema.md` | `value_prop_link` may resolve to a canvas entry id | **No change** — powers the in-place work-item→bet drawer | PM-pack |
| `graph/_refs/bindings-contract.md` | `strategy-doc`; optional `renderer.canvas-root` | **No key change** — the reduction is a render change, not a storage change | Harness |

---

## 1. Diagnosis — two layers of mess

**Doc accumulation.** Three overlapping designs (`product-dashboard-design.md` D49, `dashboard-strategic-surfaces-design.md`
D64, `artefacts-design.md`) plus two handbook sections refine — and in places contradict — each other. D64
shipped (PR #16) and *added* surfaces.

**Render fragmentation.** The current `build-dashboard.ts` renders **five routes** (`""` Direction, `ledger`,
`progress`, `strategy`, `item/<id>`) stepped by a spine breadcrumb, and draws the same artefact in incompatible
idioms: a **work-item** four ways (kanban card / contribution chip / record row / detail page), an **IU** three
ways, **risk-state** four ways, and the **bets rollup** duplicated across Direction and Strategy. Authored links
exist in the data but are not navigable in the UI. The net of D64 was *more* surfaces, not more coherence.

The fix is to reduce surfaces and idioms while keeping the information.

## 2. The stripped-back core

The dashboard has one job: **make the product's direction legible so a fast build stays coherent.** It is
**record-primary** (D49 survives). The throughline `vision → bets → objectives → work → record` is not a set of
pages — it is the **artefact link graph made navigable** within two surfaces.

## 3. The primitive artefacts + the canonical link graph

The graph process already defines the artefacts (nodes) and the **authored** links (edges) the UI must make
navigable. There are exactly three link axes plus a projection overlay:

| Axis | Edge (real field) | Code site |
|---|---|---|
| **Outcome ladder** | work-item `outcome_link` → objective → vision apex | `WorkItemFm.outcome_link`; `parseObjectives`; `visionApex` |
| **Value / bet** | work-item `value_prop_link` → bet; objective `strategy_link` → bet | `canvasEntryId()`; `Objective.strategy_link` |
| **Decomposition** | work-item `children[]` → child-IUs; standalone-IU `improves` → target | `iusByParent`; `IUFm.improves` |
| **Reverse indexes** (render-time, deterministic) | objective ← work (`byOutcome`); **bet ← work (`byValueProp`)** | `buildReverseIndex` (both already computed) |
| **Projection overlay** | `current_stage` joined per carrier at render | `stageDisplay`; `PortalProjection.carriers` |

Artefact types and their canonical shapes are in `graph/_refs/`: `work-item-schema`, `IU-schema` (child +
standalone, strict `oneOf`), `okr-schema` (vision apex + objective + key-results + `strategy_link`),
`four-risks`, `bmc-schema`, `vpc-schema`, `carrier-interface`.

**Coherence invariant:** every edge above is navigable from the dashboard in both directions where a reverse
index exists — the one exception being the single cross-surface jump to the canvas (§8). `byValueProp`
(bet ← work) is computed today but **never surfaced**; this design surfaces it (in the bet drawer).

## 4. The two surfaces (decided: two routes, Work ledger is home)

**Work ledger — `slug ""` (home).** Today's `renderLedgerPage`, kept: kanban (now / building / next / later)
+ the **record** row + the **incremental channel** (standalone IUs, CSS-only tabs). A one-line **direction strip**
(vision + bets bar) sits atop it and links **up to Strategy**. The removed Direction page's bands (in-flight,
recently-shipped) already live here.

**Strategy — `slug "strategy"`.** Vision apex → the **thesis kernel** (Rumelt diagnosis → guiding policy →
coherent action; who/JTBD; open questions; decided/not-doing, from `strategy.md`) → the **two-axis bets posture**
rollup → the **objectives cascade** (the dissolved Progress page: each objective is an **expand-in-place
accordion** revealing key-result progress bars + the `byOutcome` contribution list + its `strategy_link` bet) →
the input-gated north-star/KPI block → an "unresolved links" honesty section.

Objectives live within Strategy as accordions, co-locating each objective with its upward link (the bet it
tests) and its downward link (the work advancing it) — both authored edges, both in place.

## 5. The in-place disclosure system

**Three mechanisms, one rule — by data locality and weight:**

> **Expand-in-place** (`<details>` accordion; CSS-only, CSP-safe, already proven in `build-canvas.ts`) — for
> same-surface, same-class detail read in sequence with its siblings (objectives + their KRs on Strategy).
>
> **Drawer / pop-out** (the existing `popout.js` + `.popout`) — for a single focused artefact pulled out of
> flow, inspected, then dismissed (work-item detail, IU detail, a bet's evidence). Overlays without reflow.
>
> **Navigate** — exactly **one** cross-surface jump: → the canvas, for focused canvas work. Nothing else
> navigates.

This refines D64's "drawer = peek same-surface; link = jump surface" rule, which is insufficient here because
**BMC/VPC bet detail must come in-place (a drawer) even though the canvas remains a separate surface**. The
corrected rule: a *bet's evidence summary* is a drawer (in-place peek of canvas-owned data); the *canvas grid*
is the one navigate.

## 6. The artefact-link → UI-affordance map (the coherence proof)

| Edge (direction) | From | Affordance |
|---|---|---|
| work-item → objective (`outcome_link`) | work-item drawer | `.alink` row → expands/scrolls to that objective's accordion on Strategy |
| objective → vision | objective accordion / work-item drawer | "↑ vision" to the apex |
| objective ← work (`byOutcome`) | objective accordion | contribution chips → each opens that work-item's drawer |
| objective → bet (`strategy_link`) | objective accordion | opens the **bet drawer** in place |
| work-item → bet (`value_prop_link`) | work-item drawer | opens the **bet drawer** in place |
| **bet ← work (`byValueProp`)** | **bet drawer** | the work-list inside the bet drawer (newly surfaced) |
| work-item → child-IUs (`children`) | work-item drawer | IU card grid → **nested** IU drawer (body swap) + "← back to parent" |
| standalone-IU → target (`improves`) | IU drawer | "improves `<kind>:<id>`" label (the target is a graph node, not a dashboard surface) |
| work-item → risk (`risk_state`) | work-item drawer | the unified risk grid |
| bet → evidence (state + strength) | bet drawer + Strategy posture bar | in-place summary + "**open in canvas →**" |
| carrier → `current_stage` | card / drawer / contribution chip | projected stage (fresh) or "unknown/stale" via the provenance banner |

## 7. The unified component vocabulary (the coherence engine)

**One artefact type → one component function → one CSS family. Context changes the *variant*, never the
component.**

| Component | Variants | Replaces (4→1, 3→1, …) |
|---|---|---|
| `workItem` | `compact` / `chip` / `record` / `full` | `itemCard`, `contributorChip`, record rows, the detail page body |
| `iu` | `compact` / `full` (child vs standalone = data branch) | `iuCard`, `iuDetailHtml`, inline item-detail lists |
| `risk` | `pill` / `grid` | `riskPill`, `riskGrid`, `renderRiskDetail` table |
| `betsRollup` | `full` / `strip` (one `rollupBets`) | the duplicated Direction + Strategy rollups |
| `bet`, `objective` (`cascade`), `keyResult`, `visionApex`, `gateLog`, `timeline` | single | scattered bespoke renderers |
| `link` + one `.alink` family | `xlink` / `inline` / `drawer` / `unresolved` / `note` | `.xlink*`, `.obj-bet`, `.contrib`, `.rr-outcome`, `.card-meta a`, `.bets-explore a` |

**A real bug to fix:** `riskPill` (build-dashboard.ts:460) computes the worst rung over the **raw enum**
(`low/moderate/strong`) while the grid uses `riskRung()` (the evidence-strength mapping) — the two can disagree
on the same item, and the `.risk-low/-moderate/-strong` class names are *inverted* relative to their meaning.
Unify both on `riskRung()` and rename the classes to their rung (`.risk-weak/-moderate/-strong/-unknown`, where
strong evidence = green/safe). The mockup already does this.

**Shared single-pass helpers** (`parseObjectives`, `buildReverseIndex`, `rollupBets`, `betsPostureBar`,
`riskRung`, `makeLinks`, `stageDisplay`) are computed once and threaded through context, so Strategy and the
ledger consume identical aggregates — duplication becomes structurally impossible.

The full KEEP / MERGE / CUT map (keyed to function + CSS names with line refs) is in the design-agent appendix
and drives the build; the headline: **5 routes → 2 + permalinks**, `renderProgressPage` and `renderDirectionPage`
**cut as routes** (content folds into the two survivors), `renderRiskDetail` table **cut** (grid supersedes it).

## 8. Canvas — separate but linked (the seam)

The canvas (`/canvas/`, `build-canvas.ts`) stays the separate surface for focused canvas work and remains the
**single source of truth** for bet detail. The dashboard surfaces bet content in-place **without duplicating
that source**:

- **The bet drawer** shows only what the dashboard already reads from `canvas.json` via the optional
  `renderer.canvas-root` binding — id, `esc()`'d text, evidence state, strength rung, importance, and the
  `byValueProp` work-list — plus one "**open in canvas →**" link to `/canvas/#<entry-id>`.
- **The canvas owns** the grid, per-block thesis, full bet list, the free-text `detail`, fit claims, the
  evidence filter — none of which the dashboard recreates.
- **The deep-link is already wired:** the canvas renders a hidden per-entry anchor (`cv-anchor` id), and
  `popout.js`'s `openForHash()` climbs from that anchor to the enclosing block cell and opens *that block's*
  drawer. The mockup confirms `canvas.html#<bet-id>` lands on the right block (§10).

`esc()`-only on canvas free-text is preserved (M6) — pulling canvas content in-place widens the untrusted-input
surface, so the drawer never `renderMarkdown`s a canvas entry's free-text.

## 9. Navigation & spine

Two-item nav (`Work ledger`, `Strategy`). The 5-step cross-page **spine breadcrumb is superseded**; on Strategy
it degenerates to a within-surface section rail (`#vision · #bets · #objectives`, plus `work`/`record` →
ledger), and the ledger's direction strip links up to Strategy. Deep-link state via the existing hash mechanism
(open drawer → `#<id>`); a ~4-line `popout.js` shim opens a `<details>` from a hash (the objective deep-link).
The bet-id hash grammar is shared with the canvas, so a shared bet id resolves on both surfaces.

## 10. The mockup (visual source of truth)

`docs/mockups/product-dashboard/` — flat, static, no build. Open `index.html` via `file://`.

- `index.html` — Work ledger (home): direction strip, input-gated banner, kanban + record + incremental channel.
- `strategy.html` — Strategy: vision apex, thesis kernel, two-axis bets posture, objective accordions, unresolved-links, input-gated trend note.
- `canvas.html` — a thin stub of the separate canvas, enough to demonstrate the cross-surface jump.
- `mock.css`, `mock.js` — lift the real brand tokens (Geist + near-monochrome + teal `#1b7f93`) and component CSS; `mock.js` mirrors `popout.js` (drawer + nest + `<details>`-from-hash + theme toggle). Sample data is a **generic example product** — no product-specific terms.

It demonstrates, clickably: the **drawers** (work-item detail with cross-links + risk grid + gate log + frozen
timeline + child-IU cards that **nest**; the bet drawer with the `byValueProp` work-list + "open in canvas"; the
IU drawer), the **expand-in-place** objective accordions, the **unified vocabulary** (one card style, one risk
treatment, one `.alink`), the **unresolved/dangling-link** affordance, and **dark mode**.

**Dogfood results (browse, headless Chromium):** all interactions pass; no console errors. One bug found and
fixed during the dogfood — the canvas cross-surface deep-link must resolve the `cv-anchor` climb *before* a
same-named sidecar id (in production each page has its own `#popout-data`, so the collision can't occur; the
mockup shares one map and honours the canvas anchor explicitly). Screenshots: ledger, work-item drawer (+nest),
Strategy (accordion expanded), bet drawer, canvas block drawer, dark mode.

## 11. What D65 supersedes / preserves (vs D64)

**Superseded:** the standalone Direction page + T2 "Direction-as-home"; the separate Progress page (→
expand-in-place objectives on Strategy); the spine-as-cross-page-stepper; the work-item detail **page** as the
primary path; the T2 `/ledger`-root re-path eng work.

**Preserved unchanged (renders in two places instead of five):** the two-axis bets posture bar (council #1);
split four-risks coverage (council #2); honest aggregation; honesty ≥ green weighting; dangling-link degradation;
`esc()`-only canvas free-text (M6); id-keyed objective anchors (H2, still the prerequisite for every
reverse-index link); conditional riskiest-first ranking; demand-tested ≠ input-gated colour registers; the
depth-aware `makeLinks` helper.

**No schema or binding change.** `okr-schema` (`strategy_link`, vision apex), `work-item-schema`
(`value_prop_link`-as-canvas-id), `bindings-contract` (`strategy-doc` + optional `renderer.canvas-root`), and the
`canvas.json` strength/importance contract all survive. This is a **render** change, not a storage change.

## 12. Invariants the build must honour

- **Three-analytics-namespace rule (D49 / 06-analytics):** keep product-outcomes (incl. the input-gated
  north-star trend) namespaced from carrier projection and factory conformance — never visually pooled.
- **`current_stage` stays projected-only:** the work-item drawer *joins* projected stage at render; never writes it.
- **`esc()`-only canvas free-text (M6):** drawers `esc()`, never `renderMarkdown`, canvas text.
- **Factory / product split:** `build-dashboard.ts` stays product-agnostic — generic evidence/strength enums,
  bound surfaces, no consumer terms / H-codes / block codes. The new drawer logic is render code to audit.
- **Additive overlay:** no vendored node mutated; the canvas adapter stays harness-local.

## 13. Generality & no-drift

The two surfaces read bound surfaces only (`strategy-doc`, `objectives-doc`, `items-root`/`manifest-path`,
`improvements-root`, the optional `renderer.canvas-root`, the `event-log` via `portal-projection.json`). The only
binding whose absence changes the IA shape is `renderer.canvas-root`, and it does so by subtraction (bets posture
+ bet drawers degrade to a "canvas not bound" placeholder), never by breaking. New CSS goes in the inline
`DASHBOARD_STYLES`; brand tokens via `var(--token)`; the `.str-*` strength pills stay byte-synced with
`build-canvas.ts`; all drawers reuse `popout.js`/`.popout`.

## 14. Spec amendments (proposal — attach to reviews)

1. `docs/product-dashboard-design.md` §7 — re-resolve "Rendering" to the two-surface + in-place model; add the
   anti-redundancy note (`strategy-doc` must not bind a canvas/bmd inventory).
2. `docs/dashboard-strategic-surfaces-design.md` — superseded-in-part header → D65 (done as a pointer; full
   reconciliation post-review).
3. `03-plugin-spec` (~l.100) and `04-harness-spec` (~l.247) — five-page → two-surface + in-place; keep the
   canvas-binding + anti-redundancy paragraphs.
4. `06-analytics` — no edit; a no-drift check that namespacing holds.

## 15. Build plan (phased; after review)

- **Phase 1 — Component vocabulary refactor.** Collapse the renderers to the C1–C11 set + `.alink`; fix the
  `riskPill`/`riskGrid` semantics bug; extract one `riskCell` helper. No behaviour change yet — same five routes,
  one vocabulary. Independently verifiable against the current output.
- **Phase 2 — Drawers + in-place.** Make the work-item card a `data-popout` trigger; render `workItem(full)` +
  `iu(full)` + the new `bet` drawer into the sidecar; add the `<details>`-from-hash shim; surface `byValueProp`
  in the bet drawer; keep `item/<id>` as the permalink fallback (shared `itemDetailSections`).
- **Phase 3 — Two routes.** Cut `renderProgressPage`/`renderDirectionPage` as routes; fold the OKR cascade +
  contribution into Strategy as accordions; make the ledger the index (`slug ""`); repurpose the spine; re-path
  cross-links; update nav + `pages`.
- **Phase 4 — Verify.** Rehearse the workspace build into a throwaway workdir (do not deploy); visually verify
  the throughline coheres; hostile-fixture the new drawer logic (dangling links, unbound canvas, stale
  projection, `<script>` in canvas text); `/codex review` the diff; reconcile (apply the §14 amendments + log D65).

## 16. Anti-deferral ledger

- **Built now:** the two surfaces; the unified vocabulary; all drawers + nesting; the bet drawer with the
  newly-surfaced `byValueProp`; the `riskPill` fix; the canvas seam. All buildable from existing authored fields
  + render-time derived indexes.
- **Input-gated:** the north-star/KPI **trend** layer (needs first-user signal) — shown as targets + operator
  read now; trend lights up when data lands. Kept distinct from the demand-tested signal.
- **Not-yet-needed at this maturity:** the earlyvangelist source-disposition field (canvas chip's evidence model,
  not the renderer); the debrief→strategy write-back edge (P16 — rendered-visible, automated write-back deferred).

## 17. Operator resolutions (this session)

- **Layout = two routes; Work ledger is home** (`slug ""`); Strategy is `slug "strategy"`.
- **Canvas = separate but linked** — kept as its own surface; content also surfaced in-place via drawers.
- **`item/<id>` = retained as a shareable permalink / no-JS fallback**, demoted from the primary path.
- **Deliverable = the design first** (this doc + the mockup); review gates run after, as a separate step.

## 18. Draft decision-log entry (D65)

> **D65 — The product-dashboard is stripped to two surfaces (Work ledger [home] + Strategy thesis); everything
> else is reached in place via drawers / pop-outs / expand, mirroring the artefact links the graph already
> defines.** Supersedes D64's five-page throughline IA (Direction-as-home, the separate Progress page, the spine
> breadcrumb, the separate work-item detail page, the T2 ledger re-path) while **preserving** the two-axis bets
> posture bar (council #1), split four-risks coverage (council #2), honest aggregation, honesty ≥ green
> weighting, dangling-link degradation, `esc()`-only canvas free-text (M6), id-keyed objective anchors (H2),
> conditional riskiest-first ranking, the demand-vs-input-gated colour registers, and the depth-aware link
> helper — these now render in two places, not five. **Driving principle:** the dashboard's UI links mirror the
> authored artefact links — `outcome_link`, `value_prop_link`, `strategy_link`, `children`, `improves` — plus the
> deterministic reverse indexes (`byOutcome`, and the newly-surfaced `byValueProp`); D38 authored-not-inferred
> holds. **One unified component vocabulary** (one renderer per artefact, with density variants; one `.alink`
> link affordance) collapses the 4× work-item / 3× IU / 4× risk / 2× bets renderings to one each, and fixes the
> `riskPill`/`riskGrid` semantics divergence. **No schema or binding change** — a render change, not a storage
> change. **Canvas stays a separate linked surface** (T1 split-roles holds); its content also appears in-place via
> bet drawers, with one "open in canvas →" jump. **Invariants held:** D49 record-primary + one-carrier/three-
> projections + the three-analytics-namespace rule; the factory/product split; additive overlay. *Why:* the
> operator's "many different types of UI; doesn't feel like one coherent surface" — collapsing the throughline
> into in-place disclosure within two surfaces makes D49's single-navigable-space promise literal. *Artifacts:*
> `docs/product-dashboard-two-surface-design.md` + the flat mockup at `docs/mockups/product-dashboard/`. *Status:*
> Decided (design); pending review gates; build pending.

## 19. Verification

- **Mockup dogfood (done):** browse headless — ledger, work-item drawer + IU nest, Strategy accordion, bet
  drawer, canvas cross-surface jump, dark mode all pass; no console errors; one anchor-precedence bug fixed.
- **Next (separate, operator-gated):** `/sg-advisory-council convene pm` (methodology grounding),
  `/plan-design-review` (rendering/IA against the mockup), `/plan-eng-review` (the refactor against the actual
  code), optionally `/codex consult`. Attach this doc + the mockup.
- **Build (separate sprint):** the phased plan in §15, ending in the throwaway-rehearsal verify.
