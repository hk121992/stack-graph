---
title: Maintenance skill (sg-graph-maintainer)
type: spec
read-when: Specifying or building the skill that authors and maintains the graph.
related: [graph-spec, decomposition, devops, overview/agent-surfaces]
---

# Maintenance skill — `sg-graph-maintainer`

The dev-time skill that authors and maintains graph nodes. It is a dispatcher — "you are
the dispatcher": the operator invokes `/sg-graph-maintainer <mode>` and Claude Code loads
the skill as its instructions. There is no binary. Modelled on Be Civic's
`bc-corpus-creator`. The runtime contract lives in `tooling/sg-graph-maintainer/SKILL.md`;
this page is the spec it answers to.

## Dev-tooling boundary

`sg-*` skills are **dev-time tooling for building the factory** — not shipped to product
end-users. They live in `tooling/` (kept apart from the built `skills/` plugin surface) and
install by per-skill symlink into `~/.claude/skills/`. Vendored graph nodes ship namespaced
`stack-graph:*` inside a consuming workspace; the maintainer does not.

## Authoring workspace

The skill authors and maintains one directory per node:

```
graph/<id>/
  source-material/     # verbatim lifted source + _provenance.json
  research-report.md   # durable curation record
  <id>.md              # the node file: graph frontmatter + imperative body
```

The node file is the deliverable — a valid `.claude` primitive with graph frontmatter
added ([`graph-spec`](../02-graph-spec/README.md)). The research-report is the durable
curation record the canonical is synthesised from.

## Modes

| Mode | Does |
|---|---|
| `new` | Greenfield node: researcher gathers source-material and writes the research-report; translator synthesises the canonical per the [`graph-spec`](../02-graph-spec/README.md) schema; validate runs inline. |
| `amend` | Update the research-report first, then re-render the canonical from it (`.bak` backup before any overwrite). |
| `validate` | Check one node or all nodes against the schema — mechanical + one judgment pass. No writes. |
| `index` | Scan `edges:` frontmatter across all node files; regenerate `graph/graph-record.json`. Deterministic. |

`evaluate`, `migrate`, and `benchmark` are deferred.

## The synthesis discipline

Two orderings are hard constraints, both inherited from the corpus pattern and
[hybrid generation](../../../docs/decisions.md):

- **Synthesise the canonical from the research-report, never from source-material
  directly.** Researcher → translator, never researcher → canonical.
- **Never edit the canonical without updating the research-report first.** `amend` enforces
  the ordering.

Deterministic resolvers inject the shared blocks every node needs (instrumentation,
schemas — [`plugin-spec`](../03-plugin-spec/README.md)); the render is idempotency-gated so
built output cannot drift from its source.

## Subagent fleet

| Agent | Model | Why |
|---|---|---|
| `researcher` | opus | curation judgment — what belongs in the research-report, how edges and goals map |
| `translator` | opus | synthesis judgment — research-report → conformant node file; picks `primitive`, `mode`, authors goals as outcomes |
| `validator` | sonnet | mechanical checks + a lighter judgment pass |

## What validate checks

**Mechanical** (hard failures): required frontmatter fields present; `primitive`↔`mode`
agreement (`skill`↔`collaborative`, `agent`↔`autonomous`); `determinism` valid; every
`edges:` target resolves to a node file — except `composes-into` (a workflow id) and edges
marked `external: true`; at least one `goals:` entry, each carrying `outcome`, `metric`, and
`earns-keep`; body non-empty.

**Judgment** (one LLM pass): does `mode` match the node's observable collaborative/autonomous
character; is `primitive` sensible for what the body describes; does at least one goal read
as an **outcome**, not an activity.

Validate never writes — remediation is a follow-up `amend`. Changes land per the branch and
label model in [`devops`](../08-devops/README.md).
