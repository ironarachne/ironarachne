import { RNG } from '@ironarachne/rng';
import { DISPLAY_SWATCHES } from '$lib/display_colors';
import { pickBadgeInitialsStyle } from '$lib/badges';
import { speciesNameToBadgeSlug } from './species_badge_slug.js';

export type SpeciesBadgePalette = {
  primary: string;
  secondary: string;
  accent: string;
};

function buildPalette(
  rng: RNG,
  colorCount: number,
  swatchPool: { commonality: number; value: string }[],
): string[] {
  const palette: string[] = [];
  const maxTries = colorCount * 20;
  for (let t = 0; t < maxTries && palette.length < colorCount; t++) {
    const hex = rng.weighted(swatchPool);
    if (!palette.includes(hex)) {
      palette.push(hex);
    }
  }
  if (palette.length < colorCount) {
    for (const swatch of DISPLAY_SWATCHES) {
      if (palette.length >= colorCount) {
        break;
      }
      if (!palette.includes(swatch.hex)) {
        palette.push(swatch.hex);
      }
    }
  }
  return palette;
}

export function pickSpeciesBadgePalette(speciesName: string): SpeciesBadgePalette {
  const slug = speciesNameToBadgeSlug(speciesName);
  const rng = new RNG(`species-badge-palette:${slug}`);
  const swatchPool = DISPLAY_SWATCHES.map((s) => ({ commonality: s.commonality, value: s.hex }));
  const colors = buildPalette(rng, 3, swatchPool);

  return {
    primary: colors[0]!,
    secondary: colors[1]!,
    accent: colors[2]!,
  };
}

export function pickSpeciesBadgeTextColor(palette: SpeciesBadgePalette): string {
  return pickSpeciesBadgeInitialsStyle(palette).text;
}

export function pickSpeciesBadgeInitialsStyle(palette: SpeciesBadgePalette) {
  return pickBadgeInitialsStyle([palette.primary, palette.secondary, palette.accent]);
}
