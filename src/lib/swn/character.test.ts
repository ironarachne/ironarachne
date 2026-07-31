import { describe, expect, it } from 'vitest';
import * as RNG from '@ironarachne/rng';
import { SWNCharacter, formatAsText, generate } from './character';

const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function charactersFrom(count: number) {
  return Array.from({ length: count }, (_, i) => generate(new RNG.RNG('seed-' + i)));
}

const PSYCHIC_SKILLS = [
  'Biopsionics',
  'Metapsionics',
  'Precognition',
  'Telekinesis',
  'Telepathy',
  'Teleportation',
];

describe('generate', () => {
  // Compared through the serialised form: several nested classes hold function-valued members
  // (addTo handlers) rebuilt on each call, which never compare equal by identity.
  it('is reproducible from a seed', () => {
    const first = generate(new RNG.RNG('seed-a'));
    const second = generate(new RNG.RNG('seed-a'));

    expect(JSON.parse(JSON.stringify(first))).toEqual(JSON.parse(JSON.stringify(second)));
    expect(formatAsText(first)).toBe(formatAsText(second));
  });

  it('stays reproducible across many seeds', () => {
    for (let i = 0; i < 50; i++) {
      const seed = 'repeat-' + i;

      expect(formatAsText(generate(new RNG.RNG(seed)))).toBe(
        formatAsText(generate(new RNG.RNG(seed))),
      );
    }
  });

  it('varies with the seed', () => {
    const shapes = new Set(seeds.map((seed) => formatAsText(generate(new RNG.RNG(seed)))));

    expect(shapes.size).toBeGreaterThan(1);
  });

  it('never throws across a wide sweep of seeds', () => {
    const failures: string[] = [];

    for (let i = 0; i < 5000; i++) {
      try {
        generate(new RNG.RNG('sweep-' + i));
      } catch (error) {
        failures.push(`sweep-${i}: ${(error as Error).message}`);
      }
    }

    expect(failures).toEqual([]);
  });

  it('returns a fully populated character', () => {
    for (const seed of seeds) {
      const character = generate(new RNG.RNG(seed));

      expect(character).toBeInstanceOf(SWNCharacter);
      expect(character.background.name.length).toBeGreaterThan(0);
      expect(character.characterClass.name.length).toBeGreaterThan(0);
      expect(character.currentLevel).toBe(1);
      expect(character.stats.length).toBe(6);
      expect(character.skills.length).toBeGreaterThan(0);
      expect(character.focuses.length).toBeGreaterThan(0);
    }
  });

  it('rolls all six stats with matching modifiers', () => {
    const expected = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

    for (const character of charactersFrom(100)) {
      const abbreviations = character.stats.map((stat) => stat.abbreviation);

      expect(new Set(abbreviations)).toEqual(new Set(expected));
      for (const stat of character.stats) {
        expect(stat.score).toBeGreaterThanOrEqual(3);
        expect(stat.score).toBeLessThanOrEqual(18);
        expect(stat.modifier).toBeGreaterThanOrEqual(-2);
        expect(stat.modifier).toBeLessThanOrEqual(2);
      }
    }
  });

  it('derives the saving throws from the better of each stat pair', () => {
    for (const character of charactersFrom(100)) {
      const modifier = (abbreviation: string) =>
        character.stats.find((stat) => stat.abbreviation === abbreviation)!.modifier;

      expect(character.savingThrowMental).toBe(15 - Math.max(modifier('WIS'), modifier('CHA')));
      expect(character.savingThrowEvasion).toBe(15 - Math.max(modifier('INT'), modifier('DEX')));
      expect(character.savingThrowPhysical).toBe(15 - Math.max(modifier('STR'), modifier('CON')));
    }
  });

  it('adds the constitution modifier to hit points', () => {
    for (const character of charactersFrom(200)) {
      expect(character.hitPoints).toBeGreaterThan(0);
    }
  });

  it('adds the dexterity modifier to both armor class figures', () => {
    for (const character of charactersFrom(100)) {
      const dexterity = character.stats.find((stat) => stat.abbreviation === 'DEX')!.modifier;

      expect(character.armorClassUnequipped).toBeGreaterThanOrEqual(10 + dexterity);
      expect(character.armorClassEquipped).toBeGreaterThanOrEqual(10 + dexterity);
    }
  });

  it('takes its attack bonus from the class', () => {
    for (const character of charactersFrom(100)) {
      expect(character.attackBonus).toBe(character.characterClass.attackBonus);
    }
  });

  it('gives a character with Stab or Shoot the matching attack bonus', () => {
    for (const character of charactersFrom(300)) {
      const stab = character.skills.find((skill) => skill.name === 'Stab');
      const shoot = character.skills.find((skill) => skill.name === 'Shoot');

      if (stab) {
        expect(character.meleeAttackBonus).toBeGreaterThan(-2);
      }
      if (shoot) {
        expect(character.rangedAttackBonus).toBeGreaterThan(-2);
      }
    }
  });

  it('leaves the attack bonus at the unskilled penalty without those skills', () => {
    for (const character of charactersFrom(300)) {
      if (!character.skills.some((skill) => skill.name === 'Stab')) {
        expect(character.meleeAttackBonus).toBe(-2);
      }
      if (!character.skills.some((skill) => skill.name === 'Shoot')) {
        expect(character.rangedAttackBonus).toBe(-2);
      }
    }
  });

  it('gives every character starting equipment', () => {
    for (const character of charactersFrom(100)) {
      expect(
        character.equipment.length + character.rangedWeapons.length + character.meleeWeapons.length,
      ).toBeGreaterThan(0);
    }
  });

  it('lists equipment by name', () => {
    for (const character of charactersFrom(50)) {
      expect(character.equipmentList()).toEqual(character.equipment.map((item) => item.name));
    }
  });

  it('never gives a skill a level below zero', () => {
    for (const character of charactersFrom(300)) {
      for (const skill of character.skills) {
        expect(skill.level).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('never lists the same skill twice', () => {
    for (const character of charactersFrom(300)) {
      const names = character.skills.map((skill) => skill.name);

      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('reaches every psychic discipline across enough seeds', () => {
    const seen = new Set<string>();

    for (const character of charactersFrom(2000)) {
      for (const skill of character.skills) {
        if (PSYCHIC_SKILLS.includes(skill.name)) {
          seen.add(skill.name);
        }
      }
    }

    expect([...seen].sort()).toEqual([...PSYCHIC_SKILLS].sort());
  });

  it('gives a psychic character the matching special ability', () => {
    const psychics = charactersFrom(2000).filter((character) =>
      character.skills.some((skill) => PSYCHIC_SKILLS.includes(skill.name)),
    );

    expect(psychics.length).toBeGreaterThan(0);
    for (const character of psychics) {
      expect(character.abilities.length).toBeGreaterThan(0);
    }
  });

  it('reaches both level 0 and level 1 psychic skills', () => {
    const levels = new Set<number>();

    for (const character of charactersFrom(2000)) {
      for (const skill of character.skills) {
        if (PSYCHIC_SKILLS.includes(skill.name)) {
          levels.add(skill.level);
        }
      }
    }

    expect(levels.has(0)).toBe(true);
    expect(levels.has(1)).toBe(true);
  });

  it('grants effort to a psychic character', () => {
    const withEffort = charactersFrom(2000).filter((character) => character.effort > 0);

    expect(withEffort.length).toBeGreaterThan(0);
    for (const character of withEffort) {
      expect(character.effort).toBeGreaterThan(0);
    }
  });

  it('reaches more than one character class and background', () => {
    const characters = charactersFrom(500);

    expect(
      new Set(characters.map((character) => character.characterClass.name)).size,
    ).toBeGreaterThan(1);
    expect(new Set(characters.map((character) => character.background.name)).size).toBeGreaterThan(
      1,
    );
  });
});

describe('SWNCharacter', () => {
  it('starts at level one with the unskilled attack penalty', () => {
    const character = new SWNCharacter(new RNG.RNG('seed-a'));

    expect(character.currentLevel).toBe(1);
    expect(character.attackBonus).toBe(0);
    expect(character.meleeAttackBonus).toBe(-2);
    expect(character.rangedAttackBonus).toBe(-2);
    expect(character.hitPoints).toBe(0);
    expect(character.effort).toBe(0);
    expect(character.credits).toBe(0);
    expect(character.armorClassBase).toBe(10);
    expect(character.skills).toEqual([]);
    expect(character.focuses).toEqual([]);
    expect(character.equipment).toEqual([]);
  });

  it('returns an empty equipment list before anything is added', () => {
    expect(new SWNCharacter(new RNG.RNG('seed-a')).equipmentList()).toEqual([]);
  });
});

describe('formatAsText', () => {
  const character = generate(new RNG.RNG('seed-a'));
  const text = formatAsText(character);

  it('includes the character’s background, class and derived numbers', () => {
    expect(text).toContain(character.background.name);
    expect(text).toContain(character.characterClass.name);
    expect(text).toContain(`Hit Points: ${character.hitPoints}`);
    expect(text).toContain(`Armor Class: ${character.armorClassEquipped}`);
    expect(text).toContain(`Credits: ${character.credits}`);
  });

  it('includes each section heading', () => {
    for (const heading of ['Saving Throws', 'Focuses', 'Stats', 'Skills', 'Abilities']) {
      expect(text).toContain(heading);
    }
  });

  it('lists every stat with its score and modifier', () => {
    for (const stat of character.stats) {
      expect(text).toContain(`${stat.abbreviation} ${stat.score} (${stat.modifier})`);
    }
  });

  it('lists every skill at its level', () => {
    for (const skill of character.skills) {
      expect(text).toContain(`${skill.name}-${skill.level}`);
    }
  });

  it('omits the name line when the character is unnamed', () => {
    expect(character.firstName).toBe('');
    expect(text).not.toContain('Name: ');
  });

  it('includes the name line once a name is set', () => {
    const named = generate(new RNG.RNG('seed-a'));
    named.firstName = 'Ada';
    named.lastName = 'Reyes';

    expect(formatAsText(named)).toContain('Name: Ada Reyes');
  });

  it('omits effort when the character has none', () => {
    const mundane = charactersFrom(200).find((candidate) => candidate.effort === 0)!;

    expect(mundane).toBeDefined();
    expect(formatAsText(mundane)).not.toContain('Effort:');
  });

  it('includes effort when the character has some', () => {
    const psychic = charactersFrom(2000).find((candidate) => candidate.effort > 0)!;

    expect(psychic).toBeDefined();
    expect(formatAsText(psychic)).toContain(`Effort: ${psychic.effort}`);
  });

  it('is stable for a given character', () => {
    expect(formatAsText(character)).toBe(text);
  });
});
