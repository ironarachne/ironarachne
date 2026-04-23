import type { Character } from '$lib/characters/character_types.js';
import type { ChildToParent, IdToOrder } from '$lib/hierarchy/hierarchy_types.js';
import type { VisualIdentity } from '$lib/visual_identity/visual_identity_types.js';
import type { OrganizationRelationship } from './organization_relationships.js';

export type OrganizationGenre = 'fantasy' | 'science_fiction';

/**
 * A role in an organization's structure. Ids are per-kind and appear in
 * `childToParent` / `idToOrder` (larger `idToOrder` = higher standing).
 */
export type RoleId = string;

export type RoleInfo = {
  roleName: string;
};

/**
 * Structure only (no per-instance mutators). Use with {@link maxByOrder} for the leader.
 */
export type OrganizationHierarchy = {
  childToParent: ChildToParent<RoleId>;
  idToOrder: IdToOrder<RoleId>;
  roleById: ReadonlyMap<RoleId, RoleInfo>;
};

export type Organization = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  visualIdentity: VisualIdentity;
  hierarchy: OrganizationHierarchy;
  /** Highest-standing role, typically the same node as `maxByOrder` on the hierarchy. */
  leader: Character;
  notableMembers: Character[];
  relationships: OrganizationRelationship[];
  genre: OrganizationGenre;
  /** Stable id, e.g. `mercenary_company`, `sf_research_institute`. */
  kindId: string;
};
