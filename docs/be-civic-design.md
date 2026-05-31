---
title: Be Civic — target directory & harness design (working doc)
status: working draft — 2026-05-31
---

# Be Civic — target directory & harness design

## Design stance (the note)

**We design stack-graph for what Be Civic needs.** Be Civic is the real goal — the first
harness — and the design is driven by delivering it, not by hypothetical generality. The
discipline is only this: **the handbook/spec stays general** (no Be-Civic names, paths, or
product specifics in `handbook/content/`), because the factory is open-source-able. Be-Civic
specifics live in **working docs like this one**, never in the spec. We do not spend effort
generalising past what BC needs or worrying about "per-harness authoring choice" in the spec —
we make the choice BC wants, keep the spec's *language* general, and move.

## The three-level scope model

| Level | Holds | Discipline |
|---|---|---|
| **User scope** (`~/.claude`) | the vendored, generic stack-graph graph + machinery | read-only, never touched (gstack-style) |
| **Workspace** (`~/be-civic/`) | **critical outputs, UI-rendered** — one per surface, curated | canonical / critical |
| **Child** (a product or working project dir) | **working files + its own scoped graph** — source, drafts, alternates, archives | working / per-project |

Rule: **critical outputs live in the workspace and render to the portal; working documents live
in a child.** Working → critical is a *graduation* gated by that surface's curator — the same
pattern as the handbook (raise/integrate), generalised to every surface.

`CLAUDE.md` stays **thin and pointer-based** at each level (orientation + handbook-index
pointer); the workspace `CLAUDE.md` cascades into children for free; a child's thin `CLAUDE.md`
is **generated from its scoped graph view**. The graph (scoped view) is the real "what can I do
here" mechanism; the handbook index is the "what's settled" mechanism. No fat hand-authored
CLAUDE.md chains.

## The four functions

| Function | Attaches as | Workspace surface(s) (critical, rendered) | Curator | Children (working) |
|---|---|---|---|---|
| **Engineering & design** | the dev-sprint **arc** + design sub-arcs + the review cell + explore | `handbook/` (domain, product spec, architecture, devops, operator), `design-system/` (brand, UI kit, tokens) | `handbook-curator` (heavy gate) | the product repos |
| **Product management** | a product-mgmt **arc** that feeds/loops the dev-sprint | `roadmap/` (working surface, high-churn), `product/` (value-prop / business-model canvas / strategy) | `roadmap-curator` (light) | discovery experiments |
| **Marketing & communications** | a campaign **arc** (plan → produce → publish → measure) + comms **cells** | `marketing/` (plan, messaging, channel configs, calendar) | `marketing-curator` | campaign project dirs |
| **Legal & risk** | a legal-risk **lens/gate** (gates ship / land / launch / publish) + a register | `risk/` (register), `legal/` (policies, compliance, contract templates) | light register curator | legal matter dirs |

Settled function content that is *canonical* may be a **handbook section** (e.g. brand
guidelines); living function *outputs* are their own **workspace surface** (roadmap, marketing
plan, risk register). The split is by canonicity/churn.

## The directory (fresh user)

```
~/.claude/                              USER SCOPE — vendored stack-graph (read-only)
  plugins/stack-graph/
    skills/ agents/ hooks/ lib/ _refs/     the graph:
      · spine:         dev-sprint stages, review cell, explore, debug
      · product-mgmt:  roadmap / strategy arc
      · eng-design:    design-review, design-shotgun, design-implement, benchmark, canary
      · marketing:     campaign / comms arc + cells
      · legal-risk:    legal-risk lens + register curator
      · curators:      handbook-curator, roadmap-curator, marketing-curator, … (the family)
    (+ maintainer / build / analytics machinery — not user-touched)

~/be-civic/                             WORKSPACE (parent) — critical outputs, UI-rendered
  CLAUDE.md                                thin: orientation + handbook-index pointer (cascades down)
  .claude/                                 workspace overlay: bc entry nodes, surface bindings, bc-only nodes
  portal/                                  the UI rendering every surface below
  analytics/                               outcome metrics + event rollups (rendered)
  .stack-graph/                            generated/local (gitignored): graph-record, scoped views

  handbook/   content/<NN>/ + index.json   ─┐ Engineering & design (canonical)
  design-system/                            ─┘
  roadmap/                                  ─┐ Product management
  product/    (value-prop / BM canvas)      ─┘
  marketing/  (plan, messaging, channels)   ── Marketing & communications
  risk/       (register)                    ─┐ Legal & risk
  legal/      (policies, templates)         ─┘

  ── children (each its own scoped graph + working files) ──
  ├── plugin/            the Belgian-admin agent corpus (be-civic product)
  │     .claude/           overlay + generated scoped view
  │     skills/ …          product source
  │     working/           drafts, alternates, archives
  │     .stack-graph/      child-local generated (code-map, events)
  ├── knowledge-graph/   bc-knowledge-graph product
  ├── taxcalc/           bc-taxcalc product
  ├── landing/           marketing/eng site
  ├── renderer-core/     shared lib
  ├── campaigns/<id>/    marketing working project (critical plan graduates to marketing/)
  └── matters/<id>/      legal working matter (register entries graduate to risk/)
```

A **child** is any working project dir — a code product, a marketing campaign, or a legal
matter. Its scoped graph surfaces the function pack(s) relevant to it + the spine. Its critical
output graduates up to the matching workspace surface; its drafts/alternates/archives stay local.

## What is actually in `.claude` — the three levels in detail

Legend: ✓ = already built in `graph/`; · = designed (graph-map); ◦ = future function pack.

### 1. User scope — `~/.claude/plugins/stack-graph/` (vendored, read-only)

Flat by primitive (03-plugin-spec). References are **single-sourced into each consumer's
bundle** by the build (copy/symlink), so a skill bundle co-locates the refs it `@`-imports.

```
~/.claude/plugins/stack-graph/
  .claude-plugin/plugin.json, marketplace.json
  skills/
    # spine (engineering & design)
    align-context/SKILL.md · · ·  design/  specify/  plan/  build/  reconcile/  land/  debrief/
    review/                                  ✓ the built cell
      SKILL.md
      findings-schema.md  severity-scale.md  confidence-anchors.md   (load: import — bundled, @-imported)
      lens-dispatch.md                                                (load: on-demand — bundled, pointed-at)
      _preamble.md                                                    (instrumentation, import — in EVERY bundle)
    # design sub-arcs
    debug/  code-review/  qa/  design-review/  plan-design-lens/  design-shotgun/  design-implement/  optimise/  ship/  deploy/  scrape/
    # curator family
    handbook-curator/                        ✓
      SKILL.md  what-belongs.md  pr-description-shape.md  bundling-rules.md   (on-demand)
    roadmap-curator/SKILL.md  ◦   marketing-curator/SKILL.md  ◦
  agents/
    # review lens family
    lens-correctness.md ✓  lens-security.md ✓  lens-tests.md ✓  lens-maintainability.md ✓
    lens-adversarial.md ·  lens-performance.md ·  lens-dx.md ·  lens-runtime.md ·  lens-external.md ·
    lens-legal-risk.md  ◦                    (legal & risk pack — the gate lens)
    # shared sub-nodes
    explore.md ✓  pr-author.md ✓  drift-detector.md ✓  queue-checker.md ✓
    investigate-probe.md ·  spec-diff.md ·  measure-outcomes.md ·  capture-learnings.md ·  log-decision.md ·
    consistency-checker.md ·  link-validator.md ·        (curator integrate fleet)
    # measurement (crystallising)
    benchmark.md ·  health.md ·  canary.md ·  security.md ·
  hooks/
    instrumentation.json          node-enter/-exit companion to _preamble (D37)
    session-end-sweep.json        triggers a curator-raise prompt on a dirty session
  lib/
    refresh-index.mjs  code-map.mjs (repo-map + ast-grep, D39)  analytics-rollup.mjs
```

### 2. Workspace — `~/be-civic/.claude/` (overlay, committed)

```
~/be-civic/
  CLAUDE.md                       thin: orientation + "read handbook/content/index.json at task start" (cascades down)
  .claude/
    settings.json                 workspace settings + generated composed agent/hook view
    stack-graph/
      bindings.yaml               external-reference resolution (the binding mechanism — see below)
    skills/
      bc-corpus-creator/SKILL.md  bc-only local node (authors the product corpus)
      bc-onboard/SKILL.md         entry node → carries an `overlay` edge into vendored align-context
    agents/
      bmd-curator.md              bc-only local node (business-model discovery surface)
    assets/                       crystallised assets — COMMITTED, harness-local (the D35 manifest binds here)
      benchmark/  manifest.md + perf baselines + scripts
      qa/         manifest.md + bc test flows
      security/   manifest.md + bc threat model
      canary/     manifest.md + post-deploy checks
```

`bindings.yaml` is the concrete answer to "how does a vendored node find this product's
handbook":

```yaml
bindings:                          # external-reference id  →  where the overlay points it
  handbook:  { path: ./handbook/content, index: ./handbook/content/index.json,
               repo: hk121992/be-civic-workspace, label: handbook }
  roadmap:   { path: ./roadmap, label: roadmap }
  marketing: { path: ./marketing, label: marketing }
  risk:      { path: ./risk }
  assets:    { path: ./.claude/assets }          # crystallisation manifests
  code-map:  { path: ./.stack-graph/code-map }   # per-child overridden
```

Two distinct overlay mechanisms: **`overlay` edges** live in local node frontmatter (attach a
local node to a vendored one); **bindings** live in `bindings.yaml` (resolve an `external: true`
reference to a path). Different jobs.

### 3. Child — e.g. `~/be-civic/plugin/.claude/` (per-product)

```
~/be-civic/plugin/               the Belgian-admin agent product
  CLAUDE.md                      GENERATED thin scoped pointer (regenerable from the scoped view)
  .claude/
    stack-graph/
      bindings.yaml              child overrides only (code-map → ./.stack-graph/code-map);
                                 inherits the workspace handbook/roadmap bindings by cascade
      scoped-view.md             GENERATED: vendored graph + workspace overlay + this child's overlay
    skills/  agents/             child-local overlay nodes (usually none)
    assets/<node-id>/            child-specific crystallised assets
  skills/ data/ …                the product source (the corpus)
  working/                       drafts, alternates, archives (NON-critical, stays local)
  .stack-graph/                  generated/local (gitignored): code-map/, events.jsonl, graph-record.json
```

### The non-obvious files, explained

- **`_preamble.md` in every bundle** — the instrumentation reference (`load: import`, D37),
  single-sourced into every node so each emits `node-enter`/`-exit`; its companion
  `hooks/instrumentation.json` catches what the body can't.
- **Refs inside bundles** — `findings-schema.md` etc. live *inside* `skills/review/` because the
  build placed the one canonical source there and made `SKILL.md` `@`-import it. One source,
  many bundles, via symlink/copy.
- **`bindings.yaml`** — resolves the `handbook` (and roadmap/assets/code-map) external references
  to workspace paths. This is the harness "wiring," and it is the *only* thing that differs
  between two harnesses on the same vendored graph.
- **`.claude/assets/<node-id>/`** — committed crystallised assets; a vendored node's stable
  manifest reference binds here (it can't write into its own read-only user-scope bundle).
- **`scoped-view.md` + generated `CLAUDE.md`** — a child doesn't hand-author its context; the
  scoped view (vendored + ancestor overlays + own) is generated, and the thin `CLAUDE.md` is its
  pointer. No fat hand-maintained chain.
- **`.stack-graph/`** — everything generated and regenerable (code-map, event log, graph-record),
  gitignored. `.claude/` is authored/committed; `.stack-graph/` is machine output.

## Open / next

- **Graduation gate per surface.** The handbook has raise/integrate; roadmap/marketing/risk need
  an equivalent (lighter) working→critical gate. Same curator pattern, tuned per surface.
- **Which functions ship as vendored packs vs are in the core spine** (eng/design is the spine;
  PM/marketing/legal are packs).
- **`product/` vs Be Civic's current `bmd/`** — `bmd` (hypotheses/assessments/findings) is the
  discovery working layer; `product/` is the settled strategy/canvas it graduates into.
