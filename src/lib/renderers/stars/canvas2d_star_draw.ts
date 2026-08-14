import { darkenRgb, lightenRgb, rgbaCss } from '$lib/graphics';
import type { SceneStar } from '../astronomical_scene_types';

/**
 * Draws a star from the scene. Every number here comes off the `SceneStar` — position, radius,
 * corona width and all three colours were resolved by the scene builder.
 */
export function drawStarPreviewDisk(ctx: CanvasRenderingContext2D, star: SceneStar): void {
  const { centerX, centerY, radiusPx, photosphere, corona, glow, coronaWidthPx } = star;
  const haloR = radiusPx + coronaWidthPx * 4;

  const halo = ctx.createRadialGradient(centerX, centerY, radiusPx * 0.2, centerX, centerY, haloR);
  halo.addColorStop(0, rgbaCss(photosphere, 1));
  halo.addColorStop(0.35, rgbaCss(corona, 0.9));
  halo.addColorStop(0.65, rgbaCss(glow, 0.35));
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(centerX, centerY, haloR, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(
    centerX - radiusPx * 0.2,
    centerY - radiusPx * 0.15,
    0,
    centerX,
    centerY,
    radiusPx,
  );
  core.addColorStop(0, rgbaCss(lightenRgb(photosphere, 0.25), 1));
  core.addColorStop(0.55, rgbaCss(photosphere, 1));
  core.addColorStop(1, rgbaCss(darkenRgb(photosphere, 0.35), 1));
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radiusPx, 0, Math.PI * 2);
  ctx.fill();
}
