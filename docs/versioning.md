# Versioning

**Status:** implemented. Introduced alongside CD; see `docs/deployment.md`.

The repository had no tags before this, so the scheme below is a decision rather than a description
of existing practice.

## The rule

`package.json`'s `version` field is the **single source of truth**. Git tags record when each value
was released, and build artifacts take their names from those tags.

```
package.json version  →  git tag v<version>  →  artifact ironarachne-<version>.tar.gz
```

Versions are [SemVer](https://semver.org/). Given a site rather than a library, read them as:

| Bump  | When                                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| major | a change a returning visitor would notice as "the site is different now" — a navigation overhaul, a saved-data format that old links cannot read |
| minor | a new generator, tool, or route; a visible feature on an existing one                                                                            |
| patch | fixes, content and data corrections, refactors, dependency bumps                                                                                 |

## How a release happens

There is no separate release ceremony. **Bump `version` in `package.json` as part of the pull
request that earns the bump.** When that merges to `main`, CI notices the version has no tag, creates
`v<version>` on the merge commit, and publishes a release with the build artifact attached.

Merges that do not touch `version` produce no tag and no release. They still build, and they still
deploy to dev.

## What the version string looks like

`scripts/site_version.sh` derives it with `git describe --tags --match 'v*'`, so it is the tag plus a
description of how far past it the commit is:

| Value              | Meaning                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `2.3.0`            | exactly the `v2.3.0` tag — a released version                                                                  |
| `2.3.0-4-gabc1234` | four commits past `v2.3.0`, at `abc1234` — unreleased work                                                     |
| `2.3.0-0-gabc1234` | fallback when no tag is reachable at all (a repository that has never been tagged, or a checkout without tags) |

The leading `v` is stripped for filenames. The dashed suffix is deliberately not SemVer-prerelease
syntax, because `2.3.0-4-g…` sorts _below_ `2.3.0` under SemVer rules — which is correct here, since
those commits are work built on top of a release rather than a candidate for one.

## Why the tag and not just package.json

Both are needed, and they answer different questions. `package.json` says what version the working
tree intends to be; the tag says which commit actually became it. Deriving artifact names from the
tag means an artifact can always be traced to one commit, and two builds of the same released version
cannot silently produce the same filename from different code — the commits past the tag show up in
the name.

This is also why `scripts/site_version.sh` needs full history and tags. CI checks out with
`fetch-depth: 0` for exactly that reason; a shallow clone would find no tag and quietly fall back to
the least useful form.

## Consequences worth knowing

**Staging and prod deploy released versions only.** They take their artifact from a release, so a
version must have been cut before it can be promoted. That is deliberate — promotion should move a
known version between environments, not an arbitrary commit — but it does mean testing something on
staging requires bumping the version first. Dev has no such constraint; it tracks `main`.

**A version is cut on merge, not on demand.** If you need a release, bump `package.json`. If you
merge something and later wish it had been a release, bump the version in a follow-up commit; do not
move the tag.
