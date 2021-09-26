"use strict";

import * as Equipment from "./equipment";
import * as ComponentCollection from "./components/collection";
import * as Item from "./item";

export function getList(category: string, amount: number, valueThreshold: number): Item.Item[] {
  let components = ComponentCollection.all();

  let items = Equipment.generate(category, components, amount, valueThreshold);

  return items;
}
