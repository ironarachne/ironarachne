import { findToolByPath, toolGenres, type Genre } from '$lib/tools';

/**
 * Which genre the page is currently wearing, if any.
 *
 * A skin dresses the user's work, never the app's own voice — so this answers for the page region
 * and for nothing else. The top bar, the sidebar and a dialog never ask: they are siblings of the
 * page region (or, for a dialog, in the top layer entirely), so they are neutral by position
 * rather than by opting out of anything. See docs/visual-design.md, "Applying a skin".
 *
 * It holds no state, and that is deliberate rather than incidental. Decision 7 in
 * docs/workshop.md promises that changing a project's genre invalidates nothing — no artifact
 * records the genre it was saved under, no payload changes shape. A skin that were stored, cached
 * or written into an artifact would turn that promise into a lie in the one place nobody would
 * look for it. Derived on every read, there is nothing to invalidate.
 */
export function resolveGenreSkin(
  projectGenre: Genre | undefined,
  routeId: string | null | undefined,
): Genre | undefined {
  // The project wins. It is the user's own answer to what they are working on, and it is the more
  // specific of the two: a fantasy tool opened inside a science-fiction project is being used
  // *for* that science-fiction project. The route's genre is a statement about the page; the
  // project's is a statement about the work, and the work is what a skin dresses.
  if (projectGenre !== undefined) {
    return projectGenre;
  }
  return routeGenre(routeId);
}

/**
 * The genre a route declares for itself, from the tool catalog.
 *
 * The catalog is the only place a tool's genre is written down. Before #118 it was written twice —
 * once here and once as a free-string `theme` prop on `GeneratorPage` — and the two disagreed in
 * four places, including a tool the catalog calls `fantasy` that rendered unskinned because its
 * prop said `"default"`, a class no stylesheet defines.
 *
 * `routeId` rather than a pathname: a catalog `path` *is* a route id, so the two compare exactly
 * and neither has to know whether the app is served under a base path.
 */
function routeGenre(routeId: string | null | undefined): Genre | undefined {
  if (routeId === null || routeId === undefined) {
    return undefined;
  }

  const tool = findToolByPath(routeId);
  if (tool === undefined) {
    return undefined;
  }

  // A tool with more than one genre gets no skin from its route. `/spooky-ship` is `scifi` and
  // `horror`, and taking the first entry is a coin toss dressed as a rule — ambiguity is not a
  // look. Only reachable with no project genre, since a project outranks the route.
  const genres = toolGenres(tool);
  return genres.length === 1 ? genres[0] : undefined;
}
