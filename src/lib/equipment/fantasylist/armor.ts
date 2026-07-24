import { getArmor } from '../../adnd/equipment.js';
import { EquipmentItem, EquipmentList } from '../list.js';

export const armorList = new EquipmentList('Armor and Shields', [
  ...getArmor().map((armor) => new EquipmentItem(armor.name, armor.cost)),
  new EquipmentItem('helmet, open', 200),
  new EquipmentItem('helmet, great', 600),
  new EquipmentItem('coif, mail', 400),
  new EquipmentItem('gauntlets, leather', 100),
  new EquipmentItem('gauntlets, mail', 500),
  new EquipmentItem('greaves', 400),
  new EquipmentItem('vambraces', 300),
]);
