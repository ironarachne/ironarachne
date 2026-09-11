---
name: ci
description: Watch and diagnose GitHub pull-request checks for Iron Arachne. Use when the user asks about CI, checks, a failing workflow, or invokes $ci.
---

# CI

Report the state of CI for the requested pull request. If no PR is given, use `gh pr status` to find the PR for the current branch. The repository is `ironarachne/ironarachne`.

Wait for every check with `gh pr checks <pr> --watch --fail-fast`, then run `gh pr checks <pr>` for the final table. Do not build a polling loop. A skipped job is not a passing job; report which checks actually ran.

When a check fails, inspect its log rather than inferring the cause from its name:

```bash
gh run list --branch <branch> --limit 5
gh run view <run-id> --log-failed
gh run view <run-id> --job <job-id> --log
```

`verify` is the only required check. It covers types, lint, unit tests, and per-library coverage. `e2e` runs after merges to `main`, not on pull requests, and does not gate a PR.

Report each check by name with result and duration. For failures, include the failed step and actual error. Identify checks that were skipped instead of calling them passed.
