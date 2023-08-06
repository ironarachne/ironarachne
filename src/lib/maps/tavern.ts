"use strict";

import * as RND from "@ironarachne/rng";
import random from "random";

export class Vertex {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Edge {
  A: Vertex;
  B: Vertex;

  constructor(A: Vertex, B: Vertex) {
    this.A = A;
    this.B = B;
  }
}

export class Door {
  x: number;
  y: number;
  orientation: string;

  constructor(x: number, y: number, orientation: string) {
    this.x = x;
    this.y = y;
    this.orientation = orientation;
  }
}

export class Room {
  name: string;
  center: Vertex;
  vertices: Vertex[];
  width: number;
  height: number;
  edges: Edge[];
  doors: Door[];
  floor: number;
  type: string;

  constructor(center: Vertex, width: number, height: number, roomType: string) {
    this.center = center;
    this.vertices = [];
    this.width = width;
    this.height = height;
    this.edges = [];
    this.doors = [];
    this.floor = 0;
    this.type = roomType;
    this.name = "";
  }
}

export class TavernMap {
  rooms: Room[];
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.rooms = [];
    this.width = width;
    this.height = height;
  }
}

export function generate() {
  const tavernMap = generateMap(40, 30);

  return renderMap(tavernMap);
}

function generateMap(width: number, height: number) {
  const map = new TavernMap(width, height);

  const center = new Vertex(Math.floor(width / 2), Math.floor(height / 2));

  const mainRoom = new Room(center, random.int(12, 15), random.int(12, 15), "main");

  const halfWidth = mainRoom.width / 2;
  const halfHeight = mainRoom.height / 2;

  if (mainRoom.width % 2 != 0) {
    mainRoom.center.x -= 0.5;
  }

  if (mainRoom.height % 2 != 0) {
    mainRoom.center.y -= 0.5;
  }

  mainRoom.vertices = [
    new Vertex(mainRoom.center.x - halfWidth, mainRoom.center.y - halfHeight),
    new Vertex(mainRoom.center.x + halfWidth, mainRoom.center.y - halfHeight),
    new Vertex(mainRoom.center.x + halfWidth, mainRoom.center.y + halfHeight),
    new Vertex(mainRoom.center.x - halfWidth, mainRoom.center.y + halfHeight),
  ];

  mainRoom.edges.push(new Edge(mainRoom.vertices[0], mainRoom.vertices[1]));
  mainRoom.edges.push(new Edge(mainRoom.vertices[1], mainRoom.vertices[2]));
  mainRoom.edges.push(new Edge(mainRoom.vertices[2], mainRoom.vertices[3]));
  mainRoom.edges.push(new Edge(mainRoom.vertices[3], mainRoom.vertices[0]));

  const doorEdge = RND.item(mainRoom.edges);

  let doorX = 0;
  let doorY = 0;
  let doorOrientation = "vertical";

  if (doorEdge.A.x == doorEdge.B.x) {
    doorX = doorEdge.A.x;
  } else {
    const min = Math.min(doorEdge.A.x, doorEdge.B.x) + 1;
    const max = Math.max(doorEdge.A.x, doorEdge.B.x) - 2;

    doorX = random.int(min, max) + 0.5;
    doorOrientation = "horizontal";
  }

  if (doorEdge.A.y == doorEdge.B.y) {
    doorY = doorEdge.A.y;
  } else {
    const min = Math.min(doorEdge.A.y, doorEdge.B.y) + 1;
    const max = Math.max(doorEdge.A.y, doorEdge.B.y) - 2;

    doorY = random.int(min, max) + 0.5;
  }

  mainRoom.doors.push({
    x: doorX,
    y: doorY,
    orientation: doorOrientation,
  });

  map.rooms.push(mainRoom);

  // TODO: Add the bar to the main room
  // TODO: Add tables and chairs/benches to the main room
  // TODO: Add a fireplace to the main room

  // TODO: Optionally add a staircase to the main room and a second floor
  // TODO: Add a kitchen
  // TODO: Add a wine cellar and stairs going down to it
  // TODO: Add doors to other rooms

  map.rooms = addRoom(map.rooms);

  return map;
}

function addRoom(rooms: Room[]) {
  const roomType = RND.item(getPossibleRoomTypes(rooms));

  const newRooms = [];

  for (let i = 0; i < rooms.length; i++) {
    newRooms.push(rooms[i]);
  }

  const newRoom = new Room(
    random.int(roomType.widthMin, roomType.widthMax),
    random.int(roomType.heightMin, roomType.heightMax),
    random.int(roomType.floorMin, roomType.floorMax),
    roomType.name,
  );

  newRooms.push(newRoom);

  return newRooms;
}

function getAllRoomTypes() {
  return [
    {
      name: "kitchen",
      heightMin: 3,
      heightMax: 5,
      widthMin: 3,
      widthMax: 5,
      floorMin: 0,
      floorMax: 0,
    },
    {
      name: "wine cellar",
      heightMin: 3,
      heightMax: 5,
      widthMin: 3,
      widthMax: 5,
      floorMin: -1,
      floorMax: -1,
    },
  ];
}

function getPossibleRoomTypes(existingRooms: Room[]) {
  const possibleTypes = getAllRoomTypes();

  const result = [];

  for (let i = 0; i < possibleTypes.length; i++) {
    let found = false;
    for (let j = 0; j < existingRooms.length; j++) {
      if (existingRooms[j].name == possibleTypes[i].name) {
        found = true;
      }
    }
    if (!found) {
      result.push(possibleTypes[i]);
    }
  }

  return result;
}

function renderMap(map: TavernMap) {
  const imageHeight = 600;
  const imageWidth = 800;

  const gridSize = imageHeight / map.height;

  let svg = "<svg width=\""
    + imageWidth
    + "\" height=\""
    + imageHeight
    + "\" viewBox=\"0 0 "
    + imageWidth
    + " "
    + imageHeight
    + "\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">";

  svg += "<defs>";

  svg += "<pattern id=\"grid\" width=\""
    + gridSize
    + "\" height=\""
    + gridSize
    + "\" patternUnits=\"userSpaceOnUse\">";
  svg += "<rect width=\""
    + gridSize
    + "\" height=\""
    + gridSize
    + "\" fill=\"none\" stroke=\"gray\" stroke-width=\"1\"/>";
  svg += "</pattern>";

  svg += "</defs>";

  svg += "<rect x=\"0\" y=\"0\" width=\""
    + imageWidth
    + "\" height=\""
    + imageHeight
    + "\" fill=\"url(#grid)\" stroke=\"black\" stroke-width=\"3\" />";

  const doors = [];

  for (let i = 0; i < map.rooms.length; i++) {
    const topX = map.rooms[i].center.x - map.rooms[i].width / 2;
    const topY = map.rooms[i].center.y - map.rooms[i].height / 2;
    const roomWidth = map.rooms[i].width * gridSize;
    const roomHeight = map.rooms[i].height * gridSize;

    let roomSVG = "<rect x=\""
      + topX * gridSize
      + "\" y=\""
      + topY * gridSize
      + "\" width=\""
      + roomWidth
      + "\" height=\""
      + roomHeight
      + "\"";

    roomSVG += " stroke=\"black\" fill=\"none\" stroke-width=\"2\" />";

    for (let j = 0; j < map.rooms[i].doors.length; j++) {
      doors.push(map.rooms[i].doors[j]);
    }

    svg += roomSVG;
  }

  const doorThickness = gridSize / 3;
  const doorLength = gridSize;

  for (let i = 0; i < doors.length; i++) {
    let doorTopLeftX = 0;
    let doorTopLeftY = 0;
    let doorWidth = 0;
    let doorHeight = 0;

    if (doors[i].orientation == "vertical") {
      doorTopLeftX = doors[i].x * gridSize - doorThickness / 2;
      doorTopLeftY = doors[i].y * gridSize - doorLength / 2;
      doorWidth = doorThickness;
      doorHeight = doorLength;
    } else {
      doorTopLeftX = doors[i].x * gridSize - doorLength / 2;
      doorTopLeftY = doors[i].y * gridSize - doorThickness / 2;
      doorWidth = doorLength;
      doorHeight = doorThickness;
    }

    const doorSVG = "<rect x=\""
      + doorTopLeftX
      + "\" y=\""
      + doorTopLeftY
      + "\" width=\""
      + doorWidth
      + "\" height=\""
      + doorHeight
      + "\" stroke=\"black\" fill=\"white\" />";

    svg += doorSVG;
  }

  svg += "</svg>";

  return svg;
}
