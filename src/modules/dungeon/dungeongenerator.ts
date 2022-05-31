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
import * as Treasure from './treasure';
import EncounterSpawn from './encounterspawn';
import EncounterGeneratorConfig from '../encounters/generatorconfig';
import EncounterGenerator from '../encounters/generator';
import * as _ from 'lodash';

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
            let key = new TreasureSpawn();
            key.behavior = `It unlocks the door between room ${r2.id + 1} and room ${r.id + 1}.`;
            key.minRoom = 0;
            key.maxRoom = r2.id;
            key.objectType = new Treasure.Key();
            key.objectType.name = 'a key';
            let keyDescription = RND.item([
              `a ${RND.item(['simple', 'plain', 'rough'])} key`,
              `a ${RND.item(['small', 'ornate', 'shiny', 'tarnished'])} key`,
            ]);
            key.objectType.description = `${keyDescription} that unlocks the door between room ${
              r2.id + 1
            } and room ${r.id + 1}`;
            key.objectType.value = 1;
            key.isCarried = RND.chance(100) > 90 ? true : false;
            if (!key.isCarried) {
              key.isHidden = RND.chance(100) > 90 ? true : false;
            }
            treasureSpawns.push(key);
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

    let minEncounters = dungeon.rooms.length - 7;
    let maxEncounters = dungeon.rooms.length - 3;
    let numberOfEncounters = random.int(minEncounters, maxEncounters);
    let weakEncounters = Math.floor(numberOfEncounters * 0.6);
    let strongEncounters = Math.floor(numberOfEncounters * 0.3);
    let bossEncounters = 1;

    let minRoom = 1;
    let maxRoom = dungeon.rooms.length - 5;

    for (let i = 0; i < weakEncounters; i++) {
      let config = new EncounterGeneratorConfig();
      config.template = RND.item(dungeon.theme.weakEncounterTemplates);

      let spawn = new EncounterSpawn();
      spawn.minRoom = minRoom;
      spawn.maxRoom = maxRoom;
      spawn.encounterConfig = config;

      let treasures = Treasure.common();
      let treasureAmount = random.int(1, 2);
      for (let j = 0; j < treasureAmount; j++) {
        let ts = new TreasureSpawn();
        ts.objectType = RND.item(treasures);
        spawn.treasureSpawns.push(ts);
      }
      encounterSpawns.push(spawn);
    }

    minRoom = 5;
    maxRoom = dungeon.rooms.length - 3;

    for (let i = 0; i < strongEncounters; i++) {
      let config = new EncounterGeneratorConfig();
      config.template = RND.item(dungeon.theme.strongEncounterTemplates);

      let spawn = new EncounterSpawn();
      spawn.minRoom = minRoom;
      spawn.maxRoom = maxRoom;
      spawn.encounterConfig = config;
      let treasures = Treasure.uncommon();
      let treasureAmount = random.int(2, 3);
      for (let j = 0; j < treasureAmount; j++) {
        let ts = new TreasureSpawn();
        ts.objectType = RND.item(treasures);
        spawn.treasureSpawns.push(ts);
      }
      encounterSpawns.push(spawn);
    }

    minRoom = dungeon.rooms.length - 2;
    maxRoom = dungeon.rooms.length - 1;

    for (let i = 0; i < bossEncounters; i++) {
      let config = new EncounterGeneratorConfig();
      config.template = RND.item(dungeon.theme.bossEncounterTemplates);

      let spawn = new EncounterSpawn();
      spawn.minRoom = minRoom;
      spawn.maxRoom = maxRoom;
      spawn.encounterConfig = config;
      let treasures = Treasure.rare();
      let treasureAmount = random.int(2, 3);
      for (let j = 0; j < treasureAmount; j++) {
        let ts = new TreasureSpawn();
        ts.objectType = RND.item(treasures);
        spawn.treasureSpawns.push(ts);
      }

      encounterSpawns.push(spawn);
    }

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
      let roomId = random.int(minRoom, maxRoom);

      let tdesc = treasureSpawns[i].objectType.description;

      if (treasureSpawns[i].isHidden) {
        tdesc = `Hidden somewhere in the room is ${tdesc}. `;
        dungeon.rooms[roomId].features.push(new RoomFeature('treasure', tdesc, false));
      } else {
        let containers = [];
        for (let i = 0; i < dungeon.rooms[roomId].features.length; i++) {
          if (dungeon.rooms[roomId].features[i].isContainer) {
            containers.push(i);
          }
        }
        if (containers.length > 0) {
          if (RND.chance(100) > 10) {
            tdesc =
              'Inside the ' +
              dungeon.rooms[roomId].features[RND.item(containers)].name +
              ' is ' +
              tdesc +
              '. ';
          } else {
            tdesc = 'There is ' + tdesc + ' here. ';
          }
          dungeon.rooms[roomId].features.push(new RoomFeature('treasure', tdesc, false));
        } else {
          tdesc = 'There is ' + tdesc + ' here. ';
          dungeon.rooms[roomId].features.push(new RoomFeature('treasure', tdesc, false));
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
