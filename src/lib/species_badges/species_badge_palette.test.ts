import { describe, expect, it } from 'vitest';
import { contrastRatio } from '$lib/display_colors/display_palettes.js';
import { pickSpeciesBadgePalette, pickSpeciesBadgeInitialsStyle } from './species_badge_palette.js';

describe('pickSpeciesBadgePalette', () => {
  it('returns the same palette for the same species name', () => {
    const first = pickSpeciesBadgePalette('red dragon');
    const second = pickSpeciesBadgePalette('red dragon');
    expect(second).toEqual(first);
  });

  it('returns three distinct colors', () => {
    const palette = pickSpeciesBadgePalette('wolf');
    expect(new Set([palette.primary, palette.secondary, palette.accent]).size).toBe(3);
  });

  it('returns different palettes for different species names', () => {
    const wolf = pickSpeciesBadgePalette('wolf');
    const bear = pickSpeciesBadgePalette('bear');
    expect(wolf).not.toEqual(bear);
  });
});

describe('pickSpeciesBadgeInitialsStyle', () => {
  it('is readable against every palette color for typical species', () => {
    for (const name of ['fire elemental', 'wolf', 'red dragon', 'skeletal wolf']) {
      const palette = pickSpeciesBadgePalette(name);
      const style = pickSpeciesBadgeInitialsStyle(palette);
      const backgrounds = [palette.primary, palette.secondary, palette.accent];
      if (style.scrim) {
        expect(style.text).toBe('#FFFFFF');
        continue;
      }
      for (const background of backgrounds) {
        expect(contrastRatio(style.text, background)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
