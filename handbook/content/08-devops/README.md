---
title: DevOps — how stack-graph develops itself
type: procedure
read-when: Working on stack-graph itself — branching, PRs, the improvement loops.
related: [overview, overview/maintenance, analytics]
status: v0.0.0 — 2026-05-29
---

# DevOps — how stack-graph develops itself

**Status: scaffold — spec to be authored.**

## Will cover

- **PR discipline** (modelled on the Be Civic handbook): changes land via labelled PRs;
  the maintenance skill raises them; a periodic integrate cadence.
- **The two improvement loops:**
  - **Factory loop** — a consuming workspace raises PRs *to* stack-graph (general improvements).
  - **Harness loop** — product-specific improvements land within the consuming workspace.
- Branch policy, CI gates, and the dev-wrapper for tests.

## Open questions this section owns

- Branch model + label conventions for the factory repo.
- How factory PRs from a consuming workspace are proposed and reviewed.
