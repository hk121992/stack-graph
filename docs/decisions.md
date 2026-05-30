---
title: Decision log
status: v0.5.0 — 2026-05-30
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
not the authoring view). *Queues amendment:* `02-graph-spec`. *Status:* Accepted.

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
