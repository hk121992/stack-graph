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
| `overlay` | overlay-node → global node | composition | no |

`overlay` is the harness mechanism (a local node attaches to the vendored graph; see
[harness-spec](../04-harness-spec/)). `triggers` is how a hook is modelled — a binding
from an event to the node it fires. `composes-into` targets an **arc** (a traversal), which
is derived from edges, not a node file — so the maintainer does not resolve it to a file.
**`maintains`** records that a node keeps a **handbook-reference** current; the record projects
the reverse as `maintained_by` (symmetric to `consumed_by` for `references`). A vendored
(`owner: sg`) entry carries a `maintains` edge from an **external/factory maintainer** (marked
`external: true`), so "who maintains an entry" is uniformly graph-derived, never a special case.

## Cyclic semantics

Structural, binding, and composition edges (`loads`, `invokes`, `composes-into`,
`references`, `maintains`, `triggers`, `overlay`) are **acyclic** — a load/invoke cycle is a defect.
The **process edges `precedes` / `can-follow` are the only ones that may cycle**, and that
is exactly how an arc loops: the dev sprint closes by looping `debrief --can-follow→ align-context`,
and the review↔build correction is a `can-follow` loop. The structural skeleton stays a DAG;
every loop rides a process edge.

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
representable — a scalar "stage" represents none of them. A **gate** advances `lifecycle_state`
and writes a `gate_decisions` entry; gate rigour is set by the **maturity × tier dial**
([concepts](../01-concepts/)). A carrier is **not a node** — it is an instance flowing through
the graph; a node (a curator) maintains the carrier surface and syncs `current_stage` as the arc
progresses (a **state mechanism**, not a `composes-into` edge). What the lifecycle states, stages,
and gates *are* is a domain concern — a delivery process's roadmap item is one carrier.

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

Shared content destined for a spawned **agent** (e.g. a lens's finding contract) is passed by
the orchestrator into the agent's **spawn prompt**, not imported by the agent — the orchestrator
holds the reference and fills it into the subagent's prompt at dispatch.
Behaviour that must be *enforced* rather than merely present is a **hook** (a `triggers` edge),
not a reference.

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
