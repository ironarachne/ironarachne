import type ADNDArmor from './adndarmor.js';
import type ADNDClass from './adndclass.js';
import type ADNDRace from './adndrace.js';
import type ADNDSpell from './adndspell.js';
import type { ThiefSkillRow } from './adndthiefskills.js';
import type ADNDWeapon from './adndweapon.js';

// The fields the generator fills in later are optional on the way out of
// createAdndCharacter, which is why they carried a definite-assignment `!` when
// this was a class. A character is only complete once a race and a class have
// been applied to it.
export default interface ADNDCharacter {
  firstName: string;
  lastName: string;
  race: ADNDRace;
  class: ADNDClass;
  level: number;
  strength: number;
  exceptionalStrength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  age: number;
  height: number;
  weight: number;
  xp: number;
  hp: number;
  thaco: number;
  ac: number;
  currency: number; // in copper pieces
  hitProbability: string;
  damageAdjustment: string;
  weightAllowance: number;
  maxPress: number;
  openDoors: string;
  bendBarsLiftGates: number;
  reactionAdjustment: number;
  missileAttackAdjustment: number;
  defensiveAdjustment: number;
  hitPointAdjustment: number;
  warriorHitPointAdjustment: number;
  systemShock: number;
  resurrectionSurvival: number;
  poisonSave: number;
  regeneration: string;
  numberOfLanguages: number;
  spellLevel: number;
  chanceToLearnSpell: number;
  maximumNumberOfSpellsPerLevel: number;
  illusionImmunity: number;
  magicalDefenseAdjustment: number;
  bonusSpells: number[];
  chanceOfSpellFailure: number;
  spellImmunity: string[];
  maximumNumberOfHenchmen: number;
  loyaltyBase: number;
  npcReactionAdjustment: number;
  abilities: string[];
  alignment: string;
  poisonSavingThrow: number;
  rodSavingThrow: number;
  petrificationSavingThrow: number;
  breathSavingThrow: number;
  spellSavingThrow: number;
  spells: ADNDSpell[];
  armor: ADNDArmor[];
  weapons: ADNDWeapon[];
  weaponProficiencyGroups: string[];
  nonweaponProficiencies: string[];
  /**
   * A thief's or bard's skill percentages, empty for every other class.
   *
   * Two numbers rather than one, because they answer different questions and only one of them is
   * the user's. `value` is what the rule tables give this character for the skill — the class base,
   * adjusted for dexterity and race — and `points` is the discretionary allocation, whether rolled
   * by {@link distributePoints} or assigned in the builder. What a sheet prints is their sum.
   *
   * These used to be prose on {@link ADNDCharacter.abilities} — `Pick Pockets: 45%` — which stored
   * the total and threw the allocation away. That reads back as a sentence and not as a decision,
   * so nothing could offer it for editing without re-parsing it, and a renamed skill would have
   * broken the parse silently.
   */
  thiefSkills: ThiefSkillRow[];
  kit: { name: string; features: string[] } | null;
}

export function createAdndCharacter(): ADNDCharacter {
  // Everything the class left to definite assignment starts blank here: the
  // generator overwrites each one as it rolls stats and applies a race and a
  // class, and the PDF renderer never sees a half-built character.
  return {
    firstName: '',
    lastName: '',
    race: undefined as unknown as ADNDRace,
    class: undefined as unknown as ADNDClass,
    level: 1,
    strength: 0,
    exceptionalStrength: -1,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
    age: 0,
    height: 0,
    weight: 0,
    xp: 0,
    hp: 0,
    thaco: 0,
    ac: 10,
    currency: 0,
    hitProbability: 'normal',
    damageAdjustment: 'none',
    weightAllowance: 0,
    maxPress: 0,
    openDoors: '',
    bendBarsLiftGates: 0,
    reactionAdjustment: 0,
    missileAttackAdjustment: 0,
    defensiveAdjustment: 0,
    hitPointAdjustment: 0,
    warriorHitPointAdjustment: 0,
    systemShock: 0,
    resurrectionSurvival: 0,
    poisonSave: 0,
    regeneration: 'nil',
    numberOfLanguages: 0,
    spellLevel: 0,
    chanceToLearnSpell: -1,
    maximumNumberOfSpellsPerLevel: 0,
    illusionImmunity: 0,
    magicalDefenseAdjustment: 0,
    bonusSpells: [],
    chanceOfSpellFailure: 0,
    spellImmunity: [],
    maximumNumberOfHenchmen: 0,
    loyaltyBase: 0,
    npcReactionAdjustment: 0,
    abilities: [],
    alignment: '',
    poisonSavingThrow: 0,
    rodSavingThrow: 0,
    petrificationSavingThrow: 0,
    breathSavingThrow: 0,
    spellSavingThrow: 0,
    spells: [],
    armor: [],
    weapons: [],
    weaponProficiencyGroups: [],
    nonweaponProficiencies: [],
    thiefSkills: [],
    kit: null,
  };
}
