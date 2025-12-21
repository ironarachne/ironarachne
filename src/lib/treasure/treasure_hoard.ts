import type { Item } from "../equipment/equipment_types";
import { getArtObjectsForValue } from "./art_objects";
import { getDenominationProportionsUpToDenomination, getMaxDenominationForValue, getSetOfCoinsForValue } from "./coin_piles";
import { getGemsForValue } from "./gems";

/**
 * Get a treasure horde for a target value, distributed among coins, art objects, and gems.
 *
 * @param value the value to fill
 * @param proportions the proportions of coins, art objects, and gems to create
 * @returns
 */
export function getTreasureHoardForValue(value: number, proportions: { coins: number; artObjects: number; gems: number }): Item[] {
  // Return an array of items representing a treasure hoard as close to the given value as possible

  if (value <= 0) {
    return [];
  }

  const totalProportion = proportions.coins + proportions.artObjects + proportions.gems;
  const coinsValue = Math.floor((proportions.coins / totalProportion) * value);
  const artObjectsValue = Math.floor((proportions.artObjects / totalProportion) * value);
  const gemsValue = value - coinsValue - artObjectsValue;

  const treasureItems: Item[] = [];

  // Generate coins
  if (coinsValue > 0) {
    const highestDenomination = getMaxDenominationForValue(coinsValue);
    const denominationProportions = getDenominationProportionsUpToDenomination(highestDenomination);
    const result = getSetOfCoinsForValue(coinsValue, denominationProportions);
    treasureItems.push(...result.containers);
    treasureItems.push(...result.piles);
  }

  // Generate art objects
  if (artObjectsValue > 0) {
    const artObjects = getArtObjectsForValue(artObjectsValue);
    treasureItems.push(...artObjects);
  }

  // Generate gems
  if (gemsValue > 0) {
    const gems = getGemsForValue(gemsValue);
    treasureItems.push(...gems);
  }

  return treasureItems;
}
