import { defineRuleset } from '../ruleset_definitions';
import { DCC_LEGACY_RULESET_DESCRIPTOR } from './descriptor';

/** No mechanics services are enabled while the DCC source review is blocked. */
export const dccLegacyRuleset = defineRuleset({ descriptor: DCC_LEGACY_RULESET_DESCRIPTOR });
