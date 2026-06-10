---
id: pm-methodology-provenance
kind: reference
title: PM pack — methodology provenance
description: Methodology-audit manifest for the product-management pack — the declared method claims, per-principle encoding state, omitted principles, and method-interface seams. Use when convening the advisory council over the PM pack or auditing what the pack claims to encode.
status: v0.1.1 — 2026-06-10
---

# PM pack — methodology provenance

A methodology-audit manifest for the `product-management` pack. Declares what
methodologies the pack claims, maps each principle to its graph encoding, and
explicitly names what is omitted and why. A methodology-audit tool can walk this
file to check fidelity without reading the full design.

Sources: `docs/product-management-design.md` · `docs/pm-graph-map.md` (2026-06-01).

---

## pack

`product-management`

---

## claimed_methods

| Method | Claim | Weight |
|---|---|---|
| **SVPG** — Cagan (*Inspired / Empowered / Transformed*) | Operating-model **spine**: Vision → Strategy → Objectives → Discovery → Delivery; outcome-over-output; dual-track; four risks | **primary** — the whole frame |
| **Strategyzer** — Osterwalder (*Business Model Generation*, *Value Proposition Design*, *Testing Business Ideas*) | Business-model & value **engine** + test-and-learn loop inside SVPG's Discovery stage; BMC and VPC canvases; assumptions → experiment → evidence → decide; evidence-strength ladder | **primary** — co-equal for strategy/value work |
| **Customer Development** — Blank (*The Startup Owner's Manual*) | Lightly implied by the evidence-first, real-interviews stance and the hypothesis lifecycle (never delete, supersede/kill); **not directly named** in the design docs | **not claimed** — the design explicitly names only SVPG and Strategyzer; Blank's vocabulary does not appear |

---

## sources

Canonical works named or directly cited in the design:

- Cagan, M. — *Inspired: How to Create Tech Products Customers Love* (2nd ed.)
- Cagan, M. — *Empowered: Ordinary People, Extraordinary Products*
- Cagan, M. — *Transformed: Moving to the Product Operating Model*
- Osterwalder, A. et al. — *Business Model Generation*
- Osterwalder, A. et al. — *Value Proposition Design*
- Osterwalder, A. et al. — *Testing Business Ideas*

---

## principles_included

Each principle the pack intends to embody, with the real node/reference ids that
encode it and its current build state.

| # | Principle (short name) | Method | Encoded by | State | Notes |
|---|---|---|---|---|---|
| 1 | Vision apex — 3–10yr product vision as strategy apex | SVPG | `strategy-curator` (surface maintains vision) + `okr-schema` (references vision as apex) | planned | Vision surface is thin in BC; `strategy-curator` and `okr-schema` are planned nodes. |
| 2 | Outcome-over-output — roadmap items serve objectives; `debrief` measures KPIs vs OKRs, not shipped-vs-not | SVPG | `okr-schema` (ref, import) + `roadmap-item-schema` (ref, import) + `debrief` fleet (reused) | planned (`okr-schema`); present (`debrief` reused) | `okr-schema` is planned; debrief fleet nodes are reused from existing graph. |
| 3 | Dual-track — continuous discovery alongside continuous delivery | SVPG | Two-face design: strategy/discovery loop (A) + delivery coupling (B); `strategy-curator` (A) + `roadmap-curator` (B) | planned | Both curators are planned nodes. |
| 4 | Four risks — value / usability / feasibility / viability applied at both strategic and item level | SVPG | `four-risks` (ref, import — **present**); `strategy-curator` (references it); `product-lens` (references it) | present (`four-risks` ref); planned (`product-lens` node) | `four-risks` ref is built and in the graph. `product-lens` is planned. |
| 5 | Insights-driven strategy — strategy built from market/landscape/user insights, not intuition alone | SVPG | `strategy-curator` modes (`hypothesise` / `gather-evidence` / `assess` / `refresh-canvas`) + `vpc-schema` + `bmc-schema` | planned (curators); present (schemas) | `vpc-schema` and `bmc-schema` refs are present. |
| 6 | Value Proposition Canvas — jobs / pains / gains (customer profile) + products / pain relievers / gain creators (value map) | Strategyzer | `vpc-schema` (ref, on-demand — **present**); maintained in `strategy-canvas` surface by `strategy-curator` | present (schema); planned (curator + surface) | Schema is in the graph. |
| 7 | Business Model Canvas — 9-block business model (segments, channels, revenue, cost, etc.) | Strategyzer | `bmc-schema` (ref, on-demand — **present**); maintained in `strategy-canvas` surface by `strategy-curator` | present (schema); planned (curator + surface) | Schema is in the graph. |
| 8 | Test-and-learn loop — hypothesise → gather evidence → assess/synthesise → update canvas; hypothesis lifecycle (confirm / kill / supersede; never delete) | Strategyzer | `strategy-curator` modes + `explore` (invoked for gather-evidence; **present**) | planned (curator modes); present (`explore`) | The loop backbone is designed; curator is planned. |
| 9 | Evidence-strength ladder — synthetic/weak → qualitative (real interviews) → quantitative (analytics, experiments) | Strategyzer | `four-risks` (import — encodes the evidence bar per risk); `strategy-curator` governs evidence bar per maturity stage | present (`four-risks`); planned (curator enforcement) | Evidence-strength ladder is described in `four-risks` ref text. |
| 10 | Carrier + structured state model — roadmap item as parent with `lifecycle_state` × `current_dev_stage` + `gate_decisions[]` + `transition_history[]` + parent/child decomposition | SVPG (delivery) | `roadmap-item-schema` (ref, import) + `roadmap-curator` (`update-stage` mode) | planned | Core mechanism; both `roadmap-item-schema` and `roadmap-curator` are planned. |
| 11 | Gates as first-class records — PM-owned go/no-go `gate_decisions` entries (gate-1/2/3) with decision, owner, timestamp, evidence refs | SVPG | `roadmap-item-schema` (schema encodes `gate_decisions[]` structure) | planned | Designed; planned for build. |
| 12 | Maturity / tier dial — per-product maturity (pre-launch / early-users / scale) sets default evidence bar; per-item tier overrides | SVPG + Strategyzer | Harness-local state (maturity field via `bindings`); `roadmap-item-schema` (tier field); `roadmap-curator` (reads maturity) | planned | Harness-local state; no dedicated node. |
| 13 | OKR / north-star / KPI outcome layer — objectives the roadmap serves; north-star metric; KPIs `debrief` measures | SVPG | `okr-schema` (ref, import) + `debrief` fleet (reused) | planned (`okr-schema`); present (`debrief`) | Light implementation scoped for build-now. |
| 14 | Product lens into shared front — CEO/strategy review: right problem? serves the value proposition / target user / the OKR? | SVPG | `product-lens` (skill, `composes-into dev-sprint @design, @plan`) + `four-risks` (import) | planned | `product-lens` is a planned node (D36). |
| 15 | Personas as PM-owned surface shared with experience thread — JTBD coverage; cross-thread reference | SVPG + Strategyzer | `personas` (ref, external, on-demand — **present** in graph, consumed by `simulate-users`); PM-owned surface via `bindings` | present (ref + graph edge) | Already in graph-record.json. PM ownership and cross-thread seam are designed. |
| 16 | Feedback loop close — `debrief` outcomes reprioritise the roadmap AND confirm/kill strategy hypotheses | SVPG | `debrief` fleet (reused — `measure-outcomes` / `capture-learnings` / `log-decision`); `roadmap-curator` (`reprioritise` mode) | present (`debrief` fleet reused); planned (reprioritise mode + hypothesis write-back) | The write-back path to the strategy canvas is designed but not yet built. |

**Reconciliation note (2026-06-01, post council audit — D48).** The per-row State column predates the
build of `strategy-curator` and is stale; corrections:

- **`strategy-curator` is a present, live node** (`graph-record.json`, v0.1.0), not "planned." For the
  principles it encodes, read State as **present**: P1 (strategy half), P3 (face-A / discovery track),
  P4 (consumes `four-risks`), P5, P8, P9. The **delivery-side** nodes (`roadmap-curator`,
  `roadmap-item-schema`, `product-lens`, `okr-schema`) remain genuinely **planned**.
- **The `debrief` fleet is reused/external and not verified in this repo's `graph-record.json`** — read
  P2 / P13 / P16 as **external-reused (unverified here)**, not "present."
- **`four-risks` v0.2.0 now carries an explicit two-axis evidence model** — evidence-strength *by kind*
  (weak/moderate/strong) distinct from the maturity bar — closing the P9 drift the audit flagged (the
  strength ladder had been collapsed into the maturity dial).
- **Product vision (P1) is mapped-but-thin** — nothing yet holds a 3–10yr vision *distinct* from
  strategy. Treat P1's vision half as a **known gap**, not a clean encoding.

**Summary: ~5 principles present (incl. `strategy-curator`), the rest planned. No principles are
invented — all grounded in the design docs.** Genuinely present in `graph-record.json`: `four-risks`
(P4), `vpc-schema` + `bmc-schema` (P6–P7), `explore` for gather-evidence (P8), `personas` ref (P15),
and `strategy-curator` (the discovery-loop encoder).

---

## principles_omitted

Method principles the pack **intentionally** does not (yet) encode, with reason drawn from the design's scoping decisions.

| # | Principle omitted | Method | Reason |
|---|---|---|---|
| O1 | Real-interview / evidence-session node — a dedicated graph node for conducting and recording real user interviews | SVPG + Strategyzer | Explicitly deferred to early-users maturity stage. Design says: "Real-interview / evidence-session node (early-users) — deferred." |
| O2 | Analytics-driven discovery + experiment nodes — quantitative experiment design, A/B test tooling, analytics instrumentation at the graph level | SVPG + Strategyzer | Explicitly deferred to scale maturity stage. Design says: "analytics-driven discovery + experiments (scale) — deferred." |
| O3 | Full BMD hypothesis graph as graph nodes — the entire hypothesis lifecycle (173 hypotheses as structured graph nodes with evidence links) | Strategyzer | Explicitly deferred: "full BMD hypothesis-graph as graph nodes — deferred." Hypothesis tracking lives in the canvas surface (a workspace artefact), not as first-class graph nodes. |
| O4 | KPI / metrics instrumentation and automated OKR scoring | SVPG (outcome layer) | Explicitly deferred. Design says: "KPI / metrics instrumentation + automated OKR scoring — deferred." Light OKR structure is included (okr-schema); automation is not. |
| O5 | Heavier gates — evidence-gated go/no-go with mandatory quantitative thresholds | SVPG | Explicitly deferred. Design says: "heavier gates — deferred." Pre-launch default is advisory gates; heavier gating is a future maturity-tier concern. |
| O6 | Maturity applied to the dev-sprint — QA / canary rigour varying by product maturity | SVPG | Explicitly deferred. Design says this "may later generalise to the dev-sprint itself" but is not in scope for the PM pack build. |
| O7 | Founder-ops interaction — personal context injection from a peer workspace into PM | SVPG | Marked "later" in the design's Open section. Not in scope. |
| O8 | Customer Development vocabulary (Blank) — pivot/persevere framing, Customer Discovery / Validation stages as named primitives | Customer Development | The design does not adopt Blank's vocabulary or stage names. SVPG + Strategyzer cover *most* of the same epistemic territory — **except** Customer Development's distinctive demand: a customer-facing, get-out-of-the-building demand test that *gates* spend. As encoded today that test is **absent at pre-launch** (demand rests on conviction; see O1 — the evidence-session node is deferred to early-users). The vocabulary is intentionally omitted, but the *demand-validation substance* arrives at early-users, not pre-launch — the prior claim that the other two methods already cover it is over-stated and corrected here (council audit). |
| O9 | Market type (Blank) — existing / new / resegmented / clone market, which changes competition, adoption speed, positioning, and demand-creation spend pacing | Customer Development | Not modelled today, and previously not even listed as omitted (the audit flagged it as a *silent* gap). Recorded here as a **deliberate deferral**: the pre-launch single-venture default assumes an implicit market type; market-type-aware positioning and spend pacing belong with the scale-stage analytics work (O2). Revisit when the pack spans maturity to scale. |

---

## method_interfaces

Where the two methods meet and who owns each side.

### Primary seam: SVPG spine — Strategyzer engine

The design's governing reconciliation: **SVPG is the whole operating model; Strategyzer is _how_ the strategy/value portion of Discovery is done inside it.** SVPG contributes the frame (vision, objectives, outcome-over-output, dual-track, the delivery half). Strategyzer contributes the canvases (BMC/VPC), the test-and-learn loop, and the evidence-strength discipline inside SVPG's Discovery stage. Neither method is applied wholesale; they are layered.

Encoded by: the two-face design (`strategy-curator` owns the Strategyzer loop; the `product-lens` and carrier machinery own the SVPG delivery side) + `four-risks` as the reconciliation bridge.

### Four-risks bridge

SVPG's four risks (value / usability / feasibility / viability) are the explicit reconciliation point:

- **Value + Viability** map to Strategyzer's desirability/viability territory → examined in the strategy/discovery loop via VPC + BMC (`strategy-curator` + `vpc-schema` + `bmc-schema`).
- **Usability + Feasibility** at the item level → examined in the delivery coupling front (`product-lens` + prototypes/spikes at `design`/`specify`).
- **All four at the strategic level** → examined in the strategy/discovery loop for the opportunity as a whole.

The `four-risks` reference is the single encoding of this reconciliation; it is imported by both `strategy-curator` and `product-lens`.

### Discovery loop ↔ delivery coupling seam (the two faces)

| Seam | Owner | Flows |
|---|---|---|
| Strategy → objectives | `strategy-curator` sets OKRs + north-star | Discovery loop → outcome layer |
| Objectives → roadmap | `okr-schema` + `roadmap-item-schema` | Outcome layer → delivery coupling |
| Roadmap item → front | `align-context` / `design` read VPC + personas + OKR via `bindings` | Delivery coupling reads discovery loop outputs |
| Gates (evidence → decision) | `roadmap-curator` writes `gate_decisions[]` | Evidence bar set by maturity tier (SVPG maturity × Strategyzer evidence-strength) |
| Personas | PM-owned (`strategy-curator` surface); consumed cross-thread by `simulate-users` | Discovery loop → experience thread |
| Feedback close | `debrief` fleet writes back to `lifecycle_state` + strategy hypotheses | Delivery coupling → discovery loop |

### Evidence-strength × maturity dial

Strategyzer's evidence ladder (synthetic → qualitative → quantitative) is mapped onto SVPG's maturity stages: pre-launch accepts founder conviction + qualitative research; early-users requires real interviews / evidence sessions; scale requires analytics / experiments. This mapping is encoded in `four-risks` and in the maturity/tier dial (harness-local state). It is the seam where the two methodologies jointly govern how rigorous a gate decision must be.

---

## open

Unresolved items carried forward from the design docs:

1. **Discovery loop node breakdown** — whether `hypothesise → gather → assess → canvas` are body branches of `strategy-curator` (modes, per D34) or separate nodes; whether market/landscape and strategy/positioning are canvas sections or distinct steps. Not yet decided.
2. **Carrier state model mechanics** — how `lifecycle_state` / `current_dev_stage` / `gate_decisions[]` / `transition_history[]` are represented in the carrier (graph frontmatter vs. artefact file); how parent/child decomposition is expressed (edges vs embedded list). Open.
3. **Reconcile `align-context` fold** — BC folds `align-context` into "design"; whether this is a BC harness mapping or a spec question. Unresolved.
4. **Product-lens node breakdown** — one small skill (D36) or PM content embedded inside `align-context`/`design` + a `plan`-stage CEO review. Design leans to a small skill; not yet fixed.
5. **Strategy-curator vs roadmap-curator** — one parameterised `surface-curator` node vs. distinct sibling skills. Design tentatively chooses siblings (surface-specific modes, shared graduation machinery); flagged as an open refinement.
6. **PM-pack spec scope** — which concepts in the core-vs-pack table land in `07-decomposition` as examples vs. first-class spec primitives. Not yet fixed.
7. **`four-risks` consumed_by gap** — `graph-record.json` lists `four-risks` as consumed only by `strategy-curator`; `product-lens` (which also imports it) is not yet in the graph record because `product-lens` is a planned node.
