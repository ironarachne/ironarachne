"use strict";

import * as RND from "./random";

export class Biome {
  name: string;
  description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}

export class BiomeType {
  name: string;
  randomDescription: Function;

  constructor(name: string, randomDescription: Function) {
    this.name = name;
    this.randomDescription = randomDescription;
  }
}

export function generate() {
  let biomeType = randomBiomeType();

  return new Biome(biomeType.name, biomeType.randomDescription());
}

function allBiomeTypes() {
  return [
    new BiomeType(
      "desert",
      function () {
        return RND.item([
          "The dunes here resemble a vast sandy sea.",
          "Sand and dry earth stretch out as far as the eye can see.",
          "Between rocky cliffs and short mesas lies sand dunes of varying sizes.",
        ]);
      },
    ),
    new BiomeType(
      "forest",
      function () {
        return RND.item([
          "This is an old forest region. Some of the trees here are bigger around than ten men linking arms could wrap around.",
          "Deciduous trees cover this area. Thick canopies give way to the occasional meadow.",
          "This forest is filled with conifers and light underbrush.",
        ]);
      },
    ),
    new BiomeType(
      "grassland",
      function () {
        return RND.item([
          "This area's broad open spaces are covered in tall grasses.",
          "Low rolling hills make up this region.",
          "The occasional hill breaks up what is otherwise a vast expanse of flat grassland.",
        ]);
      },
    ),
    new BiomeType(
      "mountain",
      function () {
        return RND.item([
          "This is a craggy mountainous region, with few trees and a lot of shrubs.",
          "This mountain area is covered in coniferous trees.",
          "Some trees are scattered about this mountainous region.",
        ]);
      },
    ),
  ];
}

function randomBiomeType() {
  return RND.item(allBiomeTypes());
}
