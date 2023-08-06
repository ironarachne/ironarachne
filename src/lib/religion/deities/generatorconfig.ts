"use strict";

import * as MUN from "@ironarachne/made-up-names";
import CharacterGenerator from "../../characters/generator.js";
import * as PremadeConfigs from "../../characters/premadeconfigs.js";
import DomainSet from "../domains/domainset.js";
import Realm from "../realms/realm.js";

export default class DeityGeneratorConfig {
  domainSet: DomainSet;
  realms: Realm[];
  characterGenerator: CharacterGenerator;
  femaleNameGenerator: MUN.Generator | null;
  maleNameGenerator: MUN.Generator | null;

  constructor() {
    let charGenConfig = PremadeConfigs.getFantasy();

    this.realms = [];
    this.characterGenerator = new CharacterGenerator(charGenConfig);

    let genSet = new MUN.HumanSet();

    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
