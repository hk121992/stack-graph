---
title: Research report for benchmark
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 1
external_analogue_found: true
external_corpora_searched: [gstack live skill set]
researcher_adequacy_note: |
  Lifted the gstack `benchmark` skill — the direct external counterpart, a performance
  regression detector that measures page-load timings, Core Web Vitals, bundle/resource
  sizes, and request counts against a stored baseline and emits per-metric deltas with
  relative thresholds plus a trend series. Edges follow the D35 crystallising
  measure-vs-baseline pattern: `references` to `instrumentation-preamble` (import) and a
  harness-supplied `benchmark-manifest` (external, on-demand). primitive/mode = agent/
  autonomous with high confidence (it runs unattended to a verdict, no operator turn).
  determinism = generative (the first run reasons generatively to define this product's
  page set, budgets, and thresholds, then crystallises them into harness-local refs/scripts;
  later runs replay deterministically). Goals were straightforward to frame as outcomes —
  the value is "regressions caught before they compound" and "a comparable perf trend over
  time", both measurable. The `benchmark.perf` measurement on node-exit is the load-bearing
  analytics contract: it lets the analytics surface project a perf trend series. Translator
  should keep the body method-only (the product owns its pages/budgets) and emit the
  measurement on exit.
---

# Research report for benchmark

## Identity

**Candidate id:** benchmark
**Candidate title:** Benchmark
**Scope:** A measurement agent that captures product performance — page-load timings, Core
Web Vitals, bundle/resource sizes, request counts — and compares them against a stored
baseline, emitting a before/after regression verdict and a `benchmark.perf` measurement on
node-exit so the analytics surface can project a perf trend series. It covers the
measure-vs-baseline method only; the product's own page set, performance budgets, and
regression thresholds are harness-supplied (crystallised on the first run). It excludes
code-quality scoring (that is `health`) and live post-deploy monitoring (that is `canary`).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Performance regressions are caught before they land and compound into a slow product. | share of merged perf regressions (load-time / bundle-size / request-count breaches vs the stored baseline) that a prior benchmark run had already flagged; regressions that reached a baseline update unflagged. | the already-flagged share stays high enough that benchmark is trusted as the perf gate; a run that never catches a real regression is a cut/tune signal. |
| A comparable performance trend accumulates across runs, so slow drift (the thousand-paper-cuts failure) is visible, not invisible. | trend-series coverage — the share of tracked metrics with ≥2 `benchmark.perf` points after N runs; whether the series surfaces a sustained-degradation slope. | trend coverage grows run-over-run and a sustained degradation is detectable from the series; a metric that never accumulates a second point is not being read. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** Benchmark runs unattended to a verdict — it captures metrics, compares to a
baseline, and returns a structured before/after report with no operator turn in the loop.
That is the agent/autonomous contract, matching the `measure-outcomes` and `simulate-users`
shape (both autonomous measurement agents). It is invoked *by* another node or the operator;
the inbound `invokes` edge lives on the caller's side, not here.

**`determinism:`** `generative`

**Rationale:** The D35 crystallising pattern. The **first** run reasons *generatively* to
define this product's baseline shape — which pages matter, what the performance budgets are,
where the regression/warning thresholds sit — because those are product-specific judgments,
not a fixed algorithm. It then **crystallises** that reasoning into harness-local references
and scripts (the `benchmark-manifest`) so subsequent runs replay deterministically against
the stored baseline. The node is declared `generative` because its defining first-run
behaviour is judgment, not a fixed computation.

## Contract

**Input:** A spawn bundle naming the target (a URL / deploy under test or a diff to scope
affected pages), the mode (baseline-capture vs compare vs trend), and the harness-supplied
`benchmark-manifest` (this product's page set, budgets, thresholds, and the prior baseline)
read on-demand at the step of need. Plus the imported `instrumentation-preamble`.

**Output:** A structured before/after regression report — per-metric current value, baseline
value, delta, and a regression/warning/ok verdict, plus a slowest-resources list and a
budget-check grade — and, on the node-exit event, a `benchmark.perf` measurement so the
analytics surface projects a perf trend series. Writes no product code (read-only by
contract); the baseline store is a harness concern.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skill set | a performance-regression / page-speed / web-vitals / bundle-size measurement skill | yes | `gstack-benchmark-SKILL.md` (methodology body only) |

The gstack `benchmark` skill is the direct external counterpart and was lifted (methodology
body only — the gstack runtime preamble/telemetry/brain-sync boilerplate is harness scaffolding,
not the method). It establishes the measure-vs-baseline shape the node generalises: capture a
baseline, measure, compute relative-threshold deltas, check a budget, surface the slowest
resources, emit a trend point.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/gstack-benchmark-SKILL.md` | keep | The whole method — baseline capture, metric collection (TTFB/FCP/LCP/DOM/full-load/resources/bundle/requests), relative-threshold comparison, budget check, slowest-resources, trend analysis. Absorbed into the body, generalised (product owns pages/budgets/thresholds). |

## Keep / Drop

**Kept (absorbed into body):**
- The measure → compare-to-baseline → verdict + trend method.
- The metric families (timings, Core Web Vitals, resource/bundle sizes, request counts).
- Relative thresholds, not absolute (compare against *this product's* baseline).
- Baseline-capture vs compare vs trend modes (rendered as body branches per one-node-one-primitive).
- The slowest-resources surface and the performance-budget check.
- Read-only contract.

**Dropped (out of scope):**
- The gstack runtime preamble, telemetry, AskUserQuestion-format, brain-sync, and base-branch
  detection boilerplate — harness-runtime scaffolding, not the benchmark method.
- The exact `$B` browse-daemon command syntax — an execution-surface detail; the body names
  the measurement source method-agnostically (the harness binds the actual measurement tool).

**Edge only (separate node):**
- Code-quality scoring → the `health` sibling node.
- Post-deploy live monitoring → the `canary` sibling node.

## Overlaps and seams

- **Sibling trio (`health`, `canary`).** All three are crystallising measure-vs-baseline
  agents (D35). benchmark measures *performance*, health measures *code quality*, canary
  measures *post-deploy live health*. They share the pattern and the integration contract; they
  differ in subject and in the measurement key they emit.
- **`measure-outcomes`.** That node measures *graph node earns-keep* from the event log;
  benchmark measures *product performance* from a running page. Distinct subjects; benchmark's
  `benchmark.perf` measurement is the product-facing analogue of measure-outcomes' factory
  metrics.
- **Inbound `invokes`.** A caller (a ship/verify span or the operator) invokes benchmark; that
  edge is authored on the caller's side, not here (mirroring how the review lenses and
  `simulate-users` carry no inbound invoke in their own frontmatter).

## Fit

Single node. It owns its own branching (mode selection: baseline-capture / compare / trend)
and a cohesive measurable job (catch perf regressions; accumulate a perf trend). Its goals are
distinct and separately measurable from health's and canary's. No split needed; the modes are
body branches, not nodes (one-node-one-primitive).

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | instrumentation-preamble (`load: import`) | the enter/exit emit contract every node imports; benchmark also carries its `benchmark.perf` measurement on the exit event |
| references | benchmark-manifest (`load: on-demand`, `external: true`) | the harness-supplied crystallisation manifest — this product's page set, budgets, thresholds, and prior baseline. External: the factory ships only the pointer; the harness binds it (mirrors simulate-users' experience-contract external ref). Validate/build skip external targets. |

No `invokes` (leaf measurement agent). No `composes-into` (the edge into a ship/verify span is
deferred until that span exists — F7). No process edges.

## Conformance

**`primitive:`↔`mode:` agreement:** agent ↔ autonomous. Consistent.

**`goals:` as outcomes:** both goals read as outcomes (regressions caught; trend accumulates),
each with a metric and an earns-keep threshold. No activities.

**Edge targets resolvable:** `instrumentation-preamble` resolves at `graph/_refs/`.
`benchmark-manifest` is `external: true` (harness-supplied) — validate skips it by design.

## Open questions

- The exact JSON shape of the `benchmark.perf` measurement (which sub-metrics it carries) is
  left to the analytics surface to define; the body emits the measurement key + the per-metric
  values it has, and notes the surface projects the trend series. Not a structural blocker.
