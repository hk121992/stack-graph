---
title: Research report for deploy
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 2
researcher_adequacy_note: |
  Sources lifted: docs/graph-map.md (sub-arcs table row for `deploy`: goal merge → deploy →
  wait; modes staging-first/prod-direct/staging-only) and docs/dev-sprint-backbone-design.md
  (land stage spec, wave-1 decision that deploy covers staging/preview). Both sources are
  consistent and the node boundary is clean: deploy picks up after ship's PR is open, merges
  it, triggers the deploy pipeline, and waits for it to settle. It does not confirm prod
  health (canary's job). Confidence in skill/collaborative is moderate — deploy could be
  autonomous (it is largely mechanical), but operator confirmation before merge and on deploy
  error make collaborative the safer call; an `amend` could flip it to autonomous+agent if
  experience shows it is fully unattended. The deploy-config reference is harness-supplied
  (external overlay); no factory reference file exists, so it is a prose seam (F7). Process
  edges to `land` (can-follow) and `ship` (can-follow) and `canary` (precedes) are all F7 —
  none of those nodes exist on disk at authoring time. Translator should treat all process
  edges as F7 prose seams and omit them from frontmatter.
---

# Research report for deploy

## Identity

**Candidate id:** `deploy`
**Candidate title:** Deploy
**Scope:** The `deploy` sub-arc picks up after `ship` opens a PR. It merges the PR,
triggers the deployment pipeline (to staging, preview, or production depending on mode),
and waits for the deploy to settle (pipeline complete, environment reachable). It ends
when the deployment is settled — not when prod health is confirmed; that is `canary`.
Deploy is invoked by `land`; it is not standalone in the typical path (you wouldn't
deploy without a PR). Deploy has three **modes** (body branches, D34): `staging-first`
(merge → deploy to staging/preview → confirm staging is healthy, then hold for prod),
`prod-direct` (merge → deploy directly to prod), and `staging-only` (merge → deploy to
staging/preview → stop; no prod deploy).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Merges and deployments complete without manual intervention in the common case, and failures surface with enough signal to act on. | % of deploys that complete without operator unblocking (excluding legitimate human-gate holds); MTTR on deploy failures (time from failure signal to resolved or escalated). | Unblocked deploy rate above baseline; deploy failure MTTR below baseline. |
| Staging/preview environments reflect the merged change before prod receives it (staging-first mode). | Staging deploy confirmed before prod pipeline triggers; staging-only deploys confirmed before the session closes. | No prod deploy in staging-first mode without a prior staging confirmation. |
| The deployment step does not silently swallow failures — every deploy error surfaces to the operator, not just to CI. | Deploy failures surfaced in-session vs found post-hoc by the operator checking CI independently. | Post-hoc-discovered deploy failures trend to zero. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** Deploy triggers a merge (an irreversible action) and monitors a pipeline
whose failures require operator judgment. While much of deploy's body is mechanical
(merge PR, poll pipeline, check URL reachability), the decision points — what to do when
a deploy pipeline fails, whether to proceed to prod in staging-first mode, whether to
revert — require the operator in the loop. A skill (collaborative) is the correct call.
If a future harness automates all deploy decisions (full CI pipeline, automatic revert),
an `amend` could make this an agent — but the general factory shape is collaborative.

**`determinism:`** `generative`

**Rationale:** The status reporting and failure triage require language generation. The
pipeline poll and URL check are deterministic, but the skill's orchestration and
operator communications are generative.

## Contract

**Input:** The PR URL (from `ship`), the deploy pipeline configuration (harness-supplied
via `deploy-config` overlay), the mode token (`staging-first` / `prod-direct` /
`staging-only`), and any deploy-environment credentials (harness-supplied, not stored
here).

**Output:** The deploy status (settled / failed / staging-only-complete), the deployment
URL(s), and — in `staging-first` mode — a staging-health signal that gates the prod
deploy.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `docs/graph-map.md` | keep | Sub-arc table row for deploy: goal (merge → deploy → wait), modes (staging-first/prod-direct/staging-only), invoker (land). |
| `docs/dev-sprint-backbone-design.md` | keep | Land stage spec + wave-1 decision: deploy covers staging/preview; live-confirmed gate fires when deploy settles. |

## Keep / Drop

**Kept (absorbed into body):**
- Merge the PR (the first action — irreversible, operator-confirmed).
- Trigger the deploy pipeline using harness-configured tooling.
- Poll for pipeline completion and surface failures.
- Confirm deployment URL is reachable (basic smoke check).
- Mode branches: staging-first / prod-direct / staging-only.
- Harness-supplied deploy-config (the external overlay seam).

**Dropped (out of scope):**
- PR creation: ship's responsibility.
- Post-deploy prod health: canary's responsibility.
- Revert strategy: land's responsibility (land owns the revert loop back to reconcile).
- Environment provisioning: infrastructure setup is out of scope.

**Edge only (separate node):**
- `canary` follows deploy (precedes edge, F7 — canary not yet authored).
- `land` invokes deploy (invokes edge lives on land, not here).

## Overlaps and seams

- **Upstream:** ship hands deploy the PR URL. Deploy's first action is merging that PR.
- **Downstream:** canary picks up after deploy settles (the live-confirmed gate in the
  `land` arc fires after both deploy and canary pass). Deploy does not invoke canary —
  `land` sequences the sub-arc.
- **land:** `land` invokes deploy after ship. Deploy reads the `deploy-config` overlay
  that `land`'s harness provides. The live-confirmed gate is land's (the gate lives at
  land's exit, not deploy's).

## Fit

Single node. The three modes (staging-first / prod-direct / staging-only) are body
branches of one deploy skill, not separate nodes — they share the merge step and the
pipeline-poll logic; they differ only in which environments they target and whether they
hold for a staging confirmation. No sub-part earns a distinct goal separate from
"the deploy is settled."

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| can-follow | `ship` | process — deploy follows ship in the land sub-arc; ship does not yet exist at authoring time (F7 prose — authored in the same wave) |
| can-follow | `land` | process — deploy is invoked within the land stage; land does not yet exist on disk (F7 prose) |
| precedes | `canary` | process — deploy precedes the canary health check; canary does not yet exist on disk (F7 prose, wave 2) |

`deploy-config` reference: harness-supplied external overlay. No factory reference file
exists for it; it is a prose seam (F7) — described in body prose, no `references` edge
in frontmatter. No `composes-into dev-sprint` (sub-arc, not a backbone stage).

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — confirmed.

**`goals:` as outcomes:** All three goals read as measurable outcomes (unblocked deploy
rate; staging-before-prod discipline; failure surfacing) — confirmed.

**Edge targets resolvable:** All process edges are F7 — `ship`, `land`, and `canary`
do not exist on disk at authoring time. `deploy-config` is an external overlay seam
with no factory file. All are described as prose seams and omitted from frontmatter
edges per the F7 constraint.

## Open questions

- Whether the `can-follow ship` and `can-follow land` process edges should be wired via
  `amend` once those node files exist (expected yes — same wave).
- Whether a future `headless` mode (fully automated, CI-pipeline-integrated) earns its
  own node or remains a body branch.
- Whether `deploy` should carry an explicit `references` edge to a `checkpoint-commit`
  or `git-branch-setup` reference if those are authored — add via `amend` in that wave.
