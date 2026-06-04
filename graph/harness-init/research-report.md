---
title: Research report for harness-init
type: research-report
status: complete
authored: 2026-06-03
last_updated: 2026-06-03
amended:
  - date: 2026-06-03
    note: Initial authoring — backfill research-report from scratch; no prior report existed.
sources_lifted: 5
external_analogue_found: true
external_corpora_searched:
  - be-civic plugin (bc-onboarding + harness-CLAUDE.md)
  - gstack live skills (setup-deploy, setup-gbrain)
  - compound-engineering plugin (ce-setup)
  - Anthropic Claude Code skills documentation (code.claude.com/docs/en/skills)
  - Infrastructure-as-Code init/validate/scaffold best-practice (web search)
  - Ansible role init/idempotency best-practice (web search)
researcher_adequacy_note: |
  The primary external analogue is bc-onboarding from the be-civic plugin — a real deployed skill
  that does the exact same job (stands up a two-surface workspace from a vendored plugin, writes a
  harness CLAUDE.md from a template, seeds the skeleton, then hands the operator into the running
  harness). The secondary analogues are gstack's setup-gbrain (multi-path init with detect-first
  idempotency and recovery modes) and gstack's setup-deploy (infer-confirm-write-verify). All four
  files were lifted verbatim into source-material/. The CE ce-setup was also lifted but is a weaker
  match — it checks health and creates a config template but does not scaffold a surface tree or gate
  another skill. Web searches confirmed that the scaffold / validate / idempotency pattern is
  mainstream IaC best practice (Terraform init / validate, Ansible molecule idempotency). Edges were
  determined by reading the node's dependencies (bindings-contract imported, okr-schema and
  work-item-schema on-demand) and by the flow position (precedes the first loop traversal; can-follow
  a plugin install). Confidence in primitive:skill / mode:collaborative is high — the node pauses at
  every judgment point and explicitly asks the operator to confirm paths. The three goals (bootstrap
  from plugin, gate the loop, harness-local overlay) were straightforward outcomes. The challenge
  section surfaces six specific gaps versus bc-onboarding; the translator should address the
  key-absent recovery mode, partial-init safety, and the missing dry-run / diff mode.
---

# Research report for harness-init

## Identity

**Candidate id:** `harness-init`

**Candidate title:** Harness init

**Scope:** This node stands up, re-points, or validates a harness — the consuming workspace's
specialising overlay over the vendored stack-graph plugin. Its job is bounded precisely:
write `<org-root>/.claude/bindings.yaml` from the bindings contract (inferring values from
the workspace, confirming each with the operator), scaffold the empty dashboard surface
skeleton (strategy.md, objectives.md, items/, sprints/, manifest.json), and validate that
every required binding resolves before the dev-sprint loop runs. It is greenfield bootstrap
(`scaffold`), re-keying after a path change (`bind`), and a pre-loop gate (`validate`).

It explicitly does NOT author work-item content (product-dashboard-curator's job), strategy
or OKR content (strategy-curator / operator), canon (handbook-curator), or any vendored
graph file. It never runs in the be-civic product workspace; it runs in the operator's
workspace to instantiate the stack-graph harness there.

## Goals

| outcome | metric | earns-keep |
|---------|--------|------------|
| A consuming workspace can stand up a working harness from the vendored plugin alone — bindings written and the dashboard surface scaffolded — with no hand-assembly and no copying another workspace's files. | share of harnesses stood up via harness-init vs hand-built; share of scaffold runs that produce a bindings.yaml whose required keys all resolve + a surface skeleton that exists. | new harnesses bootstrap from the plugin (the contract + template ship; the workspace instantiates) — not by cloning a sibling workspace's files. |
| The loop never runs against a half-bound harness — every binding the vendored graph requires resolves, and the surface exists, before the first traversal. validate is the gate. | harness-init validate pass before the first loop run; count of loop runs against a missing/unbound surface (target 0); count of required keys unresolved at first run (target 0). | validate catches missing/dangling bindings up front; a workspace that fails validate does not exercise the loop until fixed. |
| Instantiation is an additive local overlay — harness-init writes only harness-local files and never mutates the vendored graph, and never invents product content. | count of harness-init writes outside the harness-local tree (bindings.yaml + the surface under surface-root) — target 0; count of work-items harness-init authored (target 0 — content is the curator's). | the vendored plugin is never touched by instantiation; harness-init scaffolds empty structure, the curator family fills content. |

## Primitive / Mode

**`primitive:`** `skill`

**`mode:`** `collaborative`

**Rationale:** The node runs in the operator's current context — it asks the operator to
confirm the org root, confirm each binding value, and confirm before overwriting anything.
Every mode (`scaffold`, `bind`, `validate`) pauses at judgment points requiring operator
input. This is characteristic of a skill: operator-in-loop, current context, short-lived
structured conversation. It is not an autonomous agent (no isolated context, no long-running
subagent that returns a summary). Confirmed by the comparison to bc-onboarding, which is also
a skill for the same reason: it walks through a multi-step setup interactively.

**`determinism:`** `generative`

**Rationale:** The node infers binding values from the workspace layout (reading directory
trees, proposing paths) and must exercise judgment about which existing files match which
binding keys. The output (the specific values written to bindings.yaml) varies with the
workspace. validate is deterministic in its checks, but it is a mode of the same skill and
does not justify splitting into a separate deterministic node.

## Contract

**Input:**
- Operator invocation with a mode (`scaffold`, `bind`, or `validate`)
- The operator's workspace at runtime (current directory; the org root carrying `.claude/`)
- Imported: `bindings-contract` reference (the key set + format + surface-structure template)
- On-demand: `okr-schema` (objective shape), `work-item-schema` (item shape)

**Output (scaffold):** `<org-root>/.claude/bindings.yaml` with all required keys resolved;
surface skeleton under `surface-root` (strategy.md, objectives.md, items/manifest.json,
sprints/); a validate report; operator guidance on next steps (curator family, OKR authoring,
loop invocation).

**Output (bind):** Updated `bindings.yaml`; validate report. Surface files untouched.

**Output (validate):** A pass/fail report naming every missing/dangling binding or absent
surface directory. No writes on a pure validate run.

## External analogues searched

| corpus searched | query / what you looked for | found? | lifted to source-material? |
|---|---|---|---|
| be-civic plugin (`be-civic-plugin/skills/`) | workspace setup / init skill that writes a harness from a vendored plugin, two-surface topology, state skeleton scaffolding | yes — `bc-onboarding` | `bc-onboarding-SKILL.md`, `bc-harness-CLAUDE.md` |
| gstack live skills (`~/.claude/skills/gstack/`) | setup-* skills: init, scaffold, validate, config-write patterns | yes — `setup-deploy`, `setup-gbrain` | `gstack-setup-deploy-SKILL.md`, `gstack-setup-gbrain-SKILL.md` |
| CE plugin (`ce-plugin/plugins/compound-engineering/skills/`) | setup / health-check / scaffold skills | yes — `ce-setup` | `ce-setup-SKILL.md` |
| Anthropic Claude Code skills documentation (code.claude.com/docs/en/skills) | skill design best practice: modes, validation, idempotency, structure-content separation, init patterns | yes — frontmatter reference, skill content types, supporting-files pattern | cited in report (not lifted verbatim — documentation prose) |
| Infrastructure-as-Code published best practice (web search: Terraform init/validate/scaffold, IaC workspace patterns 2025–2026) | init / validate / idempotent scaffold patterns in IaC; dry-run / plan before apply; binding contract at workspace init | yes — mainstream pattern confirmed (Terraform init+validate, Ansible molecule idempotency) | cited in challenge section (not lifted verbatim) |
| Ansible role init / idempotency best-practice (web search) | ansible-galaxy role init scaffold, idempotency testing, pre/post-tasks validation | yes — idempotency-checking, molecule test, create-once config pattern | cited in challenge section |

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/bc-onboarding-SKILL.md` | keep | Primary analogue. Shows the real deployed shape of a harness-init-class skill: two-surface write (hidden + visible), harness CLAUDE.md from template, state-skeleton with gitignore-first discipline, recovery modes (keyless half-state, harness-repair), idempotent returning-user detection. Every challenge finding in this report is grounded in this file. |
| `source-material/bc-harness-CLAUDE.md` | keep (edge-only for harness runtime) | What bc-onboarding writes into the visible surface — the harness runtime instructions. Not a node itself, but shows the full validate precondition set: marker, key, carry-over, preamble self-check. Informs challenge finding #2 (validate does not cover the harness runtime pre-flight) and #3 (no marker / canary analogue). |
| `source-material/gstack-setup-deploy-SKILL.md` | keep (partial) | The infer-confirm-write-verify loop is directly analogous. AskUserQuestion with D-numbered briefs is the real UX pattern for a workspace-setup skill. The idempotent step-1 existence check is lifted directly. Primarily useful for challenging harness-init's missing dry-run/diff mode. |
| `source-material/gstack-setup-gbrain-SKILL.md` | keep (partial) | Detect-first idempotency (gstack-gbrain-detect), multi-path branching, recovery modes (--resume-provision, --cleanup-orphans, --switch), partial-state safety. The strongest challenge to harness-init's missing partial-init recovery. |
| `source-material/ce-setup-SKILL.md` | keep (partial) | Create-once config template with gitignore entry; health-check script (check-health) delegated to an external script; summary completion report. Weaker fit — does not scaffold a surface tree. Useful for challenging the missing post-scaffold summary. |

## Keep / Drop

**Kept (absorbed into body):**
- Three-mode design (`scaffold`, `bind`, `validate`) — directly derived from bc-onboarding's
  first-contact / verification-only / harness-repair branches.
- Idempotent scaffold: never clobber authored content — from both bc-onboarding (§6.4 "never
  pre-create empty subdirectories") and Ansible idempotency practice.
- Harness-local writes only, never vendored graph — directly parallels bc-onboarding's "never
  overwrite profile.json / markers / vendored templates".
- validate as an honest gate: do not report ready while a required binding is unresolved —
  directly parallels bc-onboarding's self-check sequence (marker → key → carry-over must all
  pass before any work begins).
- Infer + confirm pattern: read the workspace, propose, let the operator correct — from
  setup-deploy's platform-detection flow and setup-gbrain's detect-first.

**Dropped (out of scope for this node):**
- Two-surface / hidden + visible topology: specific to be-civic's identity-keyed deployment;
  stack-graph's harness has one surface (one org root, one `.claude/`). Not directly applicable.
- Identity / verification ceremony: bc-onboarding mints a pseudonymous key and runs an email
  verification flow. harness-init has no identity concept — it binds paths to the contract,
  not identities.
- Telemetry, feature discovery, update checks: gstack preamble machinery. General-purpose
  skill runtime, not node-content.

**Edge only (separate node):**
- The harness runtime self-check (the session-start precondition sequence in harness-CLAUDE.md
  §3.0): this runs at every session start in the consuming workspace, after init. That is a
  hook or a CLAUDE.md ambient rule, not a mode of harness-init. Should be modelled as a
  separate `triggers` or `can-follow` edge (a post-init harness runtime rule), not absorbed
  into this node.
- The `product-dashboard-curator` / `strategy-curator` / `handbook-curator` content authoring:
  correctly placed as downstream nodes; harness-init precedes them.

## Overlaps and seams

**Upstream seams:**
- Plugin install / vendor pipeline (`build/vendor.ts`): harness-init runs after the plugin is
  vendored. The edge is a `can-follow` from the vendor step (not yet a named node in the graph).
- `bindings-contract` reference (imported): harness-init is the executable instantiation of
  the contract. The `references` edge with `load: import` is correct.

**Downstream seams:**
- `product-dashboard-curator`: precedes; harness-init scaffolds the empty surface skeleton
  that the curator then populates. Edge: `precedes`.
- `strategy-curator`: same pattern; precedes strategy-curator.
- `align-context` / dev-sprint loop: harness-init validate is the gate before the first loop
  traversal. Edge: `precedes` (from harness-init validate) → `align-context`.
- `handbook-curator`: the handbook-index binding is set by harness-init; the curator then
  navigates it. Edge: `precedes`.

**Overlaps:**
- **bc-onboarding (be-civic)** is the real-world deployed version of this node's job. The
  overlap is intentional — harness-init is the generalised, stack-graph-native version of
  the same role.
- **No overlap with other stack-graph nodes currently** — harness-init is the only
  instantiation-layer node.

## Fit

The node fits as a single skill. The three modes (`scaffold`, `bind`, `validate`) share the
same binding-contract load, the same org-root identification, and the same harness-local
write boundary — they are branches, not separate goals. `validate` could be split into a
standalone gate node (it runs autonomously, no operator confirmation needed), but the 02-graph-spec
guidance on modes as branches, and the fact that `validate` is always called from within the
scaffold/bind flows as a final step, argue against splitting. Flag as an open question.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | bindings-contract (`load: import`) | harness-init is the executable instantiation of the bindings contract; the key set + format + template are imported at load time — always present |
| references | okr-schema (`load: on-demand`) | objective shape read when scaffolding objectives.md; on-demand to keep context lean |
| references | work-item-schema (`load: on-demand`) | work-item shape referenced when scaffolding items/; on-demand |
| precedes | product-dashboard-curator | scaffold creates the empty surface skeleton; curator adds work-item content |
| precedes | strategy-curator | scaffold writes empty strategy.md shell; curator maintains the canvas |
| precedes | align-context | validate pass is the gate before the first dev-sprint loop traversal |
| can-follow | (plugin vendor step) | harness-init runs after the plugin is vendored into the consuming workspace; no named node yet — open question |

## Conformance

**`primitive:`↔`mode:` agreement:** `skill` + `collaborative` — correct. The node runs in the
operator's current context with explicit confirmation pauses.

**`goals:` as outcomes:** All three goals read as outcomes (a workspace CAN stand up, the loop
NEVER runs against a half-bound harness, instantiation IS an additive overlay). None describe
activities. Confirmed.

**Edge targets resolvable:** `bindings-contract`, `okr-schema`, `work-item-schema` all exist
as references in `graph/_refs/`. `product-dashboard-curator`, `strategy-curator`,
`align-context` are live nodes in the graph. The `can-follow` from the plugin vendor step is
unresolved (no named node yet) — flagged in open questions.

---

## Challenge findings

This section holds the core analytical value: where harness-init is weaker than its real-world
analogues, what best practice it omits, and where the design has gaps or unsupported claims.

### C1 — No partial-init / crash-window recovery (HIGH severity)

**Gap:** harness-init has no recovery mode for a half-written harness — where scaffold ran,
wrote bindings.yaml, but crashed before completing the surface skeleton (or vice versa). The
node says `validate` will "catch missing/dangling bindings" but does not specify what happens
if the operator runs scaffold again on a partially-written state.

**Counterpart:** `bc-onboarding` devotes two explicit modes to this — the **keyless half-state**
(marker present, key absent: verification-only mode) and the **harness-repair mode**
(marker present, CLAUDE.md absent: write only the missing file, reusing existing state). These
modes exist precisely because "a marker can exist over a half-written project" and proceeding
on partial state is worse than pausing to repair it.

**Recommendation:** Add a recovery branch to scaffold: detect a partially-initialised harness
(bindings.yaml exists but surface skeleton is absent, or vice versa) and offer the operator a
targeted repair ("bindings.yaml exists — skip to scaffold surface?") rather than erroring or
silently overwriting. Name the specific crash windows explicitly.

### C2 — validate does not cover the harness runtime pre-flight (MEDIUM severity)

**Gap:** harness-init's `validate` checks that bindings.yaml is parseable and every required
key resolves to a real path. It does NOT verify that the consuming workspace's runtime
CLAUDE.md (or equivalent ambient instructions) will correctly load and reference the harness
at session start.

**Counterpart:** `harness-CLAUDE.md` §3.0 runs a four-step self-check at every session
start: (1) mid-verification resume, (2) marker present, (3) harness key present, (4)
carry-over present. Each step is a real failure mode with a named recovery path. A production
harness has MORE validate preconditions than harness-init covers.

**Recommendation:** Expand `validate` to include at least: does the harness-loaded CLAUDE.md
or equivalent exist at the launch directory? Does it load the bindings reference? These are
structurally verifiable without running the loop.

### C3 — No load canary / post-scaffold smoke test (MEDIUM severity)

**Gap:** After scaffold runs, harness-init tells the operator "next steps: work items are
added via product-dashboard-curator; the OKRs are filled in objectives.md; the loop runs once
validate passes." It does not run a smoke test to confirm the harness actually loads cleanly
in a fresh Claude session.

**Counterpart:** `bc-onboarding` §7 defines a **load canary** — the first message in the next
chat must name the procedure in the user's language, proving the harness CLAUDE.md was picked
up. If the canary fires correctly, setup is verified. If it doesn't, the user is told exactly
what to look for and how to recover.

**Recommendation:** Add a post-scaffold handoff: tell the operator what the loop's first
message should look like when the harness loads correctly ("you should see align-context
greet you with the workspace name and the current sprint"). This is lightweight and gives the
operator the canary without requiring a full loop run.

### C4 — No dry-run / diff mode before writing (LOW severity)

**Gap:** scaffold writes bindings.yaml and the surface skeleton without showing the operator
a preview of what will be written. The node says "propose the value for the operator to
confirm" for each binding key, but there is no "show me the full bindings.yaml before writing"
step.

**Counterpart:** `setup-deploy` step 4 shows the full detected config and asks for
confirmation before writing. `setup-gbrain` shows the full state-diff before each
initialisation step. Both give the operator a summary view — "you are about to write X" —
before any disk writes. The Terraform `plan` before `apply` model is the canonical IaC version
of this.

**Recommendation:** Before writing bindings.yaml, render the full proposed file and ask the
operator to confirm or correct. This is especially important for re-keying (`bind` mode) where
silent overwrites could break an existing loop.

### C5 — Missing gitignore discipline for generated / local files (LOW severity)

**Gap:** harness-init writes `.stack-graph/` as the event-log location (a generated, local
directory) but does not specify whether it should be gitignored. The node's idempotency rules
cover `bindings.yaml` and the surface skeleton, but not the generated local state.

**Counterpart:** `bc-onboarding` §6.2 step 1 writes the `.gitignore` FIRST, before any
other file, because "the allowlist is what keeps .env, sessions/, and .pending-verification out
of every commit — it must exist before any other file is written or the monitor's first
`git add -A` could stage the key." The gitignore-first discipline is load-bearing, not
cosmetic.

**Recommendation:** scaffold should verify/write the relevant `.gitignore` entries for
`.stack-graph/` (the event-log, which is generated/local and should not be committed) as part
of its write sequence. The harness spec already notes `.stack-graph/` is gitignored; scaffold
should enforce it, not rely on the operator remembering.

### C6 — Mode naming / operator entry is not specified (LOW severity)

**Gap:** The node says "The operator invokes you with a mode" but does not specify HOW: as
`/harness-init scaffold`, `/harness-init bind`, or some other invocation form. The gstack
`setup-gbrain` skill explicitly parses flags (`--repo`, `--switch`, `--resume-provision`) and
describes how to parse them. The CE `ce-setup` explicitly describes its interaction method
(AskUserQuestion or fallback to numbered list).

**Counterpart:** `setup-gbrain` documents its shortcut modes at the top (`/setup-gbrain`,
`/setup-gbrain --repo`, etc.) and routes on them in Step 1. `ce-setup` specifies the
interaction method and fallback before running any phase.

**Recommendation:** Specify the invocation form (`/harness-init scaffold`, `/harness-init
bind`, `/harness-init validate`), how the mode is parsed if not given as an argument (ask the
operator), and the fallback (ask) when invoked without a mode.

## Open questions

- **Split validate into a standalone gate node?** The `validate` mode runs autonomously (no
  operator confirmation) and is invoked independently from `scaffold`/`bind`. It could be a
  separate autonomous agent that returns a pass/fail summary, following the 07-decomposition
  discriminator. The counter-argument is that it is always called from within the other modes
  and has no independent goal of its own. Translator to decide.

- **Should the vendor step be a named node?** The `can-follow` from the plugin vendor step
  is unresolved. If `build/vendor.ts` is modelled as a node, the edge resolves; if not
  (vendor is a dev tooling script, not a loop node), the process edge stays informal. 

- **What exactly is the `CLAUDE.md` / harness ambient instructions surface for a
  stack-graph harness?** In be-civic, bc-onboarding writes `harness-CLAUDE.md` into the
  visible substrate. For stack-graph, is there an equivalent ambient file that harness-init
  writes, or is the harness entirely declared through `bindings.yaml` + the plugin's
  CLAUDE.md? If the former, harness-init should scaffold it; if the latter, validate C2
  is less pressing. This is a design gap, not a documentation gap.

- **Does validate need to run after every plugin update?** When the vendored plugin ships
  a new required binding key, existing harnesses will fail validate until re-bound. The
  node doesn't address this migration case. Is there a `migrate` mode or does the operator
  run `bind` manually?

## Amendment applied — cluster-E batch (2026-06-04)

Reconciliation (`docs/research-backfill-reconciliation.md` §E) verdicts C1/C2/C3 as **APPLY**;
**D61** resolves the node's open question on the harness ambient surface. Re-rendered to **v0.2.0**:

- **C1 — crash-window recovery.** Added `scaffold` step 0: detect a half-written harness (bindings
  present but surface absent; surface present but bindings absent; CLAUDE.md present but bindings
  absent) and switch to **targeted repair** — complete only the missing artefacts, never error or
  overwrite. Fixed the old step-3 footgun (blanket "if bindings.yaml exists, switch to `bind`",
  which abandoned an incomplete surface) to defer to the step-0 partial-state logic.
- **C2 + D61 — the ambient surface is the org-root `CLAUDE.md`.** Resolved the open question in
  favour of *yes, there is an ambient file* — already mandated by `04-harness/01-directory-topology`
  (D42). `scaffold` now writes a **templated** org-root `CLAUDE.md` (handbook-index ambient pointer
  + bindings-reference pointer + graph-usage nav) from the `bindings-contract` template, idempotently;
  `validate` checks it exists + reaches the bindings reference + carries the handbook-index pointer
  (the runtime pre-flight that was missing). **Scope (held):** the be-civic-style session-start
  self-check is a harness hook/ambient rule, **not** a harness-init mode — explicitly excluded.
  *Note:* this slightly widens reconciliation C2 (which scoped only `validate`) — scaffold must
  *write* the file validate checks, else validate guards a file nothing creates (logged in D61).
- **C3 — load canary.** Added a post-scaffold handoff describing the expected first-message signal
  when the harness loads correctly (handbook index reachable by name; a bindings-bound node resolves
  its surface).
- **D60 key.** `scaffold` step 2 now names the `learnings-archive` binding (the committed
  prior-proposals surface) in the key set it resolves from `bindings-contract`.
