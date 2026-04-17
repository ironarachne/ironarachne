import type { RNG } from '@ironarachne/rng';

import type { LanguageGeneratorConfig } from './language_types.js';
import { getAllPhonemeSets } from './phonemesets.js';

export type { LanguageGeneratorConfig } from './language_types.js';

export function getDefaultLanguageGeneratorConfig(rng: RNG): LanguageGeneratorConfig {
  return {
    phonemeSets: getAllPhonemeSets(),
    rng,
  };
}
