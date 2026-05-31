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

## Peers

A user may run several workspaces side by side, each its own org root with its own `.claude`,
`.stack-graph`, and recall source. Cross-workspace interaction is **out of scope for v1** — each
workspace is launched and operated independently.
