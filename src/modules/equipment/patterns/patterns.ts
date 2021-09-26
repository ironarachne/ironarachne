"use strict";

import * as Components from "../components/components";
import * as Item from "../item";
import * as ArmorPattern from "./armor";
import * as ClothingPattern from "./clothing";
import * as WeaponPattern from "./weapons";

export interface Pattern {
  name: string;
  tags: string[];
  baseValue: number;
  complete(componentOptions: Components.Component[], valueThreshold: number): Item.Item;
}

export function all(): Pattern[] {
  let result = [];

  result.push(...ArmorPattern.all());
  result.push(...ClothingPattern.all());
  result.push(...WeaponPattern.all());

  return result;
}

export function forCategory(category: string): Pattern[] {
  let options = all();

  let result = [];

  for (let i=0;i<options.length;i++) {
    if (options[i].tags.includes(category)) {
      result.push(options[i]);
    }
  }

  return result;
}
