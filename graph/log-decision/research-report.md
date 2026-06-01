---
title: Research report for log-decision
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 2
---

# Research report for log-decision

## Identity

A small, mechanical agent — the third node in the debrief fleet, and the one shared across the
widest span of the arc. Invoked by `design`, `reconcile`, and `debrief`. Performs a two-layer
write: the **conclusion** lands in `docs/decisions.md` (the curated decisions store, D11); the
**surrounding reasoning** goes to gbrain (the recall substrate, D31). Returns a write-receipt;
is fully prompt-describable; has no live-thread benefit (the D24 axis). Not a crystallization
node.

The task brief specifies: do **not** amend `design` now — `design` already has a `log-decision`
invocation implied in the graph-map; this node's file declares its own outward edges, not the
inbound edges from its callers.

## Sources

1. `docs/graph-map.md` — canonical description: "two-layer write — conclusion →
   `docs/decisions.md`, reasoning → gbrain (D11/D31); a small **agent** (mechanical, fully
   prompt-describable, no live-thread benefit per the D24 axis); **not** a crystallization node";
   consumed by `design`, `reconcile`, `debrief`.
2. `docs/decisions.md` — D11 (two-layer decisions store), D31 (gbrain as recall substrate:
   write path, capability-gating, fallback to `docs/decisions.md` + Grep if gbrain absent,
   locality constraint from D17).

## Decisions

- **primitive: agent, mode: autonomous, determinism: deterministic.** Writing is mechanical:
  format the conclusion, append to `docs/decisions.md`, write reasoning to gbrain. No
  synthesis, no synthesis judgment. The D24 axis: fully describable in a spawn prompt, no
  benefit from the live thread.
- **Two-layer write with graceful fallback (D31).** Conclusion always goes to
  `docs/decisions.md`. Reasoning goes to gbrain if available; falls back to a structured
  comment appended under the conclusion in `docs/decisions.md` when gbrain is absent. The
  agent must **never silently skip a layer** — if gbrain is unavailable, note it in the
  write-receipt.
- **Edges.** `references decisions-store (on-demand)` — the write target (pending; `_refs/`
  file not yet authored → F7 prose). Gbrain is an inline MCP call (`mcp__gbrain__put`),
  not a graph edge (per graph-map non-nodes table: `gbrain` is inline MCP). No
  `composes-into` (leaf agent). No `invokes`. The inbound `invokes` edges are owned by the
  callers (`design`, `reconcile`, `debrief`); this node does not re-declare them.
- **Not a crystallization node.** `log-decision` produces a write to a general-purpose shared
  home (`docs/decisions.md` + gbrain), not a product-specific harness-local manifest. It does
  not read its own output on re-run to decide what is new; each call is a fresh atomic write.
  Crystallization is D35 — inapplicable here.

## Goals (outcomes)

Every significant decision logged in a sprint reaches both layers — the curated conclusion
(recoverable without gbrain) and the reasoning (recoverable with it). The earns-keep is
**completeness**: a decision that is made but not logged is a failure of this agent; a logged
decision with reasoning missing (layer skipped silently) is the same failure.
