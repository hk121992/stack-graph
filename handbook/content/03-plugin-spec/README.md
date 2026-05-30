---
title: Plugin specification
type: spec
read-when: Packaging the plugin or building the handbook→plugin pipeline.
related: [graph-spec, harness-spec, analytics, overview]
---

# Plugin specification

stack-graph distributes as a Claude Code plugin vendored into a consuming workspace. The
canonical artefacts are real `.claude` files ([`graph-spec`](../02-graph-spec/README.md));
the plugin is **built from them**, not authored separately.

## What the build must do

The build does two things node files cannot do for themselves:

- **Bake disk-loadable primitives.** Claude Code loads skills and agents from disk; the
  files must be present in the packaged plugin.
- **Expand resolvers.** Node bodies carry `{{...}}` placeholders that Claude does not
  expand; the build expands them.

The graph frontmatter keys need no handling at load time — Claude ignores them — so the
build strips them for cleanliness rather than necessity (see the pipeline below).

## Packaging

The plugin mirrors the Be Civic plugin shape:

| Path | Holds |
|---|---|
| `.claude-plugin/plugin.json`, `marketplace.json` | manifest + marketplace entry |
| `skills/<name>/SKILL.md` | built skill nodes |
| `agents/<name>.md` | built agent nodes |
| `commands/<name>.md` | built command nodes (legacy — prefer skills) |
| `hooks/` | hook configs (the `triggers` bindings) |
| `lib/` | scripts reached by `invokes` |

Vendored nodes are namespaced by the plugin name — a built skill invokes as
`stack-graph:<name>`. A consuming harness's local nodes are unprefixed or harness-prefixed
(see [`harness-spec`](../04-harness-spec/README.md)).

## The build pipeline

Each node file `graph/<id>/<id>.md` projects through four deterministic stages:

1. **Resolve.** Expand every `{{...}}` placeholder by injecting the shared blocks — the
   instrumentation preamble ([`analytics`](../06-analytics/README.md)), schemas, and any
   common boilerplate. Resolvers are pure functions of the node; no per-build state.
2. **Strip.** Remove the graph-only frontmatter keys (`edges`, `mode`, `determinism`,
   `goals`, `status`), leaving only native `.claude` fields.
3. **Place.** Write the result into the plugin tree by `primitive:` — `skill` →
   `skills/<name>/SKILL.md`, `agent` → `agents/<name>.md`, `command` →
   `commands/<name>.md`, `script` → `lib/`. Hook configs derive from `triggers` bindings,
   not node bodies.
4. **Index.** Emit the node's rows into the graph record (the same scan the maintainer's
   `index` mode performs).

The build is **idempotency-gated**: output is a pure function of input, so a re-run on
unchanged source is byte-identical, and the build flags any committed output that drifts
from what its source would now produce. Built output cannot silently diverge from the node
files.

## Resolvers — define once, vendor everywhere

The shared blocks every node needs — the instrumentation preamble
([`analytics`](../06-analytics/README.md)), schemas (findings, severity), and common
protocols — are authored **once** as named **resolvers** and referenced from a node body by
a `{{PLACEHOLDER}}` token; the shared text is never inlined per node. The Resolve stage
expands every token in one pass, so a block authored once propagates to all consumers, and a
change to a resolver re-renders every node that references it. Execution surfaces follow the
same pattern — e.g. `{{browser.exec}}` resolves to the harness's concrete browser, keeping
the node tool-agnostic. The freshness gate (idempotency test + `--dry-run` diff) fails CI if
any committed built file differs from what its source would now produce. Mechanism mirrors
gstack's `gen-skill-docs` resolver build (the define-once source is a resolver function; the
consumer is a `.tmpl` with `{{...}}` tokens; one command expands all).

## Frontmatter mapping

The node frontmatter is a superset grouped by consumer ([`graph-spec`](../02-graph-spec/README.md));
the builder keeps the native group and drops the graph group:

| Native `.claude` field | Source on the node |
|---|---|
| `name` | derived from `id` |
| `description` | `description` (with `when-to-use` folded in for trigger guidance) |
| `model`, `allowed-tools` / `tools`, `argument-hint` | passed through verbatim |
| *(dropped)* | `edges`, `mode`, `determinism`, `goals`, `status`, `title` |

`title` and the graph keys serve the renderer and the index, not the runtime primitive, so
the built file omits them.

## Verification

The build verifies each emitted primitive **loads** — native frontmatter valid against the
primitive's own schema (a skill has `name` + `description`; an agent has its required
fields), placeholders fully expanded, no stray graph keys. A node that fails verification
fails the build; it is not shipped.

## Public plugin + dev-wrapper

The shipped plugin stays clean and public. A private **dev-wrapper** (a git submodule)
holds tests and CI and is added once there is build code to test. The wrapper consumes the
public plugin; the public plugin never depends on it.

## Install & update

A consumer installs the plugin through Claude's native marketplace/plugin install and
receives updates through native plugin-update. The consumer **never mutates** vendored
files; all customisation is an additive overlay
([`harness-spec`](../04-harness-spec/README.md)), so updates apply cleanly.
