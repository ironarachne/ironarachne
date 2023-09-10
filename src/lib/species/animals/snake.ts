import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "snake",
  pluralName: "snakes",
  adjective: "snake",
  breedType: "snake",
  environments: ["desert", "forest", "mountain"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "scales",
      category: "scales",
      options: ["black", "brown", "tan", "striped", "diamond-patterned", "green", "grey", "white", "pale", "yellow"],
      tags: ["scales"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green", "black", "white"],
      tags: ["eyes"],
    },
  ],
  ageCategories: [
    {
      name: "hatchling",
      noun: "baby",
      minAge: 0,
      maxAge: 1,
      genderedNoun: ["baby girl", "baby boy", "baby"],
      commonality: 1,
    },
    { name: "adult", noun: "adult", minAge: 5, maxAge: 30, genderedNoun: ["woman", "man", "adult"], commonality: 20 },
    {
      name: "elderly",
      noun: "elder",
      minAge: 31,
      maxAge: 45,
      genderedNoun: ["old woman", "old man", "elder"],
      commonality: 3,
    },
  ],
  baseThreatLevel: 0,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["snake"],
};
