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

## Behavior contract — what Claude actually does (verified)

The design is only sound if the way we **want** it to behave matches how Claude Code **actually**
behaves. Verified against the official docs (2026-05-30/31). Each mechanism is tagged:
**native** = Claude does it for free · **built** = stack-graph must build it · **convention** =
a vendored node body must be *authored* to do it (not magic).

| Behavior | Verified fact | Kind | Consequence for this design |
|---|---|---|---|
| Auto-discovery | Claude scans only `.claude/` + standard paths; **never** arbitrary trees (`handbook/`, `roadmap/`) | native | the handbook is **navigated, not auto-loaded**; its index path must be made ambient deliberately |
| `CLAUDE.md` cascade | auto-loaded; walks **up** the tree (root→cwd), nested loaded **lazily** on file-read, all **concatenated**; **siblings do not see each other** | native | the **org-root** `CLAUDE.md` (handbook pointer) reaches the workspace AND every product child **for free**; a sibling `workspace/CLAUDE.md` would not — so the pointer lives at the org root |
| `@`-import | path-agnostic (in/out `.claude`, rel/abs), **eager** at load, recursive ≤4 hops; first external import prompts approval | native | the handbook **index** can be `@`-imported into the workspace `CLAUDE.md` to make it ambient |
| Skills | name+description **ambient** at session start; body only on invoke | native | ~50 node descriptions are ambient everywhere — cheap, but keep `description` tight |
| User-scope skills | available in **every** project; absent from the `/` menu (but `/name` + model-invoke still work) | native | vendoring at user scope → graph available everywhere, **no menu clutter** |
| Precedence on name collision | enterprise > user > **project** (user *overrides* project); **plugin skills are namespaced** → cannot collide | native | **vendor as a namespaced plugin (`stack-graph:*`)** so user-scope never shadows a project overlay — do **not** vendor as loose `~/.claude/skills/` files |
| Per-directory skill scoping | **does not exist** — all user/plugin skills are ambient in every dir; Claude never hides by directory | native | our "scoped view" is **orientation, not enforcement**; we cannot natively hide irrelevant nodes in a child |
| `.claude/rules/` | auto-load; with `paths:` frontmatter → **path-gated** to matching globs | native | optional: a path-gated rule can surface a node-owned canon fragment when working in its area |
| Live-edit watching | all scopes reload on `SKILL.md` edit without restart | native | authoring/iteration is immediate at any level |
| Trust gate | a project `.claude`'s `allowed-tools` needs the workspace-trust dialog; user/plugin auto-trusted | native | the user-scope vendored graph is auto-trusted; a project overlay's tool pre-approvals wait on trust |
| Build pipeline | place refs → strip graph keys → place by primitive → index | **built** | refs single-sourced into bundles; the flat plugin is a build output |
| Composed view (agents/hooks/settings) | these **do not nest** natively | **built** | stack-graph generates the composed agent/hook/settings view per directory |
| Per-directory `CLAUDE.md` | not native to *generate*; cascade IS native | **built (only if needed)** | we do **not** generate a per-child `CLAUDE.md` by default — the org-root one cascades in; a local one (or a composed agent/hook view) is added only where a directory needs it |
| External-reference resolution (`handbook`/`code-map`/`assets`) | a vendored node finds the path by **reading the ambient pointer / `bindings.yaml`** | **convention** | the node body must be **authored** to read its binding, then navigate — it is not resolved for us |
| Crystallisation · instrumentation · event log · code-map | none are native | **built** | all are stack-graph mechanisms layered onto Claude |

**The load-bearing path uses only native behavior:** the **org-root** `CLAUDE.md` cascades the
handbook-index pointer into the workspace and every child; nodes `Read` the index and pages on-demand (path-agnostic);
the graph is a namespaced plugin available everywhere without collision. Everything tagged **built**
is stack-graph's own responsibility — it does not come from Claude — and everything tagged
**convention** must be written into node bodies. That split is the honest answer to "will it behave
the way we want": the spine does, by native mechanics; the rest is work we own.

## The three-level scope model

Roles, realised in a tree with **one `CLAUDE.md`** (at the org root), a **docs-only workspace**, and
**a directory per function** (matching Be Civic's `bc-workspace/` + product repos today):

| Role | Directory | Holds |
|---|---|---|
| **User scope** | `~/.claude/` | the vendored, generic stack-graph graph + machinery (read-only) |
| **Org root** | `~/be-civic/` | the **single project `CLAUDE.md`** (navigation) + the overlay + the references we author (handbook index, `bindings`, navigation material) |
| **Workspace** | `~/be-civic/workspace/` | **docs / output ONLY** — the rendered critical documents (handbook, roadmap, marketing plan, risk register, design system, …), one navigable space |
| **Function directories** | `~/be-civic/<function>/` | each function's **working space**: engineering (the products), product (PM working), marketing (campaigns), legal (matters) |

**One `CLAUDE.md`, at the org root — we do not proliferate them.** The workspace gets none; function
directories get none to start. The single project `CLAUDE.md` + the **graph** (ambient skill metadata,
available in every directory) + the **references** we author are the assumed-sufficient navigation. A
per-directory `CLAUDE.md` is added *later, only if* a directory proves to need local orientation.
(Native support: the org-root `CLAUDE.md` cascades *down* into every function/product directory for
free — so a child inherits it without having its own.)

**The workspace is output, not work.** Functions do their work in their own directories; their
**critical outputs graduate into the workspace** (gated by the surface's curator — handbook = heavy
raise/integrate, working surfaces = lighter) where they are rendered. Drafts, alternates, and
archives stay in the function directory.

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
~/
├── .claude/                                    USER SCOPE — vendored, read-only (full contents: Section 1)
│   └── plugins/
│       └── stack-graph/
│           ├── .claude-plugin/
│           ├── skills/
│           ├── agents/
│           ├── hooks/
│           └── lib/
│
└── be-civic/                                   ORG ROOT — the one CLAUDE.md; cascade anchor
    ├── CLAUDE.md                               navigation: handbook-index pointer + how to use the graph + references
    ├── .claude/                                harness overlay (full contents: Section 2)
    ├── .stack-graph/                           generated/local, gitignored
    │   ├── graph-record.json
    │   └── analytics/
    │
    ├── workspace/                              DOCS / OUTPUT ONLY — rendered as one space; no CLAUDE.md
    │   ├── handbook/
    │   │   ├── content/
    │   │   │   ├── 00-overview/
    │   │   │   │   └── README.md
    │   │   │   ├── NN-<section>/
    │   │   │   │   └── README.md
    │   │   │   └── index.json
    │   │   └── .renderer/                      handbook renderer (good — keep/adopt)
    │   ├── roadmap/
    │   ├── marketing-plan/
    │   ├── risk-register/
    │   ├── design-system/
    │   ├── product-canvas/
    │   ├── portal/                             unified UI ("one space, many apps")
    │   └── .workspace-build/                   render machinery (workspace UI build)
    │
    ├── engineering/                            FUNCTION DIRECTORY — the products (each its own repo; Section 3)
    │   ├── plugin/
    │   ├── knowledge-graph/
    │   ├── taxcalc/
    │   ├── landing/
    │   └── renderer-core/
    │
    ├── product/                                FUNCTION DIRECTORY — PM working → graduates to roadmap, product-canvas
    │   └── working/
    │
    ├── marketing/                              FUNCTION DIRECTORY — campaigns → graduates to marketing-plan
    │   └── working/
    │
    └── legal/                                  FUNCTION DIRECTORY — matters → graduates to risk-register
        └── working/
```

The **workspace holds only docs/output**; the **functions work in their own directories** beside it.
A function directory holds that function's working files (engineering: the product repos; marketing:
campaigns; legal: matters; product: discovery); its **critical output graduates into the matching
`workspace/` surface** (rendered), while drafts/alternates/archives stay in the function directory.
None of these directories needs its own `CLAUDE.md` to start — the org-root `CLAUDE.md` cascades in,
and the graph + references carry navigation.

## The workspace: one space, many apps

The `workspace/` directory is the venture's **single navigable space** — every company-level
document (handbook, roadmap, marketing plan, risk register, design system, …) is a surface inside
it, and the operator browses *all the most important information in one place*. This matches Be
Civic's `bc-workspace/` today (handbook · roadmap · bmd · portal · analytics), each surface a
content tree with its own renderer.

- **Render machinery → `.workspace-build/`.** The build that turns the surfaces into the unified
  portal lives in `workspace/.workspace-build/`, kept out of the content. Currently the render is
  **static**; future surfaces may become interactive.
- **Transfer of responsibility (planned, not first priority).** stack-graph should eventually own
  **building and vendoring** the workspace render — but we do not redo the working Be Civic render.
  Standing assessment: **handbook renderer is good → keep/adopt it**; **bmd is OK**; **roadmap is
  weak**. So the plan is to bring the **handbook renderer + the workspace UI build** into
  stack-graph first (the good parts), and transfer/replace the rest later. This is parked, not
  urgent.

## What is actually in `.claude` — the three levels in detail

Legend: ✓ = already built in `graph/`; · = designed (graph-map); ◦ = future function pack.

### 1. User scope — `~/.claude/plugins/stack-graph/` (vendored, read-only)

Flat by primitive (03-plugin-spec). References are **single-sourced into each consumer's
bundle** by the build (copy/symlink), so a skill bundle co-locates the refs it `@`-imports.

Every skill is a bundle directory containing `SKILL.md` and a single-sourced `_preamble.md`
(the instrumentation reference, `load: import`, in EVERY bundle); bundles that depend on other
references also carry those files. Agents are flat files. Status: ✓ built · · designed · ◦ future pack.

```
~/.claude/plugins/stack-graph/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── skills/
│   ├── align-context/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── design/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── specify/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── plan/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── build/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── review/                             ✓ built (the lens cell)
│   │   ├── SKILL.md
│   │   ├── _preamble.md
│   │   ├── findings-schema.md              (load: import)
│   │   ├── severity-scale.md               (load: import)
│   │   ├── confidence-anchors.md           (load: import)
│   │   └── lens-dispatch.md                (load: on-demand)
│   ├── reconcile/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── land/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── debrief/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── debug/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── code-review/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── qa/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── design-review/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── plan-design-lens/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── design-shotgun/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── design-implement/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── optimise/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── ship/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── deploy/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── scrape/
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   ├── handbook-curator/                   ✓ built (the curator cell)
│   │   ├── SKILL.md
│   │   ├── _preamble.md
│   │   ├── what-belongs.md                 (load: on-demand)
│   │   ├── pr-description-shape.md          (load: on-demand)
│   │   └── bundling-rules.md               (load: on-demand)
│   ├── roadmap-curator/                    ◦ future (product-mgmt pack)
│   │   ├── SKILL.md
│   │   └── _preamble.md
│   └── marketing-curator/                  ◦ future (marketing pack)
│       ├── SKILL.md
│       └── _preamble.md
├── agents/
│   ├── lens-correctness.md                 ✓ built
│   ├── lens-security.md                    ✓ built
│   ├── lens-tests.md                        ✓ built
│   ├── lens-maintainability.md             ✓ built
│   ├── lens-adversarial.md                 · designed
│   ├── lens-performance.md                 · designed
│   ├── lens-dx.md                          · designed
│   ├── lens-runtime.md                     · designed
│   ├── lens-external.md                    · designed
│   ├── lens-legal-risk.md                  ◦ future (legal & risk pack — the gate lens)
│   ├── explore.md                          ✓ built
│   ├── pr-author.md                        ✓ built
│   ├── drift-detector.md                   ✓ built
│   ├── queue-checker.md                    ✓ built
│   ├── investigate-probe.md                · designed
│   ├── spec-diff.md                        · designed
│   ├── measure-outcomes.md                 · designed
│   ├── capture-learnings.md                · designed
│   ├── log-decision.md                     · designed
│   ├── consistency-checker.md              · designed (curator integrate fleet)
│   ├── link-validator.md                   · designed (curator integrate fleet)
│   ├── benchmark.md                        · designed (crystallising)
│   ├── health.md                           · designed (crystallising)
│   ├── canary.md                           · designed (crystallising)
│   └── security.md                         · designed (crystallising)
├── hooks/
│   ├── instrumentation.json                node-enter/-exit companion to _preamble (D37)
│   └── session-end-sweep.json              triggers a curator-raise prompt on a dirty session
└── lib/
    ├── refresh-index.mjs
    ├── code-map.mjs                        repo-map + ast-grep (D39)
    └── analytics-rollup.mjs
```

### 2. Org root — `~/be-civic/.claude/` (the harness overlay, committed)

The overlay lives at the **org root** (so it cascades to the workspace *and* every product child).
The company docs themselves live in `workspace/` (Section 2b), not here.

```
~/be-civic/
├── CLAUDE.md                              navigation: "read ./workspace/handbook/content/index.json at task start" (cascades to ALL below)
└── .claude/
    ├── settings.json                      harness settings + generated composed agent/hook view
    ├── skills/
    │   ├── bc-corpus-creator/
    │   │   └── SKILL.md                    bc-only local node (authors the product corpus)
    │   └── bc-onboard/
    │       └── SKILL.md                    entry node → carries an `overlay` edge into vendored align-context
    ├── agents/
    │   └── bmd-curator.md                  bc-only local node (business-model discovery surface)
    ├── stack-graph/
    │   └── bindings.yaml                   a reference (on-demand), NOT a Claude slot — read by the nodes that need it
    └── assets/                            crystallised assets — committed, harness-local (D35 manifest binds here)
        ├── benchmark/
        │   ├── manifest.md
        │   ├── baseline.json
        │   └── run.sh
        ├── qa/
        │   ├── manifest.md
        │   └── flows/
        ├── security/
        │   ├── manifest.md
        │   └── threat-model.md
        └── canary/
            ├── manifest.md
            └── checks.json
```

Two layers resolve "where is this product's X", and the split matters for reliability:

- **The handbook index path is ambient via the cascading `CLAUDE.md`** (native, load-bearing) —
  the **org-root** `CLAUDE.md` says "read `./workspace/handbook/content/index.json` at task start",
  and that reaches the workspace and every child for free. This is the *guaranteed* path; it's how
  Be Civic already works.
- **`bindings` carries the structured rest** (per-surface repo/label, the code-map and assets
  paths) for the nodes that need more than the ambient pointer — the curator (repo+label to open
  PRs), `explore`/code-map (the code-map path), crystallising nodes (the assets path). This is a
  **convention**: those node bodies are authored to read it, and it is the only thing that differs
  between two harnesses on the same vendored graph.

  **`bindings` is a *reference*, not a Claude-native config.** `.claude/` only auto-loads
  `skills/`/`agents/`/`commands/`/`rules/`/`CLAUDE.md`/`settings.json` — an arbitrary path like
  `.claude/stack-graph/bindings.yaml` gets **no special treatment**; it is inert until a node
  `Read`s it. So it behaves exactly like any reference (on-demand), pointed at from the one
  `CLAUDE.md`. It could live anywhere; under `.claude/` is just tidy. Don't mistake it for a
  config Claude resolves for us.

```yaml
bindings:                          # external-reference id  →  where the overlay points it (org-root relative)
  handbook:  { path: ./workspace/handbook/content, index: ./workspace/handbook/content/index.json,
               repo: hk121992/be-civic-workspace, label: handbook }
  roadmap:   { path: ./workspace/roadmap, label: roadmap }
  marketing: { path: ./workspace/marketing, label: marketing }
  risk:      { path: ./workspace/risk }
  assets:    { path: ./.claude/assets }          # crystallisation manifests (org-level)
  code-map:  { path: ./.stack-graph/code-map }   # per-child overridden
```

Two distinct overlay mechanisms: **`overlay` edges** live in local node frontmatter (attach a
local node to a vendored one); **bindings** live in `bindings.yaml` (resolve an `external: true`
reference to a path). Different jobs.

### 3. A product directory — e.g. `~/be-civic/engineering/plugin/` (per-product)

**No `CLAUDE.md` of its own to start** — it inherits the org-root one by cascade. It carries only
what is genuinely product-local:

```
~/be-civic/engineering/plugin/              the Belgian-admin agent product (no CLAUDE.md — inherits org root)
├── .claude/
│   ├── skills/                             child-local overlay nodes (usually none)
│   ├── agents/                             child-local overlay nodes (usually none)
│   ├── assets/
│   │   └── <node-id>/                      product-specific crystallised assets (committed)
│   └── stack-graph/
│       └── bindings.yaml                   OPTIONAL: product-local overrides only (e.g. code-map path); a reference, on-demand
├── skills/                                 the product source (the corpus)
│   └── ...
├── data/
├── working/                                drafts, alternates, archives (NON-critical)
└── .stack-graph/                           generated/local, gitignored
    ├── code-map/
    └── events.jsonl
```

A per-product `CLAUDE.md`, or a generated composed view, is added **only if needed** — agents/hooks
don't nest, so *if* a product relies on local agents we generate their composed view there;
otherwise nothing. The default is: org-root `CLAUDE.md` cascades in, graph + references do the rest.

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
- **One `CLAUDE.md` (org root); none per child by default** — a working directory inherits the
  org-root `CLAUDE.md` by cascade and navigates via the graph + references. We do **not** generate
  a per-child `CLAUDE.md`. A local `CLAUDE.md` or a generated composed agent/hook view is added
  only where a directory genuinely needs it (e.g. local agents, which don't nest natively).
- **`.stack-graph/`** — everything generated and regenerable (code-map, event log, graph-record),
  gitignored. `.claude/` is authored/committed; `.stack-graph/` is machine output.

## Lifecycle flows (behavior-grounded)

How each artefact actually moves, mechanism by mechanism:

**A working session resolves its context.** Open `~/be-civic/engineering/plugin/`. Natively: the
**org-root** `CLAUDE.md` (handbook pointer) cascades in — there is **no child `CLAUDE.md` by
default**, and the sibling `workspace/CLAUDE.md` would not cascade anyway, which is exactly why the
pointer sits at the org root. Every vendored `stack-graph:*` skill is ambient by name+description;
local overlay skills too. The agent navigates — `Read`s the handbook index for canon, invokes graph
nodes for capability, reads the `bindings` reference for paths. *Reality check:* all ~50 node
descriptions are ambient (no native per-dir hiding), so any generated orientation view is
**advisory**, not a hard filter. Keep node descriptions tight so the ambient cost stays low.

**Working → critical (graduation).** A draft lives in a child's `working/`. Its curator
(`handbook-curator` for canon; lighter `roadmap`/`marketing` curators for working surfaces) raises
a PR against the matching workspace surface; integrate merges; the portal re-renders. The handbook
is heavily gated (raise→integrate); high-churn surfaces use a lighter gate. *Native parts:* `gh`
PRs, git. *Built parts:* the curator nodes and the per-surface gate.

**A node reads canon.** `explore` (domain mode) or `drift-detector` reads its `handbook` binding
→ the ambient index path → navigates `index.json` → `Read`s the relevant pages on-demand. All
native (`Read` is path-agnostic); the only authored part is "consult the handbook" in the body.

**A node crystallises.** `benchmark` (etc.) works out this product's specifics on early runs →
proposes an asset → gated at `reconcile` → committed to `~/be-civic/.claude/assets/benchmark/`
→ its stable manifest reference (bound via `bindings.yaml: assets`) points there → next run reuses
it. *Why here:* the node's own bundle is read-only user-scope, so its grown assets must live in
the committed project-scope overlay.

## Behavior risks & what we must build

Honest list of where "wanted" ≠ "free", so we build/verify rather than assume:

1. **No native per-directory skill scoping.** All user-scope nodes are ambient everywhere; we
   cannot hide a child's irrelevant nodes. *Mitigation:* tight descriptions + an orientation
   scoped-view; accept the ambient name/description cost. (If it ever bites, `disable-model-invocation`
   + path-gated rules are levers.)
2. **Composed views are ours to build, but only where needed** — agents/hooks/settings don't nest
   natively. We start with **one org-root `CLAUDE.md`** (no per-child generation); a composed
   agent/hook view is generated only for a directory that has local agents/hooks. Don't pre-build
   per-child context.
3. **`bindings.yaml` + external-reference resolution is a convention** — every canon-centric node
   body must be authored to read its binding. If a node forgets, nothing resolves. Verify in
   `validate`.
4. **`@`-import of an external file prompts approval the first time** — if we `@`-import the
   handbook index from outside `.claude`, the operator sees a one-time approval. Acceptable; note it.
5. **The portal/UI is a separate render**, not native — each workspace surface needs a renderer
   (Be Civic already has per-surface `renderer/` + `index.html`).
6. **`code-map` and `gbrain` are generated/external and capability-gated** — degrade cleanly when
   absent (already the explore/recall posture).

None of these block the design; they're the line between "Claude gives us this" and "we build
this", which is exactly what we needed to be explicit about.

## Generalization → the general spec

This doc is BC-concrete; the spec stays general. Each BC element maps to a general concept that
must be captured in `handbook/content/` (no BC names) — the next step after this design is signed off:

| BC-concrete here | General concept | Spec home (write/amend) |
|---|---|---|
| org-root / workspace / child levels | the **deployment topology** (vendored-at-user / org-root cascade anchor / workspace-critical / child-working) | `04-harness-spec` (new section) + `03-plugin-spec` |
| dedicated `workspace/` dir, one-space-many-apps, `.workspace-build/`, render-build transfer | the **workspace** (top-level critical docs rendered as one navigable space; the factory to own building/vendoring the render) | `04-harness-spec` (**stub added now**) |
| vendor as namespaced plugin (precedence) | **namespacing neutralizes user>project precedence** | `03-plugin-spec` (amend: precedence rationale) |
| critical-output-vs-working-document; graduation | **surfaces have disciplines (canonical/working) + a graduation gate** | a concept page + `06-analytics` (the loop) |
| `bindings.yaml`, ambient index | **external-reference resolution = ambient pointer + overlay binding** | `02-graph-spec` (external refs) + `04-harness-spec` (binding) |
| handbook/roadmap/marketing/risk as surfaces + curators | the **canon-surface + curator family** pattern | `05-maintenance-skill` or a new canon page; D40 |
| one org-root CLAUDE.md (no per-child generation); composed view only where needed | **minimise CLAUDE.md; navigate via graph + references; per-directory composition generated only on demand** | `04-harness-spec` (D12 — make concrete) |
| `bindings` is a reference, not a Claude slot | **non-recognised `.claude/` paths are inert (on-demand only); only the standard slots auto-load** | `03`/runtime page (the loading contract) |
| the verified native mechanics | **the runtime loading/discovery contract** | a new `03`/runtime page (so the spec records what we rely on) |
| functions as arcs / lenses / packs | **a function is a process = arc(s)/lens(es) over the graph** | `01-concepts` (arcs) + `07-decomposition` |
| no per-dir skill scoping (orientation only) | **scoped view is advisory, not enforcement** | `04-harness-spec` (state the limit) |

## Open / next

- **Graduation gate per surface.** The handbook has raise/integrate; roadmap/marketing/risk need
  an equivalent (lighter) working→critical gate. Same curator pattern, tuned per surface.
- **Which functions ship as vendored packs vs are in the core spine** (eng/design is the spine;
  PM/marketing/legal are packs).
- **`product/` vs Be Civic's current `bmd/`** — `bmd` (hypotheses/assessments/findings) is the
  discovery working layer; `product/` is the settled strategy/canvas it graduates into.
