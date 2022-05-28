'use strict';

import random from 'random';
import * as Directions from '../geometry/directions';
import * as RND from '../random';
import * as Tiles from './tiles';
import Dungeon from './dungeon';
import DungeonGeneratorConfig from './dungeongeneratorconfig';
import Room from './room';
import Vertex from '../geometry/vertex';
import * as Geometry from '../geometry/geometry';
import * as Words from '../words';
import Door from './door';
import Edge from '../geometry/edge';
import TreasureSpawn from './treasurespawn';

export default class DungeonGenerator {
  config: DungeonGeneratorConfig;

  constructor(config: DungeonGeneratorConfig) {
    this.config = config;
  }

  generate(): Dungeon {
    let dungeon = new Dungeon();
    dungeon.biome = RND.item(this.config.possibleBiomes);
    dungeon.tiles = initializeTiles(this.config.width, this.config.height);

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
    firstRoom.features.push('The entrance to the dungeon is here.');
    let id = 0;

    dungeon.rooms.push(firstRoom);
    dungeon.tiles = addRoomToTiles(firstRoom, dungeon.tiles);

    let roomGeneration = true;
    let numRooms = random.int(this.config.minRooms, this.config.maxRooms);
    let failedIterations = 0;
    let failedMax = 5;

    let treasureSpawns = [];

    while (roomGeneration) {
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
            key.behavior = `Unlocks the door between room ${r2.id + 1} and room ${r.id + 1}`;
            key.minRoom = 0;
            key.maxRoom = r2.id;
            key.objectType = 'key';
            key.isCarried = RND.chance(100) > 90 ? true : false;
            key.isHidden = !key.isCarried;
            treasureSpawns.push(key);
          }

          dungeon.doors.push(door);
          let di = dungeon.doors.length;
          dungeon.rooms[r.id].doors.push(di);
          dungeon.rooms[r.id].features.push(getDoorDescription(door, dungeon.rooms[r.id]));
          dungeon.rooms[r2.id].doors.push(di);
          dungeon.rooms[r2.id].features.push(getDoorDescription(door, dungeon.rooms[r2.id]));

          dungeon.tiles = addDoorToTiles(door, dungeon.tiles);
        }

        if (failedIterations > failedMax) {
          roomGeneration = false;
        }
      }
    }

    for (let i = 0; i < treasureSpawns.length; i++) {
      let maxRoom = treasureSpawns[i].maxRoom;
      if (maxRoom == -1) {
        maxRoom = dungeon.rooms.length - 1;
      }
      let minRoom = treasureSpawns[i].minRoom;
      let room = random.int(minRoom, maxRoom);

      let tdesc = '';

      if (treasureSpawns[i].objectType == 'key') {
        tdesc = 'a key: ' + treasureSpawns[i].behavior;
      }

      if (treasureSpawns[i].isHidden) {
        tdesc = 'Hidden in the room, ' + tdesc;
        dungeon.rooms[room].features.push(tdesc);
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

  let p = RND.item([
    '',
    RND.item([
      RND.item([
        'iron-bound',
        'copper-trimmed',
        'iron-trimmed',
        RND.item(['gold-trimmed', 'silver-trimmed', 'electrum-trimmed']),
      ]),
      RND.item(['rusty', 'rusted', 'decaying']),
    ]),
  ]);

  if (p != '') {
    p = Words.article(p) + ' ' + p;
  } else {
    p = 'a';
  }

  if (RND.chance(100) > 50) {
    p += ' ' + RND.item(['wooden', 'wood', RND.item(['stone', 'metal'])]);
  }

  let description = `There is ${p} door in the ${dir}`;

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
