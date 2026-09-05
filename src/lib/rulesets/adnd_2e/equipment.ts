import type { EquipmentRules } from '../ruleset_types';
import { presentAdnd2eItemMechanics, validateAdnd2eItemMechanics } from './mechanics';

export const ADND_2E_EQUIPMENT_RULES: EquipmentRules = {
  validateItem: validateAdnd2eItemMechanics,
  presentItem: presentAdnd2eItemMechanics,
};
