import { RNG } from '@ironarachne/rng';
import { getRgbColorsFromStarSurfaceTemperature } from '$lib/renderers/astronomical/star_surface_colors';
import { starRadiusKmToPreviewPixels } from '$lib/renderers/astronomical/image_body_scale';
import { drawStarPreviewDisk } from '$lib/renderers/stars/canvas2d_star_draw';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';

export function render(
  document: Document,
  star: AstronomicalBody,
  width: number,
  height: number,
  seed: string,
): string {
  const rng = new RNG(seed);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error('Could not get 2D context');
  }

  ctx.fillStyle = '#030308';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const colors = getRgbColorsFromStarSurfaceTemperature(star.surface_temperature);
  const diskPx = starRadiusKmToPreviewPixels(star.radius, Math.min(width, height));
  sprinkleBackgroundStars(ctx, width, height, rng);

  drawStarPreviewDisk(ctx, cx, cy, diskPx, colors);

  const data = canvas.toDataURL('image/png');
  canvas.remove();
  return data;
}

function sprinkleBackgroundStars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: RNG,
): void {
  const count = Math.min(220, Math.floor((width * height) / 800));
  for (let i = 0; i < count; i++) {
    const x = rng.float(0, width);
    const y = rng.float(0, height);
    const a = rng.float(0.15, 0.65);
    const s = rng.float(0.4, 1.2);
    ctx.fillStyle = `rgba(220,230,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }
}
