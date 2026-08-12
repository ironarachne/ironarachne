import { getArmor } from '../../adnd/equipment.js';
import type { EquipmentItem, EquipmentList } from '../list.js';

export const armorList: EquipmentList = {
  title: 'Armor and Shields',
  items: [
    ...getArmor().map((armor) => ({ name: armor.name, cost: armor.cost })),
    { name: 'helmet, open', cost: 200 },
    { name: 'helmet, great', cost: 600 },
    { name: 'coif, mail', cost: 400 },
    { name: 'gauntlets, leather', cost: 100 },
    { name: 'gauntlets, mail', cost: 500 },
    { name: 'greaves', cost: 400 },
    { name: 'vambraces', cost: 300 },
  ],
};
