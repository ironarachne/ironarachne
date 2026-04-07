import { type CharacterGeneratorConfig } from '$lib/characters/character_types';
import type OrganizationType from './organization_type';
import type { RNG } from '@ironarachne/rng';

export default interface OrganizationGeneratorConfig {
  organizationTypes: OrganizationType[];
  characterConfig: CharacterGeneratorConfig;
  rng: RNG;
}
