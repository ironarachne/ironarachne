import * as RNG from '@ironarachne/rng';
import * as Dice from '$lib/dice';
import * as Text from '$lib/format';
import { PSYCHIC_DISCIPLINE_POWERS } from './psychic_discipline_data';
import { FOCUSES } from './focus_data';
import {
  createBonusFocus,
  createBonusHP,
  createBonusSkill,
  createBonusSkillFromList,
  createBonusSkillOfType,
  createEffortAbility,
  createFocus,
  createInnateAC,
  createSpecialAbility,
} from './character_effects';

// The effect constructors moved to `character_effects.ts` so the focus table could be split out
// without the two modules importing each other. They stay part of this module's public surface.
export {
  createBonusFocus,
  createBonusHP,
  createBonusSkill,
  createBonusSkillFromList,
  createBonusSkillOfType,
  createEffortAbility,
  createFocus,
  createInnateAC,
  createSpecialAbility,
} from './character_effects';

export type SWNCharacter = {
  stats: Stat[];
  background: Background;
  skills: Skill[];
  focuses: Focus[];
  characterClass: CharacterClass;
  currentLevel: number;
  attackBonus: number;
  rangedAttackBonus: number;
  meleeAttackBonus: number;
  hitPoints: number;
  abilities: ClassAbility[];
  effort: number;
  equipment: (Container | MiscItem)[];
  rangedWeapons: Weapon[];
  meleeWeapons: Weapon[];
  armor: Armor[];
  armorClassBase: number;
  armorClassUnequipped: number;
  armorClassEquipped: number;
  credits: number;
  savingThrowMental: number;
  savingThrowEvasion: number;
  savingThrowPhysical: number;
  firstName: string;
  lastName: string;
};

export function createSwnCharacter(rng: RNG.RNG): SWNCharacter {
  return {
    stats: randomStats(rng),
    background: randomBackground(rng),
    skills: [],
    focuses: [],
    characterClass: randomClass(rng),
    currentLevel: 1,
    attackBonus: 0,
    rangedAttackBonus: -2,
    meleeAttackBonus: -2,
    hitPoints: 0,
    abilities: [],
    effort: 0,
    equipment: [],
    rangedWeapons: [],
    meleeWeapons: [],
    armor: [],
    armorClassBase: 10,
    armorClassUnequipped: 10,
    armorClassEquipped: 10,
    credits: 0,
    savingThrowMental: 0,
    savingThrowEvasion: 0,
    savingThrowPhysical: 0,
    firstName: '',
    lastName: '',
  };
}

export function equipmentList(character: SWNCharacter): string[] {
  return character.equipment.map((item) => item.name);
}

/** A character's modifier for one stat, or 0 if they somehow lack it. */
function statModifier(character: SWNCharacter, abbreviation: string): number {
  const stat = character.stats.find((s) => s.abbreviation === abbreviation);

  return stat ? stat.modifier : 0;
}

/** A saving throw is 15 minus the better of its two governing stats. */
function applySavingThrows(character: SWNCharacter): void {
  character.savingThrowMental =
    15 - Math.max(statModifier(character, 'WIS'), statModifier(character, 'CHA'));
  character.savingThrowEvasion =
    15 - Math.max(statModifier(character, 'INT'), statModifier(character, 'DEX'));
  character.savingThrowPhysical =
    15 - Math.max(statModifier(character, 'STR'), statModifier(character, 'CON'));
}

/** Melee uses the better of DEX and STR; ranged always uses DEX. */
function applyAttackBonuses(character: SWNCharacter, skill: Skill): void {
  if (skill.name === 'Stab') {
    character.meleeAttackBonus =
      skill.level +
      character.attackBonus +
      Math.max(statModifier(character, 'DEX'), statModifier(character, 'STR'));
  } else if (skill.name === 'Shoot') {
    character.rangedAttackBonus =
      skill.level + character.attackBonus + statModifier(character, 'DEX');
  }
}

/**
 * A psychic skill grants its discipline's signature power at the level the character has it.
 * At level 1 the character also learns one random ability from the same discipline, and a
 * metapsion's maximum Effort goes up.
 */
function applyPsychicDiscipline(character: SWNCharacter, skill: Skill, rng: RNG.RNG): void {
  const power = PSYCHIC_DISCIPLINE_POWERS.find((entry) => entry.skillName === skill.name);

  if (power === undefined) {
    return;
  }

  if (skill.level === 0) {
    character.abilities.push(createSpecialAbility(power.levelZero));

    return;
  }

  if (skill.level !== 1) {
    return;
  }

  character.abilities.push(createSpecialAbility(power.levelOne));

  if (power.raisesMaximumEffort) {
    character.effort++;
  }

  const ability = randomPsionicAbilityOfDiscipline(skill.name, rng);

  character.abilities.push(createSpecialAbility(`${ability.name}: ${ability.description}`));
}

export function generate(rng: RNG.RNG): SWNCharacter {
  const character = createSwnCharacter(rng);

  applySavingThrows(character);

  character.skills = randomStartingSkills(character.background, rng);

  const equipmentPackage = getEquipmentPackage(character.background.equipmentPackage);

  for (const item of equipmentPackage.items) {
    applyEquipmentItem(item, character);
  }

  const dexterity = statModifier(character, 'DEX');

  character.armorClassUnequipped = character.armorClassUnequipped + dexterity;
  character.armorClassEquipped = character.armorClassEquipped + dexterity;

  character.attackBonus = character.characterClass.attackBonus;
  character.hitPoints =
    Dice.roll(character.characterClass.hitPointRoll, rng) + statModifier(character, 'CON');

  character.focuses.push(randomNonPsychicFocus(rng));

  for (const ability of character.characterClass.abilities) {
    applyCharacterEffect(ability, character, rng);
  }

  for (const focus of character.focuses) {
    applyFocus(focus, character, rng);
  }

  applyCharacterEffect(createBonusSkillOfType(['non-combat', 'combat']), character, rng);

  for (const skill of character.skills) {
    applyAttackBonuses(character, skill);
    applyPsychicDiscipline(character, skill, rng);
  }

  return character;
}

// Every effect a focus or a class ability can have on a character. Each one
// carries a `kind`, and applyCharacterEffect below is the single place that
// dispatches on it — the replacement for the `addTo` method each of these
// used to define.
export type BonusSkill = {
  kind: 'bonusSkill';
  skillName: string;
  description: string;
};

export type BonusSkillFromList = {
  kind: 'bonusSkillFromList';
  skills: string[];
  description: string;
};

export type BonusSkillOfType = {
  kind: 'bonusSkillOfType';
  skillTypes: string[];
  description: string;
};

export type BonusHP = {
  kind: 'bonusHP';
  amount: number;
  description: string;
};

export type InnateAC = {
  kind: 'innateAC';
  ac: number;
  description: string;
};

export type BonusFocus = {
  kind: 'bonusFocus';
  focusTypes: string[];
  description: string;
};

export type SpecialAbility = {
  kind: 'specialAbility';
  description: string;
};

export type EffortAbility = {
  kind: 'effortAbility';
  description: string;
};

/** What a focus grants at level one. */
export type FocusEffect = BonusSkill | BonusSkillFromList | BonusSkillOfType | BonusHP | InnateAC;

/** What a character class grants, and what ends up in `character.abilities`. */
export type ClassAbility = BonusFocus | BonusSkillOfType | SpecialAbility | EffortAbility;

export type CharacterEffect = FocusEffect | ClassAbility;

export function applyCharacterEffect(
  effect: CharacterEffect,
  character: SWNCharacter,
  rng: RNG.RNG,
): void {
  switch (effect.kind) {
    case 'bonusSkill':
      raiseOrAddSkill(character, getSkillByName(effect.skillName));
      return;
    case 'bonusSkillFromList':
      raiseOrAddSkill(character, getSkillByName(rng.item(effect.skills)));
      return;
    case 'bonusSkillOfType':
      raiseOrAddSkill(character, randomSkillOfType(rng.item(effect.skillTypes), rng));
      return;
    case 'bonusHP':
      character.hitPoints += effect.amount;
      return;
    case 'innateAC':
      if (character.armorClassBase < effect.ac) {
        character.armorClassBase = effect.ac;
      }
      return;
    case 'bonusFocus':
      applyBonusFocus(effect, character, rng);
      return;
    case 'specialAbility':
      character.abilities.push(effect);
      return;
    case 'effortAbility':
      applyEffortAbility(character);
      return;
  }
}

/** Raises the level of a skill the character already has, or grants it anew. */
function raiseOrAddSkill(character: SWNCharacter, skill: Skill): void {
  let skillAddressed = false;

  for (let j = 0; j < character.skills.length; j++) {
    if (character.skills[j].name === skill.name) {
      character.skills[j].level++;
      skillAddressed = true;
    }
  }

  if (!skillAddressed) {
    character.skills.push(skill);
  }
}

function applyBonusFocus(effect: BonusFocus, character: SWNCharacter, rng: RNG.RNG): void {
  const newFocusType = rng.item(effect.focusTypes);
  const newFocus = randomFocusOfType(newFocusType, rng);

  if (character.focuses[0].name === newFocus.name) {
    character.focuses[0].currentLevel = 2;
  } else {
    newFocus.currentLevel = 1;
    character.focuses.push(newFocus);
  }
}

function applyEffortAbility(character: SWNCharacter): void {
  character.effort = 1;
  let maxStat = -2;

  for (let i = 0; i < character.stats.length; i++) {
    if (character.stats[i].abbreviation === 'CON' || character.stats[i].abbreviation === 'WIS') {
      if (character.stats[i].modifier > maxStat) {
        maxStat = character.stats[i].modifier;
      }
    }
  }

  character.effort += maxStat;
}

export type Focus = {
  name: string;
  focusType: string;
  currentLevel: number;
  levelOneDescription: string;
  levelOneEffect: FocusEffect;
  levelTwoDescription: string;
};

export function applyFocus(focus: Focus, character: SWNCharacter, rng: RNG.RNG): void {
  character.abilities.push(
    createSpecialAbility(`From Focus ${focus.name}: ${focus.levelOneEffect.description}`),
  );
  applyCharacterEffect(focus.levelOneEffect, character, rng);
}

/**
 * Every focus. The returned array is shared and must not be mutated. See `FOCUSES`.
 */
function allFocuses(): Focus[] {
  return FOCUSES;
}

function randomBackground(rng: RNG.RNG) {
  const backgrounds = allBackgrounds();

  return rng.item(backgrounds);
}

export type CharacterClass = {
  name: string;
  attackBonus: number;
  hitPointRoll: string;
  abilities: ClassAbility[];
};

export function createCharacterClass(
  name: string,
  attackBonus: number,
  hitPointRoll: string,
  abilities: ClassAbility[],
): CharacterClass {
  return { name, attackBonus, hitPointRoll, abilities };
}

function allClasses(): CharacterClass[] {
  return [
    createCharacterClass('Expert', 0, '1d6', [
      createBonusFocus(['non-combat']),
      createSpecialAbility(
        'Once per scene, you can reroll a failed skill check, taking the new roll if it’s better.',
      ),
      createSpecialAbility(
        'When you advance an experience level, you gain a bonus skill point that can be spent on any non-combat, non-psychic skill. You can save this point to spend later if you wish.',
      ),
    ]),
    createCharacterClass('Psychic', 0, '1d6', [
      createBonusSkillOfType(['psychic']),
      createBonusSkillOfType(['psychic']),
      createEffortAbility(),
    ]),
    createCharacterClass('Warrior', 1, '1d6+2', [
      createBonusFocus(['combat']),
      createSpecialAbility(
        'Warriors are lucky in combat. Once per scene, as an Instant ability, you can either choose to negate a successful attack roll against you or turn a missed attack roll you made into a successful hit. You can use this ability after the dice are rolled, but it cannot be used against environmental damage, effects without an attack roll, or hits on a vehicle you’re occupying.',
      ),
      createSpecialAbility('You gain two extra maximum hit points at each character level.'),
    ]),
    createCharacterClass('Adventurer (Expert/Psychic)', 0, '1d6', [
      createBonusFocus(['non-combat']),
      createSpecialAbility(
        'Gain an extra skill point every time you gain a character level which can be spent on any non-psychic, non-combat skill.',
      ),
      createBonusSkillOfType(['psychic']),
      createEffortAbility(),
    ]),
    createCharacterClass('Adventurer (Warrior/Psychic)', 1, '1d6+2', [
      createBonusFocus(['combat']),
      createSpecialAbility('You gain two extra maximum hit points at each character level.'),
      createBonusSkillOfType(['psychic']),
      createEffortAbility(),
    ]),
    createCharacterClass('Adventurer (Warrior/Expert)', 1, '1d6+2', [
      createBonusFocus(['combat']),
      createSpecialAbility('You gain two extra maximum hit points at each character level.'),
      createBonusFocus(['non-combat']),
      createSpecialAbility(
        'Gain an extra skill point every time you gain a character level which can be spent on any non-psychic, non-combat skill.',
      ),
    ]),
  ];
}

function randomClass(rng: RNG.RNG) {
  const classes = allClasses();

  return rng.item(classes);
}

/**
 * `FOCUSES` is shared, and `applyBonusFocus` writes `currentLevel` onto the focus a character
 * holds, so a drawn focus is copied here — the two functions below are the only places a focus is
 * taken from the table. Without the copy, taking the same focus twice raises the level on the
 * shared row and every other character holding it, which is what issue #20 hit in Uncharted Worlds.
 * Copying the one chosen row rather than the table keeps this off the hot path.
 */
function randomFocusOfType(focusType: string, rng: RNG.RNG) {
  const all = allFocuses();

  const focuses = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].focusType === focusType) {
      focuses.push(all[i]);
    }
  }

  return { ...rng.item(focuses) };
}

function randomNonPsychicFocus(rng: RNG.RNG) {
  const all = allFocuses();

  const focuses = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].focusType !== 'psychic') {
      focuses.push(all[i]);
    }
  }

  return { ...rng.item(focuses) };
}

function randomStartingSkills(background: Background, rng: RNG.RNG) {
  const skills = [];

  const startingSkills = background.quickSkills;

  for (let i = 0; i < startingSkills.length; i++) {
    let skill = createSkill('', 'non-combat');

    if (startingSkills[i] === 'Any Combat') {
      skill = randomCombatSkill(rng);
    } else if (startingSkills[i] === 'Shoot or Trade') {
      skill = rng.item([createSkill('Shoot', 'combat'), createSkill('Trade', 'non-combat')]);
    } else {
      skill.name = startingSkills[i];
    }

    skills.push(skill);
  }

  return skills;
}

export type Stat = {
  name: string;
  abbreviation: string;
  score: number;
  modifier: number;
};

export function createStat(
  name: string,
  abbreviation: string,
  score: number,
  modifier: number,
): Stat {
  return { name, abbreviation, score, modifier };
}

function randomStats(rng: RNG.RNG) {
  const stats = [
    createStat('strength', 'STR', 0, 0),
    createStat('dexterity', 'DEX', 0, 0),
    createStat('constitution', 'CON', 0, 0),
    createStat('intelligence', 'INT', 0, 0),
    createStat('wisdom', 'WIS', 0, 0),
    createStat('charisma', 'CHA', 0, 0),
  ];

  for (let i = 0; i < stats.length; i++) {
    stats[i].score = Dice.roll('3d6', rng);
  }

  let lowest = 100;
  let lowestName = '';

  for (let i = 0; i < stats.length; i++) {
    if (stats[i].score < lowest) {
      lowest = stats[i].score;
      lowestName = stats[i].name;
    }
  }

  for (let i = 0; i < stats.length; i++) {
    if (stats[i].name === lowestName) {
      stats[i].score = 14;
    }
  }

  for (let i = 0; i < stats.length; i++) {
    if (stats[i].score < 4) {
      stats[i].modifier = -2;
    } else if (stats[i].score < 8) {
      stats[i].modifier = -1;
    } else if (stats[i].score < 14) {
      stats[i].modifier = 0;
    } else if (stats[i].score < 18) {
      stats[i].modifier = 1;
    } else {
      stats[i].modifier = 2;
    }
  }

  return stats;
}

export type Background = {
  name: string;
  equipmentPackage: string;
  freeSkill: string;
  quickSkills: string[];
  learningSkills: string[];
};

export function createBackground(
  name: string,
  equipmentPackage: string,
  freeSkill: string,
  quickSkills: string[],
  learningSkills: string[],
): Background {
  return { name, equipmentPackage, freeSkill, quickSkills, learningSkills };
}

function allBackgrounds() {
  return [
    createBackground(
      'Barbarian',
      'Barbarian',
      'Survive',
      ['Survive', 'Notice', 'Any Combat'],
      ['Any Combat', 'Connect', 'Exert', 'Lead', 'Notice', 'Punch', 'Sneak', 'Survive'],
    ),
    createBackground(
      'Clergy',
      'Civilian',
      'Talk',
      ['Talk', 'Perform', 'Know'],
      ['Administer', 'Connect', 'Know', 'Lead', 'Notice', 'Perform', 'Talk', 'Talk'],
    ),
    createBackground(
      'Courtesan',
      'Civilian',
      'Perform',
      ['Perform', 'Notice', 'Connect'],
      ['Any Combat', 'Connect', 'Exert', 'Notice', 'Perform', 'Survive', 'Talk', 'Trade'],
    ),
    createBackground(
      'Criminal',
      'Thief',
      'Sneak',
      ['Sneak', 'Connect', 'Talk'],
      ['Administer', 'Any Combat', 'Connect', 'Notice', 'Program', 'Sneak', 'Talk', 'Trade'],
    ),
    createBackground(
      'Dilettante',
      'Civilian',
      'Connect',
      ['Connect', 'Know', 'Talk'],
      ['Any Skill', 'Any Skill', 'Connect', 'Know', 'Perform', 'Pilot', 'Talk', 'Trade'],
    ),
    createBackground(
      'Entertainer',
      'Civilian',
      'Perform',
      ['Perform', 'Talk', 'Connect'],
      ['Any Combat', 'Connect', 'Exert', 'Notice', 'Perform', 'Perform', 'Sneak', 'Talk'],
    ),
    createBackground(
      'Merchant',
      'Civilian',
      'Trade',
      ['Trade', 'Talk', 'Connect'],
      ['Administer', 'Any Combat', 'Connect', 'Fix', 'Know', 'Notice', 'Trade', 'Talk'],
    ),
    createBackground(
      'Noble',
      'Civilian',
      'Lead',
      ['Lead', 'Connect', 'Administer'],
      ['Administer', 'Any Combat', 'Connect', 'Know', 'Lead', 'Notice', 'Pilot', 'Talk'],
    ),
    createBackground(
      'Official',
      'Civilian',
      'Administer',
      ['Administer', 'Talk', 'Connect'],
      ['Administer', 'Any Skill', 'Connect', 'Know', 'Lead', 'Notice', 'Talk', 'Trade'],
    ),
    createBackground(
      'Peasant',
      'Civilian',
      'Exert',
      ['Exert', 'Sneak', 'Survive'],
      ['Connect', 'Exert', 'Fix', 'Notice', 'Sneak', 'Survive', 'Trade', 'Work'],
    ),
    createBackground(
      'Physician',
      'Medic',
      'Heal',
      ['Heal', 'Know', 'Notice'],
      ['Administer', 'Connect', 'Fix', 'Heal', 'Know', 'Notice', 'Talk', 'Trade'],
    ),
    createBackground(
      'Pilot',
      'Scout',
      'Pilot',
      ['Pilot', 'Fix', 'Shoot or Trade'],
      ['Connect', 'Exert', 'Fix', 'Notice', 'Pilot', 'Pilot', 'Shoot', 'Trade'],
    ),
    createBackground(
      'Politician',
      'Civilian',
      'Talk',
      ['Talk', 'Lead', 'Connect'],
      ['Administer', 'Connect', 'Connect', 'Lead', 'Notice', 'Perform', 'Talk', 'Talk'],
    ),
    createBackground(
      'Scholar',
      'Technician',
      'Know',
      ['Know', 'Connect', 'Administer'],
      ['Administer', 'Connect', 'Fix', 'Know', 'Notice', 'Perform', 'Program', 'Talk'],
    ),
    createBackground(
      'Soldier',
      'Soldier',
      'Any Combat',
      ['Any Combat', 'Exert', 'Survive'],
      ['Administer', 'Any Combat', 'Exert', 'Fix', 'Lead', 'Notice', 'Sneak', 'Survive'],
    ),
    createBackground(
      'Spacer',
      'Gunslinger',
      'Fix',
      ['Fix', 'Pilot', 'Program'],
      ['Administer', 'Connect', 'Exert', 'Fix', 'Know', 'Pilot', 'Program', 'Talk'],
    ),
    createBackground(
      'Technician',
      'Technician',
      'Fix',
      ['Fix', 'Exert', 'Notice'],
      ['Administer', 'Connect', 'Exert', 'Fix', 'Fix', 'Know', 'Notice', 'Pilot'],
    ),
    createBackground(
      'Thug',
      'Blade',
      'Any Combat',
      ['Any Combat', 'Talk', 'Connect'],
      ['Any Combat', 'Connect', 'Exert', 'Notice', 'Sneak', 'Stab or Shoot', 'Survive', 'Talk'],
    ),
    createBackground(
      'Vagabond',
      'Civilian',
      'Survive',
      ['Survive', 'Sneak', 'Notice'],
      ['Any Combat', 'Connect', 'Notice', 'Perform', 'Pilot', 'Sneak', 'Survive', 'Work'],
    ),
    createBackground(
      'Worker',
      'Technician',
      'Work',
      ['Work', 'Connect', 'Exert'],
      ['Administer', 'Any Skill', 'Connect', 'Exert', 'Fix', 'Pilot', 'Program', 'Work'],
    ),
  ];
}

function randomSkillOfType(skillType: string, rng: RNG.RNG) {
  const all = allSkills();

  const skills = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].skillType === skillType) {
      skills.push(all[i]);
    }
  }

  const newSkill = rng.item(skills);

  return newSkill;
}

function randomPsionicAbilityOfDiscipline(discipline: string, rng: RNG.RNG) {
  const all = allPsionicAbilities();

  const abilities = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].discipline === discipline) {
      abilities.push(all[i]);
    }
  }

  return rng.item(abilities);
}

export type PsionicAbility = {
  name: string;
  description: string;
  level: number;
  discipline: string;
};

export function createPsionicAbility(
  name: string,
  description: string,
  level: number,
  discipline: string,
): PsionicAbility {
  return { name, description, level, discipline };
}

function allPsionicAbilities(): PsionicAbility[] {
  return [
    createPsionicAbility(
      'Mastered Succor',
      'The biopsion has developed a sophisticated mastery of their core ability, and they no longer need to Commit Effort to activate it, and may use it whenever they wish. The use of additional techniques that augment Psychic Succor might still require Effort to be Committed.',
      1,
      'Biopsionics',
    ),
    createPsionicAbility(
      'Organic Purification Protocols',
      'The biopsion’s Psychic Succor now cures any poisons or diseases the subject may be suffering, albeit it requires Committing Effort for the day as an additional surcharge. Biowarfare organisms, exceptionally virulent diseases, or TL5 toxins may resist this curing, requiring a Wis/Biopsionics skill check at a difficulty of at least 10. Failure means that the adept cannot cure the target’s disease. This technique cannot cure congenital illnesses.',
      1,
      'Biopsionics',
    ),
    createPsionicAbility(
      'Remote Repair',
      'Psychic Succor and other biopsionic techniques that normally require touch contact can now be applied at a distance up to 100 meters, provided the biopsion can see the target with their unaided vision. Hostile powers that normally require a hit roll will hit automatically. Each time this technique is used, Effort must be Committed for the scene.',
      1,
      'Biopsionics',
    ),
    createPsionicAbility(
      'Cloak Powers',
      'The metapsion can conceal their own psychic abilities from metapsionic senses. They must Commit Effort for as long as they wish to cloak their powers. While hidden, only a metapsion with equal or higher skill in Metapsionics can detect their abilities with their level-0 or level-2 Psychic Refinement abilities. In such cases, an opposed Wis/Metapsionics roll is made between the metapsion and the investigator. If the investigator wins, the cloak is pierced, while if the metapsion wins, the investigator’s Psychic Refinement remains oblivious.',
      1,
      'Metapsionics',
    ),
    createPsionicAbility(
      'Mindtracing',
      'The metapsion can trace back the use of psionic powers they’ve noticed in their presence. By Committing Effort for the scene as an Instant action, they can see and hear through the senses of a user of a psychic power, gaining an intuitive awareness of their location and treating them as a visible target for purposes of their own abilities. Thus, if they see someone being affected by a telepathy power with no visible source, they can use this ability to briefly share the hidden telepath’s senses. If used on a target that is teleporting, they can perceive the teleporter’s view of their destination. Use on a metamorphically-shaped impostor would reveal the biopsion responsible for the change, and so forth. These shared senses last for only one round and do not interfere with the adept’s other actions.',
      1,
      'Metapsionics',
    ),
    createPsionicAbility(
      'Synthetic Adaptation',
      'This is a particularly esoteric technique, one that requires the adept to have at least Program-0 or Fix-0 skill in order to master. With it, however, the metapsion has learned how to synergize with the quantum intelligence of a VI or True AI in order to apply Telepathy or Biopsion powers to their inanimate corpus. Only intelligent machines can be affected, as the technique requires a sentient mind to catalyze the effect. This synergy takes much of its force from the adept. Any System Strain the powers might inflict must be paid by the adept rather than the target.',
      1,
      'Metapsionics',
    ),
    createPsionicAbility(
      'Intuitive Response',
      'As an Instant action, the precog can Commit Effort for the scene just before they roll initiative. Their initiative score is treated as one better than anyone else’s involved in the scene. If another participant has this power or some other ability that grants automatic initiative success, roll initiative normally to determine which of them goes first, and then the rest of the combatants act. This ability cannot be used if the precog has been surprised.',
      1,
      'Precognition',
    ),
    createPsionicAbility(
      'Sense the Need',
      'At some point in the recent past, the psychic had a vague but intense premonition that a particular object would be needed. By triggering this power as an Instant action and Committing Effort for the day, the psychic can retroactively declare that they brought along any one object that they could have reasonably acquired and carried to this point. This object must be plausible given recent events; if the psychic has just been stripsearched, very few objects could reasonably have been kept, while a psychic who’s just passed through a weapons check couldn’t still have a loaded laser pistol.',
      1,
      'Precognition',
    ),
    createPsionicAbility(
      'Terminal Reflection',
      'The psychic’s Oracle power automatically triggers as an Instant action moments before some unexpected danger or ambush, giving the precog a brief vision of the impending hazard. This warning comes just in time to avoid springing a trap or to negate combat surprise for the precog and their companions. If the psychic does not immediately Commit Effort for the day, this sense goes numb and this technique cannot be used for the rest of the day.',
      1,
      'Precognition',
    ),
    createPsionicAbility(
      'Kinetic Transversal',
      'The adept may Commit Effort as an On Turn action to move freely over vertical or overhanging surfaces as if they were flat ground, crossing any solid surface strong enough to bear five kilos of weight. They can also move over liquids at their full movement rate. This move- ment ability lasts as long as the Effort is committed.',
      1,
      'Telekinesis',
    ),
    createPsionicAbility(
      'Pressure Field',
      'As an Instant action, the adept can manifest a protective force skin around their person equivalent to a vacc suit, maintaining pressure and temperature even in hard vacuum conditions. They can ignore temperatures at a range of plus or minus 100 degrees Celsius and automatically pressurize thin atmospheres for breathability, or filter particulates or airborne toxins. By Committing Effort for the scene, they can shield up to six comrades. This lasts until the user reclaims the Effort.',
      1,
      'Telekinesis',
    ),
    createPsionicAbility(
      'Telekinetic Armory',
      'The adept may Commit Effort as an On Turn action to create both weapons and armor out of telekinetic force. These weapons are treated as tech level 4 and act as a rifle or any advanced melee weapon. Attack rolls can use either Dexterity, Wisdom, or Constitution modifiers, and may use the Telekinesis skill as the combat skill. Armor may be created as part of this power, granting the psychic a base Armor Class equal to 15 plus their Telekinesis skill level. This armor does not stack with conventional armor, but Dexterity or shields modify it as usual. The gear continues to exist as long as the psychic chooses to leave the Effort committed, and they may be invisible or visible at the psychic’s discretion.',
      1,
      'Telekinesis',
    ),
    createPsionicAbility(
      'Facile Mind',
      'The telepath is practiced at opening a Telepathic Contact, and need only Commit Effort for the scene to do so, instead of Committing Effort for the day. If contacting an ally who has practiced the process with the psychic for at least a week, opening the contact normally requires no Effort at all. In both cases, if the telepath chooses to Commit Effort for the day, they can open a Telepathic Contact as an Instant action rather than a Main Action.',
      1,
      'Telepathy',
    ),
    createPsionicAbility(
      'Transmit Thought',
      'The telepath can send thoughts and images over a Telepathic Contact, allowing two-way communication with a willing target as an Instant action when desired.',
      1,
      'Telepathy',
    ),
    createPsionicAbility(
      'Proficient Apportation',
      'Personal Apportation now counts as a Move action, though it still can be performed only once per round. Apportations of 10 meters or less no longer require Effort to be Committed, though any augments to the technique must still be paid for normally.',
      1,
      'Teleportation',
    ),
    createPsionicAbility(
      'Spatial Awareness',
      'The psychic may Commit Effort as an On Turn ac- tion to gain an intuitive 360-degree awareness of their physical surroundings. The sense is roughly equivalent to sight out to 100 meters, though it cannot read text or distinguish colors. It is blocked by solid objects but is unimpeded by darkness, mist, blinding light, holograms, or optical illusions. The sense lasts as long as the Effort remains Committed to the technique.',
      1,
      'Teleportation',
    ),
  ];
}

function getEquipmentPackage(name: string) {
  const all = allEquipmentPackages();

  for (let i = 0; i < all.length; i++) {
    if (all[i].name === name) {
      return all[i];
    }
  }

  return all[0];
}

export type MiscItem = {
  kind: 'miscItem';
  name: string;
};

export type Weapon = {
  kind: 'weapon';
  name: string;
  range: string;
  damage: string;
};

export type Armor = {
  kind: 'armor';
  name: string;
  ac: number;
};

export type Container = {
  kind: 'container';
  name: string;
  tl: number;
};

export type CreditChip = {
  kind: 'creditChip';
  amount: number;
};

/** Anything an equipment package can hand a character. */
export type EquipmentItem = MiscItem | Weapon | Armor | Container | CreditChip;

export type EquipmentPackage = {
  name: string;
  items: EquipmentItem[];
};

export function createEquipmentPackage(name: string, items: EquipmentItem[]): EquipmentPackage {
  return { name, items };
}

export function createMiscItem(name: string): MiscItem {
  return { kind: 'miscItem', name };
}

export function createWeapon(name: string, range: string, damage: string): Weapon {
  return { kind: 'weapon', name, range, damage };
}

export function createArmor(name: string, ac: number): Armor {
  return { kind: 'armor', name, ac };
}

export function createContainer(name: string, tl: number): Container {
  return { kind: 'container', name, tl };
}

export function createCreditChip(amount: number): CreditChip {
  return { kind: 'creditChip', amount };
}

export function applyEquipmentItem(item: EquipmentItem, character: SWNCharacter): void {
  switch (item.kind) {
    case 'miscItem':
    case 'container':
      character.equipment.push(item);
      return;
    case 'weapon':
      if (item.range === 'melee') {
        character.meleeWeapons.push(item);
      } else {
        character.rangedWeapons.push(item);
      }
      return;
    case 'armor':
      if (item.ac > character.armorClassEquipped) {
        character.armorClassEquipped = item.ac;
      }
      character.armor.push(item);
      return;
    case 'creditChip':
      character.credits += item.amount;
      return;
  }
}

function allEquipmentPackages() {
  return [
    createEquipmentPackage('Barbarian', [
      createWeapon('Spear', 'melee', '1d6+1'),
      createArmor('Primitive hide armor', 13),
      createArmor('Primitive shield', 1),
      createWeapon('Knife', 'melee', '1d4'),
      createContainer('Backpack', 0),
      createMiscItem('7 days rations'),
      createMiscItem('20m rope'),
      createCreditChip(500),
    ]),
    createEquipmentPackage('Blade', [
      createWeapon('Monoblade Sword', 'melee', '1d8+1'),
      createArmor('Woven Body Armor', 15),
      createArmor('Secure Clothing', 13),
      createWeapon('Thermal Knife', 'melee', '1d6'),
      createContainer('backpack', 0),
      createMiscItem('Compad'),
      createMiscItem('Lazarus patch'),
      createCreditChip(50),
    ]),
    createEquipmentPackage('Thief', [
      createWeapon('Laser Pistol', 'ranged', '1d6'),
      createArmor('Armored Undersuit', 13),
      createWeapon('Monoblade Knife', 'melee', '1d6'),
      createMiscItem('Climbing harness'),
      createMiscItem('Low-light goggles'),
      createMiscItem('2 type A cells'),
      createContainer('backpack', 0),
      createMiscItem('Compad'),
      createMiscItem('Metatool'),
      createCreditChip(25),
    ]),
    createEquipmentPackage('Hacker', [
      createWeapon('Laser Pistol', 'ranged', '1d6'),
      createArmor('Secure Clothing', 13),
      createMiscItem('Postech toolkit'),
      createMiscItem('3 units of spare parts'),
      createMiscItem('2 type A cells'),
      createMiscItem('Dataslab'),
      createMiscItem('Metatool'),
      createMiscItem('2 line shunts'),
      createCreditChip(100),
    ]),
    createEquipmentPackage('Gunslinger', [
      createWeapon('Laser Pistol', 'ranged', '1d6'),
      createArmor('Armored Undersuit', 13),
      createWeapon('Monoblade Knife', 'melee', '1d6'),
      createMiscItem('8 type A cells'),
      createContainer('backpack', 0),
      createMiscItem('Compad'),
      createCreditChip(100),
    ]),
    createEquipmentPackage('Soldier', [
      createWeapon('Combat Rifle', 'ranged', '1d12'),
      createArmor('Woven Body Armor', 15),
      createWeapon('Knife', 'melee', '1d4'),
      createMiscItem('80 rounds ammo'),
      createContainer('backpack', 0),
      createMiscItem('Compad'),
      createCreditChip(100),
    ]),
    createEquipmentPackage('Scout', [
      createWeapon('Laser Rifle', 'ranged', '1d10'),
      createArmor('Armored vacc suit', 13),
      createWeapon('Knife', 'melee', '1d4'),
      createMiscItem('Survey scanner'),
      createMiscItem('Survival kit'),
      createMiscItem('Binoculars (TL3)'),
      createMiscItem('8 type A cells'),
      createContainer('backpack', 0),
      createMiscItem('Compad'),
      createCreditChip(25),
    ]),
    createEquipmentPackage('Medic', [
      createWeapon('Laser Pistol', 'ranged', '1d6'),
      createArmor('Secure Clothing', 13),
      createMiscItem('4 Lazarus patches'),
      createMiscItem('2 doses of Lift'),
      createContainer('backpack', 0),
      createMiscItem('Medkit'),
      createMiscItem('Compad'),
      createMiscItem('Bioscanner'),
      createCreditChip(25),
    ]),
    createEquipmentPackage('Civilian', [
      createArmor('Secure Clothing', 13),
      createMiscItem('Compad'),
      createCreditChip(700),
    ]),
    createEquipmentPackage('Technician', [
      createWeapon('Laser Pistol', 'ranged', '1d6'),
      createArmor('Armored Undersuit', 13),
      createWeapon('Monoblade knife', 'melee', '1d6'),
      createMiscItem('Postech toolkit'),
      createMiscItem('6 units of spare parts'),
      createMiscItem('4 type A cells'),
      createContainer('backpack', 0),
      createMiscItem('Dataslab'),
      createMiscItem('Metatool'),
      createCreditChip(200),
    ]),
  ];
}

export type Skill = {
  name: string;
  skillType: string;
  level: number;
};

export function createSkill(name: string, skillType: string): Skill {
  return { name, skillType, level: 0 };
}

function allSkills() {
  return [
    createSkill('Administer', 'non-combat'),
    createSkill('Connect', 'non-combat'),
    createSkill('Exert', 'non-combat'),
    createSkill('Fix', 'non-combat'),
    createSkill('Heal', 'non-combat'),
    createSkill('Know', 'non-combat'),
    createSkill('Lead', 'non-combat'),
    createSkill('Notice', 'non-combat'),
    createSkill('Perform', 'non-combat'),
    createSkill('Pilot', 'non-combat'),
    createSkill('Program', 'non-combat'),
    createSkill('Punch', 'combat'),
    createSkill('Shoot', 'combat'),
    createSkill('Sneak', 'non-combat'),
    createSkill('Stab', 'combat'),
    createSkill('Survive', 'non-combat'),
    createSkill('Talk', 'non-combat'),
    createSkill('Trade', 'non-combat'),
    createSkill('Work', 'non-combat'),
    createSkill('Biopsionics', 'psychic'),
    createSkill('Metapsionics', 'psychic'),
    createSkill('Precognition', 'psychic'),
    createSkill('Telekinesis', 'psychic'),
    createSkill('Telepathy', 'psychic'),
    createSkill('Teleportation', 'psychic'),
  ];
}

function getSkillByName(skillName: string) {
  const all = allSkills();

  for (let i = 0; i < all.length; i++) {
    if (all[i].name === skillName) {
      return all[i];
    }
  }

  return all[0];
}

function randomCombatSkill(rng: RNG.RNG) {
  const skills = ['Punch', 'Shoot', 'Stab'];

  return createSkill(rng.item(skills), 'combat');
}

export function formatAsText(character: SWNCharacter) {
  let description = Text.header('Stars Without Number Character');

  const displayName = `${character.firstName} ${character.lastName}`.trim();
  if (displayName) {
    description += `Name: ${displayName}\n`;
  }

  description += `Background: ${character.background.name}\n`;
  description += `Class: ${character.characterClass.name}\n`;
  description += `Hit Points: ${character.hitPoints}\n`;

  if (character.effort !== 0) {
    description += `Effort: ${character.effort}\n`;
  }

  description += `Base Attack Bonus: ${character.attackBonus}\n`;
  description += `Armor Class: ${character.armorClassEquipped}\n`;
  description += `Credits: ${character.credits}\n`;

  description += Text.header('Saving Throws');

  description += `Evasion: ${character.savingThrowEvasion}\n`;
  description += `Mental: ${character.savingThrowMental}\n`;
  description += `Physical: ${character.savingThrowPhysical}\n`;

  description += Text.header('Focuses');

  const focuses = [];

  for (let i = 0; i < character.focuses.length; i++) {
    focuses.push(character.focuses[i].name + ', Level ' + character.focuses[i].currentLevel);
  }

  description += Text.list(focuses);

  description += Text.header('Stats');

  for (let i = 0; i < character.stats.length; i++) {
    description +=
      character.stats[i].abbreviation +
      ' ' +
      character.stats[i].score +
      ' (' +
      character.stats[i].modifier +
      ')\n';
  }

  description += Text.header('Skills');

  const skills = [];

  for (let i = 0; i < character.skills.length; i++) {
    skills.push(`${character.skills[i].name}-${character.skills[i].level}`);
  }

  description += Text.list(skills);

  description += Text.header('Abilities');

  for (let i = 0; i < character.abilities.length; i++) {
    description += `${character.abilities[i].description}\n\n`;
  }

  description += Text.header('Weapons');

  const weapons = [];

  for (let i = 0; i < character.rangedWeapons.length; i++) {
    weapons.push(
      character.rangedWeapons[i].name +
        ': ' +
        character.rangedWeapons[i].damage +
        ' damage, ' +
        character.rangedAttackBonus +
        ' attack bonus',
    );
  }

  for (let i = 0; i < character.meleeWeapons.length; i++) {
    weapons.push(
      character.meleeWeapons[i].name +
        ': ' +
        character.meleeWeapons[i].damage +
        ' damage, ' +
        character.meleeAttackBonus +
        ' attack bonus',
    );
  }

  description += Text.list(weapons);

  description += Text.header('Armor');

  const armor = [];

  for (let i = 0; i < character.armor.length; i++) {
    armor.push(`${character.armor[i].name}: ${character.armor[i].ac} AC`);
  }

  description += Text.list(armor);

  description += Text.header('Equipment');

  description += Text.list(equipmentList(character));

  return description;
}
