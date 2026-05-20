import { type Character } from '$lib/characters/character_types.js';
import { type Culture } from '$lib/culture/culture_types.js';
import type Environment from '$lib/environment/environment.js';
import * as Environments from '$lib/environment/environments.js';
import * as Characters from '$lib/characters';
import { generateOrganization } from '$lib/organizations/generate_organization.js';
import { addRandomRivalryBetweenPairs } from '$lib/organizations/organization_relationships.js';
import type { Organization } from '$lib/organizations/organization_types.js';
import type Realm from '$lib/realms/realm.js';
import * as Realms from '$lib/realms/realms.js';
import type Settlement from '$lib/settlements/settlement.js';
import * as Settlements from '$lib/settlements/settlements.js';
import * as Names from '$lib/names';
import * as RNG from '@ironarachne/rng';

import type Region from './region.js';
import type RegionGeneratorConfig from './region_generator_config.js';
import type { RegionMap } from '$lib/map/map_graph.js';
import * as MapBuilder from '$lib/map/builder.js';
import * as MapElevation from '$lib/map/elevation.js';
import * as MapWater from '$lib/map/water.js';
import * as MapClimate from '$lib/map/climate.js';
import * as MapBiome from '$lib/map/biome.js';
import * as MapRoad from '$lib/map/road.js';
import * as Suitability from '$lib/map/suitability.js';

export function generate(config: RegionGeneratorConfig): Region {
  let region: Region = {
    name: '',
    environment: {} as Environment,
    description: '',
    dominantCulture: {} as Culture,
    settlements: [] as Settlement[],
    mainRealm: 0,
    realms: [] as Realm[],
    authority: {} as Character,
    organizations: [] as Organization[],
    map: {} as RegionMap, // Will be populated
  };

  let nameGenSet: Names.NameGeneratorSet;

  if (config.dominantCulture != null) {
    region.dominantCulture = config.dominantCulture;
    nameGenSet = region.dominantCulture.nameGenerators;
  } else {
    nameGenSet = config.nameGeneratorSet;
  }

  // 1. Generate the Map Graph
  let map = MapBuilder.buildBaseMapGraph({
    width: config.mapWidth,
    height: config.mapHeight,
    seed: config.rng.randomString(8),
    pointSpacing: 2.0, // Space between points in the Voronoi mesh
    rng: config.rng,
  });

  const startShape = config.rng.item([
    'coast-north',
    'coast-south',
    'coast-east',
    'coast-west',
    'coast-nw',
    'coast-sw',
    'coast-ne',
    'coast-se',
    'none',
  ]);

  map = MapElevation.assignElevation(map, {
    seed: config.rng.randomString(8),
    islandShape: startShape as any,
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
  region.map = map;

  const environmentConfig = Environments.getDefaultConfig();
  environmentConfig.rng = config.rng;
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

  let realmGenConfig = Realms.getDefaultConfig();
  realmGenConfig.rng = config.rng;
  realmGenConfig.nameGeneratorSet = nameGenSet;

  let mainRealm = Realms.generate(realmGenConfig);
  region.realms.push(mainRealm);
  region.mainRealm = 0;

  if (!mainRealm.realmType.isStandalone) {
    let parentRealmConfig = Realms.getDefaultConfig();
    parentRealmConfig.rng = config.rng;
    parentRealmConfig.nameGeneratorSet = realmGenConfig.nameGeneratorSet;
    if (mainRealm.realmType.parentType == null) {
      throw new Error('Realm type has no parent type.');
    }
    parentRealmConfig.realmTypes = [mainRealm.realmType.parentType];

    let parentRealm = Realms.generate(parentRealmConfig);

    region.realms.push(parentRealm);
    mainRealm.parent = 1;
  }

  let numberOfNeighbors = config.rng.int(config.minRealms, config.maxRealms);
  for (let i = 0; i < numberOfNeighbors; i++) {
    realmGenConfig.nameGeneratorSet = Names.getFantasyNameGeneratorSet('tiefling', config.rng);
    if (config.rng.int(1, 100) > 70) {
      let neighborNameGenSet = config.rng.item(Names.getAllFantasyNameGeneratorSets(config.rng));
      realmGenConfig.nameGeneratorSet = neighborNameGenSet;
    }
    let neighbor = Realms.generate(realmGenConfig);
    if (!neighbor.realmType.isStandalone) {
      if (config.rng.int(1, 100) > 50) {
        neighbor.parent = mainRealm.parent;
      } else {
        let parentRealmConfig = Realms.getDefaultConfig();
        parentRealmConfig.rng = config.rng;
        if (neighbor.realmType.parentType == null) {
          throw new Error('Realm type has no parent type.');
        }
        parentRealmConfig.realmTypes = [neighbor.realmType.parentType];
        parentRealmConfig.nameGeneratorSet = realmGenConfig.nameGeneratorSet;

        let parentRealm = Realms.generate(parentRealmConfig);
        region.realms.push(parentRealm);
        neighbor.parent = region.realms.length - 1;
      }
    }
    region.realms.push(neighbor);
  }

  region.authority = mainRealm.authority;
  region.name = mainRealm.name;

  return region;
}

export function getDefaultConfig(): RegionGeneratorConfig {
  return {
    nameGeneratorSet: Names.getFantasyNameGeneratorSet(
      'tiefling',
      new RNG.RNG(Date.now().toString()),
    ),
    dominantCulture: null,
    mapWidth: 40,
    mapHeight: 30,
    minRealms: 2,
    maxRealms: 4,
    rng: new RNG.RNG(Date.now().toString()),
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
  let settlementGenConfig = Settlements.getDefaultConfig();
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
