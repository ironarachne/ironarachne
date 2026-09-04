import * as RNG from '@ironarachne/rng';
import { withLegacyItemMechanics } from '$lib/rulesets';
import type { Armor, ArmorType } from './equipment_types';
import { applyMaterial, getRandomMaterialForItem } from './foundry';

export const armorTypes: ArmorType[] = [
  {
    name: 'padded armor',
    armorCategory: 'light',
    baseValue: 500,
    defense: 1,
    description: 'Soft armor made of quilted layers.',
    allowedMaterialTypes: ['fabric'],
  },
  {
    name: 'leather armor',
    armorCategory: 'light',
    baseValue: 1000,
    defense: 1,
    description: 'Armor made from toughened leather.',
    allowedMaterialTypes: ['leather'],
  },
  {
    name: 'studded leather',
    armorCategory: 'light',
    baseValue: 4500,
    defense: 2,
    description: 'Leather armor reinforced with metal studs.',
    allowedMaterialTypes: ['leather'],
  },
  {
    name: 'hide armor',
    armorCategory: 'medium',
    baseValue: 100,
    defense: 2,
    description: 'Armor made from the tanned hides of animals.',
    allowedMaterialTypes: ['hide'],
  },
  {
    name: 'chain shirt',
    armorCategory: 'medium',
    baseValue: 5000,
    defense: 3,
    description: 'A shirt made of interlocking metal rings.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'scale mail',
    armorCategory: 'medium',
    baseValue: 5000,
    defense: 4,
    description: 'Armor made of small metal plates (scales) riveted to a backing material.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'breastplate',
    armorCategory: 'medium',
    baseValue: 40000,
    defense: 4,
    description: 'A solid piece of metal armor covering the torso.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'half plate',
    armorCategory: 'medium',
    baseValue: 75000,
    defense: 5,
    description: 'Armor made of metal plates covering most of the body.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'ring mail',
    armorCategory: 'heavy',
    baseValue: 3000,
    defense: 4,
    description: 'Armor made of small metal rings linked together.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'chain mail',
    armorCategory: 'heavy',
    baseValue: 7500,
    defense: 6,
    description: 'A suit of interlocking metal rings providing good protection.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'splint',
    armorCategory: 'heavy',
    baseValue: 20000,
    defense: 7,
    description: 'Armor made of vertical metal strips riveted to a backing material.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'plate',
    armorCategory: 'heavy',
    baseValue: 150000,
    defense: 8,
    description: 'Full body armor made of large metal plates.',
    allowedMaterialTypes: ['metal'],
  },
];

export function createArmor(id: string, type: ArmorType, name?: string): Armor {
  return {
    id,
    name: name || type.name,
    description: type.description,
    value: getValueOfArmorType(type),
    rarity: 'common',
    itemMajorType: 'armor',
    itemMinorType: type.armorCategory,
    armorType: type,
    properties: [],
    combatProfile: {
      attack: 0,
      defense: type.defense,
      power: 0,
      resilience: 0,
      speed: 0,
      health: 0,
    },
    densityCategory: 'dense',
    weight: type.armorCategory === 'light' ? 10 : type.armorCategory === 'medium' ? 20 : 40,
  };
}

export function generateArmor(seed: string): Armor {
  const rng = new RNG.RNG(seed);
  const type = rng.item(armorTypes);
  const baseArmor = createArmor(seed, type);

  const material = getRandomMaterialForItem(baseArmor, rng);
  const foundryArmor = applyMaterial(baseArmor, material) as Armor;

  return withLegacyItemMechanics(foundryArmor, 'generated');
}

export function getValueOfArmorType(type: ArmorType): number {
  // Simple valuation based on armor type and defense
  const baseValue = 500;
  const typeMultiplier =
    type.armorCategory === 'light' ? 1 : type.armorCategory === 'medium' ? 1.5 : 2;
  const defenseModifier = type.defense;
  return Math.floor((baseValue + defenseModifier) * typeMultiplier);
}
