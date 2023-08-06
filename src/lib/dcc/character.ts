"use strict";

import CoinPurse from "../currency/coinpurse.js";
import DCCAttribute from "./attribute.js";
import type DCCItem from "./equipment/item.js";
import DCCWeapon from "./equipment/weapon.js";
import DCCLuckyRoll from "./luckyroll.js";
import DCCOccupation from "./occupation.js";

export default class DCCCharacter {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  level: number;
  xp: number;
  hp: number;
  speed: number;
  alignment: string;
  occupation: DCCOccupation;
  strength: DCCAttribute;
  agility: DCCAttribute;
  stamina: DCCAttribute;
  personality: DCCAttribute;
  intelligence: DCCAttribute;
  luck: DCCAttribute;
  fortitudeSave: number;
  reflexSave: number;
  willpowerSave: number;
  baseSave: number;
  luckyRoll: DCCLuckyRoll;
  spellsKnown: number;
  wizardMaxSpellLevel: number;
  clericMaxSpellLevel: number;
  attackModifier: number;
  specialRules: string[];
  armorClass: number;
  currency: CoinPurse;
  equipment: DCCItem[];
  weapons: DCCWeapon[];
  languages: string[];
  numberOfLanguages: number;

  constructor() {
    this.level = 0;
    this.xp = 0;
    this.hp = 0;
    this.speed = 30;
    this.baseSave = 0;
    this.specialRules = [];
    this.currency = new CoinPurse();
    this.equipment = [];
    this.weapons = [];
    this.languages = [];
    this.numberOfLanguages = 0;
    this.armorClass = 10;
  }
}
