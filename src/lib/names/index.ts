import * as MUN from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';

export type NameGeneratorSet = {
  name: string;
  culture: MUN.NameGenerator;
  country: MUN.NameGenerator;
  family: MUN.NameGenerator;
  female: MUN.NameGenerator;
  male: MUN.NameGenerator;
  town: MUN.NameGenerator;
};

/**
 * The names of the fantasy pattern sets, without building a generator for any of them.
 *
 * {@link getAllFantasyNameGeneratorSets} answers the same question, but it needs an RNG and builds
 * six generators per set to do it. A caller that only wants to know which sets exist — to fill a
 * dropdown, or to draw one from a seed before rolling — should not pay for that.
 */
export function getFantasyNameGeneratorSetNames(): string[] {
  return MUN.getSupportedClassicRaceNamePatternSets();
}

export function getAllFantasyNameGeneratorSets(rng: RNG): NameGeneratorSet[] {
  const sets: NameGeneratorSet[] = [];
  const availableSets = MUN.getSupportedClassicRaceNamePatternSets();

  for (const setName of availableSets) {
    const patternSet = MUN.getClassicRaceNamePatternSet(setName);
    sets.push({
      name: setName,
      culture: MUN.getNameGeneratorForPatternSet('culture', patternSet.culture, rng),
      country: MUN.getNameGeneratorForPatternSet('country', patternSet.country, rng),
      family: MUN.getNameGeneratorForPatternSet('family', patternSet.family, rng),
      female: MUN.getNameGeneratorForPatternSet('female', patternSet.female, rng),
      male: MUN.getNameGeneratorForPatternSet('male', patternSet.male, rng),
      town: MUN.getNameGeneratorForPatternSet('town', patternSet.town, rng),
    });
  }

  return sets;
}

export function getFantasyNameGeneratorSet(setName: string, rng: RNG): NameGeneratorSet {
  const availableSets = MUN.getSupportedClassicRaceNamePatternSets();

  if (!availableSets.includes(setName)) {
    throw new Error(
      `Name pattern set "${setName}" is not available. Available sets: ${availableSets.join(', ')}`,
    );
  }

  const patternSet = MUN.getClassicRaceNamePatternSet(setName);

  return {
    name: setName,
    culture: MUN.getNameGeneratorForPatternSet('culture', patternSet.culture, rng),
    country: MUN.getNameGeneratorForPatternSet('country', patternSet.country, rng),
    family: MUN.getNameGeneratorForPatternSet('family', patternSet.family, rng),
    female: MUN.getNameGeneratorForPatternSet('female', patternSet.female, rng),
    male: MUN.getNameGeneratorForPatternSet('male', patternSet.male, rng),
    town: MUN.getNameGeneratorForPatternSet('town', patternSet.town, rng),
  };
}

export * from './name_generator_patterns';
