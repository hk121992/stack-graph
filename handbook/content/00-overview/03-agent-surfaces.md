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
