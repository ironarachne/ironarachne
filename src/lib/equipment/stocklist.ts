"use strict";

import * as Components from "./components/components.js";
import * as Equipment from "./equipment.js";
import type Item from "./item.js";

export function getList(category: string, amount: number, valueThreshold: number): Item[] {
  let components = Components.all();

  let items = Equipment.generate(category, components, amount, valueThreshold);

  return items;
}
