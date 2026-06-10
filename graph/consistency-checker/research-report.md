---
title: Research report for consistency-checker
type: research-report
status: complete
authored: 2026-06-10
last_updated: 2026-06-10
sources_lifted: 2
external_analogue_found: false
external_corpora_searched:
  - "be-civic: bc-operations/bc-skills/bc-handbook-curator/SKILL.md (integrate mode read in full — its cross-PR collision check is INLINE in the dispatcher; no consistency agent exists; the per-file map + vocab-lock + frontmatter-schema collision list there seeded this node's finding types)"
  - "stack-graph tooling: tooling/sg-handbook-curator/agents/consistency-checker.md (primary — built + hardened under D68, 11 Codex review rounds)"
  - "stack-graph graph: queue-checker + drift-detector nodes (sibling curator-cell agents; spawn-bundle idiom, curator-only edge posture, output-contract style)"
researcher_adequacy_note: |
  The primary source is in-tree: the factory's own integrate fleet, built under D68 and hardened
  through 11 Codex review rounds in the same sprint — the candidate-set scoping (post-preview, not
  raw queue), stale-against-batch type, and decision-item extraction all came out of that review
  loop and are carried into the node. The bc production curator was read in full as the external
  analogue: its integrate walks merges with an inline per-file collision map and vocab-lock
  collision list but dispatches no agent — so external_analogue_found is false for the AGENT,
  while the finding taxonomy descends from bc's inline checks plus D40's recorded contract
  (vocabulary / frontmatter / voice / collisions; explicitly not deep-semantic in V1).
  Classification is high-confidence: primitive agent / mode autonomous (stateless, report-back,
  no operator interaction) and determinism GENERATIVE — unlike queue-checker, this node exists to
  exercise judgment (is the same concept named two ways? does a read-when line break voice?), so
  the deterministic label would be wrong. Edges: none of its own — curator-only, the structural
  link is handbook-curator's invokes edge, same posture as queue-checker/drift-detector.
  Recommendation: render canonical; keep the V1 scope guard verbatim — the not-deep-semantic
  boundary is a recorded D40 decision, not an omission.
---

# Research report for consistency-checker

## Identity

**Candidate id:** `consistency-checker`
**Candidate title:** Consistency checker

**Scope:** A stateless judgment agent for the curator's `integrate` mode. Given the post-preview
candidate set of open canon PRs, it judges the **batch against itself** and against the current
pages it touches — surface consistency only: vocabulary collisions, frontmatter-shape collisions,
index-voice breaks, file collisions, stale-against-batch references — and extracts operator-decision
items from PR descriptions. The `raise` gate already judged each PR in isolation; this node owns
the cross-PR layer that no single `raise` can see.

Excluded from scope (V1, per D40): deep semantic validation — "does spec X still support claim Y
after PR Z merges". Merging, commenting, or any mutation. Holding PRs (the dispatcher and the
integrator-checklist own gate decisions; this node only recommends).

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Cross-PR inconsistency is caught before the batch merges — two PRs naming one concept differently, or one PR's added text going stale against another's rename, never lands as merged canon | inconsistencies found at integrate vs discovered in canon after a batch (escape rate); findings per batch | escape rate trends to zero; if post-merge sweeps keep finding cross-PR drift the checker missed, its finding types are mis-scoped |
| Every finding is actionable at the merge walk — a merge order, a named PR to amend, or a decision for the operator — never "review carefully" | findings the dispatcher could act on without re-deriving context (target: all); findings discarded as vague | stays at all-actionable; vague findings mean the recommendation contract is eroding |

## Primitive / Mode

**`primitive:`** `agent` — stateless, dispatched with a spawn bundle, report-back-only.
**`mode:`** `autonomous` — no operator interaction; the dispatcher surfaces its findings.
**`determinism:`** `generative` — the job IS judgment (same-concept-two-names, voice breaks);
contrast queue-checker (deterministic JSON munging).

## Edges

None of its own. Curator-only: the structural link is `handbook-curator`'s `invokes` edge
(integrate mode). Composes into no arc; owns no outbound invocations.

## Challenge findings (resolved in the canonical render)

1. **Candidate-set scoping** (D68 round 11): judge the post-preview candidate set, not the raw
   queue — a preview-excluded PR's collisions won't land this batch and must not hold a mergeable
   one. Carried into the spawn bundle contract.
2. **Single-PR batch degeneracy**: cross-PR types cannot fire on a queue of one; the node must say
   so in notes rather than invent findings. Carried verbatim from the D68 source.
3. **Decision extraction is collection, not judgment**: decision items quote the PR description;
   the node must not answer them. Kept as a separate output array so the dispatcher can't conflate
   findings (checker's voice) with decisions (operator's).
