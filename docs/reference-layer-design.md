---
title: The reference layer & handbook model (working doc)
status: working draft — 2026-06-01
---

# The reference layer & handbook model

Unifies the graph's shared content and the operator handbook into one **reference layer**, so there
is a single managed, reviewable home for all canonical agent context — the original purpose of the
handbook — with the SG/harness boundary made an explicit property rather than a line to police.
Generalises Be Civic's handbook (especially PR #83's computed-numbering + concept-anchor + fragment-
lint design) and the curator cell (D40).

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `02-graph-spec` | Node/edge schema, references | **amend** — references gain `kind` (`reference` \| `handbook-reference`), `type`, `owner`, `extends`; a new **`maintains`** edge (node → handbook-reference); the numbering/anchor discipline. |
| `01-concepts` | Concepts | **amend** — the reference layer; the handbook as the rendered union; standard vs handbook reference. |
| `04-harness-spec` | Overlay, the workspace | **amend** — handbook-references overlay extend-only; the conflict/dominance model; **sg entries maintained externally** + the raise-to-SG path. |
| `03-plugin-spec` | Build/render | **amend** — the build renders the composed union into the numbered handbook artefact; emits the anchor manifest + agent index. |
| `05-maintenance-skill` / `06-analytics` | Curator | **amend** — the curator's link-validator (bidirectional `related`), fragment-lint (anchors), consistency-checker (sg/local conflict), and `maintains`. |

## Two kinds of reference

**"One reference layer" is conceptual** — a single governed, reviewable home for all canonical agent
content. In practice it has two storage homes: handbook-references live in a sectioned structure
(`NN-section/`, for render order and numbering); standard references stay flat in `graph/_refs/`. One
layer, two storage homes, one curator, one integrate gate.

Two **kinds** (a frontmatter tag — your "tag them as handbook references"):

| | `reference` (standard) | `handbook-reference` |
|---|---|---|
| What | operational shared content (schema, protocol, gate) | canonical, top-level "how the system works" |
| Consumed | node-bound only (`references` edge → bundle) | rendered into the handbook **and** optionally node-bound |
| Operator-facing | no | **yes** — appears in the rendered artefact |
| Home | `graph/_refs/` (flat) | a **sectioned** structure (`NN-section/`, for render order + numbering) |
| Discipline | single-source content | the full handbook discipline (below) |

Not every ref is a handbook entry. A standard ref can be **promoted** to a handbook-reference when it
proves to be canonical "how it works" content — the curator's call. (Of what we built this session:
`four-risks` / `vpc-schema` / `bmc-schema` are handbook-references; `findings-schema` / `severity-scale`
/ `lens-dispatch` / `pr-description-shape` etc. stay standard. Re-homing them is a later deliberate
step — see Sequencing.)

## Shape & discipline of a handbook-reference

```yaml
---
kind: handbook-reference          # vs `reference`
id: four-risks
type: concept                     # concept | procedure | spec | domain | index — gates the template
title: The four product risks
section: discovery                # groups + orders the entry in the rendered artefact
owner: sg                         # sg (vendored, dominant, externally maintained) | local
read-when: framing or de-risking a product idea
related: [vpc-schema, bmc-schema] # the page-graph (bidirectional, curator-enforced)
# extends: stack-graph:<id>        # local-only: additive extension of an sg entry
status: v0.1.0 — 2026-06-01
---
## Value {#value}                 # concept anchors; cross-ref as [Value](four-risks#value)
```

No `number` (computed at render) and no `managed-by` (it's `maintains` edges — below). `type` gates the
authoring template/discipline, as BC's `type` does. `related` is the page-graph (a frontmatter list the
index captures); `extends` is the additive overlay onto an sg entry; both are tracked in the graph record.

## Maintenance — the `maintains` edge

"Who maintains entry X" is **graph-derived uniformly**: a node declares a **`maintains`** edge into
each handbook-entry it is responsible for (declared on the node, like every edge). The graph record
computes `maintained_by` per entry (the reverse, exactly as it computes `consumed_by` for references).
Several nodes maintaining one entry is just several edges — no list, no separate store. SG entries are
not a special case of this model; they are an instance of it.

- **Local entries** carry ≥1 `maintains` edge from a local node (a curator or a domain node). An entry
  with none is an orphan — `validate` flags it.
- **SG entries** carry a `maintains` edge from an **external/factory maintainer node** — a typed
  external-maintainer node representing the stack-graph factory, with the edge marked `external: true`.
  `owner: sg` on the entry frontmatter is provenance; the `maintains` edge is the structural record.
  They carry no local `maintains` edge; changing one means **raising a PR to the SG repo** (the
  raise-to-factory path); the harness never edits a vendored entry in place.
- **One gated write path.** However many nodes maintain an entry, all changes graduate through the
  curator (raise → integrate). Many proposers, one integrator — co-maintenance never means
  uncoordinated writes. The granularity discipline that keeps this clean: an entry is **one coherent
  topic**, not a grab-bag.

The `maintains` edge must be added to 02-graph-spec's edge taxonomy: class = structural; valid
endpoints = node → handbook-reference (plus the external/factory maintainer case); acyclic; graph-record
projection = computed `maintained_by` per entry (symmetric to `consumed_by`). See Open details.

## Numbering, anchors & cross-references (adopt BC PR #83)

- **Numbers are computed at render** from document order (section + position), injected into the render
  and the ToC. They never live in ids, slugs, or cross-refs. Insert/reorder an entry and everything
  renumbers; nothing breaks. (Opt-out: `numbering: false` for frozen/appendix sections.)
- **Identity is the stable slug + author-assigned *concept* anchors** (`{#tag}`, kebab-case, never
  numeric). The build emits an **anchor manifest** (`{slug → ids}`).
- **Two cross-ref layers:** `related[]` (the page-graph — bidirectional, enforced by the curator's
  link-validator) and in-body **semantic anchor links** `[Concept](slug#anchor)` (validated by a
  **fragment-lint** against the anchor manifest, so links can't silently drift).
- The agent-facing **`index.json`** is generated from frontmatter (a `refresh-index` pass), as today.

## SG dominance, `extends` & conflict

SG handbook-references are vendored, read-only, **dominant**. Local entries are additive.

**`extends` is the ONLY sanctioned way a local entry touches an sg topic.** It is **adds-only**: a
local extension may add new anchors and sections under the sg topic; it may NOT redefine an existing
sg anchor or contradict a normative sg claim.

**Conflict is a HARD GATE** at integrate (structural enforcement, not a warning):

- An **undeclared sg-slot overlap** — a local entry whose id/anchor collides with an sg entry without
  an explicit `extends` declaration — **fails integrate**.
- An **`extends` that redefines an sg anchor** — any local section whose anchor matches an existing sg
  anchor — **fails integrate**.

These are structural checks; the build/integrate tooling enforces them before merge.

The curator's **consistency-checker** is the **best-effort backstop** for subtler semantic contradiction
only (duplication where local restates sg; logical contradiction where local says not-X and sg says X).
It is not the gate — it is a quality signal after the structural gate has passed.

**SG wins on any conflict.** The harness's sole governed recourse is the **raise-to-SG valve**: amend
the sg entry at the factory, then pull the updated vendored entry. The render composes sg core + local
extension per topic, ownership-badged.

## Rendering — adopt + **tailor** bc-renderer-core

Adopt `bc-renderer-core` (the proven static-site generator + the PR #83 design) — this is also the
"bring the handbook renderer into stack-graph first" plan from the directory design. **Tailor it** for
our shape, which BC's single-origin renderer does not handle:

- **Compose the union** — render sg-vendored entries + local entries + declared `extends` overlays into
  one artefact (BC renders one origin's content; we render a vendored-plus-overlay composition).
- **Ownership badges** — every entry/section shows `sg` vs `local` provenance, so the operator sees at
  a glance what is the factory's and what is theirs.
- **Kind filter** — only `kind: handbook-reference` renders; standard refs do not.
- Otherwise inherit BC's machinery: filesystem-driven nav, computed numbers, the anchor manifest +
  fragment-lint, the DSL resolver tags, relative-href multi-origin output.

Output: one numbered, cross-referenced, ownership-badged handbook artefact (the **operator-facing
canonical handbook**) + the `index.json` page-graph (for agents). This is the single governed surface
for handbook content; agents also consume node-bound standard refs, external bindings, decisions, and
on-demand refs — the rendered handbook is not the entirety of agent context.

## The full lifecycle

1. **Create** — a node/curator authors an entry through `raise` (PR-gated): `kind: handbook-reference`,
   `type`, `section`, `owner`, `read-when`, `related`, concept anchors in the body. It gets a stable
   slug; its number is assigned at render.
2. **Link** — `related[]` (page-graph, bidirectional), in-body semantic anchor links, node
   `references`/`maintains` edges, and `extends` (local → sg) where it overlays.
3. **Maintain** — the node(s) with `maintains` edges propose changes via the curator; the curator's
   integrate gate runs link-validator (bidirectional `related`), fragment-lint (anchors), and the
   consistency-checker (sg/local conflict). SG entries change only via raise-to-SG.
4. **Render** — the tailored renderer composes the union into the numbered artefact + the anchor
   manifest + the agent index; deploy.

## Generalisation → the decision

**D46 amends D41.** D41 positioned the handbook as an external locator for agent context. D46 changes
the model: sg now ships handbook-references that render **into** the product handbook. The handbook is
no longer merely a pointer to external content — it is the rendered union of sg-vendored entries and
local entries, composited by the tailored renderer. This is a model change, not a silent extension of
D41.

Proposed **D46 — the reference layer + handbook model**: references carry a `kind` (`reference` |
`handbook-reference`); handbook-references take the shape/discipline above; the handbook is the
rendered union of sg-vendored + local handbook-references; maintenance is the `maintains` edge (sg =
external + raise-to-SG); numbering is computed-at-render with concept anchors + fragment-lint;
dominance is extend-only with **hard structural gates at integrate** + consistency-checker backstop +
sg-wins + raise-valve. This design supersedes D41's external-locator model for the handbook.

## Sequencing & deferrals (get the setup right before changing SG)

- **Define the model now** (this doc → spec-amend, full lifecycle). 
- **Apply to the product/harness handbook + build the tailored renderer** as the implementation pass.
- **DEFER stack-graph's own self-application** — converting `handbook/content/` to handbook-references
  and re-homing the refs we built (`four-risks` etc.) into the sectioned handbook home — until the
  model is settled, so SG is changed **once**, deliberately, not churned per decision. SG "eventually
  takes the same form."

## Open details

- The exact `reference` vs `handbook-reference` classification of the existing 10 refs (clear:
  four-risks/vpc/bmc → handbook; findings-schema/severity-scale/lens-dispatch → standard; what-belongs
  borderline).
- The external/factory maintainer node: whether it is a first-class typed node in the graph or just
  `owner: sg` + the raise-to-SG doc. `owner: sg` is provenance; the `maintains` edge from a typed
  external-maintainer node is the structural record — which form lands in the spec is still open.
- `extends` as a typed edge vs a frontmatter field (record-tracked either way).
- The sectioned home for handbook-references in the authoring workspace (where they live vs
  `graph/_refs/`), and how render-order is captured.
- **`maintains` edge taxonomy (02-graph-spec amendment):** class = structural; valid endpoints =
  node → handbook-reference (or external-maintainer-node → handbook-reference for factory entries);
  acyclic; graph-record projection = computed `maintained_by` per entry (symmetric to `consumed_by`).
  Must be added to 02-graph-spec's edge taxonomy table before the spec is finalised.
