---
title: architecture-review — import note (Pocock ICA → graph node + reference)
type: design-note
status: complete
authored: 2026-06-10
for: graph/architecture-review/ + graph/_refs/architecture-doctrine.md
---

# architecture-review — import note

Records why the `architecture-review` node and the `architecture-doctrine` reference exist, what
was taken vs left behind, and the provenance. A **design note**, not a research-report (the node
has its own research-report under `graph/architecture-review/`; the reference, per
[`05-maintenance-skill`](../handbook/content/05-maintenance-skill/README.md), needs none).

This import **discharges the forward pointer** in
[`test-discipline-import.md`](test-discipline-import.md) §Next: the deep-modules/interface-design
doctrine that import deliberately left behind now lands here, and `test-discipline` gains its
promised `references` edge to `architecture-doctrine`.

## Source

Matt Pocock's `engineering/improve-codebase-architecture` (ICA) skill —
**github.com/mattpocock/skills**, `skills/engineering/improve-codebase-architecture/`, pinned
commit **`aaf2453fbdfe7a15c07f11d861224f34ab4b53cb`**, MIT © 2026 Matt Pocock. Five files:
`SKILL.md`, `LANGUAGE.md`, `DEEPENING.md`, `INTERFACE-DESIGN.md`, `HTML-REPORT.md`. The import
adopts ideas/patterns (a doctrine + a process), not substantial verbatim text; the lift is
reproducible from the pinned commit. Verbatim copies of `LANGUAGE.md` and `HTML-REPORT.md` were
already vendored (2026-06-03) at `tooling/sg-language-reviewer/source-material/pocock-ica-*.md`
as sources for the skill-language standard — that use is orthogonal and unchanged.

## What was taken vs left behind (the seam)

| from Pocock's ICA | disposition | why |
|---|---|---|
| vocabulary + principles (`LANGUAGE.md`) | **taken → `architecture-doctrine` ref** | the one named vocabulary for structural judgment: module/interface/depth/seam/adapter/leverage/locality, deletion test, interface-is-the-test-surface, two-adapters-=-real-seam |
| dependency categories + seam discipline + replace-don't-layer (`DEEPENING.md`) | **taken → `architecture-doctrine` ref** | same doctrine, consumed at the same step — one ref, not two |
| 3-phase review process (`SKILL.md`: explore → candidate report → grilling loop) | **taken → `architecture-review` node, mode `review`** | the operator-facing capability; adapted to graph routing (below) |
| Design-It-Twice interface fan-out (`INTERFACE-DESIGN.md`) | **taken → `architecture-review` node, mode `interface-design`** | a body mode, not a separate node (02-graph-spec granularity rule); never auto-chained from the report |
| candidate-card report format (`HTML-REPORT.md`) | **taken → the node body's report template** | presentation, not doctrine; cards are opportunity-shaped (strength badge + dependency category), deliberately **not** findings-schema (defect-shaped) |
| CONTEXT.md domain-glossary coupling | **adapted** | → a harness-supplied external reference pointer `domain-glossary` (`external: true, load: on-demand` — the health-manifest pattern); the factory ships only the pointer |
| docs/adr/ ADR coupling | **adapted** | → the factory's decisions store, written via `invokes log-decision` (the store's only writer); load-bearing rejections become decisions so future runs don't re-suggest |
| temp-dir throwaway report | **changed (operator decision, 2026-06-10)** | reports are **filed**: generative + non-replayable ⇒ committed (artefacts-design §1, the D60 learnings-archive precedent) — see Report persistence below |

## Wiring

- **`architecture-review`** (node) — `invokes: explore, log-decision`; `references:
  architecture-doctrine (on-demand), instrumentation-preamble (import), domain-glossary
  (external, on-demand)`; `escalates: triage`. No `composes-into`/`precedes`/`can-follow`: a
  standing operator-triggered capability outside any arc (the optimise/health stance). An
  accepted candidate escalates to `triage`, which owns the incremental-vs-wholesale route rule
  and itself reaches `product-dashboard-curator add-item` on the wholesale branch — the node
  never routes work directly.
- **`architecture-doctrine`** (ref) — consumed on-demand by `architecture-review`,
  `lens-maintainability` (grounds its structural hunt-list vocabulary), and `test-discipline`
  (the promised back-edge; the testability slice stays owned there, single-sourced in each
  direction).

## Report persistence

A review run writes a **committed pair** under the dashboard surface, at the
`architecture-reviews-root` binding (new **optional** key in the `bindings-contract` reference —
committed-not-`.stack-graph/` per the `learnings-archive`/D60 test; optional-when-capability-unused
per the `axis-root` precedent): `<yyyy-mm-dd>-<slug>.html` (self-contained Tailwind+Mermaid report, per
the card template) + `<yyyy-mm-dd>-<slug>.md` (frontmatter record: scope + `candidates[]`, each
`{title, strength, dependency_category, disposition: pursued|rejected|open, link}`). Dispositions
are written at grilling close — pursued links the work-item id triage created; rejected links the
decision id — so traceability flows outcomes ↔ report without mutating the HTML. No manifest at
v0; portal publication of past reviews is input-gated (no reviews exist yet).

**Harness ripple:** an instantiated harness (e.g. be-civic) adds the one-line
`architecture-reviews-root` key to its `bindings.yaml` before the node first runs there —
harness-side, applied in that workspace's own session, never from this repo.

## Next

None parked. The doctrine's potential consumers beyond the three wired here (e.g. `design`
judging seam placement at design time) can add their own `references` edge when the need is
real — the ref is the single source either way.
