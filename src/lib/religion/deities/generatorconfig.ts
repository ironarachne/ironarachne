import type CharacterGeneratorConfig from '$lib/characters/character_generator_config.js';
import * as PremadeConfigs from '$lib/characters/premade_configs.js';
import type * as MUN from '@ironarachne/made-up-names';
import * as Names from '$lib/names/index.js';
import DomainSet from '../domains/domainset.js';
import type Realm from '../realms/realm.js';

export default class DeityGeneratorConfig {
  domainSet: DomainSet;
  realms: Realm[];
  characterGeneratorConfig: CharacterGeneratorConfig;
  femaleNameGenerator: MUN.NameGenerator | null;
  maleNameGenerator: MUN.NameGenerator | null;

  constructor() {
    const charGenConfig = PremadeConfigs.getFantasy();

    this.realms = [];
    this.domainSet = new DomainSet();
    this.characterGeneratorConfig = charGenConfig;

    const genSet = Names.getFantasyNameGeneratorSet('human', charGenConfig.rng);

    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
