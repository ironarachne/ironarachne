import { defineRuleset } from '../ruleset_definitions';
import { IRONARACHNE_CURRENCY_RULES } from './currency_rules';
import { IRONARACHNE_RULESET_DESCRIPTOR } from './descriptor';
import { IRONARACHNE_MECHANICS_CODEC } from './mechanics';

export const ironArachneRuleset = defineRuleset({
  descriptor: IRONARACHNE_RULESET_DESCRIPTOR,
  mechanics: IRONARACHNE_MECHANICS_CODEC,
  currency: IRONARACHNE_CURRENCY_RULES,
});
