# Release notes

This library holds the site's **user-facing release notes** — the dated entries shown to visitors
about what changed on Iron Arachne — as data rather than markup, so the home page and the release
notes page render the same source.

It is not the git history and not a `CHANGELOG.md`: entries are written for players and GMs, in
their words, and only cover things a visitor would notice.

## Features

- **`ReleaseNote`** — a `date`, a `summary`, an optional `version`, and up to four categories of
  update line: `features`, `improvements`, `fixes`, and `housekeeping`. The categories are optional
  rather than required-and-empty, because most entries fill one or two of them and this file is
  edited by hand.
- **`releaseNoteEntries`** — every entry, newest first.
- **`mostRecent`** — the first _n_ entries, for a "what's new" block that shows only a few. It
  slices rather than sorts, so it relies on `entries.ts` staying in newest-first order.
- **`sections`** — a note's non-empty categories in display order, each with its visitor-facing
  heading. Section order and labels live here rather than in a component so they are one testable
  fact.
- **`updateCount`** — how many lines a note holds across all four categories.

## Usage

```typescript
import { releaseNoteEntries, mostRecent, sections, type ReleaseNote } from '$lib/release_notes';

const latest: ReleaseNote[] = mostRecent(3, releaseNoteEntries);

for (const section of sections(latest[0])) {
  console.log(section.label, section.items.length);
}
```

## Writing an entry

Prepend it to `entries.ts`. Every entry needs a `date` and a `summary`; put each line in the
category that describes it honestly:

| Category       | What belongs in it                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `features`     | something you can now do that you could not before — a new generator, page, download, or control |
| `improvements` | the same thing, better — more variety, more detail, a redesign, more speed                       |
| `fixes`        | something that was broken and now is not                                                         |
| `housekeeping` | work a visitor would genuinely never notice — refactors, dependencies, tests                     |

`housekeeping` is the one to be careful with: it tells the reader "nothing you'll notice", so
putting a visible change there is a lie to them. When in doubt it is an improvement, not
housekeeping.

## Versions

`version` is optional and is **not** backfilled. The site predates `docs/versioning.md` by five
years, so only releases cut since then have a number; inventing one for the other entries would
fabricate a history that never happened.

Leave `version` off when you write an entry. `/release` stamps it onto the topmost unversioned entry
in the same pull request that bumps `package.json`, because that is the moment the number becomes a
fact rather than a guess. See `docs/versioning.md`.
