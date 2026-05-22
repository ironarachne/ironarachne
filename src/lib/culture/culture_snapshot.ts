import type { RNG } from '@ironarachne/rng';

import type { Culture } from '$lib/culture/culture_types';
import {
  nameGeneratorSetFromPatternSources,
  nameGeneratorSetToStoredPatternSet,
  type StoredNameGeneratorPatternSet,
} from '$lib/names/name_generator_patterns';
import { stripFunctionValuesDeep } from '$lib/persistent_save/strip_function_values_deep';

export { stripFunctionValuesDeep } from '$lib/persistent_save/strip_function_values_deep';

export type CultureSnapshot = Omit<Culture, 'nameGenerators'> & {
  nameGenerators: StoredNameGeneratorPatternSet;
};

export function toCultureSnapshot(culture: Culture): CultureSnapshot {
  const { nameGenerators, ...rest } = culture;
  return {
    ...(stripFunctionValuesDeep(rest) as Omit<Culture, 'nameGenerators'>),
    nameGenerators: nameGeneratorSetToStoredPatternSet(nameGenerators),
  };
}

export function cultureFromSnapshot(snapshot: CultureSnapshot, rng: RNG): Culture {
  return {
    ...snapshot,
    nameGenerators: nameGeneratorSetFromPatternSources(snapshot.nameGenerators, rng),
  };
}
