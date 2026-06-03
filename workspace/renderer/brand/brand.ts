// Brand layer — the single swappable seam (design §4 / §6).
//
// The portal reuses be-civic's renderer-core CSS/JS as-is for now; this layer
// is the one place to re-skin without touching the vendored renderer or the
// surface builds. Swap brand.config.json's values (or add `palette` token
// overrides, emitted into brand-overrides.css consumers) to rebrand.
//
// Contract (design §6 — brand-config schema):
//   { wordmark: { text, svg? }, favicon?, palette: {token: css-value}, theme_key }
//
// NOTE (documented swap-point): the vendored shell.ts + theme.js hardcode the
// localStorage theme key `becivic_theme`; `theme_key` here records the intended
// value so a future full rebrand can parameterise those two vendored files.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export interface BrandConfig {
  wordmark: { text: string; svg?: string };
  favicon?: string;
  palette: Record<string, string>;
  theme_key: string;
}

const __dir = dirname(fileURLToPath(import.meta.url));
export const brand: BrandConfig = JSON.parse(
  readFileSync(join(__dir, "brand.config.json"), "utf8"),
) as BrandConfig;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Top-left brand link. An svg wordmark wins over the text form when present. */
export function wordmarkSlot(home: string, markUrl?: string): string {
  const mark = markUrl ? `<img class="wordmark-img" src="${esc(markUrl)}" alt="">` : "";
  const inner = brand.wordmark.svg
    ? brand.wordmark.svg
    : `${mark}<span class="wordmark-text">${esc(brand.wordmark.text)}</span>`;
  return `<a class="wordmark" href="${esc(home)}" aria-label="${esc(brand.wordmark.text)} — home">${inner}</a>`;
}

/**
 * Head extras for the shell: the brand-override stylesheet (loaded after the
 * vendored style.css so `--brand-*` token overrides win) + the favicon.
 * Passed into renderShell's `headExtras` slot.
 */
export function brandHead(assetUrl: (basename: string) => string): string {
  return [
    `<link rel="stylesheet" href="${esc(assetUrl("brand-overrides.css"))}">`,
    faviconHead(),
  ].join("\n");
}

/** The full favicon set. Absolute root paths — the files are copied to the
 *  deploy root (like /fonts/), so the same links resolve from every surface. */
export function faviconHead(): string {
  return [
    `<link rel="icon" href="/favicon.ico" sizes="any">`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">`,
    `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    `<link rel="manifest" href="/site.webmanifest">`,
    `<meta name="theme-color" content="#0c0d0e">`,
  ].join("\n");
}

/**
 * Render the configured palette tokens as a `:root { --token: value; }` block.
 * Empty by default (we inherit be-civic's palette from the vendored style.css);
 * populating brand.config.json's `palette` re-skins without editing vendored CSS.
 */
export function paletteCss(): string {
  const entries = Object.entries(brand.palette);
  if (entries.length === 0) {
    return "/* stack-graph brand overrides — inherits be-civic palette from the vendored style.css.\n   Populate brand.config.json `palette` to re-skin; tokens land in :root below. */\n";
  }
  const decls = entries.map(([k, v]) => `  --${k}: ${v};`).join("\n");
  return `:root {\n${decls}\n}\n`;
}
