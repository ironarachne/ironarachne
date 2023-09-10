import * as Sizes from "$lib/size/sizes.js";
import type Species from "../species.js";

export default <Species> {
  name: "ice mephit",
  pluralName: "ice mephits",
  adjective: "ice mephit",
  breedType: "ice mephit",
  environments: ["arctic"],
  creatureTypes: ["elemental"],
  physicalTraitGeneratorConfigs: [
    {
      name: "skin",
      category: "skin",
      options: ["brown", "mottled brown", "tan", "mottled tan"],
      tags: ["skin"],
    },
    {
      name: "eyes",
      category: "eyes",
      options: ["grey", "black", "dark"],
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
      name: "spell: fog cloud",
      description: "can cast fog cloud",
      category: "spell",
      threatLevel: 2,
    },
    {
      name: "ice explosion on death",
      description: "explodes in ice shards on death",
      category: "attack",
      threatLevel: 2,
    },
    {
      name: "breath weapon: frost",
      description: "can breathe frost",
      category: "attack",
      threatLevel: 2,
    },
    {
      name: "immunity: cold",
      description: "is immune to cold",
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
  tags: ["elemental", "ice mephit"],
};
