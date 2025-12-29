import { addItemToContainer, getVolume, type Container } from "$lib/equipment";
import type { CoinGenerationConfig, CoinSystem, PileOfCoins } from "./coin_types";
import { RNG } from "@ironarachne/rng";
import { getDefaultCoinSystem } from "./coins";

/**
 * Create a pile of coins.
 *
 * @param id the id to assign to the pile of coins
 * @param denomination the coin denomination to use
 * @param quantity the quantity of coins
 * @param value the total value of the pile
 * @param name the name of the pile of coins
 * @param description the description of the pile of coins
 * @returns
 */
export function generatePileOfCoins(id: string, denomination: string, quantity: number, value: number, name?: string, description?: string): PileOfCoins {
  return {
    id,
    name: name || `pile of ${quantity} ${denomination} coins`,
    description: description || `A pile of ${quantity} ${denomination} coins.`,
    denomination,
    quantity,
    value,
    rarity: 'common',
    itemMajorType: 'treasure',
    itemMinorType: 'coins',
    properties: [],
    weight: 0.001 * quantity, // Assume each coin weighs 0.001 kg
    densityCategory: 'dense',
  }
}

/**
 * Generate a random pile of coins based on the provided configuration.
 *
 * @param seed The seed for the random number generator
 * @param config The configuration for generating the pile of coins
 * @returns A random pile of coins
 */
export function generateRandomPileOfCoins(seed: string, config: CoinGenerationConfig): PileOfCoins {
  const rng = new RNG(seed);

  const allowedDenominations = config.allowedDenominations || config.coinSystem.denominations;
  const minDenominationIndex = config.minDenomination ? config.minDenomination : 0;
  const maxDenominationIndex = config.maxDenomination ? config.maxDenomination : config.coinSystem.denominations.length - 1;

  const filteredDenominations = allowedDenominations.filter((denom, index) => {
    return index >= minDenominationIndex && index <= maxDenominationIndex;
  });

  if (filteredDenominations.length === 0) {
    throw new Error("No denominations available for the specified configuration.");
  }

  const denomination = rng.item(filteredDenominations);

  const minValue = config.minValue || denomination.value;
  const maxValue = config.maxValue || (denomination.value * 1000); // Arbitrary upper limit

  const targetValue = rng.int(minValue, maxValue);
  const maxQuantity = Math.floor(targetValue / denomination.value);

  const quantity = rng.int(1, maxQuantity > 0 ? maxQuantity : 1);
  const value = quantity * denomination.value;

  return {
    id: `coins-${denomination}-${rng.randomString(13)}`,
    name: `pile of ${quantity} ${denomination.name} coins`,
    description: `A pile of ${quantity} ${denomination.name} coins.`,
    denomination: denomination.name,
    quantity,
    value,
    rarity: 'common',
    itemMajorType: 'treasure',
    itemMinorType: 'coins',
    properties: [],
    weight: 0.001 * quantity,
    densityCategory: 'dense',
  }
}

/**
 * Get the default configuration for generating coins.
 *
 * @returns The default coin generation configuration
 */
export function getDefaultCoinGenerationConfig(): CoinGenerationConfig {
  const coinSystem = getDefaultCoinSystem();

  return {
    allowedDenominations: coinSystem.denominations,
    minDenomination: 0,
    maxDenomination: coinSystem.denominations.length - 1,
    coinSystem,
  };
}

/**
 * Decrease the value of a pile of coins by a specified amount.
 *
 * @param pile the pile of coins to decrease in value
 * @param reductionValue the value to decrease the pile by
 * @returns
 */
export function decreaseValueOfPileOfCoins(pile: PileOfCoins, reductionValue: number, coinSystem: CoinSystem): PileOfCoins {
  const totalValue = pile.value - reductionValue;
  const coinValue = coinSystem.denominations.find(d => d.name === pile.denomination)?.value || 0;
  const newQuantity = Math.max(0, Math.floor(totalValue / coinValue));
  const newValue = newQuantity * coinValue;
  const newWeight = 0.01 * newQuantity;

  return {
    ...pile,
    quantity: newQuantity,
    value: newValue,
    weight: newWeight,
  };
}

/**
 * Get a set of denomination proportions up to a specified denomination.
 *
 * @param denomination The highest denomination to include proportions for
 * @returns
 */
export function getDenominationProportionsUpToDenomination(denomination: string, coinSystem: CoinSystem): Record<string, number> {
  const proportions: Record<string, number> = {
    copper: 0,
    silver: 0,
    electrum: 0,
    gold: 0,
    platinum: 0,
  };

  const denominationIndex = coinSystem.denominations.findIndex(d => d.name === denomination);
  const lowerDenominationCount = denominationIndex;
  const baseAmount = lowerDenominationCount > 0 ? Math.floor(10 / lowerDenominationCount) : 0;
  let remainder = lowerDenominationCount > 0 ? 10 % lowerDenominationCount : 0;

  for (let i = 0; i < coinSystem.denominations.length; i++) {
    const denom = coinSystem.denominations[i].name;

    if (i < denominationIndex) {
      let amount = baseAmount;
      if (remainder > 0) {
        amount++;
        remainder--;
      }
      proportions[denom] = amount;
    } else if (i === denominationIndex) {
      proportions[denom] = 10;
    } else {
      proportions[denom] = 0;
    }
  }

  return proportions;
}

/**
 * Get a set of piles of coins for the target value and denomination proportions.
 *
 * @param targetValue the value to convert into containers and piles of coins
 * @param denominationProportions the denominations of coins and their proportions
 * @returns
 */
export function getSetOfCoinsForValue(targetValue: number, denominationProportions: Record<string, number>, coinSystem: CoinSystem): PileOfCoins[] {
  const piles: PileOfCoins[] = [];
  let remainingValue = targetValue;

  const totalProportion = Object.values(denominationProportions).reduce((sum, val) => sum + val, 0);

  const sortedDenominations = coinSystem.denominations.slice().sort((a, b) => b.value - a.value);

  for (const denomination of sortedDenominations) {
    const proportion = denominationProportions[denomination.name] || 0;
    if (proportion <= 0) {
      continue;
    }

    const targetDenominationValue = Math.floor((proportion / totalProportion) * targetValue);

    while (remainingValue >= denomination.value && targetDenominationValue > 0) {
      const maxQuantity = Math.floor(remainingValue / denomination.value);
      if (maxQuantity <= 0) {
        break;
      }

      const quantity = maxQuantity;
      const value = quantity * denomination.value;

      const pile = generatePileOfCoins(
        `coins-${denomination.name}-${piles.length + 1}`,
        denomination.name,
        quantity,
        value
      );

      piles.push(pile);
      remainingValue -= value;
    }
  }

  return piles;
}

/**
 * Get a pile of coins for the specified target value.
 *
 * @param targetValue the value in copper coins
 * @returns
 */
export function getPileOfCoinsForValue(targetValue: number, coinSystem: CoinSystem): PileOfCoins {
  // Find the largest denomination that fits into the target value
  const sortedDenominations = coinSystem.denominations.slice().sort((a, b) => b.value - a.value);

  for (const denomination of sortedDenominations) {
    if (targetValue >= denomination.value) {
      const quantity = Math.floor(targetValue / denomination.value);
      const value = quantity * denomination.value;

      return generatePileOfCoins(
        `coins-${denomination.name}-single`,
        denomination.name,
        quantity,
        value
      );
    }
  }

  // If the target value is less than the smallest denomination, return zero copper coins
  return generatePileOfCoins('coins-copper-0', 'copper', 0, 0);
}

/**
 * Increase the value of a pile of coins by a specified amount.
 *
 * @param pile the pile to increase in value
 * @param additionalValue the amount to increase
 * @returns
 */
export function increaseValueOfPileOfCoins(pile: PileOfCoins, additionalValue: number, coinSystem: CoinSystem): PileOfCoins {
  const totalValue = pile.value + additionalValue;
  const coinValue = coinSystem.denominations.find(d => d.name === pile.denomination)?.value || 0;
  const newQuantity = Math.floor(totalValue / coinValue);
  const newValue = newQuantity * coinValue;
  const newWeight = 0.01 * newQuantity;

  return {
    ...pile,
    quantity: newQuantity,
    value: newValue,
    weight: newWeight,
  };
}

/**
 * Split a pile of coins into multiple piles each with a maximum quantity.
 *
 * @param pile the pile to split
 * @param splitQuantity the maximum quantity for each split pile
 * @returns
 */
export function splitPileOfCoins(pile: PileOfCoins, splitQuantity: number, coinSystem: CoinSystem): PileOfCoins[] {
  if (splitQuantity >= pile.quantity) {
    return [pile];
  }

  const newPiles: PileOfCoins[] = [];

  const numberOfPilesNeeded = Math.ceil(pile.quantity / splitQuantity);

  for (let i = 0; i < numberOfPilesNeeded; i++) {
    const quantityForThisPile = (i === numberOfPilesNeeded - 1) ? (pile.quantity - (i * splitQuantity)) : splitQuantity;

    const newPile = generatePileOfCoins(
      `${pile.id}-part-${i + 1}`,
      pile.denomination,
      quantityForThisPile,
      quantityForThisPile * (coinSystem.denominations.find(d => d.name === pile.denomination)?.value || 0)
    );

    newPiles.push(newPile);
  }

  return newPiles;
}

/**
 * Distribute a pile of coins amongst a set of containers.
 * Tries to fill containers from largest to smallest capacity.
 *
 * @param pile the pile of coins to distribute
 * @param containers the containers to fill
 * @returns
 */
export function distributeCoins(pile: PileOfCoins, containers: Container[], coinSystem: CoinSystem, rng?: RNG): { containers: Container[], containedItems: PileOfCoins[], looseItems: PileOfCoins[] } {
  let sortedContainers = [...containers].sort((a, b) => (b.maxVolume - b.currentVolume) - (a.maxVolume - a.currentVolume));

  if (rng) {
    sortedContainers = rng.shuffle(sortedContainers);
  }

  const containedItems: PileOfCoins[] = [];
  const looseItems: PileOfCoins[] = [];
  let remainingQuantity = pile.quantity;
  const coinValue = coinSystem.denominations.find(d => d.name === pile.denomination)?.value || 0;
  const weightPerCoin = 0.001;
  const volumePerCoin = getVolume({ ...pile, weight: weightPerCoin });

  // If we have multiple containers, try to split the pile among them
  // Calculate a target amount per container to encourage spreading
  // But ensure we don't split into tiny piles if not necessary
  const targetSplit = rng && sortedContainers.length > 0 ? Math.ceil(remainingQuantity / sortedContainers.length) : remainingQuantity;

  for (const container of sortedContainers) {
    if (remainingQuantity <= 0) {
      break;
    }

    const maxQuantityByWeight = Math.floor((container.maxWeight - container.currentWeight) / weightPerCoin);
    const maxQuantityByVolume = Math.floor((container.maxVolume - container.currentVolume) / volumePerCoin);
    const maxQuantity = Math.min(maxQuantityByWeight, maxQuantityByVolume);

    // If we are spreading, try to take the target split, but vary it a bit
    let quantityToStore = Math.min(remainingQuantity, maxQuantity);

    if (rng && sortedContainers.length > 1) {
      const variance = rng.float(0.5, 1.5);
      const targetWithVariance = Math.floor(targetSplit * variance);
      quantityToStore = Math.min(quantityToStore, targetWithVariance);
    }

    if (quantityToStore > 0) {
      const newPile = generatePileOfCoins(
        `${pile.id}-part-${container.id}`,
        pile.denomination,
        quantityToStore,
        quantityToStore * coinValue
      );

      addItemToContainer(container, newPile);
      containedItems.push(newPile);
      remainingQuantity -= quantityToStore;
    }
  }

  // If we still have coins left after the first pass (due to variance or capacity limits),
  // try to fill remaining space in any container
  if (remainingQuantity > 0) {
    for (const container of sortedContainers) {
      if (remainingQuantity <= 0) break;

      const maxQuantityByWeight = Math.floor((container.maxWeight - container.currentWeight) / weightPerCoin);
      const maxQuantityByVolume = Math.floor((container.maxVolume - container.currentVolume) / volumePerCoin);
      const maxQuantity = Math.min(maxQuantityByWeight, maxQuantityByVolume);

      const quantityToStore = Math.min(remainingQuantity, maxQuantity);

      if (quantityToStore > 0) {
        const newPile = generatePileOfCoins(
          `${pile.id}-part-${container.id}-overflow`,
          pile.denomination,
          quantityToStore,
          quantityToStore * coinValue
        );

        addItemToContainer(container, newPile);
        containedItems.push(newPile);
        remainingQuantity -= quantityToStore;
      }
    }
  }

  if (remainingQuantity > 0) {
    const loosePile = generatePileOfCoins(
      `${pile.id}-loose`,
      pile.denomination,
      remainingQuantity,
      remainingQuantity * coinValue
    );
    looseItems.push(loosePile);
  }

  return {
    containers: sortedContainers,
    containedItems,
    looseItems,
  };
}

/**
 * Combine multiple piles of coins into consolidated piles by denomination.
 *
 * @param piles The piles of coins to combine
 * @param coinSystem The coin system to use for value calculations
 * @returns An array of consolidated piles, one per denomination found
 */
export function combinePilesOfCoins(piles: PileOfCoins[], coinSystem: CoinSystem): PileOfCoins[] {
  const pilesByDenomination: Record<string, PileOfCoins[]> = {};

  for (const pile of piles) {
    if (!pilesByDenomination[pile.denomination]) {
      pilesByDenomination[pile.denomination] = [];
    }
    pilesByDenomination[pile.denomination].push(pile);
  }

  const consolidatedPiles: PileOfCoins[] = [];

  for (const denomination in pilesByDenomination) {
    const currentPiles = pilesByDenomination[denomination];
    if (currentPiles.length === 0) continue;

    const totalQuantity = currentPiles.reduce((sum, p) => sum + p.quantity, 0);
    const coinValue = coinSystem.denominations.find(d => d.name === denomination)?.value || 0;
    const totalValue = totalQuantity * coinValue;

    // Use the ID of the first pile as a base, or generate a new one
    const newId = `${currentPiles[0].id}-combined`;

    consolidatedPiles.push(generatePileOfCoins(newId, denomination, totalQuantity, totalValue));
  }

  return consolidatedPiles;
}


