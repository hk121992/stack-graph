---
title: Research report for land
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: "Backfill external-analogue search: lifted gstack/land-and-deploy + CE/ce-commit-push-pr; added External analogues searched table, source inventory update, Challenge findings section, published best-practice citations (DORA, deployment-gate literature). Preserved all original content."
  - date: 2026-06-04
    note: "Reconciliation amend (cluster-A land rows): resolved CF-1 (pre-merge readiness surface on the commit-to-land gate, D45 dial sets rigour), CF-2 (revert mechanics — land owns the DECISION + the land→reconcile re-entry, deploy owns EXECUTION per deploy C5), CF-3 (deploy-event per D59 — land contributes the live-confirmed gate outcome to the existing carrier-keyed node-exit event; no second store), CF-4 (live-confirmed signal CONSUMES deploy's inline smoke check per deploy C4 — a deploy smoke test, not canary). Each finding's resolution recorded inline. CF-5/6/7 stay parked (low; out of scope). Body re-rendered to match."
  - date: 2026-06-04
    note: "Incremental-arc reuse amend (D56, incremental-improvement-design §4/§8 step 7, §9 R4): land is reused by the incremental loop. Added composes-into {id: incremental, stage: land} and references {id: carrier-interface, load: on-demand}. New body 'Incremental arc' section — on a standalone IU (carrier_kind: standalone-iu, arc: incremental) there is no upstream reconcile, so land fires its OWN single commit-to-land gate, which writes the terminal lifecycle_state (landed|parked|dropped) + the gate_decisions entry on the carrier-lite; the D45 maturity×tier dial auto-records on green for AFK/low-tier in a mature harness, hard-gates HITL/high-tier. Invokes ship then deploy; a non-deploying harness reaches landed via staging-only/PR-merge (no shipped→live split). Carrier-keyed live-confirmed event (id+kind+arc). NO debrief on the incremental arc (no outcome_link to read back). land consumes its carrier through carrier-interface (must not assume work-item-only fields when standalone-iu). ship/deploy invokes + all dev-sprint behaviour preserved verbatim. The review→land forward edge is declared on review's side — no inbound edge here. Status bumped v0.1.0 → v0.2.0."
sources_lifted: 2
external_analogue_found: true
external_corpora_searched:
  - "gstack live skills (~/.claude/skills/gstack/)"
  - "CE plugin (compound-engineering skills)"
  - "be-civic project harness"
  - "DORA metrics published guidance (dora.dev)"
  - "CI/CD deployment-gate literature (oneuptime.com, rutagon.com, devopstraininginstitute.com)"
researcher_adequacy_note: |
  External corpora searched: (1) gstack live skills — found land-and-deploy (primary analogue,
  lifted verbatim) and surveyed canary, ship, landing-report for coverage context. (2) CE plugin
  compound-engineering — found ce-commit-push-pr (secondary analogue, lifted verbatim); no
  separate deploy/land node in CE. (3) be-civic project harness — searched for deploy/land/merge
  docs; be-civic uses gstack skills and does not define its own land-equivalent primitive.
  (4) Published best practice — searched DORA metrics (dora.dev, getdx.com), deployment-gate
  literature (oneuptime.com/deployment-gates, rutagon.com/ci-cd-approval-gates,
  devopstraininginstitute.com post-deploy-validation) and CI/CD pipeline best practices.
  Sources lifted: gstack/land-and-deploy SKILL.md (the real-world counterpart that does the
  same delivery job) and CE/ce-commit-push-pr (covers the ship sub-arc, useful for challenging
  pre-merge gaps). Edge determination: invokes ship + deploy are the two live sub-arc targets;
  composes-into dev-sprint is the backbone membership; precedes debrief and can-follow reconcile
  remain F7 deferred seams. Primitive/mode confidence is high: land holds hard operator gates
  and surfaces decisions — collaborative skill is the only viable choice. Goals are well-framed
  as outcomes; the earns-keep thresholds are directional and could be sharpened. Challenge
  findings are substantive: the node is weaker than its real-world analogue on pre-merge
  readiness evidence, revert procedure, deploy report artefact, and post-deploy health-check
  depth. Recommendation: proceed to translator; challenge findings should drive a wave-2 amend
  pass once canary is authored and the reconcile revert loop is wired.
---

# Research report for land

## Identity

**Candidate id:** `land`
**Candidate title:** Land
**Scope:** The seventh backbone stage of the dev-sprint. Land takes a built and reconciled
change — cleared by the commit-to-land gate — and sequences the delivery sub-arc through to
a live, health-confirmed deployment. It holds two operator gates: **commit-to-land** (the
intake gate, advancing `in-delivery → shipped`) and **live-confirmed** (the exit gate,
advancing `shipped → live`). Wave-1 land invokes ship then deploy; canary is wave 2 (the
`live-confirmed` gate fires on deploy completion + any pre-launch smoke tests until canary
exists). Land does not write the carrier; the gates do, by design (D44).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Every cleared change reaches production (or a confirmed staging deploy) through a sequenced, gated path — not an ad-hoc push. | Share of changes that land via the ship → deploy sub-arc vs direct push; commit-to-land gate decisions recorded per item. | Direct-to-main pushes trend to zero; gate decisions are durable in the carrier. |
| Deploy failures and regressions surface in-session at land, not post-hoc. | Failures surfaced in-session vs found post-hoc by the operator checking CI independently; MTTR on land-time failures. | Post-hoc-discovered failures trend to zero over N sprints; revert paths are exercised quickly when triggered. |
| The live-confirmed exit is always an explicit operator decision, not an assumed automatic transition. | Share of land exits where the live-confirmed gate is explicitly recorded vs assumed; operator-reported surprises post-land. | Live-confirmed gate is recorded for every land exit; operator "I didn't know it was live" events reach zero. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** Land holds two hard operator gates — commit-to-land (intake) and
live-confirmed (exit). Neither can run unattended; the operator is the decision-maker at
both. Even the sub-arc steps (ship, deploy) surface decisions back through land before the
next step fires. Collaborative is required.

**`determinism:`** `generative`

**Rationale:** Gate framing, failure interpretation, and revert-or-proceed calls require
language judgment. The sub-arc steps themselves have deterministic phases (test run, merge,
pipeline poll), but land's orchestration and gate-surface prose are generative.

## Contract

**Input:** The work-item carrier (with a cleared commit-to-land gate decision already
recorded — confirmed prior to or at this session's start); the harness deploy-config overlay
(resolved by the harness; land reads it to know which mode to default to).

**Output:** The live-confirmed gate decision in the carrier; the deployment URL(s) (staging
and/or prod, per mode). In staging-only mode: the confirmed staging URL; the prod deploy is a
future land invocation.

## External analogues searched

Record of the real-world search — corpus, query, found, lifted.

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills (`~/.claude/skills/gstack/`) | land-and-deploy, ship, canary, landing-report — merge/deploy/verify workflow skills | yes — land-and-deploy is the primary real-world analogue | `gstack-land-and-deploy-SKILL.md` |
| CE plugin (`ce-plugin/plugins/compound-engineering/skills/`) | ce-commit-push-pr, ce-work, ce-release-notes — any deploy/land/ship equivalents | yes — ce-commit-push-pr covers the ship (pre-merge) sub-arc; no CE deploy-and-verify skill found | `ce-commit-push-pr-SKILL.md` |
| be-civic project harness (`~/projects/be-civic/`) | deploy/land/merge/ship/release references in CLAUDE.md and README files | no own primitive — be-civic defers to gstack skills; no be-civic-specific land equivalent | — |
| DORA metrics (dora.dev, getdx.com) | deployment frequency, change lead time, change fail rate, pipeline gate best practices | yes — canonical metrics framework for deployment velocity and stability; defines change fail rate and failed deployment recovery time | cited in Challenge findings |
| Deployment-gate literature (oneuptime.com, rutagon.com, devopstraininginstitute.com) | pre-deploy approval gates, post-deploy health verification, audit trails, rollback triggers | yes — detailed gate placement, audit record requirements, rollback patterns, 12-step post-deploy validation | cited in Challenge findings |
| CI/CD best-practice surveys (kluster.ai, devopstraininginstitute.com, wondermentapps.com) | staging-first patterns, canary deploy criteria, break-glass procedures | yes — confirms staging-first, canary, automated rollback as standard patterns | cited in Challenge findings |

**Strongest external analogue: gstack/land-and-deploy.** This skill does the same job as
land — takes a cleared PR and carries it through merge → deploy → live-verified. It is a
real operator-facing orchestrator with the same three-mode dispatch (staging-first,
prod-direct, staging-only). It differs structurally: it has no carrier model, combines the
ship sub-arc inside itself, holds no formal gate-decision records, and produces a persisted
deploy report artefact. These gaps and additions are the basis for the Challenge findings
below.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/gstack-land-and-deploy-SKILL.md` | keep | Primary real-world analogue. Full delivery orchestrator: pre-flight checks, first-run dry-run, readiness gate (review staleness, E2E eval freshness, PR body accuracy, doc-release check), VERSION drift detection, staging-first option, deploy-workflow polling, canary health check, revert procedure, deploy report artefact. Challenges the land node's pre-merge evidence, revert procedure, and post-deploy health depth. |
| `source-material/ce-commit-push-pr-SKILL.md` | edge-only | Covers commit + push + PR creation with description-quality and evidence-capture steps — the sub-arc owned by stack-graph ship. Not a land-equivalent. Relevant for challenging land's handoff assumption from ship (pre-merge PR description accuracy has no land-side check). |
| `docs/dev-sprint-backbone-design.md` (in-repo, not lifted) | keep | `### land` per-stage spec; "The gates" table; "The land sub-arc — the open fork" resolution (wave-1 = ship + deploy, wave-2 = canary, operator decided). Definitive. (Input, not external analogue.) |
| `docs/graph-map.md` (in-repo, not lifted) | keep | Backbone-stages table row for land; sub-arc rows for ship, deploy, canary; "Edges at a glance". Consistent with the design spec. (Input, not external analogue.) |

## Keep / Drop

**Kept (absorbed into body):**
- Commit-to-land intake gate: operator decision, records `in-delivery → shipped` in the carrier.
- Live-confirmed exit gate: operator decision, records `shipped → live`.
- Sub-arc sequencing: invokes ship (tests → PR), then invokes deploy (merge → deploy → settle).
- Three modes (body branches): staging-first (default), prod-direct, staging-only — mirror deploy's
  three modes since deploy is the long phase land controls.
- Revert guidance: when deploy fails or post-deploy smoke tests fail, land surfaces the
  `reconcile` revert path. The `land → reconcile (revert)` can-follow edge wires in the backbone
  wiring pass; described in body prose for now.
- Carrier read-only: land reads the carrier for context + to confirm the commit-to-land gate
  decision was recorded; it writes no carrier field (D44).
- The gates are **operator decisions** — land surfaces the decision points; the gate mechanism
  records them, not land directly.

**Dropped (out of scope):**
- canary: wave 2, input-gated on prod traffic (BC is pre-launch; no live traffic to watch).
  Described in F7 prose; no edge until the canary node exists.
- Process edges to non-existent siblings (reconcile, debrief): deferred to the wiring pass.
- Carrier field writes: land holds no write-edge to the carrier (D44).
- VERSION drift detection (gstack land-and-deploy Step 3.4): workspace-aware version-slot
  collision check. Out of scope for wave 1; could be a wave-2 check inside ship. (CF-6, parked.)
- Deploy report **bespoke** persisted artefact (gstack land-and-deploy Step 9: a structured
  `.gstack/deploy-reports/` JSONL store): dropped as a *parallel store*. **Superseded by D59
  (amend 2026-06-04):** the deploy signal is the deploy-event riding the existing carrier-keyed
  node-exit in the 06-analytics event log, projected + recorder-frozen — not a fourth artefact
  class. land contributes the live-confirmed gate outcome to it (CF-3, applied below).
- Evidence capture for PR body (CE ce-commit-push-pr): demo reel, screenshot embed.
  Belongs in ship, not land.

**Edge only / sub-arc:**
- `composes-into dev-sprint @land`: the backbone membership edge.
- `invokes ship`: ship exists at graph/ship/ — edge declarable.
- `invokes deploy`: deploy exists at graph/deploy/ — edge declarable.
- `invokes canary`: canary does not exist — F7 prose seam.
- `can-follow reconcile`: reconcile does not exist — F7 prose seam.
- `precedes debrief`: debrief does not exist — F7 prose seam.
- `can-follow reconcile` (the revert loop): same F7 seam, named separately in prose.

## Overlaps and seams

**Upstream — commit-to-land gate:** The gate is confirmed before (or at the start of) the
land session. The carrier's `gate_decisions[]` should already hold a `commit-to-land` entry
(from the reconcile stage, which owns the gate in D44/backbone spec). Land's intake is to
read it and confirm the cleared state — not to re-decide it.

**Downstream — live-confirmed gate:** The exit gate fires once deploy (and, in wave 2, canary)
confirms health. Until canary exists, the gate fires on deploy settle + a lightweight operator
smoke check. In staging-only mode, live-confirmed is not declared (the change is not live); land
documents this clearly.

**Revert loop:** If deploy fails or the post-deploy smoke check fails, land surfaces the
`reconcile` revert path. The `land → reconcile (revert)` can-follow edge wires in the backbone
wiring pass; described in body prose for now.

**Canary (wave 2):** Once canary exists (when BC has live prod traffic), it slots in after
deploy in the land body and the `invokes canary` edge is added via amend.

**Pre-merge readiness (seam with ship):** The gstack land-and-deploy analogue runs an extensive
pre-merge readiness gate (Step 3.5: review staleness, E2E eval freshness, PR body accuracy,
doc-release check) before committing to the merge. The stack-graph land node currently has no
equivalent — it assumes reconcile has certified the change and the gate decision is already
recorded. This is a design gap surfaced by the analogue (see Challenge findings).

## Fit

Single node. Land is the gated container for the ship → deploy sequence; it owns the two
carrier-lifecycle gates and the mode dispatch. No sub-part earns its own measurable goal
outside the sub-arc nodes (ship, deploy) already authored — land orchestrates them, surfaces
the gates, and closes the lifecycle step. One node.

## Edges

| edge type | target id | status | rationale |
|-----------|-----------|--------|-----------|
| `composes-into` | `dev-sprint` (stage: land) | declared | backbone membership |
| `composes-into` | `incremental` (stage: land) | declared — D56 amend | incremental-arc membership; land is reused, not duplicated (incremental-improvement-design §4/§8 step 7) |
| `invokes` | `ship` | declared — exists at graph/ship/ | first sub-arc step |
| `invokes` | `deploy` | declared — exists at graph/deploy/ | second sub-arc step |
| `references` | `instrumentation-preamble` (`load: import`) | declared — exists at graph/_refs/ | single-sources the carrier-keyed emit; load-bearing for CF-3 (the deploy-event rides the node-exit it fires, D59) |
| `references` | `carrier-interface` (`load: on-demand`) | declared — D56 amend; exists at graph/_refs/ | the explicit field-set land reads about its carrier, so it serves both work-item (dev-sprint) and standalone-IU (incremental) kinds without assuming work-item-only fields (§9 R4) |
| `precedes` | `debrief` | declared — exists at graph/debrief/ | happy-path exit — **dev-sprint only**; the incremental arc has no debrief (a standalone IU has no `outcome_link` to read back) |
| `invokes` | `canary` | **F7 prose — canary does not exist** | wave 2; input-gated |
| `can-follow` | `reconcile` (declared on reconcile, not land) | **declared on reconcile's side** | the `land → reconcile` revert loop is `reconcile can-follow land`; land holds no `can-follow reconcile` entry (corrective `can-follow` lives on the re-running node). NOT a `references` edge — land's relationship to deploy/reconcile is `precedes`/`can-follow` + prose |
| inbound `precedes` | `review → land` (declared on review, not land) | **declared on review's side** | the incremental forward edge review→land (review precedes land); land holds no inbound entry |

## Conformance

**`primitive:` ↔ `mode:` agreement:** `skill` ↔ `collaborative` — confirmed.

**`goals:` as outcomes:** All three goals are measurable outcome-frames (gated delivery path;
in-session failure surfacing; explicit live-confirmed gate) — confirmed.

**Edge targets resolvable:** `composes-into dev-sprint`, `invokes ship`, `invokes deploy` —
all resolvable on disk. `canary`, `reconcile`, `debrief` — all F7 prose, no frontmatter edge.

**No carrier write-edge:** land reads the carrier; the gate mechanism writes it — D44 held.

## Challenge findings

These findings emerge from comparing the land node against its real-world analogue
(gstack/land-and-deploy) and published best practice (DORA, deployment-gate literature).
They are observations to carry into wave-2 amend work — they do not require changes to
the node canonical now.

### CF-1 — Missing pre-merge readiness gate (severity: high) — RESOLVED (amend 2026-06-04)

**Gap:** The land node has no pre-merge readiness evidence step. It invokes ship and, on
ship completing, proceeds directly to deploy. The gstack analogue (Steps 3.4–3.5) runs a
full readiness gate before the irreversible merge: review staleness (0–4+ commit threshold),
E2E eval freshness, PR body accuracy against the actual diff, and doc-release check. Industry
best practice (rutagon.com, oneuptime.com) places the "human gate at the boundary where risk
is highest — production deployment" and requires an auditable approval chain.

**Implication:** The land node's commit-to-land gate is the only named gate before merge.
It is framed as a lifecycle-state advance, not an evidence-gathering step. The operator
confirms readiness without seeing a structured evidence report (review status, test freshness,
PR description accuracy). This means the gate can be confirmed with stale or unchecked
evidence.

**Recommendation:** The commit-to-land gate body should include a pre-gate evidence surface:
at minimum, confirm the most recent reconcile/review pass and its commit distance from HEAD.
The full readiness report (as in gstack's Step 3.5) could be a wave-2 enhancement.

**Resolution (amend 2026-06-04):** Applied. The commit-to-land gate body now opens with a
**pre-merge readiness surface** — the most-recent reconcile/review pass read from the carrier's
`gate_decisions[]`/`transition_history`, and its **commit distance from HEAD** (how many commits
have landed since that pass) — surfaced to the operator *before* the gate is confirmed, so the
gate is not confirmed on stale evidence. **How hard the surface is read is set by the D45 maturity
× tier dial** (a high-tier item in an early-maturity process demands a fresh pass; a routine item
in a mature process can clear with a larger distance). This is a read-and-surface step, not a new
evidence-producing stage (reconcile/review own producing the evidence — D50 backbone order); land
surfaces it at the gate. The full gstack Step-3.5 readiness report stays a wave-2 enhancement.

### CF-2 — Revert procedure is named but not sequenced (severity: medium) — RESOLVED (amend 2026-06-04)

**Gap:** The land node says "name the revert path" and references returning to reconcile, but
does not specify how the revert is actually executed. The gstack analogue (Step 8) has a
concrete revert sequence: `git fetch origin <base>; git checkout <base>; git revert
<merge-commit-sha> --no-edit; git push origin <base>` with branch-protection handling
(create a revert PR if direct push is blocked). Published post-deploy validation literature
distinguishes automated-rollback triggers (error rate threshold, canary failure) from
manual-revert paths.

**Implication:** An operator facing a deploy failure in a land session cannot act on "return
to reconcile" without knowing what to run. The seam is correct (reconcile owns the revert
scope decision) but the immediate revert mechanics are unaddressed.

**Recommendation:** Wave-2 land body should include a concrete revert step: the specific git
commands (or the deploy sub-node that executes them), the branch-protection fork, and the
criterion for when the operator should return to reconcile vs. act immediately.

**Resolution (amend 2026-06-04):** Applied, via the revert seam with `deploy C5` so revert is
specified **once**. The split: **land owns the revert DECISION** (surfacing the choice when a
deploy fails or the live-confirmed gate is declined) **and the `land → reconcile` re-entry
criterion** (when to return to reconcile to re-scope vs. act in place); **`deploy` owns the
EXECUTION** — it offers to perform the mechanical revert (`git revert <merge-sha>`, or a revert
PR under branch protection) once the operator chooses revert (deploy C5). Land does not duplicate
the git commands; it names the decision and the re-entry, then hands the mechanical execution to
deploy. D44 held throughout: revert is a git action, not a carrier write — neither node writes the
carrier to revert. The `land → reconcile` corrective loop stays declared on reconcile's side as
`reconcile can-follow land` (the canonical model declares corrective `can-follow` on the re-running
node); land holds no `can-follow reconcile` entry.

### CF-3 — No deploy report artefact (severity: medium) — RESOLVED (amend 2026-06-04)

**Gap:** The land node produces gate decisions and deployment URLs as output. The gstack
analogue produces a structured LAND & DEPLOY REPORT (an ASCII summary saved to
`.gstack/deploy-reports/{date}-pr{N}-deploy.md` plus a JSONL entry) covering: merge timing,
CI wait, deploy duration, staging status, canary health, review status, and a VERDICT field.
DORA metrics (dora.dev) define deployment frequency, change lead time, and failed deployment
recovery time as the primary delivery performance metrics — all of which require a persistent
per-deployment record to aggregate.

**Implication:** Without a persisted deploy report, the loop has no durable per-deployment
signal. Gate decisions are recorded in the carrier, but carrier records are per-work-item
and do not capture deploy timing, canary outcome, or review freshness at land time. The
analytics node (06) cannot produce DORA metrics without per-deploy timing data.

**Recommendation:** The land node should define a deploy-event output (even a minimal one):
at minimum, merge SHA, deploy URL, land timestamp, and the live-confirmed gate outcome.
The format and storage location can be harness-configured, but the contract should require
the event. This is distinct from the carrier write (D44 is still held).

**Resolution (amend 2026-06-04):** Applied per **D59** — and emphatically **not** a second store.
The deploy-event is defined **once** (resolves deploy C3 + land CF-3 together) and homed in the
06-analytics local event log: `deploy` emits the deploy outcome (`merge_sha`, `deploy_url`,
`mode`, `status`, `timing` merge→live, `smoke_health`, `live_confirmed`) on the **existing
carrier-keyed `node-exit` event** the instrumentation preamble already fires — exactly as
`tokens_per_iu` rides the unit-complete event (D57). It lands in the **product-outcomes / deploy
stream** of the event log (06-analytics stream namespacing); current deploy-state is **projected**
derived-on-read into `.stack-graph/`; and the **recorder** (debrief's, keyed off the terminal
transition) freezes the deploy outcome onto the carrier's closed record as a `frozen_*` field,
beside `frozen_timeline`/`frozen_metrics`. **land's contribution is the `live_confirmed` gate
outcome** — it does not create a store, it reads the deploy-event and contributes the
live-confirmed signal to the same carrier-keyed event. DORA/MTTR is a derivation *across* carriers'
deploy events (measure-outcomes family), never a stored aggregate. **D44 held:** no stage writes
the carrier — the preamble emits, the recorder freezes. land's `references instrumentation-preamble`
edge (already declared) is the single-source of the emit behaviour.

### CF-4 — Post-deploy health check is a wave-1 gap, not just a wave-2 deferral (severity: medium) — RESOLVED (amend 2026-06-04)

**Gap:** Land wave-1 replaces canary with a "lightweight smoke check" (manually open the
deployed URL, confirm the critical path is reachable). This is described as a pre-canary
signal. Published best practice (devopstraininginstitute.com) identifies 7+ post-deploy
validation steps that should run before the live-confirmed gate fires: endpoint health checks,
synthetic monitoring, infrastructure/config validation, real-time log analysis, performance
monitoring, and security scanning — even without a full canary. The gstack analogue (Step 7)
runs a concrete browser-based check: `goto <url>`, `console --errors`, `perf`, `text`,
`snapshot` — all available pre-launch.

**Implication:** "Manually open the deployed URL" is weak as the live-confirmed signal when
automated browser health checks are already available (gstack browse daemon, canary skill
smoke mode). The live-confirmed gate could fire on a URL that returns 200 but has critical
console errors or a blank page.

**Recommendation:** Wave-1 land should define a minimal automated health check before the
live-confirmed gate: at minimum an HTTP status check and a console-error scan. This is not
canary (no traffic comparison, no baseline) — it is a deploy smoke test. The gstack analogue
already does this in wave 1 via the browse daemon. Framing it as a wave-2 item understates
the risk of confirming a broken deploy as "live."

**Resolution (amend 2026-06-04):** Applied via the smoke seam with `deploy C4`. **`deploy` OWNS
the inline smoke check** (HTTP 200 + console-error scan + content-present + screenshot — deploy C4,
run in deploy's Phase 3 settle); **land's live-confirmed signal CONSUMES its result** rather than
having the operator manually open the URL. land reads `smoke_health` from deploy's output (and the
deploy-event, CF-3) and surfaces it at the live-confirmed gate — so the gate cannot fire on a URL
that 200s but has a blank page or console errors. This is a **deploy smoke test, not canary** —
single-pass, no baseline, no traffic comparison. Canary (the extended monitoring loop with a
baseline) stays wave-2, input-gated on live prod traffic; the `invokes canary` edge is still added
via `amend` when canary is authored. The wave-1 `land = ship + deploy` decision holds — the smoke
check lives in deploy, consumed by land.

### CF-5 — First-run / infrastructure-change detection not addressed (severity: low)

**Gap:** The gstack analogue (Step 1.5) includes a first-run dry-run validation: it detects
the deploy platform (Fly, Render, Vercel, Netlify, Heroku, Railway, GitHub Actions workflow),
validates CLI auth, checks for a staging environment, and asks the operator to confirm the
detected setup before any irreversible action. It also detects when the deploy configuration
has changed since the last confirmed run and re-triggers the dry run.

**Implication:** The land node assumes the harness deploy-config overlay is already resolved
and correct. A harness that mis-configures the deploy target (wrong env, wrong workflow) would
not be caught before the merge gate. The node has no mechanism to surface "this is the first
time you're landing to this environment."

**Recommendation:** Consider a lightweight infrastructure-confirm step (or a validate mode for
the harness-init skill) that verifies the deploy target before the commit-to-land gate fires.
This is low severity because be-civic is pre-launch and the deploy target is fixed, but it
is a real gap for any harness being set up for the first time.

### CF-6 — No VERSION drift / workspace-collision guard (severity: low)

**Gap:** The gstack analogue (Step 3.4) detects whether a parallel workspace has landed a PR
between when `/ship` ran and now, causing VERSION slot collision. This is specific to the
gstack workspace-aware versioning model (multi-worktree, Conductor orchestration).

**Implication:** The stack-graph model does not currently define a VERSION or release-slot
concept. If it does in the future, a similar drift guard would be needed. Low severity for
the current BC wave-1 scope.

**Recommendation:** No immediate action. Flag for wave-2 if the graph introduces a versioning
schema.

### CF-7 — Break-glass / emergency bypass not modelled (severity: low)

**Gap:** Industry best practice (oneuptime.com, rutagon.com) recommends defining an
emergency bypass procedure for critical hotfixes ("break-glass"), with all bypasses logged
and reviewed. The land node has no break-glass mode — all gates require operator confirmation.

**Implication:** A critical production incident requiring an immediate hotfix would still go
through the full commit-to-land → ship → deploy → live-confirmed sequence. In practice, the
operator can simply invoke deploy directly, but that bypasses the carrier lifecycle entirely.
There is no named break-glass path.

**Recommendation:** Wave-2 land body could document the break-glass path: when it is
legitimate (P0 incident, confirmed broken prod), what it bypasses, and how the carrier is
reconciled after the fact. This is an audit-trail concern, not a blocking issue for wave 1.

## Open questions

- **RESOLVED (amend 2026-06-04):** the `references instrumentation-preamble` edge is now
  declared (`load: import`) — load-bearing for CF-3 (the deploy-event rides the carrier-keyed
  node-exit the preamble fires).
- The `commit-to-land` gate: whether land confirms the gate was recorded by reconcile vs
  re-prompting the operator. Body treats it as "confirm the recorded gate decision at session
  start"; this can be refined once reconcile is authored.
- In `staging-only` mode: whether the `live-confirmed` gate fires at all (staging is not live).
  Body documents that staging-only defers the live-confirmed gate to a future prod deploy.
- **RESOLVED (amend 2026-06-04, CF-1):** the commit-to-land gate now surfaces a pre-merge
  readiness surface — most-recent reconcile/review pass + its commit distance from HEAD — read
  and surfaced by land at the gate (reconcile/review *produce* the evidence; land *surfaces* it).
  The D45 maturity × tier dial sets how hard the surface is read.
- **RESOLVED (amend 2026-06-04, CF-3):** the deploy-event output contract is fixed by D59 —
  it rides the existing carrier-keyed node-exit event in the 06-analytics product-outcomes/deploy
  stream (no bespoke store), projected to `.stack-graph/`, frozen by the recorder at terminal.
  land contributes the `live_confirmed` gate outcome to that same event; it creates no store.
- **RESOLVED (amend 2026-06-04, CF-4):** the wave-1 health check is `deploy`'s inline smoke
  check (deploy C4 — HTTP 200 + console-error scan + content-present + screenshot); land's
  live-confirmed signal consumes its `smoke_health` result. A deploy smoke test, not canary
  (no baseline). Canary stays wave-2, input-gated.
- **Still parked (CF-5/6/7, low — out of scope this amend):** first-run / infra-change detection;
  VERSION drift / workspace-collision guard; break-glass / emergency bypass.
