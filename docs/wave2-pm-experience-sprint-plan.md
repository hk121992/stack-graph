# Sprint plan — Backbone Wave 2 + Verify span + PM-disco close + Experience thread

**Date:** 2026-06-05
**Scope decisions (operator):** verify span = EXPAND (build the stage); PM disco = THIN (match reality); execution = plan-gate first.
**Baseline:** 31 nodes / 21 refs / 155 edges. Record at `graph/graph-record.json`.
**Spec touchpoints:** `02-graph-spec` (arc/stage list), `06-analytics` (trends + product-AX), `07-decomposition` (verify span + visual thread + discovery loop), `04-harness` (binding keys), `docs/dev-sprint-backbone-design.md` (backbone sequence change). No edge-taxonomy amendment (all 10 edge types already cover this).

---

## 1. What we are building (final build-list)

### New nodes — 11
| id | primitive / mode | arc placement | purpose |
|---|---|---|---|
| `debug` | skill / collaborative | invoked in `build` | Iron-Law root-cause fix path (no fix without confirmed cause) |
| `investigate-probe` | agent / autonomous | sub-agent of `debug` | parallel read-only hypothesis probes |
| `optimise` | skill / collaborative | invoked in `build`; hosts **AX-optimise mode** | generate N variants → measure → select; AX-optimise re-simulates via `simulate-users` |
| `benchmark` | agent / autonomous (crystallising) | invoked by `optimise`/`review`/`land`/`debrief` | perf measure vs baseline → `benchmark.perf` trend point |
| `health` | agent / autonomous (crystallising) | invoked by `review`/`debrief` | composite code-quality score → `health.quality` trend point |
| `canary` | agent / autonomous (crystallising) | invoked by `land` | post-deploy live health verdict (**input-gated on prod traffic** — built dormant) |
| `design-shotgun` | skill / collaborative | composes-into dev-sprint @ design | N visual variants + comparison board |
| `design-implement` | skill / collaborative | invoked in `build` (UI units) | production UI from approved design |
| `verify` | skill / collaborative | **new backbone stage** | verification-stage orchestrator: dispatches qa + design-review + simulate-users; feeds a gate |
| `qa` | skill / collaborative | composes-into dev-sprint @ verify | systematic browser QA test + fix loop |
| `design-review` | skill / collaborative | composes-into dev-sprint @ verify | designer's-eye visual QA on the live build |

### New references — 2
- `iron-law` — no-fix-without-confirmed-root-cause constraint (consumed by `debug`, `load: import`).
- `ux-principles` — shared UX doctrine (consumed by `design-review`, `design-implement`, and `design`/`plan-design` lens; `load: on-demand`).

> Harness-local crystallisation manifests (`canary-manifest`, `benchmark-manifest`, `health-manifest`) are **not** factory refs — they are written into the consuming workspace on first run, never vendored.

### Amended existing nodes/refs — 8
- `build` — add `invokes debug`, `invokes design-implement`, `invokes optimise`.
- `land` — add `invokes canary`.
- `review` — add `invokes benchmark` + `invokes health` (via `lens-dispatch` conditional path); re-point `precedes` → `verify`.
- `reconcile` — accept `verify precedes reconcile` (re-wire the review→reconcile seam through verify).
- `debrief` — add `invokes benchmark` + `invokes health` (trends at close); **D38 feedback homes**: record shipped-outcome→confirm/kill-hypothesis + reprioritise evidence into authored homes the curators sweep (NO direct curator edge — D38 locked).
- `simulate-users` — add `composes-into dev-sprint @ verify` (re-home) + `references experience-contract-schema (on-demand)` + product-AX emit on exit + experience→PM finding recorded to a swept home.
- `optimise` — add `invokes simulate-users` (AX-optimise evaluator edge).
- `okr-schema` — add a **vision-apex field/holder** (closes the P1 gap; feeds the dashboard vision panel).

### Backbone sequence change (flag for eng-review)
`plan → build → review → **verify** → reconcile → land → debrief`. Inserting `verify` between `review` and `reconcile`. `verify` dispatches qa / design-review / simulate-users (mirroring how `review` dispatches the lens family). This is the one structural change to the wave-1 backbone.

---

## 2. Workspace-backend integration

**Automatic for most nodes:** any node importing `instrumentation-preamble` (`load: import`) and emitting enter/exit with `(carrier, carrier_kind, arc)` + an ID-safe id auto-projects into the dashboard + analytics surfaces. No publisher change for the new dev-sprint stages.

**Real backend wiring (build now):**
1. **Measurement trend series.** `benchmark`/`health` emit measurement on exit. Extend `workspace/renderer/publish-projection.ts` + `build-analytics.ts` to ingest `benchmark.perf` and `health.quality` as named trend series (the analytics "metric-trends-vs-earns-keep" axis). Register any new numeric metric keys in **all three** places — `AX_NUMERIC_KEYS`, `build-analytics.ts`, `workspace-portal-design.md §6` leaf-set — or they are silently dropped.
2. **Product-AX emit point** (the one genuine integration gap). Decide + wire: `simulate-users` emits an exit event carrying the product run's `ax` block into `.stack-graph/events.jsonl` so the analytics AX axis projects it. Existing allowlist already covers tokens/latency/steps/tool_calls/backtracks; register any extra (e.g. `tool_path_breadth`) in the three places. Add UX-conformance pass-rate to the conformance block.

**Input-gated follow-up (do NOT build now):** the `(id, kind, arc)` triple-key in `publish-projection.ts` (currently keys by `carrier_id`). Becomes load-bearing only once two arcs emit real carrier events. Named, not built. Flag it in the carrier-interface ref as the standing follow-up.

---

## 3. Spec amendments (raise as labelled handbook PRs)
- `06-analytics` — add `benchmark.perf`/`health.quality` trend series + the product-AX emit contract + UX-conformance metric. **(load-bearing — do before/with the integration code.)**
- `02-graph-spec` — add `verify` to the dev-sprint stage enumeration; note the crystallising measure-vs-baseline node family.
- `07-decomposition` — document the verify span, the visual-design thread, and (thin PM) the discovery loop as `strategy-curator`'s modes (the Core-vs-PM-pack placement: carrier/state/maturity/outcome = Core; SVPG/Strategyzer/four-risks = PM-pack examples).
- `04-harness` — register binding keys the thread consumes (`personas`, `experience-contract` already parked; confirm + the crystallisation-manifest locality).
- `docs/dev-sprint-backbone-design.md` — replace the Wave-2 F7 prose seams with the now-built edges; record the verify-stage insertion.

---

## 4. Execution — agent-team waves (after approval, in auto)

All node authoring runs through **`sg-graph-maintainer`** (researcher→translator→validator fan-out per node); sibling clusters use **`family`** mode (parallel author agents), singletons use **`new`**. Each wave is a context-isolated dispatch.

- **Wave 0 — refs.** `sg-graph-maintainer reference` → `iron-law`, `ux-principles` (parallel). *(dependency for debug + design nodes)*
- **Wave 1 — new nodes (parallel families):**
  - Family A (crystallising measure-vs-baseline): `benchmark`, `health`, `canary`.
  - Family B (verify span): `qa`, `design-review`; + `verify` orchestrator (`new`, mirrors `review`).
  - Family C (visual thread): `design-shotgun`, `design-implement`.
  - Pair D: `debug` + `investigate-probe`.
  - Singleton E: `optimise` (incl. AX-optimise mode).
- **Wave 2 — amend existing nodes** (`sg-graph-maintainer amend`): build, land, review, reconcile, debrief, simulate-users, optimise (AX edge), okr-schema. Includes the backbone re-wire + D38 feedback homes + product-AX emit.
- **Wave 3 — integration code** (`workspace/`): publish-projection.ts + build-analytics.ts trend-series ingestion; three-place metric registration. Codex-review the diff.
- **Wave 4 — spec amendments** via `sg-handbook-curator raise` (labelled PRs): 06-analytics, 02-graph-spec, 07-decomposition, 04-harness, backbone design doc.
- **Wave 5 — reconcile + verify:** `sg-graph-maintainer validate all` → `index` (regen graph-record.json) → `build/vendor.ts` (plugin bump) → `workspace` build (confirm projection renders, three freshness states) → Codex/Opus review pass.

**Projected record after sprint:** ~42 nodes / 23 refs / ~185 edges (estimate).

---

## 5. Risks / watch-items
- **Backbone re-wire** (verify insertion) touches review/reconcile process edges — validate the arc still traverses end-to-end and no `can-follow` loop breaks.
- **Crystallising nodes** (canary/benchmark/health) write harness-local assets on first run — keep the factory node general; the manifest refs are overlay-only.
- **D38 discipline** — resist authoring direct `debrief→curator` edges; the loop closes through swept homes.
- **Metric registration drift** — the three-place rule; a metric missing from any one place is invisible.
- **canary** is genuinely input-gated — built dormant; do not fake a baseline.
