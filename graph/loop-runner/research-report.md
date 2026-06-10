---
title: Research report for loop-runner
type: research-report
status: complete
authored: 2026-06-10
last_updated: 2026-06-10
amended:
  - "2026-06-10 — design §10 / D67: raise-time capture re-split. specify-slice returns to the dispatched session unattended; intake gains a decision-completeness gate; entry stage = specify-slice; tokens_per_session spans specify+build+review."
sources_lifted: 4
external_analogue_found: true
external_corpora_searched:
  - "operator gstack .claude skill set (landing-report, ship, land-and-deploy)"
  - "operator orchestration reference (~/.claude/references/subagents.md)"
  - "Anthropic engineering — multi-agent research system (orchestrator-worker)"
  - "GitHub merge queue + speculative/batch merge queues (Mergify/Aviator)"
  - "Kubernetes Job — Indexed Job + work-queue patterns"
  - "GitHub Actions — matrix strategy (fan-out, max-parallel, fail-fast)"
researcher_adequacy_note: |
  External search was real and productive across five corpora; an external analogue exists and four
  sources were lifted. The strongest is the operator's own `landing-report` skill — a real, shipped
  `.claude` read-only queue-dashboard node that is the direct counterpart to loop-runner's Phase-2
  land queue (it surveys a batch of in-flight units and reports what lands next, "No mutations"),
  proving the coordinator-surveys / a-different-node-merges split is not a stack-graph invention.
  Anthropic's orchestrator-worker doctrine grounds the spawn-bundle + isolation boundary; the GitHub
  merge queue grounds Phase-2's merge-the-candidate-and-re-check-the-merged-tree dry-run; K8s
  Indexed-Job and GHA matrix ground the concurrency-cap-vs-batch-size and dependency-scoped fail-fast
  semantics. Edges are HIGH-confidence — they are fixed by the settled design §3 (two adversarial
  rounds), and I verified each target exists and that the contracts loop-runner invokes (specify-slice
  collaborative, build's entry, land's own gate) match the node bodies on disk. The primitive/mode
  (skill / collaborative / generative) is HIGH-confidence and design-locked. No goal was hard to frame
  as an outcome. Recommendation: proceed to translator — the design is settled, the contracts verified,
  the only open items are translator-level wording choices flagged in Open questions.
---

# Research report for loop-runner

## Identity

**Candidate id:** loop-runner
**Candidate title:** Loop runner

**Scope:** The **arc-level dispatcher for the incremental loop**. `loop-runner` takes the
operator-approved subset of open standalone IUs, gets each **build-ready attended** (running
`specify-slice` at intake, with the operator), then dispatches **one fresh agent session per
build-ready IU**, each running `build → review` against the carrier file in an isolated worktree per
repo it touches. It owns **IU selection mechanics, attended intake, worktree isolation, concurrency,
dependency/stacked-branch order, route-out handling, the batch report, an integration dry-run, and
the land queue** — invoking `land` per IU only after the operator's land decision. It is the
arc-level twin of what `build` already does for a work-item's child IUs within one span.

It explicitly **excludes**: being a stage of the `incremental` arc (it dispatches sessions that
traverse the arc; it never traverses it — no `composes-into`, no process edges); holding the
operator gates (batch-approval on intake and the per-IU land decision both stay with the operator);
retrying route-outs (escalated / hitl-parked / blocked park, never re-dispatch in-batch); and writing
any shared/committed surface or lifecycle during the span (sessions write their own worktree + own
carrier file only; the manifest is coordinator-regenerated via refresh-index; the real merge is
`land`'s).

## Goals

| outcome | metric | earns-keep |
|---|---|---|
| A batch of standalone IUs is delivered with each IU's build + review running in a **fresh context**, so the late-batch quality degradation of the sequential single-session run does not recur. | `tokens_per_session` per dispatched IU (build span + review span + session overhead) vs the sequential single-session baseline (~35–80k output tokens/IU, rising with session length); review-stage findings traced to context-degradation rather than a real defect. | Per-IU dispatched cost holds roughly flat across a batch (no rise with batch position) where the sequential baseline rose; degradation-attributable review findings trend toward zero. A dispatcher whose per-IU cost still climbs with batch size is not earning its isolation. |
| Concurrent dispatch is **race-free**: no commit lands on the wrong branch, no two in-flight sessions write the same files, and interleaved sessions never bleed stage projections. | Wrong-branch commits / shared-checkout incidents per batch (the field bug this node exists to prevent); shared-`files` IUs caught and serialised at intake vs discovered in flight; projection mis-attributions across interleaved carriers. | Wrong-branch and shared-write incidents stay at zero across batches; every shared-`files` collision is caught at schedule time, never in flight. A single race incident is a defect, not noise. |
| Route-outs (escalated / review-flagged / hitl-parked / blocked) are **parked with a reason and never silently retried or merged**, and dependents of a non-`built` dependency are transitively parked. | Share of route-outs that park with a recorded reason + resume pointer vs ones lost or silently re-dispatched; dependents incorrectly dispatched against a failed dependency. | Every route-out parks cleanly with provenance; zero dependents dispatched against a non-`built` dependency. A re-dispatched route-out or a merged-on-its-own IU is a contract violation. |
| Each `built` IU lands only after an **integration dry-run** proves its `acceptance_check` on the *merged* tree, so cross-slice and mid-batch-drift conflicts surface before prod, not in it. | Merge conflicts / acceptance failures surfaced in the dry-run vs discovered post-merge in the target branch; double-merges (dispatcher + land both merging). | Cross-slice/drift conflicts are caught in the dry-run; post-merge surprises and double-merges trend to zero. If the dry-run never catches a conflict a real batch would have hit, the step is not earning its cost. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** loop-runner is **collaborative-bookended with an autonomous dispatch span between** —
the same shape as `build`. Its two ends require the live operator thread: **intake** (the operator
approves the batch subset and `specify-slice` runs attended, in the coordinator's context) and the
**land queue** (the operator decides each IU's land, then `land` fires its own gate). Between them is
an autonomous fan-out span (dispatching isolated sessions). Per the context axis (01-concepts /
07-decomposition), a node that needs the live main thread, operator decisions, and shared state is a
**skill**, not an agent — even though it *dispatches* isolated workers. (An agent runs isolated and
returns a summary; loop-runner holds the operator across the batch.) The `primitive: skill` ↔ `mode:
collaborative` agreement holds. This is design-locked (§3) and HIGH-confidence: the round-1 H1 finding
specifically established that the *unattended-dispatch of `specify-slice`* was illegal precisely
because specify-slice is collaborative — pushing specify to attended intake is what keeps loop-runner
a coherent collaborative skill.

**`determinism:`** `generative`

**Rationale:** the dispatch span is judgment-laden, not algorithmic — scheduling against dependency
order and shared-files, interpreting return envelopes into the four/five outcome buckets, deciding
which route-out path applies, and presenting the land queue. Same `determinism: generative` as `build`
(which it twins). Not `deterministic`: there is no fixed input→output mapping; the coordinator
reasons over each IU's outcome.

## Contract

**Input:** the open standalone IUs in the `improvements-manifest` (`lifecycle_state: proposed` or
`in-delivery`, not terminal); the operator's approved batch subset; the harness bindings
(`improvements-root`, `improvements-manifest`, `event-log`) and the `deploy-config` surface (per-repo
roots + branch policy); the carrier files themselves (the proven-sufficient cold-dispatch context).

**Output:** per dispatched IU, a fresh `build → review` session against its carrier in an isolated
worktree, returning a **return envelope** `{ outcome: built | review-flagged | escalated |
hitl-parked | blocked, commits[], branch(es), evidence, tokens }`; a **batch report** (per-IU
outcomes in the named buckets, escalations enacted attended); an **integration dry-run** per repo
(readiness evidence on a discarded scratch worktree); a **land queue** that invokes `land` per `built`
IU on the operator's go; and per-IU carrier-keyed **`dispatch-complete`** events carrying
`tokens_per_session`, plus the dispatcher's own non-carrier enter/exit events routed to the
factory-conformance stream. It writes **no** shared committed surface and **no** carrier lifecycle
during the span (the manifest is regenerated by refresh-index after outcomes return).

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| operator gstack `.claude` skill set | a real node that surveys a queue of in-flight units about to land and reports what lands next, without merging | **yes** | `gstack-landing-report-skill.md` |
| operator gstack `.claude` skill set | the real enacting merge/ship siblings (`ship`, `land-and-deploy`) — the one-merge-owner split | yes (named in the lifted file) | `gstack-landing-report-skill.md` |
| operator orchestration reference (`subagents.md`) | subagents-vs-agent-teams: is an isolated, no-cross-talk worker a subagent or a team? | yes | folded into `batch-dispatch-patterns-digest.md` |
| Anthropic engineering blog | orchestrator-worker dispatch: how a lead decomposes, isolates, and synthesises fresh-context subagents; concurrency heuristics; when parallelism hurts | **yes** | `anthropic-multi-agent-research-system.md` |
| GitHub merge queue docs + speculative/batch (Mergify/Aviator) | batch-integration-before-merge: speculative merged candidate, re-check the merged tree, remove-and-retest on failure, concurrency bounds | **yes** | `github-merge-queue.md` |
| Kubernetes Job docs | Indexed-Job + work-queue: parallelism-vs-completions, one-item-per-Pod, controller-coordinates-but-doesn't-do-work | yes | folded into `batch-dispatch-patterns-digest.md` |
| GitHub Actions docs | matrix fan-out: `max-parallel`, `fail-fast`, concurrent legs | yes | folded into `batch-dispatch-patterns-digest.md` |

A real external counterpart **exists** — most concretely the operator's own `landing-report` skill
(a shipped read-only land-queue dashboard) and Anthropic's orchestrator-worker pattern (the
agent-dispatch isolation boundary). The job loop-runner does (coordinate a batch of isolated units,
survey the queue, let a different owner merge) is a well-established pattern across CI merge queues,
batch-job controllers, and agent orchestrators — none of which is a single drop-in node, so
loop-runner synthesises the dispatch/isolation/route-out/merge-queue semantics from them. In-repo
design docs (`loop-runner-design.md`, `incremental-improvement-design.md`, `iu-sizing-design.md`) are
**input**, not external analogues, and are not counted here.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/anthropic-multi-agent-research-system.md` | keep | Orchestrator-worker isolation boundary → loop-runner's spawn bundle + return envelope + default-3 concurrency. |
| `source-material/github-merge-queue.md` | keep | Batch-integration-before-merge → Phase 2 integration dry-run (merged-tree re-check, discard candidate, one merge owner). |
| `source-material/gstack-landing-report-skill.md` | keep | The real `.claude` land-queue node shape → Phase 2 land queue; the read-only-survey / different-node-merges split. |
| `source-material/batch-dispatch-patterns-digest.md` | keep | K8s/GHA/subagent mechanism map → concurrency-cap-vs-batch-size, dependency-scoped fail-fast, subagent-not-team choice. |

## Keep / Drop

**Kept (absorbed into body):**
- The orchestrator-worker isolation boundary (self-contained task description + output format +
  fresh context window) → loop-runner's spawn-bundle contract and the per-IU isolation.
- The merge-queue "test the merged result, only the passing combination proceeds, discard the
  candidate" mechanism → Phase 2 integration dry-run on a scratch worktree, with `land` owning the
  real merge.
- The read-only queue-dashboard shape (survey + report what lands next, no mutations) → the Phase 2
  land queue / batch report.
- `parallelism` vs `completions` and `max-parallel` → the in-flight concurrency cap (default 3) vs
  the approved batch size; the cap as a host-load bound.
- Dependency-scoped fail-fast (vs whole-batch) → the transitive-park cascade when a dependency
  returns non-`built`.

**Dropped (out of scope / belongs elsewhere):**
- The actual merge mechanics (ship → deploy, branch policy, PR vs push) — owned by `land` / `ship` /
  `deploy` via the `deploy-config` surface; loop-runner only invokes `land` and reads `deploy-config`
  for the file→repo map and frozen base-ref.
- The standalone-IU schema, the carrier-lite shape, the three-writers split — owned by `IU-schema` /
  `carrier-interface` (imported / on-demand); loop-runner observes outcomes, it does not define them.
- The tracer-bullet inner loop, the review lens panel, the commit-to-land gate — owned inside the
  dispatched sessions' own node bodies (`build` / `review` / `land`); loop-runner does not re-specify
  them.
- The `escalates`/promotion *write* — it is the `escalates` edge's spec'd behaviour (02-graph-spec),
  enacted **attended by the coordinator** at the close phase, not a new writer loop-runner invents.

**Edge only (separate node):**
- `specify-slice`, `build`, `land` are node-like and exist — loop-runner reaches each via an
  `invokes` edge, never absorbs them. `review` is reached *inside* the dispatched session via the
  arc's own `build precedes review`, so it is **not** an `invokes` target of loop-runner (declaring
  it would misstate who reaches it).

## Overlaps and seams

- **→ `specify-slice` (invokes, attended at intake).** loop-runner runs specify-slice in the
  coordinator with the operator present, honouring its `mode: collaborative` contract, so every batch
  IU is build-ready and fully tagged before any dispatch. Seam: a `proposed` stub → an authored,
  invariant-checked, AFK/HITL-tagged slice. An escalation surfaced here runs specify-slice's own
  `escalates` path (attended).
- **→ `build` (invokes, the dispatched session's entry stage).** loop-runner starts a fresh session
  at `build`; the session then follows the arc's **own** `build precedes review` — loop-runner does
  **not** invoke `review`. Seam: the spawn bundle (carrier path, entry stage `build`, worktree
  path(s) + branch, event-log binding, return-envelope contract) → the return envelope.
- **→ `land` (invokes, per IU at the close phase).** Only after the operator's per-IU land decision;
  `land` fires its own single `commit-to-land` gate and owns the real merge via ship → deploy. Seam:
  the operator's land decision + the dry-run readiness evidence → `land`'s gate + merge.
- **Dataflow seam to `triage` (prose, NOT an edge).** triage scaffolds the `proposed` IUs the
  operator later approves into a batch; that is dataflow, not arc sequence — consistent with "not
  everything is a node/edge." No process edge to triage.
- **Carrier seam.** The dispatched sessions emit carrier-keyed enter/exit events from the *stage
  nodes* inside them; the projection sees an ordinary per-carrier incremental traversal. loop-runner
  itself emits **non-carrier** enter/exit (factory-conformance stream) and the per-IU
  **`dispatch-complete`** measure event (product-outcomes) — never a stage event.

## Fit

loop-runner is a **single node**, and it owns its own branching and sequencing (the decomposition
discriminator's node test, 07-decomposition): the dispatch protocol is a real multi-phase control
flow — intake → schedule (dependency order + stacked branches + no-shared-files serialisation +
concurrency cap) → per-IU dispatch + return-envelope routing into outcome buckets → integration
dry-run → land queue. Its goal is distinct and separately measurable (the dispatch-efficiency /
race-freedom / clean-route-out outcomes above) from any stage it dispatches. It is an
**orchestrator-over-traversals** — the novel sibling to `verify`'s orchestrator-over-modalities (the
07-decomposition amendment the design carries): `verify` dispatches modalities that are *not* stages
of the arc it sits on; loop-runner dispatches **sessions that traverse a span of the arc's own
stages**. It should **not** be split: the phases share one carrier of state (the batch schedule + the
collected envelopes) and one operator thread; splitting intake from dispatch from land-queue would
fragment that state across nodes that collapse back together. It is `skill`, not `agent`, despite
dispatching agents — because it holds the operator across the batch (the context axis: collaboration
front-loaded at intake, returns to close at the land queue).

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| invokes | specify-slice | Attended intake — run the collaborative front stage in the coordinator's context so every batch IU is build-ready + tagged before dispatch (round-1 H1). Caller-side; target declares no inbound edge. |
| invokes | build | The dispatched session's **entry stage**; the session then follows the arc's own `build precedes review`. No `invokes: review` (review is reached via the arc, not by loop-runner). Caller-side. |
| invokes | land | Per IU at the close phase, after the operator's land decision; `land` fires its own `commit-to-land` gate and owns the real merge. Caller-side. |
| references | IU-schema (`load: import`) | The standalone-IU shape loop-runner reads to interpret manifest entries and return envelopes; short, must-always-be-present → import. |
| references | carrier-interface (`load: on-demand`) | The projection key (carrier id + kind + arc) and the common-vs-per-kind field set; read at the seam where it keys events / reads outcomes → on-demand. |
| references | instrumentation-preamble (`load: import`) | The enter/exit emit contract; loop-runner emits its own (non-carrier) enter/exit and the append-contract discipline rides here → import. |
| references | bindings-contract (`load: on-demand`) | Resolves `improvements-root` / `improvements-manifest` / `event-log` at intake → on-demand. |
| references | deploy-config (`load: on-demand`) | Per-repo roots + branch policy (file→repo map, frozen base-ref, two-track vs single-branch land) — the surface ship/deploy already read → on-demand. |

**Explicitly NOT declared (design-locked):** no `composes-into` (loop-runner dispatches traversals,
it does not traverse the arc); no `precedes` / `can-follow` (it is not an arc stage); no
`invokes: review` (reached inside the session via the arc's own edge); no process edge to `triage`
(dataflow, expressed in prose).

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — agrees (the skill engages the
operator at both bookends). Confirmed.

**`goals:` as outcomes:** all four read as outcomes (fresh-context delivery without degradation;
race-free concurrent dispatch; clean parked route-outs; merged-tree-proven land) with a metric and an
earns-keep each — none is an activity ("dispatch sessions", "run the schedule" would be activities and
were avoided).

**Edge targets resolvable:** `specify-slice`, `build`, `land` exist as nodes (verified on disk);
`IU-schema`, `carrier-interface`, `instrumentation-preamble`, `bindings-contract`, `deploy-config`
exist in `graph/_refs/` (verified on disk). All targets resolve.

## Open questions

- **Outcome-bucket count in the body (4 vs 5).** The design settled a **fifth** outcome
  `review-flagged` (R2-M5) alongside `built | escalated | hitl-parked | blocked`. The translator
  should render all five in the return-envelope contract and the batch-report buckets; the §4 prose
  is the source of truth (the §2 sketch's "four buckets" predates the R2-M5 addition).
- **Concurrency-cap wording.** Default is **3** in-flight sessions, harness-tunable; the design notes
  this is a **body-level dial**, *not* a new binding key (the harness overlay may tune it). The
  translator should phrase it as a body dial, not imply a bindings-contract key.
- **`tokens_per_session` vs `tokens_per_iu`.** These are distinct: `tokens_per_session` (loop-runner's
  `dispatch-complete` measure) is a defined **superset** of build's `tokens_per_iu` (which stays
  canonical for IU-sizing). The body must keep them distinct and not re-emit build's metric — the
  06-analytics amendment defines both. (This is spec-amendment scope, flagged for the maintainer, not
  for the node body to redefine.)
- **Append-contract phrasing.** The instrumentation-preamble is method-agnostic today, so the body
  must **state** the append discipline (one event = one whole line in a single `O_APPEND` write) in
  the spawn bundle rather than assume it — surface this as an explicit sentence, per R2-M1.
- **Spec amendments are out of node scope but co-dependent.** The design's §7.2 lists three handbook
  amendments (02-graph-spec one sentence; 07-decomposition orchestrator-over-traversals; 06-analytics
  dispatch-complete + tokens_per_session) and §7.3 a workspace-backend change (publish-projection.ts
  triple-key + allowlists). These are NOT this node's body; flag them to the driver so the maintainer
  routes them (the node body should not try to carry spec text).

## Amendment — 2026-06-10 (design §10 / D67): raise-time capture, the front re-split

After rounds 1–2 the operator redesigned the arc front (design `docs/loop-runner-design.md` §10,
revision 3). The round-1 H1 resolution — push specification to **attended intake** because
specify-slice is collaborative — is **superseded**. The contradiction is now resolved **upstream**:
all operator questions move to **raise time at `triage`** (which harvests the live conversation into
the carrier body — `## Context` + `## Decisions`), and **`specify-slice` is lightened** to a
formalise-and-enforce pass with an **unattended mode** (the same body-mode pattern as `review`'s
headless). The dispatched session therefore runs **`specify-slice (unattended) → build → review`**, and
returns with nothing left to ask. Field evidence supports it: the chip-spawned cold session ran
specify → build off the carrier alone and succeeded.

**What changes in the loop-runner body (transcribe from design §10 + the §4 knock-ons — not a
re-design):**

1. **Intro + "What you are — and are not".** IUs arrive **decision-complete from raise time**; the
   dispatched session runs `specify-slice (unattended) → build → review`. Drop the "build-ready
   attended (specify-slice at intake)" framing.
2. **Phase 0 step 3 — the decision-completeness gate** replaces "Specify attended." Per approved IU,
   verify the carrier body carries `## Context` (verbatim evidence — observed vs expected, repro,
   pointers) and `## Decisions` (every call settled, incl. the AFK/HITL call) and **no unresolved fork
   remains in prose** — the IU-schema loop-eligibility invariant. An under-defined stub does **not**
   dispatch: the fallback is **define-now attended** (run the raise-capture Q&A at intake — the
   operator is present anyway) or park.
3. **Phase 0 step 4 — pre-park** reads the AFK/HITL call from the carrier's recorded **Decisions** (the
   `slice_type` is *formalised* in-session by specify-slice; the *decision* is readable at intake from
   the Decisions record).
4. **Phase 0 step 6 — late-binding no-shared-scope rule.** `files` is formalised in-session, so at
   intake serialise on **`improves`-target overlap + the Context section's declared scope** (the
   provisional map); then **late-bind** — specify-slice's carrier-keyed **stage-exit event carries the
   formalised `files`**, and the coordinator re-checks overlap against in-flight sets before each
   subsequent dispatch. An already-formalised IU uses its real `files` directly. The Phase-2 dry-run is
   the backstop.
5. **Phase 1 step 2 — spawn bundle entry stage = `specify-slice` (unattended)** (entry `build` when
   the IU is already formalised). Session span = `specify-slice → build → review`. specify-slice
   formalises the captured definition into the content fields and **enforces** the invariants (routing
   out on a gap, never asking).
6. **Phase 1 step 3 — return-envelope route-outs.** `hitl-parked` rationale: the AFK/HITL decision is
   recorded at raise and read at the intake pre-park, so this is rare post-intake (catches discoveries,
   not known tags). `blocked` gains the **insufficiently-defined** reason: a carrier specify-slice could
   not formalise without asking → back to raise-capture.
7. **Phase 1 step 4 — `tokens_per_session`** = the **specify, build, and review spans + session
   overhead** (was "build span + review span + session overhead").
8. **Instrumentation — add the late-binding bullet:** specify-slice's stage-exit event carries the
   formalised `files` — the scheduling signal the coordinator reads to late-bind the no-shared-scope
   check.
9. **Frontmatter edge comments.** `invokes specify-slice` = "the dispatched session's ENTRY stage
   (unattended mode); also the intake define-now fallback (attended)". `invokes build` = "reached
   inside the session via specify-slice's own `precedes`; also a direct entry when already formalised".
   **The edges THEMSELVES are unchanged** (`invokes specify-slice / build / land` + the five
   references).
10. **Goal 1 metric** span wording → "(specify span + build span + review span + session overhead)".
    Goal 3's route-out bucket list already names the buckets — keep.

The primitive/mode/determinism (skill / collaborative / generative) are **unchanged**: loop-runner
stays collaborative-bookended (batch-subset approval at intake; per-IU land decision at close) with an
autonomous dispatch span between. The cold-handoff completeness contract is homed in `IU-schema` as the
**loop-eligibility invariant** (amended in the same wave) — loop-runner's Phase 0.3 gate is the
consumer of that invariant.

## Review fix-pass — round 3 (2026-06-10)

Adversarial review of revision 3 (design §11) applied to the canonical: dependency exception to
the no-shared-scope rule (R3-H1); stub candidate card contents (R3-M1); dependency source for
stubs = the `## Decisions` record (R3-M2); `invokes: triage` edge added for the intake define-now
fallback (R3-M3); Phase 0.5 scope-mapping wording covers stubs. Edges: +1 (`invokes: triage`).
