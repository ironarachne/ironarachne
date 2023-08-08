"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as AgeCategories from "../age/agecategories.js";
import type Item from "../equipment/item.js";
import Gender from "../gender.js";
import PhysicalTraitGenerator from "../physicaltraits/generator.js";
import type StatBlock from "../statblock.js";
import type Species from "./species.js";

export default class Troll implements Species {
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
    this.name = "troll";
    this.abilities = ["regenerate slowly unless burned"];
    this.tags = ["corruptible", "troll", "greenskin", "martial", "sentient"];
    this.nameGeneratorSet = new MUN.TrollSet();
    this.description = "";
    this.summary = "";
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "trolls";
    this.adjective = "troll";
    this.commonality = 10;
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
    this.threatLevel = 2;
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
        AgeCategories.getHumanVariant(0.8, 1.15, 1.2, "female"),
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        80,
        AgeCategories.getHumanVariant(0.8, 1.2, 1.25, "male"),
      ),
    ];
  }
}
