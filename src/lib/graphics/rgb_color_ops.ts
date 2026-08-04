/** Operations on {@link RGBColor}, whose channels run 0–1. */

import type RGBColor from './rgb_color';

/** A CSS `rgba()` string, with the 0–1 channels scaled to the 0–255 CSS expects. */
export function rgbaCss(color: RGBColor, alpha: number): string {
  const channel = (value: number) => Math.round(value * 255);
  return `rgba(${channel(color.r)},${channel(color.g)},${channel(color.b)},${alpha})`;
}

/**
 * Reads a `#rrggbb` or `#rgb` CSS colour into 0–1 channels. Anything else is black — a colour a
 * shader can still draw, rather than an exception thrown mid-render.
 */
export function rgbFromHexCss(hex: string): RGBColor {
  const digits = hex.replace('#', '');
  const expanded =
    digits.length === 3
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return { r: 0, g: 0, b: 0 };

  return {
    r: parseInt(expanded.slice(0, 2), 16) / 255,
    g: parseInt(expanded.slice(2, 4), 16) / 255,
    b: parseInt(expanded.slice(4, 6), 16) / 255,
  };
}

/** Adds `amount` to every channel, clamped at white. */
export function lightenRgb(color: RGBColor, amount: number): RGBColor {
  return {
    r: Math.min(1, color.r + amount),
    g: Math.min(1, color.g + amount),
    b: Math.min(1, color.b + amount),
  };
}

/** Subtracts `amount` from every channel, clamped at black. */
export function darkenRgb(color: RGBColor, amount: number): RGBColor {
  return {
    r: Math.max(0, color.r - amount),
    g: Math.max(0, color.g - amount),
    b: Math.max(0, color.b - amount),
  };
}
