"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class DwarfFemaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "dwarf female";

    this.patterns = [
      "pvRINv",
      "pWvlINA",
      "pvlInv",
      "THvlIn",
      "pvMLInA",
      "pvNLInA",
      "pvFURA",
      "pvFvlA",
      "slvlINA",
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
