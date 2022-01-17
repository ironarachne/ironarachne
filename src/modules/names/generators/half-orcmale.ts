"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class HalfOrcMaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "half-orc male";

    this.patterns = [
      "vFFlvn",
      "cvclvn",
      "vpvlvn",
      "cvLLvvn",
      "cvlvpul",
      "vppvl",
      "pvspvn",
      "pulvn",
      "pvlsvp",
      "pvDRvC",
      "pvp",
      "pvpvp",
      "pvppvs",
      "pAlpvs",
      "pAlpvG",
      "svRM",
      "svRN",
      "svRNpvK",
      "pupvK",
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
