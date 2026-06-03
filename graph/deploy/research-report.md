---
title: Research report for deploy
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: "Backfill external-analogue search: lifted gstack land-and-deploy + canary SKILL.md; added External analogues searched table; added Challenge findings section; deepened Edges, Contract, Open questions against analogue. All prior still-valid content preserved."
sources_lifted: 2
external_analogue_found: true
external_corpora_searched:
  - "gstack live skills (/home/gstack/.claude/skills/gstack/)"
  - "CE plugin skills (/home/gstack/scratch/ce-plugin/plugins/compound-engineering/skills/)"
  - "be-civic harness (/home/gstack/projects/be-civic/)"
  - "Published best practice: DORA metrics (dora.dev, octopus.com/devops/metrics/dora-metrics/, cd.foundation DORA-5)"
  - "Published best practice: CD best practices 2025 (catdoes.com, moss.sh, upstat.io, anotherwrapper.com)"
  - "Published best practice: deployment gates and human approval (oneuptime.com, grizzlypeaksoftware.com, devopstraininginstitute.com)"
researcher_adequacy_note: |
  Searched all six corpora mandated by the task: gstack live skills (land-and-deploy, canary, ship,
  setup-deploy, landing-report), CE plugin skills (no deploy/release skill found — ce-commit,
  ce-release-notes are the closest but neither covers the merge+pipeline+wait lifecycle), be-civic
  harness (no harness-local deploy skill found; be-civic-plugin-dev and bc-workspace reference
  deploy via the shared gstack land-and-deploy), and three published best-practice streams (DORA
  metrics, CD best-practice roundups, deployment gate/human-approval doctrine). Lifted two files
  verbatim: gstack/land-and-deploy (the primary analogue — covers the identical job: merge PR,
  detect platform, trigger pipeline, wait, verify) and gstack/canary (downstream node, clarifies
  the inline-vs-standalone health-check seam). Edges were determined from the node body's explicit
  sequencing (can-follow ship, can-follow land, precedes canary) and from the analogue's step
  structure (land-and-deploy shows that deploy/verify is one unified skill in practice, not split).
  Confidence in skill/collaborative is high — land-and-deploy confirms the judgment: it has one
  critical gate (pre-merge readiness) and surfaces every failure to the operator, which is exactly
  the collaborative pattern. No goals were difficult to frame as outcomes. The Challenge findings
  section surfaces six concrete gaps between the stack-graph deploy node and its real-world
  counterpart. Recommendation: proceed to translator with the Challenge findings as an amendment
  backlog — the node is structurally sound but underspecified relative to the analogue.
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

**Clarification from analogue (2026-06-03):** The gstack analogue (`land-and-deploy`)
shows that the three modes map cleanly to its Step 5a staging-first option (A/B/C), but
the analogue also reveals a fourth operational mode that the stack-graph node omits:
a **docs-only** fast-path where no deploy or verification is needed at all. Whether this
is a mode branch or a preflight short-circuit is an open question (see Open questions).

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
The gstack analogue (`land-and-deploy`) confirms this: it is a `collaborative` skill with
explicit operator gates before the merge and on deploy failures. If a future harness
automates all deploy decisions (full CI pipeline, automatic revert), an `amend` could
make this an agent — but the general factory shape is collaborative.

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

**Clarification from analogue (2026-06-03):** The gstack analogue adds to this contract:
merge commit SHA (reported to operator and logged for revert), pipeline run URL (so
operator can track independently), timing data (CI wait, queue, deploy, staging, canary
duration), review-staleness status, and a full deploy report artifact. The stack-graph
node's stated Output covers the essentials but omits the deploy report and timing data
that the analogue treats as required output. See Challenge findings.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills (`~/.claude/skills/gstack/`) | `land-and-deploy`, `canary`, `ship`, `setup-deploy`, `landing-report` — deploy lifecycle skills | yes — `land-and-deploy` and `canary` | `gstack-land-and-deploy-SKILL-excerpt.md`, `gstack-canary-SKILL-excerpt.md` |
| CE plugin skills (`ce-plugin/plugins/compound-engineering/skills/`) | `ce-commit`, `ce-release-notes`, `ce-work`, `ce-work-beta` — release/ship coverage | partial — ce-commit covers commit, ce-release-notes covers changelog; neither covers merge+pipeline+wait | no (scope mismatch — narrower than deploy) |
| be-civic harness (`/home/gstack/projects/be-civic/`) | deploy skills in bc-workspace, be-civic-plugin-dev | not found — be-civic inherits gstack land-and-deploy; no harness-local deploy override | no |
| DORA metrics (dora.dev, octopus.com, cd.foundation) | deployment frequency, change failure rate, failed deployment recovery time — the delivery performance framework the deploy node operationalises | yes — DORA 4+1 metrics; 2024 report findings; DORA-5 (rework rate added 2025) | no (cited in Challenge findings; web sources, not file lifts) |
| CD best practice 2025 (catdoes.com, moss.sh, upstat.io, anotherwrapper.com) | merge strategy, rollback, pipeline gates, staging-first pattern, canary/blue-green/feature-flag deployment strategies | yes — trunk-based dev, blue-green instant rollback, quality gates, canary pattern | no (cited in Challenge findings) |
| Deployment gates and human approval (oneuptime.com, grizzlypeaksoftware.com, devopstraininginstitute.com) | human gate patterns, four-eyes principle for production merge, approval gate doctrine | yes — manual approval gates, four-eyes, compliance gates | no (cited in Challenge findings) |

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/gstack-land-and-deploy-SKILL-excerpt.md` | keep | Primary analogue — the real production deploy skill. Covers the identical job (merge, pipeline, wait, verify) with full implementation detail. Input to Keep/Drop and Challenge findings. |
| `source-material/gstack-canary-SKILL-excerpt.md` | keep (edge-only) | Downstream node clarification — defines the seam between deploy's inline smoke check and canary's extended monitoring. Does not belong absorbed into deploy; models the `precedes canary` edge. |
| `docs/graph-map.md` (in-repo) | keep (input only) | Sub-arc table row for deploy: goal (merge → deploy → wait), modes (staging-first/prod-direct/staging-only), invoker (land). Design input, not external analogue. |
| `docs/dev-sprint-backbone-design.md` (in-repo) | keep (input only) | Land stage spec + wave-1 decision: deploy covers staging/preview; live-confirmed gate fires when deploy settles. Design input, not external analogue. |

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
- Post-deploy prod health (extended monitoring): canary's responsibility.
- Revert strategy: land's responsibility (land owns the revert loop back to reconcile).
- Environment provisioning: infrastructure setup is out of scope.
- Deploy infrastructure detection and dry-run validation (first-run setup): these belong
  in a `setup-deploy` node or as harness-init preflight, not in the deploy skill body.

**Edge only (separate node):**
- `canary` follows deploy (precedes edge, F7 — canary not yet authored).
- `land` invokes deploy (invokes edge lives on land, not here).
- `setup-deploy` is the harness-config analogue (setup-deploy configures what deploy reads).

**Newly identified from analogue — candidates for body or separate node (2026-06-03):**
- Merge queue awareness (polling, timeout, messaging) — body candidate for deploy.
- Deploy report artifact (timing data, verdict) — body candidate; the node currently ends
  at "deployment URL + status" but the analogue produces a full report.
- Inline single-pass smoke check before handing off to canary — currently attributed to
  canary (precedes edge), but the analogue shows this inline check is deploy's
  responsibility, not canary's. See Challenge findings finding C4.

## Overlaps and seams

- **Upstream:** ship hands deploy the PR URL. Deploy's first action is merging that PR.
- **Downstream:** canary picks up after deploy settles (the live-confirmed gate in the
  `land` arc fires after both deploy and canary pass). Deploy does not invoke canary —
  `land` sequences the sub-arc.
- **land:** `land` invokes deploy after ship. Deploy reads the `deploy-config` overlay
  that `land`'s harness provides. The live-confirmed gate is land's (the gate lives at
  land's exit, not deploy's).
- **Seam clarification from analogue (2026-06-03):** In `land-and-deploy`, the deploy
  skill performs an inline single-pass health check (step 7) before reporting "settled".
  This is not canary's extended monitoring loop — it is deploy's own output gate. The
  stack-graph deploy node attributes this check to `canary` via a `precedes` edge, but
  the analogue shows it belongs inside deploy's body. The `precedes canary` edge is
  correct for the *extended* monitoring loop; the inline smoke check is a deploy
  responsibility that should be in the node body.

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
| precedes | `canary` | process — deploy precedes the canary extended monitoring loop; canary does not yet exist on disk (F7 prose, wave 2) |

`deploy-config` reference: harness-supplied external overlay. No factory reference file
exists for it; it is a prose seam (F7) — described in body prose, no `references` edge
in frontmatter. No `composes-into dev-sprint` (sub-arc, not a backbone stage).

**Newly surfaced from analogue (2026-06-03):**
- A `references` edge to a `deploy-report-schema` reference may be warranted once the
  deploy report artefact is formalised (the analogue writes a structured JSONL entry with
  specific fields). Add via `amend` when the report schema is authored.
- A `references` edge to `deploy-config` (external: true) should be added to frontmatter
  once the deploy-config reference is authored; currently described as prose only (F7).

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — confirmed.

**`goals:` as outcomes:** All three goals read as measurable outcomes (unblocked deploy
rate; staging-before-prod discipline; failure surfacing) — confirmed.

**Edge targets resolvable:** All process edges are F7 — `ship`, `land`, and `canary`
do not exist on disk at authoring time. `deploy-config` is an external overlay seam
with no factory file. All are described as prose seams and omitted from frontmatter
edges per the F7 constraint.

---

## Challenge findings

This section records where the `deploy` node is weaker than its real-world analogue
(`gstack/land-and-deploy`), what best practice it omits, unsupported claims, missing
steps/modes, and scope gaps. It is the normative output of the external-analogue search.

### C1 — Missing: deploy infrastructure detection and first-run dry run

**Severity: high**

`land-and-deploy` devotes its Step 1.5 (a substantial phase) to detecting the deploy
platform before any irreversible action, producing a validation table the operator
confirms. The stack-graph `deploy` node assumes a harness-supplied `deploy-config` is
always present and correct, with no detection or validation step. In practice, first-run
deployments fail exactly because the config is wrong or the tooling is not authenticated.

**Gap:** The node says "confirm the deploy-config overlay is reachable" (preflight step 1)
but does not specify what "reachable" means, how to detect it is absent, or what to do
when it is partially correct. The analogue has a structured six-field config (platform,
production URL, staging URL, merge method, deploy timeout, workflow file) and auto-detects
from files before falling back to the operator.

**Recommendation:** Add a deploy-config validation checklist to preflight that names the
required fields; treat a missing field as a STOP with a description of what to supply.
The factory node stays general (no platform specifics); the harness supplies them via the
overlay. But the validation contract must be explicit.

### C2 — Missing: merge queue awareness

**Severity: medium**

The stack-graph `deploy` node's Phase 1 (merge the PR) uses `gh pr merge` and reports the
merge commit SHA, but it does not model **merge queues** — a first-class GitHub feature
where `--auto` puts the PR into a queue and the actual merge happens later after an
additional CI run. `land-and-deploy` step 4a handles this explicitly: detects auto-merge
vs direct merge path, polls for the queue to complete (30-minute timeout with 2-minute
progress messages), and surfaces a specific error if the PR is removed from the queue.

**Gap:** The node's Phase 1 — merge → "report the merge commit SHA" — implies the merge
is immediate. In practice with merge queues, this phase can take 5–30 minutes and can
fail with a queue-specific error (conflict introduced by another PR landing ahead).

**Recommendation:** Add a merge-queue detection branch to Phase 1: after issuing
`gh pr merge --auto`, check if the merge is immediate or queued, and handle the queue
poll separately from the CI poll in Phase 3.

### C3 — Missing: deploy report with timing analytics

**Severity: medium**

The node's Output section lists: merge commit SHA, pipeline run URL, deployment URL(s),
deploy status. The analogue (`land-and-deploy` step 9) produces a full ASCII report
with timing breakdown (dry-run, CI wait, queue, deploy, staging, canary, total), review
status, and a JSONL analytics entry per deploy. DORA metrics (change failure rate, MTTR,
deployment frequency) are not computable without this data.

**Gap:** The node claims a goal of "MTTR on deploy failures below baseline" but emits no
timing data that would support computing MTTR. There is no artefact specified for the
deploy output (no mention of a deploy report file or JSONL entry).

**Recommendation:** Add a "Deploy report" output item to the Output section. Specify the
fields: merge SHA, pipeline run URL, deployment URL(s), mode, deploy status, timing
(merge phase duration, pipeline settle duration), staging health result (if staging-first).
The analytics entry enables the MTTR and unblocked-deploy-rate goals to be measured.

### C4 — Missing/misattributed: inline single-pass smoke check

**Severity: medium**

The node ends at "the settled deployment URL is reachable — basic HTTP check on the
environment URL" and attributes all health confirmation to `canary` (via a `precedes`
edge). But `land-and-deploy` shows that the inline check in step 7 (which it calls
"canary verification") is **part of the deploy skill itself**, not a separate node
invocation. It is a single-pass check (goto URL, check console errors, perf, text,
screenshot) that must complete before the skill reports "settled." The standalone
`/canary` skill is for extended 10-minute monitoring, which is explicitly separate.

**Gap:** The current node body says "basic HTTP check on the environment URL" — this is
weaker than what the analogue does inline. The analogue checks: HTTP 200, no critical
console errors, real content (not blank), load time under 10s, annotated screenshot as
evidence. The difference matters: a 200 OK on a blank error page is not a settled deploy.

**Recommendation:** Strengthen the Phase 3 "Success" criteria to match the analogue's
inline check: HTTP 200 + no critical console errors + real content + screenshot evidence.
Clarify in the body that this inline check is distinct from `canary`'s extended
monitoring loop: deploy does the single-pass smoke check; canary does the extended loop.

### C5 — Missing: revert path specification

**Severity: medium**

The node says "if they choose revert, name the arc re-entry path (back through `land` →
`reconcile` revert loop) but do not invoke it yourself." This is correct in principle
but weaker than the analogue. `land-and-deploy` step 8 actually performs the revert:
`git revert <merge-commit-sha> --no-edit` + push; handles branch protections (creates a
revert PR if direct push is blocked); reports the revert commit SHA.

**Gap:** Best practice (DORA, CD guides) treats rollback as a single-step operation, not
a manual process. The node says "tell the operator the arc re-entry path" — this is a
guidance posture, not a rollback posture. The node correctly declines to auto-revert
(the operator decides), but it should at least **offer to perform the revert** rather
than only naming the path.

**Recommendation:** When the operator chooses revert, offer to execute `git revert
<sha>` (or create a revert PR if branch protections block direct push) and wait for that
revert to deploy before reporting. This keeps the operator in the decision loop
(operator chooses revert) while making the execution frictionless (deploy does the
mechanical steps).

### C6 — Scope gap: platform-agnostic polling contract underspecified

**Severity: low**

The node describes pipeline polling as "poll at a reasonable interval (harness-configured;
default 30s)" with a "harness-configured timeout; default 10 min." The analogue implements
four distinct polling strategies for different deploy platforms (GitHub Actions workflow,
platform CLI like fly/heroku, auto-deploy platforms like Vercel/Netlify with 60s wait,
custom hooks). The 10-minute default is also short — `land-and-deploy` uses 20 minutes
for deploy and 30 minutes for merge queues.

**Gap:** The node's polling model is correct at a high level but the defaults are
aggressive for real platforms (Fly.io deploys routinely take 3–5 minutes; Vercel 1–2
minutes; GitHub Actions builds 5–15 minutes). A 10-minute timeout will produce false
failures on first deploys.

**Recommendation:** Change the default timeout to 20 minutes to align with observed
platform behaviour. Note in the body that harness-configured timeouts should be
calibrated per platform. The four-strategy branching model (Actions/CLI/auto-deploy/hook)
is appropriate for the harness overlay to specify — the factory body describes the
contract, not the strategies.

### C7 — Omission vs. published best practice: DORA metrics not referenced

**Severity: low**

The node's goals reference "MTTR on deploy failures" and "unblocked deploy rate" without
naming the DORA framework that operationalises these. DORA metrics (deployment frequency,
lead time, change failure rate, failed deployment recovery time) are the published
measurement standard for delivery performance. The 2025 DORA-5 update added rework rate.

**Gap:** Not a structural gap but a methodology-provenance gap: the node does not cite
what framework its goals are drawn from, making the measurement definitions underspecified.
"Deploy failure MTTR below baseline" is ambiguous without the DORA definition of
"failed deployment recovery time" (time to restore service, not just re-deploy).

**Recommendation:** Add a note in the goals section or a `references` edge to a DORA
reference once that reference is authored. At minimum, the adequacy note should name
DORA as the methodology grounding the metric definitions.

---

## Open questions

- Whether the `can-follow ship` and `can-follow land` process edges should be wired via
  `amend` once those node files exist (expected yes — same wave).
- Whether a future `headless` mode (fully automated, CI-pipeline-integrated) earns its
  own node or remains a body branch. The analogue is collaborative but the analogy to a
  fully automated CI pipeline (no AskUserQuestion) is real — the question is whether the
  operator-confirmation gates are always required or can be suppressed.
- Whether `deploy` should carry an explicit `references` edge to a `checkpoint-commit`
  or `git-branch-setup` reference if those are authored — add via `amend` in that wave.
- **New (2026-06-03 from analogue):** Does the "docs-only" fast-path (no deploy needed
  for a docs-only change) belong as a mode branch (`docs-only`) or as a preflight
  short-circuit? The analogue treats it as a preflight exit in deploy-strategy detection.
- **New (2026-06-03 from analogue):** Should deploy perform the `git revert` when the
  operator chooses revert, or only describe the path? The analogue does the revert. The
  current node defers to `land` / `reconcile`. This is an architecture question about
  which node owns the revert execution.
- **New (2026-06-03 from analogue):** The inline single-pass smoke check (Phase 3
  success criterion: is the environment truly healthy, not just HTTP-200?) is currently
  described minimally. Should the factory specify the check fields (console errors, load
  time, content present, screenshot) or leave them to the harness overlay? The analogue
  specifies them in the factory.
