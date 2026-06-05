---
title: Research report for simulate-users
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-05
amended:
  - { date: 2026-06-01, note: "Experience-thread carve-out (docs/experience-thread-design.md). DROPPED the four-risks reference + framing — simulate-users is the experience thread's verification node, NOT a PM/discovery evidence source; it grades against the experience contract, not the four product risks. ADDED the AX (agent-experience) dimension: alongside UX grading (output vs the contract's invariants + failure modes), the node now also MEASURES the product agent's traversal — tools used, friction/backtracking, tokens-to-outcome and latency/steps-to-outcome — with the optimise framing (same outcome, fewer tokens, faster). One run now returns BOTH a UX verdict and an AX profile. Revised goals to cover UX + AX (added the traversal-cost/friction AX outcome; reframed the value/usability-discovery goal as UX-contract grading). Kept experience-contract + personas externals and tier-1/tier-2 modes. Touched: Identity, Goals, Primitive/Mode rationale, Contract, Source inventory, Keep/Drop, Edges, Conformance, Open questions." }
  - { date: 2026-06-05, note: "Re-home into the verify stage + wire AX into the analytics pipeline (amend, targeted Edits, no regen). THREE edges added/cleared. (1) composes-into dev-sprint stage:verify — the F7 deferral ('verify stage doesn't exist') is CLEARED: the `verify` skill now exists, invokes simulate-users, and composes-into dev-sprint stage:verify; the frontmatter comment is updated from 'deferred' to 'declared'. simulate-users still authors NO inbound invokes (verify holds the invokes edge). (2) references experience-contract-schema (load: on-demand) — the factory _refs/ SHAPE this node grades the run BY, paired with the harness-filled experience-contract EXTERNAL it grades AGAINST (the vpc-schema/bmc-schema schema+overlay pairing; resolves the report's open question 'an experience-contract schema — flagged for the operator'). Existing experience-contract + personas externals KEPT. (3) references instrumentation-preamble (load: import) — added so the node emits enter/exit events (the qa/design-review verify-sibling pattern). BODY: new 'Instrumentation' section — the product run's AX profile attaches as the `ax` aggregate object on the node-exit event in the allowlisted numeric shape the analytics AX axis projects (tokens_to_outcome, duration_ms/latency_ms, steps/steps_to_outcome, tool_calls, backtracks; plus extras like tool_path_breadth Wave 3 registers); publisher reads only allowlisted numeric keys so narrative/tool-path-order stays in the returned profile, not in `ax`; tier-1 estimate vs tier-2 measured. UX-conformance emitted as a gate experience-contract:<pass|fail> in the exit event's gates[]. New D38 section: a CONSISTENTLY-failing persona (mis-targeted-segment/unmet-need signal, not a one-off bug) is returned with a proposed route and reaches the PM surface via debrief/measure-outcomes recording to a swept authored home the strategy-curator sweeps — NOT by writing a curator, NOT via a typed edge; NO edge to strategy-curator added (D38 shared-home pattern, mirrors debrief). Spawn-bundle item 2 + the 'route durable gaps' bullet + Output item 3 tightened to cross-reference. status v0.1.0→v0.2.0. Edges after amend: composes-into dev-sprint(verify); references experience-contract(ext)/experience-contract-schema/personas(ext)/instrumentation-preamble(import). Touched: Edges frontmatter+comment, status, Read-your-spawn-bundle, shared-method bullet, Output, +2 new body sections." }
sources_lifted: 5
researcher_adequacy_note: |
  AMENDED 2026-06-01 for the experience-thread carve-out. The original five Be Civic
  prior-art sources still stand; no new source was lifted — the amendment is a
  reclassification + an added dimension, both grounded in docs/experience-thread-design.md
  and the amended 01-concepts "Experience" section (UX + AX) and 02-graph-spec, not in new
  source material. Two changes: (1) DROPPED the `four-risks` `references` edge and all
  four-risks framing — the design is explicit that simulate-users is the experience thread's
  *verification* node (does the built thing behave?), distinct from PM/discovery (what to
  build, and why); it grades against the **experience contract** (invariants + failure
  modes), not the four product risks. (2) ADDED the **AX (agent-experience)** dimension to
  the method and the contract: every run now also measures the product agent's traversal —
  tools/nodes used, friction (wrong turns, dead ends, backtracking, ambiguous instructions),
  and the cost-to-outcome (tokens-to-outcome + latency/steps-to-outcome) — and returns an AX
  profile alongside the UX verdict, with the optimise framing (same outcome, fewer tokens,
  faster; the generate→measure→select shape `optimise` already uses, simulate-users as the
  evaluator). Edges after the amendment: only the two externals (experience-contract +
  personas, on-demand) — no four-risks, no invokes/composes-into (deferred per F7, unchanged).
  `agent` / `autonomous` / `generative` are unchanged and still correct. Goals reframed
  cleanly as outcomes (a UX-contract goal + a new AX traversal-cost/friction goal + the
  cheaper-than-real-users goal retained). Recommendation: proceed to translator — re-render
  the canonical to (a) strip four-risks, (b) carry UX + AX through body, contract, and
  output. The tier-2 orchestration resolution and the single-node-vs-split open question are
  unchanged and still apply.
---

# Research report for simulate-users

## Identity

**Candidate id:** simulate-users
**Candidate title:** Simulate users

**Scope:** A general, product-agnostic autonomous agent that runs **persona × scenario**
against the live **probabilistic** product and grades **two dimensions** of the experience
on every run. It is the **experience thread's verification node** — *does the built thing
behave the way we intended?* — and is therefore **distinct from PM/discovery** (what to
build, and why) and from code review (is the code correct). It is **not** a PM evidence
source: it grades against the harness-supplied **experience contract** (session-shape
invariants + named failure modes), not the four product risks.

The two dimensions, both graded every run:

- **UX** — the **output** the product produces, graded against the experience contract's
  **invariants** and **failure modes** (pass / fail / n-a + one-line evidence) — does the
  result the user gets match intent?
- **AX (agent-experience)** — the product agent's **traversal**: the tools/nodes it used,
  the **friction** it hit (wrong turns, dead ends, backtracking, ambiguous instructions),
  and the **cost to the outcome** — **tokens-to-outcome** and inference
  **latency/steps-to-outcome**. The optimisation target is **the same outcome for fewer
  tokens and faster inference**.

One run yields **both a UX verdict and an AX profile**. It runs in two modes (body branches,
per D34): **`tier-1`** — one agent plays both the persona-user and the product/assistant,
grades UX inline, and reconstructs the AX traversal/cost from its own run (cheap, gap-finder);
**`tier-2`** — a multi-role harness (persona-agent + assistant-agent running the product +
judge-agent grading UX against the contract and profiling AX from the transcript), more
realistic, reserved for candidate experiences. The node owns the **simulation method, the
role contracts, the UX assertion model against the experience contract, the AX measurement
(metrics + how the tool-path/friction/cost are read from the run), and the verdict + profile
shape**.

It **excludes**: real-user interviews / evidence sessions and any **PM/discovery** evidence
(value/viability is real discovery, owned by the strategy curator — *not* this node); the
*content* of the experience contract, the failure modes, and the personas (all
harness-supplied via external references — the node carries the method, never the product's
session shape or its users); and any orchestration the node cannot itself perform (see
*Fit* — tier-2 spawn is owned by the caller). AX measurement reuses the factory's own
**measure-vs-baseline** + **generate→measure→select** machinery rather than re-inventing it;
the *baselines/trends store* and any AX-optimise node are harness/loop concerns, not baked
into this node (see *Overlaps and seams* and *Open questions*).

## Goals

What this node should achieve (as outcomes, not activities). The first two are the **UX**
dimension; the third is the new **AX** dimension; the fourth is the cost discipline that
keeps it run-often:

| outcome | metric | earns-keep |
|---------|--------|------------|
| **(UX)** The product behaves as intended *before* real users see it — edge cases the instructions don't cover are caught against the experience contract, not by eyeballing. | Fraction of UX defects later confirmed (by real-user signal or a downstream stage) that a prior simulation run had already flagged; per-run count of distinct UX gaps surfaced. | The "already-flagged" fraction stays high enough that simulation is trusted as the experience-verification stand-in; a run that routinely surfaces nothing real is a cut/tune signal for that mode. |
| **(UX)** Experience-contract invariant violations and named failure modes are caught per run, against the contract — each with one-line evidence. | Per-run count of contract-invariant violations + failure-mode hits, each with one-line evidence; share that survive operator triage as real (vs. false positives). | The surviving (true-positive) violation rate stays non-trivial AND the false-positive rate stays low enough that the verdict is actioned rather than dismissed. |
| **(AX)** The product agent's traversal cost and friction are surfaced every run — tokens-to-outcome, latency/steps-to-outcome, the tool-path, and where the agent struggled — so the experience can be optimised to the same outcome for fewer tokens and faster. | Per-run AX profile: tokens-to-outcome, inference latency/steps-to-outcome, tool-path, and ranked friction points (backtracks, dead ends, ambiguous-instruction stalls); measured against a stored AX baseline where one exists, emitting a trend point. | The AX profile is precise enough that an `optimise` cycle can act on it — a variant that cuts tokens/latency while UX still passes is identifiable from the profile; an AX profile no optimisation ever uses is a cut/tune signal. |
| The evidence is cheaper than real-user testing, so it actually gets run on every material experience change. | Cost per run (wall-clock + operator attention) and run frequency vs. the real-user-testing alternative it stands in for; tier-1 vs tier-2 cost split. | Tier-1 stays cheap enough to run on every material experience change; tier-2 stays cheap enough to run on candidate experiences. If simulation is routinely skipped for cost, the mode is restructured. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** This is a unit of work best run in an **isolated context that returns a
summary** (the graded findings / verdict), not a collaborative main-thread workflow. It is
fully describable in a spawn prompt (the experience contract, the personas/scenario, the
mode selector), it does not benefit from the live main thread, and it is parallelizable
(many persona × scenario runs). That is the textbook agent profile per `07-decomposition`
("a unit of work best run isolated, returning only a summary; parallelizable; fully
describable in a prompt"). It is the **experience thread's verification node** (the
AI-agent-behaviour sibling of `qa` and `design-review` in the verify span), and the
`explore` mirror still holds at the primitive level — an autonomous, spawn-bundle-driven
agent that returns a distilled result and never converses with the operator (the difference
is the job: `explore` gathers context; simulate-users grades + measures a simulated run).
The `agent` / `autonomous` agreement is satisfied (skill↔collaborative, agent↔autonomous).
**The one wrinkle is tier-2 orchestration** — see *Fit*; it does not change the primitive
(the node is still an agent; the multi-role spawn is owned by the caller, exactly as
`review` — a skill — owns the spawn of its lens **agents**).

**`determinism:`** `generative`

**Rationale:** The work is **judgment**, not a fixed input→output transform: roleplaying a
believable persona-user, honestly applying the product's instructions, **grading** UX
against the experience contract's invariants and failure modes, and **reading the AX profile**
off the run (which tools were used, where the agent backtracked or stalled, how the
tokens/latency/steps accrued — a judgment call about what counts as friction and what the
cost-to-outcome was) are all generative. There is no deterministic algorithm that produces
the verdict or the profile. (Contrast a script with fixed inputs/outputs, which would be
deterministic. Note: the raw token/latency *counts* may be read mechanically from the
run/transcript, but turning them into an AX profile — attributing friction, judging
backtracks — is generative; the node is generative overall.) Matches the `explore` and
`lens-*` agents, which are likewise `generative`.

## Contract

**Input** (the spawn bundle — filled by the orchestrator/caller, per the spawn-prompt
discipline in 02-graph-spec/03-plugin-spec, never imported by the agent):

- **Mode selector** — `tier-1` or `tier-2`.
- **Experience contract** — the harness-supplied session-shape invariants + failure modes
  the run grades against (read at the step of need via the external `experience-contract`
  reference, which the harness overlay binds to the product's contract).
- **Persona(s)** — drawn from the harness-supplied persona library (the external `personas`
  reference); for tier-1 one agent embodies the persona, for tier-2 the persona-agent does.
- **Scenario** — what the persona is trying to accomplish this run, with pacing notes (what
  the user volunteers, and when).
- **(AX) the intended tool-path + AX budgets** — carried by the experience contract (the
  intended traversal and any token/latency/step budgets the run measures against), plus the
  prior **AX baseline** for this experience where one exists (so the run can emit a trend
  point). Harness-supplied via the same `experience-contract` reference.
- (Tier-2 only, supplied by the caller, not the agent) the role wiring — which session is
  persona / assistant / judge.

**Output (both a UX verdict and an AX profile, every run):**

- **(UX) Graded findings** against the experience contract: per-invariant / per-failure-mode
  **pass / fail / n-a** with **one-line evidence**.
- **(UX) A ranked list of holes** that separates **product-content gaps** (the product can't
  serve this) from **experience/harness gaps** (the product could, but the experience
  breaks down) — generalised from BC's "corpus-content gaps vs experience/harness gaps".
- **(AX) An AX profile** of the product agent's traversal: **tokens-to-outcome**, inference
  **latency/steps-to-outcome**, the **tool-path** (which tools/nodes were used, in order),
  and **ranked friction points** (wrong turns, dead ends, backtracking, ambiguous-instruction
  stalls), measured against the intended tool-path + AX baseline where supplied, and emitting
  a **trend point** — the input an `optimise` cycle acts on (same outcome, fewer tokens,
  faster). This **replaces** the old four-risks value/usability read.
- **A structured verdict** + the **transcript** (tier-1: one document alternating
  persona/product turns with inline `[GAP: …]` markers; tier-2: the dialogue + the judge's
  graded verdict). Verdicts + profiles are designed to **persist as comparable session
  artefacts** so runs (and AX trends) are comparable over time (the *where* they persist is a
  harness concern).
- (Tier-2) the judge accumulates a **learnings ledger** across runs — generalised from BC's
  Tier-2 judge ledger; the ledger's home is harness-supplied.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/bc-06-experience-02-testing.md` | keep | The two-tier method, the **UX** assertion-model (grade against the contract invariants + failure modes), the structured-verdict shape, the corpus/learnings loop, cadence. **Generalise**: lift the two tiers, the UX assertion model, the verdict shape, the gap-categories. The **7 failure modes (F1–F7) are BC-specific → drop** from the node; they are the harness experience-contract's content (the node carries only the *category*). **AX is NOT in this source** — the agent-experience dimension (tokens/latency/steps/tool-path/friction + the optimise framing) comes from docs/experience-thread-design.md + the amended 01-concepts "Experience" section, and reuses the factory's own measure-vs-baseline + generate→measure→select machinery; it is added on synthesis, not lifted here. |
| `source-material/bc-06-experience-01-arc.md` | edge-only | An **example experience-contract** (session beats + invariants-as-test-assertions). The *contract itself* is harness-supplied → modelled as the external `experience-contract` reference, NOT absorbed. Keep only the abstract shape ("a contract = session-shape invariants + failure modes the run grades against"); drop all BC beats/invariants. |
| `source-material/bc-tier1-self-simulator-runbook.md` | keep | The tier-1 body branch: one agent alternates **persona / product** turns, **honestly applies** the product instructions (does not fill gaps with plausible behaviour), marks gaps inline `[GAP: …]`, terminates on scenario-complete / N-gaps / turn-cap, emits transcript + ranked gaps. **Drop** BC bundle / CLAUDE.md-autoload / MCP-launch mechanics (harness-specific) and the shell-runner. Also evidence for orchestration (subprocess-launched = operator-orchestrated). |
| `source-material/bc-tier2-customer-agent-runbook.md` | keep | The tier-2 **persona-agent role contract**: embody the persona, run the scenario, stay in character, push back on out-of-character asks, emit `[END_OF_CONVERSATION]`. **Decisive for orchestration**: the header states the harness side runs in a **separate session** and this prompt drives the customer side — the three roles are **separate sessions orchestrated externally**, confirming tier-2 cannot be agent-self-spawned. Keep the role contract; drop BC scenario-path specifics. |
| `source-material/bc-personas-profiles.md` | edge-only | An **example persona library** (10 profiles + a coverage matrix). The library is harness-supplied → modelled as the external `personas` reference, NOT absorbed. Keep only the abstract shape (a profile carries enough to drive a believable user + a coverage matrix); drop all BC persona content. |

(One in-repo authoring reference is read directly by the translator and is **not** lifted
into source-material because it is not BC prior art to absorb: `graph/explore/explore.md` —
the shape/voice/edge mirror at the primitive level. The `graph/_refs/four-risks.md` lens was
formerly read here as the imported lens; **after the experience-thread carve-out this node no
longer imports it**, so it is no longer a translator input for simulate-users.)

## Keep / Drop

**Kept (absorbed into the node body):**

- **The two tiers as two body branches** (D34): `tier-1` single-agent dual-role walkthrough
  (cheap, gap-finder, run often) and `tier-2` multi-role harness (realistic, candidate
  experiences). Including the honest framing that tier-1 *flatters routing-correctness*
  (one agent both reads the product and decides), so a tier-1 pass means "the product
  *enables* a good answer", not "any agent gets there" — generalised from the BC note.
- **The UX assertion model**: grade a run against the experience contract's invariants + the
  failure modes; emit per-assertion **pass / fail / n-a + one-line evidence**.
- **The AX measurement (new)**: from the run/transcript, profile the product agent's
  traversal — **tools/nodes used**, **friction** (wrong turns, dead ends, backtracking,
  ambiguous-instruction stalls), and the **cost-to-outcome** (**tokens-to-outcome** +
  inference **latency/steps-to-outcome**) — against the intended tool-path + AX baseline,
  emitting a trend point. Framed for **optimise** (same outcome, fewer tokens, faster); reuses
  the factory's own **measure-vs-baseline** (`benchmark`/`canary`/`health`) and
  **generate→measure→select** (`optimise`) shapes rather than inventing new machinery. AX is
  the **product-facing instance of the factory's own traversal instrumentation** (06-analytics)
  — same machinery, pointed at the product's graph instead of the factory's.
- **The verdict + profile shape**: a UX verdict (graded findings + ranked holes split into
  **product-content gaps** vs **experience/harness gaps**) **and** an AX profile, per run;
  both shaped as comparable artefacts.
- **Tier-1 runbook mechanics (generalised)**: alternate persona/product turns; **honesty
  rule** (be honest about what the product instructions actually say; do not invent
  behaviour to paper a gap); inline `[GAP: …]` marking; termination conditions
  (scenario-complete / gap-cap / turn-cap); transcript + gaps-summary output.
- **Tier-2 role contracts (generalised)**: persona-agent (embody + stay in character +
  push back on out-of-character asks + stop signal); assistant-agent (runs the product as a
  user's agent would); judge-agent (grades UX against the contract **and** profiles AX from
  the transcript, keeps a learnings ledger). Plus the **orchestration note** (caller owns the
  spawn — see *Fit*).
- **Cadence guidance (generalised)**: tier-1 on every material experience change; tier-2 on
  candidate experiences; operator-run, not pipeline-gated.

**Dropped (out of scope / not node-like / would break generality):**

- **The `four-risks` lens (DROPPED in the experience-thread carve-out).** simulate-users is the
  experience thread's *verification* node (does the built thing behave?), explicitly distinct
  from PM/discovery (what to build, and why). It grades against the **experience contract**
  (invariants + failure modes), **not** the four product risks. Value/viability evidence is
  **real discovery only**, owned by the strategy curator — so simulate-users drops off the
  PM maturity-ladder evidence column entirely and runs whenever there is a built experience to
  test, independent of venture maturity. The `four-risks` reference + the desirability
  (value/usability) read are removed from the contract, the body, and the output.
- **The 7 BC failure modes (F1–F7)** — Belgian-admin-specific (discovery failure,
  situation assessment, date-anchoring, mid-flow handoff, Issue-filing, probing complexity,
  spurious amendment). The node carries the *category* ("the contract names its own failure
  modes"), never these. Keeping them would inject product specifics into the factory.
- **The BC Experience-Arc beats and invariants** (Discover/Bootstrap/Onboard/Hand-off/
  Procedure/Return; taste-before-gate; eligibility-first; etc.) — example experience-contract
  content; harness-supplied.
- **All BC persona content** (NIS codes, statutory grounds, capability tiers, apostille
  paths, "Imogen" replay persona, etc.) — harness-supplied persona-library content.
- **BC launch / harness mechanics**: the `run-tier1.sh` shell runner, `cd <bundle> && claude
  --print --mcp-config …`, CLAUDE.md-autoload tells, `.mcp.json` surface, bundle variants
  (bundled / dynamic / hook-prefetch), `metadata.json`. These are BC harness plumbing, not
  the general method. The node states *what* the orchestrator must provide (spawn bundle,
  separate role sessions), not BC's *how*.
- **The BC corpus-loop wiring to the submission-contract / Issue system** — the *that* a
  surfaced gap should route back to a knowledge home is general (a proposal, à la `explore`);
  the BC Issue/drafter/submission machinery is product-specific.

**Edge only (separate node or reference, not absorbed):**

- **The experience contract** → external `references` edge (`experience-contract`,
  `external: true`, `load: on-demand`). Harness-supplied; the factory ships only the pointer.
- **The personas / persona library** → external `references` edge (`personas`,
  `external: true`, `load: on-demand`). Same.
- **(REMOVED) the four-risks lens** — previously a `references: { id: four-risks, load: import }`
  edge; dropped in the experience-thread carve-out (see *Dropped*). The `graph/_refs/four-risks.md`
  reference itself stays (other nodes — e.g. `strategy-curator` — still import it); only this
  node's edge to it is removed.
- **A real-interview / evidence-session node** is **not** this node's concern — real-user
  evidence is PM/discovery (the strategy curator's domain via real discovery), not the
  experience thread. No such node is implied here.

## Overlaps and seams

- **Invoked by the dev-sprint verify span (or its orchestrator), NOT by `strategy-curator`**
  — the experience-thread carve-out re-homes simulate-users out of the PM/Arc-A evidence path.
  It is a **shared sub-node** of the experience thread, run in the verify span; the caller (the
  verify-span orchestrator, or the operator in tier-2) holds the `invokes` edge **to** this
  node, and this node authors **no** outbound `invokes`. (Mirrors how the lens agents are
  invoked by `review` and carry no inbound invoke in their own frontmatter — the edge is
  authored on the orchestrator's side.) The previous "invoked by strategy-curator's
  gather-evidence" wiring is removed (the matching `invokes: simulate-users` edge is dropped
  from `strategy-curator` in the same reconcile); strategy-curator's evidence is `explore` +
  real discovery.
- **Composes into the dev-sprint at the verify span** (not Arc A). `composes-into` targets an
  arc and is **deferred per F7** until the dev-sprint stage nodes exist — mirroring `explore`,
  which defers all its `composes-into` edges to stages for the same reason. No `composes-into`
  authored now.
- **Sibling of `qa` and `design-review` (the verification modalities)** — simulate-users is
  the **AI-agent-behaviour** verification modality alongside `qa` (browser behaviour) and
  `design-review` (visual). It runs whenever there is a built experience to test, independent
  of venture maturity (it is verification, not discovery).
- **UX-fix vs AX-optimise loop (the two routes back to `build`).** A **UX** failure routes to
  a fix of the instructions/knowledge-graph (build). An **AX** inefficiency routes to
  **optimise**: generate instruction/knowledge-graph variants → re-simulate → keep the variant
  that cuts tokens/latency *while UX still passes*. That is the **generate→measure→select**
  shape `optimise` already uses, with simulate-users as the **evaluator**. Whether AX-optimise
  is a mode of `optimise` or its own node, and whether AX measurement folds in here vs a
  sibling measure-vs-baseline node, are decided at build (see *Open questions*) — this node
  emits the AX profile + trend point either way.
- **AX baselines/trends store** — the AX profile is measured against a stored AX **baseline**
  and emits a **trend point**, reusing the **measure-vs-baseline** pattern
  (`benchmark`/`canary`/`health`). *Where* the baseline/trend persists is a harness/loop
  concern (like the verdict's persistence) — this node produces the profile + trend point; it
  does not own the store.
- **Experience → PM feedback (via `debrief`, not an edge here).** A persona/scenario that
  **consistently fails** can reveal a **mis-targeted segment or an unmet need**, not just a
  bug — that signal loops back to the strategy curator's hypotheses/canvas **via `debrief`
  routing**, not by simulate-users writing to the canvas. This node just returns the verdict +
  profile; the routing lives downstream. (This is the experience→PM coupling; personas flow
  the other way — PM owns them, experience reads them via the `personas` external.)
- **Sibling-boundary with `explore`** — `explore` *gathers context* read-only; simulate-users
  *grades + measures a simulated run*. Both are autonomous spawn-bundle agents, but distinct
  jobs (no overlap to dedup).
- **Findings-contract reuse (open):** `review`'s lens agents emit to a shared
  `findings-schema` / `severity-scale` / `confidence-anchors`. simulate-users emits a
  *UX verdict against an experience contract* (pass/fail/n-a + holes) **plus an AX profile**, a
  different shape — so it does **not** reuse the lens finding contract by default. Flagged in
  *Open questions* in case the translator/operator wants a shared `simulation-verdict` /
  `ax-profile` reference later (would only be worth it at ≥2 consumers, per the reuse rule).

## Fit

**One node, one primitive — yes.** simulate-users owns its own branching (the two tiers are
conditional branches) and sequencing (set up → run/simulate → grade UX + profile AX →
verdict + profile), and it has a distinct, measurable job (a graded UX verdict + an AX
profile against the experience contract). It renders to exactly one `.claude` **agent** file;
the two tiers are **body branches** (D34), not separate nodes.

**The tier-2 orchestration call — resolved honestly.** The scope-hint asked me to resolve
tier-2 honestly given that **an agent generally cannot spawn further subagents**. The
evidence is decisive and converges:

- **Verified Claude behaviour** (`~/.claude/references/subagents.md`): the established
  pattern is **orchestrator → subagents**; agent **teams** have **"no nested teams"**, and
  there is no supported "subagent spawns its own subagents" path. (Operating principle:
  verify against how Claude actually works — done.)
- **The handbook's own rule**, stated three times: content destined for a **spawned agent**
  is filled into its **spawn prompt by its orchestrator**, *not* imported/spawned by the
  agent itself (02-graph-spec §References; 07-decomposition §Reference-vs-skill; 03-plugin-spec).
  Agents are leaves; **skills/orchestrators do the spawning**.
- **The BC prior art confirms it**: Tier-2 ran as **separate Claude sessions** (one per
  role), launched/orchestrated externally — never one agent fanning out three sub-agents.
- **The in-repo precedent is `review`**: a **skill** orchestrates a fleet of lens **agents**;
  each lens agent does no spawning. simulate-users : tier-2 :: lens-agent : review.

**Resolution (for the translator):** simulate-users stays a single **agent**. The node
**defines the tier-2 protocol** — the three **role contracts** (persona / assistant / judge),
the dialogue conventions, the stop signal, and the **judge's grading method** against the
experience contract — but it does **not** self-spawn the three roles. **The caller owns the
spawn**: either (a) the invoking **skill** (`strategy-curator` or a gate skill) spawns the
three role-agents and feeds each its spawn bundle, the way `review` spawns its lenses, or
(b) the **operator** runs the three sessions (as BC did). In tier-2, "running
simulate-users" therefore means *the orchestrator runs the protocol this node specifies*;
the node-as-agent can itself only fully self-contain **tier-1** (single agent, no fan-out).
This is honest about the constraint and consistent with the existing graph. The alternative
— splitting tier-2 into its own orchestrating **skill** primitive — is a real option and is
parked as an open question (it would trade D34 single-node simplicity for a cleaner
runtime-owner match). The translator/operator should make that call; this report
recommends **keep as one agent with the tier-2-protocol-defined / caller-orchestrated
framing** unless review prefers the split.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | `experience-contract` (`external: true`, `load: on-demand`) | The harness-supplied **UX intent** (session-shape invariants + failure modes the run grades against) **+ AX intent** (the intended tool-path + token/latency/step budgets the AX profile measures against, and any prior AX baseline). External (no factory file — the harness overlay binds it to the product's contract); larger/conditional, read at the step of need → `on-demand`. The factory ships only the pointer. |
| references | `personas` (`external: true`, `load: on-demand`) | The harness-supplied, **PM-owned** user-profile library the simulation draws its persona-user from (PM owns and maintains personas; experience *reads* them). External + on-demand for the same reasons. |

**`four-risks` edge REMOVED** in the experience-thread carve-out — simulate-users grades
against the experience contract, not the four product risks (see *Dropped* and *Edge only*).
The `graph/_refs/four-risks.md` reference file itself remains (other nodes import it); only
this node's edge is gone. **No `invokes`** — simulate-users invokes nothing; it is *invoked
by* the dev-sprint verify span / its orchestrator (those edges are authored on the caller's
side, when the stage nodes exist). **No `composes-into`** — deferred per F7 until the
dev-sprint verify-stage node exists, mirroring `explore`. **No `loads`, `precedes`,
`can-follow`, `overlay`, `triggers`.** After the amendment the only edges are the two
externals.

## Conformance

**`primitive:`↔`mode:` agreement:** Confirmed — `agent` ↔ `autonomous` (the required
pairing). No mismatch.

**`goals:` as outcomes:** Confirmed — all four read as outcomes across the two dimensions:
two **UX** outcomes (the product behaves as intended before real users see it; contract
invariants/failure-modes caught per run), one **AX** outcome (the product agent's traversal
cost + friction surfaced so the experience can be optimised to the same outcome for fewer
tokens/faster), and the cost discipline (cheaper-than-real-users so it actually runs). Each
has a metric and an earns-keep threshold. None reads as an activity ("run a simulation",
"grade a run", "measure tokens" were deliberately reframed into the outcomes they serve).

**Edge targets resolvable:** after the amendment the only edges are `experience-contract` and
`personas`, both **external** (`external: true`) — intentionally unresolved in the factory;
validation and the build skip external references per 02-graph-spec, so this is conformant,
not a dangling edge. The removed `four-risks` edge no longer needs resolving (the reference
file remains for other consumers, but this node no longer points at it).

## Open questions

- **Tier-2 single-node vs split (the one real structural call).** Recommended resolution:
  keep simulate-users as **one agent** that *defines* the tier-2 protocol + role contracts +
  judge grading, with the **caller** owning the three-role spawn (consistent with `review`
  and with Claude's no-nested-subagents reality). The alternative — promote tier-2 to its
  own orchestrating **skill** (so the runtime owner matches the primitive) — is viable and
  would let tier-2 earn its own goal; it trades the D34 single-node simplicity for a
  cleaner owner match. **Operator/translator should confirm** which they want before the
  node ships; the body should be written so the protocol is clearly *specified-here,
  spawned-by-caller* either way.
- **Shared verdict contract?** simulate-users emits a verdict-against-a-contract
  (pass/fail/n-a + ranked holes), distinct from the lens `findings-schema`. If a second
  simulation/grading consumer appears, a shared `simulation-verdict` reference would meet
  the ≥2-consumers reuse bar; for now keep the verdict shape inline in the body. Translator
  need not act unless a second consumer is in view.
- **AX metric set + budgets, and transcript extraction (from the design doc's Open list).**
  The exact AX metric set + budgets (tokens / latency / inference-steps / tool-path / friction)
  and **how the tool-path and friction are extracted from a transcript** are not fully settled.
  The node carries the *categories* (tokens-to-outcome, latency/steps-to-outcome, tool-path,
  ranked friction) and the optimise framing; the precise metric definitions + extraction
  recipe are a build/06-analytics concern. Translator: keep the metric *names* general, do not
  bake a fixed extraction algorithm into the factory body.
- **AX-optimise: own node vs a mode of `optimise` (design-doc Open).** AX inefficiencies route
  to optimise via generate→measure→select with simulate-users as evaluator. Whether that is a
  **mode of `optimise`** or **its own node** is undecided. Not this node's call — simulate-users
  is the *evaluator* either way; flagged so the translator does not author an AX-optimise node
  here.
- **AX measurement folds into simulate-users vs a separate measure-vs-baseline node
  (design-doc Open).** This report folds AX measurement **into** simulate-users (one run → UX
  verdict + AX profile), reusing the measure-vs-baseline pattern. A future split (a sibling node
  that measures AX against a baseline) is possible; if taken, simulate-users still emits the raw
  profile and the sibling owns baselines/trends. Recommended: keep folded-in for now.
- **Experience → PM feedback edge mechanics (design-doc Open).** *How* a "persona consistently
  fails" finding reaches the strategy curator's canvas/hypotheses — via `debrief` routing, or
  directly through the curator's `gather-evidence` — is not wired (no edge here; described in
  prose under *Overlaps and seams*). Deferred per F7 until `debrief` exists; flagged.
- **Crystallisation (D35) — out of scope, flag only.** Whether a harness crystallises its own
  scenario/persona/contract library (a harness-local manifest the node reads, like the
  crystallization-manifest case in 02-graph-spec) is a **harness** concern, not a change to
  this node's canonical shape. The node **reads a harness contract** (the `experience-contract`
  + `personas` externals) — the general, factory-clean choice. Translator: bake no
  crystallisation machinery into the factory node.
- **An experience-contract *schema* (factory reference) — flagged for the operator, not decided
  here.** Today the experience contract is **purely harness-supplied** (`external: true`, no
  factory file). The open question is whether the factory should author an **`experience-contract`
  schema** — a general reference describing the contract's *shape* (session-shape invariants +
  named failure modes + AX budgets + intended tool-path) that harnesses fill, analogous to
  `vpc-schema` / `bmc-schema`. simulate-users would then carry **two** references for the
  contract: the schema (`load: on-demand`, a factory `graph/_refs/` file) it grades *by*, and
  the harness's filled contract (`external: true`) it grades *against* — exactly how
  `strategy-curator` pairs `vpc-schema`/`bmc-schema` (factory) with its overlay-bound canvas
  home. **This is an operator decision** (it adds a factory artefact + a second reference edge
  to this node); surfaced to the driver, not actioned in this amend. (Recommendation in the
  driver report.)
- **"Experience contract" as the general term.** The node uses *experience contract* for the
  harness-supplied UX intent (invariants + failure modes) + AX intent (budgets + intended
  tool-path); BC's "Experience Arc" is the UX half. If the spec later fixes a different general
  term, the external reference id may need renaming; flagged so the vocabulary stays consistent
  with 04-harness / the directory topology when those settle.

## Amendment — 2026-06-05: re-home into verify + AX into analytics

Three open questions above are now **resolved** by built siblings; this amend wires them in
(targeted Edits, no regen).

- **Re-homed into the `verify` stage (F7 deferral cleared).** The `verify` skill now exists,
  invokes simulate-users, and composes-into `dev-sprint` at `stage: verify`. So this node now
  declares `composes-into: { id: dev-sprint, stage: verify }` and its frontmatter comment moves
  from "deferred per F7 (verify stage doesn't exist)" to "declared". It still authors **no**
  inbound `invokes` — `verify` holds the invokes edge on its side, mirroring how `review` holds
  the invokes to its lens agents. This closes the *Overlaps and seams* "composes into the
  dev-sprint at the verify span (deferred per F7)" item.

- **The experience-contract schema is now authored — adopted (resolves the open question
  above).** The factory now ships `graph/_refs/experience-contract-schema.md` (the shape:
  session-shape invariants + failure modes + AX budgets + intended tool-path + evidence state).
  simulate-users now carries the **two-reference pairing** the open question recommended: the
  factory `experience-contract-schema` (`load: on-demand`) it grades the run **by**, and the
  harness-filled `experience-contract` (`external: true`) it grades **against** — the same
  `vpc-schema`/`bmc-schema` schema-plus-overlay pattern `strategy-curator` uses. The operator
  decision is taken.

- **AX measurement now emits into the analytics pipeline (the real integration gap closed).**
  The node imports `instrumentation-preamble` (the qa/design-review verify-sibling pattern) and
  attaches the product run's **AX profile as the `ax` aggregate object on its node-exit event**,
  in the **allowlisted numeric shape** `publish-projection.ts` projects on the analytics AX axis:
  `tokens_to_outcome`, `duration_ms` / `latency_ms`, `steps` / `steps_to_outcome`, `tool_calls`,
  `backtracks` — plus any extra numeric metric the contract names (e.g. `tool_path_breadth`,
  registered in Wave 3). The publisher reads **only** allowlisted numeric keys and never spreads
  `ax` verbatim, so the ranked-friction narrative and tool-path order stay in the returned
  profile, not on the event. This is the concrete wiring of the *Overlaps and seams* "AX is the
  product-facing instance of the factory's own traversal instrumentation" claim — same exit-event
  shape, pointed at the product's run. The node also emits the **UX-conformance** verdict as a
  gate `experience-contract:<pass|fail>` in the exit event's `gates[]`.

- **Experience → PM feedback confirmed as D38 (no edge added).** The *Overlaps and seams*
  "Experience → PM feedback (via `debrief`, not an edge here)" seam is now stated in the body: a
  **consistently-failing** persona (a mis-targeted-segment / unmet-need signal, not a one-off
  bug) is returned with a proposed route and reaches the PM surface via `debrief` /
  `measure-outcomes` recording it to a **swept authored home** the `strategy-curator` reads — not
  by this node writing a curator and **not** via a typed edge. **No edge to `strategy-curator`
  was added** (D38 shared-home pattern, exactly as `debrief` holds no curator edge). The
  *Open questions* "Experience → PM feedback edge mechanics" item resolves to: no edge, shared
  home via `debrief`.

`agent` / `autonomous` / `generative` unchanged. Edges after this amend: `composes-into`
dev-sprint(verify); `references` experience-contract(external) / experience-contract-schema /
personas(external) / instrumentation-preamble(import). status v0.1.0 → v0.2.0.
