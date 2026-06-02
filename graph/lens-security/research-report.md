---
title: Research report for lens-security
type: research-report
status: complete
authored: 2026-05-30
last_updated: 2026-05-30
amended: []
sources_lifted: 6
researcher_adequacy_note: |
  Lifted six sources, mirroring the lens-correctness lift set: CE's ce-security-reviewer
  (the closest direct analog — an autonomous persona agent dedicated to the security
  dimension, attacker-minded, with the explicit lower-threshold/P0-at-50 calibration),
  CE's ce-security-lens-reviewer (the doc/plan-stage analog — a security architect grading
  a planning doc's attack surface, which supplies the target: doc mode), a curated
  security excerpt of gstack's review/checklist.md (concrete diff-target injection / LLM-
  trust / shell / secrets checks, with the correctness-only items deliberately left to the
  sibling), and the three shared family/contract sources (CE's findings-schema.json,
  persona-catalog.md, subagent-template.md). Edges were determined from docs/graph-map.md
  and the family decision: the only structural edge is composes-into the dev-sprint arc at
  review/design/plan (identical to every lens); the finding contract (findings-schema /
  severity-scale / confidence-anchors) is a kind: reference artefact in graph/_refs/ that
  the dispatching stage passes into the lens via its spawn prompt — the lens declares NO
  contract edge of its own; there is deliberately no
  edge to lens-dispatch (a back-edge would be an illegal structural cycle, D4). Confidence
  in primitive: agent / mode: autonomous / determinism: generative is HIGH — every source
  models the lens as fanned-out-to in isolated context, returning structured findings
  without conversing, and the hunt (think like an attacker, trace data to a sink) is
  judgment not algorithm. The goals frame as outcomes (exploitable vulns caught before the
  change lands; escaped-vuln rate vs baseline; finding precision). One judgment call to
  carry forward: CE models security as a CONDITIONAL persona, but the stack-graph family
  decision makes it ALWAYS-ON with a LOWER reporting gate (a credible exposure surfaces at
  moderate confidence) — this interplays with the confidence-anchors P0 exception (security
  P0s at 50+ must surface) and is the one dimension-specific divergence from the
  correctness template. Recommendation: proceed to translator — the shape is well-attested
  and mirrors the settled correctness template; carry forward the target-parameterisation
  (diff vs doc) as a body mode and the always-on/lower-gate activation note.
---

# Research report for lens-security

## Identity

**Candidate id:** lens-security
**Candidate title:** Security lens

**Scope:** One dimension of stack-graph's shared review lens-family (D27). An autonomous
agent the review orchestrator (following the `lens-dispatch` reference) fans out to in an isolated
context; it reads a target and returns structured findings, never conversing with the
operator. It hunts **exploitable security vulnerabilities** by thinking like an attacker —
"how would I break this?" — then traces whether the code stops the attack: injection
(SQL / command / path / XSS), authentication & authorization gaps (missing
ownership/permission checks, IDOR, privilege escalation, CSRF on state-changing ops),
secret exposure (hardcoded creds, secrets in logs/errors/URLs), SSRF, unsafe
deserialization, crypto misuse, unsafe trust of external/LLM output crossing a trust
boundary, and missing input validation at trust boundaries. It is **`target`-parameterised**:
`target = diff` (the review stage — trace untrusted input from entry point to dangerous
sink in the changed code) or `target = doc` (the design/plan stage — inventory the attack
surface, find auth/authz/secrets decisions the proposed design omits, before any code
exists). It is **one** family member; it does **not** own family orchestration, fan-out,
dedup, or severity-routing (those live in the `lens-dispatch` reference the dispatching stage follows). It
explicitly does **not** own logic/behavioural correctness (→ `lens-correctness`), test
coverage (→ `lens-tests`), maintainability/complexity (→ `lens-maintainability`), or
performance (→ `lens-performance`); where checks straddle (e.g. SQL-string-interpolation,
LLM-output trust boundaries) it keeps **only** the exploit framing (an attacker can do X)
and defers the wrong-result / swallowed-failure framing to `lens-correctness`.

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| Exploitable vulnerabilities (injection, authz bypass, secret exposure, SSRF, unsafe deserialization, crypto misuse, trust-boundary breaks) are caught before the change lands | true-positive security findings per review that survive merge-triage (not dropped by dedup, the gate, or the validator) | sustains a non-trivial survived-finding rate AND a measurable drop in escaped vulnerabilities vs the pre-lens baseline over N sprints |
| The change lands with its exploitable vulnerabilities already surfaced, not discovered after exploitation in production | escaped-vuln rate (vulnerabilities traced to a reviewed change that the lens did not flag) vs the transcript baseline | escaped-vuln rate below baseline; if the lens never lowers it, it is cut or merged |
| Security findings are trustworthy enough to action, not theatre the operator must wade through | false-positive / suppression rate at merge-triage (findings dropped by dedup, confidence-gate, or validator) — calibrated against the deliberately lower reporting gate | precision high enough that the lens's findings stay in the actionable tier rather than being routinely demoted to advisory, even with the lower gate |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** Every source models this as a sub-agent the orchestrator spawns in an
**isolated** context (CE's `ce-security-reviewer` is a `model: inherit` reviewer agent with
read-only-plus-Write tools that returns JSON and makes no operator-facing prose; the
`ce-security-lens-reviewer` is its `model: sonnet` doc-stage counterpart, spawned by the
document-review skill; the CE subagent-template spawns each via the platform Agent
primitive with a scope-rules + output-contract bundle). It is fanned-out-to, runs
unattended, and returns a structured summary (findings JSON) — the textbook
autonomous-agent shape from [concepts](../../handbook/content/01-concepts/) and the
discriminator in [decomposition](../../handbook/content/07-decomposition/) (the work does
not benefit from the live main thread, is fully describable in a prompt, and is
parallelisable across the lens family). It does **not** engage the operator — that is the
consuming stage's job (review/design/plan are the collaborative skills; the lens is their
isolated worker). Confidence is HIGH; there was no real ambiguity. The `primitive: agent` ↔
`mode: autonomous` pairing satisfies the schema agreement constraint.

**`determinism:`** `generative`

**Rationale:** The hunt is **judgment**, not a fixed algorithm — "read the diff and ask
how would I break this, then trace whether the code stops you." Two runs over the same diff
can surface different attack paths; the calibration (the confidence anchors, plus the
lens-specific lower reporting gate) is a self-applied behavioural rubric, not a
deterministic computation. (Contrast the measure-vs-baseline nodes like `benchmark`/`health`,
which are deterministic.) The **aggregation** that consumes the findings (dedup →
corroborate → confidence-gate → severity-route) is deterministic, but that lives in
`merge-triage`/`lens-dispatch`, not in this node.

## Contract

**Input:** A spawn bundle from the consuming stage's dispatch block: the `target`
(`diff` or `doc`) and its contents, scope-rules (what is in/out of the change; base-ref
markers; untracked-scope notes), an optional intent/requirements summary, and the
finding contract (schema + severity scale + confidence anchors) — references the
dispatching stage passes in via the spawn prompt, not authored or imported by the lens.
Read-only tools
(Read, Grep, Glob, git/gh inspection); it may read code/context **outside** the target to
confirm a finding (e.g. trace untrusted input back to its entry point, or follow a
user-controlled value forward to a dangerous sink, or check whether a guard exists in
middleware not shown in the diff).

**Output:** Structured findings conforming to the shared finding contract — per finding:
`title`, `severity` (P0–P3), `file`, `line`, `why_it_matters`, `autofix_class`, `owner`,
`requires_verification`, `confidence` (0/25/50/75/100 anchored), `evidence[]`,
`pre_existing`, optional `suggested_fix`; plus top-level `reviewer: "security"`,
`residual_risks[]`, `testing_gaps[]`. Self-suppresses anything below the report threshold,
**but at a deliberately lower gate than the other lenses** — a credible exposure surfaces
at moderate confidence, and a critical-but-uncertain exposure (P0 at anchor 50+) must
still be emitted via the confidence-anchors P0 exception. No operator-facing prose; no
mutation of the target. (Doc-target findings reframe "file:line" to the doc location /
section but keep the same schema.)

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/ce-security-reviewer.md` | keep | Primary model for the body: attacker-minded hunt-list (injection / authz / secrets / deserialization / SSRF / path traversal), the lower-threshold + P0-at-50 calibration, the non-flag list (defense-in-depth on protected code, physical-access attacks, dev/test HTTP, generic hardening), output shape. |
| `source-material/ce-security-lens-reviewer.md` | keep (partial) | Source for the `target: doc` mode — attack-surface inventory, auth/authz gaps where the actor is unnamed, data-exposure, third-party trust boundaries, secrets strategy, plan-level top-3-exploit threat model. Its requirements-vs-plan granularity split maps onto design-vs-plan consumers. The collaborative document-review scaffolding around it is dropped. |
| `source-material/gstack-review-checklist-security-excerpt.md` | keep (partial) | Source for concrete diff-target checks: SQL string interpolation, the LLM-output trust-boundary block (unvalidated LLM values persisted, SSRF on LLM-generated URLs, stored prompt injection), XSS (unsafe HTML render on user-controlled data), shell injection (shell=True + interpolation, os.system, eval/exec on LLM code), CI/CD hardcoded-secrets. Correctness-only checklist items (enum completeness, TOCTOU-as-correctness, time-window, type-coercion, column-name safety) are **edge-only** (owned by `lens-correctness`) and were not lifted. |
| `source-material/ce-persona-catalog.md` | keep (framing) | The lens-family framing + sibling boundaries. NOTE the divergence: CE makes security CONDITIONAL; stack-graph makes it ALWAYS-ON with a lower gate (recorded as a judgment call). Not absorbed as body text — it is family context. |
| `source-material/ce-findings-schema.json` | reference (spawn-passed) | The shared finding contract. A `kind: reference` artefact in `graph/_refs/`, passed into the lens via its spawn prompt by the dispatching stage; NOT absorbed and NOT an edge the lens declares. |
| `source-material/ce-subagent-template.md` | reference (spawn-passed) | The dispatch/spawn contract + confidence-anchor rubric (incl. the P0-at-50 exception security relies on). The confidence anchors are a `kind: reference` (`graph/_refs/confidence-anchors.md`) the dispatching stage passes into the lens's spawn prompt; the lens does not author or import them. |

## Keep / Drop

**Kept (absorbed into body):**
- The attacker-minded security hunt-list: injection vectors (user-controlled input →
  SQL without parameterization / HTML without escaping / shell without sanitization /
  template raw-eval), auth & authz bypass (missing auth on new endpoints, broken
  ownership checks / IDOR, privilege escalation, CSRF on state-changing ops), secrets in
  code or logs (hardcoded keys/tokens, sensitive data in logs/errors, secrets in URL
  params), insecure deserialization (untrusted input to pickle/Marshal/unserialize/eval),
  SSRF and path traversal (user-controlled URL to server-side fetch without allowlist;
  user-controlled path to filesystem without canonicalization), crypto misuse, missing
  input validation at trust boundaries.
- The "trace the data from entry point to dangerous sink" methodology and the
  exploit-construction framing (a finding is strongest when you can name the attacker
  input and the concrete exploit it enables).
- The concrete diff checks from the gstack security excerpt: SQL string interpolation, the
  LLM-output trust-boundary block (unvalidated LLM values, SSRF on LLM URLs, stored prompt
  injection), XSS, shell injection, hardcoded CI/CD secrets.
- The `target: doc` disposition: inventory the attack surface, flag auth/authz decisions
  the proposed design omits (the unnamed-actor smell), data-exposure gaps
  (transit/rest/logs/retention), third-party trust boundaries, secrets strategy, and a
  plan-level top-exploit threat model — before any code exists.
- The non-flag / suppression discipline: no defense-in-depth on already-protected code,
  no physical-access / side-channel theoreticals, no dev/test-config HTTP, no generic
  "consider rate limiting / CSP" hardening without a specific exploitable finding; plus
  the gstack suppression slice (consistency-only changes, constrained-input regex edge
  cases, already-addressed-in-diff).
- The self-applied confidence calibration for security — **with its lens-specific lower
  effective threshold**: anchor 100 = vuln verifiable from code alone (literal SQL
  injection, unauth endpoint referencing current_user); 75 = full constructible attack
  path from input to sink; 50 = dangerous pattern present but exploitability unconfirmed,
  filed at P0 if impact is critical so the P0 exception keeps it visible; ≤25 = suppress.

**Dropped (out of scope):**
- All gstack/CE harness scaffolding: preamble, telemetry, AskUserQuestion flows, skill
  routing, gbrain/learnings wiring, checkpoint mode, version/CI-pipeline specifics beyond
  the secrets check — these are product/harness, not factory-general, and most belong to
  the consuming stage, not the lens.
- The orchestration: fan-out, persona/conditional selection, dedup, cross-reviewer
  corroboration, severity-routing, validator gate — owned by `lens-dispatch` /
  `merge-triage`.
- The collaborative document-review interaction (the document-review skill's
  one-section-at-a-time scaffolding around `ce-security-lens-reviewer`) — that is the
  `plan`/`design`/`review` skills, not the autonomous lens.

**Reference / not absorbed:**
- The finding contract (schema, severity scale, confidence anchors) → a `kind: reference`
  artefact in `graph/_refs/`, passed into the lens by the dispatching stage's spawn
  prompt; the lens declares no edge to it.
- The sibling lenses (`lens-correctness`, `lens-tests`, `lens-maintainability`, etc.) →
  they are peers in the family, not things this node points at; the boundary between them
  is documented (don't double-flag), but there is no edge between siblings.

## Overlaps and seams

- **Upstream seam (dispatch → lens):** the consuming stage, following the `lens-dispatch`
  reference, **spawns** this lens one-way, passing the target + scope + contract into its
  spawn prompt. This lens declares **no** back-edge to dispatch — a back-edge would be a
  structural cycle (D4). (`lens-dispatch` is a reference the host follows, not a node the
  lens edges to.)
- **Downstream seam (lens → merge):** the lens returns findings to `merge-triage`
  (dedup/corroborate/gate/route), which is the dispatch machinery, not a node this lens
  edges to. The lens's only job is to emit conformant findings.
- **Arc seam (lens → arc):** the lens **composes-into** the `dev-sprint` arc at the
  `review` stage (its primary home); `design` and `plan` are additional consumers (it
  composes into those stages too, with `target: doc`). Per graph-map, lenses compose into
  the arc **via their consuming stage**, not into the dispatch block.
- **Sibling seam (the load-bearing one):** security deliberately overlaps with
  `lens-correctness` on a few checks (SQL string interpolation, LLM-output trust
  boundary). Resolution: security keeps **only** the exploit framing (an attacker can do
  X); correctness keeps the wrong-result / swallowed-failure framing. Cross-reviewer
  corroboration (handled by merge-triage) is the intended mechanism when both flag the
  same region — and is especially valuable on security/correctness straddles, so neither
  side suppresses its angle to avoid the overlap.
- **Harness seam:** product-specific lenses attach to the family as harness **overlays**
  (a new lens node + an edge registering it with the dispatch catalog); the vendored
  family — including this node — is never mutated.

## Fit

**Single node, target-parameterised — confirmed.** Apply the
[decomposition](../../handbook/content/07-decomposition/) discriminator: it owns its own
branching (the security hunt and its lower-gate calibration), has a distinct measurable
goal (escaped-vuln rate; survived true positives), and is reused by ≥2 consumers (review,
design, plan) — all three granularity signals (reuse, cohesion, just-in-time) point to
"own node." The diff-vs-doc split is **not** a node split: per D27 and the graph-map
decision, collapse the diff-reviewer / plan-lens-reviewer duplication into **one
parameterised lens** with a `target` mode in the body (D34 — one node, one primitive;
`target` is a body branch of the single lens node, never a separate node). It is a **leaf** in the structural
skeleton: fanned-out-to, returns a summary, edges minimal.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| composes-into | `dev-sprint` (stage: review) | Primary home: the review stage fans out to this lens over a diff. Per graph-map, lenses compose into the arc via their consuming stage. |
| composes-into | `dev-sprint` (stage: design) | Additional consumer: design fans out to this lens over the design doc (`target: doc`). |
| composes-into | `dev-sprint` (stage: plan) | Additional consumer: plan-review fans out to this lens over the plan doc (`target: doc`, sequential surfacing). |

**Deliberately NO other edges:**
- **No edge to `lens-dispatch`.** The dispatching stage follows the `lens-dispatch`
  reference to spawn the lens one-way; the lens must not point back (structural cycle, D4).
- **No `references` edge for the finding contract.** `findings-schema` / `severity-scale`
  / `confidence-anchors` are `kind: reference` artefacts in `graph/_refs/`; the lens does
  **not** depend on them. The dispatching stage owns the `references` edges (with
  `load: import`) and passes the contract into the lens's spawn prompt. This is a
  deliberate modelling choice (see Open questions).
- **No `invokes` / `loads`.** The lens calls no other node and loads no other node into
  its context (it reads the target + the spawn-passed contract; everything else is inline read-only
  tool use / MCP-style inspection).
- **No `precedes` / `can-follow`.** It is a fanned-out-to leaf; it has no process
  position of its own. The process flow (review↔build correction loop) lives on the
  consuming stage, not the lens.

## Conformance

**`primitive:`↔`mode:` agreement:** `agent` ↔ `autonomous` — agrees (schema-valid).

**`goals:` as outcomes:** All three read as outcomes (exploitable vulns caught before the
change lands; escaped-vuln rate vs baseline; finding precision/trustworthiness under the
lower gate), each with a metric and an earns-keep threshold. None are activities ("reviews
code for security" was explicitly rephrased to the outcome "exploitable vulnerabilities
caught before the change lands").

**Edge targets resolvable:** `dev-sprint` is the arc (composes-into targets an arc, which
the maintainer does not resolve to a file — per 02-graph-spec). No edge targets a missing
node. The finding contract is intentionally spawn-passed by the dispatching stage, not an
edge this lens declares.

## Open questions

- **Activation: always-on with a LOWER gate (the one dimension-specific divergence).** CE
  models security as a *conditional* persona (spawned only when the diff touches auth /
  endpoints / input / permissions / secrets). The stack-graph family decision makes
  security **always-on** but with a **lower reporting gate** than the other lenses — a
  credible exposure surfaces even at moderate confidence. This interplays with the
  confidence-anchors P0 exception: a security P0 at anchor 50+ must surface. Translator:
  encode the lower gate in the body's calibration section (security 50s file at P0 so they
  survive the gate), and note the always-on activation, without re-litigating the
  family-level dispatch decision (which lives in `lens-dispatch`, not here).
- **Finding contract = reference, spawn-passed (RESOLVED).** The shared `findings-schema` /
  `severity-scale` / `confidence-anchors` are `kind: reference` artefacts in `graph/_refs/`
  (D33). The lens declares **no** edge to them: the dispatching stage holds the `references`
  edges (`load: import`) and passes the contract into the lens's spawn prompt (CE's pattern).
  Resolved to the reference/spawn model — the translator must not write a `{{placeholder}}`
  in the body nor a `references`/`uses-block` edge on the lens.
- **Target parameterisation in the body.** `target ∈ {diff, doc}` is a body branch of the
  single lens node (D34 — one node, one primitive), not separate nodes. The doc mode also shifts ordering
  (design/plan surface findings sequentially while a human edits the doc) — but that
  ordering is set by the consuming stage's dispatch, not by the lens. Translator: model
  `target` as a parameter the lens reads, keep the hunt identical, only the
  location-vocabulary (file:line vs doc-section) and the "code exists vs code proposed"
  framing differ.
- **Sibling boundary with `lens-correctness`.** A handful of checks (SQL string
  interpolation, LLM-output trust boundary) appear on both the security hunt-list and the
  correctness hunt-list. The intended resolution is framing-split (security keeps the
  exploit angle, correctness keeps the wrong-result/swallowed-failure angle) +
  cross-reviewer corroboration at merge-triage. Not a blocker for authoring; note in the
  body that security keeps the exploit framing and leaves the wrong-result framing to
  correctness.
- **Model tier.** CE runs the diff-target security reviewer at the inherited (session)
  model — one of the highest-stakes personas — while the doc-stage lens runs at sonnet. If
  a `model:` field is authored, lean to the strongest available tier for the exploit hunt;
  otherwise omit and let the consuming stage decide at dispatch. (Optional native field,
  not required.)
