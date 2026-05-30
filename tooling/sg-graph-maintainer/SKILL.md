---
name: sg-graph-maintainer
description: Dev-time tooling for authoring and maintaining nodes in the stack-graph factory. Six modes — new (greenfield node: research-report → synthesise canonical), family (derive N near-identical siblings from a template node, in parallel), reference (author a shared graph/_refs/ reference, kind: reference), amend (update research-report first, then re-render canonical), validate (schema + judgment check against the 02-graph-spec schema), index (scan edge frontmatter across all node files, regenerate the global graph record). Reads as instructions to Claude inside a Claude Code session. Use when authoring or maintaining graph nodes in the authoring workspace at graph/<id>/. NOT a runtime skill shipped to product end-users.
---

# sg-graph-maintainer

You are operating the `sg-graph-maintainer` skill. This file is your runtime
contract: the operator invoked `/sg-graph-maintainer <mode> <args>` (or, with no
mode, the bare command) inside a Claude Code session, and Claude Code loaded this
SKILL.md as your instructions. There is no dispatcher binary, no daemon, no
`doctor` subcommand. **You are the dispatcher.** Mode selection, preflight checks,
phase-gate prompts, and progress narration are all behaviors you execute by following
this file.

## Dev-tooling boundary

`sg-*` skills are dev-time tooling for building and maintaining the
factory. Vendored graph nodes ship namespaced `stack-graph:*` inside consuming
workspaces. **This skill is not shipped to product end-users as-is.** The operator
(and agents acting on the operator's behalf) invoke it to author, amend, validate, and
index nodes in the authoring workspace at `graph/<id>/`.

The authoring workspace layout this skill creates and maintains:

```
graph/<id>/
  source-material/          # verbatim lifted source + _provenance.json — LOCAL-ONLY working dir (gitignored in the factory; provenance is preserved in the research-report's Source inventory)
  research-report.md        # durable curation record
  <id>.md                   # the node file: graph frontmatter + imperative body (the canonical)
```

The node file (`<id>.md`) is the deliverable. It is a valid `.claude` primitive file
with graph frontmatter added on top. The builder strips graph keys (`edges:`, `mode:`,
`goals:`) to project a clean native `.claude` file, and single-sources any shared
**reference** the node depends on (`references` edge → `graph/_refs/<id>.md`) into it.
The research-report is the durable curation record from which the canonical is
synthesised — never edit the canonical without updating the research-report first.

## Spec pointers

The authoritative contracts are the handbook specs. When this file and a spec diverge,
the spec wins:

- `handbook/content/02-graph-spec/` — node-file schema: `primitive:`, `mode:`,
  `edges:`, `goals:`, frontmatter superset, storage and projection.
- `handbook/content/05-maintenance-skill/` — this skill's own spec stub.
- `handbook/content/07-decomposition/` — node/edge/inline cut rules; skill-or-agent
  discrimination; granularity heuristics.
- `handbook/content/01-concepts/` — shared vocabulary: primitives, arc, the loop,
  collaborative vs autonomous, factory vs harness.

## How this skill is invoked

```
/sg-graph-maintainer                         # bare; prints orientation and asks which mode
/sg-graph-maintainer new <id>
/sg-graph-maintainer family <id,id,…> --from <template-id>
/sg-graph-maintainer reference <id>
/sg-graph-maintainer amend <id>
/sg-graph-maintainer validate [<id>|all]
/sg-graph-maintainer index
```

`<id>` is the node identifier: kebab-case, matching the directory name under `graph/`
and the `id:` frontmatter field in the node file.

## Bare-invocation behavior

When the operator types `/sg-graph-maintainer` with no mode, print the orientation
block below, walk the operator through the decision tree, then ask via
**AskUserQuestion** which mode to run.

### Orientation block (print verbatim, lightly adapted)

> sg-graph-maintainer is the dev-time skill for authoring and maintaining nodes in
> the stack-graph factory graph. Four modes:
>
> - **new** — greenfield node: no prior research-report, no prior canonical. Researcher
>   gathers source-material → writes research-report → translator synthesises the node
>   file per the 02-graph-spec schema. ~20–60 min per node.
> - **family** — author N near-identical sibling nodes by deriving from an existing
>   template node (e.g. the review lens family from `lens-correctness`). One author per
>   sibling, in parallel; each mirrors the template's shape and edges, differing only in its
>   dimension content. Far cheaper than N `new` walks for a parameterised family.
> - **reference** — author a shared **reference** (a `graph/_refs/<id>.md` artefact,
>   `kind: reference`, D33): single-source shared content a node depends on via a
>   `references` edge with `load: import | on-demand`. A reference is not a node (no
>   `goals`, no process edges) — lighter than `new`, and needs no research-report.
> - **amend** — edit an existing node: update the research-report first, then
>   re-render the canonical. Never edit the canonical without the research-report
>   reflecting the change.
> - **validate** — mechanical + judgment check of one node or all nodes: frontmatter
>   schema conformance, `primitive:`↔`mode:` agreement, edge target resolution,
>   goals present.
> - **index** — scan edge frontmatter across all node files, regenerate the global
>   graph record and note the per-directory scoped view.

### Decision tree

Ask, one step at a time:

1. **Does `graph/<id>/<id>.md` exist?**
   - No → recommend `new <id>`.
   - Yes → next question.
2. **Does `graph/<id>/research-report.md` exist?**
   - No → cannot amend or validate correctly; recommend `new <id>` with
     `--force-rerender` if the canonical exists and you want to overwrite.
   - Yes → next question.
3. **What does the operator want to do?**
   - Author a new, novel node → `new <id>`.
   - Author several near-identical siblings from an existing template node → `family
     <ids> --from <template-id>` (the parameterised-family path; cheaper than N `new` walks).
   - Author a shared reference (single-source shared content, `graph/_refs/`) → `reference <id>`.
   - Edit an existing node (content change, edge update, goals revision) → `amend <id>`.
   - Check a node or all nodes for schema conformance → `validate [<id>|all]`.
   - Rebuild the graph record after edits → `index`.

### AskUserQuestion shape

Use AskUserQuestion for the final mode selection. Options: "new / family / reference / amend /
validate / index / abort". The operator's answer is your authoritative mode selection.

---

## Modes

Read the relevant section top-to-bottom on every dispatch. Do not skip preflight.

### Mode: new

**One-liner.** Greenfield node: gather source-material, write research-report,
synthesise the canonical node file per the 02-graph-spec schema.

**When to use.** No prior `graph/<id>/` directory, or a directory exists but neither
a research-report nor a canonical is present.

**Args.** `<id>` (required, kebab-case). Optional: free-form scope hint as a second
positional arg.

**Sequence.**

1. **Preflight.** Run preflight checks (see "Preflight checks" below). Abort on
   failure.
2. **Surface cost.** Announce estimated effort: "A `new` walk on `<id>` typically
   takes 20–60 min, depending on how much source material is available. Proceed?".
   AskUserQuestion (Yes / Abort).
3. **Create the authoring directory.** `graph/<id>/source-material/`. If the
   directory already exists, announce and continue.
4. **Phase 1 — Source gathering.** Dispatch `agents/researcher.md` via the Agent
   tool. Input: `{ id, scope_hint? }`. The researcher lifts source material into
   `graph/<id>/source-material/`, writes `_provenance.json`, and produces
   `graph/<id>/research-report.md`. Receive the structured summary including
   `researcher_adequacy_note`.
5. **Acceptance gate 1→2 (researcher adequacy).** Present the adequacy note to the
   operator via AskUserQuestion: "Researcher self-assesses coverage: <quote>.
   Proceed to synthesis, send researcher back, or abort?". On "another pass",
   re-dispatch the researcher with a refined scope hint. On "proceed", continue.
6. **Phase 2 — Synthesis.** Dispatch `agents/translator.md` via the Agent tool.
   Input: `{ id, research_report_path, target_node_path: graph/<id>/<id>.md,
   force_rerender: false }`. The translator synthesises the canonical node file from
   the research-report; it does NOT copy-paste from source-material. Receive the
   structured summary.
7. **Acceptance gate 2→3 (node file structure).** If the translator reports a
   structural failure (missing required frontmatter fields, `primitive:`↔`mode:`
   disagreement, empty `goals:`), surface via AskUserQuestion (Revise / Abort).
   On pass, announce briefly and continue.
8. **Phase 3 — Validate.** Run the validate mode inline on `<id>` (reuse the
   validate sequence below starting at step 3; skip the separate preflight — it
   already ran). This is the post-synthesis gate.
9. **Final report.** Summarise: node authored at `graph/<id>/<id>.md`, validate
   result, artefacts produced.

**Output artefacts.**

- `graph/<id>/source-material/` — verbatim source files + `_provenance.json`
- `graph/<id>/research-report.md` — durable curation record
- `graph/<id>/<id>.md` — node file (graph frontmatter + imperative body)

---

### Mode: family

**One-liner.** Author N near-identical sibling nodes by deriving each from an existing
**template** node — the parameterised-family path (e.g. the review lenses from
`lens-correctness`). One author per sibling, dispatched in parallel; each mirrors the
template's frontmatter shape, edge model, and goal structure, differing only in its
dimension-specific content.

**When to use.** Several nodes share most of their body and their entire edge/goal shape and
differ only along one axis (a hunt-list, an activation, a dimension boundary). Running `new`
once per sibling would re-derive the shared framing each time and would not reflect that they
are one family. Use `new` instead when a node is genuinely novel.

**Args.** `<id,id,…>` (the sibling ids, comma-separated) and `--from <template-id>` (an
existing node whose `graph/<template-id>/<template-id>.md` is the template). Per-sibling
dimension hints + source pointers are gathered at step 3.

**Sequence.**

1. **Preflight.** Run preflight checks. Confirm each sibling id is kebab-case. Confirm the
   template node `graph/<template-id>/<template-id>.md` exists; abort if not ("template not
   found; author it with `new` first"). Confirm no sibling canonical already exists (else
   route that id to `amend`).
2. **Surface cost.** Announce: "A `family` walk authors <N> siblings from `<template-id>` in
   parallel — roughly one author pass each, cheaper than <N> `new` walks. Proceed?"
   AskUserQuestion (Yes / Abort).
3. **Gather per-sibling specs.** For each sibling, collect: the dimension hint (what this
   sibling hunts / does differently) and its source pointer(s). Take these from args/scope if
   provided; otherwise ask the operator once, compactly.
4. **Fan out — one author per sibling, in parallel.** Dispatch `agents/family-author.md`
   (opus) per sibling via the Agent tool, **in a single message with multiple Agent calls**.
   Input per dispatch: `{ id, template_id, template_node_path, template_report_path,
   dimension_hint, source_pointers, settled_decisions }`. Each author reads the template node
   + its research-report + any references the template depends on, lifts its dimension source into
   `graph/<id>/source-material/`, writes `graph/<id>/research-report.md` (mirroring the
   template's section structure, dimension-specialised), then synthesises
   `graph/<id>/<id>.md` from that report — mirroring the template's edges and goal shape,
   never copy-pasting the template body.
5. **Acceptance gate.** Present each author's summary (edges, goals, divergences from the
   template). AskUserQuestion (Proceed to validate / Re-dispatch one / Abort).
6. **Batch-validate.** Run validate inline on every sibling id (the validate sequence below,
   one preflight). Surface a summary table.
7. **Final report.** List the siblings authored, validate results, and any divergences from
   the template each author flagged.

**Output artefacts.** Per sibling: `source-material/`, `research-report.md`, `<id>.md`.

**Constraint.** The family path does not relax any node contract — every sibling must still
pass validate (primitive↔mode, goals-as-outcomes, edges resolve, `references` targets resolve).
It only avoids re-deriving the shared framing.

---

### Mode: reference

**One-liner.** Author a shared **reference** — a `graph/_refs/<id>.md` artefact (`kind:
reference`, D33): single-source shared content that one or more nodes depend on via a
`references` edge carrying a `load: import | on-demand` dial. A reference is a first-class
graph artefact but **not a node** — it owns no control flow, declares no `goals` and no
process edges. It is a native `.claude` artefact; the build single-sources it into each
consumer (`import` → `@-import`; `on-demand` → a pointer the agent reads at the step of
need), never by `{{token}}` injection.

**When to use.** Several primitives need the same content (a schema, a severity scale, a
shared protocol, the instrumentation preamble). Author it once as a reference and depend on
it via a `references` edge rather than inlining it per consumer.

**Args.** `<id>` (required, kebab-case). Optional: a second positional source/scope hint.

**Sequence.**

1. **Preflight.** Run preflight checks (id kebab-case; `graph/` exists). Ensure
   `graph/_refs/` exists; create it if absent. If `graph/_refs/<id>.md` already exists,
   route to `amend`-style overwrite only with explicit confirmation (back up to `.bak` first).
2. **Gather source (optional).** If the reference generalises existing material (e.g. a
   product's schema), lift it for reference. A reference does **not** require a
   research-report — it is single-source curated content, not a synthesised node. For a
   substantive reference, you may dispatch one opus author agent to synthesise the body from
   source; for a simple reference, author it directly.
3. **Author `graph/_refs/<id>.md`.** Frontmatter: `kind: reference`, `id`, `title`,
   `description`, `status` (no `primitive`, `mode`, `goals`, or `edges`). Body: the shared
   content in the voice it will carry inside its hosts (imperative if it is procedure; a
   contract if it is a schema). A reference may itself depend on another reference via a
   `references` edge in its own frontmatter.
4. **Reference-validate.** Confirm: `kind: reference` + required reference frontmatter present;
   body non-empty; any `references` edge target resolves to an existing `graph/_refs/<id>.md`
   (with `load` one of `import`/`on-demand` if present); no node-only keys
   (`primitive`/`mode`/`goals`/`edges`) present.
5. **Final report.** Reference authored at `graph/_refs/<id>.md`; note its expected consumers
   (the `references` edges `index` will record once a node depends on it).

**Output artefacts.** `graph/_refs/<id>.md` (+ optional `source-material/` reference lift).

---

### Mode: amend

**One-liner.** Edit an existing node: update the research-report to reflect the
change, then re-render the canonical from it.

**When to use.** The node exists and you want to change content, update edges, revise
goals, or fix schema conformance issues. Never edit the canonical directly without
reflecting the change in the research-report first.

**Args.** `<id>` (required).

**Sequence.**

1. **Preflight.** Run preflight checks. Abort on failure.
2. **Verify artefacts exist.** Check `graph/<id>/research-report.md` and
   `graph/<id>/<id>.md`. If either is missing, abort: "Cannot amend `<id>`: missing
   artefacts. Run `/sg-graph-maintainer new <id>` first."
3. **Describe the amendment.** Ask the operator (via AskUserQuestion if not already
   provided in args): "What are you changing? Describe the intended edit so the
   researcher-amender and translator know what to target." This description becomes
   the `amendment_hint` passed to agents.
4. **Backup the canonical.** Copy `graph/<id>/<id>.md` to `graph/<id>/<id>.md.bak`
   BEFORE any write. Leave the `.bak` in place after successful write. (The deliberate
   orphan pattern — cleanup is operator-side.)
5. **Phase 1 — Research-report update.** Dispatch `agents/researcher.md` with
   `{ id, mode: "amend", amendment_hint, research_report_path }`. The researcher
   updates the research-report to reflect the change — edges, goals, source additions,
   conformance notes. Receive adequacy note for the amendment.
6. **Acceptance gate (amendment adequacy).** Present adequacy note. AskUserQuestion
   (Proceed / Revise / Abort).
7. **Phase 2 — Re-render canonical.** Dispatch `agents/translator.md` with
   `{ id, research_report_path, target_node_path: graph/<id>/<id>.md,
   force_rerender: true }`. The translator re-renders the canonical from the updated
   research-report. Receive structured summary.
8. **Phase 3 — Validate.** Run validate inline on `<id>` (same as `new` step 8).
9. **Final report.** Summarise: amendment applied, validate result, `.bak` left at
   `graph/<id>/<id>.md.bak`.

**Output artefacts.** Updated `research-report.md`; updated `<id>.md`; `.bak` of
prior canonical.

---

### Mode: validate

**One-liner.** Check one node or all nodes: frontmatter schema conformance,
`primitive:`↔`mode:` agreement, edge target resolution, goals present.

**When to use.** After any authoring pass; before indexing; as a periodic sweep; as a
CI-style gate before vendoring the graph.

**Args.** `[<id>|all]` (required). With no arg, default to `all`.

**Sequence.**

1. **Preflight.** Resolve node scope: if `<id>`, confirm `graph/<id>/<id>.md`
   exists. If `all`, enumerate `graph/*/` directories that contain a `<dirname>.md`
   node file.
2. **For each node in scope**, run the following checks. Dispatch
   `agents/validator.md` (sonnet — mechanical) with `{ id, node_path }`. Collect
   the per-node result.

   Checks the validator runs:

   a. **Frontmatter required fields present.** Per 02-graph-spec: `id`, `primitive`,
      `title`, `description`, `mode`, `determinism`, `edges`, `goals`, `status`.
   b. **`primitive:`↔`mode:` agreement.** `skill` → `collaborative`;
      `agent` → `autonomous`. Any mismatch is a hard failure.
   c. **`determinism:` valid.** Must be `deterministic` or `generative`.
   d. **`edges:` targets resolve.** For each edge array entry, verify a
      `graph/<target-id>/<target-id>.md` file exists. Unresolved edge targets are
      hard failures. Exceptions: edges marked `external: true` are skipped, and
      `composes-into` is skipped (its target is an **arc** — a traversal derived from
      edges, not a node file).
   d2. **`references` edge targets resolve (D33).** For each entry in the `references` edge
      array, verify the target resolves — a shared reference at `graph/_refs/<target>.md`
      (`kind: reference`) or, where the reference is itself a node, `graph/<target>/<target>.md`.
      An unresolved target is a hard failure. If an entry carries `load:`, its value must be
      one of `import` or `on-demand`; any other value is a hard failure.
   e. **`goals:` well-formed.** At least one goal, each with `outcome`, `metric`, and
      `earns-keep` populated. Empty goals arrays, or a goal missing any of the three,
      are hard failures.
   f. **Body non-empty.** The imperative body below the frontmatter must be non-empty
      prose (more than one line).
   g. **Judgment pass.** Does the `mode:` value match the node's observable
      collaborative/autonomous character in the body? Does the `primitive:` make
      sense for what the body describes? Does at least one goal read as an outcome
      (not an activity)? This is the LLM-judgment layer of validate.

3. **Surface results.** For each node: print a pass/fail line. For failures,
   surface the specific failed checks. If `all` mode and multiple failures exist,
   print a summary table first, then per-node details.
4. **No commit.** Validate is terminal — it does not write or amend any node file.
   Failures are surfaced; remediation is a follow-up `amend` call.

**Output artefacts.** Validation report printed to chat. Nothing written to disk.

---

### Mode: index

**One-liner.** Scan `edges:` frontmatter across all node files; regenerate the global
graph record. Deterministic.

**When to use.** After any authoring pass that adds or changes edges; before vendoring;
when the graph record is stale.

**Args.** None.

**Sequence.**

1. **Preflight.** Enumerate `graph/*/` directories that contain a `<dirname>.md`
   node file. Announce count.
2. **Collect edge declarations.** Read the frontmatter `edges:` block of every node
   file — the graph lives in frontmatter, never in body tokens. Parse the typed arrays:
   `invokes`, `loads`, `composes-into`, `references`, `precedes`, `can-follow`, `overlay`.
   Build the directed edge list in memory; a `references` edge carries its `load`
   (`import`/`on-demand`) into the record, and a `composes-into` edge carries its
   `stage` into the record (so a node that composes into the same arc at several
   stages — e.g. a lens composing into `dev-sprint` at `review`, `design`, and
   `plan` — emits three **distinct** edge rows, not identical duplicates). Also enumerate `graph/_refs/*.md`
   (`kind: reference` artefacts) so shared references appear in the record alongside nodes.
3. **Check edge targets.** For every declared edge target, verify the target exists — a node
   file `graph/<id>/<id>.md`, or for a `references` edge a shared reference
   `graph/_refs/<id>.md`. Collect unresolved targets as warnings (not hard failures at index
   time — validate catches them; index reports them). `composes-into` targets (arcs) are not
   resolved.
4. **Write the global graph record.** Write `graph/graph-record.json` with the
   shape:

   ```json
   {
     "generated": "<ISO timestamp>",
     "node_count": <int>,
     "reference_count": <int>,
     "edge_count": <int>,
     "nodes": { "<id>": { "primitive", "mode", "title", "status", "edges" } },
     "references": { "<id>": { "title", "status", "consumed_by": ["<id>", ...] } },
     "edges": [{ "from", "to", "type", "load", "stage" }, ...]
   }
   ```

   `load` is present only on `references` edges (`import`/`on-demand`); `stage` is
   present only on `composes-into` edges (the stage of the arc the node composes into);
   omit each elsewhere. A `composes-into` edge row **must** carry its `stage` so that a
   node composing into one arc at multiple stages yields distinct rows rather than silent
   duplicates.

5. **Note the per-directory scoped view.** Announce: "The scoped view (runtime
   preamble) is generated at runtime by the harness from the vendored graph and the
   consuming workspace's overlays. The global record above is the administration +
   analytics view only." Do not write per-directory files — that is the harness's job.
6. **Report.** Print: node count, edge count, unresolved targets (if any), path to
   `graph/graph-record.json`.

**Output artefacts.** `graph/graph-record.json` (overwritten each run, deterministic).

---

## Later

`evaluate`, `migrate`, and `benchmark` modes are deferred to a later version.

---

## Preflight checks (run before every mode)

### Check 1 — Graph directory exists

Verify that a `graph/` directory exists at the repo root. If missing, abort:
"Cannot find `graph/` directory at the repo root. Create it first or navigate to the
correct workspace."

### Check 2 — Node ID format (new / amend / validate <id>)

Verify `<id>` matches `^[a-z][a-z0-9-]*[a-z0-9]$` (kebab-case, no leading/trailing
hyphens). If malformed, abort with: "Node id `<id>` is not valid kebab-case. Use only
lowercase letters, digits, and hyphens; no leading or trailing hyphens."

### Check 3 — No invented primitives

This is not a runtime check but a preflight posture declaration: remind yourself
(and the dispatched agents) that node `primitive:` values are ONLY the Claude
taxonomy: `skill`, `agent`, `command`, `script`. Do not invent types. If a node's
source material describes something that does not map cleanly to one of these, surface
the ambiguity to the operator before synthesis.

---

## Agent dispatch via the Agent tool

Dispatch agents in `agents/` via the **Agent tool** (`subagent_type:
general-purpose`). Each agent file is a stateless task-instruction document with
a contract-typed input and output. You provide the input as the agent's prompt; you
receive the structured output; you forward to the next phase or surface to the operator
at a gate.

### Model routing

| Agent | Tier | Rationale |
|---|---|---|
| `researcher` | opus | Source curation + judgment: decides what belongs in the research-report, what to keep/drop from source-material, how to map edges and goals. Hard to reverse. |
| `translator` | opus | Synthesis judgment: turns research-report into a conformant node file; picks `primitive:`, `mode:`, `determinism:`, authors goals as outcomes. |
| `family-author` | opus | Derive-from-template synthesis: reads a template node + report, lifts one dimension's source, writes a sibling's report + canonical mirroring the template. One per sibling, dispatched in parallel. |
| `validator` | sonnet | Mechanical: reads frontmatter, checks required fields, resolves edge targets including `references` edges to `graph/_refs/`. The judgment pass (item g) is also routed sonnet — it is lighter judgment than synthesis. |

Haiku is appropriate for single-call lookups (e.g., "does this target id exist?"
inline in a driver step) but not for dispatched agents with write responsibilities.

### Dispatch shape

For each dispatch:

1. Read the agent file to refresh the input/output contract.
2. Construct the input as the structured prompt in the agent's "Input contract"
   section.
3. Invoke via Agent tool with `subagent_type: 'general-purpose'` and the routing
   model above.
4. Receive the structured output; verify it matches the agent's "Output contract".
5. Forward to next phase or surface to operator at a gate.

Example prompt shape:

```
Read agents/researcher.md and follow its instructions. Input:

id: outcome-design
scope_hint: collaborative design skill for turning operator outcomes into decisions
```

### Failure modes

If an agent returns malformed output (e.g. translator did not write the node file,
validator result is missing required fields):

- Surface via AskUserQuestion: "<Agent> returned malformed output: <details>.
  Re-dispatch, abort, or proceed with partial output?".
- Do NOT attempt to repair agent output yourself. Re-dispatch with a refined input,
  or surface the failure to the operator.

---

## Hard constraints

- **MUST synthesise the canonical from the research-report, not from source-material
  directly.** The research-report is the curation layer; the canonical is derived from
  it. This is the same pattern as bc-corpus-creator: researcher → translator, never
  researcher → canonical.
- **MUST NOT invent node-type vocabulary.** `primitive:` values are `skill`, `agent`,
  `command`, `script` — the Claude taxonomy only. No invented types.
- **MUST keep the graph in frontmatter on the canonical files, never in a separate
  store.** The global record (`graph-record.json`) is a derived lens generated by
  `index` mode; it is not the source of truth. Node files are canonical.
- **MUST NOT edit the canonical without updating the research-report first.** The
  `amend` mode enforces this ordering. Direct edits to `<id>.md` that bypass the
  research-report are a contract violation.
- **MUST use the `.bak` backup pattern on every overwriting write.** Copy the
  existing file to `<filename>.bak` before the writing agent dispatches. Leave the
  `.bak` in place after successful write — the deliberate orphan pattern. Cleanup is
  operator-side.
- **MUST surface phase-gate failures via AskUserQuestion** — no auto-decide.
  The operator decides revise vs abort.
- **MUST use imperative voice in node bodies.** The body is the skill/agent
  instructions. Operator-internal references are allowed (contrast: the Be Civic
  corpus customer-facing rule). Plain English; no invented jargon.
- **MUST declare `primitive:`↔`mode:` consistently.** `skill` ↔ `collaborative`;
  `agent` ↔ `autonomous`. Validate enforces this; synthesis must produce it correctly
  in the first place.
- **MUST ensure every `goals:` entry reads as an outcome, not an activity.** A goal
  states what the node *achieves* and how you would measure it, not the steps it runs.
  Goals drive the loop — they must be measurable outcomes.
- **MUST defer a process edge whose endpoint does not yet exist (F7).** `precedes` /
  `can-follow` targets are resolved to node files by validate. When authoring a node ahead of
  its backbone neighbours (e.g. `review` before `build`/`reconcile`), **omit** those edges and
  describe the behaviour in the body prose; wire them in with `amend` once the neighbour
  exists. Prefer authoring backbone stages in arc order. Authoring a process edge to a
  non-existent node is a hard validate failure, not a forward reference.
- **MUST keep references out of the node contract.** A reference (`graph/_refs/<id>.md`,
  `kind: reference`) has no `primitive`/`mode`/`goals`/process edges. A node consumes a
  reference only via a `references` edge carrying `load: import | on-demand` (never an injected
  `{{token}}`); the build single-sources the one file into each consumer. There is no
  `uses-block` edge and no build-time injection primitive — shared content is a native
  `.claude` artefact.

---

## Cross-references

- **Agents** (subagent contracts dispatched by this skill):
  - `agents/researcher.md` — Phase 1 in `new` and `amend`; gathers source-material,
    writes research-report.
  - `agents/translator.md` — Phase 2 in `new` and `amend`; synthesises canonical
    node file from research-report.
  - `agents/family-author.md` — `family` mode; derives one sibling node (report +
    canonical) from a template node, dispatched once per sibling in parallel.
  - `agents/validator.md` (validate mode only) — mechanical + judgment checks per
    the 02-graph-spec schema, including `references` edge-target resolution.

- **References** (authoring-facing shape docs):
  - `references/node-schema.md` — terse summary of the 02 node schema and edge
    taxonomy for quick authoring reference.

- **Assets** (templates):
  - `assets/node-template.md` — node file skeleton (graph frontmatter superset +
    stub body).
  - `assets/research-report-template.md` — research-report section skeleton.

- **Specs** (authoritative; these win over this file when they diverge):
  - `handbook/content/02-graph-spec/` — node schema, edge taxonomy, storage.
  - `handbook/content/05-maintenance-skill/` — this skill's spec stub.
  - `handbook/content/07-decomposition/` — node/edge/inline cut rules.
  - `handbook/content/01-concepts/` — vocabulary.
