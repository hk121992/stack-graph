---
title: Authoring handbook pages
type: reference
read-when: Writing or editing a stack-graph handbook page.
related: [overview, overview/maintenance, overview/agent-surfaces]
---

# Authoring handbook pages

How to write for this handbook so an agent can navigate it by scanning. Read once, refer
back by section. The strict admission gates live in the curator's
[`what-belongs.md`](../../../tooling/sg-handbook-curator/references/what-belongs.md); this
page is the page-shape and voice reference.

## What the handbook is

The **single canonical reference** for what stack-graph is and how it is built — the
*answer*, never the question. A page is canonical-and-resolved or it does not exist yet.

Three things never appear in a page body: **decision trails** (alternatives weighed,
"we chose X over Y"), **unresolved content** (TBD, open questions), and **workpaper
references**. Those live in `docs/` — [`design-history.md`](../../../docs/design-history.md)
carries the *why* and the corrections, [`decisions.md`](../../../docs/decisions.md) the
locked decisions. The handbook states the conclusion; `docs/` records how it was reached.

## Frontmatter

Every page carries exactly these four fields, nothing else:

```yaml
---
title: Graph specification
type: spec
read-when: Defining or implementing the node/edge model, the node schema, or storage.
related: [concepts, decomposition, plugin-spec]
---
```

| Key | Required | Rule |
|---|---|---|
| `title` | yes | The page heading. Frontmatter-only — do not repeat as `# Title` in the body unless the renderer needs it; keep one H1. Short (< ~40 chars); no "stack-graph —" prefix (the whole handbook is stack-graph). |
| `type` | yes | One of `index`, `reference`, `procedure`, `spec`. |
| `read-when` | yes | One present-tense sentence naming the **trigger** that should make an agent open the page — not a description of it. Highest-signal field. |
| `related` | optional | Clean slugs (`section/page`, no `NN-` prefix, no extension). Bidirectional by convention — if A lists B, B lists A. |

**No `status:` on handbook pages.** Everything in the handbook is canonical by definition;
a page that is not yet written simply does not exist. Versioning and dates live in `docs/`.
(Node files are a different surface — they carry `status:` per
[`02-graph-spec`](../02-graph-spec/README.md) because a node versions the primitive it
builds into. That rule does not apply to handbook pages.)

`read-when` examples:

| Good — names the trigger | Bad — describes the page |
|---|---|
| `Packaging the plugin or building the handbook→plugin pipeline.` | `Covers the plugin packaging.` |
| `Deciding how to break a workflow into nodes, edges, and inline elements.` | `About decomposition.` |

## Page types

- **`index`** — a section `README.md`. One orientation paragraph, then a table linking its
  children. Always sorts first; renders at the clean section URL.
- **`reference`** — lookup material. Tables over prose; read by scanning.
- **`procedure`** — how to do something. Imperative, present tense, action-first.
- **`spec`** — a formal specification. Canonical contracts; the resolved model, not its
  derivation.

## Voice

- Imperative, present tense. "Strip graph keys." Not "Graph keys should be stripped."
- Action-first: state what, then a one-line why **only if it prevents a wrong inference**.
- Tables for comparison or routing; bullets for sequential steps; prose only for 1–2
  sentence orientation.
- No `IMPORTANT:` / `YOU MUST` emphasis unless a rule is load-bearing and repeatedly missed.
- Internal/dev-facing references are allowed (stack-graph pages are operator-and-agent
  internal — the inverse of a customer-facing corpus rule).

## Length

| Level | Soft cap | Split when |
|---|---|---|
| One h2 section | ~150 lines | it needs its own table of contents to navigate |
| One page | ~1500 lines / ~25 h2 sections | grep for a section returns too many candidates |

The table of contents stays **h2-only**. When a section would need h3 navigation, promote
it to its own sibling page — split before nesting. Heavy reference tables move to a
`<topic>-reference.md` sibling, linked from the main page.

## Directory layout

Sidebar order, grouping, and titles derive from the filesystem; there is no config file.

| Rule | Meaning |
|---|---|
| Sections are folders `content/NN-<slug>/`. | The `NN-` prefix is the sort key; it never appears in URLs or slugs. |
| Pages are files `NN-<slug>.md`. | `README.md` is the section index and sorts first. |
| Reorder by rename. | `mv` the folder/file; no script edit. |
| Section title = the README `title:`. | Set it there. |

Slugs: `content/NN-section/README.md` → `section`; `content/NN-section/NN-page.md` →
`section/page`.

## The page-graph index

[`index.json`](../index.json) is the machine-readable page-graph an agent reads first —
one entry per page (`slug`, `title`, `type`, `read-when`, `related`), sorted by slug. It is
**generated**, never hand-edited: regenerate with `/sg-handbook-curator refresh-index`
after any frontmatter change. A page whose frontmatter is incomplete (missing `title`,
`type`, or `read-when`) is skipped with a warning, not silently indexed.

## Finishing a page

1. Confirm the four frontmatter fields are present and no `status:` line remains.
2. Read `read-when` aloud — if it describes the page rather than naming a trigger, rewrite.
3. Any h2 section over ~150 lines splits or moves to a `-reference.md` sibling.
4. Any new `related:` edge gets its reverse edge on the target page, same change.
5. Refresh `index.json` if frontmatter changed; raise the change per
   [`02-maintenance`](02-maintenance.md).
