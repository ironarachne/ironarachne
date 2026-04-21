export type AstronomicalRendererKind = 'webgl' | 'canvas2d';

export const ASTRONOMICAL_RENDERER_STORAGE_KEY = 'ironarachne.astronomicalRenderer';

export function parseAstronomicalRendererKind(raw: string | null): AstronomicalRendererKind {
  if (raw === 'canvas2d') return 'canvas2d';
  return 'webgl';
}
