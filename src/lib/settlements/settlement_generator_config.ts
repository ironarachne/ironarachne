import type Environment from '$lib/environment/environment.js';
import type * as MUN from '@ironarachne/made-up-names';
import type { RNG } from '@ironarachne/rng';

export default interface SettlementGeneratorConfig {
  environment: Environment;
  nameGenerator: MUN.NameGenerator | null;
  size: string;
  rng: RNG;
}
