export {
  generateOrganization,
  getOrganizationTypeDefinitionByName,
  getTypeByName,
} from './generate_organization.js';
export type { GenerateOrganizationOptions, OrganizationSizeInput } from './generate_organization.js';

/**
 * @deprecated use {@link generateOrganization}; kept for a short transition from the old config-based API
 */
export { generateOrganization as generate } from './generate_organization.js';

export { addRandomRivalryBetweenPairs } from './organization_relationships.js';
export type { OrganizationKindDefinition } from './organization_kind.js';
export type { Organization, OrganizationHierarchy, RoleId, OrganizationGenre } from './organization_types.js';
export {
  getOrganizationKindsForRegistry,
  getOrganizationKindById,
  getOrganizationKindByIdOrLabel,
} from './kind_registry.js';
