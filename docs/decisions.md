---
title: Decision log
status: v0.1.0 — 2026-05-30
---

# Decision log

Locked decisions with rationale, alternatives weighed, and status. Each entry is terse;
the narrative is in [design-history.md](design-history.md), the current truth in the
[handbook](../handbook/content/). Supersede entries in place; keep the prior position.

## Factory & graph model

**D1 — Factory / product split.** stack-graph is a general, process-agnostic factory; a
product runs *inside* it. *Why:* a reusable core, with devops-improvement decoupled from
product work. *Status:* Accepted.

**D2 — Nodes are Claude primitives; no invented vocabulary.** A node is a real `.claude`
element (skill / agent / command / script); hooks are `triggers` edges, MCP is inline,
references are endpoints, settings are attributes. *Why:* ride Claude's own model; avoid a
parallel taxonomy that drifts. *Rejected:* a coined node-type set
(orchestrator/worker/reference/template/resolver). *Status:* Accepted.

**D3 — The graph is frontmatter on the canonical files.** Edges, classification, and goals
live as extra frontmatter on each node file; the record is *scanned*, not stored separately.
*Why:* a node file is then both a working primitive and a graph node — "derived lens, not a
store" becomes literal. *Status:* Accepted.

**D4 — Cyclic graph; only process edges loop.** Structural / binding / overlay edges are
acyclic; `precedes` / `can-follow` may cycle. *Why:* workflows loop, but the structural
skeleton should stay a DAG. *Status:* Accepted.

**D5 — Not everything is a node or edge.** Small references and MCP calls are inline. *Why:*
only control-flow-owning things earn a node. *Status:* Accepted.

**D6 — Canonical = real `.claude` files; plugin vendored from the handbook.** Files are the
source of truth (not a database, not gbrain); the plugin is a build output. *Status:*
Accepted.

## Customisation & composition

**D7 — Customisation = additive local overlay.** A harness attaches local nodes to the
vendored graph via an entry node or an edge; the vendored graph is never mutated; updates
arrive through Claude's native plugin-update. *Status:* Accepted.

**D12 — Ride the cascade where it works; generate where it doesn't.** Skills / `CLAUDE.md` /
plugins compose via Claude's native cascade; agents / hooks / settings (which Claude does
*not* nest) get a generated composed view; the per-directory scoped view is produced at a
runtime preamble; one global record is generated for analytics. *Why:* Claude's cascade is
partial (verified against the docs). *Status:* Accepted.

## Workflow & method

**D8 — "Workflow," not "Process."** A workflow is a named, possibly-cyclic traversal over
nodes. *Why:* product-agnostic vocabulary — "Process" collides with product-domain terms.
*Supersedes:* the earlier "stations" / "processes" grouping sketches. *Status:* Accepted.

**D9 — Collaborative → skill, autonomous → agent; collaboration front-loaded, autonomy in
the build.** *Why:* the boundary is simply where the operator is in the loop; the
design/alignment front is the thick collaborative part, the build is the long autonomous
span (between plan-defined breakpoints), and the close is collaborative again. *Supersedes:*
the first "human at start/end only, autonomous middle" framing. *Status:* Accepted.

## Loop, analytics & decisions

**D10 — Analytics is first-class: outcomes + metrics + earns-its-keep.** Every node declares
goals as measurable *outcomes* (not activities) and how they are measured; a node that never
moves its outcome is visible and cuttable. Instrumentation is deterministic. *Status:*
Accepted.

**D11 — Decisions are two-layer.** A curated decisions store (conclusions) over a recall
substrate (e.g. gbrain) of the surrounding reasoning. *Why:* curation and recall are
different jobs; neither subsumes the other. *Status:* Accepted.

## Build, tooling & process

**D13 — Build = hybrid generation.** An agent synthesises a node's canonical from a durable
research-report; deterministic resolvers inject the shared blocks; the render is
idempotency-gated. *Why:* the expensive curation survives format churn, and instrumentation
lands uniformly. *Status:* Accepted.

**D14 — Dev tooling is separate from vendored output; `sg-` prefix.** The maintainer and
curator live in `tooling/`, install by symlink, and are marked `sg-*`; they are not shipped
as vendored, namespaced nodes. *Status:* Accepted.

**D15 — Contribution: bootstrap-direct, then PR-gated.** During bootstrap, spec and tooling
changes land by direct commit to `main`; once `08-devops` fixes the branch/label model and
the curator is exercised, handbook changes move to labelled PRs raised by the curator.
*Status:* Interim (bootstrap).
