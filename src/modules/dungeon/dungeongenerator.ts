'use strict';

import random from 'random';
import * as RND from '../random';
import * as Tiles from './tiles';
import Dungeon from './dungeon';
import DungeonGeneratorConfig from './dungeongeneratorconfig';
import Room from './room';
import Vertex from '../geometry/vertex';
import * as Geometry from '../geometry/geometry';
import Door from './door';
import Edge from '../geometry/edge';

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
    let id = 0;

    dungeon.rooms.push(firstRoom);
    dungeon.tiles = addRoomToTiles(firstRoom, dungeon.tiles);

    let roomGeneration = true;
    let numRooms = random.int(this.config.minRooms, this.config.maxRooms);
    let failedIterations = 0;
    let failedMax = 5;

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
        }

        if (failedIterations > failedMax) {
          roomGeneration = false;
        }

        let door = addDoor(r, r2);

        dungeon.doors.push(door);
        dungeon.tiles = addDoorToTiles(door, dungeon.tiles);
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
