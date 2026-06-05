---
title: Research report for health
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 1
external_analogue_found: true
external_corpora_searched: [gstack live skill set]
researcher_adequacy_note: |
  Lifted the gstack `health` skill — the direct external counterpart, a code-quality
  dashboard that wraps the project's own tools (type-check, lint, tests, dead-code,
  shell-lint, optionally gbrain), scores each 0-10 against a rubric, computes a WEIGHTED
  composite, persists a per-run JSONL history, and reads the last N entries for trend +
  regressions + impact-ranked recommendations. The source was already mirrored in the
  factory (drift-detector + measure-outcomes source-material); copied verbatim here. Edges
  follow the D35 crystallising trio pattern: `references` to `instrumentation-preamble`
  (import) + a harness-supplied `health-manifest` (external, on-demand). primitive/mode =
  agent/autonomous, high confidence (runs unattended to a composite score; the HARD GATE is
  read-only, never fixes). determinism = generative (the first run reasons generatively to
  define this product's health stack and category weights, then crystallises them into
  harness-local refs/scripts; later runs replay deterministically). Goals framed cleanly as
  outcomes — "quality slips caught before they compound" and "a comparable quality trend".
  The `health.quality` measurement on node-exit is the analytics contract — the weighted
  composite, projected as a trend series.
---

# Research report for health

## Identity

**Candidate id:** health
**Candidate title:** Health
**Scope:** A measurement agent that runs the product's own quality tools (type-check, lint,
tests, dead-code, shell-lint, and any harness-declared checks), scores each category 0-10
against a rubric, computes a **weighted composite 0-10**, compares to stored history, and
emits a `health.quality` measurement on node-exit so the analytics surface projects a quality
trend series. It covers the wrap-score-composite method only; the product's own tool set and
category weights are harness-supplied (crystallised on the first run). Read-only by hard
gate — it never fixes. It excludes performance measurement (`benchmark`) and post-deploy live
monitoring (`canary`).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Code-quality slips are caught before they compound, and the operator can see exactly which category regressed. | the share of quality regressions (a category score dropping run-over-run) the run surfaces with the specific failing checks attributed; regressions that reached the next run unsurfaced. | the surfaced-with-attribution share stays high enough that health is trusted as the quality dashboard; a run that never attributes a real regression is a cut/tune signal. |
| A comparable composite-quality trend accumulates across runs, so quality direction (improving vs slipping) is visible, not anecdotal. | trend-series coverage — the share of runs that emit a `health.quality` composite point and the share with ≥2 points after N runs; whether the series shows direction-of-travel. | trend coverage grows run-over-run and direction-of-travel is readable from the series; a composite that never accumulates a second point is not being read. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** Health runs unattended to a composite score and a dashboard — it wraps tools,
scores, composites, persists, and returns the report with no operator turn required. That is
the agent/autonomous contract, matching `measure-outcomes` and `simulate-users`. The source
skill's HARD GATE — *read-only, never fix* — reinforces the autonomous-measurement character:
it produces a verdict, it does not collaborate on a fix. The inbound `invokes` edge lives on
the caller's side.

**`determinism:`** `generative`

**Rationale:** The D35 crystallising pattern. The **first** run reasons *generatively* to
define this product's health stack — which tools exist (the source skill auto-detects tsc /
biome / pytest / cargo / go / knip / shellcheck / gbrain), how categories map to weights, and
where the rubric thresholds sit — because that is a product-specific judgment. It then
**crystallises** that into harness-local references and scripts (the `health-manifest`) so
later runs replay deterministically. Declared `generative` for its defining first-run
judgment.

## Contract

**Input:** A spawn bundle naming the target (the working tree / branch under check) and the
harness-supplied `health-manifest` (this product's tool set, category weights, rubric, and
prior history) read on-demand. Plus the imported `instrumentation-preamble`.

**Output:** A structured quality dashboard — per-category 0-10 score with status
(CLEAN/WARNING/NEEDS-WORK/CRITICAL) and the failing checks, the **weighted composite 0-10**, a
trend table vs prior runs, declared regressions, and impact-ranked recommendations — and, on
the node-exit event, a `health.quality` measurement carrying the composite so the analytics
surface projects a quality trend series. Writes no product code (hard read-only gate); the
history store is a harness concern.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skill set | a code-quality / composite-score / wrap-the-tools health dashboard skill | yes | `gstack-health-SKILL.md` (verbatim; already mirrored elsewhere in the factory) |

The gstack `health` skill is the direct external counterpart. It establishes the
wrap → score-each-0-10 → weighted-composite → persist-history → trend-and-recommend shape the
node generalises, including the *skipped-category weight redistribution* and the read-only hard
gate.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/gstack-health-SKILL.md` | keep | The whole method — detect stack, run tools, 0-10 rubric per category, weighted composite (with skipped-category redistribution), JSONL history, trend + regressions + impact-ranked recommendations, read-only hard gate. Absorbed into the body, generalised (product owns tools/weights). |

## Keep / Drop

**Kept (absorbed into body):**
- The wrap → score → composite → persist → trend → recommend method.
- Per-category 0-10 scoring against a rubric; the four status bands.
- The **weighted composite** with proportional redistribution of any skipped category's weight.
- Trend vs history + regression attribution (which category dropped, which checks fired).
- Impact-ranked recommendations (rank by weight × score-deficit).
- The **read-only HARD GATE** — health never fixes (a safety-relevant, order-bearing contract:
  keep it verbatim and prominent).

**Dropped (out of scope):**
- The gstack runtime preamble, telemetry, AskUserQuestion-format, brain-sync, and writing-style
  boilerplate — harness-runtime scaffolding, not the health method.
- The exact gstack tool-detection one-liners and the gbrain-specific sub-score arithmetic — an
  execution-surface detail; the body names the categories method-agnostically (the harness binds
  this product's actual tools and weights).

**Edge only (separate node):**
- Performance measurement → the `benchmark` sibling node.
- Post-deploy live monitoring → the `canary` sibling node.

## Overlaps and seams

- **Sibling trio (`benchmark`, `canary`).** All three are crystallising measure-vs-baseline
  agents (D35), sharing the pattern and the integration contract; health measures *code quality*
  and emits `health.quality`.
- **`measure-outcomes`.** That node measures *graph node earns-keep* from the event log; health
  measures *product code quality* from the project's own tools. Distinct subjects.
- **`review` / the lens panel.** review *examines a diff* with judgment lenses before it lands;
  health *scores the whole codebase's standing quality* with the project's mechanical tools. They
  are complementary — review is per-change and judgment-heavy; health is whole-tree and
  tool-wrapped. No edge between them here.
- **Inbound `invokes`.** A caller (a ship/verify span or the operator) invokes health; that edge
  is authored on the caller's side.

## Fit

Single node. It owns its branching (per-category scoring + skipped-category redistribution +
trend branch) and a cohesive measurable job (catch quality slips; accumulate a quality trend),
distinct and separately measurable from the siblings. No split; modes/branches stay in the body.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | instrumentation-preamble (`load: import`) | the enter/exit emit contract; health carries its `health.quality` composite measurement on the exit event |
| references | health-manifest (`load: on-demand`, `external: true`) | the harness-supplied crystallisation manifest — this product's tool set, category weights, rubric, and prior history. External: the factory ships only the pointer; the harness binds it. Validate/build skip external targets. |

No `invokes` (leaf measurement agent). No `composes-into` (deferred — F7). No process edges.

## Conformance

**`primitive:`↔`mode:` agreement:** agent ↔ autonomous. Consistent.

**`goals:` as outcomes:** both goals read as outcomes (slips caught with attribution; trend
accumulates), each with a metric and an earns-keep threshold.

**Edge targets resolvable:** `instrumentation-preamble` resolves at `graph/_refs/`.
`health-manifest` is `external: true` — validate skips it by design.

## Open questions

- The exact JSON shape of the `health.quality` measurement (does it carry the per-category
  breakdown alongside the composite?) is left to the analytics surface; the body emits the
  composite as the measurement and notes the surface projects the trend. Not a structural blocker.
