import type { RNG } from '@ironarachne/rng';

import type { Culture } from '$lib/culture/culture_types';
import {
  nameGeneratorSetFromPatternSources,
  nameGeneratorSetToStoredPatternSet,
  type StoredNameGeneratorPatternSet,
} from '$lib/names/name_generator_patterns';

export type CultureSnapshot = Omit<Culture, 'nameGenerators'> & {
  nameGenerators: StoredNameGeneratorPatternSet;
};

/** Removes function-valued properties for JSON-safe persistence of nested culture fields (e.g. religion helpers). */
export function stripFunctionValuesDeep(value: unknown): unknown {
  if (typeof value === 'function') {
    return undefined;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripFunctionValuesDeep(item));
  }
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === 'function') {
      continue;
    }
    out[key] = stripFunctionValuesDeep(child);
  }
  return out;
}

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
