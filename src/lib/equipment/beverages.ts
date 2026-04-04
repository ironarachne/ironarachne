import { RNG } from '@ironarachne/rng';
import { generateRandomContainer } from './containers';
import { DENSITY_MAP, type Container, type DensityCategory, type Item } from './equipment_types';

export interface BeverageType {
  name: string;
  description: string;
  densityCategory: DensityCategory;
  valuePerLiter: number; // in copper
  tags: string[];
}

export const beverageTypes: BeverageType[] = [
  {
    name: 'water',
    description: 'clear, refreshing water',
    densityCategory: 'standard',
    valuePerLiter: 0,
    tags: ['beverage', 'water'],
  },
  {
    name: 'milk',
    description: 'white, creamy milk',
    densityCategory: 'standard',
    valuePerLiter: 5,
    tags: ['beverage', 'milk'],
  },
  {
    name: 'ale',
    description: 'frothy, amber ale',
    densityCategory: 'standard',
    valuePerLiter: 10,
    tags: ['beverage', 'alcohol', 'ale'],
  },
  {
    name: 'wine',
    description: 'deep red wine',
    densityCategory: 'standard',
    valuePerLiter: 50,
    tags: ['beverage', 'alcohol', 'wine'],
  },
  {
    name: 'mead',
    description: 'golden, honeyed mead',
    densityCategory: 'standard',
    valuePerLiter: 20,
    tags: ['beverage', 'alcohol', 'mead'],
  },
  {
    name: 'apple juice',
    description: 'sweet, cloudy apple juice',
    densityCategory: 'standard',
    valuePerLiter: 8,
    tags: ['beverage', 'juice', 'apple'],
  },
  {
    name: 'herbal tea',
    description: 'aromatic herbal tea',
    densityCategory: 'standard',
    valuePerLiter: 2,
    tags: ['beverage', 'tea'],
  },
  {
    name: 'black coffee',
    description: 'strong, dark coffee',
    densityCategory: 'standard',
    valuePerLiter: 15,
    tags: ['beverage', 'coffee'],
  },
];

export type Beverage = {
  container: Container;
  liquid: Item;
};

export function generateBeverage(seed: string): Beverage {
  const rng = new RNG(seed);
  const beverageType = rng.item(beverageTypes);

  const container = generateRandomContainer(seed, {
    allowLockedContainers: false,
    allowUnlockedContainers: true,
    onlyLiquidContainers: true,
  });

  // Fill the container between 50% and 100%
  const fillPercentage = rng.int(50, 100) / 100;
  const volume = parseFloat((container.maxVolume * fillPercentage).toFixed(2));
  const density = DENSITY_MAP[beverageType.densityCategory];
  const weight = parseFloat((volume * density).toFixed(2));
  const value = Math.ceil(volume * beverageType.valuePerLiter);

  const liquidItem: Item = {
    id: `beverage-${rng.randomString(13)}`,
    name: beverageType.name,
    itemMajorType: 'beverage',
    description: beverageType.description,
    value: value,
    rarity: 'common',
    densityCategory: beverageType.densityCategory,
    manualVolume: volume,
    weight: weight,
    properties: beverageType.tags,
    containerId: container.id,
  };

  container.contents.push(liquidItem.id);
  container.currentVolume = parseFloat((container.currentVolume + volume).toFixed(2));
  container.currentWeight = parseFloat((container.currentWeight + weight).toFixed(2));

  return {
    container,
    liquid: liquidItem,
  };
}
