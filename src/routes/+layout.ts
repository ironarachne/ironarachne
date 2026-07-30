import type { LayoutLoad } from './$types';

export const prerender = true;
export const ssr = false;

/**
 * Emits every route as `<route>/index.html` rather than a flat `<route>.html`.
 * Static object-storage hosting resolves a request for `/heraldry` against the
 * key `heraldry` and then `heraldry/index.html`; only the directory form is
 * reachable without host-level rewrite rules. See docs/static-hosting.md.
 */
export const trailingSlash = 'always';

export const load: LayoutLoad = async () => {
  return {};
};
