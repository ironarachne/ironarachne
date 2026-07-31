import { describe, expect, it } from 'vitest';
import { getArchetypeBadgeSvg, getArchetypeBadgeSvgForName } from './archetype_badge_assets.js';

// The assets directory is scaffolding: it holds only a .gitkeep, so the import.meta.glob that
// builds the slug map matches nothing and both getters always miss. These tests pin that
// contract rather than asserting a badge exists. Add cases here when real SVGs land — the map
// callback inside archetype_badge_assets.ts cannot be covered until one does.
describe('getArchetypeBadgeSvg', () => {
  it('returns undefined for a slug with no asset', () => {
    expect(getArchetypeBadgeSvg('no_such_badge')).toBeUndefined();
  });

  it('returns undefined for an empty slug', () => {
    expect(getArchetypeBadgeSvg('')).toBeUndefined();
  });
});

describe('getArchetypeBadgeSvgForName', () => {
  it('looks up a display name without throwing', () => {
    expect(getArchetypeBadgeSvgForName('Power Strike')).toBeUndefined();
  });

  it('agrees with the slug-based lookup', () => {
    expect(getArchetypeBadgeSvgForName('power strike')).toBe(getArchetypeBadgeSvg('power_strike'));
  });
});
