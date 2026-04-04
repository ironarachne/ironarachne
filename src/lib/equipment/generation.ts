import * as RNG from '@ironarachne/rng';
import * as MUN from '@ironarachne/made-up-names';
import {
  type Item,
  type Weapon,
  type Armor,
  type WeaponType,
  type ArmorType,
  type Material,
  type Refinement,
  type Enchantment,
  type Decoration,
} from './equipment_types';
import { weaponTypes } from './weapons';
import { armorTypes } from './armor';
import { applyMaterial, getRandomMaterialForItem } from './foundry';
import { applyRefinement, getRandomRefinement } from './refinery';
import { applyEnchantment, getRandomEnchantment } from './enchanter';
import { applyDecoration, getRandomDecoration } from './decorator';
import { generateDescription } from './descriptor';
import { MATERIALS } from './materials';
import { REFINEMENTS } from './refinements';
import { ENCHANTMENTS } from './enchantments';
import { DECORATIONS } from './decorations';

export type EquipmentGenerationConfig = {
  itemMajorType: 'any' | 'weapon' | 'armor';
  itemMinorType?: string;
  useRefine: boolean;
  useEnchant: boolean;
  useDecorate: boolean;
  useUniqueNames: boolean;
  refinementChance: number; // 1-100, roll under
  enchantmentChance: number; // 1-100, roll under
  decorationChance: number; // 1-100, roll under
  materials: Material[];
  refinements: Refinement[];
  enchantments: Enchantment[];
  decorations: Decoration[];
};

export function createBaseWeapon(type: WeaponType, rng: RNG.RNG): Weapon {
  const properties = ['weapon', type.name];
  if (type.baseActions.length > 0 && type.baseActions[0].damageType) {
    properties.push(type.baseActions[0].damageType);
  }

  return {
    id: rng.randomString(16),
    name: type.name,
    description: type.description,
    itemMajorType: 'weapon',
    itemMinorType: type.name,
    weaponType: type,
    value: type.baseValue,
    rarity: 'common',
    densityCategory: 'standard',
    weight: 1, // Base weight
    properties: properties,
    allowedMaterialTypes: type.allowedMaterialTypes,
    actions: [...type.baseActions],
    combatProfile: {
      attack: 0,
      defense: 0,
      power: type.baseActions[0]?.baseDamage || 0,
      resilience: 0,
      speed: 0,
      health: 0,
    },
  };
}

export function createBaseArmor(type: ArmorType, rng: RNG.RNG): Armor {
  return {
    id: rng.randomString(16),
    name: type.name,
    description: type.description,
    itemMajorType: 'armor',
    itemMinorType: type.name,
    armorType: type,
    value: type.baseValue,
    rarity: 'common',
    densityCategory: 'standard',
    weight: 5, // Base weight
    properties: ['armor', type.name],
    allowedMaterialTypes: type.allowedMaterialTypes,
    combatProfile: {
      attack: 0,
      defense: type.defense,
      power: 0,
      resilience: 0,
      speed: 0,
      health: 0,
    },
  };
}

export function roundValue(value: number): number {
  if (value < 1000) return value; // < 10 gp: Exact
  if (value < 10000) return Math.round(value / 10) * 10; // 10-100 gp: Round to 1 sp
  if (value < 100000) return Math.round(value / 100) * 100; // 100-1000 gp: Round to 1 gp
  if (value < 1000000) return Math.round(value / 1000) * 1000; // 1000-10000 gp: Round to 10 gp
  return Math.round(value / 10000) * 10000; // > 10000 gp: Round to 100 gp
}

export function generateItem(seed: string, config: EquipmentGenerationConfig): Item {
  const rng = new RNG.RNG(seed);

  let baseItem: Item;
  let typeChoice = config.itemMajorType;

  if (typeChoice === 'any') {
    typeChoice = rng.item(['weapon', 'armor']);
  }

  if (typeChoice === 'weapon') {
    if (config.itemMinorType) {
      const filteredTypes = weaponTypes.filter((t) => t.name === config.itemMinorType);
      const type = rng.item(filteredTypes);
      baseItem = createBaseWeapon(type, rng);
    } else {
      const type = rng.item(weaponTypes);
      baseItem = createBaseWeapon(type, rng);
    }
  } else {
    if (config.itemMinorType) {
      const filteredTypes = armorTypes.filter((t) => t.name === config.itemMinorType);
      const type = rng.item(filteredTypes);
      baseItem = createBaseArmor(type, rng);
    } else {
      const type = rng.item(armorTypes);
      baseItem = createBaseArmor(type, rng);
    }
  }

  // Phase 1: Foundry (Always run)
  const material = getRandomMaterialForItem(baseItem, rng, config.materials);
  let item = applyMaterial(baseItem, material);

  // Phase 2: Refinery
  if (config.useRefine) {
    if (rng.simple(100) <= config.refinementChance) {
      const refinement = getRandomRefinement(item, rng, config.refinements);
      if (refinement) {
        item = applyRefinement(item, refinement);
      }
    }
  }

  // Phase 3: Enchanter
  if (config.useEnchant) {
    if (rng.simple(100) <= config.enchantmentChance) {
      const enchantment = getRandomEnchantment(item, rng, config.enchantments);
      if (enchantment) {
        item = applyEnchantment(item, enchantment);
      }
    }
  }

  // Phase 4: Decorator
  if (config.useDecorate) {
    if (rng.simple(100) <= config.decorationChance) {
      const decoration = getRandomDecoration(item, rng, config.decorations);
      if (decoration) {
        item = applyDecoration(item, decoration);
      }
    }
  }

  // Phase 5: Unique Name
  if (config.useUniqueNames) {
    const nameGenerator = MUN.getMagicItemNameGenerator(rng);
    item.uniqueName = nameGenerator.generate(1)[0];
  }

  item.value = roundValue(item.value);
  item.description = generateDescription(item);

  return item;
}

export function getDefaultGenerationConfig(): EquipmentGenerationConfig {
  const materials = Object.values(MATERIALS);
  const refinements = Object.values(REFINEMENTS);
  const enchantments = Object.values(ENCHANTMENTS);
  const decorations = Object.values(DECORATIONS);

  return {
    itemMajorType: 'any',
    itemMinorType: undefined,
    useRefine: true,
    useEnchant: true,
    useDecorate: true,
    useUniqueNames: false,
    refinementChance: 50,
    enchantmentChance: 20,
    decorationChance: 50,
    materials,
    refinements,
    enchantments,
    decorations,
  };
}

export function getArmorGenerationConfig(minorType?: string): EquipmentGenerationConfig {
  const config = getDefaultGenerationConfig();
  config.itemMajorType = 'armor';
  if (minorType) {
    config.itemMinorType = minorType;
  }
  return config;
}

export function getWeaponGenerationConfig(minorType?: string): EquipmentGenerationConfig {
  const config = getDefaultGenerationConfig();
  config.itemMajorType = 'weapon';
  if (minorType) {
    config.itemMinorType = minorType;
  }
  return config;
}
