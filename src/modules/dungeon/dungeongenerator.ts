'use strict';

import random from 'random';
import * as RND from '../random';
import * as Tiles from './tiles';
import Dungeon from './dungeon';
import DungeonGeneratorConfig from './dungeongeneratorconfig';
import * as DungeonThemes from './dungeonthemes/all';
import * as Doors from './doors';
import Room from './room';
import * as Rooms from './rooms';
import * as RoomThemes from './roomthemes';
import * as RoomFeatures from './roomfeatures';
import * as Words from '../words';

import TreasureSpawn from './treasurespawn';
import RoomFeature from './roomfeature';
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

export default class DungeonGenerator {
  config: DungeonGeneratorConfig;

  constructor(config: DungeonGeneratorConfig) {
    this.config = config;
  }

  generate(): Dungeon {
    let dungeon = new Dungeon();
    dungeon.biome = RND.item(this.config.possibleBiomes);
    dungeon.tiles = initializeTiles(this.config.width, this.config.height);

    let themeOptions = DungeonThemes.all();
    dungeon.theme = RND.item(themeOptions);
    dungeon.name = dungeon.theme.nameGenerator.generate(1)[0];

    let firstX = random.int(2, this.config.width - this.config.maxRoomWidth - 3);
    let firstY = random.int(2, this.config.height - this.config.maxRoomHeight - 3);

    let firstRoom = Rooms.generateRoom(
      firstX,
      firstY,
      this.config.maxRoomWidth,
      this.config.maxRoomHeight,
      this.config.width,
      this.config.height,
    );
    firstRoom.id = 0;
    firstRoom.features.push(
      new RoomFeature(
        'entrance',
        RND.item([
          'The entrance to the dungeon is here.',
          'The stairs out of the dungeon are here.',
          'There is a set of stairs here leading out of the dungeon.',
        ]),
        false,
      ),
    );
    let id = 0;

    dungeon.rooms.push(firstRoom);
    dungeon.tiles = addRoomToTiles(firstRoom, dungeon.tiles);

    let roomGeneration = true;
    let numRooms = random.int(this.config.minRooms, this.config.maxRooms);
    let failedIterations = 0;
    let failedMax = 5;

    let treasureSpawns = [];

    let roomThemes = dungeon.theme.roomThemes;
    let otherRoomThemes = RoomThemes.all();
    roomThemes = roomThemes.concat(otherRoomThemes);

    while (roomGeneration) {
      // TODO: address light levels
      if (dungeon.rooms.length >= numRooms) {
        roomGeneration = false;
      } else {
        let r2 = new Room();
        let r = Rooms.getPlaceableRoom(
          this.config.maxRoomWidth,
          this.config.maxRoomHeight,
          dungeon.tiles,
          dungeon.rooms,
        );
        if (r === null) {
          failedIterations++;
        } else {
          id += 1;
          r.id = id;
          r2 = Rooms.getNearestRoom(r, dungeon.rooms);

          if (RND.chance(100) > 80) {
            let roomTheme = RND.item(roomThemes);

            r.features = r.features.concat(roomTheme.features);
          }

          dungeon.rooms.push(r);
          dungeon.tiles = addRoomToTiles(r, dungeon.tiles);
        }

        if (failedIterations > failedMax) {
          roomGeneration = false;
        }
      }
    }

    // Run through all rooms again and add additional doors

    for (let i = 0; i < dungeon.rooms.length; i++) {
      if (RND.chance(100) > 10) {
        dungeon.rooms[i].features.push(RoomFeatures.random());
      }
    }

    for (let i = 0; i < 2; i++) {
      dungeon = Doors.addDoorsToDungeon(dungeon);
    }

    for (let i = 0; i < dungeon.doors.length; i++) {
      if (dungeon.doors[i].isLocked) {
        let keySpawn = new TreasureSpawn();
        // TODO: make keys unlock Locks, and make some doors have a Lock
        keySpawn.behavior = `It unlocks the door between room ${
          dungeon.doors[i].room1 + 1
        } and room ${dungeon.doors[i].room2 + 1}.`;
        keySpawn.minRoom = 0;
        keySpawn.maxRoom = dungeon.doors[i].room1;
        keySpawn.treasure = new Key();
        keySpawn.treasure.name = 'a key';
        let keyDescription = RND.item([
          `a ${RND.item(['simple', 'plain', 'rough'])} key`,
          `a ${RND.item(['small', 'ornate', 'shiny', 'tarnished'])} key`,
        ]);
        keySpawn.treasure.description = `${keyDescription} that unlocks the door between room ${
          dungeon.doors[i].room1 + 1
        } and room ${dungeon.doors[i].room2 + 1}`;
        keySpawn.treasure.value = 1;
        keySpawn.isCarried = RND.chance(100) > 90 ? true : false;
        if (!keySpawn.isCarried) {
          keySpawn.isHidden = RND.chance(100) > 90 ? true : false;
        }
        treasureSpawns.push(keySpawn);
      }
    }

    // TODO: generate trap spawns
    // trap spawns have a type, a min and max room for location, and a potential treasure spawn
    // note that trap spawns can target doors or features

    let encounterSpawns = [];
    let hordeChance = 100;
    let commonHordeTable = CommonTables.horde();
    let bossHordeTable = RareTables.horde();

    for (let i = 1; i < dungeon.rooms.length; i++) {
      // 70% chance of an encounter in every room after the entry
      if (RND.chance(100) > 30 || i == dungeon.rooms.length - 1) {
        let config = new EncounterGeneratorConfig();
        let treasureTable = CommonTables.individual();
        // if it's the last room in the dungeon, make it a boss encounter
        if (i == dungeon.rooms.length - 1) {
          config.template = RND.item(dungeon.theme.bossEncounterTemplates);
          treasureTable = RareTables.individual();
        } else {
          // 30% chance of being a strong encounter
          if (RND.chance(100) > 30) {
            config.template = RND.item(dungeon.theme.weakEncounterTemplates);
          } else {
            config.template = RND.item(dungeon.theme.strongEncounterTemplates);
            treasureTable = UncommonTables.individual();
          }
        }

        let spawn = new EncounterSpawn();
        spawn.minRoom = i;
        spawn.maxRoom = i;
        spawn.encounterConfig = config;

        let treasureConfig = new TreasureGeneratorConfig();
        treasureConfig.table = treasureTable;
        let treasureGen = new TreasureResultGenerator(treasureConfig);
        let treasure = treasureGen.generate();
        let ts = new TreasureSpawn();
        ts.treasure = treasure;
        spawn.treasureSpawns.push(ts);

        encounterSpawns.push(spawn);
      }

      // Chance of a treasure horde - increases the higher the room number, but decreases after each horde
      if (RND.chance(100) > hordeChance) {
        // TODO: figure out how to add more than one item to a horde, since the coins are guaranteed, but there might be other stuff
        let hordeConfig = new TreasureGeneratorConfig();
        hordeConfig.table = commonHordeTable;
        if (i < dungeon.rooms.length - 1) {
          hordeConfig.table = bossHordeTable;
        }
        let treasureGen = new TreasureResultGenerator(hordeConfig);
        let treasure = treasureGen.generate();
        let horde = new TreasureSpawn();
        horde.treasure = treasure;

        treasureSpawns.push(horde);
        hordeChance = 100;
      } else {
        hordeChance -= 2;
      }
    }

    // TODO: add individual treasure spawns to individual sentient characters as carried items, not to random places in the room

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

      if (encounterSpawns[i].treasureSpawns.length > 0) {
        for (let j = 0; j < encounterSpawns[i].treasureSpawns.length; j++) {
          let ts = encounterSpawns[i].treasureSpawns[j];
          ts.minRoom = roomId;
          ts.maxRoom = roomId;
          treasureSpawns.push(ts);
        }
      }
    }

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

      let treasureDescription = treasureSpawns[i].treasure.description;

      if (treasureSpawns[i].isHidden) {
        treasureDescription += `, hidden somewhere in the room`;
        dungeon.rooms[roomId].treasureCaches.push(treasureDescription);
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
}

function addRoomToTiles(room: Room, tiles: number[][]): number[][] {
  for (let i = 0; i < room.vertices.length; i++) {
    tiles[room.vertices[i].y][room.vertices[i].x] = Tiles.ROOM;
  }

  return tiles;
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
