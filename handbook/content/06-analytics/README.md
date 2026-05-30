---
title: Analytics & instrumentation
type: spec
read-when: Specifying or implementing how usage, outcomes, and arc-conformance are measured.
related: [graph-spec, devops, concepts, plugin-spec, harness-spec, analytics/recall-substrate]
---

# Analytics & instrumentation

stack-graph does not just model the graph — it improves it on evidence. Analytics is
first-class: every node declares measurable outcomes, runs are instrumented
deterministically, and a node that never moves its outcome becomes visible and cuttable.
Instrumentation is deterministic — a timeline scanned from real events; model judgment is
reserved for interpreting that timeline, never for producing it.

## Two event sources

| Source | Scope | Graph-aware | Gives |
|---|---|---|---|
| **Transcript baseline** | host-level, any session | no | cost, tokens, tool calls, model usage, per-session timeline |
| **Graph layer** | stack-graph nodes/edges | yes | node-enter / node-exit / gate / traversal events bound to ids |

The baseline already exists and runs on any session unchanged. The graph layer is the
net-new instrumentation this spec defines: purpose-built events bound to the graph.

## How a node emits events

A node knows its own `id` (frontmatter, per [`graph-spec`](../02-graph-spec/README.md)).
Two emitters cover the cases:

- **Instrumentation preamble** — a deterministic resolver block the builder injects into
  every node body (see [`plugin-spec`](../03-plugin-spec/README.md)). On entry it records a
  `node-enter`; on exit a `node-exit` carrying the outcome and which gates were hit. This
  is the in-node, deterministic emitter.
- **Hooks** — a hook is a `triggers` edge from a native event to a node; the handler
  records the event. Hooks capture what the preamble cannot observe from inside a node
  (subagent completion, session stop).

Events append to a **local event log** (JSONL) in the workspace. They never leave it (see
Locality).

## Event shape

```json
{ "ts": "<ISO>", "session": "<id>", "kind": "enter|exit|gate|traverse",
  "node": "<node-id>", "from": "<node-id>", "to": "<node-id>",
  "arc": "<arc-id>", "outcome": "<string>", "gate": "<name:pass|fail>" }
```

`node` is present on `enter`/`exit`/`gate`; `from`+`to` on `traverse` (resolving to an
edge). `arc` is the traversal context when one is active.

## Binding events to the graph

The graph record (`graph/graph-record.json`, produced by the maintainer's `index` mode) is
the schema events resolve against. Binding is by id:

- An **event** carries the `node` id, or `from`+`to` ids that name an **edge**.
- A session's ordered `node` events are an **observed traversal**.
- **Conformance** = the observed traversal checked against an arc's declared
  `precedes` / `can-follow` edges. Off-path steps and skipped gates are visible. The check
  is deterministic — it compares two edge sets, no model judgment.
- **Outcome measurement** = a node's declared `goals.metric` computed from its events plus
  the baseline (e.g. count of a recorded artefact per session; cost per traversal).

## Earns-its-keep

Every node declares `goals` as **outcomes, not activities**, each with a metric and an
earns-keep threshold ([`graph-spec`](../02-graph-spec/README.md)). The metric is computed
from events; a node whose outcome metric never moves over the threshold window is flagged
for cut or merge. This is the loop's evidence — the reason a reviewer-node that never
changes a result is visible rather than assumed valuable.

## The improvement loop

**instrument → review → reconcile → amend.** Read the timeline and the per-node metrics;
decide amendments; land them PR-gated ([`devops`](../08-devops/README.md)); re-measure.
Findings feed the next traversal. The loop runs in two scopes — a factory loop and a
harness loop — defined in [`devops`](../08-devops/README.md).

## Decisions are two-layer

A curated **decisions store** (authoritative conclusions — for stack-graph itself,
[`docs/decisions.md`](../../../docs/decisions.md)) sits over a **gbrain recall substrate**
(the surrounding transcripts and reasoning). Curation and recall are different jobs; both
are kept. Analytics feeds the recall substrate; the store records what the loop concludes.
The gbrain integration — config, reads/writes, and upstream compatibility — is specified in
[`recall-substrate`](01-recall-substrate.md).

## Locality

All graph-layer events stay **in the workspace that produced them** — local event log plus
local gbrain recall. There is no central telemetry collection. Cross-workspace learning
flows only as human-curated factory-loop PRs ([`devops`](../08-devops/README.md)), never as
raw event data. This keeps the factory blind to any consumer's usage by construction.
