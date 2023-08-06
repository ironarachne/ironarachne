"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as AgeCategories from "../age/agecategories.js";
import type Item from "../equipment/item.js";
import Gender from "../gender.js";
import PhysicalTraitGenerator from "../physicaltraits/generator.js";
import type StatBlock from "../statblock.js";
import type Species from "./species.js";

export default class Goblin implements Species {
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
    this.name = "goblin";
    this.abilities = [];
    this.tags = ["goblin", "sentient"];
    this.nameGeneratorSet = new MUN.GoblinSet();
    this.pluralName = "goblins";
    this.adjective = "goblin";
    this.commonality = 20;
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
    this.creatureTypes = ["goblinoid", "humanoid"];
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
        ["green", "grey", "pale", "dark green", "brown"],
        ["skin"],
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "red", "brown", "dark", "orange"],
        ["eyes"],
      ),
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        150,
        AgeCategories.getHumanVariant(1.5, 0.5, 0.6, "female"),
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        150,
        AgeCategories.getHumanVariant(1.5, 0.5, 0.6, "male"),
      ),
    ];
  }
}
