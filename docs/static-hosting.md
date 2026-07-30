# Static hosting

This document records what the build must look like to be servable from static object storage, and
why the app is configured the way it is. It exists because the constraint is invisible from any
single file: it lives in the interaction between `svelte.config.js`, the root layout's page options,
and the host's URL-resolution rules.

**Status:** implemented. Resolves issue #59. The bucket-side configuration it describes is
provisioned by issue #56.

## The constraint

Static object-storage hosting has exactly two resolution rules:

1. Serve the object whose key matches the request path exactly.
2. When the path ends in `/`, serve `<prefix>/index.html` — the **index document**.

Anything else returns the **error document**. There is no extension guessing, so a request for
`/heraldry` does **not** find an object named `heraldry.html`. There is no rewrite layer either,
unless one is deliberately added at the CDN.

This bit us: the build used to emit routes as flat sibling files (`heraldry.html`, `culture.html`,
43 of them), which are unreachable at the URLs the app itself links to. Every route except `/`
returned the error page on a cold load. Client-side navigation worked, which is what kept it hidden.

## What the app does about it

**`trailingSlash = 'always'`** in `src/routes/+layout.ts`. The prerenderer then writes
`heraldry/index.html` instead of `heraldry.html`, which rule 2 resolves natively. Nested routes are
emitted at their real depth (`fantasy/dcc/character/index.html`), and SvelteKit rewrites each page's
asset references to match that depth (`../../../_app/…`), so pages stay correct wherever they sit.

**`fallback: '404.html'`** in `svelte.config.js`. This writes the app shell to `build/404.html` for
the host to use as its error document, so an unknown URL renders the site's own `+error.svelte`
rather than the host's default page. SvelteKit gives the fallback **absolute** asset paths
(`/_app/…`) precisely because it may be served for a URL at any depth, where relative paths would
resolve against the wrong prefix.

Note that `ssr = false` is set at the root layout, so prerendered pages are contentless app shells
that render on the client. Prerendering here buys per-route asset preload hints and correct HTTP
status codes, not server-rendered HTML — worth knowing before weighing any future change to this
setup, because the usual SEO argument for prerendering does not apply as written.

## Bucket configuration this implies

| Setting        | Value        |
| -------------- | ------------ |
| Index document | `index.html` |
| Error document | `404.html`   |

Both must sit at the **root** of the bucket, not in a subdirectory — a Scaleway requirement. Both
are produced by `npm run build` at `build/index.html` and `build/404.html`.

A request for `/heraldry` without the trailing slash is not covered by either rule, so it depends on
the host. **Scaleway redirects**, verified against a real published site: `/heraldry` returns `302`
with `Location: /heraldry/`, and the slashed URL then serves the page. No fallback is needed in
practice.

Should that ever change, or another host not do it, the failure is soft rather than total: the error
document is served, the client-side router boots, normalises the URL to `/heraldry/` and renders the
page — the content still arrives, with a 404 status. Internal links are unaffected either way,
because the client router normalises them on navigation.

## How this is enforced

`e2e/static_hosting.spec.ts` serves `build/` through `e2e/static_host.ts`, a host implementing only
the two rules above, and asserts that every route in the page manifest resolves to its own
prerendered file, that an unknown route yields the error document with a 404, and that no flat
`<route>.html` files remain.

The important detail is that these tests **bypass the preview server**. `vite preview` guesses
extensions and redirects missing slashes, so a suite that only exercises the preview server passes
happily while every deep link 404s in production. That is exactly how #59 went unnoticed.
