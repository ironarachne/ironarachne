# Change log

This library holds the site's **user-facing change log** — the dated entries shown to visitors about
what changed on Iron Arachne — as data rather than markup, so the home page and the change log page
render the same source.

It is not the git history and not a release changelog: entries are written for players and GMs, in
their words, and only cover things a visitor would notice.

## Features

- **`ChangeLog`** — a `date`, a one-line `summary`, and the list of `updates` it covers.
- **`changeLogEntries`** — every entry, newest first.
- **`mostRecent`** — the first _n_ entries, for a "what's new" block that shows only a few. It slices
  rather than sorts, so it relies on `entries.ts` staying in newest-first order.

## Usage

```typescript
import { changeLogEntries, mostRecent, type ChangeLog } from '$lib/change_log';

const latest: ChangeLog[] = mostRecent(3, changeLogEntries);
```

Add a new release note by prepending an entry to `entries.ts`.
