import type { RNG } from '@ironarachne/rng';
import type ADNDCharacter from '../adndcharacter.js';
import type ADNDRace from '../adndrace.js';
import type { ADNDRaceApplyOptions } from '../adndrace.js';
import { applyAdndSubrace, pickAdndSubrace } from '../adnd_subrace.js';
import { halflingSubraces } from './halfling_subraces.js';

/** The adjustments and abilities every halfling has, whatever variety it is. */
function applyCommonHalfling(character: ADNDCharacter): void {
  character.dexterity += 1;
  character.strength -= 1;
  character.exceptionalStrength = -1;
}

function applyHalflingTraits(character: ADNDCharacter): void {
  character.abilities.push('+1 to attack rolls with thrown weapons and slings');
  character.abilities.push(
    'When not wearing metal armor, and either alone or with other halflings/elves not in metal armor, gain a bonus to surprise opponents. Those opponents have a -4 penalty to their surprise die rolls, or a -2 penalty if the halfling has to open a door or screen to attack.',
  );
}

const halfling: ADNDRace = {
  name: 'halfling',
  adjective: 'halfling',
  /**
   * Halfling adjustments, then a variety, then the traits every halfling shares.
   *
   * The order is what it has always been, and the draws are the ones it has always taken — a pick
   * from the three varieties, then that variety's own infravision roll — so a seed produces the
   * halfling it always did. What changed is where the answer is written: `character.subraceName`
   * rather than `character.race.name`, which used to rename the shared race table for every
   * character that followed (#99).
   */
  apply: function (
    character: ADNDCharacter,
    rng: RNG,
    options?: ADNDRaceApplyOptions,
  ): ADNDCharacter {
    applyCommonHalfling(character);
    // A variety the caller chose, or one drawn here. The builder supplies the user's choice; the
    // generator supplies nothing and gets the draw this race has always taken.
    const subrace = options?.subrace ?? pickAdndSubrace(halflingSubraces, rng);
    applyAdndSubrace(character, subrace, rng);
    applyHalflingTraits(character);
    return character;
  },
  minStrength: 7,
  maxStrength: 18,
  minDexterity: 7,
  maxDexterity: 18,
  minConstitution: 10,
  maxConstitution: 18,
  minIntelligence: 6,
  maxIntelligence: 18,
  minWisdom: 3,
  maxWisdom: 17,
  minCharisma: 3,
  maxCharisma: 18,
  baseHeightMale: 32,
  baseHeightFemale: 30,
  baseWeightMale: 52,
  baseWeightFemale: 48,
  heightModifier: '2d8',
  weightModifier: '5d4',
  baseAge: 20,
  baseMovement: 6,
  ageModifier: '3d4',
  availableInitialLanguages: ['common', 'halfling', 'dwarf', 'elf', 'gnome', 'goblin', 'orc'],
  allowedClasses: ['cleric', 'fighter', 'thief'],
  subraces: halflingSubraces,
};

export default halfling;
