---
title: Research report for handbook-curator
type: research-report
status: complete
authored: 2026-05-31
last_updated: 2026-05-31
amended: []
sources_lifted: 3
---

# Research report for handbook-curator

## Identity

The orchestrator of the **curator cell** (D40): a collaborative skill that maintains the
curated-canon home (handbook + decisions) via the `raise → queue → integrate` loop. It is the
**vendored, general** node — a harness vendors it and points it at *its* canon repo/handbook via
overlay; the factory's `tooling/sg-handbook-curator` is the factory self-applying the same
pattern, and `bc-handbook-curator` is the product instance it is reverse-engineered from.

## Sources

1. `tooling/sg-handbook-curator/SKILL.md` — primary; the factory's own instance, just restored to
   fidelity (D40 drift fix). Modes, gates, hard constraints lifted and generalised.
2. `bc-handbook-curator` (Be Civic) SKILL + design doc — the mature original (the raise/queue/
   integrate lifecycle, the integrate contract, the agent loop + forcing rule).
3. `docs/decisions.md` D40 + `docs/graph-map.md` (curator cell) — the decomposition this node
   realises.

## Decisions

- **primitive: skill, mode: collaborative, determinism: generative.** It is the operator-facing
  dispatcher (mode selection, gates, PR open) — the collaborative/main-thread side of D24, not an
  isolated agent. Generative: it reasons about what drift means and how to phrase an amendment.
- **Modes are body branches (D34), not nodes.** `sweep` / `raise` / `queue` / `refresh-index`
  are live; `integrate` is **contract-only** (recorded, implementation deferred — its fleet,
  `consistency-checker`/`link-validator`, is not authored yet, F7); `comment`/`spec-amend`/
  `decision-doc` are deferred.
- **Edges.** `invokes` drift-detector + pr-author + queue-checker (the live fleet). `references`
  what-belongs + pr-description-shape + bundling-rules, all `load: on-demand` (consulted within
  `raise`, not needed by every invocation, so not `import`). **No `composes-into`:** the curator
  is its own maintenance cell, not a dev-sprint stage; it is *triggered* at session-end by the
  forcing rule (a `triggers` hook — deferred until the hook/event surface is modelled, F7),
  described in prose.
- **This is D38's write path.** `raise` is how a node's *proposed* durable finding reaches
  curated canon: propose → raise PR → queue → integrate → merged. Stated explicitly in the body.
- **Generalisation.** Repo, label, and handbook root are overlay-supplied, never literals — the
  same node serves the factory loop (canon = the factory) and a harness loop (canon = the
  product). Duplicate-detection in `raise` and the `queue` mode are kept (the bc fidelity the
  factory tooling had lost and D40 restored).

## Goals (outcomes)

(1) Canon stays free of drift/contradiction — drift does not escape to a sprint that reads it.
(2) A proposed durable finding reaches canon through **one** gated path (raise→queue→integrate),
not a bespoke side-store. (3) Duplicate and over-bundled canon PRs are prevented at authoring.
