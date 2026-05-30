---
title: Harness specification
type: spec
read-when: Defining how a consuming workspace customises the vendored graph.
related: [plugin-spec, graph-spec, analytics]
---

# Harness specification

A **harness** is a consuming workspace's specialising layer over the vendored, general
stack-graph. It is where a product puts its own instructions, nodes, and arcs. The factory
stays general; everything product-specific lives in a harness, never in this repo.

## What lives where

| In the factory (vendored) | In the harness (local) |
|---|---|
| General nodes, edges, and the loop machinery | Product-specific nodes and arcs |
| The build, the graph model, the maintainer | The product's `CLAUDE.md` and instructions |
| Namespaced `stack-graph:*` | Local entry nodes + edges into the vendored graph |

## The additive overlay model

A harness customises by **adding**, in the same node-file format as the factory:

- **Local nodes** — new skills/agents the product needs, authored exactly as vendored nodes
  ([`graph-spec`](../02-graph-spec/README.md)).
- **Entry nodes** — top-level local nodes the operator invokes, which then traverse into
  vendored nodes.
- **Connecting edges** — an `overlay` edge `{ target: <vendored-node-id>, via: <edge-type> }`
  declares that a local node attaches to a named vendored node by adding one edge of the
  given type.

The result is one traversable graph: a traversal can start in a local entry node and cross
into vendored branches.

## Extend-only

An overlay may only **add** — a new node, or a new edge into a vendored node. It may **not**
shadow, replace, or re-route a vendored node's behaviour. The vendored graph therefore
behaves identically in every workspace; two consumers on the same vendored graph cannot
diverge. (A local-override capability is a named future option, deliberately out of v1.)

This is why there is **no precedence or conflict resolution** in the model: overlays never
contend for a vendored node's slot, so there is nothing to resolve.

## Never mutate

Vendored files are read-only to the harness. Overlays live entirely in the harness's own
files. Updates to the vendored graph arrive through native plugin-update
([`plugin-spec`](../03-plugin-spec/README.md)) and never collide with overlays, because
overlays only add and the vendored ids are namespaced apart.

## Namespacing

Vendored nodes carry the `stack-graph:` prefix; local nodes are harness-prefixed (e.g.
`<harness>:`) or unprefixed-local. The prefix guarantees a local node id never collides with
a vendored one. A local node that fills a similar role to a vendored node is simply a
distinct node with its own id; the operator chooses which to invoke.

## Composition across a tree

Claude's cascade is **partial**, so composition rides it where it works and generates a
view where it does not:

- **Skills and `CLAUDE.md` cascade natively** — up the tree, and lazily down. No generation
  needed.
- **Agents, hooks, and settings do not nest.** For these, stack-graph **generates a
  composed view**.
- The **scoped view** — what a given directory sees: the vendored graph **+** its ancestors'
  overlays **+** its own — is generated at a **runtime preamble**, because it depends on the
  working directory.
- A single **global record** across all `.claude` directories is generated for
  administration and analytics ([`analytics`](../06-analytics/README.md)) only — not for
  runtime resolution.

## Vendoring posture

A harness lives in its own consuming workspace, never in this repo. The current posture is
**fully-vendored** — the whole graph ships from the factory and the harness adds local
extensions on top. A generalised-graph-plus-local-extensions split is a future option.
