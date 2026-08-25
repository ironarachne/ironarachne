import type { RNG } from '@ironarachne/rng';

export type ThiefSkillRow = {
  name: string;
  points: number;
  value: number;
};

/**
 * Deals `extraPoints` discretionary points across the skills, at most 30 into any one.
 *
 * The budget is exact. It did not used to be: the award was drawn against the per-skill headroom
 * alone and only then subtracted, so the last one spent whatever it liked and 86% of rolled
 * thieves and bards came out above their pool — by as much as 27 points on a budget of 60.
 * Clamping the draw to what is left is the whole fix, and it was made before AD&D characters
 * became storable, because after that the choice is between changing artifacts a user has kept
 * and leaving them permanently wrong.
 */
export function distributePoints(skillList: ThiefSkillRow[], extraPoints: number, rng: RNG) {
  while (extraPoints > 0) {
    const skillIndex = rng.int(0, skillList.length - 1);
    const skill = skillList[skillIndex];
    if (skill.points < 30) {
      const cap = Math.min(30 - skill.points, extraPoints);
      const points = rng.int(1, cap);
      skill.points += points;
      extraPoints -= points;
    }
  }

  return skillList;
}

export function modifyForDexterity(skillList: ThiefSkillRow[], dexterity: number) {
  const dexterityAdjustments: Record<number, Record<string, number>> = {
    9: {
      'Pick Pockets': -15,
      'Open Locks': -10,
      'Find/Remove Traps': -10,
      'Move Silently': -20,
      'Hide in Shadows': -10,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    10: {
      'Pick Pockets': -10,
      'Open Locks': -5,
      'Find/Remove Traps': -10,
      'Move Silently': -15,
      'Hide in Shadows': -5,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    11: {
      'Pick Pockets': -5,
      'Open Locks': 0,
      'Find/Remove Traps': -5,
      'Move Silently': -10,
      'Hide in Shadows': 0,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    12: {
      'Pick Pockets': 0,
      'Open Locks': 0,
      'Find/Remove Traps': 0,
      'Move Silently': -5,
      'Hide in Shadows': 0,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    13: {
      'Pick Pockets': 0,
      'Open Locks': 0,
      'Find/Remove Traps': 0,
      'Move Silently': 0,
      'Hide in Shadows': 0,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    14: {
      'Pick Pockets': 0,
      'Open Locks': 0,
      'Find/Remove Traps': 0,
      'Move Silently': 0,
      'Hide in Shadows': 0,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    15: {
      'Pick Pockets': 0,
      'Open Locks': 0,
      'Find/Remove Traps': 0,
      'Move Silently': 0,
      'Hide in Shadows': 0,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    16: {
      'Pick Pockets': 0,
      'Open Locks': 5,
      'Find/Remove Traps': 0,
      'Move Silently': 0,
      'Hide in Shadows': 0,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    17: {
      'Pick Pockets': 5,
      'Open Locks': 10,
      'Find/Remove Traps': 0,
      'Move Silently': 5,
      'Hide in Shadows': 5,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    18: {
      'Pick Pockets': 10,
      'Open Locks': 15,
      'Find/Remove Traps': 5,
      'Move Silently': 10,
      'Hide in Shadows': 10,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    19: {
      'Pick Pockets': 15,
      'Open Locks': 20,
      'Find/Remove Traps': 10,
      'Move Silently': 15,
      'Hide in Shadows': 15,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
  };

  for (let i = 0; i < skillList.length; i++) {
    skillList[i].value += dexterityAdjustments[dexterity][skillList[i].name];
  }

  return skillList;
}

export function modifyForRace(skillList: ThiefSkillRow[], raceName: string) {
  const racialAdjustments: Record<string, Record<string, number>> = {
    dwarf: {
      'Pick Pockets': 0,
      'Open Locks': 10,
      'Find/Remove Traps': 15,
      'Move Silently': 0,
      'Hide in Shadows': 0,
      'Detect Noise': 0,
      'Climb Walls': -10,
      'Read Languages': -5,
    },
    elf: {
      'Pick Pockets': 5,
      'Open Locks': -5,
      'Find/Remove Traps': 0,
      'Move Silently': 5,
      'Hide in Shadows': 10,
      'Detect Noise': 5,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    gnome: {
      'Pick Pockets': 0,
      'Open Locks': 5,
      'Find/Remove Traps': 10,
      'Move Silently': 5,
      'Hide in Shadows': 5,
      'Detect Noise': 10,
      'Climb Walls': -15,
      'Read Languages': 0,
    },
    halfling: {
      'Pick Pockets': 5,
      'Open Locks': 5,
      'Find/Remove Traps': 5,
      'Move Silently': 10,
      'Hide in Shadows': 15,
      'Detect Noise': 5,
      'Climb Walls': -15,
      'Read Languages': -5,
    },
    'half-elf': {
      'Pick Pockets': 10,
      'Open Locks': 0,
      'Find/Remove Traps': 0,
      'Move Silently': 0,
      'Hide in Shadows': 5,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
    human: {
      'Pick Pockets': 0,
      'Open Locks': 0,
      'Find/Remove Traps': 0,
      'Move Silently': 0,
      'Hide in Shadows': 0,
      'Detect Noise': 0,
      'Climb Walls': 0,
      'Read Languages': 0,
    },
  };

  for (let i = 0; i < skillList.length; i++) {
    skillList[i].value += racialAdjustments[raceName][skillList[i].name];
  }

  return skillList;
}
