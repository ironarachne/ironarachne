"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as AgeCategories from "../age/agecategories.js";
import type Item from "../equipment/item.js";
import Gender from "../gender.js";
import PhysicalTraitGenerator from "../physicaltraits/generator.js";
import type StatBlock from "../statblock.js";
import type Species from "./species.js";

export default class Human implements Species {
  name: string;
  nameGeneratorSet: MUN.GeneratorSet;
  pluralName: string;
  adjective: string;
  description: string;
  summary: string;
  commonality: number;
  carried: Item[];
  statBlock: StatBlock | null;
  environments: string[];
  creatureTypes: string[];
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];
  abilities: string[];
  tags: string[];
  threatLevel: number;

  constructor() {
    this.name = "human";
    this.abilities = [];
    this.tags = ["corruptible", "human", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.HumanSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "humans";
    this.adjective = "human";
    this.commonality = 200;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark",
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"],
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["black", "bronzed", "ebony", "light", "pale", "tan", "white"],
        ["skin"],
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "brown", "dark", "green"],
        ["eyes"],
      ),
    ];
    this.genders = [
      new Gender("female", "she", "her", "her", 100, AgeCategories.humanStandardFemale()),
      new Gender("male", "he", "him", "his", 100, AgeCategories.humanStandardMale()),
    ];
  }
}
