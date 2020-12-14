import * as iarnd from "./random.js";

export function generate() {
  let biome = {
    name: "",
    description: "",
  };

  let biomeType = random();

  biome.description = biomeType.randomDescription();
  biome.name = biomeType.name;

  return biome;
}

function allBiomes() {
  return [
    {
      name: "desert",
      randomDescription: function () {
        return iarnd.item([
          "The dunes here resemble a vast sandy sea.",
          "Sand and dry earth stretch out as far as the eye can see.",
          "Between rocky cliffs and short mesas lies sand dunes of varying sizes.",
        ]);
      },
    },
    {
      name: "forest",
      randomDescription: function () {
        return iarnd.item([
          "This is an old forest region. Some of the trees here are bigger around than ten men linking arms could wrap around.",
          "Deciduous trees cover this area. Thick canopies give way to the occasional meadow.",
          "This forest is filled with conifers and light underbrush.",
        ]);
      },
    },
    {
      name: "grassland",
      randomDescription: function () {
        return iarnd.item([
          "This area's broad open spaces are covered in tall grasses.",
          "Low rolling hills make up this region.",
          "The occasional hill breaks up what is otherwise a vast expanse of flat grassland.",
        ]);
      },
    },
    {
      name: "mountain",
      randomDescription: function () {
        return iarnd.item([
          "This is a craggy mountainous region, with few trees and a lot of shrubs.",
          "This mountain area is covered in coniferous trees.",
          "Some trees are scattered about this mountainous region.",
        ]);
      },
    },
  ];
}

function random() {
  return iarnd.item(allBiomes());
}
