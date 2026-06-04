---
title: Maintenance skill (sg-graph-maintainer)
type: spec
read-when: Specifying or building the skill that authors and maintains the graph.
related: [graph-spec, decomposition, devops, overview/agent-surfaces]
---

# Maintenance skill — `sg-graph-maintainer`

The dev-time skill that authors and maintains graph nodes. It is a dispatcher — "you are
the dispatcher": the operator invokes `/sg-graph-maintainer <mode>` and Claude Code loads
the skill as its instructions. There is no binary. The runtime contract lives in
`tooling/sg-graph-maintainer/SKILL.md`; this page is the spec it answers to.

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

The reference layer has **two kinds** and **two storage homes**:

| Kind | Home | Operator-facing |
|---|---|---|
| `reference` (standard) | `graph/_refs/<id>.md` (flat) | no — node-bound only |
| `handbook-reference` | `NN-section/<id>.md` (sectioned, for render order) | yes — rendered into the handbook |

A `handbook-reference` adds `type`, `owner`, `section`, `read-when`, `related`, and
optionally `extends` to the reference base; see the schema in
[`graph-spec`](../02-graph-spec/README.md#handbook-references). Standard references
need none of those fields. The maintainer handles both kinds — the mode table below
distinguishes the authoring path for each.

## Modes

| Mode | Does |
|---|---|
| `new` | Greenfield node: researcher gathers source-material and writes the research-report; translator synthesises the canonical per the [`graph-spec`](../02-graph-spec/README.md) schema; validate runs inline. |
| `family` | Author N near-identical sibling nodes by deriving each from a **template** node — one `family-author` per sibling, dispatched in parallel; each mirrors the template's edge model and goal shape, differing only in dimension content. The parameterised-family path (e.g. the review lenses from `lens-correctness`); cheaper than N `new` walks. |
| `reference` | Author a shared **reference** — either a standard `reference` (`graph/_refs/<id>.md`) or a `handbook-reference` (a sectioned entry, `NN-section/<id>.md`, with `type`/`owner`/`section`/`read-when`/`related` and optional `extends`). Neither is a node (no `goals`/process edges); no research-report required. The mode prompts for `kind` and, if `handbook-reference`, the required extra fields (`type`, `section`, `owner`, concept anchors). |
| `amend` | Update the research-report first, then re-render the canonical from it (`.bak` backup before any overwrite). |
| `validate` | Check one node or all nodes against the schema — mechanical + one judgment pass. No writes. |
| `index` | Scan `edges:` frontmatter across all node files (and enumerate `graph/_refs/` references); regenerate `graph/graph-record.json` (nodes, references, and edges — `references` edges carry their `load`). Deterministic. |

`evaluate`, `migrate`, and `benchmark` are deferred.

## The synthesis discipline

Two orderings are hard constraints:

- **Synthesise the canonical from the research-report, never from source-material
  directly.** Researcher → translator, never researcher → canonical. `family` keeps this
  ordering per sibling (report → canonical), deriving the shape from a template.
- **Never edit the canonical without updating the research-report first.** `amend` enforces
  the ordering.
- **Defer a process edge whose endpoint does not yet exist:**
  `precedes` / `can-follow` resolve to node files, so a node authored ahead of its backbone
  neighbours omits those edges (describing the behaviour in prose) and wires them in by
  `amend` once the neighbour lands. Prefer authoring backbone stages in arc order.

## Adequate sourcing

The research-report is the layer that lets a node be **challenged** against how its job is really
done — not merely described from our own design. So `new` (and a re-researching `amend`) requires a
**real external search**, recorded whether or not anything is lifted:

- Search the available real-world corpora — the operator's own `.claude` skills, any reference
  plugins present, the consuming product's harness — and **published best practice** (Anthropic's
  build-the-primitive docs; the named methodology the node's domain operationalises). Concrete
  corpus paths are environment-provided, never hardcoded in the general tooling.
- Lift external analogues verbatim into `source-material/`; record the search in the report's
  `## External analogues searched` table and in `external_corpora_searched` / `external_analogue_found`.
- **In-repo design docs are input, not an external analogue.** A node authored only from `docs/`
  with no recorded external search does not meet the sourcing bar. The acceptance gate challenges
  `sources_lifted: 0` / `external_analogue_found: false` and sends the researcher back when the
  search was skipped rather than genuinely empty.
- A genuinely-absent counterpart is a legitimate outcome **once recorded** — name the corpora
  searched and why none fits. The sin is the unrecorded skip, not the honest absence.

References ([`graph-spec`](../02-graph-spec/README.md)) are authored by the `reference` mode
into `graph/_refs/` and need no research-report — they are single-source curated content,
not synthesised nodes. A node depends on one via a `references` edge carrying `load: import |
on-demand`.

The build single-sources each reference into the consumers that depend on it (instrumentation,
schemas — [`plugin-spec`](../03-plugin-spec/README.md)) — `import` as a native `@-import`,
`on-demand` as a pointer read at the step of need; the render is idempotency-gated so built
output cannot drift from its source. There is no build-time injection primitive.

## Subagent fleet

| Agent | Model | Why |
|---|---|---|
| `researcher` | opus | curation judgment — what belongs in the research-report, how edges and goals map |
| `translator` | opus | synthesis judgment — research-report → conformant node file; picks `primitive`, `mode`, authors goals as outcomes |
| `family-author` | opus | derive-from-template synthesis — one sibling's report + canonical mirroring a template; one per sibling, dispatched in parallel |
| `validator` | sonnet | mechanical checks + a lighter judgment pass |

## What validate checks

**Mechanical** (hard failures): required frontmatter fields present; `primitive`↔`mode`
agreement (`skill`↔`collaborative`, `agent`↔`autonomous`); `determinism` valid; every
`edges:` target resolves to a node file — except `composes-into` (an arc id) and edges
marked `external: true`; every `references` edge target resolves to a `graph/_refs/<id>.md`
reference (or node) with `load` (if present) one of `import`/`on-demand`; at least one
`goals:` entry, each carrying `outcome`, `metric`, and `earns-keep`; body non-empty.

**`maintains` edges** — for each `maintains` edge on a node: the target must resolve to a
`handbook-reference` file (standard `reference` entries are not valid targets); edges
marked `external: true` represent the factory-maintainer case (an external/factory node
maintaining a vendored `owner: sg` entry) and are structurally valid but not resolved to
a local file. The graph record projects `maintained_by` per entry (symmetric to
`consumed_by` for `references` edges). Validate also performs the **orphan sweep**:
every `handbook-reference` file in the workspace is checked for at least one incoming
`maintains` edge — either a local node edge or an `external: true` edge for `owner: sg`
entries; entries with none are flagged as orphans (no writes; surface for `amend`).

**`extends` rule** — for every local (`owner: local`) `handbook-reference` that carries
`extends`: the referenced vendored slug must exist; the local body must not define a
concept anchor (`{#tag}`) that already appears in the vendored entry's anchor manifest.
Any anchor collision is flagged as a hard failure (redefining a vendored anchor is
prohibited; local entries may only add new anchors). A local entry whose `id` or anchors
overlap an `owner: sg` entry without an explicit `extends` declaration is also flagged.

**Judgment** (one LLM pass): does `mode` match the node's observable collaborative/autonomous
character; is `primitive` sensible for what the body describes; does at least one goal read
as an **outcome**, not an activity.

Validate never writes — remediation is a follow-up `amend`. Changes land per the branch and
label model in [`devops`](../08-devops/README.md).
