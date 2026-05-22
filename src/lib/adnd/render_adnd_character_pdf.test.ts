import { describe, expect, it } from 'vitest';
import ADNDCharacter from './adndcharacter';
import { buildAdndCharacterPdf } from './render_adnd_character_pdf';
import ADNDClass from './adndclass';
import ADNDRace from './adndrace';

function createTestCharacter(): ADNDCharacter {
  const character = new ADNDCharacter();
  character.firstName = 'Elara';
  character.lastName = 'Moonwhisper';
  character.race = { name: 'elf' } as ADNDRace;
  character.class = { name: 'fighter' } as ADNDClass;
  character.level = 1;
  character.alignment = 'Neutral Good';
  character.strength = 16;
  character.exceptionalStrength = -1;
  character.dexterity = 14;
  character.constitution = 13;
  character.intelligence = 12;
  character.wisdom = 10;
  character.charisma = 11;
  character.hp = 9;
  character.ac = 4;
  character.thaco = 20;
  character.xp = 0;
  character.currency = 120;
  character.poisonSavingThrow = 14;
  character.rodSavingThrow = 16;
  character.petrificationSavingThrow = 15;
  character.breathSavingThrow = 17;
  character.spellSavingThrow = 17;
  character.hitProbability = 'normal';
  character.damageAdjustment = '+1';
  character.weightAllowance = 115;
  character.maxPress = 170;
  character.openDoors = '1-2';
  character.bendBarsLiftGates = 10;
  character.reactionAdjustment = 0;
  character.missileAttackAdjustment = 0;
  character.defensiveAdjustment = 0;
  character.systemShock = 85;
  character.resurrectionSurvival = 90;
  character.poisonSave = 0;
  character.regeneration = 'nil';
  character.numberOfLanguages = 2;
  character.spellLevel = -1;
  character.chanceToLearnSpell = -1;
  character.maximumNumberOfSpellsPerLevel = -1;
  character.illusionImmunity = -1;
  character.magicalDefenseAdjustment = 0;
  character.bonusSpells = [];
  character.chanceOfSpellFailure = 0;
  character.spellImmunity = [];
  character.maximumNumberOfHenchmen = 4;
  character.loyaltyBase = 0;
  character.npcReactionAdjustment = 0;
  character.abilities = ['Infravision 60 ft'];
  character.weapons = [
    {
      name: 'long sword',
      damageType: 'slashing',
      damageSM: '1d8',
      damageL: '1d12',
      speedFactor: 5,
    },
  ];
  character.armor = [{ name: 'chain mail', ac: 5 }];
  character.spells = [];
  character.weaponProficiencyGroups = ['long sword'];
  character.nonweaponProficiencies = ['Riding, Land-Based'];
  character.kit = null;
  return character;
}

describe('buildAdndCharacterPdf', () => {
  it('returns an application/pdf blob', async () => {
    const blob = await buildAdndCharacterPdf(createTestCharacter());
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('starts with the PDF magic header', async () => {
    const blob = await buildAdndCharacterPdf(createTestCharacter());
    const buffer = await blob.arrayBuffer();
    const header = new TextDecoder().decode(new Uint8Array(buffer).slice(0, 4));
    expect(header).toBe('%PDF');
  });

  it('embeds key character details in the generated pdf', async () => {
    const blob = await buildAdndCharacterPdf(createTestCharacter());
    const pdfText = new TextDecoder('latin1').decode(await blob.arrayBuffer());

    expect(pdfText).toContain('Elara Moonwhisper');
    expect(pdfText).toContain('elf');
    expect(pdfText).toContain('fighter');
    expect(pdfText).toContain('long sword');
  });
});
