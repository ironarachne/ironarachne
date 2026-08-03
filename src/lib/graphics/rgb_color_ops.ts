/** Operations on {@link RGBColor}, whose channels run 0–1. */

import type RGBColor from './rgb_color';

/** A CSS `rgba()` string, with the 0–1 channels scaled to the 0–255 CSS expects. */
export function rgbaCss(color: RGBColor, alpha: number): string {
  const channel = (value: number) => Math.round(value * 255);
  return `rgba(${channel(color.r)},${channel(color.g)},${channel(color.b)},${alpha})`;
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
