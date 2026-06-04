---
title: Research report for log-decision
type: research-report
status: complete
authored: 2026-06-01
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: External-analogue backfill — full search across gstack skills, CE plugin, be-civic, and published best practice; ADR pattern lifted; challenge findings added; all template sections filled.
sources_lifted: 4
external_analogue_found: true
external_corpora_searched:
  - gstack live skills (retro, context-save, document-release, plan-ceo-review, plan-eng-review, land-and-deploy, autoplan, design-review, investigate)
  - CE plugin skills (ce-sessions, ce-strategy, ce-work, ce-brainstorm, ce-commit, ce-doc-review, ce-release-notes, ce-resolve-pr-feedback)
  - be-civic operational harness (bc-operations/playbooks, bc-workspace, be-civic-plugin-dev)
  - Published best practice — Nygard 2011 ADR (Cognitect)
  - Published best practice — Pocock grill-with-docs ADR-FORMAT.md (mattpocock/skills)
  - Published best practice — AWS Prescriptive Guidance ADR process
  - Martin Fowler ArchitectureDecisionRecord bliki
researcher_adequacy_note: |
  External corpora searched: gstack skills (84 skills — retro, context-save, land-and-deploy,
  plan-ceo-review, plan-eng-review, document-release, autoplan, design-review, investigate,
  plus grep across the full tree); CE plugin (all 36 skills); be-civic (bc-operations playbooks,
  sprint-cycle, bc-workspace, be-civic-plugin-dev, JUDGMENT-CALLS schema). For published best
  practice, fetched Nygard 2011 (Cognitect), Matt Pocock's grill-with-docs ADR-FORMAT.md from
  mattpocock/skills (the canonical Claude Code .claude-skill ADR counterpart), AWS Prescriptive
  Guidance ADR process, and Martin Fowler's ADR bliki. Four files lifted verbatim into
  source-material/: Nygard 2011 (primary ADR canonical), Pocock ADR-FORMAT (strongest .claude
  counterpart), AWS Prescriptive Guidance (lifecycle/review model), be-civic sprint-cycle retro
  (operational harness consuming context). The ADR pattern is the clear external analogue for the
  decision-conclusion layer; no exact two-layer write analogue (conclusion + gbrain reasoning) was
  found in any searched corpus, which is a meaningful finding. Primitive/mode (agent/autonomous/
  deterministic) is confirmed correct by comparison — ADR tools in the wild are either CLI scripts
  or inline mechanics, not collaborative skills. Goals as outcomes were clear from the original
  node. Edges: the existing declaration (leaf agent, gbrain inline, decisions-store on-demand) is
  confirmed. Challenge findings are the core new value: the node omits the Nygard Consequences
  section, the Pocock three-gate filter, the status lifecycle, and supersession semantics — all
  well-established ADR best practice. Recommendation: proceed to translator with challenge findings
  as input for node body strengthening.
---

# Research report for log-decision

## Identity

**Candidate id:** log-decision

**Candidate title:** Log decision

**Scope:** A small, mechanical autonomous agent — the third node in the debrief fleet and the
one shared across the widest span of the arc. Invoked by `design`, `reconcile`, and `debrief`.
Performs a two-layer write: the **conclusion** (settled decision, rationale, rejected alternatives,
status) lands in `docs/decisions.md` (the curated decisions store, D11); the **surrounding
reasoning** (options considered, evidence, open questions, transcript context) goes to gbrain (the
recall substrate, D31). Returns a write-receipt; is fully prompt-describable; has no live-thread
benefit (the D24 axis). Not a crystallization node.

The task brief specifies: do **not** amend `design` now — `design` already has a `log-decision`
invocation implied in the graph-map; this node's file declares its own outward edges, not the
inbound edges from its callers.

## Sources (original)

1. `docs/graph-map.md` — canonical description: "two-layer write — conclusion →
   `docs/decisions.md`, reasoning → gbrain (D11/D31); a small **agent** (mechanical, fully
   prompt-describable, no live-thread benefit per the D24 axis); **not** a crystallization node";
   consumed by `design`, `reconcile`, `debrief`.
2. `docs/decisions.md` — D11 (two-layer decisions store), D31 (gbrain as recall substrate:
   write path, capability-gating, fallback to `docs/decisions.md` + Grep if gbrain absent,
   locality constraint from D17).

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Every significant decision made in a sprint is durably recorded in both layers — conclusion in `docs/decisions.md`, reasoning in gbrain — before the sprint closes. | decisions logged per sprint (count); layer-completeness rate (both layers written vs one layer silently skipped); decisions later found to be unlogged (escape rate, sampled at reconcile). | Escape rate trends toward zero; silent layer-skips are treated as failures, not acceptable degraded states. |
| The conclusion is self-contained enough to decide from — a future operator can act on `docs/decisions.md` alone without needing the recall layer. | Share of logged conclusions that are reopened due to missing rationale (operator asking "why was this decided?"); round-trip queries to gbrain for context that should have been in the conclusion. | Reopened conclusions trend toward zero; if gbrain recall is routinely needed for every logged conclusion, the conclusion quality is insufficient. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** The write is mechanical: format the conclusion, append to `docs/decisions.md`,
write reasoning to gbrain. No synthesis, no judgment. Per the D24 axis: fully describable in a
spawn prompt, no benefit from the live thread. Autonomous agents return a summary (the write-
receipt). Collaborative skills live in the current context — irrelevant here.

**`determinism:`** `deterministic`

**Rationale:** Given the spawn-bundle inputs, the output is fully determined: format the
conclusion, append to a specific path, call a specific MCP method with structured data, return
the receipt. No generative judgment is exercised.

## Contract

**Input (spawn bundle):**

```yaml
decision_id: <string>                  # e.g. "D47" or a slug; caller assigns
conclusion: <string>                   # the settled decision, in full
rationale: <string>                    # why this and not the alternatives
rejected_alternatives: [<string>, ...] # what was considered and set aside
status: accepted | provisional | supersedes:<prior-id>
evidence_refs: [<path-or-url>, ...]    # optional; files / URLs that ground the decision
open_questions: [<string>, ...] | null # parked questions; goes to reasoning only
reasoning_context: <string> | null     # surrounding transcript / discussion context
source_node: design | reconcile | debrief
sprint_id: <string>
decisions_store_path: <path>           # path to docs/decisions.md in the current workspace
```

**Output (write-receipt):**

```yaml
decision_id: <string>
conclusion_written: true | false
conclusion_path: <path>
reasoning_written: true | false
reasoning_destination: gbrain | decisions_store_fallback
gbrain_key: <string> | null
warnings: [<string>, ...]              # e.g. "gbrain unavailable — fallback applied"
```

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| gstack live skills (84 skills) | skills that write, log, or record decisions; any "decision" + "record/log/append" pairing; `decisions.md` references | No direct analogue — `context-save` captures decisions made in session notes but does not perform a structured two-layer write; `retro` surfaces past decisions but does not log them | — |
| CE plugin skills (36 skills) | `decisions.md`, `decision.*log`, `ADR`, `architectural.*decision`, `record.*decision`; ce-sessions, ce-strategy, ce-work, ce-brainstorm, ce-commit, ce-doc-review | No direct analogue — ce-brainstorm emits a `## Key Decisions` section in brainstorm docs; ce-doc-review tracks per-finding decisions (Apply/Skip/Defer); neither is a structured durable-log writer | — |
| be-civic operational harness (bc-operations, bc-workspace, be-civic-plugin-dev) | decisions file, ADR, decision-logging primitive, JUDGMENT-CALLS | Partial analogue — bc-operations/playbooks/sprint-cycle.md has a "decisions locked at sprint open" subsection and a retro-capture step at sprint close; JUDGMENT-CALLS.md records schema judgment calls as a flat document. No dedicated decision-logging agent exists — decisions are embedded in sprint files | yes — sprint-cycle retro excerpt |
| Published best practice — Nygard 2011 ADR (Cognitect blog) | ADR format, rationale for decision records, what sections to include | **Yes — primary analogue.** ADR pattern: Title + Context + Decision + Status + Consequences. Strongest external counterpart for the conclusion-layer write. | yes — nygard-2011.md |
| Published best practice — Pocock grill-with-docs ADR-FORMAT.md (mattpocock/skills, Claude Code) | ADR format embedded in a .claude skill; three-gate discipline; when not to write an ADR | **Yes — strongest .claude-native analogue.** Three-gate discipline (hard-to-reverse, surprising-without-context, result-of-trade-off); minimal single-paragraph template; optional sections (status, considered-options, consequences). Lives inside a .claude skill tree. | yes — mattpocock-grill-with-docs-ADR-FORMAT.md |
| Published best practice — AWS Prescriptive Guidance ADR process | ADR lifecycle, review workflow, immutability, decision log | **Yes — lifecycle model.** Proposed → Accepted → Superseded; immutability after acceptance; decision log as queryable collection. | yes — aws-prescriptive-guidance-adr-process.md |
| Martin Fowler ArchitectureDecisionRecord bliki | ADR best practices, inverted-pyramid structure, status management | Corroborating — confirms accepted ADRs are never reopened (superseded instead); inverted-pyramid (conclusion first); confidence level as optional field. Not lifted separately (content covered by Nygard + AWS). | — |

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/nygard-2011-documenting-architecture-decisions.md` | keep | Primary ADR canonical — five-section template (Title, Context, Decision, Status, Consequences); the Consequences section is the key gap in the current node. |
| `source-material/mattpocock-grill-with-docs-ADR-FORMAT.md` | keep | Strongest .claude-native analogue — three-gate discipline + minimal format. The three-gate filter (when NOT to write an ADR) is completely absent from the current node and is a challenge finding. |
| `source-material/aws-prescriptive-guidance-adr-process.md` | keep | Lifecycle model — Proposed/Accepted/Superseded states, immutability, decision log as queryable collection. The `supersedes:<prior-id>` field in the spawn bundle is consistent with this but the node does not enforce immutability of past entries. |
| `source-material/becivic-bc-operations-sprint-cycle-retro.md` | edge-only | The be-civic harness embeds decision capture in sprint files, not a dedicated agent. Confirms the absence of a counterpart primitive in the consuming harness, validating that `log-decision` fills a real gap. Not absorbed into body. |

## Keep / Drop

**Kept (absorbed into body):**
- Two-layer write contract (conclusion to `docs/decisions.md`, reasoning to gbrain) — unique to this design; no external analogue writes to two distinct destinations.
- Graceful fallback on gbrain unavailability — no ADR tool handles this; specific to the gbrain-substrate dependency.
- Write-receipt output — no ADR tool returns a structured receipt; this is an improvement over ADR practice.
- spawn-bundle contract fields: `decision_id`, `conclusion`, `rationale`, `rejected_alternatives`, `status`, `evidence_refs`, `open_questions`, `reasoning_context`, `source_node`, `sprint_id`.
- Hard limits (no reordering existing entries; no silent layer-skips; no assessment of correctness).

**Dropped (out of scope):**
- ADR review / approval workflow (Proposed → Accepted requires team review): `log-decision` is a mechanical writer, not a decision-making or review node. The caller has already decided; this node records. Review is the calling node's job.
- ADR as a separate file per decision (Nygard's `adr-NNN.md` pattern): the node uses a append-to-shared-log model (`docs/decisions.md`), not per-decision files. This is a deliberate design difference, not a gap.
- Three-gate admission filter: the node has no gate for *whether* to log — it is always invoked after the decision is settled by the caller. The gate lives in the caller, not here. (However, this is a challenge finding — the node's body does not acknowledge this split responsibility.)

**Edge only (separate node):**
- Decision-store reference (`decisions-store`): should be a `references` edge (not yet authored — F7 prose until `_refs/` file exists).

## Overlaps and seams

- **`design`** (caller): owns the gate for whether a decision is significant enough to log. `design` invokes `log-decision` via `invokes` edge.
- **`reconcile`** (caller): same relationship as `design`.
- **`debrief`** (caller): same; `log-decision` is the third node in the debrief fleet.
- **`decisions-store` reference**: the write target. Not yet authored; declared as F7 prose in the node. The reference edge is `references: [{ id: decisions-store, load: on-demand }]`.
- **gbrain MCP** (`mcp__gbrain__put`): inline call, not a graph edge (per non-nodes table).
- No `composes-into` arc declared (leaf agent; the arc composition is owned by the callers' `composes-into` edges to the sprint arc).

## Fit

This node belongs as a single node. It owns exactly one goal (durable two-layer write of a settled decision) with a measurable outcome. It has no internal branching that would earn a separate goal. The fallback branch (gbrain unavailable → append to `docs/decisions.md`) is a conditional path within the same goal, not a separate node.

Splitting into `log-conclusion` + `log-reasoning` would over-decompose: the two layers are a single atomic unit (the write-receipt covers both; either layer absent is a failure). The 07-decomposition principle applies: split only when sub-parts earn their own measurable goals.

## Decisions

- **primitive: agent, mode: autonomous, determinism: deterministic.** Writing is mechanical: format the conclusion, append to `docs/decisions.md`, write reasoning to gbrain. No synthesis, no synthesis judgment. The D24 axis: fully describable in a spawn prompt, no benefit from the live thread.
- **Two-layer write with graceful fallback (D31).** Conclusion always goes to `docs/decisions.md`. Reasoning goes to gbrain if available; falls back to a structured comment appended under the conclusion in `docs/decisions.md` when gbrain is absent. The agent must **never silently skip a layer** — if gbrain is unavailable, note it in the write-receipt.
- **Edges.** `references decisions-store (on-demand)` — the write target (pending; `_refs/` file not yet authored → F7 prose). Gbrain is an inline MCP call (`mcp__gbrain__put`), not a graph edge (per graph-map non-nodes table: `gbrain` is inline MCP). No `composes-into` (leaf agent). No `invokes`. The inbound `invokes` edges are owned by the callers (`design`, `reconcile`, `debrief`); this node does not re-declare them.
- **Not a crystallization node.** `log-decision` produces a write to a general-purpose shared home (`docs/decisions.md` + gbrain), not a product-specific harness-local manifest. It does not read its own output on re-run to decide what is new; each call is a fresh atomic write. Crystallization is D35 — inapplicable here.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | decisions-store (`load: on-demand`) | The write target for the conclusion layer. On-demand because the agent reads the file to find the correct append section before writing, then closes it. Not imported at load time. (Pending authoring of `graph/_refs/decisions-store.md` — F7 prose in the node until then.) |

No other outbound edges. Leaf agent: no `invokes`, no `composes-into`, no `loads`. Gbrain is inline (`mcp__gbrain__put`), not an edge.

## Conformance

**`primitive:`↔`mode:` agreement:** `agent` (autonomous) — confirmed. Mechanical write agent; isolated context; returns a summary (the write-receipt). Agrees with the 02-graph-spec table (autonomous → agent).

**`goals:` as outcomes:** Confirmed. Both goals state what is achieved (durable two-layer record; self-contained conclusion), not what the node does. Metrics are measurable (escape rate, reopened-conclusion rate).

**Edge targets resolvable:** `decisions-store` reference not yet authored — F7 prose acknowledged in the node. No other unresolved targets.

## Challenge findings

The following are gaps or weaknesses in the current `log-decision` node when measured against
its real-world analogues (Nygard ADR, Pocock ADR-FORMAT, AWS Prescriptive Guidance).

### C1 — Missing Consequences section (HIGH)

**ADR analogue:** Nygard's canonical ADR has five sections: Title, Context, Decision, Status,
**Consequences**. The Consequences section records "all consequences, not just positive ones —
positive, negative, and neutral." Martin Fowler corroborates: consequences include confidence
level and non-obvious downstream effects.

**Gap in log-decision:** The spawn bundle and conclusion format omit consequences entirely. The
conclusion format is: `what was decided, why, what was rejected, status`. There is no field for
"what does this decision lead to" — the downstream effects that new team members need to understand
the full impact.

**Impact:** A decision record without consequences is incomplete by ADR best practice. A future
operator reading `docs/decisions.md` knows what was decided and why, but not what the decision
entails downstream. This reduces the self-contained value of the conclusion layer.

**Recommendation:** Add an optional `consequences: [<string>, ...] | null` field to the spawn
bundle. Include consequences in the formatted conclusion entry.

---

### C2 — No trigger filter (who decides what is loggable) is defined in the node (MEDIUM)

**ADR analogue:** Pocock's three-gate discipline: a decision warrants logging only when it is
(1) hard to reverse, (2) surprising without context, and (3) the result of a real trade-off. AWS
Prescriptive Guidance: "architecturally significant decisions" only. The ADR pattern is
deliberately **selective** — not every decision gets a record; only consequential, reversible-at-
cost, context-sensitive ones.

**Gap in log-decision:** The node declares `when-to-use: "A significant decision has been made"`,
but does not define what makes a decision significant. The assessment of significance is delegated
to the caller (`design`, `reconcile`, `debrief`), but this split responsibility is **nowhere
documented** in the node body. A reader of the node body cannot tell: is the caller always
expected to filter, or does `log-decision` log everything it is called with?

**Impact:** Without the filter being explicitly named as the caller's responsibility, the node
description is incomplete. Callers may over-log (every minor choice) or the body may be read as
implying the node itself should assess significance — which contradicts its mechanical, no-judgment
design.

**Recommendation:** Add a one-sentence note in the node body: "The decision to invoke this agent
rests with the caller — `log-decision` accepts any settled decision presented to it and records
without assessment." This makes the split explicit. Optionally, cross-reference the Pocock three-
gate discipline as the caller's expected filter.

---

### C3 — Status lifecycle is incomplete — no supersession semantics (MEDIUM)

**ADR analogue:** Nygard's ADR defines `status: proposed | accepted | deprecated | superseded`
with explicit guidance: "if a later ADR changes or reverses a decision, it may be marked as
superseded with a reference to its replacement." AWS Prescriptive Guidance formalises this: ADRs
become **immutable** once accepted; a new ADR supersedes the old one; the old entry is retained
but marked.

**Gap in log-decision:** The spawn bundle has `status: accepted | provisional |
supersedes:<prior-id>`, which is a reasonable start. However, the node body does not define
what "supersedes:<prior-id>" requires the agent to do: find the prior entry in `docs/decisions.md`
and mark it? Append a forward-pointer in the prior entry? Leave the prior entry unmarked? The
contract is silent on this.

**Impact:** The `supersedes:` status value is declared but not operationalised. If two decisions
are logged — the original and a superseding one — and no back-reference is written into the
original entry, the `docs/decisions.md` log is inconsistent: the old decision still reads as
active when a reader encounters it out of sequence.

**Recommendation:** Define the `supersedes:<prior-id>` procedure: when `status:
supersedes:<prior-id>`, the agent must (a) find the prior entry by `decision_id` in
`docs/decisions.md` and (b) append a `Superseded by: <new-id>` inline note to it, or (c)
explicitly state it does not back-annotate and why (e.g., append-only invariant).

---

### C4 — No `consequences` in gbrain reasoning either (LOW)

**ADR analogue:** The Nygard Consequences section captures both the intended positive effects and
the known negative ones. Downstream architectural effects are often the reason a decision matters.

**Gap in log-decision:** The gbrain reasoning record (`mcp__gbrain__put` content) includes
Context, Evidence, and Open questions — but no consequences. The reasoning layer is the natural
place to store the fuller downstream picture, yet the spawn bundle has no `consequences` field at
all (see C1).

**Impact:** Combined with C1, there is no capture path for decision consequences anywhere in the
two-layer write. For a decision like "we will use gbrain as the reasoning substrate" the
consequences ("requires gbrain to be running; fall back reduces recall quality; adds a network
call per logged decision") are meaningful for future maintainers.

**Recommendation:** Add `consequences: [<string>, ...] | null` to the spawn bundle. In the
conclusion layer: include consequences in the formatted entry when non-null (optional section, not
mandatory). In the gbrain reasoning layer: include consequences in the structured content block.

---

### C5 — No querying or cross-referencing model for `docs/decisions.md` (LOW)

**ADR analogue:** AWS Prescriptive Guidance describes the decision log as a collection that
project members "skim the headlines of each ADR to get an overview of the project context" and
"dive deep into project implementations." The decision log is not just an append-only list — it
is a queryable index. ADR tools (adr-tools, Log4brains, etc.) generate a decision log index.

**Gap in log-decision:** The node defines `docs/decisions.md` as a destination for appends but
says nothing about its structure for query. Is it a flat append log? Does it have sections? Is
there an index entry or table of contents at the top? The two goals focus on completeness and
self-containedness but not on **findability** of past decisions.

**Impact:** If `docs/decisions.md` grows to 50+ decisions, there is no mechanism for a caller
to check whether a decision already exists before logging a new one. The node already prohibits
reordering, but no lookup mechanism is defined.

**Recommendation:** This is a scope gap in the referenced `decisions-store` reference (not yet
authored). The `decisions-store` reference should define the file structure (sectioned or flat,
index entry format). A follow-on open question for the translator: does the caller check for
prior `decision_id` before invoking, or does the agent check on write?

---

### C6 — Unsupported claim: "conclusion stands alone" without verification step (LOW)

**Claim in node:** "Keep it self-contained: a reader with no access to gbrain must be able to
understand and act on the conclusion. Do not reference 'see gbrain for context' — the conclusion
stands alone."

**ADR best practice:** Both Nygard and Fowler make the same goal — records should be self-
contained — but neither says the writer can verify self-containedness at write time. Fowler:
"inverted pyramid — critical information first, supporting details in the second half." The check
is done by a reader, not the writer.

**Gap in log-decision:** The node asserts the conclusion "stands alone" as a procedure step but
provides no verification mechanism. The agent is instructed to format the conclusion, but there is
no step that checks whether the conclusion actually meets the self-contained criterion. The metric
for this goal (reopened conclusions) is retrospective.

**Impact:** This is minor — the intent is correct and the retroactive metric is appropriate. But
the node could be clearer: the instruction is a formatting goal, not a verifiable step.

**Recommendation:** Reframe as a formatting constraint: "Format the conclusion so that a reader
with no access to gbrain can understand and act on it." Keep the metric as the earns-keep signal.

## Open questions

- **`decisions-store` reference:** Not yet authored (`_refs/` absent, F7 prose). Should define file structure (flat append-log vs sectioned, index entry format, per-decision-id anchor). Until authored, the node's query/lookup model is underspecified. Operator review needed before the node can be considered fully specified.

- **`supersedes:<prior-id>` procedure:** Should the agent back-annotate the prior entry in `docs/decisions.md`? If yes, this violates the "do not reorder or edit existing entries" hard limit. If no, the log is inconsistent. Resolution: either (a) define back-annotation as a targeted `<!-- superseded by <id> -->` append-in-place (not reordering), or (b) accept forward-only records and let the decisions-store reference define how supersession is expressed. Operator input needed.

- **Consequences field:** Translator should decide whether to add `consequences` to the spawn bundle. ADR best practice (Nygard, Pocock, AWS) strongly suggests it; the node currently omits it. The cost is one more optional field; the gain is a complete record.

- **Caller-filter documentation:** The three-gate discipline (Pocock) belongs in the caller nodes (`design`, `reconcile`, `debrief`), not here. Confirm the callers will document this explicitly so the split responsibility is traceable from both sides.

## Amendment applied — cluster-E batch (2026-06-04)

The reconciliation (`docs/research-backfill-reconciliation.md` §E) verdicts C1/C2/C3 as **APPLY**
and the now-authored `_refs/decisions-store.md` resolves the open questions above. Re-rendered the
canonical to **v0.2.0**:

- **Edge wired.** `references: [{ id: decisions-store, load: import }]` replaces the F7-prose
  comment — `decisions-store.md` exists. `import` (not on-demand) mirrors `harness-init ↔
  bindings-contract`: the agent writes *against* this contract every run, so the entry shape +
  supersede-in-place rule + single-writer guarantee are guaranteed-present, not read-when.
- **C1 + C4 — consequences.** Added optional `consequences: [<string>,…] | null` to the spawn
  bundle, emitted in **both** layers (the conclusion entry when non-null, and the gbrain reasoning
  block). Resolves the "no capture path for consequences" gap in one field.
- **C2 — caller owns significance.** Added a body sentence: the decision to invoke rests with the
  caller (`design`/`reconcile`/`debrief`); `log-decision` records any settled decision without
  assessing significance. (The Pocock three-gate filter lives in the callers, not here — per the
  report's own open question.)
- **C3 — supersession operationalised** via **option (a)**: on `status: supersedes:<prior-id>`,
  append a targeted `Superseded by: <new-id>` note **in place** to the prior entry. This is the
  store's documented supersede-in-place convention (`decisions-store.md` §"Supersede in place"), an
  in-place annotation, **not** a reorder — so the hard limit is refined from "do not reorder or edit"
  to "do not reorder; the only permitted edit to a prior entry is this back-annotation."
- **C5/C6 (LOW)** left as-is: C5's query/index model belongs to `decisions-store` (it now names the
  entry shape; a full index is deferred — no lookup need at this scale); C6's self-containedness stays
  a formatting constraint + retrospective metric.
