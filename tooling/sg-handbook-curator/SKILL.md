---
name: sg-handbook-curator
description: "Maintains the stack-graph handbook at handbook/content/. Modes — sweep (scan for drift: contradictions, stale terminology, broken cross-references, missing canonical pages, index out of sync), raise (author a labelled PR for an amendment, with duplicate-PR detection), queue (list open handbook PRs + cross-PR collisions), refresh-index (regenerate index.json from page frontmatter). Use when surfacing handbook drift, raising labelled PRs, inspecting the open-PR queue, or refreshing the page-graph index. Do NOT use for context-loading — agents navigate the handbook directly via index.json."
---

# sg-handbook-curator

You are operating the `sg-handbook-curator` skill. This file is your runtime contract: the operator (or an agent acting on their behalf) invoked `/sg-handbook-curator <mode> <args>` inside a Claude Code session, and Claude Code loaded this SKILL.md as your instructions. There is no separate dispatcher binary. **You are the dispatcher.**

This skill maintains the handbook at `handbook/content/`. It is dev-time tooling for building the factory — the `sg-*` prefix encodes that boundary. It is invoked by agents working in stack-graph when their session-end sweep surfaces handbook drift, and by the operator on demand to check index freshness or raise corrections.

Authoritative procedures that this skill operationalises:

- `handbook/content/00-overview/02-maintenance.md` — the forcing rule (drift → raise a PR; never silently continue)
- `handbook/content/08-devops/README.md` — the contribution model, the two loops, open questions on branch policy and labels

## What this skill is NOT for

- **Not for context-loading at session start.** Agents read the handbook directly via `handbook/content/index.json`. If an agent invokes you to "read the handbook," redirect them.
- **Not an audit logger.** PRs and git history are the durable record. Do not write audit files.
- **Not a way to short-circuit operator decisions.** When a PR raises a question needing operator judgment, the question goes in the PR description. Do not surface operator decisions via AskUserQuestion mid-mode.

## How invoked

```
/sg-handbook-curator                          # bare; orient and ask which mode
/sg-handbook-curator sweep
/sg-handbook-curator raise <topic>
/sg-handbook-curator refresh-index
```

Source lives at `tooling/sg-handbook-curator/`.

## Mode availability

| Mode | Status |
|---|---|
| `sweep` | Available |
| `raise` | Available (with duplicate-PR detection) |
| `queue` | Available |
| `refresh-index` | Available |
| `integrate` | Contract recorded (below); **implementation deferred** |
| `comment` | Deferred — later |
| `decision-doc` | Deferred — later (product-specific) |
| `spec-amend` | Deferred — folds into `raise` for now (D40) |

When a deferred mode is invoked, print a one-line "deferred — not available in this version" message and stop. `integrate` is a special case: its **contract** is recorded below (D40) so the design is not lost, but invoking it prints "integrate: contract recorded, implementation deferred" and stops.

## Bare-invocation behaviour (no mode argument)

Print the orientation block, then ask via AskUserQuestion which mode to run.

### Orientation block

> sg-handbook-curator maintains the handbook at `handbook/content/`. It does NOT load context — agents read the handbook directly via `handbook/content/index.json`. This skill is for drift detection, amendments, and index maintenance.
>
> Four modes available:
>
> - **sweep** — scan the handbook for drift: contradictions, stale terminology, broken cross-references, missing canonical pages, index out of sync with page frontmatter. Report only; no mutations.
> - **raise** — author a labelled PR for a specific amendment. Checks the open-PR queue for duplicates first, then branches, writes the change, opens the PR.
> - **queue** — read-only print of the open `handbook`-labelled PR queue plus cross-PR file collisions. No mutations.
> - **refresh-index** — regenerate `handbook/content/index.json` from the pages' frontmatter. Idempotent.
>
> `integrate` (batch-merge cadence) has a recorded contract but is not yet implemented. `comment`, `decision-doc`, `spec-amend` are deferred.

### AskUserQuestion gate

Header: "Which mode?". Options: "sweep", "raise", "queue", "refresh-index", "abort".

## Modes

### Mode: sweep

**One-line.** Scan handbook pages for drift, contradictions, broken cross-references, and missing canonical content. Report findings; do not mutate.

**When to use.** Session-end sweep after working in stack-graph. Operator-invokable at any time to audit handbook health before or after a sprint.

**Required args.** None. Optional: a list of specific page slugs to restrict the scan (default: full handbook).

**Sequence.**

1. **Read `handbook/content/index.json`** to get the full page list and slugs.

2. **Dispatch `agents/drift-detector.md`** (model: sonnet). Provide:
   - The full page slug list (or the restricted set if the caller specified one).
   - A task summary describing what brought the operator here.
   - Any specific terminology or cross-reference concerns the caller named.

3. **Receive the drift-detector's candidate list.** If `no_drift_found: true`, announce "No drift detected" and stop.

4. **Group candidates** by severity (high → medium → low) and by page.

5. **Report to operator** in chat:
   - Total candidate count grouped by severity.
   - One entry per candidate: page slug, issue type, location, evidence, proposed fix.
   - Flag any candidates the detector could not resolve (missing page, malformed frontmatter).

6. **No mutations.** If the operator wants to act on a finding, they invoke `raise` next.

**Output.** Chat report only. No files written.

**After sweep.** If high-severity findings are present, recommend invoking `raise` for each. If the operator is in a session-end context, note the forcing rule from `handbook/content/00-overview/02-maintenance.md`: detected drift must be raised as a PR, not silently continued past.

### Mode: raise

**One-line.** Author a labelled handbook PR for a specific amendment per the maintenance forcing rule.

**When to use.** Your session-end sweep (or `sweep` mode) surfaced handbook drift, a broken cross-reference, stale terminology, or a missing canonical page, and you have the canonical answer.

**Required args.** `<topic>` — short slug for the branch name. Free-form natural language acceptable; you derive the slug.

**Sequence.**

1. **Read `references/what-belongs.md`** (the strict principles — gates, not advice) **and `references/bundling-rules.md`** (when to bundle vs split, and the bundle-refusal cases).

2. **Capture the proposal.** Confirm with the caller:
   - Which pages need editing?
   - What specifically changes on each page?
   - What triggered the drift (the task, file, or conversation that surfaced it)?

3. **Duplicate-PR check.** Dispatch `agents/queue-checker.md` (model: haiku) in `check-duplicate` mode with `target_files` = the pages you intend to edit. If it returns duplicates (an open `handbook` PR already touching those files):
   - **Do not open a second PR.** `comment` mode (post to the existing PR) is deferred, so surface the overlapping PR(s) — number, title, URL, overlapping files — to the caller and **stop**, recommending they extend the existing PR or close it first. Re-running `raise` after the conflict clears proceeds normally.
   - If the queue-checker errors (auth/network), surface and abort before any mutation.

4. **Apply the strict principles + bundling rules.** For each proposed edit:
   - Is the new content inferable from existing context? If yes — refuse and explain.
   - Does each line earn its token cost ("would removing this cause an agent to make a mistake?")? If no — trim before authoring.
   - Is the content canonical-and-resolved, or proposed/unresolved? If unresolved — it belongs in the PR description, not the page body.
   - Does the bundle obey `bundling-rules.md`? In particular, **never bundle a structural-frontmatter / ToC-promotion change with body-content edits** — split into separate PRs.

5. **Branch + edit.** In the stack-graph checkout: `git checkout main && git pull && git checkout -b handbook/<slug>`. Apply the proposed edits via the Edit tool. Cite original content; do not introduce inferable material.

5. **Refresh index if frontmatter changed.** If any edited page added, modified, or removed a frontmatter field, or if pages were renamed or moved, run `refresh-index` mode inline (or call `scripts/refresh-index.ts` directly) and stage the updated index in the same commit.

6. **Dispatch `agents/pr-author.md`** (model: opus) to compose the PR description per `references/pr-description-shape.md`. Input: proposed edits, trigger context, any out-of-scope findings.

7. **Commit + push + open PR.** Conventional commit: `chore(handbook): <one-line>`. Then:

   ```bash
   gh pr create \
     --repo hk121992/stack-graph \
     --label handbook \
     --title "chore(handbook): <one-line>" \
     --body "<pr-author output>"
   ```

8. **Final report.** PR URL + one-line summary of what was raised.

**Output.** A `handbook`-labelled PR; a refreshed `handbook/content/index.json` if frontmatter changed; no audit file.

**Refusal cases.**

- Caller proposes adding inferable content → refuse; explain which principle it violates.
- Caller proposes adding unresolved/proposed content to a page body → refuse; redirect to the PR description.
- Caller tries to bundle structural-frontmatter changes with content edits → refuse; ask them to split.

### Mode: refresh-index

**One-line.** Regenerate `handbook/content/index.json` from a filesystem walk of page frontmatter.

**When to use.** Called by `raise` mode on its success path when frontmatter changed. Operator-invokable for spot checks or after any manual page edits.

**Required args.** None.

**Sequence.**

1. Run `scripts/refresh-index.ts` against `handbook/content/`. Set `HANDBOOK_ROOT` to the absolute path of the stack-graph `handbook/` directory. The script:
   - Walks the directory.
   - For each `.md` file with `NN-` prefix and each `README.md`, parses frontmatter (`title`, `type`, `read-when`, `related`).
   - Computes the clean slug (`section/page`, no `NN-` prefix, no extension; `README.md` → bare section slug).
   - Emits `handbook/content/index.json` as a JSON array sorted by slug.

2. Diff the new index against the prior one. If unchanged, announce "Index unchanged" and stop. If changed:
   - On operator invocation: print the changed slug list to chat.
   - On `raise`-mode success-path invocation: surface only the count of changes; the diff is in the PR.

**Output.** `handbook/content/index.json` rewritten (idempotent if no changes).

**Script note.** `scripts/refresh-index.ts` is implemented (Node built-ins, no deps). Its logic mirrors `bc-handbook-curator`'s `refresh-index.ts` with `HANDBOOK_ROOT` resolution adapted for the stack-graph repo layout (no `bc-workspace/` wrapper; handbook root is the repo's own `handbook/` directory). Not yet exercised end-to-end against a real frontmatter change.

### Mode: queue

**One-line.** Read-only print of the open `handbook`-labelled PR queue plus cross-PR file collisions. No mutations.

**When to use.** Before an `integrate` session (gauge queue depth), or any time the operator wants to see what canon changes are in flight.

**Required args.** None.

**Sequence.**

1. **Dispatch `agents/queue-checker.md`** (model: haiku) in `mode: list`.
2. **Compute collisions.** Group the returned PRs by overlapping `files[]`; two PRs touching the same page are a collision the operator should know about before merging either.
3. **Report to operator** in chat: queue size; one row per PR (number, title, author, age, files, URL); a collisions block listing any page touched by more than one open PR.
4. **No mutations.** If the operator wants to act, they invoke `raise` (new change) or — once implemented — `integrate` (merge the batch).

**Output.** Chat report only. No files written.

### Mode: integrate — contract recorded, implementation deferred (D40)

`integrate` is the batch-merge cadence — the canon analogue of `land` (the gate that closes the loop `raise` opens). Its **contract is recorded here** so the design is not lost; **invoking it prints "integrate: contract recorded, implementation deferred" and stops** until the integrate fleet is built.

**Caller / cadence.** Operator, on a periodic cadence (e.g. weekly) — a **separate session** from the per-change `raise`.

**Intended sequence (when built).**

1. **List the queue.** Dispatch `queue-checker` (`mode: list`) — the open `handbook` PRs are the queue; there is no separate store.
2. **Cross-PR consistency.** Dispatch `consistency-checker` (model: opus) — vocabulary, frontmatter, voice (`read-when`), and cross-PR collisions across the batch. Scope is **not** deep semantic ("does spec X still support claim Y") in V1.
3. **Link validation.** Dispatch `link-validator` (model: sonnet) — cross-references and `related[]` resolve across the post-merge page set.
4. **Surface decisions synchronously.** Any operator decision goes **in the PR description**, never via `AskUserQuestion` mid-mode. Integration stays synchronous.
5. **Walk the merges** in batch, guided by an `integrator-checklist.md` reference (to be authored with the mode).
6. **Refresh the index** after merges (`refresh-index`).

**Fleet to build:** `agents/consistency-checker.md` (opus), `agents/link-validator.md` (sonnet); reference `references/integrator-checklist.md`. (Modelled on `bc-handbook-curator`'s deferred integrate design.)

## Shared infrastructure

### Preflight (run before any mode that mutates)

1. Confirm `handbook/content/` is reachable from the working directory.
2. Confirm `gh auth status` succeeds. If not, surface the auth error and abort — do not proceed with mutations.
3. For `raise` mode: confirm the working tree is clean before branching (`git status --short`). If dirty, surface and abort.

### Agent dispatch

Each file in `agents/` is a stateless task-instruction subagent. Dispatch via the Agent tool. Read the agent file to refresh its input/output contract before each dispatch.

**Model routing:**

| Agent | Model | Rationale |
|---|---|---|
| `pr-author` | opus | Judgment: composes PR descriptions, applies strict principles |
| `drift-detector` | sonnet | Mechanical: scans pages for known drift patterns |
| `queue-checker` | haiku | Mechanical: one `gh` call, JSON munging, no judgment |
| `consistency-checker` | opus | (integrate — deferred) cross-PR consistency judgment |
| `link-validator` | sonnet | (integrate — deferred) mechanical cross-reference resolution |

Dispatch shape for each:

1. Read the agent file to get its current input/output contract.
2. Construct the input per the agent's "Input contract".
3. Invoke the Agent tool with `model: <opus|sonnet>` per routing above.
4. Verify the output matches the agent's "Output contract".
5. Forward to the next phase.

### Failure modes

- **Agent returns malformed output.** Re-dispatch once with "Previous output was malformed: `<details>`. Conform to the contract." If second attempt fails, surface to caller and abort.
- **`gh` command fails.** Surface stderr to the caller; do not silently retry. Authentication issues are operator-side fixes.
- **refresh-index script fails.** Surface the error. Common causes: malformed frontmatter on a new page (the error message names the file).
- **Branch already exists.** Append `-2`, `-3` to the slug until a free name is found.
- **`handbook` label does not exist on the repo.** Surface a reminder to create the label on `hk121992/stack-graph` before the `gh pr create` call.

## Hard constraints

**MUST:**

- Handbook changes land via a labelled PR, never direct push — except during bootstrap: until `handbook/content/08-devops/README.md` finalises the branch/label model, default to a single labelled PR targeting `main`. Revisit once that page is authored.
- The PR description IS the amendment proposal. No separate proposal file.
- Keep all handbook pages h2-only in their table of contents. If a section exceeds what an h2-only ToC can navigate, promote it to its own first-class page — never deepen to h3+ navigation.
- Every `raise` PR carries `--label handbook` on creation. Without it the PR drops out of the operator's triage queue.
- Branch names follow `handbook/<short-slug>` where the slug names the drift, not the trigger.

**MUST NOT:**

- Add inferable content to handbook pages (rule 1, `references/what-belongs.md`).
- Add proposed/unresolved content to handbook page bodies.
- Write audit files or intermediate working notes to disk.
- Invoke `raise` for content that belongs in a design doc or operator working note.

## Cross-references

| Surface | Path |
|---|---|
| Handbook content | `handbook/content/` |
| Maintenance forcing rule | `handbook/content/00-overview/02-maintenance.md` |
| Authoring conventions | `handbook/content/00-overview/01-authoring.md` |
| Contribution model | `handbook/content/08-devops/README.md` |
| What belongs in the handbook | `references/what-belongs.md` |
| PR description shape | `references/pr-description-shape.md` |
| Bundling rules | `references/bundling-rules.md` |
| Drift-detector agent | `agents/drift-detector.md` |
| PR-author agent | `agents/pr-author.md` |
| Queue-checker agent | `agents/queue-checker.md` |
| Index refresh script | `scripts/refresh-index.ts` |
| Curator decomposition (graph model) | `docs/decisions.md` (D40), `docs/graph-map.md` (curator cell) |
