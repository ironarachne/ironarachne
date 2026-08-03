import type { PlanetCanvasTheme } from '$lib/renderers/astronomical/planet_canvas_theme';
import {
  ringBackHalfIsHalfZero,
  ringSemicircleAngles,
} from '$lib/renderers/astronomical/ring_geometry';
import {
  shadePlanetDiskPixel,
  type PlanetShadeParams,
} from '$lib/renderers/planets/planet_canvas_surface_shade';
import type RGBColor from '$lib/graphics/rgb_color';

export type { PlanetShadeParams };

export function drawPlanetSpherePatch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  theme: PlanetCanvasTheme,
  shade: PlanetShadeParams,
  classification: string,
): void {
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;
  const d = Math.ceil(r) + 2;
  const rawX0 = Math.floor(cx - d);
  const rawY0 = Math.floor(cy - d);
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
      const px = x0 + i + 0.5 - cx;
      const py = y0 + j + 0.5 - cy;
      const dist = Math.hypot(px, py);
      if (dist > r) {
        idx += 4;
        continue;
      }
      const [cr, cg, cb] = shadePlanetDiskPixel(px, py, r, theme, shade, classification);
      data[idx] = Math.round(cr * 255);
      data[idx + 1] = Math.round(cg * 255);
      data[idx + 2] = Math.round(cb * 255);
      data[idx + 3] = 255;
      idx += 4;
    }
  }
  ctx.putImageData(existing, x0, y0);
}

export type RingEllipsePhase = 'back' | 'front';

/**
 * Renders the ring in two passes (back → planet → front).
 * The projected ellipse is split at its **major-axis** vertices (the two tips of the long diameter),
 * so one semicircle runs “around the back/through the planet” and the other wraps the near side.
 * Each pass strokes **one semicircle**: the back half is drawn first and covered by the planet
 * where they overlap; the front half is drawn last on top of the planet.
 */
export function drawRingEllipsePatch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  planetR: number,
  angleRad: number,
  tilt: number,
  rgb: RGBColor,
  phase: RingEllipsePhase,
): void {
  const rx = planetR * 2.4;
  const ry = Math.max(planetR * 0.22, planetR * tilt);
  const oy = -planetR * 0.05;
  const band = Math.max(1, planetR * 0.07);

  const backIsHalfZero = ringBackHalfIsHalfZero(rx, ry, oy, angleRad);
  const useFirstHalf = phase === 'back' ? backIsHalfZero : !backIsHalfZero;
  const { startAngle, endAngle } = ringSemicircleAngles(rx, ry, useFirstHalf);
  const alpha = phase === 'back' ? 0.35 : 0.75;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);
  ctx.strokeStyle = rgbaCss(rgb, alpha);
  ctx.lineWidth = band;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.ellipse(0, oy, rx, ry, 0, startAngle, endAngle, true);
  ctx.stroke();
  ctx.restore();
}

function rgbaCss(c: RGBColor, alpha: number): string {
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${alpha})`;
}
