import type { Species } from '$lib/species';
import type { NameGenerator } from '@ironarachne/made-up-names';
import type {
  ReligionDimensionGenerationConfig,
  ReligionDimensionHints,
  ReligionDimensions,
} from './comparative_dimension_types';
import type {
  ReligionCosmology,
  PolytheisticStandingMode,
  SpiritCosmologyDepthMode,
} from './religion_complexity_types';
import type { NonTheisticReligionDetail } from './non_theistic_religion_types';
import type { Pantheon } from './pantheons/pantheon_types';
import type { DivineRealm } from './realms/realm_types';

export type Religion = {
  name: string;
  description: string;
  /** Structured comparative-religion dimensions (Smart); keys omitted when excluded from generation. */
  dimensions?: ReligionDimensions;
  /** Intermediate beings and spirit orders around the high gods (when generated). */
  cosmology?: ReligionCosmology;
  /** Category-specific spirit ecology, duties, and mediation (non-theistic traditions only). */
  nonTheisticDetail?: NonTheisticReligionDetail;
  realms: DivineRealm[];
  pantheon: Pantheon | null;
};

export type ReligionCategory = {
  name: string;
  description: string;
  hasDeities: boolean;
  hasLeader: boolean;
  minDeities: number;
  maxDeities: number;
  /** Biases dimension RNG pools; combine with `dimensionGeneration` overrides for hard constraints. */
  dimensionHints?: ReligionDimensionHints;
};

export type ReligionGenerationConfig = {
  categories: ReligionCategory[];
  deitySpeciesOptions: Species[];
  nameGenerator: NameGenerator;
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;
  dimensionGeneration?: ReligionDimensionGenerationConfig;
  /** When the drawn category is polytheistic: how equal vs stratified the high gods are. Default `random`. */
  polytheisticStanding?: PolytheisticStandingMode;
  /** For religions with deities: density of spirit orders (messengers, ancestors, etc.). Default `random`. */
  spiritCosmologyDepth?: SpiritCosmologyDepthMode;
};
