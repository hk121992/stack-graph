---
title: Decomposition principles
type: reference
read-when: Deciding how to break a process into nodes, edges, and inline elements.
related: [graph-spec, maintenance-skill]
status: v0.0.0 — 2026-05-29
---

# Decomposition principles

**Status: scaffold — spec to be authored.**

How to decompose a process into the graph: granularity rules, what is a node vs an edge
vs inline, when to split, what's atomic. Adapted from the Be Civic corpus authoring rules
(checked: they transfer well).

## Will cover (adapted from the corpus)

- **Node / edge / inline discriminator** — from `skill-vs-path.md`'s branching test
  ("own branching + sequencing → a unit; reachable / invoked → an edge or inline").
- **Node anatomy** — from `canonical-shape.md` (frontmatter edge-arrays + imperative body
  + inline tags).
- **Imperative voice** — from `voice-and-style.md`, with one inversion: stack-graph nodes
  are operator/dev-internal, so internal references are allowed (the opposite of the
  customer-facing corpus rule).
- Granularity heuristics: generic-with-branches vs. one-node-per-variant.

## Open questions this section owns

- The atomic unit + when to split a node.
- How decomposition principles stay process-agnostic (dev now, any process later).
