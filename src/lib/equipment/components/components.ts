"use strict";

import * as RND from "@ironarachne/rng";
import * as Animal from "./animal.js";
import Component from "./component.js";
import * as Fabrics from "./fabrics.js";
import * as Metals from "./metals.js";
import * as Wood from "./wood.js";

export function all(): Component[] {
  let result = [];

  result.push(...Animal.all());
  result.push(...Fabrics.all());
  result.push(...Metals.all());
  result.push(...Wood.all());

  return result;
}

export function getComponentForCategory(
  category: string,
  components: Component[],
  minValue: number,
  maxValue: number,
): Component {
  let possible = [];

  for (let i = 0; i < components.length; i++) {
    if (
      components[i].subType == category
      && components[i].value <= maxValue
      && components[i].value >= minValue
    ) {
      possible.push(components[i]);
    } else if (
      components[i].category == category
      && components[i].value <= maxValue
      && components[i].value >= minValue
    ) {
      possible.push(components[i]);
    }
  }

  return RND.item(possible);
}

export function withCategory(category: string, components: Component[]): Component[] {
  let result = [];

  for (let i = 0; i < components.length; i++) {
    if (components[i].category == category || components[i].subType == category) {
      result.push(components[i]);
    }
  }

  return result;
}

export function withMinValue(value: number, components: Component[]): Component[] {
  let result = [];

  for (let i = 0; i < components.length; i++) {
    if (components[i].value >= value) {
      result.push(components[i]);
    }
  }

  return result;
}

export function withMaxValue(value: number, components: Component[]): Component[] {
  let result = [];

  for (let i = 0; i < components.length; i++) {
    if (components[i].value <= value) {
      result.push(components[i]);
    }
  }

  return result;
}

export function withMinQuality(quality: number, components: Component[]): Component[] {
  let result = [];

  for (let i = 0; i < components.length; i++) {
    if (components[i].quality >= quality) {
      result.push(components[i]);
    }
  }

  return result;
}

export function withMaxQuality(quality: number, components: Component[]): Component[] {
  let result = [];

  for (let i = 0; i < components.length; i++) {
    if (components[i].quality <= quality) {
      result.push(components[i]);
    }
  }

  return result;
}
