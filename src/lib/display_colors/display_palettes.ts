import type { RNG } from '@ironarachne/rng';

/**
 * Broader than heraldic tinctures: world-building display (pattern lattices, disc emblems).
 * Weighted for random picks (commonality).
 */
export type DisplayColorSwatch = {
  name: string;
  hex: string;
  commonality: number;
};

/**
 * #RRGGBB only. Shared across pattern_lattice and disc_emblem.
 */
export const DISPLAY_SWATCHES: DisplayColorSwatch[] = [
  { name: 'deep indigo', hex: '#1E2A4A', commonality: 10 },
  { name: 'teal', hex: '#0D6E6E', commonality: 10 },
  { name: 'terracotta', hex: '#B85C3C', commonality: 10 },
  { name: 'ochre', hex: '#C9A227', commonality: 10 },
  { name: 'magenta', hex: '#8B2E6B', commonality: 8 },
  { name: 'sage', hex: '#4A6B4E', commonality: 10 },
  { name: 'slate', hex: '#3D4A5C', commonality: 10 },
  { name: 'cream', hex: '#F2EBDC', commonality: 10 },
  { name: 'ivory', hex: '#F8F4EC', commonality: 8 },
  { name: 'charcoal', hex: '#2A2A2A', commonality: 10 },
  { name: 'coral', hex: '#C75B4A', commonality: 8 },
  { name: 'sky', hex: '#3A7CA5', commonality: 9 },
  { name: 'plum', hex: '#5C3D5C', commonality: 8 },
  { name: 'gold', hex: '#B8960A', commonality: 8 },
  { name: 'jade', hex: '#2D6A4F', commonality: 9 },
  { name: 'rust', hex: '#8B3A1F', commonality: 8 },
  { name: 'lavender', hex: '#6B5B8C', commonality: 7 },
  { name: 'mint', hex: '#6BA88A', commonality: 7 },
  { name: 'black', hex: '#111111', commonality: 6 },
  { name: 'white', hex: '#F5F5F5', commonality: 6 },
  { name: 'crimson', hex: '#8B1538', commonality: 8 },
  { name: 'navy', hex: '#0F2847', commonality: 8 },
  { name: 'amber', hex: '#D4A12A', commonality: 8 },
  { name: 'forest', hex: '#1A4D2E', commonality: 7 },
  { name: 'rose', hex: '#A85C6A', commonality: 7 },
  { name: 'azure', hex: '#1E5F99', commonality: 8 },
  { name: 'lime', hex: '#5C8A3A', commonality: 6 },
  { name: 'violet', hex: '#4A3A6B', commonality: 7 },
  { name: 'sand', hex: '#C4A574', commonality: 8 },
  { name: 'aqua', hex: '#2A8A8A', commonality: 7 },
];

const HEX_RE = /^#?([0-9a-fA-F]{6})$/;

function channelFromHex(n: string, start: number): number {
  return parseInt(n.slice(start, start + 2), 16) / 255;
}

function srgbChannelToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.95 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * WCAG 2.1 relative luminance of an sRGB hex string (#RRGGBB).
 * Returns 0 (black)–1 (white).
 */
export function relativeLuminance(hex: string): number {
  const m = hex.trim().match(HEX_RE);
  if (!m) {
    return 0;
  }
  const h = m[1].toLowerCase();
  const r = srgbChannelToLinear(channelFromHex(h, 0));
  const g = srgbChannelToLinear(channelFromHex(h, 2));
  const b = srgbChannelToLinear(channelFromHex(h, 4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG 2.1 contrast ratio (1–21). Lighter/figure vs darker/ground agnostic; symmetric.
 */
export function contrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const L = l1 > l2 ? l1 : l2;
  const l = l1 < l2 ? l1 : l2;
  return (L + 0.05) / (l + 0.05);
}

/** High-contrast disc emblems: aim at WCAG AA for normal text (4.5:1). */
export const DISC_MIN_CONTRAST_RATIO = 4.5;

export type ContrastPair = { ground: string; charge: string };

/**
 * Picks a ground and charge color with contrast ≥ {@link DISC_MIN_CONTRAST_RATIO},
 * re-sampling with replacement from `DISPLAY_SWATCHES` until a pair passes.
 */
export function pickContrastingPair(
  rng: RNG,
  options?: { minRatio?: number; maxAttempts?: number },
): ContrastPair {
  const minRatio = options?.minRatio ?? DISC_MIN_CONTRAST_RATIO;
  const maxAttempts = options?.maxAttempts ?? 64;
  const pool = DISPLAY_SWATCHES.map((s) => ({ commonality: s.commonality, value: s.hex }));
  for (let i = 0; i < maxAttempts; i++) {
    const ground = rng.weighted(pool);
    const charge = rng.weighted(pool);
    if (ground === charge) {
      continue;
    }
    if (contrastRatio(ground, charge) >= minRatio) {
      return { ground, charge };
    }
  }
  throw new Error('pickContrastingPair: could not find a contrasting pair; widen palette or lower minRatio');
}

export function allDisplaySwatches(): DisplayColorSwatch[] {
  return DISPLAY_SWATCHES;
}
