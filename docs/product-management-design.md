---
title: Product management — function design (working doc)
status: working draft — 2026-06-01
---

# Product management — function design

How the **product-management function** is modelled in stack-graph: its shape, its top-level
artefacts, how it couples to the engineering & design (dev-sprint) arc, and how it **evolves with
product maturity**. This is a BC-grounded working doc; the spec stays general (no BC names in
`handbook/content/`). The method mirrors the curator cell — we **reverse-engineer the general
pattern from Be Civic's already-working PM system**, not invent one.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `01-concepts` | Arcs / functions | **amend** — a function is process(es)/lens(es) over the graph; PM specifically is *artefacts + a lens into the shared front + gates*, **not** a siloed parallel arc. Introduce the **maturity ladder** concept. |
| `02-graph-spec` | Edges, node schema | **confirm/extend** — the model must express the **carrier** (a work-item whose `stage` advances along the arc), the **gate** construct, and a product **lens** node. |
| `04-harness-spec` | Functions, the workspace, directory topology | **amend** — PM **surfaces** (roadmap, value/BMC canvas, personas), a **curator per surface**, the **maturity stage** as harness-local per-product state, and session **orientation** instructions (the "orient" entry). |
| `06-analytics` | The loop, outcome measurement | **amend** — `debrief` writes outcomes back to the carrier; gate evidence; maturity-aware metrics. |
| `07-decomposition` | Choosing the primitive | **amend** — product lens = skill (D36 reasoning); user-simulation = agent; curators = skills; the gate as a stage-transition. |
| `05-maintenance-skill` (or a new canon page) | Curator family | **extend** — the roadmap / value-prop / persona curators generalise the curator cell (D40), tuned per surface. |

## Stance

- **Generalise BC's working system.** BC already runs a deployed, disciplined PM stack (roadmap +
  business-model discovery + personas + user-simulation). The PM pack generalises it, exactly as
  the curator cell was reverse-engineered from `bc-handbook-curator`.
- **PM is not a siloed arc.** The interaction-heavy *front* of the dev-sprint (`align-context` →
  `design`) already blends product-management and engineering/design thinking — the way gstack does
  it (`office-hours` → `autoplan` = CEO + design + eng review). We do **not** rebuild that front as a
  parallel PM pipeline. PM-the-function is: **(a)** maintained artefacts + their curators, **(b)** a
  **product lens** into the shared front, **(c)** the **gates** + the **maturity dial**.
- **Maturity is first-class.** The same function behaves differently as a product matures
  (founder-led discovery → first-users validation → analytics-driven scale). BC is at **discovery**;
  the design must not force evidence-gating on a pre-launch product.

## What BC already has — the prior art we generalise

| BC asset (live) | Where | What it is | Generalises to |
|---|---|---|---|
| **Roadmap** | `bc-workspace/roadmap/` (`items/<id>.md`, `backlog.md`, `sprints/`, `manifest.json`); discipline at `handbook/.../07-workspace/05-roadmap-discipline.md` | Items on a **12-stage lifecycle** with **tiers** (T1 fast-track / T2–T3 gated), a curator, sprint history | The **carrier + the roadmap surface + the roadmap-curator** |
| **BMD / Value-Proposition Canvas** | `bc-workspace/bmd/` (173 hypotheses, 41 findings, evidence sessions, `vpc/`); discipline at `07-workspace/04-bmd-discipline.md` | Evidence-first business-model + value-prop, post-pivot lifecycle (invalidate/supersede, never delete) | The **value/BMC-canvas surface + its curator** |
| **Personas** | `bc-operations/docs/user-research/profiles.md` | 10 stress-test profiles + a coverage matrix; symlinked into the test harness | The **personas surface** (harness-local content; a general "maintain personas" capability) |
| **User-simulation** | `handbook/.../06-experience/02-testing.md` (two-tier), `01-arc.md` (Experience Arc, 8 invariants), 7 failure modes, runbooks, "Imogen" replay persona | Single-agent walkthrough + three-agent judge harness, graded against a session-shape contract | The **`simulate-users` node** (the discovery-stage `validate` evidence source) |

## The model

### 1 — The carrier: a roadmap item travels the whole arc

There is no "brief handed across a wall." The **roadmap item is the carrier**; its `stage` field is
its position in the *combined* PM + dev-sprint arc. PM owns the front and the gates; engineering owns
the middle; `debrief` closes the loop back to PM. (Left = BC's live stages; middle = our dev-sprint
stage; right = owner.)

| BC roadmap stage | Dev-sprint stage | Owner |
|---|---|---|
| idea | *(PM: an opportunity enters the roadmap)* | PM |
| design | `align-context` + `design` | **shared** |
| **gate-1** | *go/no-go: commit to spec* | **PM gate** |
| spec-pr | `specify` | Eng |
| reconciliation | `reconcile` | Eng |
| **gate-2** | *go/no-go: commit to build* | **PM/operator gate** |
| build-plan | `plan` | Eng |
| **gate-3** | *go/no-go: start building* | **operator gate** |
| building | `build` | Eng |
| review-qa | `review` (+ `qa`) | Eng |
| shipped → live | `land` (ship → deploy → canary) | Eng/Ops |
| *(feeds back)* | `debrief` → measure outcomes | Eng → PM |
| parked | *(deferred)* | PM |

The **gates** are PM-owned go/no-go transitions interspersed in the arc — the generalisation of the
existing `land`+gate idea. *Ordering details to settle when amending the spec: BC folds
`align-context` into "design", and positions `reconciliation` right after `spec-pr` where our arc
puts `reconcile` after `review`. Minor; resolved at amendment.*

### 2 — The shared front: PM leads, eng & design join

The interaction-heavy front (`align-context` → `design`) is **already in the dev-sprint** and is
where PM and eng/design think *together* — the gstack pattern (`office-hours` frames demand/value/
user; `autoplan` runs CEO + design + eng review). We don't duplicate it. PM enters the front two ways:

- **A product lens** — the CEO/founder/strategy review (gstack's `plan-ceo-review` analogue): *is this
  the right problem? does it serve the value proposition and the target user? where does it sit on the
  roadmap?* Delivered **main-thread as a skill** (per D36: interaction-heavy judgment is a skill, not
  an isolated agent-lens), invoked by `design`/`plan`. `align-context` already carries the
  office-hours-style framing.
- **Building on the artefacts** — the front **reads** the PM artefacts so its thinking is grounded:
  `align-context` reads the roadmap item (the *why*) + personas (the *who*) + value-prop (the *bet*);
  `design` and the product lens check the solution against them.

So PM's "process" at the front is the dev-sprint's existing front stages, made to build on the PM
substrate — not a new arc.

### 3 — Maturity ladder = generalised tiers

BC already has **tiers** (T1 fast-track / T2–T3 gated; `bc-triage` recommends, operator overrides at
gates). Generalise that into a two-level dial: **per-product maturity** sets the default rigour and
which evidence source feeds the gates; **per-item tier** overrides it.

| Maturity stage | Direction from | Default tier / gates | Evidence source (the `validate` step) |
|---|---|---|---|
| **Discovery** (founder-led) — *BC now* | intuition + domain understanding | T1 fast-track; gates **advisory** | **simulated users** + founder conviction |
| **Validation** (first users) | observed user problems | T2; gates need qualitative signal | real interviews / evidence sessions |
| **Scale** (mature) | analytics + behaviour | T2/T3; gates need metric movement | analytics, experiments / A-B |

At discovery, the default is fast-track, simulation is the evidence, and gates are advisory — so a
pre-launch product is **not slowed by evidence-gating**. The dial is built once; maturity only
changes its setting. The per-item tier is the escape hatch (urgent → fast-track even at scale; risky
→ gated even in discovery). Maturity is **harness-local per-product state** (a field a node reads via
bindings), and may later generalise to the dev-sprint itself (maturity-appropriate QA/canary rigour)
— noted as a generalisation candidate, out of scope now.

### 4 — Artefacts + curators (the PM substrate)

PM's top-level artefacts are **workspace surfaces**, each maintained by a curator (the D40 cell tuned
per surface) with a graduation gate sized to its churn:

| Surface | Holds | Churn | Curator / gate |
|---|---|---|---|
| **Roadmap** | items (stage + tier), backlog, sprints | high | roadmap-curator, **light** gate |
| **Value / BMC canvas** | value proposition, business model, strategy | low | bmd/value-curator, heavier but infrequent |
| **Personas** | target-user profiles + coverage | low | light; mostly read |
| **Experience contract + sims** *(discovery validate)* | session-shape invariants, scenarios, graded runs | medium | the `simulate-users` node reads it |

### 5 — Entry / orientation is a harness concern, not a node

"orient" is **not a graph node**. Two different things were being conflated:

- **Session orientation** (per-launch): when Claude starts at the org root, how it builds context —
  the org-root `CLAUDE.md` (handbook-index pointer + how to use the graph + bindings), the ambient
  skill descriptions, the handbook index. This is **harness instructions**, captured in the directory
  topology — not a node.
- **Task context** (per-task): `align-context` — the dev-sprint node that gathers context for a
  specific piece of work (uses `explore`). This *is* a node, and already exists.

PM's relevance: a session typically *orients* (harness) and then enters the *interaction-heavy front*
(`align-context`/`design`), which is where PM leads. The two stay distinct.

## The PM loop, grounded — and what to build now

The conceptual loop, mapped to where it actually lives (artefact-maintenance, the shared front, or
existing nodes) and tagged for BC:

| Loop step | Lives in | Build status (BC) |
|---|---|---|
| **sense** — gather signals | artefact maintenance + `explore` | partial now (simulation + founder) |
| **frame** — opportunities, value-prop, personas | value/persona curators + the product lens | **now** (generalise value-prop + personas) |
| **prioritise** — items, backlog, sprints, tiers | roadmap-curator | **now** |
| **define** — reach gate-1 (spec-ready) | the shared front (`align-context`/`design`) + gate-1 | **now** (the gate + the carrier contract) |
| **validate** — test the bet | `simulate-users` (discovery) | **now** (simulation only) |
| **learn** — outcomes → reprioritise / confirm-kill hypotheses | `debrief` + curator write-back | design now, light impl |

### Build now (BC's stated needs + the interface priority)

- The **roadmap-curator** + the **item lifecycle / gates / tiers** (generalised from BC).
- The **carrier model + the dev-sprint stage mapping** — the interface, implemented (an item's stage
  advances as it traverses the dev-sprint; `debrief` writes its outcome back).
- The **maturity / tier dial**, defaulted to discovery.
- Generalise **value-prop, personas, and `simulate-users`** (the `frame` + `validate` machinery).
- The **product lens** skill into the front (CEO/strategy review), building on the artefacts.

### Design + TODO (deferred; edges parked per F7)

- The **real-interview / evidence-session** node (validation stage).
- **Analytics-driven iteration + experiments** (scale stage).
- **Heavier gates**; the full **BMD-hypothesis system** as graph nodes (BC has it as content today).
- **Maturity applied to the dev-sprint** (QA/canary rigour) — a generalisation candidate.

## Artefact interactions with the dev-sprint

The point of "build on the artefacts" — which stage reads or writes which PM artefact:

| Dev-sprint stage | Reads | Writes |
|---|---|---|
| `align-context` | roadmap item, personas, value-prop | — |
| `design` (+ product lens) | value-prop, personas | refines the item |
| gate-1/2/3 | the design, product-lens verdict, (discovery) sim results | advances/parks the item |
| `simulate-users` (validate) | personas, experience contract | graded findings → gate / debrief |
| `debrief` | shipped outcome, metrics | item outcome + status; confirm/kill hypotheses; persona learnings |

## Behaviour contract (native / built / convention)

Mirrors the be-civic design's split — where "wanted" comes free vs. where we build:

- **Native:** `gh` PRs + git (curators, gates as labelled PRs); skills/agents ambient; `CLAUDE.md`
  cascade (orientation); `Read` is path-agnostic (nodes read artefacts/bindings).
- **Built:** the curators; the **carrier stage-sync** (item stage ↔ dev-sprint stage); the **gate**
  construct; the **maturity/tier dial**; `simulate-users`; the surfaces' renderers (workspace).
- **Convention:** nodes must be **authored** to read the roadmap item / personas / value-prop via
  bindings; the maturity stage is a field a node reads, not magic. Verified in `validate`.

## Generalisation → the general spec

| BC-concrete here | General concept | Spec home (proposed) |
|---|---|---|
| roadmap item with a 12-stage lifecycle | a **carrier** whose `stage` advances along the arc | `01-concepts` + `02-graph-spec` (D43) |
| gate-1/2/3 | **gates** = PM-owned go/no-go stage transitions | `01-concepts` + `07-decomposition` |
| T1/T2/T3 tiers + founder-led posture | the **maturity ladder** (per-product) × **tier** (per-item) rigour dial | `01-concepts` + `04-harness` (D44) |
| office-hours / CEO review feeding the front | a **product lens** (skill) into the shared front; the front blends PM + eng | `07-decomposition` + `01-concepts` |
| roadmap / BMD / personas surfaces + curators | the **surface + curator family** (D40 tuned per surface) | `04-harness` + `05-maintenance-skill` |
| two-tier simulation vs the Experience Arc | **`simulate-users`** against a harness-local experience contract + personas | `07-decomposition` (node) + `04-harness` (the contract) |
| session-start orientation | **orientation = harness instructions** (CLAUDE.md + index + bindings), not a node | `04-harness` / directory topology |
| `debrief` updates the roadmap + hypotheses | the **outcome write-back** closes the loop | `06-analytics` |

## Open / next

- **Reconcile two ordering details** (above): `align-context` fold into "design"; `reconcile`
  position. Decide when amending `01-concepts`/`02-graph-spec`.
- **Product-lens node breakdown** — one skill, or PM-flavoured content inside `align-context`/`design`
  + a `plan`-stage CEO review? Lean to a small skill (D36), but confirm at build.
- **`simulate-users` shape** — likely a multi-agent node (persona-agent + assistant + judge); whether
  it **crystallises** product-specific scenarios (D35) or just reads a harness contract — decide at
  build.
- **Curator-family generalisation** — confirm one cell parameterised per surface (repo/label/root +
  gate weight) vs. per-surface variants.
- **Carrier vs. the existing `composes-into dev-sprint` edges** — the carrier is the *runtime* unit
  travelling the arc; the graph edges are the *static* structure. Make sure the spec distinguishes
  them cleanly.
- **founder-ops interaction** — how a peer workspace injects personal context into PM (later;
  tracked in the be-civic design doc).
