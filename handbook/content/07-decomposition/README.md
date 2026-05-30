---
title: Decomposition principles
type: reference
read-when: Deciding how to break an arc into nodes, edges, and inline elements.
related: [graph-spec, maintenance-skill, concepts]
---

# Decomposition principles

How to break an arc into the graph: what becomes a node, what becomes an edge, what stays
inline, and where the boundaries fall. Adapted from the Be Civic corpus authoring rules
(they transfer; the inversions are noted).

## Node, edge, inline, or reference

The first cut (from the corpus `skill-vs-path.md` branching test) is **control flow**:

- **Node** — it owns its **own branching and sequencing**. Give it a step that decides
  between alternatives or runs an ordered procedure, and it is a unit of its own.
- **Edge** — it is merely **reached or invoked** by another node, with no independent
  control flow of its own. Model the relationship, not a node (`loads`, `invokes`,
  `composes-into`, `references`).
- **Inline** — a one-shot reference, an **MCP call**, or an **execution surface** (a
  headless browser, a worktree) in a node's body. Worth neither a node nor an edge — it has
  no control flow; the node calling it owns the judgment. Ride a native primitive where one
  exists (e.g. `isolation: 'worktree'`) rather than building a node for it. An edge appears
  only when the thing invoked is itself node-like (a script with its own logic →
  an `invokes` edge).
- **Reference** — **shared content** a node depends on (a schema, a procedure, a rubric)
  with no control flow of its own. Not a node, and not duplicated per-consumer: author it
  once as a `kind: reference` artefact (`graph/_refs/<id>.md`) and depend on it via a
  `references` edge with a `load` dial (D33; see [graph-spec](../02-graph-spec/)). **Rules**
  and **hooks** are the other two non-node primitives — a *rule* is a standing always-apply
  guideline, a *hook* is enforcement bound to an event.

Once you know whether a span owns control flow, [choose the primitive](#choosing-the-primitive--and-how-each-loads-context) by what it is and how it must load.

## Node anatomy

A node is a single canonical markdown file (`canonical-shape.md`): **graph frontmatter**
(the typed edge arrays) **+ an imperative body + inline tags**. The one file is
**dual-consumer** — it renders in the authoring/review view and builds into the vendored
plugin. Keep the frontmatter the structural truth; keep the body the instructions.

Voice is imperative (`voice-and-style.md`), with one inversion from the corpus:
stack-graph nodes are **operator/dev-internal, so internal references are allowed** — the
opposite of the customer-facing corpus rule.

## Skill or agent — the context axis

Once a span is a node, **context** picks the primitive (see [concepts](../01-concepts/)): a
**skill** loads into the *current* context (use when the step needs the live main thread);
an **agent** runs in an *isolated* context and returns a summary (use when the work does not
benefit from the main thread, is describable in a prompt, or is parallelizable). They
compose — a skill can dispatch agents; an agent can preload skills. Collaborative-vs-
autonomous is the usual correlate, not the rule. Decide this at decomposition time; it
changes the node's contract and its instrumentation, not just its label.

## Choosing the primitive — and how each loads context

Route every span by what it **is** and **how it must enter context**. Every option is a
native Claude primitive — stack-graph invents none (D33). The load behaviour is *why* the
choice matters: it decides what costs context, when, and in whose window.

| The span is… | Primitive | How it loads into context |
|---|---|---|
| a unit of work best run **isolated**, returning only a summary (parallelizable; fully describable in a prompt) | **agent** (node) | its own isolated window; the parent sees only the returned summary (the context firewall) |
| a workflow/capability the operator or model **invokes and runs inline** | **skill** (node) | description always-on (the index); body loads on trigger, into the current context, and persists |
| **shared content** several primitives need (a schema, a procedure, a rubric) | **reference** | `load: import` → spliced in at load (native `@-import`, guaranteed-present); `load: on-demand` → read at the step that needs it (lazy, lean) |
| a **standing, always-apply guideline** | **rule** | always-on at session start (a path-gated rule loads only when a matching file is touched) |
| behaviour that must be **enforced**, not merely instructed | **hook** | runs at its bound event, outside the model's discretion |
| a one-shot call or execution surface in a body | **inline** | part of the host body; no separate load |

**One node ⟷ one primitive (D34).** Each row above is its own 1:1 artefact — a node is one
file, a reference is one file. Right-size by choosing the right primitive and extracting
smaller ones, **never** by splitting a single primitive across several nodes that collapse at
render. Modes are body branches, not nodes.

### Reference vs skill — the call to get right

Both are reusable content, so the discriminator is **who runs it**:

- A **skill** is a unit the operator or model **invokes and runs** — it has its own goal and
  is discoverable by its description. If you would ever trigger it on its own, it is a skill.
- A **reference** is content **the host runs** — a procedure the host *follows*, a schema the
  host *emits to* — with no goal and no control flow of its own. You never invoke it; a host
  pulls it in.

Then set the **load dial**: `import` for short, must-always-be-present content (a contract, a
preamble — `@-import` guarantees it without the model choosing to load it); `on-demand` for
larger or conditional material (keeps the host's context lean and reads as its own document —
this is also what removes the mid-body seam a build-time splice creates). Content a **spawned
agent** needs is passed by its orchestrator in the **spawn prompt**, never imported by the
agent itself.

### Why these, and not a build-time splice

These options cover every combination of *when* content must be present and *whose* context it
enters — so injecting text at build time buys nothing the running model can perceive (D33).
`@-import` already gives guaranteed-present, single-sourced content at load; on-demand
references keep context lean; agents isolate and return summaries; rules are always-on; hooks
enforce. A build splice only duplicates bytes the host would otherwise hold once. (Mechanics
verified against the Claude Code docs as of 2026-05 — load-bearing, but re-check if the
platform's skill/context model shifts; this is the kind of limitation that ages.)

## Granularity — the sizing rule

Decompose a span into its own node when **any** of these hold (adapted from the Be Civic
granularity rule):

- **Reuse** — it is referenced by **≥2 consumers** (extract it; define once).
- **Cohesion** — it is **self-contained with its own branching** (a distinct, cohesive unit).
- **Just-in-time** — a consumer needs only **part** of it (split so each consumer pulls only
  what it needs).

Keep it **inline** when it is **used once and trivial** (≤2–3 simple actions, no independent
goal). **Flatten** deep recursion — decompose by *need*, not by aesthetic. A different
collaborative/autonomous (context) nature is also a split signal.

**One node, one primitive** (D34, see [graph-spec](../02-graph-spec/)): a node maps **1:1**
to a single rendered primitive. A skill's **modes** are branches in its body, never separate
nodes; if a mode earns its own measurable goal, split it into its own primitive (still 1:1)
rather than modelling it as a node that collapses at render. Cut by the rule above — the file
shape *is* the node, not a downstream rendering choice.

## Let goals draw the boundary

A node must have a **stated outcome and a way to measure it** (the loop, see
[analytics](../06-analytics/)). Use that as a decomposition test: if you cannot say what a
candidate node *achieves* and how you would know it earned its keep, the boundary is in the
wrong place — widen or narrow it until the node has a measurable job. Boundaries chosen this
way are the ones the loop can later evaluate, merge, or cut.

## Stay process-agnostic

The discriminator and the anatomy name **structure, not domain**. "Owns its own
branching," "reached or invoked," "measurable outcome" hold for any process. Resist
baking dev-specifics (code, tests, commits) into the decomposition rules themselves —
those belong in the dev-domain *nodes*, never in how nodes are *cut*. If a decomposition
rule only makes sense for software, it is mis-stated.
