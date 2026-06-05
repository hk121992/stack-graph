---
title: Research report for canary
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 1
external_analogue_found: true
external_corpora_searched: [gstack live skill set]
researcher_adequacy_note: |
  Lifted the gstack `canary` skill — the direct external counterpart, a post-deploy live
  monitor that captures a pre-deploy baseline (screenshots, console-error counts, load
  times), then watches the live app over a window comparing each check against the baseline,
  alerting on CHANGES not absolutes, only when a pattern persists across 2+ consecutive
  checks, and emitting HEALTHY/DEGRADED/BROKEN with screenshot evidence. Edges follow the D35
  crystallising trio pattern: `references` to `instrumentation-preamble` (import) +
  a harness-supplied `canary-manifest` (external, on-demand). primitive/mode = agent/
  autonomous, high confidence. determinism = generative (first run reasons generatively to
  define this product's pages, baseline, and alert thresholds, then crystallises them; later
  runs replay). The defining feature for THIS node: it is INPUT-GATED on live prod traffic —
  it is authored DORMANT, must state it activates only once a real deployment with prod
  traffic exists, and must NOT fabricate a baseline (without one it degrades to a bare health
  check). Its verdict feeds land's `live-confirmed` gate; the `invokes canary` edge is added
  on land's side via amend (land already anticipates this — see land.md Step 3 + the deferred
  `invokes canary`), NOT here. Goals framed as outcomes but honestly caveated for the
  input-gated dormancy. The node-exit carries a canary verdict (HEALTHY/DEGRADED/BROKEN), not
  a numeric trend like the siblings.
---

# Research report for canary

## Identity

**Candidate id:** canary
**Candidate title:** Canary
**Scope:** A post-deploy live-health verdict agent. After a deployment settles, it runs
product-specific live checks against a pre-deploy baseline (page-load success, console errors,
load-time regression, broken links), alerts on *changes* that persist across multiple checks,
and emits a **HEALTHY / DEGRADED / BROKEN** verdict that feeds `land`'s `live-confirmed` exit
gate. It covers the post-deploy live-monitor method only; the product's own pages, baseline,
and alert thresholds are harness-supplied (crystallised on the first real run). It is
**input-gated on live prod traffic** and is authored **dormant** — it activates only once a
real deployment with real traffic exists, and it never fabricates a baseline. It excludes
pre-land performance measurement (`benchmark`) and code-quality scoring (`health`).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Deploys that pass CI but break in production (a missing env var, a stale-asset CDN cache, a slow migration) are caught in the first minutes, not hours — before they become the operator's incident. | once live traffic exists: the share of post-deploy live failures canary surfaces (against the pre-deploy baseline) before an operator or user reports them; time-to-detection from deploy. | once activated, canary catches a non-trivial share of live regressions ahead of human report; a canary that only ever fires after the operator already knows is a cut/tune signal. (Dormant until live traffic exists — no fabricated baseline.) |
| The `live-confirmed` gate is a real evidence-backed decision, not an assumed-healthy rubber stamp — every gate decision carries a canary verdict with screenshot evidence. | the share of `live-confirmed` gate decisions backed by a canary verdict (vs assumed-healthy) once canary is active; false-positive rate of canary alerts surviving operator triage. | the verdict-backed share rises and the false-positive rate stays low enough that the verdict is actioned, not dismissed; a verdict routinely ignored at the gate is a cut/tune signal. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** Canary runs unattended over a monitoring window — it watches the live app, takes
periodic checks, compares to the baseline, and returns a verdict, with operator interaction only
on a fired CRITICAL/HIGH alert (an escalation, not a collaborative loop). That is the
agent/autonomous contract, matching the trio siblings. The inbound `invokes` edge lives on the
caller's side — specifically on `land` (see Overlaps), added via amend, not here.

**`determinism:`** `generative`

**Rationale:** The D35 crystallising pattern. The **first** real run reasons *generatively* to
define this product's live-monitor shape — which pages to watch, what a clean baseline looks
like, where the alert thresholds and the persistence rule sit — because that is a
product-specific judgment. It then **crystallises** that into harness-local references and
scripts (the `canary-manifest`) so later runs replay deterministically. Declared `generative`
for its defining first-run judgment. (This crystallisation cannot happen until live traffic
exists — hence the input gate.)

## Contract

**Input:** A spawn bundle naming the live target (the deploy URL just shipped), the mode
(baseline-capture vs monitor vs quick health-check), the monitoring window, and the
harness-supplied `canary-manifest` (this product's pages, the pre-deploy baseline, and the
alert thresholds) read on-demand. Plus the imported `instrumentation-preamble`.

**Output:** A **HEALTHY / DEGRADED / BROKEN** verdict with per-page results (status, new errors,
avg load vs baseline), the alerts fired (with screenshot evidence paths), and the verdict routed
to `land`'s `live-confirmed` gate. On the node-exit event it carries the **canary verdict** (the
live-health label) — not a numeric trend point like the perf/quality siblings, because the
load-bearing signal is the pass/fail-shaped live verdict the gate consumes. Writes no product
code (read-only by contract); the baseline/screenshot store is a harness concern.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skill set | a post-deploy / canary / production-monitor / watch-the-live-app skill | yes | `gstack-canary-SKILL.md` (methodology body only) |

The gstack `canary` skill is the direct external counterpart. It establishes the
capture-baseline → monitor-live → compare-to-baseline → alert-on-persistent-change →
HEALTHY/DEGRADED/BROKEN verdict shape the node generalises, including *alert on changes not
absolutes*, the *2+-consecutive-checks* anti-flap rule, and *screenshots as evidence*.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/gstack-canary-SKILL.md` | keep | The whole method — baseline capture, page discovery, continuous-monitoring loop, change-not-absolute alerting, persistence rule, HEALTHY/DEGRADED/BROKEN report, baseline update. Absorbed into the body, generalised (product owns pages/baseline/thresholds) and explicitly input-gated. |

## Keep / Drop

**Kept (absorbed into body):**
- The capture-baseline → monitor → compare → verdict method.
- The alert classes (page-load failure / new console errors / load-time regression / broken links).
- **Alert on changes, not absolutes** (compare to *this product's* baseline).
- **The 2+-consecutive-checks persistence rule** — "don't cry wolf" on transients (an
  order-bearing correctness rule: keep it; it is what makes the verdict trustworthy).
- Screenshots as evidence on every alert.
- The HEALTHY / DEGRADED / BROKEN verdict shape that feeds `live-confirmed`.
- Read-only contract.

**Dropped (out of scope):**
- The gstack runtime preamble, telemetry, AskUserQuestion-format, brain-sync, and base-branch
  detection boilerplate — harness-runtime scaffolding, not the canary method.
- The exact `$B` browse-daemon command syntax — an execution-surface detail; the body names the
  live-check source method-agnostically (the harness binds the actual monitor tool).

**Edge only (separate node):**
- Pre-land performance measurement → the `benchmark` sibling node.
- Code-quality scoring → the `health` sibling node.

## Overlaps and seams

- **Sibling trio (`benchmark`, `health`).** All three are crystallising measure-vs-baseline
  agents (D35), sharing the pattern and the integration contract. canary measures *post-deploy
  live health* and emits a *verdict* (HEALTHY/DEGRADED/BROKEN), not a numeric trend.
- **`land` (the load-bearing seam).** `land` holds the `live-confirmed` exit gate and already
  anticipates canary: its body (Step 3 + the deferred `invokes canary`) says canary slots in as
  the third delivery sub-arc step, input-gated on live prod traffic, with the `invokes canary`
  edge added **on land's side via amend** when canary is authored. Until canary activates,
  `deploy`'s inline smoke check is land's `live-confirmed` signal. **This node does NOT author
  the inbound `invokes` edge** — it lives on land, per the F-rule and the task instruction.
- **`deploy`.** deploy executes the deployment and runs an inline single-pass smoke check;
  canary is the richer, baseline-comparing, multi-check live monitor that supersedes the smoke
  check as the `live-confirmed` signal once prod traffic exists. Distinct: deploy's smoke check
  is single-pass/no-baseline; canary is windowed/baseline-compared.
- **Inbound `invokes`.** Authored on `land` (and possibly the operator) — not here.

## Fit

Single node. It owns its branching (mode selection: baseline-capture / monitor / quick-check;
the per-check alert routing; the dormancy gate) and a cohesive measurable job (catch post-deploy
live regressions; back the `live-confirmed` gate with evidence), distinct and separately
measurable from the siblings. No split; modes are body branches.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | instrumentation-preamble (`load: import`) | the enter/exit emit contract; canary carries its verdict on the exit event |
| references | canary-manifest (`load: on-demand`, `external: true`) | the harness-supplied crystallisation manifest — this product's pages, pre-deploy baseline, and alert thresholds. External: the factory ships only the pointer; the harness binds it (and cannot until live traffic exists — the input gate). Validate/build skip external targets. |

No `invokes` (leaf measurement agent; the inbound `invokes` lives on `land`). No `composes-into`
(the delivery-sub-arc placement is expressed from land's side — F7). No process edges.

## Conformance

**`primitive:`↔`mode:` agreement:** agent ↔ autonomous. Consistent.

**`goals:` as outcomes:** both goals read as outcomes (live failures caught before human report;
the gate is evidence-backed), each with a metric and an earns-keep threshold, honestly caveated
for the input-gated dormancy.

**Edge targets resolvable:** `instrumentation-preamble` resolves at `graph/_refs/`.
`canary-manifest` is `external: true` — validate skips it by design.

## Open questions

- The precise activation trigger ("live prod traffic exists") is an operator/harness judgment,
  not a structural field — the body states the dormancy condition and the no-fabricated-baseline
  rule; the harness flips it on. Not a structural blocker.
- Whether canary's exit event should *also* carry a numeric `canary.live` health score (for a
  trend series like the siblings) is left open — the load-bearing signal today is the
  pass/fail-shaped verdict the `live-confirmed` gate consumes; a numeric trend is an
  input-gated enhancement once live runs accumulate.
