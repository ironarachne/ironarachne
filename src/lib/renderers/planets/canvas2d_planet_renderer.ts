import { RNG } from '@ironarachne/rng';
import {
  randomRingRgb,
  resolvePlanetCanvasTheme,
} from '$lib/renderers/astronomical/planet_canvas_theme';
import { planetRadiusKmToPreviewPixels } from '$lib/renderers/astronomical/image_body_scale';
import {
  drawPlanetSpherePatch,
  drawRingEllipsePatch,
} from '$lib/renderers/planets/canvas2d_planet_draw';
import type { AstronomicalBody } from '$lib/astronomical_bodies/astronomical_bodies';

export function render(
  document: Document,
  planet: AstronomicalBody,
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

  const theme = resolvePlanetCanvasTheme(planet.classification, seed);
  const cx = width / 2;
  const cy = height / 2;
  const r = planetRadiusKmToPreviewPixels(planet.radius, Math.min(width, height));

  const seedFloat = rng.float(0, 100);
  const lx = rng.float(0.3, 0.6);
  const shadeParams = {
    seedFloat,
    lightDir: [lx, 1.0, 0.5] as [number, number, number],
    cloudCoverage: rng.float(0.5, 0.75),
    stormActivity: rng.float(0.2, 0.6),
  };

  ctx.fillStyle = '#05060a';
  ctx.fillRect(0, 0, width, height);
  sprinkleStars(ctx, width, height, rng);

  const ringRgb = randomRingRgb(seed);
  const ringAngle = rng.float(0, Math.PI);
  const ringTilt = rng.float(0.15, 0.45);

  if (planet.has_ring_system) {
    drawRingEllipsePatch(ctx, cx, cy, r, ringAngle, ringTilt, ringRgb, 'back');
  }

  drawPlanetSpherePatch(ctx, cx, cy, r, theme, shadeParams, planet.classification);

  if (planet.has_ring_system) {
    drawRingEllipsePatch(ctx, cx, cy, r, ringAngle, ringTilt, ringRgb, 'front');
  }

  const data = canvas.toDataURL('image/png');
  canvas.remove();
  return data;
}

function sprinkleStars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rng: RNG,
): void {
  const count = Math.min(180, Math.floor((width * height) / 900));
  for (let i = 0; i < count; i++) {
    const x = rng.float(0, width);
    const y = rng.float(0, height);
    const a = rng.float(0.12, 0.5);
    ctx.fillStyle = `rgba(200,210,240,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, rng.float(0.35, 1), 0, Math.PI * 2);
    ctx.fill();
  }
}
