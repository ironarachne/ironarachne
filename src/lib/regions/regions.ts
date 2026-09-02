import { type Character } from '$lib/characters';
import type { Environment } from '$lib/environment';
import { Environments } from '$lib/environment';
import * as Characters from '$lib/characters';
import { generateOrganization, addRandomRivalryBetweenPairs } from '$lib/organizations';
import type { Organization } from '$lib/organizations';
import type { Realm } from '$lib/realms';
import { Realms } from '$lib/realms';
import type { Settlement } from '$lib/settlements';
import * as Settlements from '$lib/settlements';
import * as Names from '$lib/names';
import * as RNG from '@ironarachne/rng';

import type Region from './region.js';
import type RegionGeneratorConfig from './region_generator_config.js';
import type { RegionMap } from '$lib/map';
import {
  MapBuilder,
  MapElevation,
  MapWater,
  MapClimate,
  MapBiome,
  MapRoad,
  Suitability,
} from '$lib/map';

function createEmptyRegion(): Region {
  return {
    name: '',
    environment: {} as Environment,
    description: '',
    dominantCulture: null,
    settlements: [] as Settlement[],
    mainRealm: 0,
    realms: [] as Realm[],
    authority: {} as Character,
    organizations: [] as Organization[],
    map: {} as RegionMap, // Will be populated
  };
}

/** A dominant culture brings its own names; without one the config's set is used as given. */
function resolveNameGeneratorSet(
  region: Region,
  config: RegionGeneratorConfig,
): Names.NameGeneratorSet {
  if (config.dominantCulture != null) {
    region.dominantCulture = config.dominantCulture;
    return config.dominantCulture.nameGenerators;
  }

  return config.nameGeneratorSet;
}

/**
 * Builds the map and runs the physical passes over it in order — elevation, water, temperature,
 * moisture, biomes — since each reads what the one before it wrote.
 *
 * The latitude is drawn here rather than alongside the other environment settings because it is
 * needed by the temperature pass, and returned because the region's environment needs the same
 * value. Every draw below comes off `config.rng` in this order, so moving one changes every
 * region generated from a given seed.
 */
function buildRegionTerrain(config: RegionGeneratorConfig): {
  map: RegionMap;
  latitude: number;
} {
  let map = MapBuilder.buildBaseMapGraph({
    width: config.mapWidth,
    height: config.mapHeight,
    seed: config.rng.randomString(8),
    pointSpacing: 2.0, // Space between points in the Voronoi mesh
    rng: config.rng,
  });

  const islandShapes: MapElevation.ElevationConfig['islandShape'][] = [
    'coast-north',
    'coast-south',
    'coast-east',
    'coast-west',
    'coast-nw',
    'coast-sw',
    'coast-ne',
    'coast-se',
    'none',
  ];
  const startShape = config.rng.item(islandShapes);

  map = MapElevation.assignElevation(map, {
    seed: config.rng.randomString(8),
    islandShape: startShape,
    frequency: 0.95,
    hasMountainRange: config.rng.int(1, 100) > 50, // 50% chance of distinct mountain range
  });

  const latitude = config.rng.weighted([
    {
      value: 40,
      commonality: 10,
    },
    {
      value: 15,
      commonality: 5,
    },
    {
      value: 65,
      commonality: 5,
    },
  ]);

  map = MapWater.simulateWater(map, {
    seaLevel: -0.1,
    springCountPercentage: 0.1,
    rng: config.rng,
  });

  map = MapClimate.assignTemperature(map, {
    seed: config.rng.randomString(8),
    baseTemp: 30,
    latitude: latitude,
    elevationLapseRate: 6.5,
    frequency: 2.5,
  });

  const regionalMoisture = config.rng.int(10, 90) / 100;

  map = MapClimate.assignMoisture(map, {
    seed: config.rng.randomString(8),
    baseMoisture: regionalMoisture,
    frequency: 2.5,
  });

  map = MapBiome.assignBiomes(map, {
    rng: config.rng,
    paletteSize: 5,
  });

  return { map, latitude };
}

/** What lives on the map: the environment description, its settlements, roads and organizations. */
function populateRegionInhabitants(
  region: Region,
  config: RegionGeneratorConfig,
  latitude: number,
  nameGenSet: Names.NameGeneratorSet,
): void {
  const environmentConfig = Environments.getDefaultConfig(config.rng);
  environmentConfig.latitude = latitude;

  // Here we would typically derive climate/biome mathematically from map majority
  // For now we continue building via config as an overarching description
  region.environment = Environments.generate(environmentConfig);
  region.settlements = randomSettlements(region.environment, nameGenSet, config.rng, region.map);
  const townIds = region.settlements
    .map((s) => s.mapNodeId)
    .filter((id) => id !== undefined) as number[];
  region.map = MapRoad.generateRoads(region.map, townIds);
  region.organizations = randomOrganizations(config.rng, region.environment);
  region.description = region.environment.description;
}

/** A realm that is not standalone needs the realm above it generated too. */
function generateParentRealm(
  config: RegionGeneratorConfig,
  nameGeneratorSet: Names.NameGeneratorSet,
  parentType: Realm['realmType'] | null,
): Realm {
  if (parentType == null) {
    throw new Error('Realm type has no parent type.');
  }

  const parentRealmConfig = Realms.getDefaultConfig();
  parentRealmConfig.rng = config.rng;
  parentRealmConfig.realmTypes = [parentType];
  parentRealmConfig.nameGeneratorSet = nameGeneratorSet;

  return Realms.generate(parentRealmConfig);
}

/**
 * The region's main realm, the realm above it if it has one, and a handful of neighbours — some of
 * which are vassals of the main realm's parent, and some of which bring a parent of their own.
 */
function addRealmsToRegion(
  region: Region,
  config: RegionGeneratorConfig,
  nameGenSet: Names.NameGeneratorSet,
): void {
  const realmGenConfig = Realms.getDefaultConfig();
  realmGenConfig.rng = config.rng;
  realmGenConfig.nameGeneratorSet = nameGenSet;

  const mainRealm = Realms.generate(realmGenConfig);
  region.realms.push(mainRealm);
  region.mainRealm = 0;

  if (!mainRealm.realmType.isStandalone) {
    region.realms.push(
      generateParentRealm(config, realmGenConfig.nameGeneratorSet, mainRealm.realmType.parentType),
    );
    mainRealm.parent = 1;
  }

  const numberOfNeighbors = config.rng.int(config.minRealms, config.maxRealms);
  for (let i = 0; i < numberOfNeighbors; i++) {
    realmGenConfig.nameGeneratorSet = Names.getFantasyNameGeneratorSet('tiefling', config.rng);
    if (config.rng.int(1, 100) > 70) {
      const neighborNameGenSet = config.rng.item(Names.getAllFantasyNameGeneratorSets(config.rng));
      realmGenConfig.nameGeneratorSet = neighborNameGenSet;
    }
    const neighbor = Realms.generate(realmGenConfig);
    if (!neighbor.realmType.isStandalone) {
      if (config.rng.int(1, 100) > 50) {
        neighbor.parent = mainRealm.parent;
      } else {
        region.realms.push(
          generateParentRealm(
            config,
            realmGenConfig.nameGeneratorSet,
            neighbor.realmType.parentType,
          ),
        );
        neighbor.parent = region.realms.length - 1;
      }
    }
    region.realms.push(neighbor);
  }

  region.authority = mainRealm.authority;
  region.name = mainRealm.name;
}

export function generate(config: RegionGeneratorConfig): Region {
  const region = createEmptyRegion();
  const nameGenSet = resolveNameGeneratorSet(region, config);

  const { map, latitude } = buildRegionTerrain(config);
  region.map = map;

  populateRegionInhabitants(region, config, latitude, nameGenSet);
  addRealmsToRegion(region, config, nameGenSet);

  return region;
}

/**
 * The default region settings, built around the RNG the caller is generating from.
 *
 * The RNG is a required parameter rather than a clock-seeded default — decision 1 of
 * docs/tool-readiness.md. This one carried the defect twice over: the config's own RNG *and* the
 * fallback name generator set were each seeded from `Date.now()`, so a caller that overwrote the
 * first still got a clock-driven name set unless it also replaced the second.
 */
export function getDefaultConfig(rng: RNG.RNG): RegionGeneratorConfig {
  return {
    nameGeneratorSet: Names.getFantasyNameGeneratorSet('tiefling', rng),
    dominantCulture: null,
    mapWidth: 40,
    mapHeight: 30,
    minRealms: 2,
    maxRealms: 4,
    rng,
  };
}

function randomOrganizations(rng: RNG.RNG, environment: Environment): Organization[] {
  const characterConfig = Characters.getDefaultCharacterGenerationConfig(
    `region-orgs-${rng.randomString(8)}`,
  );
  const orgs: Organization[] = [];
  const numberOfOrganizations = rng.int(1, 3);

  for (let i = 0; i < numberOfOrganizations; i++) {
    orgs.push(
      generateOrganization({
        rng,
        characterConfig,
        genre: 'fantasy',
        kindId: 'any',
        seedPrefix: `region-${i}`,
        environment,
      }),
    );
  }
  addRandomRivalryBetweenPairs(orgs, rng);
  return orgs;
}

function randomSettlements(
  environment: Environment,
  nameGeneratorSet: Names.NameGeneratorSet,
  rng: RNG.RNG,
  map: RegionMap,
): Settlement[] {
  const settlementGenConfig = Settlements.getDefaultConfig();
  settlementGenConfig.rng = rng;
  settlementGenConfig.nameGenerator = nameGeneratorSet.town;
  settlementGenConfig.size = 'large';
  settlementGenConfig.environment = environment;
  const capital = Settlements.generate(settlementGenConfig);

  const numberOfMediumTowns = rng.int(1, 3);
  const numberOfSmallTowns = rng.int(3, 5);
  const towns = [];

  capital.description += ' This is the capital of the region.';
  towns.push(capital);

  for (let i = 0; i < numberOfMediumTowns; i++) {
    settlementGenConfig.size = 'medium';
    const town = Settlements.generate(settlementGenConfig);
    towns.push(town);
  }

  for (let i = 0; i < numberOfSmallTowns; i++) {
    settlementGenConfig.size = 'small';
    const town = Settlements.generate(settlementGenConfig);
    towns.push(town);
  }

  // Position settlements using the map suitability engine
  const totalSettlements = towns.length;
  const suitabilityEngine: Suitability.SuitabilityEngine = {
    rules: [
      Suitability.standardRules.notOcean(),
      Suitability.standardRules.nearFreshWater(),
      Suitability.standardRules.flatTerrain(),
      Suitability.standardRules.temperateClimate(),
    ],
    strict: true,
  };

  const scores = Suitability.evaluateSuitability(map, suitabilityEngine);
  const minSpread = Math.max(2, (map.width + map.height) / (2 * totalSettlements));
  let bestNodes = Suitability.findBestLocations(scores, totalSettlements, minSpread, map);

  // Fallback 1: Reduce minSpread if not enough nodes found
  if (bestNodes.length < totalSettlements) {
    bestNodes = Suitability.findBestLocations(scores, totalSettlements, 0, map);
  }

  // Fallback 2: If still not enough (due to strict rules like temperate climate),
  // do a second pass just checking for land
  if (bestNodes.length < totalSettlements) {
    const fallbackEngine: Suitability.SuitabilityEngine = {
      rules: [Suitability.standardRules.notOcean()],
      strict: true,
    };
    const fallbackScores = Suitability.evaluateSuitability(map, fallbackEngine);
    const fallbackNodes = Suitability.findBestLocations(fallbackScores, totalSettlements, 0, map);

    // Add unique nodes from fallback to bestNodes
    for (const id of fallbackNodes) {
      if (!bestNodes.includes(id)) {
        bestNodes.push(id);
      }
      if (bestNodes.length >= totalSettlements) break;
    }
  }

  for (let i = 0; i < towns.length; i++) {
    if (i < bestNodes.length) {
      const node = map.nodes[bestNodes[i]];
      towns[i].location = node.center;
      towns[i].mapNodeId = node.id;
    }
  }

  return towns;
}
