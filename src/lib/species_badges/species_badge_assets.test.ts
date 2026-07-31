import { describe, expect, it } from 'vitest';
import { getSpeciesBadgeSvg, getSpeciesBadgeSvgForName } from './species_badge_assets.js';

// The assets directory is scaffolding: it holds only a .gitkeep, so the import.meta.glob that
// builds the slug map matches nothing and both getters always miss. These tests pin that
// contract rather than asserting a badge exists. Add cases here when real SVGs land — the map
// callback inside species_badge_assets.ts cannot be covered until one does.
describe('getSpeciesBadgeSvg', () => {
  it('returns undefined for a slug with no asset', () => {
    expect(getSpeciesBadgeSvg('no_such_badge')).toBeUndefined();
  });

  it('returns undefined for an empty slug', () => {
    expect(getSpeciesBadgeSvg('')).toBeUndefined();
  });
});

describe('getSpeciesBadgeSvgForName', () => {
  it('looks up a display name without throwing', () => {
    expect(getSpeciesBadgeSvgForName('Red Dragon')).toBeUndefined();
  });

  it('agrees with the slug-based lookup', () => {
    expect(getSpeciesBadgeSvgForName('red dragon')).toBe(getSpeciesBadgeSvg('red_dragon'));
  });
});
