---
title: Knowledge substrate — code-map, recall, and traceability (research + decision record)
status: decided — 2026-05-30 (revisit triggers below)
---

# Knowledge substrate

The detailed record behind the knowledge-substrate decision (decisions.md **D38**/**D39**). Kept
because we expect to revisit it as the tooling field matures. The canonical, terse statement is
in [`06-analytics`](../handbook/content/06-analytics/README.md); the trail lives here.

## The question we were answering

A crystallizing node like `explore` (D35) needs product knowledge — code structure, prior
reasoning, the spec/domain. The first cut invented a "product-map manifest" reference with an
undefined shape. The operator's pushback exposed the real questions:

- What is a `.claude` **reference** vs a **handbook entry** vs a **gbrain** entry — where does
  each kind of knowledge belong?
- Is **gbrain** even the right tool for *code* (we adopted it by inertia)?
- Could it **all be one graph** — code + specs + decisions + design as nodes and edges, since
  it's all markdown/graphable (the way our handbook's `index.json` already has `related[]`
  edges and our graph is edges-in-frontmatter)?
- Could one tool (e.g. **graphify**) deliver **both** the code structure *and* the semantic /
  traceability layer?

## The decision (summary)

A **four-layer knowledge partition**, and — the load-bearing insight — **traceability is
authored, not inferred**:

| Layer | Holds | Edge/access | Tool | Authored vs derived |
|---|---|---|---|---|
| **Handbook** (+ decisions store) | curated spec / domain / rationale | curated, human-reviewed | the handbook + curator | **authored + curated** |
| **Code-map** | the product's code structure — calls, deps, defs/refs | deterministic extraction + traversal | mature AST tools: **repo-map + ast-grep** now; a graph-DB later | **extracted** (exact) |
| **gbrain (recall)** | reasoning / transcripts / decisions (prose) | semantic similarity + entity graph | gbrain, capability-gated | **derived recall** |
| **`.claude` reference** | operational executables (scripts, configs, checklists) | run, not read | co-located with the node | authored by the node, reconcile-gated |

**Code↔spec traceability** (the "unified graph" prize) is reached by **authoring** it
(spec-touchpoints tables, `references` edges, the handbook's `related[]`, the raise/integrate
curation flow) — **not** by a tool inferring fuzzy edges. See the next section for why.

## Why traceability is authored, not inferred (the key insight)

The whole field is trying to *infer* code↔spec edges with an LLM. **Keeping those inferred
edges fresh is an open, unsolved problem everywhere** — no surveyed tool tracks lineage or
re-validates an edge when either side changes; only Graphiti does temporal edge-invalidation,
and it can't model code. So an inferred unified graph is part-fact, part-continuously-re-guessed,
at LLM cost, with no freshness guarantee.

stack-graph **sidesteps this by construction**: its edges are *authored and curated* — the
`spec touchpoints` discipline (every design doc names the spec sections it touches), `references`
edges, the handbook page-graph, and the curator's raise/integrate flow are an **authored**
code↔spec traceability stream. The traceability the field fails to *infer* reliably, we *author*.
This is the same principle as "canonical = real `.claude` files; the graph is a derived lens with
authored typed edges." So the unified code+spec graph is a north-star reached by **authoring +
deterministic extraction + recall**, never by betting on inferred edges as source of truth.

## The field survey (so we don't re-research)

All recency as of 2026-05-30. **The young semantic/graph tools are all ~8 weeks old** (gbrain
and graphify both ~April 2026), so maturity does **not** separate them — they are equal-age
*capability* bets. The deterministic layer (tree-sitter, AST indexers, ast-grep, SCIP,
dependency-cruiser) is the genuinely mature foundation.

| Tool | Ingests code | Ingests external docs | code↔doc edges | Edge type | Traversal | Recall | Freshness | OSS | Local | Iface |
|---|---|---|---|---|---|---|---|---|---|---|
| **graphify** | AST (tree-sitter) | yes (md/pdf/img) | **claims**, unverified | mixed, tagged EXTRACTED/INFERRED/AMBIGUOUS | yes | yes | incremental AST; **docs = LLM re-extract** | MIT | yes | CLI+MCP+skill |
| **Cognee** | yes (Py AST) | yes (any) | not confirmed in one graph | LLM + structural | yes (Neo4j/…) | yes | hash deltas; schema change = re-add | Apache-2.0 | yes | CLI+MCP+lib |
| **Graphiti/Zep** | no code model | yes (episodes) | no code symbols | **bi-temporal** (best freshness) | yes | yes | best-in-class temporal | Apache-2.0 | yes | lib+MCP |
| **potpie** | AST→Neo4j | **no** (generates specs *from* code) | no | extracted | yes | yes | bg reparse | Apache-2.0 | yes (Docker) | REST/VSCode |
| **code-graph-rag** | tree-sitter→Memgraph | no | no | extracted | yes (Cypher) | limited | reindex | OSS | yes | **MCP** |
| **Mem0** | partial | yes | no code symbols | LLM-inferred | yes | yes | update pipeline | Apache-2.0 | yes | lib+MCP |
| **LlamaIndex PGI** | text only | yes | inferred only | LLM triples | yes | yes | manual | MIT | yes | lib |
| **txtai** | text | yes | no code typing | embeddings(+graph) | limited | strong | manual | Apache-2.0 | yes | lib |
| **gbrain** | **no structural code** | yes (md) | **no** (prose entity edges) | self-wiring prose edges | yes | strong (hybrid+synthesis) | reindex md | MIT | yes | CLI+MCP+lib |

**Verdict:** **no single OSS tool delivers code + external-spec markdown in one graph with
trustworthy, fresh typed code↔spec edges today.** graphify is the only single-tool *aspirant*
(and the only one tagging edge trust), but its doc↔code edges are LLM-inferred and unverified —
no worked spec-file→function example in its own docs. **gbrain is the least capable for the
*unified* vision** (no structural code ingest at all) but is well-matched for its *actual* job,
prose recall (hybrid retrieval + synthesis + entity graph).

**Supporting evidence — deterministic beats inferred for code structure:** arXiv 2601.08773
(AST-derived vs LLM-extracted code Graph-RAG) found AST graphs build in seconds with higher
coverage and architectural-query accuracy at far lower cost, while LLM-extracted graphs skip
files (377 missed on one repo), hallucinate on architecture, and scale poorly.

## Tool decisions (D39)

- **Code-map → mature deterministic AST.** `explore`'s `repo` mode uses an Aider-style
  **repo-map** (PageRank over tree-sitter tags — ranked orientation) + **ast-grep** (precise
  structural drill-down: defs/calls/refs). Local, no-LLM, no-DB, deterministic, MCP/CLI — best
  posture fit, near-zero risk. A persistent graph-DB tool (**code-graph-rag**, **potpie**, or
  the SCIP-precise **blarify**) is **deferred** until a node genuinely needs **multi-hop /
  blast-radius impact analysis** (a `review`/`build` need, not `explore`).
- **Recall → gbrain, scope clarified (refines D31).** gbrain is the **prose-recall** layer
  (reasoning / transcripts / decisions). It is **not** the code-map — it has no structural code
  ingestion. Keep it capability-gated; nothing here replaces it for recall.
- **Traceability → authored + curated** (handbook spec-touchpoints, `references` edges,
  raise/integrate). Not inferred.
- **graphify / unified-inference → deferred behind a capability gate.** Worth a *time-boxed
  spike on our own handbook* if/when we want to *augment* authored traceability with inferred
  candidates (human-confirmed, never source of truth). Not adopted now — its distinctive value
  (inferred cross-edges) is the field's unsolved-freshness, LLM-cost, unverified layer.

All substrates are **optional, capability-gated, local-first, consume-don't-fork** — the D31
posture, applied to every layer.

## What would make us revisit (triggers)

1. A node needs **multi-hop impact / blast-radius analysis** ("what breaks if I change this,
   transitively") → adopt a deterministic graph-DB (code-graph-rag / potpie / blarify).
2. A maturing tool (graphify ≥1.0, Cognee, Graphiti) **demonstrably delivers fresh, trustworthy
   code↔spec edges on our own corpus** → reconsider unifying the code-map + traceability.
3. **Authored traceability proves insufficient** (upkeep too high, or coverage gaps) → consider
   inferred-edge *augmentation* (candidate edges, human-confirmed at reconcile).
4. Someone **solves inferred-edge freshness/lineage** (the field's open problem) → revisit the
   single-unified-graph option in earnest.

## Sources

graphify (github.com/safishamsi/graphify) · Cognee (github.com/topoteretes/cognee) ·
Graphiti/Zep (github.com/getzep/graphiti; arXiv 2501.13956) · potpie (github.com/potpie-ai/potpie) ·
code-graph-rag.com · Mem0 (github.com/mem0ai/mem0) · LlamaIndex PropertyGraphIndex ·
gbrain (github.com/garrytan/gbrain) · Aider repo-map · ast-grep · SCIP (sourcegraph/scip) ·
arXiv 2601.08773 (AST vs LLM code graphs) · arXiv 2603.27277 (tree-sitter KG via MCP).
