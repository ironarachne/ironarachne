"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class HalfElfFamilyGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "half-elf family";

    this.patterns = [
      "Apvlnvn",
      "vpvcnvn",
      "vSHlvnp",
      "SnvTH",
      "pvvLOR",
      "puPER",
      "sLvTCHER",
      "svRRIER",
      "pvnDElSON",
      "pvnDElS",
      "vvpSBURG",
      "vvpSBERG",
      "vlnvTHION",
      "vpRvHAM",
      "vcpLAND",
      "vcpLvND",
      "vcfFORD",
      "vcnFvRD",
    ];

    let prefixes = [
      "WHITE",
      "GREEN",
      "BLUE",
      "WILD",
      "SUMMER",
      "WINTER",
      "WIND",
      "BEACH",
      "DAWN",
      "DUSK",
      "SKY",
      "NIGHT",
    ];

    let suffixes = [
      "FLOWER",
      "WALKER",
      "SONG",
      "RUNNER",
      "CROWN",
      "BLOSSOM",
      "BELL",
      "WATCHER",
      "GUARD",
      "STAR",
      "GROVE",
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
