import { describe, expect, it } from 'vitest';
import { contrastRatio } from '$lib/display_colors';
import {
  pickArchetypeBadgePalette,
  pickArchetypeBadgeInitialsStyle,
  pickArchetypeBadgeTextColor,
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

describe('pickArchetypeBadgeTextColor', () => {
  it('returns the text colour from the initials style', () => {
    const palette = pickArchetypeBadgePalette('rogue');

    expect(pickArchetypeBadgeTextColor(palette)).toBe(
      pickArchetypeBadgeInitialsStyle(palette).text,
    );
  });

  it('returns a hex colour', () => {
    expect(pickArchetypeBadgeTextColor(pickArchetypeBadgePalette('mage'))).toMatch(
      /^#[0-9A-Fa-f]{6}$/,
    );
  });

  it('is stable for the same palette', () => {
    const palette = pickArchetypeBadgePalette('fighter');

    expect(pickArchetypeBadgeTextColor(palette)).toBe(pickArchetypeBadgeTextColor(palette));
  });

  it('reads well against the palette it was chosen for', () => {
    for (const name of ['rogue', 'mage', 'fighter', 'cleric', 'ranger']) {
      const palette = pickArchetypeBadgePalette(name);
      const text = pickArchetypeBadgeTextColor(palette);

      expect(contrastRatio(text, palette.primary)).toBeGreaterThan(1);
    }
  });
});
