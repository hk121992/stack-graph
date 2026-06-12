# analyzer test fixtures

Tiny **synthetic** Claude Code transcript tree the analyzer test (`analyze.test.ts`) derives over.
Hand-authored (not lifted from a real workspace), so it carries **no private content** and pins the
exact transcript shapes the analyzer parses (verified against real logs under
`~/.claude/projects/**` while authoring Cluster A). Field shapes confirmed real:

- denial / rejection / tool-error arrive as a `tool_result` block on a **`type:"user"`** entry, with
  `is_error:true` and a string `content` (`"… has been denied."` / `"The user doesn't want to
  proceed…"` / a `<tool_use_error>…`).
- `Skill` tool_use input is `{skill, args}` (not `{name}`); a slash invocation is a
  `<command-name>/x</command-name>` block in a user message.
- `attributionSkill` is on assistant entries and toggles per-message (coalesced in §3.4).
- a subagent dispatch prompt is the **first user message** of `<session>/subagents/agent-*.jsonl`; the
  `META: carrier=… kind=… arc=… iu=…` line is what loop-runner emits after A3′ (absent on today's real
  prose bundles, so attribution falls back).

## Layout

```
projects/
  sess-alpha.jsonl                         top-level session: /triage slash + Skill(triage) span,
                                           usage (TTL split + flat-fallback), a hard denial, a user
                                           rejection, a tool error, a permissionDecision=deny.
  sess-alpha/subagents/agent-build1.jsonl  dispatched build IU with a META: line → attribution
                                           (carrier=wave-A kind=standalone-iu arc=incremental iu=A1)
                                           + dispatch/unit usage.
```

Additional fixtures (browse-toggle coalescing, cross-session stall, META-absent fallback) are added
by their respective IUs (A3/A4).

## Pinned token sums (computed via `lib/transcript-usage.ts`)

- `sess-alpha.jsonl` → input 300, output 130, cc5m 60, cc1h 5, read 10, **total 505** (2 counted, model claude-opus-4-8).
- `agent-build1.jsonl` → input 450, output 180, cc5m 10, cc1h 0, read 50, **total 690** (2 counted, model claude-opus-4-8).
