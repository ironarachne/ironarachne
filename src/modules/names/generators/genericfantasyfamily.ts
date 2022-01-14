"use strict";

import NameGenerator from "../generator";
import * as Invented from "../invented";

export default class GenericFantasyFamilyGenerator implements NameGenerator {
  name: string;
  patterns: string[];

  constructor() {
    this.name = "generic fantasy family";

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
