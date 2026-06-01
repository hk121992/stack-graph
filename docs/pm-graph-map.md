---
title: Product-management pack — the graph map
status: working draft — 2026-06-01
---

# Product-management pack — the graph map

The translation of [`product-management-design.md`](product-management-design.md) into graph
primitives — the PM pack's nodes, references, surfaces, and edges, and how it couples to the
dev-sprint ([`graph-map.md`](graph-map.md)). Model: native references (D33), 1:1 nodes (D34), skills
for main-thread judgment (D36), the curator cell (D40). PM = an upstream **strategy/discovery arc
(A)** + a downstream **delivery coupling (B)**; grounded in **SVPG** (operating-model spine) +
**Strategyzer** (business-model/value engine + test-and-learn).

## Legend

Same vocabulary as [`graph-map.md`](graph-map.md): `skill` (main-thread) · `agent` (isolated) ·
`ref` (shared reference, `graph/_refs/<id>.md`, depended on via a `references` edge with
`load: import | on-demand`, D33) · modes are **body branches** of one node (D34). Edges:
`invokes` / `composes-into` / `references` / `overlay`.

## New nodes (4)

| id | primitive | arc | goal (outcome) | edges |
|---|---|---|---|---|
| **strategy-curator** | skill | A | maintain the strategy canvas via the Strategyzer test-and-learn loop; modes (D34): `hypothesise` / `gather-evidence` / `assess` / `refresh-canvas` | invokes `simulate-users`, `explore`, `pr-author`; references `vpc-schema` + `bmc-schema` (on-demand), `four-risks` (import), `handbook` (external); maintains the **strategy-canvas** surface. *Generalises BC `bmd-curator`.* |
| **simulate-users** | agent | A (evidence) | run user-simulation against the experience contract; produce graded findings (de-risks **value + usability**); modes: `tier-1` (single-agent walk) / `tier-2` (multi-agent judge harness — orchestration resolved at authoring) | references `experience-contract` + `personas` (external, on-demand), `four-risks` (import); invoked by `strategy-curator`, the gates. *Generalises BC's two-tier sim.* |
| **roadmap-curator** | skill | B | maintain the roadmap — items (the **carrier**), tiers, gates, sprints — and advance an item's `stage` along the dev-sprint; modes: `triage` / `add-item` / `advance-stage` / `sprint-plan` / `reprioritise` | invokes `pr-author`, `queue-checker`; references `roadmap-item-schema` + `okr-schema` (import); composes-into `dev-sprint` (the carrier stage-sync); maintains the **roadmap** surface. *Generalises BC roadmap-curator.* |
| **product-lens** | skill | B (front) | the CEO/strategy review into the shared front — *right problem? serves the value proposition / target user / the OKR?* | composes-into `dev-sprint`@`design`, @`plan`; references `four-risks` (import), the strategy-canvas (via binding) |

## Reused (no new authoring)

`explore` (Arc A `gather-evidence`; `align-context`) · the debrief fleet `measure-outcomes` /
`capture-learnings` / `log-decision` (the outcome write-back) · the curator cell's shared sub-agents
`pr-author` + `queue-checker` and refs `what-belongs` / `pr-description-shape` / `bundling-rules`
(the PM curators reuse the graduation machinery) · the dev-sprint stages (Arc B rides them).

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
| `roadmap-item-schema` | factory `_ref` | import | the carrier — frontmatter + lifecycle/`stage` + `tier` |
| `okr-schema` | factory `_ref` | import | the outcome layer — objectives / north-star / KPI structure |
| `experience-contract` | harness (`external: true`) | on-demand | the product's session-shape invariants (BC: the Experience Arc) |
| `personas` | harness (`external: true`) | on-demand | the product's user profiles (BC: `profiles.md`) |

## Surfaces (harness-local content; bound via `bindings`; BC already has most)

`strategy-canvas` (BC: `bc-workspace/bmd`) · `personas` (BC: `bc-operations/.../profiles.md`) ·
`objectives/metrics` (north-star / OKRs / KPIs — thin in BC, to add) · `roadmap`
(BC: `bc-workspace/roadmap`) · `experience-contract` + sims (BC: `handbook/.../06-experience`).

## Mechanisms (built infra, not nodes)

- **Carrier stage-sync** — `roadmap-curator` advances an item's `stage` as the dev-sprint progresses;
  `debrief` writes the outcome back. *This is the PM↔dev interface.*
- **Gates** — PM-owned go/no-go stage transitions (gate-1/2/3); generalises the `land`+gate idea.
- **Maturity / tier dial** — per-product maturity (harness state) sets default gate rigour + evidence
  source; per-item tier overrides.

## Edges at a glance

- **references (D33):** curators + lens → schemas/lens — `import` for short contracts
  (`four-risks`, `okr-schema`, `roadmap-item-schema`), `on-demand` for larger/conditional material
  (`vpc-schema`, `bmc-schema`, `experience-contract`, `personas`, the canvas).
- **invokes:** `strategy-curator` → {`simulate-users`, `explore`, `pr-author`}; `roadmap-curator`
  → {`pr-author`, `queue-checker`}.
- **composes-into:** `product-lens` → `dev-sprint`@`design`,@`plan`; `roadmap-curator` →
  `dev-sprint` (carrier stage-sync). `simulate-users` composes into Arc A via `strategy-curator`.
- **overlay (harness):** `experience-contract`, `personas`, the canvas/roadmap/objectives surfaces,
  the maturity stage → attach via `bindings`; vendored nodes never mutated.
- **feedback:** `debrief` → (writes) the roadmap item's outcome + the strategy hypotheses
  (confirm/kill) — the loop close.

## Build now + sequencing

- **Arc A first (no dev-sprint dependency):** `strategy-curator` + `simulate-users` + refs
  {`four-risks`, `vpc-schema`, `bmc-schema`}; bind to BC's `bmd` + `profiles` + experience surfaces.
  Immediately useful to BC; matches "robust value-prop + personas + simulated testing now".
- **Outcome layer (light):** author `okr-schema` + a stated north-star.
- **Arc B (needs the dev-sprint front):** `roadmap-curator` + `product-lens` + refs
  {`roadmap-item-schema`, `okr-schema`} — depends on `align-context`/`design`/`specify` existing, so
  it **converges with building the backbone front**.
- **Defer (F7):** the real-interview node, analytics-driven discovery + experiments, heavier gates,
  the full BMD-hypothesis-graph as nodes, maturity-on-the-dev-sprint, KPI instrumentation.
