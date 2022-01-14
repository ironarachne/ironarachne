"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class DwarfMaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "dwarf male";

    this.patterns = [
      "pvRIN",
      "pWvlIN",
      "pvlIN",
      "THvlIN",
      "THvlIM",
      "pvMLI",
      "pvNLI",
      "plOIN",
      "pvFUR",
      "pvFvl",
      "slvlIN",
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
