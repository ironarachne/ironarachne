"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class HalfElfFemaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "half-elf female";

    this.patterns = [
      "vnvlA",
      "vnv",
      "vdvlvN",
      "vlvnA",
      "vcnvA",
      "cvlvNIA",
      "cvlvNA",
      "pvSSvpa",
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
