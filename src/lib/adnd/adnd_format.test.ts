import { describe, expect, it } from 'vitest';
import { createAdndCharacter } from './adndcharacter';
import {
  formatAdndSignedNumber,
  formatAdndStrength,
  formatAdndThiefSkillsSection,
  formatAdndWeaponsSection,
  slugifyAdndCharacterFilename,
} from './adnd_format';

describe('formatAdndSignedNumber', () => {
  it('formats positive numbers with a plus sign', () => {
    expect(formatAdndSignedNumber(2)).toBe('+2');
  });

  it('formats negative numbers without a plus sign', () => {
    expect(formatAdndSignedNumber(-1)).toBe('-1');
  });
});

describe('formatAdndStrength', () => {
  it('includes exceptional strength when present', () => {
    expect(formatAdndStrength(18, 91)).toBe('18/91');
  });

  it('omits exceptional strength when absent', () => {
    expect(formatAdndStrength(16, -1)).toBe('16');
  });
});

describe('formatAdndWeaponsSection', () => {
  it('returns None when there are no weapons', () => {
    const character = createAdndCharacter();
    expect(formatAdndWeaponsSection(character)).toBe('None');
  });
});

describe('slugifyAdndCharacterFilename', () => {
  it('creates a slugged pdf filename', () => {
    expect(slugifyAdndCharacterFilename('Elara', 'Moonwhisper')).toBe('adnd-elara-moonwhisper.pdf');
  });

  it('falls back when names are empty', () => {
    expect(slugifyAdndCharacterFilename('', '')).toBe('adnd-character.pdf');
  });
});

describe('formatAdndThiefSkillsSection', () => {
  it('sums base and allocation for each skill', () => {
    const c = createAdndCharacter();
    c.thiefSkills = [
      { name: 'Pick Pockets', value: 25, points: 20 },
      { name: 'Climb Walls', value: 60, points: 0 },
    ];

    expect(formatAdndThiefSkillsSection(c)).toBe('Pick Pockets: 45%; Climb Walls: 60%');
  });

  it('is empty for a class with no thief skills, so the caller can omit the section', () => {
    expect(formatAdndThiefSkillsSection(createAdndCharacter())).toBe('');
  });
});
