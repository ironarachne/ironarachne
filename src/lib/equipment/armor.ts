import * as RNG from '@ironarachne/rng';
import type { Armor, ArmorType } from './equipment_types';
import { applyMaterial, getRandomMaterialForItem } from './foundry';

export const armorTypes: ArmorType[] = [
  {
    name: 'padded',
    armorType: 'light',
    defense: 1,
    description: 'Soft armor made of quilted layers.',
    allowedMaterialTypes: ['cloth'],
  },
  {
    name: 'leather',
    armorType: 'light',
    defense: 2,
    description: 'Armor made from toughened leather.',
    allowedMaterialTypes: ['leather'],
  },
  {
    name: 'studded leather',
    armorType: 'light',
    defense: 3,
    description: 'Leather armor reinforced with metal studs.',
    allowedMaterialTypes: ['leather'],
  },
  {
    name: 'hide',
    armorType: 'medium',
    defense: 4,
    description: 'Armor made from the tanned hides of animals.',
    allowedMaterialTypes: ['hide'],
  },
  {
    name: 'chain shirt',
    armorType: 'medium',
    defense: 5,
    description: 'A shirt made of interlocking metal rings.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'scale mail',
    armorType: 'medium',
    defense: 6,
    description: 'Armor made of small metal plates (scales) riveted to a backing material.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'breastplate',
    armorType: 'medium',
    defense: 7,
    description: 'A solid piece of metal armor covering the torso.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'half plate',
    armorType: 'medium',
    defense: 8,
    description: 'Armor made of metal plates covering most of the body.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'ring mail',
    armorType: 'heavy',
    defense: 9,
    description: 'Armor made of small metal rings linked together.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'chain mail',
    armorType: 'heavy',
    defense: 10,
    description: 'A suit of interlocking metal rings providing good protection.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'splint',
    armorType: 'heavy',
    defense: 11,
    description: 'Armor made of vertical metal strips riveted to a backing material.',
    allowedMaterialTypes: ['metal'],
  },
  {
    name: 'plate',
    armorType: 'heavy',
    defense: 12,
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
    itemMinorType: type.armorType,
    properties: [],
    defense: type.defense,
    densityCategory: 'dense',
    weight: type.armorType === 'light' ? 10 : type.armorType === 'medium' ? 20 : 40,
    armorType: type.armorType,
  };
}

export function generateArmor(seed: string): Armor {
  const rng = new RNG.RNG(seed);
  const type = rng.item(armorTypes);
  const baseArmor = createArmor(seed, type);

  const material = getRandomMaterialForItem(baseArmor, rng);
  const foundryArmor = applyMaterial(baseArmor, material) as Armor;

  return foundryArmor;
}

export function getValueOfArmorType(type: ArmorType): number {
  // Simple valuation based on armor type and defense
  const baseValue = 20;
  const typeMultiplier = type.armorType === 'light' ? 1 : type.armorType === 'medium' ? 1.5 : 2;
  return Math.floor(baseValue * type.defense * typeMultiplier);
}
