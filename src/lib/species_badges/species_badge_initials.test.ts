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
