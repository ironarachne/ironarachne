import { darkenRgb, lightenRgb, rgbaCss } from '$lib/graphics/rgb_color_ops';
import {
  ringBackHalfIsHalfZero,
  ringSemicircleAngles,
} from '$lib/renderers/astronomical/ring_geometry';
import {
  shadePlanetDiskPixel,
  type PlanetShadeParams,
} from '$lib/renderers/planets/planet_canvas_surface_shade';
import type { ScenePlanet } from '$lib/renderers/astronomical_scene_types';

export type { PlanetShadeParams };

/**
 * Where the highlight sits, from the same light vector the shader is handed. Both backends must
 * light a planet from the same side — decision 1 names that as part of the composition contract,
 * and it is the only part of the lighting this path reproduces.
 *
 * Mind the two coordinate systems. The shader builds its normal as `vec3(x, y, z)` from
 * `pixelCoords = (vUvs - 0.5) * resolution`, and `vUvs.y` increases **up** the screen, so a light
 * of `(lx, 1.0, 0.5)` with `lx` positive lights the upper *right* of the disk. Canvas y increases
 * **down**, hence the plus on x and the minus on y: both put the highlight in the same corner.
 */
function highlightPoint(planet: ScenePlanet): { x: number; y: number } {
  const [lightX, lightY] = planet.shading.lightDir;
  return {
    x: planet.centerX + planet.radiusPx * lightX * 0.8,
    y: planet.centerY - planet.radiusPx * lightY * 0.4,
  };
}

function pathDisk(ctx: CanvasRenderingContext2D, planet: ScenePlanet): void {
  ctx.beginPath();
  ctx.arc(planet.centerX, planet.centerY, planet.radiusPx, 0, Math.PI * 2);
}

/**
 * The default Canvas2D planet: two radial gradients and, for a gas giant, a banding overlay.
 *
 * This replaced a per-pixel FBM shader reimplementation that cost 1–4.7 seconds per planet on the
 * main thread — on the hardware the Canvas2D path exists to serve, which made the fallback slower
 * than the thing it falls back from. Composition is preserved exactly (the scene decides position,
 * size, palette, light direction and rings); surface detail is not, and decision 1 says it need not
 * be. `shading.seedFloat` rotates the banding and `stormActivity` sets its strength, so two gas
 * giants in one system read differently — the rotation alone is only one of seven, but the strength
 * is continuous. `cloudCoverage` drives per-pixel noise that this path has none of, and is
 * deliberately unused here.
 *
 * `drawPlanetSpherePatch` below is the high-fidelity path, for callers that can afford it.
 */
export function drawScenePlanetDisk(ctx: CanvasRenderingContext2D, planet: ScenePlanet): void {
  const { centerX, centerY, radiusPx, palette } = planet;
  const highlight = highlightPoint(planet);

  const surface = ctx.createRadialGradient(highlight.x, highlight.y, 0, centerX, centerY, radiusPx);
  surface.addColorStop(0, rgbaCss(lightenRgb(palette.main, 0.22), 1));
  surface.addColorStop(0.55, rgbaCss(palette.main, 1));
  surface.addColorStop(1, rgbaCss(darkenRgb(palette.main, 0.42), 1));
  ctx.fillStyle = surface;
  pathDisk(ctx, planet);
  ctx.fill();

  if (planet.isGasGiant) {
    drawGasGiantBands(ctx, planet);
  }

  // The terminator, drawn last so it darkens the bands too: transparent at the highlight, opaque
  // at the limb away from it, which is what makes a flat disk read as a sphere.
  const terminator = ctx.createRadialGradient(
    highlight.x,
    highlight.y,
    radiusPx * 0.35,
    centerX,
    centerY,
    radiusPx,
  );
  terminator.addColorStop(0, 'rgba(0,0,0,0)');
  terminator.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = terminator;
  pathDisk(ctx, planet);
  ctx.fill();
}

/** The band colours, from pole to pole. The seed rotates the sequence; seven rotations exist. */
const GAS_GIANT_BAND_SEQUENCE = [
  'band1',
  'main',
  'band2',
  'main',
  'band1',
  'main',
  'band2',
] as const;

function drawGasGiantBands(ctx: CanvasRenderingContext2D, planet: ScenePlanet): void {
  const { centerX, centerY, radiusPx, palette, shading } = planet;

  ctx.save();
  pathDisk(ctx, planet);
  ctx.clip();

  const bands = ctx.createLinearGradient(centerX, centerY - radiusPx, centerX, centerY + radiusPx);
  // seedFloat runs 0–100; its fractional part rotates the sequence, keeping the gradient stops
  // monotonic rather than wrapping them out of order.
  const rotation = Math.floor((shading.seedFloat % 1) * GAS_GIANT_BAND_SEQUENCE.length);
  GAS_GIANT_BAND_SEQUENCE.forEach((_, index) => {
    const key = GAS_GIANT_BAND_SEQUENCE[(index + rotation) % GAS_GIANT_BAND_SEQUENCE.length];
    bands.addColorStop(index / (GAS_GIANT_BAND_SEQUENCE.length - 1), rgbaCss(palette[key], 1));
  });

  ctx.globalAlpha = 0.25 + shading.stormActivity * 0.45;
  ctx.fillStyle = bands;
  ctx.fillRect(centerX - radiusPx, centerY - radiusPx, radiusPx * 2, radiusPx * 2);
  ctx.restore();
}

export type RingEllipsePhase = 'back' | 'front';

/**
 * Renders the ring in two passes (back → planet → front).
 * The projected ellipse is split at its **major-axis** vertices (the two tips of the long diameter),
 * so one semicircle runs “around the back/through the planet” and the other wraps the near side.
 * Each pass strokes **one semicircle**: the back half is drawn first and covered by the planet
 * where they overlap; the front half is drawn last on top of the planet.
 *
 * A planet with no ring draws nothing, so callers need not check first.
 */
export function drawRingEllipsePatch(
  ctx: CanvasRenderingContext2D,
  planet: ScenePlanet,
  phase: RingEllipsePhase,
): void {
  const ring = planet.ring;
  if (ring === undefined) return;

  const { centerX, centerY, radiusPx } = planet;
  const rx = radiusPx * 2.4;
  const ry = Math.max(radiusPx * 0.22, radiusPx * ring.tilt);
  const oy = -radiusPx * 0.05;
  const band = Math.max(1, radiusPx * 0.07);

  const backIsHalfZero = ringBackHalfIsHalfZero(rx, ry, oy, ring.angleRad);
  const useFirstHalf = phase === 'back' ? backIsHalfZero : !backIsHalfZero;
  const { startAngle, endAngle } = ringSemicircleAngles(rx, ry, useFirstHalf);
  const alpha = phase === 'back' ? 0.35 : 0.75;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(ring.angleRad);
  ctx.strokeStyle = rgbaCss(ring.color, alpha);
  ctx.lineWidth = band;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.ellipse(0, oy, rx, ry, 0, startAngle, endAngle, true);
  ctx.stroke();
  ctx.restore();
}

/**
 * The high-fidelity Canvas2D planet: per-pixel FBM shading, the same maths the shader runs.
 *
 * This is no longer the default — it costs seconds per planet on the main thread. It is kept as an
 * option for an offline or GPU-free render where the wait is acceptable, so the fidelity is not
 * lost, only its position as the mandatory fallback.
 */
export function drawPlanetSpherePatch(ctx: CanvasRenderingContext2D, planet: ScenePlanet): void {
  const { centerX, centerY, radiusPx, palette, shading, classification } = planet;
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;
  const d = Math.ceil(radiusPx) + 2;
  const rawX0 = Math.floor(centerX - d);
  const rawY0 = Math.floor(centerY - d);
  const rawW = d * 2 + 1;
  const rawH = d * 2 + 1;

  const x0 = Math.max(0, rawX0);
  const y0 = Math.max(0, rawY0);
  const x1 = Math.min(canvasW, rawX0 + rawW);
  const y1 = Math.min(canvasH, rawY0 + rawH);
  const w = Math.max(0, x1 - x0);
  const h = Math.max(0, y1 - y0);
  if (w === 0 || h === 0) return;

  const existing = ctx.getImageData(x0, y0, w, h);
  const data = existing.data;
  let idx = 0;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const px = x0 + i + 0.5 - centerX;
      const py = y0 + j + 0.5 - centerY;
      const dist = Math.hypot(px, py);
      if (dist > radiusPx) {
        idx += 4;
        continue;
      }
      const [cr, cg, cb] = shadePlanetDiskPixel(px, py, radiusPx, palette, shading, classification);
      data[idx] = Math.round(cr * 255);
      data[idx + 1] = Math.round(cg * 255);
      data[idx + 2] = Math.round(cb * 255);
      data[idx + 3] = 255;
      idx += 4;
    }
  }
  ctx.putImageData(existing, x0, y0);
}
