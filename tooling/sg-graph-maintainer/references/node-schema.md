---
title: Node schema — authoring reference
type: reference
status: v0.1.0 — 2026-05-30
---

# Node schema — authoring reference

Terse authoring-facing summary of the 02-graph-spec node schema and edge taxonomy.
Authoritative source: `handbook/content/02-graph-spec/README.md`. When this file and
the spec diverge, the spec wins.

## What is a node

A node is a logic-owning, invokable `.claude` primitive — it owns its own branching or
sequencing. A node file is one canonical markdown file: graph frontmatter + imperative
body. The same file is triple-consumer: the builder strips graph keys and produces a
clean `.claude` primitive; the renderer shows the authoring/review view; the index
scans it for the graph record.

**Only primitives with control flow earn a node.** If the thing is merely reached or
invoked (no logic of its own), model it as an edge. If it is a one-shot reference or
MCP call, keep it inline in a node body.

## Required frontmatter fields

| field | values | notes |
|-------|--------|-------|
| `id` | kebab-case string | matches folder name under `graph/` |
| `primitive` | `skill` / `agent` / `command` / `script` | Claude taxonomy only — no invented types |
| `title` | string | human-readable name |
| `description` | string | one sentence; what the node does |
| `when-to-use` | string | one sentence; operator trigger condition |
| `mode` | `collaborative` / `autonomous` | must agree with `primitive:` (see table below) |
| `determinism` | `deterministic` / `generative` | algorithmic → deterministic; judgment → generative |
| `edges` | object of typed arrays | see Edge taxonomy below |
| `goals` | array of `{outcome, metric, earns-keep}` | at least one entry; goals as outcomes |
| `status` | `vX.Y.Z — YYYY-MM-DD` | terse; no prose |

## Optional frontmatter fields

| field | notes |
|-------|-------|
| `model` | node-specific model tier (opus / sonnet / haiku); omit if not specified |
| `allowed-tools` | array of tool names; omit if not node-specific |

## `primitive:` ↔ `mode:` agreement

This constraint is enforced by validate mode. Violations are hard failures.

| `primitive:` | required `mode:` | rationale |
|---|---|---|
| `skill` | `collaborative` | skills engage the operator |
| `agent` | `autonomous` | agents run unattended |
| `command` | `collaborative` or `autonomous` | depends on whether it engages the operator |
| `script` | `autonomous` | scripts run unattended to a result |

## Edge taxonomy

All edges are directed (`from → to`). Structural and composition edges are acyclic.
Process edges (`precedes`, `can-follow`) are the only edges that may cycle —
that is exactly how an arc loops.

| edge type | from → to | class | may cycle? |
|-----------|-----------|-------|-----------|
| `invokes` | node → node (agent / script / command) | structural | no |
| `loads` | node → node / reference | structural | no |
| `composes-into` | node → arc or parent node | structural | no |
| `references` | node → reference (`graph/_refs/<id>.md`) or node; carries `load: import \| on-demand` (D33) | structural | no |
| `maintains` | node → handbook-reference (or external/factory maintainer → entry, marked `external: true`) | structural | no |
| `triggers` | event → node | binding | no |
| `precedes` | node → node | process | yes |
| `can-follow` | node → node | process | yes |
| `escalates` | stage node → entry node of another arc | process | no |
| `overlay` | overlay-node → global node | composition | no |

**`maintains`** records that a node keeps a **handbook-reference** current (a node →
handbook-reference edge). `index` projects its reverse per entry as **`maintained_by`**
(symmetric to `consumed_by` for `references`). A vendored (`owner: sg`) handbook-reference
carries its `maintains` edge from an **external/factory maintainer**, marked `external: true`
— so "who maintains an entry" is uniformly graph-derived, never a special case. Standard
`reference` entries are not valid `maintains` targets.

**`escalates`** is a one-way **cross-arc** handoff — a stage node in one arc points at the
**entry node of another arc** (e.g. an incremental loop's triage stage → the dev-sprint front
node `align-context`). Entry shape: `{ id: <target-node-id> }`. It is **not `precedes`**: it is
excluded from arc traversal and stage projection, so an escalation never reads as ordinary
next-stage flow. It is one-way and acyclic (never forms a loop). Its runtime behaviour
(create-or-reuse the target carrier; close the source standalone carrier as `dropped`,
reason promoted; record a two-way provenance link) is spec prose, not edge metadata.

**Arc-qualified process edges.** A `precedes` / `can-follow` edge may carry an optional `arc`
qualifier — `{ id: <target>, arc: <arc-id> }` — when its source node participates in more than one
arc and the edge belongs to only one of them. It scopes the edge to that arc; an unqualified
process edge applies in every arc the source participates in. This stops a shared node's
arc-specific edge from shortcutting another arc (e.g. `review → land` belongs to the incremental
arc only; the dev-sprint path stays `review → reconcile → land`). The qualifier carries into the
record on the edge row.

**Inline, not an edge:** one-shot MCP calls and small references that live in a node
body. An edge appears only when the thing invoked is itself node-like.

**`triggers` is not authored here.** The `triggers` binding is a hook-to-node
relationship; it is modelled on the hook's side, not the node's frontmatter.

## Goals — outcomes not activities

Every `goals:` entry must read as an **outcome** (what the node achieves and how you
know it earned its keep), not an **activity** (what the node does).

| bad (activity) | good (outcome) |
|---|---|
| "Runs the test suite" | "Test regressions caught before merge; zero escapes to main in N sprints" |
| "Understand admin" | "Operator has a clear next action within 5 minutes of invocation" |
| "Validates frontmatter" | "Schema violations surfaced before any node is vendored" |

Each entry shape:

```yaml
goals:
  - outcome: <what the node achieves>
    metric: <how you would measure it>
    earns-keep: <threshold or condition — when does this node earn its place in the graph>
```

## Storage

Files are canonical. The graph is a derived lens, not a separate store. The
`graph-record.json` produced by `index` mode is an analytics artefact — it is not the
source of truth. Edit node files, then re-run `index`.

Builder projection: the build strips `mode:`, `determinism:`, `edges:`, `goals:` from
the frontmatter and single-sources any shared **reference** the node depends on
(`references` edge → `graph/_refs/<id>.md`) into the consumer — `load: import` becomes a
native `@-import`, `load: on-demand` a pointer the agent reads at the step of need (D33).
There is no `{{token}}` injection. The graph keys are ignored by Claude at runtime; they are
purely for the graph machinery.

## References — `kind: reference` vs `kind: handbook-reference`

A reference is **not a node** (no `primitive`/`mode`/`goals`/process edges). Every reference
carries a **`kind`** that picks its storage home and frontmatter shape:

| `kind:` | what it is | home | operator-facing |
|---|---|---|---|
| `reference` | standard shared content (a schema, a protocol, the preamble) — node-bound | `graph/_refs/<id>.md` (flat) | no |
| `handbook-reference` | canonical "how the system works" content that *also* renders into the handbook | a sectioned home, `NN-section/<id>.md` | yes |

A standard `reference` carries only `kind: reference`, `id`, `title`, `description`, `status`.
A **`handbook-reference`** adds frontmatter over that base:

```yaml
kind: handbook-reference
id: <slug>
type: concept             # concept | procedure | spec | domain | index — gates the render template
title: <title>
section: <section>        # groups + orders the entry in the rendered handbook
owner: sg                 # sg (vendored, dominant) | local (harness)
read-when: <trigger>      # one sentence; agent discovery
related: [<slug>, ...]    # the page-graph (bidirectional)
extends: stack-graph:<id> # local-only; additive overlay onto a vendored entry
status: vX.Y.Z — YYYY-MM-DD
```

Identity rules for a handbook-reference:

- **Concept anchors `{#tag}`** in the body are the stable identity for cross-references —
  **kebab-case, never numeric**.
- **No `number`** — numbering is **computed at render** by the build from document order;
  never store a number in an id, slug, or cross-reference.
- **No `managed-by`** — maintenance is the **`maintains`** edge (the nodes that hold a
  `maintains` edge into the entry keep it current; the record projects `maintained_by`).
- **`extends` is local-only and adds-only** — a `local` entry that touches a vendored topic
  declares `extends: stack-graph:<id>`; it may add anchors/sections but never redefine a
  vendored anchor or contradict a vendored normative claim.

Not every reference is a handbook entry; a standard reference is **promoted** to a
handbook-reference when it proves to be canonical. One layer, two storage homes.

## The carrier (not a node)

The **carrier** (`lifecycle_state`, `current_stage`, `children`, `gate_decisions[]`,
`transition_history[]`) is a **runtime state model** defined in
`handbook/content/02-graph-spec/README.md#the-carrier` — the work-item that flows through an
arc. It is **not a node** and the maintainer does **not** author carriers; a node (a curator)
maintains the carrier surface at runtime via a state mechanism, not a `composes-into` edge.
