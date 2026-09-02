import { describe, expect, it } from 'vitest';

import {
  DUNGEON_DEFAULT_ENCOUNTER_CHANCE,
  DUNGEON_DEFAULT_HEIGHT,
  DUNGEON_DEFAULT_TREASURE_CHANCE,
  DUNGEON_DEFAULT_WIDTH,
  DUNGEON_MAX_DIMENSION,
  DUNGEON_MIN_DIMENSION,
  buildDungeonEnvironment,
  dungeonBiomeNames,
  dungeonBlueprintNames,
  readDungeonGeneratorConfig,
  rollDungeon,
  entranceRoomIndex,
  rollDungeonSnapshot,
  withEncounterAtEntrance,
} from './dungeon_roll';

const SMALL = { width: 20, height: 20 };

describe('rolling a dungeon', () => {
  it('gives the same dungeon for the same seed and settings (2.2)', () => {
    const first = rollDungeon('repeatable', SMALL);
    const second = rollDungeon('repeatable', SMALL);
    expect(second).toEqual(first);
  });

  it('gives a different dungeon for a different seed', () => {
    const first = rollDungeon('one', SMALL);
    const second = rollDungeon('two', SMALL);
    expect(second.name).not.toEqual(first.name);
  });

  it('honours a named blueprint', () => {
    const dungeon = rollDungeon('blueprinted', { ...SMALL, blueprintName: 'Arcane Library' });
    expect(dungeon.theme.blueprint.name).toEqual('Arcane Library');
  });

  it('honours a named biome', () => {
    const dungeon = rollDungeon('biomed', { ...SMALL, biomeName: 'tundra' });
    expect(dungeon.theme.environment.biome.name).toEqual('tundra');
  });

  it('draws the blueprint and the biome from the seed when the config leaves them open', () => {
    // Both are absent, so both come from the seed's own stream — which is what "Random" meant on
    // the page, and what makes a re-roll from a provenance that recorded neither reproducible.
    const first = rollDungeon('open', SMALL);
    const second = rollDungeon('open', SMALL);
    expect(second.theme.name).toEqual(first.theme.name);
  });

  it('fills empty rooms when the chances are zero', () => {
    const dungeon = rollDungeon('barren', {
      ...SMALL,
      encounterChancePerRoom: 0,
      treasureChancePerRoom: 0,
    });
    expect(dungeon.rooms.every((room) => room.encounter === undefined)).toBe(true);
    expect(dungeon.rooms.every((room) => room.treasure === undefined)).toBe(true);
  });

  it('rolls to the defaults when handed no config at all', () => {
    const dungeon = rollDungeon('defaulted');
    expect(dungeon.layout.width).toEqual(DUNGEON_DEFAULT_WIDTH);
    expect(dungeon.layout.height).toEqual(DUNGEON_DEFAULT_HEIGHT);
  });

  it('rolls a snapshot by the same path', () => {
    const snapshot = rollDungeonSnapshot('snapshotted', SMALL);
    expect(snapshot.name).toEqual(rollDungeon('snapshotted', SMALL).name);
  });
});

describe('the environment a dungeon is dug into', () => {
  it('is the same land for the same seed', () => {
    expect(buildDungeonEnvironment('land', 'tundra')).toEqual(
      buildDungeonEnvironment('land', 'tundra'),
    );
  });

  it('forces the biome that was asked for', () => {
    const environment = buildDungeonEnvironment('forced', 'cold desert');
    expect(environment.biome.name).toEqual('cold desert');
    expect(environment.description).not.toEqual('');
  });

  it('offers no aquatic biome, because a dungeon is dug into ground', () => {
    expect(dungeonBiomeNames()).not.toContain('coral reef');
    expect(dungeonBiomeNames().length).toBeGreaterThan(0);
  });

  it('offers every blueprint the library has', () => {
    expect(dungeonBlueprintNames()).toContain('Tomb');
  });
});

describe('reading a stored generator config', () => {
  it('reads back what the page recorded', () => {
    expect(
      readDungeonGeneratorConfig({
        width: 50,
        height: 45,
        blueprintName: 'Stronghold',
        biomeName: 'tundra',
        encounterChancePerRoom: 0.7,
        treasureChancePerRoom: 0.1,
      }),
    ).toEqual({
      width: 50,
      height: 45,
      blueprintName: 'Stronghold',
      biomeName: 'tundra',
      encounterChancePerRoom: 0.7,
      treasureChancePerRoom: 0.1,
    });
  });

  it('falls back to the defaults for anything it does not recognise', () => {
    expect(readDungeonGeneratorConfig({ width: 'wide', encounterChancePerRoom: null })).toEqual({
      width: DUNGEON_DEFAULT_WIDTH,
      height: DUNGEON_DEFAULT_HEIGHT,
      encounterChancePerRoom: DUNGEON_DEFAULT_ENCOUNTER_CHANCE,
      treasureChancePerRoom: DUNGEON_DEFAULT_TREASURE_CHANCE,
    });
  });

  it('drops a blueprint or biome this build no longer has', () => {
    // Dropped rather than kept: an unknown name means the seed chooses, which is a dungeon, where
    // passing it through would make `buildTheme` throw on the way to one.
    const config = readDungeonGeneratorConfig({
      blueprintName: 'Sunken Ziggurat',
      biomeName: 'the moon',
    });
    expect(config.blueprintName).toBeUndefined();
    expect(config.biomeName).toBeUndefined();
  });

  it('clamps a map to the sizes the page offers', () => {
    const huge = readDungeonGeneratorConfig({ width: 10_000, height: 1 });
    expect(huge.width).toEqual(DUNGEON_MAX_DIMENSION);
    expect(huge.height).toEqual(DUNGEON_MIN_DIMENSION);
  });

  it('clamps the chances to a probability', () => {
    const wild = readDungeonGeneratorConfig({
      encounterChancePerRoom: 4,
      treasureChancePerRoom: -1,
    });
    expect(wild.encounterChancePerRoom).toEqual(1);
    expect(wild.treasureChancePerRoom).toEqual(0);
  });

  it('rounds a fractional map size, because a grid has whole tiles', () => {
    expect(readDungeonGeneratorConfig({ width: 30.6 }).width).toEqual(31);
  });
});

describe('composing a dungeon with a saved encounter (5.1)', () => {
  const dungeon = rollDungeon('composed', {
    ...SMALL,
    encounterChancePerRoom: 0,
    treasureChancePerRoom: 0,
  });
  const encounter = {
    name: 'The Doorkeeper',
    description: 'It has been waiting.',
    difficulty: 3,
    groups: [],
  };

  it('puts it in the room the dungeon is entered through', () => {
    const index = entranceRoomIndex(dungeon);
    expect(index).toBeGreaterThanOrEqual(0);
    const composed = withEncounterAtEntrance(dungeon, encounter);
    expect(composed.rooms[index].encounter?.name).toEqual('The Doorkeeper');
  });

  it('stops calling that room abandoned once something is standing in it', () => {
    const index = entranceRoomIndex(dungeon);
    expect(dungeon.rooms[index].name).toContain('Abandoned');
    expect(withEncounterAtEntrance(dungeon, encounter).rooms[index].name).toContain('Occupied');
  });

  it('leaves every other room alone', () => {
    const index = entranceRoomIndex(dungeon);
    const composed = withEncounterAtEntrance(dungeon, encounter);
    expect(composed.rooms.filter((_room, position) => position !== index)).toEqual(
      dungeon.rooms.filter((_room, position) => position !== index),
    );
  });

  it('hands back a dungeon with no rooms unchanged', () => {
    const empty = { ...dungeon, rooms: [], entrances: [] };
    expect(entranceRoomIndex(empty)).toEqual(-1);
    expect(withEncounterAtEntrance(empty, encounter)).toEqual(empty);
  });

  it('falls back to the first room when the entrance names one that is gone', () => {
    const orphaned = {
      ...dungeon,
      entrances: [{ x: 0, y: 0, type: 'stairs' as const, roomId: 'nowhere' }],
    };
    expect(entranceRoomIndex(orphaned)).toEqual(0);
  });
});
