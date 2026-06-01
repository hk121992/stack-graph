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

**PM has two faces**, and the design keeps them distinct:

- **Arc A — strategy / discovery (upstream, continuous).** Develops and continually iterates the
  strategic substrate: market & landscape, target users & segments, jobs-to-be-done, the
  value-proposition canvas, the business model, product strategy. Done *before* delivery and
  iterated *as evidence develops*. A genuine arc of its own.
- **Arc B — delivery coupling (downstream, per-item).** Turns that substrate into prioritised,
  shipped product. **Not** a separate arc — it rides the dev-sprint, whose interaction-heavy front
  already blends PM + eng/design. Its machinery: the roadmap (carrier source), the gates, a product
  lens into the front, the maturity dial.

The two are joined by the **roadmap** (Arc A sets themes/priorities → Arc B executes items) and by
**feedback** (`debrief` outcomes flow back to reprioritise the roadmap *and* confirm/kill Arc A's
hypotheses).

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `01-concepts` | Arcs / functions | **amend** — a function is process(es)/lens(es) over the graph; PM = an upstream **strategy/discovery arc** + a downstream **delivery coupling** (not a siloed delivery arc). Introduce the **maturity ladder**. |
| `02-graph-spec` | Edges, node schema | **confirm/extend** — express the **carrier** (a work-item whose `stage` advances), the **gate** construct, the strategy-arc **hypothesis/evidence** entities, and a product **lens** node. |
| `04-harness-spec` | Functions, the workspace, directory topology | **amend** — PM **surfaces** (strategy/canvas, roadmap, personas), a **curator per surface**, the **maturity stage** as harness-local per-product state, and session **orientation** instructions (the "orient" entry). |
| `06-analytics` | The loop, outcome measurement | **amend** — `debrief` writes outcomes back to the carrier *and* to strategy hypotheses; gate evidence; maturity-aware metrics. |
| `07-decomposition` | Choosing the primitive | **amend** — product lens = skill (D36); `simulate-users` = agent; curators = skills; the gate as a stage-transition; the evidence-first discovery loop. |
| `05-maintenance-skill` (or a new canon page) | Curator family | **extend** — the strategy / roadmap / persona curators generalise the curator cell (D40), tuned per surface (evidence-first for strategy). |

## Stance

- **Generalise BC's working system.** BC already runs a deployed, disciplined PM stack — roadmap
  (Arc B) + business-model discovery / VPC (Arc A) + personas + user-simulation. The PM pack
  generalises it, exactly as the curator cell was reverse-engineered from `bc-handbook-curator`.
- **Two faces, kept distinct** (above): an upstream strategy/discovery arc, a downstream delivery
  coupling that rides the dev-sprint rather than duplicating it.
- **Maturity is first-class.** The same function behaves differently as a product matures
  (founder-led discovery → first-users validation → analytics-driven scale): maturity governs the
  **evidence source** in Arc A and the **gate rigour** in Arc B. BC is at **discovery** — the design
  must not force evidence-gating on a pre-launch product.

## What BC already has — the prior art we generalise

| BC asset (live) | Where | What it is | Generalises to |
|---|---|---|---|
| **BMD / Value-Proposition Canvas** | `bc-workspace/bmd/` (173 hypotheses across BMC blocks + VPC sub-blocks, 41 findings, evidence sessions, `vpc/`, assessments); discipline at `handbook/.../07-workspace/04-bmd-discipline.md` | Evidence-first strategy/value-prop, post-pivot hypothesis lifecycle (invalidate/supersede, never delete), a curator | **Arc A** — the strategy/discovery arc + the canvas surface |
| **Personas** | `bc-operations/docs/user-research/profiles.md` | 10 stress-test profiles + a coverage matrix; symlinked into the test harness | The **personas surface** (Arc A output) |
| **User-simulation** | `handbook/.../06-experience/02-testing.md` (two-tier), `01-arc.md` (Experience Arc, 8 invariants), 7 failure modes, runbooks, "Imogen" replay persona | Single-agent walkthrough + three-agent judge harness, graded against a session-shape contract | The **`simulate-users` node** — the discovery-stage **evidence source** for Arc A |
| **Roadmap** | `bc-workspace/roadmap/` (`items/<id>.md`, `backlog.md`, `sprints/`, `manifest.json`); discipline at `07-workspace/05-roadmap-discipline.md` | Items on a **12-stage lifecycle** with **tiers** (T1 fast-track / T2–T3 gated), a curator | **Arc B** — the carrier + roadmap surface + roadmap-curator |

## The two arcs at a glance

```
  ARC A — STRATEGY / DISCOVERY  (upstream · continuous · evidence-iterated)
  market · target users · jobs-to-be-done · value-prop (VPC) · business model · strategy
        │   hypothesise → gather evidence → assess/synthesise → update canvas   (loop)
        ▼   derives themes & priorities
  ═════════ ROADMAP ═════════   (prioritised opportunities — the carrier source)
        │   a roadmap item
        ▼
  ARC B — DELIVERY COUPLING  (per-item · rides the dev-sprint)
  align-context · design ─[gate-1]─ specify · reconcile ─[gate-2]─ plan ─[gate-3]─ build · review · land · debrief
   (front blends a PM product-lens + eng/design; reads VPC / personas / strategy)              │
        ▲                                                                                       │
        └──────── outcomes ──► roadmap reprioritise  +  Arc A confirm / kill hypotheses ────────┘
```

Two clocks: Arc A iterates at venture cadence (or whenever evidence arrives); Arc B runs per item.

## Arc A — the strategy / discovery arc (upstream)

**What it produces** (the strategic substrate every downstream decision builds on):

| Output | Content | BC home |
|---|---|---|
| Market & landscape | who the market is, competitors, positioning, defensibility | bmd assessments (YC + Helmer) |
| Target users & segments | who we serve | BMC `customer_segments` + personas |
| Jobs-to-be-done | the customer profile — jobs · pains · gains | VPC customer side (BC: 34 jobs / 35 pains / 18 gains) |
| Value proposition | products, pain relievers, gain creators | VPC value-map side |
| Business model | revenue · cost · channels · partners · resources | BMC blocks |
| Product strategy | the synthesised direction / wedge / sequencing | bmd assessments + strategy notes |

**The loop** (evidence-first, continuous): **hypothesise** (frame testable claims about market /
users / jobs / value / model) → **gather evidence** (interviews · simulations · research) →
**assess / synthesise** (findings; confirm / kill / supersede / pivot — never delete; update the
canvas) → iterate. This is BC's BMD discipline, generalised; maintained by a **strategy-curator**
(generalises `bmd-curator`).

**Maturity governs the evidence source** — this is the "done before, continually iterated as
evidence develops" the operator wants:

- **Discovery** (BC now): hypotheses sourced from **founder intuition + domain understanding**;
  evidence from **simulated users** (the `simulate-users` node) — you don't yet have real ones.
- **Validation**: evidence from **real interviews / evidence sessions** (BC's `ES-*`).
- **Scale**: evidence from **analytics + behavioural signal + experiments**.

The canvas is *always live*; what changes with maturity is how strongly each hypothesis is evidenced.

## Arc B — the delivery coupling (downstream)

### The carrier: a roadmap item travels the whole arc

The **roadmap item is the carrier**; its `stage` field is its position in the *combined* PM +
dev-sprint arc. PM owns the front and the gates; engineering owns the middle; `debrief` closes the
loop. (Left = BC's live stages; middle = our dev-sprint stage; right = owner.)

| BC roadmap stage | Dev-sprint stage | Owner |
|---|---|---|
| idea | *(an opportunity enters the roadmap, derived from Arc A)* | PM |
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

The **gates** are PM-owned go/no-go transitions — the generalisation of the existing `land`+gate
idea. *Ordering details to settle when amending the spec: BC folds `align-context` into "design",
and positions `reconciliation` right after `spec-pr` where our arc puts `reconcile` after `review`.*

### The shared front: PM leads, eng & design join

The interaction-heavy front (`align-context` → `design`) is **already in the dev-sprint** and is
where PM and eng/design think *together* — the gstack pattern (`office-hours` frames demand/value/
user; `autoplan` runs CEO + design + eng review). We don't duplicate it. PM enters two ways:

- **A product lens** — the CEO/founder/strategy review (gstack's `plan-ceo-review` analogue):
  *is this the right problem? does it serve the value proposition and the target user? where does it
  sit on the roadmap?* Delivered **main-thread as a skill** (per D36), invoked by `design`/`plan`.
- **Building on Arc A's artefacts** — the front **reads** the strategic substrate: `align-context`
  reads the roadmap item + personas + value-prop; `design` and the product lens check the solution
  against the VPC and strategy.

### Gates + maturity ladder = generalised tiers

BC already has **tiers** (T1 fast-track / T2–T3 gated; `bc-triage` recommends, operator overrides at
gates). Generalise into a two-level dial: **per-product maturity** sets the default gate rigour;
**per-item tier** overrides it.

| Maturity stage | Direction from | Default tier / gates | Arc-A evidence source |
|---|---|---|---|
| **Discovery** (founder-led) — *BC now* | intuition + domain understanding | T1 fast-track; gates **advisory** | simulated users + founder conviction |
| **Validation** (first users) | observed user problems | T2; gates need qualitative signal | real interviews / evidence sessions |
| **Scale** (mature) | analytics + behaviour | T2/T3; gates need metric movement | analytics, experiments / A-B |

At discovery, the default is fast-track, gates are advisory — so a pre-launch product is **not slowed
by evidence-gating**. The dial is built once; maturity only changes its setting. Maturity is
**harness-local per-product state** (a field a node reads via bindings), and may later generalise to
the dev-sprint itself (maturity-appropriate QA/canary rigour) — a candidate, out of scope now.

## Entry / orientation is a harness concern, not a node

"orient" is **not a graph node**. Two different things were being conflated:

- **Session orientation** (per-launch): the org-root `CLAUDE.md` (handbook-index pointer + how to
  use the graph + bindings), the ambient skill descriptions, the handbook index. **Harness
  instructions**, captured in the directory topology — not a node.
- **Task context** (per-task): `align-context` — the dev-sprint node that gathers context for a
  specific item (uses `explore`). This *is* a node, and already exists.

## Top-level artefacts (the surfaces)

Each is a **workspace surface** maintained by a curator (the D40 cell tuned per surface):

| Surface | Holds | Arc | Churn | Curator / gate |
|---|---|---|---|---|
| **Strategy / canvas** | VPC (JTBD + value map), business model, market & strategy | A | low–med | strategy-curator, evidence-first |
| **Personas** | target-user profiles + coverage | A | low | light; mostly read |
| **Experience contract + sims** | session-shape invariants, scenarios, graded runs | A (evidence) | med | the `simulate-users` node reads it |
| **Roadmap** | items (stage + tier), backlog, sprints | B | high | roadmap-curator, **light** gate |

## How the two arcs connect

| Seam | From → To | What flows |
|---|---|---|
| Strategy → roadmap | Arc A → roadmap | strategy/VPC derive **themes & priorities**; opportunities enter as items |
| Roadmap item → front | roadmap → Arc B front | `align-context`/`design` **read** VPC / personas / strategy |
| Gate evidence | `simulate-users` / signal → gate | the maturity-appropriate evidence informs the go/no-go |
| Outcomes back | `debrief` → roadmap **and** Arc A | reprioritise the roadmap; **confirm / kill** strategy hypotheses; persona learnings |

## Build now vs defer (for BC)

**Build now** (the operator's stated needs + the interface priority), by arc:

- **Arc A:** the VPC / value-proposition definition + maintenance, **personas / JTBD**, and
  **`simulate-users`** (the discovery-stage evidence source); the **strategy-curator** (light,
  evidence-first).
- **Arc B:** the **roadmap-curator** + item lifecycle / gates / tiers; the **carrier + dev-sprint
  stage mapping** (the interface, implemented — an item's stage advances as it traverses the sprint,
  and `debrief` writes its outcome back); the **maturity / tier dial** defaulted to discovery; the
  **product-lens** skill into the front.

**Design + TODO** (deferred; edges parked per F7):

- Arc A: the **real-interview / evidence-session** node (validation); **analytics-driven** discovery
  + experiments (scale); the full **BMD hypothesis-graph** as graph nodes (BC has it as content).
- Arc B: **heavier gates**; **maturity applied to the dev-sprint** (QA/canary rigour).

## Behaviour contract (native / built / convention)

- **Native:** `gh` PRs + git (curators, gates as labelled PRs); skills/agents ambient; `CLAUDE.md`
  cascade (orientation); `Read` is path-agnostic (nodes read artefacts/bindings).
- **Built:** the curators (strategy + roadmap + persona); the **carrier stage-sync** (item stage ↔
  dev-sprint stage); the **gate** construct; the **maturity/tier dial**; `simulate-users`; the
  surfaces' renderers (workspace).
- **Convention:** nodes must be **authored** to read the roadmap item / personas / VPC / strategy via
  bindings, and to read the maturity stage; not magic. Verified in `validate`.

## Generalisation → the general spec

| BC-concrete here | General concept | Spec home (proposed) |
|---|---|---|
| BMD / VPC discovery loop + bmd-curator | the **strategy/discovery arc** (Arc A) — evidence-first, curator-maintained | `01-concepts` + `07-decomposition` (**D43**) |
| roadmap item with a 12-stage lifecycle | a **carrier** whose `stage` advances along the arc | `01-concepts` + `02-graph-spec` (**D44**) |
| T1/T2/T3 tiers + founder-led posture | the **maturity ladder** (per-product) × **tier** (per-item) rigour dial | `01-concepts` + `04-harness` (**D45**) |
| office-hours / CEO review feeding the front | a **product lens** (skill) into the shared front; the front blends PM + eng | `07-decomposition` + `01-concepts` |
| roadmap / strategy / personas surfaces + curators | the **surface + curator family** (D40 tuned per surface) | `04-harness` + `05-maintenance-skill` |
| two-tier simulation vs the Experience Arc | **`simulate-users`** against a harness-local experience contract + personas | `07-decomposition` (node) + `04-harness` (the contract) |
| session-start orientation | **orientation = harness instructions** (CLAUDE.md + index + bindings), not a node | `04-harness` / directory topology |
| `debrief` updates roadmap + hypotheses | the **outcome write-back** closes both loops | `06-analytics` |

## Open / next

- **Flesh out Arc A's stages/nodes** — the operator flagged "etc." here: confirm the hypothesise →
  gather → assess loop's node breakdown, and whether market/landscape and strategy/positioning are
  their own steps or canvas sections.
- **Reconcile two ordering details** (above): `align-context` fold; `reconcile` position.
- **Product-lens node breakdown** — one skill, or PM content inside `align-context`/`design` + a
  `plan`-stage CEO review? Lean to a small skill (D36); confirm at build.
- **`simulate-users` shape** — multi-agent (persona + assistant + judge); whether it **crystallises**
  product-specific scenarios (D35) or just reads a harness contract.
- **Strategy-curator vs roadmap-curator** — confirm one curator cell parameterised per surface
  (repo/label/root + gate weight + evidence discipline) vs. per-surface variants.
- **Carrier vs. the static `composes-into dev-sprint` edges** — the carrier is the *runtime* unit
  travelling the arc; the edges are the *static* structure. Keep them distinct in the spec.
- **founder-ops interaction** — how a peer workspace injects personal context into PM (later).
