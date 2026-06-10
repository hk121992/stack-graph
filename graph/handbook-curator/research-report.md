---
title: Research report for handbook-curator
type: research-report
status: complete
authored: 2026-05-31
last_updated: 2026-06-10
amended:
  - date: 2026-06-03
    note: "Backfill — full template populated; source-material lifted (bc-handbook-curator SKILL.md + design doc + what-belongs + bundling-rules + sg-handbook-curator SKILL.md); external analogues section added; challenge findings authored against bc counterpart and Anthropic skill best-practices"
  - date: 2026-06-10
    note: "D68 — integrate mode goes LIVE (was contract-recorded/deferred per D40). Fleet authored: consistency-checker + link-validator agent nodes (invokes edges added) and the integrator-checklist reference (references edge added). The mode body follows the factory's D68 build (11 Codex review rounds): merged-preview worktree for post-merge validation, post-preview candidate-set scoping, re-validation on merge-set/order change, chat-resolved decisions recorded as PR comments pre-merge, post-batch index refresh as the one sanctioned direct commit. Merge-walk gate detail delegated to the integrator-checklist reference. Status v0.1.0 → v0.2.0."
sources_lifted: 5
external_analogue_found: true
external_corpora_searched:
  - "be-civic: bc-operations/bc-skills/bc-handbook-curator (primary — production be-civic instance)"
  - "be-civic: bc-operations/docs/2026-05-26-bc-handbook-curator-design.md (design doc)"
  - "be-civic: bc-operations/bc-skills/bc-handbook-curator/references/ (what-belongs, bundling-rules)"
  - "CE plugin: compound-engineering/skills/ — searched for curator/canon/handbook patterns (none found)"
  - "gstack skills: ~/.claude/skills/gstack/ — searched for curator/canon/drift patterns (document-release closest, not a direct analogue)"
  - "Anthropic platform docs: platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices (fetched)"
  - "ADR best-practice literature: adr.github.io, hidekazu-konishi.com, platformtoolsmith.com, AWS Architecture Blog (web-searched)"
researcher_adequacy_note: |
  The primary external analogue is the production be-civic bc-handbook-curator skill, which is the
  direct model the vendored node was reverse-engineered from. Five files were lifted verbatim: the
  SKILL.md (348 lines, all six live modes), the design doc, what-belongs, bundling-rules, and the
  factory's own sg-handbook-curator for comparison. The CE plugin was searched (grep for
  curator/canon/handbook/drift across all skill SKILL.md files) — ce-doc-review covers multi-persona
  document review, which is a different job; no curator analogue exists there. The gstack skill tree
  was searched similarly — document-release is the nearest gstack analogue (post-ship doc sync) but
  has a fundamentally different trigger model (diff-driven, not drift-driven). Anthropic's skill
  authoring best-practices page was fetched in full and yielded several concrete challenge findings
  around description conciseness, progressive-disclosure depth limits, evaluation-driven iteration,
  and the 500-line SKILL.md ceiling. Edges were determined by tracing what the bc-handbook-curator
  actually invokes at runtime (drift-detector, pr-author, queue-checker) vs what it consults
  (what-belongs, pr-description-shape, bundling-rules). The primitive:skill / mode:collaborative /
  determinism:generative classification is high-confidence — the operator-facing dispatcher model
  (operator selects mode, skill executes, returns PR URL) is exactly the collaborative / main-thread
  pattern. Recommendation: proceed to translator; the challenge findings below surface four
  addressable gaps that should be resolved before the node is considered spec-stable.
---

# Research report for handbook-curator

## Identity

**Candidate id:** `handbook-curator`
**Candidate title:** Handbook curator

**Scope:** The operator-facing dispatcher for canon maintenance: maintains the curated-canon home
(handbook + decisions) via the `raise → queue → integrate` loop. Modes — `sweep` (scan for drift,
report only), `raise` (author a labelled PR for an amendment, with duplicate detection), `queue`
(read-only list of open PRs + collisions), `refresh-index` (regenerate the page index), `integrate`
(batch-merge cadence — contract recorded, implementation deferred).

This is the **vendored, general** curator: a harness points it at its own canon repo/handbook via
overlay (never hardcoded). The same body serves the factory loop (canon = the factory) and a
harness loop (canon = the product). It is the sole write path to curated canon: all durable findings
from other nodes arrive here as a `raise` call and wait in the queue for `integrate`.

**Excludes:** context-loading (readers navigate canon directly via its page index); audit logging
(PRs + git history are the record); mid-mode operator questions (decisions go in the PR description);
anything from the consuming harness's domain.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| Curated canon stays free of drift and contradiction — stale or conflicting content does not survive to a session that reads it and acts on it. | Drift escape rate (instances where a later session confirms stale content that a curator pass covered); time-to-correction from first detection to merge. | Escape rate trends down; canon a sprint relies on is trustworthy without re-verification. |
| A proposed durable finding reaches canon through one gated path (raise → queue → integrate), never a bespoke side-store. | Share of canon changes that landed via the curator vs edits made out-of-band; proposals from nodes (e.g. explore) that became merged amendments. | Out-of-band canon edits trend toward zero; the curator is the single write path to the curated-canon home. |
| Duplicate and over-bundled canon PRs are prevented at authoring time. | Duplicate PRs opened over the same pages (target ~0); PRs bundling a structural change with content edits (target 0). | Both stay near zero; the duplicate-check and bundling gate are functioning. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** The curator is the operator-facing dispatcher — the operator (or an agent on their
behalf) invokes it with a mode; it executes that mode's branch in the current context and returns a
result (PR URL, queue listing, sweep report). It is the main-thread side of the canon-maintenance
cell, not an isolated background job. Context is needed: it must confirm the working tree is clean,
check the open-PR queue, branch, edit pages, and compose a PR — all of which require the operator's
repository context. A skill loads into the current session context; an agent runs isolated and
returns a summary. The dispatcher is squarely a skill.

**`determinism:`** `generative`

**Rationale:** Every mode requires judgment: which drift is actionable, how to phrase an amendment,
how to write a PR description that surfaces operator decisions without mid-mode questions, whether
proposed content is inferable or genuinely missing. The output is not deterministic given the same
inputs — it depends on the page content, the trigger, and what constitutes the minimal accurate
amendment. Contrast with the fleet agents (drift-detector runs a known scan pattern → sonnet;
queue-checker issues `gh` calls → haiku) which are closer to deterministic mechanical jobs.

## Contract

**Input:**
- Mode name (`sweep`, `raise`, `queue`, `refresh-index`, `integrate`, or bare)
- Optional args: topic slug for `raise`/`decision-doc`; PR number for `comment`; page slugs for `sweep`
- Operator repository context: the working tree, `gh` auth, the canon's page index
- Overlay-supplied bindings: canon repo path, canon handbook root, queue label — never hardcoded

**Output:**
- `sweep`: Chat report of drift candidates grouped by severity and page. No file mutations.
- `raise`: A labelled PR on the canon repo (+ refreshed `index.json` if frontmatter changed). PR URL reported to operator.
- `queue`: Chat report of open PRs + collisions. No mutations.
- `refresh-index`: Updated `index.json` (idempotent if unchanged). Changed-slug count reported.
- `integrate` (deferred): Batch merges on canon main; refreshed index; closed issues; chat report.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| be-civic: `bc-operations/bc-skills/bc-handbook-curator/` | Primary analogue — the production be-civic handbook curator: all modes, agents, references, scripts | yes — primary | `bc-handbook-curator-SKILL.md` |
| be-civic: `bc-operations/docs/2026-05-26-bc-handbook-curator-design.md` | Design doc authorising the bc skill — agent loop model, hooks, what does NOT belong | yes | `bc-handbook-curator-design.md` |
| be-civic: `bc-operations/bc-skills/bc-handbook-curator/references/` | Gate references: what-belongs, bundling-rules | yes | `bc-what-belongs.md`, `bc-bundling-rules.md` |
| CE plugin: `compound-engineering/skills/` | grep for curator/canon/handbook/drift/queue/amend — any documentation-maintenance or canon-management skill | no — `ce-doc-review` is multi-persona requirements/plan review, not canon-drift maintenance | — |
| gstack skills: `~/.claude/skills/gstack/` | grep for curator/canon/drift/maintenance | no — `document-release` is post-ship diff-driven doc sync, not drift-detect-and-queue | — |
| Anthropic platform docs | `platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices` — skill authoring best practices for the primitive (description field, progressive disclosure, 500-line ceiling, evaluation-driven iteration) | yes — informs challenge findings | — (cited in challenge findings; no verbatim lift needed) |
| ADR best-practice literature | `adr.github.io`, `platformtoolsmith.com`, `aws.amazon.com/blogs/architecture` — PR-based ADR workflows, drift detection, index maintenance, decision doc patterns | yes — confirms the domain practice; vendored node aligns with ADR index-owner, PR-as-canonical-record, and periodic sweep patterns | — (web search; cited below) |

**External analogue finding:** The primary external analogue is the production `bc-handbook-curator`
skill in `be-civic`. It is the mature, exercised instance from which the vendored `handbook-curator`
node was generalised. The analogue is real, on-disk, and operational — not a design sketch. Five
files were lifted verbatim. No counterpart exists in the CE plugin or the gstack skill tree. The
Anthropic skill authoring docs and ADR literature confirm and extend the domain practice, yielding
the challenge findings below.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/bc-handbook-curator-SKILL.md` | **keep** | The primary analogue. All six modes (raise, queue, refresh-index, integrate, comment, decision-doc) plus cross-repo claude-md routing, model routing, failure modes, strict principles. The generalised node was abstracted from this source; diffing it against the node reveals what was dropped. |
| `source-material/bc-handbook-curator-design.md` | **keep** | Design doc: agent loop, hooks discipline, two-layer navigation surface (L1 section index / L2 page graph), what does NOT belong, spec touchpoints, build sequence. Several design insights not yet absorbed into the vendored node body. |
| `source-material/bc-what-belongs.md` | **keep** | The four-rule content gate. Directly governs the `raise` mode; the vendored `what-belongs` reference is modelled on this. Confirms the token-efficiency and inferability tests. |
| `source-material/bc-bundling-rules.md` | **keep** | PR-bundling gate. Refusal cases (structural + content bundle; spec-section isolation; >10-page unrelated bundle). The vendored node records the structural/content split but omits the >10-page and spec-section cases. |
| `source-material/sg-handbook-curator-SKILL.md` | **edge-only (in-repo)** | The factory self-applying the same pattern. In-repo, so not an external analogue. Useful for comparing which bc features were generalised vs deferred/dropped. Confirms `sweep`, `raise`, `queue`, `refresh-index` are live; `integrate`, `comment`, `decision-doc`, `spec-amend` are deferred. |

## Keep / Drop

**Kept (absorbed into body):**
- `raise → queue → integrate` lifecycle as the operator-facing loop.
- Modes as body branches (D34): `sweep`, `raise`, `queue`, `refresh-index`, `integrate` (contract-only), deferred modes refusal.
- Preflight (working tree clean; `gh` auth; handbook root reachable).
- Duplicate-check gate in `raise` — invoke `queue-checker` in `check-duplicate` mode; surface overlap and stop if found.
- Bundling-rule: never bundle structural/index with content edits.
- Surface operator decisions in the PR description, never mid-mode.
- Agent fleet: drift-detector (sonnet), pr-author (opus), queue-checker (haiku).
- Overlay-supplied configuration (repo, label, handbook root).
- Inferable-content and unresolved-content refusal cases.
- `refresh-index` called inline when frontmatter changed.

**Dropped (out of scope / product-specific):**
- `comment` mode (deferred in both bc and sg instances; planned but not built).
- `decision-doc` mode (bc: available; sg/vendored: deferred — product-specific concept of a company-history decision).
- `spec-amend` mode (bc: dropped from design; sg: deferred / folds into `raise`).
- Cross-repo `claude-md` routing (bc-specific — CLAUDE.md/AGENTS.md drift for sibling repos). The vendored node is general; this routing belongs in a harness overlay.
- Hook installation (bc: SessionStart + Stop in `~/projects/be-civic/.claude/settings.json`). The hooks are harness-level concerns, not the vendored skill.
- `sweep` mode (bc: dropped from design; sg-handbook-curator and the vendored node: available). bc's product decision to drop sweep is not inherited; the vendored node retains it as it serves the factory well.
- Bare-invocation `AskUserQuestion` orientation (bc has this; sg-handbook-curator has it). The vendored node does not currently specify bare-invocation behaviour — a gap.

**Edge only (separate node):**
- `drift-detector` — invoked by `sweep` and `raise`; its own stateless agent node.
- `pr-author` — invoked by `raise`; its own stateless agent node.
- `queue-checker` — invoked by `raise` and `queue`; its own stateless agent node.
- `consistency-checker` — deferred, to be authored for `integrate`.
- `link-validator` — deferred, to be authored for `integrate`.

## Overlaps and seams

**Receives from:**
- Any node that surfaces a durable finding and invokes `raise` (e.g. `explore`, `design`, any dev-sprint stage that detects drift). Process edge: `can-follow` any node in the loop that produces canon-worthy findings.
- The forcing rule / `sweep` mode triggers at session-end — this is the `triggers` edge from a Stop hook event (deferred until the hook/event surface is modelled).

**Hands off to:**
- The open-PR queue (GitHub/git — external). The PR *is* the handed-off artefact; it waits for `integrate`.
- `drift-detector`, `pr-author`, `queue-checker` — `invokes` edges.
- `handbook` (the canon) — the target of all mutations; `maintains` edge.

**Does not overlap with:**
- Node-authoring (`sg-graph-maintainer`) — that maintains the graph, not the handbook.
- `explore` / dev-sprint nodes — they produce findings; the curator receives and records them.
- The portal / dashboard — read-only consumers of the canon; no write path through them.

## Fit

The node fits as a single skill. It owns the mode-dispatch branching (one branching locus) and all
three goals are coherent under a single "keep canon trustworthy" mandate. Modes are body branches,
not separate nodes — none of them earn a distinct measurable goal that would justify splitting. The
five deferred sub-agents (`consistency-checker`, `link-validator`, `integrator-checklist`) are
correctly modelled as separate nodes to be authored when `integrate` is built out.

The `integrate` mode is unusual in that its contract is recorded but its fleet is not built. This is
correctly handled as a body branch with a deferred-implementation announcement rather than a
separate node — the mode earns no goal of its own that isn't already captured by goal 2 (one gated
path to canon).

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| invokes | drift-detector | `sweep` mode dispatches this agent to scan for drift |
| invokes | pr-author | `raise` mode dispatches this agent to compose the PR description |
| invokes | queue-checker | `raise` (duplicate check) and `queue` modes dispatch this agent |
| references | handbook (`load: on-demand, external: true`) | The canon the curator maintains; resolved via overlay to the product's handbook root + page index |
| references | what-belongs (`load: on-demand`) | The four-rule gate for `raise`; loaded at `raise` start, not on every invocation |
| references | pr-description-shape (`load: on-demand`) | The PR body shape consulted by `pr-author`; loaded by `raise` only |
| references | bundling-rules (`load: on-demand`) | Bundling/split gate for `raise`; loaded at `raise` start |
| maintains | handbook (handbook-reference) | This node keeps the curated-canon home current; the graph records the reverse as `maintained_by` |
| can-follow | explore | `raise` is the typical session-end action after explore surfaces a finding |
| can-follow | design | Same — design sessions frequently surface handbook amendments |
| can-follow | drift-detector | When the detector is run independently, the curator acts on its output |

## Conformance

**`primitive:`↔`mode:` agreement:** Confirmed. `skill` + `collaborative` is the correct combination
for an operator-facing dispatcher that runs in the current context. An `agent` would be isolated and
return a summary — inappropriate here since the curator must interact with the operator's working
tree and surface the PR URL back into the live session.

**`goals:` as outcomes:** All three goals read as outcomes (what is achieved), not activities (what
the node does). Goal 1 names a state of the canon (free of drift); goal 2 names a structural
property (one gated write path); goal 3 names a prevention outcome (duplicate/over-bundled PRs
prevented). All have measurable metrics and earns-keep thresholds.

**Edge targets resolvable:** `drift-detector`, `pr-author`, `queue-checker` — all graph nodes in the
curator cell. `handbook`, `what-belongs`, `pr-description-shape`, `bundling-rules` — all declared
references in the node frontmatter. `explore`, `design` — existing graph nodes. No unresolved ids.

## Challenge findings

These findings compare the vendored `handbook-curator` node against its primary analogue
(`bc-handbook-curator`) and against Anthropic's published skill authoring best practices. They are
specific gaps or weaknesses — not suggestions to copy the analogue wholesale.

---

### C1 — Missing mode: `comment` has no deferred-implementation record in the node body [severity: medium]

**Analogue:** `bc-handbook-curator` has `comment` as a live mode (add a comment to an existing
Handbook PR when the duplicate-check redirects). The `sg-handbook-curator` defers it but records
its intended contract.

**Gap:** The vendored `handbook-curator.md` node body records `integrate` as "contract recorded,
implementation deferred" — giving the translator enough to know what it will do. The `comment` mode
is named in the sg-curator's mode table as "deferred — later" but carries no contract. An operator
who hits the duplicate-check redirect in `raise` has no path to comment on the existing PR.

**Why this matters:** `comment` is the operationally important escape hatch from `raise`'s
duplicate-detection stop. Without it, the operator is stuck: they cannot add new context to an
existing PR through the curator, so they either do it out-of-band (violating the single write path)
or do nothing.

**Recommendation for translator:** Either record `comment`'s contract in the body (as `integrate`
does), or confirm in Open Questions whether `raise` should silently proceed past a duplicate instead
of stopping.

---

### C2 — `decision-doc` mode omitted without explicit scope reasoning [severity: medium]

**Analogue:** `bc-handbook-curator` has a fully implemented `decision-doc` mode: author a
company-history decision page under `11-archive/decisions/` plus cascading amendment PRs. The design
doc identifies it as the write path for "pivot-shaped operator decisions that set doctrine other
pages will cite."

**Gap:** The vendored node lists `decision-doc` as "deferred — later (product-specific)" in the
mode table, but does not explain *why* it is product-specific or what the general version would look
like. Stack-graph has a `docs/decisions.md` file that serves an analogous purpose — a corpus of
numbered design decisions. There is no curator mode that promotes a decision entry from that file
into a canonical handbook page.

**Why this matters:** The pattern "a discussion produces a durable decision → that decision gets a
canonical doc → other pages cite the doc" is general, not be-civic-specific. Dropping it without a
generalisation rationale leaves a gap in the write path.

**Recommendation for translator:** Either generalise `decision-doc` as a body branch with the
product's canon-decision format as its target, or explicitly record that the factory handles this
via direct commits to `docs/decisions.md` (and state why that out-of-band path is acceptable for
the factory).

---

### C3 — `sweep` mode: no operator-decision framing for what to do with high-severity drift [severity: medium]

**Analogue:** The `bc-handbook-curator` design doc specifies the full agent loop: Read → Work →
Sweep → Raise. The Sweep step has a "forcing rule" citation — detected drift must be raised as a
PR, never silently continued past. The bc SKILL.md drops `sweep` as a live mode (operator decision
2026-05-27), choosing to let the forcing rule live as a hook instead.

**Gap:** The vendored node's `sweep` mode says "report them to the operator" and "No mutations —
to act on a finding, the operator runs `raise`." The sg-handbook-curator extends this with an
explicit recommendation in the sweep output: "If high-severity findings are present, recommend
invoking `raise` for each. If the operator is in a session-end context, note the forcing rule."

The vendored node omits the forcing-rule citation in the `sweep` mode body. An agent running sweep
at session-end sees a list of drift candidates but no instruction to escalate high-severity findings
into a `raise` call. The bc design made this explicit precisely because silent continuation is the
failure mode.

**Recommendation for translator:** Add the forcing-rule citation to the `sweep` mode body: "In a
session-end context, honour the forcing rule: detected drift is *raised*, never silently continued
past."

---

### C4 — Anthropic skill best-practice: `description` field exceeds the recommended scope [severity: low]

**Analogue / Standard:** Anthropic's published skill authoring best practices (fetched
2026-06-03 from `platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices`) state:
"The description field enables Skill discovery and should include both what the Skill does and
when to use it … Maximum 1024 characters." The best-practices page emphasises that the description
is the discovery surface — it must be specific and include key terms so Claude can select the right
skill from 100+ available.

**Gap:** The current description in `handbook-curator.md` is 227 characters and is well-formed. The
`when-to-use` field in the node frontmatter (a stack-graph-specific extension) is solid. However,
the Anthropic best-practices page distinguishes between the `description` field (discovery trigger)
and the body (instructions), noting the body should stay under 500 lines. The vendored node body is
currently ~90 lines — well within limit — but the `integrate` mode's deferred fleet, once built,
will likely push this past the threshold. The description field currently does not include the
"NOT for context-loading" anti-pattern trigger, which the bc analogue puts in its own description
field (explicit exclusion helps discovery when an agent is considering whether to invoke this).

**Recommendation for translator:** Add a negative trigger to the description: "Do NOT use for
context-loading — readers navigate the canon directly via its page index." The bc analogue and the
sg-handbook-curator both carry this, and Anthropic's best practices support the explicit when-NOT-
to-use pattern for high-stakes misuse cases.

---

### C5 — Bundling rules: the `>10-page unrelated bundle` refusal case is absent from the node [severity: low]

**Analogue:** `bc-bundling-rules.md` (lifted verbatim) contains: "More than ~10 pages of unrelated
content edits — split by topic" as a refusal case for `raise`. It also carries: "Edits to the
hands-off sections (`04-domain/`, `10-v1-specs/`, `05-product/`) with edits anywhere else — those
route to `spec-amend` mode."

**Gap:** The vendored node's `raise` procedure records the structural/index + content split
refusal, but does not record the `>10-page unrelated bundle` refusal or the spec-section isolation
rule. For the factory's current size this may not matter. But as the graph grows and the canon
accumulates pages, operators raising a sweep pass's worth of fixes in one go will have no guidance
on when the batch becomes too large.

**Recommendation for translator:** Either absorb the `>10-page` rule into `bundling-rules` (the
reference) or note it in the `raise` mode's refusal cases. The spec-section isolation rule is
deferred with `spec-amend` — confirm that this is the intended disposal when the factory reaches
the scale where spec isolation matters.

---

### C6 — Bare-invocation behaviour is unspecified in the node [severity: low]

**Analogue:** Both `bc-handbook-curator` and `sg-handbook-curator` specify what happens when the
skill is invoked bare (no mode argument): print the orientation block, then ask via
`AskUserQuestion` which mode to run. The bc design documents the orientation block verbatim and the
question gate (six options including abort).

**Gap:** The vendored `handbook-curator.md` node body does not specify bare-invocation behaviour.
An operator invoking it without a mode argument will get unspecified behaviour.

**Recommendation for translator:** Add a bare-invocation section: print the orientation block
(four live modes + `integrate` deferred + deferred modes) and gate on `AskUserQuestion`. The
orientation block should include the "NOT for context-loading" redirect.

---

### C7 — No explicit preflight for the `integrate` deferred contract [severity: low]

**Analogue:** The bc design doc's `integrate` mode specifies a full sequence including operator
decision surfacing, merge ordering, cross-PR consistency, link validation, refresh-index after, and
a final report. The sg-handbook-curator records a similar intended sequence.

**Gap:** The vendored node's `integrate` mode body says "announce 'integrate: contract recorded,
implementation deferred' and stop." The contract is recorded — but does not specify the fleet size
(how many agents), the merge ordering policy (oldest-first within topical cluster vs operator-
directed), or what the session cadence is (weekly, on-demand). When the node moves from deferred to
implemented, the translator will have no spec to build from beyond what is in the sg-curator's
deferred contract block.

**Recommendation for translator:** Port the sg-handbook-curator `integrate` deferred-contract block
(steps 1–6: list queue, cross-PR consistency, link validation, surface decisions synchronously, walk
merges, refresh index) into the vendored node body. This is already generalised in the sg-curator;
it is just not in the vendored graph node yet.

## Open questions

1. **`comment` mode disposal.** Does the `raise` duplicate-check stop produce a dead end for operators, or should bare `raise` silently extend the existing PR rather than stopping? If stopping is correct, `comment` needs at least a recorded contract.

2. **`decision-doc` generalisation.** The factory records decisions in `docs/decisions.md` via direct commit. Is that out-of-band path acceptable for the factory permanently, or should the curator eventually have a `decision-doc` mode that promotes a decision entry to a canonical handbook page?

3. **`sweep` vs forcing-rule hook.** The bc design intentionally dropped `sweep` in favour of a Stop hook. The vendored node retains `sweep`. Is the harness-level Stop hook the right long-term home for the forcing rule, with `sweep` reduced to operator-on-demand only? This affects how the `triggers` edge is modelled when the hook surface is built.

4. **`integrate` fleet timing.** `consistency-checker` and `link-validator` are named but not authored. Are these authored concurrently with `integrate`, or after? If after, the `integrate` contract block should be explicit about what validation is skipped in V1.

5. **Overlay surface for `spec-amend` / spec-section isolation.** At what canon size does the factory need spec-section isolation (separate PR discipline for spec sections)? The bc analogue gates this at `04-domain/`, `10-v1-specs/`, `05-product/`. Does the factory have analogous hands-off sections?
