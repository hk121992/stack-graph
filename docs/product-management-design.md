---
title: Product management — function design (working doc)
status: working draft — 2026-06-01
---

# Product management — function design

How the **product-management function** is modelled in stack-graph: the **methodology** it runs on,
its shape, its top-level artefacts, how it couples to the engineering & design (dev-sprint), and
how it **evolves with product maturity**. This is a BC-grounded working doc; the spec stays general
(no BC names in `handbook/content/`). The method mirrors the curator cell — we **reverse-engineer the
general pattern from Be Civic's already-working PM system**, grounded in established methodology.

> **BC specifics** (build-now/defer sequencing, BC stage names, BC artefact paths) are intentionally
> kept in this working doc. They MUST NOT enter the timeless general spec (`handbook/content/`),
> which stays method-agnostic and product-free.

**PM has two faces**, and the design keeps them distinct:

- **The strategy / discovery loop (upstream, continuous).** Develops and continually iterates the
  strategic substrate: vision, market & landscape, target users & segments, jobs-to-be-done, the
  value-proposition canvas, the business model, product strategy. Done *before* delivery and iterated
  *as evidence develops*. Maintained by a curator.
- **The delivery coupling (downstream, per-item).** Turns that substrate into prioritised, shipped
  product. **Not** a separate arc — it rides the dev-sprint, whose interaction-heavy front already
  blends PM + eng/design. Its machinery: the roadmap (carrier source), the gates, a product lens
  into the front, the maturity dial.

Joined by the **outcome layer** (vision → objectives → north star → metrics) and the **roadmap** —
the strategy/discovery loop sets themes/priorities, the delivery coupling executes items — and by
**feedback** (`debrief` outcomes flow back to reprioritise the roadmap *and* confirm/kill the loop's
hypotheses).

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `01-concepts` | Concepts / carrier | **amend (core)** — carrier state model (`lifecycle_state`, `current_dev_stage`, `gate_decisions`, `transition_history`); parent/child decomposition; maturity × tier dial; outcome layer. |
| `01-concepts` | Concepts / threads | **amend (core)** — PM as two faces (strategy/discovery loop + delivery coupling), not arcs; personas as PM-owned cross-thread surface. |
| `02-graph-spec` | Node / carrier schema | **amend (core)** — carrier schema fields for the structured state model (not a scalar `stage`). |
| `04-harness-spec` | Harness surfaces | **amend (core)** — personas surface (PM-owned, experience-consumed); maturity as harness-local state; outcome layer surfaces. |
| `05-maintenance-skill` | Curator cells | **amend (core)** — surface + curator pattern applied to strategy/roadmap/personas surfaces. |
| `07-decomposition` | PM pack | **amend (PM-pack)** — SVPG spine + Strategyzer engine; the two-face structure; four-risks lens at both levels; product lens; delivery coupling machinery. |
| `06-analytics` | Outcome measurement | **amend (core)** — `debrief` measures KPIs vs OKRs; outcome-over-output principle. |

## Methodology — the SVPG spine + the Strategyzer engine (PM-pack)

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
Product VISION          ────────── SVPG ──────────────────────── strategy/discovery loop (apex)
   ↓
Product STRATEGY        ────────── SVPG (insights-driven) ─────── strategy/discovery loop
   ↓                               executed via Strategyzer BMC/VPC
OBJECTIVES / OKRs       ────────── SVPG ──────────────────────── outcome layer (+ north star)
   ↓
DISCOVERY — 4 risks     ────────── SVPG + Strategyzer test-and-learn
   strategic/opportunity level ─────────────────────────────── strategy/discovery loop  (VPC/BMC, assumptions, real discovery)
   item level (usability + feasibility) ──────────────────────  delivery coupling front (design, prototypes, spikes)
   ↓
DELIVERY                ────────── SVPG ──────────────────────── delivery coupling = rides the dev-sprint
   ↓
OUTCOMES (metrics/KPIs) ────────── SVPG outcome>output ───────── debrief → back to OKRs + strategy
```

### The four risks reconcile the two frameworks

SVPG's four risks map onto Strategyzer's three (desirability = value + usability) and tell us *where*
each is de-risked. The four risks apply at **both** levels: strategic/opportunity-level (in the
discovery loop) and item-level (in the delivery coupling's front). Do not assign risks cleanly to
one face or the other — the distinction is the **level of examination**, not the risk type.

| Risk (SVPG) | Question | Examined at strategic level (discovery loop) | Examined at item level (delivery coupling front) |
|---|---|---|---|
| **Value** | will they want it? | VPC, demand tests, real interviews | solution framing vs value-prop at `design` |
| **Viability** | does it work for the business? | BMC, assumptions testing | revenue/cost impact of this specific item |
| **Usability** | can they use it? | segment/JTBD fit (can this segment use it at all?) | prototypes at `design`/`specify` |
| **Feasibility** | can we build it? | strategic feasibility (platform, capability) | eng spike at `design`/`specify` |

**Evidence strength model** — **two distinct axes** (encoded in `four-risks` v0.2.0): (1) **evidence
strength by kind** — weak (opinions/hypotheticals/synthetic runs) → moderate (*stated*
intent/preference, a said-yes) → strong (*observed* behaviour, a did-yes: usage, retention, payment);
and (2) the **maturity bar** that sets which rung a risk must reach to clear (see the maturity table
below). The two are independent: a low maturity bar lets a pre-launch team *move* on weak/moderate
evidence, but that must never be recorded as if it *cleared* the risk — `assess` records both the rung
and the bar.
**`simulate-users` is not a PM evidence source** — it is an experience-thread instrument (product/UX
verification, not value discovery). See `docs/experience-thread-design.md`.

## What BC already has — the prior art we generalise

| BC asset (live) | Where | What it is | Generalises to |
|---|---|---|---|
| **BMD / Value-Proposition Canvas** (a Strategyzer instance) | `bc-workspace/bmd/` (173 hypotheses across BMC blocks + VPC sub-blocks, 41 findings, evidence sessions, `vpc/`, assessments); discipline at `handbook/.../07-workspace/04-bmd-discipline.md` | Evidence-first strategy/value-prop, post-pivot hypothesis lifecycle (invalidate/supersede, never delete), a curator | The **strategy/discovery loop** — the canvas surface + curator |
| **Personas** | `bc-operations/docs/user-research/profiles.md` | 10 stress-test profiles + a coverage matrix; symlinked into the test harness | The **personas surface** — PM-owned, consumed by the experience thread |
| **User-simulation** | `handbook/.../06-experience/02-testing.md` (two-tier), `01-arc.md` (Experience Arc, 8 invariants), 7 failure modes, runbooks, "Imogen" replay persona | Single-agent walkthrough + three-agent judge harness, graded against a session-shape contract | The **`simulate-users` node** — **re-homed to the experience thread** (`docs/experience-thread-design.md`); not a PM evidence source |
| **Roadmap** | `bc-workspace/roadmap/` (`items/<id>.md`, `backlog.md`, `sprints/`, `manifest.json`); discipline at `07-workspace/05-roadmap-discipline.md` | Items on a **12-stage lifecycle** with **tiers** (T1 fast-track / T2–T3 gated), a curator | The delivery coupling — the carrier + roadmap surface + roadmap-curator |

*Gap in BC today: the explicit outcome layer (north star / OKRs / KPIs) and a stated product vision
are thin — those are the methodology elements we add.*

## The two faces at a glance

```
  STRATEGY / DISCOVERY LOOP  (upstream · continuous · evidence-iterated)
  vision · market · target users · jobs-to-be-done · value-prop (VPC) · business model · strategy
        │   hypothesise → gather evidence → assess/synthesise → update canvas   (loop)
        ▼   derives objectives + themes
  ═══ OUTCOME LAYER ═══  vision → OKRs → north-star → KPIs
        ▼
  ═══════ ROADMAP ═══════   (prioritised opportunities serving objectives — the carrier source)
        │   a roadmap item (carrier — see STATE MODEL below)
        ▼
  DELIVERY COUPLING  (per-item · rides the dev-sprint)
  align-context · design ─[gate-1]─ specify ─[gate-2]─ plan ─[gate-3]─ build · review · reconcile · land · debrief
   (front blends a PM product-lens + eng/design; reads VPC / personas / strategy; de-risks usability + feasibility)  │
        ▲                                                                                                            │
        └──── outcomes (KPIs vs OKRs) ──► roadmap reprioritise  +  loop confirm / kill hypotheses ──────────────────┘
```

## The strategy / discovery loop (upstream)

**What it produces** (the strategic substrate every downstream decision builds on):

| Output | Method | Content | BC home |
|---|---|---|---|
| **Product vision** | SVPG | the 3–10yr aspiration strategy serves | *(thin in BC — to add)* |
| Product strategy | SVPG (insights) | focus · leverage · sequencing of bets | bmd assessments + strategy notes |
| Market & landscape | SVPG/Strategyzer | market, competitors, positioning, defensibility | bmd assessments (YC + Helmer) |
| **Target users & segments** | Strategyzer | who we serve | BMC `customer_segments` + personas |
| **Personas** (PM-owned) | SVPG/Strategyzer | target-user profiles + JTBD + coverage matrix; maintained by PM, consumed by the experience thread as the shared spine | `bc-operations/docs/user-research/profiles.md` |
| Jobs-to-be-done | Strategyzer | customer profile — jobs · pains · gains | VPC customer side (BC: 34 / 35 / 18) |
| Value proposition | Strategyzer | products · pain relievers · gain creators | VPC value-map side |
| Business model | Strategyzer | revenue · cost · channels · partners · resources | BMC blocks |

**The loop** (Strategyzer test-and-learn, continuous): **hypothesise** (testable claims about market /
users / jobs / value / model) → **gather evidence** (real interviews, evidence sessions, research —
see evidence-strength model above) → **assess / synthesise** (findings; confirm / kill / supersede /
pivot — never delete; update the canvas) → iterate. Examines all four risks at the strategic /
opportunity level. Maintained by a **strategy-curator** (generalises `bmd-curator`). Cadence:
venture-level / whenever evidence arrives.

**PM ↔ experience interactions** — personas, scenarios, and success-criteria flow PM → experience
thread; findings (persona/scenario failures that reveal a mis-targeted segment or unmet need) flow
experience → PM (via `debrief` routing into the strategy-curator's `gather-evidence`). The shared
spine is personas: defined and maintained here, consumed by `simulate-users` in the experience
thread. See `docs/experience-thread-design.md` for the full interaction table.

## The outcome layer — vision to metrics (outcome over output)

The connective tissue between strategy and delivery — the SVPG principle made operational:

- **Product vision** — the apex (from the strategy/discovery loop).
- **Objectives / OKRs** — outcomes the roadmap serves; the bridge from strategy to roadmap items.
- **North-star metric** — the single measure of core value delivered.
- **KPIs / metrics** — instrumented outcomes; what `debrief` reports **against the OKRs** (not "shipped
  vs not"), and the *scale*-stage evidence source feeding back into the strategy/discovery loop.

This is what makes the loop outcome-driven: roadmap items exist to move objectives, and the feedback
seam measures whether they did.

## The delivery coupling (downstream)

### The carrier: a roadmap item with a state model

The **roadmap item is the carrier** — the **opportunity**; it is the PARENT. PM owns the front and
the gates; engineering owns the middle; `debrief` closes the loop.

The carrier does **not** carry a single `stage` scalar. It carries a **state model**:

- **`lifecycle_state`** — the PM-level state of the opportunity:
  `idea → discovery → defined → committed → in-delivery → shipped → live → (parked | killed)`.
- **`current_dev_stage`** — nullable; while `in-delivery`, the dev-sprint stage (`align-context /
  design / specify / plan / build / review / reconcile / land / debrief`) the item or its units are
  currently at. Null when not yet in delivery or after completion.
- **Parent / child links** — at `plan`/`build` the roadmap item (opportunity) decomposes into
  **implementation-unit children**, each carrying its own `current_dev_stage`. A parent's delivery
  progress is **aggregated from its children** — the parent is not a single scalar "building" while
  units span `design` through `review`.
- **`gate_decisions`** — per gate passage: `{ gate, decision (go|no-go|defer), owner, timestamp,
  evidence_refs, override_reason?, conditions?, confidence }`. Gates are **first-class records**,
  not just transitions.
- **`transition_history`** — append-only log of state transitions (`from → to, who, when, why`).
  Represents review loops, re-entry, skipped stages, abandonment, and post-ship measurement lag.

The **BC 12-stage lifecycle maps onto `lifecycle_state × current_dev_stage` + `gate_decisions`**,
not a single field. BC's stage ordering is a BC-specific detail; our canonical dev-sprint order
(`reconcile` AFTER `review`) is what the spec carries — BC's ordering reconciles at the mapping.

| Lifecycle state | `current_dev_stage` (while in-delivery) | Owner |
|---|---|---|
| idea | — | PM |
| discovery | — | PM |
| defined | — | PM |
| committed | — | PM |
| **gate-1 (go/no-go: commit to spec)** | — | **PM gate** |
| in-delivery | `align-context` + `design` (shared front) | **shared** |
| in-delivery | `specify` | Eng |
| **gate-2 (go/no-go: commit to build)** | — | **PM/operator gate** |
| in-delivery | `plan` | Eng |
| **gate-3 (go/no-go: start building)** | — | **operator gate** |
| in-delivery | `build` | Eng |
| in-delivery | `review` (+ `qa`) | Eng |
| in-delivery | `reconcile` | Eng |
| in-delivery | `land` (ship → deploy → canary) | Eng/Ops |
| shipped | — | Eng → PM |
| live | — (debrief → measure KPIs vs OKRs) | PM |
| parked / killed | — | PM |

The **gates** are PM-owned go/no-go records (`gate_decisions` entries), generalising the existing
`land`+gate idea. BC folds `align-context` into "design" — that is a BC-specific mapping detail.

### The shared front: PM leads, eng & design join

The interaction-heavy front (`align-context` → `design`) is **already in the dev-sprint** and is where
PM and eng/design think *together* — the gstack pattern (`office-hours` frames demand/value/user;
`autoplan` runs CEO + design + eng review). It de-risks **usability** and **feasibility** at the
item level (examining all four risks at the solution scope — see the four-risks table above). We
don't duplicate it. PM enters two ways:

- **A product lens** — the CEO/founder/strategy review (gstack's `plan-ceo-review` analogue): *right
  problem? serves the value proposition and the target user? serves which objective?* Delivered
  **main-thread as a skill** (D36), invoked by `design`/`plan`.
- **Building on the discovery loop + the outcome layer** — the front **reads** the strategic substrate and the
  objective the item serves: `align-context` reads the roadmap item + personas + value-prop; `design`
  and the product lens check the solution against the VPC, strategy, and the OKR.

### Gates + maturity ladder = generalised tiers

BC already has **tiers** (T1 fast-track / T2–T3 gated; `bc-triage` recommends, operator overrides at
gates). Generalise into a two-level dial: **per-product maturity** sets the default gate rigour;
**per-item tier** overrides it. These are independent axes — a pre-launch product can still gate a
high-risk item; a mature product can still fast-track a low-risk one.

| Product maturity | Direction from | Default tier / gates | Strategy/discovery loop evidence bar |
|---|---|---|---|
| **Pre-launch** (founder-led) — *BC now* | intuition + domain understanding | T1 fast-track; gates **advisory** | founder conviction + qualitative research |
| **Early-users** | observed user problems (real interviews) | T2; gates need qualitative signal | real interviews / evidence sessions |
| **Scale** (data-driven) | analytics + behaviour | T2/T3; gates need metric movement | analytics, experiments / A-B |

At pre-launch, the default is fast-track and gates are advisory — a pre-launch product is **not
slowed by evidence-gating**. **Stated plainly (a declared limitation, not an oversight):** at
pre-launch a value/viability (demand) risk can be cleared on founder conviction + qualitative
research — i.e. demand is *asserted*, not yet *tested* against real customers. The customer-facing
demand test (get-out-of-the-building: real interviews / evidence sessions aimed at early adopters who
have the problem and a budget) is the **early-users-stage priority** — the deferred evidence-session
node — not a pre-launch gate. This keeps the absence of a demand test at pre-launch a *known, bounded*
posture rather than a silent assumption. Maturity is **harness-local per-product state** (a field a
node reads via bindings); it may later generalise to the dev-sprint itself (maturity-appropriate
QA/canary rigour).

## Entry / orientation is a harness concern, not a node

"orient" is **not a graph node**. Two different things were being conflated:

- **Session orientation** (per-launch): the org-root `CLAUDE.md` (handbook-index pointer + how to use
  the graph + bindings), ambient skill descriptions, the handbook index. **Harness instructions**,
  captured in the directory topology — not a node.
- **Task context** (per-task): `align-context` — the dev-sprint node that gathers context for a
  specific item (uses `explore`). This *is* a node, and already exists.

## Top-level artefacts (the surfaces)

Each is a **workspace surface** maintained by a curator (the D40 cell tuned per surface):

| Surface | Holds | Face | Churn | Curator / gate |
|---|---|---|---|---|
| **Strategy / canvas** | vision, VPC (JTBD + value map), business model, market & strategy | discovery loop | low–med | strategy-curator, evidence-first |
| **Objectives / metrics** | OKRs, north star, KPIs | outcome layer | med | light; set by the discovery loop, read by `debrief` |
| **Personas** (PM-owned) | target-user profiles + JTBD coverage; shared spine with experience thread | discovery loop | low | light; mostly read by loop + experience thread |
| **Roadmap** | items (lifecycle + tier), backlog, sprints | delivery coupling | high | roadmap-curator, **light** gate |

*Note: the experience contract + sim runs are experience-thread surfaces, not PM surfaces. See
`docs/experience-thread-design.md`.*

## How the two faces connect

| Seam | From → To | What flows |
|---|---|---|
| Strategy → objectives | discovery loop → outcome layer | strategy sets **OKRs + north star** |
| Objectives → roadmap | outcome layer → roadmap | items are framed as **opportunities serving an objective** |
| Roadmap item → front | roadmap → delivery coupling front | `align-context`/`design` **read** VPC / personas / strategy / the OKR |
| Gate evidence | real signal (interviews, analytics) → gate decision record | the maturity-appropriate evidence informs the go/no-go |
| Personas → experience | PM personas → experience thread | personas are the shared spine; experience thread consumes via `simulate-users` |
| Outcomes back | `debrief` → roadmap **and** discovery loop | KPIs vs OKRs → reprioritise; **confirm / kill** strategy hypotheses |

## Build now vs defer (for BC)

> BC-specific. Not for the timeless general spec.

**Build now** (the operator's stated needs + the interface priority):

- **Discovery loop:** the VPC / value-proposition definition + maintenance, **personas / JTBD** (PM-owned),
  the **strategy-curator** (light, evidence-first); a stated **product vision**. Real-interview /
  evidence-session node deferred but the loop's evidence bar is real discovery (no `simulate-users`).
- **Outcome layer:** define the **north star + OKR structure** (so items can serve objectives) —
  light; full KPI instrumentation is deferred.
- **Delivery coupling:** the **roadmap-curator** + item lifecycle / state model / gates / tiers; the
  **carrier state model** (the interface, implemented; `debrief` writes the outcome back); the
  **maturity / tier dial** defaulted to pre-launch; the **product-lens** skill into the front; the
  **four-risks lens** as a discovery checklist.
- **Experience thread** (separate — `docs/experience-thread-design.md`): `simulate-users` + experience
  contract. PM's contribution is personas (maintain and share); experience-thread build is its own track.

**Design + TODO** (deferred; edges parked per F7):

- Discovery loop: the **real-interview / evidence-session** node (early-users); **analytics-driven**
  discovery + experiments (scale); the full **BMD hypothesis-graph** as graph nodes.
- Outcome layer: **KPI / metrics instrumentation** + automated OKR scoring.
- Delivery coupling: **heavier gates**; **maturity applied to the dev-sprint** (QA/canary rigour).

## Behaviour contract (native / built / convention)

- **Native:** `gh` PRs + git (curators, gates as labelled PRs); skills/agents ambient; `CLAUDE.md`
  cascade (orientation); `Read` is path-agnostic (nodes read artefacts/bindings).
- **Built:** the curators (strategy + roadmap + persona); the **carrier state model sync** (item
  `lifecycle_state` + `current_dev_stage` ↔ dev-sprint stage); the **gate-decisions record**;
  the **maturity/tier dial**; the outcome-layer surfaces' renderers. (`simulate-users` is built as
  part of the experience thread, not PM.)
- **Convention:** nodes must be **authored** to read the roadmap item / personas / VPC / strategy /
  OKR via bindings, and to read the maturity stage; the four-risks lens is a prompt discipline, not
  magic. Verified in `validate`.

## Core vs PM-pack

> **Important scoping note.** The SVPG spine, Strategyzer engine, four-risks lens, the canvases, and
> the two-face PM structure are a **PM-pack methodology** — a specific, opinionated method that rides
> the method-agnostic stack-graph core. Other PM methodologies (shape-up, jobs theory only, lean
> canvas) could be alternative packs. This matters for the spec:
>
> - The **method-agnostic CORE** gets only: the carrier + state model concept, gates as first-class
>   records, the maturity/tier dial (abstract), the outcome layer (abstract), the
>   strategy/discovery loop concept (abstract).
> - The **PM pack** brings: SVPG operating-model, Strategyzer canvases, the four-risks lens,
>   the two-face structure, the specific loop/coupling machinery.

## Generalisation → the general spec

| BC-concrete here | General concept | Core or PM-pack | Spec home (proposed) |
|---|---|---|---|
| BMD/VPC + bmd-curator, SVPG framing | the two-face PM structure (strategy/discovery loop + delivery coupling) | **PM-pack** | `07-decomposition` (**D43**) |
| SVPG operating model | **SVPG spine + Strategyzer engine** | **PM-pack** | `07-decomposition` (**D43**) |
| roadmap item with a state model (`lifecycle_state` × `current_dev_stage` + gates + history) | a **carrier** with a structured state model (not a scalar stage) | **Core** | `01-concepts` + `02-graph-spec` (**D44**) |
| T1/T2/T3 tiers + founder-led / early-users / scale posture | the **maturity ladder** (per-product) × **tier** (per-item) rigour dial | **Core** | `01-concepts` + `04-harness` (**D45**) |
| vision / OKRs / north star / KPIs | the **outcome layer** — outcome over output; what `debrief` measures | **Core** | `01-concepts` + `06-analytics` |
| the four big risks | a **discovery lens** (value/usability/feasibility/viability) applied at both levels | **PM-pack** | `07-decomposition` + `01-concepts` |
| office-hours / CEO review feeding the front | a **product lens** (skill) into the shared front | **PM-pack** | `07-decomposition` + `01-concepts` |
| roadmap / strategy / personas surfaces + curators | the **surface + curator family** (D40 tuned per surface) | **Core** (pattern); PM-pack (content) | `04-harness` + `05-maintenance-skill` |
| personas (PM-owned, experience-consumed) | **personas** as a PM-owned surface shared with the experience thread | **Core** | `04-harness` + `07-decomposition` |
| `simulate-users` re-homed to experience thread | **experience thread** — re-homed, not in PM pack | **Core** | `07-decomposition` (node) + `04-harness` (contract) |
| session-start orientation | **orientation = harness instructions**, not a node | **Core** | `04-harness` / directory topology |

## Open / next

- **Translate to the graph** — the next step now that methodology is grounded: which elements are
  nodes (the discovery loop nodes, the curators, the product lens), surfaces/artefacts (vision,
  canvas, OKRs, north star, personas), lenses/principles (the four risks, outcome-over-output), or
  harness state (maturity stage, north-star definition, carrier `lifecycle_state`).
- **Discovery loop node breakdown** — confirm `hypothesise → gather → assess → canvas` as the
  backbone; whether market/landscape and strategy/positioning are their own steps or canvas sections.
  (`simulate-users` is now the experience thread's node, not here.)
- **Carrier state model mechanics** — how the `lifecycle_state` / `current_dev_stage` / `gate_decisions`
  / `transition_history` fields are represented in the carrier (graph frontmatter vs. artefact file);
  how parent/child decomposition is expressed in the graph (edges vs embedded list).
- **Reconcile `align-context` fold** — BC folds `align-context` into "design"; confirm whether this is
  a BC harness mapping or a spec question.
- **Product-lens node breakdown** — one skill, or PM content inside `align-context`/`design` + a
  `plan`-stage CEO review? Lean to a small skill (D36).
- **Strategy-curator vs roadmap-curator** — one curator cell parameterised per surface vs. variants.
- **Carrier vs. the static `composes-into dev-sprint` edges** — runtime unit vs static structure;
  keep distinct in the spec.
- **PM-pack spec scope** — confirm which concepts in the Core vs PM-pack table above land in
  `07-decomposition` as examples vs. as first-class spec primitives.
- **founder-ops interaction** — how a peer workspace injects personal context into PM (later).
