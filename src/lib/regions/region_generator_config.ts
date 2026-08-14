import { type Culture } from '$lib/culture';
import type { NameGeneratorSet } from '$lib/names';
import type { RNG } from '@ironarachne/rng';

export default interface RegionGeneratorConfig {
  nameGeneratorSet: NameGeneratorSet;
  dominantCulture: Culture | null;
  mapWidth: number;
  mapHeight: number;
  minRealms: number;
  maxRealms: number;
  rng: RNG;
}
