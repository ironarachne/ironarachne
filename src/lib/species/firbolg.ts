"use strict";

import * as MUN from "@ironarachne/made-up-names";
import * as AgeCategories from "../age/agecategories.js";
import type Item from "../equipment/item.js";
import Gender from "../gender.js";
import PhysicalTraitGenerator from "../physicaltraits/generator.js";
import type StatBlock from "../statblock.js";
import type Species from "./species.js";

export default class Firbolg implements Species {
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
    this.name = "firbolg";
    this.abilities = ["can turn invisible when not attacking"];
    this.tags = ["firbolg", "giant", "human", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.FantasySet();
    this.description = "";
    this.summary = "";
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "firbolgs";
    this.adjective = "firbolg";
    this.commonality = 5;
    this.environments = ["forest", "grassland", "hill", "mountain"];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 2;
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
        ["bronzed", "light", "pale", "tan", "white"],
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
      new Gender(
        "female",
        "she",
        "her",
        "her",
        500,
        AgeCategories.getHumanVariant(5.0, 1.75, 1.75, "female"),
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        500,
        AgeCategories.getHumanVariant(5.0, 1.9, 1.8, "male"),
      ),
    ];
  }
}
