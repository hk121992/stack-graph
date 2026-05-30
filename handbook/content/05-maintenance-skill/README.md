---
title: Maintenance skill (sg-graph-maintainer)
type: spec
read-when: Specifying or building the skill that authors and maintains the graph.
related: [graph-spec, decomposition, devops]
status: v0.0.0 — 2026-05-29
---

# Maintenance skill — `sg-graph-maintainer`

**Status: scaffold — spec to be authored.**

A dispatcher skill ("you are the dispatcher") that authors and maintains the graph,
modelled directly on `bc-corpus-creator`.

## Will cover

- **Modes** (analogues of corpus-creator's): `derive-graph` / inventory, `amend-node`
  (author/edit a node), `evaluate` (rubric a node/skill), `migrate` (re-render under a new
  schema), plus build/validate.
- **Subagent fleet** + model routing (judgment → opus; mechanical → sonnet).
- **References** (shape docs) + **validators** (cross-ref, schema) + a **graph builder**
  (corpus-creator already ships `build-graph.sh`).
- Authoring is mostly **by hand** (existing skills aren't graph-decomposed); the skill
  adapts source material and enforces shape + best principles.

## Open questions this section owns

- Exact mode set + the dispatch decision tree.
- What's validated mechanically vs. judged by an LLM pass.
