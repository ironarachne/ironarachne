import type { NavDestination } from './nav_types';

/**
 * Every destination the site navigates to, in sidebar order. The single source of truth for the
 * shell's navigation, the way `TOOL_CATALOG` is for tools.
 *
 * Six, and six is a cap rather than a coincidence — see
 * [decision 5](../../../docs/app-shell.md#decisions-taken-here). A seventh entry is a sign that
 * something belongs *inside* one of these, not beside it.
 *
 * The sixth was taken deliberately, and it is the one exception the cap has: the catalog is not
 * a tool, and no individual tool appears here. What put it here is that nothing else linked to a
 * tool at all. The workshop's `ToolBrowser` renders buttons that mount a panel, and the home page
 * links only the handful of featured entries, so thirty-two of the thirty-four tools had no
 * anchor pointing at them anywhere on the site — not for a crawler, not for a bookmark, not for a
 * middle click. See [decision 1](../../../docs/app-shell.md#decisions-taken-here), which deleted
 * the five domain index pages on the understanding that the browser listed those links better.
 * It lists them differently; it does not list links.
 *
 * All Tools sits beside the workshop rather than at the top, because the two are both ways into a
 * tool and the bench keeps the position a returning user reaches for.
 */
export const NAV_DESTINATIONS: NavDestination[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'workshop', label: 'Workshop', path: '/workshop' },
  { id: 'tools', label: 'All Tools', path: '/tools' },
  { id: 'projects', label: 'Projects', path: '/projects' },
  { id: 'vault', label: 'Result Vault', path: '/vault' },
  { id: 'release-notes', label: 'Release Notes', path: '/release-notes' },
];

/**
 * Trims a pathname to the form the destinations are written in: no base path, no trailing slash.
 *
 * Both halves matter. `trailingSlash: 'always'` means the router reports `/workshop/` while the
 * catalog says `/workshop`, and the site is served under a base path in some deployments, so a
 * naive equality check marks nothing active in either case.
 */
function normalise(pathname: string, base = ''): string {
  const withoutBase =
    base !== '' && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const trimmed = withoutBase.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/**
 * Which destination a pathname is inside, or `undefined` on a page that is under none of them —
 * a tool route, which keeps its URL but is not a navigational destination
 * ([decision 1](../../../docs/app-shell.md#decisions-taken-here)).
 *
 * Longest match wins, so a future `/vault/something` resolves to the vault rather than to Home.
 * Home is only ever an exact match: every path is prefixed by `/`, so treating it as a prefix
 * would light it up everywhere.
 */
export function activeDestination(
  pathname: string,
  base = '',
  destinations: NavDestination[] = NAV_DESTINATIONS,
): NavDestination | undefined {
  const path = normalise(pathname, base);

  const matches = destinations.filter((destination) =>
    destination.path === '/'
      ? path === '/'
      : path === destination.path || path.startsWith(`${destination.path}/`),
  );

  return matches.sort((a, b) => b.path.length - a.path.length)[0];
}
