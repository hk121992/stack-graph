---
title: Build node — research report
date: 2026-06-01
sources:
  - docs/dev-sprint-backbone-design.md §build
  - docs/graph-map.md — backbone stages table, Non-nodes, Cross-cutting patterns
  - graph/design/design.md — mirror for shape/frontmatter/voice
  - graph/specify/specify.md — mirror for shape/frontmatter/voice
  - handbook/content/02-graph-spec/README.md — node schema, edge types, inline vs edge rule
---

# Build — research report

## Source material

**Primary:** `docs/dev-sprint-backbone-design.md` §build defines the goal, modes, C→A span,
and edge inventory. `docs/graph-map.md` backbone row + Non-nodes section establishes
`worktree-isolation` as inline (not a node, not an edge), the `IU-schema` ref shape, and the
generate→evaluate→select / crystallisation patterns the node must not accidentally invoke.

**Mirrors:** `graph/design/design.md` and `graph/specify/specify.md` supply the exact
frontmatter shape, voice register, phase-numbered body structure, and "process seams" footer.

**Schema:** `handbook/content/02-graph-spec/README.md` confirms required frontmatter fields,
edge types, inline-vs-edge discriminator (control flow = node; execution surface = inline),
and the carrier/no-write-edge rule (D44).

## Key findings

**Goal and earns-keep.** The design doc is terse: "planned change implemented to spec,
checkpointed across a long autonomous span." The earns-keep pair — spec-faithful output +
rework caught in-span — frames the two goals well: one about output quality, one about
in-span repair. Both are measurable against the IU acceptance criteria and the review-lens
re-entry rate.

**Collaborative → autonomous span.** Build is the only backbone stage classified `C→A`. It
opens collaboratively (read the work-item + IUs, confirm mode and scope), then hands off to an
autonomous span. The handoff boundary is the completion of the kick-off phase; from there,
build runs without operator interaction except to surface a blocker or a scope expansion.

**Mode triad.** Three modes — `inline` (one small IU, main thread), `serial` (IUs run in
sequence, same agent), `parallel` (per-IU worker agents in dedicated worktrees) — are body
branches of the one node, not separate nodes (D34). The mode selector is set at kick-off and
governs the entire span.

**Carrier rule (D44).** Build reads the work-item carrier + its IU children for context.
Entering `build` is the projected `committed → in-delivery` transition — it is *traversal-
derived*, not gated. Build emits node-enter/-exit events; `current_stage` is projected from
those events. Build holds no carrier write-edge.

**`worktree-isolation` is inline, not an edge.** The graph-map Non-nodes section is
definitive: "isolated checkout for a unit of work; native `isolation:'worktree'`
+ `.worktreeinclude`, script fallback. Consumed inline by build, review, reconcile — an
execution surface, not a node." Build references it as `isolation: 'worktree'` in body prose
only. No `references` edge to `worktree-isolation`.

**`.worktreeinclude` ref — not on disk.** The file `graph/_refs/.worktreeinclude` does not
exist (`ls graph/_refs/` checked). The graph-map lists it as a ref id, but the file is
absent. Per the task brief: declare a `references` edge only if the file exists; otherwise
record as F7 prose. Treating as F7.

**`IU-schema` ref — exists on disk.** `graph/_refs/IU-schema.md` is present and describes
the plan↔build field contract. Build depends on it with `load: import` (must-always-present;
the schema governs every IU build consumes). Edge declared.

**`explore` — exists on disk.** `graph/explore/explore.md` is present and already has
`composes-into` edges to the stages that invoke it (declared from its own side; noted as
deferred F7 in the explore node). Build adds the invoking side: `invokes: [{ id: explore }]`.

**`debug` — wave 2 / not on disk.** The backbone design is explicit: debug is the Iron-Law
fix path, deferred to wave 2. No `graph/debug/` directory. Build names it in process seams
(F7 prose), no edge.

**Inter-stage process edges — defer.** `can-follow plan` + `precedes review` and the inbound
loops (`review → build`, `reconcile → build`, `plan → build`) all require sibling nodes that
may or may not exist yet. Per the task brief, these are deferred to the wiring pass — F7
prose in the process seams section, no edges authored here.

**No `instrumentation-preamble` edge — check mirrors.** `design.md` and `specify.md` do not
declare a `references` edge to `instrumentation-preamble`. The preamble is loaded by the
build system into every rendered primitive (it is a build-level injection). Consistent with
mirrors: no explicit `references` edge needed in the node frontmatter for the preamble.

**Goals / earns-keep framing.** Two outcomes map naturally: (1) spec-faithful delivery —
measured against IU acceptance criteria pass-rate and review finding severity on build output;
(2) in-span rework rate — measured as the fraction of units requiring a review→build re-entry
versus caught and fixed within the span. Earns-keep: if build output routinely fails review on
items where the IU acceptance criteria were clear, the autonomous span discipline is wrong.

## Edge resolution summary

| edge | target | resolution |
|---|---|---|
| `composes-into` | `dev-sprint @build` | declared — canonical |
| `invokes` | `explore` | declared — `graph/explore/explore.md` exists |
| `references` | `IU-schema` (import) | declared — `graph/_refs/IU-schema.md` exists |
| `references` | `.worktreeinclude` | F7 prose — `graph/_refs/.worktreeinclude` absent |
| `invokes` | `debug` | F7 prose — wave 2, node absent |
| `can-follow` | `plan` | F7 prose — wiring pass |
| `precedes` | `review` | F7 prose — wiring pass |
| inbound loops | `review→build`, `reconcile→build`, `plan→build` | F7 prose — wiring pass |

## Concerns

None structural. The inline treatment of `worktree-isolation` is confirmed by the spec and
the graph-map Non-nodes table. The `.worktreeinclude` F7 prose is the right call — the ref
file is absent and the wiring-pass brief covers it. The `debug` wave-2 deferral is explicit
in the backbone design.
