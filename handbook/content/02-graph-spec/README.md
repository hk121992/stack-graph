---
title: Graph specification
type: spec
read-when: Defining or implementing the node/edge model, the node schema, or storage.
related: [concepts, decomposition, plugin-spec]
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

## Granularity — two views of one graph

The **authoring view is granularity-flexible**: a skill, one of its **modes**, a sub-arc,
or a step may each be a node, carrying its own goal and edges, primitive-agnostic. It
**renders** into a flat, ordinary-looking `.claude` directory where **one node per
primitive** holds — one skill is one `SKILL.md`, and a node's modes render as branches in
its body or as sibling files.

Decide *what is a node* by the [decomposition](../07-decomposition/) rule (reuse / cohesion
/ just-in-time); decide *how it renders* at build time. "Modes-as-nodes" is therefore
allowed in the authoring view and collapses or expands at the render. (This supersedes the
earlier "one node per primitive, modes always inline" framing — that describes only the
rendered view.)

## Edges

All edges are **directed** (`from → to`) and typed:

| edge | from → to | class | cycles? |
|---|---|---|---|
| `loads` | node → node / reference | structural | no |
| `invokes` | node → node (agent / script / command) | structural | no |
| `composes-into` | node → arc (or parent node) | structural | no |
| `references` | node → referenced artefact | structural | no |
| `triggers` | event → node | binding | no |
| `precedes` | node → node | **process** | **yes** |
| `can-follow` | node → node | **process** | **yes** |
| `overlay` | overlay-node → global node | composition | no |

`overlay` is the harness mechanism (a local node attaches to the vendored graph; see
[harness-spec](../04-harness-spec/)). `triggers` is how a hook is modelled — a binding
from an event to the node it fires. `composes-into` targets an **arc** (a traversal), which
is derived from edges, not a node file — so the maintainer does not resolve it to a file.

## Cyclic semantics

Structural, binding, and composition edges (`loads`, `invokes`, `composes-into`,
`references`, `triggers`, `overlay`) are **acyclic** — a load/invoke cycle is a defect.
The **process edges `precedes` / `can-follow` are the only ones that may cycle**, and that
is exactly how an arc loops: the dev sprint closes by looping `debrief --can-follow→ align-context`,
and the review↔build correction is a `can-follow` loop. This resolves Q2: keep the
structural skeleton a DAG; put every loop on a process edge.

## Inline

Small references, **MCP calls, and execution surfaces** live inline in a node body, not as
nodes or edges — they have no control flow of their own. Precedent: the Be Civic corpus
inline tags (`<Skill>`, `<Ref>`, `<VV>`). An edge appears only when the thing invoked is
itself node-like (a script with logic → an `invokes` edge).

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
  can-follow:    [{ id: align-context }]
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
autonomous↔agent). `status:` is required **on node files** (a node versions the primitive it
builds into) — unlike handbook pages, which carry no status.

## Storage & projection

**Files are canonical; the graph is a derived lens, not a separate store.** A node file is
a valid `.claude` primitive file with graph frontmatter *added* — Claude ignores the extra
keys (`edges`, `mode`, `goals`), so the file already works in place. The graph **record**
is generated by scanning those frontmatter `edges` across all `.claude` directories (the
global record for analytics; the scoped view per directory at runtime — see
[concepts](../01-concepts/)).

The **build projects** each node file (the authoring view) into (1) a clean native
`.claude` file — native fields + the body with resolvers expanded, graph keys stripped (the
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
