---
title: Analytics & instrumentation
type: spec
read-when: Specifying how usage and workflow-conformance are measured.
related: [graph-spec, devops, concepts]
status: v0.0.0 — 2026-05-29
---

# Analytics & instrumentation

**Status: scaffold — spec to be authored.**

## Will cover

- **Baseline** — the host-level transcript engine (already built; parses session
  transcripts for cost/tokens/tools/model usage). Works on any session.
- **Workflow / conformance layer** — our own **preamble + hooks** emit purpose-built
  events (which node/process, gates hit, outcome) bound to graph nodes/edges.
- **The improvement loop** — friction → amendments (PR-gated) → re-measure.

## Open questions this section owns

- **Q8 — event binding:** how observed events map onto nodes/edges to measure traversal
  and conformance against a process.
