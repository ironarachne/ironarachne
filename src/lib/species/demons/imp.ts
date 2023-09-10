import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "imp",
  pluralName: "imps",
  adjective: "imp",
  breedType: "imp",
  environments: ["desert", "forest", "grassland", "mountain", "underdark", "urban"],
  creatureTypes: ["fiend"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["brown", "mottled brown", "olive", "black"],
      tags: ["skin"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["glowing amber", "glowing orange", "glowing red"],
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
  abilities: [
    {
      name: "shapeshift into animal",
      description: "can shapeshift into an animal",
      category: "shapeshift",
      threatLevel: 2,
    },
    {
      name: "darkvision",
      description: "can see in darkness",
      category: "senses",
      threatLevel: 1,
    },
    {
      name: "resistance: magic",
      description: "is resistant to magic",
      category: "resistance",
      threatLevel: 1,
    },
  ],
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["demon", "fiend", "imp"],
};
