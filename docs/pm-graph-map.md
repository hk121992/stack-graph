---
title: Product-management pack — the graph map
status: working draft — 2026-06-01
---

# Product-management pack — the graph map

The translation of [`product-management-design.md`](product-management-design.md) into graph
primitives — the PM pack's nodes, references, surfaces, and edges, and how it couples to the
dev-sprint ([`graph-map.md`](graph-map.md)). Model: native references (D33), 1:1 nodes (D34), skills
for main-thread judgment (D36), the curator cell (D40). PM = an upstream **strategy/discovery loop
(A)** + a downstream **delivery coupling (B)**; grounded in **SVPG** (operating-model spine) +
**Strategyzer** (business-model/value engine + test-and-learn). ("Arc" is reserved for the
dev-sprint's own process-edge traversal; PM is the **loop + coupling**, experience is the
**thread**.)

> **Core vs PM-pack.** The carrier/gates/maturity concepts (roadmap items, lifecycle states, gate
> decisions, maturity tiers) are **core** — method-agnostic and suitable for any delivery process.
> `strategy-curator`, `product-lens`, `four-risks`, `vpc-schema`, `bmc-schema`, and the canvases
> are **PM-pack methodology** (SVPG + Strategyzer). Harnesses using a different PM method replace
> the pack nodes; the core carrier machinery stays unchanged.

## Legend

Same vocabulary as [`graph-map.md`](graph-map.md): `skill` (main-thread) · `agent` (isolated) ·
`ref` (shared reference, `graph/_refs/<id>.md`, depended on via a `references` edge with
`load: import | on-demand`, D33) · modes are **body branches** of one node (D34). Edges:
`invokes` / `composes-into` / `references` / `overlay`. Column "loop" = which PM loop/coupling
the node belongs to (A = strategy/discovery loop, B = delivery coupling).

## New nodes (3)

`simulate-users` has moved to the **experience thread** — see
[`experience-thread-design.md`](experience-thread-design.md). The PM-owned **personas** surface
remains the source; the experience thread consumes it (a cross-thread reference). `four-risks`
stays as a PM/discovery lens (used by `product-lens` and `strategy-curator`'s discovery mode) but
is no longer bound to `simulate-users`.

| id | primitive | loop | goal (outcome) | edges |
|---|---|---|---|---|
| **strategy-curator** | skill | A | maintain the strategy canvas via the Strategyzer test-and-learn loop; modes (D34): `hypothesise` / `gather-evidence` / `assess` / `refresh-canvas` | invokes `explore`, `pr-author`; references `vpc-schema` + `bmc-schema` (on-demand), `four-risks` (import), `handbook` (external); maintains the **strategy-canvas** surface. *Generalises BC `bmd-curator`.* |
| **roadmap-curator** | skill | B | maintain the roadmap — items (the **carrier**), tiers, gates, sprints — and update a carrier's `current_dev_stage` as the dev-sprint progresses; modes: `triage` / `add-item` / `update-stage` / `sprint-plan` / `reprioritise` | invokes `pr-author`, `queue-checker`; references `roadmap-item-schema` + `okr-schema` (import); maintains the **roadmap** surface. Stage-sync is a **state mechanism** (see Mechanisms), not a `composes-into` edge. *Generalises BC roadmap-curator.* |
| **product-lens** | skill | B (front) | the CEO/strategy review into the shared front — *right problem? serves the value proposition / target user / the OKR?* | composes-into `dev-sprint`@`design`, @`plan`; references `four-risks` (import), the strategy-canvas (via binding) |

## Reused (no new authoring)

`explore` (the strategy/discovery loop's `gather-evidence`; `align-context`) · the debrief fleet `measure-outcomes` /
`capture-learnings` / `log-decision` (the outcome write-back) · the curator cell's shared sub-agents
`pr-author` + `queue-checker` and refs `what-belongs` / `pr-description-shape` / `bundling-rules`
(the PM curators reuse the graduation machinery) · the dev-sprint stages (the delivery coupling rides them).

**Curators are sibling skills, not one parameterised node** — each has surface-specific modes
(`handbook`: sweep/raise/integrate · `roadmap`: triage/advance/sprint · `strategy`: hypothesise/
gather/assess) but **shares** the graduation/PR machinery via `pr-author` + `queue-checker` + the
curator refs. (Whether a single `surface-curator` could parameterise all three is an open refinement
— left for authoring/review.)

## References (new)

| id | home | load | note |
|---|---|---|---|
| `four-risks` | factory `_ref` | import | the discovery lens — value / usability / feasibility / viability (SVPG) |
| `vpc-schema` | factory `_ref` | on-demand | Value Proposition Canvas — jobs/pains/gains + value map (Strategyzer) |
| `bmc-schema` | factory `_ref` | on-demand | Business Model Canvas — 9 blocks (Strategyzer) |
| `roadmap-item-schema` | factory `_ref` | import | the carrier — frontmatter + `lifecycle_state` (idea→discovery→defined→committed→in-delivery→shipped→live→parked/killed) + `current_dev_stage` (dev-sprint stage, populated when in-delivery) + `tier` + `gate_decisions[]` + `transition_history[]` (append-only); parent item decomposes into impl-unit children at plan/build |
| `okr-schema` | factory `_ref` | import | the outcome layer — objectives / north-star / KPI structure |
| `experience-contract` | harness (`external: true`) | on-demand | the product's session-shape invariants (BC: the Experience Arc) |
| `personas` | harness (`external: true`) | on-demand | the product's user profiles (BC: `profiles.md`) |

## Surfaces (harness-local content; bound via `bindings`; BC already has most)

`strategy-canvas` (BC: `bc-workspace/bmd`) · `personas` (BC: `bc-operations/.../profiles.md` —
**PM-owned surface**; consumed by the experience thread as a cross-thread reference) ·
`objectives/metrics` (north-star / OKRs / KPIs — thin in BC, to add) · `roadmap`
(BC: `bc-workspace/roadmap`). `experience-contract` + sims live in the experience thread
(see [`experience-thread-design.md`](experience-thread-design.md)).

## Mechanisms (built infra, not nodes)

- **Carrier state model** — the carrier (roadmap item) is a **parent item** with a structured state
  model, not a scalar stage:
  - `lifecycle_state` — `idea → discovery → defined → committed → in-delivery → shipped → live →
    (parked | killed)`; transitions gated by PM go/no-go decisions.
  - `current_dev_stage` — the dev-sprint stage the item is currently at (populated when
    `lifecycle_state = in-delivery`; updated by `roadmap-curator` as the sprint progresses).
  - **Parent / child decomposition** — at `plan` / `build` the parent item spawns **impl-unit
    children** (one per buildable chunk); the parent tracks aggregate state.
  - `gate_decisions[]` — append-only log: `{gate, decision, owner, timestamp, evidence_refs,
    override?, conditions?, confidence}` for every go/no-go.
  - `transition_history[]` — append-only log of every `lifecycle_state` transition.
- **Carrier stage-sync (state mechanism)** — `roadmap-curator` updates `current_dev_stage` as the
  dev-sprint progresses; `debrief` writes outcomes back to `lifecycle_state` (→ `shipped → live`) and
  the strategy hypotheses. This is a **state mutation on the item**, not a `composes-into` edge from
  `roadmap-curator` to `dev-sprint`. *This is the PM↔dev interface.*
- **Gates** — PM-owned go/no-go `lifecycle_state` transitions (gate-1/2/3); each records a
  `gate_decisions` entry. Generalises the `land`+gate idea.
- **Maturity / tier dial** — per-product maturity (harness state) sets default gate rigour + evidence
  source; per-item tier overrides.

## Edges at a glance

- **references (D33):** curators + lens → schemas/lens — `import` for short contracts
  (`four-risks`, `okr-schema`, `roadmap-item-schema`), `on-demand` for larger/conditional material
  (`vpc-schema`, `bmc-schema`, `personas`, the canvas).
- **invokes:** `strategy-curator` → {`explore`, `pr-author`}; `roadmap-curator` → {`pr-author`,
  `queue-checker`}.
- **composes-into:** `product-lens` → `dev-sprint`@`design`,@`plan`. (`roadmap-curator` does
  **not** `composes-into dev-sprint` — carrier stage-sync is a **state mechanism** on the item, see
  Mechanisms.)
- **cross-thread reference:** `personas` (PM-owned) → experience thread (`simulate-users` reads it;
  see [`experience-thread-design.md`](experience-thread-design.md)).
- **overlay (harness):** `personas`, the canvas/roadmap/objectives surfaces, the maturity stage →
  attach via `bindings`; vendored nodes never mutated.
- **feedback:** `debrief` → (writes) the roadmap item's `lifecycle_state` + outcome + the strategy
  hypotheses (confirm/kill) — the loop close.

## Build now + sequencing

- **PM loop A first (no dev-sprint dependency):** `strategy-curator` + refs {`four-risks`,
  `vpc-schema`, `bmc-schema`}; bind to BC's `bmd` + `profiles` surfaces. Immediately useful to BC.
  (`simulate-users` is sequenced under the **experience thread** — see
  [`experience-thread-design.md`](experience-thread-design.md).)
- **Outcome layer (light):** author `okr-schema` + a stated north-star.
- **Delivery coupling B (needs the dev-sprint front):** `roadmap-curator` + `product-lens` + refs
  {`roadmap-item-schema`, `okr-schema`} — depends on `align-context`/`design`/`specify` existing, so
  it **converges with building the backbone front**.
- **Defer (F7):** the real-interview node, analytics-driven discovery + experiments, heavier gates,
  the full BMD-hypothesis-graph as nodes, maturity-on-the-dev-sprint, KPI instrumentation.
