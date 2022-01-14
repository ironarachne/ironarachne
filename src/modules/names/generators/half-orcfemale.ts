"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class HalfOrcFemaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "half-orc female";

    this.patterns = [
      "vnvlA",
      "vnv",
      "vdvlvN",
      "vlvnA",
      "vcnvA",
      "cvlvNIA",
      "cvlvNA",
      "pvdvpa",
      "vpBvZA",
      "vppvsA",
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
