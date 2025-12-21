import type { Gem, GemType } from "./treasure_types";

export function generateGem(id: string, name: string, value: number, isCut: boolean, description?: string): Gem {
  return {
    id,
    name,
    description: description || `A ${isCut ? 'cut' : 'raw'} gem.`,
    isCut,
    value,
    rarity: 'uncommon',
    properties: [],
  }
}

export const gemTypes: GemType[] = [
  { name: 'agate', baseValue: 80 },
  { name: 'amber', baseValue: 50 },
  { name: 'amethyst', baseValue: 100 },
  { name: 'aquamarine', baseValue: 200 },
  { name: 'citrine', baseValue: 130 },
  { name: 'diamond', baseValue: 500 },
  { name: 'emerald', baseValue: 300 },
  { name: 'garnet', baseValue: 120 },
  { name: 'lapis lazuli', baseValue: 40 },
  { name: 'quartz', baseValue: 20 },
  { name: 'opal', baseValue: 250 },
  { name: 'peridot', baseValue: 180 },
  { name: 'ruby', baseValue: 400 },
  { name: 'sapphire', baseValue: 350 },
  { name: 'spinel', baseValue: 270 },
  { name: 'topaz', baseValue: 150 },
  { name: 'tourmaline', baseValue: 220 },
];

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
        gemType.baseValue,
        true
      );
      selectedGems.push(gem);
      remainingValue -= gemType.baseValue;
    }
  }

  return selectedGems;
}
