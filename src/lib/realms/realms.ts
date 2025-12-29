import type Character from "$lib/characters/character.js";
import * as Characters from "$lib/characters/characters.js";
import * as PremadeConfigs from "$lib/characters/premade_configs.js";
import { generateHeraldry } from "$lib/heraldry/generator.js";
import * as Names from "$lib/names/index.js";
import * as RNG from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import type Realm from "./realm.js";
import type RealmGeneratorConfig from "./realm_generator_config.js";
import type RealmType from "./realm_type.js";
import * as RealmTypes from "./realm_types.js";
import { getDefaultHeraldryGeneratorConfig } from "$lib/heraldry/generatorconfig.js";

export function generate(config: RealmGeneratorConfig): Realm {
  let realmType = config.rng.weighted(
    config.realmTypes.map((t) => {
      return { commonality: t.commonality, value: t };
    }),
  );

  if (config.nameGeneratorSet.country === null) {
    throw new Error("RealmGenerator requires a country name generator set.");
  }

  let name = config.nameGeneratorSet.country.generate(1)[0];
  name = `the ${Words.title(realmType.name)} of ${name}`;
  const heraldry = generateHeraldry();
  let authority = randomAuthority(realmType, config.nameGeneratorSet, config.rng);

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
  const rng = new RNG.RNG(Date.now().toString());
  return {
    nameGeneratorSet: Names.getFantasyNameGeneratorSet("human", rng),
    realmTypes: RealmTypes.all(),
    mapWidth: 40,
    mapHeight: 30,
    mapTiles: [],
    rng: rng,
  };
}

function randomAuthority(
  realmType: RealmType,
  nameGeneratorSet: Names.NameGeneratorSet,
  rng: RNG.RNG
): Character {
  let charGenConfig = PremadeConfigs.getFantasy();
  charGenConfig.rng = rng;
  charGenConfig.ageCategoryNames = ["adult"];

  charGenConfig.familyNameGenerator = nameGeneratorSet.family;
  charGenConfig.femaleNameGenerator = nameGeneratorSet.female;
  charGenConfig.maleNameGenerator = nameGeneratorSet.male;
  charGenConfig.useAdaptiveNames = false;

  let authority = Characters.generate(charGenConfig);
  authority.titles.push(realmType.grantedTitle);
  let heraldryGenConfig = getDefaultHeraldryGeneratorConfig();
  heraldryGenConfig.rng = rng;
  authority.heraldry = generateHeraldry(heraldryGenConfig);

  return authority;
}
