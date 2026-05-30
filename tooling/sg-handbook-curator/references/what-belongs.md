---
title: What belongs in the handbook
type: reference
status: v0.1.0 — 2026-05-30
---

# What belongs in the handbook

The strict principles for what may be added to or amended in `handbook/content/`. Loaded by `raise` mode before authoring any edit. These are gates, not advice.

## The four rules

### 1. Only missing or genuinely ambiguous

Add content only when a competent agent working in stack-graph would lack it and could not infer it from the page title, sibling pages, section name, or file path. Inferable content crowds out load-bearing content.

**Reject:** a paragraph explaining that the `08-devops/` section covers branching, PRs, and the two improvement loops. The section is titled "DevOps" and contains pages on exactly those topics. Any agent reads the file list.

**Accept:** the specific rule that factory-loop PRs from a consuming workspace must target `main` and carry the `handbook` label, because that rule is not derivable from the section name or structure.

### 2. Token efficiency is load-bearing

Each line earns its place: "would removing this cause an agent to make a mistake?" If no, cut. Padding ("It is important to note", "Please be aware", restatements of what the surrounding context already says) is removable without information loss.

### 3. No proposed or unresolved content in the handbook

The handbook is canonical — a page is the answer, not the question. Proposals live in PR descriptions. Design rationale lives in design docs. Superseded framing belongs in an archive section.

If the canonical answer is not yet settled, do not add a stub with "TBD". The right move is to not add the page yet, and raise the question in the PR description or a design doc.

### 4. Symmetric scope

Amendments cover what the caller read this session. If an edit touches a page the caller did not read, the caller reads it now before the PR is authored. If reading reveals the page's `read-when:` should have surfaced it earlier, amend `read-when:` in the same PR.

## What belongs where

| Content type | Where it belongs |
|---|---|
| Canonical specs, concepts, procedures | `handbook/content/` |
| Design conversation and rationale | Design docs (outside the handbook) |
| Proposed or unresolved decisions | PR descriptions |
| Per-sprint working notes | Operator scratch / session memory |
| Node files (graph content) | Node storage layer, not the handbook |
| CLAUDE.md / skill behaviour preferences | `CLAUDE.md` or skill files |

## Common drift triggers and the right response

| Trigger | Right response |
|---|---|
| Cross-reference to a renamed or moved page | One-line fix in the referencing page; PR `chore(handbook): fix cross-ref to <new path>` |
| Stale or banned vocabulary used in a page body | Replace term; PR `chore(handbook): vocab sweep <term>` |
| Missing page (canonical answer exists and is settled) | New page with full frontmatter; PR `docs(handbook): add <section>/<page>` |
| Missing page (answer is unresolved) | No handbook PR — surface the question in a design doc or the next available operator channel |
| Two pages contradict | PR description names the contradiction and proposes the resolution; the merged PR is the canonical answer |
| Index out of sync with frontmatter | `refresh-index` mode; PR if on a `raise`-mode success path |

## What does NOT trigger a handbook PR

- A design conversation from this session about a future direction — that is a design doc.
- A node or workflow authoring question — that is a graph content or harness question.
- A CLAUDE.md or skill behaviour you want changed — that is a CLAUDE.md or skill file edit.
- A working hypothesis not yet validated.
