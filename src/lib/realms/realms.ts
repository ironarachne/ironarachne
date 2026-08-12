import type { Character } from '$lib/characters';
import * as Characters from '$lib/characters';
import { generateHeraldry } from '$lib/heraldry/generator.js';
import * as Names from '$lib/names/index.js';
import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import type Claim from './claim.js';
import type Realm from './realm.js';
import type RealmGeneratorConfig from './realm_generator_config.js';
import type RealmType from './realm_type.js';
import * as RealmTypes from './realm_types.js';
import { getDefaultHeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';

export function createClaim(): Claim {
  return {
    claimantName: '',
    claimantId: 0,
    status: 'unpressed',
  };
}

export function generate(config: RealmGeneratorConfig): Realm {
  const realmType = config.rng.weighted(
    config.realmTypes.map((t) => {
      return { commonality: t.commonality, value: t };
    }),
  );

  if (config.nameGeneratorSet.country === null) {
    throw new Error('RealmGenerator requires a country name generator set.');
  }

  let name = config.nameGeneratorSet.country.generate(1)[0];
  name = `the ${Words.title(realmType.name)} of ${name}`;
  const heraldry = generateHeraldry(getDefaultHeraldryGeneratorConfig(config.rng));
  const authority = randomAuthority(realmType, config.nameGeneratorSet, config.rng);

  return {
    name: name,
    adjective: name,
    description: '',
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
    nameGeneratorSet: Names.getFantasyNameGeneratorSet('human', rng),
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
  rng: RNG.RNG,
): Character {
  const charGenConfig = Characters.getDefaultCharacterGenerationConfig(
    `character-${rng.randomString(13)}`,
  );

  charGenConfig.allowedAgeCategoryNames = ['adult'];

  charGenConfig.familyNameGenerator = nameGeneratorSet.family;
  charGenConfig.femaleFirstNameGenerator = nameGeneratorSet.female;
  charGenConfig.maleFirstNameGenerator = nameGeneratorSet.male;

  const authority = Characters.generate(`character-${rng.randomString(13)}`, charGenConfig);
  authority.titles?.push(realmType.grantedTitle);
  const heraldryGenConfig = getDefaultHeraldryGeneratorConfig(rng);
  authority.heraldry = generateHeraldry(heraldryGenConfig);

  return authority;
}
