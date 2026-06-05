---
title: Analytics & instrumentation
type: spec
read-when: Specifying or implementing how usage, outcomes, and arc-conformance are measured.
related: [graph-spec, devops, concepts, decomposition, plugin-spec, harness-spec, analytics/recall-substrate, harness-spec/directory-topology]
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
  "arc": "<arc-id>", "outcome": "<string>", "gate": "<name:pass|fail>",
  "ax": { "<metric>": <number> }, "metrics": { "<series>": <number> } }
```

`node` is present on `enter`/`exit`/`gate`; `from`+`to` on `traverse` (resolving to an
edge). `arc` is the traversal context when one is active.

A `node-exit` event may carry two **optional** numeric aggregates alongside the outcome:

- **`ax`** — an agent-experience aggregate, attached by an experience-verification node
  (`simulate-users` emits its product-run profile here — tokens-to-outcome, latency,
  steps, tool-calls, `tool_path_breadth`). See *Experience-thread measurement*.
- **`metrics`** — named scalar **trend measurements** for the run (e.g.
  `{ "benchmark.perf": 2100 }`, `{ "health.quality": 8.6 }`). This is the
  metric-trends-vs-earns-keep channel: a measure-vs-baseline node records the number it
  produced so the projection can plot its slope over time.

Both are read by a **closed numeric allowlist** at projection time, never spread verbatim —
a non-allowlisted or non-numeric key is dropped (the sanitisation boundary, below). The
instrumentation preamble (v0.3.0) documents both slots.

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

### Two senses of "conformance"

The word covers two distinct, deterministic checks — keep them apart:

- **Graph-path conformance** — the observed traversal checked against an arc's declared
  `precedes` / `can-follow` edges (above). It measures *how the agent moved through the
  graph*: transitions on or off the authored `precedes` path, skipped gates, re-entries.
  The subject is the traversal.
- **Experience-contract (UX) conformance** — the product's *output* graded against the
  harness-supplied **experience contract** (*Experience-thread measurement*, below). It
  measures *what the user received*, not how the agent got there. The subject is the result.

Both are emitted as gate tokens and tallied; neither is model judgment.

## The rendered analytics surface

The projection publisher reads the event log and emits a sanitised snapshot the analytics
surface renders along **three axes**:

- **Node-activity / AX** — per-node usage (last-used, traversals) and the allowlisted `ax`
  agent-experience aggregate.
- **Metric-trends** — the `trends` section: each allowlisted `metrics` series plotted over
  time so its slope reads against the node's earns-keep window. The series allowlist is
  **closed** — currently `benchmark.perf` (the measure-vs-baseline performance trend) and
  `health.quality` (the code-quality trend). A `metrics` key outside the allowlist is
  dropped; a non-numeric value is dropped.
- **Conformance** — a `conformance.experience_contract` pass/fail **tally**. The publisher
  counts the `experience-contract:<pass|fail>` exit-gate token (emitted by `simulate-users`,
  *Experience-thread measurement*) — a **count only**, never the gate strings or any contract
  body. This is the experience-contract UX-conformance sense above, surfaced as a running
  tally; graph-path conformance is the separate traversal check.

The sanitisation boundary holds across all three: the publisher reads numbers and gate-token
counts against closed allowlists, never narrative, contract text, or arbitrary keys (the
same locality and projection discipline as the carrier-state projection below).

### The coverage view — a future projection seam

A zone-matrix **coverage view** ([concepts](../01-concepts/)) — which cells the product's work has
touched, and the **test status** of each — is a **future projection**, not built now. When it lands
it follows this same discipline: a dedicated coverage renderer reads the **same sanitised snapshot**
the analytics surface reads (the single publisher is the only thing that touches the event log),
parallel to the analytics build. Its **test-status overlay** reads the
`conformance.experience_contract` tally above — per-vertical the `experience-contract:<pass|fail>`
verdict, per-cell the future per-zone check. Both are **forward references to the deferred testing
layer**: the gate exists in the spec, but no product instances or tests emit it yet, so the view is
**input-gated** — the seam is named and the mechanism fixed; the surface is built when there is data.
Until then the matrix is a design/review lens, not a measured surface.

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

## Carrier-state projection

The instrumentation preamble emits a `node-enter` / `node-exit` event **tagged with the
carrier** on every stage traversal, appending to the same local event log. This makes
the carrier's stage-position a **derived projection**, never a hand-written field:

- **Current stage** — the latest stage event for that carrier in the log. If an operator
  `stage_override` is set in the carrier file, that wins; the projection is still derived
  but overridden for presentation.
- **Stage-traversal sequence** — the ordered series of stage events for that carrier:
  its timeline through the graph.

**The projection key is a triple — carrier id + carrier kind + arc id.** A node may be
**shared across arcs** (the same primitive reused in more than one traversal), so keying the
projection on carrier id and latest stage **alone** would let one carrier's `current_stage`
bleed into another's at a shared node. The **arc** keeps each traversal's projection separate;
the **carrier kind** keeps distinct carrier shapes from colliding. Current stage is therefore
the latest event matching all three — for that carrier id, of that kind, on that arc. The event
must carry, or be resolvable to, all three so the projection can key correctly across shared
nodes.

A workspace's lighter unit of work projects through this **same** machinery: its `current_stage`
is derived from the **same carrier-tagged event log** as a tracked work-item's, by the same
triple key. The lighter loop adds **no new instrumentation** — it conforms to this model
exactly, emitting the same node-enter / node-exit events and projecting stage the same way.

These two values are **computed on read from the event log**; they are never written into
the carrier instance file — precisely as the graph record is derived from node frontmatter,
not stored separately. The event log is the single source; the projection is a view over it.

### Terminal freeze

At a **terminal lifecycle state** (closed, shipped, killed, parked, or the harness
equivalent), a **recorder** freezes the traversal timeline into the closed record. This
snapshot — the durable history — is the one point at which a derived value enters a
committed file, and it enters exactly once, at close. The event log itself is
generated/ephemeral (gitignored); the frozen snapshot in the closed record is the
permanent artefact.

The recorder is **decoupled from lifecycle advancement**: the gate advances the state; the
recorder freezes the timeline independently, so no terminal carrier loses its traversal
history regardless of which path reached the terminal state.

### Stream namespacing

The event log carries three distinguishable streams sharing the same append-log machinery:

| Stream | Subject | Consumers |
|---|---|---|
| **Product outcomes** | Carrier-tagged stage events; outcome metrics per node; per-IU cost (`tokens_per_iu`) | Dashboard render; improvement loop |
| **Factory / graph conformance** | Traversal conformance against arc-declared edges; gate events | Factory loop; devops review |
| **Carrier projection** | Stage position + traversal sequence per carrier id | Surface render; recorder; degraded-mode fallback |

They share machinery but are different subjects with different consumers; keep them
namespaced so a consumer of one stream does not need to filter noise from another.

### Per-IU cost — `tokens_per_iu`

Under the one-IU-one-fresh-context build model ([decomposition](../07-decomposition/README.md);
D57), each implementation unit is built in its own fresh agent context. `build` emits a
**`tokens_per_iu`** measure on each per-IU **unit-complete** event — the token cost of building
that IU (the subagent's accountable usage, a **hook-captured** subagent-completion event bound to
the IU id). It is a **Product-outcomes** measure, the "cost per traversal" pattern at IU
granularity.

`measure-outcomes` derives the per-sprint distribution and the **over-budget share** against the
harness **context-budget dial** — a tunable value (~100k tokens documented default; the best-work
window is model-dependent, so the number is verified, not baked in). The over-budget share does two
jobs: it calibrates the dial per model, and it is a **decomposition-quality** signal back to
`plan` — a persistently high share means IUs are drawn too coarse (the same shape as "weak
acceptance is a *plan* gap, not a *build* gap").

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
against declared specifications. `simulate-users` emits the UX-conformance verdict as an
`experience-contract:<pass|fail>` exit-gate token; the publisher tallies it into
`conformance.experience_contract` (*The rendered analytics surface*) — a count, never the
contract body.

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
