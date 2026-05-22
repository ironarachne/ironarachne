import { describe, expect, it } from 'vitest';
import { archetypeNameToBadgeInitials } from './archetype_badge_initials.js';

describe('archetypeNameToBadgeInitials', () => {
  it('uses first two letters for a single word', () => {
    expect(archetypeNameToBadgeInitials('rogue')).toBe('RO');
    expect(archetypeNameToBadgeInitials('mage')).toBe('MA');
    expect(archetypeNameToBadgeInitials('fighter')).toBe('FI');
  });

  it('uses first letter of first two words for multi-word names', () => {
    expect(archetypeNameToBadgeInitials('power strike')).toBe('PS');
  });

  it('uppercases the result', () => {
    expect(archetypeNameToBadgeInitials('Assassin')).toBe('AS');
  });
});
