# Cluster F — harness lifecycle (#23)

**Issue:** [#23](https://github.com/hk121992/stack-graph/issues/23) — no first-class path to update an
installed plugin. **IU:** F1 (`harness-update` skill, author + vendor). Sibling to `harness-init`.
**Decisions:** resolved in the sprint plan; general, no product literals.

## Spec touchpoints

| Spec doc | Section | Relationship |
|---|---|---|
| `04-harness-spec/README.md` | "Instantiating a harness" | **Amend** — add `harness-update` alongside `harness-init` as the harness lifecycle pair (init = stand up; update = keep current). |
| `03-plugin-spec/README.md` | install / update lifecycle | **Amend** — document the update path (`marketplace update → uninstall → install`, scope-aware) the skill encapsulates, and note the upstream `claude plugin update` "not found" bug it works around. |
| `graph/_refs/bindings-contract.md` | `status:` version + changelog | **No change to keys** — the skill *reads* the contract `status:` to detect drift; the contract itself is unchanged. |

## Design

New graph node `graph/harness-update/harness-update.md`, `primitive: skill`, vendored by
`build/vendor.ts` automatically (it discovers `graph/<id>/<id>.md`). Frontmatter mirrors
`harness-init`'s shape: identity (`id`, `primitive`, `description`, `when-to-use`), classification
(`mode: collaborative`, `determinism: generative`), `edges.references` to `bindings-contract`
(`load: import`), `goals`, `status: v0.1.0`. No `model`/`allowed-tools` (match harness-init).

**Edges.** `references → bindings-contract (import)`. A `can-follow` / sibling relationship to
`harness-init` is expressed in prose + the harness-spec amendment (no new edge type needed; if a
graph edge is warranted, `escalates`/`can-follow` from harness-update → harness-init bind is the
candidate — decided at build, kept minimal).

### Modes / flow (four steps, single skill)

1. **Detect.** Read installed version from `installed_plugins.json` (the Claude Code runtime's
   install registry — path resolved per scope, not in this repo) vs the published version: for a
   GitHub-sourced marketplace, the repo's `.claude-plugin/plugin.json` `version` + `gitCommitSha`;
   for a local/path source, the bound marketplace source's `plugin.json`. If equal → print
   **"up to date at vX.Y.Z"** and exit (idempotent no-op).

2. **Update.** Run the **scope-aware** sequence (the native `plugin update` is broken — issue
   evidence):
   ```
   claude plugin marketplace update <market>      # refresh cache to latest published
   claude plugin uninstall  <plugin> --scope <s>  # clear the version pin
   claude plugin install    <plugin>@<market> --scope <s>
   ```
   Then confirm the new `version` + `gitCommitSha` landed in the registry. Scope (`user`/`project`)
   is detected from where the plugin is currently installed, not assumed.

3. **Contract-drift check.** Compare the new `bindings-contract` `status:` version against the
   version the harness last bound against. If it **moved**, invoke `harness-init bind` + `validate`
   (reconciles new/changed binding keys — exactly the 0.4.1→0.5.0 `architecture-reviews-root` case).
   If **unchanged**, say so and skip — do not re-bind needlessly.

4. **Hand off.** Print the changelog delta since the installed version + the **restart-required**
   reminder (new skill set loads only on Claude Code restart).

**Body also notes** the upstream CLI bug (`claude plugin update <p>` → "Plugin not found" for an
installed, enabled plugin) so the operator understands *why* the dance exists and that it's a
work-around, not the intended UX.

### Hard constraints (mirror harness-init)

- General, no product literals (no be-civic paths/names).
- Harness-local + runtime-registry operations only; never mutates the vendored plugin or the factory.
- Idempotent: re-running when current is a clean no-op.
- Re-binds **only** on contract-version change, and validates after.
- Always surfaces the restart step + the version/commit it landed on.

**Acceptance:** one idempotent, scope-aware invocation takes a harness from version N to latest
without the manual dance; re-binds only on contract-version change; always surfaces restart + the
version/commit landed; the body notes the upstream `plugin update` bug.

## Risks / edge cases

- **`installed_plugins.json` location is runtime-owned**, not in this repo — the skill resolves it at
  run time per scope (the same place `harness-init validate` checks the plugin is listed/enabled).
  The skill is prose-instruction to a Claude session, so it can shell out to `claude plugin …` and
  read the registry; it does not hardcode a path.
- **Published-version source varies by marketplace type** (GitHub repo `plugin.json` vs local path).
  The Detect step branches on the bound source kind; both resolve to a `version`+`gitCommitSha`.
- **Vendoring** is automatic once `graph/harness-update/harness-update.md` exists and is added to
  `graph/graph-record.json` (Stage-4 parity asserts both agree). Done in Z1's run.
