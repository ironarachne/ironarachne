"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import Vertex from "../../geometry/vertex.js";
import Room from "./room.js";
import RoomGeneratorConfig from "./roomgeneratorconfig.js";

export default class RoomGenerator {
  config: RoomGeneratorConfig;

  constructor(config: RoomGeneratorConfig) {
    this.config = config;
  }

  generate(): Room {
    let width = random.int(this.config.theme.minWidth, this.config.theme.maxWidth);
    let height = random.int(this.config.theme.minHeight, this.config.theme.maxHeight);
    let x = random.int(2, this.config.mapWidth - width - 3);
    let y = random.int(2, this.config.mapHeight - height - 3);

    let room = new Room();
    room.name = this.config.theme.name; // TODO: maybe make this a name generator
    room.theme = this.config.theme;

    let shape = RND.item(this.config.theme.shapes);

    if (shape == "rectangular") {
      room = getRectangularRoom(x, y, width, height, room);
      room.description = RND.item([
        `This rectangular room is ${width * 5}' wide and ${height * 5}' long.`,
        `This ${room.name} is ${width * 5}' wide and ${height * 5}' long.`,
      ]);
    } else if (shape == "square") {
      room = getSquareRoom(x, y, width, room);
      room.description = RND.item([
        `This square room is ${width * 5}' wide and ${height * 5}' long.`,
        `This room is a square ${width * 5}' wide and ${height * 5}' long.`,
        `This ${room.name} is ${width * 5}' wide and ${height * 5}' long.`,
      ]);
    } else if (shape == "cavern") {
      room = getCavernRoom(x, y, width, height, room);
      room.description = RND.item([`This is a cavern.`]);
    } else if (shape == "corridor") {
      room = getCorridor(x, y, width, height, room);
      room.description = RND.item([`This is a corridor.`]);
    }

    if (RND.simple(100) > 70) {
      let flooring = RND.item(room.theme.flooringOptions);
      room.description += RND.item([
        ` The floor is ${flooring}.`,
        ` ${Words.capitalize(flooring)} flooring is cracked in places.`,
        ` The ${flooring} flooring is cracked in places.`,
        ` The ${flooring} flooring is broken in places.`,
      ]);
    }

    for (let i = 0; i < this.config.theme.featureGenerators.length; i++) {
      let feature = this.config.theme.featureGenerators[i].generate();
      room.features.push(feature);
      if (feature.secret != "") {
        room.secrets += feature.secret + " ";
      }
    }

    if (this.config.theme.dressingGenerators.length > 0 && RND.simple(100) > 70) {
      let dGen = RND.item(this.config.theme.dressingGenerators);
      room.features.push(dGen.generate());
    }

    room.minX = x;
    room.maxX = room.getMaxX();
    room.minY = y;
    room.maxY = room.getMaxY();
    room.center = room.getCenter();
    room.calculateTiles(this.config.mapWidth, this.config.mapHeight);

    return room;
  }
}

// TODO: Use a different algorithm for generating caverns
function getCavernRoom(ox: number, oy: number, width: number, height: number, room: Room): Room {
  // in this instance, we're using x,y as the top left corner of a bounding box
  let start = new Vertex(Math.floor((ox + width) / 2), Math.floor((oy + height) / 2));
  let steps = 20;

  const maxX = ox + width;
  const maxY = oy + height;

  room.vertices.push(start);

  let v = new Vertex(start.x, start.y);

  for (let i = 0; i < steps; i++) {
    let x = v.x;
    let y = v.y;

    if (RND.simple(100) > 50) {
      let mx = random.int(-1, 1);
      x += mx;

      if (x > maxX) {
        x = maxX;
      } else if (x < ox) {
        x = ox;
      }
    } else {
      let my = random.int(-1, 1);
      y += my;

      if (y > maxY) {
        y = maxY;
      } else if (y < oy) {
        y = oy;
      }
    }

    let nv = new Vertex(x, y);
    let alreadyThere = false;
    for (let j = 0; j < room.vertices.length; j++) {
      if (room.vertices[j].equals(nv)) {
        alreadyThere = true;
        break;
      }
    }
    if (!alreadyThere) {
      room.vertices.push(nv);
    }

    v.x = x;
    v.y = y;
  }

  return room;
}

// TODO: Get rid of most dead ends, or try connecting directly to two other rooms
function getCorridor(x: number, y: number, width: number, height: number, room: Room): Room {
  let length = random.int(Math.max(3, Math.floor((width + height - 2) / 2)), width + height - 2);

  let nx = random.int(x, x + width - 1);
  let ny = random.int(y, y + height - 1);

  room.vertices.push(new Vertex(nx, ny));

  let direction = RND.item([
    new Vertex(-1, 0),
    new Vertex(1, 0),
    new Vertex(0, -1),
    new Vertex(0, 1),
  ]);

  for (let i = 0; i < length; i++) {
    let mx = nx + direction.x;
    let my = ny + direction.y;

    if (mx >= width + x || mx <= x) {
      direction.x = 0;
      direction.y = RND.item([-1, 1]);
    } else if (my >= height + y || my <= y) {
      direction.y = 0;
      direction.x = RND.item([-1, 1]);
    } else {
      nx = mx;
      ny = my;

      let nv = new Vertex(nx, ny);

      if (nv.in(room.vertices)) {
        continue;
      }

      room.vertices.push(nv);

      if (RND.simple(100) > 90) {
        if (direction.y != 0) {
          direction.x = direction.y;
          direction.y = 0;
        } else {
          direction.y = direction.x;
          direction.x = 0;
        }
      }
    }
  }

  return room;
}

function getRectangularRoom(x: number, y: number, width: number, height: number, room: Room): Room {
  for (let i = y; i < y + height; i++) {
    for (let j = x; j < x + width; j++) {
      room.vertices.push(new Vertex(j, i));
    }
  }

  room.description = `This room is ${(width + 1) * 5}' wide and ${(height + 1) * 5}' long.`;

  return room;
}

function getSquareRoom(x: number, y: number, size: number, room: Room): Room {
  for (let i = y; i < y + size; i++) {
    for (let j = x; j < x + size; j++) {
      room.vertices.push(new Vertex(j, i));
    }
  }

  room.description = `This square room is ${(size + 1) * 5}' wide and ${(size + 1) * 5}' long.`;

  return room;
}
