---
title: Workspace portal — design
status: working draft — 2026-06-01 (Codex-revised)
---

# Workspace portal — design

The **workspace portal** is the operator's read-only comprehension surface over a workspace — the rendered,
navigable union of the handbook + the product-dashboard + a graph browser + analytics. A **factory
capability** (general, reusing be-civic's renderer assets), instantiated per workspace; it resolves the
"workspace render" `04-harness-spec` parks. From the requirements session: operator-facing · read-only ·
all four surfaces · deployed · rebuild-on-merge.

## The data model (the keystone — resolved after review)

The portal is **deployed** (built from git in a CF Worker), so its data splits in two:
- **Authored layer — from git, the bulk of the value.** The canon (handbook), the **work-ledger's authored
  state** (each item's `lifecycle_state`, `gate_decisions`, content, the record, the `frozen_timeline` of
  closed items), objectives/strategy, and the **vendored graph structure**. All committed → present in the
  build.
- **Projection overlay — a sanitized static asset.** The *live, derived* bits — in-flight `current_stage`,
  per-node **last-used**, recent traversals, **AX** — live only in `.stack-graph/` (gitignored, local,
  "never leaves"). On **rebuild**, a **local operator job publishes a sanitized `portal-projection.json`**
  (per-carrier `current_stage` + a transition summary; per-node last-used; AX aggregates — ids/stages/
  timestamps/numeric metrics **only, no raw events/secrets**) into `workspace/dist/` before `wrangler deploy`.
  It is served as a **static asset behind CF Access** at `/portal-projection.json`; there is no
  server-side read. A git-connected CI build has no `.stack-graph/` and emits an empty snapshot. Raw events
  never leave the workspace (locality preserved).
- **Degrade — three states, not a binary.** (a) **Input-gated / empty snapshot** — no events yet; the portal
  shows an explicit "projection input-gated — no dev-sprint events recorded yet" notice (not a silent green).
  (b) **Stale / SHA-mismatch** — snapshot exists and is non-empty but commit hash doesn't match; stale
  banner shown. (c) **Fresh + populated** — SHA matches AND snapshot is non-empty. The authored layer always
  renders in full in all three states.

## 1. Role & surfaces

Operator's **read-only comprehension surface** — navigate canon + read state; act in Claude. Single user.
Deployed (CF Worker), rebuilt on PR merge. A portal index/nav (reused from be-civic's `portal/`) unifies:

- **Handbook** — the canon (authored).
- **Product-dashboard — work-ledger-first:** the **work-ledger** lead panel — now/next/later (by
  `lifecycle_state`, authored) + the record; each item's lifecycle/gates/content/`risk_state`/`outcome_link`
  (authored) + `current_stage` (projection overlay). **Progress** (OKR/north-star, authored; analytics
  input-gated). **Vision & strategy** (authored).
- **Graph browser** — the **whole graph** (structure from the **committed/vendored** graph; DOT→SVG +
  reused `graph-viewer.js`); **two health traffic-lights/node** — last-updated (git, authored) + last-used
  (projection overlay); **click-sidebar** for detail.
- **Analytics** — conformance · AX · trends (projection overlay + git); input-gated, thin pre-launch.

**Access — fail-closed, never public.** The portal exposes the operator's whole strategic surface (vision,
strategy, the work-ledger, the graph, analytics) — so the deployed surface is **private by default**.

The deployed portal is **static assets served by a Cloudflare Worker with no worker code** (Workers Static
Assets). Access control is **solely Cloudflare Access (Zero Trust)** at the edge, scoped to the **single
operator identity** (email allowlist or operator IdP); default deny. There is **no application-layer
second gate** — a request blocked by CF Access never reaches the assets, but if CF Access is
misconfigured there is nothing behind it to catch the error. This means **correct CF Access configuration
is a hard, verified release gate**: the deploy is not live until an anonymous `curl` to the Worker route
returns the Access challenge (302/403), not 200.

The **projection snapshot** (`/portal-projection.json`) is a **sanitized static asset behind the same CF
Access gate** — not a private server-side store. It is safe to serve this way because the publisher emits
only sanitized aggregates (ids, stages, timestamps, numeric metrics — no raw events or secrets). No write
or command surface is exposed. This is a build-blocking contract, not a nice-to-have.

*(Future hardening: a real Worker that validates the `Cf-Access-Jwt-Assertion` JWT on every request would
add an application-layer defense-in-depth gate, but it is not built yet.)*

## 2. Freshness + merge-governance

**Rebuild on PR merge** (CF Worker), **debounced/batched** (not one build per tiny mutation).

**Snapshot freshness — three states (not a binary).** A snapshot is one of:
- **(a) Input-gated / empty** — no carriers or nodes in the projection (expected state pre-exercise, before
  any dev-sprint events exist). The portal renders the authored layer in full and shows an explicit
  **"projection input-gated — no dev-sprint events recorded yet"** notice (not a silent green). This is the
  expected degraded state for a factory build or a git-connected CI build (which has no `.stack-graph/`).
- **(b) Stale / SHA-mismatch** — the snapshot exists and is non-empty, but its `provenance.commit` does not
  match the current build's commit SHA. Render authored layer + a stale-snapshot banner.
- **(c) Fresh + populated** — SHA matches the current commit AND the snapshot is non-empty (carriers and
  nodes present). The portal renders live projection data.

Note: SHA-match alone is insufficient — a snapshot whose `generated_at` predates the commit it claims is
also suspect. The portal must surface the snapshot's `generated_at` age alongside the SHA match, and a
snapshot older than the commit it claims should be flagged as potentially stale. (The publisher already
suffixes `-dirty` for dirty trees, so a dirty publish degrades to state b.)

**Merge policy.** The two-tier merge policy below is the **target state**. **Auto-merge MUST remain
disabled** until the classifier + CI invariants ship as **required** CI status checks. Until then, all
merges are PR-reviewed.

- **Auto-merge tier (target — not active until guards ship)** — the operational ledger, after a **diff
  classifier + CI invariants** pass:
  - **Classifier — deep, typed JSON-path leaf diff.** Auto-merge **only when every changed path** is under
    the work-ledger surface (`items/<id>.md`, `items/manifest.json`, `sprints/<id>.md`) **and every changed
    frontmatter leaf** is in the allowlist — `lifecycle_state`, `gate_decisions[]`, and curator content
    (`risk_state`, `outcome_link`, `value_prop_link`, `tier`, `disposition`) + the body. The diff is a
    **deep, typed JSON-path leaf diff**: every changed leaf must resolve to a path in the allowlist;
    `links` and `risk_state` are **closed schemas** (known sub-keys only — no open maps); **YAML
    anchors/aliases/merge-keys are rejected** in ledger frontmatter. **Any** other path, field, or
    unexpected key → PR-approval tier.
  - **`stage_override` → PR-approval tier.** `stage_override` overrides the projection and can
    misrepresent live state with no automatic gate. It is therefore a **PR-approval-tier field** — not in the
    auto-merge allowlist. Where an operator must override, the commit must carry an authored justification
    (a `gate_decision` entry or a matching gate token); failing that, the classifier routes it to PR
    approval.
  - **CI invariants (block → route to PR, never auto-merge on failure):** (a) **schema-valid**
    (`work-item-schema`); (b) **`gate_decisions[]` append-only** — the diff must be a pure append; the
    append-only invariant is enforceable only against a **stable-identity log** (each entry carries a
    monotonic `seq` + a content hash — see §6 / `work-item-schema`); (c) **the gate-token rule** — any
    `lifecycle_state` change **must** be accompanied by a newly-appended `gate_decision` whose `decision`
    authorises it; a lifecycle change *without* its gate entry is blocked (so a lifecycle/gate auto-merge
    always *reflects an already-operator-approved gate* — the `gate_decision` **is** the approval token,
    not a bypassed review); (d) **manifest stale-check** — `manifest.json` matches a fresh `refresh-index`.
  - **Content edits** (why, `risk_state`, links, disposition) are durable product memory, but auto-merge is
    safe because they are schema-valid, within-surface, carry the **curator's integrate-gate provenance**
    (the authoring approval), and are git-recoverable — no separate token needed.
- **PR-approval tier** — handbook/canon, sprint-plan, objectives/OKRs, strategy/vision, graph/node changes,
  `stage_override`, **and anything the classifier rejects**.

Maps onto the gate model + the curator's integrate gate.

## 3. Build architecture (in stack-graph, reusing be-civic's assets)

- **Vendor `bc-renderer-core`** (TS markdown/shell/nav pipeline + CSS design system + `graph-viewer.js`)
  under `workspace/renderer/vendor/`.
- **Copy + adapt the handbook-renderer architecture** (`build.ts`, `content.ts`, `asset-prefix.ts`,
  `heading-render.ts`) — generic; matches stack-graph's `handbook/content/`.
- **Build new:** the **dashboard panels** (render fns over the bound surfaces + the projection snapshot →
  HTML via `renderShell`); the **graph browser** (DOT→SVG from the committed graph structure +
  `graph-viewer.js` + the two health traffic-lights + node click-sidebar); the **analytics views**.
- **The projection-snapshot publisher** — a small local job (run on rebuild/merge) that reads `.stack-graph/`
  + emits the sanitized `portal-projection.json` (ids/stages/timestamps/numeric aggregates only) into the
  `workspace/dist/` output before `wrangler deploy`. The snapshot is a static asset served behind CF Access
  — **not** a private server-side store; it is safe because the publisher emits only sanitized content.
- **Reuse `portal/`** as the index/nav; **deploy** via a CF Worker (Workers Static Assets, no worker code;
  reuse be-civic's `wrangler` pattern), rebuilt on merge. The build needs **full git history** (not a
  shallow checkout) for `last-updated`.
- **Git-connected CF Workers Builds** (the "push to `main`" path) **always produces an authored-only /
  input-gated portal** — the CI environment has no `.stack-graph/` (gitignored), so the publisher emits an
  empty snapshot → the portal shows the authored layer + the input-gated notice (state a above). To surface
  live projection on the deployed portal the operator must run `wrangler deploy` **locally** (where
  `.stack-graph/` exists) after running the publisher. A future alternative — publishing the snapshot to CF
  KV/R2 and a Worker that reads it at request time — is an **input-gated decision to revisit once the loop
  produces real events** (no projection exists yet; premature now).

## 4. Branding — swappable layer

Use be-civic's style template **as-is for now** (wordmark, favicon, palette, theme key), **but factor the
brand into one swappable layer** — a brand config (`wordmark`, `favicon`, palette tokens, the `*_theme`
key) the renderer + panels read, **defaulting to be-civic's values** — replaceable later without touching
the renderer or panels.

## 5. Build-data contract (per surface)

| Surface | Source | Committed / snapshot | Missing-data behavior |
|---|---|---|---|
| Handbook | `handbook/content/` (bound) | committed | n/a (always present) |
| Work-ledger (authored) | work-items + `manifest.json` + objectives + strategy (bound) | committed | render as-is |
| Work-ledger `current_stage` / in-flight | `portal-projection.json` (static asset behind CF Access) | snapshot | input-gated notice (empty) · stale + banner (SHA-mismatch) |
| Graph structure | the **committed/vendored** graph (record), single sourced — *not* `.stack-graph/` | committed/vendored | n/a |
| Graph `last-updated` | git history | committed | "—" if shallow |
| Graph `last-used` / health / AX | `portal-projection.json` (static asset behind CF Access) | snapshot | input-gated notice (empty) · stale + banner (SHA-mismatch) |

(Path note: the **factory** keeps `graph/graph-record.json` as the committed source-of-truth structure;
a harness vendors it with the plugin; the *generated/local* `.stack-graph/` copy is **not** the portal's
structure source. Health/last-used come from the snapshot, not the gitignored record.)

## 6. Interface contracts (keep the renderer-core boundary clean)

Concrete shapes so be-civic coupling can't leak. renderer-core's inputs are its `ShellArgs` + the markdown
pipeline — host code supplies brand + content, never the reverse.

**Brand config** (`brand.config.json`; defaults = be-civic's values):
```
{ "wordmark": { "text": string, "svg"?: path }, "favicon": path,
  "palette": { "<token>": "<css-value>", … }, "theme_key": string }
```

**Projection snapshot** (`portal-projection.json`; a static asset in `dist/`, served behind CF Access):
```
{ "provenance": { "commit": sha, "generated_at": iso8601, "generator_version": string },
  "carriers": { "<item-id>": { "current_stage": stage|null, "transition_summary": [ { "stage": s, "at": iso } ] } },
  "nodes":    { "<node-id>": { "last_used": iso|null, "traversals_30d": int } },
  "ax":       { "<node-id>": { "tokens_total": int, "tokens_to_outcome": int, "duration_ms": int,
                               "latency_ms": int, "steps": int, "steps_to_outcome": int,
                               "tool_calls": int, "backtracks": int, "tool_path_breadth": int } },
  "trends":   { "<series-name>": [ { "at": iso, "value": number } ] },
  "conformance": { "experience_contract": { "pass": int, "fail": int } } }
```

Every event timestamp carried into the snapshot (`transition_summary[].at`, `trends[].at`) must be a **strict
UTC ISO-8601 instant** (`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$`); a non-string or non-matching
`ts` drops the event/point (`new Date()` alone parses free-text/comment-bearing strings, which would leak).
The publisher stores only the **normalized** value (`new Date(ts).toISOString()`), never the raw `ts`.
(`provenance.generated_at` is generated by the publisher, not from events, so it is exempt.)

The `ax` shape is a **closed numeric leaf set** — the publisher drops any field not in the allowlist above.
The allowlist (in `publish-projection.ts` `AX_NUMERIC_KEYS`) is: `tokens_total`, `tokens_to_outcome`,
`duration_ms`, `latency_ms`, `steps`, `steps_to_outcome`, `tool_calls`, `backtracks`, `tool_path_breadth`.
A key absent here is dropped on read — keep this list, `AX_NUMERIC_KEYS`, and the analytics AX table in
lockstep (a key missing from any one is silently dropped on that surface).

The `trends` section is a **closed series-name set** — `publish-projection.ts` `TREND_SERIES` =
{`benchmark.perf`, `health.quality`}. Trend measurements ride the **node-exit** event's optional
`metrics: { <series>: number }` slot (documented in `instrumentation-preamble`); the publisher reads only
allowlisted series names, finite-number-guarded, never spreading the `metrics` object verbatim. An unknown
series name or non-numeric value is dropped. Each series is an ordered list of `{at, value}` points
(time-sorted) the analytics *metric-trends-vs-earns-keep* axis renders as a slope.

The `conformance.experience_contract` block is a **pass/fail tally** of the closed
`experience-contract:<pass|fail>` gate token emitted on `simulate-users`' node-exit event. The publisher
counts only this one closed-allowlist token and surfaces the tally — it **never** reads or echoes any gate
string (free-text gate names stay private per the sanitization contract). The analytics *conformance* axis
renders this as a UX-conformance pass rate.

An empty `"carriers": {}` and `"nodes": {}` (with `"trends": {}` and a zero `conformance` tally) is valid
JSON but signals the **input-gated / no-events** state (state a in §2); the portal renders the authored
layer + the input-gated notice rather than treating it as a fresh projection.

**Dashboard data model** (what the panels consume — the *join* result): per item, the authored fields from
`work-item-schema` (`lifecycle_state`, `gate_decisions[]`, content) **+** the snapshot's
`carriers[id].current_stage`; objectives from `okr-schema`. The "each field marked `source: committed |
snapshot`" annotation is a **future display nicety** — not built yet. What the current build does: authored
fields always render in full; snapshot-sourced fields are shown with a degraded/stale visual (banner or
indicator) when the snapshot is absent, empty, or SHA-mismatched.

**Terminal items — recorder-freeze invariant.** A terminal `lifecycle_state` (`shipped`/`live`/`parked`/
`killed`) should always imply `frozen_timeline` present (see `work-item-schema` §3 and `artefacts-design`
§5). The CI build should treat a terminal item **lacking** `frozen_timeline` as a **data-integrity
warning** — rendered with a visible flag rather than silently omitting the timeline. This is an invariant
the recorder enforces and CI validates.

**Degradation contract:** every snapshot-sourced field has a defined fallback (table §5) — render
`stale`/`unknown` + a provenance banner (snapshot `generated_at` + `commit`, and whether its SHA matches
the build, and the age of the snapshot relative to the commit); the authored layer always renders in full.
A panel **never** blanks or errors on a missing snapshot.

**Markdown sanitization — Phase-C release gate.** Markdown bodies are currently rendered with raw-HTML
passthrough (`marked` has no sanitizer). This is safe while all content is operator-authored canon in this
factory repo. Before a harness renders untrusted product content (`--root`/`DASHBOARD_ROOT` pointed at a
product ledger — Phase C), markdown HTML **must** be sanitized: escape raw HTML, drop `<script>` tags and
non-`http(s)` hrefs, applied per-surface (trust the handbook canon; sanitize product ledger content). This
is a **Phase-C release gate** (input-gated: no untrusted content renders in the factory today).

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `04-harness-spec` | workspace render (parked); bindings | The portal is that render; reads surfaces via bindings; `.stack-graph/` is local-only → the snapshot publisher bridges to the deployed build |
| `03-plugin-spec` | vendor pipeline | The portal renderer is the workspace-output render, **not** a `.claude` primitive — a separate workspace tool |
| `06-analytics` | projection / event log | The snapshot is a *sanitized publication* of the local projection; raw events stay local |
| `02-graph-spec` | storage & projection | Graph structure = committed/vendored record; health = snapshot |
| *(design)* | `artefacts-design`, `product-dashboard-design` | The authored layer the dashboard renders |

## 7. Open / deferred

- **Snapshot as a build artifact (static in `dist/`)** — the current, as-built model. The alternative
  (CF KV/R2 + a Worker that reads it at request time) would allow live projection without a local deploy,
  but is an **input-gated decision** — no projection events exist yet; revisit once the loop runs.
- **Application-layer JWT validation** — a future Worker that validates `Cf-Access-Jwt-Assertion` would add
  defense-in-depth; not built. Until then, correct CF Access configuration is the only gate.
- **Interactivity** — not now (read-only); a command surface is out of scope.
- **The DOT→SVG pipeline** — reuse be-civic's KG approach if suitable, else a small Graphviz step.
- Graduates → built in A3b, **once the data model + merge-guard contract above are the build's spec.**
