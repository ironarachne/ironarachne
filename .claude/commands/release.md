---
description: Cut a release by bumping the version in package.json and opening the PR.
argument-hint: '<major|minor|patch>'
---

Cut a **$ARGUMENTS** release by bumping `version` in `package.json` and opening a pull request.
Merging that PR is what creates the tag and the release; opening it does not.

If the argument is missing or is not one of `major`, `minor` or `patch`, stop and ask. Read the
current version first and state both the old and new value.

## What the bump means

`package.json` is the single source of truth for the version; the git tag records which commit became
it. `docs/versioning.md` has the full scheme. For a site rather than a library, read the levels as:

| Bump  | When                                                                     |
| ----- | ------------------------------------------------------------------------ |
| major | a change a returning visitor would notice as "the site is different now" |
| minor | a new generator, tool, or route; a visible feature on an existing one    |
| patch | fixes, content and data corrections, refactors, dependency bumps         |

If the change history since the last tag does not match the level you were asked for, say so before
proceeding — an honest objection now is cheaper than a version number that lies.

## The change

Only `package.json`'s `version` field. Nothing else belongs in this PR: a release PR that also
changes behaviour makes the tag meaningless as a marker of what shipped.

Run `npm run verify` before opening it — the gate is the definition of done here.

## What the PR description must say

- Old version → new version, and why that level.
- What has landed since the previous tag, briefly, so the release has a summary someone can read.
- That merging cuts `v<version>` and publishes a release with the build artifact and its checksum
  attached, from which staging and prod can then be promoted with `/promote`.

## One failure mode worth knowing

The release step only fires while `HEAD` is exactly at the version tag. If a build cuts the tag and
then fails before publishing the release, the next run **on that same commit** repairs it — but once
`main` moves past the tag, that version is stranded: tagged, with no artifact, and nothing will ever
give it one.

The fix is to bump again, not to delete and re-push a published tag. Two versions were lost that way
during bring-up. If you see a tag with no release, that is what happened.
