import type Character from '$lib/characters/character';
import type CharacterGeneratorConfig from '$lib/characters/character_generator_config';
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
  randomLeadership: (characterGenConfig: CharacterGeneratorConfig) => Character;
  randomMemberOfRank: (
    rank: OrganizationRank,
    characterGenConfig: CharacterGeneratorConfig,
  ) => Character;
  ranks: OrganizationRank[];
  heraldryConfig: HeraldryGeneratorConfig;
}
