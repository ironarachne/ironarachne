import type Character from "$lib/characters/character";
import type CharacterGeneratorConfig from "$lib/characters/character_generator_config";
import type GeneratorConfig from "$lib/heraldry/generatorconfig.js";
import type OrganizationRank from "./organization_rank";

export default interface OrganizationType {
  name: string;
  minSize: number;
  maxSize: number;
  leaderTitle: string;
  randomName: () => string;
  randomDescription: () => string;
  randomLeadership: (characterGenConfig: CharacterGeneratorConfig) => Character;
  randomMemberOfRank: (
    rank: OrganizationRank,
    characterGenConfig: CharacterGeneratorConfig,
  ) => Character;
  ranks: OrganizationRank[];
  heraldryConfig: GeneratorConfig;
}
