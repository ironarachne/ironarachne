import Human from "$lib/species/sentient/human.js";
import type Species from "$lib/species/species.js";
import * as MUN from "@ironarachne/made-up-names";
import type Domain from "../domains/domain.js";
import * as Domains from "../domains/domains.js";
import type Realm from "../realms/realm.js";

export default class PantheonGeneratorConfig {
  domains: Domain[];
  realms: Realm[];
  minDeities: number;
  maxDeities: number;
  speciesOptions: Species[];
  femaleNameGenerator: MUN.Generator;
  maleNameGenerator: MUN.Generator;

  constructor() {
    this.domains = JSON.parse(JSON.stringify(Domains.allDomains));
    this.realms = [];
    this.speciesOptions = [Human];
    this.minDeities = 1;
    this.maxDeities = 16;

    let genSet = MUN.getSetByName("fantasy", MUN.cultureSets());

    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
