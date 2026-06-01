---
title: Research report for spec-diff
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 2
---

# Research report for spec-diff

## Identity

A stateless, read-only agent that compares what was built against the spec touchpoints the
upstream design and `specify` stage settled, and returns a structured diff of agreements,
discrepancies, and unaddressed touchpoints. Invoked by `reconcile` (primary home), and also
signalled as a consumer by `specify` and `review` in the graph-map. Leaf-ish: it reads and
reports; it does not write, loop, or decide.

## Sources

1. `graph/drift-detector/drift-detector.md` — structural mirror. Same agent shape (stateless,
   autonomous, read-only, returns a structured digest); same three-consumer invocation pattern.
   The body format (spawn bundle → apply scan → output YAML) is lifted verbatim and adapted to
   the build↔spec comparison domain.
2. `docs/dev-sprint-backbone-design.md` § `reconcile` — the primary invoker. Specifies
   `spec-diff` as the "build ↔ spec-touchpoint comparison" agent `reconcile` invokes in its
   `draft` mode; also says `specify` and `review` can invoke it, but `reconcile` is the load-
   bearing home.

## Decisions

### primitive: agent, mode: autonomous, determinism: generative

Read-only comparison over a bounded set of files and touchpoints; returns a digest, never
mutates. No live-thread or operator-in-loop behaviour — the agent side of the context axis
(D24). Generative because interpreting whether a built change satisfies a spec touchpoint
requires judgment.

### Edges

- `composes-into dev-sprint @ reconcile` — the primary structural home, per the graph-map's
  "Shared sub-nodes" table.
- `invoked by reconcile, specify, review` — those nodes hold the `invokes` edges; `spec-diff`
  does not declare them inbound (edges are directed from the caller). `reconcile` does not exist
  yet (F7); `specify` already exists — the edge is payable from `specify`'s side but `specify`
  currently declares only `drift-detector` and `pr-author` under `invokes`. The map says
  `specify` invokes `spec-diff`; that edge is deferred (F7, payable when `specify` is amended).
  `review` similarly deferred.
- No `references` edges needed beyond the instrumentation preamble: the spawn bundle carries
  the touchpoints and build artefact pointers directly; there is no shared lookup doc to import.

### Caller model (spawn bundle)

The agent receives its scope entirely from the spawn prompt — no ambient state. The caller
(e.g. `reconcile`) passes: the spec touchpoints (as a structured list from the design doc / spec
amendment PR), and the set of built artefacts or diff to evaluate. This keeps the node general
and harness-agnostic.

### Leaf-ish placement

`spec-diff` invokes nothing and writes nothing. It is as leaf-like as `drift-detector`. Its only
"composition" is upward (`composes-into reconcile`). This makes it safe to author now without
any downstream dependency.

### What it does not do

- It does not decide whether discrepancies require a spec amendment or a build rework — that
  judgment is `reconcile`'s `adjudicate` mode.
- It does not scan the full canon for drift — that is `drift-detector`'s job.
- It does not read the carrier or advance lifecycle state.

## Goals (outcomes)

Spec-reality drift is surfaced **at reconcile**, before landing, rather than discovered by
users or a future audit. The diff is **precise** — real discrepancies between the spec
touchpoints and the built change, not style observations.
