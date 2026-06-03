# Design System — stack-graph workspace portal

> The portal's single visual source of truth. Read this before any UI/visual change.
> Brand is **per-instance**: stack-graph itself uses the neutral identity below; a
> consuming product (e.g. Be Civic) overrides palette + fonts via the brand layer
> (`brand-overrides.css` + `brand.config.json`) without touching this system.

## Product Context
- **What this is:** the operator's read-only comprehension surface over a workspace —
  handbook + product-dashboard + graph browser + BMC/VPC canvas + analytics, rendered
  as one navigable, deployed site (behind Cloudflare Access).
- **Who it's for:** a single operator who builds + runs an agent operating environment.
- **Space:** developer tooling / internal operator instruments.
- **Memorable thing:** *a precise instrument for people who build agents* — calm, dense,
  trustworthy. Nearer to Linear/Vercel than to any marketing site.

## Aesthetic Direction
- **Direction:** industrial / utilitarian × minimal.
- **Decoration:** minimal — typography, hairlines, and one accent do the work. No gradients,
  no decorative blobs, no icon-in-circle grids.
- **Mood:** quiet control surface. Information-dense without feeling busy. Restraint is the identity.
- **Reference points:** Linear, Vercel dashboard, Stripe (shell); Obsidian/Neo4j Bloom (graph);
  Linear board / GitHub Projects (dashboard); Strategyzer (canvas); Vercel Analytics / Plausible (analytics).

## Logo & wordmark
- **Mark (canonical):** `workspace/renderer/brand/favicons/favicon.svg` — scalable hexagon S/G badge (teal gradient `#0b2636`→`#36646f` + light `#99c3c0` motif). Used as the wordmark mark and the favicon. (`mark.png` was the earlier raster crop — superseded.)
- **Full lockup:** `workspace/renderer/brand/logo-full.png` — mark + wordmark + tagline; for a hero/login, not the top bar.
- **Wordmark (top bar):** the SVG mark (~24px) + `stack-graph` in **Geist** (live text, weight 600). Links to the workspace hub.
- **Favicons:** full set in `brand/favicons/` (svg · ico · 16/32/48 · apple-touch · 192/512 · maskable) + `site.webmanifest`, copied to the deploy root; head links emitted by `faviconHead()` (`brand.ts`). theme-color `#0c0d0e`.
- **Source:** Gemini-generated badge (operator), vectorised to SVG + favicon set (2026-06-03).

## Typography
- **Display / UI / body:** **Geist Sans** — clean grotesk, operator-grade, distinct from Be Civic's Manrope.
- **Data / tables / numerics / graph labels / code:** **Geist Mono** (use `font-variant-numeric: tabular-nums`).
- **Loading:** self-host woff2 under `/fonts/` (install-free). Preview may use Google Fonts.
- **Scale (rem, 16px root):** xs .75 / sm .875 / base 1 / lg 1.125 / xl 1.375 / 2xl 1.75 / 3xl 2.25.
- **Weights:** body 400, medium 500, semibold 600, headings 600–700. Line-height: body 1.55, headings 1.2.

## Color
- **Approach:** restrained — neutrals carry everything; one accent; functional colors only where they mean something.
- **Accent (teal — matches the logo):** `#1b7f93` (hover `#13606f`); dark-mode `#46b0c4`. Links, focus rings, active nav, primary buttons, selection.
- **Neutrals — light:** bg `#f8f9fa` · surface `#ffffff` · raised `#f1f3f5` · hairline `#e6e8eb` ·
  ink `#1b1d1f` · body `#3a3d42` · mute `#6b7177`.
- **Neutrals — dark:** bg `#0c0d0e` · surface `#161719` · raised `#1d1f22` · hairline `#26282b` ·
  ink `#f2f3f4` · body `#c5c8cc` · mute `#8b9097`.
- **Semantic / health (graph + state):** fresh `#2e9e6b` · aging `#d9a514` · stale `#d84a3f` · unknown `#9aa0a6`.
  Also used for: success / warning / error / neutral.
- **Node-type fills (graph + legend):** skill `#ffffff` (accent stroke) · agent `#e8f1f3` (teal-tint, dark `#1f3138`) ·
  script `#fff3c4` (gold-tint). All carry **dark ink labels** — this is the fix for the black-on-black nodes;
  fills are concrete hex in the DOT (Graphviz can't read CSS variables).
- **Dark mode:** redesign surfaces (above), don't invert; reduce accent/semantic saturation ~10%.

## Spacing
- **Base unit:** 4px. (No scale existed before this system.)
- **Scale (px):** 2xs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 32 · 3xl 48 · 4xl 64.
- **Density:** comfortable for docs/canvas; compact for dashboard/graph/analytics (tables, cards).

## Layout — three variants (the structural keystone)
The renderer shell takes a `layoutVariant`. Every surface declares one.
- **`docs`** — handbook only. 3-column grid: `260px` left nav · content `max-width: 72ch` · `220px` right TOC.
- **`app`** — dashboard, canvas, analytics. Slim left nav (`220px`, collapsible) · fluid content `max-width: 1440px` · **no TOC column**. Board/grid/table layouts live here.
- **`full-bleed`** — graph browser. No nav/TOC chrome; edge-to-edge canvas; floating **overlay panels** (detail drawer, legend, filters) instead of an in-flow sidebar.
- **Top bar (all variants):** wordmark (links to the **workspace hub**) on the left; `← workspace` link + theme toggle on the right. Hub URL is parameterised per instance.

## Border radius
- sm 4 · md 6 · lg 8 (cards, panels). Pills `9999` for **tags/chips only**. Nothing else fully rounded.

## Motion
- **Approach:** minimal-functional. Transitions that aid comprehension only; no scroll choreography.
- **Duration:** micro 120ms · short 180ms · medium 240ms. **Easing:** enter `ease-out`, exit `ease-in`.
- Respect `prefers-reduced-motion`.

## Component notes (portal-specific)
- **Tags/chips:** tier (`T1`/`T2`), lifecycle state, risk, stage — small pill, mono, dark ink on tinted bg.
- **Work-item card (dashboard):** title · tier · risk · lifecycle chip · `current_stage` chip (projection) · outcome link. Click → right detail drawer.
- **IU card (drawer + incremental channel):** id · goal · files-touched · acceptance · size · tracking state.
- **Health dot (graph):** fresh/aging/stale/unknown using the semantic colors.
- **Freshness banner:** input-gated / stale / fresh — explicit, never a silent green.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-03 | Initial design system created | /design-consultation; neutral operator-instrument identity for stack-graph, per-instance brand swap for products. References: Linear/Vercel/Stripe/Obsidian/Strategyzer. |
| 2026-06-03 | Accent → teal `#1b7f93`; logo + wordmark added | Harmonised the accent with the operator's Gemini hexagon mark; mark cropped to transparent (`brand/mark.png`), wordmark = mark + Geist text. |
