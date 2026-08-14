import { RNG } from '@ironarachne/rng';
import type { Container, Item } from '$lib/equipment';
import { addItemToContainer, canFit } from '$lib/equipment';
import {
  generatePotion,
  getDefaultPotionConfig,
  type Potion,
  type PotionGeneratorConfig,
} from '$lib/potions';

export function getPotionTotalValue(potion: Potion): number {
  return potion.liquid.value + potion.container.value;
}

export function potionToHoardItems(potion: Potion): Item[] {
  return [potion.container, potion.liquid];
}

export function getRandomPotionsForValue(
  seed: string,
  targetValue: number,
  config: PotionGeneratorConfig = getDefaultPotionConfig(),
): Potion[] {
  if (targetValue <= 0) {
    return [];
  }

  const rng = new RNG(seed);
  const potions: Potion[] = [];
  let currentValue = 0;
  let attempts = 0;
  const maxAttempts = 100;

  while (currentValue < targetValue && attempts < maxAttempts) {
    const potion = generatePotion(rng.randomString(13), config);
    const potionValue = getPotionTotalValue(potion);

    if (currentValue + potionValue <= targetValue * 1.1) {
      potions.push(potion);
      currentValue += potionValue;
    }

    attempts++;
  }

  return potions;
}

export function packPotionContainers(
  potionContainers: Container[],
  containers: Container[],
  rng?: RNG,
): void {
  let sortedContainers = [...containers].sort(
    (a, b) => b.maxVolume - b.currentVolume - (a.maxVolume - a.currentVolume),
  );

  if (rng) {
    sortedContainers = rng.shuffle(sortedContainers);
  }

  for (const potionContainer of potionContainers) {
    for (const container of sortedContainers) {
      if (canFit(container, potionContainer)) {
        addItemToContainer(container, potionContainer);
        break;
      }
    }
  }
}

export function flattenPotionsToItems(potions: Potion[]): Item[] {
  return potions.flatMap(potionToHoardItems);
}

export { getDefaultPotionConfig };
