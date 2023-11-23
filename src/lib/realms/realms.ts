import type Character from "$lib/characters/character.js";
import * as Characters from "$lib/characters/characters.js";
import * as PremadeConfigs from "$lib/characters/premade_configs.js";
import HeraldryGenerator from "$lib/heraldry/generator.js";
import type { GeneratorSet } from "@ironarachne/made-up-names";
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import type Realm from "./realm.js";
import type RealmGeneratorConfig from "./realm_generator_config.js";
import type RealmType from "./realm_type.js";
import * as RealmTypes from "./realm_types.js";

export function generate(config: RealmGeneratorConfig): Realm {
  let realmType = RND.weighted(config.realmTypes);

  if (config.nameGeneratorSet.country === null) {
    throw new Error("RealmGenerator requires a country name generator set.");
  }

  let name = config.nameGeneratorSet.country.generate(1)[0];
  name = `the ${Words.title(realmType.name)} of ${name}`;
  let herGen = new HeraldryGenerator();
  let heraldry = herGen.generate();
  let authority = randomAuthority(realmType, config.nameGeneratorSet);

  return {
    name: name,
    adjective: name,
    description: "",
    heraldry: heraldry,
    authority: authority,
    grantedTitle: realmType.grantedTitle,
    tiles: [],
    claims: [],
    parent: -1,
    realmType: realmType,
  };
}

export function getDefaultConfig(): RealmGeneratorConfig {
  return {
    nameGeneratorSet: MUN.getSetByName("human", MUN.fantasyRaceSets()),
    realmTypes: RealmTypes.all(),
    mapWidth: 40,
    mapHeight: 30,
    mapTiles: [],
  };
}

function randomAuthority(realmType: RealmType, nameGeneratorSet: GeneratorSet): Character {
  let charGenConfig = PremadeConfigs.getFantasy();
  charGenConfig.ageCategoryNames = ["adult"];

  charGenConfig.familyNameGenerator = nameGeneratorSet.family;
  charGenConfig.femaleNameGenerator = nameGeneratorSet.female;
  charGenConfig.maleNameGenerator = nameGeneratorSet.male;
  charGenConfig.useAdaptiveNames = false;

  let authority = Characters.generate(charGenConfig);
  authority.titles.push(realmType.grantedTitle);
  let herGen = new HeraldryGenerator();
  authority.heraldry = herGen.generate();

  return authority;
}
