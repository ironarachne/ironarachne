"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class DragonbornMaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "dragonborn male";

    this.patterns = [
      "vlKvSIA",
      "cvLvSAR",
      "cvlvt",
      "ovnuR",
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
