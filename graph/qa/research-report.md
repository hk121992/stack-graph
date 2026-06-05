---
title: Research report for qa
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 1
external_analogue_found: true
external_corpora_searched: [gstack qa skill (~/.claude/skills/qa/SKILL.md), in-repo review.md fix-loop, in-repo simulate-users (sibling verification modality)]
researcher_adequacy_note: |
  qa is a near-direct generalisation of the gstack /qa skill — the source is a real, mature operator
  skill, lifted from ~/.claude/skills/qa/SKILL.md. I dropped the entire gstack runtime envelope
  (preamble, telemetry, artifacts-sync, AskUserQuestion-format boilerplate, gstack-config plumbing,
  brain/learnings infra, $B binary bootstrap) — that is gstack-host machinery, not the method — and
  kept the test→fix→verify loop, the per-page exploration, the evidence discipline, the severity
  tiers, the atomic-commit-per-fix rule, the revert-on-regression safety, and the WTF-likelihood
  self-regulation. primitive/mode is unambiguous (skill ↔ collaborative — it engages the operator and
  mutates source). Edges are simple: composes-into dev-sprint at stage verify; references
  instrumentation-preamble (import) + findings-schema (import, so its findings consolidate with the
  other modalities at verify). No inbound invoke edge in qa's own frontmatter — verify holds that,
  mirroring how the review lenses carry no inbound invoke (the simulate-users precedent). Goals frame
  cleanly as outcomes (bugs caught + fixed before land; cheap enough to run every change; fixes don't
  regress). One judgment call: I kept the safety-bearing rules (clean-tree precondition, one-commit-
  per-fix, revert-on-regression, WTF-stop, never-bundle) at full fidelity per the SAFETY EXCEPTION —
  these are order-bearing/irreversible and must not be compressed. Translator should keep the body
  process-agnostic-ish but faithful: qa is a browser-behaviour modality, so browser verbs stay
  (navigate/interact/verify-state) but the gstack-specific $B/binary detail is dropped to an
  execution-surface mention (harness supplies the browser).
---

# Research report for qa

## Identity

**Candidate id:** qa
**Candidate title:** QA
**Scope:** A verification modality dispatched by the `verify` stage: systematically QA-test a running
web application like a real user (navigate, interact, fill forms, check every state), find bugs, then
**fix them in source with atomic commits and re-verify** — a test→fix→verify loop with before/after
evidence. Emits findings to the shared finding contract so they consolidate at `verify`. Excludes:
the orchestration/consolidation/gate (that is `verify`), visual-design grading (that is
`design-review`), AI-agent-experience grading (that is `simulate-users`), and static diff review
(that is `review`). Drops the entire gstack runtime envelope — preamble, telemetry, config plumbing,
binary bootstrap — keeping only the method.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Behavioural bugs in the running build (broken flows, dead controls, form failures, console errors) are caught and fixed before the change lands | Bugs found + fixed per pass with before/after evidence; escaped behavioural-bug rate vs the pre-qa baseline | Escaped behavioural-bug rate measurably below baseline over N sprints; if qa never catches a real bug a later stage confirms, the modality is cut |
| Each fix is atomic and verified, so qa never lands a fix that regresses behaviour | Fix classification split (verified / best-effort / reverted); regressions caught by re-verify and reverted in-pass | Reverted-after-land count trends to zero; the revert-on-regression guard fires before a bad fix escapes |
| The pass is cheap enough to run on every material UI change | Wall-clock + operator attention per pass; how often qa is skipped when interactive behaviour changed | Cost stays low enough qa is not routinely skipped; a pass that routinely runs past the WTF-stop without operator value is retuned |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** qa engages the operator (clean-tree precondition, auth/2FA/CAPTCHA prompts, the
WTF-stop) and mutates source in the current context (atomic fix commits). It loads into the live
thread and persists across the test→fix→verify loop. That is a skill, not an isolated summary-
returning agent. `skill ↔ collaborative`.

**`determinism:`** `generative`

**Rationale:** exploration, bug judgment, root-cause location, and the minimal-fix decision are
judgment over a live application — not a fixed-input/fixed-output algorithm. Generative.

## Contract

**Input:** the scope bundle from `verify` (the running target / URL, the intent summary, scope
rules, the finding contract), optional auth, and a tier (quick / standard / exhaustive governing
which severities get fixed). The harness supplies the browser execution surface.

**Output:** the compact finding return (to `verify`) conforming to `findings-schema`; in mutating
tiers, the applied atomic fix commits with before/after evidence and a per-fix classification
(verified / best-effort / reverted / deferred); a health-score delta.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack `qa` skill (`~/.claude/skills/qa/SKILL.md`) | the real operator test→fix→verify QA method | yes | qa-method.md (lifted method, envelope stripped) |
| in-repo `graph/review/review.md` | the fix-loop routing + autofix_class discipline | yes | — (shared finding contract) |
| in-repo `graph/simulate-users/simulate-users.md` | how a sibling verification modality declares edges (no inbound invoke) | yes | — (edge-shape precedent) |

**External analogue found:** qa is a direct generalisation of a mature, real operator skill (gstack
/qa), not a design-doc invention. The method is lifted; only the gstack host envelope is dropped.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/qa-method.md` | keep | the gstack /qa method with the runtime envelope stripped — explore→document→triage→fix→re-verify, severity tiers, evidence discipline, the safety rules |

## Keep / Drop

**Kept (absorbed into body):**
- The test→fix→verify loop: orient → explore (per-page checklist) → document with evidence → triage by tier → fix (locate source, minimal fix, atomic commit) → re-verify (before/after, console, state-diff) → classify.
- The three tiers (quick / standard / exhaustive) governing fix scope by severity.
- The evidence discipline: every issue needs a screenshot; verify-before-document; check console after every interaction.
- **SAFETY (kept at full fidelity):** clean-tree precondition; one commit per fix, never bundle; revert-on-regression; WTF-likelihood self-regulation + hard cap; never include credentials.

**Dropped (out of scope — gstack host envelope, not the method):**
- The preamble block, telemetry, artifacts-sync, gstack-config/brain/learnings plumbing, AskUserQuestion-format boilerplate, the $B binary bootstrap + bun-install, plan-mode/voice/writing-style sections, model-overlay patch, the test-framework-bootstrap mega-section (that is a separate concern, not the qa loop).
- Health-score rubric exact weights and the report-template paths — kept the *idea* of a health-score delta and a structured report, dropped the gstack-specific files/weights.

**Edge only / separate node:** none — qa is a leaf modality.

## Overlaps and seams

- **← `verify`** (inbound `invokes`, declared on verify's side, NOT here): verify dispatches qa.
- Sibling modalities `design-review` (visual) and `simulate-users` (AX/UX) — qa is the
  browser-behaviour modality; they partition the verification space, findings consolidate at verify.
- qa's own fix-loop mirrors `review`'s autofix_class routing; findings share `findings-schema`.

## Fit

Single node. Owns its own branching (tier selection, per-page exploration, triage, the fix-loop with
revert/escalate) and a distinct measurable goal (behavioural bugs caught + fixed vs baseline)
separate from design-review's (visual) and simulate-users's (experience). A leaf verification
modality.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | dev-sprint (stage: verify) | qa is a modality of the verify stage |
| references | instrumentation-preamble (`load: import`) | the enter/exit emit contract every node imports |
| references | findings-schema (`load: import`) | qa emits to the shared finding contract so verify can consolidate |

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — confirmed.

**`goals:` as outcomes:** all three are outcomes with metric + earns-keep; none are activities.

**Edge targets resolvable:** `dev-sprint` is an arc (composes-into); `instrumentation-preamble` and
`findings-schema` exist in `graph/_refs/`. No process edges (qa is a leaf modality, dispatched).

## Open questions

- qa carries no `composes-into incremental` — the verify stage is wired into the incremental arc by
  a later pass (F7); only dev-sprint is declared now. If/when verify joins incremental, qa inherits.
- The health-score is kept as a delta concept; its exact rubric is a harness concern, not baked here.
