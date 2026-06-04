---
name: sg-language-reviewer
description: Dev-time tooling that tightens skill and node language to cut token cost. Modes — descriptions (sweep every node + tooling description, propose tighter rewrites) and tighten (prose-economy pass on one node or skill body). Use when descriptions are bloated or a skill body is wordy. NOT shipped to product end-users.
---

# sg-language-reviewer

You are operating the `sg-language-reviewer` skill. The operator invoked
`/sg-language-reviewer <mode> <args>` inside a Claude Code session. **You are the dispatcher** —
there is no binary. You grade against the rubric and dispatch a reviewer agent; you never silently
rewrite.

## Dev-tooling boundary

`sg-*` skills are dev-time tooling for the factory, not shipped to product end-users. This skill
operates on the authoring workspace (`graph/<id>/<id>.md`) and the `tooling/sg-*/SKILL.md` files.

## The standard

Grade every finding against `references/skill-language-standard.md` (PASS / FLAG per check
A1–A5 for descriptions, B1–B7 for bodies). The doctrine it answers to is canonical in
`handbook/content/00-overview/03-agent-surfaces.md`. **The safety exception in the rubric overrides
every economy check** — security warnings, irreversible-action confirmations, and order-bearing
steps are never compressed, and a rewrite touching them is surfaced for explicit review, never
auto-applied.

## Invocation

```
/sg-language-reviewer                       # bare; print orientation, ask which mode
/sg-language-reviewer descriptions [scope]  # scope: all (default) | nodes | tooling
/sg-language-reviewer tighten <id|path>     # one node id or a tooling SKILL.md path
```

## Mode: descriptions

A description is pure standing cost — it loads every session for every installed skill. This mode
finds the bloat.

1. **Collect targets.** `scope=nodes` → the `description:` frontmatter of every
   `graph/*/<id>.md`. `scope=tooling` → every `tooling/sg-*/SKILL.md` description. `scope=all`
   (default) → both. Report the count.
2. **Dispatch the reviewer agent** (one dispatch; the sweep is bounded). Input: the target list +
   `mode: descriptions`. It returns one finding per description: file, current text, proposed
   text, checks flagged (A1–A5), and the char + estimated-token delta (≈ chars ÷ 4).
3. **Present**, ranked by tokens saved (largest first), with a total estimated saving. Show the
   before/after for each.
4. **Offer to apply** via AskUserQuestion (Apply all / Pick / None). Apply only frontmatter
   `description:` edits. **Never apply** a finding that drops a distinct trigger phrase — flag it
   for manual review. `.bak` the file before any write.

## Mode: tighten

A prose-economy pass on one node body or skill body.

1. **Resolve the target.** A node `<id>` → `graph/<id>/<id>.md`; or a `tooling/sg-*/SKILL.md`
   path. Abort if it does not exist.
2. **Dispatch the reviewer agent.** Input: the file + `mode: tighten`. It returns findings keyed
   to line ranges (check B1–B7), each with current text, proposed text, token delta, and a
   `safety_exception: true|false` flag.
3. **Present** findings grouped: economy findings first, then any `safety_exception: true`
   findings in a separate "review manually — not auto-applicable" block.
4. **Offer to apply** the economy findings via AskUserQuestion (Apply all / Pick / None). `.bak`
   the file before any write. Safety-exception findings are never in the apply set.

## Bare invocation

Print a two-line orientation (the two modes) and ask via AskUserQuestion which to run.

## Hard constraints

- **MUST propose, then apply on operator approval — never silently rewrite.**
- **MUST preserve every distinct trigger phrase in a description.** Dropping one can make a skill
  unselectable; that is a correctness regression, not a saving.
- **MUST honour the safety exception.** Findings touching security warnings, irreversible-action
  confirmations, or order-bearing steps are surfaced separately and never auto-applied.
- **MUST `.bak` before any overwriting write** (the deliberate-orphan pattern; cleanup is
  operator-side).
- **MUST NOT touch research-reports or source-material** — they are not runtime surfaces.

## Cross-references

- `references/skill-language-standard.md` — the grading rubric (cites the handbook doctrine).
- `agents/language-reviewer.md` — the dispatched reviewer agent.
- `handbook/content/00-overview/03-agent-surfaces.md` — canonical doctrine (description shape,
  prose economy, the core test, the safety exception).
