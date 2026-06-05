---
title: Graph specification
type: spec
read-when: Defining or implementing the node/edge model, the node schema, or storage.
related: [concepts, decomposition, plugin-spec, analytics, harness-spec, harness-spec/directory-topology, maintenance-skill, overview]
---

# Graph specification

The core; the rest of the system hangs off it. Defines what is a node, what is an edge,
what stays inline, the dual-consumer node file, and how the graph is stored. Vocabulary
is fixed in [concepts](../01-concepts/); the cut rules are in
[decomposition](../07-decomposition/).

## Nodes

A **node is a logic-owning, invokable `.claude` primitive** — it has its own branching or
sequencing. Only these are nodes; everything else is an edge, inline, or an attribute:

| `.claude` primitive | graph role |
|---|---|
| **skill** | **node** — loads into the current context (operator-in-loop) |
| **agent** (subagent) | **node** — isolated context, returns a summary |
| **command** | **legacy** — folded into skills; a thin alias is an `invokes` edge, otherwise author it as a skill |
| **script** (`bin/` executable) | **node**, reached by an `invokes` edge |
| hook | `triggers` **edge** — the handler it points to is the node (or inline) |
| **rule** (`rules/*.md`) | `references` **endpoint** — a path-gated CLAUDE.md fragment |
| MCP server / call | **inline** (or an `invokes` edge when the tool is node-like) |
| native **workflow** (`workflows/*.js`) | the run-time executor an arc may *lower onto*; not authored as a node (see [plugin-spec](../03-plugin-spec/)) |
| reference — CLAUDE.md/memory, agent-memory, schema, decision, output-style | `references` **endpoint** — a referenced artefact, not a branching node |
| settings | **attribute / environment** — the loading context, not a graph element |

This follows the discriminator: only things that own control flow earn a node. Execution
surfaces (a headless browser, a worktree) own no control flow — they are inline tools or
native primitives, not nodes.

## Granularity — one node, one primitive

A graph node maps **1:1 to a single rendered primitive**: one node ⟷ one skill /
agent / script file. There is **no node-count divergence** between the authoring view and the
rendered directory — the graph does not model sub-parts as nodes that collapse at build.

- **Modes** (e.g. a review skill's `interactive`/`headless`) are conditional **branches in a
  node's body**, never separate nodes.
- **Reuse and sizing** come from extracting a right-sized primitive (a smaller skill/agent) or
  a **reference** (the References section above) — each itself a 1:1 artefact — not from an
  authoring-only node. Decide *what becomes its own primitive* by the
  [decomposition](../07-decomposition/) rule (reuse / cohesion / just-in-time) and by
  letting **goals draw the boundary**: a sub-part that earns its own measurable goal becomes
  its own primitive (still 1:1); one that does not stays a body branch.

The only "two views" is that the single node *file* is read two ways — as graph frontmatter
(the lens and the index) and as a native `.claude` primitive (the build) — described next.

## Edges

All edges are **directed** (`from → to`) and typed:

| edge | from → to | class | cycles? |
|---|---|---|---|
| `loads` | node → node / reference | structural | no |
| `invokes` | node → node (agent / script / command) | structural | no |
| `composes-into` | node → arc (or parent node) | structural | no |
| `references` | node → reference / artefact (carries `load: import \| on-demand`) | structural | no |
| `maintains` | node → handbook-reference (or external/factory maintainer → entry) | structural | no |
| `triggers` | event → node | binding | no |
| `precedes` | node → node | **process** | **yes** |
| `can-follow` | node → node | **process** | **yes** |
| `escalates` | stage node → entry node of another arc | **process** | no |
| `overlay` | overlay-node → global node | composition | no |

`overlay` is the harness mechanism (a local node attaches to the vendored graph; see
[harness-spec](../04-harness-spec/)). `triggers` is how a hook is modelled — a binding
from an event to the node it fires. `composes-into` targets an **arc** (a traversal), which
is derived from edges, not a node file — so the maintainer does not resolve it to a file.
**`maintains`** records that a node keeps a **handbook-reference** current; the record projects
the reverse as `maintained_by` (symmetric to `consumed_by` for `references`). A vendored
(`owner: sg`) entry carries a `maintains` edge from an **external/factory maintainer** (marked
`external: true`), so "who maintains an entry" is uniformly graph-derived, never a special case.

**`escalates`** is a directed, one-way **cross-arc handoff**: a stage node in one arc hands work
to the **entry node of another arc** (the canonical case is a light loop's triage stage handing a
change that outgrew it to a heavyweight front node). It is **not `precedes`** — `precedes` is
normal next-stage order *within* an arc, and using it cross-arc would make an escalation look like
ordinary forward flow and pollute `current_stage`. `escalates` is therefore **excluded from arc
traversal and stage projection**: it is an exit, not a next stage. The runtime behaviour is fixed:
an escalation **creates-or-reuses a carrier in the target arc**, **closes the source standalone
carrier** as `dropped` (reason: promoted), and records a **two-way provenance link** between the
two carriers. The edge entry names only its target — `escalates: [{ id: <target-node-id> }]`; the
behaviour above is spec, not edge metadata. An `escalates` edge is **one-way and never forms a
loop**.

## Cyclic semantics

Structural, binding, and composition edges (`loads`, `invokes`, `composes-into`,
`references`, `maintains`, `triggers`, `overlay`) are **acyclic** — a load/invoke cycle is a defect.
The **process edges `precedes` / `can-follow` are the only ones that may cycle**, and that
is exactly how an arc loops: the dev sprint closes by looping `debrief --can-follow→ align-context`,
and the review↔build correction is a `can-follow` loop. The structural skeleton stays a DAG;
every loop rides a process edge. **`escalates` is the process-class exception: it is one-way and
acyclic** — a cross-arc exit hands work off, it never returns along the same edge, so it can never
form a loop.

The canonical dev-sprint arc is **`align-context → design → specify → plan → build → review →
verify → reconcile → land → debrief`**. **`verify`** sits between `review` and `reconcile`: it
proves the built change against its *running* behaviour before it lands, dispatching its
verification modalities (`qa`, `design-review`, `simulate-users`) and surfacing a single
verification gate — mirroring `review`'s lens dispatch but over the running build rather than the
diff. It carries a corrective `can-follow → review` loop, like every other backbone re-entry.

**Cyclic-edge discipline.** Happy-path forward flow is expressed with **`precedes`** (declared on
the source node). **Corrective loops and re-entries use `can-follow`**, and every `can-follow`
edge must carry three things: an **exit criterion** (the condition under which the loop terminates
and forward progress resumes), a **max-attempt / escalation policy** (what happens when the exit
criterion is not met within the allowed iterations — e.g. surface to the operator, halt, or elevate
to a different stage), and a **labelled re-entry** (a named event or mode that identifies *which*
re-entry path is being taken, so the traversal record is unambiguous). Without these three, a
`can-follow` edge is an open cycle — the traversal has no termination guarantee and the record
cannot distinguish a deliberate re-entry from a stuck loop. The rule: every loop in the graph is
**explicit, bounded, and escalatable**.

**Arc-qualified process edges.** When a node participates in more than one arc, a process edge
that belongs to only one of them carries an **`arc` qualifier** (`{ id: <target>, arc: <arc-id> }`);
an unqualified process edge applies in every arc its source participates in. This prevents a shared
node's arc-specific forward edge from shortcutting another arc — a node shared by a heavyweight and
a light arc may hand straight to the close stage in the light arc while the heavyweight arc still
routes through its intermediate stage. The qualifier is the **static** counterpart to carrier-keyed
projection: the qualifier scopes the edge at author/traversal time; the projection key
(carrier id + kind + arc) keeps the runtime stage from bleeding across arcs that share the node.

## The carrier

An arc is traversed by **carriers** — work-items that hold their own state as they move,
rather than a single scalar "stage". The carrier schema is general (the work-item of any
process); its *values* are domain. A carrier records:

| field | holds |
|---|---|
| `lifecycle_state` | the work's life-phase (e.g. proposed → in-flight → delivered → parked); the value set is domain-defined |
| `current_stage` | the arc stage the work is at while in flight (null otherwise) |
| `children` | decomposition — a parent carrier fans out into child work-units, each with its own `current_stage`; the parent aggregates |
| `gate_decisions[]` | append-only; per gate: `{ gate, decision, owner, timestamp, evidence_refs, conditions?, override?, confidence }` |
| `transition_history[]` | append-only log of `lifecycle_state` transitions (from → to, who, when, why) |

This structure is what makes loops, re-entry, skipped stages, decomposition, and abandonment
representable — a scalar "stage" represents none of them. The carrier's fields are updated by **three
different mechanisms, not one writer**:

- **`current_stage` + `transition_history` are projected from the observed traversal.** As work moves
  through the arc, each stage emits node-enter/-exit events ([analytics](../06-analytics/)); tagged with
  the carrier, those events *project* onto it — `current_stage` is the latest stage event, the history the
  sequence. Nobody writes them (the operator may override); they are **derived**, exactly as the graph
  record is derived from frontmatter. The stages that traverse a carrier hold **no write-edge** to it.
- **A gate** advances `lifecycle_state` and records a `gate_decisions` entry — a deliberate, lightweight
  decision at a stage boundary; gate rigour is set by the **maturity × tier dial** ([concepts](../01-concepts/)).
- **Content** (the carrier's identity, priority, body) is maintained by a **curator** through the gated
  raise → integrate path — the heavyweight, reviewed changes.

Because `gate_decisions[]` and `transition_history[]` are **append-only**, a carrier is not only a
forward state-holder but a **durable record** — the process's memory of how the work moved, when, and why
each call was made, kept after the work is delivered or abandoned. The current/forward view and this
retained record are two readings of one carrier, not separate artefacts.

A carrier is **not a node** — it is an instance flowing through the graph, and none of the three is a
`composes-into` edge. What the lifecycle states, stages, and gates *are* is a domain concern — a delivery
process's work item is one carrier.

## Carrier instances

A carrier *instance* is the concrete runtime realisation of a carrier — what is actually stored in the
workspace when work moves through the arc. Instance storage is **distinct from node storage** (node files
are `.claude` primitives serving the builder, renderer, and index; an instance is not a node and not a
primitive). The two storage patterns live side-by-side without overlap.

**Format and index.** An instance is a **markdown file with YAML frontmatter** (its authored state) **and
a body** (the content or narrative record), indexed by a **manifest** in the workspace surface that holds
it. This follows the graph's own files-canonical / frontmatter-structured / index-derived pattern, applied
to runtime artefacts.

**Three strictly-separate kinds of state** — conflating them is the structural risk:

| kind | what it holds | who writes it | where it lives |
|---|---|---|---|
| **Authored** | `lifecycle_state`; the append-only `gate_decisions[]` log; an optional operator `stage_override`; curated content | gates (lifecycle + decisions) + the curator (content) | committed in the instance file |
| **Projected** | `current_stage`; the stage-traversal sequence | derived from the carrier-tagged event log — **never written into the file** | generated store (not committed) |
| **Terminal snapshot** | the traversal timeline, frozen once into the closed record at any terminal `lifecycle_state` | a recorder, keyed off the terminal transition; decoupled from the gate | committed into the closed record, once, at close |

The **projected state** is derived exactly as the graph record is derived from node frontmatter: every arc
stage emits node-enter/-exit events tagged with the carrier id; `current_stage` is the latest such event
for that carrier; the traversal sequence is the ordered history. No stage holds a write-edge into the
instance — the stages are what make the projection real.

Projection keys by **carrier id + carrier kind + arc id**, not carrier id and latest stage alone. When a
node is **shared across two arcs** (a stage reused by more than one traversal), keying by carrier id alone
would let one carrier's `current_stage` bleed into another's at the shared node; the arc id in the key
keeps each arc's projection separate, and the carrier kind keeps the two carrier shapes from colliding. A
carrier's `current_stage` is therefore the latest event matching its own id, kind, *and* arc.

The **terminal snapshot** is the only point a derived value enters a committed file. It is written by a
**recorder** — a dedicated action keyed off the terminal lifecycle transition, decoupled from the gate that
advances the state — and it is written once, at close. After that, the closed record is complete and
self-contained.

**Degraded read.** When the generated projection is absent (e.g. a fresh clone), the authored ledger and
any frozen closed records render fully. In-flight instances show their stage as unknown or stale until the
projection rebuilds from replayed events. The surface never implies full fidelity without the projection;
closed items are always complete.

**The carrier-lite variant.** A carrier instance need not carry the full carrier shape. A **carrier-lite**
instance is an **implementation-unit file that *is* its own carrier** — it holds a minimal `lifecycle_state`,
a single gate, and an `improves` pointer to the existing thing it changes, and lives in its own surface
rather than alongside the full work-item carrier. It is the unit of a light, single-slice change: no
decomposition children, no front, one gate. It contrasts with the **work-item carrier** — the full-shape
instance that holds children, several gates, and tracked-progress content on its own surface. Both follow
the same three-kinds-of-state discipline above; the carrier-lite simply instantiates it at reduced scope.
The field detail (the discriminator, the lifecycle states, the single-gate writer split) lives in the
implementation-unit schema, not here.

## Inline

Small references, **MCP calls, and execution surfaces** live inline in a node body, not as
nodes or edges — they have no control flow of their own. An edge appears only when the
thing invoked is itself node-like (a script with logic → an `invokes` edge).

## References — shared content

Shared content that several primitives need — the finding contract (`findings-schema`,
`severity-scale`, `confidence-anchors`), the instrumentation preamble, `lens-dispatch`,
common protocols — is a **reference**: a native single-source artefact, **not** an injected
block. stack-graph has **no build-time injection primitive**; everything is a native
`.claude` artefact, keeping the canonical store literally native.

A reference is its own file at `graph/_refs/<id>.md` — frontmatter `kind: reference`
(+ `id`, `title`, `description`, `status`) over the body. It is **not a node**: it owns no
control flow, declares no `goals` and no process edges. A node depends on it via a
`references` edge carrying a **load dial**:

| `load:` | runtime behaviour | use for |
|---|---|---|
| `import` | native **`@-import`** — spliced into the host at *load* time, guaranteed-present, not skippable | short, must-always-be-present invariants (e.g. the preamble) |
| `on-demand` | the host *points at* it; the agent **reads it at the step of need** | larger or conditional material; keeps context lean, reads as its own doc |

```yaml
references:
  - { id: lens-dispatch,   load: on-demand }
  - { id: findings-schema, load: import }
```

The `load` dial is the native equivalent of "always present vs consulted when needed" —
`import` is load-time `@-import` (the host holds a pointer, the build single-sources the
file); `on-demand` is a backtick path / "follow `<id>`" the agent reads. The **build**
single-sources each reference into its consumers (places/symlinks the one canonical file and
resolves the pointer) — DRY + freshness with native output, no `{{token}}` splice
([plugin-spec](../03-plugin-spec/README.md)).

A `references` edge may be marked **`external: true`** when its target is **harness-supplied**
and absent from the factory. The canonical case is the **handbook** — a node whose job
touches the consuming product's own handbook + decisions (the curator, the drift detector, a
context-gathering or design node) depends on a `handbook` locator (`load: on-demand`); the
factory ships only the pointer, and the harness **overlay** resolves it to that product's canon
root + page index ([harness-spec](../04-harness-spec/README.md)). The node then navigates pages
at the step of need. (Another case is a **crystallization manifest** a self-improving node grows
in its harness — the references/scripts manifest it reads.) The factory ships only the consumer's pointer;
the harness supplies the target. Validation and the build skip an external reference — there is
no factory file to resolve or single-source. This is **overlay resolution, not `{{token}}`
injection**: the body carries a stable "follow your `handbook` reference", and the overlay
binds what it points at (a path / index) — the binding is harness config, never a body splice.

The **measure-vs-baseline family** (`benchmark`, `health`, `canary`) is the worked case of an
`external: true` manifest. On its **first run** a node in this family reasons generatively to work
out the specific product (its pages, budgets, quality bars, thresholds) and **crystallises** that
judgment into a harness-local manifest (`benchmark-manifest`, `health-manifest`, …); every later run
**replays deterministically** against that crystallised baseline. The node reaches its manifest by a
stable `external: true` `references` edge — the factory ships only the pointer, the harness holds the
content — so the node body never changes, only the manifest grows. The manifest is **never vendored**
([analytics](../06-analytics/) — Crystallization; [harness-spec](../04-harness-spec/)).

Shared content destined for a spawned **agent** (e.g. a lens's finding contract) is passed by
the orchestrator into the agent's **spawn prompt**, not imported by the agent — the orchestrator
holds the reference and fills it into the subagent's prompt at dispatch.
Behaviour that must be *enforced* rather than merely present is a **hook** (a `triggers` edge),
not a reference.

### Axis entries and zones (the zone-matrix lens)

A **zone matrix** ([concepts](../01-concepts/), [decomposition](../07-decomposition/)) adds **no new
node kind** — it is a lens realised in references and edges, preserving *one node ⟷ one primitive*:

- **An axis entry is a reference.** Each vertical and each horizontal is a `kind: reference` artefact
  carrying an **`axis: vertical | horizontal`** tag, an **optional `scope`** (the code-map region it
  covers — a path set for a horizontal; entry-points + traversed modules for a vertical), and
  `references` to the contract/spec that governs it. It owns no control flow.
- **A zone rule carries axis references.** A rule that applies to part of the matrix carries plain
  **`references` edges to the axis entries it concerns** — there is **no `applies-to` block and no new
  edge type**. Its reach is read by resolving each target and checking for an `axis` field (a target
  without one is ordinary content): 1 vertical + 1 horizontal = a **cell** rule, one axis only = a
  **column** / **row** rule, neither = **global**; an unconstrained axis means *all* its values.
  Specificity ranks **cell > column > row > global** (column > row on a tie). A contradiction with no
  higher-specificity rule to resolve it is surfaced, never silently merged.
- **A zone is derived, never authored.** A zone (cell) is the **intersection of one vertical's scope
  and one horizontal's scope over the code-map**, computed at read time — not a node, not a reference,
  not stored. Resolution is a read-time agent mode (`explore`'s `zone` mode) answering either a single
  **cell `(V,H)`** or a whole **column `(V,*)`** (the vertical's contract + the union of its rules +
  the code-map-traced cross-layer path). Not a build step, not new tooling.

The axes are **harness content**: the factory ships the lens shape (`axis-entry-schema`), the harness
supplies the entries ([harness-spec](../04-harness-spec/)).

## Handbook-references

A reference carries a **`kind`**. The default, `reference`, is the standard shared content
above — node-bound, flat in `graph/_refs/`, not operator-facing. A **`handbook-reference`** is
canonical, top-level "how the system works" content that *also* renders into the operator
handbook (the rendered union of all handbook-references — the render is in
[plugin-spec](../03-plugin-spec/), ownership and overlay in [harness-spec](../04-harness-spec/)).
Not every reference is a handbook entry; a standard reference is **promoted** when it proves to
be canonical. Handbook-references live in a **sectioned** home (`NN-section/`), standard
references stay flat in `graph/_refs/` — one layer, two storage homes.

A handbook-reference adds frontmatter over the reference base:

```yaml
kind: handbook-reference
id: <slug>
type: concept             # concept | procedure | spec | domain | index — gates the template
title: <title>
section: <section>        # groups + orders the entry in the rendered handbook
owner: sg                 # sg (vendored, dominant) | local (harness)
read-when: <trigger>      # one sentence; agent discovery
related: [<slug>, ...]    # the page-graph (bidirectional, curator-enforced)
extends: stack-graph:<id> # local-only; additive overlay onto a vendored entry
status: vX.Y.Z — YYYY-MM-DD
```

- **No `number`** — numbering is **computed at render** from document order (section +
  position), never stored in an id, slug, or cross-reference; insert or reorder and everything
  renumbers. Identity is the **stable slug + author-assigned concept anchors** (`{#tag}`,
  kebab-case, never numeric). The build emits an anchor manifest; a **fragment-lint** validates
  every in-body `[text](slug#anchor)` cross-reference against it.
- **No `managed-by`** — maintenance is the **`maintains`** edge: the nodes holding a `maintains`
  edge into the entry keep it current, and the record projects `maintained_by`. A local entry
  with none is an orphan (validate flags it); a vendored entry is maintained by the
  external/factory maintainer.
- **`owner` + `extends`** — `owner` is provenance (`sg` vendored, `local` harness). A local
  entry that touches a vendored topic must declare `extends`, and `extends` is **adds-only**: it
  may add anchors/sections, never redefine a vendored anchor or contradict a vendored normative
  claim. The boundary is a **hard integrate gate**, not advice ([harness-spec](../04-harness-spec/)).

## The node file

A node is **one canonical markdown file** — graph frontmatter **+** imperative body — that
serves three consumers: the **builder** (emits a valid `.claude` primitive), the
**renderer** (authoring/review view), and the **index** (the graph + analytics record).
The frontmatter is a superset, grouped by consumer.

```yaml
---
# identity — native .claude (the builder emits the primitive from these)
id: outcome-design
primitive: skill                # skill | agent | command | script
title: Outcome-focused design
description: Derive build decisions from the operator's intended outcomes, scenario by scenario.
when-to-use: Aligning a design collaboratively; turning desired outcomes into technical decisions.
model: opus
allowed-tools: [Read, Edit, Agent]
# classification — graph lens
mode: collaborative             # collaborative→skill | autonomous→agent (must agree with `primitive`)
determinism: generative         # deterministic | generative
# edges — the graph (scanned from here into the record)
edges:
  invokes:       [{ id: question-surfacer }]
  loads:         [{ id: brand-voice }]
  references:    [{ id: decisions-store }]
  composes-into: [{ id: dev-sprint, stage: design }]
  can-follow:    [{ id: align-context }]
  precedes:      [{ id: specify }]
# analytics — the loop (fields specified in 06-analytics)
goals:
  - outcome: Operator's intended outcomes captured as explicit technical decisions.
    metric: decisions recorded / session; downstream design-rework rate.
    earns-keep: rework rate below baseline over N sprints.
status: v0.1.0 — 2026-05-30
---

# the imperative body: the skill/agent instructions; shared content via `references`
# edges (load: import | on-demand), single-sourced by the build (see 03-plugin-spec)
```

`primitive:` names the `.claude` element this node builds into — using the Claude
taxonomy, not an invented type. `mode:` must agree with it (collaborative↔skill,
autonomous↔agent). `status:` is required **on node files** (a node versions the primitive it
builds into) — unlike handbook pages, which carry no status.

## Storage & projection

**Files are canonical; the graph is a derived lens, not a separate store.** A node file is
a valid `.claude` primitive file with graph frontmatter *added* — Claude ignores the extra
keys (`edges`, `mode`, `goals`), so the file already works in place. The graph **record**
is generated by scanning those frontmatter `edges` across all `.claude` directories (the
global record for analytics — see
[concepts](../01-concepts/)).

The **build projects** each node file (the authoring view) into (1) a clean native
`.claude` file — native fields + the body with `@-import` pointers resolved, graph keys stripped (the
rendered view) — and (2) its rows in the graph record. One source, three consumers, no
second database. Build mechanics: [plugin-spec](../03-plugin-spec/).

## Field notes

Resolutions to gaps an author hits against the schema above:

- **Required vs native-passthrough frontmatter.** Required on every node: `id`,
  `primitive`, `title`, `description`, `mode`, `determinism`, `edges`, `goals`,
  `status`. Everything else (`when-to-use`, `model`, `allowed-tools` / `tools`,
  `argument-hint`, …) is a **native `.claude` field** — optional, carried through
  verbatim by the builder, following the primitive's own schema. This spec does not
  re-enumerate them.
- **`mode` on a `command` or `script`.** Same rule as skill/agent: `collaborative` if it
  pauses for the operator, `autonomous` if it runs to a result unattended. A command that
  is a thin alias with no logic of its own is **not a node** — it is an `invokes` edge.
  (Commands are legacy — folded into the skills mechanism; author new logic as a skill.)
- **`overlay` entry shape.** `{ target: <global-node-id>, via: <edge-type> }` — a local
  overlay node declares which vendored node it attaches to and the edge type it adds.
  Additive only; it never rewrites the target.
- **`triggers` is not authored in a node's `edges`.** A hook declares its trigger
  binding in the hook's own config (event → node); node files carry no `triggers` array.
  The record derives `triggers` edges from hook configs, not from node frontmatter.
