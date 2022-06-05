'use strict';

import random from 'random';
import * as RND from '../random';
import * as Tiles from './tiles';
import Dungeon from './dungeon';
import DungeonGeneratorConfig from './dungeongeneratorconfig';
import * as DungeonThemes from './dungeonthemes/all';
import Room from './room';
import Vertex from '../geometry/vertex';
import * as RoomThemes from './roomthemes';
import * as RoomFeatures from './roomfeatures';
import * as Geometry from '../geometry/geometry';
import * as Words from '../words';
import Door from './door';
import Edge from '../geometry/edge';
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

    let firstRoom = generateRoom(
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
        let r = getPlaceableRoom(
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
          r2 = getNearestRoom(r, dungeon.rooms);

          if (RND.chance(100) > 80) {
            let roomTheme = RND.item(roomThemes);

            r.features = r.features.concat(roomTheme.features);
          }

          dungeon.rooms.push(r);
          dungeon.tiles = addRoomToTiles(r, dungeon.tiles);

          let door = addDoor(r, r2);

          if (r2.id == 0) {
            door.isSecret = false;
            if (dungeon.rooms[0].doors.length < 2) {
              door.isLocked = false;
            }
          }

          if (door.isLocked) {
            let keySpawn = new TreasureSpawn();
            // TODO: make keys unlock Locks, and make some doors have a Lock
            keySpawn.behavior = `It unlocks the door between room ${r2.id + 1} and room ${
              r.id + 1
            }.`;
            keySpawn.minRoom = 0;
            keySpawn.maxRoom = r2.id;
            keySpawn.treasure = new Key();
            keySpawn.treasure.name = 'a key';
            let keyDescription = RND.item([
              `a ${RND.item(['simple', 'plain', 'rough'])} key`,
              `a ${RND.item(['small', 'ornate', 'shiny', 'tarnished'])} key`,
            ]);
            keySpawn.treasure.description = `${keyDescription} that unlocks the door between room ${
              r2.id + 1
            } and room ${r.id + 1}`;
            keySpawn.treasure.value = 1;
            keySpawn.isCarried = RND.chance(100) > 90 ? true : false;
            if (!keySpawn.isCarried) {
              keySpawn.isHidden = RND.chance(100) > 90 ? true : false;
            }
            treasureSpawns.push(keySpawn);
          }

          let doorQuality = RND.item([
            RND.item(['rough', 'decaying', 'rotted']),
            'simple',
            'plain',
            RND.item([
              'iron-trimmed',
              'copper-trimmed',
              'silver-trimmed',
              'gold-trimmed',
              'painted',
              'carved',
              'ornate',
            ]),
          ]);

          door.description = Words.article(doorQuality) + ' ' + doorQuality + ' door';

          dungeon.doors.push(door);
          let di = dungeon.doors.length;
          dungeon.rooms[r.id].doors.push(di);
          dungeon.rooms[r.id].features.push(
            new RoomFeature('door', getDoorDescription(door, dungeon.rooms[r.id]), false),
          );
          dungeon.rooms[r2.id].doors.push(di);
          dungeon.rooms[r2.id].features.push(
            new RoomFeature('door', getDoorDescription(door, dungeon.rooms[r2.id]), false),
          );

          dungeon.tiles = addDoorToTiles(door, dungeon.tiles);
        }

        if (failedIterations > failedMax) {
          roomGeneration = false;
        }
      }
    }

    for (let i = 0; i < dungeon.rooms.length; i++) {
      if (RND.chance(100) > 10) {
        dungeon.rooms[i].features.push(RoomFeatures.random());
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

function addDoor(room1: Room, room2: Room): Door {
  let door = new Door();
  let possibleEdges = [];

  for (let i = 0; i < room1.vertices.length; i++) {
    for (let j = 0; j < room2.vertices.length; j++) {
      let nD = Geometry.distance(room1.vertices[i], room2.vertices[j]);
      if (nD == 2) {
        let e = new Edge();
        e.a = room1.vertices[i];
        e.b = room2.vertices[j];
        possibleEdges.push(e);
      }
    }
  }

  let e: Edge = RND.item(possibleEdges);
  door.vertex = e.getMidpoint();

  if (e.getSlope() === 0) {
    door.tile = Tiles.H_DOOR;
  } else {
    door.tile = Tiles.V_DOOR;
  }

  if (RND.chance(100) > 90) {
    door.isLocked = true;
  } else if (RND.chance(100) > 90) {
    door.isSecret = true;
  }

  return door;
}

function addDoorToTiles(door: Door, tiles: number[][]): number[][] {
  tiles[door.vertex.y][door.vertex.x] = door.tile;

  return tiles;
}

function addRoomToTiles(room: Room, tiles: number[][]): number[][] {
  for (let i = 0; i < room.vertices.length; i++) {
    tiles[room.vertices[i].y][room.vertices[i].x] = Tiles.ROOM;
  }

  return tiles;
}

function doesRoomCollide(room: Room, rooms: Room[]): boolean {
  for (let i = 0; i < rooms.length; i++) {
    for (let j = 0; j < rooms[i].vertices.length; j++) {
      for (let k = 0; k < room.vertices.length; k++) {
        if (room.vertices[k].equals(rooms[i].vertices[j])) {
          return true;
        }
      }
    }
  }

  return false;
}

function doesRoomTouch(room: Room, rooms: Room[]): boolean {
  for (let i = 0; i < rooms.length; i++) {
    for (let j = 0; j < rooms[i].vertices.length; j++) {
      for (let k = 0; k < room.vertices.length; k++) {
        if (Geometry.distance(room.vertices[k], rooms[i].vertices[j]) == 1) {
          return true;
        }
      }
    }
  }

  return false;
}

function distanceToNearestOtherRoomTile(room: Room, rooms: Room[]): number {
  let distance = 10000000;

  for (let i = 0; i < rooms.length; i++) {
    for (let j = 0; j < rooms[i].vertices.length; j++) {
      for (let k = 0; k < room.vertices.length; k++) {
        let d = Geometry.distance(rooms[i].vertices[j], room.vertices[k]);
        if (d <= distance) {
          distance = d;
        }
      }
    }
  }

  return distance;
}

function getDoorDescription(door: Door, room: Room): string {
  let dir = '';

  if (door.tile == Tiles.V_DOOR) {
    if (door.vertex.y > room.center.y) {
      if (door.vertex.x < room.center.x) {
        dir = 'southwest';
      } else if (door.vertex.x > room.center.x) {
        dir = 'southeast';
      } else {
        dir = 'south';
      }
    } else {
      if (door.vertex.x < room.center.x) {
        dir = 'northwest';
      } else if (door.vertex.x > room.center.x) {
        dir = 'northeast';
      } else {
        dir = 'north';
      }
    }
  } else {
    if (door.vertex.x < room.center.x) {
      if (door.vertex.y > room.center.y) {
        dir = 'southwest';
      } else if (door.vertex.y < room.center.y) {
        dir = 'northwest';
      } else {
        dir = 'west';
      }
    } else {
      if (door.vertex.y > room.center.y) {
        dir = 'southeast';
      } else if (door.vertex.y < room.center.y) {
        dir = 'northeast';
      } else {
        dir = 'east';
      }
    }
  }

  let description = `There is ${door.description} in the ${dir}`;

  if (door.isLocked) {
    description += '. It is locked.';
  } else if (door.isSecret) {
    description += ', but it is hidden.';
  } else {
    description += '.';
  }

  return description;
}

function getNearestRoom(room: Room, rooms: Room[]): Room {
  let distance = 10000000;
  let n = rooms[0];

  for (let i = 0; i < rooms.length; i++) {
    for (let j = 0; j < rooms[i].vertices.length; j++) {
      for (let k = 0; k < room.vertices.length; k++) {
        let d = Geometry.distance(rooms[i].vertices[j], room.vertices[k]);
        if (d <= distance) {
          distance = d;
          n = rooms[i];
        }
      }
    }
  }

  return n;
}

function isRoomInRange(range: number, room: Room, rooms: Room[]): boolean {
  if (distanceToNearestOtherRoomTile(room, rooms) == range) {
    return true;
  }

  return false;
}

function generateRoom(
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
  mapWidth: number,
  mapHeight: number,
): Room {
  let width = random.int(2, maxWidth);
  let height = random.int(2, maxHeight);

  let room = new Room();

  for (let i = y; i < y + height + 1; i++) {
    for (let j = x; j < x + width + 1; j++) {
      room.vertices.push(new Vertex(j, i));
    }
  }

  room.minX = x;
  room.maxX = room.getMaxX();
  room.minY = y;
  room.maxY = room.getMaxY();
  room.center = room.getCenter();
  room.calculateTiles(mapWidth, mapHeight);

  room.description = `This room is ${(width + 1) * 5}' wide and ${(height + 1) * 5}' long.`;

  return room;
}

function getPlaceableRoom(
  width: number,
  height: number,
  mapTiles: number[][],
  rooms: Room[],
): Room | null {
  let generation = true;
  let x = 2;
  let y = 2;
  let maxX = mapTiles[0].length - 3;
  let maxY = mapTiles.length - 3;
  let room = generateRoom(x, y, width, height, mapTiles[0].length, mapTiles.length);
  let roomAttempts = 0;
  let roomAttemptLimit = 5;

  while (generation) {
    if (
      !doesRoomCollide(room, rooms) &&
      !doesRoomTouch(room, rooms) &&
      isRoomInRange(2, room, rooms)
    ) {
      generation = false;
    } else if (roomAttempts <= roomAttemptLimit) {
      let nx = room.minX + 1;
      let ny = room.minY;

      if (nx > maxX - room.getWidth()) {
        nx = 2;
        ny++;
        if (ny > maxY - room.getHeight()) {
          roomAttempts++;
          continue;
        }
      }

      room.moveTo(nx, ny, mapTiles[0].length, mapTiles.length);
    } else if (roomAttempts > roomAttemptLimit) {
      return null;
    } else {
      roomAttempts++;
      room = generateRoom(x, y, width, height, mapTiles[0].length, mapTiles.length);
    }
  }

  return room;
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
