import type { Character } from '$lib/characters';
import type { CharacterGenerationConfig } from '$lib/characters';
import type { HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type OrganizationRank from './organization_rank';
import type { RNG } from '@ironarachne/rng';

export default interface OrganizationType {
  name: string;
  minSize: number;
  maxSize: number;
  leaderTitle: string;
  randomName: (rng: RNG) => string;
  randomDescription: (rng: RNG) => string;
  randomLeadership: (seed: string, characterGenConfig: CharacterGenerationConfig) => Character;
  randomMemberOfRank: (
    seed: string,
    rank: OrganizationRank,
    characterGenConfig: CharacterGenerationConfig,
  ) => Character;
  ranks: OrganizationRank[];
  heraldryConfig: HeraldryGeneratorConfig;
}
