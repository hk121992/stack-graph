---
title: Research report for measure-outcomes
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: Backfill — deepened with real external analogues (gstack/health, gstack/retro, ce-product-pulse); added all template sections; Challenge findings; corpora recorded.
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
It writes nothing to any file and emits no judgment. The report is the return value
only; the caller (`debrief`) owns persistence and assessment. Out of scope: assessment
of whether the earns-keep threshold was actually met (that is the operator/debrief job),
any generative synthesis or narrative, and any mutation of the timeline or graph record.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Every debrief closes with a structured metrics row for each earns-keep criterion of each node the sprint touched — numbers, not narrative. | share of debrief runs that produce a complete metrics row per touched node; missing-metric rate | missing-metric rate trends toward zero; a debrief that omits measurement for a node is a gap, not a valid outcome |
| Metrics compound across sprints — each run emits a trend point the next run can compare against, so the earns-keep signal matures over time. | trend-point coverage (share of earns-keep metrics with ≥2 data points after N sprints); delta tracked vs prior run | trend-point coverage grows sprint-over-sprint; a metric that never accumulates a second point is not being read |

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
```

**Output:** A structured YAML report containing one row per touched node, plus a
`skipped` list for nodes whose earns-keep could not be resolved, and a `warnings`
list. The report is the return value only; the node writes nothing to disk.

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

3. **Qualitative earns-keep handling (CF-4):** Should the node be extended with a
   `model_grader` path for qualitative criteria (changing `determinism` from `deterministic`
   to `generative`), or should all qualitative criteria be explicitly excluded and delegated
   to the operator? The former widens scope significantly; the latter is the current design.

4. **Decisions-store and instrumentation-preamble refs:** Both are F7 prose. These need
   to be authored as refs before the edges can be formalised. Is there a current timeline
   for those targets?

5. **Severity bands vs threshold breach:** Should the `severity` field adopt DORA-style
   bands (Elite / High / Medium / Low, mapped from earns-keep text) rather than the current
   binary `ok / warn / breach`? The band model handles continuous metrics better than a
   fixed threshold.
