---
title: Research report for architecture-review
type: research-report
status: complete
authored: 2026-06-10
last_updated: 2026-06-10
amended:
  - date: 2026-06-10
    change: >-
      Description trimmed — drop the trailing "Use when …" sentence from `description`: the build
      folds `when-to-use` into the vendored description, so a Use-when inside `description` duplicated
      the routing signal (surfaced by the vendor block-scalar fix; siblings optimise/health keep
      Use-when in `when-to-use` only).
sources_lifted: 6
external_analogue_found: true
external_corpora_searched:
  - "Matt Pocock's mattpocock/skills (improve-codebase-architecture, pinned aaf2453f) — the primary external analogue"
  - "operator gstack skill set (~/.claude/skills: health, optimise, review, investigate, design-review)"
  - "in-repo graph nodes + refs (optimise, health, design, triage, log-decision, explore; architecture-doctrine, findings-schema, bindings-contract, instrumentation-preamble)"
  - "Anthropic skill/agent authoring docs (skill structure, subagent dispatch) — consulted for the primitive shape, nothing lifted"
researcher_adequacy_note: |
  The external analogue is real and primary: Matt Pocock's improve-codebase-architecture (ICA)
  skill at the pinned commit aaf2453f, MIT — all five files lifted verbatim (SKILL/LANGUAGE/
  DEEPENING/INTERFACE-DESIGN/HTML-REPORT) plus the licence, six files total. SKILL.md is the
  process source for mode `review`; INTERFACE-DESIGN.md for mode `interface-design`; HTML-REPORT.md
  for the body's card template; LANGUAGE+DEEPENING were already synthesised into the
  architecture-doctrine ref (the node references it on-demand, never restates it). The operator's
  own health/optimise/review skills were searched as the closest in-house counterparts and confirm
  the stance: a standing, read-only, operator-triggered capability beside optimise/health — none of
  them is a diff-time review (that is the `review` lens family) nor a backbone stage, so the
  no-arc-position shape is corroborated by three siblings, not asserted. Edges were determined from
  the approved plan §C (all SETTLED): invokes explore (caller-side, design.md precedent) +
  log-decision; references architecture-doctrine (on-demand) + instrumentation-preamble (import) +
  domain-glossary (external, on-demand); escalates triage; NO composes-into/precedes/can-follow.
  primitive=skill / mode=collaborative / determinism=generative is high-confidence — the grilling
  loop is inherently operator-in-the-loop and judgment-driven. Goals were straightforward to frame
  as outcomes (candidate-quality share, terminal-disposition + no-resuggest, zero premature-interface
  leakage). Recommendation: proceed to translator — the node shape, edges, and report-persistence
  are all settled decisions; the one thing the translator must hold is that the body carries the
  card template and report-pair format, while the doctrine stays in the ref.
---

# Research report for architecture-review

## Identity

**Candidate id:** architecture-review
**Candidate title:** Architecture review
**Scope:** A standing, operator-triggered **collaborative** skill that surfaces whole-codebase
architectural friction and proposes **deepening opportunities** (shallow modules → deep ones, for
testability and AI-navigability), grills the operator's chosen candidate to a terminal disposition,
and — only after a candidate is picked — optionally explores alternative interfaces (Design-It-Twice).
It imports Matt Pocock's `improve-codebase-architecture` (ICA) skill. It is a **standing capability
beside `optimise`/`health`** — whole-tree, operator-invoked, **read-only** — **not** a diff-time
review lens (that is the `review`/`design` lens family) and **not** a backbone arc stage. **Excludes:**
deciding strategy, writing product code, routing the accepted improvement itself (it hands off to
`triage`), and re-stating the deep-module doctrine (owned by `architecture-doctrine`). The
test-quality rubric stays owned by `test-discipline`; this node owns the structural review *process*.

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| The candidate report is **signal, not noise** — most candidates surfaced are worth the operator's attention, and shallow/speculative churn is held down. | share of surfaced candidates the operator picks to grill (or marks Strong/Worth-exploring) vs Speculative-and-dropped; candidates that pass the deletion test vs pass-throughs. | the worth-pursuing share stays high enough that the operator reads the report rather than skimming past it; a run that is mostly Speculative noise is a tune/cut signal. |
| Every grilled candidate reaches a **terminal disposition** — escalated to `triage` (pursued) or recorded as an ADR via `log-decision` (rejected) — and an ADR-rejected candidate **stops being re-suggested** across later runs. | share of grilled candidates with a recorded disposition (pursued→work-item id / rejected→decision id) vs left open; re-suggestion rate of a candidate already rejected-with-ADR in a prior run. | open-ended grillings trend toward zero AND re-suggestion of ADR-rejected candidates trends to zero — if the decisions store does not suppress re-suggestion, the load-bearing-rejection loop is not earning its keep. |
| **Zero premature-interface leakage** — no interface is proposed before the operator picks a candidate; interface design runs only on the picked candidate, only in `interface-design` mode. | count of report runs (mode `review`) that surface a concrete interface before a candidate is picked (a leak); share of `interface-design` runs that are gated on a prior candidate pick. | leakage stays at zero — the report stays diagnosis-only; a run that proposes interfaces in the report is a defect, not a feature. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** The whole point of phases 2–3 is the operator in the loop: the report is presented
to the operator, the operator *picks* a candidate, and the grilling loop is a conversation that
walks the design tree with them and crystallises side-effects (a glossary term, an ADR offer, an
interface exploration) as decisions land. This needs the **live main thread** — operator questions,
a pick, sign-off — so it is a **skill** (current context), exactly like `optimise` (which also
kicks off collaboratively) and unlike the autonomous `health` agent. Collaborative→skill is the
required agreement. The Explore fan-out *inside* phase 1 is delegated to the `explore` **agent**
(isolated), but the node itself holds the thread — a skill that dispatches agents, the standard
compose pattern. No ambiguity: `agent` is wrong because the node must converse and gate.

**`determinism:`** `generative`

**Rationale:** The node reasons about *where* friction lives, *whether* a module is shallow (the
deletion test is a judgment, not an algorithm), *which* dependency category a candidate falls in,
and *which* candidate to recommend first — all judgment under the doctrine, none of it a fixed
input→output transform. Generative, like `design`, `optimise`, and `health` (whose first run is
generative). Unlike the deterministic `log-decision` it invokes (a mechanical two-layer write).

## Contract

**Input:** An operator trigger (whole-tree or a scoped sub-tree), optionally a mode token
(`review` default | `interface-design`) and, for `interface-design`, the already-picked candidate.
Loaded context: the **`architecture-doctrine`** reference (on-demand — the vocabulary, deletion
test, dependency categories, replace-don't-layer); the harness's **domain glossary** via the
external `domain-glossary` pointer (on-demand — the CONTEXT.md analogue, supplies domain nouns); the
factory **decisions store** (read, to avoid re-suggesting prior ADR-rejected candidates); the
`instrumentation-preamble` (import). It dispatches `explore` for the friction-finding fan-out.

**Output (mode `review`):** A **committed report pair** under the `architecture-reviews-root`
binding — `<yyyy-mm-dd>-<slug>.html` (self-contained Tailwind+Mermaid candidate-card report per the
body's template — before/after diagrams, Strong/Worth-exploring/Speculative badges, dependency-category
tags, Top recommendation, **no interfaces**) + a sibling `<yyyy-mm-dd>-<slug>.md` record (frontmatter:
date, repo/scope, `candidates[]` each `{title, strength, dependency_category, disposition:
pursued|rejected|open, link}`). Then the grilling loop on the operator's pick, whose terminal
side-effects are: **escalate to `triage`** (pursued — disposition links the work-item id triage
created) or **invoke `log-decision`** (load-bearing rejection → ADR; disposition links the decision
id); and inline glossary-term additions to the harness domain glossary. Plus enter/exit
instrumentation events (carrier `null` for a standalone run).

**Output (mode `interface-design`):** For the *already-picked* candidate, a framed problem space +
3+ parallel interface designs (Design-It-Twice), compared by depth/locality/seam placement, with an
opinionated recommendation. Never auto-chained from the report; only runs on an operator-picked
candidate.

**Hard gate:** **read-only — never edits product code.** Surfaces, reports, and routes only (the
`health` read-only contract, stated as load-bearing, not a preference).

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| Matt Pocock `mattpocock/skills` `engineering/improve-codebase-architecture` @ `aaf2453f` | the primary analogue: the full ICA skill — process, doctrine, interface fan-out, report format | **yes** | `pocock-ica-SKILL.md`, `-LANGUAGE.md`, `-DEEPENING.md`, `-INTERFACE-DESIGN.md`, `-HTML-REPORT.md` + `LICENSE-mattpocock-skills` |
| operator gstack skills — `~/.claude/skills/health` | a real read-only whole-codebase quality dashboard that scores + reports + never fixes | yes (in-house counterpart) | — (already modelled as `graph/health`; informs the read-only standing-capability stance) |
| operator gstack skills — `~/.claude/skills/investigate`, `/review`, `/design-review` | a real architecture-improvement or whole-tree structural review | partial — `investigate` is root-cause debugging (different job); `review`/`design-review` are **diff/visual** review, not whole-tree structural | — (confirms the diff-lens-vs-standing-capability seam: those are the `review` family, this is not) |
| in-repo graph — `graph/optimise`, `graph/health` | the sibling stance: a standing capability outside any arc, no process edges, hard read-only gate phrasing | yes (precedent) | — (precedent for the no-arc-position shape + read-only gate language) |
| in-repo graph — `graph/design` | caller-side `invokes: explore` precedent (a node that fans Explore out without an inbound-invoke on explore's side) | yes (precedent) | — |
| in-repo graph — `graph/triage`, `graph/log-decision` | the escalation target's contract + the ADR-write contract | yes (edge targets) | — |
| in-repo refs — `findings-schema` | whether the candidate cards should conform to the finding contract | searched-and-rejected | — (candidates are opportunity-shaped, not defect-shaped — see Edges / deliberate non-edge) |
| Anthropic skill/agent authoring docs | the canonical skill shape (description first-sentence-what / second-sentence-when; subagent dispatch) | yes (no lift) | — (informs the `description`/`when-to-use` shape; nothing verbatim) |

**External analogue is real and primary.** ICA is a direct, MIT-licensed external counterpart to
the whole node — it *is* the job done in the wild — so the report challenges the node against a real
skill, not only in-repo design docs. The in-house search additionally confirmed the **stance**:
gstack's `health` is the closest operator skill (read-only, whole-codebase, scores + reports, never
fixes) and corroborates the optimise/health standing-capability shape; gstack's `review`/`design-review`
are diff/visual lenses, which is exactly the seam this node sits *outside*. No in-repo design doc was
relied on as the analogue — `docs/architecture-review-import.md` and the approved plan are **input**
(the settled decisions), not the external counterpart.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/pocock-ica-SKILL.md` | **keep** | The 3-phase process → node body (mode `review`): Explore fan-out + deletion test; HTML candidate report (no interfaces) + Top recommendation; grilling loop with inline side-effects. Adapt the couplings (below). |
| `source-material/pocock-ica-INTERFACE-DESIGN.md` | **keep** | The Design-It-Twice fan-out → node body **mode `interface-design`** (a body branch, not a separate node — granularity rule). |
| `source-material/pocock-ica-HTML-REPORT.md` | **keep** | The candidate-card report template → node body (presentation, deliberately not doctrine). The committed `.md` record format is the house addition layered over it (artefacts-design §1). |
| `source-material/pocock-ica-LANGUAGE.md` | **edge-only** | Vocabulary + principles → already the `architecture-doctrine` **reference**; the node *references* it on-demand, never absorbs it. Co-lifted for source completeness. |
| `source-material/pocock-ica-DEEPENING.md` | **edge-only** | Dependency categories + seam discipline + replace-don't-layer → same `architecture-doctrine` reference; consumed at the grilling step via the ref. |
| `source-material/LICENSE-mattpocock-skills` | **keep** | MIT attribution; retained because verbatim sources are co-located. |

## Keep / Drop

**Kept (absorbed into body):**
- The **three phases** of mode `review`: (1) Explore — read the domain glossary + prior ADR-rejections,
  fan `explore` out to find friction organically (shallow modules, seam leakage, no-locality
  extractions, untestable parts), apply the deletion test; (2) the **candidate report** — cards with
  before/after diagrams, strength badges, dependency-category tags, Top recommendation, **no interfaces**,
  then "which would you like to explore?"; (3) the **grilling loop** on the pick.
- The **candidate-card template** and the report scaffold (Tailwind+Mermaid, the diagram patterns) —
  presentation lives in the body.
- The **mode `interface-design`** Design-It-Twice fan-out — 3+ parallel sub-agents, each a radically
  different constraint, compared by depth/locality/seam, opinionated pick — gated on an operator pick.
- The **read-only hard gate** (from the health/optimise stance, not from ICA, which is also read-only
  in its report phase but is silent on the contract).
- **enter/exit instrumentation** per the preamble (carrier `null` for a standalone run).

**Dropped (out of scope / left to the ref):**
- The deep-module **vocabulary, principles, dependency categories, replace-don't-layer** — these are
  `architecture-doctrine`'s content; the node references it, it does not restate it (the import note's
  taken-vs-left table; the doctrine ref's own scope statement).
- **Strategy decisions** and any **product-code edit** — not this node's job (read-only gate; strategy
  is the product-lens/design's concern).

**Adapted couplings (ICA's three external couplings, re-homed onto the graph — import note's table):**
- **CONTEXT.md domain glossary** → a **harness-supplied external reference** `domain-glossary`
  (`external: true, load: on-demand` — the health-manifest pointer pattern). The factory ships only the
  pointer; the harness resolves it to the product's domain glossary. The node reads domain nouns from it
  and may add a term during grilling.
- **docs/adr/ ADR coupling** → the factory's **decisions store**, written via **`invokes log-decision`**
  (the store's only writer). Load-bearing rejections become decisions so future runs don't re-suggest;
  the node reads prior rejections at phase 1 to suppress re-suggestion.
- **temp-dir throwaway report** → a **committed report pair** under the `architecture-reviews-root`
  binding (operator decision, 2026-06-10): a review report is generative + non-replayable ⇒ committed,
  per artefacts-design §1 (the D60 learnings-archive precedent), **not** `.stack-graph/`.

**Edge only (separate node):**
- **The Explore fan-out** is the existing `explore` agent — an `invokes` edge, not absorbed logic.
- **The ADR write** is the existing `log-decision` agent — an `invokes` edge.
- **Routing the accepted candidate** is `triage`'s job (it owns incremental-vs-wholesale and itself
  reaches `product-dashboard-curator`) — an `escalates` edge, not absorbed routing.

## Overlaps and seams

- **`review` / `design` lens family (the diff/design-time structural lens, `lens-maintainability`).**
  Seam: `lens-maintainability` is a **diff-time** review dimension that grounds its structural
  hunt-list in `architecture-doctrine`; `architecture-review` is the **whole-tree, operator-triggered**
  capability. Both consume the same doctrine ref (single-sourced), so the vocabulary never drifts; they
  do **not** invoke each other. No edge between them.
- **`optimise` / `health`.** Sibling standing capabilities outside any arc. `architecture-review`
  copies their shape (no `composes-into`/`precedes`/`can-follow`, hard read-only gate) but does a
  *different* job (structural deepening vs perf/AX variant-selection vs quality scoring). No edge.
- **`triage` (escalation target).** Hand-off seam: an accepted candidate **escalates** to `triage`,
  which applies the incremental-vs-wholesale route rule and reaches `product-dashboard-curator` on the
  wholesale branch. `architecture-review` never routes work directly — it hands `triage` the
  improvement and `triage` owns the route. The disposition record links the work-item id `triage`
  created. (`escalates` is one-way, cross-arc, excluded from arc traversal.)
- **`log-decision` (ADR seam).** A load-bearing rejection during grilling is offered as an ADR and
  written via `log-decision` (the decisions store's only writer); the disposition links the decision id.
- **`explore` (friction-finding seam).** The node fans `explore` out (mode `repo`, scoped) for the
  organic friction walk; the inbound invoke lives on this node's side (design.md / optimise.md
  caller-side convention; `explore` declares no inbound invoke).
- **`test-discipline`.** Adjacent doctrine: `test-discipline` owns the test-quality rubric and holds a
  back-edge to `architecture-doctrine` (the discharged forward pointer). `architecture-review` owns the
  structural-review *process*; it does not assess individual test quality. No edge.

## Fit

**One node, one primitive — confirmed.** This is a single skill that owns its own branching
(the two modes; the three phases of `review`; the per-candidate grilling) and sequencing (explore →
report → pick → grill → disposition). The two **modes are body branches**, not separate nodes
(granularity rule — neither earns a separately-measured goal that would force a split; `interface-design`
is a conditional continuation of the same capability, gated on a pick). The distinct, separately-measurable
goal — *candidate-report signal + terminal-disposition + zero premature-interface leakage* — is one
coherent job, so the boundary is right. It does **not** split: the Explore fan-out, the ADR write, and
the routing are already their own nodes (`explore`, `log-decision`, `triage`) reached by edges; absorbing
any of them would duplicate a node.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| invokes | explore | Phase 1 friction-finding fan-out (scoped, read-only `repo` mode). Caller-side convention — the inbound invoke lives here, not on `explore` (design.md / optimise.md precedent). |
| invokes | log-decision | A load-bearing rejection during grilling → an ADR into the decisions store (its only writer); makes the rejection durable so future runs don't re-suggest. |
| references | architecture-doctrine (`load: on-demand`) | The deep-module vocabulary, deletion test, dependency categories, replace-don't-layer — read at the step of need (phase-1 friction judgment + the grilling design tree). On-demand: larger, conditional, read as its own doc; the node body never restates it. |
| references | instrumentation-preamble (`load: import`) | The enter/exit emit contract, spliced in at load (must-always-be-present), as every backbone/standing node imports. |
| references | domain-glossary (`load: on-demand`, `external: true`) | The harness CONTEXT.md analogue (health-manifest external-pointer pattern). Factory ships only the pointer; the harness resolves it to the product's domain glossary. Supplies domain nouns for the cards; the node may add a term during grilling. validate/build skip it (no factory file). |
| escalates | triage | An accepted candidate (pursued) → the entry of the incremental arc; `triage` owns incremental-vs-wholesale and reaches `product-dashboard-curator` on the wholesale branch. One-way cross-arc handoff; the node never routes work directly. |

**Deliberate non-edges (settled — record so the translator does not "fix" them):**
- **NO `composes-into` / `precedes` / `can-follow`.** A standing operator-triggered capability outside
  any arc — it owns no arc-traversal position, so it declares **no process edges** (the optimise/health
  stance; no F7 exposure).
- **NO `references findings-schema`.** Candidate cards are **opportunity-shaped** (strength badge +
  dependency category + before/after) — **not** defect-shaped (P0–P3 severity / autofix_class / owner).
  Forcing the finding contract would mislabel architectural *leverage* as defects. The card shape stays
  in the node body; **no new schema reference** (single consumer — YAGNI).
- **NO `invokes product-dashboard-curator`.** That is `triage`'s downstream on the wholesale branch, not
  this node's — the node escalates to `triage` and `triage` reaches the curator. Holding the curator edge
  here would duplicate triage's contract.
- **NO edge to `lens-maintainability` / `test-discipline`.** Shared doctrine is single-sourced via the
  `architecture-doctrine` ref (each consumer references it independently); the nodes do not invoke each
  other.

**New binding (harness-side, not a node edge):** `architecture-reviews-root` — a new key in the
`bindings-contract` reference (the `learnings-archive` per-artefact-key precedent), where the committed
report pair lands. `harness-init` scaffold/validate picks it up; an instantiated harness adds the
one-line key to its `bindings.yaml` before the node first runs there. (This is the report-persistence
home, not an `edges` entry.)

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — agrees (the required pair). Confirmed.

**`goals:` as outcomes:** All three read as outcomes — candidate-report signal (a measured share, not
"writes a report"), terminal-disposition + no-resuggest (a measured disposition + re-suggestion rate,
not "grills candidates"), zero premature-interface leakage (a measured leak count, not "designs
interfaces"). No goal reads as an activity.

**Edge targets resolvable:** `explore`, `log-decision`, `triage` are existing nodes; `architecture-doctrine`
and `instrumentation-preamble` are existing refs (architecture-doctrine just authored, 2026-06-10).
**`domain-glossary` is `external: true`** — a harness-supplied pointer with **no factory file**, so
validate/build skip it (the `handbook`/`health-manifest` external-reference precedent); it resolves only
in an instantiated harness. The plan calls this F7-clean (all in-factory targets exist).

## Open questions

- **`domain-glossary` ref id + on-disk state.** The `domain-glossary` external reference does not yet
  exist as a factory pointer file in `graph/_refs/` (it is `external: true`, so validate/build skip it,
  matching `handbook`/`axis-root` which are pointers the overlay resolves). The translator should
  confirm whether the factory ships a stub pointer file (as for `handbook`) or whether `external: true`
  alone suffices — match whatever the existing external refs (`handbook`, `health-manifest`, `axis-root`)
  do, since this is the same pattern. No new design decision; a consistency check only.
- **`architecture-reviews-root` binding lands in a separate amendment.** Per the plan, the new binding
  key is added to `bindings-contract` + `harness-init` + artefacts-design §6 outside this node file. The
  node body should *name* the binding (where the report pair lands) and read it via bindings, but the
  key's authoring is not this node's job — confirm the body references the key without restating the
  contract.
- **Disposition write timing.** The `.md` record's `candidates[].disposition` is written at **grilling
  close** (pursued→work-item id from triage; rejected→decision id from log-decision; otherwise open).
  The translator should keep the HTML report immutable after the report phase — dispositions flow into
  the `.md` sibling only, "without mutating the HTML" (import note). Worth an explicit body line so the
  two artefacts don't drift.
