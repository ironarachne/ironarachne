"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class HalflingFemaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "halfling female";

    this.patterns = [
      "oEOnY",
      "oEARL",
      "pELInDA",
      "mvlvnoA",
      "plvSovn",
      "Mvovlpvlo",
      "pvfvnA",
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
