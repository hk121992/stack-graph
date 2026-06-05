---
title: Research report for optimise
type: research-report
status: complete
authored: 2026-06-05
last_updated: 2026-06-05
sources_lifted: 4
external_analogue_found: true
external_corpora_searched: [gstack skill set, factory design docs, factory build node, factory simulate-users node]
researcher_adequacy_note: |
  optimise has no single gstack-skill counterpart — it is the factory's named generate→measure→select
  cross-cutting pattern made into a node, so synthesis is from four lifted sources rather than one
  analogue. The closest external analogue is gstack `benchmark` (measure-vs-baseline), lifted for the
  measure half; the parallel-variant isolation pattern is lifted from the factory `build` node; the AX
  half grounds in the factory `simulate-users` node + experience-thread-design. Edges are high-confidence:
  invokes benchmark (perf evaluator) + invokes simulate-users (AX evaluator) + references
  instrumentation-preamble (import). primitive/mode is skill/collaborative — optimise kicks off with an
  operator confirmation of variant count + mode, then runs the generate/measure/select span. determinism
  is generative (it authors variants and judges friction). Goals were straightforward to frame as
  outcomes (a chosen winner that beats baseline; cost paid only when it pays off). The one design call —
  AX-optimise as a mode vs its own node — is resolved per the approved sprint plan as a MODE (two body
  branches over one skeleton); recorded under Open questions for the translator.
---

# Research report for optimise

## Identity

**Candidate id:** optimise
**Candidate title:** Optimise
**Scope:** The generate-measure-select primitive. Given a target span of an implementation and a
measurable objective, it **generates N implementation variants in parallel isolated worktrees**,
**measures each** with a pluggable evaluator, and **selects the winner** — the variant that best improves
the objective while still passing a correctness/quality gate. It has **two measurement modes** wired as
body branches: **perf mode** (default; evaluator = `benchmark`; keep the fastest that passes correctness)
and **AX-optimise mode** (evaluator = `simulate-users`; keep the variant that cuts tokens/latency/tool-path
while UX still passes the experience contract). It is invoked from within `build` (the `build invokes
optimise` edge is authored on build's side). **Excludes:** authoring the fix for a *failure* (a UX/correctness
failure routes back to build, not to optimise); discovery; deciding *what* to optimise (the caller hands it
the target + objective). optimise only generates, measures, selects.

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| A measurably better implementation of the target span is selected — one that beats the baseline on the objective while still passing the correctness/quality gate. | objective delta of the selected winner vs the baseline (perf: the perf metric; AX: tokens/latency/tool-path), conditioned on the gate passing; share of optimise runs that select a variant strictly better than baseline. | the win rate (runs that find a real improvement) stays high enough that optimise is worth its variant-generation cost; a node that routinely selects "baseline unchanged" is paying generation cost for nothing — a cut/tune signal. |
| No regression is shipped — the selected winner never trades the objective for a correctness or UX failure. | rate of selected winners that later fail the gate they were supposed to pass (a false-win escape); per run, the count of faster/cheaper variants correctly disqualified for failing the gate. | false-win escapes stay at zero; the gate is load-bearing — a variant that is faster but breaks correctness, or cheaper but fails a UX invariant, is disqualified, never selected. |
| The cost of optimising is paid only where it pays off — variant generation is bounded and the round is worth running. | variants generated per run vs improvement found; wall-clock + token cost of a round against the objective delta it yields. | the cost-to-benefit ratio stays favourable; a target where N variants never beat baseline across repeated runs is a signal that span is already optimal (stop optimising it), not an optimise capability gap. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** optimise **kicks off collaboratively** — it confirms with the operator (or caller) the
target span, the mode (perf / AX), the variant count, and the evaluator binding before spending the
generation cost, then runs the generate/measure/select span. That kick-off-then-span shape mirrors
`build` (a collaborative skill that hands off to an autonomous span). It needs the **current context** —
it reads the target, dispatches variant-author workers and the evaluator, and surfaces the comparison
for the select decision — so it is a **skill** (loads into the current context), not an isolated agent.
Per the schema's `primitive↔mode` rule, `skill → collaborative`. (An agent was considered — optimise does
dispatch subagents — but optimise itself is the orchestrator that engages the operator at kick-off and at
the select gate, which is the skill/collaborative signature, not the autonomous-agent one.)

**`determinism:`** `generative`

**Rationale:** the **generate** step authors alternative implementations (open-ended synthesis, not a
fixed transform) and the **AX measure** step judges what counts as friction — both are judgment, not an
algorithm with one right output. The *selection* arithmetic is deterministic (pick the min cost among
gate-passers), but the node as a whole is **generative** because variant authoring and friction
attribution dominate its character.

## Contract

**Input:** from the caller (`build`, or the operator in a standalone run): the **target span** to optimise
(which files / which product-agent instructions), the **mode** (`perf` default / `ax`), the **objective +
gate** (perf: the perf metric + a correctness check; AX: the experience contract supplies the UX gate and
the AX budgets/baseline), and the **variant count** N. In AX mode the caller also supplies the persona ×
scenario bundle simulate-users needs.

**Output:** the **selected winner** (the variant that best improves the objective while passing the gate),
merged into the working tree; a **comparison record** — every variant's objective measurement + gate
result against the baseline, shown not asserted, so the select decision is auditable; the **losing variants
discarded** (worktrees torn down, branches not merged); enter/exit instrumentation events. optimise makes
no product fix and does no discovery — a *failure* surfaced during measurement routes back to the caller
(build), it is not repaired here.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack skill set | a generate→measure→select / variant-tournament skill | partial — no single one | `measure-vs-baseline-gstack-benchmark.md` (the measure half only) |
| gstack skill set | the measure-vs-baseline analogue | yes — `benchmark` | `measure-vs-baseline-gstack-benchmark.md` |
| gstack skill set | design-shotgun (the generate→evaluate→select sibling for visual design) | yes (named, not lifted) | — (named in graph-design as the same cross-cutting pattern; not needed for body synthesis) |
| factory design docs | the named generate→measure→select pattern + the optimise sub-arc + the AX-optimise loop | yes | `generate-measure-select-shape.md` |
| factory build node | the parallel-worktree variant-isolation pattern | yes | `parallel-worktree-variant-pattern.md` |
| factory simulate-users node | what the AX evaluator returns (UX verdict + AX profile) | yes | `ax-evaluator-simulate-users.md` |

**Note on the analogue.** optimise is a *synthesised* node — the graph names generate→measure→select as a
cross-cutting pattern (graph-design Capstone) with no single skill that is it. The honest external
analogue is gstack `benchmark` for the *measure* half (web-perf-specific, generalised here) and gstack
`design-shotgun` as the *visual-design sibling* of the same generate→evaluate→select pattern. The
parallel-variant and AX halves are in-repo factory material. This is a real searched-and-found record, not
a design-doc-only authoring.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/generate-measure-select-shape.md` | keep | the canonical pattern statement + the two-mode table + the AX-mode-vs-node resolution |
| `source-material/measure-vs-baseline-gstack-benchmark.md` | keep (adapt) | the measure-vs-baseline discipline, generalised from web-perf to a pluggable perf evaluator; the correctness gate is added |
| `source-material/parallel-worktree-variant-pattern.md` | keep (adapt) | variant isolation in worktrees; teardown SAFETY block (lowercase `-d`); merge-winner / discard-losers difference from build |
| `source-material/ax-evaluator-simulate-users.md` | keep | what simulate-users returns; the AX selection rule (lowest cost among UX-passers) |

## Keep / Drop

**Kept (absorbed into body):**
- The generate→measure→select skeleton (one envelope, swappable evaluator).
- Two modes as body branches: perf (default, `benchmark`) and AX-optimise (`simulate-users`).
- The selection rule per mode: fastest-that-passes-correctness; lowest-AX-cost-that-passes-UX.
- Parallel-variant worktree isolation + the order-bearing teardown SAFETY block (lowercase `-d`).
- The merge-winner / discard-losers difference from build.
- The "optimise never fixes a failure — it routes back to build" boundary.
- The enter/exit instrumentation emit (via the imported preamble).

**Dropped (out of scope):**
- gstack benchmark's web-perf specifics (Core Web Vitals, browse-daemon eval, bundle-size thresholds) —
  those belong in the `benchmark` NODE, not optimise. optimise treats benchmark as a black-box evaluator.
- Discovery / "what to optimise" — the caller hands optimise the target + objective.
- Authoring a fix for a failure — routes to build.

**Edge only (separate node):**
- `benchmark` (the perf evaluator) — a node of its own; optimise reaches it via an `invokes` edge.
- `simulate-users` (the AX evaluator) — an existing node; optimise reaches it via an `invokes` edge.

## Overlaps and seams

- **← `build`** (inbound `invokes`): build invokes optimise from within its span. **This edge is authored
  on build's side** (per the sprint plan; do NOT edit build). optimise declares no inbound invoke — the
  same convention `simulate-users` and the review lenses follow (inbound invokes live on the caller).
- **→ `benchmark`** (`invokes`): the perf-mode evaluator. Declared regardless that `benchmark` may be
  authored in parallel right now — it resolves at validate time.
- **→ `simulate-users`** (`invokes`): the AX-mode evaluator. simulate-users already exists; it returns the
  UX verdict + AX profile optimise selects on. NB: simulate-users carries NO inbound invoke in its own
  frontmatter (its inbound edges live on callers) — so this edge belongs on optimise's side. Confirmed.
- **→ `instrumentation-preamble`** (`references`, `load: import`): the enter/exit emit contract.
- **`build → optimise` is an `invokes` edge, not `composes-into`.** optimise is a sub-arc/utility build
  reaches into, not a backbone stage of the dev-sprint. It declares no `composes-into` and no
  `precedes`/`can-follow` — it is not a stage in the arc traversal, so no process edges (avoids the F7
  forward-reference trap entirely).

## Fit

**Single node.** optimise owns its own branching (mode selection → generate → measure → select, with the
parallel-variant safety branch) and sequencing (the order-bearing generate/measure/select span). It has a
distinct measurable goal (a selected winner that beats baseline while passing the gate) separate from its
evaluators' goals (benchmark measures; simulate-users verifies; optimise *selects*). The two modes are
**branches in one body**, not separate nodes — they share the entire generate/select envelope and differ
only in evaluator + selection rule, which is exactly the "modes are body branches, never separate nodes"
rule (02-graph-spec granularity; 07-decomposition). No split warranted.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| invokes | benchmark | perf-mode evaluator — measures each variant's perf, returns the metric to select on. Declared now; resolves at validate (benchmark authored in parallel). |
| invokes | simulate-users | AX-mode evaluator — re-simulates each variant, returns the UX verdict (gate) + AX profile (objective). |
| references | instrumentation-preamble (`load: import`) | the deterministic enter/exit emit contract; spliced in at load via @-import. |

Considered and rejected:
- `references: bundling-rules` — checked; `bundling-rules` is about **PR bundling** (curator splits/bundles
  edits into PRs), NOT worktree/variant bundling. Not relevant to optimise. No edge.
- `references: .worktreeinclude` — the worktree file-copy list. build defers this edge until the ref is on
  disk; optimise rides the same native `isolation: 'worktree'` primitive and defers the same way (F7 —
  named in body prose, no edge until the ref exists).
- `composes-into` / `precedes` / `can-follow` — none. optimise is invoked by build, not a backbone stage;
  it owns no arc-traversal position. No process edges → no F7 forward-reference exposure.

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` ↔ `collaborative` — consistent (kick-off + select gate engage
the operator/caller; loads into the current context).

**`goals:` as outcomes:** all three read as outcomes — a *selected winner that beats baseline* (not "runs
variants"), *no regression shipped* (not "checks correctness"), *cost paid only where it pays off* (not
"generates N variants"). Each has a metric and an earns-keep threshold.

**Edge targets resolvable:** `instrumentation-preamble` resolves (`graph/_refs/`). `simulate-users`
resolves (`graph/simulate-users/`). `benchmark` does NOT yet resolve (authored in parallel) — declared
regardless per the sprint plan; resolves at validate time once benchmark lands.

## Open questions

- **AX-optimise: mode vs node — RESOLVED as a MODE** per the approved sprint plan. The translator authors
  two body branches over one generate→measure→select skeleton, not two nodes. (The design doc parked this;
  the sprint plan settled it.)
- **`benchmark` edge is a forward reference at author time.** Declared anyway per the sprint plan ("declare
  the edges regardless; they resolve at validate time"). If benchmark is NOT landed by the time optimise is
  validated, this is a hard validate failure — coordinate the validate pass to run after both land.
- **`.worktreeinclude` reference deferred** (F7) — same as build; wire it with `amend` once the ref is on disk.
