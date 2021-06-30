"use strict";

import * as RND from "../random";
import * as TownCategory from "@/modules/towns/category";
import {Town} from "@/modules/towns/town";

export function generate(size: string, possibleNames: string[]) {
  const town = new Town(RND.item(possibleNames));

  const townCategory = selectCategory(size);

  const population = townCategory.randomPopulation();

  let description = randomDescription();

  description = description.replace("{size}", townCategory.name);
  description = description.replace(
    "{population}",
    new Intl.NumberFormat().format(population)
  );
  description = description.replace("{name}", town.name);
  description += " " + townCategory.randomDescription();

  town.description = description;

  return town;
}

function selectCategory(size: string) {
  if (size === "small") {
    return randomCategorySmall();
  } else if (size === "medium") {
    return randomCategoryMedium();
  } else if (size === "large") {
    return randomCategoryLarge();
  }

  return randomCategory();
}

function randomDescription() {
  return RND.item(["{name} is a {size} of {population} people."]);
}

function randomCategory() {
  return RND.item(TownCategory.all());
}

function randomCategoryLarge() {
  const sizes = sizesByClass("large");

  return RND.item(sizes);
}

function randomCategoryMedium() {
  const sizes = sizesByClass("medium");

  return RND.item(sizes);
}

function randomCategorySmall() {
  const sizes = sizesByClass("small");

  return RND.item(sizes);
}

function sizesByClass(sizeClass: string) {
  const all = TownCategory.all();

  const sizes: TownCategory.TownCategory[] = [];

  all.forEach(function (element) {
    if (element.sizeClass === sizeClass) {
      sizes.push(element);
    }
  });

  return sizes;
}
