import { RNG } from '@ironarachne/rng';
import { computeStarSystemLayout } from '$lib/renderers/astronomical/star_system_layout';
import { getRgbColorsFromStarSurfaceTemperature } from '$lib/renderers/astronomical/star_surface_colors';
import {
  randomRingRgb,
  resolvePlanetCanvasTheme,
} from '$lib/renderers/astronomical/planet_canvas_theme';
import { drawStarPreviewDisk } from '$lib/renderers/stars/canvas2d_star_draw';
import { drawPlanetSpherePatch, drawRingEllipsePatch } from '$lib/renderers/planets/canvas2d_planet_draw';
import type { StarSystem } from '$lib/astronomical_bodies/star_systems.js';

export function render(
  document: Document,
  system: StarSystem,
  width: number,
  height: number,
  seed: string,
): string {
  const layout = computeStarSystemLayout(system, width, height);
  if (layout.totalUnits === 0) return '';

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
  sprinkleBackgroundStars(ctx, width, height, rng);

  let planetSerial = 0;
  for (const item of layout.items) {
    const cx = item.centerX;
    const cy = height / 2;

    if (item.kind === 'star') {
      const diskR = item.bodySizePixels / 2;
      const colors = getRgbColorsFromStarSurfaceTemperature(item.body.surface_temperature);
      drawStarPreviewDisk(ctx, cx, cy, diskR, colors);
    } else {
      const bodySizePixels = item.bodySizePixels;
      const diskR = bodySizePixels / 2;
      const planetSeed = `${seed}:p${planetSerial}`;
      planetSerial += 1;
      const theme = resolvePlanetCanvasTheme(item.body.classification, planetSeed);
      const prng = new RNG(planetSeed);
      const seedFloat = prng.float(0, 100);
      const lx = prng.float(0.3, 0.6);
      const shadeParams = {
        seedFloat,
        lightDir: [lx, 1.0, 0.5] as [number, number, number],
        cloudCoverage: prng.float(0.5, 0.75),
        stormActivity: prng.float(0.2, 0.6),
      };
      const ringRgb = randomRingRgb(planetSeed);
      const ringAngle = prng.float(0, Math.PI);
      const ringTilt = prng.float(0.15, 0.45);

      if (item.body.has_ring_system) {
        drawRingEllipsePatch(ctx, cx, cy, diskR, ringAngle, ringTilt, ringRgb, 'back');
      }
      drawPlanetSpherePatch(ctx, cx, cy, diskR, theme, shadeParams, item.body.classification);
      if (item.body.has_ring_system) {
        drawRingEllipsePatch(ctx, cx, cy, diskR, ringAngle, ringTilt, ringRgb, 'front');
      }
    }
  }

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
  const count = Math.min(380, Math.floor((width * height) / 500));
  for (let i = 0; i < count; i++) {
    const x = rng.float(0, width);
    const y = rng.float(0, height);
    const a = rng.float(0.12, 0.55);
    const s = rng.float(0.35, 1.1);
    ctx.fillStyle = `rgba(210,220,250,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }
}
