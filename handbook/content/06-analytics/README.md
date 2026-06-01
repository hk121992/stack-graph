---
title: Analytics & instrumentation
type: spec
read-when: Specifying or implementing how usage, outcomes, and arc-conformance are measured.
related: [graph-spec, devops, concepts, plugin-spec, harness-spec, analytics/recall-substrate, harness-spec/directory-topology]
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

### Reference-layer conformance

The curator's **integrate** gate runs three structural conformance checks against the
reference layer ([`plugin-spec`](../03-plugin-spec/README.md),
[`harness-spec`](../04-harness-spec/README.md)):

- **Fragment-lint** — every in-body anchor cross-reference (`[Concept](slug#anchor)`) is
  validated against the build's **anchor manifest** (the set of authored `{#anchor}` ids
  the build emits). A link to a non-existent anchor **fails integrate**; links cannot
  drift silently.
- **Bidirectional `related` validation** (link-validator) — every `related` edge in a
  handbook-reference's frontmatter must have a reciprocal entry in the target. An
  asymmetric page-graph edge fails integrate. This keeps the agent index consistent.
- **Structural conflict gate** — an undeclared vendored-slot overlap (a local entry whose
  id or anchor collides with a vendored sg entry without an explicit `extends` declaration)
  or an `extends` that redefines an existing sg anchor both **fail integrate**. These are
  hard gates, not warnings; the tooling enforces them before merge.

The **consistency-checker** is the best-effort **semantic backstop** that runs after the
structural gate has passed — it flags subtler contradiction (a local entry restating or
logically contradicting an sg claim). It is a quality signal, not a gate; the three
structural checks above are the conformance mechanism.

## Earns-its-keep

Every node declares `goals` as **outcomes, not activities**, each with a metric and an
earns-keep threshold ([`graph-spec`](../02-graph-spec/README.md)). The metric is computed
from events; a node whose outcome metric never moves over the threshold window is flagged
for cut or merge. This is the loop's evidence — the reason a reviewer-node that never
changes a result is visible rather than assumed valuable.

**Outcome-over-output at the carrier level.** The node-level goals principle generalises
to the work-item. The arc's **debrief/close** stage measures shipped outcomes against the
**declared objectives** the carrier was opened to serve — not output volume (artefacts
produced, stages passed). The gap between declared objective and measured outcome is what
the loop reprioritises on. A carrier that ships artefacts but moves no objective is as
visible as a node that never moves its metric.

## The improvement loop

**instrument → review → reconcile → amend.** Read the timeline and the per-node metrics;
decide amendments; land them PR-gated ([`devops`](../08-devops/README.md)); re-measure.
Findings feed the next traversal. The loop runs in two scopes — a factory loop and a
harness loop — defined in [`devops`](../08-devops/README.md).

## Crystallization — the node-level loop

A product-dependent node does not only get improved by the PR loop above — it **improves
itself as it runs**. On early runs it reasons generatively to work out the specific product;
it **crystallizes** that into reusable **references and scripts** — the canonical `.claude`
primitives ([`graph-spec`](../02-graph-spec/README.md)), not a separate kind — kept harness-local
([`harness-spec`](../04-harness-spec/README.md)). Later runs load those references, run those
scripts, and reason only about what is new or has drifted — so the **generative fraction
declines** with use and the node grows cheaper and more consistent. The body never changes: it
carries a stable `references` edge to a **manifest** (what the node has, how to operate on this
product) and `invokes` edges to its scripts; only the manifest and scripts grow. New ones are
gated at `reconcile`, like any other change. This is the loop one level down and on a faster
clock — the PR loops improve a node's *definition*; crystallization improves its *effectiveness
within a harness*, automatically. It is **measurable**: a falling generative fraction per run is
the node compounding; a fraction that never falls means the node is not building reusable
references/scripts — itself an earns-keep signal.

## Experience-thread measurement

A product built inside the factory is itself an **agent operating environment**
([`concepts`](../01-concepts/README.md) — Experience). Verifying it behaves as intended
is therefore the same kind of measurement problem the factory solves for itself.

**AX (agent experience) measurement is the product-facing instance of the factory's own
traversal instrumentation.** The factory instruments how agents traverse *its* graph —
tokens-to-outcome, latency and steps, tool-path, friction, measured against a baseline.
The experience thread points that same instrumentation at the *product*: it runs persona ×
scenario, captures the product agent's real traversal from the transcript, and emits the
same measure-vs-baseline shape (tokens, latency, inference steps, tool-path, friction
points). The optimisation target is the same outcome for fewer tokens, faster.

**UX conformance** grades the product's *output* against the harness-supplied **experience
contract** — the invariants, named failure modes, and success criteria the product must
satisfy. This is distinct from AX: AX measures the traversal (how the agent got there);
UX conformance grades the result (what the user received). Both are deterministic checks
against declared specifications.

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
- **Operational references and scripts** — the references a node reads and the scripts it runs
  (checklists, configs, executables), harness-local ([`graph-spec`](../02-graph-spec/README.md)).

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
