"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class GnomeFemaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "gnome female";

    this.patterns = [
      "avNNA",
      "SHvNvDDI",
      "MvoLI",
      "voAnA",
      "voAnI",
      "vvTHNE",
      "ovpv",
      "SNvflvnv",
      "pvdvnv",
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
