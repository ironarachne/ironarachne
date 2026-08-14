import { all } from '$lib/equipment';
import type { EquipmentItem } from '$lib/equipment';
import type { ResolvedShopType } from './merchant_types.js';

export const SHOP_TYPE_LABELS: Record<ResolvedShopType, string> = {
  general: 'General goods',
  weaponsmith: 'Weaponsmith',
  armorer: 'Armorer',
  apothecary: 'Apothecary',
  clothier: 'Clothier',
  provisioner: 'Provisioner',
  tavern: 'Tavern keeper',
  stable: 'Stable master',
  scribe: 'Scribe',
  jeweler: 'Jeweler',
};

export const RESOLVED_SHOP_TYPES: ResolvedShopType[] = [
  'general',
  'weaponsmith',
  'armorer',
  'apothecary',
  'clothier',
  'provisioner',
  'tavern',
  'stable',
  'scribe',
  'jeweler',
];

const SHOP_CATEGORIES: Record<ResolvedShopType, string[]> = {
  general: [
    'Food and Provisions',
    'Drinks',
    'Tools',
    'Household Goods',
    'Containers',
    'Lighting and Fuel',
    'Adventuring Gear',
  ],
  weaponsmith: ['Weapons', 'Ammunition', 'Tools'],
  armorer: ['Armor and Shields', 'Tools', 'Weapons'],
  apothecary: ['Medical and Herbal', 'Religious and Alchemical', 'Food and Provisions'],
  clothier: ['Clothing', 'Jewelry and Adornment'],
  provisioner: ['Food and Provisions', 'Drinks', 'Containers', 'Trade Goods and Materials'],
  tavern: ['Drinks', 'Food and Provisions', 'Services'],
  stable: ['Mounts', 'Livestock', 'Transport and Tack'],
  scribe: ['Writing and Stationery', 'Books and Education'],
  jeweler: ['Jewelry and Adornment', 'Religious and Alchemical', 'Trade Goods and Materials'],
};

export type CatalogEntry = EquipmentItem & { category: string };

export function getCatalogForShopType(shopType: ResolvedShopType): CatalogEntry[] {
  const allowedCategories = new Set(SHOP_CATEGORIES[shopType]);
  const entries: CatalogEntry[] = [];

  for (const list of all()) {
    if (!allowedCategories.has(list.title)) {
      continue;
    }
    for (const item of list.items) {
      entries.push({ ...item, category: list.title });
    }
  }

  return entries;
}
