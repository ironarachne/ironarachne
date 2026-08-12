import type {
  BonusFocus,
  BonusHP,
  BonusSkill,
  BonusSkillFromList,
  BonusSkillOfType,
  EffortAbility,
  Focus,
  FocusEffect,
  InnateAC,
  SpecialAbility,
} from './character';

/**
 * Constructors for the effects a class, background or focus grants a character, and for a focus
 * itself.
 *
 * They live here rather than in `character.ts` so `focus_data.ts` can build its table from them
 * without the two modules importing each other at runtime. The types still come from
 * `character.ts`, but `import type` is erased, so no cycle survives to run time.
 */
export function createBonusSkill(skillName: string): BonusSkill {
  return {
    kind: 'bonusSkill',
    skillName,
    description: `Bonus skill: ${skillName}`,
  };
}

export function createBonusSkillFromList(skills: string[]): BonusSkillFromList {
  return {
    kind: 'bonusSkillFromList',
    skills,
    description: `a bonus skill from the list: ${skills.join(',')}`,
  };
}

export function createBonusSkillOfType(skillTypes: string[]): BonusSkillOfType {
  return {
    kind: 'bonusSkillOfType',
    skillTypes,
    description: `Bonus skill of types: ${skillTypes.join(',')}`,
  };
}

export function createBonusHP(amount: number): BonusHP {
  return {
    kind: 'bonusHP',
    amount,
    description: `Bonus HP: ${amount}`,
  };
}

export function createInnateAC(ac: number): InnateAC {
  return {
    kind: 'innateAC',
    ac,
    description: `Innate AC: ${ac}`,
  };
}

export function createBonusFocus(focusTypes: string[]): BonusFocus {
  return {
    kind: 'bonusFocus',
    focusTypes,
    description: `a bonus focus of the type(s): ${focusTypes.join(',')}`,
  };
}

export function createSpecialAbility(description: string): SpecialAbility {
  return { kind: 'specialAbility', description };
}

export function createEffortAbility(): EffortAbility {
  return { kind: 'effortAbility', description: 'adds the Effort stat' };
}

export function createFocus(
  name: string,
  focusType: string,
  levelOneDescription: string,
  levelOneEffect: FocusEffect,
  levelTwoDescription: string,
): Focus {
  return {
    name,
    focusType,
    currentLevel: 1,
    levelOneDescription,
    levelOneEffect,
    levelTwoDescription,
  };
}
