// Shell host — stack-graph's branding + slot wiring around the vendored
// renderShell. Every portal surface (handbook, dashboard, graph) renders its
// page chrome through renderSurfacePage so branding stays in one place.

import { renderShell } from "./vendor/bc-renderer-core/src/index.js";
import type { ShellArgs, CorePage, NavGroup } from "./vendor/bc-renderer-core/src/index.js";
import { makeAssetUrl, makePageHref, assetPrefix } from "./lib/asset-prefix.js";
import { wordmarkSlot, brandHead } from "./brand/brand.js";

export const SITE_TITLE = "stack-graph workspace";
export const SITE_DESCRIPTION =
  "The factory portal — handbook, product-dashboard, and the graph browser.";

export interface SurfacePageOptions {
  /** URL slug (no leading slash); "" = surface root. Drives relative asset/href prefixes. */
  slug: string;
  page: CorePage;
  nav: NavGroup[];
  bodyHtml: string;
  showToc?: boolean;
  suppressHeader?: boolean;
  /** Page layout shape: docs (default) | app | full-bleed. */
  layoutVariant?: "docs" | "app" | "full-bleed";
  /** Sidebar label override (e.g. slug → frontmatter title). */
  pageLabel?: (slug: string) => string;
  breadcrumb?: ShellArgs["breadcrumb"];
  preBodySlot?: ShellArgs["preBodySlot"];
  postBodySlot?: ShellArgs["postBodySlot"];
  /** Extra <script> tags after the shell defaults (e.g. graph-browser.js). */
  bodyScripts?: () => string;
  /** Extra <head> content appended after the brand head. */
  extraHead?: () => string;
}

/** Render a portal page through the vendored shell with stack-graph branding. */
export function renderSurfacePage(opts: SurfacePageOptions): string {
  const assetUrl = makeAssetUrl(opts.slug);
  const pageHref = makePageHref(opts.slug);
  // The workspace hub is the deploy root, one level above the surface root.
  const hubHref = assetPrefix(opts.slug) + "../";
  return renderShell({
    page: opts.page,
    nav: opts.nav,
    bodyHtml: opts.bodyHtml,
    assetUrl,
    pageHref,
    siteTitle: SITE_TITLE,
    siteDescription: SITE_DESCRIPTION,
    showToc: opts.showToc,
    suppressHeader: opts.suppressHeader,
    layoutVariant: opts.layoutVariant,
    pageLabel: opts.pageLabel,
    breadcrumb: opts.breadcrumb,
    preBodySlot: opts.preBodySlot,
    postBodySlot: opts.postBodySlot,
    wordmark: () => wordmarkSlot(hubHref, "/favicon.svg"),
    topbarRight: () =>
      `<span class="nav-right"><a class="nav-cta" href="${hubHref}">← workspace</a>` +
      `<button class="theme-toggle" type="button" aria-label="Toggle light/dark theme">◐</button></span>`,
    headExtras: () => brandHead(assetUrl) + (opts.extraHead ? "\n" + opts.extraHead() : ""),
    footer: () =>
      `<span class="footer-brand">stack-graph — the factory · read-only comprehension surface</span>`,
    bodyScripts: opts.bodyScripts,
  });
}
