import { describe, expect, it } from 'vitest';
import { speciesNameToBadgeInitials } from './species_badge_initials.js';

describe('speciesNameToBadgeInitials', () => {
  it('uses first two letters for a single word', () => {
    expect(speciesNameToBadgeInitials('wolf')).toBe('WO');
    expect(speciesNameToBadgeInitials('orc')).toBe('OR');
    expect(speciesNameToBadgeInitials('elf')).toBe('EL');
  });

  it('uses first letter of first two words for multi-word names', () => {
    expect(speciesNameToBadgeInitials('red dragon')).toBe('RD');
    expect(speciesNameToBadgeInitials('fire elemental')).toBe('FE');
    expect(speciesNameToBadgeInitials('skeletal wolf')).toBe('SW');
  });

  it('skips leading non-letters in hyphenated tokens', () => {
    expect(speciesNameToBadgeInitials('yuan-ti pureblood')).toBe('YP');
  });

  it('uppercases the result', () => {
    expect(speciesNameToBadgeInitials('Red Dragon')).toBe('RD');
  });
});

describe('speciesNameToBadgeInitials with no letters', () => {
  it('returns nothing when neither of the first two words has a letter', () => {
    expect(speciesNameToBadgeInitials('123 456')).toBe('');
  });

  it('pads a single-letter word out to two characters', () => {
    expect(speciesNameToBadgeInitials('x')).toBe('XX');
  });

  it('falls back to a placeholder when a single word has no letters', () => {
    expect(speciesNameToBadgeInitials('123')).toBe('??');
  });

  it('skips leading punctuation to find the letters', () => {
    expect(speciesNameToBadgeInitials('!rogue')).toBe('RO');
  });

  it('takes one letter from each of the first two words, skipping non-letters', () => {
    expect(speciesNameToBadgeInitials('9th legion')).toBe('TL');
  });
});
