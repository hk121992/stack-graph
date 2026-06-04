---
title: Research report for measure-outcomes
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: Backfill — deepened with real external analogues (gstack/health, gstack/retro, ce-product-pulse); added all template sections; Challenge findings; corpora recorded.
  - date: 2026-06-03
    note: D57 tokens_per_iu read-side — measure-outcomes derives the per-sprint tokens_per_iu distribution + over-budget share from the product-outcomes stream; added context_budget to the spawn-bundle input contract (read-only, n/a degrade); extended an existing goal's metric. Pure-read preserved; no new edges; no write. SCOPE: read-side only — CF-1..CF-4 reconciliation gaps untouched.
  - date: 2026-06-04
    note: |
      Cluster-C reconciliation amend (feat/tier1-amend-batch2). Closed CF-2, CF-3, CF-4 per
      docs/research-backfill-reconciliation.md cluster-C verdicts (all APPLY). CF-2 → added a
      timeline_incomplete warning (node-enter with no matching node-exit at debrief time) + a
      pending_earns_keep skip reason for declared-but-uninstrumented metrics (06-analytics
      degraded-mode covers absent projection; this covers partial events at debrief time). CF-3
      → added trend_direction: improving|stable|degrading|first_point alongside (not replacing)
      the baseline-comparison severity: ok|warn|breach|n/a; computed from delta sign × earns-keep
      direction, first_point when baseline null. CF-4 → added earns_keep_requires_judgment to the
      skipped.reason enum; qualitative earns-keep stays the operator's/debrief's job (hardens the
      deterministic boundary, D10). NOT TOUCHED: D57 tokens_per_iu / over-budget content (left as
      is); severity stays the metric-vs-baseline verdict ok|warn|breach|n/a, NOT P0–P3 (D58 —
      different axis from findings-severity, out of scope). CF-1 + OQ4 are debrief-side / author-ref
      (DROP/split per cluster C), not this node's amend. Pure-read preserved; no new edges; no write.
sources_lifted: 3
external_analogue_found: true
external_corpora_searched:
  - gstack live skill tree (health, retro, canary, benchmark, learn, landing-report)
  - CE reference plugin (ce-product-pulse, ce-strategy, ce-sessions)
  - be-civic plugin-dev and harness (bc-session-close, bc-path-traversal)
  - Anthropic engineering blog (demystifying-evals-for-ai-agents)
  - DORA metrics documentation (getdx.com)
  - SPACE / DX Core 4 framework (lennysnewsletter.com / Nicole Forsgren)
researcher_adequacy_note: |
  Searched all four specified corpora: gstack live skills (health, retro, benchmark, canary,
  learn, landing-report), the CE plugin (ce-product-pulse is the strongest single analogue),
  be-civic (no measure-outcomes counterpart found — bc-session-close is outcome-adjacent but
  is a collaborative close skill, not a measurement agent), and published best practice
  (Anthropic evals blog, DORA metrics, SPACE/DX Core 4). Three files were lifted verbatim:
  gstack/health, gstack/retro, and ce-product-pulse. Edges were determined by reading the
  node's spawn bundle contract (invokes from debrief) and the graph-map references to
  decisions-store and instrumentation-preamble refs. The primitive/mode decision (agent,
  autonomous, deterministic) is strongly confirmed by all three analogues — each is a
  read-only, no-interaction measurement primitive. The core challenge finding is that
  measure-outcomes lacks a snapshot persistence step: all three analogues write a durable
  JSON record after each run, which is what makes trend-point comparison possible in later
  runs. Without that, the earns-keep metric "trend-point coverage grows sprint-over-sprint"
  is structurally unachievable. Recommend: proceed to translator, but flag the snapshot
  schema gap as a high-severity open question before finalising the node body.
---

# Research report for measure-outcomes

## Identity

**Candidate id:** measure-outcomes

**Candidate title:** Measure outcomes

**Scope:** A deterministic measurement agent invoked by `debrief` at the end of each
sprint. It reads the instrumentation timeline and the `earns-keep` declarations from
the graph record, computes per-node metrics for every node the sprint touched, diffs
against a prior-run baseline where one exists, and returns a structured YAML report.
The same per-node/per-IU measurement remit covers a **per-IU cost derivation** (D57): from
the product-outcomes event stream's `tokens_per_iu` measures, it derives the per-sprint
`tokens_per_iu` distribution and the over-budget share against the harness context-budget
value. It writes nothing to any file and emits no judgment. The report is the return value
only; the caller (`debrief`) owns persistence and assessment. Out of scope: assessment
of whether the earns-keep threshold was actually met (that is the operator/debrief job),
any generative synthesis or narrative, and any mutation of the timeline or graph record.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Every debrief closes with a structured metrics row for each earns-keep criterion of each node the sprint touched — plus the per-IU cost block (`tokens_per_iu` distribution + over-budget share) — numbers, not narrative. | share of debrief runs that produce a complete metrics row per touched node and a per-IU cost block when the sprint built IUs; missing-metric rate | missing-metric rate trends toward zero; a debrief that omits measurement for a node, or omits the per-IU cost block when IUs were built, is a gap, not a valid outcome |
| Metrics compound across sprints — each run emits a trend point the next run can compare against, so the earns-keep signal matures over time. | trend-point coverage (share of earns-keep metrics with ≥2 data points after N sprints); delta tracked vs prior run | trend-point coverage grows sprint-over-sprint; a metric that never accumulates a second point is not being read |

**Why no new goal (D57 read-side):** the `tokens_per_iu` distribution + over-budget share are
*derived* metrics the agent computes and returns — exactly the "compute per-node/per-IU metrics
against earns-keep" remit Goal 1 already names. The over-budget share *is* the read-side of `build`'s
own third earns-keep ("over-budget share trends toward zero as decomposition matures"); the agent
reads and reports it, it does not own a separate outcome. So the derivation extends Goal 1's metric
rather than minting a goal — consistent with the amendment scope (node-edit; no new goal warranted).

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** The node receives a spawn bundle (sprint_id, touched_nodes, timeline_source,
graph_record, baseline), executes fully in isolation, and returns a structured report.
No operator interaction during the run; no collaborative gate. All three external analogues
(gstack/health, gstack/retro, ce-product-pulse) follow the same pattern: invoked, executes
deterministically against data sources, returns a report without prompting. The isolated
context and return-value-only contract make `agent` the correct primitive over `skill`.

**`determinism:`** `deterministic`

**Rationale:** The node reads data (timeline events, earns-keep declarations, baseline
file) and performs arithmetic (rate = count / total; delta = current − baseline). The
operations are fully specified from the spawn bundle; there is no generative synthesis.
Gstack/health marks the same point explicitly: "Wrap, don't replace. Run the project's
own tools." Like health, this node runs reads and arithmetic, not judgment.

## Contract

**Input (spawn bundle):**
```yaml
sprint_id: <string>
touched_nodes: [<node-id>, ...]
timeline_source: <path>          # path to the local event log for this sprint
graph_record: <path>             # path to graph-record.json
baseline: <path> | null          # path to prior debrief metrics snapshot, or null
context_budget: <int> | null     # harness-tunable per-IU context budget in tokens (~100k
                                 # documented default); read-only; required only to compute the
                                 # over-budget share. Absent → over-budget share is n/a (D57)
```

The `context_budget` field is **read-only** — it is the harness's tunable dial value
([06-analytics](../../handbook/content/06-analytics/README.md) "Per-IU cost — `tokens_per_iu`";
[IU-schema](../_refs/IU-schema.md) Invariants), passed *in*, never written *out*. It is the only
input the per-IU over-budget derivation needs that the timeline alone cannot supply. If it is
absent (`null` or omitted), the agent **degrades cleanly**: it still computes the `tokens_per_iu`
distribution from the stream, but reports the over-budget share as `n/a`. The number is
model/version-dependent and deliberately not baked into the agent — the harness owns the value.

**Output:** A structured YAML report containing one row per touched node, plus a
`skipped` list for nodes whose earns-keep could not be resolved, and a `warnings`
list. The report **additionally** carries a per-IU cost block (D57): the per-sprint
`tokens_per_iu` distribution (e.g. median + p90 across the sprint's IUs) derived from the
product-outcomes stream's `tokens_per_iu` measures, and the **over-budget share** — the
fraction of the sprint's IUs whose `tokens_per_iu` exceeded `context_budget` (or `n/a` when
the budget is absent). The over-budget share is a **decomposition-quality** signal: a
persistently high share means `plan` drew IUs too coarse — the same shape as "weak acceptance
is a *plan* gap, not a *build* gap". The report is the return value only; the node writes
nothing to disk. Computing and returning these metrics introduces **no write and no judgment** —
the agent stays pure-read; `debrief` reads the block back and the operator assesses it.

Each metric in a row carries **two distinct axes**, not one:

- **`severity: ok | warn | breach | n/a`** — the *baseline-comparison verdict*: where this
  sprint's value sits relative to the earns-keep threshold (D58: a metric-vs-baseline verdict,
  a different axis from review-lens findings-severity — it is **not** the P0–P3 scale and never
  becomes it). `n/a` when there is no baseline to compare against.
- **`trend_direction: improving | stable | degrading | first_point`** (CF-3) — the
  *direction of travel*: computed from the **sign of the delta × the metric's earns-keep
  direction** (a metric whose earns-keep wants the value *down* improves when delta is
  negative; one that wants it *up* improves when delta is positive). `first_point` when the
  baseline is null (no delta yet). `severity` reports the current standing against the
  threshold; `trend_direction` reports whether the metric is moving toward or away from it.
  They answer different questions and both are emitted — a metric can be `ok` yet `degrading`.

The `skipped.reason` enum names why a node carries no metrics row:
`missing_earns_keep | timeline_unavailable | node_not_found | pending_earns_keep |
earns_keep_requires_judgment`.

- **`pending_earns_keep`** (CF-2) — the node's earns-keep is *declared* but no instrumentation
  event type yet feeds its metric (the touchpoint exists; nothing measures it). Distinct from
  `missing_earns_keep` (no declaration at all) and from `timeline_unavailable` (the whole
  timeline is absent). The metric is awaiting instrumentation, not missing or unmeasurable.
- **`earns_keep_requires_judgment`** (CF-4) — the earns-keep is qualitative ("the operator
  assesses the output is acceptable"): it cannot be reduced to event-counting + arithmetic, so
  it falls outside this agent's deterministic remit. Assessing it is the operator's/`debrief`'s
  job. This skip reason **hardens the deterministic boundary** (D10; 06-analytics "model
  judgment reserved for interpreting, never producing") — the node refuses to fabricate a
  number for a criterion that needs judgment, rather than widening to a model-grader path.

A **`timeline_incomplete`** warning (CF-2) is raised when the timeline carries `node-enter`
events with **no matching `node-exit`** at debrief time — partial events when `debrief` fires
before all hook events have flushed. This is distinct from the 06-analytics degraded-mode case
(an *absent* carrier projection on a fresh clone): here the projection exists but is *partial*
at the moment of measurement. The warning flags reduced confidence in any duration/closure
metric derived from the incomplete span; the affected metrics still compute from what is
present, they are not skipped.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills (health, retro, canary, benchmark, learn, landing-report) | read-only deterministic measurement primitive that runs metrics against project artifacts, computes scores, diffs against a stored baseline, emits a structured report | yes — health and retro | gstack-health-SKILL.md, gstack-retro-SKILL.md |
| CE reference plugin (ce-product-pulse, ce-strategy, ce-sessions) | product-cadenced measurement skill that queries data sources, assembles a per-metric structured report, persists results | yes — ce-product-pulse | ce-product-pulse-SKILL.md |
| be-civic plugin-dev and harness (bc-session-close, bc-path-traversal, bc-operations) | any outcome-measurement or earns-keep evaluation pattern | no — bc-session-close is a collaborative close/summary skill; no deterministic measurement agent found in be-civic |  |
| Anthropic engineering blog (demystifying-evals-for-ai-agents) | canonical guidance on measuring agent outcomes: deterministic vs model-based graders, pass@k vs pass^k, baseline comparison, structured metrics reporting | yes (web — not lifted verbatim; cited in report) |  |
| DORA metrics documentation (getdx.com) | per-sprint measurement rows, threshold breach vs warning, trend tracking, baseline establishment | partially — DORA is team-level not per-node/per-sprint; Elite/High/Medium/Low bands but no breach/warn schema | |
| SPACE / DX Core 4 framework (lennysnewsletter.com / Nicole Forsgren) | structured per-sprint developer productivity measurement schema | partial — article paywalled; key concepts confirmed (flow state, cognitive load, feedback loops; caution against raw LOC as sole metric) | |

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/gstack-health-SKILL.md` | keep | Primary structural analogue. Read-only score-and-diff pattern, JSONL persistence per project slug, composite score with threshold severity (CLEAN/WARNING/NEEDS WORK/CRITICAL), trend from last N runs. Steps 3-6 are directly applicable. Missing: per-node earns-keep criterion concept (health uses tool-category weights, not node-declared goals). |
| `source-material/ce-product-pulse-SKILL.md` | keep | Strong per-metric schema analogue. Configurable metric-to-source routing (pulse_metric_sources), pending/excluded metric states, 15-min trailing buffer for data lag, SMART-bar pushback on vague metrics, read-only constraint. Challenges measure-outcomes on source configuration and data lag awareness. |
| `source-material/gstack-retro-SKILL.md` | keep (edge-only for most) | Covers the sprint-cadenced snapshot + delta-vs-prior pattern well (Steps 12-13). Most retro content (narrative, team analysis, commit histograms) is out of scope and would be a separate `debrief-narrative` node. Edge-only except for the snapshot/delta sections. |
| Anthropic evals blog (web, not lifted) | keep (cited) | Canonical definition: outcome = final state in environment, not what the agent claimed. Code-based (deterministic) vs model-based (generative) graders. pass@k / pass^k for reliability measurement. Human review essential — "no single evaluation layer catches every issue." |
| DORA documentation (web, not lifted) | edge only | Team-level delivery metrics (deployment frequency, lead time, CFR, MTTR). The Elite/High/Medium/Low band model is the closest real-world analogue to severity levels. DORA is not a per-node/per-sprint measurement schema — it belongs in a separate `delivery-metrics` reference, not absorbed here. |

## Keep / Drop

**Kept (absorbed into body):**
- Health's `persist JSONL → load last N → compute delta` loop: the structural template for
  what measure-outcomes needs to do — but the current node body has no persistence step.
- Health's severity taxonomy: CLEAN / WARNING / NEEDS WORK / CRITICAL maps cleanly to
  measure-outcomes' `ok / warn / breach / n/a`.
- Health's "wrap, don't replace" and "read-only" hard rules: directly absorbed.
- ce-product-pulse's pending/excluded metric states: the node should flag metrics that
  have no instrumentation data yet (analogous to `pulse_pending_metrics`).
- Anthropic evals blog's outcome-not-claim distinction: earns-keep is measured against the
  final state of the artefact, not against the node's verbal report.
- Retro's snapshot save + "load prior, compare" pattern: the mechanism that enables
  trend-point compounding.

**Dropped (out of scope):**
- Health's interactive AskUserQuestion for health stack configuration — measure-outcomes is
  fully autonomous with no interaction.
- Retro's narrative authoring, team breakdown, commit histograms, streak tracking — those
  are `debrief`'s job, not this agent's.
- ce-product-pulse's first-run interview, STRATEGY.md seeding, scheduling recommendation
  — all collaborative/configurational; measure-outcomes receives its config via spawn bundle.
- DORA's team-level delivery bands — useful for a separate `delivery-metrics` reference,
  not for per-node earns-keep measurement.

**Edge only (separate node):**
- Debrief narrative / assessment — the part of retro that synthesises findings into action
  items is a separate `debrief-assess` node (already planned).
- Snapshot storage — health and retro both write to a project-slug-scoped JSONL file; a
  `decisions-store` or `metrics-store` reference owns the schema; measure-outcomes should
  write to it, making that ref a formal `references` edge target.

## Overlaps and seams

**Upstream (`debrief` → `measure-outcomes`):** `debrief` invokes this agent via a spawn
bundle. Edge type: `invokes` (held by `debrief`). This node receives the bundle; it does
not declare `composes-into` — it is a leaf agent.

**References (`decisions-store`, `instrumentation-preamble`):** Both are declared in the
node as F7 prose (targets not yet authored). When authored, the edges become:
- `references decisions-store (load: on-demand)` — to read earns-keep declarations.
- `references instrumentation-preamble (load: on-demand)` — to interpret the timeline
  event schema.

**Downstream:** The report is returned to `debrief` as a return value. `debrief` decides
what to write and where. No direct downstream edge from this node.

**Adjacent (`debrief-fleet`):** `measure-outcomes` is one of three fleet agents invoked by
`debrief` (alongside the existing fleet members). The three share the same invocation
pattern but own different parts of the debrief output.

## Fit

Single node. The node owns one goal: compute numbers and return them. The two goals in the
spec (per-node metrics row; trend-point compounding) are complementary facets of the same
measurement job, not independent jobs that would justify splitting. Applying the
07-decomposition discriminator: it owns a single branching (load earns-keep → read timeline
→ compute → compare → emit) with no sub-arc that earns a separate goal. Do not split.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | `decisions-store` (`load: on-demand`) | Reads earns-keep declarations for each touched node; on-demand because the agent loads only the records it needs for the current sprint |
| references | `instrumentation-preamble` (`load: on-demand`) | Reads the timeline event schema to interpret node-enter/node-exit/gate events correctly |
| can-follow | `debrief` | Spawned by debrief; the can-follow edge reflects the process sequence even though the invoke edge is held by debrief |

Note: `composes-into` is absent — this is a leaf agent. `precedes` is absent — it returns
to debrief; debrief owns the next step.

**D57 read-side adds no edge.** The `tokens_per_iu` measures are read from the same
product-outcomes event stream the existing `instrumentation-preamble` reference already covers —
no new ref or edge target. The `context_budget` value arrives as a **spawn-bundle input field**,
not a referenced artefact, so it is no edge either. The over-budget share is computed and returned
in the report; the read-side introduces no new node, ref, or write target. (`build` is the
producer that emits `tokens_per_iu`, via its own body emit into the analytics stream — that is
build's edge to own, not measure-outcomes'; measure-outcomes only reads the resulting stream.)

## Conformance

**`primitive:`↔`mode:` agreement:** `agent` + `autonomous` — confirmed. An agent in
autonomous mode is the correct pair for a spawn-bundle-driven, no-interaction, return-value-only
primitive. All three external analogues confirm this pattern.

**`goals:` as outcomes:** Both goals read as outcomes. Goal 1: "Every debrief closes with
a complete metrics row" — what it achieves, not what it does. Goal 2: "Metrics compound
across sprints" — the outcome of compounding trend points, not the activity of running the
agent. Confirmed.

**Edge targets resolvable:** `decisions-store` and `instrumentation-preamble` are declared
unresolved (F7 prose) in the current node body — this is a known gap noted at node creation.
Both targets are real per the graph-map; they need to be authored as refs before edges can
be formalised. The `can-follow debrief` edge target exists.

## Challenge findings

### CF-1 (HIGH) — No snapshot persistence step; trend-point compounding is structurally unachievable

The node's second goal is "metrics compound across sprints — each run emits a trend point
the next run can compare against." But the current node body has no step that **writes**
the metrics output anywhere. The node explicitly states: "Do not write to any file."

Every real-world analogue that offers trend tracking writes a durable snapshot after each
run:
- **gstack/health** (Step 5): appends one JSONL line to `~/.gstack/projects/$SLUG/health-history.jsonl`
  per run, with every category score. Step 6 then reads the last 10 entries and shows
  trends. Without the write, Step 6 is impossible.
- **gstack/retro** (Steps 12-13): saves a full JSON snapshot to `.context/retros/`, loads
  the prior snapshot for delta computation.
- **ce-product-pulse** (Phase 2.4): writes the report to `docs/pulse-reports/YYYY-MM-DD_HH-MM.md`
  and explicitly notes "memory through saved reports — every run writes so past pulses are
  browseable as a timeline."

The current design delegates persistence to `debrief` (the caller). This is a valid
architectural choice — but it creates a seam: debrief must know to persist the output in
a location that future `measure-outcomes` runs can find as their `baseline` input. The
spawn-bundle field `baseline: <path> | null` acknowledges this, but the contract for
**who writes** the baseline file and **where** is undefined. If `debrief` doesn't write
it (or writes it to the wrong path), trend-point coverage never grows, and the second
earns-keep criterion is never achievable.

**Recommendation:** The node body or the `decisions-store` reference must define the
snapshot schema and write path, OR the node must write a snapshot to the decisions-store
itself (contradicting the current "writes nothing" constraint). This design seam needs
operator decision before the translator finalises the node body.

### CF-2 (HIGH) — Missing data-ingestion lag awareness; timeline may be incomplete

Both `gstack/health` and `ce-product-pulse` include explicit handling for data that has
not yet arrived:
- **health**: if a tool is not installed, it is marked `SKIPPED` and its weight is
  redistributed — not penalised.
- **ce-product-pulse**: applies a 15-minute trailing buffer ("many analytics and tracing
  tools have ingestion lag; querying right up to `now` under-reports the most recent
  events") and supports `pulse_pending_metrics` (comma-separated metric names awaiting
  instrumentation, rendered as `no data` in each pulse until instrumentation lands).

The current `measure-outcomes` body acknowledges partial data with `timeline_unavailable`
and falls back to the decisions-store for earns-keep metrics that can be derived without
a timeline. But it has no concept of:
- Metrics that are **pending instrumentation** (the node touchpoint exists but the
  earns-keep metric is not yet measured by anything in the timeline).
- A **lag window** between sprint end and timeline completeness (events may still be
  arriving when `debrief` fires).

In a live stack-graph harness, the `debrief` stage fires at the end of a sprint session.
The timeline is the `.stack-graph/events.jsonl` local file. If the harness fires `debrief`
before all hook events have been flushed to disk, the timeline will be incomplete. The
`measure-outcomes` body has no way to detect or flag this condition.

**Recommendation:** Add a `timeline_incomplete` warning condition (flagged when
node-enter events exist but the corresponding node-exit events are absent), and add a
`pending_earns_keep` skip reason for nodes whose earns-keep metrics are declared but have
no corresponding instrumentation event type.

**RESOLVED (2026-06-04, APPLY per cluster C).** Both landed in the node body. The procedure
now raises a `timeline_incomplete` **warning** when `node-enter` events have no matching
`node-exit` at debrief time (partial events because `debrief` fired before hooks flushed) —
the affected metrics still compute from what is present, they are not skipped; the warning
flags reduced confidence. And `pending_earns_keep` is now a **skip reason** for a node whose
earns-keep is declared but whose metric has no feeding instrumentation event type yet. This
is *not* the 06-analytics degraded-mode case (absent projection on a fresh clone) — that
covers an absent projection; this covers a *partial* timeline at the moment of measurement.

### CF-3 (MEDIUM) — Severity model is a flat enum; real analogues use a direction-aware model

The current severity field `ok | warn | breach | n/a` maps a single state per metric. But
earns-keep criteria are directional (some metrics need to go up, some down), and a single
point in time is often insufficient to determine severity. The real analogues handle this
differently:

- **gstack/health**: 10-point scale with the rule "score 10 = CLEAN; 7-9 = WARNING;
  4-6 = NEEDS WORK; 0-3 = CRITICAL"; the delta is a separate field, and regressions
  are called out explicitly with the delta value.
- **DORA**: Elite / High / Medium / Low bands (not binary breach). Regression is identified
  by moving from one band to a lower one.
- **Anthropic evals blog**: pass@k (likelihood of success in k attempts) alongside
  pass^k (all k trials succeed) — distinguishing "sometimes works" from "reliably works".

The current schema conflates the severity of a single measurement against a threshold with
the severity of a trend direction. A metric could be `ok` at this sprint's value but
trending toward breach. The schema provides no way to express "improving toward threshold"
vs "degrading away from threshold" — only the current snapshot state.

**Recommendation:** Add `trend_direction: improving | stable | degrading | first_point`
alongside severity, computed from the delta sign and the earns-keep direction. `first_point`
when baseline is null.

**RESOLVED (2026-06-04, APPLY per cluster C).** Added `trend_direction: improving | stable |
degrading | first_point` to each metric, computed from the **sign of the delta × the metric's
earns-keep direction** (down-is-good metrics improve on a negative delta; up-is-good metrics
improve on a positive delta), `first_point` when the baseline is null. It sits **alongside**
the existing baseline-comparison `severity: ok | warn | breach | n/a`, which is **not**
replaced: per D58, `severity` is the metric-vs-baseline verdict (a different axis from
review-lens findings-severity, and explicitly **not** the P0–P3 scale). The two axes answer
different questions — `severity` = where the value stands against the threshold *now*;
`trend_direction` = whether it is moving toward or away from it — so a metric can read `ok` and
`degrading` at once. No band model (DORA Elite/High/…) was adopted; the flat threshold verdict
+ a direction field is sufficient and keeps the schema minimal.

### CF-4 (MEDIUM) — No handling for earns-keep criteria that are qualitative, not quantitative

The Anthropic evals blog distinguishes code-based (deterministic) graders from model-based
(generative) graders, and notes that "no single evaluation layer catches every issue."
The SPACE framework's developer satisfaction dimension and ce-product-pulse's quality
scoring (1-5 per conversation) both model dimensions that cannot be fully captured by
counting timeline events.

The current `measure-outcomes` procedure is purely event-counting and arithmetic.
Earns-keep criteria that are expressed as qualitative thresholds ("the operator assesses
that the output is acceptable") have no representation in the metrics row schema. The
`unit: dimensionless` allows partial coverage, but there is no path for a model-based
grader result to enter the report.

This is a defensible scope boundary (the node is `deterministic` by declaration), but it
should be explicit: any earns-keep criterion that requires judgment cannot be measured by
this node and must be flagged as `skipped` with reason `earns_keep_requires_judgment`.

**Recommendation:** Add `earns_keep_requires_judgment` to the `skipped.reason` enum and
document in the node body that qualitative criteria are out of scope.

**RESOLVED (2026-06-04, APPLY per cluster C).** Added `earns_keep_requires_judgment` to the
`skipped.reason` enum, and the node body now states that a qualitative earns-keep criterion
(one that needs an operator to assess acceptability, not an event count) is **out of this
agent's scope** — measuring it is the operator's/`debrief`'s job. This **hardens the
deterministic boundary** (D10; 06-analytics "model judgment reserved for interpreting, never
producing") rather than widening it: the node refuses to fabricate a number for a judgment
criterion instead of growing a model-grader path (the generative variant — open question #3 —
is **not** taken; it would change `determinism` and conflicts with the locked deterministic
declaration).

### CF-5 (LOW) — Missing the "wrap, don't replace" constraint on timeline interpretation

gstack/health Rule 1: "Run the project's own tools. Never substitute your own analysis
for what the tool reports." The analogous rule for `measure-outcomes` is: read the
timeline as emitted; do not infer or re-interpret events that are not present.

The current body has this intent implicitly (the agent reads the timeline and computes
arithmetic) but does not state it as an explicit hard rule. An LLM executing this agent
could fill in gaps by inferring that a node "probably" ran even if no timeline event was
found — violating the measurement contract.

**Recommendation:** Add an explicit hard limit: "Do not infer events not present in the
timeline. If an expected event type is absent, flag `timeline_unavailable` or
`earns_keep_requires_judgment` as appropriate — do not substitute inference."

### CF-6 (LOW) — Report schema has no version field; schema drift breaks baseline comparison

Both health (the JSONL schema with `gbrain` field added post-D6) and retro (the JSON
snapshot schema with `test_health` and `backlog` as conditional fields) document how
schema changes break backward comparisons and require explicit migration notes.
gstack/health explicitly notes: "Pre-D6 history entries won't have a `gbrain` field —
treat them as `null` for trend comparison and start new tracking from the first post-D6 run."

The current `measure-outcomes` report schema has no `schema_version` field. When the
earns-keep metric schema changes (new metric types, renamed units, added severity levels),
old baseline files will be silently misread, producing incorrect deltas.

**Recommendation:** Add `schema_version: "1"` to the report output and to the baseline
loading step. If `baseline.schema_version != current.schema_version`, flag a
`baseline_schema_mismatch` warning and set all deltas to `n/a`.

## Open questions

1. **Snapshot write ownership (CF-1):** Who writes the baseline file — `debrief` or
   `measure-outcomes`? If `debrief` writes it, where, and is the path stable across sprints?
   This is the gating question for the "trend-point coverage grows" earns-keep criterion.

2. **Timeline completeness window (CF-2):** What is the expected lag between sprint-end
   and timeline-complete? Should `measure-outcomes` receive a `timeline_cutoff` timestamp
   in the spawn bundle, below which incomplete events are ignored?

3. **Qualitative earns-keep handling (CF-4): RESOLVED 2026-06-04.** Settled in favour of
   explicit exclusion: a qualitative earns-keep is skipped with reason
   `earns_keep_requires_judgment` and delegated to the operator/`debrief`. The `model_grader`
   path (which would flip `determinism` to `generative`) is **not** taken — it conflicts with
   the locked deterministic declaration (D10). The node stays deterministic.

4. **Decisions-store and instrumentation-preamble refs:** Both are F7 prose. These need
   to be authored as refs before the edges can be formalised. Is there a current timeline
   for those targets?

5. **Severity bands vs threshold breach:** Should the `severity` field adopt DORA-style
   bands (Elite / High / Medium / Low, mapped from earns-keep text) rather than the current
   binary `ok / warn / breach`? The band model handles continuous metrics better than a
   fixed threshold.
