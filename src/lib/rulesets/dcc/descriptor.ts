import type { RulesetDescriptor, RulesetRef } from '../ruleset_types';

/** Stable identity for existing pre-audit DCC snapshots; it asserts no source provenance. */
export const DCC_LEGACY_RULESET_REF = {
  id: 'dcc',
  release: 'legacy',
} as const satisfies RulesetRef;

/**
 * A readable catalog identity, not an enabled production mechanics package.
 *
 * Zero capabilities and zero sources are intentional until the Goodman Games agreement is
 * obtained, recorded, and approved.
 */
export const DCC_LEGACY_RULESET_DESCRIPTOR: RulesetDescriptor = {
  ref: DCC_LEGACY_RULESET_REF,
  displayName: 'Dungeon Crawl Classics (legacy)',
  gameSystem: 'dcc',
  capabilities: [],
  sourceIds: [],
};
