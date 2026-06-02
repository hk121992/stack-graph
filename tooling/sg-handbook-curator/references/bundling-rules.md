# Bundling rules

Many small handbook PRs add operator review burden. Lean toward one-bigger-PR over
many-small-PRs — but never at the cost of the structural-vs-content separation.

| Change | Treatment |
|---|---|
| Tiny typo / link fix | Own PR (under a minute to review) |
| Single substantive change that is clearly correct | Own PR |
| Several drift items in related sections (e.g. three cross-references needing the same rename) | Bundle into one "handbook hygiene" PR |
| Section-shape change (structural frontmatter, directory layout, ToC promotion) | NEVER bundle with content edits — separate structural-only PR per `references/what-belongs.md` and the authoring rules |
| Vocabulary sweep (one term replaced across many pages) | One PR, operator reviews once |
| Content edit + frontmatter `read-when:` fix for the same page | Bundle |
| Cross-reference drift surfaces alongside content edits | Bundle if the canonical change is in the same PR; otherwise link from this PR description |

## When to refuse a bundle

The `raise` mode refuses to author a PR that bundles:

- A structural-frontmatter change with body-content edits (per `references/what-belongs.md`
  and the h2-only ToC rule — a ToC promotion is structural).
- More than ~10 pages of unrelated content edits — split by topic.

## Heuristic for "related"

Two edits are related if they would land in the same operator-decision frame:

- "All references to `uses-block` should become `references`" — one decision, all instances.
- "The shared-sub-nodes table needs to drop one row and gain one" — one decision, one section.
- "A new concepts page on arcs; cross-references from `01-concepts` and `02-graph-spec`" — one
  decision, one operator review.

If you find yourself struggling to write one summary sentence that covers all the edits —
they're not related; split.

## Note on spec pages

stack-graph has no separate `spec-amend` mode (it is deferred — D40); spec-page amendments go
through normal `raise`, governed by the spec-touchpoints discipline. There is therefore no
hands-off-section refusal here as in the Be Civic original — but the structural-vs-content
separation above still binds on every page, spec pages included.
