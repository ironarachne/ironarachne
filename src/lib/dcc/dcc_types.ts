import type { NameGenerator } from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';

export type DCCAttribute = {
  value: number;
  modifier: number;
};

export type DCCCharacter = {
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
  currency: Record<string, number>;
  equipment: DCCItem[];
  weapons: DCCWeapon[];
  languages: string[];
  numberOfLanguages: number;
};

export type DCCCharacterGeneratorConfig = {
  nameGeneratorMale: NameGenerator;
  nameGeneratorFemale: NameGenerator;
  nameGeneratorFamily: NameGenerator;
  allowedOccupations: string[];
};

export type DCCItem = {
  name: string;
  value: number;
};

export type DCCLanguage = {
  name: string;
  commonality: number;
};

export type DCCLuckyRoll = {
  name: string;
  description: string;
  modifier: number;
  apply: (character: DCCCharacter) => DCCCharacter;
};

export type DCCOccupation = {
  name: string;
  trainedWeapon: DCCWeapon | null;
  tradeGoods: DCCItem | null;
  commonality: number;
  apply: (character: DCCCharacter, rng: RNG) => DCCCharacter;
};

export type DCCWeapon = DCCItem & {
  classification: string;
  damage: string;
  range: string;
};
