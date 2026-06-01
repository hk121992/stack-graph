---
title: The experience thread — UX + AX testing (working doc)
status: working draft — 2026-06-01
---

# The experience thread

Verifying that a **probabilistic AI product behaves the way we intended**. You have an intended way
the experience should run; because the model is probabilistic you must actually run personas and
scenarios through it and check the real outputs — and the real *traversal* — against expectation, to
catch the edge cases instructions don't cover. This is distinct from product management (what to
build, and why) and from code review (is the code correct). It is the **built → test → find edge
cases → verify** side.

It is a **thread**, not a parallel function — the same shape as the visual-design thread
(`design-consultation → design-shotgun → design-implement → design-review`): it spans the dev-sprint's
**design → build → verify** span rather than running alongside it. (Terminology, per the review: "arc"
is reserved for the dev-sprint's process-edge traversal; PM and experience are **threads/loops** that
attach to it. The operator's "experience arc" is this thread.)

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `01-concepts` | Concepts / threads | **amend** — the experience thread; the **UX vs AX** distinction; verification vs PM vs code-review. |
| `06-analytics` | Instrumentation, conformance, baseline | **amend** — AX measurement (tokens/latency/path/friction) is the **product-facing instance** of the factory's own traversal instrumentation; conformance against an experience contract. |
| `07-decomposition` | Choosing the primitive | **amend** — `simulate-users` (agent), the experience contract (ref), AX-optimise reusing the generate→measure→select shape. |
| `04-harness-spec` | Harness surfaces | **amend** — the experience contract + personas are harness-supplied; the thread attaches to the dev-sprint. |

## The two dimensions: UX and AX

Experience testing grades **both** of these on every run — following only the output is half the
picture:

- **UX — the output the agent produces.** Does the result the user gets match intent? Graded against
  the **experience contract**: session-shape invariants, named failure modes, success criteria.
- **AX (agent experience) — the agent's *process*.** What tools/nodes the agent uses, the friction it
  hits in the background (wrong turns, dead ends, backtracking, ambiguous instructions), and the
  **cost to the outcome**: tokens-to-outcome and inference latency/steps-to-outcome. The optimisation
  target is **the same outcome for fewer tokens and faster inference**.

For Be Civic this is concrete: BC ships a knowledge graph plus a harness that a *user's agent*
traverses. The traversal is probabilistic — instructions guide it, but edge cases break it. UX asks
"did the user's agent produce the right answer?"; AX asks "how efficiently did it get there, and where
did it struggle?".

## The thread

- **Experience contract** (design-time, harness-supplied) — the intended experience: **UX intent**
  (invariants, failure modes, success criteria) + **AX intent** (token/latency budgets, the intended
  tool-path). BC's "Experience Arc" is the UX half; the AX budgets are the new half.
- **`simulate-users`** (verify-time) — run **persona × scenario** against the live probabilistic
  product; from the transcript, **grade UX** (output vs contract) **and measure AX** (tokens, latency,
  inference steps, tool-path, friction points). One run yields both a UX verdict and an AX profile.
- **Fix / optimise loop** — UX failures route to a fix of the instructions/knowledge-graph (build);
  **AX inefficiencies route to optimise** — generate instruction/knowledge-graph variants → re-simulate
  → keep the variant that cuts tokens/latency *while UX still passes* (the generate→measure→select
  shape the graph already uses in `optimise`, with `simulate-users` as the evaluator). Both feed
  `debrief` and the conformance/analytics layer.

## PM ⟷ experience interactions

The two are tightly coupled, and the coupling is the point:

| Flow | Direction | What moves |
|---|---|---|
| **Personas** | PM → experience | **PM owns and maintains personas** (part of its strategic substrate — target users / segments / jobs-to-be-done). Experience testing **consumes** them to drive `simulate-users`. (BC: `profiles.md` lives under user-research; the test harness symlinks it in — PM owns, experience reads.) |
| **Scenarios** | PM → experience | scenarios derive from PM's **jobs-to-be-done** — what the persona is actually trying to accomplish. |
| **Success criteria** | PM → experience | the experience contract's definition of a "good outcome" is informed by PM's **value proposition** — the value the product is supposed to deliver. |
| **Findings** | experience → PM | a persona/scenario that consistently fails can reveal a **mis-targeted segment or an unmet need**, not just a bug — that signal loops back to PM's hypotheses/canvas (via `debrief`). |

So personas are the shared spine: **defined and maintained by PM, consumed by experience testing.**
Experience testing is not a replacement for real user discovery (that is PM's, with real evidence);
it is product/UX verification of the probabilistic product PM decided to build.

## Dev-sprint integration

The thread attaches across the dev-sprint span: the **contract** is authored/refined at `design`; the
agent's instructions + knowledge-graph are built at `build`; `simulate-users` runs in the **verify**
span as a **sibling of `qa` (browser behaviour) and `design-review` (visual)** — the AI-agent-behaviour
verification modality; the fix/optimise loop returns to `build`; trends land at `debrief`.

AX measurement reuses the graph's **measure-vs-baseline** shape (`benchmark` / `canary` / `health`):
tokens / latency / inference-steps / tool-path / friction, each against a stored baseline, emitting a
trend point. AX optimisation reuses the **generate → measure → select** shape (`optimise`).

## Thesis fit

This is close to a flagship use case. stack-graph models and improves **agent operating environments**,
and BC's product *is* one. **AX measurement is the product-facing instance of the factory's own
traversal instrumentation** (`06-analytics`): the factory instruments how agents traverse *its* graph
(tokens, conformance, baselines); the experience thread instruments how a user's agent traverses the
*product's* graph. Same machinery, different target. That symmetry is worth making explicit in the
spec.

## Consequences for the captured design

- **`simulate-users` moves out of the PM pack into the experience thread.** It **drops its `four-risks`
  reference** (a PM/discovery lens — experience testing grades against the *experience contract*, not
  the four product risks), and gains **UX-grading + AX-measurement** plus references to the
  **experience-contract** and **personas** (PM-owned). The built node stays; it is re-homed and amended.
- **This resolves the Codex "simulate-users overclaimed as value evidence" blocker by reclassification**
  — PM's value/viability evidence is then real discovery only, and `simulate-users` drops off the
  maturity-ladder evidence column (experience testing runs whenever there is a built experience to
  test, independent of venture maturity).
- **`personas` is reclassified as a PM-owned surface** consumed by the experience thread (a cross-thread
  reference), not an experience-pack artefact.
- The PM design doc + `pm-graph-map.md` are reconciled to all of the above **in the revision pass**
  (together with the other Codex fixes), so PM is edited once, coherently — not churned here.

## The graph translation (provisional)

- **`experience-contract`** — a reference (UX invariants + failure modes + AX budgets + intended
  tool-path); harness-supplied (`external: true`), the harness's own intended-experience spec.
- **`simulate-users`** (agent, re-homed) — runs persona × scenario; emits a UX verdict + an AX profile;
  references `experience-contract` + `personas` (both external/PM-owned, on-demand). tier-1 / tier-2 as
  before.
- **AX measurement** — captured by `simulate-users` from the run; baselines/trends use the
  measure-vs-baseline pattern (reuse `benchmark` or a sibling — decide at build).
- **AX optimise** — reuses `optimise` with `simulate-users` as the evaluator (open: its own node vs a
  mode of `optimise`).

## Open

- The exact **AX metric set + budgets** (tokens / latency / inference-steps / tool-path / friction) and
  how the tool-path/friction are extracted from a transcript.
- Whether **AX-optimise** is its own node or a mode of `optimise`.
- Whether AX measurement folds into `simulate-users` or is a separate measure-vs-baseline node.
- The **experience→PM feedback edge** mechanics — how a "persona consistently fails" finding reaches the
  PM canvas/hypotheses (via `debrief` routing, or the strategy-curator's `gather-evidence`).
- The experience contract's exact shape and whether parts of it are a `handbook-reference` (operator-
  reviewable) vs a node-bound reference.
