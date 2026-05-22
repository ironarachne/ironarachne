import { getWeapons } from '../../adnd/equipment.js';
import { EquipmentItem, EquipmentList } from '../list.js';

const excludedWeapons = new Set(['arquebus']);

export const weaponsList = new EquipmentList(
  'Weapons',
  getWeapons()
    .filter((weapon) => !excludedWeapons.has(weapon.name))
    .map((weapon) => new EquipmentItem(weapon.name, weapon.cost)),
);
