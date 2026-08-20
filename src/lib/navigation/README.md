# navigation

The application shell's two pieces of data: where the site can be navigated to, and what the top
bar reports. See `docs/app-shell.md` for the design this implements.

## What is here

- **`NAV_DESTINATIONS`** — the five sidebar destinations, in order. The single source of truth for
  the site's navigation, the way `TOOL_CATALOG` is for tools. Five is a cap, not a coincidence:
  a sixth entry is a sign that something belongs inside one of these rather than beside it.
- **`activeDestination(pathname)`** — which destination a pathname is inside, or `undefined` on a
  page that is under none of them. Tool routes are the `undefined` case: they keep their URLs but
  are not navigational destinations.
- **`readShellStatus(now)`** — the tool count, the artifact count across every project, the active
  project's id and name, and the date.

## Why the status reader owns no storage

`readShellStatus` reads `$lib/tools`, `$lib/artifacts`, and `$lib/projects` and holds nothing of
its own. That is deliberate: the top bar is a view of state three other libraries already own, and
a status object that cached any of it would be a fourth place for the artifact count to be wrong.

It is synchronous for the same reason `listArtifacts` is. A caller that has not awaited
`hydrateArtifacts` sees zero — the answer a browser with no storage would give — because a status
bar that blocks a render is worse than one that is briefly empty.

`now` is a parameter rather than a `new Date()` inside the function. The date is the one value in
the status that changes on its own, and a caller that cannot pin it is a test that cannot assert
on it.

## Why there are no icons

The approved domain model carried an `iconName` on each destination, for an icon rail between 768
and 1199px. The brand repo has no icon set (`docs/brand-assets.md` covers what it does have), and
five marks drawn in the app to sit beside a carefully drawn wordmark is the kind of thing that
looks improvised forever. The rail is a narrower sidebar with the same labels at a smaller size,
which needs no assets and does not ask a screen reader to read a `title` attribute as a label.
