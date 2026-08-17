import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

/**
 * `/saved-data` is gone; the workshop's project view does what it did (#44).
 *
 * A redirect rather than a 404, because people have this bookmarked and the page holding their
 * saved work is the worst possible place for a dead link. It is a permanent one — the page is not
 * coming back — so a browser or a search index that remembers it can stop asking.
 *
 * The route directory stays for exactly this reason: the site prerenders a shell per route, and a
 * route that no longer exists is served by the host's 404 rather than by anything that could
 * forward the visitor on.
 */
export const load: PageLoad = () => {
  redirect(308, '/workshop/');
};
