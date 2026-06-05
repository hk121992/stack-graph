---
title: Research report for design-review
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 1
external_analogue_found: true
external_corpora_searched: [gstack design-review skill (~/.claude/skills/design-review/SKILL.md), in-repo ux-principles reference, in-repo qa.md (sibling modality with the same fix-loop)]
researcher_adequacy_note: |
  design-review is a generalisation of the gstack /design-review skill, lifted from
  ~/.claude/skills/design-review/SKILL.md. The crucial structural decision: the gstack source carries
  a huge embedded design rubric (the 10-category, ~80-item checklist + the AI-slop blacklist + the
  Krug "how users behave" laws). That rubric is NOT design-review's private content — it is the
  shared UX standard already authored as the `ux-principles` reference (graph/_refs/ux-principles.md,
  consumed by design, design-implement, AND design-review per that ref's own header). So I drop the
  embedded rubric and depend on ux-principles via a `references` edge with `load: on-demand` (the ref
  is large and read at the grading step, not spliced into every load). What design-review KEEPS is the
  node's own method: first-impression gut reaction, design-system extraction from the rendered page,
  the per-page rating loop, the goodwill-reservoir flow walk, and the same atomic-fix-commit-and-
  re-verify loop as qa. I dropped the gstack host envelope identically to qa. primitive/mode is
  unambiguous (skill ↔ collaborative — engages the operator, mutates source). Edges: composes-into
  dev-sprint at stage verify; references instrumentation-preamble (import) + ux-principles (on-demand,
  the new ref). The task spec did NOT ask for a findings-schema edge on design-review (it asked for
  instrumentation-preamble + ux-principles) — I honour that exactly; design-review's findings still
  reach verify but the spec scopes its declared refs to those two. Goals frame as outcomes (visual
  defects + AI-slop caught and fixed; cheap to run; the grade is debuggable not vibes). Safety rules
  (clean-tree, one-commit-per-fix, revert-on-regression) kept at full fidelity.
---

# Research report for design-review

## Identity

**Candidate id:** design-review
**Candidate title:** Design review
**Scope:** A verification modality dispatched by the `verify` stage: a senior product designer's-eye
**live visual QA** of the running build, then iterative **fixes** — find visual inconsistency,
spacing/hierarchy problems, AI-slop patterns, and slow interactions, fix them in source with atomic
commits, and re-verify with before/after screenshots. Grades against the **shared `ux-principles`
standard** (not a private rubric). Excludes: orchestration/consolidation/gate (`verify`), browser
*behaviour* testing (`qa`), AI-agent-experience grading (`simulate-users`), and the UX standard
itself (the `ux-principles` reference, depended on, not duplicated). Drops the gstack host envelope.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Visual defects in the running build — inconsistency, broken hierarchy, AI-slop, slow interactions — are caught and fixed before the change lands | Visual findings caught + fixed per pass with before/after screenshots; AI-slop flags resolved; escaped visual-defect rate vs the pre-design-review baseline | Escaped visual-defect rate measurably below baseline over N sprints; if it never catches a real visual defect a later stage or user confirms, the modality is cut |
| Every "this feels wrong" traces to a named principle, so the verdict is a debuggable grade not taste | Share of findings each tied to a specific `ux-principles` clause; operator overrides of a finding (a flagged item the operator judges fine) | Principle-traced fraction stays high and override rate stays low enough that the grade is trusted and actioned |
| The pass is cheap enough to run on every material visual change | Wall-clock + operator attention per pass; how often design-review is skipped when a visual surface changed | Cost stays low enough it is not routinely skipped; trends down or holds |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** design-review engages the operator (clean-tree precondition, the gut-reaction
narration the operator reads, DESIGN.md-creation offer) and mutates source in the current context
(atomic visual-fix commits, re-verified with before/after screenshots). A skill, not an isolated
summary-returning agent. `skill ↔ collaborative`.

**`determinism:`** `generative`

**Rationale:** visual grading, first-impression judgment, AI-slop recognition, and the goodwill
read are taste-grounded judgment over a live surface — not a fixed algorithm. Generative.

## Contract

**Input:** the scope bundle from `verify` (the running target / URL, intent summary, scope rules),
an optional project `DESIGN.md` (deviations from a stated design system score higher), and a depth
(quick / standard / deep). The harness supplies the browser execution surface. The shared
`ux-principles` standard is read on-demand at the grading step.

**Output:** the visual finding return to `verify` (each finding tied to a `ux-principles` clause,
with an impact rating); in mutating depths, the applied atomic fix commits with before/after
screenshots and per-fix classification; a design grade + AI-slop grade.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack `design-review` skill (`~/.claude/skills/design-review/SKILL.md`) | the real operator visual-QA-and-fix method | yes | design-review-method.md (method lifted; embedded rubric + envelope dropped) |
| in-repo `graph/_refs/ux-principles.md` | the shared visual/interaction standard design-review grades against | yes | — (depended on via references edge, not duplicated) |
| in-repo `graph/qa/qa.md` (sibling) | the shared atomic-fix-commit-and-re-verify loop | yes | — (same fix-loop discipline) |

**External analogue found:** design-review is a generalisation of a mature operator skill (gstack
/design-review). The method is lifted; the embedded design rubric is replaced by a dependency on the
already-authored `ux-principles` reference; the gstack host envelope is dropped.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/design-review-method.md` | keep | the gstack /design-review method with the embedded rubric replaced by a ux-principles dependency and the runtime envelope stripped |

## Keep / Drop

**Kept (absorbed into body):**
- **First impression** — gut reaction before analysis (what it communicates; the first 3 things the
  eye lands on; the one-word verdict; the page-area test).
- **Design-system extraction** — the system the page actually renders (fonts, colours, heading
  scale, spacing), flagged against the standard.
- **Per-page rating loop** — grade each page against `ux-principles`, each finding tied to a clause
  with an impact rating (high / medium / polish).
- **Goodwill-reservoir flow walk** — narrate 2-3 key flows in first person, tracking friction drains/fills.
- The **fix loop** (same as qa): locate source → minimal visual fix → atomic commit → re-verify with
  before/after screenshots → classify.
- **SAFETY (full fidelity):** clean-tree precondition; one commit per fix, never bundle; revert-on-regression.

**Dropped (out of scope):**
- The embedded 10-category ~80-item checklist + AI-slop blacklist + Krug "how users behave" laws —
  these ARE the `ux-principles` reference; depend on it, do not duplicate it.
- The gstack host envelope (preamble, telemetry, config/brain plumbing, $B + design-binary bootstrap,
  plan-mode/voice/writing-style, test-framework-bootstrap, exact grade weights, report-file paths).
- The optional design-binary mockup-generation (a gstack progressive enhancement, not the method).

**Edge only / separate node:** none — design-review is a leaf modality.

## Overlaps and seams

- **← `verify`** (inbound `invokes`, declared on verify's side, NOT here): verify dispatches design-review.
- Sibling modalities `qa` (behaviour) and `simulate-users` (AX/UX) — design-review is the visual
  modality; findings consolidate at verify.
- **`ux-principles`** is the shared standard `design`, `design-implement`, and `design-review` all
  use — design-review grades against it, so a "this looks wrong" is debuggable against a named clause.

## Fit

Single node. Owns its own branching (depth selection, first-impression, the per-page rating loop, the
goodwill walk, the fix-loop with revert) and a distinct measurable goal (visual defects + AI-slop
caught and fixed vs baseline) separate from qa's (behaviour) and simulate-users's (experience). A
leaf verification modality.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | dev-sprint (stage: verify) | design-review is a modality of the verify stage |
| references | instrumentation-preamble (`load: import`) | the enter/exit emit contract every node imports |
| references | ux-principles (`load: on-demand`) | the shared visual/interaction standard it grades against; on-demand because it is large and read at the grading step |

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — confirmed.

**`goals:` as outcomes:** all three are outcomes with metric + earns-keep; none are activities.

**Edge targets resolvable:** `dev-sprint` is an arc (composes-into); `instrumentation-preamble` and
`ux-principles` exist in `graph/_refs/`. No process edges (leaf modality, dispatched).

## Open questions

- The task spec scopes design-review's declared references to `instrumentation-preamble` +
  `ux-principles` (NOT `findings-schema`). I honour that — design-review's findings still reach verify
  for consolidation, but per the spec it does not declare a `findings-schema` edge. If a later pass
  decides every modality must declare the finding contract explicitly, add it then via amend.
- No `composes-into incremental` — the verify stage is wired into the incremental arc by a later pass (F7).
