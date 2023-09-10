import * as RND from "@ironarachne/rng";
import random from "random";
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
    if (options[i].sizeClass == sizeClass) {
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

export function randomCategory(categories: SettlementCategory[]): SettlementCategory {
  return RND.item(categories);
}

export function randomDescription(category: SettlementCategory): string {
  let description = RND.item(category.possibleDescriptions);
  return description;
}

export function randomPopulation(category: SettlementCategory): number {
  return random.int(category.minSize, category.maxSize);
}
