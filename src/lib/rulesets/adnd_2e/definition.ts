import { defineRuleset } from '../ruleset_definitions';
import { ADND_2E_CURRENCY_RULES } from './currency';
import { ADND_2E_RULESET_DESCRIPTOR } from './descriptor';
import { ADND_2E_EQUIPMENT_RULES } from './equipment';
import { ADND_2E_MECHANICS_CODEC } from './mechanics';
import { ADND_2E_TREASURE_ITEM_RULES } from './treasure_items';

export const adnd2eRuleset = defineRuleset({
  descriptor: ADND_2E_RULESET_DESCRIPTOR,
  mechanics: ADND_2E_MECHANICS_CODEC,
  currency: ADND_2E_CURRENCY_RULES,
  equipment: ADND_2E_EQUIPMENT_RULES,
  treasureItems: ADND_2E_TREASURE_ITEM_RULES,
});
