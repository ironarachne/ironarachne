import { describe, expect, it } from 'vitest';
import * as RNG from '@ironarachne/rng';
import {
  createAssetTemplate,
  createAssetType,
  createCareer,
  createOrigin,
  createSkill,
  createStatBlock,
  createUpgrade,
  createUpgradeWithExtras,
  createUwCharacter,
  createWorkspace,
  formatAsText,
  generate,
} from './character';

const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function charactersFrom(count: number) {
  return Array.from({ length: count }, (_, i) => generate(new RNG.RNG('seed-' + i)));
}

describe('generate', () => {
  it('is deterministic for a given seed', () => {
    expect(generate(new RNG.RNG('uw'))).toEqual(generate(new RNG.RNG('uw')));
  });

  it('produces different characters for different seeds', () => {
    const descriptors = new Set(charactersFrom(10).map((character) => character.descriptors));

    expect(descriptors.size).toBeGreaterThan(1);
  });

  it('returns a fully populated character', () => {
    for (const seed of seeds) {
      const character = generate(new RNG.RNG(seed));

      expect(character.origin.name.length).toBeGreaterThan(0);
      expect(character.workspace.name.length).toBeGreaterThan(0);
      expect(character.advancement.length).toBeGreaterThan(0);
      expect(character.descriptors.length).toBeGreaterThan(0);
      expect(character.firstName).toBe('');
      expect(character.lastName).toBe('');
    }
  });

  it('gives every character exactly two careers', () => {
    for (const character of charactersFrom(30)) {
      expect(character.careers).toHaveLength(2);
      expect(character.careers[0].name).not.toBe(character.careers[1].name);
    }
  });

  it('spreads the stat array 2/1/1/0/-1 across the five stats', () => {
    for (const character of charactersFrom(30)) {
      const stats = [
        character.stats.physique,
        character.stats.mettle,
        character.stats.expertise,
        character.stats.influence,
        character.stats.interface,
      ];

      expect([...stats].sort((a, b) => a - b)).toEqual([-1, 0, 1, 1, 2]);
    }
  });

  it('takes three skills from the careers and one more from the origin', () => {
    for (const character of charactersFrom(30)) {
      expect(character.skills).toHaveLength(4);

      const careerSkillNames = character.careers
        .flatMap((career) => career.skills)
        .map((skill) => skill.name);
      const fromCareers = character.skills.filter((skill) => careerSkillNames.includes(skill.name));

      expect(fromCareers.length).toBeGreaterThanOrEqual(3);

      for (const skill of character.skills) {
        expect(skill.name.length).toBeGreaterThan(0);
        expect(skill.description.length).toBeGreaterThan(0);
      }
    }
  });

  it('draws the workspace from one of the two careers', () => {
    for (const character of charactersFrom(30)) {
      const workspaceNames = character.careers
        .flatMap((career) => career.workspaces)
        .map((workspace) => workspace.name);

      expect(workspaceNames).toContain(character.workspace.name);
    }
  });

  it('draws the advancement from one of the two careers', () => {
    for (const character of charactersFrom(30)) {
      const advancements = character.careers.flatMap((career) => career.advancements);

      expect(advancements).toContain(character.advancement);
    }
  });

  it('gives every asset a type and a class', () => {
    for (const character of charactersFrom(30)) {
      expect(character.assets.length).toBeGreaterThan(0);

      for (const asset of character.assets) {
        expect(asset.name.length).toBeGreaterThan(0);
        expect(asset.type.name.length).toBeGreaterThan(0);
        expect(asset.assetClass).toBeGreaterThanOrEqual(0);
        expect(asset.assetClass).toBeLessThanOrEqual(3);
      }
    }
  });

  // Four skills each grant a matching class 3 asset. Over enough seeds at least
  // one character draws each, which is the only way these branches run.
  it('grants a class 3 asset to the skills that call for one', () => {
    const granted = new Map([
      ['Custom Flyer', 'Flyer'],
      ['Custom Vehicle', 'Land Vehicle'],
      ['Leadership', 'Crew'],
    ]);

    for (const character of charactersFrom(200)) {
      for (const [skillName, assetName] of granted) {
        if (character.skills.some((skill) => skill.name === skillName)) {
          expect(
            character.assets.some(
              (asset) => asset.name.includes(assetName) && asset.assetClass === 3,
            ),
          ).toBe(true);
        }
      }

      if (character.skills.some((skill) => skill.name === 'Unique Weapon')) {
        expect(
          character.assets.some(
            (asset) =>
              (asset.name.includes('Firearm') || asset.name.includes('Heavy Weapon')) &&
              asset.assetClass === 3,
          ),
        ).toBe(true);
      }
    }
  });
});

describe('createUwCharacter', () => {
  it('starts blank apart from what it is handed', () => {
    const source = generate(new RNG.RNG('seed-a'));
    const fresh = createUwCharacter(source.stats, source.careers, source.origin, source.workspace);

    expect(fresh.stats).toBe(source.stats);
    expect(fresh.careers).toBe(source.careers);
    expect(fresh.origin).toBe(source.origin);
    expect(fresh.workspace).toBe(source.workspace);
    expect(fresh.descriptors).toBe('');
    expect(fresh.advancement).toBe('');
    expect(fresh.skills).toEqual([]);
    expect(fresh.assets).toEqual([]);
    expect(fresh.firstName).toBe('');
    expect(fresh.lastName).toBe('');
  });
});

describe('createStatBlock', () => {
  it('starts every stat at zero', () => {
    expect(createStatBlock()).toEqual({
      physique: 0,
      mettle: 0,
      expertise: 0,
      influence: 0,
      interface: 0,
    });
  });
});

describe('createUpgrade', () => {
  it('defaults extraUpgrades to zero', () => {
    expect(createUpgrade('Armored', 'It is armored.').extraUpgrades).toBe(0);
  });

  it('takes an explicit extraUpgrades count', () => {
    const upgrade = createUpgradeWithExtras('Modular', 'It is modular.', 2);

    expect(upgrade.name).toBe('Modular');
    expect(upgrade.description).toBe('It is modular.');
    expect(upgrade.extraUpgrades).toBe(2);
  });
});

describe('formatAsText', () => {
  const character = generate(new RNG.RNG('seed-a'));
  const text = formatAsText(character);

  it('includes every section header', () => {
    for (const header of [
      'Uncharted Worlds Character',
      'Statistics',
      'Careers',
      'Skills',
      'Assets',
    ]) {
      expect(text).toContain(header);
    }
  });

  it('signs positive and zero stats with a plus', () => {
    const positive = formatAsText({
      ...character,
      stats: { physique: 2, mettle: 0, expertise: -1, influence: 1, interface: 0 },
    });

    expect(positive).toContain('Physique: +2');
    expect(positive).toContain('Mettle: +0');
    expect(positive).toContain('Expertise: -1');
  });

  it('names the origin, the advancement and every career', () => {
    expect(text).toContain(`Origin: ${character.origin.name}`);
    expect(text).toContain(`Advancement: ${character.advancement}`);

    for (const career of character.careers) {
      expect(text).toContain(career.name);
    }
  });

  it('lists every skill and asset with its description', () => {
    for (const skill of character.skills) {
      expect(text).toContain(skill.description);
    }

    for (const asset of character.assets) {
      expect(text).toContain(asset.description);

      for (const upgrade of asset.upgrades) {
        expect(text).toContain(`${upgrade.name}: ${upgrade.description}`);
      }
    }
  });

  it('omits the name line until the character is named', () => {
    expect(text).not.toContain('Name:');
    expect(formatAsText({ ...character, firstName: 'Vela', lastName: 'Rook' })).toContain(
      'Name: Vela Rook',
    );
  });
});

// The library's own content is written as literals in the *_data.ts modules, so these
// constructors are exercised only by callers building content of their own. They are still part
// of the public API, so they are tested directly rather than incidentally.
describe('content constructors', () => {
  it('builds a skill and a workspace from a name and description', () => {
    expect(createSkill('Scapegoat', 'Blame someone else.')).toEqual({
      name: 'Scapegoat',
      description: 'Blame someone else.',
    });
    expect(createWorkspace('Medical', 'Sterile environment.')).toEqual({
      name: 'Medical',
      description: 'Sterile environment.',
    });
  });

  it('builds an origin carrying its descriptors and skills', () => {
    const skill = createSkill('Cutting Edge', 'New technology comes naturally.');
    const origin = createOrigin('Advanced', ['Angular', 'Robust'], [skill]);

    expect(origin.name).toBe('Advanced');
    expect(origin.descriptors).toEqual(['Angular', 'Robust']);
    expect(origin.skills).toEqual([skill]);
  });

  it('builds a career carrying its workspaces, advancements, and skills', () => {
    const workspace = createWorkspace('Research', 'Laboratory.');
    const skill = createSkill('Education', 'Teach an ally.');
    const career = createCareer('Academic', ['Thin'], [workspace], ['A lesson lands.'], [skill]);

    expect(career).toEqual({
      name: 'Academic',
      descriptors: ['Thin'],
      workspaces: [workspace],
      advancements: ['A lesson lands.'],
      skills: [skill],
    });
  });

  it('builds an asset template carrying its types, common traits, and upgrades', () => {
    const type = createAssetType('Rugged', 'Crude, patched, aged and worn.');
    const trait = createUpgrade('Tough', 'Hard to damage.');
    const upgrade = createUpgrade('Armored', '+2 Armor.');
    const template = createAssetTemplate('Attire', [type], [trait], [upgrade]);

    expect(template).toEqual({
      name: 'Attire',
      types: [type],
      commonTraits: [trait],
      upgrades: [upgrade],
    });
  });
});
