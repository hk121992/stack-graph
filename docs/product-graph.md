---
title: Product arc — working notes
status: notes — 2026-05-30
---

# Product arc — working notes

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

_To be filled from the background research agent: prior art (ADOPT/ADAPT/REJECT), the product-arc
sketch (stages + goals + edges + roadmap artefact + analytics opening), and open questions._
