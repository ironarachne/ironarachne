"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class DragonbornFemaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "dragonborn female";

    this.patterns = [
      "tvMvt",
      "cul",
      "cvlv",
      "ovRRv",
      "lAIvNN",
    ];
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
