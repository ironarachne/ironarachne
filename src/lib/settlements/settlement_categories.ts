import * as RNG from "@ironarachne/rng";

import Borough from "./categories/borough.js";
import City from "./categories/city.js";
import Hamlet from "./categories/hamlet.js";
import Metropolis from "./categories/metropolis.js";
import Town from "./categories/town.js";
import Village from "./categories/village.js";
import type SettlementCategory from "./settlement_category.js";

export function all(): SettlementCategory[] {
  return [Hamlet, Village, Town, Borough, City, Metropolis];
}

export function bySizeClass(sizeClass: string): SettlementCategory[] {
  const options = all();
  let result: SettlementCategory[] = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].sizeClass === sizeClass) {
      result.push(options[i]);
    }
  }

  return result;
}

export function small(): SettlementCategory[] {
  return bySizeClass("small");
}

export function medium(): SettlementCategory[] {
  return bySizeClass("medium");
}

export function large(): SettlementCategory[] {
  return bySizeClass("large");
}

export function randomCategory(
  categories: SettlementCategory[],
  rng: RNG.RNG
): SettlementCategory {
  return rng.item(categories);
}

export function randomDescription(category: SettlementCategory, rng: RNG.RNG): string {
  let description = rng.item(category.possibleDescriptions);
  return description;
}

export function randomPopulation(category: SettlementCategory, rng: RNG.RNG): number {
  return rng.int(category.minSize, category.maxSize);
}
