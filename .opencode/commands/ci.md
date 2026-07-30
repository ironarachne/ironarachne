---
description: Watch a pull request's CI checks, and pull the job log when something fails. Usage: /ci [PR number — defaults to the PR for the current branch]
---

Report the state of CI for PR **$ARGUMENTS** (if that is empty, find the open PR whose head is the
current branch with `mcp__worktree__list_repo_pull_requests`). Owner `ironarachne`, repo
`ironarachne`.

Wait until every check has finished, then say what passed, what failed, and — if anything failed —
what the log says went wrong. Do not stop at "the check is red".

## How to read status on this host

Worktree.ca is a hard fork of Gitea and **does not implement the Actions REST API**. Every
`/api/v1/repos/{owner}/{repo}/actions/*` route returns a 404, so `list_workflow_runs`,
`get_workflow_run` and `dispatch_workflow` are all unusable. Do not waste turns on them.

What does work:

**Check status** — the commit statuses API, which is not part of the Actions API:

```bash
curl -s "https://worktree.ca/api/v1/repos/ironarachne/ironarachne/commits/<sha>/statuses"
```

Two traps here, both of which have caused wrong reports before:

- It returns **every status ever posted** for that commit, so group by `context` and take the newest
  by `created_at`. Do not trust ordering.
- **A skipped job is reported as `success`.** A job whose `needs:` dependency failed looks green.
  Compare timestamps: a "success" a second after an upstream failure never ran. Say so if you see it.

**Run numbers** — scrape the run list, since there is no API:

```bash
curl -s "https://worktree.ca/ironarachne/ironarachne/actions"
```

**Job logs** — plain text, no auth, and the only real way to diagnose a failure:

```bash
curl -s "https://worktree.ca/ironarachne/ironarachne/actions/runs/<run>/jobs/<n>/logs"
```

`<n>` is the zero-based job index. A job that never started returns `job is not started`, which is
itself how you tell a skipped job from one that ran and failed. The run _detail_ page renders
client-side, so its HTML is useless — go straight to the log.

Use `curl` rather than WebFetch throughout: WebFetch caches for 15 minutes, which is longer than a
check takes to change state.

## While waiting

Poll in the background rather than blocking, and do not poll faster than every 20 seconds. `verify`
takes about 1m15s and `e2e` about 4m45s, so a full round is roughly five minutes.

## What to report

- Each check by name, with its result and duration.
- For a failure: the actual error from the log, quoted, plus which step it died in.
- If the failure looks like a known platform limitation rather than a code problem, say which one —
  `docs/deployment.md` under "Actions on this host" lists the ones already discovered, and repeating
  that diagnosis from scratch is wasted work.
