"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class ElfFemaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "elf female";

    this.patterns = [
      "vlpvlvnA",
      "pvLvDRIEL",
      "pvLvTHRIEL",
      "vlWEN",
      "vlvnwA",
      "vlvnwE",
      "vLLUvn",
      "vsvLME",
      "cvlwEN",
      "vnovMIEL",
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
