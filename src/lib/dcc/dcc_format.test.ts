import { describe, expect, it } from 'vitest';
import {
  formatDccCharacterNotes,
  formatDccCurrency,
  formatDccLuckySign,
  formatDccModifier,
  formatDccSpellsKnown,
  formatDccStartingFunds,
  formatDccWeaponLine,
  slugifyDccCharacterFilename,
} from './dcc_format';
import type { DCCCharacter } from './dcc_types';

const noopApply = (character: DCCCharacter): DCCCharacter => character;

function createTestCharacter(overrides: Partial<DCCCharacter> = {}): DCCCharacter {
  return {
    firstName: 'Alden',
    lastName: 'Stone',
    age: 18,
    gender: 'male',
    level: 0,
    xp: 0,
    hp: 4,
    speed: 30,
    alignment: 'Law',
    occupation: {
      name: 'alchemist',
      trainedWeapon: {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
      tradeGoods: { name: 'oil, 1 flask', value: 5 },
      commonality: 1,
      apply: (character) => character,
    },
    strength: { value: 14, modifier: 2 },
    agility: { value: 12, modifier: 1 },
    stamina: { value: 10, modifier: 0 },
    personality: { value: 11, modifier: 0 },
    intelligence: { value: 9, modifier: -1 },
    luck: { value: 7, modifier: -2 },
    fortitudeSave: 0,
    reflexSave: 1,
    willpowerSave: 0,
    baseSave: 0,
    luckyRoll: {
      name: 'Harsh winter',
      description: 'All attack rolls',
      modifier: -2,
      apply: noopApply,
    },
    spellsKnown: -9,
    wizardMaxSpellLevel: 0,
    clericMaxSpellLevel: 0,
    attackModifier: 0,
    specialRules: ['Infravision'],
    armorClass: 10,
    currency: { cp: 32, sp: 0, gp: 0, ep: 0, pp: 0 },
    equipment: [{ name: 'backpack', value: 1 }],
    weapons: [
      {
        name: 'staff',
        classification: 'staff',
        range: 'melee',
        damage: '1d4',
        value: 50,
      },
    ],
    languages: ['Common', 'Dwarf'],
    numberOfLanguages: 0,
    ...overrides,
  };
}

describe('formatDccModifier', () => {
  it('formats positive modifiers with a plus sign', () => {
    expect(formatDccModifier(2)).toBe('+2');
  });

  it('formats zero as +0', () => {
    expect(formatDccModifier(0)).toBe('+0');
  });

  it('formats negative modifiers without a plus sign', () => {
    expect(formatDccModifier(-1)).toBe('-1');
  });
});

describe('formatDccSpellsKnown', () => {
  it('returns a readable message when spellcasting is impossible', () => {
    expect(formatDccSpellsKnown(-9)).toBe('No spellcasting possible');
  });

  it('formats positive spellcasting bonuses', () => {
    expect(formatDccSpellsKnown(1)).toBe('+1');
  });

  it('formats negative spellcasting penalties', () => {
    expect(formatDccSpellsKnown(-2)).toBe('-2');
  });
});

describe('formatDccWeaponLine', () => {
  it('includes weapon name, attack modifier, and damage', () => {
    const weapon = createTestCharacter().weapons[0];
    expect(formatDccWeaponLine(weapon, 1)).toBe('staff +1 (1d4)');
  });
});

describe('formatDccLuckySign', () => {
  it('includes name, description, and modifier', () => {
    const luckyRoll = createTestCharacter().luckyRoll;
    expect(formatDccLuckySign(luckyRoll)).toBe('Harsh winter: All attack rolls (-2)');
  });
});

describe('formatDccCurrency', () => {
  it('joins non-zero currency entries', () => {
    expect(formatDccCurrency({ cp: 32, sp: 0, gp: 5, ep: 0, pp: 0 })).toBe('32 cp, 5 gp');
  });
});

describe('formatDccStartingFunds', () => {
  it('prefers cp when present', () => {
    expect(formatDccStartingFunds({ cp: 32, sp: 0, gp: 0, ep: 0, pp: 0 })).toBe('32 cp');
  });

  it('falls back to zero cp when empty', () => {
    expect(formatDccStartingFunds({ cp: 0, sp: 0, gp: 0, ep: 0, pp: 0 })).toBe('0 cp');
  });
});

describe('formatDccCharacterNotes', () => {
  it('includes special rules and spellcasting summary', () => {
    const notes = formatDccCharacterNotes(createTestCharacter());
    expect(notes).toContain('Infravision');
    expect(notes).toContain('Spells Known: No spellcasting possible');
    expect(notes).toContain('Wizard Max: 0');
    expect(notes).toContain('Cleric Max: 0');
  });
});

describe('slugifyDccCharacterFilename', () => {
  it('creates a slugged pdf filename', () => {
    expect(slugifyDccCharacterFilename('Alden', 'Stone')).toBe('dcc-alden-stone.pdf');
  });

  it('falls back when names are empty', () => {
    expect(slugifyDccCharacterFilename('', '')).toBe('dcc-character.pdf');
  });
});
