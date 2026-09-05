import type { RulesetDescriptor, RulesetRef } from '../ruleset_types';
import { DND_5E_SRD_SOURCE } from './source_manifest';

/** Pinned to the 2014-rules SRD 5.1; SRD 5.2 and later require separate releases. */
export const DND_5E_RULESET_REF = {
  id: 'dnd-5e',
  release: 'srd-5.1-cc',
} as const satisfies RulesetRef;

export const DND_5E_RULESET_DESCRIPTOR: RulesetDescriptor = {
  ref: DND_5E_RULESET_REF,
  displayName: 'D&D 5e (SRD 5.1)',
  gameSystem: 'dnd-5e',
  capabilities: ['actor', 'item', 'currency', 'equipment', 'treasure-items'],
  sourceIds: [DND_5E_SRD_SOURCE.id],
};
