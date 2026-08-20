import type { RouteId } from '$app/types';

/**
 * One entry in the sidebar — the whole of the site's navigation, per docs/app-shell.md.
 *
 * There is no icon here. The approved model carried an `iconName`, on the assumption that the
 * 768–1199px band would show an icon rail; the brand repo has no icon set, and inventing one in
 * the app would put five hand-drawn marks beside a wordmark that is carefully drawn. The rail is
 * a narrower sidebar with the same labels at a smaller size instead, which needs no assets and is
 * legible to a screen reader without a `title` doing the work of a label. See
 * [decision 6](../../../docs/app-shell.md#decisions-taken-here).
 */
export type NavDestination = {
  /** Stable identity, used as a key and in tests. Not shown to the user. */
  id: string;
  /** What the sidebar says. */
  label: string;
  path: RouteId;
};
