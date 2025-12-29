import type { Armor, ArmorType } from "./equipment_types";

export const armorTypes: ArmorType[] = [
  {
    name: "padded",
    armorType: "light",
    defense: 1,
    description: "Soft armor made of quilted layers.",
  },
  {
    name: "leather",
    armorType: "light",
    defense: 2,
    description: "Armor made from toughened leather.",
  },
  {
    name: "studded leather",
    armorType: "light",
    defense: 3,
    description: "Leather armor reinforced with metal studs.",
  },
  {
    name: "hide",
    armorType: "medium",
    defense: 4,
    description: "Armor made from the tanned hides of animals.",
  },
  {
    name: "chain shirt",
    armorType: "medium",
    defense: 5,
    description: "A shirt made of interlocking metal rings.",
  },
  {
    name: "scale mail",
    armorType: "medium",
    defense: 6,
    description: "Armor made of small metal plates (scales) riveted to a backing material.",
  },
  {
    name: "breastplate",
    armorType: "medium",
    defense: 7,
    description: "A solid piece of metal armor covering the torso.",
  },
  {
    name: "half plate",
    armorType: "medium",
    defense: 8,
    description: "Armor made of metal plates covering most of the body.",
  },
  {
    name: "ring mail",
    armorType: "heavy",
    defense: 9,
    description: "Armor made of small metal rings linked together.",
  },
  {
    name: "chain mail",
    armorType: "heavy",
    defense: 10,
    description: "A suit of interlocking metal rings providing good protection.",
  },
  {
    name: "splint",
    armorType: "heavy",
    defense: 11,
    description: "Armor made of vertical metal strips riveted to a backing material.",
  },
  {
    name: "plate",
    armorType: "heavy",
    defense: 12,
    description: "Full body armor made of large metal plates.",
  }
];

export function generateArmor(id: string, type: ArmorType, name?: string): Armor {
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
  }
}

export function getValueOfArmorType(type: ArmorType): number {
  // Simple valuation based on armor type and defense
  const baseValue = 20;
  const typeMultiplier = type.armorType === 'light' ? 1 : type.armorType === 'medium' ? 1.5 : 2;
  return Math.floor(baseValue * type.defense * typeMultiplier);
}
