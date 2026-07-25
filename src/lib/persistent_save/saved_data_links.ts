import type { CultureSnapshot } from '$lib/culture/culture_snapshot';
import type { HeraldrySnapshot } from '$lib/heraldry/heraldry_snapshot';
import type { ReligionSnapshot } from '$lib/religion/religion_snapshot';
import { replaceState } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';

export const HERALDRY_LOAD_PARAM = 'blazon' as const;
export const CULTURE_LOAD_PARAM = 'name' as const;
export const RELIGION_LOAD_PARAM = 'seed' as const;

export function heraldryGeneratorHref(snapshot: HeraldrySnapshot): string {
  return `${resolve('/heraldry')}?${HERALDRY_LOAD_PARAM}=${encodeURIComponent(snapshot.blazon)}`;
}

export function cultureGeneratorHref(snapshot: CultureSnapshot): string {
  return `${resolve('/culture')}?${CULTURE_LOAD_PARAM}=${encodeURIComponent(snapshot.name)}`;
}

export function religionGeneratorHref(snapshot: ReligionSnapshot): string {
  return `${resolve('/fantasy/religion')}?${RELIGION_LOAD_PARAM}=${encodeURIComponent(snapshot.seed)}`;
}

function readSearchParam(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return page.url.searchParams.get(name);
}

export function readHeraldryLoadParamFromLocation(): string | null {
  return readSearchParam(HERALDRY_LOAD_PARAM);
}

export function readCultureLoadParamFromLocation(): string | null {
  return readSearchParam(CULTURE_LOAD_PARAM);
}

export function readReligionLoadParamFromLocation(): string | null {
  return readSearchParam(RELIGION_LOAD_PARAM);
}

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
