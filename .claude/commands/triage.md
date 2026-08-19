---
description: Triage an issue — verify its claims, record findings and decisions, move the label along.
argument-hint: '<issue number>'
---

Triage issue **#$ARGUMENTS** in `ironarachne/ironarachne`. Read it, and its comments, with
`gh issue view $ARGUMENTS --comments`.

**Triage is not implementation.** Produce a comment and a label change. Do not write the feature.

## Verify, do not assume

The point of triage is to find out what is actually true before anyone commits to a plan. An issue's
premises are a starting point, not facts.

- **Check claims against this repository.** If the issue says a thing exists, or is broken, or is
  shaped a certain way, go and look.
- **Check external claims against upstream documentation**, and prefer sources that are not rendered
  client-side. Terraform Registry and most docs sites return an empty shell to `curl`; raw markdown
  on GitHub (`raw.githubusercontent.com/<owner>/<repo>/<branch>/docs/...`) does not. For a provider
  or action, reading its source or `action.yml` beats reading a blog post.
- **Prefer an experiment to an argument.** If a claim can be settled by running something — a build,
  a request, a query against a real API — settle it that way and quote the output.

Anything you could not verify, say so plainly rather than presenting it as established.

Issues migrated from Worktree.ca carry a footer linking the original, and their bodies may reference
issues that were never migrated — those render as `[worktree#NN](…)` and are read-only history. A
bare `#NN` is a live GitHub issue.

## What the comment should contain

- **Findings** that change the shape of the work, each with the evidence behind it. A finding nobody
  can act on is noise; a finding that saves someone a wrong turn is the whole point.
- **Decisions needed**, where two readings would lead to materially different work. Give a
  recommendation for each — an unweighted list of options makes the reader do your job.
- **A proposed breakdown** into work items, if the issue is large enough to need one.
- **What is still unverified**, explicitly.

Post it with `gh issue comment $ARGUMENTS --body-file <file>` — write the body to a file rather than
inlining it, so backticks and `$` survive the shell intact.

If triage reveals a separate problem, file it as its own issue (`gh issue create`) and link it rather
than widening this one.

## Labels

The workflow is `needs-triage` → `needs-design` → `ready-for-agent`. Move it to `needs-design` if
real decisions are still open, or straight to `ready-for-agent` if the path is now unambiguous. Then
remove the label it came from:

```bash
gh issue edit $ARGUMENTS --add-label needs-design --remove-label needs-triage
```

`gh` takes label **names**, not numeric IDs. `gh label list` shows what exists.

## Design process

Per CLAUDE.md, anything that introduces a library or a new concept, spans more than one library, or
changes persisted data needs a design document and an approved domain model **before**
implementation. If this issue meets that bar, say so in the comment and leave it at `needs-design`.
If it does not — a bug fix, a data-table entry, a single-component change — say that too, so nobody
invents ceremony that is not required.
