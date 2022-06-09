'use strict';

import Room from './room';
import * as Geometry from '../geometry/geometry';
import random from 'random';
import Vertex from '../geometry/vertex';

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

export function generateRoom(
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

export function getPlaceableRoom(
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
  let ids = [];

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

export function isRoomInRange(range: number, room: Room, rooms: Room[]): boolean {
  if (distanceToNearestOtherRoomTile(room, rooms) == range) {
    return true;
  }

  return false;
}
