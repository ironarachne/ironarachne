import { describe, expect, it } from 'vitest';
import {
  canvasToDataUrlAtSize,
  rasterScaleForQuality,
  rasterSizeForQuality,
} from '$lib/renderers/render_scale';

type Recorded = { op: string; args: unknown[] };

function fakeCanvas(width: number, height: number, { noContext = false } = {}) {
  const calls: Recorded[] = [];
  const canvas = {
    width,
    height,
    getContext: () => {
      if (noContext) return null;
      return new Proxy({} as Record<string, unknown>, {
        get:
          (_t, prop: string) =>
          (...args: unknown[]) =>
            calls.push({ op: prop, args }),
        set: (_t, prop: string, value: unknown) => {
          calls.push({ op: `set:${prop}`, args: [value] });
          return true;
        },
      });
    },
    toDataURL: () => `data:image/png;base64,${canvas.width}x${canvas.height}`,
    remove: () => calls.push({ op: 'remove', args: [] }),
  };
  return { canvas: canvas as unknown as HTMLCanvasElement, calls, raw: canvas };
}

function fakeDocument(created: ReturnType<typeof fakeCanvas>[]) {
  let index = 0;
  return {
    createElement: () => created[index++].canvas,
  } as unknown as Document;
}

describe('rasterScaleForQuality', () => {
  it('is half linear scale for reduced, which is a quarter of the fragments', () => {
    expect(rasterScaleForQuality('reduced')).toBe(0.5);
  });

  it('is untouched for full', () => {
    expect(rasterScaleForQuality('full')).toBe(1);
  });
});

describe('rasterSizeForQuality', () => {
  it('halves both dimensions at reduced quality', () => {
    expect(rasterSizeForQuality('reduced', 512, 256)).toEqual({ width: 256, height: 128 });
  });

  it('rounds rather than truncating an odd size', () => {
    expect(rasterSizeForQuality('reduced', 401, 99)).toEqual({ width: 201, height: 50 });
  });

  it('never rounds a preview away to nothing', () => {
    expect(rasterSizeForQuality('reduced', 1, 1)).toEqual({ width: 1, height: 1 });
  });
});

describe('canvasToDataUrlAtSize', () => {
  it('exports directly when the canvas is already the size asked for', () => {
    const source = fakeCanvas(512, 256);
    const scaled = fakeCanvas(0, 0);

    expect(canvasToDataUrlAtSize(fakeDocument([scaled]), source.canvas, 512, 256)).toBe(
      'data:image/png;base64,512x256',
    );
    // A full-quality render is the common case and must not pay for a second canvas.
    expect(scaled.calls).toEqual([]);
  });

  it('scales a smaller render up to the size the caller asked for', () => {
    const source = fakeCanvas(256, 128);
    const scaled = fakeCanvas(0, 0);

    const url = canvasToDataUrlAtSize(fakeDocument([scaled]), source.canvas, 512, 256);

    expect(scaled.raw.width).toBe(512);
    expect(scaled.raw.height).toBe(256);
    expect(scaled.calls).toEqual([
      { op: 'set:imageSmoothingEnabled', args: [true] },
      { op: 'drawImage', args: [source.canvas, 0, 0, 512, 256] },
      { op: 'remove', args: [] },
    ]);
    expect(url).toBe('data:image/png;base64,512x256');
  });

  it('returns the smaller image rather than nothing when there is no context to scale with', () => {
    const source = fakeCanvas(256, 128);
    const scaled = fakeCanvas(0, 0, { noContext: true });

    expect(canvasToDataUrlAtSize(fakeDocument([scaled]), source.canvas, 512, 256)).toBe(
      'data:image/png;base64,256x128',
    );
  });
});
