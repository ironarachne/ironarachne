"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class DwarfFamilyGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "dwarf family";

    this.patterns = [];

    const prefixes = [
      "BATTLE",
      "BROAD",
      "COPPER",
      "FIRE",
      "GEM",
      "GOLD",
      "INGOT",
      "JADE",
      "OAK",
      "ONYX",
      "ROCK",
      "RUBY",
      "SILVER",
      "STEEL",
      "STONE",
    ];

    const suffixes = [
      "BANE",
      "BEARD",
      "BREWER",
      "CHIN",
      "FALL",
      "FOOT",
      "GRIP",
      "HAMMER",
      "HILL",
      "MOUNTAIN",
      "RIVER",
      "TUNNEL",
    ];

    for (let i=0;i<prefixes.length;i++) {
      for (let j=0;j<suffixes.length;j++) {
        this.patterns.push(prefixes[i] + suffixes[j]);
      }
    }
  }

  generate(numberOfNames: number): string[] {
    let names = [];

    for (let i=0;i<numberOfNames;i++) {
      let name = Invented.generate(this.patterns);
      names.push(name);
    }

    return names;
  }
}
