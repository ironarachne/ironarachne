import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "steam mephit",
  pluralName: "steam mephits",
  adjective: "steam mephit",
  breedType: "steam mephit",
  environments: ["underwater"],
  creatureTypes: ["elemental"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["red", "mottled red", "black", "mottled black"],
      tags: ["skin"],
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
      name: "spell: blur",
      description: "can cast blur",
      category: "spell",
      threatLevel: 1,
    },
    {
      name: "steam explosion on death",
      description: "explodes in steam on death",
      category: "attack",
      threatLevel: 1,
    },
    {
      name: "scalding steam breath",
      description: "can breathe scalding steam",
      category: "attack",
      threatLevel: 2,
    },
    {
      name: "immunity: fire",
      description: "is immune to fire",
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
  commonality: 5,
  genders: [
    { name: "female", pronouns: { subjective: "she", objective: "her", possessive: "her", reflexive: "herself" } },
    { name: "male", pronouns: { subjective: "he", objective: "him", possessive: "his", reflexive: "himself" } },
  ],
  sizeGeneratorConfigMatrix: Sizes.humanStandard(), // TODO: make real sizes
  tags: ["elemental", "steam mephit"],
};
