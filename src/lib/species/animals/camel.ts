import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "camel",
  pluralName: "camels",
  adjective: "camel",
  breedType: "camel",
  environments: ["desert"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["beige", "brown", "tan"],
      tags: ["fur"],
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "light", "tan"],
      tags: ["skin"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["amber", "brown", "dark", "green"],
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
      commonality: 3,
    },
  ],
  baseThreatLevel: 1,
  abilities: [],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["camel"],
};