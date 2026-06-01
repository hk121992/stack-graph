---
title: Plugin specification
type: spec
read-when: Packaging the plugin or building the handbook→plugin pipeline.
related: [graph-spec, harness-spec, analytics, overview, harness-spec/directory-topology]
---

# Plugin specification

stack-graph distributes as a Claude Code plugin vendored into a consuming workspace. The
canonical artefacts are real `.claude` files ([`graph-spec`](../02-graph-spec/README.md));
the plugin is **built from them**, not authored separately.

## What the build must do

The build does two things node files cannot do for themselves:

- **Bake disk-loadable primitives.** Claude Code loads skills and agents from disk; the
  files must be present in the packaged plugin.
- **Single-source references.** Shared content lives in one `graph/_refs/` file; the build
  places it into each consumer (copy/symlink) and resolves the host's `@-import` or
  on-demand pointer, so one source serves all consumers (no content is spliced as tokens).

The graph frontmatter keys need no handling at load time — Claude ignores them — so the
build strips them for cleanliness rather than necessity (see the pipeline below).

## Packaging

The plugin has the standard Claude Code plugin shape:

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

1. **Place references.** For each `references` edge, copy/symlink the canonical
   `graph/_refs/<id>.md` into the consumer's bundle and ensure the host's pointer resolves —
   an `@-import` for `load: import` (spliced at load), or a backtick path for `load: on-demand`
   (read at the step). One source serves all consumers; pure function of the inputs, no
   per-build state.
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

## References — single-sourced, not spliced

The shared content several primitives need — the finding contract (`findings-schema`,
`severity-scale`, `confidence-anchors`), the instrumentation preamble, `lens-dispatch`,
common protocols — is authored **once** as a `graph/_refs/<id>.md` **reference**
([`graph-spec`](../02-graph-spec/README.md)) and depended on via a `references` edge with a
`load` dial. The build **single-sources** it: the canonical file is placed (copy or symlink)
into every consumer's bundle and the host's pointer resolves to it — a native `@-import`
(`load: import`, guaranteed-present at load) or a backtick path the agent reads
(`load: on-demand`). A reference marked **`external: true`** (harness-supplied — e.g. a
crystallization manifest a node grows in its harness) is **not** single-sourced: the factory
ships only the consumer's pointer, and the harness supplies the file.

A reference is **emitted as its own native file**, never spliced as `{{token}}` text into a
host body. This keeps the canonical store native and lets each host primitive read on its own.
A change to the one source re-propagates to every consumer; the freshness gate (idempotency
test + `--dry-run` diff) fails CI if any committed built file differs from what its source
would now produce — so the duplication-drift that bites hand-copied shared content cannot
happen here. Content destined for a spawned **agent** is filled into the agent's
**spawn prompt** by its orchestrator, not imported by the agent.

Execution-surface parameterisation — keeping a node tool-agnostic about, e.g., the harness's
concrete browser — is a separate harness-overlay concern
([`harness-spec`](../04-harness-spec/README.md)), not a content reference.

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
fields), `@-import` pointers resolved, no stray graph keys. A node that fails verification
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
