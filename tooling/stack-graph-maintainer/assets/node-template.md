---
# identity — native .claude (the builder emits the primitive from these)
id: {{node-id}}
primitive: skill                   # skill | agent | command | script
title: {{Node title}}
description: {{One-sentence description of what this node does.}}
when-to-use: {{One-sentence operator trigger condition.}}
model: opus                        # optional; omit if not node-specific
allowed-tools: [Read, Edit, Agent] # optional; omit if not node-specific
# classification — graph lens
mode: collaborative                # collaborative→skill | autonomous→agent
determinism: generative            # deterministic | generative
# edges — the graph (scanned from here into the record)
edges:
  invokes:       []   # [{ id: target-node-id }]
  loads:         []   # [{ id: target-node-id }]
  references:    []   # [{ id: reference-artefact-id }]
  composes-into: []   # [{ id: workflow-id, stage: stage-name }]
  can-follow:    []   # [{ id: target-node-id }]
  precedes:      []   # [{ id: target-node-id }]
  # overlay:     []   # uncomment only for harness-local overlay nodes
# analytics — the loop
goals:
  - outcome: {{What this node achieves — an outcome, not an activity.}}
    metric: {{How you know this node earned its keep.}}
    earns-keep: {{Threshold or condition for earning keep.}}
status: v0.1.0 — {{YYYY-MM-DD}}
---

# {{Node title}}

{{Imperative body: the skill or agent instructions. Use H2/H3 for phases or sections.
Use numbered lists for sequenced steps. Embed {{resolver-placeholder}} where the
build should expand a value at vendor time. Voice is imperative throughout.}}

## When to invoke

{{Describe the trigger condition in detail if needed beyond the frontmatter
`when-to-use` one-liner.}}

## Steps

1. {{First imperative step.}}
2. {{Second imperative step.}}

## Output

{{What this node produces or surfaces.}}
