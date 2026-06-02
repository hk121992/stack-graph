---
title: Product arc — working notes
status: notes — 2026-05-30
---

# Product arc — working notes

> **Superseded in part (2026-06-01).** The *roadmap artefact* sketched here is now the
> **product-dashboard** — see `docs/product-dashboard-design.md` (D49: record-primary, renamed from
> "roadmap"). The PM arc itself is designed in `docs/product-management-design.md` +
> `docs/pm-graph-map.md` (D43 two faces, D44 carrier, D45 dial). Retained for its **prior-art survey**
> (CE / gstack / OSS / frameworks) and the **two-arc loop** sketch — both still valid groundwork.

A **separate graph from the dev-sprint** — the product-management arc that sits *upstream* of
the sprint and loops back from it. Notes + direction now; prior-art research is being gathered
(a background agent surveys CE / gstack / Anthropic Skills / OSS / PM frameworks). Decision:
[`decisions.md` D32](decisions.md). Keep working the **sprint arc** first; this is parked
groundwork, authored before we start building nodes.

## The shape (operator direction)

- **A separate arc/tree**, not a stage of the dev-sprint. It feeds the sprint and the sprint
  loops back into it — two arcs, bidirectionally linked.
- **Entry = idea-triage**, shaped like a **product manager**: where ideas/inputs are weighed
  against strategy and turned into sprint-ready intent. This is the seam into the dev-sprint's
  `align-context`.
- **Strategy over backlog.** A backlog fits poorly with AI-paced development (too fast). What
  matters is **product strategy**: a clear long-term concept of what you're building toward, the
  **key questions** to answer over time, and a discipline for **building a product customers
  love** — not feature-by-feature drift.
- **A third top-level artefact: the product roadmap**, alongside the **handbook** (canonical
  spec) and the **graph** (the `.claude` primitives). General *structure* in the factory;
  product-specific *content* in the harness.

## The two-arc loop

```
product arc:  inputs → idea-triage → strategy → roadmap ─┐
                  ▲                                       │ feeds (sprint-ready intent)
                  │ learnings / outcomes                  ▼
dev-sprint arc:   debrief ◄─────────────────────────  align-context → … → land → debrief
```

- **Feeds:** the product arc hands sprint-ready intent into `align-context`.
- **Loops back:** the sprint's `debrief` returns outcomes + learnings into the product arc
  (did the bet move the product? what did we learn about customers?).

## Product analytics — an opening, not a build

Product analytics (usage, retention, customer signal) is a **connection point** into
idea-triage — design only the *opening* (an input edge), not the analytics system itself. It is
likely **product-specific / harness**, so the factory exposes where it plugs in, and a consumer
supplies the actual source.

## Prior art posture (to confirm against the research)

- **gstack** has strong product *parts* — `office-hours` (YC forcing questions, startup mode),
  `plan-ceo-review` (CEO/founder lens, 10-star product, scope) — but is **feature-based**; it
  does not fit them into a long-term product arc. Reuse the parts; supply the missing arc.
- **CE** — `ce-strategy` (durable STRATEGY.md, pushback interview), `ce-ideate`/`ce-brainstorm`,
  `ce-product-pulse` (outcome measurement). Closest to a durable product layer; evaluate as the
  spine.
- **External** — Anthropic Skills + OSS PM systems; established frameworks (jobs-to-be-done,
  North Star, continuous discovery + opportunity-solution trees, SVPG product strategy) — which
  transfer to a strategy-over-backlog, AI-paced arc. (Be Civic has only just started here.)

## Part B — research report

### Prior art

- **CE — the closest model (ADOPT the spine).** `ce-strategy` maintains **`STRATEGY.md`** — a
  short, durable, repo-root anchor (Target problem / approach / who-it's-for / key metrics /
  tracks / milestones / not-working-on), grounded in **Rumelt's kernel** (diagnosis → guiding
  policy → coherent action) + JTBD; principles "anchor not plan", "short is a feature", "durable
  across runs". `ce-product-pulse` = outcome measurement seeded from the strategy's metrics
  (read-only, single page) — the analytics-opening model. `ce-ideate → ce-brainstorm → ce-plan`
  is an explicit discovery chain; downstream skills already read `STRATEGY.md` as grounding.
  **ADAPT** the chain into product-arc *nodes* terminating at a **triage-into-sprint** handoff
  (the sprint owns planning). CE's only gap: no roadmap-as-artefact, no formal loop-back.
- **gstack — strong lenses, no arc (ADAPT the parts).** `office-hours` startup-mode (six forcing
  questions) → the **idea-triage interview**; `plan-ceo-review` (CEO lens, scope modes) → a
  **lens edge** the strategy/roadmap nodes invoke. The AskUserQuestion decision-brief format →
  ADOPT wholesale. Operator's read confirmed: these are feature-time lenses, not a product arc.
- **OSS / Anthropic (ADOPT structure, REJECT backlog).** Anthropic's `skills` repo has no PM
  skill. `deanpeters/Product-Manager-Skills` (product-strategy-session / discovery / roadmap-
  planning workflows) and `product-on-purpose/pm-skills` (Triple Diamond with a Measure→Iterate
  loop, a `pm-critic` adversarial sub-agent, PM↔eng contracts) confirm the named-arc granularity
  and the closing loop — but are **backlog/PRD-heavy** (RICE quarters, story-mapping). Take the
  structure + the loop; **reject the backlog gravity** (it re-creates the drift we're avoiding).
- **Frameworks (the transferable canon).** ADOPT **Cagan/SVPG** vision→strategy→*problems* ("give
  teams problems, not feature roadmaps") as the governing philosophy; **Rumelt** kernel (strategy
  doc shape); **JTBD** (persona/value); **North Star + inputs** (metrics / analytics opening).
  ADAPT **Torres' Opportunity-Solution Tree** as the tree shape of the arc (outcome→opportunities
  →solutions→experiments), adapting the cadence to AI pace. REJECT RICE/backlog for the core.

### The product arc — sketch

A second cyclic arc, upstream of and bidirectionally coupled to the dev-sprint. Front
(triage/discovery/strategy) = collaborative skills; analytics intake = autonomous agent; review =
a lens edge.

| # | Node | Primitive | Goal | Source |
|---|---|---|---|---|
| 0 | `product-analytics-intake` | agent | pull outcome signal into a digest that *opens* triage — connection point only | `ce-product-pulse`; North Star; 06-analytics event log |
| 1 | `idea-triage` ("the PM") | skill | pressure-test an idea/signal → kill / park / promote | `office-hours` six questions; `ce-ideate` |
| 2 | `discovery` | skill | promoted idea → validated **opportunities** (problems worth solving), not solutions | Torres OST; CE discovery; `ce-brainstorm` |
| 3 | `strategy` | skill (durable) | maintain vision + guiding policy + **key questions to answer over time** | `ce-strategy` + Rumelt + Cagan |
| 4 | `roadmap` | skill (durable) | maintain the **third top-level artefact**: outcomes/problems as sequenced bets, not a backlog | Cagan "problems not features"; OST; CE "Tracks" |
| 5 | `triage-into-sprint` | skill→edge | select the next bet, frame as a problem-to-solve, hand to `align-context` | `ce-plan` handoff (framing, not a PRD) |
| (lens) | `product-review` | lens edge | adversarial / CEO-scope review of strategy/roadmap | `plan-ceo-review`; `pm-critic` |

**The roadmap artefact (third top-level, alongside handbook + graph).** General structure;
product content is harness. Modelled on `STRATEGY.md` (durable, short, anti-fluff) but outcome/
problem-shaped: **Vision · Guiding policy · Who/the job (JTBD) · North Star + inputs · Open
questions · Bets in flight/sequenced · Decided/not-doing.** Frontmatter-shaped where it overlaps
the graph (bets carry edges into the sprint); its own top-level store because it is durable
*product memory*, not a traversal.

**Consider — Value Proposition Canvas + hypothesis/evidence.** The artefact (and the
`discovery`/`strategy` nodes) should consider a **Value Proposition Canvas** (customer
jobs/pains/gains ↔ product fit) and model **hypothesis → evidence accumulation** off Be Civic's
business-model-discovery project (`bc-bmd`: Business Model Canvas, VPC, hypotheses, findings →
`bmd.becivic.be`) and the OSS PM systems. Treat BMC/VPC as **harness-supplied structure** the
strategy/discovery nodes populate; the *mechanism* — hypotheses build up, evidence accrues, the
open questions get answered over time — is the general, factory part. (Be Civic's BMD is itself
immature — adapt the shape, not the maturity.)

**The analytics opening (connection point only).** A typed `product-signal` inlet into
`idea-triage` (a digest of outcome metrics — what users love/abandon, North Star movement) that a
harness supplies via its own analytics; plus an instrumentation **contract** — the roadmap's
North Star/inputs declare *what* to measure, the harness wires *how* (mirrors `ce-product-pulse`'s
metric-source config). Read-only, locality-respecting (06-analytics).

**Feed + loop-back edges.** Feed: `triage-into-sprint --precedes→ dev-sprint:align-context`
(payload = a framed problem, not a spec); `strategy`/`roadmap` are also `references`-grounding for
`align-context`. Loop-back: `dev-sprint:debrief --precedes→ product:product-learning` → updates
`strategy` (guiding policy / open questions) and `roadmap` (resolve a bet, re-sequence). Two-loop
(08-devops): product-arc *content* improvements = harness loop; product-arc *machinery*
improvements = factory loop.

### Open questions for the operator (parked until we design this arc)

1. **Roadmap = one `ROADMAP.md` anchor (simple, CE-proven) or a `roadmap/` tree of outcome→bet
   files with graph frontmatter (richer, graph-integrated, more upkeep)?**
2. **`strategy` + `roadmap`: two nodes or two sections of one artefact?** (rec: two nodes, one
   artefact.)
3. **`idea-triage`: thin kill/park/promote gate + separate `discovery` node, or triage absorbs
   lightweight discovery?** (rec: thin gate + separate discovery.)
4. **Backlog: zero-tolerance in the core, or ship one *optional harness module* (RICE/story-map)
   for products that want it?**
5. **Loop-back cadence: every sprint debrief, or only bets tagged as answering a roadmap open
   question?** (responsiveness vs roadmap churn.)
6. **Own dev-time maintainer (`sg-roadmap-steward`) or maintained in-arc by the strategy/roadmap
   nodes themselves?** (rec: in-arc, no separate dev tool — the roadmap is product memory.)
