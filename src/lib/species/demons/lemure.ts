import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "lemure",
  pluralName: "lemures",
  adjective: "lemure",
  breedType: "lemure",
  environments: ["desert", "forest", "grassland", "mountain", "underdark", "urban"],
  creatureTypes: ["fiend"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["brown", "mottled brown", "olive", "mottled green"],
      tags: ["skin"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["glowing", "black", "white"],
      tags: ["eyes"],
    },
  ],
  ageCategories: [
    {
      name: "infant",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1,
    },
    { name: "child", noun: "child", minAge: 2, maxAge: 4, genderedNoun: ["girl", "boy", "child"], commonality: 2 },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 1,
    },
  ],
  baseThreatLevel: 1,
  abilities: [
    {
      name: "immunity: fire damage",
      description: "is immune to fire damage",
      category: "immunity",
      threatLevel: 1,
    },
    {
      name: "immunity: poison",
      description: "is immune to poison",
      category: "immunity",
      threatLevel: 1,
    },
  ],
  commonality: 4,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["demon", "fiend", "lemure"],
};
