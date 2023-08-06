"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as AgeCategories from "../age/agecategories.js";
import type Item from "../equipment/item.js";
import Gender from "../gender.js";
import PhysicalTraitGenerator from "../physicaltraits/generator.js";
import type StatBlock from "../statblock.js";
import type Species from "./species.js";

export default class Bugbear implements Species {
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
    this.name = "bugbear";
    this.abilities = [];
    this.tags = ["corruptible", "bugbear", "greenskin", "martial", "sentient"];
    this.nameGeneratorSet = new MUN.OrcSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "bugbears";
    this.adjective = "bugbear";
    this.commonality = 5;
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
    this.creatureTypes = ["humanoid", "goblinoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "brown", "dark", "red", "russet"],
        ["hair"],
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["black", "dark green", "dark grey", "grey", "light green", "green", "grey", "olive"],
        ["skin"],
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "red", "brown", "dark", "yellow", "orange", "grey"],
        ["eyes"],
      ),
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        80,
        AgeCategories.getHumanVariant(0.8, 1.05, 1.1, "female"),
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        80,
        AgeCategories.getHumanVariant(0.8, 1.1, 1.15, "male"),
      ),
    ];
  }
}
