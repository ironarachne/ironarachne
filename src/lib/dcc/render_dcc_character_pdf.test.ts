import { describe, expect, it } from 'vitest';
import { buildDccCharacterPdf } from './render_dcc_character_pdf';
import type { DCCCharacter } from './dcc_types';

const noopApply = (character: DCCCharacter): DCCCharacter => character;

function createTestCharacter(): DCCCharacter {
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
  };
}

describe('buildDccCharacterPdf', () => {
  it('returns an application/pdf blob', async () => {
    const blob = await buildDccCharacterPdf(createTestCharacter());
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('starts with the PDF magic header', async () => {
    const blob = await buildDccCharacterPdf(createTestCharacter());
    const buffer = await blob.arrayBuffer();
    const header = new TextDecoder().decode(new Uint8Array(buffer).slice(0, 4));
    expect(header).toBe('%PDF');
  });

  it('embeds key character details in the generated pdf', async () => {
    const blob = await buildDccCharacterPdf(createTestCharacter());
    const pdfText = new TextDecoder('latin1').decode(await blob.arrayBuffer());

    expect(pdfText).toContain('Alden Stone');
    expect(pdfText).toContain('alchemist');
    expect(pdfText).toContain('14');
    expect(pdfText).toContain('Harsh winter');
  });
});
