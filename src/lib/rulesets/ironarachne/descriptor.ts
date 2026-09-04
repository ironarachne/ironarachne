import type { RulesetDescriptor, RulesetRef } from '../ruleset_types';
import { IRONARACHNE_ORIGINAL_SOURCE } from './source_manifest';

export const IRONARACHNE_RULESET_REF: RulesetRef = {
  id: 'ironarachne',
  release: '1',
};

/**
 * The compatibility release exists before its services move from the old common libraries.
 * Empty capabilities make that partial state explicit to callers.
 */
export const IRONARACHNE_RULESET_DESCRIPTOR: RulesetDescriptor = {
  ref: IRONARACHNE_RULESET_REF,
  displayName: 'Iron Arachne',
  capabilities: [],
  sourceIds: [IRONARACHNE_ORIGINAL_SOURCE.id],
};
