import type { Combination, NameGenerator, PatternSet } from '@ironarachne/made-up-names';
import * as MUN from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';

import type { NameGeneratorSet } from '$lib/names';

export type StoredNameGeneratorPatternSet = {
  name: string;
  culture: string[] | PatternSet;
  country: string[] | PatternSet;
  family: string[] | PatternSet;
  female: string[] | PatternSet;
  male: string[] | PatternSet;
  town: string[] | PatternSet;
};

type GeneratorWithPatterns = NameGenerator & {
  patterns: string[];
  combinations?: Combination[];
};

function isGeneratorWithPatterns(gen: NameGenerator): gen is GeneratorWithPatterns {
  return (
    'patterns' in gen &&
    Array.isArray((gen as GeneratorWithPatterns).patterns)
  );
}

/**
 * Extracts JSON-safe pattern inputs from a live {@link NameGenerator} (typically {@link MUN.BaseNameGenerator}).
 */
export function patternSourceFromNameGenerator(gen: NameGenerator): string[] | PatternSet {
  if (!isGeneratorWithPatterns(gen)) {
    throw new Error('Name generator cannot be persisted: missing patterns array.');
  }
  const combinations = gen.combinations;
  if (Array.isArray(combinations) && combinations.length > 0) {
    return {
      patterns: [...gen.patterns],
      combinations: combinations.map((c) => c.map((row) => [...row])),
    };
  }
  return [...gen.patterns];
}

export function nameGeneratorSetToStoredPatternSet(set: NameGeneratorSet): StoredNameGeneratorPatternSet {
  return {
    name: set.name,
    culture: patternSourceFromNameGenerator(set.culture),
    country: patternSourceFromNameGenerator(set.country),
    family: patternSourceFromNameGenerator(set.family),
    female: patternSourceFromNameGenerator(set.female),
    male: patternSourceFromNameGenerator(set.male),
    town: patternSourceFromNameGenerator(set.town),
  };
}

export function nameGeneratorSetFromPatternSources(
  sources: StoredNameGeneratorPatternSet,
  rng: RNG,
): NameGeneratorSet {
  return {
    name: sources.name,
    culture: MUN.getNameGeneratorForPatternSet('culture', sources.culture, rng),
    country: MUN.getNameGeneratorForPatternSet('country', sources.country, rng),
    family: MUN.getNameGeneratorForPatternSet('family', sources.family, rng),
    female: MUN.getNameGeneratorForPatternSet('female', sources.female, rng),
    male: MUN.getNameGeneratorForPatternSet('male', sources.male, rng),
    town: MUN.getNameGeneratorForPatternSet('town', sources.town, rng),
  };
}
