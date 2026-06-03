---
title: Research report for specify
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: "Backfill external analogue search: lifted bc-handbook-curator (be-civic), Pocock to-prd, AWS ADR process; added External analogues searched table, updated Source inventory and source-material provenance, added Challenge findings section"
sources_lifted: 3
external_analogue_found: true
external_corpora_searched:
  - "gstack live skills (/home/gstack/.claude/skills/gstack/)"
  - "CE plugin (/home/gstack/scratch/ce-plugin/plugins/compound-engineering/skills/)"
  - "be-civic product harness (/home/gstack/projects/be-civic/)"
  - "mattpocock/skills GitHub repo (published best practice)"
  - "AWS Prescriptive Guidance ADR process (published methodology)"
  - "Anthropic Claude Code skills documentation (code.claude.com/docs)"
researcher_adequacy_note: |
  Searched all four on-disk corpora: gstack skills (office-hours, autoplan, review — none
  owns spec amendment authoring); CE plugin (ce-plan produces implementation plans, ce-brainstorm
  produces requirements docs — neither owns the spec-amendment-to-queue step); be-civic harness
  (bc-handbook-curator is the strongest real-world counterpart — it performs exactly the
  raise/queue/integrate lifecycle that specify generalises). Also searched the web for Pocock to-prd
  (publishes PRDs to issue trackers, confirmed analogous pattern without the PR-queue gate) and
  AWS ADR process (the industry-standard lifecycle for making architectural decisions canonical
  before build). Three files lifted verbatim into source-material/. The bc-handbook-curator match
  is high-confidence: same primitive (skill), same mode (collaborative), same orchestrator pattern
  (invokes queue-checker + pr-author agents). The challenge findings are grounded in concrete
  feature gaps between the analogue and the node: bc-handbook-curator applies pre-raise content
  principles (no inferable content, token efficiency per line, resolved-only content in the body),
  has an explicit decision-doc pathway for doctrine-level changes, requires the caller to confirm
  the read-set, and enforces the queue-check as a hard gate not an advisory. ADR practice adds
  explicit amendment-state tracking and immutability semantics that specify does not model.
  Proceed to translator; these gaps are surfaced but do not block translation — they are
  challenger-findings the operator filters at the next design gate.
---

# Research report for specify

## Identity

**Candidate id:** specify
**Candidate title:** Specify
**Scope:** The third collaborative front stage of the dev-sprint. It turns a settled **design
doc** (with its Spec touchpoints) into a **canonical spec amendment** so that build implements
against settled spec rather than a moving target. When the product has a **spec layout**, specify
is a **primary canon author**: it runs `drift-detector` over the touchpoints for collision /
drift safety, authors the amendment, has `pr-author` compose the PR body, and opens a **labelled
PR into the shared canon queue** that the curator's `integrate` mode gates and merges. When there
is **no spec layout**, specify records the touchpoints and decisions inline and advances the work
— no amendment PR. It is the front-stage seam between *design* (what to build, decided) and
*plan/build* (how, against settled spec).

**Excludes:**
- **Deciding what to build / resolving design questions** — that is `design` (upstream); specify
  consumes design's settled doc, it does not re-open the design.
- **Authoring the PR *description*** — that is `pr-author` (invoked); specify settles the edits
  and hands them over, it does not compose the body itself.
- **Detecting drift / collisions** — that is `drift-detector` (invoked); specify consumes the
  candidate list, it does not scan the canon page-by-page itself.
- **Integrating / merging the PR into canon** — that is the curator's `integrate` mode, a
  separate operator-cadence session; specify *raises* into the queue, it does not gate the merge.
- **Advancing the carrier / recording the gate decision** — specify does **not** write the
  carrier. It reads the carrier for context and emits the stage-complete signal; the projection
  advances `current_stage`, and gate-2 (commit-to-build) is a PM/operator gate, not specify's job.
- **Planning the work** — that is `plan` (downstream, deferred edge).

## Goals

What this node should achieve (as outcomes, not activities) — the design spec's three goals:

| outcome | metric | earns-keep |
|---------|--------|------------|
| The design becomes a canonical spec amendment with explicit touchpoints, so build implements against settled spec rather than a moving target. | share of items entering plan/build with a landed or queued amendment + touchpoints; build-stage "spec ambiguous/wrong" rework traced to a missing or unclear amendment. | spec-ambiguity rework measurably below the pre-specify baseline; if specify never lowers it, the stage is cut or restructured. |
| Amendment collisions and canon drift are caught before the amendment lands, not after. | collisions/drift `drift-detector` surfaces pre-merge vs collisions found post-hoc; duplicate or colliding spec PRs opened against the same pages. | post-hoc collisions trend toward zero; if scans never surface drift the loop later confirms real, the scan is not earning its cost. |
| The amendment reaches canon through one gated path, never an out-of-band edit. | share of amendments landed via a `pr-author`-composed labelled PR into the shared queue vs edited out-of-band; duplicate/colliding spec PRs (target ~0). | out-of-band spec edits trend toward zero; specify + the curator are the single write path to canon for design-driven amendments. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** specify is an **operator-facing front stage** that runs in the live main thread.
Authoring a canon amendment is a judgment-and-sign-off step: the operator confirms what the
amendment should say, weighs `drift-detector`'s collision candidates, and decides whether to
open the PR (and how to bundle it). It shares state with the rest of the front (the design doc,
the carrier context) and pauses for the operator at the decision points. That is the
collaborative side of the context axis — a **skill**. The autonomous, isolatable work it needs
(scanning canon for drift, composing the PR body) is delegated to **agents** it invokes
(`drift-detector`, `pr-author`), which keeps specify squarely collaborative. It mirrors the
built collaborative skill `review` (orchestrates agents, owns operator interaction, performs no
agent-work itself) and its front siblings `align-context` / `design`, all `skill` /
`collaborative` / `generative` per the design spec.

The `bc-handbook-curator` analogue confirms this choice: the real-world counterpart is also a
`skill` / `collaborative` node — the operator interacts at the queue-check gate, confirms edits,
and decides bundling. The pr-author and queue-checker are separately dispatched agents, exactly
as specify invokes `drift-detector` and `pr-author`.

**`determinism:`** `generative`

**Rationale:** Its core work is **judgment** — reading a design doc and its touchpoints and
*authoring* the amendment prose, deciding whether `drift-detector`'s candidates block or inform
the amendment, choosing the bundle, and deciding whether to raise. None of that is a fixed
input→output transform. `null` mode (record inline, no PR) is lighter but still generative
(judging what to record). Matches its siblings and `review`.

## Contract

**Input:** an operator invocation, optionally naming a **mode** (`spec-layout` / `null` /
`amend-existing`) and pointing at the **design doc** (the upstream `design` deliverable, with its
Spec touchpoints). Default mode is **`spec-layout` when a spec layout exists** for the product,
**`null`** when none does. Overlay-supplied context: the **carrier** (the roadmap item — read for
context, not written), the **canon root + page index** via the `handbook` external reference
(resolved to the product's own spec/decisions home), and the graduation **repo + queue label**.
The **touchpoints** are inlined — read from the design doc, not from a separate
`spec-touchpoints-table` reference (that extraction is deferred).

**Output:**
- **`spec-layout`** — a **canonical spec amendment** authored against the touchpoints, raised as
  a **labelled PR into the shared canon queue** (body composed by `pr-author`, after a
  `drift-detector` collision/drift pass), reported by URL. The amendment is now queued for the
  curator's `integrate` gate.
- **`null`** — the touchpoints and decisions **recorded inline** (in the design doc / the carrier
  context surface) and the work advanced; **no amendment PR**.
- **`amend-existing`** — a revision to an **existing** canon section (drift-detector focused on
  that section), raised the same way as `spec-layout`.
- In all modes: a **stage-complete signal** — the projection advances `current_stage`; specify
  writes no carrier field and records no gate decision.

## External analogues searched

Record of the real-world search — conducted 2026-06-03 as a backfill pass against the original 2026-06-01 report which was authored entirely from in-repo design docs.

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills (`/home/gstack/.claude/skills/gstack/`) | skill that authors a canonical amendment or spec document, raises a PR into a queue, detects drift before authoring | no — none of the 60+ skills owns spec amendment authoring as a distinct step; closest are `review` (collaborative orchestrator shape) and `office-hours` (design doc authoring) | — |
| CE plugin (`/home/gstack/scratch/ce-plugin/plugins/compound-engineering/skills/`) | `ce-plan` (produces implementation plans from requirements), `ce-brainstorm` (produces requirements docs), any skill that authors a spec amendment or raises a canonical document PR | partial — `ce-plan` produces a plan artifact from a design/requirements doc, confirming the "synthesise settled decisions into a durable artifact" pattern; `ce-brainstorm` confirms the "requirements doc as the canonical form the planner consumes" pattern; neither owns the spec-amendment-to-PR-queue step | — |
| be-civic product harness (`/home/gstack/projects/be-civic/`) | skill that raises amendment PRs against a canonical corpus, uses a queue-check agent, invokes a pr-author agent, and has a separate integrate gate | yes — `bc-handbook-curator` (`bc-operations/bc-skills/bc-handbook-curator/SKILL.md`) is the real operational instance of exactly this job | `bc-handbook-curator-SKILL.md` |
| mattpocock/skills (published best practice, GitHub) | `to-prd` skill — turns conversation context into a PRD and publishes to issue tracker; `grill-with-docs` — challenges plan against domain model, updates ADRs | yes — `to-prd` confirms the "synthesise existing context into a canonical document" pattern without re-interviewing; also confirms ADR-respect as a pre-authoring step | `mattpocock-to-prd-SKILL.md` |
| AWS Prescriptive Guidance ADR process (published methodology) | full ADR lifecycle: Proposed → Accepted / Rejected / Superseded; immutability after acceptance; amendment creates a new ADR; code-review ADR compliance check | yes — this is the industry-standard lifecycle for the same job specify does | `aws-adr-process.md` |
| Anthropic Claude Code skill authoring docs (`code.claude.com/docs/en/skills`) | best practices for collaborative vs autonomous skills, spec/document authoring skill patterns | found general skill authoring doctrine; nothing spec-amendment-specific | — |

**Primary analogue:** `bc-handbook-curator` (be-civic product harness). It is a real, operational Claude skill that does exactly what specify generalises: authors a canonical amendment, runs a queue-checker agent before raising (collision-safety), invokes a pr-author agent to compose the body, raises a labelled PR into a shared queue, and gates merges via an `integrate` mode. The "many raisers / one queue / one integrate gate" model in specify's design is derived from — and confirmed by — this real analogue.

**Secondary analogues:**
- `to-prd` (Pocock) — confirms the "synthesise existing context into canonical artifact" shape but stops at publishing to an issue tracker (no queue/integrate gate, no drift scan, no modes for products without a spec layout).
- ADR process (AWS) — the industry methodology for the same job; adds explicit amendment-state tracking (Proposed/Accepted/Superseded) and immutability semantics that specify does not currently model.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/bc-handbook-curator-SKILL.md` | keep (challenge + interface) | Primary real-world analogue. Keep for challenge findings: strict pre-raise content principles (no inferable content, token-efficiency gate, resolved-only body), explicit collision-redirect (raises comment instead of a new PR), decision-doc pathway for doctrine-level changes, read-set constraint. Interface: confirms invokes pr-author + queue-checker shape, confirms labelled-PR-to-shared-queue model, confirms integrate as the separate merge gate. Drop: be-civic-specific paths, label names, repo names. |
| `source-material/mattpocock-to-prd-SKILL.md` | keep (pattern confirmation + challenge) | Secondary analogue. Keep: confirms "synthesise existing context without re-interviewing" as best practice; confirms "respect ADRs in the area" as a pre-authoring step; confirms user-story + implementation-decisions + out-of-scope structure for the authored artifact. Challenge: to-prd publishes to an issue tracker, not a PR queue — the queue/integrate gate is specific to specify's design (an open question: is the PR queue the right publication surface or could it be an issue?). Drop: Ruby/JS specific test seam language, issue tracker label mechanics. |
| `source-material/aws-adr-process.md` | keep (methodology + challenge) | Industry methodology analogue. Keep: ADR states (Proposed/Accepted/Superseded/Rejected) as a possible model for amendment lifecycle state; immutability-after-acceptance discipline; amendment-creates-new-ADR-and-supersedes-old rule; code-reviewer ADR compliance check as a downstream loop. Challenge: specify does not model amendment state (a PR is either open or merged, not explicitly Proposed/Accepted/Superseded); no supersede pathway when an accepted amendment needs to change; no compliance check loop back to build. Drop: team-meeting cadence, human-team ceremony (stakeholder list, timestamps) — not relevant to an agentic skill. |
| `docs/dev-sprint-front-design.md` (`## specify` + `## Governed decisions`) | keep (defining — in-repo design doc) | The authoritative source for *what the node is*: the three goals, the three modes, the exact edge set, the canon write-path (primary author → pr-author labelled PR → shared queue → curator integrate gate), the carrier projected model (read + stage-complete signal, no write-edge), touchpoints inlined, `precedes plan` deferred. Every goal and edge below traces here. |
| `docs/graph-map.md` | keep (edge-defining — in-repo) | The `specify` backbone row ("design → canonical spec amendment + touchpoints; pr-author, drift-detector; spec-layout only, else null"); the **curator cell** write-path (raise → queue → integrate; "the queue IS the set of open labelled PRs"); D40 (many raisers, one queue) + D41 (the shared `handbook` external reference, overlay-resolved); the references load-dial model. Drop the rows for other nodes. |
| `graph/pr-author/pr-author.md` | keep (interface — in-repo) | The agent specify invokes to compose the PR body. Fixes the seam: specify settles the **edits** (page + one-sentence change), the **trigger**, a **recommendation**, optional alternatives/out-of-scope, and the **read_set**; pr-author returns the body string and does NOT open the PR or compose the title (specify/the dispatcher does). It already declares `composes-into dev-sprint @specify`. Drop pr-author's internals (its quality bar is its own concern). |
| `graph/drift-detector/drift-detector.md` | keep (interface — in-repo) | The agent specify invokes to scan the touchpoint pages for collisions / drift / missing-content before the amendment lands. Fixes the seam: specify hands a `read_set` (the touchpoint page-slugs) + a `task_summary` + optional `trigger_examples`; drift-detector returns the structured candidate list (or `no_drift_found`). It already declares `composes-into dev-sprint @specify`. Drop drift-detector's internal seven-trigger scan logic (its own concern). |

Mirrored for **node shape and voice** (not lifted as source): `graph/review/review.md` (the
built collaborative orchestrator — orchestration + operator interaction + routing, performs no
agent-work itself; phase-structured body; modes as branches) and `graph/explore/explore.md`
(the read-only agent contract and the substrate/handbook external-reference pattern).

## Keep / Drop

**Kept (absorbed into body):**
- The **three modes as body branches** (D34): `spec-layout` (default when a spec layout exists —
  the full canon-author path) / `null` (no spec layout — record inline, advance, no PR) /
  `amend-existing` (revise an existing section; drift-detector focused there).
- The **canon write-path** (D40/D41): specify is a **primary canon author**. It authors the
  amendment, runs `drift-detector` for collision-safety, has `pr-author` compose the body, and
  opens a **labelled PR into the shared canon queue**. The queue *is* the set of open labelled
  PRs (no separate store). The curator's `integrate` mode gates and merges — specify raises, it
  does not merge. "Many raisers, one queue, one integrate gate."
- The **drift-before-land discipline**: run `drift-detector` over the touchpoint pages *before*
  the amendment lands; collisions inform or block the amendment. drift-detector gives
  collision-safety; the merge is still gated at integrate.
- The **carrier projected model** (governed): specify **reads** the carrier (its
  `lifecycle_state`, prior `transition_history`) and the design doc **for context**; it emits a
  **stage-complete signal** that the projection picks up to advance `current_stage`; it carries
  **no write-edge** to the carrier and records **no gate decision**. Completing specify moves the
  item toward **gate-2 (commit-to-build)** — a PM/operator decision, not specify's job. This is
  the same projected-model the three front stages share (design spec, Governed decisions).
- **Touchpoints inlined**: read the Spec touchpoints from the design doc; do not depend on a
  `spec-touchpoints-table` reference (deferred extraction).
- The **overlay generalisation**: the canon root + page index (via the `handbook` external
  reference), the carrier home, the graduation repo + queue label, and whether a spec layout
  *exists* are all overlay-supplied; the same node serves any product (no literals).

**Dropped (out of scope / belongs to another node):**
- **The PR description content / quality bar** — `pr-author`'s concern (invoked).
- **The page-by-page drift scan / the seven triggers / the gate filter** — `drift-detector`'s
  concern (invoked).
- **Integrating, cross-PR consistency, the batch merge, refresh-index** — the curator's
  `integrate` mode (a separate session), not specify.
- **Resolving design questions, the experience-contract, the lens family** — `design`'s concern
  (upstream).
- **Advancing `lifecycle_state` / recording the `gate_decision`** — a PM/operator gate (gate-2),
  reached *after* specify; specify only signals stage-complete.
- **Any product literals** (spec paths, section names, sprint codes) — harness-supplied.

**Edge only (separate node):**
- **Scanning the touchpoint pages for collisions / drift** → `drift-detector`. `invokes` edge,
  from `spec-layout` / `amend-existing`. Read-only, isolated, reused by the curator too.
- **Composing the labelled-PR body for the settled amendment** → `pr-author`. `invokes` edge,
  from `spec-layout` / `amend-existing`. Stateless, reused by reconcile + the curator.

## Overlaps and seams

- **← `design`** (`can-follow design`, authored now) — design hands specify its **settled design
  doc with Spec touchpoints**; specify turns it into the amendment. This is the upstream front
  edge. `design` is authored in the same Thread-B wave; per the governed edge set the edge is
  authored on specify's side now (design is a real, intended endpoint). (Symmetric note: the
  design spec also has `design precedes specify` authored from design's side.) Until `design`'s
  node file lands, validate cannot resolve this target — see Open questions.
- **→ `drift-detector`** (`invokes`, from `spec-layout` / `amend-existing`) — hands a `read_set`
  (touchpoint page-slugs) + `task_summary` + optional `trigger_examples`; receives the structured
  candidate list (or `no_drift_found`). Collision-safety before the amendment lands. Already
  exists; already declares `composes-into dev-sprint @specify`.
- **→ `pr-author`** (`invokes`, from `spec-layout` / `amend-existing`) — hands the settled
  amendment **edits** (+ trigger, recommendation, read_set); receives the PR **body** string.
  specify (the dispatcher) opens the PR and composes the title. Already exists; already declares
  `composes-into dev-sprint @specify`.
- **→ the curator's `integrate`** (NO edge — a queue handoff, not an invoke) — the labelled PR
  lands in the shared queue; the curator's `integrate` mode, in a **separate operator-cadence
  session**, lists the queue, runs cross-PR checks, and gates the merge. specify does not invoke
  integrate and does not gate the merge. The seam is the **labelled PR in the shared queue**, not
  an edge. (This is the D40 "many raisers, one queue, one integrate gate" model — described in
  prose, no edge.)
- **→ `plan`** (`precedes plan`, **deferred** — F7) — specify precedes plan in the arc; the edge
  is deferred until `plan` exists and is described in prose. After specify completes (and the
  PM/operator passes gate-2), the work moves to plan against the now-settled spec.
- **The carrier** (read-only context + a stage-complete signal, **not an edge**) — specify reads
  the carrier through its overlay-bound home and emits the stage-complete signal the projection
  consumes; it is a state mechanism (the projection/curator syncs `current_stage`), not a
  `composes-into` or write edge. Mirrors the carrier model in 02-graph-spec (a node maintains the
  carrier surface; the stage is projected, not scalar-written by the stage).
- **`composes-into dev-sprint @specify`** — specify is the `specify` stage of the dev-sprint arc.
  The arc is derived from edges, not a node file (validate skips the target).

## Fit

**Single node — confirmed.** It owns its own branching (three modes) and sequencing (the
read-design → drift-scan → author → graduate path), and states three distinct measurable goals
(settled-spec coverage, collisions-caught-pre-land, one-gated-path). It mirrors an
already-authored collaborative orchestrator (`review`) and its front siblings, the strongest fit
signal.

**Modes stay body branches (D34), not nodes.** None of the three modes earns its own separable
measurable goal that would force a split — they are conditions of one stage (a spec layout
exists / does not / is being revised) sharing the same goals and the same write-path. The
drift-*scan* (`drift-detector`) and the PR-*composition* (`pr-author`) **are** their own nodes —
correctly modelled as `invokes` edges, not absorbed branches (each is autonomous, isolated, and
reused by other callers — the decomposition reuse/cohesion test).

**bc-handbook-curator confirms the fit:** the real analogue is also a single collaborative skill
with multiple modes (`raise`, `integrate`, `queue`, `decision-doc`, `comment`) rather than
separate node files per mode.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | dev-sprint (`stage: specify`) | specify is the `specify` stage of the dev-sprint arc. The arc is derived from edges, not a file — validate skips the target. Authored now (the arc/stage is stable). |
| invokes | drift-detector | `spec-layout` / `amend-existing` scan the touchpoint pages for collisions / drift before the amendment lands. Resolvable now (node file present; declares `composes-into @specify`). |
| invokes | pr-author | `spec-layout` / `amend-existing` compose the labelled-PR body for the settled amendment. Resolvable now (node file present; declares `composes-into @specify`). |
| references | handbook (`load: on-demand`, `external: true`) | specify navigates the product's own canon (spec + decisions) to author the amendment against the right pages; overlay-resolved, factory ships only the pointer. Same external reference explore / drift-detector / handbook-curator carry. No factory file — validation/build skip it. |
| can-follow | design | design hands specify its settled design doc + touchpoints; the upstream front process edge. Authored now per the governed edge set (design is a real, intended endpoint authored in this same wave). NOTE: `design`'s node file is not yet on disk — see Open questions / Conformance. |

**Omitted deliberately:**
- `precedes plan` — **deferred (F7)**: `plan` does not exist yet; described in prose (specify
  precedes plan; the work moves to plan after gate-2). Wire by `amend` once `plan` lands.
- **No carrier write-edge** — governed: specify reads the carrier and emits a stage-complete
  signal; it never writes the carrier. The projection/curator advances `current_stage`; gate-2 is
  a PM/operator decision. Stated in prose, not an edge.
- **No `references: spec-touchpoints-table`** — touchpoints are inlined (read from the design
  doc); the table-extraction reference is deferred and not authored.
- **No edge to the curator's `integrate`** — the handoff is the labelled PR in the shared queue,
  not an invoke; prose.

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — agrees (front-stage operator
dispatcher; mirrors `review` and the front siblings). Confirmed by `bc-handbook-curator` analogue
(same primitive/mode, same orchestrator pattern).

**`goals:` as outcomes:** all three read as outcomes (the design lands as a settled amendment so
build implements against settled spec; collisions are caught before landing; the amendment
reaches canon through one gated path), each with a metric and an earns-keep threshold. None are
activities.

**Edge targets resolvable:**
- `dev-sprint` — an arc id (`composes-into`); validate skips it. OK.
- `drift-detector`, `pr-author` — present as node files (verified on disk); both already declare
  `composes-into dev-sprint @specify`. OK.
- `handbook` — `external: true`; correctly absent from the factory (harness-supplied);
  validation/build skip it. OK.
- `design` (`can-follow`) — **NOT yet on disk.** Authored per the governed edge set (design is
  the intended upstream endpoint, authored in the same Thread-B wave). The maintainer's
  process-edge rule says a `precedes`/`can-follow` target must resolve to a node file or validate
  fails — so `validate` will flag this edge as an unresolved target **until `design` lands**, at
  which point it resolves with no further change to specify. Flagged for the operator (see Open
  questions). validate was not run per the task instruction.

## Challenge findings

The following findings are grounded in the external analogues lifted in this backfill. They describe where the `specify` node is **weaker than its real-world counterparts**, what best practice it omits, or gaps that the analogue reveals. These are challenger findings — the operator filters what to act on.

### CF-1 (medium) — No pre-authoring content-principles gate

**Analogue:** `bc-handbook-curator` `raise` mode enforces strict principles *before* the PR is opened: (a) no inferable content ("is the new content something an agent could infer from existing context?"), (b) token-efficiency per line ("would removing this cause an agent to make a mistake?"), (c) resolved-only content in the body ("proposed/unresolved content belongs in the PR description, not the page body"), (d) read-set constraint ("edits cover what the caller read this session").

**Gap:** `specify` has no equivalent gate. Phase 3 ("author the amendment") says to write "to the canon's voice and shape" and "keep it to the touchpoints" — but there is no explicit test the operator and specify run before raising. An amendment that includes inferable, unresolved, or out-of-read-set content could land in the queue without being caught.

**Recommendation:** add a pre-raise checklist to Phase 3 (or as a Phase 3.5 gate): at minimum, (a) is each change canonical-and-resolved (not proposed)? (b) does it cover only what the Spec touchpoints name? (c) does it reach beyond the design doc's settled decisions? The bc-handbook-curator's four principles are a directly applicable template.

---

### CF-2 (medium) — No collision-redirect (duplicate-PR) handling

**Analogue:** `bc-handbook-curator` `raise` performs a hard queue-check *before* branching: if an open PR already covers the same drift, it redirects the caller to `comment` mode instead of opening a duplicate. The collision is surfaced before any edits are made.

**Gap:** `specify` invokes `drift-detector` and says to surface collisions to the operator ("surface it to the operator and resolve it before raising"), but the resolution path is incomplete. The node does not describe what happens when another open PR already covers the same touchpoint pages: it says "fold it in, redirect, or hold" but has no explicit "comment on the existing PR instead of opening a new one" route. A product with an active canon queue could accumulate duplicate PRs targeting the same pages.

**Recommendation:** add an explicit collision-redirect path: if `drift-detector` returns a collision that matches an open PR's touchpoints, specify should surface the existing PR URL, recommend commenting rather than opening a second PR, and offer to hand off to the curator's `integrate` for resolution.

---

### CF-3 (medium) — No `decision-doc` / doctrine-level pathway

**Analogue:** `bc-handbook-curator` has a `decision-doc` mode for amendments that "set or change doctrine that other pages will cite by §-anchor" — changes too broad for a single section edit. These produce a separate decision record under `11-archive/decisions/` plus cascading amendment PRs. The test is: "Does this change doctrine that other pages cite?"

**Gap:** `specify` has no equivalent pathway for design-driven amendments that change doctrine rather than (or in addition to) amending a section. A design decision that touches multiple touchpoint pages and changes a cross-cutting principle would be raised as multiple section-edits, losing the doctrine-level record.

**Recommendation:** add guidance: when the amendment spans multiple touchpoint pages and changes a cross-cutting principle (not just a section), the operator should decide whether to raise a doctrine-level record (the curator's `decision-doc` mode or equivalent) *before* or *alongside* the amendment PR. This is an operator-judgment gate, not an automated path — but specify should name the case so it is not silently treated as a normal section edit.

---

### CF-4 (low) — Amendment state is implicit (no Proposed/Accepted/Superseded)

**Analogue:** ADR practice (AWS) makes the lifecycle state explicit: Proposed → Accepted | Rejected | Superseded. An accepted ADR is immutable; a later change creates a new ADR that supersedes it. Amendments that supersede an existing canon section should be tracked as superseding it.

**Gap:** `specify` tracks no lifecycle state on the amendment itself. "Queued" is implicit in the PR being open; "accepted" is implicit in the PR being merged. There is no supersede pathway: if an accepted amendment is later revised, the old amendment is not explicitly marked superseded, and there is no guidance for how `amend-existing` should relate the new revision to the old.

**Recommendation:** this is lower priority (the PR history carries the lineage), but the `amend-existing` mode should at minimum link the revised section back to the prior amendment PR that it supersedes — the PR description should include a "supersedes" reference so the decision log stays navigable. Consider whether the node schema should carry an optional `supersedes` field on the amendment PR body.

---

### CF-5 (low) — No ADR-compliance check loop back to build

**Analogue:** ADR practice (AWS) includes a feedback loop: during code review, reviewers check whether code changes violate any accepted ADR. A violation is surfaced and the implementer must update the code to conform before merge.

**Gap:** `specify` has no modelled feedback path from `build` back to canon. The node advances work toward `plan/build` but does not describe what happens when build-time decisions diverge from the settled spec amendment. The `reconcile` stage presumably captures post-build drift back into canon, but this loop is not named in specify itself.

**Recommendation:** add a note to specify's output contract: the amendment is the specification for plan/build; divergence found at build should route to `reconcile` (the post-build spec-correction path) rather than being silently baked into the implementation. This closes the loop in the node's own description rather than leaving it unspoken.

---

### CF-6 (low) — to-prd: issue tracker vs PR queue as publication surface

**Analogue:** Pocock's `to-prd` publishes a PRD to an issue tracker with a triage label. The issue *is* the proposal — no separate PR queue.

**Finding:** this is not a gap in specify, but a design-choice confirmation: specify's PR-queue model is a deliberate architectural choice (not the only valid surface). The PR queue enables the curator's cross-PR consistency checks, which are not possible with a flat issue tracker. `to-prd`'s ADR-respect step ("respect any ADRs in the area you're touching") does confirm that the production pattern includes a pre-authoring read of the existing canon — specify's Phase 1 (scope the amendment, read the design doc and carrier) is aligned with this but does not explicitly say "check whether the touchpoint pages carry decisions that constrain the amendment."

**Recommendation:** add an explicit step to Phase 1: after resolving touchpoint page-slugs, read the current canonical content of those pages before authoring the amendment. This mirrors both `to-prd`'s ADR-read step and the `bc-handbook-curator`'s read-set constraint.

## Open questions

- **`can-follow design` while `design` is not yet on disk.** The governed edge set lists
  `can-follow design` and the design spec authors `design precedes specify`, so `design` is the
  intended, real upstream endpoint — authored in this same Thread-B wave. Per the maintainer's
  process-edge discipline (defer an edge whose endpoint does not yet exist), the strictly-safe
  alternative would be to omit `can-follow design` from frontmatter, describe it in prose, and
  wire it by `amend` once `design` lands — exactly as `precedes plan` is handled. **Decision
  taken (authored the edge):** include `can-follow design` now, because (a) the governed edge set
  names it explicitly as a specify edge, (b) `design` is being authored in the same wave (not a
  distant F7 endpoint), and (c) the design spec's intent is that the two existing front endpoints
  (design, specify) carry their internal process edges now. The only cost is that `validate` will
  report `design` as an unresolved target until design's file lands — a transient, expected state
  within the wave, not a defect in specify. If design is NOT authored in this wave, this edge
  should be dropped to prose to keep validate green (operator to confirm the wave scope).
- **`null`-mode recording surface.** Where `null` mode records touchpoints/decisions inline — the
  design doc, the carrier context surface, or the decisions store. Recommendation: record into the
  design doc + the carrier context surface the projection reads (no canon PR, by definition); a
  product without a spec layout may still keep a decisions store, but specify should not assume
  one. Left to the body as "record inline into the design doc / carrier context", harness-bound.
- **Whether to add a pre-raise content-principles gate (CF-1).** The bc-handbook-curator analogue
  enforces strict principles before opening a PR. Specify currently relies on the operator's
  judgment and the "keep it to the touchpoints" guidance. Adding an explicit pre-raise checklist
  (CF-1) would harden the one-gated-path goal but adds ceremony. Operator to decide whether the
  additional gate is warranted or whether the design doc quality (which specify consumes) makes
  it redundant.
- **Whether to add a doctrine-level pathway (CF-3).** If design decisions span multiple
  touchpoint pages and change cross-cutting principles, specifying whether to raise a
  `decision-doc` equivalent (alongside or before the section amendments) is an operator call
  that the node currently does not surface.
