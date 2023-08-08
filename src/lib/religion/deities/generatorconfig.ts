"use strict";

import CharacterGenerator from "$lib/characters/generator.js";
import * as PremadeConfigs from "$lib/characters/premadeconfigs.js";
import * as MUN from "@ironarachne/made-up-names";
import DomainSet from "../domains/domainset.js";
import type Realm from "../realms/realm.js";

export default class DeityGeneratorConfig {
  domainSet: DomainSet;
  realms: Realm[];
  characterGenerator: CharacterGenerator;
  femaleNameGenerator: MUN.Generator | null;
  maleNameGenerator: MUN.Generator | null;

  constructor() {
    let charGenConfig = PremadeConfigs.getFantasy();

    this.realms = [];
    this.domainSet = new DomainSet();
    this.characterGenerator = new CharacterGenerator(charGenConfig);

    let genSet = new MUN.HumanSet();

    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
