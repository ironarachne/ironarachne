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

describe('archetypeNameToBadgeInitials with no letters', () => {
  it('returns nothing when neither of the first two words has a letter', () => {
    expect(archetypeNameToBadgeInitials('123 456')).toBe('');
  });

  it('pads a single-letter word out to two characters', () => {
    expect(archetypeNameToBadgeInitials('x')).toBe('XX');
  });

  it('falls back to a placeholder when a single word has no letters', () => {
    expect(archetypeNameToBadgeInitials('123')).toBe('??');
  });

  it('skips leading punctuation to find the letters', () => {
    expect(archetypeNameToBadgeInitials('!rogue')).toBe('RO');
  });

  it('takes one letter from each of the first two words, skipping non-letters', () => {
    expect(archetypeNameToBadgeInitials('9th legion')).toBe('TL');
  });
});
