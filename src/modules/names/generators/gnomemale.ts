"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class GnomeMaleGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "gnome male";

    this.patterns = [
      "Blvocvf",
      "oOdvp",
      "pvnlv",
      "pvnp",
      "cvlVER",
      "wvlVER",
      "pvlwvl",
      "pvlwv",
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
