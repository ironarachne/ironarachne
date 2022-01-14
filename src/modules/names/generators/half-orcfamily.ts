"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class HalfOrcFamilyGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "half-orc family";

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

    const prefixes = [
      "SMASH",
      "BULL",
      "RAGE",
      "DEATH",
      "MURDER",
      "SKULL",
      "FIGHT",
      "BREAK",
      "WAR",
      "BATTLE",
      "GROG",
      "FEAR",
    ];

    const suffixes = [
      "FIST",
      "SMASH",
      "REND",
      "BLADE",
      "AXE",
      "CHOPPER",
      "CUTTER",
      "KILLER",
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
