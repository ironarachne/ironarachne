import { RNG } from '@ironarachne/rng';
import { DISPLAY_SWATCHES } from '$lib/display_colors';
import { pickBadgeInitialsStyle } from '$lib/badges';
import { archetypeNameToBadgeSlug } from './archetype_badge_slug.js';

export type ArchetypeBadgePalette = {
  primary: string;
  secondary: string;
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

export function pickArchetypeBadgePalette(archetypeName: string): ArchetypeBadgePalette {
  const slug = archetypeNameToBadgeSlug(archetypeName);
  const rng = new RNG(`archetype-badge-palette:${slug}`);
  const swatchPool = DISPLAY_SWATCHES.map((s) => ({ commonality: s.commonality, value: s.hex }));
  const colors = buildPalette(rng, 2, swatchPool);

  return {
    primary: colors[0]!,
    secondary: colors[1]!,
  };
}

export function pickArchetypeBadgeTextColor(palette: ArchetypeBadgePalette): string {
  return pickArchetypeBadgeInitialsStyle(palette).text;
}

export function pickArchetypeBadgeInitialsStyle(palette: ArchetypeBadgePalette) {
  return pickBadgeInitialsStyle([palette.primary, palette.secondary]);
}
