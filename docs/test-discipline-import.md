---
title: test-discipline — import note (Pocock TDD → graph reference)
type: design-note
status: complete
authored: 2026-06-05
for: graph/_refs/test-discipline.md
---

# test-discipline — import note

Records why the `test-discipline` reference exists, what was taken vs left behind, and the provenance.
It is a **design note**, not a research-report: per [`05-maintenance-skill`](../handbook/content/05-maintenance-skill/README.md)
a standard reference is a flat `graph/_refs/<id>.md` file with **no `graph/<id>/` working dir and no
research-report** — references are single-source curated content, not synthesised nodes. (External
provenance for a ref lives inline in the ref + here, mirroring `graph/_refs/pm-methodology-provenance.md`.)

## Source

Matt Pocock's `engineering/tdd` skill — **github.com/mattpocock/skills**, `skills/engineering/tdd/`,
pinned commit **`aaf2453fbdfe7a15c07f11d861224f34ab4b53cb`**, MIT © 2026 Matt Pocock. Six files:
`SKILL.md`, `tests.md`, `mocking.md`, `interface-design.md`, `refactoring.md`, `deep-modules.md`. The
reference adopts ideas/patterns (a rubric), not substantial verbatim text; the lift is reproducible
from the pinned commit.

## What was taken vs left behind (the seam)

The graph already shipped half of this skill, so the reference takes only the gap neither consumer names.

| from Pocock's tdd | disposition | why |
|---|---|---|
| good/bad-test rubric (`tests.md`, SKILL philosophy) | **taken** | the core: behaviour-through-public-interface, integration>unit, one logical assertion, survives-refactor |
| mocking discipline (`mocking.md`) | **taken** | mock at boundaries only, never internal; DI; SDK-style interfaces |
| design-for-testability (`interface-design.md`) | **taken (testability slice)** | load-bearing for "behaviour through a public interface"; what `lens-tests` doc-mode needs |
| RED→GREEN→REFACTOR loop, tracer-bullet, vertical-not-horizontal, minimal-code (`SKILL.md` workflow) | **left** | already owned by `build` ("Incremental arc — build mode"); re-owning would duplicate a node and split one concept |
| deep-modules (`deep-modules.md`), refactor catalogue (`refactoring.md`) | **left (forward-pointer)** | the fuller *architecture* doctrine; belongs to the future `improve-codebase-architecture` import, which shares this exact territory |

## Wiring

Consumed (on-demand) by two nodes — the reference is the **named standard**, not new rules:

- **`build`** — writes a slice's tests to this shape (`references: test-discipline, load: on-demand`).
- **`lens-tests`** — grades against it; its tuned inline hunt-list is preserved and reframed as this
  standard's review-time application (`references: test-discipline, load: on-demand`).

`index` projects `consumed_by: [build, lens-tests]`; vendor Stage-4 parity + G2 load-verify pass.

## Next

~~`improve-codebase-architecture` is the natural next import~~ — **discharged 2026-06-10**: the
import landed as the `architecture-review` node + the `architecture-doctrine` reference, and
`test-discipline` now carries the promised `references` edge to `architecture-doctrine` (see
`docs/architecture-review-import.md`). The shared doctrine is single-sourced in both directions:
the doctrine ref owns module/seam shape; this ref owns test quality.
