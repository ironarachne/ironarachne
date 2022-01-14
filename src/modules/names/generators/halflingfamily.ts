"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class HalflingFamilyGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "halfling family";

    this.patterns = [
      "BvdvnS",
      "pvMpu",
    ];

    const prefixes = [
      "BRANDY",
      "FEATHER",
      "HAIRY",
      "HOG",
      "HORN",
      "LITTLE",
      "LONG",
      "OAK",
      "OLD",
      "PROUD",
      "PUDDI",
      "SWIFT",
      "UNDER",
      "WANDER",
      "WHIT",
    ];

    const suffixes = [
      "BELLY",
      "BOTTOM",
      "DALE",
      "FOOT",
      "HOUSE",
      "PEN",
      "WOOD",
      "WORT",
    ];

    for (let i=0;i<prefixes.length;i++) {
      for (let j=0;j<suffixes.length;j++) {
        this.patterns.push(prefixes[i] + suffixes[j]);
      }
    }
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
