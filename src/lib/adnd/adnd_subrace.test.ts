import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  adndRaceDisplayName,
  applyAdndSubrace,
  findAdndSubrace,
  pickAdndSubrace,
} from './adnd_subrace.js';
import { createAdndCharacter } from './adndcharacter.js';
import { generateCharacter } from './adndcharactergenerator.js';
import { getDefaultConfig } from './adndcharactergeneratorconfig.js';
import * as races from './races/races.js';
import { halflingSubraces } from './races/halfling_subraces.js';

const RACE_TABLE_NAMES = ['dwarf', 'elf', 'gnome', 'half-elf', 'halfling', 'human'];

describe('the shared race table', () => {
  /**
   * The regression #99 was filed for.
   *
   * `applyHalflingWithOptions` used to do `character.race.name = \`${subrace} halfling\``, and
   * because `races.getAll()` hands out singletons, that renamed the table for the rest of the
   * session: the builder could no longer find `halfling`, and a saved one came back with no racial
   * rules at all.
   */
  it('is never renamed by rolling characters', () => {
    for (let seed = 0; seed < 200; seed += 1) {
      generateCharacter(getDefaultConfig(new RNG(`table-${seed}`)));
    }

    expect(races.getAll().map((race) => race.name)).toEqual(RACE_TABLE_NAMES);
  });

  it('still resolves halfling after a halfling has been rolled', () => {
    let rolledAHalfling = false;
    for (let seed = 0; seed < 200 && !rolledAHalfling; seed += 1) {
      const character = generateCharacter(getDefaultConfig(new RNG(`lookup-${seed}`)));
      rolledAHalfling = character.race.name === 'halfling';
    }

    expect(rolledAHalfling).toBe(true);
    expect(races.getAll().some((race) => race.name === 'halfling')).toBe(true);
  });

  it('hands out the same objects each call, which is why the mutation mattered', () => {
    expect(races.getAll()[0]).toBe(races.getAll()[0]);
  });
});

describe('pickAdndSubrace', () => {
  it('draws nothing at all for a race with no varieties', () => {
    // Decision 7: not a discarded draw, no draw. A draw taken here would shift every roll after
    // it and rewrite the output of every existing seed for five of the six races.
    const rng = new RNG('no-draw');
    const before = rng.simple(100);

    const other = new RNG('no-draw');
    expect(pickAdndSubrace([], other)).toBeNull();
    expect(other.simple(100)).toBe(before);
  });

  it('draws one of the varieties a race has', () => {
    const picked = pickAdndSubrace(halflingSubraces, new RNG('pick'));

    expect(halflingSubraces).toContain(picked);
  });
});

describe('applyAdndSubrace', () => {
  it('records which variety was applied, on the character', () => {
    const character = createAdndCharacter();
    character.race = races.getAll().find((race) => race.name === 'halfling')!;

    applyAdndSubrace(character, halflingSubraces[2], new RNG('stout'));

    expect(character.subraceName).toBe('Stout');
    // and emphatically not on the race
    expect(character.race.name).toBe('halfling');
  });

  it('does nothing when there is no variety', () => {
    const character = createAdndCharacter();
    character.abilities = ['existing'];

    applyAdndSubrace(character, null, new RNG('none'));

    expect(character.subraceName).toBe('');
    expect(character.abilities).toEqual(['existing']);
  });
});

describe('findAdndSubrace', () => {
  it('resolves a variety within its race', () => {
    const halfling = races.getAll().find((race) => race.name === 'halfling')!;

    expect(findAdndSubrace(halfling, 'Stout')?.name).toBe('Stout');
  });

  it('does not resolve across races', () => {
    // The property `Stout halfling` as a bare string never had: a subrace name means nothing
    // without the race it belongs to, so two races may both have a "Grey" variety.
    const human = races.getAll().find((race) => race.name === 'human')!;

    expect(findAdndSubrace(human, 'Stout')).toBeNull();
  });

  it('returns null for a variety this build does not have', () => {
    const halfling = races.getAll().find((race) => race.name === 'halfling')!;

    expect(findAdndSubrace(halfling, 'Furfoot')).toBeNull();
  });
});

describe('adndRaceDisplayName', () => {
  it('composes the variety and the race', () => {
    expect(adndRaceDisplayName({ race: { name: 'halfling' }, subraceName: 'Stout' })).toBe(
      'Stout halfling',
    );
  });

  it('is just the race when there is no variety', () => {
    expect(adndRaceDisplayName({ race: { name: 'human' }, subraceName: '' })).toBe('human');
  });

  it('matches what the old name mutation produced', () => {
    // The accessor exists to replace that mutation, so it had better read the same.
    for (const subrace of halflingSubraces) {
      expect(adndRaceDisplayName({ race: { name: 'halfling' }, subraceName: subrace.name })).toBe(
        `${subrace.name} halfling`,
      );
    }
  });
});

describe('rolled halflings', () => {
  it('carry a variety as a field', () => {
    for (let seed = 0; seed < 300; seed += 1) {
      const character = generateCharacter(getDefaultConfig(new RNG(`golden-${seed}`)));
      if (character.race.name !== 'halfling') continue;

      expect(halflingSubraces.map((subrace) => subrace.name)).toContain(character.subraceName);
      return;
    }
    throw new Error('no halfling in range');
  });

  it('leaves every other race without one', () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const character = generateCharacter(getDefaultConfig(new RNG(`others-${seed}`)));
      if (character.race.name === 'halfling') continue;

      expect(character.subraceName).toBe('');
    }
  });
});
