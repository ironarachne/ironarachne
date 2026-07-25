import { RNG } from '@ironarachne/rng';
import type { ArtObject, ArtObjectGeneratorConfig, ArtObjectType } from './art_object_types';
import * as Words from '@ironarachne/words';

type ArtObjectMaterial = {
  name: string;
  valueMultiplier: number;
  weightMultiplier: number;
  category: string;
};

const materials: ArtObjectMaterial[] = [
  { name: 'gold', valueMultiplier: 10, weightMultiplier: 2, category: 'metal' },
  { name: 'silver', valueMultiplier: 2, weightMultiplier: 1, category: 'metal' },
  { name: 'platinum', valueMultiplier: 50, weightMultiplier: 2, category: 'metal' },
  { name: 'copper', valueMultiplier: 0.5, weightMultiplier: 1, category: 'metal' },
  { name: 'bronze', valueMultiplier: 0.5, weightMultiplier: 1, category: 'metal' },
  { name: 'electrum', valueMultiplier: 5, weightMultiplier: 1.5, category: 'metal' },
  { name: 'steel', valueMultiplier: 0.2, weightMultiplier: 1, category: 'metal' },
  { name: 'iron', valueMultiplier: 0.1, weightMultiplier: 1, category: 'metal' },
  { name: 'brass', valueMultiplier: 0.3, weightMultiplier: 1, category: 'metal' },
  { name: 'pewter', valueMultiplier: 0.2, weightMultiplier: 1, category: 'metal' },

  { name: 'marble', valueMultiplier: 2, weightMultiplier: 1.2, category: 'stone' },
  { name: 'granite', valueMultiplier: 0.5, weightMultiplier: 1.5, category: 'stone' },
  { name: 'jade', valueMultiplier: 10, weightMultiplier: 1, category: 'stone' },
  { name: 'obsidian', valueMultiplier: 3, weightMultiplier: 0.8, category: 'stone' },
  { name: 'soapstone', valueMultiplier: 0.5, weightMultiplier: 0.8, category: 'stone' },
  { name: 'alabaster', valueMultiplier: 3, weightMultiplier: 1, category: 'stone' },
  { name: 'malachite', valueMultiplier: 5, weightMultiplier: 1.2, category: 'stone' },

  { name: 'oak', valueMultiplier: 0.2, weightMultiplier: 0.8, category: 'wood' },
  { name: 'mahogany', valueMultiplier: 1, weightMultiplier: 0.9, category: 'wood' },
  { name: 'ebony', valueMultiplier: 3, weightMultiplier: 1.1, category: 'wood' },
  { name: 'teak', valueMultiplier: 0.5, weightMultiplier: 0.9, category: 'wood' },
  { name: 'pine', valueMultiplier: 0.1, weightMultiplier: 0.6, category: 'wood' },
  { name: 'rosewood', valueMultiplier: 2, weightMultiplier: 0.9, category: 'wood' },

  { name: 'ivory', valueMultiplier: 5, weightMultiplier: 0.8, category: 'organic' },
  { name: 'bone', valueMultiplier: 0.1, weightMultiplier: 0.6, category: 'organic' },
  { name: 'horn', valueMultiplier: 0.2, weightMultiplier: 0.6, category: 'organic' },
  { name: 'coral', valueMultiplier: 3, weightMultiplier: 0.8, category: 'organic' },
  { name: 'pearl', valueMultiplier: 10, weightMultiplier: 0.5, category: 'organic' },
  { name: 'shell', valueMultiplier: 0.5, weightMultiplier: 0.5, category: 'organic' },

  { name: 'silk', valueMultiplier: 5, weightMultiplier: 0.5, category: 'fabric' },
  { name: 'velvet', valueMultiplier: 3, weightMultiplier: 0.8, category: 'fabric' },
  { name: 'wool', valueMultiplier: 0.5, weightMultiplier: 1, category: 'fabric' },
  { name: 'linen', valueMultiplier: 0.5, weightMultiplier: 0.8, category: 'fabric' },
  { name: 'cotton', valueMultiplier: 0.2, weightMultiplier: 0.8, category: 'fabric' },
  { name: 'satin', valueMultiplier: 2, weightMultiplier: 0.6, category: 'fabric' },
  { name: 'leather', valueMultiplier: 0.5, weightMultiplier: 1, category: 'fabric' },
  { name: 'fur', valueMultiplier: 2, weightMultiplier: 0.5, category: 'fabric' },

  { name: 'crystal', valueMultiplier: 5, weightMultiplier: 1, category: 'glass' },
  { name: 'glass', valueMultiplier: 0.5, weightMultiplier: 0.8, category: 'glass' },

  { name: 'ceramic', valueMultiplier: 0.2, weightMultiplier: 0.8, category: 'ceramic' },
  { name: 'porcelain', valueMultiplier: 2, weightMultiplier: 0.8, category: 'ceramic' },
  { name: 'clay', valueMultiplier: 0.1, weightMultiplier: 1, category: 'ceramic' },

  { name: 'canvas', valueMultiplier: 0.1, weightMultiplier: 0.5, category: 'mixed' },
  { name: 'paper', valueMultiplier: 0.1, weightMultiplier: 0.1, category: 'paper' },
  { name: 'parchment', valueMultiplier: 0.2, weightMultiplier: 0.1, category: 'paper' },
  { name: 'vellum', valueMultiplier: 0.5, weightMultiplier: 0.1, category: 'paper' },
];

function getMaterialsForCategories(categories: string[]): ArtObjectMaterial[] {
  if (categories.includes('any')) {
    return materials;
  }
  return materials.filter((m) => categories.includes(m.category));
}

export const artObjectTypes: ArtObjectType[] = [
  {
    name: 'bell',
    baseValue: 50,
    baseWeight: 0.5,
    densityCategory: 'dense',
    materialCategory: ['metal', 'ceramic'],
  },
  {
    name: 'belt',
    baseValue: 100,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['fabric', 'metal'],
  },
  {
    name: 'book',
    baseValue: 300,
    baseWeight: 2,
    densityCategory: 'standard',
    materialCategory: ['paper'],
  },
  {
    name: 'boots',
    baseValue: 100,
    baseWeight: 2,
    densityCategory: 'standard',
    materialCategory: ['fabric'],
  },
  {
    name: 'bottle',
    baseValue: 50,
    baseWeight: 0.5,
    densityCategory: 'standard',
    materialCategory: ['glass', 'ceramic'],
  },
  {
    name: 'bowl',
    baseValue: 50,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal', 'ceramic', 'wood', 'glass', 'stone'],
  },
  {
    name: 'box',
    baseValue: 100,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['wood', 'metal', 'stone', 'organic'],
  },
  {
    name: 'bracelet',
    baseValue: 200,
    baseWeight: 0.2,
    densityCategory: 'dense',
    materialCategory: ['metal', 'organic'],
  },
  {
    name: 'brazier',
    baseValue: 100,
    baseWeight: 5,
    densityCategory: 'bulky',
    materialCategory: ['metal'],
  },
  {
    name: 'brooch',
    baseValue: 300,
    baseWeight: 0.1,
    densityCategory: 'dense',
    materialCategory: ['metal', 'organic'],
  },
  {
    name: 'cameo',
    baseValue: 500,
    baseWeight: 0.1,
    densityCategory: 'dense',
    materialCategory: ['stone', 'organic'],
  },
  {
    name: 'candelabra',
    baseValue: 150,
    baseWeight: 2,
    densityCategory: 'standard',
    materialCategory: ['metal'],
  },
  {
    name: 'candlestick',
    baseValue: 50,
    baseWeight: 0.5,
    densityCategory: 'standard',
    materialCategory: ['metal', 'wood', 'ceramic'],
  },
  {
    name: 'casket',
    baseValue: 300,
    baseWeight: 5,
    densityCategory: 'standard',
    materialCategory: ['wood', 'metal', 'stone'],
  },
  {
    name: 'cauldron',
    baseValue: 50,
    baseWeight: 5,
    densityCategory: 'bulky',
    materialCategory: ['metal'],
  },
  {
    name: 'chalice',
    baseValue: 250,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal', 'glass', 'ceramic', 'stone', 'wood'],
  },
  {
    name: 'chess set',
    baseValue: 500,
    baseWeight: 2,
    densityCategory: 'standard',
    materialCategory: ['stone', 'wood', 'organic', 'glass'],
  },
  {
    name: 'chest',
    baseValue: 500,
    baseWeight: 10,
    densityCategory: 'bulky',
    materialCategory: ['wood', 'metal'],
  },
  {
    name: 'chime',
    baseValue: 50,
    baseWeight: 0.5,
    densityCategory: 'dense',
    materialCategory: ['metal', 'organic', 'glass'],
  },
  {
    name: 'cloak',
    baseValue: 150,
    baseWeight: 3,
    densityCategory: 'airy',
    materialCategory: ['fabric'],
  },
  {
    name: 'comb',
    baseValue: 50,
    baseWeight: 0.1,
    densityCategory: 'standard',
    materialCategory: ['organic', 'metal', 'wood'],
  },
  {
    name: 'crown',
    baseValue: 5000,
    baseWeight: 2,
    densityCategory: 'standard',
    materialCategory: ['metal'],
  },
  {
    name: 'decanter',
    baseValue: 100,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['glass'],
  },
  {
    name: 'dice set',
    baseValue: 50,
    baseWeight: 0.1,
    densityCategory: 'dense',
    materialCategory: ['organic', 'stone', 'wood', 'metal'],
  },
  {
    name: 'drum',
    baseValue: 100,
    baseWeight: 5,
    densityCategory: 'bulky',
    materialCategory: ['wood'],
  },
  {
    name: 'ewer',
    baseValue: 150,
    baseWeight: 2,
    densityCategory: 'standard',
    materialCategory: ['metal', 'ceramic', 'glass'],
  },
  {
    name: 'figurine',
    baseValue: 50,
    baseWeight: 1,
    densityCategory: 'dense',
    materialCategory: ['stone', 'metal', 'wood', 'organic', 'ceramic', 'glass'],
  },
  {
    name: 'flagon',
    baseValue: 50,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal', 'ceramic'],
  },
  {
    name: 'flute',
    baseValue: 100,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['wood', 'metal', 'organic'],
  },
  {
    name: 'gloves',
    baseValue: 100,
    baseWeight: 0.5,
    densityCategory: 'airy',
    materialCategory: ['fabric'],
  },
  {
    name: 'goblet',
    baseValue: 100,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal', 'glass', 'ceramic', 'stone', 'wood'],
  },
  {
    name: 'harp',
    baseValue: 500,
    baseWeight: 10,
    densityCategory: 'bulky',
    materialCategory: ['wood'],
  },
  {
    name: 'hat',
    baseValue: 50,
    baseWeight: 0.5,
    densityCategory: 'airy',
    materialCategory: ['fabric'],
  },
  {
    name: 'helm',
    baseValue: 300,
    baseWeight: 3,
    densityCategory: 'standard',
    materialCategory: ['metal'],
  },
  {
    name: 'horn',
    baseValue: 100,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['organic', 'metal'],
  },
  {
    name: 'hourglass',
    baseValue: 200,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['glass'],
  },
  {
    name: 'idol',
    baseValue: 1000,
    baseWeight: 5,
    densityCategory: 'dense',
    materialCategory: ['stone', 'metal', 'wood', 'organic'],
  },
  {
    name: 'inkwell',
    baseValue: 50,
    baseWeight: 0.5,
    densityCategory: 'standard',
    materialCategory: ['glass', 'ceramic', 'metal'],
  },
  {
    name: 'jar',
    baseValue: 20,
    baseWeight: 0.5,
    densityCategory: 'standard',
    materialCategory: ['ceramic', 'glass'],
  },
  {
    name: 'kettle',
    baseValue: 30,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal'],
  },
  {
    name: 'lamp',
    baseValue: 50,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal', 'ceramic'],
  },
  {
    name: 'lantern',
    baseValue: 50,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal'],
  },
  {
    name: 'letter opener',
    baseValue: 50,
    baseWeight: 0.2,
    densityCategory: 'standard',
    materialCategory: ['metal', 'organic', 'wood'],
  },
  {
    name: 'lute',
    baseValue: 200,
    baseWeight: 5,
    densityCategory: 'bulky',
    materialCategory: ['wood'],
  },
  {
    name: 'magnifying glass',
    baseValue: 100,
    baseWeight: 0.5,
    densityCategory: 'standard',
    materialCategory: ['metal'],
  },
  {
    name: 'mask',
    baseValue: 150,
    baseWeight: 1,
    densityCategory: 'airy',
    materialCategory: ['metal', 'wood', 'organic', 'fabric', 'ceramic'],
  },
  {
    name: 'mirror',
    baseValue: 200,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal'],
  },
  {
    name: 'mosaic',
    baseValue: 2500,
    baseWeight: 30,
    densityCategory: 'standard',
    materialCategory: ['stone', 'ceramic', 'glass'],
  },
  {
    name: 'necklace',
    baseValue: 500,
    baseWeight: 0.2,
    densityCategory: 'dense',
    materialCategory: ['metal', 'organic'],
  },
  {
    name: 'painting',
    baseValue: 2000,
    baseWeight: 5,
    densityCategory: 'bulky',
    materialCategory: ['mixed'],
  },
  {
    name: 'pan',
    baseValue: 20,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal'],
  },
  {
    name: 'pendant',
    baseValue: 200,
    baseWeight: 0.1,
    densityCategory: 'dense',
    materialCategory: ['metal', 'stone', 'organic'],
  },
  {
    name: 'platter',
    baseValue: 100,
    baseWeight: 3,
    densityCategory: 'standard',
    materialCategory: ['metal', 'ceramic', 'wood'],
  },
  {
    name: 'playing cards',
    baseValue: 50,
    baseWeight: 0.2,
    densityCategory: 'dense',
    materialCategory: ['paper', 'organic'],
  },
  {
    name: 'pot',
    baseValue: 20,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal', 'ceramic'],
  },
  {
    name: 'quill',
    baseValue: 20,
    baseWeight: 0.01,
    densityCategory: 'airy',
    materialCategory: ['organic'],
  },
  {
    name: 'ring',
    baseValue: 150,
    baseWeight: 0.05,
    densityCategory: 'dense',
    materialCategory: ['metal', 'organic'],
  },
  {
    name: 'robe',
    baseValue: 200,
    baseWeight: 3,
    densityCategory: 'airy',
    materialCategory: ['fabric'],
  },
  {
    name: 'scarf',
    baseValue: 50,
    baseWeight: 0.2,
    densityCategory: 'airy',
    materialCategory: ['fabric'],
  },
  {
    name: 'scepter',
    baseValue: 2000,
    baseWeight: 3,
    densityCategory: 'dense',
    materialCategory: ['metal', 'wood', 'organic'],
  },
  {
    name: 'scroll',
    baseValue: 100,
    baseWeight: 0.5,
    densityCategory: 'airy',
    materialCategory: ['paper'],
  },
  {
    name: 'sculpture',
    baseValue: 3000,
    baseWeight: 20,
    densityCategory: 'standard',
    materialCategory: ['stone', 'metal', 'wood', 'ceramic'],
  },
  {
    name: 'spyglass',
    baseValue: 1000,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal'],
  },
  {
    name: 'statue',
    baseValue: 4000,
    baseWeight: 150,
    densityCategory: 'dense',
    materialCategory: ['stone', 'metal'],
  },
  {
    name: 'statuette',
    baseValue: 100,
    baseWeight: 2,
    densityCategory: 'dense',
    materialCategory: ['stone', 'metal', 'wood', 'organic', 'ceramic', 'glass'],
  },
  {
    name: 'stein',
    baseValue: 50,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['ceramic', 'metal'],
  },
  {
    name: 'tankard',
    baseValue: 50,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal', 'wood', 'ceramic'],
  },
  {
    name: 'tapestry',
    baseValue: 1500,
    baseWeight: 10,
    densityCategory: 'airy',
    materialCategory: ['fabric'],
  },
  {
    name: 'torch sconce',
    baseValue: 50,
    baseWeight: 1,
    densityCategory: 'standard',
    materialCategory: ['metal'],
  },
  {
    name: 'urn',
    baseValue: 200,
    baseWeight: 5,
    densityCategory: 'standard',
    materialCategory: ['ceramic', 'metal', 'stone'],
  },
  {
    name: 'vase',
    baseValue: 100,
    baseWeight: 2,
    densityCategory: 'standard',
    materialCategory: ['ceramic', 'glass', 'metal', 'stone'],
  },
  {
    name: 'vestments',
    baseValue: 500,
    baseWeight: 3,
    densityCategory: 'airy',
    materialCategory: ['fabric'],
  },
  {
    name: 'whistle',
    baseValue: 20,
    baseWeight: 0.1,
    densityCategory: 'dense',
    materialCategory: ['metal', 'wood', 'organic', 'ceramic'],
  },
];

/**
 * Get the default configuration for art object generation.
 *
 * @returns The default configuration object.
 */
export function getDefaultArtObjectGeneratorConfig(): ArtObjectGeneratorConfig {
  return {
    allowedTypes: artObjectTypes,
  };
}

function getMinMaxMultipliers(type: ArtObjectType): { min: number; max: number } {
  if (!type.materialCategory) return { min: 1, max: 1 };
  const mats = getMaterialsForCategories(type.materialCategory);
  if (mats.length === 0) return { min: 1, max: 1 };
  const multipliers = mats.map((m) => m.valueMultiplier);
  return {
    min: Math.min(...multipliers),
    max: Math.max(...multipliers),
  };
}

/**
 * Generate a random art object.
 *
 * @param seed The seed for the random number generator.
 * @param config The configuration for art object generation.
 * @returns A randomly generated art object.
 */
export function generateRandomArtObject(
  seed: string,
  config: ArtObjectGeneratorConfig = getDefaultArtObjectGeneratorConfig(),
): ArtObject {
  const rng = new RNG(seed);

  let availableArtObjectTypes = config.allowedTypes || artObjectTypes;

  if (config.minimumValue !== undefined || config.maximumValue !== undefined) {
    availableArtObjectTypes = availableArtObjectTypes.filter((artType) => {
      const { min, max } = getMinMaxMultipliers(artType);
      const minPossible = artType.baseValue * min;
      const maxPossible = artType.baseValue * max;

      if (config.minimumValue !== undefined && maxPossible < config.minimumValue) {
        return false;
      }
      if (config.maximumValue !== undefined && minPossible > config.maximumValue) {
        return false;
      }
      return true;
    });

    if (availableArtObjectTypes.length === 0) {
      throw new Error('No art object types available for the specified value range.');
    }
  }

  const artObjectType = rng.item(availableArtObjectTypes);

  // Select material
  let material: ArtObjectMaterial | undefined;
  if (artObjectType.materialCategory) {
    let possibleMaterials = getMaterialsForCategories(artObjectType.materialCategory);

    // Filter materials to respect value constraints
    if (config.minimumValue !== undefined || config.maximumValue !== undefined) {
      possibleMaterials = possibleMaterials.filter((m) => {
        const val = artObjectType.baseValue * m.valueMultiplier;
        if (config.minimumValue !== undefined && val < config.minimumValue) return false;
        if (config.maximumValue !== undefined && val > config.maximumValue) return false;
        return true;
      });
    }

    if (possibleMaterials.length > 0) {
      material = rng.item(possibleMaterials);
    }
  }

  let value = artObjectType.baseValue;
  let weight = artObjectType.baseWeight;
  let description = `${Words.article(artObjectType.name)} ${artObjectType.name.toLowerCase()}`;

  if (material) {
    value *= material.valueMultiplier;
    weight *= material.weightMultiplier;
    description = `${Words.article(material.name)} ${material.name} ${artObjectType.name.toLowerCase()}`;
  }

  return {
    id: `art-${rng.randomString(13)}`,
    name: artObjectType.name,
    description: `${description}`,
    artist: 'Unknown Artist',
    value: Math.floor(value),
    rarity: 'uncommon',
    itemMajorType: 'treasure',
    itemMinorType: 'art object',
    properties: [],
    densityCategory: artObjectType.densityCategory,
    weight: Number(weight.toFixed(2)),
  };
}

/**
 * Create an art object.
 *
 * @param id the id to assign to the art object
 * @param type the type of art object
 * @param artist the name of the artist, if known
 * @param description the description of the art object
 * @returns
 */
export function generateArtObject(
  id: string,
  type: ArtObjectType,
  artist?: string,
  description?: string,
): ArtObject {
  if (!description) {
    if (artist) {
      description = `a beautiful ${type.name.toLowerCase()} created by ${artist}`;
    } else {
      description = `a beautiful ${type.name.toLowerCase()}`;
    }
  }

  return {
    id,
    name: type.name,
    description: description,
    artist: artist || 'Unknown Artist',
    value: type.baseValue,
    rarity: 'uncommon',
    itemMajorType: 'treasure',
    itemMinorType: 'art object',
    properties: [],
    densityCategory: type.densityCategory,
    weight: type.baseWeight,
  };
}

/**
 * Get an art object up to a maximum value.
 *
 * @param maxValue the maximum value to limit art by
 * @returns
 */
export function getArtObjectOfMaxValue(maxValue: number): ArtObject {
  const affordableArtObjects = artObjectTypes.filter((art) => art.baseValue <= maxValue);
  if (affordableArtObjects.length === 0) {
    throw new Error('No art objects available within the specified value.');
  }

  const selectedArt = affordableArtObjects[Math.floor(Math.random() * affordableArtObjects.length)];
  return generateArtObject(`art-${selectedArt.name.toLowerCase()}`, selectedArt);
}

/**
 * Get a set of art objects totalling up to the specified value.
 *
 * @param totalValue the total value of the art to create
 * @returns
 */
export function getArtObjectsForValue(totalValue: number): ArtObject[] {
  const selectedArtObjects: ArtObject[] = [];
  let remainingValue = totalValue;

  const sortedArtTypes = [...artObjectTypes].sort((a, b) => b.baseValue - a.baseValue);

  for (const artType of sortedArtTypes) {
    while (remainingValue >= artType.baseValue) {
      const artObject = generateArtObject(
        `art-${selectedArtObjects.length + 1}-${artType.name.toLowerCase()}`,
        artType,
      );
      selectedArtObjects.push(artObject);
      remainingValue -= artType.baseValue;
    }
  }

  return selectedArtObjects;
}

/**
 * Generate a random set of art objects that sum up to a target value.
 *
 * @param seed The seed for the random number generator.
 * @param totalValue The total value to target.
 * @param config The configuration for art object generation.
 * @returns An array of randomly generated art objects.
 */
export function getRandomArtObjectsForValue(
  seed: string,
  totalValue: number,
  config: ArtObjectGeneratorConfig = getDefaultArtObjectGeneratorConfig(),
): ArtObject[] {
  const rng = new RNG(seed);
  const selectedArtObjects: ArtObject[] = [];
  let remainingValue = totalValue;

  // Safety break to prevent infinite loops if we get stuck with small remaining values that can't be filled
  let attempts = 0;
  const maxAttempts = 1000;

  while (remainingValue > 0 && attempts < maxAttempts) {
    attempts++;
    try {
      const artObject = generateRandomArtObject(rng.randomString(16), {
        ...config,
        maximumValue: remainingValue,
      });

      if (artObject.value <= 0) {
        break;
      }
      if (artObject.value > remainingValue) {
        continue;
      }

      selectedArtObjects.push(artObject);
      remainingValue -= artObject.value;
    } catch (_error) {
      // If we can't generate an object within the remaining value, we stop.
      break;
    }
  }

  return selectedArtObjects;
}
