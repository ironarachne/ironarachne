import type * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import * as Geometry from '$lib/geometry/geometry.js';
import type Vertex from '$lib/geometry/vertex.js';
import Room from './room.js';
import type RoomGeneratorConfig from './roomgeneratorconfig.js';

export default class RoomGenerator {
  config: RoomGeneratorConfig;

  constructor(config: RoomGeneratorConfig) {
    this.config = config;
  }

  generate(): Room {
    let width = this.config.rng.int(this.config.theme.minWidth, this.config.theme.maxWidth);
    let height = this.config.rng.int(this.config.theme.minHeight, this.config.theme.maxHeight);
    let x = this.config.rng.int(2, this.config.mapWidth - width - 3);
    let y = this.config.rng.int(2, this.config.mapHeight - height - 3);

    let room = new Room();
    room.name = this.config.theme.name; // TODO: maybe make this a name generator
    room.theme = this.config.theme;

    let shape = this.config.rng.item(this.config.theme.shapes);

    if (shape === 'rectangular') {
      room = getRectangularRoom(x, y, width, height, room);
      room.description = this.config.rng.item([
        `This rectangular room is ${width * 5}' wide and ${height * 5}' long.`,
        `This ${room.name} is ${width * 5}' wide and ${height * 5}' long.`,
      ]);
    } else if (shape === 'square') {
      room = getSquareRoom(x, y, width, room);
      room.description = this.config.rng.item([
        `This square room is ${width * 5}' wide and ${height * 5}' long.`,
        `This room is a square ${width * 5}' wide and ${height * 5}' long.`,
        `This ${room.name} is ${width * 5}' wide and ${height * 5}' long.`,
      ]);
    } else if (shape === 'cavern') {
      room = getCavernRoom(x, y, width, height, room, this.config.rng);
      room.description = this.config.rng.item(['This is a cavern.']);
    } else if (shape === 'corridor') {
      room = getCorridor(x, y, width, height, room, this.config.rng);
      room.description = this.config.rng.item(['This is a corridor.']);
    }

    if (this.config.rng.int(1, 100) > 70) {
      let flooring = this.config.rng.item(room.theme.flooringOptions);
      room.description += this.config.rng.item([
        ` The floor is ${flooring}.`,
        ` ${Words.capitalize(flooring)} flooring is cracked in places.`,
        ` The ${flooring} flooring is cracked in places.`,
        ` The ${flooring} flooring is broken in places.`,
      ]);
    }

    for (let i = 0; i < this.config.theme.featureGenerators.length; i++) {
      let feature = this.config.theme.featureGenerators[i].generate();
      room.features.push(feature);
      if (feature.secret !== '') {
        room.secrets += `${feature.secret} `;
      }
    }

    if (this.config.theme.dressingGenerators.length > 0 && this.config.rng.int(1, 100) > 70) {
      let dGen = this.config.rng.item(this.config.theme.dressingGenerators);
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
function getCavernRoom(
  ox: number,
  oy: number,
  width: number,
  height: number,
  room: Room,
  rng: RNG.RNG,
): Room {
  // in this instance, we're using x,y as the top left corner of a bounding box
  let start: Vertex = {
    x: Math.floor((ox + width) / 2),
    y: Math.floor((oy + height) / 2),
  };
  let steps = 20;

  const maxX = ox + width;
  const maxY = oy + height;

  room.vertices.push(start);

  let v: Vertex = { x: start.x, y: start.y };

  for (let i = 0; i < steps; i++) {
    let x = v.x;
    let y = v.y;

    if (rng.int(1, 100) > 50) {
      let mx = rng.int(-1, 1);
      x += mx;

      if (x > maxX) {
        x = maxX;
      } else if (x < ox) {
        x = ox;
      }
    } else {
      let my = rng.int(-1, 1);
      y += my;

      if (y > maxY) {
        y = maxY;
      } else if (y < oy) {
        y = oy;
      }
    }

    let nv: Vertex = { x, y };
    let alreadyThere = false;
    for (let j = 0; j < room.vertices.length; j++) {
      if (Geometry.vertexEquals(room.vertices[j], nv)) {
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
function getCorridor(
  x: number,
  y: number,
  width: number,
  height: number,
  room: Room,
  rng: RNG.RNG,
): Room {
  let length = rng.int(Math.max(3, Math.floor((width + height - 2) / 2)), width + height - 2);

  let nx = rng.int(x, x + width - 1);
  let ny = rng.int(y, y + height - 1);

  room.vertices.push({ x: nx, y: ny });

  let direction = rng.item([
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
  ]);

  for (let i = 0; i < length; i++) {
    let mx = nx + direction.x;
    let my = ny + direction.y;

    if (mx >= width + x || mx <= x) {
      direction.x = 0;
      direction.y = rng.item([-1, 1]);
    } else if (my >= height + y || my <= y) {
      direction.y = 0;
      direction.x = rng.item([-1, 1]);
    } else {
      nx = mx;
      ny = my;

      let nv: Vertex = { x: nx, y: ny };

      if (Geometry.vertexIn(nv, room.vertices)) {
        continue;
      }

      room.vertices.push(nv);

      if (rng.int(1, 100) > 90) {
        if (direction.y !== 0) {
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
      room.vertices.push({ x: j, y: i });
    }
  }

  room.description = `This room is ${(width + 1) * 5}' wide and ${(height + 1) * 5}' long.`;

  return room;
}

function getSquareRoom(x: number, y: number, size: number, room: Room): Room {
  for (let i = y; i < y + size; i++) {
    for (let j = x; j < x + size; j++) {
      room.vertices.push({ x: j, y: i });
    }
  }

  room.description = `This square room is ${(size + 1) * 5}' wide and ${(size + 1) * 5}' long.`;

  return room;
}
