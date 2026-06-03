# Skill-language standard — the grading rubric

The operational rubric `sg-language-reviewer` grades against. The **doctrine** is canonical in the
handbook: `handbook/content/00-overview/03-agent-surfaces.md` (the core test, description shape,
prose economy). This file is the checklist that turns that doctrine into per-item PASS / FLAG
verdicts with proposed rewrites. When this rubric and the handbook diverge, the handbook wins.

Distilled from Matt Pocock's `write-a-skill`, `caveman`, and `improve-codebase-architecture`
(MIT) — verbatim sources under `../source-material/`.

## What this rubric applies to

- **Node descriptions** — the `description:` frontmatter of every `graph/<id>/<id>.md`.
- **Node bodies** — the imperative instructions below the frontmatter.
- **Tooling-skill descriptions and bodies** — the `sg-*` skills in `tooling/`.

It does **not** apply to research-reports (not shipped; not loaded at runtime) or to
source-material (verbatim, never edited).

## Part A — Description rubric

A description is pure standing cost: it loads every session for every installed skill. Grade each
description on five checks. Any FLAG yields a proposed rewrite + a character/token delta.

| # | Check | PASS | FLAG |
|---|---|---|---|
| A1 | **Two-part shape** | First sentence states the capability; a `Use when …` clause states the trigger | No trigger clause, or trigger is a process summary not operator-phrasing |
| A2 | **Routing signal, not summary** | Every clause changes *when* the skill is selected | Contains description of internals that does not affect selection |
| A3 | **Budget** | ≤ ~350 chars, or longer with a named routing-ambiguity justification | > ~350 chars with no ambiguity to resolve; hard ceiling 1024 |
| A4 | **Third person, present tense** | "Authors and maintains nodes…" | First person, or future/conditional padding |
| A5 | **Distinctness** | Distinguishable from sibling skills by its triggers | Two skills whose descriptions a router could not tell apart |

**Node two-key schema (A1).** Node files (`graph/<id>/<id>.md`) split the routing signal across
two frontmatter keys: `description:` (the capability) and `when-to-use:` (the trigger). The plugin
build folds `when-to-use` into the shipped description. So for a **node**, A1 is satisfied when a
well-formed `when-to-use:` carries the trigger — grade `description:` for capability + economy, not
for a `Use when` clause. **Tooling skills** (`tooling/sg-*/SKILL.md`) are final artifacts with no
build fold, so their `description:` must carry **both** parts itself.

**Proposed-rewrite rule:** preserve every distinct trigger phrase (those are routing signal —
dropping one can make the skill unselectable). Cut only summary, hedging, and restatement. Report
the before/after character count and an estimated token delta (≈ chars ÷ 4).

## Part B — Body prose-economy rubric

Apply the handbook's core test first — *would removing this line cause an agent to make a
mistake? If not, cut it* — then these:

| # | Check | FLAG when… |
|---|---|---|
| B1 | **Throat-clearing** | "it's worth noting", "simply", "basically", "in order to", "please note", "as mentioned" appear |
| B2 | **Sentence-that-should-be-a-bullet** | A multi-clause sentence enumerates items that a bullet list would carry |
| B3 | **Cuttable bullet** | A bullet restates a neighbour, or states what Claude already does by default |
| B4 | **Two-idea bullet** | One bullet carries two independent instructions |
| B5 | **Synonym drift** | The same concept is named by ≥2 words across the body |
| B6 | **Over-length** | Body > ~100 lines with reference material that belongs in a companion file |
| B7 | **Redundant restatement** | The body repeats the frontmatter, or repeats itself across sections |

## The safety exception (overrides all of Part B)

Never compress, and never propose cutting:

- **security warnings**
- **irreversible / hard-to-reverse action confirmations**
- **ordered steps whose order is load-bearing** (renumbering or merging changes behaviour)

Concision serves correctness; it never overrides it. A proposed rewrite that touches any of these
must be flagged for explicit operator review, not auto-applied.

## Output discipline

The reviewer **proposes**; it does not silently rewrite. Every finding carries: the item
(file + frontmatter field or line range), the check id (A1–A5 / B1–B7), the current text, the
proposed text, and the token delta. The operator (or the driving skill) applies. Descriptions and
bodies that touch the safety exception are surfaced separately and never marked auto-applicable.

## Sources

- `../source-material/pocock-write-a-skill.md` — description standard (1024-char ceiling, third
  person, `Use when` shape), split-at-~100-lines, the review checklist.
- `../source-material/pocock-caveman.md` — token-compression drop-rules; the auto-clarity
  (safety) exception.
- `../source-material/pocock-ica-LANGUAGE.md` — one-term-per-concept / avoid-synonyms discipline.
- `../source-material/pocock-ica-HTML-REPORT.md` — "if a sentence could be a bullet…; if a bullet
  could be cut, cut it; no hedging, no throat-clearing."
- All MIT, Copyright 2026 Matt Pocock (`../source-material/LICENSE-mattpocock-skills`).
