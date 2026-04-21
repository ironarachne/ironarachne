import {
  ASTRONOMICAL_RENDERER_STORAGE_KEY,
  parseAstronomicalRendererKind,
  type AstronomicalRendererKind,
} from '$lib/renderers/astronomical_renderer_kind';

export function readStoredAstronomicalRendererKind(): AstronomicalRendererKind {
  if (typeof localStorage === 'undefined') return 'webgl';
  return parseAstronomicalRendererKind(localStorage.getItem(ASTRONOMICAL_RENDERER_STORAGE_KEY));
}

export function writeStoredAstronomicalRendererKind(kind: AstronomicalRendererKind): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ASTRONOMICAL_RENDERER_STORAGE_KEY, kind);
}
