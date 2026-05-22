import { describe, expect, it } from 'vitest';
import { speciesNameToBadgeSlug } from './species_badge_slug.js';

describe('speciesNameToBadgeSlug', () => {
  it('slugifies spaces and punctuation', () => {
    expect(speciesNameToBadgeSlug('red dragon')).toBe('red_dragon');
    expect(speciesNameToBadgeSlug('yuan-ti pureblood')).toBe('yuan_ti_pureblood');
    expect(speciesNameToBadgeSlug('skeletal wolf')).toBe('skeletal_wolf');
  });
});
