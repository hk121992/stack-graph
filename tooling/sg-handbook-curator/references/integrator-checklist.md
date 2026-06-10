# Integrator checklist

The merge-walk discipline for `integrate` mode. The dispatcher follows this once the triage
view is on the table and the operator has resolved every contested item in chat.

## Ordering

1. Default order: **oldest-first within each topical cluster** (PRs touching the same pages
   or the same concept form a cluster; the consistency-checker's collision findings define
   them). The operator may override per cluster.
2. A `file_collision` or `stale_against_batch` finding fixes the order *within* its cluster:
   the PR the recommendation names first merges first; the later PR is re-checked against
   post-merge `main` before its own merge (re-run `gh pr view --json mergeable` — it may have
   become `CONFLICTING`).
3. A `frontmatter_collision` means at most one structural PR merges this session; the rest
   are deferred to the next integrate.

## Per-merge steps

For each PR, in the confirmed order:

1. **Held?** If a finding's recommendation said "amend PR #N before merge" and the operator
   agreed, this PR is *not* merged this walk — skip the remaining steps, defer it with the
   amendment as the recorded reason.
2. **Resolutions recorded?** Every operator resolution that touched this PR — a
   `decision_items` answer, a vocab-collision pick, a merge-order or override call — must be
   posted to the PR before merging:
   `gh pr comment <n> --repo hk121992/stack-graph --body "Integrate <date>: <resolution>"`.
   PRs and git history are the durable record — a decision that lives only in chat is lost.
3. **Base-drift gate.** `--match-head-commit` pins the PR head, not the base: if
   `origin/main` advanced past the recorded preview base for any reason *other than this
   walk's own merges*, the batch would land on a page set the preview never checked.
   `git fetch origin` first — a full fetch, so `refs/remotes/origin/main` itself updates
   (a bare `git fetch origin main` may only set `FETCH_HEAD`, leaving the compared ref
   stale). Then verify the commits on `origin/main` since the preview base are exactly this
   session's merges; anything else → stop the walk, rebuild the preview from the new base,
   re-validate.
4. **Mergeable gate.** `gh pr view <n> --repo hk121992/stack-graph --json mergeable,mergeStateStatus`.
   `UNKNOWN` is transient — GitHub recomputes mergeability after every merge to `main` —
   so re-query a few times (a few seconds apart) before judging. If the state is
   `CONFLICTING`, check whether the conflict is **only `handbook/content/index.json`**
   (`gh pr diff` vs `main` makes it obvious) — the earlier merge in this walk regenerated the
   index, which is expected, not a real conflict. Resolve it on the PR branch: merge
   `origin/main` into the PR head taking `main`'s index, run `refresh-index` there, push the
   branch, and re-pin the merge to the new head SHA (no re-validation needed — only the
   generated file changed). Any other terminal non-`MERGEABLE`
   state → skip and record as deferred with the state value. Gate on `mergeStateStatus`
   too: a PR can be `MERGEABLE` yet `BLOCKED` / `UNSTABLE` / `DRAFT` (required checks,
   reviews, draft state) — anything other than `CLEAN` (or `UNSTABLE` the operator
   explicitly waves through) is also a skip-and-defer, so the walk never dies mid-merge. A mid-walk skip changes the
   merge set the batch was validated against, exactly like a triage-time hold: if any
   remaining PR's findings or links could depend on the skipped one, go back through the
   SKILL.md re-validation step (rebuild preview, re-dispatch) before continuing the walk.
   Tell the operator: resolve conflicts on the PR branch, then re-run integrate.
5. **Merge — pinned to the validated head.**

   ```bash
   gh pr merge <n> --repo hk121992/stack-graph --squash --delete-branch \
     --match-head-commit <sha>
   ```

   `<sha>` is the head commit the preview was built from (the `integrate/pr-<n>` ref —
   record each SHA at preview time). If the PR moved since validation, the merge fails
   cleanly: re-validate that PR (or rebuild the preview) rather than merging unvalidated
   content. Squash is the default (one canon change per PR → one commit on `main`); the
   operator may ask for `--merge` on a PR whose individual commits matter.

## After the walk

All of this runs in the **primary stack-graph checkout** — the preview-building step left the
shell in the scratch worktree, so `cd` back first.

1. `cd <stack-graph checkout> && git checkout main && git pull`. Then confirm local `main`
   is exactly `origin/main` (`git rev-list origin/main..main` must be empty) — if it is
   ahead, stop before step 3: the sanctioned direct push covers the generated index only,
   and pushing would smuggle the unpushed commits past the PR-only constraint.
2. Run `refresh-index` (the mode, or `scripts/refresh-index.ts` directly). Each `raise` PR
   refreshed the index against *pre-merge* `main`, so a batch can leave it stale even when
   every PR was individually clean.
3. If the index changed, commit it straight to `main` and **push**:
   `git add handbook/content/index.json && git commit -m "chore(handbook): refresh index post-integrate" && git push origin main`.
   This is the one sanctioned direct push — `index.json` is a generated artifact, not
   authored canon (see the SKILL.md hard constraints). An unpushed index commit defeats the
   point: future runs read `origin/main`.
4. Remove the merged-preview worktree and **all** preview branches — `integrate/preview` and
   every per-PR `integrate/pr-<n>` ref (a stale `pr-<n>` ref makes the next run's fetch of an
   amended PR fail non-fast-forward):
   ```bash
   git worktree remove /tmp/sg-integrate-preview --force
   git branch --list 'integrate/preview' 'integrate/pr-*' | xargs -r git branch -D
   ```

## Report shape

End the session with, in this order:

- **Merged** — count + PR URLs, in merge order.
- **Deferred** — each with its reason (`CONFLICTING`, frontmatter-collision held, amendment
  requested, operator choice).
- **Decisions recorded** — PR + one-line resolution, for each comment posted in per-merge
  step 2.
- **Index** — refreshed / unchanged.
- **Next steps** — anything the operator flagged for follow-up, including consistency or
  link findings that survived the session unresolved.

An empty queue is a valid outcome: report "queue empty — nothing to integrate" and stop.
