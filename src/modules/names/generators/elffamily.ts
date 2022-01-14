"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class ElfFamilyGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "elf family";

    this.patterns = [
      "vlpvlvn",
    ];

    let prefixes = [
      "WHITE",
      "GREEN",
      "BLUE",
      "WILD",
      "SUMMER",
      "WINTER",
      "WIND",
      "BEACH",
      "DAWN",
      "DUSK",
      "SKY",
      "NIGHT",
    ];

    let suffixes = [
      "FLOWER",
      "WALKER",
      "SONG",
      "RUNNER",
      "CROWN",
      "BLOSSOM",
      "BELL",
      "WATCHER",
      "GUARD",
      "STAR",
      "GROVE",
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
