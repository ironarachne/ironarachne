"use strict";

import * as RND from "@ironarachne/rng";
import PlanetClassification from "./classification.js";

export function getClassification(classificationName: string) {
  if (classificationName == "random") {
    return RND.item(all());
  }

  return getClassificationByName(classificationName);
}

export function getClassificationNames(): string[] {
  const classifications = all();

  let results = [];

  for (let i = 0; i < classifications.length; i++) {
    results.push(classifications[i].name);
  }

  return results;
}

export function getClassificationByName(name: string) {
  const options = all();

  for (let i = 0; i < options.length; i++) {
    if (options[i].name == name) {
      return options[i];
    }
  }
}

export function getHazardsForClassification(classification: PlanetClassification) {
  const hazards = {
    arid: [
      "The atmosphere is very thin and breathing apparatus is required outside.",
      "Vast sandstorms occasionally sweep across the surface of the planet.",
      "High winds sometimes create dangerous dust storms that can destroy unprotected buildings and ships.",
      "Dune seas across the planet are home to a dangerous species of predator.",
      "Sandstorms of horrific velocity arise without warning.",
    ],
    barren: [
      "There is no atmosphere. A vaccsuit is required.",
      "Meteor strikes are frequent.",
      "The landscape is peppered with debris from meteor strikes, making travel difficult.",
      "Unprotected by an atmosphere, this world is constantly bombarded by powerful radiation.",
      "The surface is covered in radioactive remains of crashed starships.",
    ],
    garden: [
      "Life is prolific here, and there are many dangerous native predators.",
      "A local virus is highly dangerous to non-natives.",
      "There are many dangerous plants and animals on this world.",
      "Rainstorms on this planet cause frequent floods in the lower-lying areas.",
      "Several species of local insects are highly venomous.",
      "A primitive local sapient species is extremely aggressive.",
    ],
    "gas giant": [
      "Vast storms the size of small planets rage across the surface.",
      "An aggressive species of floating leviathan is widespread across this planet.",
      "Navigating the upper atmosphere is possible but dangerous due to the many chaotic weather systems.",
      "The gasses making up the planet's atmosphere are highly corrosive and dangerous to spacecraft.",
      "The highly-combustible gasses of the upper atmosphere are easily ignited.",
    ],
    ice: [
      "Fierce winds whip the surface, chilling the air well below the normal temperatures.",
      "The ice is thinner in places and cannot hold heavy vehicles or starships.",
      "Occasional meteor storms cause explosions of sharp shattered ice that shower for miles.",
      "Pockets of superheated gas beneath the ice sometimes cause the surface to burst and unleash a geyser of hot gas, boiling water, and shards of ice.",
      "Ice storms are common all over the planet.",
    ],
    jungle: [
      "There are numerous species of deadly predator living in the jungle.",
      "The heat and humidity of this world make it a constant struggle to keep plantlife from claiming settlements.",
      "It is unbearably hot for non-natives most of the time, requiring a suit for outdoor activity.",
      "Hidden throughout the greenery of the jungle are spots of quicksand that will devour unwary travellers.",
      "Local life is massive and even the herbivores are extremely dangerous.",
    ],
    ocean: [
      "The still waters hide monstrous leviathans that can devour entire cities.",
      "Ferocious swarms of fish plague the surface.",
      "Vast blooms of algae can corrode even the most advanced armor.",
      "The water contains acidic substances that erode metal but leave plastics untouched.",
      "A local species of fish emits an unbearable sonic blast when threatened.",
    ],
    swamp: [
      "It's very difficult to tell where solid land is. Landing on what appears to be a muddy plain might result in sinking forever into the muck.",
      "A species of parasitic insect local to the planet carries a nasty disease that is highly contagious.",
      "The complicated ecosystem is easy to upset, and outside interference can cause widespread destruction.",
      "The atmosphere is very thick, requiring breathing apparatus for outside activity.",
      "A species of aerial predator makes being exposed highly dangerous.",
    ],
    toxic: [
      "The air is corrosive and will erode unprotected equipment.",
      "The planet's surface is covered in many acid lakes.",
      "Toxins in the air are so virulent that they will eat through even heavy protection eventually.",
      "Corrosive elements in the water make the seas and rain deadly to manmade structures.",
      "Acid rainstorms are frequent.",
    ],
    volcanic: [
      "Deadly eruptions are frequent.",
      "Lava flows in several areas are unpredictable and quick to change direction.",
      "The air is filled with poisonous gases released by eruptions.",
      "Acid rains frequently plague this world.",
      "Ashes from eruptions cause havoc with unfiltered systems.",
    ],
  };

  return Reflect.get(hazards, classification.name);
}

export function all() {
  return [
    new PlanetClassification("arid", 9500, 19000, 1.0, 8.0, 237, 500, 0.4, 2.4, true, true, true),
    new PlanetClassification(
      "barren",
      4800,
      19000,
      0.3,
      0.65,
      80,
      1500,
      0.3,
      6.0,
      false,
      false,
      false,
    ),
    new PlanetClassification(
      "garden",
      10000,
      14000,
      3.0,
      7.0,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true,
    ),
    new PlanetClassification(
      "gas giant",
      45000,
      150000,
      85.0,
      1900.0,
      4000,
      70000,
      5.0,
      40.0,
      false,
      false,
      true,
    ),
    new PlanetClassification(
      "ice",
      4800,
      19000,
      0.3,
      0.65,
      4000,
      80000,
      5.0,
      60.0,
      true,
      true,
      true,
    ),
    new PlanetClassification(
      "jungle",
      9500,
      19000,
      3.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true,
    ),
    new PlanetClassification(
      "ocean",
      9500,
      19000,
      1.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true,
    ),
    new PlanetClassification(
      "swamp",
      9500,
      19000,
      3.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true,
    ),
    new PlanetClassification(
      "toxic",
      9500,
      19000,
      1.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true,
    ),
    new PlanetClassification(
      "volcanic",
      9500,
      19000,
      1.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true,
    ),
  ];
}
