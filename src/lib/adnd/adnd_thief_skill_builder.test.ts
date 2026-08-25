import { describe, expect, it } from 'vitest';
import { createAdndCharacter } from './adndcharacter.js';
import {
  applyThiefSkillAllocation,
  orderThiefSkillRows,
  getThiefSkillPointPool,
  prepareThiefSkillRowsForCharacter,
  thiefSkillBonusesAreValid,
} from './adnd_thief_skill_builder.js';
import human from './races/human.js';

describe('getThiefSkillPointPool', () => {
  it('is 60 for thief and 20 for bard', () => {
    expect(getThiefSkillPointPool('thief')).toBe(60);
    expect(getThiefSkillPointPool('bard')).toBe(20);
  });
});

describe('thiefSkillBonusesAreValid', () => {
  it('requires exact pool for thief', () => {
    const names = ['a', 'b'];
    expect(thiefSkillBonusesAreValid('thief', { a: 30, b: 30 }, names)).toBe(true);
    expect(thiefSkillBonusesAreValid('thief', { a: 30, b: 29 }, names)).toBe(false);
    expect(thiefSkillBonusesAreValid('thief', { a: 31, b: 29 }, names)).toBe(false);
  });

  it('uses 20 points for bard', () => {
    const names = ['Pick Pockets', 'Detect Noise', 'Climb Walls', 'Read Languages'];
    expect(
      thiefSkillBonusesAreValid(
        'bard',
        {
          'Pick Pockets': 5,
          'Detect Noise': 5,
          'Climb Walls': 5,
          'Read Languages': 5,
        },
        names,
      ),
    ).toBe(true);
  });
});

describe('applyThiefSkillAllocation', () => {
  it('writes one row per bard skill, carrying base and allocation apart', () => {
    const c = createAdndCharacter();
    c.race = human;
    c.dexterity = 13;
    c.abilities = [];

    applyThiefSkillAllocation(c, 'bard', {
      'Pick Pockets': 5,
      'Detect Noise': 5,
      'Climb Walls': 5,
      'Read Languages': 5,
    });

    expect(c.thiefSkills).toHaveLength(4);
    expect(c.thiefSkills.every((row) => row.points === 5)).toBe(true);
    // The allocation is readable as a decision, which is the whole reason it is a field.
    expect(c.thiefSkills.find((row) => row.name === 'Climb Walls')?.value).toBe(50);
    expect(c.abilities).toEqual([]);
  });

  it('gives a skill the user left alone a zero rather than dropping it', () => {
    const c = createAdndCharacter();
    c.race = human;
    c.dexterity = 13;

    applyThiefSkillAllocation(c, 'bard', { 'Pick Pockets': 20 });

    expect(c.thiefSkills).toHaveLength(4);
    expect(c.thiefSkills.filter((row) => row.points === 0)).toHaveLength(3);
  });
});

describe('orderThiefSkillRows', () => {
  it('restores the canonical order after the generator has shuffled', () => {
    const shuffled = [
      { name: 'Climb Walls', value: 50, points: 0 },
      { name: 'Pick Pockets', value: 10, points: 20 },
      { name: 'Read Languages', value: 5, points: 0 },
      { name: 'Detect Noise', value: 20, points: 0 },
    ];

    expect(orderThiefSkillRows('bard', shuffled).map((row) => row.name)).toEqual([
      'Pick Pockets',
      'Detect Noise',
      'Climb Walls',
      'Read Languages',
    ]);
  });

  it('does not disturb the values it reorders', () => {
    const rows = [
      { name: 'Climb Walls', value: 50, points: 7 },
      { name: 'Pick Pockets', value: 10, points: 13 },
      { name: 'Read Languages', value: 5, points: 0 },
      { name: 'Detect Noise', value: 20, points: 0 },
    ];

    const ordered = orderThiefSkillRows('bard', rows);

    expect(ordered.find((row) => row.name === 'Climb Walls')).toEqual({
      name: 'Climb Walls',
      value: 50,
      points: 7,
    });
  });
});

describe('prepareThiefSkillRowsForCharacter', () => {
  it('applies dexterity to thief bases', () => {
    const c = createAdndCharacter();
    c.race = human;
    c.dexterity = 18;
    const rows = prepareThiefSkillRowsForCharacter('thief', c);
    const pick = rows.find((r) => r.name === 'Pick Pockets');
    expect(pick).toBeDefined();
    expect(pick!.value).toBe(15 + 10);
  });
});
