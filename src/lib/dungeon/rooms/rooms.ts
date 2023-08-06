"use strict";

import * as Geometry from "../../geometry/geometry.js";
import Room from "./room.js";
import RoomGenerator from "./roomgenerator.js";
import RoomGeneratorConfig from "./roomgeneratorconfig.js";
import RoomTheme from "./themes/theme.js";

export function distanceToNearestOtherRoomTile(room: Room, rooms: Room[]): number {
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

// TODO: make this more performant
export function doesRoomCollide(room: Room, rooms: Room[]): boolean {
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

export function doesRoomTouch(room: Room, rooms: Room[]): boolean {
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

export function getNearestRoom(room: Room, rooms: Room[]): Room {
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

// Get all rooms that have a tile exactly two spaces away from a tile in this room
export function getNeighboringRooms(room: Room, rooms: Room[]): Room[] {
  let result = [];
  let ids: number[] = [];

  for (let i = 0; i < rooms.length; i++) {
    // for each other room...
    for (let j = 0; j < room.vertices.length; j++) {
      // go through this room's tiles...
      for (let k = 0; k < rooms[i].vertices.length; k++) {
        // and check the distance from it to each tile in the other room
        let d = Geometry.distance(rooms[i].vertices[k], room.vertices[j]);
        // if it's 2 tiles away, add the room to the result if it's not the compared room and it's not already in the results
        if (d <= 2 && !ids.includes(rooms[i].id) && rooms[i].id != room.id) {
          ids.push(rooms[i].id);
          result.push(rooms[i]);
          break;
        }
      }
    }
  }

  return result;
}

export function getPlaceableRoom(
  mapWidth: number,
  mapHeight: number,
  theme: RoomTheme,
  rooms: Room[],
): Room | null {
  let generation = true;
  let maxX = mapWidth - 3;
  let maxY = mapHeight - 3;
  let roomGenConfig = new RoomGeneratorConfig(mapWidth, mapHeight, theme);
  let roomGen = new RoomGenerator(roomGenConfig);
  let room = roomGen.generate();
  let roomAttempts = 0;
  let roomAttemptLimit = 5;
  let nx = room.minX + 1;
  let ny = room.minY;

  while (generation) {
    if (
      !doesRoomCollide(room, rooms)
      && !doesRoomTouch(room, rooms)
      && isRoomInRange(2, room, rooms)
    ) {
      generation = false;
    } else if (roomAttempts <= roomAttemptLimit) {
      nx += 1;

      if (nx > maxX - room.getWidth()) {
        nx = 2;
        ny++;
        if (ny > maxY - room.getHeight()) {
          roomAttempts++;
          nx = 2;
          ny = 2;
          continue;
        }
      }

      room.moveTo(nx, ny, mapWidth, mapHeight);
    } else if (roomAttempts > roomAttemptLimit) {
      return null;
    } else {
      roomAttempts++;
      room = roomGen.generate();
      nx = room.minX + 1;
      ny = room.minY;
    }
  }

  return room;
}

export function isRoomInRange(range: number, room: Room, rooms: Room[]): boolean {
  if (distanceToNearestOtherRoomTile(room, rooms) == range) {
    return true;
  }

  return false;
}
