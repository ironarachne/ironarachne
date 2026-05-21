import { describe, expect, it } from 'vitest';
import ADNDCharacter from './adndcharacter.js';
import {
  appendThiefSkillAbilityLines,
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

describe('appendThiefSkillAbilityLines', () => {
  it('adds one ability line per bard skill', () => {
    const c = new ADNDCharacter();
    c.race = human;
    c.dexterity = 13;
    c.abilities = [];
    const b = {
      'Pick Pockets': 5,
      'Detect Noise': 5,
      'Climb Walls': 5,
      'Read Languages': 5,
    };
    appendThiefSkillAbilityLines(c, 'bard', b);
    expect(c.abilities).toHaveLength(4);
    expect(c.abilities.every((line) => /%$/.test(line))).toBe(true);
  });
});

describe('prepareThiefSkillRowsForCharacter', () => {
  it('applies dexterity to thief bases', () => {
    const c = new ADNDCharacter();
    c.race = human;
    c.dexterity = 18;
    const rows = prepareThiefSkillRowsForCharacter('thief', c);
    const pick = rows.find((r) => r.name === 'Pick Pockets');
    expect(pick).toBeDefined();
    expect(pick!.value).toBe(15 + 10);
  });
});
