---
title: Research report for explore
type: research-report
status: complete (crystallization-manifest section superseded by D38 — see banner)
authored: 2026-05-30
last_updated: 2026-05-30
amended: [2026-05-30 D38-banner]
sources_lifted: 7
researcher_adequacy_note: |
  Lifted the five CE researcher agents (one per explore mode — repo / learnings /
  framework-docs / web / best-practices) as the primary prior art, plus gstack's learn
  skill and the workstation gbrain reference for the `learnings` mode's recall substrate.
  The primitive/mode decision (agent · autonomous · generative) is high-confidence and was
  pre-settled by the operator brief — every source agrees the thing is fanned-out-to,
  isolated, read-only, and returns a distilled digest. Edges were determined conservatively:
  the only edge explore owns is the crystallization manifest `references` edge (external:
  true) — the invokes edges live on the consuming stages (authored later), there is no
  composes-into (it is a shared utility agent, not a backbone stage), and gbrain is an inline
  MCP call, not an edge (per the graph-spec inline rule + D31). Goals were framed as outcomes
  without difficulty — the crystallization measure (declining generative fraction per run, D35)
  is the distinctive one and is genuinely measurable. Recommendation: proceed to translator;
  the one item flagged for operator/translator awareness is the `external: true` harness-supplied
  reference as the chosen resolution for crystallization manifests (Open questions).
---

# Research report for explore

> **Superseded in part by D38 (2026-05-30).** This report is preserved as the point-in-time
> build record. Its **crystallization-manifest** conclusion — the `external: true`
> `product-map-manifest` reference (see the *Edges* table and *Open questions* below) — was
> **superseded by D38**: explore is **not** a crystallizing node. Product *knowledge* lives in
> the substrate's homes (code-map / gbrain recall / handbook+decisions canon), which explore
> reads inline and proposes durable findings back to (recall via reconcile/debrief; canon via
> the curator's raise) — there is no co-located manifest and no references edge. The shipped
> `explore.md` (v0.2.0) reflects the substrate model; this report does not. See
> `docs/knowledge-substrate.md` and decisions D38/D39.

## Identity

**Candidate id:** explore
**Candidate title:** Explore (context-gathering agent)
**Scope:** The shared, read-only **context-gathering agent** of the dev-sprint graph. A
consuming stage fans it out (in isolation) to gather *just* the context that stage needs and
get back a distilled digest; explore does **not** converse with the operator and never mutates
anything. It is the most-reused node in the graph — invoked by `align-context`, `design`,
`plan`, and `build`. It carries five **modes as body branches** (D34), one per context source:
`repo` (this codebase), `learnings` (institutional recall), `framework-docs` (a dependency's
official docs), `web` (the open web), `best-practices` (industry/community norms). All five
share one contract — scoped-in, read-only, isolated, distilled-digest-out, token-capped — and
differ only in methodology. It is also the canonical **crystallizing** node (D35): over runs it
builds and reuses a harness-local product map / learnings manifest so later runs reason less and
reuse more. **Excludes:** owning fan-out/merge across multiple explores (the consuming stage
does that), persisting findings back to a store (read-only; persistence is `reconcile`/`debrief`
via `log-decision`), and any operator-facing dialogue (that is the collaborative stages).

## Goals

What this node should achieve (as outcomes, not activities):

| outcome | metric | earns-keep |
|---------|--------|------------|
| The consuming stage starts work with the relevant context already in hand and does not re-explore the same ground. | re-exploration rate — stages that re-derive context explore already returned, per sprint; explore digests reused vs discarded downstream. | re-exploration trends toward zero; a digest that is routinely discarded unread is a cut/merge signal for that mode. |
| The digest is precise — the right context, not noise the stage must wade through. | precision/recall of the digest: fraction of the digest the consuming stage actually uses, and load-bearing context the stage later finds was missing (a recall miss). | usable fraction stays high AND recall-miss rate (context explore should have surfaced but didn't) stays below the pre-explore baseline. |
| As the harness's product map crystallizes, explore gets cheaper and more consistent — it reasons generatively only about what is new or has changed. | **generative fraction per run** (D35): share of a run spent reasoning from scratch vs reusing the manifest's recorded findings; tokens/run trend. | generative fraction declines toward an asymptote (detect-drift + handle-the-new) over a harness's life; a fraction that never falls means the node is not compounding — itself an earns-keep signal. |
| Context stays bounded — a digest never blows the consuming stage's context window. | digest size vs the token budget (~500 sparse / ~1000 typical / cap ~1500), per the lifted web-researcher cap; truncation/overflow incidents. | digests stay within budget; overflow is rare and flagged, not silent. |

## Primitive / Mode

**`primitive:`** `agent`

**`mode:`** `autonomous`

**Rationale:** This is the context-isolation axis (D24), and explore sits squarely on the
**autonomous/agent** side: it runs in an **isolated context**, is **fully describable in a
prompt** (the stage hands it a scope + target), is **parallelizable** (a stage can fan out
several explores at once — plan does), is **read-only**, and returns **only a distilled
summary** — the parent never sees explore's working context. It must be kept *out* of the main
thread precisely so it can read heavily without polluting the operator's window (the
context-firewall reason). Every lifted source is authored as exactly this shape — an isolated
read-only sub-agent that returns a conclusion, not a file dump (CE's five `ce-*-researcher`
agents; the Anthropic Explore subagent pattern). No ambiguity: it is never collaborative (it
does not pause for the operator), so `skill` is ruled out. High confidence.

**`determinism:`** `generative`

**Rationale:** explore exercises judgment — what to search, when to stop, how to weight
sources, what to distil into the digest — none of which is a fixed input→output mapping. The
lifted web-researcher's "knowing when to stop", the learnings-researcher's relevance scoring,
and the repo-analyst's progressive drill-down are all generative. Crystallization (D35) makes
the *fraction* of generation decline over runs (it reuses recorded assets deterministically)
but never to zero — the node always reasons generatively about what is new or drifted, so the
node stays `generative`.

## Contract

**Input (the spawn prompt the consuming stage fills):** a **scope/mode selector** (which of
repo / learnings / framework-docs / web / best-practices to run — one or several), a **target /
question** (the feature, the dependency, the topic, the decision under consideration), an
optional **planning-context summary** so the digest is focused, and a pointer to the harness's
**product-map / learnings manifest** (the crystallization asset — consult-and-reuse). Read-only
tools only (Read, Grep, Glob, Bash for inspection; mode-specific inline tools below).

**Output:** a **distilled digest** carried back into the consuming stage's context — a
synthesis, never raw search results or file dumps. Opens with a **research-value / confidence
header** (`high | moderate | low`, lifted from the web-researcher) so the caller can weight it,
stays within the **token budget**, cites **repo-relative (never absolute) paths** for repo
findings and source URLs for web findings, and **flags conflicts** where a past learning or an
external claim contradicts present evidence (never silently overrides current state). Records
**new findings** into the manifest, gated at `reconcile` (D35) — explore proposes the asset
update; it does not commit it.

### Mode branches (one agent, five body branches — D34)

| mode | methodology (differs) | inline tools (not edges) | consumers |
|------|------------------------|--------------------------|-----------|
| `repo` | scoped phase scan of *this* codebase; cheap grounding first (manifest/tech detection), then drill; repo-relative evidence | Read, Grep, Glob, Bash, `ast-grep` | align-context, plan, build |
| `learnings` | recall before work; grep-pre-filter the recall store, score relevance, flag conflicts + staleness | **`mcp__gbrain__query`** (inline MCP, capability-gated → fall back to reading `docs/decisions.md` + Grep, D31) | align-context, design, plan |
| `framework-docs` | version-specific official docs + MANDATORY deprecation/sunset check | Context7 MCP → `ctx7` CLI → WebFetch/WebSearch (inline ladder) | plan, build |
| `web` | iterative external research → compact synthesis; bias toward stopping early; untrusted-input handling | web-search / web-fetch (inline) | design, plan |
| `best-practices` | check curated skills FIRST, then online; authority ladder (skill > official > community) + deprecation check | skill discovery (Glob `SKILL.md`), Context7, WebFetch (inline) | design |

The **shared contract** (scoped-in, read-only, isolated, distilled-digest-out, token-capped,
research-value header, conflict-flagging) is one body; only the methodology block per mode is
JIT-selected by the scope selector.

## Source inventory

| file | status | notes |
|------|--------|-------|
| `source-material/ce-repo-research-analyst.md` | keep | The `repo` mode model: scoped invocation, cheap-grounding-first phasing, read-only isolated agent, repo-relative evidence, return-the-conclusion. |
| `source-material/ce-learnings-researcher.md` | keep | The `learnings` mode model: recall-before-work goal, grep-pre-filter, relevance scoring, conflict-flagging + staleness check, distil-not-dump. Adapt the `docs/solutions/` substrate → gbrain (D31). |
| `source-material/ce-framework-docs-researcher.md` | keep | The `framework-docs` mode model: Context7-first source ladder, MANDATORY deprecation check, version grounding. |
| `source-material/ce-web-researcher.md` | keep | The `web` mode model. Also the source of node-wide invariants to generalise: research-value header, token budget, untrusted-input handling, stop-early rule. |
| `source-material/ce-best-practices-researcher.md` | keep | The `best-practices` mode model: check-skills-first ordering, authority ladder + attribution, deprecation check. |
| `source-material/gstack-learn-skill.md` | keep (partial) | Only the `# Project Learnings Manager` body + the GBrain Search Guidance fragment feed the `learnings` mode. The entire gstack runtime preamble (telemetry/upgrade/AUQ/voice) is **drop** — harness boilerplate, not explore content. |
| `source-material/gstack-gbrain-reference.md` | keep (as evidence) | Concrete recall-substrate detail for the `learnings` mode (gbrain 0.27.0, MCP surface, habit triggers, when-not-to-use). Harness/workstation detail — informs the inline gbrain call + fallback, not absorbed verbatim into factory body. |

## Keep / Drop

**Kept (absorbed into body):**
- The **shared agent contract**: isolated, read-only, fanned-out-to, returns a distilled digest, never converses with the operator, never mutates (all five CE agents + the operator brief).
- The **research-value/confidence header**, the **token budget**, the **untrusted-input handling**, and the **stop-early** discipline (web-researcher) — generalised across all modes.
- The **five mode methodologies** as body branches: repo phasing, learnings grep-pre-filter + relevance scoring + conflict/staleness flagging, framework-docs source-ladder + deprecation check, web iterative-synthesis, best-practices skills-first + authority ladder.
- **Conflict-flagging / present-evidence-wins** (learnings-researcher): never let stale recall silently override current state; note the entry's date.
- The **crystallization protocol** (D35): "consult your product-map manifest; reuse what's there; explore only what's new/changed; record new findings (gated at reconcile)."

**Dropped (out of scope):**
- The entire gstack runtime preamble in `gstack-learn-skill.md` (telemetry, upgrade checks, AskUserQuestion format, model overlays, voice, continuous-checkpoint) — harness/runtime boilerplate, not explore content.
- CE's `docs/solutions/` storage convention as the literal recall path — superseded by the gbrain MCP read + `docs/decisions.md` fallback (D31).
- The learn skill's prune/export/stats commands — those manage a learnings store; explore *reads* recall, it does not curate the store (curation is `capture-learnings`/`log-decision`).

**Edge only (separate node / not absorbed):**
- The **product-map / learnings manifest** — the crystallization asset is node-like *as an artefact* but is a harness-supplied **reference**, modelled as a `references` edge (`external: true`), not absorbed body content. See Edges.
- Persisting findings back into the recall store — a separate node (`log-decision` at `reconcile`/`debrief`), reached by the consuming stage's flow, not by explore.

## Overlaps and seams

- **explore ↔ the consuming stages (align-context / design / plan / build).** explore is the
  *receiving* end of an `invokes` edge that lives on each stage (those edges are authored on the
  stage nodes later, **not** here, per the brief). At the seam, the stage hands explore a scope +
  target via the spawn prompt and the manifest pointer; explore hands back the digest. explore
  declares **no** `invokes`/`composes-into` of its own for these (F7: its consumers don't all
  exist yet, and a shared utility agent isn't a backbone stage).
- **explore ↔ gbrain (recall substrate).** The `learnings` mode reads gbrain via an **inline
  MCP call** (`mcp__gbrain__query`), capability-gated (degrade to `docs/decisions.md` + Grep if
  absent, D31). Per the graph-spec inline rule + D31, gbrain is **inline, not a node and not a
  `references` edge** — do not model it as an edge.
- **explore ↔ the crystallization manifest.** explore depends on a harness-local product-map /
  learnings manifest via a single `references` edge (`external: true`). The factory ships the
  general agent body + the stable pointer; the harness supplies and *grows* the manifest. The
  body never changes; only the manifest + co-located assets grow (D35).
- **explore ↔ log-decision / capture-learnings.** explore is read-only; it does not write to the
  recall store. New findings it surfaces are persisted downstream at `reconcile`/`debrief` (the
  D35 reconcile gate). No edge from explore here — the consuming stage owns that flow.

## Fit

**Single node, five body branches — confirmed.** Apply the 07-decomposition discriminator:
explore owns its own branching (mode selection) and sequencing (scope → grounding → drill →
synthesise → digest), so it is a node. The five modes share one contract and differ only in
methodology, so by D34 they are **branches in one agent body, not separate nodes** — there is no
node-count divergence between authoring and the rendered `.claude` agent file. Reuse across four
stages is the strongest split signal (D23 reuse ≥2 consumers), which is *why explore is its own
node* rather than inlined into each stage — but reuse argues for **one** shared node, not five.

**Would any mode graduate to its own 1:1 primitive?** Only if a mode earns its own *distinct
measurable goal* (D34). Today all five share the same outcome (relevant context surfaced
efficiently; generative fraction declines) and the same earns-keep, so they stay branches. If,
say, `learnings` later warranted its own recall-precision metric and earns-keep separate from the
others, it could split into its own 1:1 agent — flagged, not done. Recommend: **one explore node**
by default; split a mode only when it earns a separate goal.

## Edges

| edge type | target id | rationale |
|-----------|-----------|-----------|
| references | `product-map-manifest` (`load: on-demand`, `external: true`) | The crystallization asset (D35): a harness-local manifest recording what explore knows about the product and how to explore it. `external: true` because the harness supplies and grows it — it does **not** resolve to a factory `graph/_refs/<id>.md` file; the factory ships only the body + the stable pointer. `on-demand` because it is read at the step of need and grows large. **The one edge explore owns.** |

**Edges explore does NOT declare (and why):**
- **`invokes` (← from stages):** explore is *invoked by* align-context/design/plan/build. Those `invokes` edges are authored on the **stage** nodes (later), not on explore. explore declares no `invokes` of its own.
- **`composes-into`:** none. explore is a **shared utility agent**, not a backbone stage; it does not compose into the `dev-sprint` arc as a stage. (Contrast lens agents, which `composes-into` the arc via their consuming stage — explore is a context utility, not a review lens member, so it stays edgeless here. Confirm at translation.)
- **`loads` / `precedes` / `can-follow`:** none. No structural load of another node; no process-edge position of its own (its consumers don't all exist yet — F7; and it is fanned-out-to, not sequenced into the backbone).
- **gbrain:** **inline MCP call**, not an edge (graph-spec inline rule + D31). Do not model as a node or `references` edge.
- **Mode inline tools** (Context7, web-search/fetch, ast-grep, browse): all **inline** in their mode body, not edges (graph-spec inline rule; D5).

## Conformance

**`primitive:`↔`mode:` agreement:** `primitive: agent` ↔ `mode: autonomous` — agree (D24
autonomous→agent). Confirmed.

**`goals:` as outcomes:** all four goals read as outcomes (context-in-hand / digest precision /
declining generative fraction / bounded context), each with a metric and an earns-keep threshold
— none read as activities. Confirmed.

**Edge targets resolvable:** the one declared edge targets `product-map-manifest`, which is
**intentionally unresolvable to a factory file** (`external: true`, harness-supplied) — this is
by design (D35), not a dangling reference. The translator should render it as an `external: true`
reference, not attempt to resolve it to `graph/_refs/`. No other edge targets to resolve.

## Open questions

- **`external: true` harness-supplied reference is the chosen resolution for the crystallization
  manifest.** D35 leaves "exact reconciliation of a vendored node carrying a harness-growing asset
  area" deferred. This report models it as a single `references` edge marked `external: true` (the
  factory ships the stable general body + pointer; the harness supplies and grows the manifest, so
  it does not resolve to a factory `graph/_refs/` file). Flag for translator/operator awareness:
  confirm `external: true` is an accepted edge attribute in the rendered frontmatter, and that the
  builder skips single-sourcing for `external` references (there is no factory file to place). If
  the schema has no `external` flag yet, this is the first node to need it.
- **Manifest id naming.** `product-map-manifest` is a placeholder id; the operator/harness may
  prefer `explore-manifest` or a per-product name. The body stays general regardless ("consult
  your product-map manifest").
- **Token-budget figure.** The ~500/1000/1500 budget is lifted from CE's web-researcher; confirm
  it is the right cap for repo/learnings digests too, or whether the budget should scale per mode.
- **Where new findings persist.** Confirmed read-only here; new findings ride `reconcile` via
  `log-decision`/`capture-learnings`. No edge from explore — but the translator should make the
  body say explore *proposes* an asset update (gated at reconcile), it does not write the store.
