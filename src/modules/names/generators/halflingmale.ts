"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class HalflingMaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "halfling male";

    this.patterns = [
      "BvlBv",
      "svnwvsE",
      "pvPPvn",
      "pvlvplvn",
      "wvnflvo",
      "pvlnO",
      "vovlpvRT",
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
