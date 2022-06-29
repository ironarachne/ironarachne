'use strict';

import random from 'random';
import * as RND from '../random';
import * as Tiles from './tiles';
import Dungeon from './dungeon';
import DungeonGeneratorConfig from './dungeongeneratorconfig';
import * as DungeonThemes from './dungeonthemes/all';
import * as Doors from './doors';
import Room from './rooms/room';
import * as Mutators from './rooms/mutators/mutators';
import * as Rooms from './rooms/rooms';
import * as RoomThemes from './rooms/themes/themes';
import * as Words from '../words';

import TreasureSpawn from './treasurespawn';
import EncounterSpawn from './encounterspawn';
import EncounterGeneratorConfig from '../encounters/generatorconfig';
import EncounterGenerator from '../encounters/generator';
import * as _ from 'lodash';
import Key from './treasure/key';
import TreasureResultGenerator from './treasure/generator';
import TreasureGeneratorConfig from './treasure/generatorconfig';
import * as CommonTables from './treasure/tables/common';
import * as UncommonTables from './treasure/tables/uncommon';
import * as RareTables from './treasure/tables/rare';
import RoomGeneratorConfig from './rooms/roomgeneratorconfig';
import RoomGenerator from './rooms/roomgenerator';

export default class DungeonGenerator {
  config: DungeonGeneratorConfig;

  constructor(config: DungeonGeneratorConfig) {
    this.config = config;
  }

  generate(): Dungeon {
    let dungeon = new Dungeon();
    dungeon.environment = RND.item([
      'arctic',
      'coastal',
      'desert',
      'forest',
      'grassland',
      'hill',
      'mountain',
      'urban',
      'underdark',
    ]);
    dungeon.tiles = initializeTiles(this.config.width, this.config.height);

    let themeOptions = DungeonThemes.all();
    dungeon.theme = RND.item(themeOptions);
    dungeon.name = dungeon.theme.nameGenerator.generate(1)[0];

    dungeon = generateEntrance(dungeon, this.config.width, this.config.height);

    let numRooms = random.int(this.config.minRooms, this.config.maxRooms);
    dungeon = generateRooms(dungeon, numRooms, this.config.width, this.config.height);

    for (let i = 0; i < 2; i++) {
      dungeon = Doors.addDoorsToDungeon(dungeon);
    }

    dungeon = addLight(dungeon);

    let keySpawns = generateKeySpawns(dungeon);

    // TODO: generate trap spawns
    // trap spawns have a type, a min and max room for location, and a potential treasure spawn
    // note that trap spawns can target doors or features

    let encounterSpawns = [];
    let numberOfEncounters = 0;

    for (let i = 1; i < dungeon.rooms.length; i++) {
      let encounterChance = RND.chance(100);
      let encounterType = 'none';
      if (i == dungeon.rooms.length - 1) {
        encounterType = 'boss';
      } else if (encounterChance > 90) {
        encounterType = 'strong';
      } else if (encounterChance > 30) {
        encounterType = 'weak';
      }

      if (encounterType != 'none') {
        let spawn = generateEncounterSpawn(dungeon, encounterType, i);
        encounterSpawns.push(spawn);
        numberOfEncounters++;
      }
    }

    let treasureSpawns = generateTreasureHordes(dungeon);

    dungeon = generateEncounters(dungeon, encounterSpawns);
    dungeon = generateKeys(dungeon, keySpawns);
    dungeon = generateTreasure(dungeon, treasureSpawns);

    dungeon.averageThreatLevel = Math.floor(dungeon.totalThreatLevel / numberOfEncounters);

    return dungeon;
  }
}

function addLight(dungeon: Dungeon): Dungeon {
  let allMutators = Mutators.all();
  let lights = Mutators.withTag('light', allMutators);

  for (let i = 0; i < dungeon.rooms.length; i++) {
    if (RND.chance(100) > 60) {
      let lightMutator = RND.item(lights);
      dungeon.rooms[i] = lightMutator.mutate(dungeon.rooms[i]);
    }
  }

  return dungeon;
}

function addRoomToTiles(room: Room, tiles: number[][]): number[][] {
  for (let i = 0; i < room.vertices.length; i++) {
    tiles[room.vertices[i].y][room.vertices[i].x] = Tiles.ROOM;
  }

  return tiles;
}

function generateEncounters(dungeon: Dungeon, encounterSpawns: EncounterSpawn[]): Dungeon {
  for (let i = 0; i < encounterSpawns.length; i++) {
    let maxRoom = encounterSpawns[i].maxRoom;
    if (maxRoom == -1) {
      maxRoom = dungeon.rooms.length - 1;
    }
    let minRoom = encounterSpawns[i].minRoom;
    let roomId = random.int(minRoom, maxRoom);

    let eGen = new EncounterGenerator();
    eGen.config = encounterSpawns[i].encounterConfig;

    let encounter = eGen.generate();

    dungeon.rooms[roomId].encounters.push(encounter);
    dungeon.totalThreatLevel += encounter.totalThreatLevel;

    if (encounterSpawns[i].treasureSpawns.length > 0) {
      for (let j = 0; j < encounterSpawns[i].treasureSpawns.length; j++) {
        let ts = encounterSpawns[i].treasureSpawns[j];
        for (let k = 0; k < encounter.groups.length; k++) {
          for (let l = 0; l < encounter.groups[k].mobs.length; l++) {
            if (RND.chance(100) > 50) {
              encounter.groups[k].mobs[l].carried.push(RND.item(ts.treasure));
            }
          }
        }
      }
    }
  }

  return dungeon;
}

function generateEncounterSpawn(
  dungeon: Dungeon,
  encounterType: string,
  roomId: number,
): EncounterSpawn {
  let config = new EncounterGeneratorConfig();
  config.environment = dungeon.environment;
  config.sentientOptions = dungeon.theme.sentientOptions;
  let treasureTables = CommonTables.individual();

  if (encounterType == 'boss') {
    config.template = RND.weighted(dungeon.theme.bossEncounterTemplates);
    config.minThreatLevel = 3;
    config.maxThreatLevel = 10;
    treasureTables = RareTables.individual();
  } else if (encounterType == 'strong') {
    config.template = RND.weighted(dungeon.theme.strongEncounterTemplates);
    treasureTables = UncommonTables.individual();
  } else {
    config.template = RND.weighted(dungeon.theme.weakEncounterTemplates);
  }

  let spawn = new EncounterSpawn();
  spawn.minRoom = roomId;
  spawn.maxRoom = roomId;
  spawn.encounterConfig = config;

  let addTreasureToEncounter = false;

  for (let j = 0; j < spawn.encounterConfig.template.groupTemplates.length; j++) {
    if (spawn.encounterConfig.template.groupTemplates[j].isSentient) {
      addTreasureToEncounter = true;
    }
  }

  let treasureConfig = new TreasureGeneratorConfig();
  treasureConfig.tables = treasureTables;
  let treasureGen = new TreasureResultGenerator(treasureConfig);
  let treasure = treasureGen.generate();
  let ts = new TreasureSpawn();
  ts.treasure = ts.treasure.concat(treasure);
  if (addTreasureToEncounter) {
    spawn.treasureSpawns.push(ts);
  }

  return spawn;
}

function generateEntrance(dungeon: Dungeon, mapWidth: number, mapHeight: number): Dungeon {
  let entranceTheme = RoomThemes.getEntrance();
  entranceTheme.flooringOptions = dungeon.theme.flooringOptions;
  let roomGenConfig = new RoomGeneratorConfig(mapWidth, mapHeight, entranceTheme);

  let roomGen = new RoomGenerator(roomGenConfig);

  let firstRoom = roomGen.generate();
  firstRoom.id = 0;

  dungeon.rooms.push(firstRoom);
  dungeon.tiles = addRoomToTiles(firstRoom, dungeon.tiles);

  return dungeon;
}

function generateKeySpawns(dungeon: Dungeon): TreasureSpawn[] {
  let keySpawns = [];

  for (let i = 0; i < dungeon.doors.length; i++) {
    if (dungeon.doors[i].lock != null) {
      let keySpawn = new TreasureSpawn();
      keySpawn.behavior = `This key unlocks the door between room ${
        dungeon.doors[i].room1 + 1
      } and room ${dungeon.doors[i].room2 + 1} in ${dungeon.name}.`;
      keySpawn.minRoom = 0;
      keySpawn.maxRoom = dungeon.doors[i].room1;
      let key = new Key();
      key.name = 'a key';
      key.lockId = dungeon.doors[i].lock.id;
      let keyDescription = RND.item([
        `a ${RND.item(['simple', 'plain', 'rough'])} key`,
        `a ${RND.item(['small', 'ornate', 'shiny', 'tarnished'])} key`,
      ]);
      key.description = `${keyDescription} that unlocks the door between room ${
        dungeon.doors[i].room1 + 1
      } and room ${dungeon.doors[i].room2 + 1}`;
      key.value = random.int(1, 10);
      keySpawn.treasure.push(key);
      keySpawns.push(keySpawn);
    }
  }

  return keySpawns;
}

function generateKeys(dungeon: Dungeon, keySpawns: TreasureSpawn[]): Dungeon {
  for (let i = 0; i < keySpawns.length; i++) {
    let roomId = random.int(keySpawns[i].minRoom, keySpawns[i].maxRoom);
    if (dungeon.rooms[roomId].encounters.length > 0) {
      let e = RND.item(dungeon.rooms[roomId].encounters);
      let m = RND.item(e.groups[0].mobs);
      m.carried.push(keySpawns[i].treasure[0]);
    } else {
      dungeon.rooms[roomId].treasureCaches.push(keySpawns[i].treasure[0].description);
    }
  }

  return dungeon;
}

function generateRooms(
  dungeon: Dungeon,
  numRooms: number,
  mapWidth: number,
  mapHeight: number,
): Dungeon {
  let id = 0;
  let roomGeneration = true;
  let failedIterations = 0;
  let failedMax = 5;

  for (let i = 0; i < dungeon.theme.requiredRooms.length; i++) {
    let rr = dungeon.theme.requiredRooms[i];

    let roomCount = random.int(rr.minCount, rr.maxCount);

    for (let j = 0; j < roomCount; j++) {
      let r = Rooms.getPlaceableRoom(mapWidth, mapHeight, rr.theme, dungeon.rooms);

      if (r === null) {
        console.debug(`Room broke`, rr, dungeon.theme.name);
      } else {
        id += 1;
        r.id = id;

        dungeon.rooms.push(r);
        dungeon.tiles = addRoomToTiles(r, dungeon.tiles);
      }
    }
  }

  while (roomGeneration) {
    if (dungeon.rooms.length >= numRooms) {
      roomGeneration = false;
    } else {
      let roomTheme = RND.weighted(dungeon.theme.roomThemes);
      if (roomTheme.environment == dungeon.theme.mainEnvironment) {
        roomTheme.flooringOptions = dungeon.theme.flooringOptions;
      }
      let r = Rooms.getPlaceableRoom(mapWidth, mapHeight, roomTheme, dungeon.rooms);
      if (r === null) {
        failedIterations++;
      } else {
        id += 1;
        r.id = id;

        dungeon.rooms.push(r);
        dungeon.tiles = addRoomToTiles(r, dungeon.tiles);
      }

      if (failedIterations > failedMax) {
        roomGeneration = false;
      }
    }
  }

  return dungeon;
}

function generateTreasure(dungeon: Dungeon, treasureSpawns: TreasureSpawn[]): Dungeon {
  for (let i = 0; i < treasureSpawns.length; i++) {
    let maxRoom = treasureSpawns[i].maxRoom;
    if (maxRoom == -1) {
      maxRoom = dungeon.rooms.length - 1;
    }
    let minRoom = treasureSpawns[i].minRoom;
    if (minRoom == -1) {
      minRoom = 1;
    }
    let roomId = random.int(minRoom, maxRoom);

    let descriptions = [];

    for (const t of treasureSpawns[i].treasure) {
      descriptions.push(t.description);
    }

    let treasureDescription = Words.arrayToPhrase(descriptions);

    if (treasureSpawns[i].isHidden) {
      treasureDescription += `, hidden somewhere in the room`;
      dungeon.rooms[roomId].treasureCaches.push(treasureDescription);
    } else if (treasureSpawns[i].isCarried) {
      let te = RND.item(dungeon.rooms[roomId].encounters);
      let mob = RND.item(te.groups[0].mobs);
      mob.carried.push(treasureDescription);
    } else {
      let containers = [];
      for (let i = 0; i < dungeon.rooms[roomId].features.length; i++) {
        if (dungeon.rooms[roomId].features[i].isContainer) {
          containers.push(i);
        }
      }
      if (containers.length > 0) {
        if (RND.chance(100) > 10) {
          treasureDescription +=
            ', inside ' + dungeon.rooms[roomId].features[RND.item(containers)].name;
        }
        dungeon.rooms[roomId].treasureCaches.push(treasureDescription);
      } else {
        dungeon.rooms[roomId].treasureCaches.push(treasureDescription);
      }
    }
  }

  return dungeon;
}

function generateTreasureHordes(dungeon: Dungeon): TreasureSpawn[] {
  let hordeChance = 100;
  let treasureSpawns = [];
  let commonHordeTables = CommonTables.horde();
  let bossHordeTables = RareTables.horde();

  for (let i = 1; i < dungeon.rooms.length; i++) {
    // Chance of a treasure horde - increases the higher the room number, but decreases after each horde
    if (RND.chance(100) > hordeChance) {
      let hordeConfig = new TreasureGeneratorConfig();
      hordeConfig.tables = commonHordeTables;
      if (i == dungeon.rooms.length - 1) {
        hordeConfig.tables = bossHordeTables;
      }
      let treasureGen = new TreasureResultGenerator(hordeConfig);
      let treasure = treasureGen.generate();
      let horde = new TreasureSpawn();
      horde.treasure = horde.treasure.concat(treasure);

      treasureSpawns.push(horde);
      hordeChance = 100;
    } else {
      hordeChance -= 2;
    }
  }

  return treasureSpawns;
}

function initializeTiles(width: number, height: number): number[][] {
  let v = [];

  for (let y = 0; y < height; y++) {
    v[y] = [];
    for (let x = 0; x < width; x++) {
      v[y][x] = Tiles.STONE;
    }
  }

  return v;
}
