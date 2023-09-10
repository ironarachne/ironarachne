import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "fire beetle",
  pluralName: "fire beetles",
  adjective: "fire beetle",
  breedType: "fire beetle",
  environments: ["forest", "underdark"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["red", "mottled red", "black", "mottled black"],
      tags: ["body"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["red", "black", "dark"],
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
      name: "illumination",
      description: "glows with soft orange light",
      category: "misc",
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["insect", "fire beetle", "beetle"],
};
