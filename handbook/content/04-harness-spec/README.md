---
title: Harness specification
type: spec
read-when: Defining how a consuming workspace customises the vendored graph.
related: [plugin-spec, graph-spec]
status: v0.0.0 — 2026-05-29
---

# Harness specification

**Status: scaffold — spec to be authored.**

A **harness** is the consuming workspace's specialising layer over the vendored, general
stack-graph. It is where a product (e.g. Be Civic) puts its own instructions, skills, and
workflows.

## Will cover

- What lives in a harness vs. the general factory.
- **The additive local-overlay model** — local **top-level entry nodes** + **edges that
  connect into the vendored graph**, so everything is one traversable graph that can cross
  into local branches — **without mutating the canonical vendored graph.**
- Fully-vendored now; a generalised-graph-plus-local-extensions split is a future option.
- Be Civic as the first harness instance (lives in the be-civic workspace).

## Open questions this section owns

- **Q6 — the overlay mechanism:** how entry nodes + connecting edges compose with the
  vendored graph at build/traverse time; namespacing; conflict rules.
