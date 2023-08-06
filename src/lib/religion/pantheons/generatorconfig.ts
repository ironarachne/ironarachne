"use strict";

import * as MUN from "@ironarachne/made-up-names";
import Domain from "../domains/domain.js";
import * as Domains from "../domains/domains.js";
import Realm from "../realms/realm.js";

export default class PantheonGeneratorConfig {
  domains: Domain[];
  realms: Realm[];
  minDeities: number;
  maxDeities: number;
  femaleNameGenerator: MUN.Generator;
  maleNameGenerator: MUN.Generator;

  constructor() {
    this.domains = Domains.all();
    this.realms = [];
    this.minDeities = 1;
    this.maxDeities = 16;

    let genSet = new MUN.HumanSet();

    if (genSet.female == null) {
      throw new Error("no female name generator in set");
    } else if (genSet.male == null) {
      throw new Error("no male name generator in set");
    }

    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
