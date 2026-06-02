---
title: Research report for queue-checker
type: research-report
status: complete
authored: 2026-05-31
last_updated: 2026-05-31
amended: []
sources_lifted: 2
---

# Research report for queue-checker

## Identity

A stateless, mechanical agent that materialises the canon-PR **queue** — the set of open
labelled PRs — with one call, in two modes: `list` (the whole queue) and `check-duplicate`
(the subset overlapping a target file set). Part of the curator cell (D40); invoked by
`handbook-curator` at `raise` (duplicate-check) and `integrate` (list).

## Sources

1. `tooling/sg-handbook-curator/agents/queue-checker.md` — primary; lifted, generalised off the
   hardcoded repo/label (the harness overlay supplies repo + label).
2. `bc-handbook-curator/agents/queue-checker.md` — the mature original.

## Decisions

- **primitive: agent, mode: autonomous, determinism: deterministic.** Pure mechanical JSON
  munging over one query — **no model judgment**, hence `deterministic`. It is a node (not inline)
  for two reasons that survive the D34/07 right-sizing test: it **isolates** the raw query output
  from the caller's context (returns a clean list), and it is **reused** by two curator modes.
- **Edges: none that resolve.** Curator-only; the structural link is the curator's `invokes`
  edge. It composes into no dev-sprint stage and the maintenance arc node does not exist (F7), so
  `edges: {}` — like `explore`.
- **Generalisation.** Repo and label are spawn-prompt inputs (harness overlay), not literals — so
  the same node serves the factory loop (canon repo = the factory) and a harness loop (canon repo
  = the product).

## Goals (outcomes)

Duplicate and colliding canon PRs are **prevented before they open** (the queue is visible at the
moment `raise` would author); and the queue read is **cheap and exact** (one call, no judgment,
no drift from the live PR state).
