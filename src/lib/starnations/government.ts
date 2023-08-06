"use strict";

import type { Generator as NameGenerator } from "@ironarachne/made-up-names";

export default class StarNationGovernment {
  name: string;
  minSystems: number;
  maxSystems: number;
  nameGenerator: NameGenerator;

  constructor() {
    this.name = "";
    this.minSystems = 0;
    this.maxSystems = 1;
    this.nameGenerator = {} as NameGenerator;
  }
}
