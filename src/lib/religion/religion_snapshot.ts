import { stripFunctionValuesDeep } from '$lib/persistent_save';

import type {
  PolytheisticStandingMode,
  SpiritCosmologyDepthMode,
} from './religion_complexity_types';
import type { Religion } from './religion_types';

export type ReligionGeneratorOptionsSnapshot = {
  lockSeed: boolean;
  selectedCategories: string[];
  selectedSpecies: string[];
  polytheisticStanding: PolytheisticStandingMode;
  spiritCosmologyDepth: SpiritCosmologyDepthMode;
  useSavedCulture: boolean;
  savedCultureName?: string;
};

export type ReligionSnapshot = {
  name: string;
  seed: string;
  generatorOptions: ReligionGeneratorOptionsSnapshot;
  religion: Religion;
};

export type RestoredReligion = {
  religion: Religion;
  seed: string;
  generatorOptions: ReligionGeneratorOptionsSnapshot;
};

export function toReligionSnapshot(
  religion: Religion,
  seed: string,
  generatorOptions: ReligionGeneratorOptionsSnapshot,
): ReligionSnapshot {
  return {
    name: religion.name,
    seed,
    generatorOptions,
    religion: stripFunctionValuesDeep(religion) as Religion,
  };
}

export function religionFromSnapshot(snapshot: ReligionSnapshot): RestoredReligion {
  return {
    religion: snapshot.religion,
    seed: snapshot.seed,
    generatorOptions: snapshot.generatorOptions,
  };
}
