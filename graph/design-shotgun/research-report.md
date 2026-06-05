---
title: Research report for design-shotgun
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 2
external_analogue_found: true
external_corpora_searched: ["gstack operator skill set (design-shotgun, design-consultation)", "the C-family sibling node design-implement (this wave)", "the ux-principles reference (graph/_refs)"]
researcher_adequacy_note: |
  The external analogue is gstack's design-shotgun skill — a mature, in-production method for visual
  brainstorming: generate N distinct variants, open a comparison board, collect structured feedback,
  iterate. It was lifted and generalised: the $D/$B binaries, the parallel-subagent generation
  plumbing, /tmp-then-cp sandbox workarounds, gstack taste-profile + telemetry boilerplate, and the
  AskUserQuestion decision-brief format are all gstack mechanism, dropped in favour of the method
  (concepts → confirm → generate → compare → structured feedback → iterate → save approved).
  primitive/mode is unambiguous: a collaborative skill whose comparison board IS the chooser and whose
  feedback loop holds the operator in the loop — skill↔collaborative, generative determinism (variant
  generation is divergent synthesis, not a fixed transform). Goals frame as outcomes cleanly: a
  direction is chosen with recorded rationale, the variants are genuinely distinct (the
  anti-convergence test), and the loop converges. Judgment calls for the translator: DESIGN.md is a
  *harness-supplied* default constraint (referenced, never hardcoded); the variant-rendering mechanism
  (gstack's image generator) is left inline/harness, the node names the artefact (N comparable
  variants + a board). `precedes design-implement` and `composes-into dev-sprint @ design` are both
  fixed by the task.
---

# Research report for design-shotgun

## Identity

**Candidate id:** design-shotgun
**Candidate title:** Design shotgun
**Scope:** Explore visual design directions for a user-facing surface: generate N deliberately
distinct variants, open a side-by-side comparison board, collect structured operator feedback
(ratings, comments, a preferred direction, regenerate/remix asks), iterate, and record the approved
direction with its feedback. This is divergent visual brainstorming, the front of the visual-design
thread. Excludes: producing the *production* surface from the approved direction (that is
`design-implement`, downstream) and grading a *live* surface (that is `design-review`).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| A visual direction is chosen by the operator with its rationale recorded, before any production UI is built | share of surfaces entering design-implement with a recorded approved direction + feedback vs ones that started production with no explored direction; downstream visual rework traced to a direction never explored up front | surfaces that skip exploration and then churn at implement trend down; a node whose chosen directions are routinely discarded at implement is mis-calibrated |
| The variants are genuinely distinct, so the comparison is a real choice and not three shades of one idea | share of variant sets passing the anti-convergence test (distinct font / palette / layout per variant; headline-swap test); operator "these all look the same" rejections | convergence rejections trend toward zero; a node that emits look-alike variants is failing its one job |
| The feedback loop converges on an operator-approved direction rather than stalling | rounds to approval per surface; share of sessions reaching a saved approved direction | rounds-to-approval stays bounded; a session that never converges despite real variants is a calibration signal |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** The comparison board IS the chooser and the feedback loop holds the operator in the
loop — show variants, take structured feedback, regenerate/remix, repeat until the operator approves.
That live, operator-driven exploration is collaborative by construction; it loads into the current
context. skill↔collaborative. (The task fixes `mode: collaborative` for both C-family nodes.)

**`determinism:`** `generative`

**Rationale:** Generating distinct design directions is divergent synthesis — the same brief yields
different (and deliberately varied) variants every run. Generative.

## Contract

**Input:** A surface/brief to explore (who it is for, the job it does, what exists, the user flow,
edge cases), the harness DESIGN.md (the default visual constraint — fonts, colour, spacing), and the
ux-principles standard. Optionally a current-surface screenshot for the "I don't like THIS" evolve path.

**Output:** N comparable design variants + a comparison board, and a **recorded approved direction**
with its structured feedback (preferred variant, ratings, comments, overall direction), handed to
`design-implement`. The node-enter/-exit instrumentation events. No carrier write.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack operator skill set | "explore visual design directions — how is this really done?" → design-shotgun | yes | design-shotgun-skill.md (kept, generalised) |
| gstack operator skill set | "the default design constraint — DESIGN.md" → design-consultation | yes | design-consultation-skill.md (edge-only / context) |
| C-family sibling (this wave) | the downstream production node it precedes → design-implement | yes | wired as `precedes`, not lifted |
| graph/_refs | the shared visual-and-interaction standard → ux-principles | yes | wired as `references` (on-demand), not lifted |

design-shotgun is a real, in-production external counterpart to "explore design options". The node is
challenged against how the job is really done. The image-generation mechanism inside design-shotgun
(gstack's `$D` binary, parallel-subagent generation) is gstack-specific and dropped — the node names
the artefact it must produce (N comparable variants + a board + recorded feedback), which any harness
satisfies with its own generation inline.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/design-shotgun-skill.md` | keep | the core method, generalised |
| `source-material/design-consultation-skill.md` | edge-only / context | DESIGN.md as the default constraint; referenced, not reproduced |

## Keep / Drop

**Kept (absorbed into body):**
- Context gathering (the five brief dimensions) — but bounded, two rounds max, then proceed on assumptions.
- Concept generation — N distinct directions, with the **anti-convergence** directive (distinct font /
  palette / layout per variant; the headline-swap test) as a hard rule.
- Concept confirmation before spending generation effort.
- Variant generation (mechanism generalised away from $D / parallel subagents).
- The comparison board as the chooser; the structured feedback loop (ratings / comments / preferred /
  regenerate / remix); confirm-understanding-before-save.
- Save the approved direction + feedback; iterate to convergence.
- DESIGN.md as the default constraint (do not diverge from it unless told).

**Dropped (out of scope):**
- gstack harness boilerplate (telemetry, taste-profile, artifacts-sync, vendoring, the AskUserQuestion
  decision-brief format) — harness machinery.
- The `$D` / `$B` binary plumbing, `/tmp`-then-`cp` workarounds, parallel-subagent generation prompts —
  execution-surface mechanism.
- Persistent taste-profile schema + decay — a gstack feature, not node-essential; the operator's
  in-session feedback is the signal the node needs.

**Edge only (separate node):**
- Producing the *production* surface from the approved direction → `design-implement` (`precedes`).
- Grading a *live* surface → `design-review` (separate node, the third in the family).

## Overlaps and seams

- **→ `design-implement`** (`precedes`): the approved direction + feedback is design-implement's
  input. Both nodes are authored in this wave, so the target resolves.
- **composes-into `dev-sprint` @ `design`**: exploration happens at the design stage of the dev-sprint
  (the task fixes this stage). It composes into the design *stage*, alongside the `design` front node.
- **DESIGN.md (harness)**: the default constraint is harness-supplied; referenced as an input, not a
  hardcoded path.

## Fit

Single node. It owns its own branching (standalone vs evolve-from-screenshot; the
generate↔feedback↔regenerate loop) and an ordered procedure (gather → concept → confirm → generate →
compare → feedback → save), with a distinct, separately-measurable goal (a chosen direction with
distinct variants, converged). Clearly distinct from design-implement (production, convergent) and
design-review (grading live). Skill, not agent — the comparison + feedback loop is operator-in-loop.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | instrumentation-preamble (`load: import`) | the enter/exit emit contract, single-sourced into the body |
| references | ux-principles (`load: on-demand`) | the visual-and-interaction standard the variants are explored against; read at the generation/feedback step |
| composes-into | dev-sprint (`stage: design`) | visual exploration is a design-stage activity |
| precedes | design-implement | the approved direction feeds production UI (fixed by the task) |

## Conformance

**`primitive:`↔`mode:` agreement:** skill↔collaborative — consistent.

**`goals:` as outcomes:** all three read as outcomes (a chosen direction with rationale; distinct
variants; a converged loop), each with a metric and an earns-keep threshold.

**Edge targets resolvable:** `instrumentation-preamble` ✓, `ux-principles` ✓ (graph/_refs);
`dev-sprint` is an arc (composes-into target, not file-resolved); `design-implement` is authored in
this same wave (file present before validate, so `precedes` resolves — not an F7 deferral).

## Open questions

- DESIGN.md is harness-supplied — referenced as an input the harness provides, never hardcoded.
- The variant-rendering mechanism (gstack image generation) is left inline/harness; the node names the
  artefact (N comparable variants + a board), not a specific generator. Flagged for the translator to
  keep the body mechanism-agnostic.
