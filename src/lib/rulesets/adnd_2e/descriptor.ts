import type { RulesetDescriptor, RulesetRef } from '../ruleset_types';
import { ADND_2E_OPEN_RULES_SOURCE } from './source_manifest';

/** Pinned identity: a later For Gold & Glory revision must register a new release. */
export const ADND_2E_RULESET_REF: RulesetRef = {
  id: 'adnd-2e',
  release: 'fgag-2.0.1',
};

export const ADND_2E_RULESET_DESCRIPTOR: RulesetDescriptor = {
  ref: ADND_2E_RULESET_REF,
  displayName: 'AD&D 2E',
  gameSystem: 'adnd-2e',
  capabilities: ['actor', 'item', 'currency', 'equipment', 'treasure-items'],
  sourceIds: [ADND_2E_OPEN_RULES_SOURCE.id],
};
