import { replaceState } from '$app/navigation';
import { page } from '$app/state';

/**
 * The half of the old `/saved-data` deep links that outlived the page (#44).
 *
 * That page put `?blazon=`, `?name=`, or `?seed=` on a generator's URL to open one of the items it
 * listed. **Nothing produces those links any more** — the page is gone, and the generators offer a
 * "load saved" dialog of their own instead. What survives is the reading of them, because people
 * bookmarked the links, and a bookmark that quietly stops loading the thing it names is worse than
 * one that fails outright: nothing tells the user it did not work.
 *
 * Three generators read their own parameter and each owns its own name for it, so what is shared is
 * only this: taking the cue back out of the address bar once it has been acted on. Without that, a
 * reload would load the same item over whatever the user has done since.
 *
 * It is the one module here that reaches SvelteKit's runtime, which is the honest cost of a helper
 * about the URL. `heraldry_saved_state.ts` and its two siblings are what the cue then reads from,
 * and those stay while the legacy scopes do.
 */
export function clearLoadParamFromUrl(paramName: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (!page.url.searchParams.has(paramName)) {
    return;
  }
  const nextUrl = new URL(page.url);
  nextUrl.searchParams.delete(paramName);
  // `nextUrl` is derived from the current `page.url`, so it already carries any base path.
  // eslint-disable-next-line svelte/no-navigation-without-resolve
  replaceState(nextUrl, page.state);
}

/** The cue a generator reads, or null when the URL carries none. */
export function readLoadCueFromUrl(paramName: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return page.url.searchParams.get(paramName);
}
