import * as Characters from '$lib/characters';
import { getOrganizationKindsForRegistry } from './kind_registry.js';
import type { OrganizationKindDefinition } from './organization_kind.js';
import type { CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';

/**
 * Default character config for organization-focused flows (e.g. fantasy org generator page).
 */
export function getDefaultOrganizationCharacterConfig(seed: string): CharacterGenerationConfig {
  return Characters.getDefaultCharacterGenerationConfig(`character-${seed}`);
}

/**
 * All fantasy kinds in the current registry (heraldry templates vary per `rng` snapshot).
 */
export function listFantasyKindDefinitions(rng: RNG): OrganizationKindDefinition[] {
  return getOrganizationKindsForRegistry(rng).filter((d) => d.genre === 'fantasy');
}
