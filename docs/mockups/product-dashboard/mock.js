/* mock.js — drawer client + shared sample data for the two-surface dashboard mockup.
 *
 * Mirrors the production popout.js (a right-hand detail drawer, deep-linkable by hash,
 * CSP-safe), plus: a data-kind hook for the wider work-item drawer, a <details>-from-hash
 * shim (the D65 objective-accordion deep-link), and a theme toggle. In production the
 * drawer HTML is a per-page #popout-data JSON sidecar; here it is one shared object so the
 * three mockup pages stay DRY. Sample data is a GENERIC example product — no real terms.
 */
(function () {
  "use strict";

  /* ── Theme toggle ─────────────────────────────────────────────────────────── */
  var root = document.documentElement;
  try { if (localStorage.getItem("mock-theme") === "dark") root.classList.add("dark"); } catch (e) {}
  document.addEventListener("click", function (e) {
    if (e.target.closest(".theme-toggle")) {
      root.classList.toggle("dark");
      try { localStorage.setItem("mock-theme", root.classList.contains("dark") ? "dark" : "light"); } catch (e2) {}
    }
  });

  /* ── Drawer content (shared sidecar) ──────────────────────────────────────── */
  // One unified link affordance for every artefact link.
  function alink(label, glyph, target, text, opts) {
    opts = opts || {};
    var inner = opts.code ? "<code>" + text + "</code>" : text;
    var note = opts.note ? ' <span class="alink-note">' + opts.note + "</span>" : "";
    if (opts.unresolved) {
      return '<div class="alink-row"><span class="alink-label">' + label + '</span>' +
        '<span class="alink alink-unresolved"><span class="alink-glyph">' + glyph + '</span><code>' + text +
        '</code></span> <span class="unresolved-tag">' + opts.unresolved + "</span></div>";
    }
    if (opts.plain) {
      return '<div class="alink-row"><span class="alink-label">' + label + '</span>' +
        '<span class="alink-note">' + text + "</span></div>";
    }
    var attr = opts.popout ? ' data-popout="' + target + '"' : ' href="' + target + '"';
    return '<div class="alink-row"><span class="alink-label">' + label + '</span>' +
      '<a class="alink"' + attr + '><span class="alink-glyph">' + glyph + '</span>' + inner + "</a>" + note + "</div>";
  }

  function riskGrid(cells) {
    var html = cells.map(function (c) {
      return '<div class="risk-cell risk-' + c[1] + '" title="' + c[0] + " — " + c[2] + '">' +
        '<span class="risk-cell-dot"></span><span class="risk-cell-label">' + c[0] + '</span>' +
        '<span class="risk-cell-rung">' + (c[1] === "unknown" ? "—" : c[1]) + "</span></div>";
    }).join("");
    return '<div class="risk-grid" role="group" aria-label="Four-risks coverage">' + html + "</div>";
  }

  function iuCard(id, status, size, title, goal) {
    return '<div class="iu-card" data-popout="' + id + '" role="button" tabindex="0">' +
      '<div class="iu-head"><span class="iu-id">' + id + '</span>' +
      '<span class="iu-status iu-st-' + status + '">' + status + '</span>' +
      (size ? '<span class="iu-size">' + size + "</span>" : "") + "</div>" +
      '<div class="iu-title">' + title + '</div><div class="iu-goal">' + goal + "</div></div>";
  }

  function contribChip(id, state, title, stage) {
    return '<a class="contrib lifecycle-' + state + '" data-popout="' + id + '">' +
      '<span class="contrib-state">' + state + '</span><span class="contrib-title">' + title + "</span>" +
      (stage ? '<span class="contrib-stage">' + stage + "</span>" : "") + "</a>";
  }

  function gate(name, decision, owner, when, ev) {
    return '<li class="gate-entry"><div class="gate-header"><span>' + name + '</span>' +
      '<span class="gate-' + (decision === "go" ? "go" : "nogo") + '">' + decision.toUpperCase() + "</span></div>" +
      '<div class="gate-meta">' + owner + " · " + when + "</div>" +
      (ev ? '<div class="gate-evidence">Evidence: ' + ev + "</div>" : "") + "</li>";
  }

  // ── Work-item drawers (kind: work-item — wider panel) ──
  var POPOUT = {
    "WI-GUIDEDRUN": { kind: "work-item", code: "WI-GUIDEDRUN", html:
      '<div class="po-group">committed · T1</div>' +
      '<h2 class="po-title">Guided first-run flow</h2>' +
      '<div class="po-badges"><span class="lifecycle-tag">committed</span><span class="tier-badge">T1</span>' +
      '<span class="risk-pill risk-moderate">risk: moderate</span></div>' +
      '<div class="item-throughline">' +
        alink("Objective", "→", "strategy.html#OBJ-ACTIVATE", "Lift new-team activation", { note: "→ vision" }) +
        alink("Bet tested", "→", "B-PAIN-01", "B-PAIN-01", { popout: true, code: true, note: "setup/config blocks first value" }) +
        '<div class="alink-row tl-risk"><span class="alink-label">Four-risks</span>' +
        riskGrid([["value", "strong", "observed in design-partner sessions"], ["usability", "moderate", "tested with 5 users"],
          ["feasibility", "strong", "spike done"], ["viability", "moderate", "pricing untested"]]) + "</div>" +
      "</div>" +
      '<div class="po-section"><div class="po-label">Problem / why</div><p>New teams stall before their first shared outcome — value is gated behind configuration they don\'t yet understand. A guided first-run that produces a real artefact in &lt;10 min is the wedge.</p></div>' +
      '<div class="po-section"><div class="po-label">Implementation units</div><div class="iu-grid">' +
        iuCard("IU-001", "done", "M", "First-run state machine", "Drive the steps + skip logic.") +
        iuCard("IU-002", "building", "M", "Progress checklist UI", "The visible 'you are here' rail.") +
        iuCard("IU-003", "planned", "S", "Skip-to-app escape hatch", "Never trap a power user.") +
      "</div></div>" +
      '<div class="po-section"><div class="po-label">Gate decisions</div><ul class="gate-list">' +
        gate("discovery → defined", "go", "PM", "2026-05-21", "5 design-partner sessions; pain confirmed") +
        gate("defined → committed", "go", "PM", "2026-05-30", "spike: feasible in one sprint") +
      "</ul></div>" +
      '<p class="po-permalink">Permalink: <a href="#WI-GUIDEDRUN">item/WI-GUIDEDRUN</a> · shareable / no-JS fallback</p>' },

    "WI-DEFAULTS": { kind: "work-item", code: "WI-DEFAULTS", html:
      '<div class="po-group">in-delivery · T1</div>' +
      '<h2 class="po-title">Opinionated workspace defaults</h2>' +
      '<div class="po-badges"><span class="lifecycle-tag">in-delivery</span><span class="tier-badge">T1</span>' +
      '<span class="risk-pill risk-strong">risk: strong</span><span class="card-stage">stage: <strong>build</strong></span></div>' +
      '<div class="item-throughline">' +
        alink("Objective", "→", "strategy.html#OBJ-ACTIVATE", "Lift new-team activation", { note: "→ vision" }) +
        alink("Bet tested", "→", "B-JOB-01", "B-JOB-01", { popout: true, code: true, note: "teams want a fast shared win" }) +
        '<div class="alink-row tl-risk"><span class="alink-label">Four-risks</span>' +
        riskGrid([["value", "strong", "observed"], ["usability", "strong", "did-yes"], ["feasibility", "strong", "shipped pattern"], ["viability", "moderate", "said-yes"]]) + "</div>" +
      "</div>" +
      '<div class="po-section"><div class="po-label">Problem / why</div><p>Configuration is the stall. Ship sensible defaults so a team produces value before they ever open settings.</p></div>' +
      '<div class="po-section"><div class="po-label">Implementation units</div><div class="iu-grid">' +
        iuCard("IU-010", "done", "S", "Default workspace template", "Pre-seed the shared artefact.") +
        iuCard("IU-011", "building", "M", "Defer-config rules", "Hide admin until first win.") +
      "</div></div>" +
      '<div class="po-section"><div class="po-label">Dev-stage traversal (from snapshot)</div><ul class="timeline-list">' +
        '<li class="timeline-entry"><span class="timeline-stage">plan</span><span class="timeline-at">2026-06-02</span></li>' +
        '<li class="timeline-entry"><span class="timeline-stage">build</span><span class="timeline-at">2026-06-06</span></li>' +
      "</ul></div>" +
      '<p class="po-permalink">Permalink: <a href="#WI-DEFAULTS">item/WI-DEFAULTS</a></p>' },

    "WI-TEMPLATES": { kind: "work-item", code: "WI-TEMPLATES", html:
      '<div class="po-group">defined · T2</div>' +
      '<h2 class="po-title">Starter templates</h2>' +
      '<div class="po-badges"><span class="lifecycle-tag">defined</span><span class="tier-badge">T2</span>' +
      '<span class="risk-pill risk-weak">risk: weak</span></div>' +
      '<div class="item-throughline">' +
        alink("Objective", "→", "strategy.html#OBJ-ACTIVATE", "Lift new-team activation", { note: "→ vision" }) +
        alink("Bet tested", "→", "B-GAIN-02", "B-GAIN-02", { popout: true, code: true, note: "a real artefact builds trust" }) +
        '<div class="alink-row tl-risk"><span class="alink-label">Four-risks</span>' +
        riskGrid([["value", "weak", "assumed"], ["usability", "unknown", "not recorded"], ["feasibility", "moderate", "spike"], ["viability", "weak", "assumed"]]) + "</div>" +
      "</div>" +
      '<div class="po-section"><div class="po-label">Problem / why</div><p>A blank workspace is a cold start. Templates give the first session a concrete shape — but the value premise is still only assumed.</p></div>' +
      '<div class="po-section"><div class="po-label">Implementation units</div><p class="iu-empty">No implementation units carved out yet.</p></div>' +
      '<p class="po-permalink">Permalink: <a href="#WI-TEMPLATES">item/WI-TEMPLATES</a></p>' },

    "WI-INVITE": { kind: "work-item", code: "WI-INVITE", html:
      '<div class="po-group">discovery · T2</div>' +
      '<h2 class="po-title">Frictionless teammate invites</h2>' +
      '<div class="po-badges"><span class="lifecycle-tag">discovery</span><span class="tier-badge">T2</span></div>' +
      '<div class="item-throughline">' +
        alink("Objective", "→", "strategy.html#OBJ-RETAIN", "Make week-2 retention reflect real value", { note: "→ vision" }) +
        alink("Value prop", "→", "", "a shared tool needs the whole team present", { plain: true }) +
      "</div>" +
      '<div class="po-section"><div class="po-label">Problem / why</div><p>A team product with one user isn\'t a team product. Still in discovery — testing whether invite friction is the real blocker.</p></div>' +
      '<p class="po-permalink">Permalink: <a href="#WI-INVITE">item/WI-INVITE</a></p>' },

    "WI-METRICS": { kind: "work-item", code: "WI-METRICS", html:
      '<div class="po-group">idea · T3</div>' +
      '<h2 class="po-title">Activation analytics</h2>' +
      '<div class="po-badges"><span class="lifecycle-tag">idea</span><span class="tier-badge">T3</span></div>' +
      '<div class="item-throughline">' +
        '<div class="alink-row"><span class="alink-label">Objective</span><span class="alink-note">— no outcome_link; ladders to nothing yet</span></div>' +
      "</div>" +
      '<div class="po-section"><div class="po-label">Problem / why</div><p>We can\'t see activation drop-off step by step. An idea with no objective attached — a candidate, not a commitment (shown honestly as unlinked).</p></div>' +
      '<p class="po-permalink">Permalink: <a href="#WI-METRICS">item/WI-METRICS</a></p>' },

    "WI-SIGNUP": { kind: "work-item", code: "WI-SIGNUP", html:
      '<div class="po-group">shipped · T1</div>' +
      '<h2 class="po-title">Streamlined signup</h2>' +
      '<div class="po-badges"><span class="lifecycle-tag">shipped</span><span class="tier-badge">T1</span>' +
      '<span class="risk-pill risk-strong">risk: strong</span></div>' +
      '<div class="item-throughline">' +
        alink("Objective", "→", "strategy.html#OBJ-ACTIVATE", "Lift new-team activation", { note: "→ vision" }) +
        alink("Bet tested", "→", "B-PAIN-01", "B-PAIN-01", { popout: true, code: true }) +
      "</div>" +
      '<div class="po-section"><div class="po-label">Outcome</div><p>Cut signup from 6 fields to 2 + SSO. Activation lift measurable within a week.</p></div>' +
      '<div class="po-section"><div class="po-label">Links</div><p>Debrief: <code>debrief recorded</code> · Build PRs: <code>#142</code>, <code>#147</code></p></div>' +
      '<div class="frozen-timeline"><div class="frozen-title">Frozen timeline (committed at close)</div><ul class="timeline-list">' +
        '<li class="timeline-entry"><span class="timeline-stage">plan</span><span class="timeline-at">2026-04-10</span></li>' +
        '<li class="timeline-entry"><span class="timeline-stage">build</span><span class="timeline-at">2026-04-14</span></li>' +
        '<li class="timeline-entry"><span class="timeline-stage">ship</span><span class="timeline-at">2026-04-22</span></li>' +
        '<li class="timeline-entry"><span class="timeline-stage">shipped (final)</span><span class="timeline-at">2026-04-22</span></li>' +
      "</ul></div>" +
      '<p class="po-permalink">Permalink: <a href="#WI-SIGNUP">item/WI-SIGNUP</a></p>' },

    "WI-SALESDEMO": { kind: "work-item", code: "WI-SALESDEMO", html:
      '<div class="po-group">killed · T2</div>' +
      '<h2 class="po-title">Sales-led onboarding</h2>' +
      '<div class="po-badges"><span class="lifecycle-tag">killed</span><span class="tier-badge">T2</span></div>' +
      '<div class="item-throughline">' +
        alink("Objective", "→", "strategy.html#OBJ-ACTIVATE", "Lift new-team activation", { note: "→ vision" }) +
        alink("Bet tested", "→", "B-OLD-01", "B-OLD-01", { popout: true, code: true, note: "the killed demand premise" }) +
      "</div>" +
      '<div class="po-section"><div class="po-label">Disposition</div><p>Killed — demand premise failed. Self-serve teams won\'t book a demo; see bet <code>B-OLD-01</code> (killed). Kept in the record as anti-portfolio.</p></div>' +
      '<p class="po-permalink">Permalink: <a href="#WI-SALESDEMO">item/WI-SALESDEMO</a></p>' },

    // ── Child IU drawers (nested from a work-item) ──
    "IU-001": iuDrawer("sprint · parent WI-GUIDEDRUN", "WI-GUIDEDRUN", "Guided first-run flow", "First-run state machine", "done", "M",
      "Drive the first-run steps + the skip logic, server-authoritative.", ["src/onboarding/machine.ts"], [], ["Resumes mid-run", "Skip leaves a clean state"]),
    "IU-002": iuDrawer("sprint · parent WI-GUIDEDRUN", "WI-GUIDEDRUN", "Guided first-run flow", "Progress checklist UI", "building", "M",
      "The visible 'you are here' rail with live step completion.", ["src/onboarding/Checklist.tsx"], ["IU-001"], ["Reflects machine state", "Keyboard navigable"]),
    "IU-003": iuDrawer("sprint · parent WI-GUIDEDRUN", "WI-GUIDEDRUN", "Guided first-run flow", "Skip-to-app escape hatch", "planned", "S",
      "Always offer an exit so a power user is never trapped.", ["src/onboarding/Skip.tsx"], ["IU-001"], ["One click to the real app", "Run resumable later"]),
    "IU-010": iuDrawer("sprint · parent WI-DEFAULTS", "WI-DEFAULTS", "Opinionated workspace defaults", "Default workspace template", "done", "S",
      "Pre-seed the shared artefact so the workspace is never empty.", ["src/workspace/defaults.ts"], [], ["New workspace has a starter artefact"]),
    "IU-011": iuDrawer("sprint · parent WI-DEFAULTS", "WI-DEFAULTS", "Opinionated workspace defaults", "Defer-config rules", "building", "M",
      "Hide admin/config surfaces until the team has its first win.", ["src/workspace/gating.ts"], ["IU-010"], ["Settings hidden pre-activation", "Power-user override exists"]),

    // ── Standalone IU drawers (incremental channel — no parent; improves a target) ──
    "SI-01": standaloneIuDrawer("incremental · improves behaviour:onboarding-empty-state", "Tighten empty-state copy", "done", "S",
      "Rewrite the empty-state to point at the first action.", ["src/components/EmptyState.tsx"], ["Copy points to the next action"]),
    "SI-02": standaloneIuDrawer("incremental · improves node:invite-flow", "Fix invite email deep-link", "building", "S",
      "The invite link should land in the shared workspace, not the home screen.", ["src/email/invite.ts"], ["Invite lands on the workspace"]),
    "SI-03": standaloneIuDrawer("incremental · improves reference:a11y", "Add keyboard nav to template picker", "planned", "S",
      "Arrow-key + enter selection in the template grid.", ["src/templates/Picker.tsx"], ["Fully operable by keyboard"]),

    // ── Bet drawers (in-place peek of canvas-owned data + open-in-canvas) ──
    "B-PAIN-01": betDrawer("vpc · pains", "Setup / config blocks first value", "confirmed", "strong", "critical",
      "Observed across 5 of 5 design-partner sessions — teams abandon before configuring.",
      [["WI-GUIDEDRUN", "committed", "Guided first-run flow"], ["WI-SIGNUP", "shipped", "Streamlined signup"]]),
    "B-JOB-01": betDrawer("vpc · jobs", "Teams want a fast shared win to justify switching", "tested", "moderate", "critical",
      "Said-yes in interviews; not yet observed end-to-end (said ≠ did).",
      [["WI-DEFAULTS", "in-delivery", "Opinionated workspace defaults"]]),
    "B-GAIN-02": betDrawer("vpc · gains", "A real artefact in the first session builds trust", "assumed", "weak", "high",
      "Plausible, untested. The riskiest open bet on the value side.",
      [["WI-TEMPLATES", "defined", "Starter templates"]]),
    "B-CH-01": betDrawer("bmc · channels", "Product-led self-serve acquisition", "tested", "moderate", "medium",
      "Self-serve funnel converts; CAC not yet proven at volume.", []),
    "B-REV-01": betDrawer("bmc · revenue_streams", "Per-seat pricing once a team is active", "assumed", "weak", "high",
      "Monetisation premise — unvalidated; gated behind activation.", []),
    "B-OLD-01": betDrawer("bmc · channels", "Onboarding via sales-led demos", "killed", "weak", "medium",
      "Killed — self-serve teams won't book a demo. Retired; kept for the pivot record.", [["WI-SALESDEMO", "killed", "Sales-led onboarding"]]),

    // ── Canvas block drawers (the cross-surface 'open in canvas' lands here) ──
    "CV-VPC-PAINS": canvasBlockDrawer("vpc · pains", [["B-PAIN-01", "confirmed", "strong", "Setup / config blocks first value"]]),
    "CV-VPC-JOBS": canvasBlockDrawer("vpc · jobs", [["B-JOB-01", "tested", "moderate", "Teams want a fast shared win"]]),
    "CV-VPC-GAINS": canvasBlockDrawer("vpc · gains", [["B-GAIN-02", "assumed", "weak", "A real artefact builds trust"]]),
    "CV-BMC-CHANNELS": canvasBlockDrawer("bmc · channels", [["B-CH-01", "tested", "moderate", "Product-led self-serve"], ["B-OLD-01", "killed", "weak", "Sales-led demos (killed)"]]),
    "CV-BMC-REVENUE": canvasBlockDrawer("bmc · revenue", [["B-REV-01", "assumed", "weak", "Per-seat once active"]])
  };

  function iuDrawer(group, parentId, parentTitle, title, status, size, goal, files, deps, acc) {
    return { kind: "iu", code: title, html:
      '<a class="po-back" data-popout="' + parentId + '">← back to ' + parentTitle + "</a>" +
      '<div class="po-group">' + group + "</div>" +
      '<h2 class="po-title">' + title + "</h2>" +
      '<div class="po-badges"><span class="iu-status iu-st-' + status + '">' + status + '</span><span class="iu-size">' + size + "</span></div>" +
      '<div class="po-section"><div class="po-label">Goal</div><p>' + goal + "</p></div>" +
      (files.length ? '<div class="po-section"><div class="po-label">Files</div><p>' + files.map(c).join(" ") + "</p></div>" : "") +
      (deps.length ? '<div class="po-section"><div class="po-label">Depends on</div><p>' + deps.map(c).join(" ") + "</p></div>" : "") +
      (acc.length ? '<div class="po-section"><div class="po-label">Acceptance</div><ul>' + acc.map(function (a) { return "<li>" + a + "</li>"; }).join("") + "</ul></div>" : "") };
  }
  function standaloneIuDrawer(group, title, status, size, goal, files, acc) {
    return { kind: "iu", code: title, html:
      '<div class="po-group">' + group + "</div>" +
      '<h2 class="po-title">' + title + "</h2>" +
      '<div class="po-badges"><span class="iu-status iu-st-' + status + '">' + status + '</span><span class="iu-size">' + size + "</span></div>" +
      '<div class="po-section"><div class="po-label">Goal</div><p>' + goal + "</p></div>" +
      '<div class="po-section"><div class="po-label">Files</div><p>' + files.map(c).join(" ") + "</p></div>" +
      '<div class="po-section"><div class="po-label">Acceptance</div><ul>' + acc.map(function (a) { return "<li>" + a + "</li>"; }).join("") + "</ul></div>" };
  }
  function betDrawer(group, text, ev, strength, imp, detail, work) {
    var workHtml = work.length
      ? '<div class="contrib-list">' + work.map(function (w) { return contribChip(w[0], w[1], w[2]); }).join("") + "</div>"
      : '<p class="contrib-empty">No work testing this bet yet.</p>';
    var id = group + text; // not used; kept for clarity
    return { kind: "bet", code: text, html:
      '<div class="po-group">' + group + "</div>" +
      '<h2 class="po-title">' + text + "</h2>" +
      '<div class="bet-meta"><span class="ev-chip ev-' + ev + '">' + ev + '</span>' +
        '<span class="str str-' + (strength === "unknown" ? "weak" : strength) + '">' + strength + " evidence</span>" +
        '<span class="riskiest-imp imp-' + imp + '">' + imp + "</span></div>" +
      '<div class="po-section"><div class="po-label">Evidence</div><p>' + detail + "</p></div>" +
      '<div class="po-section"><div class="po-label">Work testing this bet</div>' + workHtml + "</div>" +
      '<a class="open-in-canvas" href="canvas.html#' + betIdFromText(text) + '">Open in canvas →</a>' };
  }
  function canvasBlockDrawer(group, bets) {
    var rows = bets.map(function (b) {
      return '<div class="alink-row"><span class="str str-' + (b[2] === "unknown" ? "weak" : b[2]) + '">' + b[2] + "</span>" +
        '<span class="ev-chip ev-' + b[1] + '">' + b[1] + "</span> " + b[3] + ' <code class="riskiest-id">' + b[0] + "</code></div>";
    }).join("");
    return { kind: "bet", code: group, html:
      '<div class="po-group">' + group + "</div><h2 class=\"po-title\">Block bets</h2>" +
      '<div class="po-section">' + rows + "</div>" +
      '<p class="po-permalink">This is the canvas\'s own drawer — the dashboard peeked here from a bet link.</p>' };
  }
  function c(x) { return "<code>" + x + "</code>"; }
  // map a bet's display text back to an id-anchor for the canvas deep-link (mockup only).
  function betIdFromText(text) {
    var map = {
      "Setup / config blocks first value": "B-PAIN-01",
      "Teams want a fast shared win to justify switching": "B-JOB-01",
      "A real artefact in the first session builds trust": "B-GAIN-02",
      "Product-led self-serve acquisition": "B-CH-01",
      "Per-seat pricing once a team is active": "B-REV-01",
      "Onboarding via sales-led demos": "B-OLD-01"
    };
    return map[text] || "";
  }

  /* ── Drawer mechanism (mirrors popout.js) ─────────────────────────────────── */
  var aside = document.querySelector(".popout");
  if (aside) {
    var elCode = aside.querySelector(".popout-code");
    var elBody = aside.querySelector(".popout-body");
    var lastFocus = null;

    var open = function (id) {
      var it = POPOUT[id];
      if (!it) return;
      if (elCode) elCode.textContent = it.code || "";
      if (elBody) elBody.innerHTML = it.html || "";
      aside.setAttribute("data-kind", it.kind || "");
      aside.setAttribute("data-open", "true");
      aside.setAttribute("aria-hidden", "false");
      if (decodeURIComponent((location.hash || "").slice(1)) !== id) {
        history.replaceState(null, "", "#" + encodeURIComponent(id));
      }
      var btn = aside.querySelector(".popout-close");
      if (btn) btn.focus();
    };
    var close = function () {
      aside.setAttribute("data-open", "false");
      aside.setAttribute("aria-hidden", "true");
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-popout]");
      if (trigger) { e.preventDefault(); lastFocus = trigger; open(trigger.getAttribute("data-popout")); return; }
      if (e.target.closest("[data-close]")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && aside.getAttribute("data-open") === "true") close();
      if (e.key === "Enter" || e.key === " ") {
        var t = e.target.closest && e.target.closest("[data-popout]");
        if (t) { e.preventDefault(); lastFocus = t; open(t.getAttribute("data-popout")); }
      }
    });

    // Hash → drawer OR <details> accordion (D65). Resolution order:
    //   1. a canvas cv-anchor (the cross-surface "open in canvas" target) → climb to the
    //      enclosing block cell and open ITS drawer. This must win over (2): in production
    //      each page has its OWN #popout-data, so a bet id is only a sidecar key on the
    //      dashboard and only an anchor on the canvas — no collision. The mockup shares one
    //      map across pages, so we honour the canvas anchor explicitly.
    //   2. a sidecar id → open that drawer directly (work-item / IU / bet on the dashboard).
    //   3. a <details> → open + scroll (the objective-accordion deep-link).
    var openForHash = function () {
      var h = decodeURIComponent((location.hash || "").slice(1));
      if (!h) return;
      var el = document.getElementById(h);
      if (el && el.classList && el.classList.contains("cv-anchor")) {
        var hostCv = el.closest ? el.closest("[data-popout]") : null;
        if (hostCv) { open(hostCv.getAttribute("data-popout")); return; }
      }
      if (POPOUT[h]) { open(h); return; }
      if (!el) return;
      if (el.tagName === "DETAILS") { el.open = true; el.scrollIntoView({ block: "center" }); return; }
      var host = el.closest ? el.closest("[data-popout]") : null;
      if (host) open(host.getAttribute("data-popout"));
    };
    openForHash();
    window.addEventListener("hashchange", openForHash);
  }
})();
