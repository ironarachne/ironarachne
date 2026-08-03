import { describe, expect, it } from 'vitest';
import { darkenRgb, lightenRgb, rgbaCss } from './rgb_color_ops';

describe('rgbaCss', () => {
  it('scales 0–1 channels to the 0–255 CSS expects', () => {
    expect(rgbaCss({ r: 1, g: 0.5, b: 0 }, 1)).toBe('rgba(255,128,0,1)');
  });

  it('carries the alpha through unscaled', () => {
    expect(rgbaCss({ r: 0, g: 0, b: 0 }, 0.35)).toBe('rgba(0,0,0,0.35)');
  });

  it('rounds rather than truncates', () => {
    // 0.6 * 255 = 153.0, 0.601 * 255 = 153.255, 0.599 * 255 = 152.745
    expect(rgbaCss({ r: 0.6, g: 0.601, b: 0.599 }, 1)).toBe('rgba(153,153,153,1)');
  });
});

describe('lightenRgb', () => {
  it('adds the amount to every channel', () => {
    const lit = lightenRgb({ r: 0.1, g: 0.2, b: 0.3 }, 0.25);
    expect(lit.r).toBeCloseTo(0.35, 12);
    expect(lit.g).toBeCloseTo(0.45, 12);
    expect(lit.b).toBeCloseTo(0.55, 12);
  });

  it('clamps at white', () => {
    expect(lightenRgb({ r: 0.9, g: 1, b: 0.5 }, 0.5)).toEqual({ r: 1, g: 1, b: 1 });
  });
});

describe('darkenRgb', () => {
  it('subtracts the amount from every channel', () => {
    const dark = darkenRgb({ r: 0.5, g: 0.6, b: 0.7 }, 0.2);
    expect(dark.r).toBeCloseTo(0.3, 12);
    expect(dark.g).toBeCloseTo(0.4, 12);
    expect(dark.b).toBeCloseTo(0.5, 12);
  });

  it('clamps at black', () => {
    expect(darkenRgb({ r: 0.1, g: 0, b: 0.4 }, 0.5)).toEqual({ r: 0, g: 0, b: 0 });
  });
});
