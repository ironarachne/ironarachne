import type CharacterGeneratorConfig from "$lib/characters/character_generator_config.js";
import * as PremadeConfigs from "$lib/characters/premade_configs.js";
import * as MUN from "@ironarachne/made-up-names";
import DomainSet from "../domains/domainset.js";
import type Realm from "../realms/realm.js";

export default class DeityGeneratorConfig {
  domainSet: DomainSet;
  realms: Realm[];
  characterGeneratorConfig: CharacterGeneratorConfig;
  femaleNameGenerator: MUN.Generator | null;
  maleNameGenerator: MUN.Generator | null;

  constructor() {
    let charGenConfig = PremadeConfigs.getFantasy();

    this.realms = [];
    this.domainSet = new DomainSet();
    this.characterGeneratorConfig = charGenConfig;

    let genSet = new MUN.HumanSet();

    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
