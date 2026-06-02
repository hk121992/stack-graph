#!/usr/bin/env -S bun run
/**
 * refresh-index.ts — regenerate handbook/content/index.json from a filesystem walk.
 *
 * Logic mirrors bc-handbook-curator's refresh-index.ts, with HANDBOOK_ROOT
 * resolution adapted for the stack-graph repo layout (no bc-workspace/ wrapper —
 * the handbook root IS the repo's own handbook/).
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
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

interface PageEntry {
  slug: string;
  title: string;
  type: string;
  "read-when": string;
  related: string[];
}

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

function resolveHandbookRoot(): string {
  const envRoot = process.env.HANDBOOK_ROOT;
  if (envRoot && existsSync(join(envRoot, "content"))) {
    return envRoot;
  }
  // Walk up from script dir looking for a `handbook/content/` directory.
  let cur = SCRIPT_DIR;
  for (let i = 0; i < 12; i++) {
    const candidate = join(cur, "handbook");
    if (existsSync(join(candidate, "content"))) return candidate;
    const parent = dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }

  console.error(
    "refresh-index: cannot resolve handbook root. Set $HANDBOOK_ROOT to the handbook/ directory, or run from inside a stack-graph checkout.",
  );
  process.exit(2);
}

function parseFrontmatter(filePath: string): Record<string, unknown> | null {
  const raw = readFileSync(filePath, "utf-8");
  if (!raw.startsWith("---")) return null;
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return null;
  const block = raw.slice(4, end).trim();

  // Minimal YAML parser sufficient for the lean handbook frontmatter:
  // single-line scalars (`key: value`) and inline arrays (`key: [a, b]`).
  // Multi-line / nested YAML is banned by the authoring rule.
  const out: Record<string, unknown> = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value: unknown = m[2].trim();
    if (typeof value === "string") {
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      // Inline array
      if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
        const inner = value.slice(1, -1).trim();
        value = inner === ""
          ? []
          : inner.split(",").map((s) => {
              let v = s.trim();
              if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                v = v.slice(1, -1);
              }
              return v;
            });
      }
    }
    out[key] = value;
  }
  return out;
}

function computeSlug(relPath: string): string | null {
  // relPath: e.g. "08-devops/01-sprint-cycle.md", "08-devops/README.md"
  const parts = relPath.split("/");
  if (parts.length < 2) return null;
  const sectionPart = parts[0];
  const filePart = parts[1];

  const sectionMatch = sectionPart.match(/^\d{2}-(.+)$/);
  if (!sectionMatch) return null;
  const section = sectionMatch[1];

  if (filePart === "README.md") return section;

  const fileMatch = filePart.match(/^\d{2}-(.+)\.md$/);
  if (!fileMatch) return null;
  return `${section}/${fileMatch[1]}`;
}

function walk(contentRoot: string): PageEntry[] {
  const entries: PageEntry[] = [];
  const errors: string[] = [];

  const sections = readdirSync(contentRoot).filter((name) => {
    const full = join(contentRoot, name);
    if (!statSync(full).isDirectory()) return false;
    if (!/^\d{2}-/.test(name)) return false;
    // Archive section is historical record, not navigation target. Skip wholesale.
    if (name === "11-archive") return false;
    return true;
  });

  for (const section of sections) {
    const sectionDir = join(contentRoot, section);
    const files = readdirSync(sectionDir).filter((name) => {
      if (name === "README.md") return true;
      return /^\d{2}-.+\.md$/.test(name);
    });

    for (const file of files) {
      const fullPath = join(sectionDir, file);
      const relPath = `${section}/${file}`;
      const slug = computeSlug(relPath);
      if (!slug) continue;

      const fm = parseFrontmatter(fullPath);
      if (!fm) {
        errors.push(`${relPath}: skipped (no frontmatter)`);
        continue;
      }

      const title = typeof fm.title === "string" ? fm.title : "";
      const type = typeof fm.type === "string" ? fm.type : "";
      const readWhen = typeof fm["read-when"] === "string" ? fm["read-when"] : "";
      const related = Array.isArray(fm.related)
        ? (fm.related as unknown[]).filter((x): x is string => typeof x === "string")
        : [];

      if (!title || !type || !readWhen) {
        errors.push(`${relPath}: skipped (incomplete lean frontmatter — retrofit pending)`);
        continue;
      }

      entries.push({ slug, title, type, "read-when": readWhen, related });
    }
  }

  if (errors.length > 0) {
    for (const e of errors) console.error(`refresh-index: ${e}`);
    console.error(`refresh-index: ${errors.length} page(s) skipped; ${entries.length} included`);
  }

  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  return entries;
}

// Serialise one entry per line in the hand-maintained compact form:
//   { "slug": "...", "title": "...", "type": "...", "read-when": "...", "related": [...] }
// JSON.stringify on each scalar gives correct quoting/escaping; the inline
// related array uses `, ` separators to match the committed file.
function serializeEntry(e: PageEntry): string {
  const related = "[" + e.related.map((r) => JSON.stringify(r)).join(", ") + "]";
  return (
    "  { " +
    `"slug": ${JSON.stringify(e.slug)}, ` +
    `"title": ${JSON.stringify(e.title)}, ` +
    `"type": ${JSON.stringify(e.type)}, ` +
    `"read-when": ${JSON.stringify(e["read-when"])}, ` +
    `"related": ${related}` +
    " }"
  );
}

function serialize(entries: PageEntry[]): string {
  return "[\n" + entries.map(serializeEntry).join(",\n") + "\n]\n";
}

// Escape non-ASCII characters as \uXXXX so the emitted JSON matches the
// committed encoding regardless of whether the source string used literal
// em-dashes etc. Without this, every run produces a cosmetic-only diff that
// the integrate walk can't land (handbook is PR-only, no direct push).
function asciiEncode(json: string): string {
  let out = "";
  for (const ch of json) {
    const code = ch.codePointAt(0)!;
    out += code > 0x7f ? "\\u" + code.toString(16).padStart(4, "0") : ch;
  }
  return out;
}

function main(): void {
  const handbookRoot = resolveHandbookRoot();
  const contentRoot = join(handbookRoot, "content");
  const outputPath = join(contentRoot, "index.json");

  const entries = walk(contentRoot);
  const json = asciiEncode(serialize(entries));

  let prior = "";
  if (existsSync(outputPath)) prior = readFileSync(outputPath, "utf-8");

  if (prior === json) {
    console.log(`refresh-index: unchanged (${entries.length} pages)`);
    return;
  }

  // Announce the slugs of changed entries so `raise` mode can surface them.
  const priorBySlug = new Map<string, string>();
  if (prior) {
    for (const line of prior.split("\n")) {
      const m = line.match(/"slug":\s*"([^"]*)"/);
      if (m) priorBySlug.set(m[1], line.trim().replace(/,$/, ""));
    }
  }
  const nextBySlug = new Map<string, string>();
  for (const e of entries) nextBySlug.set(e.slug, asciiEncode(serializeEntry(e)).trim());

  const changed: string[] = [];
  for (const e of entries) {
    const before = priorBySlug.get(e.slug);
    if (before === undefined) changed.push(`${e.slug} (added)`);
    else if (before !== nextBySlug.get(e.slug)) changed.push(`${e.slug} (modified)`);
  }
  for (const slug of priorBySlug.keys()) {
    if (!nextBySlug.has(slug)) changed.push(`${slug} (removed)`);
  }

  writeFileSync(outputPath, json, "utf-8");
  console.log(`refresh-index: wrote ${entries.length} pages to ${outputPath}`);
  if (changed.length > 0) {
    console.log(`refresh-index: changed entries: ${changed.join(", ")}`);
  }
}

main();
