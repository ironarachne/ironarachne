import { getWeapons } from '../../adnd/equipment.js';
import type { EquipmentList } from '../list.js';

const excludedWeapons = new Set(['arquebus']);

export const weaponsList: EquipmentList = {
  title: 'Weapons',
  items: getWeapons()
    .filter((weapon) => !excludedWeapons.has(weapon.name))
    .map((weapon) => ({ name: weapon.name, cost: weapon.cost })),
};
