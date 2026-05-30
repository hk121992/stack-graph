#!/usr/bin/env -S bun run
/**
 * refresh-index.ts — regenerate handbook/content/index.json from a filesystem walk.
 *
 * TODO: implement this script. Contract below; logic mirrors bc-handbook-curator's
 * refresh-index.ts with HANDBOOK_ROOT resolution adapted for the stack-graph repo
 * layout (no bc-workspace/ wrapper — the handbook root IS the repo's own handbook/).
 *
 * CONTRACT
 * --------
 * Input:  $HANDBOOK_ROOT — path to the stack-graph `handbook/` directory.
 *         If unset, walk up from this script's location looking for a `handbook/content/`
 *         directory. Abort with exit code 2 if not found.
 *
 * Walk:   `$HANDBOOK_ROOT/content/NN-<section>/` directories only.
 *         Included files: `README.md` (section index) and `NN-<page>.md` leaves.
 *         Excluded: files without `NN-` prefix (except README.md); `11-archive/` skipped wholesale.
 *
 * Slug rule:
 *   `content/NN-section/README.md`      → `section`
 *   `content/NN-section/NN-page.md`     → `section/page`
 *
 * Frontmatter: parse title, type, read-when, related (inline array form only).
 *   Pages with incomplete lean frontmatter (missing title, type, or read-when) are
 *   SKIPPED with a stderr warning — do not fail the run.
 *
 * Output: `$HANDBOOK_ROOT/content/index.json` — JSON array sorted by slug, one entry per page:
 *   { slug, title, type, "read-when", related }
 *   Encode non-ASCII as \uXXXX to keep the file diff-stable across runs.
 *
 * Exit codes:
 *   0  success (idempotent — same output as last run if no changes)
 *   2  handbook root cannot be resolved
 *
 * IMPLEMENTATION NOTES
 * --------------------
 * - Use Node built-ins (node:fs, node:path) — no external dependencies.
 * - The minimal YAML parser from bc-handbook-curator (single-line scalars + inline arrays)
 *   is sufficient; multi-line YAML is banned by the authoring rule.
 * - Announce the slug list of changed entries (not just the count) to stdout so `raise`
 *   mode can surface them in the PR.
 */

// Implementation goes here.
