'use strict';

import Door from './door';
import Room from './rooms/room';
import * as Geometry from '../geometry/geometry';
import * as RND from '../random';
import * as Rooms from './rooms/rooms';
import * as Tiles from './tiles';
import * as Words from '../words';
import Edge from '../geometry/edge';
import Dungeon from './dungeon';
import RoomFeature from './rooms/features/feature';
import Lock from './lock';

export function addDoor(room1: Room, room2: Room): Door {
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
    door.lock = new Lock();
    door.lock.id = RND.randomString(24);
  } else if (RND.chance(100) > 90) {
    door.isSecret = true;
  }

  door.room1 = room1.id;
  door.room2 = room2.id;

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

  return door;
}

export function addDoorsToDungeon(dungeon: Dungeon): Dungeon {
  for (let i = 0; i < dungeon.rooms.length; i++) {
    let neighbors = Rooms.getNeighboringRooms(dungeon.rooms[i], dungeon.rooms);
    let viable = [];

    for (let j = 0; j < neighbors.length; j++) {
      let existingDoor = false;
      for (let k = 0; k < dungeon.rooms[i].doors.length; k++) {
        let door = dungeon.doors[dungeon.rooms[i].doors[k]];
        if (
          (door.room1 == dungeon.rooms[i].id && door.room2 == neighbors[j].id) ||
          (door.room2 == dungeon.rooms[i].id && door.room1 == neighbors[j].id)
        ) {
          existingDoor = true;
        }
      }
      if (!existingDoor) {
        viable.push(neighbors[j]);
      }
    }

    if (viable.length == 0) {
      continue;
    }

    let r2 = RND.item(viable);
    let door = addDoor(dungeon.rooms[i], r2);

    if (r2.id == 0) {
      door.isSecret = false;
      if (dungeon.rooms[0].doors.length < 2) {
        door.lock = null;
      }
    }

    dungeon.doors.push(door);
    let di = dungeon.doors.length - 1;
    dungeon.rooms[i].doors.push(di);

    dungeon.rooms[i].features.push(
      new RoomFeature('door', getDoorDescription(door, dungeon.rooms[i]), false),
    );
    dungeon.rooms[r2.id].doors.push(di);
    dungeon.rooms[r2.id].features.push(
      new RoomFeature('door', getDoorDescription(door, dungeon.rooms[r2.id]), false),
    );

    dungeon.tiles = addDoorToTiles(door, dungeon.tiles);
  }

  return dungeon;
}

export function addDoorToTiles(door: Door, tiles: number[][]): number[][] {
  tiles[door.vertex.y][door.vertex.x] = door.tile;

  return tiles;
}

export function getDoorDescription(door: Door, room: Room): string {
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

  if (door.lock != null) {
    description += '. It is locked.';
  } else if (door.isSecret) {
    description += ', but it is hidden.';
  } else {
    description += '.';
  }

  return description;
}
