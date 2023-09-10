import type Edge from "$lib/geometry/edge.js";
import * as Geometry from "$lib/geometry/geometry.js";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import type Door from "./door.js";
import type Dungeon from "./dungeon.js";
import Lock from "./lock.js";
import type RoomFeature from "./rooms/features/feature.js";
import type Room from "./rooms/room.js";
import * as Rooms from "./rooms/rooms.js";
import * as Tiles from "./tiles.js";

export function addDoor(room1: Room, room2: Room): Door {
  let door: Door = {
    room1: -1,
    room2: -1,
    vertex: { x: 0, y: 0 },
    tile: 0,
    lock: null,
    isSecret: false,
    description: "",
  };
  let possibleEdges = [];

  for (let i = 0; i < room1.vertices.length; i++) {
    for (let j = 0; j < room2.vertices.length; j++) {
      let nD = Geometry.distance(room1.vertices[i], room2.vertices[j]);
      if (nD == 2) {
        let a = room1.vertices[i];
        let b = room2.vertices[j];
        possibleEdges.push({ a, b });
      }
    }
  }

  let e: Edge = RND.item(possibleEdges);
  door.vertex = Geometry.getMidpoint(e);

  if (Geometry.getSlope(e) === 0) {
    door.tile = Tiles.H_DOOR;
  } else {
    door.tile = Tiles.V_DOOR;
  }

  if (RND.simple(100) > 90) {
    door.lock = new Lock();
    door.lock.id = RND.randomString(24);
  } else if (RND.simple(100) > 90) {
    door.isSecret = true;
    if (door.tile == Tiles.H_DOOR) {
      door.tile = Tiles.H_S_DOOR;
    } else {
      door.tile = Tiles.V_S_DOOR;
    }
  }

  door.room1 = room1.id;
  door.room2 = room2.id;

  let doorQuality = RND.item([
    RND.item(["rough", "decaying", "rotted"]),
    "simple",
    "plain",
    RND.item([
      "iron-trimmed",
      "copper-trimmed",
      "silver-trimmed",
      "gold-trimmed",
      "painted",
      "carved",
      "ornate",
    ]),
  ]);

  door.description = Words.article(doorQuality) + " " + doorQuality + " door";

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
          (door.room1 == dungeon.rooms[i].id && door.room2 == neighbors[j].id)
          || (door.room2 == dungeon.rooms[i].id && door.room1 == neighbors[j].id)
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

    let description1 = getDoorDescription(door, dungeon.rooms[i]);
    let description2 = getDoorDescription(door, dungeon.rooms[r2.id]);

    let secret1 = "";
    let secret2 = "";

    if (door.isSecret) {
      let hiddenText = RND.item([
        `${RND.item(["It is", "It's"])} hidden behind a tapestry.`,
        `${
          RND.item([
            "It is",
            "It's",
          ])
        } practically undetectable except for a thin seam visible only on close inspection.`,
        `A tapestry obscures it.`,
        `It cannot be opened from this side.`,
        `A pile of ${RND.item(["refuse", "debris", "trash"])} obscures it.`,
      ]);
      if (RND.simple(100) > 50) {
        secret2 = `${description2} ${hiddenText}`;
        description2 = "";
      } else {
        secret1 = `${description1} ${hiddenText}`;
        description1 = "";
      }
      dungeon.rooms[i].secrets += secret1;
      dungeon.rooms[r2.id].secrets += secret2;
    }

    let door1feature: RoomFeature = { name: "door", description: description1, secret: secret1, isContainer: false };
    let door2feature: RoomFeature = { name: "door", description: description2, secret: secret2, isContainer: false };

    dungeon.rooms[i].features.push(door1feature);
    dungeon.rooms[r2.id].doors.push(di);
    dungeon.rooms[r2.id].features.push(door2feature);

    dungeon.tiles = addDoorToTiles(door, dungeon.tiles);
  }

  return dungeon;
}

export function addDoorToTiles(door: Door, tiles: number[][]): number[][] {
  tiles[door.vertex.y][door.vertex.x] = door.tile;

  return tiles;
}

export function getDoorDescription(door: Door, room: Room): string {
  let dir = "";

  if (door.tile == Tiles.V_DOOR) {
    if (door.vertex.y > room.center.y) {
      if (door.vertex.x < room.center.x) {
        dir = "southwest";
      } else if (door.vertex.x > room.center.x) {
        dir = "southeast";
      } else {
        dir = "south";
      }
    } else {
      if (door.vertex.x < room.center.x) {
        dir = "northwest";
      } else if (door.vertex.x > room.center.x) {
        dir = "northeast";
      } else {
        dir = "north";
      }
    }
  } else {
    if (door.vertex.x < room.center.x) {
      if (door.vertex.y > room.center.y) {
        dir = "southwest";
      } else if (door.vertex.y < room.center.y) {
        dir = "northwest";
      } else {
        dir = "west";
      }
    } else {
      if (door.vertex.y > room.center.y) {
        dir = "southeast";
      } else if (door.vertex.y < room.center.y) {
        dir = "northeast";
      } else {
        dir = "east";
      }
    }
  }

  let description = RND.item([
    `There's ${door.description} in the ${dir}`,
    `There is ${door.description} in the ${dir}`,
    Words.capitalize(door.description) + ` lies in the ${dir}`,
    Words.capitalize(door.description) + ` is in the ${dir}`,
  ]);

  if (door.lock != null) {
    description += ". It is locked.";
  } else {
    description += ".";
  }

  return description;
}
