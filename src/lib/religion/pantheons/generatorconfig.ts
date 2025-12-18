import Human from "$lib/species/sentient/human.js";
import type Species from "$lib/species/species.js";
import * as Names from "$lib/names";
import * as RNG from "@ironarachne/rng";
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
  femaleNameGenerator: MUN.NameGenerator;
  maleNameGenerator: MUN.NameGenerator;
  rng: RNG.RNG;

  constructor() {
    this.domains = JSON.parse(JSON.stringify(Domains.allDomains));
    this.realms = [];
    this.speciesOptions = [Human];
    this.minDeities = 1;
    this.maxDeities = 16;
    this.rng = new RNG.RNG(Date.now().toString());

    let genSet = Names.getFantasyNameGeneratorSet("human", this.rng);

    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
