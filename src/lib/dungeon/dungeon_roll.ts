/**
 * The single path from a seed to a dungeon, and the record of how it was rolled.
 *
 * `generateDungeon` was already a pure function of its config, which makes this tool one of the
 * few in the readiness pass that did not have a determinism defect in its library. The defect was
 * in the page: `DungeonGenerator.svelte` held the whole environment step — thirty lines of biome
 * forcing and terrain vectors — in a component, so the one thing a re-roll from provenance would
 * have to reproduce lived somewhere a re-roll could not reach. That step is here now, and the page
 * calls this.
 *
 * **Everything the roll chooses is drawn from the seed**, in the order the page drew it, so a
 * dungeon rolled by this module from a given seed is the dungeon the page produced from that seed
 * before it existed. The blueprint and the biome consume from the seed's RNG only when the config
 * leaves them open, which is what "Random" meant on the page.
 */

import { RNG } from '@ironarachne/rng';

import type { Encounter } from '$lib/encounters';
import {
  BiomeClassifications,
  Biomes,
  describeTerrain,
  generate as generateEnvironment,
  getDefaultConfig as getDefaultEnvironmentConfig,
  type Environment,
} from '$lib/environment';

import { generateDungeon, roomName } from './generator/generator.js';
import type { EngineeredDungeon, PopulatedRoom } from './generator/types.js';
import { toDungeonSnapshot, type DungeonSnapshot } from './dungeon_snapshot.js';
import { BLUEPRINTS } from './theme/theme.js';

/** The map dimensions the page offers, and the bounds a stored config is read back within. */
export const DUNGEON_MIN_DIMENSION = 15;
export const DUNGEON_MAX_DIMENSION = 120;
export const DUNGEON_DEFAULT_WIDTH = 40;
export const DUNGEON_DEFAULT_HEIGHT = 60;
export const DUNGEON_DEFAULT_ENCOUNTER_CHANCE = 0.4;
export const DUNGEON_DEFAULT_TREASURE_CHANCE = 0.3;

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. It is the page's six controls and
 * nothing else. `blueprintName` and `biomeName` are absent when the page was left on "Random",
 * which is the same spelling the organization's config uses for a choice the seed made.
 */
export type DungeonGeneratorConfigRecord = {
  width?: number;
  height?: number;
  blueprintName?: string;
  biomeName?: string;
  encounterChancePerRoom?: number;
  treasureChancePerRoom?: number;
};

/** The blueprints a dungeon may be built to, by name. */
export function dungeonBlueprintNames(): string[] {
  return BLUEPRINTS.map((blueprint) => blueprint.name);
}

/**
 * The biomes a dungeon may sit in, by name.
 *
 * Aquatic classifications are left out: the generator digs rooms and corridors into ground, and a
 * dungeon in open ocean is a description nothing else in the roll would honour.
 */
export function dungeonBiomeNames(): string[] {
  return BiomeClassifications.getAll()
    .filter((classification) => !classification.isAquatic)
    .map((classification) => classification.name);
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

function readDimension(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round(clamp(value, DUNGEON_MIN_DIMENSION, DUNGEON_MAX_DIMENSION))
    : fallback;
}

function readChance(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? clamp(value, 0, 1) : fallback;
}

function readName(value: unknown, known: string[]): string | undefined {
  return typeof value === 'string' && known.includes(value) ? value : undefined;
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Anything unrecognisable is dropped rather than coerced, and a name this build no longer has is
 * dropped with it: a config written by a build that spelled a blueprint differently should fall
 * back to the seed's own choice, not roll a dungeon to a blueprint it misread. Dimensions and
 * chances are clamped to the range the page offers, because a stored 10,000-wide map is not a
 * dungeon anyone asked for and is one the browser would spend a minute packing.
 */
export function readDungeonGeneratorConfig(
  config: Record<string, unknown>,
): DungeonGeneratorConfigRecord {
  const blueprintName = readName(config.blueprintName, dungeonBlueprintNames());
  const biomeName = readName(config.biomeName, dungeonBiomeNames());
  return {
    width: readDimension(config.width, DUNGEON_DEFAULT_WIDTH),
    height: readDimension(config.height, DUNGEON_DEFAULT_HEIGHT),
    ...(blueprintName === undefined ? {} : { blueprintName }),
    ...(biomeName === undefined ? {} : { biomeName }),
    encounterChancePerRoom: readChance(
      config.encounterChancePerRoom,
      DUNGEON_DEFAULT_ENCOUNTER_CHANCE,
    ),
    treasureChancePerRoom: readChance(
      config.treasureChancePerRoom,
      DUNGEON_DEFAULT_TREASURE_CHANCE,
    ),
  };
}

/**
 * The land the dungeon was dug into.
 *
 * Its own stream, `${seed}-env`, so that changing the map size or the treasure chance does not
 * move the biome under a referee who had settled on one. The generator is run first and the
 * requested biome forced onto its result afterwards, rather than the biome being asked for up
 * front, because `generate` picks a biome from the climate it derived and there is no input that
 * asks it for a particular one — the forcing is what the page did, kept because it is the only
 * thing that makes the biome control do anything.
 */
export function buildDungeonEnvironment(seed: string, biomeName: string): Environment {
  const rng = new RNG(`${seed}-env`);
  const config = getDefaultEnvironmentConfig(rng);
  config.latitude = rng.float(-70, 70);
  config.elevation = rng.float(0.1, 0.8);
  config.waterDirection = [rng.float(-20, 20), rng.float(-20, 20), 0];
  config.current = [rng.float(-1, 1), rng.float(-1, 1), 0];
  config.terrainVector = [rng.float(-0.5, 0.5), rng.float(-0.5, 0.5), 0];

  const environment = generateEnvironment(config);
  if (environment.biome.name === biomeName) {
    return environment;
  }

  const classification = BiomeClassifications.getByName(biomeName);
  const biome = {
    ...environment.biome,
    name: classification.name,
    features: Biomes.generateBiomeFeatures(classification, rng),
    descriptions: Biomes.generateBiomeDescriptions(classification, rng),
  };

  const description = [
    rng.item(biome.descriptions),
    rng.item(biome.features),
    environment.climate.description,
    describeTerrain(environment.terrain, rng),
  ].join(' ');

  return { ...environment, biome, description };
}

/** Roll a dungeon from a seed and a set of options — the one path the page and a re-roll take. */
export function rollDungeon(
  seed: string,
  config: DungeonGeneratorConfigRecord = {},
): EngineeredDungeon {
  const rng = new RNG(seed);
  const blueprintName = config.blueprintName ?? rng.item(dungeonBlueprintNames());
  const biomeName = config.biomeName ?? rng.item(dungeonBiomeNames());

  return generateDungeon({
    seed,
    width: config.width ?? DUNGEON_DEFAULT_WIDTH,
    height: config.height ?? DUNGEON_DEFAULT_HEIGHT,
    environment: buildDungeonEnvironment(seed, biomeName),
    blueprintName,
    encounterChancePerRoom: config.encounterChancePerRoom ?? DUNGEON_DEFAULT_ENCOUNTER_CHANCE,
    treasureChancePerRoom: config.treasureChancePerRoom ?? DUNGEON_DEFAULT_TREASURE_CHANCE,
  });
}

/**
 * Roll a fresh dungeon as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollDungeonSnapshot(
  seed: string,
  config: DungeonGeneratorConfigRecord = {},
): DungeonSnapshot {
  return toDungeonSnapshot(rollDungeon(seed, config));
}

/**
 * The room a referee walks into first: the one the stairs come up in, or the first room there is.
 *
 * Rooms carry their index as their id, so a dungeon whose entrance names a room that is no longer
 * there falls back to the first rather than to nothing — a dungeon with rooms always has somewhere
 * to put a referenced encounter.
 */
export function entranceRoomIndex(dungeon: EngineeredDungeon): number {
  const entrance = dungeon.entrances[0];
  const named =
    entrance === undefined ? -1 : dungeon.rooms.findIndex((room) => room.id === entrance.roomId);
  return named >= 0 ? named : dungeon.rooms.length > 0 ? 0 : -1;
}

/**
 * Put a saved encounter in the room the dungeon is entered through — requirement 5.1, for the one
 * kind this tool composes that exists today.
 *
 * The entrance room rather than a room drawn from the seed, because a referee who has attached a
 * particular encounter to a particular dungeon wants to be able to find it: "the thing waiting at
 * the bottom of the stairs" is a place on the map, where "room 23 of 44" is a search. Whatever the
 * roll put there is replaced, and the room's name is re-derived so that a room the roll left empty
 * does not stay labelled abandoned with a guard standing in it.
 *
 * A dungeon with no rooms is handed back unchanged. That is a real roll — a low density on a small
 * grid packs nothing — and there is no room to put an encounter in.
 *
 * The reference lives beside the payload as an `ArtifactReference` rather than in the config, and a
 * re-roll from provenance therefore does not wear it: the same position `$lib/organizations` takes
 * for referenced arms. The reference was a decision about the dungeon that was.
 */
export function withEncounterAtEntrance(
  dungeon: EngineeredDungeon,
  encounter: Encounter,
): EngineeredDungeon {
  const index = entranceRoomIndex(dungeon);
  if (index < 0) {
    return dungeon;
  }
  const room = dungeon.rooms[index];
  const populated: PopulatedRoom = {
    ...room,
    name: roomName(room.purpose, encounter, room.treasure),
    encounter,
  };
  return {
    ...dungeon,
    rooms: dungeon.rooms.map((entry, position) => (position === index ? populated : entry)),
  };
}
