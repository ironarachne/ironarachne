import type * as RNG from '@ironarachne/rng';
import type ADNDCharacter from './adndcharacter.js';
import type SpellFilter from './spellfilter.js';

export default class ADNDClass {
  name: string;
  group: string;
  hitDice: string; // dice expression
  minStrength: number;
  minDexterity: number;
  minConstitution: number;
  minIntelligence: number;
  minWisdom: number;
  minCharisma: number;
  abilities: string[];
  primeRequisites: string[];
  allowedAlignments: string[];
  hasSpells: boolean;
  allowedSpellTypes: string[];
  spellList: { filter: SpellFilter; count: number }[];
  allowedWeapons: string[];
  allowedArmor: string[];
  initialWP: number;
  initialNWP: number;
  wpPenalty: number;
  apply: (character: ADNDCharacter, rng: RNG.RNG) => ADNDCharacter;

  constructor(
    name: string,
    group: string,
    hitDice: string,
    minStrength: number,
    minDexterity: number,
    minConstitution: number,
    minIntelligence: number,
    minWisdom: number,
    minCharisma: number,
    primeRequisites: string[],
    abilities: string[],
    allowedAlignments: string[],
    hasSpells: boolean,
    allowedSpellTypes: string[],
    spellList: { filter: SpellFilter; count: number }[],
    allowedWeapons: string[] = [],
    allowedArmor: string[] = [],
    initialWP: number,
    initialNWP: number,
    wpPenalty: number,
    apply: (character: ADNDCharacter, rng: RNG.RNG) => ADNDCharacter,
  ) {
    this.name = name;
    this.group = group;
    this.hitDice = hitDice;
    this.minStrength = minStrength;
    this.minDexterity = minDexterity;
    this.minConstitution = minConstitution;
    this.minIntelligence = minIntelligence;
    this.minWisdom = minWisdom;
    this.minCharisma = minCharisma;
    this.abilities = abilities;
    this.primeRequisites = primeRequisites;
    this.allowedAlignments = allowedAlignments;
    this.hasSpells = hasSpells;
    this.allowedSpellTypes = allowedSpellTypes;
    this.spellList = spellList;
    this.allowedWeapons = allowedWeapons;
    this.allowedArmor = allowedArmor;
    this.initialWP = initialWP;
    this.initialNWP = initialNWP;
    this.wpPenalty = wpPenalty;
    this.apply = apply;
  }
}
