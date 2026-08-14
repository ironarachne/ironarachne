// `organizations.ts` is the library's facade and re-exports the generator, the kind registry, the
// relationship helpers, and the shared types. The modules below it add the names it does not carry.
//
// The kind builders under `kinds/` are absent: they are reached through the kind registry, which is
// what `getKindsForGenerator` and `getOrganizationKindById` exist to do.
export * from './organizations';
export * from './fantasy';
export * from './kind_registry';
export * from './member_mutations';
export * from './organization_hierarchy_builders';
export type * from './organization_naming';
export * from './organization_profile';
export * from './organization_relationships';
export type * from './organization_types';
export * from './science_fiction';

export * as FantasyOrganizations from './fantasy';
