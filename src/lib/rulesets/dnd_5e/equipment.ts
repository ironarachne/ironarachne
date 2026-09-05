import type { EquipmentRules } from '../ruleset_types';
import { presentDnd5eItemMechanics, validateDnd5eItemMechanics } from './mechanics';

export const DND_5E_EQUIPMENT_RULES: EquipmentRules = {
  validateItem: validateDnd5eItemMechanics,
  presentItem: presentDnd5eItemMechanics,
};
