import * as RNG from '@ironarachne/rng';
import type { Material } from '../equipment';

/**
 * A collection of materials used for crafting equipment.
 * Each material has properties defining its type, density, value, and rarity.
 */
export const MATERIALS: Record<string, Material> = {
  adamantine: {
    name: 'adamantine',
    majorType: 'metal',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 1.0,
    valueMultiplier: 20.0,
    rarity: 'rare',
    statOffsets: { ac: 2, damage: 1, hardness: 5 },
    tagsAdded: ['indestructible'],
  },
  amber: {
    name: 'amber',
    majorType: 'stone',
    minorType: 'ornamental',
    densityCategory: 'standard',
    weightMultiplier: 0.6,
    valueMultiplier: 5.0,
    rarity: 'uncommon',
  },
  ash: {
    name: 'ash',
    majorType: 'wood',
    minorType: 'hardwood',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 1.2,
    rarity: 'common',
  },
  bamboo: {
    name: 'bamboo',
    majorType: 'wood',
    minorType: 'flexible',
    densityCategory: 'airy',
    weightMultiplier: 0.5,
    valueMultiplier: 1.0,
    rarity: 'common',
  },
  basalt: {
    name: 'basalt',
    majorType: 'stone',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 1.3,
    valueMultiplier: 0.5,
    rarity: 'common',
  },
  birch: {
    name: 'birch',
    majorType: 'wood',
    minorType: 'softwood',
    densityCategory: 'standard',
    weightMultiplier: 0.9,
    valueMultiplier: 1.0,
    rarity: 'common',
  },
  boiled_leather: {
    name: 'boiled leather',
    majorType: 'leather',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 1.1,
    valueMultiplier: 1.2,
    rarity: 'common',
  },
  bone: {
    name: 'bone',
    majorType: 'bone',
    minorType: 'common',
    densityCategory: 'standard',
    weightMultiplier: 0.5,
    valueMultiplier: 0.1,
    rarity: 'common',
  },
  bronze: {
    name: 'bronze',
    majorType: 'metal',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 1.2,
    valueMultiplier: 1.5,
    rarity: 'common',
  },
  buckskin: {
    name: 'buckskin',
    majorType: 'leather',
    minorType: 'soft',
    densityCategory: 'standard',
    weightMultiplier: 0.9,
    valueMultiplier: 1.5,
    rarity: 'common',
  },
  chert: {
    name: 'chert',
    majorType: 'stone',
    minorType: 'sharp',
    densityCategory: 'dense',
    weightMultiplier: 0.9,
    valueMultiplier: 0.5,
    rarity: 'common',
    tagsAdded: ['fire-starter'],
  },
  chitin: {
    name: 'chitin',
    majorType: 'bone',
    minorType: 'hard',
    densityCategory: 'standard',
    weightMultiplier: 0.8,
    valueMultiplier: 2.0,
    rarity: 'uncommon',
  },
  clay: {
    name: 'clay',
    majorType: 'stone',
    minorType: 'ceramic',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 0.2,
    rarity: 'common',
  },
  cloth: {
    name: 'cloth',
    majorType: 'fabric',
    minorType: 'woven',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 1.0,
    rarity: 'common',
  },
  cotton: {
    name: 'cotton',
    majorType: 'fabric',
    minorType: 'woven',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 1.0,
    rarity: 'common',
  },
  cold_iron: {
    name: 'cold iron',
    majorType: 'metal',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 1.0,
    valueMultiplier: 2.0,
    rarity: 'uncommon',
    tagsAdded: ['fey-bane'],
  },
  copper: {
    name: 'copper',
    majorType: 'metal',
    minorType: 'soft',
    densityCategory: 'dense',
    weightMultiplier: 1.0,
    valueMultiplier: 0.5,
    rarity: 'common',
  },
  coral: {
    name: 'coral',
    majorType: 'bone',
    minorType: 'ornamental',
    densityCategory: 'standard',
    weightMultiplier: 0.8,
    valueMultiplier: 5.0,
    rarity: 'uncommon',
  },
  crystal: {
    name: 'crystal',
    majorType: 'stone',
    minorType: 'glass',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 10.0,
    rarity: 'rare',
    statOffsets: { spellPower: 1 },
    tagsAdded: ['fragile'],
  },
  darkwood: {
    name: 'darkwood',
    majorType: 'wood',
    minorType: 'hardwood',
    densityCategory: 'standard',
    weightMultiplier: 0.5,
    valueMultiplier: 10.0,
    rarity: 'rare',
    statOffsets: { ac: 1 },
  },
  dragonbone: {
    name: 'dragonbone',
    majorType: 'bone',
    minorType: 'draconic',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 20.0,
    rarity: 'rare',
    statOffsets: { damage: 1 },
    tagsAdded: ['energy-resistant'],
  },
  dragonhide: {
    name: 'dragonhide',
    majorType: 'leather',
    minorType: 'scales',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 20.0,
    rarity: 'rare',
    statOffsets: { ac: 1, energyResistance: 5 },
    tagsAdded: ['energy-resistant'],
  },
  drake_scale: {
    name: 'drake scale',
    majorType: 'leather',
    minorType: 'scales',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 5.0,
    rarity: 'uncommon',
    tagsAdded: ['fire-resistant'],
  },
  ebony: {
    name: 'ebony',
    majorType: 'wood',
    minorType: 'ornamental',
    densityCategory: 'dense',
    weightMultiplier: 1.3,
    valueMultiplier: 10.0,
    rarity: 'rare',
  },
  electrum: {
    name: 'electrum',
    majorType: 'metal',
    minorType: 'soft',
    densityCategory: 'dense',
    weightMultiplier: 1.0,
    valueMultiplier: 2.5,
    rarity: 'uncommon',
  },
  elm: {
    name: 'elm',
    majorType: 'wood',
    minorType: 'hardwood',
    densityCategory: 'standard',
    weightMultiplier: 1.1,
    valueMultiplier: 1.1,
    rarity: 'common',
  },
  flint: {
    name: 'flint',
    majorType: 'stone',
    minorType: 'sharp',
    densityCategory: 'dense',
    weightMultiplier: 0.8,
    valueMultiplier: 0.5,
    rarity: 'common',
    tagsAdded: ['fire-starter'],
  },
  fur: {
    name: 'fur',
    majorType: 'leather',
    minorType: 'soft',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 2.0,
    rarity: 'common',
    tagsAdded: ['insulating'],
  },
  glass: {
    name: 'glass',
    majorType: 'stone',
    minorType: 'glass',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 1.0,
    rarity: 'common',
    tagsAdded: ['fragile', 'transparent'],
  },
  gold: {
    name: 'gold',
    majorType: 'metal',
    minorType: 'soft',
    densityCategory: 'dense',
    weightMultiplier: 2.5,
    valueMultiplier: 50.0,
    rarity: 'rare',
  },
  granite: {
    name: 'granite',
    majorType: 'stone',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 1.2,
    valueMultiplier: 0.5,
    rarity: 'common',
  },
  hemp: {
    name: 'hemp',
    majorType: 'fabric',
    minorType: 'woven',
    densityCategory: 'standard',
    weightMultiplier: 1.1,
    valueMultiplier: 0.5,
    rarity: 'common',
  },
  hide: {
    name: 'hide',
    majorType: 'leather',
    minorType: 'tanned',
    densityCategory: 'standard',
    weightMultiplier: 1.2,
    valueMultiplier: 0.5,
    rarity: 'common',
  },
  horn: {
    name: 'horn',
    majorType: 'bone',
    minorType: 'common',
    densityCategory: 'standard',
    weightMultiplier: 0.6,
    valueMultiplier: 0.2,
    rarity: 'common',
  },
  iron: {
    name: 'iron',
    majorType: 'metal',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 1.0,
    valueMultiplier: 1.0,
    rarity: 'common',
  },
  ironwood: {
    name: 'ironwood',
    majorType: 'wood',
    minorType: 'hardwood',
    densityCategory: 'dense',
    weightMultiplier: 1.0,
    valueMultiplier: 10.0,
    rarity: 'rare',
    statOffsets: { ac: 1, hardness: 2 },
  },
  ivory: {
    name: 'ivory',
    majorType: 'bone',
    minorType: 'ornamental',
    densityCategory: 'dense',
    weightMultiplier: 0.8,
    valueMultiplier: 10.0,
    rarity: 'uncommon',
  },
  jade: {
    name: 'jade',
    majorType: 'stone',
    minorType: 'ornamental',
    densityCategory: 'dense',
    weightMultiplier: 1.0,
    valueMultiplier: 20.0,
    rarity: 'rare',
  },
  leather: {
    name: 'leather',
    majorType: 'leather',
    minorType: 'tanned',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 1.0,
    rarity: 'common',
  },
  limestone: {
    name: 'limestone',
    majorType: 'stone',
    minorType: 'soft',
    densityCategory: 'standard',
    weightMultiplier: 0.9,
    valueMultiplier: 0.5,
    rarity: 'common',
  },
  linen: {
    name: 'linen',
    majorType: 'fabric',
    minorType: 'woven',
    densityCategory: 'standard',
    weightMultiplier: 0.9,
    valueMultiplier: 1.2,
    rarity: 'common',
  },
  mahogany: {
    name: 'mahogany',
    majorType: 'wood',
    minorType: 'ornamental',
    densityCategory: 'dense',
    weightMultiplier: 1.2,
    valueMultiplier: 5.0,
    rarity: 'uncommon',
  },
  marble: {
    name: 'marble',
    majorType: 'stone',
    minorType: 'ornamental',
    densityCategory: 'dense',
    weightMultiplier: 1.1,
    valueMultiplier: 2.0,
    rarity: 'uncommon',
  },
  meteoric_iron: {
    name: 'meteoric iron',
    majorType: 'metal',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 1.1,
    valueMultiplier: 10.0,
    rarity: 'rare',
    statOffsets: { damage: 1, attack: 1 },
    tagsAdded: ['magnetic'],
  },
  mithral: {
    name: 'mithral',
    majorType: 'metal',
    minorType: 'hard',
    densityCategory: 'standard',
    weightMultiplier: 0.5,
    valueMultiplier: 10.0,
    rarity: 'rare',
    statOffsets: { ac: 1, maxDex: 2 },
    tagsAdded: ['lightweight'],
  },
  oak: {
    name: 'oak',
    majorType: 'wood',
    minorType: 'hardwood',
    densityCategory: 'dense',
    weightMultiplier: 1.2,
    valueMultiplier: 1.5,
    rarity: 'common',
  },
  obsidian: {
    name: 'obsidian',
    majorType: 'stone',
    minorType: 'glass',
    densityCategory: 'dense',
    weightMultiplier: 0.75,
    valueMultiplier: 2.0,
    rarity: 'uncommon',
    tagsAdded: ['sharp', 'fragile'],
  },
  orichalcum: {
    name: 'orichalcum',
    majorType: 'metal',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 0.9,
    valueMultiplier: 50.0,
    rarity: 'legendary',
    statOffsets: { ac: 3, damage: 3, spellPower: 1, damageDice: '1d4' },
    tagsAdded: ['magical'],
  },
  pine: {
    name: 'pine',
    majorType: 'wood',
    minorType: 'softwood',
    densityCategory: 'airy',
    weightMultiplier: 0.8,
    valueMultiplier: 0.8,
    rarity: 'common',
  },
  platinum: {
    name: 'platinum',
    majorType: 'metal',
    minorType: 'soft',
    densityCategory: 'dense',
    weightMultiplier: 2.5,
    valueMultiplier: 500.0,
    rarity: 'rare',
  },
  porcelain: {
    name: 'porcelain',
    majorType: 'stone',
    minorType: 'ceramic',
    densityCategory: 'standard',
    weightMultiplier: 0.8,
    valueMultiplier: 5.0,
    rarity: 'uncommon',
    tagsAdded: ['fragile'],
  },
  silk: {
    name: 'silk',
    majorType: 'fabric',
    minorType: 'woven',
    densityCategory: 'standard',
    weightMultiplier: 0.5,
    valueMultiplier: 10.0,
    rarity: 'uncommon',
  },
  silver: {
    name: 'silver',
    majorType: 'metal',
    minorType: 'soft',
    densityCategory: 'dense',
    weightMultiplier: 1.0,
    valueMultiplier: 5.0,
    rarity: 'uncommon',
    tagsAdded: ['silvered'],
  },
  soapstone: {
    name: 'soapstone',
    majorType: 'stone',
    minorType: 'soft',
    densityCategory: 'standard',
    weightMultiplier: 0.9,
    valueMultiplier: 0.5,
    rarity: 'common',
  },
  spider_silk: {
    name: 'spider silk',
    majorType: 'fabric',
    minorType: 'woven',
    densityCategory: 'standard',
    weightMultiplier: 0.4,
    valueMultiplier: 20.0,
    rarity: 'rare',
    statOffsets: { ac: 1 },
    tagsAdded: ['sticky'],
  },
  steel: {
    name: 'steel',
    majorType: 'metal',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 1.0,
    valueMultiplier: 2.0,
    rarity: 'common',
  },
  suede: {
    name: 'suede',
    majorType: 'leather',
    minorType: 'soft',
    densityCategory: 'standard',
    weightMultiplier: 0.9,
    valueMultiplier: 1.5,
    rarity: 'common',
  },
  thick_hide: {
    name: 'thick hide',
    majorType: 'leather',
    minorType: 'hard',
    densityCategory: 'dense',
    weightMultiplier: 1.5,
    valueMultiplier: 1.0,
    rarity: 'common',
  },
  velvet: {
    name: 'velvet',
    majorType: 'fabric',
    minorType: 'woven',
    densityCategory: 'standard',
    weightMultiplier: 1.1,
    valueMultiplier: 5.0,
    rarity: 'uncommon',
  },
  wicker: {
    name: 'wicker',
    majorType: 'wood',
    minorType: 'flexible',
    densityCategory: 'airy',
    weightMultiplier: 0.3,
    valueMultiplier: 0.5,
    rarity: 'common',
  },
  wool: {
    name: 'wool',
    majorType: 'fabric',
    minorType: 'woven',
    densityCategory: 'standard',
    weightMultiplier: 1.1,
    valueMultiplier: 1.0,
    rarity: 'common',
  },
  wyvern_bone: {
    name: 'wyvern bone',
    majorType: 'bone',
    minorType: 'draconic',
    densityCategory: 'standard',
    weightMultiplier: 0.8,
    valueMultiplier: 5.0,
    rarity: 'uncommon',
  },
  yew: {
    name: 'yew',
    majorType: 'wood',
    minorType: 'flexible',
    densityCategory: 'standard',
    weightMultiplier: 1.0,
    valueMultiplier: 2.0,
    rarity: 'uncommon',
  },
};

/**
 * Retrieves all available materials as an array.
 * @returns An array of all Material objects.
 */
export function getAllMaterials(): Material[] {
  return Object.values(MATERIALS);
}

/**
 * Retrieves a specific material by its name (key).
 * @param name - The key name of the material (e.g., 'iron', 'darkwood').
 * @returns The Material object if found, otherwise undefined.
 */
export function getMaterial(name: string): Material | undefined {
  return MATERIALS[name];
}

/**
 * Filters materials by their major type.
 * @param majorType - The major type to filter by (e.g., 'metal', 'wood').
 * @returns An array of Material objects matching the major type.
 */
export function getMaterialsByMajorType(majorType: string): Material[] {
  return Object.values(MATERIALS).filter((material) => material.majorType === majorType);
}

/**
 * Filters materials by their minor type.
 * @param minorType - The minor type to filter by (e.g., 'hard', 'softwood').
 * @returns An array of Material objects matching the minor type.
 */
export function getMaterialsByMinorType(minorType: string): Material[] {
  return Object.values(MATERIALS).filter((material) => material.minorType === minorType);
}

/**
 * Filters materials by their rarity.
 * @param rarity - The rarity level to filter by (e.g., 'common', 'rare').
 * @returns An array of Material objects matching the rarity.
 */
export function getMaterialsByRarity(rarity: string): Material[] {
  return Object.values(MATERIALS).filter((material) => material.rarity === rarity);
}

/**
 * Filters materials by a specific tag.
 * @param tag - The tag to filter by (e.g., 'flammable', 'magical').
 * @returns An array of Material objects that include the specified tag.
 */
export function getMaterialsByTag(tag: string): Material[] {
  return Object.values(MATERIALS).filter((material) => material.tagsAdded?.includes(tag));
}

/**
 * Retrieves a random material from the collection.
 * @param rng - The random number generator instance.
 * @returns A random Material object.
 */
export function getRandomMaterial(rng: RNG.RNG): Material {
  return rng.item(Object.values(MATERIALS));
}

