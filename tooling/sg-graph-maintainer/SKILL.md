---
name: sg-graph-maintainer
description: Dev-time tooling for authoring and maintaining nodes in the stack-graph factory. Four modes — new (greenfield node: gather source-material, write research-report, synthesise canonical), amend (update research-report first, then re-render canonical), validate (mechanical + judgment check of a node file against the 02-graph-spec schema), index (scan edge frontmatter across all node files, regenerate the global graph record). Reads as instructions to Claude inside a Claude Code session. Use when authoring or maintaining graph nodes in the authoring workspace at graph/<id>/. NOT a runtime skill shipped to product end-users.
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
  source-material/          # verbatim lifted source (existing skills, agents, docs) + _provenance.json
  research-report.md        # durable curation record
  <id>.md                   # the node file: graph frontmatter + imperative body (the canonical)
```

The node file (`<id>.md`) is the deliverable. It is a valid `.claude` primitive file
with graph frontmatter added on top. The builder strips graph keys (`edges:`, `mode:`,
`goals:`) and resolver placeholders (`{{...}}`) to project a clean native `.claude`
file. The research-report is the durable curation record from which the canonical is
synthesised — never edit the canonical without updating the research-report first.

## Spec pointers

The authoritative contracts are the handbook specs. When this file and a spec diverge,
the spec wins:

- `handbook/content/02-graph-spec/` — node-file schema: `primitive:`, `mode:`,
  `edges:`, `goals:`, frontmatter superset, storage and projection.
- `handbook/content/05-maintenance-skill/` — this skill's own spec stub.
- `handbook/content/07-decomposition/` — node/edge/inline cut rules; skill-or-agent
  discrimination; granularity heuristics.
- `handbook/content/01-concepts/` — shared vocabulary: primitives, workflow, the loop,
  collaborative vs autonomous, factory vs harness.

## How this skill is invoked

```
/sg-graph-maintainer                         # bare; prints orientation and asks which mode
/sg-graph-maintainer new <id>
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
   - Author a new node → `new <id>`.
   - Edit an existing node (content change, edge update, goals revision) → `amend <id>`.
   - Check a node or all nodes for schema conformance → `validate [<id>|all]`.
   - Rebuild the graph record after edits → `index`.

### AskUserQuestion shape

Use AskUserQuestion for the final mode selection. Options: "new / amend / validate /
index / abort". The operator's answer is your authoritative mode selection.

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
      hard failures. (Exception: edges marked `external: true` are skipped.)
   e. **`goals:` non-empty.** At least one goal with `outcome` and `metric` fields
      populated. Empty goals arrays are hard failures.
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
   file. Parse the typed arrays: `invokes`, `loads`, `composes-into`, `references`,
   `precedes`, `can-follow`, `overlay`. Build the directed edge list in memory.
3. **Check edge targets.** For every declared edge target, verify the target node
   file exists. Collect unresolved targets as warnings (not hard failures at index
   time — validate catches them; index reports them).
4. **Write the global graph record.** Write `graph/graph-record.json` with the
   shape:

   ```json
   {
     "generated": "<ISO timestamp>",
     "node_count": <int>,
     "edge_count": <int>,
     "nodes": { "<id>": { "primitive", "mode", "title", "status", "edges" } },
     "edges": [{ "from", "to", "type" }, ...]
   }
   ```

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
| `validator` | sonnet | Mechanical: reads frontmatter, checks required fields, resolves edge targets. The judgment pass (item g) is also routed sonnet — it is lighter judgment than synthesis. |

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

---

## Cross-references

- **Agents** (subagent contracts dispatched by this skill):
  - `agents/researcher.md` — Phase 1 in `new` and `amend`; gathers source-material,
    writes research-report.
  - `agents/translator.md` — Phase 2 in `new` and `amend`; synthesises canonical
    node file from research-report.
  - `agents/validator.md` (validate mode only) — mechanical + judgment checks per
    the 02-graph-spec schema.

- **References** (authoring-facing shape docs):
  - `references/node-schema.md` — terse summary of the 02 node schema and edge
    taxonomy for quick authoring reference.

- **Assets** (templates):
  - `assets/node-template.md` — node file skeleton (graph frontmatter superset +
    stub body with `{{...}}` resolver placeholder).
  - `assets/research-report-template.md` — research-report section skeleton.

- **Specs** (authoritative; these win over this file when they diverge):
  - `handbook/content/02-graph-spec/` — node schema, edge taxonomy, storage.
  - `handbook/content/05-maintenance-skill/` — this skill's spec stub.
  - `handbook/content/07-decomposition/` — node/edge/inline cut rules.
  - `handbook/content/01-concepts/` — vocabulary.
