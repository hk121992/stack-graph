---
title: Directory topology
type: spec
read-when: Laying out a consuming workspace on disk — where the vendored graph, the overlay, the canon, working files, and generated data live.
related: [harness-spec, plugin-spec, graph-spec, analytics]
---

# Directory topology

The on-disk layout of a consuming workspace. It follows one rule — **scope by ownership and
mutability** — and one operating assumption — **Claude is always launched at the org root**
(because agents are launch-directory-scoped; see [`harness-spec`](README.md) "Composition across
a tree").

## Scope roles

| Role | Location | Holds | Mutability |
|---|---|---|---|
| **User scope** | `~/.claude/` | the vendored stack-graph plugin (general, `stack-graph:*`) | read-only, shared across all workspaces |
| **Org root** | `<workspace>/` | the launch directory: one `CLAUDE.md`, one `.claude/` overlay, the references | authored |
| **Workspace** | `<workspace>/workspace/` | docs / output only — the rendered canonical & critical surfaces | curated |
| **Function directories** | `<workspace>/<function>/` | each function's working files (incl. product source) | working |
| **Generated** | `<workspace>/.stack-graph/` | code-map, event log, graph record | machine output (gitignored) |
| **Recall** | `<workspace>/.gbrain-source` | registers the workspace as a source in the one host brain | external store |

The boundary is one line drawn three ways at once: **user ⟷ workspace** is **general ⟷ specific**
is **vendored ⟷ overlay**. The vendored graph (not the operator's to edit) is at user scope;
everything workspace-specific is at the org root or below.

## The one `.claude`

Agents, hooks, and settings are **launch-directory-scoped** (verified — [`harness-spec`](README.md)),
and the operator always launches at the org root. So there is exactly **one** `.claude/` —
`<workspace>/.claude/` — and **every** locally-authored graph element lives in it: skills, agents,
hooks, settings, the bindings reference, and crystallized references/scripts. Function and product
directories carry **no `.claude`** — a subdirectory's skills would lazy-load but its agents would
never activate, so nothing local is placed there. This is the only arrangement in which local
agents work, and it removes any need for a generated composed or scoped view.

## The workspace — docs/output, one navigable space

`workspace/` holds only **critical, rendered outputs**: the **handbook** (the canonical reference —
spec, domain, manual, decisions/history) plus a surface per function output (a roadmap, a plan, a
register, a design system — the set is harness-specific). Each is a content tree with a renderer;
together they present **one navigable space**. Working content **graduates** into a surface through
that surface's curator; drafts and alternates stay in the function directory. The render machinery
is a dedicated build directory, kept out of the content.

### Surface artefact format and manifest

A surface's instances are **markdown files with YAML frontmatter + a body**. Frontmatter holds
**authored facts** — the structured state that gates write and the curator owns (lifecycle state,
gate decisions, typed links, identifiers). The body holds narrative content. This follows the
graph's own files-canonical / frontmatter-structured / index-derived pattern and keeps artefacts
human-navigable and renderer-friendly while remaining machine-readable.

Each surface is indexed by a **manifest** — a committed, derived index file (e.g.
`items/manifest.json`) regenerated deterministically from the instance frontmatter by a
**`refresh-index`** step. The manifest is **not a second source of truth**: it is a read-cache. A
**stale-check** (run at integrate / CI) fails if the manifest does not reflect the current instance
files — ensuring the instances remain authoritative and the manifest never drifts ahead of or behind
them. Refresh points are: create/update an instance, record a gate decision, integrate, and terminal
freeze. The surface renders from the manifest for navigation and filtering; the instance files are
always the write target.

Derived / machine state (current traversal stage, event history) lives in `.stack-graph/`
(generated, gitignored), not in the committed surface. When `.stack-graph/` is absent (fresh clone,
no projection), the surface renders from the committed authored state alone; in-flight items show
their stage as unknown/stale until the projection rebuilds.

## Tree

```
~/
├── .claude/                            USER SCOPE — vendored stack-graph plugin (read-only)
│   └── plugins/
│       └── stack-graph/
│           ├── .claude-plugin/
│           ├── skills/                 vendored skill nodes
│           ├── agents/                 vendored agent nodes
│           ├── hooks/
│           └── lib/                    scripts reached by invokes edges
│
└── <workspace>/                        ORG ROOT — the one CLAUDE.md; always launched here
    ├── CLAUDE.md                       navigation: handbook-index pointer + how to use the graph + references
    ├── .claude/                        THE single overlay — ALL locally-authored graph elements
    │   ├── settings.json
    │   ├── skills/                     local skill nodes (any product/function)
    │   ├── agents/                     local agent nodes (any product/function)
    │   ├── hooks/
    │   └── <bindings reference + crystallized references/scripts>
    ├── .stack-graph/                   GENERATED, gitignored (code-map, events, graph-record)
    ├── .gbrain-source                  RECALL — registers this workspace as a source in the host brain
    │
    ├── workspace/                      DOCS / OUTPUT ONLY — rendered as one navigable space
    │   ├── handbook/
    │   │   ├── content/<NN-section>/
    │   │   └── index.json
    │   ├── <function-output>/          a surface per function output (roadmap, plan, register, …)
    │   ├── portal/                     the unified rendered UI
    │   └── <build>/                    render machinery
    │
    └── <function>/                     FUNCTION DIRECTORY — working files (incl. product source); no .claude
        ├── <product>/                  a product repo (source + working files)
        └── working/                    drafts, alternates, archives
```

## Bindings & recall

A vendored node finds workspace-specific paths — the handbook index, the code-map, crystallized
references/scripts, per-surface repo/label — through **bindings**: a reference the node reads on
demand (not a Claude-resolved config). The handbook index path is additionally made **ambient** by
the org-root `CLAUDE.md`, which cascades to every child. Recall is one host **brain** with one
**source** per workspace (`.gbrain-source`); MCP scopes every call by `--source`, so a node sees
only its own workspace's recall by default.

### The bindings contract

A process declares the **logical keys it requires**; the harness supplies the **values** in the
bindings reference. Nodes never hardcode paths or identities — they read their binding and navigate
from there. The set of keys a process may require (not every process needs all of them):

| Key | What it supplies |
|---|---|
| `surface-root` | root path of the target surface under `workspace/` |
| `items-root` | directory holding the surface's instance files |
| `manifest-path` | path to the surface's committed index file |
| `sprint-records-root` | directory holding sprint-record files for this surface |
| `strategy-doc` | the vision / strategy document path |
| `objectives-doc` | the objectives / OKR document path |
| `personas` | the personas surface or document read by experience-thread nodes |
| `handbook-index` | path to the workspace handbook's `index.json` |
| `event-log` | path / shape of the carrier-tagged event stream under `.stack-graph/` |
| `renderer` | entrypoint, output/portal path, and degraded-mode policy |
| `deploy-config` | target environment and deploy parameters |
| `experience-contract` | the harness-supplied intended-experience specification |
| `okr-binding` | how an instance's outcome link resolves to an objective id |
| `plan-policy` | threshold and link shape for graduating an in-body plan to a linked file |
| `terminal-recorder` | the recorder responsible for freezing a closed item's timeline |
| `maturity` | the maturity-dial setting for this process / product |
| `stale-projection-policy` | how the surface behaves when `.stack-graph/` is absent or stale |

This is the **factory contract** — the keys the vendored graph can require. A harness is free to
supply additional harness-local keys for local nodes; local nodes declare their own required keys
in the same way. A key that is not relevant to a given process is simply omitted from that
process's declared requirements.

### The bindings reference file

The bindings reference is `<org-root>/.claude/bindings.yaml` — a **YAML file with flat top-level
keys** matching the contract key names above. Structured values (those whose binding is more than a
single path) are nested under their key.

A node reads the file **on demand** — a file read relative to the org root — and navigates from
the value it finds. This is not an `@-import` (which is a Claude-resolved load-time splice) and not
a Claude config slot; it is a plain file read the node performs when it needs the binding. A key
absent from the file causes the node to degrade per its own documented degraded behavior.

Example:

```yaml
surface-root: workspace/product
items-root: workspace/product/items
manifest-path: workspace/product/items/manifest.json
sprint-records-root: workspace/product/sprints
strategy-doc: workspace/product/strategy.md
objectives-doc: workspace/product/objectives.md
personas: workspace/experience/personas
handbook-index: workspace/handbook/index.json
event-log: .stack-graph/events.jsonl
renderer:
  entrypoint: workspace/build/render.js
  output: workspace/portal
  degraded-policy: authored-only
deploy-config: deploy/prod.yaml
experience-contract: workspace/experience/contract.md
okr-binding: objectives-doc
plan-policy:
  threshold: 20
  link-shape: workspace/product/plans/{id}.md
terminal-recorder: stack-graph:debrief-fleet
maturity: scaling
stale-projection-policy: authored-only
```

## Peers

A user may run several workspaces side by side, each its own org root with its own `.claude`,
`.stack-graph`, and recall source. Cross-workspace interaction is **out of scope for v1** — each
workspace is launched and operated independently.
