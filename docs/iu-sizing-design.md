---
title: IU sizing — the single-agent-implementable unit (context budget as a measured dial)
status: design note — 2026-06-03
---

# IU sizing — the single-agent-implementable unit

The unit of build work is the **implementation unit (IU)**. Today the only sizing signal an
IU carries is `size: XS | S | M | L | XL` — a *rough effort* estimate. This note reframes IU
sizing around a sharper, operative principle: **an IU should be a single-agent-implementable
unit** — buildable by *one fresh agent within its best-work context budget* — and makes
**tokens-per-IU a first-class measured metric** so the budget is an empirical, tunable dial
rather than a guess.

The principle is lifted from Matt Pocock's tracer-bullet discipline (agents do their best work
in a bounded, focused context; decompose diligently so each slice fits one agent). The number
(~100k tokens as a working default) is a **dial**, not a contract — Claude's effective
best-work window is model-and-version-dependent, and this repo's standing rule is to *verify*
Claude behaviour rather than bake an assumption into the spec. So we record the **principle as
durable** and the **budget as a harness-tunable default we calibrate against measured reality.**

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `_refs/IU-schema` | Fields (`size`); Invariants | **Amends** — anchor `size` to the single-agent budget ("can one fresh agent build this within its best-work context window"); `L`/`XL` read as "probably too big — consider splitting"; add the single-agent-implementable invariant. Tokens-per-IU is named as the measured outcome that calibrates the band. |
| `06-analytics` | Instrumentation; Stream namespacing; the improvement loop | **Extends** — `tokens_per_iu` becomes an instrumented metric: the per-IU **unit-complete event** carries the token cost of building that IU. Adds an IU-level measure to the *product-outcomes* stream; `measure-outcomes` derives the distribution + over-budget share. |
| `07-decomposition` | Granularity; Let goals draw the boundary | **Extends** — the granularity rule gains the operative heuristic for IUs: *size by single-agent context budget.* A unit whose context (files to read + tests + impl) would exceed the budget is too coarse — split it. |
| `plan` (node) | Phase 1 — Frame the decomposition; decomposition criteria | **Amends** — adds "each IU is one fresh agent's work within the context budget" as an explicit, checkable decomposition criterion alongside files/goal/dependencies. |
| `build` (node) | Modes; Autonomous span; CF-3 (reconciliation) | **Amends** — the default execution model becomes **one IU = one fresh agent context** (serial-subagent for dependent sets, parallel-subagent for independent); main-thread `inline` is the exception for tiny units or deliberate context carry-forward. Build emits `tokens_per_iu` on each unit-complete event. |
| `docs/incremental-improvement-design.md` | §2 standalone-IU; §4 promote | **Conforms-to / extends** — a vertical slice that won't fit one agent's budget is, by that fact, a **promote** signal (it's a work-item, not a standalone IU). The budget becomes one of the routing tests between the two loops. |
| *(decisions)* | D50, D56; reconciliation CF-1/CF-3 | Applies the backbone (D50) and the two-loop split (D56); generalises reconciliation **CF-3** (serial-subagent default) and rides on **CF-1**'s `acceptance_check` (runnable evidence per IU). |

## 1. Problem

`size: XS–XL` answers "how much effort," not "will this fit one agent." Two distinct failures
follow:

- **Decomposition has no checkable target.** `plan` sizes by intuition; nothing tells it when
  a unit is too big to build well. Over-coarse IUs are the silent failure mode — an agent
  asked to build a unit that overflows its best-work window degrades partway through and ships
  weaker work, with no signal that the *decomposition* (not the agent) was the problem.
- **The cost is never measured.** We have no per-IU token figure, so we can't see whether
  decomposition is right-sized, can't calibrate any budget, and can't catch decomposition
  drift over time.

`build`'s mode selection compounds this: it keys off *count + dependencies + independence*, not
context. The reconciliation's **CF-3** already noticed the seam (for 3+ serial IUs, default to
fresh-context *subagents* because context degrades as it fills) — but treated it as a build-mode
tweak rather than the decomposition principle it implies.

## 2. Decision

1. **The IU is a single-agent-implementable unit.** An IU's `goal` + `files` + `acceptance`
   must be buildable by *one fresh agent within its best-work context budget*. This is an
   explicit decomposition criterion in `plan` and a (soft) invariant in `IU-schema`.

2. **The budget is a measured dial, not a hardcoded number.** The durable rule is "one agent,
   bounded fresh context, split diligently." The working default is **~100k tokens**, recorded
   as a **harness-tunable** value, not an `IU-schema` constant — because the best-work window is
   model/version-dependent and must be verified, not assumed. The default is documented; the
   harness may override it.

3. **Tokens-per-IU is a first-class measured metric.** `build` emits `tokens_per_iu` on each
   **unit-complete event** (the per-IU event that already exists). It lands in the analytics
   event log (06-analytics, product-outcomes stream). `measure-outcomes` derives the
   distribution (median, p90) and the **over-budget share** — the fraction of IUs whose build
   exceeded the budget. This makes the dial empirical: set the default, measure reality, tune.

4. **Build's default execution model is one-IU-one-fresh-context.** Generalising CF-3:
   serial-subagent dispatch for dependent sets, parallel-subagent for independent ones, each
   subagent getting that IU's full context bundle and returning a unit-complete summary +
   `tokens_per_iu`. Main-thread `inline` is reserved for a single tiny unit or where the
   operator deliberately wants context carry-forward between two tightly-coupled units.

5. **The budget is a routing test between the two loops.** A standalone (incremental) IU that
   *also* won't fit one agent's budget is a **promote** signal — it has decomposed into work
   that needs a work-item and a plan. Budget and the vertical-slice invariant (D56) interact
   exactly here.

## 3. Why tokens-per-IU is the metric that matters

It is simultaneously a **cost signal** and a **decomposition-quality signal**, and it closes a
feedback loop the factory otherwise lacks:

- **Calibration.** Without measured tokens/IU, "~100k" is folklore. With it, the default is a
  hypothesis we test every sprint and adjust per model.
- **Decomposition feedback to `plan`.** If the over-budget share is high, `plan`'s
  decomposition is too coarse — the same shape as `build`'s existing "weak acceptance criteria
  are a *plan* gap, not a *build* gap" framing. `measure-outcomes` surfaces it; `debrief` reads
  it back; `plan` tightens. **Earns-keep:** over-budget share trends toward zero as
  decomposition matures; a persistently high share means IUs are being drawn too big.
- **Model-shift detection.** When the underlying model changes, the tokens/IU distribution
  moves; that's the signal to re-tune the dial rather than discovering degraded build quality
  the hard way.

## 4. How tokens-per-IU is captured (analytics)

No new instrumentation machinery — it rides the existing event log:

- Under the one-IU-one-fresh-context default, each IU is built by a subagent whose total token
  usage is accountable. `build` records that figure as `tokens_per_iu` on the **unit-complete
  event** it already emits per IU (carrying `iu_id`, acceptance evidence, and now token cost).
- The event appends to the carrier-tagged local event log (`.stack-graph/`, gitignored), in the
  **product-outcomes** stream (06-analytics stream namespacing).
- `measure-outcomes` (read-only, per its locked contract) computes the per-sprint distribution
  and over-budget share against the harness budget value; `debrief` surfaces the trend; the
  terminal recorder freezes it into the closed record like any other metric. No node writes a
  bespoke store; no change to the projection model.

## 5. What this is not

- **Not a hard cap.** Build does not abort an IU that crosses the budget mid-run; it *records*
  the overage. The budget governs *decomposition* (plan's job) and *calibration* (the dial),
  not a runtime kill-switch.
- **Not a new schema store.** `tokens_per_iu` is one field on an event that already exists.
- **Not a fixed number in the contract.** The `IU-schema` carries the *principle*; the harness
  carries the *value*.

## 6. Implementation surface (for the amend wave)

Folds into the reconciliation's existing APPLY items rather than standing alone:

- **`IU-schema`** (rides CF-1's `{author-ref}` edit): add the single-agent-implementable
  invariant + re-anchor `size`; name `tokens_per_iu` as the measured outcome.
- **`plan` Phase 1**: add the budget decomposition criterion.
- **`build`** (generalises CF-3): one-IU-one-fresh-context default; emit `tokens_per_iu` on
  unit-complete (rides CF-1's evidence change to the same event).
- **`06-analytics`**: name `tokens_per_iu` in the instrumented metric set / product-outcomes
  stream.
- **`measure-outcomes`**: add the tokens/IU distribution + over-budget share to its derived
  metrics (consistent with its pure-read contract).
- **`07-decomposition`**: add the budget heuristic to the granularity rule.
