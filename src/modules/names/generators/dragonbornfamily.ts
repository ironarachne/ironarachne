"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class DragonbornFamilyGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "dragonborn family";

    this.patterns = [
      "vlpvlvn",
      "ovlMvRvV",
      "pvRRcYlION",
      "pvRRcYlIvN",
      "pvdcYlIvN",
      "cvRvXIUS",
    ];

    let prefixes = [
      "WHITE",
      "GREEN",
      "BLUE",
      "WILD",
      "SUMMER",
      "WINTER",
      "WIND",
      "DAWN",
      "DUSK",
      "SKY",
      "NIGHT",
      "FIRE",
      "FLAME",
      "RAGE",
      "HAMMER",
      "RED",
      "DARK",
      "SPELL",
      "WAR",
    ];

    let suffixes = [
      "BLADE",
      "BROW",
      "SCALE",
      "SPEAR",
      "RIDER",
      "WALKER",
      "RUNNER",
      "TALON",
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
