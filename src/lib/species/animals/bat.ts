import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "bat",
  pluralName: "bats",
  adjective: "bat",
  breedType: "bat",
  environments: ["forest", "mountain", "underdark"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "fur",
      category: "fur",
      options: ["silver", "brown", "grey", "olive"],
      tags: ["fur"],
    },
    {
      name: "skin",
      category: "skin",
      options: ["brown", "pink", "light", "tan"],
      tags: ["skin"],
    },
    {
      name: "wings",
      category: "wings",
      options: ["big", "wide", "black", "brown", "tan"],
      tags: ["wings"],
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
  baseThreatLevel: 0,
  abilities: [
    {
      name: "flight",
      description: "can fly",
      category: "movement",
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["bat"],
};
