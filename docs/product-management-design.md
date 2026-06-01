---
title: Product management — function design (working doc)
status: working draft — 2026-06-01
---

# Product management — function design

How the **product-management function** is modelled in stack-graph: the **methodology** it runs on,
its shape, its top-level artefacts, how it couples to the engineering & design (dev-sprint) arc, and
how it **evolves with product maturity**. This is a BC-grounded working doc; the spec stays general
(no BC names in `handbook/content/`). The method mirrors the curator cell — we **reverse-engineer the
general pattern from Be Civic's already-working PM system**, grounded in established methodology.

**PM has two faces**, and the design keeps them distinct:

- **Arc A — strategy / discovery (upstream, continuous).** Develops and continually iterates the
  strategic substrate: vision, market & landscape, target users & segments, jobs-to-be-done, the
  value-proposition canvas, the business model, product strategy. Done *before* delivery and iterated
  *as evidence develops*. A genuine arc of its own.
- **Arc B — delivery coupling (downstream, per-item).** Turns that substrate into prioritised,
  shipped product. **Not** a separate arc — it rides the dev-sprint, whose interaction-heavy front
  already blends PM + eng/design. Its machinery: the roadmap (carrier source), the gates, a product
  lens into the front, the maturity dial.

Joined by the **outcome layer** (vision → objectives → north star → metrics) and the **roadmap** —
Arc A sets themes/priorities, Arc B executes items — and by **feedback** (`debrief` outcomes flow
back to reprioritise the roadmap *and* confirm/kill Arc A's hypotheses).

## Methodology — the SVPG spine + the Strategyzer engine

The function runs on two established methodologies with a clear division of labour; we do not invent
one.

- **SVPG** (Cagan — *Inspired / Empowered / Transformed*) is the **operating-model spine**:
  **Vision → Strategy → Objectives → Discovery → Delivery**, governed by **outcome over output** and
  **the four risks**, run as **dual-track** (continuous discovery alongside continuous delivery).
- **Strategyzer** (Osterwalder — BMC / VPC / *Testing Business Ideas*) is the **business-model &
  value engine + the test-and-learn discipline**: the canvases (Business Model Canvas; Value
  Proposition Canvas — jobs / pains / gains) and the **assumptions → experiment → evidence → decide**
  loop with evidence strength. This is what BC's BMD is built on.

They **nest**, not compete: SVPG is the whole frame; Strategyzer is *how the strategy + value/viability
part of discovery is done* inside it. SVPG adds the layer above (vision, objectives, north star) and
the layer below (delivery + usability/feasibility discovery — the dev-sprint).

```
SVPG operating model (spine)        method                       where it lives
──────────────────────────────────────────────────────────────────────────────────
Product VISION          ────────── SVPG ──────────────────────── Arc A (apex)
   ↓
Product STRATEGY        ────────── SVPG (insights-driven) ─────── Arc A
   ↓                               executed via Strategyzer BMC/VPC
OBJECTIVES / OKRs       ────────── SVPG ──────────────────────── outcome layer (+ north star)
   ↓
DISCOVERY — 4 risks     ────────── SVPG + Strategyzer test-and-learn
   value + viability    ────────────────────────────────────── Arc A  (VPC/BMC, assumptions, sims)
   usability + feasibility ───────────────────────────────────  Arc B front (design, prototypes, spikes)
   ↓
DELIVERY                ────────── SVPG ──────────────────────── Arc B = the dev-sprint
   ↓
OUTCOMES (metrics/KPIs) ────────── SVPG outcome>output ───────── debrief → back to OKRs + strategy
```

### The four risks reconcile the two frameworks

SVPG's four risks map onto Strategyzer's three (desirability = value + usability) and tell us *where*
each is de-risked — a discovery lens spanning both arcs:

| Risk (SVPG) | Question | De-risked in | Instrument |
|---|---|---|---|
| **Value** | will they want it? | Arc A | VPC, demand tests, **simulated users** |
| **Viability** | does it work for the business? | Arc A | BMC, assumptions testing |
| **Usability** | can they use it? | Arc B front | prototypes, user/sim testing |
| **Feasibility** | can we build it? | Arc B front | eng spike at `design`/`specify` |

**Maturity governs evidence strength** (Strategyzer's evidence ladder mapped onto the maturity
stages): discovery = assumptions + **simulated users**; validation = real interviews; scale =
analytics + experiments.

## What BC already has — the prior art we generalise

| BC asset (live) | Where | What it is | Generalises to |
|---|---|---|---|
| **BMD / Value-Proposition Canvas** (a Strategyzer instance) | `bc-workspace/bmd/` (173 hypotheses across BMC blocks + VPC sub-blocks, 41 findings, evidence sessions, `vpc/`, assessments); discipline at `handbook/.../07-workspace/04-bmd-discipline.md` | Evidence-first strategy/value-prop, post-pivot hypothesis lifecycle (invalidate/supersede, never delete), a curator | **Arc A** — the strategy/discovery arc + the canvas surface |
| **Personas** | `bc-operations/docs/user-research/profiles.md` | 10 stress-test profiles + a coverage matrix; symlinked into the test harness | The **personas surface** (Arc A output) |
| **User-simulation** | `handbook/.../06-experience/02-testing.md` (two-tier), `01-arc.md` (Experience Arc, 8 invariants), 7 failure modes, runbooks, "Imogen" replay persona | Single-agent walkthrough + three-agent judge harness, graded against a session-shape contract | The **`simulate-users` node** — the discovery-stage **evidence source** (value + usability) |
| **Roadmap** | `bc-workspace/roadmap/` (`items/<id>.md`, `backlog.md`, `sprints/`, `manifest.json`); discipline at `07-workspace/05-roadmap-discipline.md` | Items on a **12-stage lifecycle** with **tiers** (T1 fast-track / T2–T3 gated), a curator | **Arc B** — the carrier + roadmap surface + roadmap-curator |

*Gap in BC today: the explicit outcome layer (north star / OKRs / KPIs) and a stated product vision
are thin — those are the methodology elements we add.*

## The two arcs at a glance

```
  ARC A — STRATEGY / DISCOVERY  (upstream · continuous · evidence-iterated)
  vision · market · target users · jobs-to-be-done · value-prop (VPC) · business model · strategy
        │   hypothesise → gather evidence → assess/synthesise → update canvas   (loop)
        ▼   derives objectives + themes
  ═══ OUTCOME LAYER ═══  vision → OKRs → north-star → KPIs
        ▼
  ═══════ ROADMAP ═══════   (prioritised opportunities serving objectives — the carrier source)
        │   a roadmap item
        ▼
  ARC B — DELIVERY COUPLING  (per-item · rides the dev-sprint)
  align-context · design ─[gate-1]─ specify · reconcile ─[gate-2]─ plan ─[gate-3]─ build · review · land · debrief
   (front blends a PM product-lens + eng/design; reads VPC / personas / strategy; de-risks usability + feasibility)  │
        ▲                                                                                                            │
        └──── outcomes (KPIs vs OKRs) ──► roadmap reprioritise  +  Arc A confirm / kill hypotheses ──────────────────┘
```

## Arc A — the strategy / discovery arc (upstream)

**What it produces** (the strategic substrate every downstream decision builds on):

| Output | Method | Content | BC home |
|---|---|---|---|
| **Product vision** | SVPG | the 3–10yr aspiration strategy serves | *(thin in BC — to add)* |
| Product strategy | SVPG (insights) | focus · leverage · sequencing of bets | bmd assessments + strategy notes |
| Market & landscape | SVPG/Strategyzer | market, competitors, positioning, defensibility | bmd assessments (YC + Helmer) |
| Target users & segments | Strategyzer | who we serve | BMC `customer_segments` + personas |
| Jobs-to-be-done | Strategyzer | customer profile — jobs · pains · gains | VPC customer side (BC: 34 / 35 / 18) |
| Value proposition | Strategyzer | products · pain relievers · gain creators | VPC value-map side |
| Business model | Strategyzer | revenue · cost · channels · partners · resources | BMC blocks |

**The loop** (Strategyzer test-and-learn, continuous): **hypothesise** (testable claims about market /
users / jobs / value / model) → **gather evidence** (interviews · simulations · research) →
**assess / synthesise** (findings; confirm / kill / supersede / pivot — never delete; update the
canvas) → iterate. De-risks the **value** and **viability** risks. Maintained by a **strategy-curator**
(generalises `bmd-curator`). Cadence: venture-level / whenever evidence arrives.

## The outcome layer — vision to metrics (outcome over output)

The connective tissue between strategy and delivery — the SVPG principle made operational:

- **Product vision** — the apex (from Arc A).
- **Objectives / OKRs** — outcomes the roadmap serves; the bridge from strategy to roadmap items.
- **North-star metric** — the single measure of core value delivered.
- **KPIs / metrics** — instrumented outcomes; what `debrief` reports **against the OKRs** (not "shipped
  vs not"), and the *scale*-stage evidence source feeding back into Arc A.

This is what makes the loop outcome-driven: roadmap items exist to move objectives, and the feedback
seam measures whether they did.

## Arc B — the delivery coupling (downstream)

### The carrier: a roadmap item travels the whole arc

The **roadmap item is the carrier**; its `stage` field is its position in the *combined* PM +
dev-sprint arc. PM owns the front and the gates; engineering owns the middle; `debrief` closes the
loop. (Left = BC's live stages; middle = our dev-sprint stage; right = owner.)

| BC roadmap stage | Dev-sprint stage | Owner |
|---|---|---|
| idea | *(an opportunity enters the roadmap, serving an objective)* | PM |
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
| *(feeds back)* | `debrief` → measure outcomes (KPIs vs OKRs) | Eng → PM |
| parked | *(deferred)* | PM |

The **gates** are PM-owned go/no-go transitions — the generalisation of the existing `land`+gate idea.
*Ordering details to settle when amending the spec: BC folds `align-context` into "design", and puts
`reconciliation` right after `spec-pr` where our arc puts `reconcile` after `review`.*

### The shared front: PM leads, eng & design join

The interaction-heavy front (`align-context` → `design`) is **already in the dev-sprint** and is where
PM and eng/design think *together* — the gstack pattern (`office-hours` frames demand/value/user;
`autoplan` runs CEO + design + eng review). It de-risks **usability** and **feasibility**. We don't
duplicate it. PM enters two ways:

- **A product lens** — the CEO/founder/strategy review (gstack's `plan-ceo-review` analogue): *right
  problem? serves the value proposition and the target user? serves which objective?* Delivered
  **main-thread as a skill** (D36), invoked by `design`/`plan`.
- **Building on Arc A + the outcome layer** — the front **reads** the strategic substrate and the
  objective the item serves: `align-context` reads the roadmap item + personas + value-prop; `design`
  and the product lens check the solution against the VPC, strategy, and the OKR.

### Gates + maturity ladder = generalised tiers

BC already has **tiers** (T1 fast-track / T2–T3 gated; `bc-triage` recommends, operator overrides at
gates). Generalise into a two-level dial: **per-product maturity** sets the default gate rigour;
**per-item tier** overrides it.

| Maturity stage | Direction from | Default tier / gates | Arc-A evidence source |
|---|---|---|---|
| **Discovery** (founder-led) — *BC now* | intuition + domain understanding | T1 fast-track; gates **advisory** | simulated users + founder conviction |
| **Validation** (first users) | observed user problems | T2; gates need qualitative signal | real interviews / evidence sessions |
| **Scale** (mature) | analytics + behaviour | T2/T3; gates need metric movement | analytics, experiments / A-B |

At discovery, the default is fast-track and gates are advisory — a pre-launch product is **not slowed
by evidence-gating**. Maturity is **harness-local per-product state** (a field a node reads via
bindings); it may later generalise to the dev-sprint itself (maturity-appropriate QA/canary rigour).

## Entry / orientation is a harness concern, not a node

"orient" is **not a graph node**. Two different things were being conflated:

- **Session orientation** (per-launch): the org-root `CLAUDE.md` (handbook-index pointer + how to use
  the graph + bindings), ambient skill descriptions, the handbook index. **Harness instructions**,
  captured in the directory topology — not a node.
- **Task context** (per-task): `align-context` — the dev-sprint node that gathers context for a
  specific item (uses `explore`). This *is* a node, and already exists.

## Top-level artefacts (the surfaces)

Each is a **workspace surface** maintained by a curator (the D40 cell tuned per surface):

| Surface | Holds | Arc | Churn | Curator / gate |
|---|---|---|---|---|
| **Strategy / canvas** | vision, VPC (JTBD + value map), business model, market & strategy | A | low–med | strategy-curator, evidence-first |
| **Objectives / metrics** | OKRs, north star, KPIs | outcome layer | med | light; set by Arc A, read by `debrief` |
| **Personas** | target-user profiles + coverage | A | low | light; mostly read |
| **Experience contract + sims** | session-shape invariants, scenarios, graded runs | A (evidence) | med | the `simulate-users` node reads it |
| **Roadmap** | items (stage + tier), backlog, sprints | B | high | roadmap-curator, **light** gate |

## How the two arcs connect

| Seam | From → To | What flows |
|---|---|---|
| Strategy → objectives | Arc A → outcome layer | strategy sets **OKRs + north star** |
| Objectives → roadmap | outcome layer → roadmap | items are framed as **opportunities serving an objective** |
| Roadmap item → front | roadmap → Arc B front | `align-context`/`design` **read** VPC / personas / strategy / the OKR |
| Gate evidence | `simulate-users` / signal → gate | the maturity-appropriate evidence informs the go/no-go |
| Outcomes back | `debrief` → roadmap **and** Arc A | KPIs vs OKRs → reprioritise; **confirm / kill** strategy hypotheses |

## Build now vs defer (for BC)

**Build now** (the operator's stated needs + the interface priority), by arc:

- **Arc A:** the VPC / value-proposition definition + maintenance, **personas / JTBD**, and
  **`simulate-users`** (the discovery-stage evidence source); the **strategy-curator** (light,
  evidence-first); a stated **product vision**.
- **Outcome layer:** define the **north star + OKR structure** (so items can serve objectives) —
  light; full KPI instrumentation is deferred.
- **Arc B:** the **roadmap-curator** + item lifecycle / gates / tiers; the **carrier + dev-sprint
  stage mapping** (the interface, implemented; `debrief` writes the outcome back); the **maturity /
  tier dial** defaulted to discovery; the **product-lens** skill into the front; the **four-risks
  lens** as a discovery checklist.

**Design + TODO** (deferred; edges parked per F7):

- Arc A: the **real-interview / evidence-session** node (validation); **analytics-driven** discovery +
  experiments (scale); the full **BMD hypothesis-graph** as graph nodes.
- Outcome layer: **KPI / metrics instrumentation** + automated OKR scoring.
- Arc B: **heavier gates**; **maturity applied to the dev-sprint** (QA/canary rigour).

## Behaviour contract (native / built / convention)

- **Native:** `gh` PRs + git (curators, gates as labelled PRs); skills/agents ambient; `CLAUDE.md`
  cascade (orientation); `Read` is path-agnostic (nodes read artefacts/bindings).
- **Built:** the curators (strategy + roadmap + persona); the **carrier stage-sync** (item stage ↔
  dev-sprint stage); the **gate** construct; the **maturity/tier dial**; `simulate-users`; the
  outcome-layer surfaces' renderers.
- **Convention:** nodes must be **authored** to read the roadmap item / personas / VPC / strategy /
  OKR via bindings, and to read the maturity stage; the four-risks lens is a prompt discipline, not
  magic. Verified in `validate`.

## Generalisation → the general spec

| BC-concrete here | General concept | Spec home (proposed) |
|---|---|---|
| BMD/VPC + bmd-curator, SVPG framing | PM = **SVPG operating-model spine + Strategyzer engine**, two arcs (strategy/discovery + delivery coupling) | `01-concepts` + `07-decomposition` (**D43**) |
| roadmap item with a 12-stage lifecycle | a **carrier** whose `stage` advances along the arc | `01-concepts` + `02-graph-spec` (**D44**) |
| T1/T2/T3 tiers + founder-led posture | the **maturity ladder** (per-product) × **tier** (per-item) rigour dial | `01-concepts` + `04-harness` (**D45**) |
| vision / OKRs / north star / KPIs | the **outcome layer** — outcome over output; what `debrief` measures | `01-concepts` + `06-analytics` |
| the four big risks | a **discovery lens** (value/usability/feasibility/viability) spanning the arcs | `07-decomposition` + `01-concepts` |
| office-hours / CEO review feeding the front | a **product lens** (skill) into the shared front | `07-decomposition` + `01-concepts` |
| roadmap / strategy / personas surfaces + curators | the **surface + curator family** (D40 tuned per surface) | `04-harness` + `05-maintenance-skill` |
| two-tier simulation vs the Experience Arc | **`simulate-users`** against a harness-local experience contract + personas | `07-decomposition` (node) + `04-harness` (the contract) |
| session-start orientation | **orientation = harness instructions**, not a node | `04-harness` / directory topology |

## Open / next

- **Translate to the graph** — the next step now that methodology is grounded: which elements are
  nodes (`simulate-users`, the discovery loop, the curators, the product lens), surfaces/artefacts
  (vision, canvas, OKRs, north star), lenses/principles (the four risks, outcome-over-output), or
  harness state (maturity stage, north-star definition).
- **Arc A node breakdown** — confirm `hypothesise → gather → assess → canvas` as the backbone; whether
  market/landscape and strategy/positioning are their own steps or canvas sections.
- **Reconcile two ordering details**: `align-context` fold; `reconcile` position.
- **Product-lens node breakdown** — one skill, or PM content inside `align-context`/`design` + a
  `plan`-stage CEO review? Lean to a small skill (D36).
- **`simulate-users` shape** — multi-agent (persona + assistant + judge); whether it **crystallises**
  product-specific scenarios (D35) or just reads a harness contract.
- **Strategy-curator vs roadmap-curator** — one curator cell parameterised per surface vs. variants.
- **Carrier vs. the static `composes-into dev-sprint` edges** — runtime unit vs static structure;
  keep distinct in the spec.
- **founder-ops interaction** — how a peer workspace injects personal context into PM (later).
