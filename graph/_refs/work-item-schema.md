---
kind: reference
id: work-item-schema
title: Work-item schema — the carrier on the product-dashboard
description: The structured state model of a work item (a carrier, D44) on the product-dashboard's work ledger — lifecycle, projected dev-stage, gate decisions, transition history, decomposition, and the curated record content. The unit the dev-sprint carries and the product-dashboard renders.
status: v0.1.0 — 2026-06-01
---

# Work-item schema

A **work item** is the unit of product work — the **carrier** (D44) that travels the dev-sprint and is
rendered on the product-dashboard across its lifecycle (forward view → in-flight → record). It is **not a
scalar stage**: it is a parent record with a structured state model. Its fields split by *who writes
them* — which is the crux of the projected-stage, content-only-curator contract.

## State — projected or decided (never hand-curated as a plan)

| field | value | written by |
|---|---|---|
| `id`, `title` | identity | author, at creation |
| `lifecycle_state` | `idea → discovery → defined → committed → in-delivery → shipped → live → (parked \| killed)` | advanced at **gates** (operator go/no-go) |
| `current_dev_stage` | the dev-sprint stage (populated only when `in-delivery`) | **projected** from the dev-sprint traversal (node-enter/-exit events tagged with the carrier); operator-overridable; **never written by the curator** |
| `transition_history[]` | append-only log of `lifecycle_state` transitions + dev-stage entries, each with a timestamp | appended on transition / projected from traversal |
| `gate_decisions[]` | append-only `{gate, decision, owner, timestamp, evidence_refs, confidence, conditions?, override?}` | appended at each gate (operator) |
| `children[]` | impl-unit work items (decomposition at `plan`/`build`) | author at decompose; the parent aggregates child state |

## Record content — curated, PR-gated (the deliberate "why")

| field | meaning |
|---|---|
| problem / opportunity | the problem worth solving; **problem-framed, not solution-framed**, until `committed` |
| `outcome_link` | the objective / OKR it serves (→ the vision); an **authored** link (D38/D39), never inferred |
| `value_prop_link` | the VPC customer job / pain / gain it addresses (Strategyzer) |
| `risk_state` | the four-risks evidence state (value / usability / feasibility / viability), each by *strength rung × maturity bar* (see `four-risks`) |
| `tier` | `T1 \| T2 \| T3` — the per-item override on the maturity dial (D45) |
| solution | the solution summary — populated **only once `committed`** (the item reaches Now) |
| `links` | spec-amendment PR, build PRs, experience-contract (if experience-bearing), debrief |
| `disposition` | for `parked` / `killed`: the reason — **kept, not deleted** (the learning record) |

## Invariants

- **The curator writes content, never state.** `current_dev_stage` / `transition_history` are projected;
  `lifecycle_state` advances at operator gates; `gate_decisions` are operator-appended. The
  `product-dashboard-curator` maintains only the **content** fields above.
- **One identity, many projections.** The same work item is rendered three ways — the forward workspace
  (opportunity maturity), the delivery traversal (in-flight stage), and the durable record (decision +
  evidence history). The surface renders facets; it never forks the carrier.
- **The durable record is `gate_decisions[]` + `risk_state` + `transition_history[]`** — proof we made
  the call deliberately on the best evidence available, and when. (Whether it was *right* is judged later
  by outcomes — the Progress panel + `debrief`.)
- **Problem-framed until committed.** The item carries a problem/opportunity through `discovery`; the
  solution crystallises only at `committed` (Torres). Don't lock a disposable solution early.
