import { type Character } from '$lib/characters/character_types.js';
import { type CharacterGeneratorConfig } from '$lib/characters/character_types.js';
import type { Arms } from '$lib/heraldry/arms.js';
import type OrganizationRank from './organization_rank.js';
import type OrganizationType from './organization_type.js';

export default interface Organization {
  name: string;
  organizationType: OrganizationType;
  characterGenConfig: CharacterGeneratorConfig;
  description: string;
  memberCount: number;
  leadership: Character;
  notableMembers: Character[];
  ranks: OrganizationRank[];
  heraldry: Arms | null;
}
