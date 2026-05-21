import type ADNDCharacter from './adndcharacter.js';
import type ADNDClass from './adndclass.js';
import type ADNDRace from './adndrace.js';
import type { RNG } from '@ironarachne/rng';

/**
 * Warrior classes in AD&D 2e use exceptional Strength (percentile) at STR 18.
 */
export function isWarriorClass(cls: ADNDClass): boolean {
  return cls.group === 'warrior';
}

export function getRaceOptions(character: ADNDCharacter, races: ADNDRace[]): ADNDRace[] {
  const options: ADNDRace[] = [];

  for (let i = 0; i < races.length; i++) {
    if (
      character.charisma >= races[i].minCharisma &&
      character.charisma <= races[i].maxCharisma &&
      character.constitution >= races[i].minConstitution &&
      character.constitution <= races[i].maxConstitution &&
      character.dexterity >= races[i].minDexterity &&
      character.dexterity <= races[i].maxDexterity &&
      character.intelligence >= races[i].minIntelligence &&
      character.intelligence <= races[i].maxIntelligence &&
      character.strength >= races[i].minStrength &&
      character.strength <= races[i].maxStrength &&
      character.wisdom >= races[i].minWisdom &&
      character.wisdom <= races[i].maxWisdom
    ) {
      options.push(races[i]);
    }
  }

  return options;
}

export function getClassOptions(character: ADNDCharacter, classes: ADNDClass[]): ADNDClass[] {
  const options: ADNDClass[] = [];

  for (let i = 0; i < classes.length; i++) {
    if (
      character.charisma >= classes[i].minCharisma &&
      character.constitution >= classes[i].minConstitution &&
      character.dexterity >= classes[i].minDexterity &&
      character.intelligence >= classes[i].minIntelligence &&
      character.strength >= classes[i].minStrength &&
      character.wisdom >= classes[i].minWisdom
    ) {
      options.push(classes[i]);
    }
  }

  return options;
}

/**
 * Classes allowed for this race (PHB matrix) intersected with stat-qualified classes.
 */
export function getClassOptionsForRace(
  character: ADNDCharacter,
  race: ADNDRace,
  classes: ADNDClass[],
): ADNDClass[] {
  return getClassOptions(character, classes).filter((c) => race.allowedClasses.includes(c.name));
}

/**
 * Set percentile Strength after racial adjustments and class are known.
 * Only warrior-group classes keep exceptional STR at STR 18; others use -1 (no percentile).
 */
export function assignExceptionalStrength(
  character: ADNDCharacter,
  cls: ADNDClass,
  rng: RNG,
): void {
  if (character.strength !== 18 || !isWarriorClass(cls)) {
    character.exceptionalStrength = -1;
    return;
  }
  character.exceptionalStrength = rng.int(1, 100);
}
