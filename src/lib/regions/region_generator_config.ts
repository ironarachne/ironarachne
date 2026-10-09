import { type Culture } from '$lib/culture';
import type { NameGeneratorSet } from '$lib/names';
import type { RNG } from '@ironarachne/rng';

import type { RegionAffiliationMode } from './region_affiliation_types';

export default interface RegionGeneratorConfig {
  nameGeneratorSet: NameGeneratorSet;
  dominantCulture: Culture | null;
  mapWidth: number;
  mapHeight: number;
  affiliation: RegionAffiliationMode;
  generateNeighbors: boolean;
  minRealms: number;
  maxRealms: number;
  rng: RNG;
}
