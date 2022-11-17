'use strict';

import ADNDArmor from './adndarmor';
import ADNDClass from './adndclass';
import ADNDRace from './adndrace';
import ADNDSpell from './adndspell';
import ADNDWeapon from './adndweapon';

export default class ADNDCharacter {
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

  constructor() {
    this.firstName = '';
    this.lastName = '';
    this.level = 1;
    this.xp = 0;
    this.ac = 10;
    this.currency = 0;
    this.exceptionalStrength = -1;
    this.hitProbability = 'normal';
    this.damageAdjustment = 'none';
    this.regeneration = 'nil';
    this.chanceToLearnSpell = -1;
    this.bonusSpells = [];
    this.spellImmunity = [];
    this.abilities = [];
    this.spells = [];
    this.armor = [];
    this.weapons = [];
  }
}
