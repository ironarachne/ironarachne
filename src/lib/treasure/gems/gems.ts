import { RNG } from "@ironarachne/rng";
import type { Gem, GemType, GemCut, GemSize, GemGeneratorConfig } from "./gem_types";
import * as Words from "@ironarachne/words";

export const gemCuts: GemCut[] = [
  'round', 'oval', 'cushion', 'princess', 'emerald', 'marquise', 'pear', 'radiant', 'heart', 'cabochon', 'rough'
];

export const gemSizes: GemSize[] = [
  'tiny', 'small', 'medium', 'large', 'huge'
];

export const gemTypes: GemType[] = [
  { name: 'agate', baseValue: 8000, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'amber', baseValue: 5000, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'amethyst', baseValue: 10000, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'aquamarine', baseValue: 20000, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'citrine', baseValue: 13000, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'diamond', baseValue: 50000, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'emerald', baseValue: 3000, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'garnet', baseValue: 1200, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'lapis lazuli', baseValue: 400, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'quartz', baseValue: 200, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'opal', baseValue: 2500, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'peridot', baseValue: 1800, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'ruby', baseValue: 4000, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'sapphire', baseValue: 3500, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'spinel', baseValue: 2700, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'topaz', baseValue: 1500, baseWeight: 0.1, densityCategory: 'standard' },
  { name: 'tourmaline', baseValue: 2200, baseWeight: 0.1, densityCategory: 'standard' },
];

/**
 * Get the default configuration for gem generation.
 *
 * @returns The default configuration object.
 */
export function getDefaultGemGeneratorConfig(): GemGeneratorConfig {
  return {
    allowCutGems: true,
    allowUncutGems: true,
    allowedCuts: gemCuts,
    allowedSizes: gemSizes,
    allowedTypes: gemTypes,
  }
}

/**
 * Generate a specific gem with the given attributes.
 *
 * @param id The unique identifier for the gem.
 * @param name The name of the gem.
 * @param isCut Whether the gem is cut.
 * @param cut The cut style of the gem.
 * @param size The size category of the gem.
 * @param gemType The base type of the gem.
 * @param description An optional description for the gem.
 * @returns The generated gem object.
 */
export function generateGem(id: string, name: string, isCut: boolean, cut: GemCut, size: GemSize, gemType: GemType, description?: string): Gem {
  return {
    id,
    name,
    description: description || `A ${size} ${isCut ? cut : 'rough'} gem.`,
    isCut,
    cut,
    size,
    value: gemType.baseValue,
    rarity: 'uncommon',
    properties: [],
    densityCategory: gemType.densityCategory,
    weight: gemType.baseWeight * getGemWeightModifier(isCut, size),
  }
}

/**
 * Generate a random gem based on a seed and configuration.
 *
 * @param seed The seed for the random number generator.
 * @param config The configuration for gem generation.
 * @returns A randomly generated gem.
 */
export function generateRandomGem(seed: string, config: GemGeneratorConfig = getDefaultGemGeneratorConfig()): Gem {
  const rng = new RNG(seed);

  if (config.minimumValue !== undefined || config.maximumValue !== undefined) {
    const filteredGemTypes = gemTypes.filter(gemType => {
      if (config.minimumValue !== undefined && gemType.baseValue < config.minimumValue) {
        return false;
      }
      if (config.maximumValue !== undefined && gemType.baseValue > config.maximumValue) {
        return false;
      }
      return true;
    });

    if (filteredGemTypes.length === 0) {
      throw new Error('No gem types available for the specified value range.');
    }

    config = {
      ...config,
      allowedTypes: filteredGemTypes,
    };
  }

  const availableGemTypes = config.allowedTypes || gemTypes;
  const gemType = rng.item(availableGemTypes);
  const isCut = config.allowCutGems && config.allowUncutGems ? rng.item([true, false]) : config.allowCutGems ? true : false;
  const cut = isCut && config.allowedCuts ? rng.item(config.allowedCuts) : 'rough';
  const size = config.allowedSizes ? rng.item(config.allowedSizes) : 'medium';
  const rarity = 'uncommon';
  const value = gemType.baseValue * (isCut ? 1 : 0.5); // Uncut gems are worth half
  const weight = gemType.baseWeight * getGemWeightModifier(isCut, size);

  return {
    id: `gem-${rng.randomString(13)}`,
    name: gemType.name,
    description: `${Words.article(size)} ${size} ${cut} ${gemType.name}`,
    isCut,
    cut,
    size,
    value,
    rarity,
    properties: [],
    densityCategory: gemType.densityCategory,
    weight,
  }
}

/**
 * Get gem types up to a maximum value.
 *
 * @param maxValue the maximum value to reach
 * @returns
 */
export function getGemTypesUpToValue(maxValue: number): GemType[] {
  return gemTypes.filter(gem => gem.baseValue <= maxValue);
}

/**
 * Calculate the weight modifier for a gem based on its cut status and size.
 *
 * @param isCut Whether the gem is cut.
 * @param size The size category of the gem.
 * @returns The weight modifier.
 */
export function getGemWeightModifier(isCut: boolean, size: GemSize): number {
  const sizeModifiers: Record<GemSize, number> = {
    tiny: 0.5,
    small: 0.75,
    medium: 1,
    large: 1.5,
    huge: 2,
  };

  const cutModifier = isCut ? 1 : 1.2; // Uncut gems are slightly heavier due to roughness
  const sizeModifier = sizeModifiers[size] || 1;

  return cutModifier * sizeModifier;
}

/**
 * Create a set of gems totalling up to the specified value.
 *
 * @param totalValue the total value to target
 * @returns
 */
export function getGemsForValue(totalValue: number): Gem[] {
  // Simple greedy algorithm to select gems up to the total value
  const selectedGems: Gem[] = [];
  let remainingValue = totalValue;

  const sortedGemTypes = [...gemTypes].sort((a, b) => b.baseValue - a.baseValue);

  for (const gemType of sortedGemTypes) {
    while (remainingValue >= gemType.baseValue) {
      const gem = generateGem(
        `gem-${selectedGems.length + 1}`,
        gemType.name,
        true,
        'round',
        'medium',
        gemType,
      );
      selectedGems.push(gem);
      remainingValue -= gemType.baseValue;
    }
  }

  return selectedGems;
}

/**
 * Generate a random set of gems that sum up to a target value.
 *
 * @param seed The seed for the random number generator.
 * @param totalValue The total value to target.
 * @param config The configuration for gem generation.
 * @returns An array of randomly generated gems.
 */
export function getRandomGemsForValue(seed: string, totalValue: number, config: GemGeneratorConfig = getDefaultGemGeneratorConfig()): Gem[] {
  const rng = new RNG(seed);
  const selectedGems: Gem[] = [];
  let remainingValue = totalValue;

  const affordableGemTypes = (config.allowedTypes || gemTypes).filter(gemType => gemType.baseValue <= remainingValue);
  if (affordableGemTypes.length === 0) {
    return selectedGems; // No gems can be afforded
  }

  while (remainingValue > 0) {
    const possibleGemTypes = affordableGemTypes.filter(gemType => gemType.baseValue <= remainingValue);
    if (possibleGemTypes.length === 0) {
      break; // No more gems can be afforded
    }

    const gemType = rng.item(possibleGemTypes);
    const gem = generateRandomGem(rng.randomString(16), {
      ...config,
      allowedTypes: [gemType],
      maximumValue: remainingValue,
    });

    selectedGems.push(gem);
    remainingValue -= gem.value;
  }

  return selectedGems;
}
