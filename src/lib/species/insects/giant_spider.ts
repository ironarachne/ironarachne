import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "giant spider",
  pluralName: "giant spiders",
  adjective: "giant spider",
  breedType: "giant spider",
  environments: ["coastal", "forest", "grassland", "hill", "mountain", "underdark", "urban"],
  creatureTypes: ["beast"],
  physicalTraitGeneratorConfigs: [
    {
      name: "body",
      category: "body",
      options: ["white", "black", "brown"],
      tags: ["body"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["black", "dark", "red", "brown"],
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
      name: "venomous bite",
      description: "can bite with venom",
      category: "attack",
      threatLevel: 1,
    },
    {
      name: "spin web",
      description: "can spin webs",
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
  tags: ["insect", "giant spider", "spider", "arachnid"],
};
