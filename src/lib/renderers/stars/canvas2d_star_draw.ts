import { starCoronaWidthPixelsFromDiskRadius } from '$lib/renderers/astronomical/image_body_scale';
import type RGBColor from '$lib/graphics/rgb_color';

export function drawStarPreviewDisk(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  diskRadiusPx: number,
  colors: [RGBColor, RGBColor, RGBColor],
): void {
  const [photosphere, corona, glow] = colors;
  const coronaW = starCoronaWidthPixelsFromDiskRadius(diskRadiusPx);
  const haloR = diskRadiusPx + coronaW * 4;

  const halo = ctx.createRadialGradient(cx, cy, diskRadiusPx * 0.2, cx, cy, haloR);
  halo.addColorStop(0, rgbaCss(photosphere, 1));
  halo.addColorStop(0.35, rgbaCss(corona, 0.9));
  halo.addColorStop(0.65, rgbaCss(glow, 0.35));
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(
    cx - diskRadiusPx * 0.2,
    cy - diskRadiusPx * 0.15,
    0,
    cx,
    cy,
    diskRadiusPx,
  );
  core.addColorStop(0, rgbaCss(lighten(photosphere, 0.25), 1));
  core.addColorStop(0.55, rgbaCss(photosphere, 1));
  core.addColorStop(1, rgbaCss(darken(photosphere, 0.35), 1));
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, diskRadiusPx, 0, Math.PI * 2);
  ctx.fill();
}

function rgbaCss(c: RGBColor, alpha: number): string {
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${alpha})`;
}

function lighten(c: RGBColor, amount: number): RGBColor {
  return {
    r: Math.min(1, c.r + amount),
    g: Math.min(1, c.g + amount),
    b: Math.min(1, c.b + amount),
  };
}

function darken(c: RGBColor, amount: number): RGBColor {
  return {
    r: Math.max(0, c.r - amount),
    g: Math.max(0, c.g - amount),
    b: Math.max(0, c.b - amount),
  };
}
