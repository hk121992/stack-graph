---
title: Writing node instructions
type: reference
read-when: Authoring or amending a node body — the skill or agent instructions a node renders into.
related: [overview/authoring, maintenance-skill]
---

# Writing node instructions

A node body **is** an agent surface — it is read by Claude at runtime, not by a person. The
maintainer authors node bodies to Anthropic's published best practice; this page is the
canonical pointer. (For handbook *pages*, see [`01-authoring`](01-authoring.md); for the
skill↔agent choice, see [`concepts`](../01-concepts/README.md).)

## The core test

> Would removing this line cause an agent to make a mistake? If not, cut it.

Default assumption: Claude is already capable — add only context it does not already have.
This is the same prune-bloat test the handbook itself runs; it applies doubly to a node body,
which loads into a live or isolated context on every run.

## Best practices (Anthropic, summarised)

- **Be clear and direct.** If a colleague with minimal context would be confused, so is Claude.
  State output format and constraints explicitly; number steps when order matters.
- **Give the why.** Explain the reason for an instruction — Claude generalises from it. "Avoid
  X because Y" beats a bare "NEVER X," and avoids over-triggering on newer models.
- **Use examples.** A few diverse, edge-case-covering examples steer format and tone more
  reliably than description; wrap them in tags.
- **Structure with tags.** Separate instructions, context, and input with named XML-style tags.
- **The `description` is the routing signal.** Claude selects skills and subagents by matching
  the task against their `description`; write it as the trigger, front-loaded.
- **Calibrate autonomy to reversibility.** Encourage local, reversible actions; require a check
  before hard-to-reverse or shared-system actions.

## Description shape {#description-shape}

A `description` is **pure standing cost**: it loads in every session for every installed skill,
whether or not the skill is ever used. So write it as the routing signal and nothing more — it
answers *"should I load this?"*, not *"what is inside?"*. Two sentences:

1. **What it does** — the capability, in the first sentence.
2. **`Use when …`** — the trigger, as the specific phrases an operator would actually say or the
   contexts that should fire it. Triggers route; process summaries do not.

Write in the third person. Pocock's hard ceiling is 1024 characters; aim well under — most
descriptions need **~200–350 characters**. A longer one earns its length only when the extra
text resolves a routing ambiguity (e.g. distinguishing two near-siblings, or listing the modes
a dispatcher must tell apart). If a sentence in a description does not change *when* the skill is
selected, cut it.

## Prose economy {#prose-economy}

The body loads on every run, so the [core test](#the-core-test) is the floor, not the ceiling.
Apply, in order of impact:

- **No throat-clearing.** Drop "it's worth noting that", "simply", "basically", "in order to",
  and the like. Say the thing.
- **If a sentence could be a bullet, make it a bullet. If a bullet could be cut, cut it.**
- **One idea per bullet.** A bullet doing two jobs is two bullets or one cut.
- **Examples over prose** where an example steers format or judgment more reliably than a
  description of it — but a *few* diverse ones, not a catalogue.
- **One term per concept.** Pick the word and keep it; synonym drift ("module" / "component" /
  "unit" for the same thing) reads as noise and costs precision. Where a node has a working
  vocabulary, state it and name the words to avoid.
- **Split past ~100 lines.** When a body outgrows ~100 lines, move reference material to a
  companion file (a `references/` reference, on-demand) and keep the body the procedure.

**The safety exception (never compress these):** security warnings, irreversible-action
confirmations, and ordered steps whose order is load-bearing. Concision serves correctness; it
never overrides it. When in doubt on a destructive or hard-to-reverse instruction, spell it out.

The description-shape and prose-economy rules above are distilled from Matt Pocock's
`write-a-skill`, `caveman`, and `improve-codebase-architecture` skills (MIT); the operational
checklist the `sg-language-reviewer` tool grades against lives in
`tooling/sg-language-reviewer/references/skill-language-standard.md`.

## Subagent (agent-node) instructions specifically

An agent runs in an **isolated context** and receives only what the dispatch prompt passes.
So an agent body must be **self-contained**: state the task, the inputs it will be given, the
exact output contract, and the tools it may use — it cannot lean on the main thread. Keep its
`description` precise; that is how the dispatcher decides to delegate. Constrain its tools to
what the task needs.

## Canonical sources

Pointers, not vendored copies — read the source for full detail:

| Topic | URL |
|---|---|
| Skills best practices | `platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices` |
| Subagents | `code.claude.com/docs/en/sub-agents` |
| CLAUDE.md / agent best practices | `code.claude.com/docs/en/best-practices` |
| Prompt-engineering best practices | `platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices` |
