"use strict";

import * as TownCategory from "./category";
import * as RND from "../random";
import TownGeneratorConfig from "./generatorconfig";
import Town from "./town";

export default class TownGenerator {
  config: TownGeneratorConfig;

  constructor(config: TownGeneratorConfig) {
    this.config = config;
  }

  generate(): Town {
    const townName = this.config.nameGenerator.generate(1)[0];
    const town = new Town(townName, this.config.environment);

    const townCategory = selectCategory(this.config.size);

    const population = townCategory.randomPopulation();

    let description = randomDescription();

    description = description.replace("{category}", townCategory.name);
    description = description.replace(
      "{population}",
      new Intl.NumberFormat().format(population)
    );
    description = description.replace("{name}", town.name);
    description += " " + townCategory.randomDescription();
    description += " " + RND.item(town.environment.biome.features);

    town.description = description;

    return town;
  }
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
  return RND.item([
    "{name} is a {category} of {population} people.",
    "The {category} of {name} has {population} people.",
  ]);
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

