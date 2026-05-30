---
title: Graph specification
type: spec
read-when: Defining or implementing the node/edge model, the node schema, or storage.
related: [concepts, decomposition, plugin-spec]
status: v0.1.0 — 2026-05-30
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
| **skill** | **node** (collaborative) |
| **agent** | **node** (autonomous) |
| **command** | **node** if it carries its own procedure; else an `invokes` edge (a thin alias to a skill/agent) |
| **script** (`bin/` executable) | **node**, reached by an `invokes` edge |
| hook | `triggers` **edge** — the handler it points to is the node (or inline) |
| MCP server / call | **inline** (or an `invokes` edge when the tool is node-like) |
| reference — CLAUDE.md/memory, brand asset, schema, decision, output-style | `references` **endpoint** — a referenced artefact, not a branching node |
| settings | **attribute / environment** — the loading context, not a graph element |

This follows the discriminator: only things that own control flow earn a node.

## Granularity

**One node per primitive** by default — one skill is one node, with its modes as inline
branches in the body (precedent: gstack `office-hours` holds startup/builder modes in a
single skill, not two). Promote a mode to its own node **only when it earns a split** — a
distinct goal you would measure separately, distinct branching, or a different
collaborative/autonomous nature. Let goals draw the boundary (see decomposition). This
resolves Q1: nodes are per-primitive; junctions are inline unless measured apart.

## Edges

All edges are **directed** (`from → to`) and typed:

| edge | from → to | class | cycles? |
|---|---|---|---|
| `loads` | node → node / reference | structural | no |
| `invokes` | node → node (agent / script / command) | structural | no |
| `composes-into` | node → workflow (or parent node) | structural | no |
| `references` | node → referenced artefact | structural | no |
| `triggers` | event → node | binding | no |
| `precedes` | node → node | **process** | **yes** |
| `can-follow` | node → node | **process** | **yes** |
| `overlay` | overlay-node → global node | composition | no |

`overlay` is the harness mechanism (a local node attaches to the vendored graph; see
[harness-spec](../04-harness-spec/)). `triggers` is how a hook is modelled — a binding
from an event to the node it fires.

## Cyclic semantics

Structural, binding, and composition edges (`loads`, `invokes`, `composes-into`,
`references`, `triggers`, `overlay`) are **acyclic** — a load/invoke cycle is a defect.
The **process edges `precedes` / `can-follow` are the only ones that may cycle**, and that
is exactly how a workflow loops: the dev sprint closes with `debrief --can-follow→ intake`,
and the review↔build correction is a `can-follow` loop. This resolves Q2: keep the
structural skeleton a DAG; put every loop on a process edge.

## Inline

Small references and **MCP calls live inline in a node body**, not as nodes or edges —
they have no control flow of their own. Precedent: the Be Civic corpus inline tags
(`<Skill>`, `<Ref>`, `<VV>`). An edge appears only when the thing invoked is itself
node-like (a script with logic → an `invokes` edge).

## The node file

A node is **one canonical markdown file** — graph frontmatter **+** imperative body — that
serves three consumers: the **builder** (emits a valid `.claude` primitive), the
**renderer** (authoring/review view), and the **index** (the graph + analytics record).
The frontmatter is a superset, grouped by consumer. This resolves Q3.

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
  can-follow:    [{ id: orient }]
  precedes:      [{ id: specify }]
# analytics — the loop (fields specified in 06-analytics)
goals:
  - outcome: Operator's intended outcomes captured as explicit technical decisions.
    metric: decisions recorded / session; downstream design-rework rate.
    earns-keep: rework rate below baseline over N sprints.
status: v0.1.0 — 2026-05-30
---

# the imperative body: the skill/agent instructions,
# with resolver placeholders ({{...}}) the builder expands (see 03-plugin-spec)
```

`primitive:` names the `.claude` element this node builds into — using the Claude
taxonomy, not an invented type. `mode:` must agree with it (collaborative↔skill,
autonomous↔agent).

## Storage & projection

**Files are canonical; the graph is a derived lens, not a separate store.** A node file is
a valid `.claude` primitive file with graph frontmatter *added* — Claude ignores the extra
keys (`edges`, `mode`, `goals`), so the file already works in place. The graph **record**
is generated by scanning those frontmatter `edges` across all `.claude` directories (the
global record for analytics; the scoped view per directory at runtime — see
[concepts](../01-concepts/)).

The **build projects** each node file into (1) a clean native `.claude` file — native
fields + the body with resolvers expanded, graph keys stripped — and (2) its rows in the
graph record. One source, three consumers, no second database. Build mechanics:
[plugin-spec](../03-plugin-spec/).

## Field notes

Resolutions to gaps an author hits against the schema above:

- **Required vs native-passthrough frontmatter.** Required on every node: `id`,
  `primitive`, `title`, `description`, `mode`, `determinism`, `edges`, `goals`,
  `status`. Everything else (`when-to-use`, `model`, `allowed-tools` / `tools`,
  `argument-hint`, …) is a **native `.claude` field** — optional, carried through
  verbatim by the builder, following the primitive's own schema. This spec does not
  re-enumerate them.
- **`mode` on a `command` or `script`.** Same rule as skill/agent: `collaborative` if it
  pauses for the operator, `autonomous` if it runs to a result unattended. A command
  that is a thin alias with no logic of its own is **not a node** — it is an `invokes`
  edge.
- **`overlay` entry shape.** `{ target: <global-node-id>, via: <edge-type> }` — a local
  overlay node declares which vendored node it attaches to and the edge type it adds.
  Additive only; it never rewrites the target.
- **`triggers` is not authored in a node's `edges`.** A hook declares its trigger
  binding in the hook's own config (event → node); node files carry no `triggers` array.
  The record derives `triggers` edges from hook configs, not from node frontmatter.
