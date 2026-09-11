---
name: release
description: Cut an Iron Arachne release by opening the version-bump PR. Use when the user asks for a major, minor, or patch release or invokes $release.
---

# Release

Require exactly one bump level: `major`, `minor`, or `patch`. Read and state the current and next versions. If the change history does not match the requested level, raise that before proceeding:

- major: a returning visitor would say the site is different now
- minor: a new generator, tool, route, or visible feature
- patch: fixes, content corrections, refactors, or dependency bumps

Change only:

1. The `version` field in `package.json`.
2. The `version` field on the topmost unversioned entry in `src/lib/release_notes/entries.ts`.

If the topmost release-note entry is already versioned, stop and ask rather than inventing a note. Run `npm run verify`, branch from `main`, commit, push, and open the PR. Explain the old and new versions, why the level fits, what landed since the previous tag, and that merging creates `v<version>` plus the release artifact and checksum.

If a tag exists without a release because publishing failed and `main` has moved beyond it, bump again. Never delete and re-push the published tag.
