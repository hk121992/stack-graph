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

## Open / next

- **Graduation gate per surface.** The handbook has raise/integrate; roadmap/marketing/risk need
  an equivalent (lighter) working→critical gate. Same curator pattern, tuned per surface.
- **Which functions ship as vendored packs vs are in the core spine** (eng/design is the spine;
  PM/marketing/legal are packs).
- **`product/` vs Be Civic's current `bmd/`** — `bmd` (hypotheses/assessments/findings) is the
  discovery working layer; `product/` is the settled strategy/canvas it graduates into.
