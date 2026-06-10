---
title: Research report for link-validator
type: research-report
status: complete
authored: 2026-06-10
last_updated: 2026-06-10
sources_lifted: 2
external_analogue_found: false
external_corpora_searched:
  - "be-civic: bc-operations/bc-skills/bc-handbook-curator/SKILL.md (integrate mode read in full — merges land with NO post-merge link validation; index refresh only; the gap this node closes)"
  - "stack-graph tooling: tooling/sg-handbook-curator/agents/link-validator.md (primary — built + hardened under D68, 11 Codex review rounds)"
  - "stack-graph graph: queue-checker node (sibling mechanical curator-cell agent; spawn-bundle idiom, error contract, one-pass ethic)"
researcher_adequacy_note: |
  The primary source is in-tree: the D68 integrate fleet. The hardening that matters here all
  came from the Codex review loop — validate the POST-MERGE page set (a merged-preview worktree,
  not per-PR diffs), the introduced_by attribution (the breaking PR is often not the page the
  break appears on), the unindexable hold (incomplete frontmatter that the index generator would
  silently skip never self-heals), and the reciprocal-related[] check (the canon's bidirectional
  edge convention). The bc production curator has NO link validation at integrate — merges land
  on mergeable-state alone — so external_analogue_found is false and this node is the gap-closer.
  Generalisation decisions: the factory source hardcodes the index path, the NN- slug grammar,
  and required frontmatter fields; the general node delegates all three to the canon's own index
  contract supplied in the spawn bundle (index path + slug rule + required fields), because a
  harness's canon may shape these differently. Classification is high-confidence: agent /
  autonomous / DETERMINISTIC — resolution against a tree is mechanical; there is no judgment in
  whether a slug resolves. Edges: none of its own — curator-only, same posture as queue-checker.
  Recommendation: render canonical; keep kind-granularity verbatim (the checklist consumes the
  distinction between self-healing index drift and holding kinds).
---

# Research report for link-validator

## Identity

**Candidate id:** `link-validator`
**Candidate title:** Link validator

**Scope:** A stateless mechanical agent for the curator's `integrate` mode. Given a checkout of
the **post-merge page set** (the dispatcher's merged-preview worktree) and the canon's index
contract, it verifies that every cross-reference resolves: page-graph `related[]` edges (including
the bidirectional convention), in-body file links, anchors, and index↔disk agreement — and
attributes each break to the PR(s) that introduced it.

Excluded from scope: any judgment about content or style; fixing links; running the index
generator (it reports drift, the dispatcher refreshes); validating anything outside the supplied
worktree's canon root.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| No broken cross-reference survives a batch merge — a link valid against pre-merge main but broken against the post-merge set is caught before, not after, landing | broken links found at integrate vs reported by readers/sweeps after a batch (escape rate) | escape rate trends to zero; post-merge link drift means the preview or the kind set is mis-scoped |
| Every break names the PR to hold — attribution survives the case where the breaking PR is not the page the break appears on | breaks with a resolvable introduced_by (target: all when the queue is supplied); holds applied to the wrong PR | mis-attributed holds stay at zero; if the dispatcher keeps re-deriving attribution manually, the contract is failing |

## Primitive / Mode

**`primitive:`** `agent` — stateless, dispatched with a spawn bundle, report-back-only.
**`mode:`** `autonomous` — no operator interaction.
**`determinism:`** `deterministic` — pure resolution against a tree; no model judgment.

## Edges

None of its own. Curator-only: the structural link is `handbook-curator`'s `invokes` edge
(integrate mode).

## Challenge findings (resolved in the canonical render)

1. **Post-merge set, not diffs** (D68): per-PR diff checking misses links broken only by the
   batch's combination; the merged-preview worktree is the input contract.
2. **Attribution** (D68 round 6): `page` alone cannot tell the dispatcher whom to hold; the
   optional queue input + `introduced_by` field carry the file-intersection attribution.
3. **Self-healing vs holding kinds** (D68 rounds 6/10): `index_missing`/`index_orphan` are
   expected generated drift (the post-walk refresh fixes them — never a hold); `unindexable`
   (incomplete required frontmatter, stale index entry or not) never self-heals and must hold.
4. **Canon-contract delegation** (generalisation): slug grammar, index path, and required
   frontmatter fields differ per canon; the spawn bundle supplies them rather than the node
   assuming the factory's.
