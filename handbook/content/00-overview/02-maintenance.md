---
title: Maintenance — the forcing rule
type: procedure
read-when: You hit drift, ambiguity, or a missing page while working in stack-graph.
related: [overview, devops, overview/authoring]
---

# Maintenance — the forcing rule

When working in stack-graph you will hit handbook drift — a contradiction, stale
terminology, a broken cross-reference, or a missing canonical page. **Raise it; never
silently continue past it.** Silent continuation is how a canonical reference rots.

## Drift triggers

Any of these forces an action before the task moves on:

| Trigger | Action |
|---|---|
| Two pages contradict | Raise a PR; its description names the contradiction and proposes the resolution. |
| Stale or banned vocabulary in a page body | Replace the term; PR `chore(handbook): vocab sweep <term>`. |
| Cross-reference to a moved/renamed page | One-line fix; PR `chore(handbook): fix cross-ref`. |
| Missing page, and the canonical answer **is** settled | Author it with full frontmatter; PR `docs(handbook): add <section>/<page>`. |
| Missing page, and the answer is **not** settled | No handbook PR — raise the question in a `docs/` design doc or to the operator. |
| `index.json` out of sync with frontmatter | `/sg-handbook-curator refresh-index`. |

The discriminator on a missing page is whether the answer is resolved. The handbook never
carries a TBD stub — unresolved questions live in `docs/` or a PR description, never in a
page body (see [`01-authoring`](01-authoring.md)).

## How a change lands

Handbook changes land via a **labelled PR**, raised with `/sg-handbook-curator raise`,
not direct push. The PR description **is** the amendment proposal — there is no separate
proposal file. Branch, label, and review conventions are in [`devops`](../08-devops/README.md).

Bootstrap exception: until [`devops`](../08-devops/README.md) finalises the branch/label
model, spec and tooling changes may land by direct commit to `main`; the curator is
exercised on handbook content first.

## The end-of-task sweep

Before closing a task that touched stack-graph, scan for drift you introduced or passed:
a reference you followed that was wrong, a term you had to translate, a page you needed
but could not find. Each hit is a trigger above. If you discovered a page late, its
`read-when:` failed to surface it — fix the `read-when:` in the same change. Discovering a
page late is itself drift.
