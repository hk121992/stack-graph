#!/usr/bin/env bash
# B5 — wire be-civic's ~/.claude (product skills + settings). NOT the dev-tooling.
# Run as root / sudo.
set -uo pipefail
[[ $EUID -eq 0 ]] || { echo "run as root (sudo)"; exit 1; }

# ~/.claude must be be-civic-owned (Claude writes session state there). If B3 created it root-owned
# on an older run, fix it here. The vendored plugin under ~/.claude/plugins stays root-owned.
chown be-civic:be-civic /home/be-civic/.claude

# Product-skill symlinks. Root-shell glob + per-dir `sudo -u be-civic ln` — do NOT use
# `sudo -i ... bash -lc '<multiline>'` (sudo -i flattens newlines and mangles the loop).
sudo -u be-civic mkdir -p /home/be-civic/.claude/skills
for d in /home/be-civic/projects/be-civic/bc-operations/*-skills/*/ ; do
  [ -d "$d" ] && sudo -u be-civic ln -sfn "$d" /home/be-civic/.claude/skills/"$(basename "$d")"
done
echo "linked skills:" ; ls /home/be-civic/.claude/skills

# settings.json — written AS be-civic (so it stays be-civic-owned; root Write/Edit re-owns it and
# Claude can't then update it). Carries gstack's security deny-list. Review model + allow-list.
sudo -u be-civic tee /home/be-civic/.claude/settings.json >/dev/null <<'JSON'
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" },
  "permissions": {
    "allow": [
      "Bash(gh pr view:*)", "Bash(gh pr list:*)", "Bash(gh pr diff:*)", "Bash(gh pr checks:*)",
      "Bash(gh pr create:*)", "Bash(gh pr edit:*)", "Bash(gh issue:*)",
      "Bash(gh run list:*)", "Bash(gh run view:*)", "Bash(gh secret list:*)",
      "Bash(gh api repos/hk121992/bc-*)", "Bash(gh api repos/Be-Civic/*)",
      "Bash(git push origin feat/*)", "Bash(git push origin chore/*)", "Bash(git push origin fix/*)",
      "Bash(git push -u origin feat/*)", "Bash(git push -u origin chore/*)", "Bash(git push -u origin fix/*)",
      "Bash(wrangler whoami:*)", "Bash(wrangler deploy --dry-run *)", "Bash(wrangler tail:*)",
      "Bash(wrangler d1 migrations list:*)", "Bash(wrangler secret list:*)",
      "Bash(git rev-parse:*)", "Bash(git -C:*)"
    ],
    "deny": [
      "Read(.env*)", "Edit(.env*)", "Write(.env*)",
      "Bash(rm -rf /*)", "Bash(rm -rf ~*)", "Bash(rm -rf $HOME*)",
      "Bash(git push --force*)", "Bash(git push -f*)", "Bash(git push origin main*)",
      "Bash(git push origin --delete main*)", "Bash(git reset --hard*)",
      "Bash(npm install:*)", "Bash(npm i:*)", "Bash(npm ci:*)", "Bash(npx:*)",
      "Bash(bun install:*)", "Bash(bun add:*)", "Bash(bunx:*)",
      "Bash(pnpm install:*)", "Bash(pnpm add:*)", "Bash(pnpm dlx:*)",
      "Bash(yarn add:*)", "Bash(yarn install:*)"
    ]
  },
  "model": "claude-opus-4-7",
  "effortLevel": "xhigh",
  "agentPushNotifEnabled": true
}
JSON
echo "wrote ~/.claude/settings.json"

cat <<'EOF'

MANUAL follow-ups (be-civic design; not blocking):
- org-root CLAUDE.md / launch dir: bc-operations/ and bc-workspace/ each carry their own CLAUDE.md
  (loaded when Claude launches in that repo). Decide be-civic's launch dir / whether a thin
  org-root CLAUDE.md is wanted.
- Do NOT symlink stack-graph/tooling/sg-* — dev-tooling stays in gstack.
EOF
