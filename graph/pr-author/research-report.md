---
title: Research report for pr-author
type: research-report
status: complete
authored: 2026-05-31
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: "Backfill: external search performed, four sources lifted, full template structure populated, challenge findings section added"
sources_lifted: 4
external_analogue_found: true
external_corpora_searched:
  - "be-civic production harness (bc-operations/bc-skills/bc-handbook-curator/)"
  - "stack-graph tooling (tooling/sg-handbook-curator/) — in-repo, not external"
  - "Compound Engineering (CE) plugin (ce-commit-push-pr skill + pr-description-writing reference)"
  - "gstack live skills (/home/gstack/.claude/skills/gstack/ship/SKILL.md)"
  - "Anthropic Agent Skills docs (platform.claude.com/docs/en/agents-and-tools/agent-skills/)"
  - "GitHub Blog: 'Agent pull requests are everywhere — how to review them'"
  - "arxiv 2602.14611: The Value of Effective Pull Request Descriptions"
researcher_adequacy_note: |
  Four corpora were searched: the be-civic production harness (strongest external analogue —
  bc-handbook-curator/agents/pr-author.md is the mature original the node was generalised from),
  the CE plugin (second external analogue — ce-commit-push-pr with its pr-description-writing
  reference is a mature general-purpose PR description system that covers capabilities the node
  omits), the gstack ship skill (no separate pr-author subagent; Step 19 opens a PR but embeds
  description composition inline, not as a standalone agent — not a closer counterpart than CE),
  and published best practice via web (GitHub Blog agent-PR guidance + arxiv pull-request
  description study). All four corpora are explicitly recorded; two yielded verbatim lifts. The
  challenge section is grounded in concrete gaps found in CE versus the node (adaptive sizing,
  title composition, evidence/demo handling, before/after user-visible framing) and in GitHub
  Blog guidance (verbosity, validation-intent signal). Edges were determined from the node's
  existing frontmatter and confirmed against the graph record; the one undeclared edge (can-follow
  from the invoke source) is flagged. Primitive/mode confidence is high: stateless, isolated,
  returns a string — clearly autonomous agent. Goals were already outcome-framed in the node;
  this report confirms and expands them. Recommendation: proceed to translator — the node is
  structurally sound but the challenge section identifies four concrete gaps the translator
  should evaluate before v1.0.
---

# Research report for pr-author

## Identity

**Candidate id:** pr-author
**Candidate title:** PR author

**Scope:** A stateless autonomous agent that composes the PR body — the proposal surface — for a
settled canon change. It receives a structured spawn bundle (edited pages, trigger, recommendation,
alternatives, out-of-scope items, read set), validates inputs against the `what-belongs` gate
principles, and returns the completed PR body as a string. It writes no files, opens no PR, and
composes no title (those belong to the dispatcher that invokes it). It is shared across the curator
cell (handbook-curator raise mode) and two dev-sprint stages (specify, reconcile). It does not
cover: general code-diff PR descriptions, commit authoring, branch push, evidence/screenshot
capture, title composition, or PR-open mechanics — all of which are the dispatcher's domain or are
scope gaps relative to the CE analogue.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| The PR body is a sufficient proposal — the operator decides without reading the diff or asking a follow-up | share of curator PRs merged/closed on the description alone (no clarifying round-trip); operator decision time | round-trips trend toward zero; a description that routinely prompts a follow-up is not doing its job |
| The proposal stays terse — under the word bar, no diff-restatement, no filler | description word count (target <300); reviewer edits to trim; presence of padding/diff-echo on sampled PRs | descriptions stay under the bar and are not routinely trimmed on review |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** The node runs in an isolated context — it receives a fully-structured spawn bundle
and returns a string. There is no operator interaction during execution. It is not loaded into the
current context (that would be collaborative/skill); it is dispatched and reports back. The
`autonomous` / `agent` pairing is correct and matches both the bc and sg source implementations.

**`determinism:`** `generative`

**Rationale:** Prose synthesis from structured inputs — judgment is required to fill and compress
the sections, apply the quality bar, and refuse gate violations. Not a deterministic transform of
fixed inputs.

## Contract

**Input:** A YAML spawn bundle containing:
- `edits[]` — array of `{page, description}` pairs (what changed on each page)
- `trigger` — `{task, examples[]}` (what surfaced the drift)
- `recommendation` — the default, as a recommendation not a question
- `alternatives[]` or null
- `out_of_scope[]` or null
- `read_set[]` — pages the caller read this session
- `out_of_read_set_justification` or null (required if edits touch unread pages)

**Output:** A single string — the PR body in the `pr-description-shape`. If any input edit
violates a `what-belongs` gate (inferable or unresolved content in a page body), returns a
structured error object instead of authoring:
`{ error: "edit violates a canon gate", rule: "<which>", edit: "<which>" }`.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| be-civic production harness (`bc-operations/bc-skills/bc-handbook-curator/`) | pr-author subagent for bc-handbook-curator — the mature original | yes | `bc-handbook-curator-pr-author.md` |
| stack-graph tooling (`tooling/sg-handbook-curator/`) | sg-specific pr-author — in-repo derivation of the bc original | yes (in-repo, not external) | `sg-handbook-curator-pr-author.md` (for challenge comparison only) |
| Compound Engineering (CE) plugin (`ce-commit-push-pr` skill + `pr-description-writing.md` reference) | autonomous PR description composition for code changes — general-purpose counterpart | yes | `ce-pr-description-writing.md` + `ce-commit-push-pr-skill.md` |
| gstack live skills (`ship/SKILL.md`) | standalone pr-author subagent or PR body composition node | no — PR opening is inline in Step 19, no separate agent | — |
| Anthropic Agent Skills docs | guidance on autonomous agent contract design (spawn, output, refusal gates) | yes (published best practice) | — (no verbatim lift; cited in report) |
| GitHub Blog — "Agent pull requests are everywhere, here's how to review them" | what reviewers need from AI-generated PR descriptions; verbosity guidance | yes (published best practice) | — (cited in challenge section) |
| arxiv 2602.14611 — "The Value of Effective Pull Request Descriptions" | empirical findings on PR description quality; reviewer needs; AI-generated gaps | yes (published best practice) | — (cited in challenge section) |

The strongest external analogue is **`bc-handbook-curator/agents/pr-author.md`** — the live
be-civic production version this node was generalised from. A second, independent external
analogue is the **CE `pr-description-writing.md` reference**, which covers general code-PR
description best practice and exposes scope gaps in the node. The gstack `ship` skill was
searched and found not to contain a comparable standalone agent; its PR composition is inline.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/bc-handbook-curator-pr-author.md` | keep | Primary external analogue — the mature original. Section shape, quality bar, refusal gate, and 300-word bar are all absorbed. The `queue_check` field it carries (not present in the sg version or the node) is a gap to note. |
| `source-material/sg-handbook-curator-pr-author.md` | keep | In-repo sg version — direct source for the node file. Not an external analogue; included for challenge comparison. The voice constraint ("no product-layer vocabulary") present here but absent in the bc version is a sg-specific addition. |
| `source-material/ce-pr-description-writing.md` | keep (edge-only challenge) | CE general-purpose PR description reference. The core "no diff-restatement" principle is absorbed. Adaptive sizing, title composition, evidence/demo handling, and before/after user-visible framing are scope gaps: they belong in the dispatcher or a `pr-description-shape` extension, not in this node. |
| `source-material/ce-commit-push-pr-skill.md` | edge-only | The full CE skill is the dispatcher+composer merged (Step 4 calls the reference). Useful context for the seam analysis; the merged vs separated design is the key structural difference. Not content to absorb. |

## Keep / Drop

**Kept (absorbed into body):**
- Section shape: Summary / Trigger / Recommended decision / Alternatives / Out-of-scope / Out-of-read-set justification / Read set — from both bc and sg sources; already in the node.
- Refusal gate contract (error object on gate violation) — from both sources; already in the node.
- Quality bar self-check (reject own draft if: section too long, diff-restatement, generic trigger, recommendation phrased as question, padding words) — from both sources; already in the node.
- Core "no diff-restatement" principle — from CE `pr-description-writing.md`; already implicit in the quality bar, could be made explicit.
- 300-word bar — from bc source; already in the node.
- Voice constraint (imperative, present tense, no product-layer vocabulary) — from sg source; in the node.

**Dropped (out of scope for this node):**
- Adaptive sizing by change profile (small+simple vs medium+large) — CE concept; belongs in `pr-description-shape` or the dispatcher. pr-author's shape is fixed for canon changes.
- Evidence/demo capture decision — CE concept (the dispatcher asks before calling the composer). Not applicable to canon PRs; the canon PR shape has no demo section.
- Title composition — CE and bc/sg sources agree: the dispatcher, not the author, composes the title. Already correctly excluded from the node.
- Branch naming and label conventions — in `pr-description-shape`; not in this node.

**Edge only (separate node):**
- `pr-open` / dispatcher — the node that dispatches pr-author, composes the title, and calls `gh pr create`. CE's `ce-commit-push-pr` merges these; stack-graph separates them. The separation is correct by the D34 one-node-one-primitive principle.

## Overlaps and seams

**Receives from:** `handbook-curator` (raise mode) and `specify` / `reconcile` dev-sprint stages —
these are the dispatchers that provide the spawn bundle and consume the returned string. The
`invokes` edge runs from the caller, not from pr-author. pr-author has no `invokes` edge of its own.

**Hands off to:** The dispatcher that receives the returned string then calls `gh pr create` or
equivalent. pr-author's contract ends at the string return.

**References (on-demand):**
- `pr-description-shape` — the section skeleton to fill.
- `what-belongs` — the gate principles to refuse violations against. Both are correctly declared
  as `references` with `load: on-demand` in the node frontmatter.

**Overlap with CE `ce-commit-push-pr`:** CE merges the composer (what pr-author is) and the
dispatcher (what invokes pr-author) into one skill. The split here is sound — each is one
primitive with its own goal. The seam is the spawn bundle / string return contract.

**Potential gap at the seam:** The node's spawn bundle schema includes a `queue_check` field in
the bc-original's input contract (the caller passes the queue-checker output to confirm no
duplicate PR is open). This field is absent from the stack-graph node's contract. Whether it
belongs in the spawn bundle or is a dispatcher concern should be resolved.

## Fit

Single node, correct. The job — synthesise a PR body from a structured spawn bundle and return a
string — is cohesive, has its own measurable goals (round-trip rate, word count), and is invoked
by multiple callers (handbook-curator, specify, reconcile). Splitting it would violate D34.
The two goals (sufficient proposal + terse) are distinct enough to warrant separate metrics but not
separate nodes — they are two constraints on the same output.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | pr-description-shape (`load: on-demand`) | The section skeleton the node fills; consulted at composition time, not at load |
| references | what-belongs (`load: on-demand`) | The gate principles the node refuses violations against; consulted before authoring |
| composes-into | dev-sprint @ specify | The specify stage uses pr-author for its spec PRs |
| composes-into | dev-sprint @ reconcile | The reconcile stage uses pr-author for its reconcile PRs |

**Not declared in the node (caller's edge):** `handbook-curator` holds an `invokes` edge to
pr-author; pr-author itself holds no outbound `invokes`. This is correct — the node does not
invoke anyone.

**Potential missing edge:** `can-follow` from the dispatcher that invokes pr-author back to
pr-author is the dispatcher's concern. No additional edges needed on this node.

## Conformance

**`primitive:`↔`mode:` agreement:** `agent` + `autonomous` — confirmed. Correct pairing per the
graph spec (autonomous ↔ agent).

**`goals:` as outcomes:** Both goals read as outcomes (what is achieved), not activities (what the
node does). "The PR description is a sufficient proposal" is an outcome. "The proposal stays
terse" is an outcome. Metrics and earns-keep thresholds are present.

**Edge targets resolvable:** `pr-description-shape` and `what-belongs` exist at
`graph/_refs/pr-description-shape.md` and `graph/_refs/what-belongs.md`. `dev-sprint` is an arc
target — correct use of `composes-into` (arc targets are not node files; the maintainer does not
resolve them to files per graph spec §Edges).

## Open questions

- **`queue_check` field:** The bc-original's input contract includes a `queue_check` field (the
  caller passes queue-checker output to confirm no duplicate PR). The stack-graph node omits it.
  Is duplicate-PR prevention a dispatcher concern (handled before spawning pr-author) or should
  the spawn bundle carry it? Needs translator / operator resolution.
- **Out-of-read-set justification trigger:** Both bc and sg sources require this field "if edits
  touch pages not in read_set". The node's contract marks it `required if edits touch unread
  pages`. A `null` vs absent distinction is not spelled out — is `null` acceptable or should the
  field be omitted entirely when not applicable? Minor; clarify in the next node revision.
- **Coverage beyond curator cell:** The node currently `composes-into` dev-sprint @ specify and
  @ reconcile. If other arc stages later need PR descriptions (e.g., a `close` or `snapshot`
  stage), the `composes-into` list will need extension. Not blocking; flag for arc-design work.

---

## Challenge findings

*This section is the research product. It challenges the node against real-world analogues and
published best practice — where the node is weaker than its counterparts, what best practice it
omits, and what scope gaps it carries. Citations name the analogue or source.*

### C1 — No adaptive sizing; the shape is fixed regardless of change size (medium severity)

**Gap:** pr-author applies a single section shape to all canon changes. The CE `pr-description-writing.md`
reference defines an explicit **adaptive sizing table** keyed to change profile:
- Small + simple (typo, config): 1-2 sentences, no headers, under ~300 characters
- Small + non-trivial (bugfix, behavioural change): 3-5 sentences
- Medium feature or refactor: narrative frame + design-decision callouts
- Large or architecturally significant: narrative frame + 3-5 design-decision callouts + brief test
  summary, target ~100 lines, cap ~150

Canon changes vary in weight — a one-line cross-reference fix is not the same as a section-schema
amendment. The node's single 300-word bar is a cap, but it provides no floor and no guidance on
*how long* a small change's description should be. In practice this leads to over-description of
small changes (the quality bar catches some of it, but not all).

**Recommendation for translator:** Extend the quality bar to include an adaptive lower bound: for
one-line or vocabulary-only changes, the body should fit in 1-2 sentences with no section headers.
The `pr-description-shape` reference already implies this (one operator-decision frame per PR) but
the node's instructions do not surface it.

### C2 — No before/after user-visible framing for observable changes (medium severity)

**Gap:** The CE `pr-description-writing.md` requires a **user-visible before/after lead** for any
change that affects observable behaviour: "For user-facing bugs, run an extra before/after pass
before writing the mechanism: name what the user would have seen before and what they now see
instead." The arxiv study (2602.14611) corroborates: human-authored descriptions consistently
outperform AI generation by conveying *what changed for the user*, not just *what the code does*.

Canon changes (handbook and spec amendments) are not code PRs, but the principle applies: a
spec change that corrects a misunderstanding should lead with "previously, an agent reading
§03-plugin-spec would conclude X; this change corrects it to Y", not just "amend §03-plugin-spec
to say Y". The node's `## Trigger` section captures what surfaced the drift, but not the
*consequence* of leaving it uncorrected. The quality bar's "trigger is generic" check does not
surface this.

**Recommendation for translator:** Add a quality-bar check: "Trigger names the specific moment
AND the consequence of leaving the drift unaddressed." Or extend `## Trigger` guidance: "Include
what an agent following the current (unfixed) text would have done wrong."

### C3 — Title composition is a stated exclusion, but no handoff contract is defined (low severity)

**Gap:** The node correctly excludes title composition ("you do NOT compose the title — the
dispatcher does"). However, the node's contract does not specify *what* the dispatcher needs from
pr-author's output to compose the title. CE's `ce-commit-push-pr` Step 4 delegates to the
reference and then the dispatcher uses the body's opening to infer the title type. The bc-original
states the title follows the conventional-commit pattern in `pr-description-shape.md`, but the
spawn-bundle-to-title pipeline is implicit.

If a future dispatcher variant is authored (e.g., one that composes spec-amendment PRs with a
different title convention), there is no contract to extend. The current design works because there
is only one dispatcher today, but the seam is underdocumented.

**Recommendation for translator:** Add a brief output-contract note: "The returned string is a
body-only document; the caller composes the title from the edit class using the title convention
in `pr-description-shape`." This makes the handoff explicit without changing the interface.

### C4 — No validation-intent signal; the refusal gate is the only quality gate visible to the caller (medium severity)

**Gap:** The GitHub Blog guidance ("Agent pull requests are everywhere") identifies a key weakness
in AI-authored PR descriptions: "there is no indication the author reviewed whether the agent
captured their actual intent." The node's refusal gate (return an error on gate violations) is
binary — it either refuses or authors. There is no mechanism for the node to *signal partial
confidence* or *flag the description as needing operator review* when the spawn bundle is
ambiguous but not gate-violating (e.g., a trigger that reads generic despite not being gate-invalid,
or a recommendation that is structurally correct but lacks justification).

The CE `pr-description-writing.md` handles this through the quality-bar self-check, which the
node also has. But the CE model runs the quality bar silently and produces the best output it can.
pr-author should likewise run the quality bar internally — the open question is whether it should
**surface the quality-bar failures** to the caller (rather than silently iterating) so the
dispatcher can choose to present the description for operator review before opening the PR.

**Recommendation for translator:** Consider adding an optional `quality_warnings[]` array to the
output when the description passes the gate but fails one or more quality-bar checks (e.g., a
trigger that is borderline-generic). The caller can then decide whether to open the PR immediately
or surface the description for operator confirmation. This is not a breaking change to the output
contract — the body string is still returned; warnings are additive.

### C5 — No `queue_check` in spawn bundle; duplicate-PR prevention is unassigned (low severity)

**Gap:** The bc-original includes a `queue_check` field in the input contract — the caller passes
the output of a queue-checker to confirm no duplicate PR is already open for the same pages. The
stack-graph node omits this field entirely. This means duplicate-PR prevention is implicitly
delegated to the dispatcher, but the dispatcher's contract does not state it either (see Open
questions above). A gap at both ends of the seam: neither node owns the check.

**Recommendation for translator:** Assign ownership explicitly. Either (a) the dispatcher runs the
queue check before spawning pr-author and passes a `duplicate_check_passed: bool` in the bundle so
pr-author can refuse early, or (b) the dispatcher handles it entirely and pr-author's contract
documents the precondition ("caller has verified no open PR for these pages"). Option (b) matches
the current design intent but needs to be stated.
