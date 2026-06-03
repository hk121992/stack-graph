# stack-graph

> The **factory**. A general, process-agnostic system for modelling an agent operating
> environment as a graph of its primitives — skills, agents, references, scripts,
> settings, hooks — and the workflows that traverse them, then instrumenting and
> improving them through a PR-gated loop.

`stack-graph` is the factory; a product (e.g. Be Civic) is what **runs inside it**.
"One project builds the factory, the other runs it."

- **Process-agnostic.** Software development is the first process domain; the system is
  designed not to bake in dev assumptions.
- **Claude-primitive-native.** Canonical artefacts are real `.claude`-compatible files
  Claude Code can load and call. The *graph* is the lens we author, review and reason
  with — not a store that replaces the directory.
- **Distributed as a Claude Code plugin**, vendored into a consuming workspace.

## Status

**Scaffold — pre-specification.** This repo currently holds the handbook skeleton (in
Be Civic handbook format) with the design questions parked where they'll be answered.
The specifications are authored next. Nothing is built yet.

## Layout

- `handbook/` — the specification and the authoring/review reference for the graph. Start
  at [`handbook/content/index.json`](handbook/content/index.json).
- `graph/` — the authored nodes + shared references (`graph/_refs/`); the build's input.
- `build/vendor.ts` — projects the graph into the installable plugin (`bun run vendor`).
- `stack-graph-plugin/` — **git submodule**: the clean, vendored-only plugin repo
  ([hk121992/stack-graph-plugin](https://github.com/hk121992/stack-graph-plugin)). The
  build writes its `skills/`, `agents/`, `references/`, and `.claude-plugin/` here; it is
  never hand-edited. Clone the factory with `git clone --recurse-submodules`.
- `tooling/` — dev-time maintenance skills (graph-maintainer, handbook-curator, advisory
  council); installed by symlink, not shipped in the plugin.
- `workspace/` — the operator portal (handbook / graph / dashboard / analytics surfaces).

## Licence

MIT. Open-source-*able*; dogfooded internally first.
