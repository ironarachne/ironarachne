export type RendererBackend = 'webgl' | 'canvas2d';

export function parseRendererBackend(raw: string | null): RendererBackend | undefined {
  if (raw === 'webgl') return 'webgl';
  if (raw === 'canvas2d') return 'canvas2d';
  return undefined;
}
