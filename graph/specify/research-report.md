---
title: Research report for specify
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
sources_lifted: 4
researcher_adequacy_note: |
  Authored from the governed design (docs/dev-sprint-front-design.md, the "## specify" section
  + "## Governed decisions"), the map (docs/graph-map.md — specify's row, the curator cell
  write-path, the references/load model), and the two agents specify invokes (graph/pr-author,
  graph/drift-detector). No new external source was lifted — specify is a *new* backbone front
  stage whose shape is fully fixed by the design spec and by mirroring the built collaborative
  skill (graph/review). The node is general: no product (Be-Civic) literals; canon-author,
  carrier-projected.

  Settled before synthesis (governed decisions, locked):
  - `primitive: skill` / `mode: collaborative` / `determinism: generative`.
  - Three body-branch modes: `spec-layout` (default when a spec layout exists) / `null` (no
    spec layout — record touchpoints/decisions inline, advance the work, no amendment PR) /
    `amend-existing` (revise an existing section; drift-detector focuses there).
  - Edges: `composes-into dev-sprint @specify`; `invokes drift-detector`; `invokes pr-author`;
    `references handbook` (external, on-demand); `can-follow design`. `precedes plan` deferred
    (F7) — prose.
  - Canon write-path (governed, D40/D41): specify is a PRIMARY canon author — it AUTHORS the
    spec amendment and opens a **labelled PR via pr-author into the shared canon queue** that
    the curator's `integrate` gates. drift-detector gives collision-safety; integrate still
    gates the merge. Many raisers (specify, reconcile, handbook-curator, strategy-curator),
    one queue, one integrate gate.
  - Touchpoints inlined for now — do NOT reference a `spec-touchpoints-table` ref (not authored).
  - CARRIER PROJECTED MODEL (governed): specify READS the design doc + carrier for context;
    emits a stage-complete signal (the projection advances `current_stage`); NO carrier
    write-edge. Completing specify moves the item toward gate-2 (commit-to-build), a
    PM/operator decision, not specify's job.
  Open item carried to the translator: the `can-follow design` edge — `design` is authored in
  the same Thread-B wave but its node file is not yet on disk; per the governed edge set it is
  authored now (design is a real, intended endpoint), and wired/validated once design lands.
  See Open questions.
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

## Source inventory

| file | status | notes |
|------|--------|-------|
| `docs/dev-sprint-front-design.md` (`## specify` + `## Governed decisions`) | keep (defining) | The authoritative source for *what the node is*: the three goals, the three modes, the exact edge set, the canon write-path (primary author → pr-author labelled PR → shared queue → curator integrate gate), the carrier projected model (read + stage-complete signal, no write-edge), touchpoints inlined, `precedes plan` deferred. Every goal and edge below traces here. |
| `docs/graph-map.md` | keep (edge-defining) | The `specify` backbone row ("design → canonical spec amendment + touchpoints; pr-author, drift-detector; spec-layout only, else null"); the **curator cell** write-path (raise → queue → integrate; "the queue IS the set of open labelled PRs"); D40 (many raisers, one queue) + D41 (the shared `handbook` external reference, overlay-resolved); the references load-dial model. Drop the rows for other nodes. |
| `graph/pr-author/pr-author.md` | keep (interface) | The agent specify invokes to compose the PR body. Fixes the seam: specify settles the **edits** (page + one-sentence change), the **trigger**, a **recommendation**, optional alternatives/out-of-scope, and the **read_set**; pr-author returns the body string and does NOT open the PR or compose the title (specify/the dispatcher does). It already declares `composes-into dev-sprint @specify`. Drop pr-author's internals (its quality bar is its own concern). |
| `graph/drift-detector/drift-detector.md` | keep (interface) | The agent specify invokes to scan the touchpoint pages for collisions / drift / missing-content before the amendment lands. Fixes the seam: specify hands a `read_set` (the touchpoint page-slugs) + a `task_summary` + optional `trigger_examples`; drift-detector returns the structured candidate list (or `no_drift_found`). It already declares `composes-into dev-sprint @specify`. Drop drift-detector's internal seven-trigger scan logic (its own concern). |

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
dispatcher; mirrors `review` and the front siblings).

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
