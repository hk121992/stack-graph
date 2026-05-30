---
title: Handbook PR description shape
type: reference
status: v0.1.0 — 2026-05-30
---

# Handbook PR description shape

The PR description IS the amendment proposal for handbook changes. The operator decides from this surface in 30 seconds. Every handbook PR carries these sections in order:

```markdown
## Summary

<One sentence: what is wrong and what changes.>

## Trigger

<The moment or context that surfaced the drift. Name the task, file, or conversation.>

## Recommended decision

<One default, stated as a recommendation — not a question.>

## Alternatives

<Only if there is a real fork. Omit this entire section if the recommendation is obvious.>

## Out-of-scope

<What you noticed but deliberately did not fix. Omit if nothing applies.>

## Read set

<Bullet list of handbook page slugs the authoring agent read this session.>
```

Omit `Alternatives` and `Out-of-scope` if they have nothing to say. `Read set` is always present.

## Title shape

| Edit class | Title prefix |
|---|---|
| Typo / cross-ref / vocab fix | `chore(handbook): <one-line>` |
| New page or material content addition | `docs(handbook): <one-line>` |
| Structural change (frontmatter schema, directory layout) | `chore(handbook): <one-line>` — structural-only, never bundled with content |

Always `--label handbook` on creation. Without the label the PR drops out of the operator's triage queue.

## Branch naming

`handbook/<short-slug>` where the slug names the drift, not the trigger. Examples:

- `handbook/fix-xref-devops-loops`
- `handbook/add-concepts-workflow-definition`
- `handbook/vocab-sweep-process-term`

## Bundling

Tiny isolated fix → its own PR. Related fixes in the same area → bundle. Structural/frontmatter change → never bundle with content edits.

## Worked example

```markdown
## Summary

Replace stale reference to "Process/Path" vocabulary (Be-Civic-specific terms) in `01-concepts/README.md` with the correct Claude-primitive vocabulary.

## Trigger

While working on the harness spec this session, the concepts page was read and two paragraphs used "Process" and "Path" as if they were stack-graph primitives. These terms belong to the Be Civic product layer, not the factory.

## Recommended decision

Replace the two occurrences with the correct generic vocabulary (workflow, step). No other content changes.

## Read set

- `concepts`
- `graph-spec`
- `overview`
```

## What does NOT go in the PR description

- Implementation detail about the edit — the diff is the implementation.
- Diff snippets — reviewers see the diff on GitHub.
- Restatements of page content.
- Operator-decision questions phrased as questions — state the recommendation; let the operator counter.
