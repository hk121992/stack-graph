---
title: Research report for {{node-id}}
type: research-report
status: complete | draft
authored: {{YYYY-MM-DD}}
last_updated: {{YYYY-MM-DD}}
amended:
  - date: {{YYYY-MM-DD}}
    note: {{one-line description of the amendment}}
sources_lifted: <int>
external_analogue_found: true | false   # did a real external counterpart exist after a real search?
external_corpora_searched: []           # corpora actually searched (names, not machine paths)
researcher_adequacy_note: |
  4–6 sentence self-assessment. Name: which sources were lifted and why; how edges
  were determined; confidence in the primitive/mode decision; whether goals were
  difficult to frame as outcomes; recommendation for the translator.
---

# Research report for {{node-id}}

## Identity

**Candidate id:** {{node-id}}
**Candidate title:** {{Node title}}
**Scope:** {{One-paragraph description of what this node covers and what it excludes.}}

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| {{What it achieves}} | {{How you'd measure it}} | {{Threshold}} |

## Primitive / Mode

**`primitive:`** `skill | agent | command | script`

**`mode:`** `collaborative | autonomous`

**Rationale:** {{Why this primitive and mode? What makes it collaborative vs
autonomous? If there was ambiguity, describe both options and why you chose this one.}}

**`determinism:`** `deterministic | generative`

**Rationale:** {{Why deterministic or generative? E.g., a script with fixed inputs/outputs
is deterministic; a judgment skill is generative.}}

## Contract

**Input:** {{What this node receives — operator instructions, loaded context, upstream
node output.}}

**Output:** {{What this node produces or surfaces — artefacts, decisions, operator
questions.}}

## External analogues searched

Record the real-world search — whether or not anything was lifted. This is the rigor that lets the
report **challenge** the node against how the job is really done, not merely describe the node.

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| {{operator skill set / reference plugin / product harness / published best practice}} | {{what you searched for}} | yes / no | {{filename or —}} |

**If no external analogue was found:** name the corpora searched and why no counterpart exists — a
searched-and-absent finding, never silence. In-repo design docs are *input*, not an external
analogue; they never satisfy this section on their own.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/{{filename}}` | keep / drop / edge-only | {{why}} |

## Keep / Drop

**Kept (absorbed into body):**
- {{Section or concept from source-material that belongs in the body.}}

**Dropped (out of scope):**
- {{Section or concept that is not node-like or is a separate node.}}

**Edge only (separate node):**
- {{Thing that is node-like but should be a separate node; model as an edge.}}

## Overlaps and seams

{{Any overlap with other nodes. Where does this node hand off? Where does it receive?
Mention the edge type you expect at each seam.}}

## Fit

{{Does this node belong as a single node or should it be split? Apply the
07-decomposition discriminator: does it own its own branching and sequencing? Can you
state a distinct goal you would measure separately? If split, name the proposed
sub-nodes.}}

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| invokes | {{target-id}} | {{why this node invokes the target}} |
| loads | {{target-id}} | {{why this node loads the target}} |
| references | {{reference-id}} (`load: import \| on-demand`) | {{what shared reference (kind: reference \| handbook-reference) is depended on, and why import vs on-demand}} |
| maintains | {{handbook-reference-id}} | {{which handbook-reference this node keeps current — never a standard reference}} |
| composes-into | {{arc-id}} | {{what arc and stage}} |
| can-follow | {{target-id}} | {{process flow — when does this follow}} |
| precedes | {{target-id}} | {{process flow — what does this precede}} |

## Conformance

**`primitive:`↔`mode:` agreement:** {{confirms or flags the mismatch}}

**`goals:` as outcomes:** {{confirms all goals read as outcomes, or flags which ones
were reframed}}

**Edge targets resolvable:** {{confirms all target ids exist or names unresolved ones}}

## Open questions

- {{Ambiguity or gap the translator should be aware of.}}
- {{Any structural decision that needs operator input.}}
