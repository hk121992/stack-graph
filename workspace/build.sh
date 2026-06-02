#!/usr/bin/env bash
# Workspace portal assembly (A3b-6).
#
# Builds every surface into workspace/dist/ as one deployable static site:
#   dist/                 — portal hub (index.html) + shared root assets + /fonts/
#   dist/handbook/        — the canon
#   dist/graph/           — the whole-graph browser
#   dist/dashboard/       — the work-ledger-first product-dashboard
#   dist/analytics/       — thin, input-gated
#   dist/portal-projection.json — the sanitized projection snapshot (degraded/empty
#                                  in the factory; published from .stack-graph/ locally)
#
# Order matters: the projection snapshot is published FIRST so the dashboard +
# analytics can join it (degrading loudly when it is empty/stale).
#
# Phase C (a product harness): set DASHBOARD_ROOT=<be-civic ledger path> to render
# real work-items instead of the factory fixture.
#
# Usage: bash workspace/build.sh
set -euo pipefail
cd "$(dirname "$0")/.."   # repo root

DIST="workspace/dist"
PROJECTION="$DIST/portal-projection.json"

echo "==> clean $DIST"
rm -rf "$DIST"
mkdir -p "$DIST"

echo "==> publish projection snapshot (empty/degraded when no .stack-graph events exist)"
bun run workspace/renderer/publish-projection.ts --out "$PROJECTION" || true

echo "==> handbook surface"
bun run workspace/renderer/build-handbook.ts

echo "==> graph browser surface"
bun run workspace/renderer/build-graph.ts

echo "==> product-dashboard surface (ledger: ${DASHBOARD_ROOT:-fixture})"
bun run workspace/renderer/build-dashboard.ts ${DASHBOARD_ROOT:+--root "$DASHBOARD_ROOT"} --projection "$PROJECTION"

echo "==> analytics surface"
bun run workspace/renderer/build-analytics.ts --projection "$PROJECTION"

echo "==> portal hub + shared root assets + fonts"
bun run workspace/renderer/build-portal.ts

echo "==> cloudflare static-asset files"
for f in _headers _redirects; do
  if [ -f "workspace/$f" ]; then cp "workspace/$f" "$DIST/$f"; echo "  [cf] $f"; fi
done

echo "==> assembled. surfaces:"
find "$DIST" -maxdepth 1 -mindepth 1 | sort
