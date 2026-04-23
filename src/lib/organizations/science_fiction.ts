import { getOrganizationKindsForRegistry } from './kind_registry.js';
import type { OrganizationKindDefinition } from './organization_kind.js';
import type { RNG } from '@ironarachne/rng';

/**
 * All science-fiction kinds in the current registry.
 */
export function listScienceFictionKindDefinitions(rng: RNG): OrganizationKindDefinition[] {
  return getOrganizationKindsForRegistry(rng).filter((d) => d.genre === 'science_fiction');
}
