import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  adndBuildFromSnapshot,
  adndBuildMatchesBase,
  adndBuildWouldRederive,
  adndClassOptionsForBuild,
  adndRaceOptionsForBuild,
  buildAdndCharacter,
  createAdndCharacterBuild,
  type AdndCharacterBuild,
} from './adnd_character_build.js';
import { rollAdndCharacter } from './adnd_character_roll.js';
import { toAdndCharacterSnapshot } from './adnd_character_snapshot.js';
import type { AdndCharacterSnapshot } from './adnd_character_snapshot.js';

/** A generated character of a given shape, as a snapshot ready to be edited. */
function generatedSnapshot(
  predicate: (snapshot: AdndCharacterSnapshot) => boolean = () => true,
  config: { includeProficiencies?: boolean; includeKits?: boolean } = {},
): AdndCharacterSnapshot {
  for (let seed = 0; seed < 400; seed += 1) {
    const snapshot = toAdndCharacterSnapshot(rollAdndCharacter(`build-${seed}`, config).character);
    if (predicate(snapshot)) {
      return snapshot;
    }
  }
  throw new Error('no seed produced a matching character');
}

function composedBuild(): AdndCharacterBuild {
  const build = createAdndCharacterBuild('feature-seed');
  build.attributes = {
    strength: 14,
    dexterity: 15,
    constitution: 13,
    intelligence: 12,
    wisdom: 11,
    charisma: 10,
  };
  build.raceName = 'human';
  build.className = 'thief';
  build.alignment = 'neutral good';
  build.hp = 5;
  build.startingWealthCp = 5000;
  build.thiefSkillPoints = {
    'Pick Pockets': 30,
    'Open Locks': 30,
    'Find/Remove Traps': 0,
    'Move Silently': 0,
    'Hide in Shadows': 0,
    'Detect Noise': 0,
    'Climb Walls': 0,
    'Read Languages': 0,
  };
  return build;
}

describe('buildAdndCharacter, composing from nothing', () => {
  it('derives a character from the form alone', () => {
    const character = buildAdndCharacter(composedBuild());

    expect(character).not.toBeNull();
    expect(character?.race.name).toBe('human');
    expect(character?.class.name).toBe('thief');
    expect(character?.hp).toBe(5);
  });

  it('is null until the form says enough to make a character', () => {
    expect(buildAdndCharacter(createAdndCharacterBuild('seed'))).toBeNull();

    const noAlignment = composedBuild();
    noAlignment.alignment = '';
    expect(buildAdndCharacter(noAlignment)).toBeNull();
  });

  it('carries the user allocation onto the character', () => {
    const character = buildAdndCharacter(composedBuild());

    const pickPockets = character?.thiefSkills.find((row) => row.name === 'Pick Pockets');
    expect(pickPockets?.points).toBe(30);
  });

  it('derives the same character twice from the same build', () => {
    expect(buildAdndCharacter(composedBuild())).toEqual(buildAdndCharacter(composedBuild()));
  });

  it('leaves the purse as funds minus what the gear cost', () => {
    const build = composedBuild();
    build.selectedWeaponNames = ['dagger'];

    const character = buildAdndCharacter(build);

    expect(character?.currency).toBeLessThan(5000);
    expect(character?.weapons.map((weapon) => weapon.name)).toEqual(['dagger']);
  });
});

describe('buildAdndCharacter, editing a saved character', () => {
  it('keeps what the builder does not model', () => {
    // The whole reason `base` exists. A generated character carries rolled proficiencies and a
    // kit that no form field represents; deriving on open would discard them silently, which is
    // requirement 4.2 failing before the user has touched anything.
    const snapshot = generatedSnapshot(
      (s) => s.weaponProficiencyGroups.length > 0 && s.kit !== null,
      { includeProficiencies: true, includeKits: true },
    );
    const build = adndBuildFromSnapshot(snapshot, 'fresh-seed');

    const character = buildAdndCharacter(build);

    expect(character?.weaponProficiencyGroups).toEqual(snapshot.weaponProficiencyGroups);
    expect(character?.nonweaponProficiencies).toEqual(snapshot.nonweaponProficiencies);
    expect(character?.kit).toEqual(snapshot.kit);
  });

  it('keeps hand-edited derived numbers rather than recomputing them', () => {
    const snapshot = generatedSnapshot();
    snapshot.thaco = 4;
    snapshot.poisonSavingThrow = 2;
    snapshot.systemShock = 99;
    const build = adndBuildFromSnapshot(snapshot, 'fresh-seed');

    const character = buildAdndCharacter(build);

    expect(character?.thaco).toBe(4);
    expect(character?.poisonSavingThrow).toBe(2);
    expect(character?.systemShock).toBe(99);
  });

  it('opens without changing anything', () => {
    // Reading a character in and building it straight back out must be the identity, or opening
    // an artifact would mark it dirty before the user did anything.
    const snapshot = generatedSnapshot((s) => s.thiefSkills.length > 0);
    const build = adndBuildFromSnapshot(snapshot, 'fresh-seed');

    const rebuilt = buildAdndCharacter(build);

    expect(toAdndCharacterSnapshot(rebuilt!)).toEqual(snapshot);
  });

  it('applies an edit to a field the builder does own', () => {
    const snapshot = generatedSnapshot();
    const build = adndBuildFromSnapshot(snapshot, 'fresh-seed');
    build.firstName = 'Aldric';
    build.hp = 9;

    const character = buildAdndCharacter(build);

    expect(character?.firstName).toBe('Aldric');
    expect(character?.hp).toBe(9);
    // and still keeps everything else
    expect(character?.thaco).toBe(snapshot.thaco);
  });

  it('re-derives once a structural field changes', () => {
    const snapshot = generatedSnapshot(
      (s) => s.weaponProficiencyGroups.length > 0 && s.raceName === 'human',
      { includeProficiencies: true },
    );
    const build = adndBuildFromSnapshot(snapshot, 'fresh-seed');
    build.className = 'fighter';
    build.alignment = 'true neutral';

    const character = buildAdndCharacter(build);

    // Deriving is destructive by nature, and that is what `adndBuildWouldRederive` warns about.
    expect(character?.class.name).toBe('fighter');
    expect(character?.weaponProficiencyGroups).toEqual([]);
  });
});

describe('adndBuildMatchesBase', () => {
  it('is false with no base, because there is nothing to match', () => {
    expect(adndBuildMatchesBase(composedBuild())).toBe(false);
    expect(adndBuildWouldRederive(composedBuild())).toBe(false);
  });

  it('is true for a build read straight from a snapshot', () => {
    const build = adndBuildFromSnapshot(generatedSnapshot(), 'seed');

    expect(adndBuildMatchesBase(build)).toBe(true);
    expect(adndBuildWouldRederive(build)).toBe(false);
  });

  it.each([
    ['race', (b: AdndCharacterBuild) => (b.raceName = 'dwarf')],
    ['class', (b: AdndCharacterBuild) => (b.className = 'fighter')],
    ['an attribute', (b: AdndCharacterBuild) => (b.attributes.strength += 1)],
  ])('reports a change of %s as structural', (_label, mutate) => {
    const build = adndBuildFromSnapshot(generatedSnapshot(), 'seed');
    mutate(build);

    expect(adndBuildMatchesBase(build)).toBe(false);
    expect(adndBuildWouldRederive(build)).toBe(true);
  });

  it.each([
    ['hit points', (b: AdndCharacterBuild) => (b.hp = 12)],
    ['a name', (b: AdndCharacterBuild) => (b.firstName = 'Aldric')],
    ['alignment', (b: AdndCharacterBuild) => (b.alignment = 'chaotic evil')],
    ['funds', (b: AdndCharacterBuild) => (b.startingWealthCp = 999)],
  ])('does not report a change of %s as structural', (_label, mutate) => {
    const build = adndBuildFromSnapshot(generatedSnapshot(), 'seed');
    mutate(build);

    expect(adndBuildMatchesBase(build)).toBe(true);
    expect(adndBuildWouldRederive(build)).toBe(false);
  });
});

describe('adndBuildFromSnapshot', () => {
  it('recovers starting funds as the purse plus what the gear cost', () => {
    const snapshot = generatedSnapshot((s) => s.weapons.length > 0);
    const spent = [...snapshot.weapons, ...snapshot.armor].reduce((sum, i) => sum + i.cost, 0);

    const build = adndBuildFromSnapshot(snapshot, 'seed');

    expect(build.startingWealthCp).toBe(snapshot.currency + spent);
  });

  it('recovers the thief allocation exactly', () => {
    const snapshot = generatedSnapshot((s) => s.thiefSkills.length > 0);

    const build = adndBuildFromSnapshot(snapshot, 'seed');

    for (const row of snapshot.thiefSkills) {
      expect(build.thiefSkillPoints[row.name]).toBe(row.points);
    }
  });

  it('takes the class features seed from the caller, not the payload', () => {
    expect(adndBuildFromSnapshot(generatedSnapshot(), 'given-seed').classFeaturesSeed).toBe(
      'given-seed',
    );
  });
});

describe('the options a build offers', () => {
  it('offers no races until attributes are rolled', () => {
    expect(adndRaceOptionsForBuild(createAdndCharacterBuild('seed'))).toEqual([]);
  });

  it('offers races the attributes qualify for', () => {
    const names = adndRaceOptionsForBuild(composedBuild()).map((race) => race.name);

    expect(names).toContain('human');
  });

  it('offers only classes the race allows', () => {
    const build = composedBuild();
    build.raceName = 'dwarf';

    const names = adndClassOptionsForBuild(build).map((cls) => cls.name);

    expect(names.length).toBeGreaterThan(0);
    expect(names).not.toContain('bard');
  });

  it('offers no classes before a race is chosen', () => {
    const build = composedBuild();
    build.raceName = '';

    expect(adndClassOptionsForBuild(build)).toEqual([]);
  });
});

describe('a placeholder class from a build this build does not know', () => {
  it('does not derive from a rule it cannot describe', () => {
    // An inert placeholder has no `apply` worth running and no alignments to offer. Patching is
    // safe because it touches only the fields the builder owns; deriving would produce a
    // character built from an empty rule.
    const snapshot = generatedSnapshot();
    snapshot.className = 'bladesinger';
    const build = adndBuildFromSnapshot(snapshot, 'seed');

    const patched = buildAdndCharacter(build);

    expect(patched?.class.name).toBe('bladesinger');
    expect(patched?.thaco).toBe(snapshot.thaco);

    build.className = 'also-not-real';
    expect(buildAdndCharacter(build)).toBeNull();
  });
});

describe('createAdndCharacterBuild', () => {
  it('starts with no base, which is what composing from nothing means', () => {
    const build = createAdndCharacterBuild('seed');

    expect(build.base).toBeNull();
    expect(build.classFeaturesSeed).toBe('seed');
  });

  it('is not affected by an RNG, being a plain record', () => {
    const rng = new RNG('unused');
    expect(rng).toBeDefined();
    expect(createAdndCharacterBuild('a')).toEqual(createAdndCharacterBuild('a'));
  });
});
