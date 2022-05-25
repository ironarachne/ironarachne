"use strict";

import random from "random";
import Edge from "../geometry/edge";
import Polygon from "../geometry/polygon";
import Vertex from "../geometry/vertex";
import * as RND from "../random";
import Door from "./door";
import Dungeon from "./dungeon";
import DungeonGeneratorConfig from "./dungeongeneratorconfig";
import Room from "./room";

export default class DungeonGenerator {
  config: DungeonGeneratorConfig;

  constructor(config: DungeonGeneratorConfig) {
    this.config = config;
  }

  generate(): Dungeon {
    let dungeon = new Dungeon();
    dungeon.biome = RND.item(this.config.possibleBiomes);
    dungeon.values = initializeValueMap(this.config.width, this.config.height);

    let firstRoom = getRandomRoom(
      this.config.width,
      this.config.height,
      this.config.maxRoomWidth,
      this.config.maxRoomHeight,
    );
    firstRoom.id = 0;
    firstRoom.features.push("There is a set of stairs leading up to the surface here.");
    let id = 0;

    dungeon.rooms.push(firstRoom);
    dungeon.values = addRoomToValueMap(firstRoom, dungeon.values);

    let roomGeneration = true;
    let numRooms = random.int(this.config.minRooms, this.config.maxRooms);

    while (roomGeneration) {
      if (dungeon.rooms.length >= numRooms) {
        roomGeneration = false;
      } else {
        let r = getPlaceableRoom(
          getRandomRoom(this.config.width, this.config.height, this.config.maxRoomWidth, this.config.maxRoomHeight),
          dungeon.values,
        );
        id += 1;
        r.id = id;
        let neighbors = getAdjacentRooms(r, dungeon.rooms);
        dungeon.rooms.push(r);
        dungeon.values = addRoomToValueMap(r, dungeon.values);

        let door = addDoor(r, RND.item(neighbors));
        dungeon.doors.push(door);
      }
    }

    return dungeon;
  }
}

function addDoor(room1: Room, room2: Room): Door {
  let sharedEdges = getSharedEdges(room1, room2);

  if (sharedEdges.length == 0) {
    console.error("Two adjacent rooms have no shared edges");
    return;
  }

  let edge = RND.item(sharedEdges);

  let door = new Door();
  door.room1 = room1.id;
  door.room2 = room2.id;
  door.edge = edge;

  if (room1.id != 0 && room2.id != 0) {
    if (RND.chance(100) > 80) {
      door.isLocked = true;
    } else if (RND.chance(100) > 90) {
      door.isSecret = true;
    }
  }

  return door;
}

function addRoomToValueMap(room: Room, valueMap: number[][]): number[][] {
  let minY = room.getMinY();
  let minX = room.getMinX();
  let maxY = room.getMaxY();
  let maxX = room.getMaxX();

  for (let i = minY; i < maxY; i++) {
    for (let j = minX; j < maxX; j++) {
      valueMap[i][j] = 1;
    }
  }

  return valueMap;
}

function doRoomsTouch(room1: Room, room2: Room): boolean {
  let r1 = room1.getTileEdges();
  let r2 = room2.getTileEdges();

  for (let i = 0; i < r1.length; i++) {
    for (let j = 0; j < r2.length; j++) {
      if (r1[i].equals(r2[j])) {
        return true;
      }
    }
  }

  return false;
}

function getAdjacentRooms(room: Room, rooms: Room[]): Room[] {
  let result = [];

  for (let i = 0; i < rooms.length; i++) {
    if (doRoomsTouch(room, rooms[i])) {
      result.push(rooms[i]);
    }
  }

  return result;
}

function getDoorsForRoom(roomId: number, doors: Door[]): Door[] {
  let result = [];

  for (let i = 0; i < doors.length; i++) {
    if (doors[i].room1 == roomId || doors[i].room2 == roomId) {
      result.push(doors[i]);
    }
  }

  return doors;
}

function getPlaceableRoom(room: Room, valueMap: number[][]): Room {
  let generation = true;

  while (generation) {
    if (!doesRoomCollide(room, valueMap) && doesRoomTouch(room, valueMap)) {
      generation = false;
    } else {
      let minYAdj = room.getMinY() == 0 ? 0 : -1;
      let minXAdj = room.getMinX() == 0 ? 0 : -1;
      let maxYAdj = room.getMaxY() == valueMap.length ? 0 : 1;
      let maxXAdj = room.getMaxX() == valueMap[0].length ? 0 : 1;

      room.move(random.int(minYAdj, maxYAdj), random.int(minXAdj, maxXAdj));
    }
  }

  return room;
}

function getSharedEdges(room1: Room, room2: Room): Edge[] {
  let edges = [];

  let r1 = room1.getTileEdges();
  let r2 = room2.getTileEdges();

  for (let i = 0; i < r1.length; i++) {
    for (let j = 0; j < r2.length; j++) {
      if (r1[i].equals(r2[j])) {
        edges.push(r1[i]);
      }
    }
  }

  return edges;
}

function doesRoomCollide(room: Room, valueMap: number[][]): boolean {
  let rV = getRoomValues(room, valueMap);

  for (let y = 0; y < valueMap.length; y++) {
    for (let x = 0; x < valueMap[0].length; x++) {
      if (valueMap[y][x] == 1 && rV[y][x] == 1) {
        return true;
      }
    }
  }

  return false;
}

function doesRoomTouch(room: Room, valueMap: number[][]): boolean {
  let rV = getRoomValues(room, valueMap);

  for (let y = 0; y < valueMap.length; y++) {
    for (let x = 0; x < valueMap[0].length; x++) {
      if (y > 0 && valueMap[y - 1][x] == 1 && rV[y][x] == 1) {
        return true;
      } else if (y < valueMap.length - 1 && valueMap[y + 1][x] == 1 && rV[y][x] == 1) {
        return true;
      } else if (x > 0 && valueMap[y][x - 1] == 1 && rV[y][x] == 1) {
        return true;
      } else if (x < valueMap[0].length - 1 && valueMap[y][x + 1] == 1 && rV[y][x] == 1) {
        return true;
      }
    }
  }

  return false;
}

function getRoomValues(room: Room, valueMap: number[][]): number[][] {
  let n = initializeValueMap(valueMap[0].length, valueMap.length);

  let minY = room.getMinY();
  let minX = room.getMinX();
  let maxY = room.getMaxY();
  let maxX = room.getMaxX();

  for (let i = minY; i < maxY; i++) {
    for (let j = minX; j < maxX; j++) {
      n[i][j] = 1;
    }
  }

  return n;
}

function getRandomRoom(mapWidth: number, mapHeight: number, maxWidth: number, maxHeight: number): Room {
  let width = random.int(2, maxWidth);
  let height = random.int(2, maxHeight);

  let x = random.int(width, mapWidth - width);
  let y = random.int(height, mapHeight - height);

  let room = new Room();
  room.shape = new Polygon();
  room.shape.vertices = [
    new Vertex(x, y),
    new Vertex(x + width, y),
    new Vertex(x + width, y + height),
    new Vertex(x, y + height),
  ];
  room.shape.edges = room.shape.edgesFromVertices();
  room.center = room.getCenter();
  room.calculateTileMesh();

  return room;
}

function initializeValueMap(width: number, height: number): number[][] {
  let v = [];

  for (let y = 0; y < height; y++) {
    v[y] = [];
    for (let x = 0; x < width; x++) {
      v[y][x] = 0;
    }
  }

  return v;
}
