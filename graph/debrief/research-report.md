---
title: Research report for debrief
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-04
amended:
  - date: 2026-06-03
    note: External analogue backfill — gstack /retro, be-civic sprint-close docs, CE ce-sessions lifted; challenge findings section added; all template sections populated; frontmatter extended with external_analogue_found, external_corpora_searched, sources_lifted, researcher_adequacy_note.
  - date: 2026-06-04
    note: >-
      Tier-1 amend batch 2 — closed CF-1 (verdict-evidence schema authored into the work-item file per artefacts-design §2/§5), CF-2 (ratify sub-step in learn for in-sprint design divergences), CF-3 (prior verdict in the capture-learnings spawn bundle + explicit trend-delta surfacing, wiring measure-outcomes' existing baseline/trend mechanism), CF-4 (target_sprint + priority(+rationale) added to the proposals contract; owner unchanged per D40), CF-5 (capability-gated recall-query preflight before capture-learnings, falling back if gbrain absent per D31), and the measure-outcomes CF-1 residual that lands on debrief (debrief persists its metrics report to a stable baseline path the next sprint's measure-outcomes reads). Resolutions recorded in the "Amendment resolutions (2026-06-04)" section; Open questions updated. Verdicts + actions from docs/research-backfill-reconciliation.md cluster-B debrief rows + cluster-C measure-outcomes CF-1.
sources_lifted: 4
external_analogue_found: true
external_corpora_searched:
  - "gstack live skills (~/.claude/skills/gstack/): retro, learn, landing-report, ship, land-and-deploy"
  - "CE plugin (ce-plugin/plugins/compound-engineering/skills/): ce-sessions, ce-release-notes, ce-work, ce-product-pulse"
  - "be-civic harness (bc-operations/docs/, bc-operations/playbooks/): sprint-close docs W31+W33, sprint-cycle playbook"
  - "Published best practice: DORA metrics guide (dora.dev), Asana sprint retrospective guide, agile retrospective research (PMI, Scrum Institute)"
researcher_adequacy_note: |
  Four corpora were searched with specific queries: gstack skills tree for retro/learn/landing-report
  (the post-ship, learning-capture, and metrics-reading jobs); CE plugin for ce-sessions and ce-work
  (session-history recall and sprint orchestration); be-civic harness for real sprint-close artefacts
  (W31, W33) and the sprint-cycle playbook (the operator-facing close procedure); and published
  best-practice sources (dora.dev and Asana's retrospective guide) for domain methodology grounding.
  Four files were lifted verbatim: gstack/retro/SKILL.md (primary analogue — the real-world measure +
  learn job running post-ship), be-civic W33 sprint close doc (real operator close artefact),
  be-civic sprint-cycle playbook (structural sprint-close procedure), and CE ce-sessions
  (retrospective recall / session-history retrieval). Edges were determined from the node body's
  explicit invokes declarations and the process seam prose; composes-into was confirmed from the
  backbone design. The primitive/mode decision (skill, collaborative, generative) is high-confidence —
  the node is operator-facing and pauses for confirmation at seed-next, which rules out autonomous.
  Goals were framed as outcomes without difficulty; the earns-keep conditions in the canonical node
  were already outcome-shaped. Challenge findings are anchored in specific gaps between what debrief
  specifies and what the analogues do in practice; the node is weakest on: structured output format,
  operator-confirmed action items, production verification, and retrospective recall. Proceed to
  translator; the challenge findings should inform the next node amendment pass.
---

# Research report for debrief

## Identity

**Candidate id:** `debrief`
**Candidate title:** Debrief
**Scope:** The loop-close backbone stage of the dev-sprint. A collaborative `skill` that
runs after the live-confirmed gate advances the carrier to `live`. Debrief orchestrates
three fleet agents (`measure-outcomes`, `capture-learnings`, `log-decision`) to read
outcomes back against the work-item's `outcome_link`, capture durable learnings, and
seed the next sprint. It holds no carrier write-edge and does not advance
`lifecycle_state`. The loop closes through shared authored homes (D38), not through a
direct edge to any curator. Debrief does NOT include the production-verification step
(that is land's responsibility) and does NOT invoke curators — those are out of scope.

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Outcomes are actually read back against what was promised — the work-item's `outcome_link` is resolved to a verdict, not left open. | Share of sprint work-items that exit debrief with an explicit outcome verdict (confirmed / partial / missed) and a linked evidence entry; items that close without a verdict (target 0). | Unvarnished outcome verdicts trend toward 100 %; if items routinely close without one, the measure mode is not earning its keep. |
| Durable learnings are captured and routed to their knowledge homes, not accumulated silently in the operator's head. | Proposals list produced per sprint; share of proposed learnings enacted within three sprints (rolling); re-derivation rate (a finding the next sprint re-surfaces that a prior proposals list already named). | Re-derivation rate trends toward zero; if learnings are never enacted, the proposals surface but do not close, and the cycle earns nothing. |
| Decisions made during the sprint are logged with full reasoning before the loop closes, so the next sprint can build on them rather than re-derive. | Decisions logged per debrief run vs decisions the operator recalls making; post-debrief "why did we..." questions that could have been answered by the log. | Unanswered "why did we..." questions trend toward zero over rolling sprints. |
| The next sprint candidate is seeded with a clear starting point — a grounded `outcome_link`, a carrying work-item, or a named open risk — so `align-context` opens with intent, not a blank slate. | Share of seed-next runs that produce an actionable next-sprint candidate the operator confirms; `align-context` sessions that open with no prior seed (target near 0 for active products). | If seed-next never produces a candidate the operator acts on, the mode is not earning its cost. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** Debrief is the operator-facing orchestrator and dispatcher of the close.
It surfaces outcome verdicts and learning proposals to the operator, pauses for
confirmation of the seed candidate, and invokes `log-decision` at judgment points. The
operator reads the verdict and decides which learnings to enact. This is the defining
characteristic of a collaborative skill (current context, with the operator). The
autonomous deterministic work is in `measure-outcomes`; the generative curation is in
`capture-learnings`; this node is the dispatcher and the human-in-the-loop surface.

**`determinism:`** `generative`

**Rationale:** The outcome verdict, the proposals list, and the seed candidate are all
synthesised judgments — they require reading context (the carrier, the instrumentation
record, the decisions log) and producing structured but non-deterministic outputs.
The fleet agent `measure-outcomes` is deterministic on its inputs; debrief itself
(the orchestrator) is generative.

## Contract

**Input:** The carrier (work item) at `lifecycle_state: live`; the work-item record
(source document); the `outcome_link` (what outcome the sprint was supposed to move);
the `sprint_id`; the instrumentation record (traversal timeline from
`instrumentation-preamble`); prior sprint debrief artefacts if accessible (for trend
comparison); the decisions log path.

**Output:**
- `measure` mode: structured metrics report + outcome verdict (confirmed / partial /
  missed) written to the work-item record as evidence; surfaced to operator.
- `learn` mode: proposals list (each learning classified by knowledge home with
  priority and evidence); recall writes inline to gbrain for enacted proposals; canon
  and node-amend proposals parked for the curator raise flow.
- `seed-next` mode: next-sprint candidate(s) surfaced to operator — a proposed
  `outcome_link`, one-sentence description, and evidence from this sprint.
- All modes: projection advances `current_stage`; no carrier field written by this node.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills (`~/.claude/skills/gstack/`) | `/retro` — post-ship metrics reading, learning capture, seeding next period; `/learn` — learnings management and recall; `/landing-report` — post-ship state snapshot | yes — `/retro` is a direct analogue | `gstack-retro-SKILL.md` |
| CE plugin (`ce-plugin/plugins/compound-engineering/skills/`) | `ce-sessions` — session-history retrospective and recall; `ce-release-notes` — sprint/release close; `ce-work` — sprint execution + close | yes — `ce-sessions` covers retrospective recall; `ce-work` covers sprint close mechanics | `ce-sessions-SKILL.md` |
| be-civic harness (`bc-operations/docs/`, `bc-operations/playbooks/`) | Sprint-close documents (W31, W33) and sprint-cycle playbook — real operator retrospective artefacts, close procedure, rollup, and what-comes-next handoff | yes — W33 sprint-close and sprint-cycle playbook are real operator analogues | `be-civic-W33-sprint-close.md`, `be-civic-sprint-cycle-playbook.md` |
| Published best practice (dora.dev, Asana, PMI, Scrum Institute) | DORA metrics feedback loop; sprint retrospective structure and action-item tracking; outcome measurement after delivery | yes — DORA measurement-improvement cycle and Asana retrospective structure are domain best practice; no single file lifted (web sources, not local files) | — (web; cited in Challenge findings) |

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/gstack-retro-SKILL.md` | keep | Primary analogue. The measure + learn job post-ship. Defines: git-based outcome metrics (commits, velocity, test ratio, fix ratio), learning capture (gstack-learnings-log), session pattern analysis, trend comparison vs prior retros, team praise/growth suggestions, saving a JSON snapshot, and seeding next period. The most complete real-world counterpart to debrief's three modes. |
| `source-material/be-civic-W33-sprint-close.md` | keep | Real operator sprint-close artefact. Shows: explicit outcome verdict (§1), items-shipped table (§2), judgment calls surfaced for operator ratification (§3), handbook-drift logged for curator (§7), operator action checklist (§8), sprint-close checklist with pass/fail against plan (§9). The strongest evidence of what a real debrief output looks like in a consuming harness. |
| `source-material/be-civic-sprint-cycle-playbook.md` | keep | Structural procedure for the close. §4 specifies: open rollup PR, verify required checks, merge, verify production, capture retro (3–7 bullets in sprint file), archive in backlog §5, reset §1 pointer. Closest analogue to debrief's process seams (precedes and can-follow edges). |
| `source-material/ce-sessions-SKILL.md` | edge-only | CE ce-sessions is a retrospective recall / session-history retrieval skill — it reads prior session history and synthesises findings. This is a different cut of the same domain (retrieval vs capture) and maps to a gap in debrief: debrief writes to knowledge homes but has no mode for querying them. The retrieval job belongs in a sibling node (`query-learnings` or `recall-context`), not in debrief itself. Useful as an edge finding. |

## Keep / Drop

**Kept (absorbed into body):**
- From `gstack-retro-SKILL.md`: the trend-comparison pattern (compare metrics against prior retro run, show deltas); the structured proposals list with classification by home; the practice of saving a persistent JSON snapshot after each run; the team-praise / growth-suggestion format for surfacing findings to the operator.
- From `be-civic-W33-sprint-close.md`: the explicit outcome verdict schema (pass / pass-with-follow-ups / deferred); the judgment-call surfacing with operator ratification request; the sprint-close checklist with pass/fail against plan items; the operator action checklist format.
- From `be-civic-sprint-cycle-playbook.md`: the archive + pointer-reset handoff that seed-next must feed into; the "3–7 bullets is enough" brevity norm for the retrospective artefact; the production-verify step sequence (though that is land's job, not debrief's).
- From published best practice: the DORA measurement → validate → iterate cycle as the methodology debrief operationalises; the action-item-with-owner pattern from the Asana retrospective guide.

**Dropped (out of scope):**
- From `gstack-retro-SKILL.md`: git log analysis, per-author commit metrics, session detection, hotspot analysis, PR size distribution, tweetable summary — these are engineering analytics, not sprint outcome measurement. Debrief measures outcome against `outcome_link`, not code velocity.
- From `be-civic-sprint-cycle-playbook.md`: §2 (sprint open), §3 (mid-sprint feature work), §5 (hotfix path), §6 (force-push policy) — out of debrief's scope.
- From `ce-sessions-SKILL.md`: session discovery pipeline, extract-metadata scripts, skeleton extractor — these are retrieval infrastructure, not debrief work.

**Edge only (separate node):**
- `ce-sessions` → `query-learnings` or `recall-context`: querying prior session history and knowledge homes belongs in a sibling node that debrief could invoke or that `align-context` invokes on the next sprint open. Debrief writes; the retrieval node reads. Not built yet.

## Overlaps and seams

- **`land precedes debrief`**: debrief runs after `land`'s live-confirmed gate. `land` holds the `precedes debrief` edge; debrief holds no `can-follow land` in its frontmatter (removed in the normalization pass to avoid duplicate reverse edges). The seam is the carrier's `lifecycle_state: live` gate in debrief's preflight.
- **`align-context can-follow debrief`**: seed-next hands off to the next sprint's `align-context`. Wired on `align-context`'s side as `can-follow: debrief`. The be-civic playbook's §4 "reset §1 pointer" and "next sprint TBD" pattern is the operator-side expression of this seam.
- **`product-dashboard-curator` (no edge)**: reads the work-item record that debrief writes outcome evidence to. Loop closes through shared homes (D38). No direct edge. The W33 sprint-close doc's §7 (handbook drift) shows the curator receiving content from the debrief-written decisions log on its next sweep — confirming the shared-homes pattern works in practice.
- **`measure-outcomes` (invokes)**: the measurement agent. Debrief spawns it with the outcome_link and sprint context; it returns a verdict and metrics report. Confirmed built at `graph/measure-outcomes/`.
- **`capture-learnings` (invokes)**: the learning-curation agent. Spawned with sprint summary, decisions log, metrics report. Returns proposals list. Confirmed at `graph/capture-learnings/`.
- **`log-decision` (invokes)**: invoked at judgment points during learn (operator's verdict on which proposals to enact). Confirmed at `graph/log-decision/`.

## Fit

Debrief belongs as a single node. It owns its own branching and sequencing (three modes, run in sequence or independently), holds a distinct goal (close the sprint loop: verdict + learnings + seed), and the goal is measurable separately from its fleet. The fleet agents (`measure-outcomes`, `capture-learnings`, `log-decision`) are leaves — they do not belong inside debrief's body. No split proposed.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| invokes | `measure-outcomes` | Spawns the measurement agent with the outcome_link and sprint context; receives verdict and metrics report. |
| invokes | `capture-learnings` | Spawns the learning-curation agent with sprint summary, decisions, and metrics; receives proposals list. |
| invokes | `log-decision` | Invoked at judgment points (operator's verdict on which proposals to enact). |
| composes-into | `dev-sprint` (stage: debrief) | Formal stage in the dev-sprint arc. |
| references | `instrumentation-preamble` (`load: import`) | Imports the traversal timeline reference used to pass the instrumentation record to `measure-outcomes`. |
| can-follow | (prose only) `land` | Debrief follows land after the live-confirmed gate; wired as `precedes debrief` on land's side. Promoted to formal frontmatter entry at the F7 wiring pass. |

## Conformance

**`primitive:` ↔ `mode:` agreement:** Confirmed. `skill` + `collaborative` is the correct pairing for an operator-facing dispatcher that pauses for confirmation and surfaces findings. No mismatch.

**`goals:` as outcomes:** Confirmed. All four goals are stated as outcomes (what the node achieves) with measurable metrics and earns-keep thresholds. None describe activities.

**Edge targets resolvable:** `measure-outcomes`, `capture-learnings`, `log-decision` — all confirmed at `graph/<id>/` in the record. `dev-sprint` confirmed as the arc. `instrumentation-preamble` confirmed as a reference. `land` (prose only) — pending F7 wiring pass.

## Challenge findings

These findings compare the node against its real-world analogues. They are specific gaps where debrief is weaker than how the job is done in practice. They do not modify the canonical node; they are input for the next amendment pass.

### CF-1 (high) — No structured output format for the verdict artefact

**Gap:** The node specifies that `measure` mode writes "the verdict and key metric deltas to the work-item record" but does not define the format of that artefact.

**Analogue evidence:** The be-civic W33 sprint-close doc (`source-material/be-civic-W33-sprint-close.md` §1–§2) produces a structured close document with: an explicit outcome verdict line ("PASS-WITH-FOLLOW-UPS"), a table of items shipped with PR links, a sprint-close checklist with `[x]`/`[ ]`/`[~]` status, and a metrics table. The gstack `/retro` skill (`source-material/gstack-retro-SKILL.md` Steps 2, 13) saves a JSON snapshot with a fixed schema (metrics, authors, version range, streaks, tweetable).

**Recommendation:** The node should specify a minimum output schema for the verdict artefact: at minimum, `verdict` (confirmed / partial / missed), `outcome_link` (the target resolved), `evidence` (1–3 sentences), and `metric_deltas` (key earns-keep numbers from `measure-outcomes`). The be-civic close doc's §9 checklist pattern (items with pass/fail per plan item) is worth adopting as a required output element.

### CF-2 (high) — Operator ratification for judgment calls is not specified

**Gap:** The `learn` mode specifies presenting proposals to the operator and confirms/logs their verdict. But the node has no mode or step for surfacing **judgment calls made during the sprint** that need operator ratification — only decisions that surfaced *during learn itself*.

**Analogue evidence:** The W33 sprint-close doc §3 ("Judgment calls — operator ratification requested") is a dedicated section: five numbered calls, each with the decision made and what diverges from the canonical design, asking the operator to ratify. This is distinct from logging a decision — it's surfacing an in-sprint design divergence for explicit approval. The be-civic playbook §4 step 5 (capture retro) includes this as a bullet category: "what surprised."

**Recommendation:** Add a sub-step to `learn` mode (or a `ratify` micro-mode) that surfaces judgment calls made during implementation which were not logged at decision time — items that diverged from the spec or canon and need operator sign-off. The W33 §3 format (numbered calls with divergence flagged) is a concrete model.

### CF-3 (medium) — Trend comparison against prior debrief runs is not specified

**Gap:** `measure` mode computes metrics against the `outcome_link` but does not specify comparing against prior debrief runs to show trend direction.

**Analogue evidence:** The gstack `/retro` skill (Steps 12–13) explicitly loads the most recent prior retro JSON snapshot and computes deltas for key metrics: test ratio, LOC/hour, fix ratio, sessions, commits. It shows a before/after table ("Last → Now → Delta"). This trend signal is what makes the measurement actionable rather than just a point-in-time number.

**Recommendation:** `measure-outcomes` should receive the prior debrief verdict (if available) alongside the current sprint's data, and its output should include a `trend_delta` field. Debrief's `measure` mode should surface this delta to the operator explicitly — not just the current verdict but the direction.

### CF-4 (medium) — The proposals list has no priority ordering or enactment deadline

**Gap:** The `learn` mode produces a proposals list classified by knowledge home (recall / canon / node-amend) with priority. But the node does not specify how priority is assigned or whether proposals carry a target-sprint or deadline for enactment.

**Analogue evidence:** The gstack `/retro` skill assigns specific next-week habits ("3 Habits for Next Week — small, practical, realistic, each must be something that takes <5 minutes to adopt"). The be-civic W33 sprint-close doc §8 is an operator action checklist with `[ ]` items — each has an implied owner and is trackable. The Asana retrospective guide best practice is "assign ownership to each action item" with deadlines to prevent improvements from getting lost between sprints.

**Recommendation:** The proposals list should include: a `target_sprint` field (which sprint should act on this), an `owner` field (recall → operator inline, canon → handbook-curator, node-amend → operator at node-amend session), and a `priority` value (high / medium / low with an explicit rationale). Without these, the proposals surface but do not close — directly violating the earns-keep condition for the learn goal.

### CF-5 (medium) — No recall query before learn mode — re-derivation risk

**Gap:** The `learn` mode captures and routes learnings forward but has no step that queries what was previously captured before generating the proposals list. This means `capture-learnings` may reproduce findings already in gbrain recall.

**Analogue evidence:** The gstack `/retro` skill runs `gstack-learnings-search --limit 10` during its "Prior Learnings" step (before generating new findings) and surfaces "Prior learning applied: [key]" tags when a finding matches a past learning. The CE `ce-sessions` skill (`source-material/ce-sessions-SKILL.md`) is built entirely around the retrieval problem — it exists precisely because not querying prior sessions causes re-derivation. The node's own earns-keep for the learn goal is "re-derivation rate trends toward zero."

**Recommendation:** Add a preflight sub-step to `learn` mode: before spawning `capture-learnings`, query the relevant knowledge homes (gbrain recall for the product, the decisions log) for existing learnings on the sprint's topic. Pass the query results to `capture-learnings` in its spawn bundle so it can distinguish new findings from known ones. This is the mechanism that makes the re-derivation rate metric achievable — without it, the earns-keep condition cannot be met.

### CF-6 (low) — The seed-next output has no canonical home or format

**Gap:** `seed-next` surfaces the next-sprint candidate to the operator but specifies no written artefact or canonical home for that seed. "Surfaced to operator; no write" is the output table entry.

**Analogue evidence:** The be-civic sprint-cycle playbook §4 (step 6–7) writes the seed into the backlog explicitly: a line in the sprint-history section + the §1 pointer reset with "Next sprint TBD." The W33 sprint-close doc §9 names the next sprint (`W35`) and the items carried forward. Without a written seed, the next `align-context` session has no durable artefact to open with — the seed lives only in conversation context.

**Recommendation:** `seed-next` should write the confirmed seed to a named location — at minimum, a `sprint-seed.md` or `backlog-entry.md` in the work-item's source path (or a harness-specific seed location the bindings contract maps). The seed candidate is not just surfaced; it is recorded. This makes the earns-keep condition ("`align-context` sessions that open with no prior seed" trending to zero) actually checkable — the projection can verify the file exists before the next sprint opens.

### CF-7 (low) — The learn mode specifies inline recall writes but not their gbrain call shape

**Gap:** The node states "write to gbrain via `mcp__gbrain__store` inline" for recall proposals but does not specify the schema or what fields to include.

**Analogue evidence:** The gstack `/retro` skill specifies the exact JSON schema for `gstack-learnings-log`: `{skill, type, key, insight, confidence, source, files}`. Type options: pattern / pitfall / preference / architecture / tool / operational. Source options: observed / user-stated / inferred / cross-model. Confidence: 1–10. This schema is what enables the deduplication, staleness detection, and cross-project search that `/learn` uses.

**Recommendation:** The learn mode's recall-write step should reference a canonical recall-entry schema (probably defined in `instrumentation-preamble` or a dedicated reference). The `capture-learnings` agent's spawn bundle should include this schema so it shapes its output accordingly. Without it, recall entries are unstructured and the `/learn` (or equivalent) retrieval path cannot dedup or search them reliably.

## Amendment resolutions (2026-06-04)

Tier-1 amend batch 2 closes six gaps against the reconciliation verdicts
(`docs/research-backfill-reconciliation.md`, cluster-B debrief rows + cluster-C
measure-outcomes CF-1). Each gap below carries its verdict, the locked-decision evidence
that bounds the resolution, and the concrete change rendered into the canonical. CF-6 and
CF-7 are **not** in this batch — they remain open (see Open questions).

### CF-1 (resolved) — verdict-evidence schema in `measure`

**Verdict:** APPLY. Evidence: D49 ("debrief writes outcomes") + `artefacts-design §2/§5` fix
that outcome evidence is *authored into the work-item file* but leave the sub-schema open.

**Resolution:** `measure` step 3 now specifies a minimum verdict-evidence schema authored
**into the work-item file** (no second store): `verdict` (`confirmed` / `partial` / `missed`),
`outcome_link` (the target resolved), `evidence` (1–3 sentences), and `metric_deltas` (the key
earns-keep numbers lifted verbatim from `measure-outcomes`). This is authored frontmatter/body
content in `workspace/<dashboard-surface>/items/<id>.md` per `artefacts-design §2` (authored
facts only) — debrief writes evidence content, never a projected field. The format conforms to
§5's authored/projected/frozen split: the verdict-evidence block is authored, the metrics it
quotes are projected (read from the event log via `measure-outcomes`).

### CF-2 (resolved) — ratify sub-step in `learn`

**Verdict:** APPLY. Evidence: debrief already `invokes log-decision`; ratifying in-sprint
divergences is additive collaborative discipline, no conflict.

**Resolution:** `learn` mode gains a **ratify sub-step** (step 2.5) that surfaces in-sprint
**design divergences** — implementation choices that departed from the spec/canon and were
**not** logged at decision time — for explicit operator sign-off, modelled on the be-civic W33
§3 "Judgment calls — operator ratification requested" format (numbered calls, each naming the
decision made and what it diverges from). A ratified divergence routes through the existing
`log-decision` invoke (debrief already holds that edge) — no new edge, no `ratify` micro-mode
(kept as a sub-step to avoid a new goal/earns-keep, per the Open-questions note now resolved).

### CF-3 (resolved) — prior verdict + explicit trend delta

**Verdict:** APPLY. Evidence: the mechanism already exists — `measure-outcomes` emits trend
points and takes a `baseline`, and the debrief body already says "trend delta against prior
runs". Reduces to thin wiring + surfacing.

**Resolution:** `measure` step 1 now passes the **prior debrief metrics baseline path** in the
`measure-outcomes` spawn bundle (the `baseline:` input, ~line 42 of `measure-outcomes.md`),
resolved from the work-item's frozen metrics block (see the CF-1-residual resolution below).
`measure` step 2 now **surfaces the `trend_delta` explicitly** to the operator — not just the
current verdict but the direction. First-run handling is named: if there is no prior baseline,
the baseline is `null` and the delta surfaces as `first point — no trend yet` (this also
resolves the "Trend baseline" open question).

### CF-4 (resolved) — `target_sprint` + `priority` on proposals

**Verdict:** APPLY. Evidence: owner-routing already conforms to D40 (recall→operator,
canon→handbook-curator raise, node-amend→operator); the enactment-tracking fields are open +
additive.

**Resolution:** the `learn` proposals contract (the shape debrief presents and
`capture-learnings` emits) now carries, per proposal, a **`target_sprint`** (which sprint should
act on it) and a **`priority`** (`high` / `medium` / `low`) **with an explicit rationale**.
**Owner is unchanged** — it stays routed by home per D40; this amendment adds enactment-tracking
fields only, it does not touch ownership. Without `target_sprint`/`priority` the proposals
surface but do not close, directly violating the learn-goal earns-keep.

### CF-5 (resolved) — capability-gated recall-query preflight in `learn`

**Verdict:** APPLY. Evidence: consistent with D31 (gbrain reads via `mcp__gbrain__query`,
capability-gated); the node's own learn earns-keep is "re-derivation → zero", which this
mechanism enables.

**Resolution:** `learn` mode gains a **preflight (step 0)**: before spawning
`capture-learnings`, query the relevant knowledge homes for prior learnings on the sprint's
topic and pass the results into the spawn bundle so `capture-learnings` can dedup new findings
from known ones. **Capability-gated per D31:** query gbrain via `mcp__gbrain__query --source …`
when present; **fall back cleanly** to reading `docs/decisions.md` + Grep when gbrain is absent
— the preflight degrades, it never blocks. This is the mechanism that makes the re-derivation
metric achievable.

### measure-outcomes CF-1 residual (resolved — lands on debrief) — persist the metrics baseline

**Verdict:** DROP on `measure-outcomes` (the node is correctly pure-read), residual **lands on
debrief**. Evidence: D49 ("debrief writes outcomes") + `06-analytics` Carrier-state projection
+ `artefacts-design §5` (event-log = single source; the recorder freezes the timeline off the
terminal transition; the metrics report is a **projection/view**, not a hand-kept file).

**Resolution — the baseline-path handshake.** The metrics report is a **projection over the
event log's "Product outcomes" stream** (`06-analytics` Stream namespacing), never a hand-kept
file. For the next sprint's `measure-outcomes` to read it as its `baseline:` input, debrief must
persist it to a **stable, addressable path**. Consistent with the **terminal-freeze** mechanism
(`artefacts-design §5` / `06-analytics` Terminal freeze) — the single point a derived value
enters a committed file, written by debrief's fleet for `shipped`/`live` — debrief, **on the
terminal transition**, freezes the `measure-outcomes` metrics report into the **closed
work-item record** as a clearly-marked derived field **`frozen_metrics`**, the metrics sibling
of the existing `frozen_timeline`. 

**The path** is the work-item file itself:

```
workspace/<dashboard-surface>/items/<id>.md   →   frozen_metrics  (frozen frontmatter block)
```

bound in a harness via the `items-root` binding key (`artefacts-design §6`), and the freeze is
performed by the `terminal-recorder` binding (the "who freezes the timeline" key). The next
sprint's `measure-outcomes` receives this address as its `baseline:` input (the
`measure-outcomes` contract already declares `baseline: <path> | null` and degrades cleanly to
`null` on a first run). This is a recorder action **keyed off the terminal lifecycle transition**
— *not* a stage writing the carrier, and decoupled from lifecycle advancement (the gate advances
state; the recorder freezes the metrics). It is the **only** point debrief writes a derived
value into a committed file, and it lands once, at close — exactly the §5 discipline that keeps
the metrics report a view, not a second source of truth.

## Open questions

- **F7 wiring pass:** The `can-follow land` edge is currently prose-only in the node body. Formally promote to a `can-follow` frontmatter entry when `land` is confirmed built as a resolvable sibling.
- **CF-6 (still open) — sprint-seed write location:** CF-6 proposes writing the seed-next output to a named file. The canonical location (harness-specific via bindings, or a fixed path in the work-item record) needs an operator decision before that node amendment. Not in the 2026-06-04 batch — `seed-next` still surfaces-without-write.
- **CF-7 (still open) — recall-entry schema:** CF-7 proposes a canonical recall schema for the inline gbrain write. Should it live in `instrumentation-preamble`, a new `recall-schema` reference, or the `capture-learnings` agent's contract? Needs translator / operator decision. Not in the 2026-06-04 batch — the inline recall write keeps its current unspecified shape.
