/**
 * What `reduced` quality means to a backend: **less work, not different work.**
 *
 * Both backends rasterize the same scene at half linear scale — a quarter of the fragments — and
 * the result is scaled back up to the size that was asked for. The scene itself is untouched, so
 * two machines on different tiers still get the same picture: same layout, same palette, same
 * background stars, drawn with less detail. Rebuilding the scene at a smaller size would have been
 * easier and would have changed the picture, which is the thing this library exists to stop.
 *
 * Scaling back up matters for a duller reason too. A caller gets a data URL and puts it in an
 * `<img>` with no width, so an image half the size would render half the size and move the page
 * around underneath the person waiting for it.
 */

import type { RenderQuality } from './astronomical_scene_types';

/** Half linear scale is a quarter of the fragments, which is the whole point of the tier. */
export function rasterScaleForQuality(quality: RenderQuality): number {
  return quality === 'reduced' ? 0.5 : 1;
}

/** At least one pixel each way: a preview small enough to round to zero still has to be an image. */
export function rasterSizeForQuality(
  quality: RenderQuality,
  width: number,
  height: number,
): { width: number; height: number } {
  const scale = rasterScaleForQuality(quality);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Returns `source` as a PNG data URL at `width` × `height`, going through a second canvas only when
 * it is actually a different size. A full-quality render is the common case and pays nothing.
 */
export function canvasToDataUrlAtSize(
  document: Document,
  source: HTMLCanvasElement,
  width: number,
  height: number,
): string {
  if (source.width === width && source.height === height) {
    return source.toDataURL('image/png');
  }

  const scaled = document.createElement('canvas');
  scaled.width = width;
  scaled.height = height;

  const ctx = scaled.getContext('2d');
  if (ctx === null) {
    // No 2D context to upscale with. The smaller image is still the right picture, and a caller
    // that lays it out at its natural size is a better outcome than no preview at all.
    return source.toDataURL('image/png');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(source, 0, 0, width, height);

  const data = scaled.toDataURL('image/png');
  scaled.remove();
  return data;
}
