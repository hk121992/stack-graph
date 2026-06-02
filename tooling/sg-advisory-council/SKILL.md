---
name: sg-advisory-council
description: Convene a NON-AUTHORITATIVE methodology-grounding board over a graph pack. Reads the pack's methodology-provenance manifest and dispatches the relevant source-custodian advisors (Cagan/SVPG, Osterwalder/Strategyzer, Blank/Customer Development) to surface fidelity / gap / grounding / seam findings for the operator to filter. Two modes — convene (default: select seats, run the mandatory seam pass, dispatch in parallel, synthesise an advisory report) and roster (print the board, methods, triggers, sources; no dispatch). Dev-time tooling for building stack-graph itself; advisory only — never gates, never mutates, never auto-applies, never vendored. Do NOT use it to judge a product decision, and do NOT use it for context-loading.
---

# sg-advisory-council

You are operating the `sg-advisory-council` skill. The operator invoked `/sg-advisory-council <mode>
<target>` inside a Claude Code session, and Claude Code loaded this SKILL.md as your instructions.
There is no dispatcher binary. **You are the dispatcher.**

This skill is a **dev-time methodology-grounding board** for building stack-graph itself — the `sg-*`
prefix encodes that boundary, sibling to `sg-graph-maintainer` and `sg-handbook-curator`. It convenes
a small board of **source-custodian** advisors over a **pack** and asks one question: *does the graph
faithfully and completely encode the methodology the pack claims, and what is missing?* Source lives
at `tooling/sg-advisory-council/`. Design: `docs/advisory-council-design.md` (decision **D48**).

**It is advisory and non-authoritative.** It never gates, never mutates, never auto-applies. Its
output is *suggestions the operator reads and filters*; the operator decides what (if anything) to
route into `sg-graph-maintainer` / `sg-handbook-curator`. Because nothing is auto-applied, grounding
is kept lightweight (closed principle catalogs + confidence flags); a hallucinated finding is a cost,
not a catastrophe — but advisors still must cite real catalog principles or label a concern an
`ungrounded-hunch`.

## What this skill is NOT for

- **Not for judging the product.** It audits the **encoding** of methodology in the graph, never a
  roadmap item, feature, strategy content, or business decision. Those are the product-facing nodes'
  job (`product-lens`, `strategy-curator`).
- **Not authoritative.** It does not gate a PR, approve a design, or block a build.
- **Not for context-loading.** Agents read the handbook/graph directly. This convenes a critique.

## How invoked

```
/sg-advisory-council                              # bare; orient and ask mode + target
/sg-advisory-council convene <pack>               # e.g. convene pm   (or product-management)
/sg-advisory-council convene <pack> --advisors cagan,osterwalder   # explicit roster override
/sg-advisory-council convene <pack> "<question>"  # a specific grounding question
/sg-advisory-council roster                       # print the board; no dispatch
```

## Mode availability

| Mode | Status |
|---|---|
| `convene` | Available |
| `roster` | Available |
| `sweep` | Deferred — whole-graph scan for ungrounded packs |
| `audit-route` | Deferred — auto-routing gaps into maintainer/curator |

When a deferred mode is invoked, print "deferred — not available in this version" and stop.

## Bare-invocation behaviour (no mode)

Print the orientation block, then ask via AskUserQuestion which mode + target.

> sg-advisory-council convenes a non-authoritative methodology board over a graph pack. It reads the
> pack's methodology-provenance manifest and dispatches the relevant source-custodian advisors to
> surface where the graph drifts from, or under-implements, the method it claims — for you to filter.
> It never gates or mutates.
>
> - **convene `<pack>`** — select the board for that pack, run the seam pass, dispatch the advisors
>   in parallel, and synthesise an advisory grounding report.
> - **roster** — print the board (seats, methods, triggers, sources). No dispatch.

AskUserQuestion — Header: "Which mode?". Options: "convene", "roster", "abort". If convene, follow up
for the target pack.

## Mode: convene

**One-line.** Convene the relevant source-custodians over a pack's provenance manifest; surface
fidelity / gap / grounding / seam findings; synthesise an advisory report. No mutations.

**Sequence.**

1. **Resolve the target pack.** Map the argument to a pack id (`pm` / `product` → `product-management`).

2. **Read the provenance manifest** at `graph/_refs/<pack>-methodology-provenance.md`. **If it does
   not exist, STOP** and report: *"No methodology-provenance manifest for `<pack>`. Author one (it is
   part of building the pack — see `07-decomposition` / D48) before the board can audit it."* That
   refusal **is** the first grounding finding — do not fabricate an audit without a manifest.

3. **Read `references/council-dispatch.md`** and select the board for this pack (do not convene the
   whole roster by default):
   - **Claimed-method custodians** (the manifest's `claimed_methods`) run a **fidelity + gap** audit.
     PM pack → `cagan` (SVPG) + `osterwalder` (Strategyzer).
   - **Domain-relevant, *unclaimed* custodians** run a **coverage-gap** audit — "this method is
     absent; deliberate scope or blind spot?" PM pack → `blank` (Customer Development is *not
     claimed*; the manifest's `principles_omitted` O8 says so — Blank checks whether the pack
     validates demand or assumes it).
   - Honour `--advisors a,b` (explicit override) and `--full-board` (rare). Floor: ≥1 seat; if none
     matches, refuse and ask the operator to name a seat.

4. **Build each advisor's spawn bundle** from the manifest:
   - the **manifest path** (`graph/_refs/<pack>-methodology-provenance.md`);
   - the **named node/reference files** the manifest's `encoded_by` column points at for that seat's
     lane (read the manifest, collect the real ids/paths — e.g. `four-risks`, `vpc-schema`,
     `bmc-schema`, `strategy-curator`, `product-lens`, `okr-schema`…);
   - an optional **design-doc section** (`docs/product-management-design.md`) for intent context;
   - the **question** (from the operator, or a default: "audit encoding fidelity, gaps, and
     grounding of this pack against your method");
   - the **dimensions** in scope (`fidelity | gap | grounding`).

5. **Dispatch the selected advisors in parallel** — one Agent call each, in a single message. For
   each seat, read `agents/<seat>.md`, pass it as the subagent's instructions together with the
   spawn bundle. **Model: opus** (methodology audit is judgment-heavy). Each returns findings
   conforming to `references/grounding-schema.md`.

6. **Run the mandatory seam pass** (per `council-dispatch.md`). Over the manifest's
   `method_interfaces`, check each method boundary (e.g. SVPG ⊃ Strategyzer nesting; the four-risks
   bridge; the evidence-strength × maturity dial). **You** (the orchestrator) may raise a
   `dimension: seam` finding even when no single advisor owns it — this is the guard against
   selective dispatch missing the seams where drift hides. For a multi-method pack, ensure ≥1
   integration review per boundary.

7. **Synthesise — advisory** (per `grounding-schema.md`). Dedup + corroborate across seats; cluster
   `faithful / drifting / missing / seams`; prioritise the few worth acting on first. Lead with the
   banner:
   > **Advisory only** — suggestions to consider, not verdicts. Nothing here is applied
   > automatically; you decide what (if anything) to route into `sg-graph-maintainer` /
   > `sg-handbook-curator`.

8. **Report to the operator in chat. No audit files; no mutations; no auto-routing.** If the operator
   wants to act on a finding, they invoke the maintainer or curator themselves.

**Output.** Chat report only.

## Mode: roster

**One-line.** Print the board — each seat, its method, convene-when triggers, and catalog sources.
No dispatch, no target.

**Sequence.** Read `references/council-dispatch.md` (the roster + triggers) and each
`references/catalogs/<seat>.md` header (sources). Print a table: seat, custodian, method, sources,
convene-when. Note the deferred seats (growth: Balfour; reality-check: Graham/Tan) and that they are
not built. No files written.

## Agent dispatch

Each file in `agents/` is a stateless task-instruction subagent (the advisor seats). Dispatch via the
Agent tool; read the agent file to refresh its input/output contract before each dispatch.

| Agent | Model | Rationale |
|---|---|---|
| `agents/cagan.md` | opus | Methodology-fidelity audit (SVPG) — judgment-heavy |
| `agents/osterwalder.md` | opus | Methodology-fidelity audit (Strategyzer) — judgment-heavy |
| `agents/blank.md` | opus | Coverage-gap audit (Customer Development) — judgment-heavy |

Dispatch shape: read the seat file → construct the spawn bundle (step 4) → invoke Agent with
`model: opus` → verify the return conforms to `grounding-schema.md` → forward to synthesis. If a
return is malformed, re-dispatch once with "Previous output did not conform to grounding-schema;
return only conformant findings." If it fails again, note the seat as errored in the report and
continue with the others (the board is advisory — a missing seat degrades, it does not block).

## Shared infrastructure — preflight (before convene)

1. Confirm the repo is reachable (`graph/_refs/` exists).
2. Confirm the target pack's manifest exists (step 2). Absent ⇒ the stop above.
3. Confirm `references/catalogs/<seat>.md` exists for each selected seat. A missing catalog ⇒ that
   seat cannot be grounded; drop it with a one-line note rather than dispatching an ungrounded advisor.

## Hard constraints

**MUST**
- Convene only the matching board; prefer the smallest sufficient set; **always** run the seam pass.
- Treat a missing manifest as the first finding and stop — never fabricate an audit.
- Keep output **advisory**: report-only, no mutations, no auto-routing, severity/confidence are
  salience not gates.
- Require advisors to cite only catalog `principle_id`s (or label `ungrounded-hunch`).

**MUST NOT**
- Judge a product decision, roadmap item, feature, or strategy/business-model content.
- Open PRs, edit graph/handbook/tooling files, or apply any finding.
- Be vendored into the plugin or installed by a consuming workspace.
- Convene the full board by default.

## Cross-references

| Surface | Path |
|---|---|
| Design + decision | `docs/advisory-council-design.md`, `docs/decisions.md` (D48) |
| Convening + seam-pass rubric | `references/council-dispatch.md` |
| Finding schema | `references/grounding-schema.md` |
| Principle catalogs | `references/catalogs/{cagan,osterwalder,blank}.md` |
| Advisor seats | `agents/{cagan,osterwalder,blank}.md` |
| Manifest (what is audited) | `graph/_refs/<pack>-methodology-provenance.md` |
| Manifest concept | `handbook/content/07-decomposition` (pack provenance — amendment pending) |
