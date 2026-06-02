#!/usr/bin/env bash
# B6 — env-completeness + security-boundary gate. Run as root / sudo.
# ALL env checks must pass and ALL boundary checks must report OK before Phase C/D.
set -uo pipefail
[[ $EUID -eq 0 ]] || { echo "run as root (sudo)"; exit 1; }
BC=be-civic
be() { sudo -iu "$BC" bash -lc "$*"; }   # single-line commands only (sudo -i mangles multiline)

# --- Broker network reach: INTENTIONALLY ALLOWED (operator decision 2026-06-02) ---
# The runbook blocked be-civic -> 127.0.0.1:7393 via iptables; we deliberately DON'T. The broker is
# the gatekeeper, so the real boundary is that be-civic cannot read the issuer token (it lives in
# ~gstack, unreadable) and therefore cannot bypass the broker or mint secrets. Tier-B fetches still
# require Slack approval. (Residual: be-civic could silently pull Tier-A secrets it lacks, since the
# auto-approve rules match requester:"*". If that matters, tighten them to named requesters — broker-side.)

echo ; echo "=== ENV CHECKS ==="
echo -n "1. claude:       " ; be 'export PATH=$HOME/.bun/bin:$PATH; claude --version'
echo -n "2. gbrain query: " ; be 'export PATH=$HOME/.bun/bin:$PATH; gbrain query "civic" --limit 2 >/dev/null 2>&1 && echo OK || echo FAIL'
echo    "3. skills:" ;        be 'ls ~/.claude/skills'
echo -n "4. plugin RO:    " ; be 'touch ~/.claude/plugins/stack-graph/_w 2>/dev/null && { echo "FAIL writable"; rm -f ~/.claude/plugins/stack-graph/_w; } || echo "OK read-only"'
echo -n "5. gh auth:      " ; be 'gh auth status 2>&1 | grep -o "Logged in to github.com account [A-Za-z0-9_-]*" || echo "not authed"'

echo ; echo "=== SECURITY-BOUNDARY CHECKS (all must be OK) ==="
be 'cat /home/gstack/.bashrc >/dev/null 2>&1 && echo "FAIL: ~gstack readable" || echo "OK: ~gstack unreadable"'
be 'ls /home/gstack/projects >/dev/null 2>&1 && echo "FAIL: gstack source reachable" || echo "OK: gstack source unreachable"'
be 'command -v agent-run >/dev/null 2>&1 && echo "FAIL: agent-run present" || echo "OK: no broker/agent-run wrapper"'
be 'cat /home/gstack/.config/bws/issuer-token >/dev/null 2>&1 && echo "FAIL: issuer token readable (can bypass broker)" || echo "OK: issuer token unreadable (cannot bypass broker)"'
# Plugin protection = be-civic cannot write the plugins parent (so cannot add/remove/rename entries).
# (Do NOT use `rmdir --ignore-fail-on-non-empty` — it returns 0 without removing, giving a false FAIL.)
be 'test -w ~/.claude/plugins && echo "FAIL: plugins dir writable (plugin removable)" || echo "OK: plugin dir not writable (protected)"'

echo ; echo "GATE: all (1-5) pass + all boundary checks OK -> proceed to Phase C. Any failure -> fix first."
