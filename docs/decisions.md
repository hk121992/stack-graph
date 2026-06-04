---
title: Decision log
status: v0.17.0 — 2026-06-02
---

# Decision log

Locked decisions with rationale, alternatives weighed, and status. Each entry is terse;
the narrative is in [design-history.md](design-history.md), the current truth in the
[handbook](../handbook/content/). Supersede entries in place; keep the prior position.

## Factory & graph model

**D1 — Factory / product split.** stack-graph is a general, process-agnostic factory; a
product runs *inside* it. *Why:* a reusable core, with devops-improvement decoupled from
product work. *Status:* Accepted.

**D2 — Nodes are Claude primitives; no invented vocabulary.** A node is a real `.claude`
element (skill / agent / command / script); hooks are `triggers` edges, MCP is inline,
references are endpoints, settings are attributes. *Why:* ride Claude's own model; avoid a
parallel taxonomy that drifts. *Rejected:* a coined node-type set
(orchestrator/worker/reference/template/resolver). *Status:* Accepted.

**D3 — The graph is frontmatter on the canonical files.** Edges, classification, and goals
live as extra frontmatter on each node file; the record is *scanned*, not stored separately.
*Why:* a node file is then both a working primitive and a graph node — "derived lens, not a
store" becomes literal. *Status:* Accepted.

**D4 — Cyclic graph; only process edges loop.** Structural / binding / overlay edges are
acyclic; `precedes` / `can-follow` may cycle. *Why:* workflows loop, but the structural
skeleton should stay a DAG. *Status:* Accepted.

**D5 — Not everything is a node or edge.** Small references and MCP calls are inline. *Why:*
only control-flow-owning things earn a node. *Status:* Accepted.

**D6 — Canonical = real `.claude` files; plugin vendored from the handbook.** Files are the
source of truth (not a database, not gbrain); the plugin is a build output. *Status:*
Accepted.

## Customisation & composition

**D7 — Customisation = additive local overlay.** A harness attaches local nodes to the
vendored graph via an entry node or an edge; the vendored graph is never mutated; updates
arrive through Claude's native plugin-update. *Status:* Accepted.

**D12 — Ride the cascade where it works; generate where it doesn't.** Skills / `CLAUDE.md` /
plugins compose via Claude's native cascade; agents / hooks / settings (which Claude does
*not* nest) get a generated composed view; the per-directory scoped view is produced at a
runtime preamble; one global record is generated for analytics. *Why:* Claude's cascade is
partial (verified against the docs). *Status:* Accepted.

**D16 — Overlay is extend-only.** An overlay may add a node or an edge into a vendored node;
it may **not** shadow, replace, or re-route vendored behaviour. *Why:* the vendored graph
then behaves identically in every workspace, two consumers cannot diverge, and there is
nothing to resolve (no precedence/conflict model needed). *Rejected (for v1):* a
local-shadow/override capability — kept as a named future option. *Status:* Accepted.

## Workflow & method

**D8 — "Workflow," not "Process."** A workflow is a named, possibly-cyclic traversal over
nodes. *Why:* product-agnostic vocabulary — "Process" collides with product-domain terms.
*Supersedes:* the earlier "stations" / "processes" grouping sketches. *Status:* Accepted.

**D9 — Collaborative → skill, autonomous → agent; collaboration front-loaded, autonomy in
the build.** *Why:* the boundary is simply where the operator is in the loop; the
design/alignment front is the thick collaborative part, the build is the long autonomous
span (between plan-defined breakpoints), and the close is collaborative again. *Supersedes:*
the first "human at start/end only, autonomous middle" framing. *Status:* Accepted.

## Loop, analytics & decisions

**D10 — Analytics is first-class: outcomes + metrics + earns-its-keep.** Every node declares
goals as measurable *outcomes* (not activities) and how they are measured; a node that never
moves its outcome is visible and cuttable. Instrumentation is deterministic. *Status:*
Accepted.

**D11 — Decisions are two-layer.** A curated decisions store (conclusions) over a recall
substrate (e.g. gbrain) of the surrounding reasoning. *Why:* curation and recall are
different jobs; neither subsumes the other. *Status:* Accepted.

**D17 — Analytics is local-only.** Graph-layer events stay in the workspace that produced
them (local event log + local gbrain); there is no central telemetry. Cross-workspace
learning flows only as human-curated factory-loop PRs. *Why:* the factory stays blind to any
consumer's usage by construction; privacy-clean; no telemetry pipeline to build or secure.
*Rejected (for v1):* an opt-in central aggregate feed. *Status:* Accepted.

**D20 — Event binding = preamble + hooks, bound by id.** Two emitters: a deterministic
instrumentation preamble the build injects into every node body (`node-enter`/`-exit`/gate),
and hooks for native events (a `triggers` edge). Events carry the `node` id (or `from`+`to`
→ an edge) and resolve against the graph record; a session's ordered node events are an
observed traversal, and conformance is that traversal checked against a workflow's
`precedes`/`can-follow` edges. *Why:* deterministic timeline, model judgment reserved for
interpretation; resolves Q8. *Status:* Accepted.

## Build, tooling & process

**D13 — Build = hybrid generation.** An agent synthesises a node's canonical from a durable
research-report; deterministic resolvers inject the shared blocks; the render is
idempotency-gated. *Why:* the expensive curation survives format churn, and instrumentation
lands uniformly. *Status:* Accepted.

**D14 — Dev tooling is separate from vendored output; `sg-` prefix.** The maintainer and
curator live in `tooling/`, install by symlink, and are marked `sg-*`; they are not shipped
as vendored, namespaced nodes. *Status:* Accepted.

**D15 — Contribution: bootstrap-direct, then PR-gated.** During bootstrap, spec and tooling
changes land by direct commit to `main`; once `08-devops` fixes the branch/label model and
the curator is exercised, handbook changes move to labelled PRs raised by the curator.
*Status:* Interim (bootstrap).

**D18 — Handbook pages carry no `status:` field.** The page-level `status` line is dropped
from `handbook/content/`; the handbook is canonical by definition and `status` is not in the
`index.json` contract. *Why:* keep the constantly-read surface lean; match the Be Civic
authoring discipline (path/archive encodes status, not a per-page line). *Note:* node files
keep `status:` — a node versions the primitive it builds into (different surface). *Status:*
Accepted.

**D19 — Build = four deterministic stages, idempotency-gated.** `resolve` (expand `{{...}}`
resolvers, inject shared blocks) → `strip` (drop graph-only keys) → `place` (write into the
plugin tree by `primitive:`) → `index` (emit graph-record rows). Output is a pure function of
input; the build flags any committed output that drifts; each emitted primitive is
load-verified. *Why:* concrete resolution of Q5; built output cannot diverge from source.
*Elaborates:* D13. *Status:* Accepted.

**D21 — DevOps branch/label model fixed; bootstrap exit met.** Branches `<kind>/<slug>`
(`handbook`/`tooling`/`graph`/`factory-loop`) with matching labels; the factory loop is a
cross-repo `factory-loop` PR from a consumer, the harness loop stays local; general→factory,
specific→harness. *Why:* resolves the `08-devops` open questions; the exit condition for D15's
bootstrap-direct interim is now met for handbook content. *Status:* Accepted.

## Graph authoring model

**D22 — One graph, two views; rendered into a flat, graph-shaped `.claude` directory.** The
graph is authored in a **granularity-flexible view** — a workflow, sub-workflow, skill, mode,
or step may each be a node, primitive-agnostic — and **rendered** into a flat `.claude`
directory that looks ordinary to a user but in which **every artefact is graph-shaped** (its
edges and goals live in its frontmatter). Not two graphs and not a second store: two views of
one graph. *Why:* honours modes-as-nodes, "rendering doesn't matter," and deferring the
primitive choice, while keeping "the graph is a derived lens over the files." *Refines:* the
graph-spec granularity resolution (Q1 — "one node per primitive" describes the rendered view,
not the authoring view). *Queues amendment:* `02-graph-spec`. *Status:* Accepted — **but the
granularity-flexible / modes-as-nodes aspect is superseded by [D34](#one-node-one-primitive)**
(node ⟷ primitive is 1:1; modes are body branches). The surviving sense of "two views" is two
readings of one *file* (graph frontmatter + native primitive), not a finer-grained authoring
node set.

**D23 — Decomposition = Be Civic's granularity rule, adapted.** Decompose a unit into its own
node when it is **reused** (≥2 consumers), **self-contained and cohesive** (its own branching),
or by **just-in-time** (a consumer needs only part of it); keep it **inline** when used once and
trivial (≤2–3 simple actions); **flatten** deep recursion — "decompose by need, not by
aesthetic." *Why:* sharper and reuse-aware; the operator does not align with the prior
heuristic. *Supersedes:* `07-decomposition`'s "generic-with-branches until it earns a split."
*Queues amendment:* `07-decomposition`. *Status:* Accepted.

**D24 — Skill vs agent = the context-isolation axis.** A **skill** loads instructions into the
**current** context (use when the step needs the live thread); an **agent** runs in an
**isolated** context and returns only a summary (use when the subprocess does not benefit from
the main context, is fully describable in a prompt, is parallelisable, or should be kept out of
the thread). They **compose** — an agent can preload skills; a skill can fork to an isolated
context and can call agents. *Why:* the documented Anthropic discriminator; collaborative vs
autonomous is one correlate, not the rule. *Refines:* D9. *Queues amendment:* `01-concepts`,
`02-graph-spec`. *Status:* Accepted.

**D25 — Asset generation = define-once resolvers + `{{placeholder}}` templates, idempotency-gated.**
Shared blocks are defined once as named resolvers; a node's authoring source (`.tmpl`)
references them via `{{PLACEHOLDER}}`; the build expands every consumer in one pass to
"do-not-edit" outputs; an idempotency test plus a `--dry-run` freshness gate block stale
output. *Why:* concretises the abstract resolver model; proven in gstack's `gen-skill-docs`.
*Concretises:* D13, D19. *Queues amendment:* `03-plugin-spec`. *Status:* Accepted.

**D26 — Keep the canonical agent-instruction reference in-repo, as a pointer.** A handbook
reference page points to Anthropic's canonical docs (skills best-practices, sub-agents,
CLAUDE.md/agent best-practices, prompt-engineering) and the maintainer's authoring agents
follow it; it is a pointer, not a vendored copy. *Why:* the maintainer must author node bodies
to best practice; mirrors Be Civic's `agent-surfaces` page. *Status:* Accepted.

**D27 — Review lenses are a shared, overlay-extensible family.** The lenses (correctness,
security, tests, maintainability, adversarial, performance, design/DX, runtime) are reusable
agent-nodes consumed by **both** `design` (on the design doc) and `review` (on the diff) —
define-once (D25). The factory ships a lean **always-on core** (correctness, security, tests,
maintainability, adversarial) + **conditional** lenses (performance, runtime/qa, design/DX);
**product-specific lenses are harness overlays** (D7), not factory nodes. *Why:* lenses pass all
three D23 split tests + D24 isolation; the two-homes use is define-once reuse, not duplication;
product reviewers in the harness preserve the factory/product split. *Status:* Accepted.

## Native primitives & terminology

**D28 — "Arc" replaces "workflow" as our meta-term.** A named, possibly-cyclic traversal over
nodes is an **arc**; the dev-sprint is the core arc, and sub-workflows become **sub-arcs**.
*Why:* Claude's native `/workflows` primitive (a JS subagent-orchestration script) now owns the
word "workflow"; we avoid the collision. *Supersedes:* D8 ("Workflow, not Process"). *Queues
rename:* handbook (`01`/`02`/`07`, `index.json`) + tooling templates (`composes-into` target is
an arc). *Status:* Accepted.

**D29 — Native `/workflows` posture: plan-time map + run-time executor.** Our graph stays the
canonical **plan-time map** (markdown nodes + edges); an arc renders to a **skill/command**
(Claude-orchestrated, composes all primitives). Claude's native `/workflows` (research-preview
JS orchestrator; composes **subagents only**; not hand-authorable; no public schema) is **not**
a render target or backing store — it is an **optional run-time executor for the autonomous
fan-out** (review lenses, parallel build units), assembled at plan time. *Backlog:* vendor
**playbooks** — native-workflow templates for the multi-agent stages (design, plan, build) —
learn-as-we-go, then refine. *Why:* rides Claude's primitive where it is strongest without
coupling our canonical store to an unstable preview format; honours "composed at plan time."
*Status:* Accepted (posture); playbooks = backlog.

**D30 — Absorb the current Claude Directory taxonomy.** The node taxonomy (D2 rides the real
`.claude` taxonomy) must add what has since shipped: **`rules/*.md`** (path-gated CLAUDE.md
fragments — a `references` endpoint), **`workflows/*.js`** (native; see D29), **`agent-memory/`**
(per-agent state — a `references` endpoint); and **`commands/` is now legacy**, folded into the
skills mechanism (a command is an `invokes`-edge alias or a skill). *Queues amendment:*
`02-graph-spec`, `01-concepts`. *Status:* Accepted.

## Recall substrate & the product arc

**D31 — GBrain is the recall substrate; integrate as a consumer, stay compatible with upstream.**
stack-graph uses gbrain as the **recall** half of the two-layer decisions store (D11): the curated
conclusion lands in `docs/decisions.md`; the surrounding reasoning/transcript goes to gbrain. Rules:
**optional + capability-gated** (no gbrain → fall back to `docs/decisions.md` + Grep); a **per-workspace
gbrain *source*** (not a separate brain), registered via the standard `.gbrain-source` convention;
**reads via MCP** (`mcp__gbrain__query --source …`) at the `explore` learnings mode; **two-layer
writes** at `log-decision`/`reconcile`/`debrief` (conclusion→`docs/decisions.md` always; reasoning→gbrain
if present); **never ingest node files** (canonical `.claude` files are searched with Grep). **Locality
by construction** (D17): each workspace queries only its own source; the factory never sees a consumer's
recall. **Compatibility:** depend on the upstream gbrain source — do **not** fork or vendor it; configure
via its standard chain; pin to the installed CLI surface (0.27.0: `query`/`ask`/`put`/`sync`) and degrade
gracefully, so upstream updates can be relied on. *Spec:* `06-analytics/recall-substrate`. *Status:* Accepted.

**D32 — Product management is a separate arc, feeding and looping the dev-sprint.** Product
discovery/strategy is modelled as its **own factory arc** (a separate tree), upstream of and looping with
the dev-sprint: an **idea-triage** entry (a product-manager shape) → product strategy → roadmap → feeds
the sprint's `align-context`; the sprint's `debrief` loops learnings/outcomes back into product. It adds
a **third top-level artefact — the product roadmap** — alongside the handbook and the graph (general
structure; product-specific content is harness). Emphasis is **strategy over backlog** (backlogs fit
poorly with fast AI dev): a clear long-term concept, the key questions to answer, building a product
customers love. **Product analytics is an *opening*** — a connection point that feeds idea-triage —
deferred and likely harness-specific. *Why:* gstack/CE have strong product *parts* (office-hours,
CEO-lens, ce-strategy) but are feature-based, not a long-term product arc; stack-graph designs the arc.
*Design + prior art:* `docs/product-graph.md`. *Status:* Accepted (direction); **refined by D43/D44** —
PM is two faces (a strategy/discovery loop + a delivery coupling that *rides* the dev-sprint, not a
single separate arc), and the roadmap item becomes the **carrier**.

## Shared content — references, not injection

**D33 — Shared content is a native reference with a load dial; there is no injected-block
primitive.** stack-graph models reusable shared content (the finding contract —
`findings-schema`, `severity-scale`, `confidence-anchors`; the instrumentation preamble;
`lens-dispatch`; common protocols) with **native Claude primitives only**. A **reference** is
a single-source artefact (`graph/_refs/<id>.md`, frontmatter `kind: reference`; no
`goals`/process edges) that one or more nodes depend on via a `references` edge carrying a
**load dial**:
- `load: import` — native **`@-import`**: spliced into the host at *load* time,
  guaranteed-present and not skippable. For short, must-always-be-present invariants.
- `load: on-demand` — the host *points at* the reference and the agent **reads it at the step
  of need**. For larger or conditional material; keeps context lean and reads as its own doc.

The **build single-sources** each reference into its consumers (places/symlinks the one
canonical file and resolves the pointer) — DRY + freshness with **native output**, no
`{{token}}` splice. Shared content destined for a spawned **agent** is passed by the
orchestrator into the agent's **spawn prompt** (CE's pattern), not imported by the agent.
Behaviour that must be *enforced* (not merely present) is a **hook**, not text.

**Supersedes** this session's first-pass injected-"block" framing: `block` / `{{placeholder}}`
/ `uses-block` / render-by-injection are **removed**. `@-import` gives the identical runtime
result natively *and* single-sourced (the host holds a pointer, not duplicated bytes), and
on-demand references keep context lean — so build-time injection has **no runtime niche**.
This was confirmed empirically across **CE** (pure-native: skills + agents + `@-import`/
on-demand references + spawn-prompt substitution; no injection), **ECC** (pure-native; 249
skills / 63 agents; language reviewers are *agents*; shared depth via "see skill: X"
name-pointers; injection-free, though it hand-duplicates a baseline 63× and pays drift),
**gstack** (the lone injector — its `{{TOKEN}}` resolver is a third-party invention justified
only by authoring-side freshness/git-blame, *not* runtime need), and the **Claude Code docs**
(no native build-include; cross-skill sharing is `@-import`/symlink or on-demand reference;
subagents isolate and return summaries; enforcement is hooks).

*Why:* keeps "canonical = real `.claude` files" literally true (the block was the one
non-native primitive); single-source via the build kills the CE/ECC duplication-drift failure
mode; on-demand references resolve the body/block seam. *Queues amendment:* `02-graph-spec`
(references `load` dial; remove the Blocks section + `uses-block` edge), `03-plugin-spec`
(build single-sources references; remove resolver-splice/render-by-injection), `05-maintenance-skill`
(`block` mode → `reference` mode; `index`/`validate` over references not placeholders).
*Surfaced by:* the skill-vs-reference-vs-injection investigation (`docs/build-log-review.md`;
reference projects CE/ECC/gstack; the Claude Code docs). *Status:* Accepted (supersedes the
intra-session injection draft).

## One node, one primitive

**D34 — A graph node renders to exactly one primitive; no modes-as-nodes.** A node maps
**1:1** to a single rendered `.claude` primitive — one node ⟷ one skill / agent / script
file. **Modes** are conditional branches *within* a node's body, never separate nodes.
**Reuse and sizing** are achieved by extracting a right-sized primitive (a smaller
skill/agent) or a **reference** (D33) — each itself 1:1 — never by an authoring view that
models sub-parts as nodes and collapses them at render. **Supersedes** the modes-as-nodes /
granularity-flexible-authoring-view aspect of D22: there is **no node-count divergence**
between the authoring view and the rendered directory. The only "two views" that remains is
that a single node *file* is read two ways — as graph frontmatter (the lens + index) and as a
native primitive (the build) — not as many nodes collapsing into one file. *Why:* falls out of
the native-reference pivot (D33) — once shared content is a native reference and sizing is
native, a node that isn't a real file buys nothing; and "let goals draw the boundary" already
says a sub-part that earns its own measurable goal should be its own primitive (still 1:1).
Simpler model, no collapse machinery, and "canonical = real `.claude` files" holds
node-for-node. *Trade-off:* a mode that stays a body branch has no independent
goal/instrumentation; to measure a mode on its own, split it into its own primitive (1:1
again). *Queues amendment:* `02-graph-spec` (granularity), `07-decomposition` (granularity),
`docs/graph-map.md` (resolves the modes-as-nodes open question). *Status:* Accepted.

## Crystallization — nodes compound their own assets

**D35 — A product-dependent node crystallizes generative reasoning into reusable, co-located
assets; it grows more deterministic the more it runs.** A node that depends on the specific
product (`benchmark`, `health`, `canary`, `qa`, `design-review`, `security`, …)
cannot be a fixed factory script — the factory does not know the product. It is an **agent**
that, on early runs, reasons generatively to work out *this* product (how to benchmark it,
what to health-check, what a canary verifies) and **crystallizes** that into reusable
**assets** — product-specific scripts, configs, and reference checklists. Later runs **load the
assets the node already built, reuse them deterministically, and reason generatively only about
what is new or has drifted**, then update the assets. The generative fraction declines toward an
asymptote (detect-drift + handle-the-new); the node gets cheaper, more consistent, and more
reliable with use. This is the loop at the **node/run level** — a faster, local, automatic
improvement timescale beneath the PR-gated factory/harness loops. Rules:
- **Co-located, harness-local assets.** A node's assets live **in the node's own `.claude`
  directory** (a skill/agent bundle holds bundled scripts + references — the native Claude
  Directory shape), and they are **product-specific → harness-local**. The directory becomes
  tailored to the exact product over time — expected and accepted; no general asset-management
  layer is built at this stage.
- **A stable manifest reference — the body never changes.** The node body carries a **stable
  `references` edge to an asset manifest** recording *what scripts the node has* and *how to
  operate on this product*. The body says "consult your asset manifest"; only the **manifest +
  bundled assets grow**. (A vendored node is read-only, so the body + pointer are the stable
  vendored part and the manifest + scripts are the harness-local grown part; exact
  reconciliation of a vendored node carrying a harness-growing asset area is **deferred**.)
- **Updates ride reconciliation.** New/changed assets are created and gated at the dev-sprint's
  **`reconcile`** stage — the same gate as any other change. No separate trust mechanism; a
  node's self-built assets are reconciled (reviewed, committed) exactly like the rest.
- **Measurable.** Crystallization shows as a **declining generative fraction per run**; a node
  whose generative fraction never falls is not compounding — a loop signal feeding earns-keep.

*Reframes:* the measurement/product-dependent nodes are **agents** (not scripts); their
formerly-scattered harness assets (DESIGN.md, threat model, qa flows) are instances of one
principle. *Note (D38):* `explore` is **not** a crystallizing node — its "asset" was product
*knowledge*, which belongs in the substrate's homes (code-map / recall / canon), not a
co-located manifest; explore consumes those homes and proposes durable findings back to them. *Queues:* a cross-cutting pattern in
`graph-map.md`; notes in `04-harness-spec` (co-located product-tailored assets) and
`06-analytics` (the node-level loop + measurability). *Status:* Accepted (concept; deep
asset-management generalization deferred).

**D36 — The design-quality check is two skills, not a lens-agent.** Design review is delivered
as two standalone **skills** — `plan-design-lens` (design/plan documents) and `design-review`
(the live UI) — not as a member of the autonomous review lens family. Real design review needs
the live main thread and a browser (visual judgment, interaction), which is the **skill** side
of the context axis, not the isolated, prompt-describable **agent** shape the lenses take.
*Reframes:* `graph-map.md`'s lens-family `lens-design` row — design quality is its own skill
sub-arc; the lens family stays code-facing. *Status:* Accepted.

**D37 — The instrumentation preamble is delivered as both an `@-import` reference and a hook
(extends D20).** Node instrumentation uses **both** native mechanisms: a `triggers` **hook**
fires on the enforceable native events (session/tool/subagent — guaranteed, outside model
discretion), and an **`@-import` reference** (`load: import`) carries the in-body gate/outcome
markers the hook cannot observe from outside the node. `import` alone is present-but-not-executed;
a hook alone cannot see in-body points; together they cover enforced native events + in-body
annotations. *Refines:* D20 under the D33 reference/hook split. *Status:* Accepted.

## Knowledge substrate

**D38 — Product knowledge has four homes, and traceability is *authored*, not inferred.** A node
that needs product knowledge does not invent a private store; the knowledge already has homes:
(1) the **handbook** (+ decisions store) — curated spec / domain / rationale (authored, reviewed);
(2) the **code-map** — the product's code structure (calls/deps/defs-refs), deterministically
extracted; (3) **gbrain recall** — reasoning / transcripts / decisions (prose, semantic); (4)
**`.claude` references** — operational executables (scripts/configs). Route any knowledge by what
it *is* (canonical truth → handbook; extracted code structure → code-map; prose recall → gbrain;
executable → reference). **Code↔spec traceability** (the "unified graph" prize) is achieved by
**authoring + curating** it — the `spec touchpoints` discipline, `references` edges, the handbook
page-graph, the raise/integrate flow — **not** by inferring fuzzy edges. *Why:* keeping *inferred*
code↔spec edges fresh is an open, unsolved problem across the whole tooling field (no lineage, no
re-validation); stack-graph's authored-edge model sidesteps it by construction. *Supersedes:* the
invented "product-map manifest" (the crystallization manifest for `explore`) — knowledge goes to
these homes, not a bespoke manifest. *Detail + field survey:* `docs/knowledge-substrate.md`.
*Queues amendment:* `06-analytics` (the partition), `06-analytics/recall-substrate` (gbrain scope),
rework of `explore`. *Status:* Accepted.

## Knowledge-canon maintenance — the curator

**D40 — The handbook curator is a general graph cell (the canon-maintenance loop), not just
factory tooling; raise/integrate is the authored-traceability write path (realises D38).**
Reverse-engineered from the mature `bc-handbook-curator` (Be Civic) the bootstrap
`sg-handbook-curator` was copied from.

- **General, vendored — not bespoke per product.** The curator *pattern* — maintain the
  knowledge canon by `raise → queue → integrate` — is a general capability shipped in the graph
  and **vendored into a harness**, pointed at *that* product's handbook + repo (a harness-overlay
  config: target repo, label, handbook root). The factory's own `sg-handbook-curator` (in
  `tooling/`) is the factory **self-applying** the same pattern to its own handbook (dogfooding,
  per [`08-devops`](../handbook/content/08-devops/README.md)); `bc-handbook-curator` is the
  product instance. Three instances, one pattern.
- **The cell.** Node **`handbook-curator`** (skill, collaborative; modes are body branches per
  D34: `sweep` / `raise` / `integrate` / `refresh-index`) **invokes** agents `drift-detector`
  (sweep+raise), `pr-author` (raise), `queue-checker` (raise dup-check + integrate list),
  `consistency-checker` + `link-validator` (integrate); **references** `what-belongs`,
  `pr-description-shape`, `bundling-rules`, `integrator-checklist`; bundles the `refresh-index`
  script as a co-located operational asset. `drift-detector` + `pr-author` are the same shared
  sub-nodes `specify`/`reconcile` already use (reuse layer).
- **raise vs integrate = the two-session canon loop** — the canon analogue of
  `reconcile`(open) → `land`(gate). **`raise`** is per-change, session-end, **forcing-rule
  triggered** (a `triggers` hook), and produces a **labelled PR** — *the queue IS the set of open
  labelled PRs* (no separate store; `queue-checker` materialises it on demand, and `raise` checks
  it to refuse/redirect duplicates). **`integrate`** is operator-cadence in a **separate session**:
  reads the queue, runs cross-PR **consistency + link** checks, surfaces decisions **synchronously
  in the PR description** (never `AskUserQuestion` mid-mode), walks **batch merges**, calls
  `refresh-index` after. Cyclic: integrate changes canon → future work reads canon → drift →
  raise again.
- **This is D38's write mechanism.** A node (e.g. `explore`) *proposes* a durable finding; the
  proposal becomes a `raise` PR → queue → `integrate` → canon. The curator is **how proposals
  reach the curated-canon home** — it closes explore's "propose to canon via the curator's raise."
  Code-structure (code-map) and prose (recall) homes have their own writers; the curator owns the
  **handbook/decisions** home.
- **Two loops ride one cell.** Factory-loop `raise` targets `stack-graph`; harness-loop `raise`
  targets the product repo (the two loops, [`08-devops`](../handbook/content/08-devops/README.md)).
  Same node; the repo/label/handbook-root differ by overlay.
- **Drift remediation (sg ⟵ bc).** The bootstrap copy under-specified the proven original:
  **restore** `queue` mode + duplicate-detection in `raise` (+ the `queue-checker` haiku agent),
  the `bundling-rules` reference, and **capture the `integrate` contract** (implementation stays
  deferred, but the contract is recorded, not "later"). **Accept** the one deliberate divergence:
  sg's `sweep` is a general drift scan (the factory handbook is smaller than a product's), where
  bc's `sweep <kind>` is named-kind — keep sg's. `spec-amend`/`decision-doc` stay deferred
  (`decision-doc` is product-specific; `spec-amend` folds into `raise` + the spec-touchpoints
  discipline for now).

*Queues amendment:* `docs/graph-map.md` (the curator cell + arc), a curator handbook page (or
`05-maintenance` note) later, and the `sg-handbook-curator` tooling (the drift fix above).
*Status:* Accepted.

**D39 — Substrate tooling: deterministic code-map now, gbrain for recall, inferred-graph tools
deferred.** (a) **Code-map → mature deterministic AST.** `explore`'s `repo` mode uses an
Aider-style **repo-map** (ranked orientation) + **ast-grep** (precise drill-down) — local, no-LLM,
no-DB, deterministic, MCP/CLI. A persistent graph-DB (code-graph-rag / potpie / blarify) is
**deferred** until a node needs **multi-hop / blast-radius impact analysis** (a `review`/`build`
need). (b) **gbrain scope clarified (refines D31):** gbrain is the **prose-recall** layer, **not**
the code-map — it has no structural code ingestion. (c) **graphify / unified-inference deferred**
behind a capability gate — the only single-tool aspirant, but its code↔spec edges are LLM-inferred,
unverified, and freshness-unsolved; revisit per the triggers in `docs/knowledge-substrate.md`
(a real impact-analysis need; a tool proving fresh code↔spec edges on our corpus; authored
traceability proving insufficient). All substrates stay **optional, capability-gated, local-first,
consume-don't-fork** (the D31 posture). *Why + evidence (incl. AST-beats-LLM for code structure):*
`docs/knowledge-substrate.md`. *Status:* Accepted (revisit triggers recorded).

**D41 — A node references the handbook via an overlay-resolved `external: true` locator,
never vendored content.** How a node reaches the curated-canon home (D38) at runtime.

- **Two handbooks; only one is a runtime reference.** stack-graph's **own** handbook is
  *compiled into* each node body at build (research-report → canonical); a node never reads the
  factory handbook at runtime. The **harness's own handbook** (its spec, manual, decisions, history) is
  what canon-centric nodes read at runtime — and it is the harness's, not the factory's to ship.
- **Mechanism: a shared `handbook` `external: true` reference (`load: on-demand`).** The
  factory ships only the pointer; the harness **overlay** resolves it to that product's canon
  root + page index; the node navigates pages at the step of need. This reuses the existing
  external-reference pattern ([`02-graph-spec`]) — validation/build skip it.
- **Overlay resolution, not injection.** The body carries a stable "follow your `handbook`
  reference"; the overlay binds what it points at (a path / index). This is harness config (the
  "variable path"), **not** a `{{token}}` body splice (D33 banned that).
- **Not vendored content.** Copying the handbook into vendored `_refs` is rejected: it would
  duplicate a *living, curated* tree (single-source violation), drift the instant the curator
  edits it, and ship a harness's canon from the factory. Reference-as-**locator**, never
  reference-as-content-copy.
- **Scope: canon-centric nodes only.** `handbook-curator`, `drift-detector`, `explore` (domain
  read), and later `design`/`specify` carry the edge — so the dependency is first-class and
  analyzable (D38 authored traceability). A node that merely glances at one page stays ambient
  (the harness `CLAUDE.md` + page index), so the edge stays meaningful, not spam.
- **Factory self-use.** `tooling/sg-handbook-curator` uses the fixed in-repo path `handbook/` —
  it operates on the factory itself, un-vendored, so no overlay binding is needed.

*Reframes:* the `02-graph-spec` `external: true` example (was the crystallization manifest —
explore's, retired by D38) now leads with `handbook`. Re-adds an external reference to
`explore` — the *correct* shared locator, not the killed bespoke `product-map-manifest`.
*Queues amendment:* `02-graph-spec` (done), `04-harness-spec` (overlay binds handbook),
`graph-map.md`. *Status:* Accepted — **amended by D46**: the handbook is no longer merely an external
locator the harness supplies; the factory now ships vendored **handbook-references** that render into
the product handbook (the runtime `handbook` locator stays — it now points at the composed union).

## Directory topology & runtime

**D42 — One `.claude` at the org root; the directory topology; verified Claude loading behaviour.**
A consuming workspace lays out as: the **vendored plugin at user scope** (general, read-only); an
**org root** = the single launch directory holding **one `CLAUDE.md`** and **one `.claude/`**
overlay; a **docs-only `workspace/`** (the handbook + per-function output surfaces, rendered as one
space); **function directories** holding working files (incl. product source); generated data in
`.stack-graph/`; recall via a `.gbrain-source` (one host brain, many sources). The discriminator is
**scope by ownership + mutability** (user = general/vendored; org-root-and-below = workspace-
specific). *Operating assumption:* **always launch Claude at the org root.**
- **Verified loading behaviour (empirical, 2026-05-31):** skills + `CLAUDE.md` cascade (up to the
  launch dir, lazily down) and skills hot-reload; **agents/hooks/settings are launch-directory-
  scoped** — no cascade, no lazy-load, no hot-reload (a subdir agent never activates; a new agent
  needs a relaunch). Recorded in `~/.claude/references/claude-directory-behavior.md`.
- **Consequence:** ALL local nodes (skills *and* agents) live in the one org-root `.claude/`;
  function/product dirs carry no `.claude`. **No composed/scoped view is generated** — nothing to
  merge. *Refines D12* (the composed/scoped view is deferred; the global analytics record stays).
- **Crystallized outputs are references + scripts** (canonical primitives), not a separate "assets"
  kind/dir — a vendored node grows them in the overlay via an `external: true` reference + invokes.
  *Refines D35* (drops the "assets" framing; the crystallization loop is unchanged).
- **Bindings are a convention, not a resolver:** a node is authored to read its binding (a
  reference) on demand; there is no runtime resolver in v1.
- **Harness = consuming workspace** (may span products/functions), not a single product.
*Queues amendment:* `04-harness-spec` (Composition, Bindings, Crystallized, new `01-directory-topology`
page) — done. *Status:* Accepted.

## Product management & the carrier

**D43 — Product management = two faces (a strategy/discovery loop + a delivery coupling), grounded in
SVPG + Strategyzer, shipped as a PM *pack*.** PM is not one separate arc. **Upstream**, a continuous
**strategy/discovery loop** develops and iterates the strategic substrate (vision, market, target
users/segments, jobs-to-be-done, the value-proposition canvas, the business model, product strategy)
via an evidence-first test-and-learn cycle, maintained by a curator. **Downstream**, a **delivery
coupling** turns that substrate into shipped product by **riding the dev-sprint** (not duplicating it):
its machinery is the roadmap (the carrier source, D44), the gates, a **product lens** (a CEO/strategy
review skill into the dev-sprint's shared front), and the maturity dial (D45). The two are joined by
the **outcome layer** (vision → objectives/OKRs → north-star → KPIs; *outcome over output*) and by
`debrief` feedback. **Personas are PM-owned** and maintained (a strategic-substrate surface), consumed
by the experience thread (D47). **Methodology = a PM pack, not core doctrine:** SVPG (Cagan — the
operating-model spine) + Strategyzer (Osterwalder — the BMC/VPC engine + test-and-learn) instantiate
the function over the method-agnostic core; another PM method is a different pack over the same core.
*Refines D32* (two faces, not a single separate arc; the roadmap becomes the carrier). *Design:*
`docs/product-management-design.md`, `docs/pm-graph-map.md`. *Status:* Accepted (design); pack build pending.

**D44 — Work travels an arc as a *carrier* — a stateful work-item, not a scalar stage.** A carrier
records `lifecycle_state` (the work's life-phase), `current_stage` (the arc stage while in flight),
`children` (decomposition — a parent fans out into implementation work-units, each with its own stage;
the parent aggregates), `gate_decisions[]` (append-only; per gate: decision / owner / timestamp /
evidence / conditions / override / confidence), and `transition_history[]`. A scalar 'stage' cannot
represent review loops, re-entry, skipped stages, decomposition, abandonment, or post-ship measurement
lag — the state model can. A **gate** advances `lifecycle_state` and records a decision (a deliberate, lightweight call), but
`current_stage` + `transition_history` are **projected from the observed traversal** (node-enter/-exit
events tagged with the carrier — derived, operator-overridable, **not** written by a stage or a curator);
a **curator** maintains only the carrier's **content** (PR-gated); and the traversing stages carry **no
write-edge** to the carrier (none of this is a `composes-into` edge — a carrier is not a node, a curator
is not an arc stage). *(Refined after the front-stage build: nothing fires a curator just to advance a
stage.)* The carrier is **general** (the work-item of any process); its
values / stages / gates are domain. *Why:* surfaced by the codex review of the PM design — a scalar
stage would corrupt the timeless spec the moment a real item fans out into PRs. *Queues:* `01-concepts`
+ `02-graph-spec` — done. *Status:* Accepted.

**D45 — Gate rigour = a maturity × tier dial.** A per-process **maturity** posture sets the *default*
evidence bar at each gate; a per-item **tier** overrides it. The axes are independent: a high-risk item
is gated hard even in an early, low-maturity process; a routine item fast-tracks even in a mature one.
Maturity is harness-local per-product state. *Why:* the appropriate evidence/rigour changes both as a
product matures (founder-led → first-users → data-driven) and per item risk; conflating them into one
axis loses signal. The maturity *stage names* are pack/harness; the **dial mechanism is core**.
*Queues:* `01-concepts` (the dial) + `04-harness` (maturity as harness state) — done. *Status:* Accepted.

## The reference layer & handbook model

**D46 — The handbook is the graph's reference layer: two reference kinds, the handbook as the rendered
union, extend-only with a hard conflict gate, maintenance as a `maintains` edge.** Unifies shared
content and the operator handbook into one **reference layer** — a single managed, reviewable home for
canonical agent context. A reference carries a **`kind`**: a **standard reference** (operational,
node-bound, flat in `graph/_refs/`) or a **handbook-reference** (canonical 'how the system works',
sectioned home, *also* renders into the handbook). The **handbook is the rendered union** of
handbook-references — the **vendored** (factory) entries + a harness's **local** entries — composed into
one numbered, cross-referenced, ownership-badged artefact. **Numbering is computed at render** from
document order (never in ids/slugs/cross-refs); identity is the stable slug + author-assigned **concept
anchors** (`{#tag}`); a **fragment-lint** validates cross-refs against a build-emitted anchor manifest
(adopting the Be Civic handbook PR-#83 design). **Ownership + `extends`:** factory entries are
dominant/read-only; a local entry may only `extends` a vendored topic and is **adds-only** (never
redefine a vendored anchor or contradict a normative claim) — enforced as a **hard integrate gate**
(structural), with the curator's consistency-checker as the best-effort semantic backstop; SG wins, the
recourse is **raise-to-SG**. **Maintenance = a `maintains` edge** (node → handbook-reference; record
projects `maintained_by`); a vendored entry is maintained by an **external/factory maintainer** (so 'who
maintains X' is uniformly graph-derived, never a special case). The build **adopts and tailors a renderer
core** for the composed union. *Amends D41* (the handbook is no longer merely an external locator; the
factory now ships vendored handbook-references that render in — the runtime locator stays, pointing at
the composed union). *Extends D33* (references gain a `kind`; the standard-reference contract is
unchanged). *Why:* one reviewable home for all canonical context (the handbook's original purpose) + the
SG/harness boundary made an explicit, **enforced** property rather than a line to police. *Design:*
`docs/reference-layer-design.md`. *Queues:* `01`/`02`/`03`/`04`/`05`/`06` — done; stack-graph
self-application (convert its own handbook + re-home built refs) deferred. *Status:* Accepted (design +
core spec); self-application + renderer build pending.

## Experience testing

**D47 — Experience testing is a thread, distinct from PM, grading UX + AX.** Verifying that a
*probabilistic AI product* behaves as intended is the **experience thread** — distinct from PM (what to
build) and code review (is the code correct). It spans the dev-sprint's design→verify span (like the
visual-design thread): an **experience-contract** reference (the intended UX — session-shape invariants
+ failure modes + AX budgets; harness-supplied) authored at design, a verification **agent**
(`simulate-users`) that runs personas × scenarios against the live probabilistic product at verify, and
a fix/optimise loop. It grades two dimensions: **UX** (the output vs the contract) and **AX (agent
experience)** — the product agent's own traversal: tools used, friction, **tokens and latency to the
outcome** (optimise: same outcome, fewer tokens, faster). **AX measurement is the product-facing instance
of the factory's own traversal instrumentation** — the factory instruments its graph, the experience
thread instruments the product's. `simulate-users` is **reclassified out of PM** (it is not value
evidence); PM-owned personas are the shared spine. *Why:* the operator distinguished product/UX
verification of a probabilistic AI product from PM discovery; resolves the codex 'simulate-users
overclaimed as value evidence' finding by reclassification. *Design:* `docs/experience-thread-design.md`.
*Queues:* `01-concepts` / `06-analytics` / `07-decomposition` — done; the experience-thread nodes +
`simulate-users` re-home (build). *Status:* Accepted (design); build pending.

## Methodology grounding

**D48 — A dev-time advisory council grounds the graph in methodology; provenance is authored into the
graph.** Methodology baked into a pack is recorded in a **graph-native provenance manifest**
(`graph/_refs/<pack>-methodology-provenance.md`): `claimed_methods`, sources, `principles_included`
with a principle→node **encoding map** + `present`/`planned` state, `principles_omitted` (intentional,
each with a reason), and `method_interfaces` (the seams between methods). The manifest is **authored
when the pack is built** (*extends D38* — traceability is authored, not inferred), not reconstructed
by the auditor. A **non-authoritative** dev-time board — `sg-advisory-council` in `tooling/`, sibling
to the maintainer + curator, **never vendored** — reads the manifest and convenes **source-custodian**
sub-agents, each citing only a **closed principle catalog** (`references/catalogs/<seat>.md`; an
unbacked concern is an `ungrounded-hunch`, never dressed as methodology), to surface
**fidelity / gap / grounding / seam** findings. Convening is **selective** (claimed-method custodians
audit fidelity; a domain-relevant *unclaimed* custodian audits coverage-gap) with a **mandatory seam
pass** the orchestrator owns. Output is **report-only** — the operator filters it and routes anything
worth acting on into `sg-graph-maintainer` / `sg-handbook-curator`; nothing is auto-applied or gated.
Built now for the **product** domain (seats: Cagan/SVPG, Osterwalder/Strategyzer,
Blank/Customer-Development); growth (Balfour) and reality-check (Graham/Tan) seats deferred. It
critiques **the graph's construction and baked-in methodology**, never stack-graph-as-product.
*Why:* methodology baked into packs drifts or gets half-implemented as the graph grows and nothing
catches it — the methodology analogue of `review` (code) and the curator (handbook). A Codex review
confirmed that "cite a source" by instruction alone fabricates citations, so grounding rides authored
manifests + closed catalogs, kept lightweight because output is advisory and human-filtered
(hallucination is a cost, not a catastrophe). *Design:* `docs/advisory-council-design.md`.
*Queues:* `07-decomposition` (pack provenance manifest) + `05-maintenance-skill` (maintainer authors
it) + `08-devops` (the grounding gate) + `CLAUDE.md` (dev-tooling) — pending;
`tooling/sg-advisory-council/` + the PM manifest (`graph/_refs/pm-methodology-provenance.md`) — built.

## Product dashboard

**D49 — The roadmap is renamed and reframed as the *product-dashboard*: the operator's single strategic
surface, record-primary, built to the anti-deferral stance.** The PM delivery surface (D43) is renamed
**roadmap → product-dashboard** and reframed as the operator's **single strategic surface** hosting (1)
**vision & strategy**, (2) **progress** (OKRs / north-star / strategic analytics), and (3) a **work
ledger** — one ledger of work items (carriers, D44) rendered as two views on *different* axes: a
**forward view** (operationally first-class — the fast-flowing active workspace where a work item matures
idea→exploring→committed, often in days) and a **record** (durably primary — the durable memory of what
we built, why we made the call, when, and how it ladders to the vision). **Record-primary:** the centre
of *durable* value is the record, not a forward plan, because AI-native build makes sequencing cheap and
a large backlog vestigial (*extends D32*). **One carrier identity, three projections** (forward workspace
/ delivery traversal / durable record) — the surface renders facets, never forks the carrier. **Curator
contract:** `product-dashboard-curator` (renamed from roadmap-curator) maintains **work-item content
only**; `current_dev_stage` + `transition_history` are **projected from the dev-sprint traversal** (no
node writes them, the curator least of all — *refines D44*'s projected-stage); gates advance
`lifecycle_state` (operator decisions); `debrief` writes outcomes. **Three analytics streams** kept
namespaced (product outcomes / factory conformance / carrier projection — the third consumes factory
traversal events to derive product-side state). **Anti-deferral stance:** build buildable+needed work
now; the only honest "later" is **input-gated** (subject data doesn't exist yet — e.g. strategic product
analytics pre-launch) or **not-yet-needed at this maturity** (the dial keeps it light), named, never
dressed as staging. **Naming:** roadmap→product-dashboard, roadmap-curator→product-dashboard-curator,
roadmap-item-schema→work-item-schema, "roadmap item"→"work item" (BC's real `bc-workspace/roadmap` path +
this decision history left). *Applies D44 (carrier), D45 (maturity dial), D38/D39 (the `outcome_link` is
authored, not inferred). Extends D32 (strategy over backlog), D43 (the delivery-coupling surface).* *Why:*
the operator wanted an opinionated artefact with conviction on the roadmap's role in the age of AI;
research across SVPG / Strategyzer / the roadmap-craft canon / AI-era practice converged on
direction-coherence + a durable record; the operator reframed it record-primary, renamed it
product-dashboard, and insisted the forward view stay first-class (not deferred). Codex-reviewed (two-axis
framing, projections, analytics namespacing, projected-stage contract, SVPG/Strategyzer fidelity). *Design:*
`docs/product-dashboard-design.md` (+ `docs/pm-graph-map.md`). *Queues:* rename across PM design docs +
dev-sprint node bodies + handbook concept lines — done (commit `e46087b`); `02-graph-spec`
carrier-as-record framing + `07-decomposition` product-dashboard-as-PM-delivery-surface — light, pending;
Arc B build (`product-dashboard-curator` + `product-lens` + `work-item-schema` + `okr-schema`) — pending.
*Status:* Accepted (design + rename committed); handbook concept reconciliation + Arc B build pending.

## Dev-sprint backbone

**D50 — Dev-sprint backbone wave 1 built: `plan`/`build`/`reconcile`/`land`/`debrief` + the loop wiring.**
The missing backbone stages + the loop-critical sub-nodes (`ship`, `deploy`, `spec-diff`, `log-decision`,
`measure-outcomes`, `capture-learnings`) + the `IU-schema` reference are authored; the dev-sprint loop now
traverses end-to-end (front + backbone + review cell). **Gate model:** three operator gates —
**commit-to-build** (`plan→build`, `defined→committed`), **commit-to-land** (`reconcile→land`,
`in-delivery→shipped`), **live-confirmed** (`land→debrief`, `shipped→live`); `committed→in-delivery` is
**traversal-derived** (entering build), not a gate. **Wiring:** happy path = `precedes` (the 8-edge forward
chain `align-context→…→debrief`); corrective loops = `can-follow`, each bounded + escalatable (build←review
fix, build←reconcile rework, reconcile←land revert, plan←build re-plan); seed-next = align-context←debrief
(13 process edges total). **Carrier discipline held (D44):** no backbone stage writes the carrier — `plan`
produces the plan (`children[]` is curator-content/projected), and `debrief` records outcome evidence but
does **not** advance `lifecycle_state` (the live-confirmed gate does) and holds no edge to the curators — the
loop closes via the **shared authored homes** (D38). **Wave-1 `land` = `ship` + `deploy`** (operator);
**`canary` input-gated to wave 2** (no prod traffic pre-launch). **Deferred to wave 2, named not dressed
(F7 prose seams):** `debug`+`investigate-probe`, `canary`, `optimise`, `benchmark`/`health`, the
visual-design thread. *Codex-reviewed* (gate model, projected-stage coherence, loop edges as can-follow,
debrief-feedback-via-homes, the anti-fake-shipping check — all applied). *Record:* 28 nodes / 15 refs / 109
edges, validated. *Applies D44 (carrier/projected-stage), D45 (gate dial); pays the F7 `@plan`-edge IOU;
details graph-map.md's backbone sketch.* *Design:* `docs/dev-sprint-backbone-design.md`. *Status:* Accepted;
wave 1 built + committed. Wave 2 (sub-arcs + crystallising nodes) pending.

## Artefacts & surfaces

**D51 — The loop's runtime artefacts: markdown + frontmatter + manifest, with carrier state split three
ways.** The contract for the loop's runtime data (work-items, the product-dashboard surface, plans,
sprint-records) — *format, storage, organisation, binding*. Resolves the dashboard's open "surface & file
format" question; it is the **factory contract a harness instantiates**, and the prerequisite to vendoring
the plugin + building the BC harness + exercising the loop. **Core fix (Codex): three strictly-separate
kinds of carrier state** — **authored** (committed in the work-item file: `lifecycle_state` +
`gate_decisions[]` [the committed lifecycle-transition record] + `stage_override` + curator content);
**projected** (derived from the `.stack-graph/` event log, *not* committed: `current_stage` +
`dev_transition_history`); **terminal snapshot** (`frozen_timeline`, written **once by a recorder at any
terminal `lifecycle_state`** — shipped/live via debrief, parked/killed via the kill-park recorder —
**decoupled from lifecycle advancement**; the only point a derived value enters a committed file).
Artefacts = markdown + frontmatter + a committed-but-stale-checked manifest, in `workspace/<surface>/`,
bound via the bindings reference; derived state in `.stack-graph/` (gitignored); a **degraded mode** renders
the authored ledger + frozen closed items when the projection is absent (in-flight stage shown
unknown/stale). The **bindings contract** lists the complete key set a harness must supply. *Naming fixed:*
`current_stage` (was `current_dev_stage`); the canonical 8-state lifecycle
(`idea→discovery→defined→committed→in-delivery→shipped→live→parked/killed`) across
`work-item-schema`/`pm-graph-map`/`product-dashboard-design`. *Codex-reviewed* (the three-way split,
degraded mode, manifest stale-check, terminal-freeze-not-just-debrief, complete bindings — all applied).
*Applies D44 (carrier/projected-stage), D49 (record-primary), D38 (authored links); fits the 04-harness
topology.* *Design:* `docs/artefacts-design.md` (+ `work-item-schema` v0.2.0). *Status:* Accepted (the
contract); the **plugin build** + **harness build** are the two remaining prerequisites to exercise the loop.
*Status:* Accepted (design); build in progress (product seats landed; handbook amendments pending).

## Workspace portal

**D52 — Workspace portal: deployed = authored-from-git ⨝ a published projection snapshot; fail-closed.** The
operator's read-only comprehension surface (handbook + product-dashboard + graph browser + analytics),
deployed (CF Worker), rebuilt on PR merge. *Core resolution (Codex): the deployed-vs-local-projection gap* —
projected state (`current_stage`, last-used, AX, health) lives only in gitignored local `.stack-graph/`, so a
git-built CF deploy cannot see it. **Resolved:** the deployed portal **joins** the committed **authored
layer** (canon + the work-ledger's authored state [lifecycle/gates/content/`frozen_timeline`] + the vendored
graph **structure**) with a **sanitised `portal-projection.json` snapshot** published on rebuild, keyed by
commit SHA, to a non-git store (CF KV/R2); **degrades loudly** (stale/unknown + a provenance banner) when the
snapshot is absent or SHA-mismatched. Raw events never leave the workspace. **Merge-governance:** two tiers —
*auto-merge* the operational ledger **only** behind a path+field classifier + CI invariants (schema-valid;
`gate_decisions[]` append-only; the **gate-token rule** — a `lifecycle_state` change must carry its
authorising appended `gate_decision`; manifest stale-check); *PR-approval* for canon / sprint-plan /
objectives / strategy / graph + anything the classifier rejects. **Access:** fail-closed — Cloudflare Access
scoped to the single operator, the Worker rejects anonymous requests, the snapshot store is not publicly
readable, no write surface. *Build (A3b):* reuse `bc-renderer-core` + the handbook-renderer architecture;
build the dashboard/graph/analytics panels new; brand = a swappable config layer defaulting to be-civic.
*Codex-reviewed* (freshness model / build-data contract / single-model — cleared; the classifier/schema/
access concretisations applied after; final go/no-go pending a Codex rate-limit reset). *Renames the
"roadmap-artefact" surface → portal; resolves the `04-harness` "workspace render" + the artefacts doc's
renderer contract.* *Design:* `docs/workspace-portal-design.md`. *Status:* Accepted (design); build = A3b.

**D53 — Portal access/freshness reconciled to the as-built model + adversarial-review remediation
(refines D52).** A four-way **adversarial-Opus** review (Codex rate-limited) of the A3b build + the
provisioning runbook found real, proven issues; remediated. **Access (refines D52's "fail-closed"):** the
deployed portal is **static assets, no worker code, gated SOLELY by Cloudflare Access at the edge** (no
application-layer second gate) — so correct CF Access config is a **verified release gate** (anonymous
`curl` → 302/403, not 200). The sanitized `portal-projection.json` is a **behind-Access static asset** (not
a server-side/private store; safe because the publisher emits only sanitized aggregates). **Freshness = three
states** (input-gated/empty · stale/SHA-mismatch · fresh+populated), reconciled with artefacts-design's "no
projection ⇒ degraded"; a git-connected CI deploy is **authored-only/input-gated** (no `.stack-graph/`), and
**live projection requires a local `wrangler deploy`** (KV/R2+Worker = an input-gated later). **Security
fixes (proven by hostile fixtures):** the projection publisher leaked via a verbatim `ax` spread + unbounded
ids → now a numeric allowlist + an id grammar + dirty-tree `-dirty` provenance + future-timestamp rejection;
the dashboard escapers coerce `String()` + escape quotes (a numeric YAML title crashed the build);
`gate_decisions[]` gain `seq`+`hash` so **append-only is enforceable**; `frozen_timeline` sub-shape defined;
`.stack-graph/` gitignored; a CSP added; **auto-merge stays disabled until the classifier + CI invariants
ship as required checks**. **Markdown HTML sanitization = a Phase-C release gate** (before any harness renders
untrusted product content). Runbook: 5 verified blockers fixed (`gbrain serve` not `mcp`; never `cp` a live
DB; `.bashrc` is dead under `bash -lc` → `~/.profile`; `gbrain sync --repo`; the bw broker IS loopback-
reachable → iptables + a real check). *Reviewed:* 4 adversarial Opus agents (design / publisher-security /
build-code / runbook). *Status:* Accepted; remediation committed.

## Harness instantiation

**D54 — The harness ships via the plugin: `harness-init` + `bindings-contract` (executable
instantiation).** The harness build is **not** a manual per-product step (the readiness plan wrongly
assumed a be-civic session would hand-assemble it) — the *means* to instantiate a harness ships in
the vendored plugin. Two new vendored primitives: **`bindings-contract`** (a reference — the single
source for the binding key set + the `bindings.yaml` format + the dashboard surface-structure
template, generalising `artefacts-design` §6 / the 04-harness topology) and **`harness-init`** (a
skill — modes `scaffold`/`bind`/`validate`: writes `<org-root>/.claude/bindings.yaml` from the
contract by inferring + confirming the workspace's paths, scaffolds the empty bound surface skeleton
from the template, and validates that every required binding resolves before the loop runs). It is
**general** (no product paths — it infers/asks), writes **harness-local files only** (never the
vendored graph), and scaffolds **structure** — content (work items / OKRs / strategy) is the curator
family's. So a consuming workspace stands up its harness **from the plugin alone** — no
hand-assembly, no copying a sibling's files. *Why:* the factory/product boundary + "the plugin
carries the contract, never the data" mean instantiation must be a shipped capability, not a manual
step performed in the product user (which the admin/tooling user cannot even write into). *Record:*
**29 nodes / 17 refs / 121 edges**; vendored (16 skills); parity + load-verify pass. *Spec:*
04-harness (an "Instantiating a harness" section + the contract is a shipped reference), 03-plugin
(the plugin ships the harness-instantiation capability). *Status:* Accepted; built + vendored. The
exercise (Phase C) is a be-civic session running `harness-init` → `product-dashboard-curator`
add-item → `align-context`→`design`.

## Authoring rigor & language

**D55 — Research reports must cite real external analogues; a Pocock-derived skill-language
standard cuts token cost; both bake into the maintainer.** An audit found ~21 of 29 authored
nodes (the whole dev-sprint backbone + the PM-pack) were authored from in-repo design docs only
— `sources_lifted: 0`, no comparison against how the job is really done. The *instructions* were
fine (`researcher.md` step 3 already said "search for `.claude` primitives"); the *execution*
skipped the external search and nobody caught it. **Three fixes.** (1) **Sourcing rigor** —
`researcher.md` step 3 now mandates AND records an external search across the real corpora
(operator `.claude` skills, reference plugins, the product harness, published best practice),
with an `external_corpora_searched` + `external_analogue_found` summary; the acceptance gate
**challenges** `sources_lifted: 0` / `external_analogue_found: false` instead of waving it
through; the report template gains an `## External analogues searched` section + frontmatter
fields; handbook `05` gains an "Adequate sourcing" rule (in-repo design docs are *input*, not an
external analogue; the sin is the unrecorded skip, not the honest absence). (2) **Skill-language
standard** — distilled from Matt Pocock's `write-a-skill` / `caveman` / `improve-codebase-
architecture` (MIT; lifted verbatim into `tooling/sg-language-reviewer/source-material/` with
provenance): a **description shape** (two parts — what + `Use when …`; routing signal; ~200–350
chars) and **prose economy** (the core test; no throat-clearing; one term per concept; split past
~100 lines), canonical in `00-overview/03-agent-surfaces`, with a **safety exception** (never
compress security warnings, irreversible-action confirmations, order-bearing steps). (3) **A new
dev-tooling skill `sg-language-reviewer`** (modes `descriptions` + `tighten`; grades against
`references/skill-language-standard.md`; proposes, never silently rewrites; honours the safety
exception) — and the same discipline baked into `sg-graph-maintainer`'s translator + a hard
constraint + the templates, so new nodes are born tight ("just how we do things", not a new mode).
The 21 thin reports are being **deepened + challenged against their real analogues via a Workflow**
(reports + a triage table only; node amendments are a follow-up operator session). *Spec:*
00-overview/03-agent-surfaces, 05-maintenance-skill. *Status:* Phase 1+2 built; backfill +
description-sweep running; node amendments deferred to the operator.

**D56 — The incremental-improvement workflow (standalone-IU light loop) is designed +
Codex-reviewed; build deferred.** A second, lighter loop beside the heavyweight dev-sprint, for
small traceable improvement (the factory's most common change shape — it improves itself).
Modelled on Pocock's tracer-bullet / vertical-slice discipline. The unit is a **standalone IU**
(a carrier-lite — no parent work-item, no front), which must be a **vertical slice with proper
testing**. A new `incremental` arc (`triage → specify-slice → build → review → land`) **reuses**
build/review/land and adds two front nodes; standalone IUs stay **off** the product-dashboard
work-ledger (their own `improvements-root` surface). Keeps the Workspace — **no GitHub move**.
Design at `docs/incremental-improvement-design.md` (7 operator forks A–G with recommendations).
**Codex review (6 findings, all accepted):** the `standalone` variant must be a strict **`oneOf`**
(child-IU vs carrier shapes, hard field exclusions), not "IU + a flag"; the **lifecycle writers**
must split (proposed/in-delivery = authored/event-driven, only the terminal transition is
gate-written) or it violates three-writers; **`promote` needs a new one-way `escalates` edge
type**, not gated `precedes` (which would pollute traversal/projection); reused nodes need
**carrier-keyed projection (carrier id + kind + arc) + an explicit carrier interface**; the
**promote/`improves` provenance bridge is mandatory**. Resolutions folded into design §9. *Spec:*
per the design's Spec-touchpoints table (02-graph-spec incl. the new `escalates` edge, 01-concepts,
07-decomposition, 04-harness, 06-analytics, 08-devops, IU-schema, work-item-schema). *Status:*
Designed + reviewed; **build deferred to a follow-up session** per the operator.

## IU sizing & decomposition

**D57 — The IU is a single-agent-implementable unit; its context budget is a measured dial, and
tokens-per-IU is a first-class analytics metric.** Today an IU's only sizing signal is `size:
XS–XL` (rough *effort*), which gives `plan` no checkable decomposition target and leaves the
actual context cost unmeasured. **Reframe:** an implementation unit should be **buildable by one
fresh agent within its best-work context budget** — "one agent, bounded fresh context, split
diligently" (Pocock's tracer-bullet discipline). **Five parts.** (1) **Single-agent-implementable
invariant** — an IU's `goal`+`files`+`acceptance` must fit one fresh agent; an explicit
decomposition criterion in `plan` and a soft invariant in `IU-schema`; `L`/`XL` read as "probably
split." (2) **Budget is a dial, not a constant** — durable *principle*, ~100k tokens as the
documented **harness-tunable default** (the best-work window is model/version-dependent — verify,
don't bake in); the harness carries the value, the schema carries the principle. (3)
**Tokens-per-IU is measured** — `build` emits `tokens_per_iu` on the per-IU **unit-complete event**
it already emits (no new machinery; rides the same event CF-1 adds runnable evidence to); it lands
in the analytics event log's product-outcomes stream; `measure-outcomes` derives the distribution +
**over-budget share** against the budget. This makes the dial empirical (set default → measure →
tune) **and** a decomposition-quality signal — a high over-budget share means `plan` is drawing IUs
too coarse (same shape as build's "weak acceptance = a *plan* gap" framing); earns-keep =
over-budget share trends toward zero. (4) **Build default = one-IU-one-fresh-context** —
generalises reconciliation **CF-3**: serial-subagent for dependent sets, parallel-subagent for
independent; main-thread `inline` reserved for a tiny single unit or deliberate carry-forward. (5)
**Budget is a routing test between the two loops** — a standalone (incremental) IU that won't fit
one agent's budget is a **promote** signal (it's a work-item, not a slice). *Why:* the operator
identified tokens-per-IU as a metric the factory must measure, and single-agent-implementability as
the decomposition target; `size`-as-effort gave neither. *Applies* D50 (backbone), D56 (two-loop
split / promote); *generalises* reconciliation CF-3, *rides* CF-1 (`acceptance_check` + per-IU
evidence on the same event). *Spec:* per the design's Spec-touchpoints table (IU-schema, 06-analytics,
07-decomposition, `plan`, `build`, incremental-improvement-design). *Design:*
`docs/iu-sizing-design.md`. *Status:* Decided; folds into the reconciliation amend wave (IU-schema
+ plan + build + 06-analytics + measure-outcomes), not a standalone build.
