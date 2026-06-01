---
title: Research report for ship
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 2
researcher_adequacy_note: |
  Sources lifted: docs/graph-map.md (sub-arcs table row for `ship`, "Edges at a glance"
  section) and docs/dev-sprint-backbone-design.md (land stage spec, wave discussion, the
  anti-deferral fork resolution). Both sources are consistent: ship is tests → coverage →
  version → commit → PR, ending at the open PR (not merge). Confidence in skill/collaborative
  is high — the operator interacts at every step (confirm test suite, read coverage report,
  approve commit message, confirm PR description). Mode is generative. Edges are conservative:
  land does not yet exist on disk, so the can-follow and precedes targets for the backbone
  process edges are deferred (F7). deploy does not yet exist at authoring time but will be
  authored in the same wave. Translator should treat deploy as an F7 prose seam until its node
  file resolves. Goals are clearly outcome-frameable: tests pass, coverage gate holds, a PR
  exists for review — each measurable.
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

## Source inventory

| file | status | notes |
|------|--------|-------|
| `docs/graph-map.md` | keep | Sub-arc table row for ship: goal (tests→coverage→version→commit→PR), invoker (land; standalone). |
| `docs/dev-sprint-backbone-design.md` | keep | Land stage spec + wave decision: ship = wave 1, every change PRs; fork resolution that ship is standalone + invoked by land. |

## Keep / Drop

**Kept (absorbed into body):**
- Test suite execution and coverage gate enforcement (the pre-PR quality check).
- Version bump step (optional, semver-aware, harness-configured — or no bump).
- Checkpoint commit with a descriptive message (the commit before PR open).
- PR open with an authored description composed from the diff and context.
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

No `composes-into dev-sprint` — ship is a sub-arc, not a backbone stage. No `invokes`
edges to other nodes (test run, version bump, and PR open are inline tool calls). No
shared references depended on at this time (instrumentation-preamble ref not yet authored).

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — confirmed.

**`goals:` as outcomes:** All three goals read as measurable outcomes (PR open with tests
passing; commit/PR description quality; coverage regressions surfaced pre-merge) — confirmed.

**Edge targets resolvable:** Both process edges (`can-follow land`, `precedes deploy`) are
deferred F7 — neither target exists on disk at authoring time. Both are described in body
prose and omitted from frontmatter edges. No other edges declared.

## Open questions

- Whether `ship` should carry a `references` edge to an `instrumentation-preamble` ref once
  that ref is authored — should be added via `amend` in that wave.
- Version bump: whether semver bump is always present or opt-in is harness-configured; the
  body treats it as optional and harness-supplied.
