import type { Character } from '$lib/characters';
import type { ChildToParent, IdToOrder } from '$lib/hierarchy';
import type { VisualIdentity } from '$lib/visual_identity';
import type { OrganizationRelationship } from './organization_relationships.js';

/**
 * For tools and unit tests; when set alongside `environment` on the generator, this wins
 * for environment narrative (see `resolveEnvironmentNarrative` in `organization_profile.ts`).
 */
export type OrganizationWorldContextPreset =
  | 'desert_route'
  | 'coastal'
  | 'mountain_pass'
  | 'river_trade'
  | 'tundra'
  | 'jungle_march'
  | 'void_ledger'
  | 'rim_wilderness'
  | 'dome_sprawl';

export type OrganizationWorldContext =
  | { kind: 'preset'; preset: OrganizationWorldContextPreset }
  | { kind: 'hint'; text: string };

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

/** Discrete facet for tests and UI; `label` text is woven into the composed description. */
export type LabeledOrgFacet = {
  id: string;
  label: string;
};

/** When present, `shortLabel` appears in the narrative and matches discrete context. */
export type OrganizationEnvironmentNarrative = {
  id: string;
  shortLabel: string;
};

/**
 * Verifiable "personality" and aims; narrative is composed from this object in one pass
 * (no separate RNG for reputation or environment after the fact).
 */
export type OrganizationProfile = {
  /** 2–3 items; each `label` appears in {@link Organization.description}. */
  personalityTraits: LabeledOrgFacet[];
  goal: LabeledOrgFacet;
  weakness: LabeledOrgFacet;
  publicStanding: LabeledOrgFacet;
  /**
   * Opening line with the organization name already substituted (replaces legacy one-line hooks).
   */
  hook: string;
  environmentNarrative?: OrganizationEnvironmentNarrative;
};

export type Organization = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  /** Structured traits, goal, weakness, and standing; aligned with `description`. */
  profile: OrganizationProfile;
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
