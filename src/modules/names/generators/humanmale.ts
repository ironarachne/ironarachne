"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class HumanMaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "human male";

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
