---
title: Decision log
status: v0.13.0 — 2026-05-31
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
*Design + prior art:* `docs/product-graph.md`. *Status:* Accepted (direction); design ongoing.

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
`graph-map.md`. *Status:* Accepted.

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
