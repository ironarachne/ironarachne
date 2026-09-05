import { defineRuleset } from '../ruleset_definitions';
import { DND_5E_CURRENCY_RULES } from './currency';
import { DND_5E_RULESET_DESCRIPTOR } from './descriptor';
import { DND_5E_EQUIPMENT_RULES } from './equipment';
import { DND_5E_MECHANICS_CODEC } from './mechanics';
import { DND_5E_TREASURE_ITEM_RULES } from './treasure_items';

export const dnd5eRuleset = defineRuleset({
  descriptor: DND_5E_RULESET_DESCRIPTOR,
  mechanics: DND_5E_MECHANICS_CODEC,
  currency: DND_5E_CURRENCY_RULES,
  equipment: DND_5E_EQUIPMENT_RULES,
  treasureItems: DND_5E_TREASURE_ITEM_RULES,
});
