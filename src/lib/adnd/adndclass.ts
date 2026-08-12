import type * as RNG from '@ironarachne/rng';
import type { AdndClassApplyOptions } from './adnd_class_apply_options.js';
import type ADNDCharacter from './adndcharacter.js';
import type SpellFilter from './spellfilter.js';

export default interface ADNDClass {
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
  apply: (character: ADNDCharacter, rng: RNG.RNG, options?: AdndClassApplyOptions) => ADNDCharacter;
}
