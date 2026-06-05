---
title: Research report for debug
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 1
external_analogue_found: true
external_corpora_searched: ["gstack operator skill set (investigate)", "stack-graph build node (debug seam)", "stack-graph iron-law reference"]
researcher_adequacy_note: |
  The external analogue is strong and direct: gstack's `investigate` skill is the
  operator's root-cause-first debug skill, and the pair brief names it as the source.
  I lifted the substantive debugging body (Iron Law, five phases, scope-lock, the
  3-strike escalation, the pattern table, red flags, the DEBUG REPORT) and excluded the
  gstack runtime preamble (telemetry/gbrain/AskUserQuestion plumbing) — harness machinery,
  not the discipline. The Iron Law itself is already abstracted into graph/_refs/iron-law.md,
  so debug imports that constraint rather than restating it, and owns the runtime mechanics
  the ref deliberately leaves out (3-strike rubric, scope-lock). primitive: skill / mode:
  collaborative is unambiguous — debug is invoked mid-build, surfaces decisions to the
  operator at the 3-strike gate and on >5-file blast radius, and runs interactively. The
  one judgment call is the parallel-probe split: debug DISPATCHES investigate-probe (the
  read-only hypothesis fan-out) but keeps the one-confirmed-cause-one-fix serialisation
  itself — so the Iron Law holds even though evidence gathering parallelises. Goals frame
  cleanly as outcomes (cause-confirmed-before-fix rate, escaped-symptom-fix rate, escalation
  honesty). Recommend the translator import iron-law + instrumentation-preamble and declare
  invokes: investigate-probe.
---

# Research report for debug

## Identity

**Candidate id:** debug
**Candidate title:** Debug
**Scope:** The Iron-Law root-cause fix path. `debug` is invoked mid-`build` (and optionally
mid-`review`) when a unit fails — a failing acceptance check, a runtime error, a regression —
**and the cause is not quickly diagnosable**. It runs investigate → analyse → hypothesise →
fix, dispatching parallel read-only probes to test candidate causes, confirming exactly one
root cause, then applying the smallest fix and a regression test. It **excludes** the quick,
obvious in-span fix that `build` already handles inline (debug is the escalation when that
fails), and it excludes the *constraint statement* itself (owned by the `iron-law` reference,
imported). It owns the runtime mechanics the constraint ref leaves out: scope-lock, the
3-strike escalation rubric, the pattern table, the DEBUG REPORT.

## Goals

| outcome | metric | earns-keep |
|---|---|---|
| Every fix debug ships addresses a confirmed, reproduced root cause — not a symptom. | Share of debug fixes whose root cause was confirmed against a reproduction before the fix was written; recurrence rate of the same defect after a debug fix. | Recurrence rate trends to near-zero; a debug fix that has to be re-opened for the same symptom is the cut/tune signal — the discipline failed. |
| A hard bug is diagnosed fast enough that escalating into debug beats guess-patching in build. | Wall-clock from debug-enter to confirmed-cause; share of debug runs that confirm a cause vs escalate at the 3-strike gate. | Time-to-cause holds low as the codebase grows (parallel probes keep it bounded); a debug that routinely runs long without converging is a signal to escalate earlier. |
| debug escalates honestly instead of shipping an unverifiable fix. | Share of runs that hit the 3-strike rule and escalate (surface to operator / instrument-and-wait / question architecture) rather than guess-patch; count of fixes shipped without a passing reproduction (should be zero). | Zero fixes ship without a verified reproduction; a rising guess-patch rate (fixes shipped after 3 failed hypotheses) is a discipline-breach signal. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** debug engages the operator at decision points — the 3-strike escalation gate
(continue / escalate / instrument-and-wait), the >5-file blast-radius flag, and the final
DEBUG REPORT. It is invoked as a skill from within `build` (and optionally `review`) and runs
interactively when a cause won't confirm. It is not an unattended agent: the whole point of
the 3-strike rule and blast-radius gate is to hand judgment back to the operator rather than
auto-decide. So `skill` ↔ `collaborative` (the agreement rule).

**`determinism:`** `generative`

**Rationale:** Root-cause diagnosis is judgment, not an algorithm — forming hypotheses,
reading evidence, deciding when a cause is confirmed, and choosing the minimal fix all require
generative reasoning. The *constraint* (no fix without a confirmed cause) is deterministic and
lives in the ref; the *act of debugging* is generative.

## Contract

**Input:** Invoked by `build` (or `review`) with the failure context — the failing
`acceptance_check` output / error / stack trace, the affected files, the IU or change under
work, and the reproduction if one exists. Imports the `iron-law` constraint and the
`instrumentation-preamble` emit contract.

**Output:** Either (a) a confirmed root cause + the smallest fix + a regression test that fails
without the fix and passes with it + a DEBUG REPORT, handed back to the host stage; or (b) an
escalation at the 3-strike gate (surface to operator / instrument-and-wait / question the
architecture) when no cause confirms — never a guess-patch.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack operator skill set | the operator's real root-cause debug skill | yes | `source-material/investigate-skill-body.md` |
| stack-graph `build` node | the named debug seam (`→ debug`, Iron-Law fix path, wave 2) | yes (seam confirmed in build.md "Process seams") | — (read for the invocation contract, not lifted) |
| stack-graph `iron-law` reference | the already-abstracted constraint debug imports | yes | — (imported via edge, not re-lifted) |

The gstack `investigate` skill is a direct, real external counterpart: a working
root-cause-first debug discipline as the operator actually runs it. The lift is the
substantive body; the runtime preamble was excluded as harness machinery.

## Source inventory

| file | status | notes |
|---|---|---|
| `source-material/investigate-skill-body.md` | keep | The debugging discipline — Iron Law, five phases, scope-lock, 3-strike, pattern table, red flags, DEBUG REPORT. |
| `source-material/_provenance.json` | keep | Origin + line range + exclusion record. |

## Keep / Drop

**Kept (absorbed into body):**
- The five-phase flow → compressed to investigate → analyse → hypothesise → fix (the ref names the discipline; the body runs it).
- Scope-lock (narrowest affected directory; skip + note if repo-wide).
- The 3-strike escalation rubric (continue / escalate / instrument-and-wait) — debug owns this; the ref deliberately leaves it out.
- The >5-file blast-radius operator gate.
- The DEBUG REPORT output shape.
- The pattern-table reference (debug uses it to seed candidate hypotheses for the probes).

**Dropped (out of scope):**
- The entire gstack runtime preamble (telemetry, gbrain sync, update-check, AskUserQuestion plumbing, voice/writing-style, continuous-checkpoint, question-tuning). Harness machinery.
- The *statement* of the Iron Law and the symptom-vs-cause framing — owned by `iron-law` (imported), not restated.

**Edge only (separate node):**
- The parallel read-only hypothesis probes → `investigate-probe` (a separate `agent` node). debug declares `invokes: investigate-probe`.

## Overlaps and seams

- **`build` → `debug`** (`invokes`, authored on **build's** side per the brief — do NOT edit build): build invokes debug mid-span when a unit fails and the cause is not quickly diagnosable. The build node already names this seam (Process seams: "→ debug, wave 2").
- **`review` → `debug`** (optional): review may invoke debug on a confirmed defect whose cause is unclear before looping back to build. Authored on review's side later, if at all; not debug's edge.
- **`debug` → `investigate-probe`** (`invokes`): debug fans out N read-only probes to test candidate causes.
- **`debug` → `iron-law`** (`references`, `load: import`): the constraint debug is built on.
- **`debug` → `instrumentation-preamble`** (`references`, `load: import`): the enter/exit emit contract.

debug has **no `composes-into`** edge — it is not an arc stage; it is a fix-path invoked from
within a stage. It has **no `precedes`/`can-follow`** — control returns to the host stage that
invoked it, not to a next backbone stage.

## Fit

Single node. debug owns its own branching (the phase flow, the 3-strike branch, the
blast-radius branch) and sequencing (investigate before hypothesise before fix). Its goal —
fixes address confirmed causes — is distinct and separately measurable from build's
(acceptance-met) and review's (defects-caught). The read-only probe fan-out is node-like in
its own right (autonomous, parallel, write-nothing) and is split out as `investigate-probe`.

## Edges

| edge type | target id | rationale |
|---|---|---|
| invokes | investigate-probe | debug dispatches N parallel read-only probes to test candidate causes. |
| references | iron-law (`load: import`) | the root-cause constraint debug is built on; single-sourced in. |
| references | instrumentation-preamble (`load: import`) | the node enter/exit emit contract every node imports. |

No `composes-into` (not an arc stage), no `precedes`/`can-follow` (returns to host), no
`maintains` (touches no handbook-reference).

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — agrees.

**`goals:` as outcomes:** all three read as outcomes (confirmed-cause-rate, time-to-cause,
escalation-honesty), each with a metric and an earns-keep threshold. None is an activity.

**Edge targets resolvable:** `investigate-probe` is authored as its sibling in this same pair
(resolves). `iron-law` exists at `graph/_refs/iron-law.md`. `instrumentation-preamble` exists
at `graph/_refs/instrumentation-preamble.md`.

## Open questions

- The `review → debug` optional invoke is left for review's side (or a later wave); debug does
  not author an inbound edge for it. Flagged, not wired.
- The `build invokes debug` edge is authored on build's side by another agent (per the brief);
  this report does not touch build.
