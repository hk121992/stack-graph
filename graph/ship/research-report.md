---
title: Research report for ship
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-04
amended:
  - date: 2026-06-03
    note: Backfill external search — gstack ship + CE ce-commit-push-pr lifted; Challenge findings section added; External analogues searched table added; source-material/ populated.
  - date: 2026-06-04
    note: >-
      Reconciliation verdicts applied (docs/research-backfill-reconciliation.md, cluster A ship
      rows). CF-2 + CF-3 + CF-5 marked APPLY and translated into the body; CF-1 marked REJECTED
      (review army duplicates the upstream review backbone stage, D50 build->review->reconcile->land
      — ship runs inside land after review/reconcile ran); CF-4 unchanged (out of this amend's
      scope). Added a pr-description-shape references edge (load on-demand; CF-5 wiring; ref already
      exists in _refs/).
sources_lifted: 2
external_analogue_found: true
external_corpora_searched:
  - gstack operator skills (/home/gstack/.claude/skills/gstack/)
  - CE plugin (compound-engineering, EveryInc/compound-engineering-plugin)
  - be-civic harness (/home/gstack/projects/be-civic/)
  - DORA research (dora.dev)
  - Published git/PR best practice (Conventional Commits, pullchecklist.com, datacamp)
researcher_adequacy_note: |
  External search covered four corpora: (1) gstack operator skills — the primary analogue, gstack /ship, is a 3022-line skill that executes the same job as stack-graph's ship node and was lifted verbatim; (2) the CE plugin — ce-commit-push-pr covers the commit+PR surface with adaptive PR description quality and evidence capture (secondary analogue, lifted verbatim); ce-commit covers commit-only (reviewed, not lifted — too narrow); ce-release-notes covers release history lookup (not relevant to ship); (3) be-civic — searched for ship/PR/commit references in CLAUDE.md, AGENTS.md, and README files; no analogue found (be-civic is a process-content product, not a delivery-pipeline operator); (4) web — DORA metrics research (dora.dev) and git/PR best practice resources consulted; no single liftable document but findings incorporated into Challenge section. Confidence in skill/collaborative primitive is high — both analogues confirm operator gates at commit and PR stages. The existing edges and goals are sound. The Challenge section documents five meaningful gaps between the stack-graph node and its real-world analogues. Proceed to translator; the five challenge findings should be reviewed for potential amend before the node is considered finalised.
---

# Research report for ship

## Identity

**Candidate id:** `ship`
**Candidate title:** Ship
**Scope:** The `ship` sub-arc executes the delivery pipeline from a working implementation
to an open pull request: run the test suite, enforce the coverage gate, bump the version
(if applicable), commit the staged changes with a checkpoint commit, and open the PR. It
ends when the PR is open and ready for the downstream `deploy` stage to merge. It does
**not** merge, deploy, or confirm production health — those belong to `deploy` and `canary`.
Ship is standalone-capable (operators can invoke it directly outside the dev-sprint arc),
and is also invoked by `land` as the first sub-arc of the land sequence.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Every change lands as a PR with tests passing and coverage gate held, not as a direct push. | PRs opened via ship as % of all changes landing; test failures caught before PR open (not at CI). | Direct pushes to main trend to zero; pre-PR test failure rate above baseline triggers review of the test discipline. |
| The commit and PR description give reviewers enough context to judge the change without reading the diff in full. | Downstream review rework attributable to a missing or unclear PR description; operator-reported "can't tell what this is" rates. | PR-description rework rate trends down; reviewers close without requesting context clarification. |
| Coverage regressions are surfaced at ship, not discovered post-merge. | Coverage delta reported per PR; regressions blocked before the PR opens. | Coverage regressions reaching main trend to zero over N sprints. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** Ship requires operator involvement at multiple points — confirming the test
suite to run, reading the coverage report, approving the commit message, and confirming the
PR body before opening. An agent (autonomous) would be appropriate only if the whole
sequence could run unattended with no operator decision points; here, each gate is a
lightweight operator confirmation. A skill (collaborative) is correct.

The gstack analogue supports this: gstack /ship is explicitly non-interactive for most
steps but retains hard operator gates at MINOR/MAJOR version bumps, pre-landing review
P1 findings, and Codex P1 gate on large diffs. The CE analogue (ce-commit-push-pr) asks
before applying a PR description update. Both confirm collaborative is the correct mode.

**`determinism:`** `generative`

**Rationale:** The PR description and commit message require language generation from the
diff and context. The coverage report and test run themselves are deterministic, but the
skill's orchestration is generative.

## Contract

**Input:** The staged diff (or a pointer to it), the test suite configuration, the
coverage threshold (harness-supplied), a version bump instruction (optional — semver
patch/minor/major or "no bump"), and the target branch for the PR.

**Output:** An open pull request (URL reported), the test results summary, the coverage
delta, and the commit SHA.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack operator skills (`~/.claude/skills/gstack/`) | `ship`, `land-and-deploy`, `document-release` skills — the primary candidate for a real ship counterpart | yes — `ship/SKILL.md` (3022 lines, Steps 0–20) | `gstack-ship-SKILL.md` |
| CE plugin (`compound-engineering/skills/`) | `ce-commit`, `ce-commit-push-pr`, `ce-release-notes` — commit/PR/release skills | yes — `ce-commit-push-pr/SKILL.md` | `ce-commit-push-pr-SKILL.md` |
| be-civic harness (`/home/gstack/projects/be-civic/`) | Grep for "ship", "pull request", "pr open", "commit" across CLAUDE.md, AGENTS.md, README files | no — be-civic is a process-content product; no delivery-pipeline skill found | — |
| DORA research (`dora.dev`) | Pre-merge gate best practices, delivery pipeline metrics, commit discipline, small batches | no liftable document — DORA is methodology/metrics, not a `.claude` primitive | — |
| Published git/PR best practice (pullchecklist.com, datacamp, Conventional Commits gist) | Commit message conventions, PR description quality, pre-merge checklists | no liftable document — reference material incorporated into Challenge findings | — |

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/gstack-ship-SKILL.md` | keep | Primary analogue. Tests → coverage audit → eval suites → version bump → WIP squash → bisectable commits → pre-landing review (specialist army + adversarial) → CHANGELOG → TODOS sync → push → documentation sync → PR create. 20 steps. Challenge reference throughout. |
| `source-material/ce-commit-push-pr-SKILL.md` | keep | Secondary analogue. Commit + push + PR with adaptive description quality: evidence capture (ce-demo-reel), pr-description-writing.md reference, description-only and description-update modes. Covers the commit/PR slice without the test-coverage-version slice. |

## Keep / Drop

**Kept (absorbed into body):**
- Test suite execution and coverage gate enforcement (the pre-PR quality check).
- Version bump step (optional, semver-aware, harness-configured — or no bump).
- **WIP-commit squash before the delivery commit** (CF-3): an explicit phase (was a
  parenthetical in Phase 4), with detection of `WIP:` commits and a non-destructive squash
  path (rebase for mixed branches, soft-reset for WIP-only branches) plus anti-footgun
  guards against destroying non-WIP commits. Modelled on gstack /ship Step 15.0.
- Checkpoint commit with a descriptive message (the commit before PR open).
- PR open with an authored description composed from the diff and context, **deepened with
  the verification evidence ship already produced** (test results, coverage delta) and
  structured per the `pr-description-shape` ref (CF-5).
- **Auto-proceed default with named operator gates** (CF-2): non-gate steps (test run,
  coverage report, WIP squash, present-and-proceed on commit-msg / PR-desc) auto-proceed;
  genuine operator gates (version bump, review ASK, coverage-regression override) halt. The
  collaborative mode is preserved; default friction drops. Modelled on gstack /ship's
  "non-interactive by default, named stops" model.
- Standalone-capable: can be invoked outside the land arc.

**Dropped (out of scope):**
- Merge: deploy's responsibility.
- Deploy: deploy's responsibility.
- Post-deploy health: canary's responsibility.
- CI re-run: ship's job is the local pre-PR gate; CI runs after the PR is open.

**Edge only (separate node):**
- `land` invokes `ship` — the invokes edge goes on `land`, not here; ship carries a `can-follow`
  back to land when it needs the arc context.
- `deploy` follows ship in the land sub-arc — not an edge from ship; deploy will carry its own
  `can-follow ship` or `land` will sequence them.

## Overlaps and seams

- **Upstream:** ship receives the outcome of `build` (or `reconcile` + `land` gate). The
  commit-to-land gate on `land` precedes ship in the arc; ship does not re-run the gate.
- **Downstream:** `deploy` picks up after ship opens the PR and (in `staging-first` mode)
  merges it. `canary` follows deploy. Ship signals completion by reporting the PR URL.
- **land** invokes ship as its first step. Ship is also standalone.

## Fit

Single node. The test → coverage → commit → PR sequence is one cohesive unit with one
measurable goal: a PR is open, tests pass, coverage gate holds. No sub-part earns a
separate goal; none is independently invokable except as steps inside this one body.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| can-follow | `land` | process — ship follows the land gate; land does not yet exist on disk (F7 prose) |
| precedes | `deploy` | process — ship precedes deploy in the land sequence; deploy does not yet exist on disk (F7 prose, same wave) |
| references | `pr-description-shape` | CF-5 — ship's PR-description phase reads the canonical PR-body shape (Summary / Trigger / Recommended decision / Read set) at the step of need. `load: on-demand` (larger, conditional, read when composing the body). Target exists at `graph/_refs/pr-description-shape.md` (`kind: reference`). Inline frontmatter syntax `- { id: pr-description-shape, load: on-demand }`. Same wiring `pr-author` already uses. |

No `composes-into dev-sprint` — ship is a sub-arc, not a backbone stage. No `invokes`
edges to other nodes (test run, version bump, WIP squash, and PR open are inline tool/git
calls). The one shared reference depended on is `pr-description-shape` (CF-5, above); the
`instrumentation-preamble` ref edge remains an open question (below).

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — confirmed.

**`goals:` as outcomes:** All three goals read as measurable outcomes (PR open with tests
passing; commit/PR description quality; coverage regressions surfaced pre-merge) — confirmed.

**Edge targets resolvable:** Both process edges (`can-follow land`, `precedes deploy`) are
deferred F7 — neither target exists on disk at authoring time. Both are described in body
prose and omitted from frontmatter edges. The one declared `references` edge —
`pr-description-shape` (`load: on-demand`) — resolves to `graph/_refs/pr-description-shape.md`
(`kind: reference`), which exists; validate resolves it.

## Open questions

- Whether `ship` should carry a `references` edge to an `instrumentation-preamble` ref once
  that ref is authored — should be added via `amend` in that wave.
- Version bump: whether semver bump is always present or opt-in is harness-configured; the
  body treats it as optional and harness-supplied.
- Whether the `headless` mode (no operator confirmations, CI-style) mentioned in the body
  should be modelled now or deferred to a validated need. The CF-2 amend (2026-06-04) already
  flipped the default to auto-proceed with named gates, narrowing the gap to a fully-unattended
  CI mode (no version-bump or override gate either) — still deferred to a validated need.
- CF-4 (bisectable / logical-split commit discipline) was **not** addressed in this amend — it
  remains a low-severity open recommendation (single delivery commit is still the model). Pick
  up via a later `amend` if validated.

## Challenge findings

The gstack ship skill and ce-commit-push-pr, combined with DORA delivery research, surface
five areas where the stack-graph ship node is materially weaker than its real-world analogues.
These are not design errors — the node was authored without external corroboration. They are
gaps the operator should evaluate before treating ship as production-ready.

**Reconciliation verdicts (2026-06-04, `docs/research-backfill-reconciliation.md` cluster A).**
Each finding was judged APPLY / DROP / REJECT against the locked decisions. Verdicts:

| Finding | Verdict | Disposition in this amend |
|---|---|---|
| CF-1 — pre-landing review army at ship | **REJECT** | Not applied. See the rationale recorded on CF-1 below. |
| CF-2 — operator-confirmation model inverted | **APPLY** | Applied — body now auto-proceeds on non-gates, halts only at genuine gates. |
| CF-3 — no WIP-commit squash before delivery | **APPLY** | Applied — promoted to an explicit Phase (before commit) with anti-footgun logic. |
| CF-4 — no bisectable-commit discipline | (out of this amend's scope) | Unchanged. Not addressed in this amend; remains a low-severity open recommendation. |
| CF-5 — PR description depth weaker than analogue | **APPLY** | Applied — Phase 5 pulls structured verification evidence; wired to the `pr-description-shape` ref. |

### CF-1: No in-diff code review pass — gstack ships with a pre-landing review army

**What the analogue does:** gstack /ship (Steps 9–11) runs a multi-pass pre-landing review
before committing: a structured checklist pass, a specialist army (testing, maintainability,
security, performance, data-migration, API contract, design — dispatched in parallel as
subagents), a red-team pass for large diffs (200+ lines), and a cross-model adversarial
review (Claude subagent + Codex adversarial challenge). Findings are classified as AUTO-FIX
or ASK; AUTO-FIX items are applied before commit without asking; ASK items are a single
batched AskUserQuestion. The review result is logged for the Review Readiness Dashboard.

**What the stack-graph node does:** Phase 1 runs the test suite. Phase 2 enforces the
coverage gate. Neither phase performs static code review. The node body says "run the test
suite" and "enforce the coverage gate" — there is no code review step between coverage and
commit.

**The gap:** Tests and coverage are necessary but not sufficient. The analogue demonstrates
that ship is the natural insertion point for a pre-landing review because the diff is
complete and the operator is present. Post-merge review (if the PR reviewer catches it)
is more expensive. Stack-graph's ship misses the review-at-ship pattern entirely.

**Severity:** High — the analogue's review army is the most substantive capability gap.

**Recommendation (SUPERSEDED — see verdict).** ~~Add a Phase 2.5 for a pre-landing review
pass — at minimum a single-agent structural review of the diff before commit.~~

**Verdict: REJECTED (2026-06-04, reconciliation cluster A).** Applying this recommendation
would **regress** the design by duplicating a completed upstream stage. Per **D50**, the
dev-sprint backbone happy path is `build → review → reconcile → land`, and **ship runs inside
`land`** — after the dedicated `review` stage (and its review lenses, D27) has already run
against the diff, and after `reconcile` has adjudicated. A review army inside ship re-does the
`review` stage's job at the wrong place in the arc. The analogue (gstack /ship) folds review
into ship because gstack has no separate backbone review stage; stack-graph does, so the
capability lives there, not here. **Ship stays scoped to tests / coverage / commit / PR** — it
performs no in-diff code-review pass. (If a harness wants a final pre-PR sanity check, that is
the `review` stage's configuration, not a ship phase.)

---

### CF-2: Operator-confirmation model is inverted relative to the analogue

**What the analogue does:** gstack /ship is explicitly **non-interactive by default**. The
opening section says: "This is a non-interactive, fully automated workflow. Do NOT ask for
confirmation at any step." Gates are named exceptions: version MINOR/MAJOR bump, pre-landing
review ASK findings, Codex P1 gate, plan items NOT DONE. Every other step runs without
stopping. This is the DORA "small batches, automate everything" principle applied to the
ship workflow.

ce-commit-push-pr similarly auto-decides branch creation, auto-runs push, and only asks
when explicitly warranted (description apply confirmation, description-update mode).

**What the stack-graph node does:** The body phrases every phase as "present to operator for
confirmation" — commit message: "Present the draft commit message to the operator for
confirmation." PR description: "Present the draft PR title and body to the operator. On
confirmation, open the PR." This makes ship a 5-stop interactive workflow by default.

**The gap:** The node's collaborative mode is correct (operator gates are real), but the
analogue teaches that the default should be automation with named stops, not confirmation at
every step. Requesting operator confirmation on the commit message and PR description every
time is friction that the analogue deliberately eliminates. The analogue confirms once (the
AskUserQuestion decision brief) at the right gate, not at every step. Stack-graph's node
risks becoming a slow ceremony rather than a fast delivery primitive.

**Severity:** Medium — the node is not wrong, but it creates more interruptions than
best practice warrants. Directly impacts the goal "Coverage regressions are surfaced at
ship, not discovered post-merge" — if ship is slow, operators skip it.

**Recommendation:** Amend the body to distinguish auto-proceed steps (test run, coverage
report, WIP squash) from genuine operator gates (pre-landing review ASK findings, MINOR/MAJOR
version bump). The commit message and PR description confirmations should be "present and
auto-proceed unless the operator intervenes", not "halt and wait". This preserves the
collaborative mode while reducing friction.

**Verdict: APPLY (2026-06-04, reconciliation cluster A) — APPLIED in this amend.** A
"Confirmation model" section now defines the default as **auto-proceed**: test run, coverage
report, WIP squash, and the commit-message / PR-description drafts are *presented and proceed
automatically unless the operator intervenes*. Reserved **operator gates** (halt-and-wait) are:
a `minor`/`major` version bump, a coverage-regression override, a test failure, and an unstaged
working tree. The collaborative mode is preserved (the gates are real); the every-step
confirmation friction is removed. Each phase body now states its mode (auto-proceed vs gate)
explicitly. Note: the gstack analogue lists a "review ASK" gate — for stack-graph that gate is
on the upstream `review` stage, not ship (see CF-1 verdict), so it is not a ship gate here.

---

### CF-3: No WIP-commit squash before the delivery commit

**What the analogue does:** gstack /ship Step 15.0 explicitly handles WIP commit squash
for continuous-checkpoint mode. If the branch contains `WIP:` prefix commits (from
auto-checkpointing during build), they are squashed into clean logical commits before the
delivery commit is created. The analogue distinguishes WIP commits (checkpoints) from
delivery commits (the PR-opening commit), and enforces a non-destructive squash path
(rebase for mixed branches; soft-reset for WIP-only branches). Anti-footgun rules prevent
blind `git reset --soft` that would destroy non-WIP commits.

**What the stack-graph node does:** Phase 4 says "if there are WIP commits in the history
that should be squashed before the PR opens, surface them to the operator and squash on
confirmation." This is documented as "checkpoint discipline" but is treated as an operator
observation, not a required phase with explicit detection logic.

**The gap:** In the stack-graph operating model, the `build` stage uses continuous
checkpointing (`WIP:` commits). If ship does not actively detect and squash these, the PR
will contain WIP-prefix commits, which is a delivery hygiene failure. The analogue
demonstrates that squash is a mandatory, automated step — not an optional observation.

**Severity:** Medium — the gap is real but scoped to continuous-checkpoint mode. If the
harness does not use `WIP:` commits, the gap does not fire.

**Recommendation:** Promote WIP squash from a parenthetical observation in Phase 4 to an
explicit Phase 3.5 (before commit): detect `WIP:` commits on the branch, squash them into
clean commits, surface anti-footgun logic. Reference the gstack approach as the model.

**Verdict: APPLY (2026-06-04, reconciliation cluster A) — APPLIED in this amend.** WIP squash
is now an explicit **Phase 4 — Squash WIP checkpoint commits**, placed **before** the delivery
commit (the old commit phase becomes Phase 5, etc.). It: (1) detects `WIP:`-prefixed commits on
the branch ahead of the base; (2) chooses the squash path — **soft-reset** when the branch is
WIP-only, **interactive-equivalent rebase** when WIP and non-WIP commits are mixed (squashing
only the WIP commits, preserving the rest); (3) carries explicit **anti-footgun** guards: never
blind `git reset --soft` past a non-WIP commit, confirm the base before resetting, and abort to
the operator if the WIP/non-WIP boundary is ambiguous. If no `WIP:` commits exist, the phase is
a no-op and auto-proceeds. Modelled on gstack /ship Step 15.0.

---

### CF-4: No bisectable-commit discipline — single delivery commit vs logical grouping

**What the analogue does:** gstack /ship Step 15.1 creates **bisectable commits**: changes
are grouped by logical unit (infrastructure → models/services → controllers/views →
VERSION+CHANGELOG), each commit contains one coherent change, a model and its test go in
the same commit, and the final commit is the version/CHANGELOG metadata commit. The goal
is git-bisect compatibility and LLM-readable history. The analogue has an explicit commit
ordering that makes the history navigable.

ce-commit (CE analogue for commit-only) similarly says: "Scan changed files for naturally
distinct concerns. If they clearly group into separate logical changes, create separate
commits."

**What the stack-graph node does:** Phase 4 creates a single "delivery commit" from all
staged changes. The body says "the ship commit is the delivery commit — the one that opens
the PR. It should be clean (not a WIP stash)." No mention of logical splitting. The
implicit model is: one commit per PR.

**The gap:** The analogue teaches that the delivery commit surface is where bisectability
is enforced. A single monolithic commit per PR is easier to author but harder to bisect,
harder to revert precisely, and harder for reviewers to follow. The stack-graph node's
single-commit model is a simplification relative to the analogue's multi-commit model.

**Severity:** Low — this is a quality-of-history gap, not a correctness gap. PRs with
single commits still ship correctly. However, the gap means the node cannot claim to
support standard git-bisect workflows.

**Recommendation:** Add a Phase 4.5 or amend Phase 4 to address logical splitting: "If
the staged diff spans multiple logical concerns (e.g., infrastructure + business logic +
tests for a separate feature), split into separate commits. Each commit = one coherent
change. Small diffs (< 50 lines, < 4 files) may use a single commit." This aligns with
both analogues without requiring a complex rebase strategy.

---

### CF-5: PR description depth is weaker than the analogue's adaptive quality model

**What the analogue does:** ce-commit-push-pr has a dedicated `references/pr-description-writing.md`
reference document that the skill must read before composing any PR description. It also
has an evidence decision tree: if the change has observable behavior (UI, CLI output, API
behavior), the skill asks whether to capture a demo (via ce-demo-reel), use existing
evidence, or skip. The PR description is adaptive — it scales in depth with the change. The
analogue distinguishes description-only mode (print and stop), description-update mode
(existing PR, rewrite), and full-workflow mode (create new PR).

gstack /ship's PR body (Step 19) is structured: Summary (all commits), Test Coverage
(diagram), Pre-Landing Review, Design Review, Eval Results, Greptile Review, Scope Drift,
Plan Completion, Verification Results, TODOS, Documentation. Each section is populated from
the preceding steps. The PR body is a delivery record, not just a description.

**What the stack-graph node does:** Phase 5 says "author a PR description from: the commit
history, the work-item context, and key decisions or trade-offs." The body lists the minimum
PR description content: one-sentence summary, rationale, trade-offs, test plan. This is
correct but thin relative to the analogues. No reference to a PR description writing guide,
no evidence capture, no structured section template.

**The gap:** The stack-graph node's PR description model is MVP-complete but misses: (a)
a reference to a shared PR description writing guide (which can be a harness-supplied
reference); (b) evidence capture for observable changes (screenshot, demo); (c) structured
sections that reflect the preceding verification steps (coverage gate result, review
findings, plan completion). A PR that only includes a one-sentence summary and trade-offs
leaves reviewers without the verification evidence the ship process already produced.

**Severity:** Low-medium — the description model is not wrong, but it does not leverage
the verification evidence ship already has at hand.

**Recommendation:** Amend Phase 5 to: (a) reference a harness-supplied PR description
writing guide if available; (b) include structured sections for the verification evidence
ship already produced (test results, coverage delta); (c) add optional evidence capture
(screenshot or demo link) for operator-facing changes. The description should be a delivery
record of what ship verified, not just a human-facing summary.

**Verdict: APPLY (2026-06-04, reconciliation cluster A) — APPLIED in this amend.** The PR-open
phase now: (a) **reads the `pr-description-shape` reference** at the step of need (new
`references` edge, `load: on-demand`) for the canonical body shape — `## Summary`,
`## Trigger`, `## Recommended decision`, `## Read set`; (b) **populates structured sections
from the verification evidence ship already produced** — the test-suite result and the coverage
delta are carried straight into the PR body rather than re-derived, so the description is a
delivery record of what ship verified; (c) names optional evidence capture (screenshot / link)
for operator-facing changes as a harness-supplied option. The reconciliation note observed the
`pr-description-shape` ref already exists in `_refs/`; this amend wires ship to it. The shape is
authored for curator PRs — ship adapts it: it keeps Summary / Trigger (= what is shipping) /
Recommended decision (= merge this) / Read set, and folds the test + coverage evidence into the
body. A harness may additionally supply its own PR-description guide via the overlay.
