---
title: Research report for queue-checker
type: research-report
status: complete
authored: 2026-05-31
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: "Backfill — full template populated; source-material lifted (bc-handbook-curator queue-checker + sg-handbook-curator queue-checker); external analogues section added; challenge findings authored against bc counterpart and Anthropic subagent best-practices"
sources_lifted: 2
external_analogue_found: true
external_corpora_searched:
  - "be-civic: bc-operations/bc-skills/bc-handbook-curator/agents/queue-checker.md (primary — production be-civic instance, multi-surface)"
  - "stack-graph tooling: tooling/sg-handbook-curator/agents/queue-checker.md (in-tree predecessor, hardcoded)"
  - "gstack skills: ~/.claude/skills/gstack/ — searched for queue/duplicate-PR/label patterns; landing-report is closest (read-only PR queue for version-slot awareness, same read-only + one-query ethic); ship skill contains queue-aware version-pick inline (not a subagent)"
  - "CE plugin: scratch/ce-plugin/plugins/compound-engineering/skills/ — searched for queue/open-PRs/gh-pr-list/duplicate patterns; none found"
  - "Anthropic platform docs: code.claude.com/docs/en/agent-sdk/subagents (fetched — subagent design, tool restrictions, context isolation best practice)"
  - "Anthropic engineering blog: anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills (fetched — deterministic code-first, scope clarity, progressive disclosure)"
researcher_adequacy_note: |
  Two files were lifted verbatim: the production be-civic bc-handbook-curator queue-checker (the
  original model, 110 lines, multi-surface with fan-out and partial-failure semantics) and the
  in-tree sg-handbook-curator queue-checker (the direct predecessor with hardcoded repo+label). The
  gstack skill tree was searched with grep for queue/duplicate/gh-pr-list/label patterns — landing-
  report is the strongest analogue for the read-only queue-reading job (shows the same one-call
  ethic, offline-fallback pattern, and collision-surfacing logic) but it is a skill not a subagent;
  the queue-reading is inline rather than a dispatched agent. The CE plugin was searched (grep across
  all compound-engineering SKILL.md files); no PR-queue or duplicate-check pattern found. The
  Anthropic subagents doc and agent-skills engineering post were fetched in full — both yielded
  concrete challenge findings around partial-failure handling, explicit tool restriction, and the
  spawn-bundle clarity requirement. Edges were determined as none-that-resolve because the only
  structural link is the curator's invokes edge; queue-checker owns no outbound invocations or
  process edges. The primitive:agent / mode:autonomous / determinism:deterministic classification is
  high-confidence — pure gh JSON munging with no model judgment matches the autonomous+deterministic
  quadrant precisely. Recommendation: proceed to translator; the challenge findings surface four
  addressable gaps (partial-failure for future multi-surface, explicit tool restriction, empty-queue
  branch, and scope-lock documentation) that should be resolved in the canonical node before the node
  is considered spec-stable.
---

# Research report for queue-checker

## Identity

**Candidate id:** `queue-checker`
**Candidate title:** Queue checker

**Scope:** A stateless, mechanical subagent that materialises the canon-PR queue — the set of open
labelled PRs — with one call, in two modes: `list` (the whole queue) and `check-duplicate` (the
subset whose changed files overlap a caller-supplied file set). Part of the curator cell; invoked by
`handbook-curator` at `raise` (duplicate-check before authoring) and at `integrate` / `queue` (list
before merging). The node does **not** decide what to do with the queue — it only returns it. It
does **not** understand PR content or perform any semantic comparison.

Excluded from scope: any write to GitHub (mutations), any model judgment on PR content, any
fan-out across multiple repos (that is a future multi-surface extension, present in the bc analogue
but absent here by deliberate single-surface scope).

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Duplicate or colliding canon PRs are prevented before they open — the live queue is visible at the moment `raise` would author a second PR | duplicate canon PRs opened over the same pages (target ~0); collisions surfaced before a merge vs discovered after | duplicates opened stays near zero; if duplicates still slip through, the check is not being consulted or is mis-scoped |
| The queue read is cheap and exact — one call, no judgment, never stale relative to the live PR state | calls per check (target 1); divergence between the returned queue and the actual open PRs on GitHub | stays one call with no divergence; any added judgment or second call is a smell to refactor |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** The node runs in an isolated context (spawned via the Agent tool), performs a
`gh` query, munges JSON, and returns a clean structured result. It never pauses for the operator —
the caller receives the summary and acts on it. Autonomous is the correct axis. It is a node (not
inline in the curator) for two reasons that survive the D34 / 07-decomposition right-sizing test:
(1) it **isolates** the raw `gh` query output from the caller's context — the curator receives a
clean list, not a wall of JSON; (2) it is **reused** by two distinct curator modes (`raise` and
`integrate`/`queue`). If it were inline it would have to be duplicated or the caller's context would
accumulate the raw query output.

**`determinism:`** `deterministic`

**Rationale:** Pure `gh` CLI query + JSON filter. No model generation step — the output for
identical inputs is deterministic (modulo live PR state, which is the intentional input). Contrast
with a generative node that drafts prose or makes a judgment call.

## Contract

**Input (spawn bundle):**

```yaml
mode: list | check-duplicate
repo: <owner/name>                  # the canon repo (harness overlay supplies it)
label: <string>                     # the queue-discriminator label
target_files: [<path>, ...]         # required only for check-duplicate; clean repo-relative paths
```

**Output:**

For `list`:
```yaml
queue:
  - { number: <int>, title: <string>, author: <string>, created_at: <ISO>, files: [<path>...], url: <string> }
queue_size: <int>
```

For `check-duplicate`:
```yaml
duplicates:
  - { pr_number: <int>, title: <string>, files: [<overlapping path>...], url: <string> }
queue_size: <int>
```

On error: `{ error: "<kind>", details: "<stderr>" }` — one of `gh not authenticated`, `network`,
`repo not found`.

## External analogues searched

Record of the real-world search — whether or not anything was lifted.

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| be-civic: bc-operations/bc-skills/bc-handbook-curator/agents/ | queue-checker.md — the production multi-surface be-civic analogue | yes | bc-handbook-curator-queue-checker.md |
| stack-graph tooling: tooling/sg-handbook-curator/agents/ | queue-checker.md — the in-tree predecessor (hardcoded repo+label) | yes | sg-handbook-curator-queue-checker.md |
| gstack skills: ~/.claude/skills/gstack/ (84 skills) | grep for queue, open PRs, gh pr list, duplicate, label — across all SKILL.md files | partial | — (landing-report is closest analogue; see notes) |
| CE plugin: compound-engineering/skills/ (20 skills) | grep for queue, open PRs, gh pr list, duplicate check patterns | no | — |
| Anthropic SDK docs: code.claude.com/docs/en/agent-sdk/subagents | best practice for stateless subagents: tool restriction, error handling, context isolation, single-call discipline | yes (cited) | — (web-fetched, no single file to lift) |
| Anthropic engineering: anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills | deterministic code-first, scope clarity, progressive disclosure for skills | yes (cited) | — (web-fetched) |

**Notes on gstack landing-report:** The `/landing-report` skill reads the open-PR queue for
version-slot awareness (`gh pr list` equivalent via `bin/gstack-next-version`) with the same
read-only, one-call, no-mutation ethic and an offline-fallback pattern. It is a **skill** (collaborative,
operator-facing) not a subagent, and its queue-reading is inline rather than dispatched — so it does
not map directly to queue-checker's agent/autonomous/deterministic shape. But it is the strongest
real-world example of the same job archetype (read the PR queue, surface collisions, return a clean
result) and supplies concrete challenge findings below.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/bc-handbook-curator-queue-checker.md` | keep | Primary analogue — production multi-surface instance; richer error handling, partial-failure semantics for fan-out, warnings array, repo scope-lock documented. All sections are directly relevant. |
| `source-material/sg-handbook-curator-queue-checker.md` | keep | In-tree predecessor — shows the pre-generalisation hardcoded form; useful for confirming what the generalisation gained (repo/label in spawn bundle) and what it may have lost (scope-lock comment). |

## Keep / Drop

**Kept (absorbed into body):**
- Single-query, read-only, no-mutation constraint — present in both analogues, confirmed as the core discipline.
- Two-mode structure: `list` and `check-duplicate` (file-intersection filter) — present in both analogues.
- Structured JSON/YAML output contract with `queue_size` — present in both.
- Three canonical error kinds: `gh not authenticated`, `network`, `repo not found` — present in both.
- No-retry on error — present in both (the bc version adds "Do not retry").
- Read at least: number, title, author, createdAt, files, url per PR entry.

**Dropped (out of scope for generalised node):**
- Multi-surface fan-out (`handbook-prs` / `claude-md-issues` / `claude-md-prs`) — present in bc but
  explicitly not in the generalised node; the generalised node is single-surface. Future extension.
- Hardcoded repo defaults — present in bc and sg; dropped in generalisation (harness overlay supplies
  repo + label via spawn bundle).
- `warnings` array for partial fan-out failures — present in bc; not applicable to single-surface.
- Label-not-found treated as zero entries (not a warning) — present in bc; worth absorbing but not
  currently explicit in the canonical node.

**Edge only (separate node):**
- Nothing from these sources is node-like enough to warrant its own node.

## Overlaps and seams

**Caller: handbook-curator** — the only node that invokes queue-checker. The structural link is
`handbook-curator --invokes--> queue-checker`. Queue-checker owns no outbound invocations;
its output IS the return value to the caller.

**Seam at `raise` mode:** handbook-curator passes `mode: check-duplicate` + `target_files` (the
pages the PR would touch). Queue-checker returns any overlapping open PRs. The curator then decides
whether to abort, warn, or proceed — the judgment is the curator's, not queue-checker's.

**Seam at `integrate` / `queue` mode:** handbook-curator passes `mode: list`. Queue-checker returns
the full open queue. The curator presents it and decides merge order.

**No overlap with other graph nodes** at the current graph size. When a multi-surface extension is
built, a future `multi-surface-queue-checker` may sit alongside this one, or this node gains a
`surfaces` field — that is a design decision for the extension sprint.

## Fit

Single node — does not need splitting. The two modes (`list` and `check-duplicate`) are branches in
one body with one shared goal (materialise the live queue). They share the same `gh` query, the
same output shape skeleton, and the same error-handling contract — splitting them would create two
near-identical agents with no independent goal to measure separately. The D34 / 07-decomposition
one-node-one-primitive rule is satisfied.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| — | — | No outbound edges that resolve. The only structural link is the caller's `invokes` edge (declared on handbook-curator, not here). No dev-sprint stage exists for maintenance nodes (F7 gap). No references loaded. |

Note: when the maintenance arc node is built (F7), a `composes-into` edge to that arc will be
added here.

## Conformance

**`primitive:`↔`mode:` agreement:** `agent` (autonomous) — confirmed. Autonomous agents map to
`primitive: agent`; the two agree.

**`goals:` as outcomes:** Both goals read as outcomes (what is prevented / what is measurable), not
activities. Confirmed.

**Edge targets resolvable:** No edges declared. The F7 maintenance arc is a known unresolved target;
recorded as an open question.

## Challenge findings

These findings compare the generalised `queue-checker` node against its mature external analogue
(`bc-handbook-curator-queue-checker.md`) and against Anthropic's subagent best-practice documentation.
They are **not** incorporated into `queue-checker.md` here — amendments are a separate operator
session.

### CF-1 (medium) — Partial-failure semantics missing for future multi-surface

**Analogue evidence:** The bc queue-checker defines explicit partial-failure handling for its fan-out:
when a repo in the `claude-md-prs` set returns `repo not found`, execution continues with remaining
repos and the missing one is added to `warnings[]`. The generalised node only has three hard-abort
error kinds; there is no `warnings` field and no partial-success path.

**Gap:** If the node is ever extended to a multi-surface or multi-repo model, it will need the
bc-style partial-failure / warnings pattern. The current design assumes single-surface and silently
omits this. The risk is that a future extension defaults to hard-abort where partial success would
be correct, forcing a breaking change to the output contract.

**Recommendation:** Document the single-surface scope assumption explicitly in the node body (as a
deliberate constraint, not an oversight). Add a note: "multi-surface extension requires a `warnings`
output field and partial-failure semantics; do not add surfaces without amending the contract."

### CF-2 (medium) — No explicit tool restriction declared

**Analogue evidence:** The Anthropic subagents doc explicitly recommends restricting tool access for
read-only agents via the `tools` field: "a `doc-reviewer` subagent might only have access to Read
and Grep tools, ensuring it can analyze but never accidentally modify." Queue-checker requires only
`Bash` (for `gh` CLI). The canonical node does not declare a `tools:` constraint in its frontmatter.

**Gap:** Without an explicit tool restriction, the subagent inherits all tools available in its
spawning context. For a "read-only, no mutations" agent, this is an unnecessary blast-radius risk —
an implementation error could silently call Edit or Write without the contract preventing it.

**Recommendation:** Add `allowed-tools: [Bash]` to the node frontmatter. This makes the read-only
constraint enforceable at the harness level, not just advisory via the body instructions.

### CF-3 (low) — Empty-queue branch not specified

**Analogue evidence:** The bc queue-checker's output contract returns an empty array for
`handbook_prs: []` when no open labelled PRs exist. The generalised node's `check-duplicate` output
implies `duplicates: []` on empty but does not state this explicitly; `list` similarly omits the
zero-entry case. The gstack `landing-report` handles the offline/empty case with a distinct output
block and a "Queue is clean" action suggestion.

**Gap:** Callers must handle the zero-entry case without a contract guarantee. The `check-duplicate`
caller (handbook-curator `raise` mode) needs to know that `duplicates: []` means "clear to proceed"
— that semantic is implicit. An explicit "empty array = clear, not an error" statement prevents a
future caller from treating absence as ambiguity.

**Recommendation:** Add one line to the output contract: "An empty `duplicates: []` means no
overlap — proceed. An empty `queue: []` means no open labelled PRs — the queue is clear."

### CF-4 (low) — Scope-lock comment absent

**Analogue evidence:** The bc queue-checker includes an explicit scope-lock comment directly in the
agent body: "**Repo set is locked here.** New be-civic repos require an edit to this file before
`integrate` will pick them up for the `claude-md-prs` fan-out." This makes the configuration surface
visible to anyone reading the agent file.

**Gap:** The generalised node externalises `repo` and `label` to the spawn bundle (which is
correct), but does not document _where_ those values are supplied or what happens if they are absent.
A reader of the agent file cannot tell whether `repo` defaults to anything or whether the harness
overlay is mandatory.

**Recommendation:** Add a note in the node body: "`repo` and `label` are mandatory — no defaults.
The harness overlay (bindings.yaml) supplies them via the spawn bundle. If either is absent, return
`{ error: 'missing-config', details: 'repo and label are required in the spawn bundle' }` and do
not run the query."

### CF-5 (low) — Label-not-found silent-zero not specified

**Analogue evidence:** The bc queue-checker documents that `gh pr list --label <name>` returns zero
entries when the label does not yet exist in the target repo, and it explicitly treats this as zero
entries (not an error, not a warning): "The label is created lazily by the `raise` mode on first
use." This is a non-obvious `gh` CLI behaviour.

**Gap:** The generalised node does not document this. A future implementer or maintainer may
misinterpret an empty result from a new repo (where the label has never been created) as a network
failure or an unexpected state, and add incorrect error handling.

**Recommendation:** Add to the Constraints section: "`gh pr list --label <label>` silently returns
zero entries when the label does not exist in the target repo — this is the expected new-repo state,
not an error. Do not emit a warning or abort."

## Open questions

- **F7 gap:** The maintenance arc node does not exist yet. When it is built, a `composes-into` edge
  from queue-checker to that arc should be added to the node frontmatter and this report updated.
- **Multi-surface extension:** The bc analogue fans out across five repos and three surface types.
  If stack-graph's curator cell grows to cover multiple repos or surface types (e.g. cross-repo
  `claude-md` PRs), the node will need a `surfaces` input field and partial-failure semantics (see
  CF-1). That extension is out of scope for the current single-surface node but should be designed
  before the node is marked v1.0.
- **`body` field in PR entries:** The bc analogue requests `body` from `gh pr list` for `handbook-prs`
  and `claude-md-issues`. The generalised node does not. If the caller ever needs PR body content
  (e.g. for conflict description), this would require a contract amendment. Currently not needed.
