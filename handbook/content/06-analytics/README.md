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

- **Instrumentation preamble** — a shared **reference** (`graph/_refs/`) every node
  depends on with `load: import`, so the build single-sources it into each node via a native
  `@-import` — guaranteed-present, not skippable (see
  [`plugin-spec`](../03-plugin-spec/README.md)). On entry it records a `node-enter`; on exit a
  `node-exit` carrying the outcome and which gates were hit. This is the in-node, deterministic
  emitter; behaviour that must be **enforced** rather than merely present is a hook (below).
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

## Crystallization — the node-level loop

A product-dependent node does not only get improved by the PR loop above — it **improves
itself as it runs**. On early runs it reasons generatively to work out the specific product;
it **crystallizes** that into reusable **assets** (product-specific scripts, configs,
checklists) co-located in the node's own directory and kept harness-local
([`harness-spec`](../04-harness-spec/README.md)). Later runs load those assets, reuse them
deterministically, and reason only about what is new or has drifted — so the **generative
fraction declines** with use and the node grows cheaper and more consistent. The body never
changes: it carries a stable `references` edge to an asset **manifest** (what the node has, how
to operate on this product); only the manifest and assets grow. New assets are gated at
`reconcile`, like any other change. This is the loop one level down and on a faster clock — the
PR loops improve a node's *definition*; crystallization improves its *effectiveness within a
harness*, automatically. It is **measurable**: a falling generative fraction per run is the node
compounding; a fraction that never falls means the node is not building reusable assets — itself
an earns-keep signal.

## The knowledge substrate

Knowledge lives in four homes, routed by what it *is*:

- **Curated canon** — the handbook (spec / domain) and the decisions store (authoritative
  conclusions, [`docs/decisions.md`](../../../docs/decisions.md)). Authored and human-reviewed;
  the source of truth.
- **Code-map** — the product's code structure (calls, dependencies, definitions/references),
  **deterministically extracted** by AST tooling and traversed. Regenerated from source, not
  authored.
- **Recall** — the surrounding reasoning and transcripts, retrieved semantically
  ([`recall-substrate`](01-recall-substrate.md)). Derived, not canonical.
- **Operational references** — executable assets a node runs (scripts, configs, checklists),
  co-located with the node ([`graph-spec`](../02-graph-spec/README.md)).

Curation, extraction, and recall are different jobs; all are kept. Analytics feeds recall; the
canon records what the loop concludes.

**Traceability is authored, not inferred.** The links between spec and code — what governs
what, what realises what — are **authored and curated** (the spec-touchpoints table on a design
doc, `references` edges, the handbook page-graph, the curator's raise/integrate flow), never
inferred by a tool. Inferred cross-edges cannot be kept fresh reliably; the graph's typed edges
are authored truth.

## Locality

All graph-layer events stay **in the workspace that produced them** — local event log plus
local gbrain recall. There is no central telemetry collection. Cross-workspace learning
flows only as human-curated factory-loop PRs ([`devops`](../08-devops/README.md)), never as
raw event data. This keeps the factory blind to any consumer's usage by construction.
