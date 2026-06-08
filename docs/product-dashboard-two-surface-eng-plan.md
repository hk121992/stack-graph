---
title: D65 two-surface dashboard — engineering implementation plan
decision: D65 (build)
design: docs/product-dashboard-two-surface-design.md (the contract)
mockup: docs/mockups/product-dashboard/ (the visual + behaviour target)
status: plan — for /plan-eng-review (eng review only; council + design review skipped per operator)
---

# D65 two-surface dashboard — engineering plan

Maps the D65 design (the contract) to concrete changes in the factory renderer. The mockup
is the behaviour target; production reproduces it from the **real bound surfaces**, never the
mockup's sample data. Phased per design §15; each phase independently verifiable.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `docs/product-dashboard-two-surface-design.md` | whole | The contract — build to it |
| `docs/product-dashboard-design.md` | §7 Rendering | Amend (reconcile phase): five-page → two-surface |
| `docs/dashboard-strategic-surfaces-design.md` (D64) | §3 IA | Superseded-in-part (banner already set) |
| `03-plugin-spec` ~l.100 / `04-harness-spec` ~l.247 | rendering paras | Amend (reconcile phase): five-page → two-surface |
| `06-analytics` | namespacing | No-drift check only |

## Files changed

1. **`workspace/renderer/build-dashboard.ts`** — the bulk. 5 routes → 2 + `item/<id>` permalink.
2. **`workspace/renderer/assets/popout.js`** — `data-kind`, cv-anchor-first resolution, `<details>`-from-hash shim.
3. **`workspace/renderer/assets/workspace.css`** — `.popout[data-kind="work-item"]` wider-drawer rule.
4. **`workspace/renderer/build-canvas.ts`** — **no change**; verify `cv-anchor` ids + `.str-*` preserved.
5. **`workspace/renderer/shell-host.ts`** — likely no change (nav reduces via `buildNav`, not the shell).

No schema, binding, or fixture-data change. Render change only.

---

## The unified component vocabulary (design §7)

One artefact type → one function → one CSS family; context picks the variant. A shared `Ctx`
threads the once-computed aggregates so the ledger and Strategy consume identical data.

```ts
interface Ctx {
  proj: ProjectionResult;     // projection + freshness
  L: Links;                   // depth-aware link helper, PER PAGE (differs ledger vs strategy vs item)
  model: OutcomeModel;        // parsed objectives.md (once)
  rev: ReverseIndex;          // byOutcome + byValueProp (once, O(N))
  canvas: CanvasModel | null; // optional canvas.json
  canvasIds: Set<string> | null;
  ledgerSlug: string;         // "" (home)
}
```

| Component | Signature | Variants | Replaces (line refs) |
|---|---|---|---|
| `workItem` | `(it, variant, ctx)` | `compact` (card), `chip` (contribution), `full` (drawer body) | `itemCard` (480), `contributorChip` (1299), record cards, detail-page body. *(`record` renders as `compact`; the `rr` row 1890 is cut with the Direction page.)* |
| `iu` | `(iu, variant)` | `compact` (card), `full` (drawer body) | `iuCard` (379), `iuDetailHtml` (392) |
| `risk` | `(rs, variant)` | `pill`, `grid` | `riskPill` (460), `riskGrid` (1203), `renderRiskDetail` table (990, **cut**) |
| `riskCell` | `(label, rung, title)` | — | dedup the cell markup in `riskGrid` + `fourRisksStrip` |
| `betsRollup` | `(canvas, items, L, variant)` | `full` (section), `strip` (direction strip) | `betsRollupSection` (1778) + `directionStrip` bar (1804) |
| `bet` | `(entry, ctx)` | single (drawer body) | **new** — the bet drawer |
| `objectiveAccordion` | `(obj, ctx)` | single | `renderProgressPage` objSections (1470) |
| `keyResult` / `krRows` | keep | — | unchanged |
| `visionApex`, `gateLog` (`renderGateDecisions`), `timeline` | keep | — | minor rename |
| `link` / `.alink` | inline helper | `inline` / `drawer` / `unresolved` / `note` | `.xlink*`, `.obj-bet`, `.rr-outcome`, `.card-meta a`, `.bets-explore a` |

### The `.alink` affordance (ported from mock.css)
One "this connects to X" row for every artefact link: `<div class="alink-row"><span class="alink-label">…</span><a class="alink" [data-popout|href]><span class="alink-glyph">→</span>…</a> <span class="alink-note">…</span></div>`, with `.alink-unresolved` + `.unresolved-tag` for dangling links (visible, never a broken `<a>`, never a crash). Replaces the `.xlink*` family.

---

## Phase 1 — component-vocabulary refactor + the riskPill fix (no behaviour change)

Same five routes, one vocabulary. Independently diffable against current output.

### The real bug (design §7)
`riskPill` (460) computes the worst rung over the **raw enum** (`includes("low")`) while
`riskGrid` uses `riskRung()` (free-text-tolerant evidence mapping) — they disagree on the same
item, and `.risk-low/-moderate/-strong` are named inverted to their meaning.

**Fix:** unify both on `riskRung()`. New `risk(rs, "pill")` computes the most-exposed rung
(min `RUNG_ORD` over `dims.map(riskRung)`, skipping `unknown`; all-unknown → `unknown`) and
emits `RUNG_CLASS[worst]`. Rename classes to rung meaning: `.risk-weak` (red), `.risk-moderate`
(amber), `.risk-strong` (green), `.risk-unknown` (grey). Update `RUNG_CLASS` (1197). Extract
`riskCell()` shared by the grid + `fourRisksStrip`. (Matches the mockup, which already does this.)

### Vocabulary collapse (mechanical, behaviour-preserving)
- `itemCard` → `workItem(it,"compact",ctx)`; `contributorChip` → `workItem(it,"chip",ctx)`.
- `iuCard` → `iu(iu,"compact")`; `iuDetailHtml` → `iu(iu,"full")`.
- `riskPill`/`riskGrid`/`renderRiskDetail` → `risk(rs,"pill")`/`risk(rs,"grid")` (table cut; the
  grid supersedes it — the item page's "Risk state" table becomes the throughline grid).
- `.xlink*` → `.alink*`; extract `itemThroughline(it,ctx)`.

**Verify Phase 1:** build factory fixture; the five pages render with identical information,
the pill and the grid now agree on every item, no `.risk-low` class remains.

---

## Phase 2 — drawers + in-place disclosure

### Sidecar (per page, page's `L`)
Replace `popoutFor(ius)` with `buildSidecar(ctx, {workItems, childIUsByParent, standaloneIUs, bets})`
→ one `#popout-data` JSON map `{ items: { <id>: { code, html, kind } } }`. `kind ∈ work-item | iu | bet`
drives the drawer width. Each page builds the sidecar it needs with **its own `L`** (drawer-internal
hrefs must be depth-correct for the host page):
- **Ledger (slug ""):** all `workItem(full)` + all child `iu(full)` + all standalone `iu(full)` +
  every `bet(full)` referenced by a work-item `value_prop_link`.
- **Strategy (slug "strategy"):** all `workItem(full)` + all child `iu(full)` + every `bet(full)`
  (riskiest + objective `strategy_link` + work-item `value_prop_link`).
- **item/&lt;id&gt; page:** that item's child `iu(full)` + its `value_prop_link` `bet(full)`.

Bare ids match the mockup hash grammar (`WI-…`, `IU-…`, `B-…`). Add a **collision warning** if a
sidecar key is overwritten (ids are namespaced in practice — `wi-`/`iu-`/bet codes — but warn, never
silently clobber). The canvas page keeps its own `block::region::slot`-prefixed sidecar (no overlap).

### Triggers (cards become `data-popout`)
- `workItem(compact)` card: `data-popout="<id>" role="button" tabindex="0"` (was a `<a>` to the page).
- `workItem(chip)` contribution: `data-popout` (was `<a href=item/…>`).
- `iu(compact)` card: already `data-popout`.
- `riskiest` rows: `data-popout="<betId>"` when the bet has an id (was `<a href=canvas#id>`); plain row otherwise.

### The bet drawer (`bet(entry, ctx)`) — newly surfaces `byValueProp`
- `po-group` = `region · slot`; `po-title` = `esc(text)`.
- `bet-meta`: `.ev-chip.ev-<state>` + `.str.str-<rung>` + `.riskiest-imp.imp-<rank>`.
- "Evidence" section = `esc(detail)`. **Requires** capturing `detail` in the dashboard's
  `loadCanvas`/`CanvasEntry` (read `raw.detail`; generic field; `esc()`-only, M6). No `renderMarkdown`.
- "Work testing this bet" = `ctx.rev.byValueProp.get(betId)` → `workItem(chip)` list (the **newly
  surfaced** reverse index), or a `.contrib-empty` note.
- "Open in canvas →" = `L.canvas(betId)` → `/canvas/#<id>` (the one cross-surface jump).

### popout.js (the only client change)
- sidecar item gains `kind`; `open()` sets `aside.setAttribute("data-kind", it.kind || "")`.
- `openForHash()` resolution order (mirror mock.js): **cv-anchor climb → sidecar id → `<details>`
  open+scroll → generic `[data-popout]` climb.** The cv-anchor-first order keeps `/canvas/#<betId>`
  opening the right block; the `<details>` branch is the objective-accordion deep-link (the ~4-line shim).
- `workspace.css`: `.popout[data-kind="work-item"] .popout-panel { width: min(640px, 96vw); }`.

### Permalink fallback
`item/<id>` stays as a shareable / no-JS page. Extract `itemDetailSections(it, ctx, childIUs)`
(throughline + body + IU grid + gates + traversal/timeline + links) shared by `workItem(full)` and
`renderItemDetailPage`. The drawer adds `po-title`/`po-badges` + a permalink `<a href={L.page("item/"+id)}>`;
the page adds the shell chrome.

**Verify Phase 2:** still five routes; every card/chip/riskiest-row opens the correct drawer; child
IUs nest with "← back"; bet drawer shows the work-list + opens the canvas on the right block; the
`item/<id>` page still renders the same content with JS off.

---

## Phase 3 — two routes (ledger home + Strategy)

- `ledgerSlug = ""` (home). `renderLedgerPage(slug "")` is the index: direction strip → `strategy`,
  banner, lede, channels (kanban + record grid + incremental), sidecar. **No spine** (mockup has none).
- `renderStrategyPage(slug "strategy")`: spine repurposed as a **within-surface section rail**
  (`#vision · #bets · #objectives`, `work`→ledger, `record`→ledger`#record`); vision apex; lede;
  kernel (`renderMarkdown(strategy.md)` wrapped in `.kernel`); `betsRollup(full)` with riskiest rows
  as bet-drawer triggers; the **objectives cascade** as `objectiveAccordion` `<details id=obj.id>`
  (folds the Progress page); unresolved-links section; input-gated north-star note; sidecar.
- `renderItemDetailPage` kept at `item/<id>` (permalink); a "← Work ledger" back link replaces the spine.
- **Cut as routes:** `renderProgressPage`, `renderDirectionPage`. Remove their now-dead CSS
  (`.zone*`, `.odr*`, `.rr*`, `.risk-detail-table`, `.progress-fallback` if unused).
- `buildNav` → `["", "strategy"]`; `pageLabel`: "" → "Work ledger", "strategy" → "Strategy".
- `objectiveAccordion` bet link: `strategy_link` → bet drawer (`data-popout`) **only when canvas
  bound and the id resolves**; else a plain `<code>` note (canvas unbound) or `.unresolved-tag`
  (bound but id absent) — never a broken trigger.
- Main build block: write `index.html` (ledger), `strategy/index.html`, `item/<id>/index.html`;
  drop `progress/`, `ledger/`, the old `index.html` (Direction).

**Verify Phase 3:** exactly two nav items; deep-links (`strategy#OBJ-…` opens the accordion;
`item/<id>` resolves; `/canvas/#<betId>` lands on the block); no duplicated bets rollup; no thin pages.

---

## Phase 4 — verify (no deploy)

Throwaway workdir build (`DASHBOARD_ROOT`/`CANVAS_ROOT` → a temp copy; `bash workspace/build.sh`
into a temp `dist`). Visual coherence check (ledger ↔ Strategy ↔ drawers ↔ canvas). **Hostile
fixtures:** dangling `outcome_link`/`value_prop_link`/`strategy_link`; unbound + empty + malformed
+ non-object `canvas.json`; stale + absent + non-object projection; `<script>`/markup in canvas
`text`/`detail` (must be `esc()`'d, never executed). `/codex review` the diff.

## Invariants (gates — design §12)
- Factory product-agnostic: only bound surfaces + generic evidence/strength enums; no be-civic
  terms/paths/H-codes/block codes in the renderer.
- Three analytics namespaces kept distinct (product-outcomes incl. north-star trend ≠ carrier
  projection ≠ factory conformance).
- `current_stage` projected-only (joined at render; never written).
- `esc()`-only on canvas free-text (`text` + the newly-read `detail`); drawers never `renderMarkdown` canvas text.
- Additive overlay; no vendored node mutated; no schema/binding change.

## Eng-review resolutions (2026-06-08, eng-review-only per operator)

1. **Per-page sidecars = build-all (it's required, not just chosen).** Drawer-internal links are
   depth-aware (`makePageHref`): the same work-item drawer's objective link is `strategy/#OBJ` from
   the ledger but `#OBJ` from Strategy, so a single shared sidecar file would carry wrong links on one
   surface. Each page builds its own sidecar with its own `L`.
2. **Same-page drawer→accordion link = match the mockup (no auto-close).** Clicking an objective alink
   inside a drawer opens the accordion underneath; the user dismisses the drawer with Esc/backdrop.
3. **`record` variant collapses to `compact`** (the record grid uses the same card); the bespoke `rr`
   row dies with the Direction page. Intended 4→1.
4. **Sidecar id collisions: warn + keep-first** (never silently clobber); keeps the mockup's bare-id
   hash grammar. Real ids are namespaced in practice (`wi-`/`iu-`/bet codes).
5. **`popout.js` reorder is canvas-safe** (shared asset): cv-anchor-first changes nothing on the
   canvas page (bet hash → cv-anchor span → block drawer) or the dashboard (no cv-anchors → sidecar).

## Test plan (operator chose: add a focused unit test)

New **`workspace/renderer/build-dashboard.test.ts`** (bun test, mirrors `build-canvas.test.ts`):
- **Regression (IRON RULE — the riskPill/riskGrid fix corrects existing broken behaviour):** assert
  `risk(rs,"pill")` and `risk(rs,"grid")` derive the **same rung** from the same `risk_state` across
  bare-enum + free-text + mixed-dimension inputs (the divergence this fix closes).
- `riskRung()`: bare enum, free-text leading token, unknown/empty → correct rung.
- `canvasEntryId()`: code-token vs prose vs empty.
- `coverageRung()`: honest aggregation (strong-confirmed + no-assumed → strong; one assumed → moderate).
- `parseObjectives()`: structured okr-schema body → id/statement/KRs/strategy_link; malformed → empty model.
- `buildReverseIndex()`: `byOutcome` + `byValueProp` bucket correctly (the newly-surfaced index).

To make these importable, the pure helpers are exported from `build-dashboard.ts` (guard the
side-effecting main build under `if (import.meta.main)` so importing the module for tests does not run
the build). Verified in Phase 1; run in Phase 4.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — (skipped per operator) | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 5 findings, 0 critical gaps, 0 unresolved |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — (skipped; mockup dogfooded) | — |

- **UNRESOLVED:** 0
- **VERDICT:** ENG CLEARED — ready to implement. Council + design review intentionally skipped (operator chose eng-review-only; the mockup at `docs/mockups/product-dashboard/` is the dogfooded visual contract).
