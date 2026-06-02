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
- **Projection overlay — a published snapshot.** The *live, derived* bits — in-flight `current_stage`,
  per-node **last-used**, recent traversals, **AX** — live only in `.stack-graph/` (gitignored, local,
  "never leaves"). So on **rebuild**, a **local operator job publishes a sanitized `portal-projection.json`
  snapshot** (per-carrier `current_stage` + a transition summary; per-node last-used; AX aggregates — **no
  raw transcripts/secrets**), keyed by the commit SHA, to the deploy store (CF KV/R2/build artifact). The
  build **joins** authored-from-git + this snapshot.
- **Degrade loudly.** When the snapshot is absent or its SHA ≠ the build's, the portal renders the authored
  layer in full and shows the projection bits as **stale/unknown** with a visible banner (snapshot
  timestamp + commit). Raw events never leave the workspace (locality preserved).

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
strategy, the work-ledger, the graph, analytics) — so the deployed surface is **private by default**:
**Cloudflare Access (Zero Trust)** in front of the Worker, scoped to the **single operator identity**; the
Worker **rejects unauthenticated requests** (no anonymous read). The **snapshot store** (KV/R2) is
**not publicly readable** — the Worker reads it server-side, never a public URL. No write/command surface is
exposed. This is a build-blocking contract, not a nice-to-have: the portal must be incapable of serving
anonymously before A3b ships.

## 2. Freshness + merge-governance

**Rebuild on PR merge** (CF Worker), **debounced/batched** (not one build per tiny mutation). A **two-tier
merge policy with guards** (auto-merge is *validated*, never blind):

- **Auto-merge tier** — the operational ledger, but only after a **diff classifier + CI invariants** pass
  (auto-merge is *validated*, never blind):
  - **Classifier (path + field allowlist):** auto-merge **only when every changed path** is under the
    work-ledger surface (`items/<id>.md`, `items/manifest.json`, `sprints/<id>.md`) **and every changed
    frontmatter field** is in the allowlist — `lifecycle_state`, `gate_decisions[]`, `stage_override`, and
    curator content (`risk_state`, `outcome_link`, `value_prop_link`, `tier`, `links`, `disposition`) + the
    body. **Any** other path or field → PR-approval tier.
  - **CI invariants (block → route to PR, never auto-merge on failure):** (a) **schema-valid**
    (`work-item-schema`); (b) **`gate_decisions[]` append-only** — the diff must be a pure append, no
    edit/delete of an existing entry; (c) **the gate-token rule** — any `lifecycle_state` change **must** be
    accompanied by a newly-appended `gate_decision` whose `decision` authorises it; a lifecycle change
    *without* its gate entry is blocked (so a lifecycle/gate auto-merge always *reflects an
    already-operator-approved gate* — the `gate_decision` **is** the approval token, not a bypassed review);
    (d) **manifest stale-check** — `manifest.json` matches a fresh `refresh-index`.
  - **Content edits** (why, `risk_state`, links, disposition) are durable product memory, but auto-merge is
    safe because they are schema-valid, within-surface, carry the **curator's integrate-gate provenance**
    (the authoring approval), and are git-recoverable — no separate token needed.
- **PR-approval tier** — handbook/canon, sprint-plan, objectives/OKRs, strategy/vision, graph/node changes,
  **and anything the classifier rejects**.

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
  + emits the sanitized `portal-projection.json` to the deploy store, keyed by commit SHA.
- **Reuse `portal/`** as the index/nav; **deploy** via a CF Worker (reuse be-civic's `wrangler` pattern),
  rebuilt on merge. The build needs **full git history** (not a shallow checkout) for `last-updated`.

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
| Work-ledger `current_stage` / in-flight | `portal-projection.json` | snapshot | stale/unknown + banner |
| Graph structure | the **committed/vendored** graph (record), single sourced — *not* `.stack-graph/` | committed/vendored | n/a |
| Graph `last-updated` | git history | committed | "—" if shallow |
| Graph `last-used` / health / AX | `portal-projection.json` | snapshot | stale + banner |

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

**Projection snapshot** (`portal-projection.json`; published outside git, keyed by SHA):
```
{ "provenance": { "commit": sha, "generated_at": iso8601, "generator_version": string },
  "carriers": { "<item-id>": { "current_stage": stage|null, "transition_summary": [ { "stage": s, "at": iso } ] } },
  "nodes":    { "<node-id>": { "last_used": iso|null, "traversals_30d": int } },
  "ax":       { "<node-id>": { … aggregate metrics } } }
```

**Dashboard data model** (what the panels consume — the *join* result): per item, the authored fields from
`work-item-schema` (`lifecycle_state`, `gate_decisions[]`, content) **+** the snapshot's
`carriers[id].current_stage`; objectives from `okr-schema`; each marked `source: committed | snapshot`.

**Degradation contract:** every snapshot-sourced field has a defined fallback (table §5) — render
`stale`/`unknown` + a provenance banner (snapshot `generated_at` + `commit`, and whether its SHA matches the
build); the authored layer always renders in full. A panel **never** blanks or errors on a missing snapshot.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `04-harness-spec` | workspace render (parked); bindings | The portal is that render; reads surfaces via bindings; `.stack-graph/` is local-only → the snapshot publisher bridges to the deployed build |
| `03-plugin-spec` | vendor pipeline | The portal renderer is the workspace-output render, **not** a `.claude` primitive — a separate workspace tool |
| `06-analytics` | projection / event log | The snapshot is a *sanitized publication* of the local projection; raw events stay local |
| `02-graph-spec` | storage & projection | Graph structure = committed/vendored record; health = snapshot |
| *(design)* | `artefacts-design`, `product-dashboard-design` | The authored layer the dashboard renders |

## 7. Open / deferred

- **Snapshot publisher mechanics** (CF KV vs R2 vs build artifact; the local job's trigger) — decided at
  build (A3b); KV keyed by SHA is the leading option.
- **Interactivity** — not now (read-only); a command surface is out of scope.
- **The DOT→SVG pipeline** — reuse be-civic's KG approach if suitable, else a small Graphviz step.
- Graduates → built in A3b, **once the data model + merge-guard contract above are the build's spec.**
