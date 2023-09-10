import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "rust monster",
  pluralName: "rust monsters",
  adjective: "rust monster",
  breedType: "rust monster",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["red", "russet", "brown"],
      tags: ["body"],
    },
    {
      name: "feelers",
      category: "feelers",
      options: ["brown", "ochre", "tan", "grey"],
      tags: ["feelers"],
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
  baseThreatLevel: 0,
  abilities: [
    {
      name: "rusting touch",
      description: "rusts nonmagical metal it touches",
      category: "attack",
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["rust monster", "monstrosity"],
};
