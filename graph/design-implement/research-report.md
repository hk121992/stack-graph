---
title: Research report for design-implement
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 2
external_analogue_found: true
external_corpora_searched: ["gstack operator skill set (design-html, design-consultation)", "the C-family sibling node design-shotgun (this wave)", "the ux-principles reference (graph/_refs)"]
researcher_adequacy_note: |
  The dominant external analogue is gstack's design-html skill — a mature, in-production method for
  turning an approved design into production-quality UI where text actually reflows and heights
  compute. It was lifted and generalised: the Pretext text-layout engine, the $D/$B binaries, and the
  gstack harness boilerplate (telemetry, taste-profile, artifacts-sync) are all gstack implementation
  detail, dropped in favour of naming the *outcome* (text reflows, heights/layouts are dynamic, real
  content not lorem) and leaving the rendering engine to the harness/inline. primitive/mode is
  unambiguous — it is a collaborative skill with a refinement loop, so skill↔collaborative,
  generative determinism (UI synthesis is judgment, not a fixed transform). Goals frame cleanly as
  outcomes: the surface is production-quality and spec-faithful, it meets the ux-principles standard
  (no AI slop), and the refinement loop converges. The one judgment call surfaced for the translator:
  DESIGN.md is a *harness-supplied* design source — referenced as an external input, never a hardcoded
  path — so the node stays general per the task's harness-overlay note. The `build invokes
  design-implement` edge is authored on build's side by another agent; I do NOT add it here.
---

# Research report for design-implement

## Identity

**Candidate id:** design-implement
**Candidate title:** Design implement
**Scope:** Produce production-quality user-facing UI (HTML/CSS) from an approved design — an
approved-mockup, a plan/design-doc, or a from-scratch description — for a UI implementation unit
within the build span. Covers: detecting the design source, distilling it into an implementation
spec, choosing the right layout approach, generating real production markup where text reflows and
heights/layouts are dynamic, verifying at viewports, and an operator-in-loop refinement loop to
convergence. Excludes: generating *variant* mockups for exploration (that is `design-shotgun`,
upstream), grading a *live* surface (that is `design-review`), and the broader non-UI work of the
build span (that is `build` itself, which invokes this node for UI units).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| The approved design is realised as production-quality UI faithful to the design source, not a CSS approximation | share of UI units whose output matches the approved mockup / design doc on operator review without a re-do; downstream design-review findings traced to an implementation deviation rather than a design gap | design-review findings traced to implementation drift trend below baseline; a node that routinely ships a surface that misses its own approved design is a process gap, not a capability gap |
| The shipped surface meets the named UX standard — it does not read as AI slop | share of units passing the ux-principles checks (hierarchy, spacing, type, WCAG contrast, anti-slop) at handoff; slop-pattern findings at design-review | anti-slop + WCAG findings at review trend toward zero as the node matures |
| The refinement loop converges on an operator-satisfied surface inside the span, not deferred to review | refinement iterations to "done" per unit; share of units reaching operator-"done" without a review→build re-entry on visual grounds | iterations-to-done trends down; a unit that never converges in-span despite a clear design source is a calibration signal, not a node failure |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** It runs a refinement loop with the operator in the loop — generate, show the surface
(and the approved mockup for comparison), take feedback, surgically edit, re-verify, repeat to
"done". That live back-and-forth is the defining collaborative shape; it loads into the current
context rather than running isolated. skill↔collaborative is the only consistent pairing. (The task
specifies `mode: collaborative` for both C-family nodes; the source method confirms it.)

**`determinism:`** `generative`

**Rationale:** UI synthesis from a design source is judgment — there is no fixed input→output
transform. Two runs of the same brief produce different, both-valid markup. Generative.

## Contract

**Input:** An approved design source (one of: an approved mockup from `design-shotgun`; a plan /
design doc; a from-scratch operator description) plus the UI implementation unit's scope (which
surface, which acceptance), the harness DESIGN.md (design tokens — fonts, colour, spacing scale), and
the ux-principles standard.

**Output:** A production-quality UI artefact (HTML/CSS, or a framework component where the project
demands it) for the unit, verified at the target viewports, refined with the operator to "done". The
node-enter/-exit instrumentation events. No carrier write.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack operator skill set | "production UI from an approved design — how is this really done?" → design-html | yes | design-html-skill.md (kept, generalised) |
| gstack operator skill set | "the design source of truth — DESIGN.md" → design-consultation | yes | design-consultation-skill.md (edge-only / context) |
| C-family sibling (this wave) | the upstream variant-exploration node it follows → design-shotgun | yes | wired as `can-follow`, not lifted |
| graph/_refs | the shared visual-and-interaction standard → ux-principles | yes | wired as `references` (on-demand), not lifted |

design-html is a real, in-production external counterpart to the job "turn an approved design into
production UI". The node is challenged against how the job is really done, not only against our own
design. The Pretext engine within design-html is a gstack-specific *mechanism* and is deliberately
dropped — the node names the outcome it guarantees (text reflows, heights/layouts dynamic), which any
harness can satisfy with its own engine inline.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/design-html-skill.md` | keep | the core method, generalised |
| `source-material/design-consultation-skill.md` | edge-only / context | DESIGN.md as the design source; referenced, not reproduced |

## Keep / Drop

**Kept (absorbed into body):**
- Input detection — the four design-source modes (approved-mockup / plan-driven / freeform / evolve).
- Distil the design source into an implementation spec (colours, type, spacing, components, layout).
- Choose the layout approach by surface type (the routing idea — generalised away from Pretext tiers).
- Generate production markup where text reflows, heights compute, layouts are dynamic; real content,
  never lorem; DESIGN.md tokens override.
- The AI-slop blacklist → folded into the ux-principles reference (single-sourced, not re-listed).
- Verify at viewports; refinement loop with surgical edits (preserve operator edits), max-iteration
  escalation; source-fidelity-over-code-elegance.

**Dropped (out of scope):**
- gstack harness boilerplate (telemetry, taste-profile, artifacts-sync, vendoring warnings, the
  AskUserQuestion decision-brief format) — harness machinery, not node logic.
- The Pretext API cheatsheet and wiring patterns — gstack engine specifics; the node names the
  outcome, the harness supplies the engine inline.
- The `$D` / `$B` binary plumbing and `/tmp`-then-`cp` sandbox workarounds — execution-surface detail.

**Edge only (separate node):**
- Variant *exploration* (generate N options, comparison board) → `design-shotgun` (upstream, `can-follow`).
- *Live*-surface grading → `design-review` (separate node, the third in the visual-design family).

## Overlaps and seams

- **← `design-shotgun`** (`can-follow`): when an approved mockup exists, it is design-shotgun's
  output; design-implement consumes the approved variant + its feedback. Authored.
- **← `build`** (`invokes`, build's side): build invokes design-implement for a UI implementation
  unit. This edge is authored on **build's** side by another agent — NOT added here.
- **composes-into `dev-sprint` @ `build`**: design-implement is a build-span activity, so it composes
  into the dev-sprint at the build stage (the task fixes this stage).
- **→ `design-review`** (no edge): the live surface this node ships is later graded by design-review;
  left as prose, no process edge (design-review is authored separately; F7 keeps the seam in prose).

## Fit

Single node. It owns its own branching (mode detection, layout routing) and an ordered procedure
(detect → spec → generate → verify → refine), and it has a distinct, separately-measurable goal
(production-quality, spec-faithful UI that converges). It is clearly distinct from design-shotgun
(exploration, divergent) and design-review (grading a live surface). Skill, not agent: the refinement
loop needs the live operator thread.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | instrumentation-preamble (`load: import`) | the enter/exit emit contract, single-sourced into the body |
| references | ux-principles (`load: on-demand`) | the visual-and-interaction standard (incl. the anti-slop blacklist) the surface is built to; read at the build/verify step |
| composes-into | dev-sprint (`stage: build`) | a UI implementation unit is a build-span activity |
| can-follow | design-shotgun | when an approved mockup exists, design-implement follows the exploration that produced it |

(No `invokes` from build authored here — that edge is build's, by another agent. No `precedes` —
design-implement's downstream is review, an edge build owns; F7 keeps it in prose.)

## Conformance

**`primitive:`↔`mode:` agreement:** skill↔collaborative — consistent.

**`goals:` as outcomes:** all three read as outcomes (faithful production surface; meets the UX
standard; converges in-span), each with a metric and an earns-keep threshold.

**Edge targets resolvable:** `instrumentation-preamble` ✓, `ux-principles` ✓ (both in graph/_refs);
`dev-sprint` is an arc (composes-into target, not resolved to a file); `design-shotgun` is authored
in this same wave (file present before validate).

## Open questions

- DESIGN.md is harness-supplied. Per the task's harness-overlay note, it is referenced as an
  *input the harness provides*, never a hardcoded path — kept general in the body.
- The rendering engine (gstack uses Pretext) is left to the harness/inline; the node guarantees the
  outcome (reflow, dynamic heights), not a specific library. Flagged for the translator to keep the
  body engine-agnostic.
