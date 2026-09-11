---
name: triage
description: Verify and triage an Iron Arachne GitHub issue, post findings, and advance its workflow label. Use when the user asks to triage an issue or invokes $triage.
---

# Triage

Read the requested issue and comments with `gh issue view <number> --comments`. Triage is not implementation: produce a comment and a label change, but do not build the feature.

Verify the issue's claims against the repository. Verify external claims against primary upstream documentation, preferring experiments over arguments when a build, request, or query can settle the point. Say plainly what remains unverified. Migrated Worktree.ca links are read-only history; bare `#NN` references are live GitHub issues.

The comment should contain evidence-backed findings that change the shape of the work, decisions needed with a recommendation for each, a proposed breakdown when warranted, and anything still unverified. Put the body in a temporary file and post it with `gh issue comment <number> --body-file <file>` so shell metacharacters survive.

If triage uncovers a separate problem, create and link a separate issue rather than widening this one.

Move the issue from `needs-triage` to `needs-design` when material decisions remain, or to `ready-for-agent` when the path is unambiguous. Use label names with `gh issue edit`.

Apply the design threshold in `AGENTS.md`: a new library or concept, a change spanning multiple libraries, or a persisted/inter-library data-shape change needs a design document and approved domain model before implementation. Bug fixes, data-table entries, and single-component changes do not.
