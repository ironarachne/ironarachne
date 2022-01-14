"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class GnomeFamilyGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "gnome family";

    this.patterns = [
      "vPSpvMS",
      "cvnKLER",
      "cvdLER",
      "cvdER",
      "pvpLOp",
    ];

    const prefixes = [
      "AGATE",
      "ALLOY",
      "COPPER",
      "CRYSTAL",
      "DIAMOND",
      "DUST",
      "GEM",
      "GOLD",
      "IRON",
      "JADE",
      "JET",
      "JEWEL",
      "ONYX",
      "OPAL",
      "PELLET",
      "RUBY",
      "SAPPHIRE",
      "SILVER",
      "WIRE",
    ];

    const suffixes = [
      "BITER",
      "BOPPER",
      "BRANDER",
      "CHARMER",
      "CHEST",
      "DROPPER",
      "HAMMER",
      "MALLET",
      "POPPER",
      "SEEDER",
      "SENDER",
      "SHAPER",
      "SWEEPER",
      "TINKER",
      "TRADER",
      "WATCHER",
      "WEAVER",
      "WINKER",
      "WOOSHER",
      "WORKER",
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
