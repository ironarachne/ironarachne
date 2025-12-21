import { containerTypes, generateContainer, getContainerTypeForCapacity } from "$lib/equipment";
import type { Container } from "../equipment/equipment_types";
import type { CoinDenomination, PileOfCoins } from "./treasure_types";

export const CoinDenominations: CoinDenomination[] = ['copper', 'silver', 'electrum', 'gold', 'platinum'];

const coinValues: Record<CoinDenomination, number> = {
  copper: 1,
  silver: 10,
  electrum: 50,
  gold: 100,
  platinum: 1000,
};

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
export function generatePileOfCoins(id: string, denomination: CoinDenomination, quantity: number, value: number, name?: string, description?: string): PileOfCoins {
  return {
    id,
    name: name || `pile of ${quantity} ${denomination} coins`,
    description: description || `A pile of ${quantity} ${denomination} coins.`,
    denomination,
    quantity,
    value,
    rarity: 'common',
    properties: [],
  }
}

/**
 * Decrease the value of a pile of coins by a specified amount.
 *
 * @param pile the pile of coins to decrease in value
 * @param reductionValue the value to decrease the pile by
 * @returns
 */
export function decreaseValueOfPileOfCoins(pile: PileOfCoins, reductionValue: number): PileOfCoins {
  const totalValue = pile.value - reductionValue;
  const coinValue = coinValues[pile.denomination];
  const newQuantity = Math.max(0, Math.floor(totalValue / coinValue));
  const newValue = newQuantity * coinValue;

  return {
    ...pile,
    quantity: newQuantity,
    value: newValue,
  };
}

/**
 * Get a set of denomination proportions up to a specified denomination.
 *
 * @param denomination The highest denomination to include proportions for
 * @returns
 */
export function getDenominationProportionsUpToDenomination(denomination: CoinDenomination): Record<CoinDenomination, number> {
  const proportions: Record<CoinDenomination, number> = {
    copper: 0,
    silver: 0,
    electrum: 0,
    gold: 0,
    platinum: 0,
  };

  const denominationIndex = CoinDenominations.indexOf(denomination);
  const lowerDenominationCount = denominationIndex;
  const baseAmount = lowerDenominationCount > 0 ? Math.floor(10 / lowerDenominationCount) : 0;
  let remainder = lowerDenominationCount > 0 ? 10 % lowerDenominationCount : 0;

  for (let i = 0; i < CoinDenominations.length; i++) {
    const denom = CoinDenominations[i];

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
 * Return the highest denomination of coin that can be used for the specified value.
 *
 * @param value the value to consider
 * @param useElectrum whether to use electrum or not
 * @param usePlatinum whether to use platinum or not
 * @returns
 */
export function getMaxDenominationForValue(value: number, useElectrum = true, usePlatinum = true): CoinDenomination {
  if (value >= coinValues.platinum && usePlatinum) {
    return 'platinum';
  }

  if (value >= coinValues.gold) {
    return 'gold';
  }

  if (value >= coinValues.electrum && useElectrum) {
    return 'electrum';
  }

  if (value >= coinValues.silver) {
    return 'silver';
  }

  return 'copper';
}

/**
 * Get a set of piles of coins for the target value, distributed in a set of containers.
 *
 * @param targetValue the value to convert into containers and piles of coins
 * @param denominationProportions the denominations of coins and their proportions
 * @returns
 */
export function getSetOfCoinsForValue(targetValue: number, denominationProportions: Record<CoinDenomination, number>): Record<"containers" | "piles", Container[] | PileOfCoins[]> {
  const piles: PileOfCoins[] = [];
  let remainingValue = targetValue;

  const totalProportion = Object.values(denominationProportions).reduce((sum, val) => sum + val, 0);

  for (const denomination of CoinDenominations) {
    const proportion = denominationProportions[denomination] || 0;
    const allocatedValue = Math.floor((proportion / totalProportion) * targetValue);
    const coinValue = coinValues[denomination];
    const quantity = Math.floor(allocatedValue / coinValue);
    const value = quantity * coinValue;

    if (quantity > 0) {
      piles.push(generatePileOfCoins(
        `coins-${denomination}-${quantity}`,
        denomination,
        quantity,
        value
      ));
      remainingValue -= value;
    }
  }

  // If there's any remaining value, try to allocate it to the highest denomination possible
  if (remainingValue > 0) {
    for (let i = CoinDenominations.length - 1; i >= 0; i--) {
      const denomination = CoinDenominations[i];
      const coinValue = coinValues[denomination];

      while (remainingValue >= coinValue) {
        let pile = piles.find(p => p.denomination === denomination);
        if (!pile) {
          pile = generatePileOfCoins(
            `coins-${denomination}-0`,
            denomination,
            0,
            0
          );
          piles.push(pile);
        }

        const newQuantity = pile.quantity + 1;
        const newValue = newQuantity * coinValue;

        Object.assign(pile, {
          quantity: newQuantity,
          value: newValue,
        });

        remainingValue -= coinValue;
      }
    }
  }

  const containerCapacityNeeded = piles.reduce((sum, pile) => sum + pile.quantity, 0);

  const containerType = getContainerTypeForCapacity(containerCapacityNeeded) || containerTypes[0];

  // Generate containers to hold the coins, splitting piles if necessary to fit container capacity
  const containers: Container[] = [];
  let currentContainer = generateContainer(`container-coins-1-${Date.now().toString()}`, containerType);
  let currentCapacityUsed = 0;
  let containerIndex = 1;
  const finalPiles: PileOfCoins[] = [];

  for (const pile of piles) {
    let remainingQuantity = pile.quantity;

    while (remainingQuantity > 0) {
      const spaceLeft = currentContainer.capacity - currentCapacityUsed;
      const quantityToAdd = Math.min(remainingQuantity, spaceLeft);

      if (quantityToAdd > 0) {
        const partialPile = generatePileOfCoins(
          `${pile.id}-part-${pile.quantity - remainingQuantity + 1}`,
          pile.denomination,
          quantityToAdd,
          quantityToAdd * coinValues[pile.denomination]
        );

        currentContainer.contents.push(partialPile.id);
        currentCapacityUsed += quantityToAdd;
        remainingQuantity -= quantityToAdd;
        finalPiles.push(partialPile);
      }

      if (currentCapacityUsed >= currentContainer.capacity && remainingQuantity > 0) {
        containers.push(currentContainer);
        containerIndex++;
        currentContainer = generateContainer(`container-coins-${containerIndex}-${Date.now().toString()}`, containerType);
        currentCapacityUsed = 0;
      }
    }
  }

  if (currentCapacityUsed > 0) {
    containers.push(currentContainer);
  }

  return { containers, piles: finalPiles };
}

/**
 * Get a pile of coins for the specified target value.
 *
 * @param targetValue the value in copper coins
 * @returns
 */
export function getPileOfCoinsForValue(targetValue: number): PileOfCoins {
  // Find the largest denomination that fits into the target value
  for (let i = CoinDenominations.length - 1; i >= 0; i--) {
    const denomination = CoinDenominations[i];
    const coinValue = coinValues[denomination];

    if (targetValue >= coinValue) {
      const quantity = Math.floor(targetValue / coinValue);
      const value = quantity * coinValue;

      return generatePileOfCoins(
        `coins-${denomination}-${quantity}`,
        denomination,
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
export function increaseValueOfPileOfCoins(pile: PileOfCoins, additionalValue: number): PileOfCoins {
  const totalValue = pile.value + additionalValue;
  const coinValue = coinValues[pile.denomination];
  const newQuantity = Math.floor(totalValue / coinValue);
  const newValue = newQuantity * coinValue;

  return {
    ...pile,
    quantity: newQuantity,
    value: newValue,
  };
}

/**
 * Split a pile of coins into multiple piles each with a maximum quantity.
 *
 * @param pile the pile to split
 * @param splitQuantity the maximum quantity for each split pile
 * @returns
 */
export function splitPileOfCoins(pile: PileOfCoins, splitQuantity: number): PileOfCoins[] {
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
      quantityForThisPile * coinValues[pile.denomination]
    );

    newPiles.push(newPile);
  }

  return newPiles;
}
