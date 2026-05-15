import type { RNG } from '@ironarachne/rng';
import type ADNDCharacter from '../adndcharacter.js';

export type HalflingSubrace = 'Hairfeet' | 'Tallfellow' | 'Stout';

export type HalflingApplyOptions = {
  subrace: HalflingSubrace;
  hasInfravision: boolean;
};

export function randomHalflingApplyOptions(rng: RNG): HalflingApplyOptions {
  const subrace = rng.item(['Hairfeet', 'Tallfellow', 'Stout'] as const);
  if (subrace === 'Stout') {
    return { subrace, hasInfravision: rng.simple(100) <= 15 };
  }
  return { subrace, hasInfravision: rng.simple(100) <= 25 };
}

/** Applies halfling stat modifiers and abilities (no randomness). */
export function applyHalflingWithOptions(
  character: ADNDCharacter,
  options: HalflingApplyOptions,
): ADNDCharacter {
  character.dexterity += 1;
  character.strength -= 1;
  character.exceptionalStrength = -1;

  const { subrace, hasInfravision } = options;
  character.race.name = `${subrace} halfling`;

  if (subrace === 'Stout') {
    if (hasInfravision) {
      character.abilities.push("Normal Infravision (60')");
    }
    character.abilities.push('Know if a passage has up or down grade on 1,2,3 on 1d4');
    character.abilities.push('Determine direction on 1,2,3 on 1d6');
  } else if (hasInfravision) {
    character.abilities.push("Limited Infravision (30')");
  }

  character.abilities.push('+1 to attack rolls with thrown weapons and slings');
  character.abilities.push(
    'When not wearing metal armor, and either alone or with other halflings/elves not in metal armor, gain a bonus to surprise opponents. Those opponents have a -4 penalty to their surprise die rolls, or a -2 penalty if the halfling has to open a door or screen to attack.',
  );
  return character;
}
