---
title: Research report for drift-detector
type: research-report
status: complete
authored: 2026-05-31
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: "Backfill: full template structure, external analogues searched table, source inventory, challenge findings, conformance, open questions; 5 sources lifted."
sources_lifted: 5
external_analogue_found: true
external_corpora_searched:
  - "be-civic product harness (bc-handbook-curator drift-detector + what-belongs reference)"
  - "stack-graph factory tooling (sg-handbook-curator drift-detector — in-repo, not external)"
  - "gstack operator skill set (health skill)"
  - "CE (Compound Engineering) reference plugin (ce-doc-review)"
  - "Published best practice: document360.com documentation-drift blog post"
  - "Anthropic Agent Skills docs (platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)"
researcher_adequacy_note: |
  Six corpora were searched: the be-civic product harness (bc-handbook-curator/agents/drift-detector.md
  and its what-belongs filter reference — the mature real-world original this node was derived from);
  the stack-graph factory tooling (sg-handbook-curator/agents/drift-detector.md — in-repo, not an
  external analogue per contract); gstack's /health skill (the operator's own structured scan-and-score
  skill — closest gstack-native pattern); the CE ce-doc-review skill (structured findings schema, tier
  routing, headless/interactive dual-mode, parallel reviewer dispatch); and two web sources (document360
  documentation-drift best-practice, Anthropic Agent Skills overview). Five files were lifted verbatim;
  the sg-handbook-curator instance was also lifted for comparison but is not counted as external. Edges
  were determined from the node's own frontmatter composes-into and references declarations; additional
  can-follow and precedes edges were inferred from the curator cell and specify-stage invocation pattern
  described in the original Decisions section. Confidence in agent/autonomous/generative is high —
  stateless, isolated, returns a digest, applies LLM judgment over the seven triggers. The two goals
  were difficult but valid as outcomes (escape rate, precision); the earns-keep thresholds are specified.
  Challenge findings are specific and sourced from CE and be-civic analogues. Recommendation: proceed
  to translator; open question on forbidden_terms input field is low-priority but worth flagging.
---

# Research report for drift-detector

## Identity

**Candidate id:** `drift-detector`
**Candidate title:** Drift detector

**Scope:** A stateless, read-only agent that scans a bounded set of canon pages for drift and
returns a structured candidate list. It is part of the **curator cell** (D40): invoked by
`handbook-curator` (sweep + raise) and by the `specify` dev-sprint stage (amendment-collision scan).
It reads only pages in its `read_set`, applies the `what-belongs` gate filter before emitting
`missing_content` or `ambiguous` candidates, and returns a structured YAML list without writing
anything or conversing with anyone.

What this node excludes: writing files, updating the canon, opening PRs, conversing with the
operator, persisting state across calls, or expanding the read set beyond what it was given.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Drift is surfaced before it propagates — a reader who would have acted on stale or contradictory canon is warned first. | Drift caught by a scan vs drift later found to have reached a sprint that read the canon (escape rate); share of high-severity candidates that became merged fixes. | Escape rate trends toward zero; if scans never surface drift that the loop later confirms real, the scan is not earning its cost. |
| The candidate list is precise — real drift filtered against the canon gates, not phrasing nits. | Precision (candidates the operator acts on vs dismisses); false-positive rate after the what-belongs filter. | Precision stays high; a detector that floods low-value candidates is retuned or cut. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** The drift-detector is invoked in isolation, operates without the operator in the
loop, applies LLM judgment over the seven drift triggers, and returns a digest rather than a
mutation. This is the autonomous / agent side of the context axis (D24 discriminator). It is
not interactive — it never pauses for operator input. The be-civic analogue and the gstack
health skill both confirm the pattern: a structured read-only scan with a fixed output contract
is an autonomous agent, not a collaborative skill.

**`determinism:`** `generative`

**Rationale:** The agent applies judgment in categorising findings (e.g. is this a phrasing nit
or a real fork? is the missing content inferable?). These judgment steps require the LLM and
cannot be reduced to a deterministic script with fixed inputs and outputs.

## Contract

**Input:**
```yaml
read_set: [<page-slug>, ...]            # the pages to scan — clean slugs
task_summary: <string>                  # 1-3 sentences: what the calling session did
trigger_examples: [<string>, ...]       # optional: moments where drift was suspected
forbidden_terms: [<string>, ...]        # optional: vocabulary the harness has declared off-canon
```

The agent resolves each slug via its `handbook` reference (harness-overlay-bound to the product's
canon root + page index). It reads only the resolved pages — no sibling expansion.

**Output:**
```yaml
candidates:
  - page: <page-slug>
    issue: contradictory | stale | drift_from_canonical | missing_content | ambiguous | broken_xref | gap_surfaced
    location: <section anchor or quoted line>
    evidence: <one sentence — what suggests this drift>
    severity: low | medium | high
    proposed_fix: <one sentence>
no_drift_found: <boolean>
notes: <anything the dispatcher should know>
```

The agent anchors every candidate to concrete evidence. If no candidate survives the gate filter,
it returns `no_drift_found: true` with an empty list. Unresolvable slugs emit `broken_xref`
candidates; malformed pages are flagged in `notes`.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| be-civic product harness (`bc-handbook-curator/agents/`) | Real operational drift-detector subagent: input/output contract, trigger set, filter step, failure modes | yes — bc-handbook-curator drift-detector | `bc-handbook-curator-drift-detector.md` |
| be-civic product harness (`bc-handbook-curator/references/`) | What-belongs gate filter: the strict filter applied before emitting missing_content / ambiguous | yes — bc-what-belongs.md | `bc-what-belongs.md` |
| stack-graph factory tooling (`tooling/sg-handbook-curator/agents/`) | In-repo drift-detector: generalised from be-civic; direct textual ancestor of the canonical node | yes (in-repo, not external) | `sg-handbook-curator-drift-detector.md` (comparison only) |
| gstack operator skill set (`~/.claude/skills/gstack/health/SKILL.md`) | Read-only structured scan skill: scoring, structured output, trend tracking, read-only gate | yes — structured scan-and-score pattern | `gstack-health-SKILL.md` |
| CE reference plugin (`ce-doc-review/SKILL.md`) | Document review skill: findings schema with tier routing, headless/interactive modes, parallel reviewer dispatch, round-to-round suppression | yes — findings tier routing, headless mode, decision primer | `ce-doc-review-SKILL.md` |
| Published best practice (document360.com) | Documentation drift detection: trigger taxonomy, severity indicators, governance patterns, freshness scoring | yes — severity taxonomy, governance path | not lifted verbatim (web source; summary in Challenge findings) |
| Anthropic Agent Skills docs (platform.claude.com) | Stateless agent patterns, subagent contracts, skill vs agent discrimination | yes — confirmed autonomous/agent design | not lifted verbatim |

**Primary external analogue:** `bc-handbook-curator-drift-detector.md` (be-civic product harness).
This is the mature real-world original the stack-graph node was derived from.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/bc-handbook-curator-drift-detector.md` | keep | Primary external analogue. Defines the core contract, seven triggers, what-belongs filter step, and failure modes. The stack-graph node generalised this. Key delta: be-civic instance lacks `forbidden_terms` input field; stack-graph node adds it. |
| `source-material/bc-what-belongs.md` | keep | The be-civic what-belongs gate filter (four rules) that the bc-handbook-curator drift-detector applies before emitting candidates. The stack-graph node references its own equivalent; this is the mature original for comparison. |
| `source-material/sg-handbook-curator-drift-detector.md` | keep (in-repo comparison) | Generalised factory instance; the direct textual ancestor of the canonical node. Not an external analogue per researcher contract, but retained for diff against be-civic version. |
| `source-material/gstack-health-SKILL.md` | edge-only | The /health skill is a collaborative skill, not an agent. Confirms read-only gate and structured output as patterns. The scoring / trend-tracking machinery and the step-by-step tool-wrapping are out of scope for the drift-detector. |
| `source-material/ce-doc-review-SKILL.md` | keep (partial) | CE's doc-review is a skill (collaborative), not an agent. The findings schema, tier routing, headless mode, and decision-primer patterns are relevant challenge material for the drift-detector's output contract. The full Phase 0–5 orchestration is a separate concern (skill boundary). |

## Keep / Drop

**Kept (absorbed into body):**
- Seven drift triggers from bc-handbook-curator (contradictory, stale, stale terminology, drift from canonical, missing canonical content, broken cross-references, gap surfaced by work) — the canonical trigger set, carried into the stack-graph node.
- The what-belongs gate filter step before emitting `missing_content` or `ambiguous` candidates.
- The input contract (`read_set`, `task_summary`, `trigger_examples`); the output YAML shape.
- The failure-mode handling: unresolvable slug → `broken_xref`; malformed page → `notes`.

**Dropped (out of scope):**
- Scoring / trend-tracking (gstack health): the drift-detector is a candidate lister, not a scorer.
- Phase orchestration (ce-doc-review): the multi-persona dispatch, round-to-round primer, and auto-apply routing are curator-cell concerns, not the agent's own body.
- PR authoring, queue management, integrate modes (bc-handbook-curator SKILL.md): entirely separate nodes.

**Edge only (separate node):**
- The `what-belongs` reference: already a separate reference node (`references` edge, `load: on-demand`).
- The `handbook` reference: already declared as external, harness-overlay-bound.
- PR-author and queue-checker agents: separate nodes in the curator cell.

## Overlaps and seams

**Invoked by `handbook-curator` (sweep/raise):** The curator cell's sweep/raise mode dispatches the
drift-detector as a subagent. That structural link is the curator's `invokes` edge, not this node's
own edge. The seam: the curator provides the `read_set` and `task_summary`; the drift-detector returns
the candidate list; the curator's pr-author subagent consumes the list to compose PRs.

**Invoked from `specify` (dev-sprint):** The specify stage uses the drift-detector for
amendment-collision scans. The `composes-into dev-sprint @ specify` edge models this.

**`what-belongs` reference:** The agent follows its `what-belongs` reference at the step of need
before emitting `missing_content` / `ambiguous` candidates. This is a `references` edge, `load: on-demand`.

**`handbook` reference:** The agent resolves slugs via its `handbook` reference (external; harness-overlay-bound). This is a `references` edge, `load: on-demand`, `external: true`.

## Fit

The drift-detector belongs as a single node. It owns its own branching (the trigger loop, the gate
filter, the failure-mode paths) and earns two distinct measurable goals (escape rate, precision).
It could theoretically be split into "slug resolver" + "drift scanner" sub-parts, but neither
sub-part earns its own goal independently — the scanner is meaningless without the resolver, and
the resolver produces no value without the scanner. Single-node fit is confirmed.

The existing primitive/mode/determinism decisions (agent / autonomous / generative) are correct
per the decomposition discriminator and are confirmed by the analogues.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| `composes-into` | `dev-sprint` (stage: specify) | The specify stage invokes the drift-detector for amendment-collision scans |
| `references` | `handbook` (`load: on-demand`, `external: true`) | Agent resolves slugs via the harness-overlay-bound handbook locator |
| `references` | `what-belongs` (`load: on-demand`) | Gate filter applied before emitting `missing_content` / `ambiguous` candidates |
| `can-follow` | `handbook-curator` | Invoked at the tail of a curator sweep/raise; may follow any curator dispatch |

Note: The `invokes` edge from `handbook-curator` → `drift-detector` is owned by the
`handbook-curator` node, not declared here. The drift-detector does not invoke other nodes.

## Conformance

**`primitive:` ↔ `mode:` agreement:** Confirmed. `primitive: agent` ↔ `mode: autonomous` — the
agent runs in isolation and returns a summary; the mode is autonomous, not collaborative.

**`goals:` as outcomes:** Confirmed. Both goals read as outcomes ("drift is surfaced before it
propagates", "the candidate list is precise") with concrete metrics (escape rate, precision) and
threshold-based earns-keep criteria.

**Edge targets resolvable:**
- `dev-sprint` — node exists.
- `handbook` — declared `external: true`; harness-overlay-bound; no factory file required.
- `what-belongs` — reference node exists at `graph/_refs/what-belongs.md` (expected per the
  node's own frontmatter; validate that the reference file exists in the graph record).

---

## Challenge findings

This section challenges the `drift-detector` node against its real-world analogues (bc-handbook-curator,
gstack health, ce-doc-review) and published documentation-drift best practice. Findings are specific,
sourced, and intended to inform node amendments — not applied automatically.

### CF-1 (medium) — Missing severity scoring; no structured escalation path

**Analogue:** gstack `/health` (source-material/gstack-health-SKILL.md, Steps 3–6); document360 best
practice (severity indicator taxonomy).

**Finding:** The canonical node declares `severity: low | medium | high` on each candidate but
provides no rubric for assigning severity. Both the gstack health skill (a 0–10 scoring rubric with
weight per category and explicit score-to-label mapping) and published documentation-drift practice
(high-impact triggers: incorrect API references, stale procedural workflows; low-impact: style
inconsistencies) define concrete severity criteria. The drift-detector produces a list where severity
is a label with no backing definition — a caller cannot tell whether two invocations by different
operators will produce consistent severity assignments for the same drift.

**Recommendation:** Add a short severity rubric to the node body, or reference a `findings-schema`
reference that defines the rubric. At minimum, distinguish: `high` = contradicts a load-bearing
constraint or breaks cross-reference resolution; `medium` = stale terminology or missing procedure;
`low` = phrasing inconsistency or inferably stale label.

### CF-2 (medium) — No `forbidden_terms` field in be-civic original; the stack-graph generalisation is correct but untested

**Analogue:** be-civic `bc-handbook-curator-drift-detector.md` (source-material/bc-handbook-curator-drift-detector.md).

**Finding:** The be-civic original has no `forbidden_terms` input field — it relies on the `what-belongs`
filter to handle product-specific vocabulary. The stack-graph canonical node adds `forbidden_terms` as
an optional input, which is a useful generalisation (the harness can declare off-canon vocabulary
explicitly). However, the trigger body says "terms the harness has declared off-canon (`forbidden_terms`),
or product-layer vocabulary that does not belong in general canon" — the second leg (implicit product
vocabulary detection) has no mechanism in the be-civic original. This means the stack-graph node
promises a detection capability (implicit product-vocabulary drift) that the real analogue does not
implement, and provides no guidance on how the agent should detect it without an explicit list.

**Recommendation:** Either constrain `stale_terminology` detection to `forbidden_terms` only (when
provided) plus the `what-belongs` filter, or add explicit guidance in the node body for how the agent
should identify product-layer vocabulary without an explicit list.

### CF-3 (high) — No round-to-round suppression or decision primer; repeated calls re-surface resolved candidates

**Analogue:** ce-doc-review `ce-doc-review-SKILL.md` (source-material/ce-doc-review-SKILL.md, Phase 2
"Decision primer" section).

**Finding:** CE's document reviewer maintains a cross-round decision primer: it accumulates the
operator's applied/rejected decisions from previous rounds and passes them to the next round's agents
so they do not re-surface already-resolved findings. The drift-detector has no equivalent. In a
session where the curator invokes the drift-detector multiple times (e.g. sweep + raise + post-fix
verification), the agent will re-emit the same candidates each time if the page has not yet been
committed to the handbook. This creates noise and erodes operator trust in precision — exactly the
metric the node's second goal guards.

**Recommendation:** Add a `resolved_candidates` optional input field (list of `{page, issue, location}`
tuples representing candidates the operator has already actioned), and instruct the agent to suppress
re-emission of any candidate that matches a resolved entry. This mirrors the CE decision-primer pattern
without requiring a stateful agent.

### CF-4 (low) — Headless vs interactive mode not distinguished; callers cannot request a machine-readable-only output

**Analogue:** ce-doc-review `ce-doc-review-SKILL.md` (source-material/ce-doc-review-SKILL.md, Phase 0:
headless mode).

**Finding:** CE's doc-review distinguishes `mode:headless` (structured return for programmatic callers)
from interactive mode (routing questions, walk-through). The drift-detector's output is always the
structured YAML block — which is good — but the node does not declare this explicitly. A programmatic
caller (the specify stage, an automated sweep) cannot distinguish "the agent returned no candidates"
from "the agent errored out and produced no output" without checking `no_drift_found`. The output
contract does not document how errors surface beyond the `notes` field.

**Recommendation:** Add a top-level `error` field to the output contract for hard failures (malformed
page, index unavailable), distinct from `notes` (soft observations). This is the standard established
by the be-civic analogue's failure-mode section (`return error: malformed page <slug>`) but is not
carried into the canonical node's output YAML schema.

### CF-5 (medium) — No trigger for "page read-when metadata is stale/missing" — a real maintenance surface

**Analogue:** be-civic `bc-handbook-curator-drift-detector.md` trigger set; be-civic `bc-what-belongs.md`
§ "Symmetric scope" (rule 4); sg-handbook-curator what-belongs §5.

**Finding:** The be-civic what-belongs reference (rule 4, Symmetric scope) specifies: "If reading
reveals the page's `read-when:` should have surfaced it earlier, amend `read-when:` in the same PR."
This implies a real drift trigger: pages where the `read-when:` field is absent, stale, or so generic
that it fails to route the right sessions to the right page. Neither the canonical drift-detector
body nor the be-civic drift-detector agent lists `read-when` metadata staleness as a trigger — yet
it is a documented failure mode in the curator's own design. The seven triggers cover content drift
but not discoverability drift (metadata that routes agents to pages).

**Recommendation:** Add an eighth trigger or sub-trigger: `stale_read-when` — the page's `read-when`
frontmatter field is absent, too broad (matches every session), or inconsistent with the page's
actual content scope. This is a real gap confirmed by the be-civic what-belongs reference.

### CF-6 (low) — No freshness-staleness signal; the node relies entirely on content comparison, not age

**Analogue:** Published best practice (document360.com, "documentation freshness score based on last
update date, code commits, and broken link checks"); atlan.com staleness scoring (last-verified
timestamps, owner-confirmation dates, age thresholds by content type).

**Finding:** The drift-detector is a pure content-comparison scanner. It has no concept of page age,
last-verified timestamp, or ownership. Real-world documentation drift tools combine content signals
with metadata signals: a page that was last updated 18 months ago is a drift candidate even if no
contradiction is detectable yet. The canonical node does not include a `page_age` or `last_verified`
input field, and the seven triggers do not include "page has not been reviewed in N cycles."

**Assessment:** This gap is honest and likely intentional — the node operates on the pages it is
given and applies content-level judgment, which is appropriate for a generative agent. Age-based
staleness is better implemented as a metadata filter upstream of the drift-detector (the curator
cell decides which pages to include in `read_set`). Record this as a confirmed architectural choice,
not a defect.

**Recommendation:** Document this explicitly in the node body as a scope boundary: "Age-based
staleness is not a trigger here — the caller (curator sweep or specify stage) decides which pages
merit scanning and populates `read_set`." This prevents callers from expecting freshness scoring
from the agent.

---

## Open questions

- **OQ-1:** The `what-belongs` reference node — does `graph/_refs/what-belongs.md` exist in the
  current graph record? The node's frontmatter declares a `references` edge to it; validate that
  the file is present before the translator builds the canonical output.
- **OQ-2:** The `can-follow: handbook-curator` edge — `handbook-curator` is the sg-handbook-curator
  skill (the curator cell's dispatcher). Confirm whether this edge should point to
  `sg-handbook-curator` (the dispatcher/skill) or to a separate curator-cell arc node. The curator
  cell does not yet have a dedicated arc node in the graph record.
- **OQ-3 (from CF-3):** Should `resolved_candidates` be added to the input contract now (to match
  CE's decision-primer pattern) or deferred until the curator cell has a multi-round sweep mode?
  Currently the specify-stage invocation is single-round; multi-round suppression only becomes
  load-bearing when the curator cell gains a sweep mode.
- **OQ-4 (from CF-5):** Should the `stale_read-when` trigger be added to the node body as trigger
  eight, or modelled as a separate scan step in the curator cell (since it is a metadata check,
  not a content check)? Architectural call for the operator.
