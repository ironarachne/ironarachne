import { describe, expect, it } from 'vitest';
import { contrastRatio } from '$lib/display_colors/display_palettes.js';
import {
  pickArchetypeBadgePalette,
  pickArchetypeBadgeInitialsStyle,
} from './archetype_badge_palette.js';

describe('pickArchetypeBadgePalette', () => {
  it('returns the same palette for the same archetype name', () => {
    const first = pickArchetypeBadgePalette('rogue');
    const second = pickArchetypeBadgePalette('rogue');
    expect(second).toEqual(first);
  });

  it('returns two distinct colors', () => {
    const palette = pickArchetypeBadgePalette('mage');
    expect(palette.primary).not.toBe(palette.secondary);
  });

  it('returns different palettes for different archetype names', () => {
    const rogue = pickArchetypeBadgePalette('rogue');
    const fighter = pickArchetypeBadgePalette('fighter');
    expect(rogue).not.toEqual(fighter);
  });
});

describe('pickArchetypeBadgeInitialsStyle', () => {
  it('is readable against every palette color for typical archetypes', () => {
    for (const name of ['rogue', 'mage', 'fighter', 'assassin']) {
      const palette = pickArchetypeBadgePalette(name);
      const style = pickArchetypeBadgeInitialsStyle(palette);
      const backgrounds = [palette.primary, palette.secondary];
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
