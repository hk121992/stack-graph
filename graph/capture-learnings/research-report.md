---
title: Research report for capture-learnings
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: Backfill — external search performed against all corpora; ce-compound lifted as primary analogue; gstack-learn, gstack-retro, ce-sessions also lifted; Challenge findings section added; all template sections populated.
sources_lifted: 4
external_analogue_found: true
external_corpora_searched:
  - gstack live skills (learn, retro, landing-report, ship, health, investigate, office-hours, plan-eng-review)
  - CE plugin (ce-compound, ce-compound-refresh, ce-sessions, ce-dogfood-beta, ce-code-review, ce-strategy)
  - be-civic workspace (bc-operations, bc-workspace-devops-stubs-beta — grep sweep for learn/retrospective/debrief/lessons)
  - Published best practice (Anthropic skill/agent docs, sprint retrospective methodology, AI agent memory frameworks 2026)
researcher_adequacy_note: |
  The search was conducted across all four mandatory corpora. The primary analogue is CE's
  ce-compound — it does the same job (classify a learning, deduplicate against existing docs,
  route to the right knowledge home) and is production-deployed. gstack /learn and /retro were
  also lifted: /learn is the store-management interface (read side), /retro is the inline
  auto-log pathway that capture-learnings gates. ce-sessions was lifted as the session-mining
  leg used by ce-compound Phase 1, which maps to capture-learnings' transcript-reading step.
  be-civic's grep sweep found sprint docs with "learnings" language but no standalone capture
  primitive. Web searches found Anthropic's Dreaming feature (between-session consolidation)
  and community claude-memory-compiler (hook-captured transcript → SDK extraction), both
  confirming the domain. Primitive/mode decision (agent, autonomous, generative) is high
  confidence — the no-Skill constraint is explicit in the design and the isolated-context
  rationale is sound. Edges are low-ambiguity (all process edges, one external reference).
  Goals are outcome-framed. Challenge findings are grounded in the ce-compound diff.
  Recommend proceed to translator; no operator clarification needed.
---

# Research report for capture-learnings

## Identity

**Candidate id:** `capture-learnings`
**Candidate title:** Capture learnings
**Scope:** A generative curation agent — the second node in the debrief fleet. Spawned by `debrief` to surface durable learnings from a completed sprint and route each to the appropriate knowledge home (recall / curated canon / node-amend) as reconcile-gated proposals. It returns a structured proposals list; it writes nothing and converses with no one. The learnings that belong in the curated canon are proposed to the handbook curator's `raise` flow; those that belong in recall are proposed for the `reconcile`/`debrief` write path (D31).

**What it excludes:** It does not write to any knowledge store, does not enact proposals, does not converse interactively with the operator, and does not maintain or refresh existing learnings (that is `ce-compound-refresh`'s job in CE's equivalent).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Each sprint closes with a curated proposals list — durable learnings classified by knowledge home, checked for duplication. | share of proposed learnings enacted (vs dismissed as duplicate/non-durable); duplicate rate (proposals that restate an already-recorded finding). | duplicate rate trends toward zero; a significant duplicate share means the dedup step is not working. |
| Learnings that are genuinely new and durable are not dropped — the proposals list captures them even if the operator does not act immediately. | learnings surfaced per sprint that are eventually enacted (over a rolling 3-sprint window); recall-miss rate (learnings the next sprint re-derives that were in a prior proposals list but never enacted). | re-derivation of prior proposals is flagged and trends down; a learning that recurs across three sprints without enactment is a signal to escalate or drop. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** Curation involves judgment (is this finding durable? which home? is it already recorded?) and must run in an isolated context, not loaded into the main thread where every raw learning would accumulate in the operator's window. An agent shape keeps the curation isolated; it returns a digest (the proposals list). A skill would load this into the main thread — exactly the failure mode the no-`Skill` constraint prevents. This constraint is explicit in `docs/graph-map.md` and the node body.

**`determinism:`** `generative`

**Rationale:** Every curation judgment — durability test, home assignment, dedup against recall and canon — requires reasoning over variable sprint content. The output (the proposals list) is a generative synthesis, not a fixed-schema transformation.

## Contract

**Input (spawn bundle):**
```yaml
sprint_id: <string>
sprint_summary: <string>              # 3-5 sentences: what the sprint did + key moments
transcript_path: <path> | null        # local transcript for this sprint, if available
decisions_made: [<string>, ...]       # list of decisions logged this sprint (from log-decision)
metrics_report: <object> | null       # output of measure-outcomes for this sprint, if available
graph_record: <path>                  # path to graph-record.json (for earns-keep / node goals)
decisions_store_path: <path>          # path to docs/decisions.md
```

**Output (proposals list):**
```yaml
sprint_id: <string>
captured_at: <ISO-8601 timestamp>
proposals:
  - id: <slug>
    home: recall | canon | node-amend
    priority: high | medium | low
    learning: <one sentence — imperative, general>
    evidence: <one sentence — sprint moment or metric>
    dedup_status: new | refinement_of:<prior-id> | recurring_unacted
    write_path: <how this gets enacted>
skipped:
  - candidate: <short description>
    reason: duplicate_recall | duplicate_canon | not_durable | insufficient_evidence
summary:
  total_candidates: <N>
  proposed: <N>
  skipped: <N>
  recurring_unacted: <N>
```

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills | grep + file scan across all 84 skills for: learn, retro, retrospective, debrief, learnings, capture, curation, knowledge-home | yes — /learn (management), /retro (inline log) | gstack-learn-SKILL.md, gstack-retro-SKILL.md |
| CE plugin (Compound Engineering) | grep for learn, debrief, retrospective, capture, curation, durable, proposals; direct read of ce-compound, ce-sessions, ce-dogfood-beta | yes — ce-compound (primary), ce-sessions (session mining leg) | ce-compound-SKILL.md, ce-sessions-SKILL.md |
| be-civic workspace | grep across bc-operations, bc-workspace-devops-stubs-beta for learn, retrospective, debrief, lessons, capture | no standalone capture primitive — sprint docs mention "learnings" in prose only | — |
| Anthropic skill/agent published docs | WebSearch for Anthropic Claude agents knowledge capture, sprint learnings, isolated-context subagent, Dreaming feature | found Dreaming (between-session consolidation primitive), claude-memory-compiler (community), agent memory architecture patterns | cited in report, no file-liftable source |
| Sprint retrospective methodology | WebSearch for sprint retrospective learnings classification knowledge home deduplication AI workflow | found standard Scrum retro (Start/Stop/Continue, Learned category, Lessons Learned Register) | cited in challenge findings |

**Primary analogue: `ce-compound` (CE plugin).** ce-compound does the same job as capture-learnings — after a problem is solved, it extracts learnings, classifies them by knowledge home, deduplicates against existing docs (overlap assessment: high/moderate/low), and routes the finding to the right target. The critical structural differences are: (1) ce-compound **writes the doc itself** (no gate); (2) it is a **skill** (main-thread), not an agent (isolated); (3) it targets a single solved problem, not a sprint-window full of findings. These differences are the challenge-findings seed.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/ce-compound-SKILL.md` | keep | Primary analogue. Sections to absorb: knowledge-home routing (bug track / knowledge track), overlap assessment (high/moderate/low, five dimensions), dedup logic (Related Docs Finder), the discoverability check, the compounding philosophy. Structural diff: ce-compound writes; capture-learnings proposes. ce-compound is a skill (main-thread); capture-learnings is an agent (isolated). |
| `source-material/ce-sessions-SKILL.md` | keep (edge-only for session-mining pattern) | ce-sessions models the transcript-mining and prior-session evidence-gathering step used by ce-compound Phase 1. Relevant to capture-learnings' "Gather raw material" step — same skeleton-extraction + synthesis-subagent pattern. The skill itself is a separate node, not absorbed into the body. |
| `source-material/gstack-learn-SKILL.md` | keep (edge-only — recall store management interface) | /learn is the READ side of gstack's flat JSONL learnings store. Shows the real data model: type / key / insight / confidence / source / files. Not absorbed into capture-learnings body; represents the `recall` home target that capture-learnings routes to. |
| `source-material/gstack-retro-SKILL.md` | keep (edge-only — the inline auto-log pathway) | /retro shows how every gstack skill's Operational Self-Improvement block auto-logs findings to the learnings store (gstack-learnings-log). This is the low-fidelity, inline, non-isolated capture path. capture-learnings is the curated gate that operates on a sprint window, not per skill invocation. |

## Keep / Drop

**Kept (absorbed into body):**
- **Knowledge-home routing table** (from ce-compound): the class → home → write-path table. capture-learnings already has this; ce-compound deepens it with a concrete five-dimensional overlap assessment (problem statement / root cause / solution approach / referenced files / prevention rules) that capture-learnings lacks.
- **Durability test language** (from ce-compound): "applies beyond this sprint; a future operator or node would benefit from knowing it; it is not specific to the one work-item or its exact context" — aligned with capture-learnings' existing durability test wording; corroborated by ce-compound's bug-track vs knowledge-track distinction.
- **Dedup discipline** (from ce-compound): the three-level dedup (recall check / canon check / prior proposals) maps directly to capture-learnings' steps 1–3 in §3 Dedup. ce-compound adds a `recurring_unacted` flag (appearing as a separate field in the proposals list) — already in the node.
- **Compounding philosophy** (from ce-compound): "each documented solution compounds your team's knowledge" is the motivating principle; confirmed by the loop pattern: sprint → capture → enact → next sprint knows more.

**Dropped (out of scope):**
- ce-compound's Phase 3 specialized reviewer agents (ce-performance-oracle, ce-security-sentinel, etc.) — domain-specific documentation enhancers, not general curation.
- gstack /retro's git-log metrics, commit histogram, per-author leaderboard — engineering analytics, separate node concern.
- ce-sessions' session discovery and skeleton-extraction pipeline — a separate node (transcript-reader / session-historian); capture-learnings references it inline as "read transcript_path" without owning the extraction.
- The discoverability check in ce-compound (checks whether CLAUDE.md surfaces docs/solutions/) — relevant to a harness-configuration node, not a curate-and-propose agent.

**Edge only (separate node):**
- The **recall store** (gstack's learnings.jsonl model) — the write target, not this node. Represented as the `recall (gbrain)` home in the proposals list.
- The **session mining** step (transcript → skeleton → synthesis) — ce-sessions models this; capture-learnings reads the pre-supplied `transcript_path` rather than owning discovery, so no edge is needed — it is inline.
- The **refresh / staleness sweep** (ce-compound-refresh analogue) — checking whether enacted learnings have gone stale is a later, separate concern; out of scope for capture-learnings.

## Overlaps and seams

- **Upstream: `debrief`** — spawns capture-learnings; provides the spawn bundle (sprint_summary, transcript_path, decisions_made, metrics_report, decisions_store_path, graph_record). `debrief` holds the `invokes capture-learnings` edge; this node declares no `composes-into`.
- **Downstream: `debrief` again** (the gate) — capture-learnings returns the proposals list; `debrief` enacts recall writes (D31) and routes canon proposals to the handbook curator's `raise` flow (D38 write-path). The write path is enacted at the gate, not by this agent. The seam is the proposals list as a return value.
- **Knowledge substrate: `handbook` (external reference)** — capture-learnings reads the handbook `on-demand` to check whether a proposed canon finding is already stated there (D41 pattern). Declared as `references handbook (load: on-demand, external: true)`.
- **Knowledge substrate: `decisions-store`** — read inline via `decisions_store_path` from the graph-record; no formal edge until the `decisions-store` ref is authored.
- **No overlap with `measure-outcomes`** — that node produces the `metrics_report` input; measurement and curation are separate. The seam is clean: measure-outcomes produces evidence; capture-learnings classifies it.

## Fit

Single node, do not split. The three sub-steps (gather → surface candidates → dedup → classify → emit) form a cohesive curation judgment. Each step feeds the next and shares the same sprint context. None earns a separate measurable goal. The no-`Skill` constraint further confirms single-node: the agent boundary is the entire curation pass, not a sub-step.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | handbook (`load: on-demand, external: true`) | Read at the step of need to check whether a proposed canon finding is already stated — the harness supplies the target. |
| can-follow | debrief | Process loop: after `debrief` invokes capture-learnings and receives the proposals list, `debrief` may loop back. (Declared on `debrief`, not here — capture-learnings is a leaf.) |

Note: `composes-into` is absent (leaf agent). `invokes` is absent (no downstream agents invoked — the write path is proposed in the return value, not enacted here). The `decisions-store` reference is pending (F7 prose) — edge will be `references decisions-store (load: on-demand)` once the ref is authored.

## Conformance

**`primitive:` ↔ `mode:` agreement:** Confirmed. `primitive: agent` and `mode: autonomous` agree — isolated context, returns a digest.

**`goals:` as outcomes:** Confirmed. Both goals read as outcomes ("sprint closes with a curated proposals list"; "learnings that are new and durable are not dropped") with measurable metrics (duplicate rate, recall-miss rate, recurring-unacted count).

**Edge targets resolvable:** `handbook` — external, harness-supplied; intentionally absent from the factory (the factory ships only the pointer). `decisions-store` — not yet authored; declared as F7 prose in the node. No unresolvable errors.

## Challenge findings

This section challenges `capture-learnings` against its primary analogue `ce-compound` and the secondary analogues (`gstack/learn`, `gstack/retro`). Findings are grounded in concrete differences observed in the lifted sources.

---

### CF-1: No overlap-severity scoring — weaker than ce-compound (severity: high)

**ce-compound** has a structured five-dimensional overlap assessment (problem statement / root cause / solution approach / referenced files / prevention rules) producing a high / moderate / low score that drives a concrete action (high → update existing, moderate → create new + flag, low → create). The score is computed by the `Related Docs Finder` subagent against the full existing doc corpus.

**capture-learnings** dedup is binary: `duplicate_recall | duplicate_canon | not_durable | insufficient_evidence`. It has no graduated overlap model. A learning that partially overlaps an existing finding — same domain, different angle — has no representation: it is either a duplicate (skipped) or new (proposed).

**Gap:** The node does not distinguish "refinement of an existing learning" from "wholly new" beyond the `refinement_of:<prior-id>` tag (which requires knowing the prior id). There is no scoring rubric, no five-dimension check. This means the curated proposals list will either over-suppress (flagging partial overlaps as duplicates) or under-suppress (proposing findings that a human reviewer would immediately recognize as restating a prior one at a different angle).

**Recommendation:** Add a graduated dedup rubric — at minimum high (verbatim restatement) / moderate (same domain, different angle) / low (genuinely new) — with explicit guidance on what to do at each level. Adopt ce-compound's dimension list as a starting structure.

---

### CF-2: No staleness / refresh signal — missing step present in ce-compound (severity: medium)

**ce-compound** includes a `Selective Refresh Check` (Phase 2.5): after writing the new learning, it asks whether the new finding is evidence that **existing** learnings should be refreshed or consolidated. It identifies stale candidates and routes to `ce-compound-refresh`. The logic is: capturing a new learning sometimes invalidates a prior one; the system only compounds cleanly if both directions (add + retire) are handled.

**capture-learnings** proposes new learnings but does not check whether the sprint's findings invalidate or supersede existing learnings in recall or canon. If sprint N's findings contradict a gbrain entry logged by sprint M, the contradiction is undetected.

**Gap:** The node has no `supersedes` or `invalidates` signal in the proposals schema and no instruction to check for learnings whose advice the new sprint contradicts.

**Recommendation:** Add a `supersedes_candidates: [<prior-id>, ...]` optional field to the proposals schema and a step in §3 Dedup to check for learnings the new finding might invalidate, not just duplicate. (Staleness sweep is a separate node concern; the signal is just a flag in the proposals list.)

---

### CF-3: Skill (main-thread) vs. agent (isolated) — node's choice is STRONGER than the analogue (severity: informational — confirms design)

ce-compound is a **skill** (runs in the main thread, interactive). capture-learnings is an **agent** (isolated, returns a digest). The node's choice is *stricter* than the analogue — every sprint's raw learnings stay out of the operator's live context. ce-compound's sessions-search step (`ce-sessions`) adds a subagent dispatch that parallels what capture-learnings does with `transcript_path`. The gstack `/retro` skill's Operational Self-Improvement block (inline `gstack-learnings-log` at skill end) shows what the *un-curated* inline pathway looks like — capture-learnings is the gate that replaces that inline path for sprint-scoped review.

**Finding:** The primitive/mode decision is well-grounded. The no-`Skill` constraint is correct and confirmed by the analogue's concrete failure mode (a skill would accumulate the whole sprint's raw material in the main thread). No change recommended.

---

### CF-4: No prior-proposals cross-sprint dedup path is under-specified (severity: medium)

The node's `dedup_status: recurring_unacted` flag is correct, but the mechanism is declared as "if a prior debrief's proposals list is available (passed in `metrics_report.prior_proposals`)". This is **capability-gated on the caller passing `prior_proposals`** — if `debrief` does not include prior proposals in the metrics_report, the cross-sprint dedup is silently skipped with no fallback.

**ce-compound**'s session-history step (`ce-sessions`) shows an alternative: actively search prior sessions for related evidence rather than relying on the caller to pass it in. The `decisions_store_path` provides a partial fallback (the store contains logged decisions) but not the proposals lists from prior runs.

**Gap:** The proposals list from prior debriefs has no defined storage location. There is no "prior proposals store" analogous to `docs/solutions/` in ce-compound. If `metrics_report.prior_proposals` is null (most runs), the cross-sprint memory of recurring-unacted learnings is zero — the flag is defined but cannot fire.

**Recommendation:** Define where prior proposals lists live (e.g., `.stack-graph/proposals/<sprint-id>.yaml` or a section in the decisions-store). Make the fallback explicit: if `metrics_report.prior_proposals` is null, check the proposals archive path. Add this to the spawn bundle or the gather step.

---

### CF-5: No discoverability / routing guidance for enacted learnings (severity: low)

**ce-compound** includes a discoverability check: after a learning is written, it verifies that the project's CLAUDE.md/AGENTS.md surfaces `docs/solutions/` to future agents. Without this, the written learning is dark — not findable by the next agent.

**capture-learnings** proposes learnings to `recall (gbrain)` and `canon (handbook)` but does not check or propose that the enacted learnings become discoverable via any index or pointer in the consuming harness (the handbook's index.json, a CLAUDE.md hint, a gbrain tag).

**Gap:** The write-path column in the proposals list specifies the mechanism but not the discoverability follow-on. A learning enacted into gbrain that nothing routes agents to is a dark entry.

**Recommendation:** Add a `discoverability_note` optional field to proposals targeting recall, noting which tag, query term, or CLAUDE.md hint should surface this learning. (Low severity: gbrain's semantic query makes discoverability self-managing to a degree; this is a nice-to-have rather than a structural gap.)

---

### CF-6: Proposals list format lacks a `confidence` field — weaker than gstack /learn schema (severity: low)

**gstack /learn** stores learnings with a `confidence: N` field (1–10 scale). This lets the management interface (`/learn prune`) assess reliability over time and gives downstream consumers (retro, review) a signal about learning quality.

**capture-learnings** proposals have `priority` (high/medium/low — operator-action urgency) but no confidence (evidence quality / certainty). A high-priority proposal with weak evidence (single sprint observation, no metric confirmation) is indistinguishable from a high-priority proposal with strong evidence (three-sprint recurring finding, confirmed by metrics delta).

**Recommendation:** Add `confidence: high | medium | low` (or 1–10) to the proposal schema, grounded in evidence strength (single observation vs. metric-confirmed vs. recurring-unacted). Priority and confidence are orthogonal: a low-priority learning can have high confidence; an urgent finding can have low confidence.

---

### CF-7: Unsupported claim — "dedup against gbrain" requires gbrain availability (severity: medium)

The node's §1 Gather raw material states "Check the knowledge substrate before deriving anything new: Recall (gbrain): query `mcp__gbrain__query`" and adds a capability fallback ("if gbrain is unavailable, read `decisions_store_path` and Grep the transcript instead").

The fallback is good, but the **scope of the fallback is narrower than the primary path**. When gbrain is available, the dedup checks ALL prior learnings (semantic query). When it is not, the fallback only checks `decisions_store_path` and the transcript. The prior proposals archive (CF-4) is not mentioned as a fallback target.

**Gap:** The claim that "duplicate rate trends toward zero" (earns-keep) depends on gbrain's recall. In harnesses without gbrain configured (or with a cold gbrain), the duplicate rate metric is unanchored because the dedup is operating on a fraction of the prior knowledge.

**Recommendation:** Strengthen the fallback to explicitly include: (1) any prior proposals lists (see CF-4), (2) the handbook (already referenced), and (3) a note that without gbrain the duplicate-rate metric is degraded and the operator should weight it accordingly.

## Open questions

- **Where do prior proposals lists live?** The `recurring_unacted` flag requires cross-sprint proposals history; no storage location is defined. This is the highest-priority open question (see CF-4).
- **Is a staleness signal in scope?** If a sprint's findings contradict a prior recall entry, should capture-learnings flag the contradiction in the proposals list (as a `supersedes_candidates` field), or is that always a downstream concern? (See CF-2.)
- **Should `confidence` be added to proposals?** The gstack /learn schema has it; capture-learnings' priority field is not a substitute. Operator decision. (See CF-6.)
- **F7 `decisions-store` ref** — pending; will resolve to a `references decisions-store (load: on-demand)` edge once authored.
- **Overlap-severity rubric** — should this be a referenced schema (a `_refs/` reference) or inline in the agent body? Given that dedup is a core step, a lightweight inline rubric (high/moderate/low with three criteria) may be more appropriate than a separate reference.

## Amendment applied — cluster-E batch (2026-06-04)

Reconciliation (`docs/research-backfill-reconciliation.md` §E) verdicts CF-1/2/4/7 as **APPLY**;
**D60** settles the proposals-archive home. Re-rendered the canonical to **v0.2.0**:

- **CF-1 — graduated overlap, not binary.** Step 3 dedup is rewritten as a three-level overlap
  score (verbatim → skip; same-domain-different-angle → propose as `refinement_of`; genuinely-new →
  propose) run against recall + canon + prior proposals, replacing the binary duplicate/skip.
- **CF-2 — supersession signal.** Added an optional `supersedes_candidates: [<prior-id>,…] | null`
  to the proposal schema + a step-3 check for prior learnings the new finding *invalidates* (not
  just refines). A flag for the gate, never a write (D38 homes own enactment).
- **CF-4 + D60 — proposals-archive home fixed.** The prior-proposals set is read from
  `learnings_archive_path` — the **committed `learnings-archive` surface the gate (debrief/reconcile)
  writes**, per D60 (a proposals list is generative/non-replayable, so it is a committed artefact, not
  `.stack-graph/`). `metrics_report.prior_proposals` demoted to an optional inline copy. **Fallback:**
  archive absent → use the inline copy; neither present (first sprint / fresh harness) → empty prior
  set, no `recurring_unacted` flags — degrade cleanly. Added `learnings_archive_path` to the spawn
  bundle (the gate resolves the `learnings-archive` binding; the agent stays write-free).
- **CF-7 — wider no-gbrain fallback.** Step 1 recall-degraded path now reads the prior-proposals
  archive + `decisions_store_path` + the `handbook` reference (not gbrain alone), and notes the
  duplicate-rate metric is degraded without recall.
- **Edge wired.** Dropped the stale F7 comment (`decisions-store` now exists) and added
  `references: { id: decisions-store, load: on-demand }` — this node is a declared *reader* of the
  store (`decisions-store.md` §"Read vs write"); on-demand, since it reads for prior context.
