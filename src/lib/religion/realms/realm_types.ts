import type { Biome } from '$lib/environment/biomes/biome_types';
import type { Mutator } from '$lib/mutator';
import type { Deity } from '../deities';

export type AfterlifeType = 'reward' | 'punishment' | 'neutral' | 'other';

export type DivineRealm = {
  name: string;
  description: string;
  mutators: Mutator<Deity>[];
  biome?: Biome;
  role: DivineRealmRole;
};

export type DivineRealmGenerationConfig = {
  possibleTypes: DivineRealmType[];
  hasAfterlife: boolean;
  hasDivineAbode: boolean;
  hasElementalPlanes: boolean;
  minNumberOfRealms: number;
  maxNumberOfRealms: number;
};

export type DivineRealmRole =
  | 'punishment afterlife'
  | 'reward afterlife'
  | 'neutral afterlife'
  | 'divine abode'
  | 'mortal realm';

export type DivineRealmType = {
  name: string;
  nameGenerator: (seed: string) => string;
  descriptionGenerator: (seed: string) => string;
  mutators: Mutator<Deity>[];
  canBeAfterlife: boolean;
  afterlifeType?: AfterlifeType;
  canBeDivineAbode: boolean;
  canBeMortalRealm: boolean;
  isSingleBiome: boolean;
  biomeOptions: Biome[];
};
