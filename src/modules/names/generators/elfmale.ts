"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class ElfMaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "elf male";

    this.patterns = [
      "vlpvlvn",
      "vnvnvnpv",
      "pARvTHION",
      "vlMIEL",
      "vlMvRION",
      "vRvnoUR",
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
