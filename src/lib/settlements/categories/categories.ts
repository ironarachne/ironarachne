"use strict";

import * as RND from "@ironarachne/rng";
import Borough from "./borough.js";
import SettlementCategory from "./category.js";
import City from "./city.js";
import Hamlet from "./hamlet.js";
import Metropolis from "./metropolis.js";
import Town from "./town.js";
import Village from "./village.js";

export function all(): SettlementCategory[] {
  return [new Hamlet(), new Village(), new Town(), new Borough(), new City(), new Metropolis()];
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
