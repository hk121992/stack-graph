---
title: Concepts
type: reference
read-when: You need the shared mental model before reading any spec.
related: [graph-spec, decomposition, overview]
status: v0.0.0 — 2026-05-29
---

# Concepts

**Status: scaffold — spec to be authored.**

The shared mental model and vocabulary: what the **primitives** are, what the **graph**
is, what a **process / workflow** is (a named, possibly-cyclic traversal over primitive
nodes), the **improvement loop**, and the **generality stance** (dev is the first process
domain; the system must not hard-code "software").

## Will cover

- The primitive vocabulary (Claude Directory taxonomy), and the node / edge / **inline**
  distinction — not everything is a node or edge.
- "Process" vs "workflow" — naming, and why we drop product terms like Process/Path.
- The factory / product split and the two improvement loops at a glance.

## Open questions this section owns

- **Q4 — process/workflow representation.** Is a workflow a named cyclic subgraph, a
  traversal template, or an overlay? How are loops and branches expressed?
- **Q7 — generality guardrails.** What is the minimal core abstraction that lets a
  non-dev process domain drop in without baking in dev assumptions?
