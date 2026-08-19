---
description: Watch a pull request's CI checks, and pull the job log when something fails.
argument-hint: '[PR number — defaults to the PR for the current branch]'
---

Report the state of CI for PR **$ARGUMENTS** (if that is empty, `gh pr status` finds the PR whose
head is the current branch). Repo `ironarachne/ironarachne`.

Wait until every check has finished, then say what passed, what failed, and — if anything failed —
what the log says went wrong. Do not stop at "the check is red".

## Reading status

GitHub implements the Actions REST API and `gh` speaks it directly, so there is nothing to scrape:

```bash
gh pr checks <pr> --watch --fail-fast   # blocks until every check settles
gh pr checks <pr>                       # one-shot table: name, state, duration, link
```

`--watch` is the whole "while waiting" story — it streams state changes and exits non-zero if
anything failed. Do not build a polling loop around it, and do not use WebFetch, which caches for
15 minutes and will happily report a state that has already changed.

One trap worth keeping from the old forge, because it still produces wrong reports: **a skipped job
is not a passing job.** A job whose `needs:` dependency failed never ran; `gh pr checks` shows it as
`skipping`, and calling that "passed" hides the real failure. Say which checks actually executed.

## Diagnosing a failure

Go to the failing step's log — never infer the cause from the check name:

```bash
gh run list --branch <branch> --limit 5   # find the run id
gh run view <run-id> --log-failed         # just the failed steps
gh run view <run-id> --job <job-id> --log  # one job in full
```

Each row from `gh pr checks` carries a URL ending in `/job/<job-id>`; that id is what `--job` takes.

## What runs

`verify` is the only required check and the only one gating the merge — types, lint, unit tests,
coverage, about 1m15s. `e2e` runs on merges to `main` only and never on a pull request, so a red
`e2e` is a signal to investigate rather than a blocked merge; `.github/workflows/e2e.yaml` carries
the reasoning.

## What to report

- Each check by name, with its result and duration.
- For a failure: the actual error from the log, quoted, plus which step it died in.
- Which checks were skipped rather than passed, if any.
