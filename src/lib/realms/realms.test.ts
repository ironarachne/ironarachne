import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import * as Names from '$lib/names';
import Claim from './claim';
import { generate, getDefaultConfig } from './realms';
import * as RealmTypes from './realm_types';
import type RealmGeneratorConfig from './realm_generator_config';

function configFor(seed: string, overrides: Partial<RealmGeneratorConfig> = {}) {
  const rng = new RNG(seed);

  return {
    nameGeneratorSet: Names.getFantasyNameGeneratorSet('human', rng),
    realmTypes: RealmTypes.all(),
    mapWidth: 40,
    mapHeight: 30,
    mapTiles: [],
    rng,
    ...overrides,
  } satisfies RealmGeneratorConfig;
}

describe('Claim', () => {
  it('starts unpressed with no claimant', () => {
    const claim = new Claim();

    expect(claim.claimantName).toBe('');
    expect(claim.claimantId).toBe(0);
    expect(claim.status).toBe('unpressed');
  });
});

describe('getDefaultConfig', () => {
  it('offers every realm type', () => {
    expect(getDefaultConfig().realmTypes.map((type) => type.name)).toEqual(
      RealmTypes.all().map((type) => type.name),
    );
  });

  it('defaults to a 40 by 30 map with no tiles', () => {
    const config = getDefaultConfig();

    expect(config.mapWidth).toBe(40);
    expect(config.mapHeight).toBe(30);
    expect(config.mapTiles).toEqual([]);
  });

  it('supplies a name generator set and an RNG', () => {
    const config = getDefaultConfig();

    expect(config.nameGeneratorSet.country).toBeDefined();
    expect(config.rng).toBeInstanceOf(RNG);
  });
});

describe('generate', () => {
  it('is deterministic for a given seed', () => {
    expect(generate(configFor('realm'))).toEqual(generate(configFor('realm')));
  });

  it('produces different realms for different seeds', () => {
    const names = new Set(
      Array.from({ length: 8 }, (_, index) => generate(configFor(`vary-${index}`)).name),
    );

    expect(names.size).toBeGreaterThan(1);
  });

  it('names the realm "the <Type> of <Name>"', () => {
    const realm = generate(configFor('named'));

    expect(realm.name).toMatch(/^the .+ of .+$/);
  });

  it('titles the realm type in the name', () => {
    const realm = generate(configFor('titled'));
    const typeWords = realm.name.slice('the '.length).split(' of ')[0].split(' ');

    for (const word of typeWords) {
      expect(word[0]).toBe(word[0].toUpperCase());
    }
  });

  it('picks a realm type the config offers', () => {
    const config = configFor('typed');
    const realm = generate(config);

    expect(config.realmTypes).toContain(realm.realmType);
  });

  it('honours a config narrowed to a single realm type', () => {
    const kingdom = RealmTypes.all().find((type) => type.name === 'kingdom')!;
    const realm = generate(configFor('kingdom', { realmTypes: [kingdom] }));

    expect(realm.realmType).toBe(kingdom);
    expect(realm.name.startsWith('the Kingdom of ')).toBe(true);
  });

  it('grants the title its realm type carries', () => {
    const realm = generate(configFor('granted'));

    expect(realm.grantedTitle).toBe(realm.realmType.grantedTitle);
  });

  it('gives the realm an authority holding the granted title', () => {
    const realm = generate(configFor('authority'));

    expect(realm.authority).toBeDefined();
    expect(realm.authority.titles).toContain(realm.grantedTitle);
  });

  it('makes the authority an adult', () => {
    const realm = generate(configFor('adult'));

    expect(realm.authority.ageCategory.name).toBe('adult');
  });

  it('gives both the realm and its authority heraldry', () => {
    const realm = generate(configFor('heraldry'));

    expect(realm.heraldry).toBeDefined();
    expect(realm.authority.heraldry).toBeDefined();
  });

  it('starts the realm with no tiles, no claims and no parent', () => {
    const realm = generate(configFor('empty'));

    expect(realm.tiles).toEqual([]);
    expect(realm.claims).toEqual([]);
    expect(realm.parent).toBe(-1);
  });

  it('throws when the config has no country name generator', () => {
    const config = configFor('broken');
    config.nameGeneratorSet = {
      ...config.nameGeneratorSet,
      country: null as unknown as (typeof config.nameGeneratorSet)['country'],
    };

    expect(() => generate(config)).toThrow('RealmGenerator requires a country name generator set.');
  });
});

describe('RealmTypes.all', () => {
  it('lists realm types with unique names', () => {
    const names = RealmTypes.all().map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every type a positive commonality and a granted title', () => {
    for (const type of RealmTypes.all()) {
      expect(type.commonality).toBeGreaterThan(0);
      expect(type.grantedTitle).toBeDefined();
    }
  });

  it('gives every type a tile range where the minimum does not exceed the maximum', () => {
    for (const type of RealmTypes.all()) {
      expect(type.minTiles).toBeGreaterThan(0);
      expect(type.minTiles).toBeLessThanOrEqual(type.maxTiles);
    }
  });

  it('gives a parent type only to types that are not standalone', () => {
    for (const type of RealmTypes.all()) {
      if (!type.isStandalone) {
        expect(type.parentType).not.toBeNull();
      }
    }
  });

  it('includes at least one standalone type, so a realm can stand alone', () => {
    expect(RealmTypes.all().some((type) => type.isStandalone)).toBe(true);
  });
});
