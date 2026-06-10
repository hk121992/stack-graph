#!/bin/sh
# sg-token-hook.sh — POSIX guard for the D69 token-instrumentation hooks (issue #21, design §2).
#
# Wired from hooks.json on PostToolUse (sync subagent, PRIMARY) / SubagentStop (background subagent
# fallback) / Stop (session baseline). The hook KIND is $1: postToolUse | subagentStop | stop.
#
# Three responsibilities, in order:
#   1. SCOPE GATE — no SG_* token-instrumentation scope env → dormant no-op (exit 0). The factory's
#      own dev environment never sets these, so the hooks stay inert there; a harness binds them.
#   2. FAIL LOUD — `node` must be resolvable before the handler runs. If it is not, append a visible
#      `instrumentation-error` event (single O_APPEND write of ONE line) + stderr — never a silent
#      drop (design §2). POSIX, so this guard works even where node is the thing that is missing.
#   3. Hand the stdin payload to the node handler, which computes usage and appends the token event.
#
# Always exits 0: token capture must NEVER break the session. Failure is surfaced as a loud event,
# not a non-zero exit.

set -u
KIND="${1:-unknown}"

# 1. Scope gate — both the log binding and the activation flag must be present.
if [ -z "${SG_EVENT_LOG:-}" ] || [ -z "${SG_TOKEN_EVENT_KIND:-}" ]; then
  exit 0
fi

# Read the hook payload from stdin once (Claude Code delivers hook input as JSON on stdin).
PAYLOAD="$(cat)"

# 2. Fail loud if node is unresolvable.
if ! command -v node >/dev/null 2>&1; then
  TS="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo '1970-01-01T00:00:00Z')"
  # One JSON line, single O_APPEND write (the >> redirection opens with O_APPEND); kept tiny (< 4KB)
  # so the append is atomic even under concurrent sessions.
  printf '%s\n' "{\"ts\":\"$TS\",\"kind\":\"instrumentation-error\",\"hook\":\"$KIND\",\"error\":\"node runtime not resolvable on PATH\",\"v\":\"0.4.0\"}" >> "$SG_EVENT_LOG"
  printf 'sg-token-hook[%s]: node runtime not resolvable; instrumentation-error appended to %s\n' "$KIND" "$SG_EVENT_LOG" >&2
  exit 0
fi

# 3. Hand off to the node handler (resolved relative to THIS script, stable in factory + plugin).
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
printf '%s' "$PAYLOAD" | node "$SCRIPT_DIR/lib/emit-usage.mjs" "$KIND" || \
  printf 'sg-token-hook[%s]: node handler exited non-zero (see instrumentation-error events)\n' "$KIND" >&2

exit 0
