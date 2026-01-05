import * as RNG from '@ironarachne/rng';
import {
  type Item,
  type Weapon,
  type Armor,
  type WeaponType,
  type ArmorType
} from './equipment_types';
import { weaponTypes } from './weapons';
import { armorTypes } from './armor';
import { applyMaterial, getRandomMaterialForItem } from './foundry';
import { applyRefinement, getRandomRefinement } from './refinery';
import { applyEnchantment, getRandomEnchantment } from './enchanter';
import { applyDecoration, getRandomDecoration } from './decorator';
import { generateDescription } from './descriptor';

export type EquipmentGenerationConfig = {
  itemType: 'any' | 'weapon' | 'armor';
  useRefine: boolean;
  useEnchant: boolean;
  useDecorate: boolean;
};

export function createBaseWeapon(type: WeaponType, rng: RNG.RNG): Weapon {
  // Rough mapping of damage to power
  // Power / 5 = Average Damage
  let power = 10;
  if (type.damage.includes('d4')) power = 12; // Avg 2.5
  if (type.damage.includes('d6')) power = 17; // Avg 3.5
  if (type.damage.includes('d8')) power = 22; // Avg 4.5
  if (type.damage.includes('d10')) power = 27; // Avg 5.5
  if (type.damage.includes('d12')) power = 32; // Avg 6.5
  if (type.damage.includes('2d6')) power = 35; // Avg 7

  return {
    id: rng.randomString(16),
    name: type.name,
    description: type.description,
    itemMajorType: 'weapon',
    itemMinorType: type.weaponType,
    value: 100, // Base value, should probably be in the type definition
    rarity: 'common',
    densityCategory: 'standard',
    weight: 1, // Base weight
    properties: ['weapon', type.damageType, type.weaponType],
    damage: type.damage,
    damageType: type.damageType,
    weaponType: type.weaponType,
    range: type.range,
    hands: type.hands,
    allowedMaterialTypes: type.allowedMaterialTypes,
    combatProfile: {
      attack: 0,
      defense: 0,
      power,
      resilience: 0,
      speed: 0,
      health: 0
    }
  };
}

export function createBaseArmor(type: ArmorType, rng: RNG.RNG): Armor {
  // Rough mapping of armor type to defense
  // 10 + Defense / 5 = AC
  let defense = 5; // Light (AC 11)
  if (type.armorType === 'medium') defense = 15; // Medium (AC 13)
  if (type.armorType === 'heavy') defense = 40; // Heavy (AC 18)

  return {
    id: rng.randomString(16),
    name: type.name,
    description: type.description,
    itemMajorType: 'armor',
    itemMinorType: type.armorType,
    value: 100, // Base value
    rarity: 'common',
    densityCategory: 'standard',
    weight: 1, // Base weight
    properties: ['armor', type.armorType],
    defense: type.defense,
    armorType: type.armorType,
    allowedMaterialTypes: type.allowedMaterialTypes,
    combatProfile: {
      attack: 0,
      defense,
      power: 0,
      resilience: 0,
      speed: 0,
      health: 0
    }
  };
}

export function roundValue(value: number): number {
  if (value < 1000) return value; // < 10 gp: Exact
  if (value < 10000) return Math.round(value / 10) * 10; // 10-100 gp: Round to 1 sp
  if (value < 100000) return Math.round(value / 100) * 100; // 100-1000 gp: Round to 1 gp
  if (value < 1000000) return Math.round(value / 1000) * 1000; // 1000-10000 gp: Round to 10 gp
  return Math.round(value / 10000) * 10000; // > 10000 gp: Round to 100 gp
}

export function generateItem(config: EquipmentGenerationConfig, rng: RNG.RNG): Item {
  let baseItem: Item;
  let typeChoice = config.itemType;

  if (typeChoice === 'any') {
    typeChoice = rng.item(['weapon', 'armor']);
  }

  if (typeChoice === 'weapon') {
    const type = rng.item(weaponTypes);
    baseItem = createBaseWeapon(type, rng);
  } else {
    const type = rng.item(armorTypes);
    baseItem = createBaseArmor(type, rng);
  }

  // Phase 1: Foundry (Always run)
  const material = getRandomMaterialForItem(baseItem, rng);
  let item = applyMaterial(baseItem, material);

  // Phase 2: Refinery
  if (config.useRefine) {
    // Chance to refine? Or always refine if checked?
    // Let's say 50% chance to have a refinement if checked, to add variety
    if (rng.simple(100) > 50) {
      const refinement = getRandomRefinement(item, rng);
      if (refinement) {
        item = applyRefinement(item, refinement);
      }
    }
  }

  // Phase 3: Enchanter
  if (config.useEnchant) {
    if (rng.simple(100) > 80) { // 20% chance for magic item
      const enchantment = getRandomEnchantment(item, rng);
      if (enchantment) {
        item = applyEnchantment(item, enchantment);
      }
    }
  }

  // Phase 4: Decorator
  if (config.useDecorate) {
    if (rng.simple(100) > 50) {
      const decoration = getRandomDecoration(item, rng);
      if (decoration) {
        item = applyDecoration(item, decoration);
      }
    }
  }

  item.value = roundValue(item.value);
  item.description = generateDescription(item);

  return item;
}
