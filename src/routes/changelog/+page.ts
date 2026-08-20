import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

/**
 * `/changelog` is now `/release-notes` (#29) — the same page under the name it should always have
 * had.
 *
 * A redirect rather than a 404, because five years of entries have been linked to under this path.
 * It is permanent — the old name is not coming back — so a browser or a search index that remembers
 * it can stop asking.
 *
 * The route directory stays for exactly this reason: the site prerenders a shell per route, and a
 * route that no longer exists is served by the host's 404 rather than by anything that could
 * forward the visitor on.
 */
export const load: PageLoad = () => {
  redirect(308, '/release-notes/');
};
