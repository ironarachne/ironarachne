"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class FantasyRegionsGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "fantasy regions";

    this.patterns = [
      "pvlvlIA",
      "lvpvpIA",
      "vnvlvpA",
      "vpvlY",
      "flvnv",
      "vfpvlION",
      "vlxRIA",
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
