import * as ArmorPattern from "./armor.js";
import * as ClothingPattern from "./clothing.js";
import type Pattern from "./pattern.js";
import * as WeaponPattern from "./weapons.js";

export function all(): Pattern[] {
  let result = [];

  result.push(...ArmorPattern.all());
  result.push(...ClothingPattern.all());
  result.push(...WeaponPattern.all());

  return result;
}

export function byName(name: string): Pattern {
  let options = all();

  for (const option of options) {
    if (option.name == name) {
      return option;
    }
  }

  throw new Error(`Couldn't find pattern with name ${name}`);
}

export function forCategory(category: string): Pattern[] {
  let options = all();

  let result = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].tags.includes(category)) {
      result.push(options[i]);
    }
  }

  return result;
}
