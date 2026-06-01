---
title: Research report for simulate-users
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-01
amended: []
sources_lifted: 5
researcher_adequacy_note: |
  Lifted the five Be Civic prior-art sources named in the scope-hint: the two-tier
  testing method and the Experience Arc (the method + an example experience-contract),
  the Tier-1 self-simulator and Tier-2 customer-agent runbooks (the role contracts), and
  the persona library (an example personas surface). Edges were determined from the
  pm-graph-map row and confirmed against the model: only `references` edges
  (four-risks = import; experience-contract + personas = external, on-demand) — no
  invokes/composes-into, deferred per F7 exactly as `explore` defers them, because
  simulate-users is a shared sub-node invoked BY strategy-curator and the gates, not an
  orchestrator itself. Confidence in `agent` / `autonomous` / `generative` is high (it
  matches the pm-graph-map decision, the four-risks evidence-source role, and the
  `explore` mirror). The one genuine structural call — tier-2 orchestration — I resolved
  HONESTLY against Claude's verified no-nested-subagents constraint: tier-2's three-role
  harness cannot be self-spawned by an agent, so the node defines the protocol + role
  contracts + the judge's grading method and the CALLER (skill/operator) owns the
  spawn, mirroring how `review` orchestrates its lens agents. Goals framed cleanly as
  outcomes. Recommendation: proceed to translator, carrying the tier-2 orchestration
  resolution and the one open question on whether tier-2 should be split into its own
  primitive (see Open questions).
---

# Research report for simulate-users

## Identity

**Candidate id:** simulate-users
**Candidate title:** Simulate users

**Scope:** A general, product-agnostic autonomous agent that runs **user simulation**
against a harness-supplied **experience contract** (session-shape invariants + failure
modes) and **persona library**, producing **graded findings** that de-risk the **value**
and **usability** product risks. It is the **discovery-stage evidence source** — a
stand-in for real users when the product is pre-launch and real-user signal is not yet
available or worth its cost. It runs in two modes (body branches, per D34): **`tier-1`** —
one agent plays both the persona-user and the product/assistant and grades the run inline,
marking gaps and failure modes (cheap, gap-finder); **`tier-2`** — a multi-role harness
(persona-agent + assistant-agent running the product + judge-agent grading against the
contract's invariants and failure modes), more realistic, reserved for candidate
experiences. The node owns the **simulation method, the role contracts, the assertion
model against the experience contract, and the verdict shape**.

It **excludes**: real-user interviews / evidence sessions (a separate validation-stage
node, deferred per F7); analytics-driven discovery and live experiments (scale stage); the
*content* of the experience contract, the failure modes, and the personas (all
harness-supplied via external references — the node carries the method, never the product's
session shape or its users); and any orchestration the node cannot itself perform (see
*Fit* — tier-2 spawn is owned by the caller).

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Value and usability risks are surfaced **before** the product is exposed to real users — a cheaper stand-in catches what real users would have hit. | Fraction of value/usability defects later confirmed (by real-user signal or a downstream stage) that a prior simulation run had already flagged; per-run count of distinct value/usability gaps surfaced. | The "already-flagged" fraction stays high enough that simulation is trusted as the discovery-stage gate; a run that routinely surfaces nothing real is a cut/tune signal for that mode. |
| Experience-contract invariant violations and known failure modes are caught per run, against the contract — not by eyeballing. | Per-run count of contract-invariant violations + failure-mode hits, each with one-line evidence; share that survive operator triage as real (vs. false positives). | The surviving (true-positive) violation rate stays non-trivial AND the false-positive rate stays low enough that the verdict is actioned rather than dismissed. |
| The evidence is cheaper than real-user testing at the discovery stage, so it actually gets run on every material experience change. | Cost per run (wall-clock + operator attention) and run frequency vs. the real-user-testing alternative it stands in for; tier-1 vs tier-2 cost split. | Tier-1 stays cheap enough to run on every material experience change; tier-2 stays cheap enough to run on candidate experiences. If simulation is routinely skipped for cost, the mode is restructured. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** This is a unit of work best run in an **isolated context that returns a
summary** (the graded findings / verdict), not a collaborative main-thread workflow. It is
fully describable in a spawn prompt (the experience contract, the personas/scenario, the
mode selector), it does not benefit from the live main thread, and it is parallelizable
(many persona × scenario runs). That is the textbook agent profile per `07-decomposition`
("a unit of work best run isolated, returning only a summary; parallelizable; fully
describable in a prompt"). It matches the pm-graph-map decision (`simulate-users` = agent)
and the `explore` mirror (an autonomous, spawn-bundle-driven evidence agent that returns a
distilled result and never converses with the operator). The `agent` / `autonomous`
agreement is satisfied (skill↔collaborative, agent↔autonomous). **The one wrinkle is
tier-2 orchestration** — see *Fit*; it does not change the primitive (the node is still an
agent; the multi-role spawn is owned by the caller, exactly as `review` — a skill — owns
the spawn of its lens **agents**).

**`determinism:`** `generative`

**Rationale:** The work is **judgment**, not a fixed input→output transform: roleplaying a
believable persona-user, honestly applying the product's instructions, and **grading** a
run against the experience contract's invariants and failure modes are all generative.
There is no deterministic algorithm that produces the verdict. (Contrast a script with
fixed inputs/outputs, which would be deterministic.) Matches the `explore` and `lens-*`
agents, which are likewise `generative`.

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
- **The four-risks lens** — imported (`load: import`), so the run always frames findings as
  value / usability evidence and names the weakest risk.
- (Tier-2 only, supplied by the caller, not the agent) the role wiring — which session is
  persona / assistant / judge.

**Output:**

- **Graded findings** against the experience contract: per-invariant / per-failure-mode
  **pass / fail / n-a** with **one-line evidence**.
- A **ranked list of holes** that separates **product-content gaps** (the product can't
  serve this) from **experience/harness gaps** (the product could, but the experience
  breaks down) — generalised from BC's "corpus-content gaps vs experience/harness gaps".
- A **value/usability risk read** — which of the two desirability risks the run exercised,
  the current evidence and its strength, and whether each is *cleared / open / a stop*
  (the four-risks output shape).
- A **structured verdict** + the **transcript** (tier-1: one document alternating
  persona/product turns with inline `[GAP: …]` markers; tier-2: the dialogue + the judge's
  graded verdict). Verdicts are designed to **persist as comparable session artefacts** so
  runs are comparable over time (the *where* they persist is a harness concern).
- (Tier-2) the judge accumulates a **learnings ledger** across runs — generalised from BC's
  Tier-2 judge ledger; the ledger's home is harness-supplied.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/bc-06-experience-02-testing.md` | keep | The two-tier method, the assertion-model (grade against the contract invariants + failure modes), the structured-verdict shape, the corpus/learnings loop, cadence. **Generalise**: lift the two tiers, the assertion model, the verdict shape, the gap-categories. The **7 failure modes (F1–F7) are BC-specific → drop** from the node; they are the harness experience-contract's content (the node carries only the *category*). |
| `source-material/bc-06-experience-01-arc.md` | edge-only | An **example experience-contract** (session beats + invariants-as-test-assertions). The *contract itself* is harness-supplied → modelled as the external `experience-contract` reference, NOT absorbed. Keep only the abstract shape ("a contract = session-shape invariants + failure modes the run grades against"); drop all BC beats/invariants. |
| `source-material/bc-tier1-self-simulator-runbook.md` | keep | The tier-1 body branch: one agent alternates **persona / product** turns, **honestly applies** the product instructions (does not fill gaps with plausible behaviour), marks gaps inline `[GAP: …]`, terminates on scenario-complete / N-gaps / turn-cap, emits transcript + ranked gaps. **Drop** BC bundle / CLAUDE.md-autoload / MCP-launch mechanics (harness-specific) and the shell-runner. Also evidence for orchestration (subprocess-launched = operator-orchestrated). |
| `source-material/bc-tier2-customer-agent-runbook.md` | keep | The tier-2 **persona-agent role contract**: embody the persona, run the scenario, stay in character, push back on out-of-character asks, emit `[END_OF_CONVERSATION]`. **Decisive for orchestration**: the header states the harness side runs in a **separate session** and this prompt drives the customer side — the three roles are **separate sessions orchestrated externally**, confirming tier-2 cannot be agent-self-spawned. Keep the role contract; drop BC scenario-path specifics. |
| `source-material/bc-personas-profiles.md` | edge-only | An **example persona library** (10 profiles + a coverage matrix). The library is harness-supplied → modelled as the external `personas` reference, NOT absorbed. Keep only the abstract shape (a profile carries enough to drive a believable user + a coverage matrix); drop all BC persona content. |

(Two in-repo authoring references are read directly by the translator and are **not** lifted
into source-material because they are not BC prior art to absorb: `graph/_refs/four-risks.md`
— the lens this node imports — and `graph/explore/explore.md` — the shape/voice/edge mirror.)

## Keep / Drop

**Kept (absorbed into the node body):**

- **The two tiers as two body branches** (D34): `tier-1` single-agent dual-role walkthrough
  (cheap, gap-finder, run often) and `tier-2` multi-role harness (realistic, candidate
  experiences). Including the honest framing that tier-1 *flatters routing-correctness*
  (one agent both reads the product and decides), so a tier-1 pass means "the product
  *enables* a good answer", not "any agent gets there" — generalised from the BC note.
- **The assertion model**: grade a run against the experience contract's invariants + the
  failure modes; emit per-assertion **pass / fail / n-a + one-line evidence**.
- **The verdict + ranked-holes shape**, splitting **product-content gaps** from
  **experience/harness gaps**; verdicts as comparable artefacts.
- **Tier-1 runbook mechanics (generalised)**: alternate persona/product turns; **honesty
  rule** (be honest about what the product instructions actually say; do not invent
  behaviour to paper a gap); inline `[GAP: …]` marking; termination conditions
  (scenario-complete / gap-cap / turn-cap); transcript + gaps-summary output.
- **Tier-2 role contracts (generalised)**: persona-agent (embody + stay in character +
  push back on out-of-character asks + stop signal); assistant-agent (runs the product as a
  user's agent would); judge-agent (grades the arc against the contract, keeps a learnings
  ledger). Plus the **orchestration note** (caller owns the spawn — see *Fit*).
- **The four-risks framing**: every run names which desirability risk(s) it exercised and
  reports evidence-strength + cleared/open/stop (imported lens).
- **Cadence guidance (generalised)**: tier-1 on every material experience change; tier-2 on
  candidate experiences; operator-run, not pipeline-gated.

**Dropped (out of scope / not node-like / would break generality):**

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
- **The four-risks lens** → `references` edge (`four-risks`, `load: import`) to the existing
  `graph/_refs/four-risks.md`.
- **A real-interview / evidence-session node** (validation stage) — node-like but a
  *separate* node, explicitly deferred per F7. No edge authored now.

## Overlaps and seams

- **Invoked by `strategy-curator` (Arc A) and by the gates** — simulate-users is a **shared
  sub-node**, the discovery-stage evidence source, not an arc on its own. Those callers hold
  the `invokes` edge **to** this node; this node authors **no** outbound `invokes`. (Mirrors
  how the lens agents are invoked by `review` and carry no inbound invoke in their own
  frontmatter — the edge is authored on the orchestrator's side.) These inbound edges are
  authored when `strategy-curator` and the gate nodes are written; not this node's job.
- **Composes into Arc A via `strategy-curator`** (per pm-graph-map). `composes-into` targets
  an arc and is **deferred per F7** until the arc/stage nodes exist — mirroring `explore`,
  which defers all its `composes-into` edges to stages for the same reason. No
  `composes-into` authored now.
- **Hands off to `debrief` / the four-risks read** — the graded findings feed the gate's
  go/no-go and (via the caller) the strategy hypotheses (confirm / kill). That seam lives on
  the caller's side; this node just returns the verdict.
- **Sibling-boundary with `explore`** — `explore` *gathers context* read-only; simulate-users
  *generates evidence by simulating a user*. Both are autonomous evidence agents with a
  spawn bundle, but distinct jobs (no overlap to dedup).
- **Findings-contract reuse (open):** `review`'s lens agents emit to a shared
  `findings-schema` / `severity-scale` / `confidence-anchors`. simulate-users emits a
  *verdict against an experience contract* (pass/fail/n-a + holes), a different shape — so it
  does **not** reuse the lens finding contract by default. Flagged in *Open questions* in
  case the translator/operator wants a shared `simulation-verdict` reference later (would
  only be worth it at ≥2 consumers, per the reuse rule).

## Fit

**One node, one primitive — yes.** simulate-users owns its own branching (the two tiers are
conditional branches) and sequencing (set up → run/simulate → grade → verdict), and it has a
distinct, measurable job (graded value/usability evidence). It renders to exactly one
`.claude` **agent** file; the two tiers are **body branches** (D34), not separate nodes.

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
| references | `four-risks` (`load: import`) | The discovery lens this node applies — every run frames findings as value/usability evidence and names the weakest risk. Short, must-always-be-present → `import` (native `@-import`), matching how `review` imports its short contracts. Resolves to the existing `graph/_refs/four-risks.md`. |
| references | `experience-contract` (`external: true`, `load: on-demand`) | The harness-supplied session-shape invariants + failure modes the run grades against. External (no factory file — the harness overlay binds it to the product's contract); larger/conditional, read at the step of need → `on-demand`. The factory ships only the pointer. |
| references | `personas` (`external: true`, `load: on-demand`) | The harness-supplied user-profile library the simulation draws its persona-user from. External + on-demand for the same reasons. |

**No `invokes`** — simulate-users invokes nothing; it is *invoked by* `strategy-curator` and
the gates (those edges are authored on the caller's side). **No `composes-into`** — deferred
per F7 until the Arc-A / dev-sprint stage nodes exist, mirroring `explore`. **No `loads`,
`precedes`, `can-follow`, `overlay`, `triggers`.**

## Conformance

**`primitive:`↔`mode:` agreement:** Confirmed — `agent` ↔ `autonomous` (the required
pairing). No mismatch.

**`goals:` as outcomes:** Confirmed — all three read as outcomes (risks surfaced before
real-user exposure; contract-violations/failure-modes caught per run; cheaper-than-real-user
so it actually runs), each with a metric and an earns-keep threshold. None reads as an
activity ("run a simulation", "grade a run" were deliberately reframed into the outcomes
they serve).

**Edge targets resolvable:** `four-risks` resolves to the existing `graph/_refs/four-risks.md`
(confirmed present). `experience-contract` and `personas` are **external** (`external: true`)
— intentionally unresolved in the factory; validation and the build skip external references
per 02-graph-spec, so this is conformant, not a dangling edge.

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
- **Crystallisation (D35) — out of scope for this report, flag only.** pm-graph-map's open
  list asks whether simulate-users *crystallises* product-specific scenarios or just reads a
  harness contract. This report models it as **reads a harness contract** (the
  `experience-contract` + `personas` externals) — the general, factory-clean choice.
  Whether a harness later crystallises its own scenario library (a harness-local manifest the
  node reads, like the crystallization-manifest case in 02-graph-spec) is a **harness**
  concern, not a change to this node's canonical shape. Noted so the translator does not bake
  any crystallisation machinery into the factory node.
- **"Experience contract" as the general term.** The node uses *experience contract* for the
  harness-supplied session-shape invariants + failure modes (BC's "Experience Arc" is one
  instance). If the spec later fixes a different general term for this surface, the external
  reference id may need renaming; flagged so the vocabulary stays consistent with
  04-harness / the directory topology when those settle.
