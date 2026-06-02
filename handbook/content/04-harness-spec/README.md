---
title: Harness specification
type: spec
read-when: Defining how a consuming workspace customises the vendored graph.
related: [plugin-spec, graph-spec, analytics, harness-spec/directory-topology, concepts]
---

# Harness specification

A **harness** is a consuming workspace's specialising layer over the vendored, general
stack-graph. It is where the **workspace** puts its own instructions, nodes, and arcs — a
workspace may span several products and functions, so "harness-local" means specific to that
workspace, not to a single product. The factory stays general; everything workspace-specific
lives in a harness, never in this repo. The concrete on-disk layout is the
[directory topology](01-directory-topology.md).

## What lives where

| In the factory (vendored) | In the harness (local) |
|---|---|
| General nodes, edges, and the loop machinery | Workspace-specific nodes and arcs (per product/function) |
| The build, the graph model, the maintainer | The workspace's `CLAUDE.md` and instructions |
| Namespaced `stack-graph:*` | Local entry nodes + edges into the vendored graph |

## Instantiating a harness (ships via the plugin)

A harness is **stood up by the plugin itself**, not hand-assembled. The vendored `harness-init`
skill — run in the consuming workspace — writes `<org-root>/.claude/bindings.yaml` from the
**bindings contract** (the shipped `bindings-contract` reference: the key set, the file format, and
the dashboard surface-structure template), scaffolds the empty, bound surface skeleton, and
**validates** that every required binding resolves before the loop runs. So the *means* to
instantiate a harness ships in the plugin — the contract, the template, and the capability — while
the consuming workspace supplies only the values and content. `harness-init` writes harness-local
files only (never the vendored graph) and scaffolds empty structure; content — work items, OKRs,
strategy — is filled by the curator family (`product-dashboard-curator`, `strategy-curator`),
not by `harness-init`.

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

### The handbook — vendored + local composition

The **handbook is the rendered union** of factory-vendored handbook-references (dominant,
read-only) plus the harness's own local handbook-references, composed and ownership-badged
by the build ([`plugin-spec`](../03-plugin-spec/README.md)). Factory entries render their
content *into* the product handbook — they are not merely pointers to external content.
A harness extends this by adding local handbook-references alongside.

A vendored node that touches the consuming product's handbook (the curator, the drift
detector, a context-gathering or design node) depends on it through a `handbook`
`external: true` reference ([`graph-spec`](../02-graph-spec/README.md)), carrying
`load: on-demand`. The node reads its binding and navigates pages at the step of need; the
overlay supplies the path and page index. The vendored node body stays untouched; the overlay
resolves the binding — never a body splice.

## Extend-only

An overlay may only **add** — a new node, or a new edge into a vendored node. It may **not**
shadow, replace, or re-route a vendored node's behaviour. The vendored graph therefore
behaves identically in every workspace; two consumers on the same vendored graph cannot
diverge. (A local-override capability is a named future option, deliberately out of v1.)

The same discipline governs the **reference layer**: a local handbook-reference that touches
a vendored topic must declare `extends: stack-graph:<id>`, and `extends` is **adds-only** —
it may add new anchors and sections under the vendored topic, never redefine an existing
vendored anchor or contradict a vendored normative claim.

**Conflict is a hard integrate gate**, not advice. Two conditions fail integrate as structural
checks — before merge, not as warnings:

- An **undeclared vendored-slot overlap** — a local entry whose id or anchor collides with a
  vendored entry without an explicit `extends` declaration.
- An **`extends` that redefines a vendored anchor** — any local section whose anchor matches
  an existing vendored anchor.

The curator's **consistency-checker** is the best-effort **semantic backstop** for subtler
duplication or logical contradiction — a quality signal run after the structural gate passes,
not the gate itself.

**The factory wins on any conflict.** The harness's governed recourse is the
**raise-to-factory** path: propose an amendment to the factory entry, pull the updated
vendored entry after it lands. The harness never edits a vendored entry in place.

## Never mutate

Vendored files are read-only to the harness. Overlays live entirely in the harness's own
files. Updates to the vendored graph arrive through native plugin-update
([`plugin-spec`](../03-plugin-spec/README.md)) and never collide with overlays, because
overlays only add and the vendored ids are namespaced apart.

Vendored **handbook-references** follow the same rule. Each carries a `maintains` edge from
an external/factory maintainer (recorded in the graph with `external: true` on that edge);
`owner: sg` on the entry frontmatter is provenance. A harness never edits a vendored entry
in place — changes to a factory entry go through raise-to-factory ([`devops`](../08-devops/README.md)).

## Crystallized outputs

A product-dependent node accumulates workspace-specific outputs as it runs
([`analytics`](../06-analytics/README.md)). These are **not a new kind** — they are
**references** (a checklist or manifest the node reads) and **scripts** (executables the node
invokes), the canonical `.claude` primitives ([`graph-spec`](../02-graph-spec/README.md)). They
are **harness-local**: a local node carries them in its own bundle; a **vendored** (read-only)
node grows them in the harness overlay and reaches them by a stable `external: true` `references`
edge (the manifest) and `invokes` edges (scripts) — so the node body never changes, only the
manifest and scripts grow. New or changed ones are gated at `reconcile`, like any other change.

## Harness-supplied surfaces

A harness contributes several surfaces beyond nodes and edges. These are harness-local state
and configuration that the factory graph depends on but cannot supply — they are product- or
workspace-specific by definition.

- **Personas** — a function-owned surface (typically maintained under the function's own
  node-bundle) that the experience thread consumes to drive scenario simulation. The function
  that owns the product's target-user definitions maintains personas; the experience thread
  reads them as an `external: true` reference. Personas are not an experience-thread artefact
  — they are a cross-thread input to it.

- **Maturity posture** — harness-local state recording the current rigour level of the
  process. The maturity × tier dial ([`concepts`](../01-concepts/README.md)) sets default
  gate evidence bars; the posture value is a per-product harness configuration that feeds
  that dial, not a factory-supplied default.

- **Experience contract** — the harness-supplied intended-experience specification that the
  experience thread grades against. It declares the UX invariants and named failure modes the
  product must hold, plus the AX budgets (tokens, latency, intended tool-path). It is an
  `external: true` reference consumed by the experience-thread nodes; the factory ships the
  pointer, the harness supplies the target. Its content is product-specific and therefore
  always local — a factory node could not author it.

## Namespacing

Vendored nodes carry the `stack-graph:` prefix; local nodes are harness-prefixed (e.g.
`<harness>:`) or unprefixed-local. The prefix guarantees a local node id never collides with
a vendored one. A local node that fills a similar role to a vendored node is simply a
distinct node with its own id; the operator chooses which to invoke.

## Composition across a tree

Claude's cascade is **partial**, and the split is **verified against real behaviour**:

- **Skills and `CLAUDE.md` cascade** — up the tree to the launch directory, and **lazily down**:
  a subdirectory's skills and `CLAUDE.md` load when the agent reads a file there, and skills
  hot-reload without a restart.
- **Agents, hooks, and settings are launch-directory-scoped** — they do **not** cascade or
  lazy-load. Only those present at the **launch directory** (or user/plugin scope) **at startup**
  are active; a subdirectory's agents never activate, and a newly-authored agent needs a relaunch.
- Therefore a harness keeps **one `.claude` at the launch directory**, always launched there, and
  **all** local nodes — skills *and* agents — live in it. There is **no generated composed or
  scoped view**: with everything at the single launch directory there is nothing to merge. (A
  multi-directory-overlay mode, and the composition it would require, is deferred.)
- A single **global record** across `.claude` directories is still generated for administration
  and analytics ([`analytics`](../06-analytics/README.md)) only — not for runtime resolution.

## The workspace

A harness's **workspace** is a dedicated top-level directory holding the consuming venture's
**canonical and critical documents** — the handbook plus each function's critical-output surface —
rendered as **one navigable space**, so an operator finds the most important information in a single
place. Product and working-project directories sit **beside** the workspace, not inside it; they
hold working files and reference the workspace's canon. Working content **graduates** into a
workspace surface through that surface's curator.

This sets the deployment topology: the vendored graph at **user scope**; an **org-root** directory
as the cascade anchor (it carries the ambient handbook-index pointer, which reaches the workspace
and every sibling child — a sibling could not); the **workspace**; and the **product / working
children**.

The render that presents the workspace's surfaces as one space is **build machinery**, kept out of
the content in a dedicated build directory.

**Open — owned here:** whether and how the **factory builds and vendors the workspace render** (so
a consumer receives the unified-space build from the factory rather than maintaining its own) is
not settled. Current posture is a **harness-provided** render; standardising it into the vendored
surface is a parked responsibility, not a near-term one.

## Vendoring posture

A harness lives in its own consuming workspace, never in this repo. The current posture is
**fully-vendored** — the whole graph ships from the factory and the harness adds local
extensions on top. A generalised-graph-plus-local-extensions split is a future option.
