import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "gryphon",
  pluralName: "gryphons",
  adjective: "gryphon",
  breedType: "gryphon",
  environments: ["forest", "grassland", "hill", "mountain"],
  creatureTypes: ["monstrosity"],
  physicalTraitGeneratorConfigs: [
    {
      name: "wings",
      category: "wings",
      options: ["wide", "broad"],
      tags: ["wings"],
    },
    {
      name: "beak",
      category: "beak",
      options: ["hooked", "crooked", "large", "sharp"],
      tags: ["beak"],
    },
    {
      name: "feathers",
      category: "feathers",
      options: ["white", "grey", "silver", "brown"],
      tags: ["feathers"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["brown", "blue", "amber", "grey"],
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
  baseThreatLevel: 3,
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
  tags: ["gryphon", "monstrosity"],
};
