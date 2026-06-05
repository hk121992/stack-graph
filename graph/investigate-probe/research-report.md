---
title: Research report for investigate-probe
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 1
external_analogue_found: true
external_corpora_searched: ["gstack operator skill set (investigate Phases 1-3)", "stack-graph explore node (read-only fan-out agent shape)"]
researcher_adequacy_note: |
  The external analogue is the evidence-gathering and hypothesis-confirmation work of
  gstack's `investigate` skill (Phases 1-3) — real root-cause debugging as the operator
  runs it. The generalisation to a PARALLEL read-only probe is the stack-graph factory
  pattern: the gstack skill runs single-threaded, but the candidate-cause space (the pattern
  table — race / nil / state / integration / config / cache) is naturally fan-out-able, one
  probe per candidate. The `explore` node is the structural twin — a read-only, isolated,
  autonomous sub-agent that returns a digest and writes nothing, with no outbound process
  edge — so primitive: agent / mode: autonomous is unambiguous and well-precedented. The
  load-bearing invariant is read-only: a probe gathers evidence and tests one causal claim,
  reverts any temporary instrumentation, and returns a finding; it never writes a fix. That
  is what makes N probes parallel-safe (no git-index collision, no shared-state corruption).
  Goals frame as outcomes (finding accuracy, parallel speedup, zero-write conformance). The
  one judgment call: investigate-probe declares NO process edge and NO invokes — it is a
  sub-agent; `debug` owns the `invokes: investigate-probe` edge. Recommend the translator
  reference only instrumentation-preamble (load: import).
---

# Research report for investigate-probe

## Identity

**Candidate id:** investigate-probe
**Candidate title:** Investigate probe
**Scope:** A read-only, isolated hypothesis-testing sub-agent. `debug` dispatches **N
instances in parallel**, one per candidate root cause, each tasked to gather evidence and
confirm or disconfirm one causal hypothesis against the codebase, then return a finding. It
**writes nothing** — no fix, no left-behind scaffolding (temporary instrumentation is reverted
before return). It **excludes** forming the final diagnosis, choosing the fix, and applying it
— all owned by `debug` under the Iron Law. It is the parallel evidence layer beneath debug's
serial one-cause-one-fix discipline.

## Goals

| outcome | metric | earns-keep |
|---|---|---|
| Each probe returns an accurate confirm/disconfirm for the one cause it tested, so debug picks the real root cause faster. | Probe finding accuracy — share of probe verdicts (confirmed / ruled-out) that debug's eventual confirmed cause corroborates; false-confirm and false-rule-out rates. | False-confirm rate stays near zero; a probe that routinely mis-confirms sends debug down wrong fixes and is a tune/cut signal. |
| Parallel probes collapse the wall-clock of testing several candidate causes versus testing them serially. | Time from probe fan-out to debug holding all returns vs the modelled serial time; number of candidates tested per debug run. | Parallel time stays well below serial; if a debug run only ever has one candidate (no fan-out benefit), that is a signal debug should test inline, not dispatch probes. |
| Probes never mutate the codebase, so any number can run concurrently without collision. | Count of probe runs that leave a write behind (fix, uncommitted change, un-reverted instrumentation) — should be zero; git-index/state collisions across concurrent probes. | Zero writes and zero collisions; a single probe that writes a fix breaks the read-only invariant that makes parallelism safe — a hard conformance failure. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** A probe runs unattended to a result — it does not converse with the operator;
the dispatching `debug` skill owns all operator interaction. It is fanned out exactly like the
`explore` agent: isolated context, read-heavy, returns a distilled finding. `agent` ↔
`autonomous` (the agreement rule), matching the `explore` precedent.

**`determinism:`** `generative`

**Rationale:** Testing a causal hypothesis — reading code, tracing the path, deciding whether
the evidence matches — is judgment, not a fixed algorithm. The probe reasons about novel code
each run.

## Contract

**Input:** A spawn bundle from `debug`: the one candidate hypothesis to test (e.g. "stale
cache: the view shows pre-update data"), the symptom/error, the affected files, the
reproduction (if any), and the scope to read.

**Output:** A finding — confirmed / ruled-out for that one hypothesis, with the evidence that
decides it (the code path, the matching/non-matching observation). No code change. Returned to
`debug`, which collects all probe findings and owns the diagnosis + fix.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack `investigate` skill, Phases 1-3 | the read-only evidence-gathering + hypothesis-confirmation work | yes | `source-material/hypothesis-probe-pattern.md` |
| stack-graph `explore` node | the read-only fan-out sub-agent shape (autonomous, no process edge, returns a digest) | yes | — (read for the agent shape precedent, not lifted) |

The probe's *work* is lifted from real gstack debugging (Phases 1-3); the *parallel fan-out*
is the stack-graph generalisation, structurally precedented by `explore`.

## Source inventory

| file | status | notes |
|---|---|---|
| `source-material/hypothesis-probe-pattern.md` | keep | The investigation + confirmation work, plus the parallel-probe generalisation rationale. |
| `source-material/_provenance.json` | keep | Origin + line ranges + the generalisation note. |

## Keep / Drop

**Kept (absorbed into body):**
- Phase 1 evidence gathering (collect symptoms, read the code path, check recent changes, reproduce).
- Phase 3 hypothesis confirmation (temporary instrument at the suspected cause; run the repro; does the evidence match?).
- One-candidate-per-probe framing; the read-only invariant (revert instrumentation; return a finding, never a fix).

**Dropped (out of scope):**
- Phase 4 (Implementation/fix) and Phase 5 (Verification & Report) — owned by `debug`; a probe never fixes.
- The 3-strike escalation, blast-radius gate, DEBUG REPORT — debug's, not the probe's.
- All gstack runtime preamble.

**Edge only (separate node):**
- None — investigate-probe is the leaf of this pair.

## Overlaps and seams

- **`debug` → `investigate-probe`** (`invokes`): authored on **debug's** side. investigate-probe does NOT author an inbound edge for it (the dispatcher declares the invoke; the sub-agent does not).
- Structural twin to `explore`: both are read-only, autonomous, isolated fan-out sub-agents that return findings and carry no `composes-into` / `precedes` / `can-follow`.

investigate-probe has **no outbound process edge** and **no `invokes`** — it is a leaf
sub-agent. It references only the instrumentation preamble.

## Fit

Single node. It owns its own branching (which evidence to gather for the assigned hypothesis;
the confirm/disconfirm decision). Its goal — accurate per-hypothesis findings, gathered in
parallel, writing nothing — is distinct and separately measurable from debug's (confirmed-cause
fixes). Splitting it further would fragment a single read-only probe; merging it into debug
would lose the parallel fan-out and the read-only isolation that makes concurrency safe.

## Edges

| edge type | target id | rationale |
|---|---|---|
| references | instrumentation-preamble (`load: import`) | the node enter/exit emit contract every node imports. |

No `invokes` (leaf), no `composes-into` (not an arc stage), no `precedes`/`can-follow`
(sub-agent — returns to dispatcher), no `maintains`. The `debug → investigate-probe` invoke is
declared on debug's side.

## Conformance

**`primitive:`↔`mode:` agreement:** `agent` ↔ `autonomous` — agrees (matches the `explore` precedent).

**`goals:` as outcomes:** all three read as outcomes (finding accuracy, parallel speedup,
zero-write conformance), each with a metric and earns-keep threshold.

**Edge targets resolvable:** `instrumentation-preamble` exists at
`graph/_refs/instrumentation-preamble.md`.

## Open questions

- None structural. The read-only invariant is the load-bearing constraint; it must survive
  into the body verbatim (a probe that writes breaks parallel safety).
