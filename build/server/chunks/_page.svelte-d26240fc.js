import { c as create_ssr_component, b as add_attribute, e as escape, f as each } from './ssr-93f4de0f.js';
import { v as valueToCoins } from './currency-50243ac8.js';
import * as RND from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import 'seedrandom';
import { d as getSkeletonVariants, e as getVampireVariants, f as getZombieVariants, g as generate$4, i as getTotalThreatLevel, s as sentient, w as withoutTag, r as randomTraits, c as all$1$1, j as withCreatureType, b as byTag$1, k as randomUniqueSet, l as byName$1 } from './characters-09ba8c89.js';
import { g as getFantasy } from './premade_configs-1e79c586.js';
import { r as randomWeighted, d as getSizeConfig } from './size_matrix-c7ee4cb4.js';
import random from 'random';
import './sentry-release-injection-file-2d896b4a.js';
import { a as all$k, g as generate$3, b as getDefaultConfig$2 } from './climates-0447e439.js';
import { a as all$l, b as all$4$1, w as withMaxQuality, c as withMinQuality, M as MeleeWeapon, d as byName$2, f as forCategory } from './patterns-b3654c87.js';
import * as MUN from '@ironarachne/made-up-names';
import { a as roll } from './dice-f7cfd218.js';

function generate$2(config) {
  let creatureSpecies = RND.weighted(config.speciesOptions);
  let creatureAgeCategory = randomWeighted(config.ageCategoryNames, creatureSpecies.ageCategories);
  let age = random.int(creatureAgeCategory.minAge, creatureAgeCategory.maxAge);
  const genderName = RND.item(config.genderNames);
  let gender = creatureSpecies.genders.find((g) => g.name === genderName);
  const sizeGeneratorConfig = getSizeConfig(
    gender.name,
    creatureAgeCategory.name,
    creatureSpecies.sizeGeneratorConfigMatrix
  );
  const height = random.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
  const weight = random.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);
  const length = random.int(sizeGeneratorConfig.minLength, sizeGeneratorConfig.maxLength);
  let physicalTraits = randomTraits(creatureSpecies);
  let behaviors = ["cautious", "hunting", "lethargic", "resting", "sleeping", "stalking"];
  let summary = RND.item(behaviors);
  let abilities = creatureSpecies.abilities;
  let threatLevel = creatureSpecies.baseThreatLevel;
  for (let i = 0; i < abilities.length; i++) {
    threatLevel += abilities[i].threatLevel;
  }
  let creature = {
    name: creatureSpecies.name,
    description: creatureSpecies.description,
    summary,
    statBlock: null,
    species: creatureSpecies,
    abilities,
    behaviors,
    threatLevel,
    physicalTraits,
    gender,
    height,
    weight,
    length,
    age,
    ageCategory: creatureAgeCategory,
    carried: [],
    tags: creatureSpecies.tags,
    creatureTypes: creatureSpecies.creatureTypes
  };
  return creature;
}
function newCreatureGeneratorConfig() {
  return {
    ageCategoryNames: ["adult"],
    genderNames: ["female", "male"],
    speciesOptions: []
  };
}
function generate$1(config) {
  let mobGroups = [];
  if (config.template === null) {
    throw new Error("EncounterGenerator requires a template.");
  }
  for (let i = 0; i < config.template.groupTemplates.length; i++) {
    let mobs = [];
    let t = config.template.groupTemplates[i];
    let amount = random.int(t.minNumber, t.maxNumber);
    let options = [];
    let unfilteredOptions = [];
    if (t.isSentient) {
      unfilteredOptions = JSON.parse(JSON.stringify(config.sentientOptions));
    } else {
      unfilteredOptions = JSON.parse(JSON.stringify(config.creatureOptions));
    }
    let tags = t.filter.withAllTags.concat(t.filter.withAnyTag);
    if (tags.includes("undead")) {
      let skeletonOptions = unfilteredOptions.concat(
        getSkeletonVariants(unfilteredOptions)
      );
      let vampireOptions = unfilteredOptions.concat(
        getVampireVariants(unfilteredOptions)
      );
      let zombieOptions = unfilteredOptions.concat(
        getZombieVariants(unfilteredOptions)
      );
      unfilteredOptions = unfilteredOptions.concat(skeletonOptions);
      unfilteredOptions = unfilteredOptions.concat(vampireOptions);
      unfilteredOptions = unfilteredOptions.concat(zombieOptions);
    } else if (tags.includes("skeleton")) {
      let skeletonOptions = unfilteredOptions.concat(
        getSkeletonVariants(unfilteredOptions)
      );
      unfilteredOptions = unfilteredOptions.concat(skeletonOptions);
    } else if (tags.includes("vampire")) {
      let vampireOptions = unfilteredOptions.concat(
        getVampireVariants(unfilteredOptions)
      );
      unfilteredOptions = unfilteredOptions.concat(vampireOptions);
    } else if (tags.includes("zombie")) {
      let zombieOptions = unfilteredOptions.concat(
        getZombieVariants(unfilteredOptions)
      );
      unfilteredOptions = unfilteredOptions.concat(zombieOptions);
    }
    options = t.filter.apply(unfilteredOptions);
    if (options.length === 0) {
      console.error(`No options for filter`, t.filter);
      console.debug(`Used options`, unfilteredOptions);
    }
    if (t.isSentient) {
      mobs = generateSentientMobs(options, t.archetypes, amount);
    } else {
      mobs = generateCreatureMobs(options, amount);
    }
    mobGroups.push({ name: t.name, mobs });
  }
  let threatLevel = 0;
  for (let i = 0; i < mobGroups.length; i++) {
    let group = mobGroups[i];
    for (let j = 0; j < group.mobs.length; j++) {
      threatLevel += group.mobs[j].threatLevel;
    }
  }
  return { groups: mobGroups, totalThreatLevel: threatLevel };
}
function generateCreatureMobs(creatureOptions, amount) {
  let creatureType = RND.item(creatureOptions);
  let creatures = [];
  let config = newCreatureGeneratorConfig();
  for (let i = 0; i < amount; i++) {
    config.speciesOptions = [creatureType];
    let creature = generate$2(config);
    creatures.push(creature);
  }
  return creatures;
}
function generateSentientMobs(speciesOptions, archetypes, amount) {
  let species = RND.item(speciesOptions);
  let characters = [];
  let charGenConfig = getFantasy();
  charGenConfig.speciesOptions = [species];
  for (let i = 0; i < amount; i++) {
    let c = generate$4(charGenConfig);
    c.archetype = RND.item(archetypes);
    c.abilities = c.abilities.concat(c.archetype.abilities);
    c.threatLevel = getTotalThreatLevel(c);
    c.summary = `${c.gender.name} ${c.species.adjective} ${c.archetype.name}`;
    for (let m = 0; m < c.archetype.itemGenerators.length; m++) {
      c.carried.push(c.archetype.itemGenerators[m].generate());
    }
    characters.push(c);
  }
  return characters;
}
function getDefaultConfig$1() {
  return {
    isHostile: true,
    environment: "forest",
    template: null,
    sentientOptions: sentient(),
    creatureOptions: withoutTag("sentient", all$1$1),
    minThreatLevel: 1,
    maxThreatLevel: 4
  };
}
function distance(a, b) {
  let d = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  return d;
}
function edgesFromVertices(vertices) {
  let edges = [];
  for (let i = 0; i < vertices.length; i++) {
    let a = vertices[i];
    let b = vertices[0];
    if (i < vertices.length - 1) {
      b = vertices[i + 1];
    }
    let edge = { a, b };
    edges.push(edge);
  }
  return edges;
}
function getMidpoint(edge) {
  let x = (edge.a.x + edge.b.x) / 2;
  let y = (edge.a.y + edge.b.y) / 2;
  return { x, y };
}
function getSlope(edge) {
  return (edge.b.y - edge.a.y) / (edge.b.x - edge.a.x);
}
function vertexEquals(a, b) {
  if (a.x == b.x && a.y == b.y) {
    return true;
  }
  return false;
}
function vertexIn(needle, haystack) {
  for (let i = 0; i < haystack.length; i++) {
    if (vertexEquals(needle, haystack[i])) {
      return true;
    }
  }
  return false;
}
class Lock {
  id;
  name;
  description;
  objectId;
  // numeric id of the thing that this locks
  strength;
  isLocked;
  constructor() {
    this.id = "";
    this.name = "a lock";
    this.description = "a lock";
    this.objectId = -1;
    this.strength = 1;
    this.isLocked = true;
  }
}
const STONE = 0;
const ROOM = 1;
const V_DOOR = 2;
const H_DOOR = 3;
const V_S_DOOR = 4;
const H_S_DOOR = 5;
class RoomTheme {
  name;
  allowedEnvironments;
  minWidth;
  maxWidth;
  minHeight;
  maxHeight;
  flooringOptions;
  dressingGenerators;
  featureGenerators;
  mutators;
  shapes;
  tags;
  commonality;
  constructor(name, allowedEnvironments, minWidth, minHeight, maxWidth, maxHeight, flooringOptions, dressingGenerators, featureGenerators, mutators, shapes, tags, commonality) {
    this.name = name;
    this.allowedEnvironments = allowedEnvironments;
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.flooringOptions = flooringOptions;
    this.dressingGenerators = dressingGenerators;
    this.featureGenerators = featureGenerators;
    this.mutators = mutators;
    this.shapes = shapes;
    this.tags = tags;
    this.commonality = commonality;
  }
}
class Room {
  id;
  name;
  description;
  secrets;
  shape;
  tileMesh;
  tiles;
  vertices;
  minX;
  minY;
  maxX;
  maxY;
  center;
  lightLevel;
  features;
  treasureCaches;
  encounters;
  theme;
  doors;
  constructor() {
    this.id = -1;
    this.name = "";
    this.tileMesh = [];
    this.encounters = [];
    this.features = [];
    this.doors = [];
    this.description = "";
    this.minX = 0;
    this.minY = 0;
    this.maxX = 0;
    this.maxY = 0;
    this.center = { x: 0, y: 0 };
    this.shape = { vertices: [], edges: [] };
    this.theme = new RoomTheme("", [], 0, 0, 0, 0, [], [], [], [], [], [], 0);
    this.secrets = "";
    this.tiles = [];
    this.treasureCaches = [];
    this.vertices = [];
    this.lightLevel = 0;
  }
  calculateTileMesh() {
    let tiles = [];
    let minY = this.minY;
    let maxY = this.maxY;
    let minX = this.minX;
    let maxX = this.maxX;
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        let n = { vertices: [], edges: [] };
        n.vertices = [
          { x: x - 0.5, y: y - 0.5 },
          { x: x + 0.5, y: y - 0.5 },
          { x: x + 0.5, y: y + 0.5 },
          { x: x - 0.5, y: y + 0.5 }
        ];
        n.edges = edgesFromVertices(n.vertices);
        tiles.push(n);
      }
    }
    this.tileMesh = tiles;
  }
  calculateTiles(mapWidth, mapHeight) {
    let newTiles = [];
    for (let y = 0; y < mapHeight; y++) {
      let row = [];
      newTiles[y] = row;
      for (let x = 0; x < mapWidth; x++) {
        newTiles[y][x] = STONE;
      }
    }
    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].y > newTiles.length - 1) {
        console.debug(
          `Vertices outside the bounds of the map: ${newTiles.length} newTiles.length, ${this.vertices[i].y} this.vertices[i].y`,
          this.vertices
        );
      }
      newTiles[this.vertices[i].y][this.vertices[i].x] = ROOM;
    }
    this.tiles = newTiles;
  }
  calculateVertices() {
    let v = [];
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        if (this.tiles[y][x] != STONE) {
          v.push({ x, y });
        }
      }
    }
    this.vertices = v;
  }
  getTileEdges() {
    let result = [];
    for (let i = 0; i < this.tileMesh.length; i++) {
      for (let j = 0; j < this.tileMesh[i].edges.length; j++) {
        result.push(this.tileMesh[i].edges[j]);
      }
    }
    return result;
  }
  getCenter() {
    let x = this.minX + (this.maxX - this.minX) / 2;
    let y = this.minY + (this.maxY - this.minY) / 2;
    return { x, y };
  }
  getMinX() {
    let result = this.vertices[0].x;
    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].x < result) {
        result = this.vertices[i].x;
      }
    }
    return result;
  }
  getMaxX() {
    let result = this.vertices[0].x;
    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].x > result) {
        result = this.vertices[i].x;
      }
    }
    return result;
  }
  getMinY() {
    let result = this.vertices[0].y;
    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].y < result) {
        result = this.vertices[i].y;
      }
    }
    return result;
  }
  getMaxY() {
    let result = this.vertices[0].y;
    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].y > result) {
        result = this.vertices[i].y;
      }
    }
    return result;
  }
  getHeight() {
    return this.maxY - this.minY;
  }
  getWidth() {
    return this.maxX - this.minX;
  }
  moveBy(mx, my, mapWidth, mapHeight) {
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].x += mx;
      this.vertices[i].y += my;
    }
    this.calculateTiles(mapWidth, mapHeight);
    this.minX = this.getMinX();
    this.maxX = this.getMaxX();
    this.minY = this.getMinY();
    this.maxY = this.getMaxY();
    this.center = this.getCenter();
  }
  moveTo(nx, ny, mapWidth, mapHeight) {
    const diffX = nx - this.minX;
    const diffY = ny - this.minY;
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].x += diffX;
      this.vertices[i].y += diffY;
    }
    this.calculateTiles(mapWidth, mapHeight);
    this.minX = this.getMinX();
    this.maxX = this.getMaxX();
    this.minY = this.getMinY();
    this.maxY = this.getMaxY();
    this.center = this.getCenter();
  }
}
class RoomGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let width = random.int(this.config.theme.minWidth, this.config.theme.maxWidth);
    let height = random.int(this.config.theme.minHeight, this.config.theme.maxHeight);
    let x = random.int(2, this.config.mapWidth - width - 3);
    let y = random.int(2, this.config.mapHeight - height - 3);
    let room = new Room();
    room.name = this.config.theme.name;
    room.theme = this.config.theme;
    let shape = RND.item(this.config.theme.shapes);
    if (shape == "rectangular") {
      room = getRectangularRoom(x, y, width, height, room);
      room.description = RND.item([
        `This rectangular room is ${width * 5}' wide and ${height * 5}' long.`,
        `This ${room.name} is ${width * 5}' wide and ${height * 5}' long.`
      ]);
    } else if (shape == "square") {
      room = getSquareRoom(x, y, width, room);
      room.description = RND.item([
        `This square room is ${width * 5}' wide and ${height * 5}' long.`,
        `This room is a square ${width * 5}' wide and ${height * 5}' long.`,
        `This ${room.name} is ${width * 5}' wide and ${height * 5}' long.`
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
        ` The ${flooring} flooring is broken in places.`
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
function getCavernRoom(ox, oy, width, height, room) {
  let start = { x: Math.floor((ox + width) / 2), y: Math.floor((oy + height) / 2) };
  let steps = 20;
  const maxX = ox + width;
  const maxY = oy + height;
  room.vertices.push(start);
  let v = { x: start.x, y: start.y };
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
    let nv = { x, y };
    let alreadyThere = false;
    for (let j = 0; j < room.vertices.length; j++) {
      if (vertexEquals(room.vertices[j], nv)) {
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
function getCorridor(x, y, width, height, room) {
  let length = random.int(Math.max(3, Math.floor((width + height - 2) / 2)), width + height - 2);
  let nx = random.int(x, x + width - 1);
  let ny = random.int(y, y + height - 1);
  room.vertices.push({ x: nx, y: ny });
  let direction = RND.item([
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 }
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
      let nv = { x: nx, y: ny };
      if (vertexIn(nv, room.vertices)) {
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
function getRectangularRoom(x, y, width, height, room) {
  for (let i = y; i < y + height; i++) {
    for (let j = x; j < x + width; j++) {
      room.vertices.push({ x: j, y: i });
    }
  }
  room.description = `This room is ${(width + 1) * 5}' wide and ${(height + 1) * 5}' long.`;
  return room;
}
function getSquareRoom(x, y, size, room) {
  for (let i = y; i < y + size; i++) {
    for (let j = x; j < x + size; j++) {
      room.vertices.push({ x: j, y: i });
    }
  }
  room.description = `This square room is ${(size + 1) * 5}' wide and ${(size + 1) * 5}' long.`;
  return room;
}
class RoomGeneratorConfig {
  mapHeight;
  mapWidth;
  theme;
  constructor(mapWidth, mapHeight, theme) {
    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;
    this.theme = theme;
  }
}
function distanceToNearestOtherRoomTile(room, rooms) {
  let distance$1 = 1e7;
  for (let i = 0; i < rooms.length; i++) {
    for (let j = 0; j < rooms[i].vertices.length; j++) {
      for (let k = 0; k < room.vertices.length; k++) {
        let d = distance(rooms[i].vertices[j], room.vertices[k]);
        if (d <= distance$1) {
          distance$1 = d;
        }
      }
    }
  }
  return distance$1;
}
function doesRoomCollide(room, rooms) {
  for (let i = 0; i < rooms.length; i++) {
    for (let j = 0; j < rooms[i].vertices.length; j++) {
      for (let k = 0; k < room.vertices.length; k++) {
        if (vertexEquals(room.vertices[k], rooms[i].vertices[j])) {
          return true;
        }
      }
    }
  }
  return false;
}
function doesRoomTouch(room, rooms) {
  for (let i = 0; i < rooms.length; i++) {
    for (let j = 0; j < rooms[i].vertices.length; j++) {
      for (let k = 0; k < room.vertices.length; k++) {
        if (distance(room.vertices[k], rooms[i].vertices[j]) == 1) {
          return true;
        }
      }
    }
  }
  return false;
}
function getNeighboringRooms(room, rooms) {
  let result = [];
  let ids = [];
  for (let i = 0; i < rooms.length; i++) {
    for (let j = 0; j < room.vertices.length; j++) {
      for (let k = 0; k < rooms[i].vertices.length; k++) {
        let d = distance(rooms[i].vertices[k], room.vertices[j]);
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
function getPlaceableRoom(mapWidth, mapHeight, theme, rooms) {
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
    if (!doesRoomCollide(room, rooms) && !doesRoomTouch(room, rooms) && isRoomInRange(2, room, rooms)) {
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
function isRoomInRange(range, room, rooms) {
  if (distanceToNearestOtherRoomTile(room, rooms) == range) {
    return true;
  }
  return false;
}
function addDoor(room1, room2) {
  let door = {
    room1: -1,
    room2: -1,
    vertex: { x: 0, y: 0 },
    tile: 0,
    lock: null,
    isSecret: false,
    description: ""
  };
  let possibleEdges = [];
  for (let i = 0; i < room1.vertices.length; i++) {
    for (let j = 0; j < room2.vertices.length; j++) {
      let nD = distance(room1.vertices[i], room2.vertices[j]);
      if (nD == 2) {
        let a = room1.vertices[i];
        let b = room2.vertices[j];
        possibleEdges.push({ a, b });
      }
    }
  }
  let e = RND.item(possibleEdges);
  door.vertex = getMidpoint(e);
  if (getSlope(e) === 0) {
    door.tile = H_DOOR;
  } else {
    door.tile = V_DOOR;
  }
  if (RND.simple(100) > 90) {
    door.lock = new Lock();
    door.lock.id = RND.randomString(24);
  } else if (RND.simple(100) > 90) {
    door.isSecret = true;
    if (door.tile == H_DOOR) {
      door.tile = H_S_DOOR;
    } else {
      door.tile = V_S_DOOR;
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
      "ornate"
    ])
  ]);
  door.description = Words.article(doorQuality) + " " + doorQuality + " door";
  return door;
}
function addDoorsToDungeon(dungeon) {
  for (let i = 0; i < dungeon.rooms.length; i++) {
    let neighbors = getNeighboringRooms(dungeon.rooms[i], dungeon.rooms);
    let viable = [];
    for (let j = 0; j < neighbors.length; j++) {
      let existingDoor = false;
      for (let k = 0; k < dungeon.rooms[i].doors.length; k++) {
        let door2 = dungeon.doors[dungeon.rooms[i].doors[k]];
        if (door2.room1 == dungeon.rooms[i].id && door2.room2 == neighbors[j].id || door2.room2 == dungeon.rooms[i].id && door2.room1 == neighbors[j].id) {
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
        `${RND.item([
          "It is",
          "It's"
        ])} practically undetectable except for a thin seam visible only on close inspection.`,
        `A tapestry obscures it.`,
        `It cannot be opened from this side.`,
        `A pile of ${RND.item(["refuse", "debris", "trash"])} obscures it.`
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
    let door1feature = { name: "door", description: description1, secret: secret1, isContainer: false };
    let door2feature = { name: "door", description: description2, secret: secret2, isContainer: false };
    dungeon.rooms[i].features.push(door1feature);
    dungeon.rooms[r2.id].doors.push(di);
    dungeon.rooms[r2.id].features.push(door2feature);
    dungeon.tiles = addDoorToTiles(door, dungeon.tiles);
  }
  return dungeon;
}
function addDoorToTiles(door, tiles) {
  tiles[door.vertex.y][door.vertex.x] = door.tile;
  return tiles;
}
function getDoorDescription(door, room) {
  let dir = "";
  if (door.tile == V_DOOR) {
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
    Words.capitalize(door.description) + ` is in the ${dir}`
  ]);
  if (door.lock != null) {
    description += ". It is locked.";
  } else {
    description += ".";
  }
  return description;
}
class RoomFeatureGenerator {
  name;
  descriptionOptions;
  secretOptions;
  isContainer;
  constructor(name, descriptionOptions, secretOptions, isContainer) {
    this.name = name;
    this.descriptionOptions = descriptionOptions;
    this.secretOptions = secretOptions;
    this.isContainer = isContainer;
  }
  generate() {
    let secret = "";
    if (RND.simple(100) > 70 && this.secretOptions.length > 0) {
      secret = RND.item(this.secretOptions);
    }
    return {
      name: this.name,
      description: RND.item(this.descriptionOptions),
      secret,
      isContainer: this.isContainer
    };
  }
}
class RoomMutator {
  name;
  mutate;
  tags;
  constructor(name, mutate, tags) {
    this.name = name;
    this.mutate = mutate;
    this.tags = tags;
  }
}
function all$j() {
  return [
    new RoomMutator(
      "brazier",
      (room) => {
        let featureGenerator = new RoomFeatureGenerator(
          "brazier",
          [
            "There is a large lit brazier in the middle of the room.",
            "There are lit braziers around the room here."
          ],
          [],
          false
        );
        room.features.push(featureGenerator.generate());
        room.lightLevel += 2;
        return room;
      },
      ["light"]
    ),
    new RoomMutator(
      "torches",
      (room) => {
        let featureGenerator = new RoomFeatureGenerator(
          "torches",
          ["Torches line the walls.", "A few torches sit in sconces on the walls."],
          [],
          false
        );
        room.features.push(featureGenerator.generate());
        room.lightLevel += 1;
        return room;
      },
      ["light"]
    )
  ];
}
function withTag$1(tag, mutators) {
  let result = [];
  for (let i = 0; i < mutators.length; i++) {
    if (mutators[i].tags.includes(tag)) {
      result.push(mutators[i]);
    }
  }
  return result;
}
function all$i() {
  let genericFeatures = [
    new RoomFeatureGenerator(
      "debris",
      [
        "There is a pile of random debris here.",
        "Much of the floor is covered in debris.",
        "Debris of unknown origin is scattered about."
      ],
      [],
      false
    ),
    new RoomFeatureGenerator(
      "rags",
      [
        "There is a pile of rags here.",
        "One of the corners has a large pile of filthy rags.",
        "Small piles of rags are scattered across the floor."
      ],
      [],
      false
    ),
    new RoomFeatureGenerator(
      "cobwebs",
      [
        "There are a lot of cobwebs here.",
        "The ceiling is partly covered in cobwebs.",
        "Dense cobwebs hang down from the ceiling."
      ],
      [],
      false
    )
  ];
  return [
    new RoomTheme(
      "altar room",
      [],
      3,
      3,
      10,
      10,
      ["marble", "stone tile"],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          "altar",
          [
            "There is an evil-looking altar here.",
            "There is a blood-covered altar here.",
            "On top of a stone dais is a long altar."
          ],
          [],
          false
        )
      ],
      [],
      ["rectangular"],
      ["cult"],
      5
    ),
    new RoomTheme(
      "armory",
      [],
      3,
      3,
      6,
      6,
      ["stone tile"],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          "weapon racks",
          [
            "Weapon racks full of old spears, swords, and axes line the walls.",
            "Each wall has at least one wooden rack full of weapons.",
            "There are rows of weapon racks here."
          ],
          [],
          false
        ),
        new RoomFeatureGenerator(
          "armor displays",
          [
            "Pieces of armor in various states of disrepair hang from pegs on the walls.",
            "There are numerous pegs on the walls for armor to be hung.",
            "Several pieces of armor are on armor stands here."
          ],
          [],
          false
        )
      ],
      [],
      ["rectangular", "square"],
      ["military"],
      5
    ),
    new RoomTheme(
      "barracks",
      [],
      8,
      8,
      15,
      15,
      ["stone tile"],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          "beds",
          [
            "There are many beds here.",
            "There are many bunk beds here.",
            "There are many cots here.",
            "Beds line the walls.",
            "Cots line the walls."
          ],
          [],
          false
        ),
        new RoomFeatureGenerator(
          "chests",
          ["There are chests at the end of each bed.", "Each bed has a chest at the foot."],
          [],
          true
        )
      ],
      [],
      ["rectangular"],
      ["military"],
      5
    ),
    new RoomTheme(
      "burial chamber",
      [],
      5,
      5,
      10,
      10,
      ["stone tile"],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          "coffins",
          [
            "There is a large stone sarcophagus here.",
            "There is an ornate sarcophagus here.",
            "There are several sarcophagi here.",
            "There is a large, ornate coffin here.",
            "There are many coffins here.",
            "Coffins line the walls.",
            "Along the walls are several long alcoves. Each one has a stone coffin."
          ],
          [],
          true
        )
      ],
      [],
      ["rectangular"],
      ["tomb"],
      5
    ),
    new RoomTheme(
      "chamber",
      [],
      2,
      2,
      6,
      6,
      ["marble", "stone tile"],
      genericFeatures,
      [],
      [],
      ["rectangular", "square"],
      ["dungeon"],
      40
    ),
    new RoomTheme(
      "fountain chamber",
      [],
      2,
      2,
      5,
      5,
      ["stone tile"],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          "fountain",
          [
            "There is a large fountain here.",
            "There is an ornate fountain here.",
            "There is a disused fountain here with brackish water.",
            "There is an elegant fountain here.",
            "Two fountains lie on either side of the room.",
            "Small fountains sit in each corner of the room.",
            "An old and disused fountain sits in the corner."
          ],
          [],
          true
        )
      ],
      [],
      ["rectangular", "square"],
      ["dungeon", "nobility"],
      5
    ),
    new RoomTheme(
      "kitchen",
      [],
      2,
      2,
      5,
      5,
      ["stone tile"],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          "oven",
          [
            "There is a large wood-fired oven here.",
            "There are several large ovens here.",
            "Ovens line one of the walls.",
            "A long-dormant oven sits against the back wall."
          ],
          [],
          false
        ),
        new RoomFeatureGenerator(
          "pantry cabinet",
          ["There is a pantry cabinet here.", "A pantry cabinet sits against one wall."],
          [],
          true
        ),
        new RoomFeatureGenerator(
          "table",
          [
            "There is a table here.",
            "A table sits against one wall.",
            "An assortment of kitchen utensils and tools sit on a large table here."
          ],
          [],
          false
        )
      ],
      [],
      ["rectangular"],
      ["food", "military"],
      5
    ),
    new RoomTheme(
      "laboratory",
      [],
      4,
      4,
      6,
      6,
      ["stone tile"],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          "lab table",
          [
            "There is a large table here with a wide array of alchemical devices on it.",
            "There are several tables here with various devices on them.",
            "Tables with alchemical devices, books, and other items are arranged around the room."
          ],
          [],
          false
        ),
        new RoomFeatureGenerator(
          "specimen cabinet",
          [
            "There is a large cabinet here.",
            "There is a simple cabinet here, and the door is ajar.",
            "There is a cabinet here."
          ],
          [],
          true
        )
      ],
      [],
      ["rectangular"],
      ["alchemy", "mage"],
      5
    ),
    new RoomTheme(
      "library",
      [],
      5,
      5,
      15,
      15,
      ["stone tile"],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          "bookcases",
          [
            "There are many bookcases here.",
            "There are a number of well-preserved bookcases here.",
            "The walls are lined with bookcases."
          ],
          [],
          true
        ),
        new RoomFeatureGenerator(
          "table",
          [
            "There are several tables here.",
            "There is a table here with a large book open lying on it."
          ],
          [],
          false
        )
      ],
      [],
      ["rectangular", "square"],
      ["mage", "nobility"],
      5
    ),
    new RoomTheme(
      "storeroom",
      [],
      2,
      2,
      6,
      6,
      ["stone tile"],
      genericFeatures,
      [
        new RoomFeatureGenerator(
          "stacked boxes",
          [
            "Many boxes are stacked here.",
            "Boxes are stacked in corners here.",
            "Crates and large boxes line the walls.",
            "A few broken crates and boxes are strewn about."
          ],
          [],
          true
        )
      ],
      [],
      ["rectangular", "square"],
      ["dungeon"],
      20
    )
  ];
}
function all$h() {
  let result = [];
  result = result.concat(all$i());
  return result;
}
function byName(name, themes) {
  for (let i = 0; i < themes.length; i++) {
    if (themes[i].name == name) {
      return themes[i];
    }
  }
  throw new Error(`Failed to find room theme with name ${name}.`);
}
function byTag(tag, themes) {
  let result = [];
  for (let i = 0; i < themes.length; i++) {
    if (themes[i].tags.includes(tag)) {
      result.push(themes[i]);
    }
  }
  return result;
}
function getEntrance() {
  return new RoomTheme(
    "entrance",
    [],
    2,
    2,
    4,
    4,
    ["stone tile"],
    [],
    [
      new RoomFeatureGenerator(
        "entrance",
        [
          "The entrance to the dungeon is here.",
          "The stairs out of the dungeon are here.",
          "There is a set of stairs here leading out of the dungeon.",
          "The stairs leading out of the dungeon are here."
        ],
        [],
        false
      )
    ],
    [],
    ["rectangular", "square"],
    ["dungeon", "entrance"],
    10
  );
}
class MeleeWeaponMutator {
  name;
  mutate;
  requiredTag;
  tags;
  constructor(name, mutate, requiredTag, tags) {
    this.name = name;
    this.mutate = mutate;
    this.requiredTag = requiredTag;
    this.tags = tags;
  }
}
function all$g() {
  let sets = [
    {
      element: "fire",
      damage: "+1d6 fire",
      description: "The blade is wreathed in flame when wielded. Anything flammable struck with it immediately ignites."
    },
    {
      element: "ice",
      damage: "+1d6 cold",
      description: "The blade is surrounded by a layer of ice when wielded. Enemies struck with it are chilled to the bone and have difficulty moving."
    },
    {
      element: "lightning",
      damage: "+1d6 electricity",
      description: "The blade is surrounded by crackling lightning when wielded."
    },
    {
      element: "poison",
      damage: "+1d6 poison",
      description: "The blade is coated in a sickly green liquid when wielded. The liquid is highly poisonous, causing illness and eventually death if not cured."
    },
    {
      element: "acid",
      damage: "+1d6 acid",
      description: "The blade is coated in a thin yellow acid when wielded."
    },
    {
      element: "darkness",
      damage: "+1d6 darkness",
      description: "The blade is hidden in shadow when wielded. It is difficult for enemies to predict where attacks with this weapon will come from."
    },
    {
      element: "light",
      damage: "+1d6 light",
      description: "The blade glows faintly when wielded. On command, that light glows brightly enough to illuminate a large room."
    },
    {
      element: "earth",
      damage: "+1d6 earth",
      description: "The blade appears to be made of stone. Anything struck with it is turned to stone."
    }
  ];
  let result = [];
  for (let set of sets) {
    result.push(
      new MeleeWeaponMutator(
        `${set.element}-enchanted melee weapon`,
        (item) => {
          item.name = `${set.element}-enchanted ${item.name}`;
          if (item instanceof MeleeWeapon) {
            item.damage += ` ${set.damage}`;
          }
          item.description += ` ${set.description}`;
          item.value += 1e4;
          return item;
        },
        "bladed weapon",
        ["weapon", "melee weapon", "bladed weapon", "enchantment", set.element]
      )
    );
  }
  return result;
}
function all$f() {
  let results = [];
  results = results.concat(all$g());
  return results;
}
function withAnyTag(tags, mutators) {
  let result = [];
  let names = [];
  for (let i = 0; i < mutators.length; i++) {
    for (let j = 0; j < tags.length; j++) {
      if (mutators[i].tags.includes(tags[j]) && !names.includes(mutators[i].name)) {
        result.push(mutators[i]);
        names.push(mutators[i].name);
        continue;
      }
    }
  }
  return result;
}
class ItemGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let quality = random.int(this.config.minQuality, this.config.maxQuality);
    let components = withMaxQuality(this.config.maxQuality, this.config.components);
    components = withMinQuality(this.config.minQuality, components);
    let item = this.config.pattern.complete(this.config.components, quality);
    if (this.config.useMutator) {
      let mutators = withAnyTag(item.tags, this.config.mutators);
      if (mutators.length > 0) {
        let mutator = RND.item(mutators);
        item = mutator.mutate(item);
      }
    }
    return item;
  }
}
class ItemGeneratorConfig {
  pattern;
  components;
  minValue;
  maxValue;
  minQuality;
  maxQuality;
  mutators;
  useMutator;
  constructor() {
    this.components = all$4$1();
    this.minValue = 0;
    this.maxValue = 0;
    this.minQuality = 0;
    this.maxQuality = 1;
    this.mutators = all$f();
    this.useMutator = false;
  }
}
function getItemGenerator(itemName, quality) {
  let itemGenConfig = new ItemGeneratorConfig();
  itemGenConfig.pattern = byName$2(itemName);
  let minValue = 0;
  let minQuality = quality;
  let maxValue = 10;
  let maxQuality = quality;
  if (quality == 1) {
    maxValue = 20;
  } else if (quality == 2) {
    minValue = 10;
    maxValue = 30;
  } else if (quality == 3) {
    minValue = 30;
    maxValue = 50;
  } else if (quality == 3) {
    minValue = 50;
    maxValue = 100;
  } else if (quality == 4) {
    minValue = 100;
    maxValue = 1e4;
  }
  itemGenConfig.minValue = minValue;
  itemGenConfig.maxValue = maxValue;
  itemGenConfig.minQuality = minQuality;
  itemGenConfig.maxQuality = maxQuality;
  let itemGen = new ItemGenerator(itemGenConfig);
  return itemGen;
}
function getItemGeneratorByTag(tag, quality) {
  let patternOptions = forCategory(tag);
  return getItemGenerator(RND.item(patternOptions).name, quality);
}
function all$e() {
  return [
    {
      name: "cleric",
      abilities: [
        {
          name: "turn undead",
          description: "turns undead creatures",
          category: "divine",
          threatLevel: 1
        },
        {
          name: "divine spellcasting",
          description: "casts divine spells",
          category: "divine",
          threatLevel: 1
        }
      ],
      tags: ["cleric"],
      threatLevel: 2,
      itemGenerators: [
        getItemGeneratorByTag("mace", 1),
        getItemGeneratorByTag("breastplate", 1)
      ]
    },
    {
      name: "priest",
      abilities: [
        {
          name: "turn undead",
          description: "turns undead creatures",
          category: "divine",
          threatLevel: 1
        },
        {
          name: "divine spellcasting",
          description: "casts divine spells",
          category: "divine",
          threatLevel: 2
        }
      ],
      tags: ["cleric"],
      threatLevel: 1,
      itemGenerators: [
        getItemGeneratorByTag("staff", 1),
        getItemGeneratorByTag("robe", 1)
      ]
    },
    {
      name: "high priest",
      abilities: [
        {
          name: "turn undead",
          description: "turns undead creatures",
          category: "divine",
          threatLevel: 1
        },
        {
          name: "divine spellcasting",
          description: "casts divine spells",
          category: "divine",
          threatLevel: 3
        }
      ],
      tags: ["cleric"],
      threatLevel: 2,
      itemGenerators: [
        getItemGeneratorByTag("staff", 2),
        getItemGeneratorByTag("robe", 2)
      ]
    }
  ];
}
function all$d() {
  return [
    {
      name: "cult acolyte",
      abilities: [],
      tags: ["cult"],
      threatLevel: 1,
      itemGenerators: [
        getItemGeneratorByTag("staff", 1),
        getItemGenerator("robe", 0)
      ]
    },
    {
      name: "cult priest",
      abilities: [
        {
          name: "demonic spellcasting",
          description: "casts demonic spells",
          category: "demonic",
          threatLevel: 2
        }
      ],
      tags: ["cult"],
      threatLevel: 2,
      itemGenerators: [
        getItemGeneratorByTag("staff", 1),
        getItemGenerator("robe", 1)
      ]
    },
    {
      name: "cult high priest",
      abilities: [
        {
          name: "demonic spellcasting",
          description: "casts demonic spells",
          category: "demonic",
          threatLevel: 3
        }
      ],
      tags: ["cult"],
      threatLevel: 3,
      itemGenerators: [
        getItemGeneratorByTag("staff", 3),
        getItemGeneratorByTag("knife", 2),
        getItemGenerator("robe", 3)
      ]
    }
  ];
}
function all$c() {
  return [
    {
      name: "apprentice mage",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 1
        }
      ],
      tags: ["magic user"],
      threatLevel: 1,
      itemGenerators: [getItemGenerator("staff", 1), getItemGenerator("robe", 0)]
    },
    {
      name: "archmage",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 8
        }
      ],
      tags: ["magic user"],
      threatLevel: 4,
      itemGenerators: [getItemGenerator("staff", 3), getItemGenerator("robe", 3)]
    },
    {
      name: "druid",
      abilities: [
        {
          name: "nature spellcasting",
          description: "casts nature spells",
          category: "spellcaster",
          threatLevel: 1
        }
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: [getItemGenerator("staff", 1), getItemGenerator("robe", 0)]
    },
    {
      name: "mage",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 4
        }
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: [getItemGenerator("staff", 1), getItemGenerator("robe", 0)]
    },
    {
      name: "necromancer",
      abilities: [
        {
          name: "necromantic spellcasting",
          description: "casts necromantic spells",
          category: "spellcaster",
          threatLevel: 2
        }
      ],
      tags: ["magic user"],
      threatLevel: 4,
      itemGenerators: [getItemGenerator("staff", 3), getItemGenerator("robe", 3)]
    },
    {
      name: "sorcerer",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 1
        }
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: []
    },
    {
      name: "warlock",
      abilities: [
        {
          name: "demonic spellcasting",
          description: "casts demonic spells",
          category: "spellcaster",
          threatLevel: 1
        }
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: []
    },
    {
      name: "witch",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 1
        }
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: []
    },
    {
      name: "wizard",
      abilities: [
        {
          name: "arcane spellcasting",
          description: "casts arcane spells",
          category: "spellcaster",
          threatLevel: 4
        }
      ],
      tags: ["magic user"],
      threatLevel: 2,
      itemGenerators: [getItemGenerator("staff", 1), getItemGenerator("robe", 1)]
    }
  ];
}
function all$b() {
  return [
    {
      name: "archer",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 1,
      itemGenerators: [getItemGeneratorByTag("bow", 1)]
    },
    {
      name: "captain",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 1,
      itemGenerators: [
        getItemGeneratorByTag("sword", 2),
        getItemGeneratorByTag("breastplate", 2),
        getItemGeneratorByTag("helmet", 2)
      ]
    },
    {
      name: "general",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 1,
      itemGenerators: [
        getItemGeneratorByTag("sword", 3),
        getItemGeneratorByTag("breastplate", 3),
        getItemGeneratorByTag("helmet", 3)
      ]
    },
    {
      name: "guard",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 1,
      itemGenerators: [
        getItemGeneratorByTag("spear", 1),
        getItemGeneratorByTag("body armor", 1)
      ]
    },
    { name: "hunter", abilities: [], tags: ["martial", "wilderness"], threatLevel: 1, itemGenerators: [] },
    { name: "martial artist", abilities: [], tags: ["martial"], threatLevel: 1, itemGenerators: [] },
    { name: "martial arts master", abilities: [], tags: ["martial"], threatLevel: 2, itemGenerators: [] },
    {
      name: "raider captain",
      abilities: [],
      tags: ["criminal", "martial"],
      threatLevel: 1,
      itemGenerators: [
        getItemGeneratorByTag("sword", 1),
        getItemGeneratorByTag("breastplate", 1)
      ]
    },
    {
      name: "raider",
      abilities: [],
      tags: ["criminal", "martial"],
      threatLevel: 1,
      itemGenerators: [
        getItemGeneratorByTag("weapon", 1),
        getItemGeneratorByTag("body armor", 1)
      ]
    },
    { name: "ranger", abilities: [], tags: ["martial", "wilderness"], threatLevel: 3, itemGenerators: [] },
    {
      name: "soldier",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 1,
      itemGenerators: [
        getItemGeneratorByTag("martial weapon", 1),
        getItemGeneratorByTag("body armor", 1)
      ]
    },
    {
      name: "thug",
      abilities: [],
      tags: ["criminal", "martial"],
      threatLevel: 1,
      itemGenerators: [getItemGeneratorByTag("club", 1)]
    },
    {
      name: "veteran hunter",
      abilities: [],
      tags: ["martial", "wilderness"],
      threatLevel: 2,
      itemGenerators: [getItemGeneratorByTag("bow", 3)]
    },
    {
      name: "veteran soldier",
      abilities: [],
      tags: ["martial", "military"],
      threatLevel: 2,
      itemGenerators: [
        getItemGeneratorByTag("sword", 2),
        getItemGeneratorByTag("breastplate", 2)
      ]
    },
    {
      name: "warrior",
      abilities: [],
      tags: ["martial", "wilderness"],
      threatLevel: 1,
      itemGenerators: [getItemGeneratorByTag("simple weapon", 1)]
    }
  ];
}
function all$a() {
  return [
    {
      name: "lich",
      abilities: [
        {
          name: "necromantic spellcasting",
          description: "casts necromantic spells",
          category: "spellcaster",
          threatLevel: 8
        }
      ],
      tags: ["undead"],
      threatLevel: 5,
      itemGenerators: []
    },
    { name: "shambler", abilities: [], tags: ["undead"], threatLevel: 1, itemGenerators: [] },
    { name: "sprinter", abilities: [], tags: ["undead"], threatLevel: 2, itemGenerators: [] }
  ];
}
function all$9() {
  let result = [];
  result = result.concat(all$e());
  result = result.concat(all$d());
  result = result.concat(all$c());
  result = result.concat(all$b());
  result = result.concat(all$a());
  return result;
}
function hasAllTagsIn(tags, mobs) {
  let result = [];
  for (let i = 0; i < mobs.length; i++) {
    let valid = true;
    for (let t = 0; t < tags.length; t++) {
      if (!mobs[i].tags.includes(tags[t])) {
        valid = false;
        break;
      }
    }
    if (valid === true) {
      result.push(mobs[i]);
    }
  }
  return result;
}
function hasAnyTagIn(tags, mobs) {
  let result = [];
  for (let i = 0; i < mobs.length; i++) {
    let valid = false;
    for (let t = 0; t < tags.length; t++) {
      if (mobs[i].tags.includes(tags[t])) {
        valid = true;
        break;
      }
    }
    if (valid === true) {
      result.push(mobs[i]);
    }
  }
  return result;
}
function hasCreatureType(creatureType, mobs) {
  let result = [];
  for (let i = 0; i < mobs.length; i++) {
    if (mobs[i].creatureTypes.includes(creatureType)) {
      result.push(mobs[i]);
    }
  }
  return result;
}
function hasEnvironment(environment, mobs) {
  let result = [];
  for (let i = 0; i < mobs.length; i++) {
    if (mobs[i].environments.includes(environment)) {
      result.push(mobs[i]);
    }
  }
  return result;
}
function hasNoTagIn(tags, mobs) {
  let result = [];
  for (let i = 0; i < mobs.length; i++) {
    let valid = true;
    for (let t = 0; t < tags.length; t++) {
      if (mobs[i].tags.includes(tags[t])) {
        valid = false;
        break;
      }
    }
    if (valid === true) {
      result.push(mobs[i]);
    }
  }
  return result;
}
class MobFilter {
  withAllTags;
  withAnyTag;
  withCreatureType;
  withEnvironment;
  withNoTags;
  constructor(withAllTags, withAnyTag2, withCreatureType2, withEnvironment, withNoTags) {
    this.withAllTags = withAllTags;
    this.withAnyTag = withAnyTag2;
    this.withCreatureType = withCreatureType2;
    this.withEnvironment = withEnvironment;
    this.withNoTags = withNoTags;
  }
  apply(mobs) {
    let result = mobs;
    if (this.withAllTags.length > 0) {
      result = hasAllTagsIn(this.withAllTags, result);
    }
    if (this.withAnyTag.length > 0) {
      result = hasAnyTagIn(this.withAnyTag, result);
    }
    if (this.withCreatureType != "") {
      result = hasCreatureType(this.withCreatureType, result);
    }
    if (this.withEnvironment != "") {
      result = hasEnvironment(this.withEnvironment, result);
    }
    if (this.withNoTags.length > 0) {
      result = hasNoTagIn(this.withNoTags, result);
    }
    return result;
  }
}
function all$8() {
  let allArchetypes = all$9();
  return [
    {
      name: "group of raiders",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "raider captain",
          threatLevel: 2,
          isSentient: true,
          archetypes: [byName$1("raider captain", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1
        },
        {
          name: "raiders",
          threatLevel: 3,
          isSentient: true,
          archetypes: [byName$1("raider", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 3,
          maxNumber: 6
        }
      ],
      tags: ["bandits"],
      commonality: 5
    },
    {
      name: "group of looters",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "looters",
          threatLevel: 3,
          isSentient: true,
          archetypes: [byName$1("thug", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 3,
          maxNumber: 6
        }
      ],
      tags: ["bandits"],
      commonality: 5
    },
    {
      name: "group of thugs",
      threatLevel: 2,
      groupTemplates: [
        {
          name: "thugs",
          threatLevel: 2,
          isSentient: true,
          archetypes: [byName$1("thug", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 2,
          maxNumber: 4
        }
      ],
      tags: ["bandits"],
      commonality: 5
    }
  ];
}
function all$7() {
  let allArchetypes = all$9();
  return [
    {
      name: "group of cult acolytes",
      threatLevel: 1,
      groupTemplates: [
        {
          name: "cult acolytes",
          threatLevel: 1,
          isSentient: true,
          archetypes: [byName$1("cult acolyte", allArchetypes)],
          filter: new MobFilter([], ["cult", "corruptible"], "humanoid", "", ["undead"]),
          minNumber: 2,
          maxNumber: 4
        }
      ],
      tags: ["cult"],
      commonality: 50
    },
    {
      name: "group of lesser demons",
      threatLevel: 4,
      groupTemplates: [
        {
          name: "lesser demons",
          threatLevel: 2,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter(["demon"], [], "", "", []),
          minNumber: 2,
          maxNumber: 4
        }
      ],
      tags: ["cult", "demonic"],
      commonality: 1
    },
    {
      name: "cult priest",
      threatLevel: 2,
      groupTemplates: [
        {
          name: "cult priest",
          threatLevel: 2,
          isSentient: true,
          archetypes: [byName$1("cult priest", allArchetypes)],
          filter: new MobFilter([], ["cult", "corruptible"], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1
        }
      ],
      tags: ["cult"],
      commonality: 20
    },
    {
      name: "cult high priest",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "cult high priest",
          threatLevel: 5,
          isSentient: true,
          archetypes: [byName$1("cult high priest", allArchetypes)],
          filter: new MobFilter([], ["cult", "corruptible"], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1
        }
      ],
      tags: ["cult"],
      commonality: 15
    }
  ];
}
function all$6() {
  return [
    {
      name: "swarming insects",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "swarming insects",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter(["swarm"], [], "", "", []),
          minNumber: 3,
          maxNumber: 8
        }
      ],
      tags: ["insects"],
      commonality: 5
    },
    {
      name: "wandering creature",
      threatLevel: 2,
      groupTemplates: [
        {
          name: "wandering creature",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter([], [], "", "", []),
          minNumber: 1,
          maxNumber: 1
        }
      ],
      tags: ["wandering creature"],
      commonality: 40
    },
    {
      name: "group of wandering creatures",
      threatLevel: 4,
      groupTemplates: [
        {
          name: "wandering creatures",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter([], [], "", "", []),
          minNumber: 2,
          maxNumber: 4
        }
      ],
      tags: ["wandering creature"],
      commonality: 30
    }
  ];
}
function all$5() {
  let allArchetypes = all$9();
  return [
    {
      name: "archmage",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "archmage",
          threatLevel: 5,
          isSentient: true,
          archetypes: [byName$1("archmage", allArchetypes)],
          filter: new MobFilter([], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1
        }
      ],
      tags: ["mage", "magic"],
      commonality: 1
    },
    {
      name: "mage",
      threatLevel: 2,
      groupTemplates: [
        {
          name: "mage",
          threatLevel: 2,
          isSentient: true,
          archetypes: [byName$1("mage", allArchetypes)],
          filter: new MobFilter([], [], "humanoid", "", ["skeleton", "zombie"]),
          minNumber: 1,
          maxNumber: 1
        }
      ],
      tags: ["mage", "magic"],
      commonality: 5
    }
  ];
}
function all$4() {
  let allArchetypes = all$9();
  return [
    {
      name: "squad of soldiers",
      threatLevel: 1,
      groupTemplates: [
        {
          name: "soldiers",
          threatLevel: 1,
          isSentient: true,
          archetypes: [byName$1("soldier", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 2,
          maxNumber: 4
        }
      ],
      tags: ["martial", "soldiers"],
      commonality: 10
    },
    {
      name: "squad of veterans",
      threatLevel: 2,
      groupTemplates: [
        {
          name: "veteran soldiers",
          threatLevel: 2,
          isSentient: true,
          archetypes: [byName$1("veteran soldier", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 2,
          maxNumber: 4
        }
      ],
      tags: ["martial", "soldiers"],
      commonality: 5
    },
    {
      name: "captain",
      threatLevel: 4,
      groupTemplates: [
        {
          name: "captain",
          threatLevel: 2,
          isSentient: true,
          archetypes: [byName$1("captain", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1
        },
        {
          name: "veteran soldiers",
          threatLevel: 2,
          isSentient: true,
          archetypes: [byName$1("veteran soldier", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 2,
          maxNumber: 4
        }
      ],
      tags: ["martial", "soldiers"],
      commonality: 3
    },
    {
      name: "general",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "general",
          threatLevel: 3,
          isSentient: true,
          archetypes: [byName$1("general", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1
        },
        {
          name: "captain",
          threatLevel: 2,
          isSentient: true,
          archetypes: [byName$1("captain", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 2
        }
      ],
      tags: ["martial", "soldiers"],
      commonality: 2
    }
  ];
}
function all$3() {
  let allArchetypes = all$9();
  return [
    {
      name: "lich",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "lich",
          threatLevel: 5,
          isSentient: true,
          archetypes: [byName$1("lich", allArchetypes)],
          filter: new MobFilter([], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1
        }
      ],
      tags: ["undead"],
      commonality: 5
    },
    {
      name: "necromancer",
      threatLevel: 7,
      groupTemplates: [
        {
          name: "necromancer",
          threatLevel: 5,
          isSentient: true,
          archetypes: [byName$1("necromancer", allArchetypes)],
          filter: new MobFilter([], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1
        },
        {
          name: "skeletons",
          threatLevel: 2,
          isSentient: true,
          archetypes: [
            byName$1("warrior", allArchetypes),
            byName$1("soldier", allArchetypes),
            byName$1("guard", allArchetypes)
          ],
          filter: new MobFilter(["skeleton"], [], "", "", []),
          minNumber: 3,
          maxNumber: 6
        }
      ],
      tags: ["mage", "undead"],
      commonality: 5
    },
    {
      name: "pack of ghouls",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "ghouls",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter(["ghoul"], [], "", "", []),
          minNumber: 2,
          maxNumber: 4
        }
      ],
      tags: ["undead"],
      commonality: 5
    },
    {
      name: "pack of undead",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "undead",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter(["undead"], [], "", "", ["vampire"]),
          minNumber: 2,
          maxNumber: 4
        }
      ],
      tags: ["undead"],
      commonality: 5
    },
    {
      name: "pack of skeletons",
      threatLevel: 2,
      groupTemplates: [
        {
          name: "skeletons",
          threatLevel: 2,
          isSentient: true,
          archetypes: [
            byName$1("warrior", allArchetypes),
            byName$1("soldier", allArchetypes),
            byName$1("guard", allArchetypes)
          ],
          filter: new MobFilter(["skeleton"], [], "", "", []),
          minNumber: 3,
          maxNumber: 6
        }
      ],
      tags: ["skeleton", "undead"],
      commonality: 10
    },
    {
      name: "pack of zombies",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "zombies",
          threatLevel: 3,
          isSentient: true,
          archetypes: [
            byName$1("shambler", allArchetypes),
            byName$1("sprinter", allArchetypes)
          ],
          filter: new MobFilter(["zombie"], [], "", "", []),
          minNumber: 3,
          maxNumber: 6
        }
      ],
      tags: ["zombie", "undead"],
      commonality: 10
    },
    {
      name: "vampire",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "vampire",
          threatLevel: 5,
          isSentient: true,
          archetypes: [byName$1("warrior", allArchetypes)],
          filter: new MobFilter(["vampire"], [], "", "", []),
          minNumber: 1,
          maxNumber: 1
        }
      ],
      tags: ["vampire", "undead"],
      commonality: 2
    }
  ];
}
function all$2() {
  let allArchetypes = all$9();
  return [
    {
      name: "group of hunters",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "hunters",
          threatLevel: 3,
          isSentient: true,
          archetypes: [byName$1("hunter", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 3,
          maxNumber: 6
        }
      ],
      tags: ["hunters"],
      commonality: 5
    },
    {
      name: "lone hunter",
      threatLevel: 1,
      groupTemplates: [
        {
          name: "hunter",
          threatLevel: 1,
          isSentient: true,
          archetypes: [byName$1("hunter", allArchetypes)],
          filter: new MobFilter(["martial"], [], "humanoid", "", ["undead"]),
          minNumber: 1,
          maxNumber: 1
        }
      ],
      tags: ["hunters"],
      commonality: 1
    },
    {
      name: "swarming insects",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "swarming insects",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter(["swarm"], [], "", "", []),
          minNumber: 3,
          maxNumber: 8
        }
      ],
      tags: ["insect swarm"],
      commonality: 5
    },
    {
      name: "wandering creature",
      threatLevel: 3,
      groupTemplates: [
        {
          name: "wandering creature",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter([], [], "", "", []),
          minNumber: 1,
          maxNumber: 1
        }
      ],
      tags: ["wandering creature"],
      commonality: 10
    },
    {
      name: "group of wandering creatures",
      threatLevel: 5,
      groupTemplates: [
        {
          name: "wandering creatures",
          threatLevel: 3,
          isSentient: false,
          archetypes: [],
          filter: new MobFilter([], [], "", "", []),
          minNumber: 2,
          maxNumber: 4
        }
      ],
      tags: ["wandering creature"],
      commonality: 10
    }
  ];
}
function all$1(includeUndead) {
  let result = [];
  result = result.concat(all$8());
  result = result.concat(all$7());
  result = result.concat(all$6());
  result = result.concat(all$5());
  result = result.concat(all$4());
  result = result.concat(all$2());
  if (includeUndead) {
    result = result.concat(all$3());
  }
  return result;
}
function belowThreatLevel(level, templates) {
  return inThreatLevelRange(0, level, templates);
}
function inThreatLevelRange(minLevel, maxLevel, templates) {
  let result = [];
  for (let i = 0; i < templates.length; i++) {
    if (templates[i].threatLevel >= minLevel && templates[i].threatLevel <= maxLevel) {
      result.push(templates[i]);
    }
  }
  return result;
}
function withThreatLevel(level, templates) {
  return inThreatLevelRange(level, level, templates);
}
function withTag(tag, templates) {
  let result = [];
  for (let i = 0; i < templates.length; i++) {
    if (templates[i].tags.includes(tag)) {
      result.push(templates[i]);
    }
  }
  return result;
}
class DungeonTheme {
  name;
  mainEnvironment;
  nameGenerator;
  weakEncounterTemplates;
  strongEncounterTemplates;
  bossEncounterTemplates;
  sentientOptions;
  flooringOptions;
  roomThemes;
  requiredRooms;
  constructor(name, mainEnvironment, nameGenerator, weak, strong, boss, sentientOptions, flooringOptions, roomThemes, requiredRooms) {
    this.name = name;
    this.mainEnvironment = mainEnvironment;
    this.nameGenerator = nameGenerator;
    this.weakEncounterTemplates = weak;
    this.strongEncounterTemplates = strong;
    this.bossEncounterTemplates = boss;
    this.sentientOptions = sentientOptions;
    this.flooringOptions = flooringOptions;
    this.roomThemes = roomThemes;
    this.requiredRooms = requiredRooms;
  }
}
class RoomRequirement {
  theme;
  minCount;
  maxCount;
  constructor(theme, minCount, maxCount) {
    this.theme = theme;
    this.minCount = minCount;
    this.maxCount = maxCount;
  }
}
function getTheme$3() {
  let allEncounters = all$1(false);
  let allSentientOptions = sentient();
  allSentientOptions = withCreatureType("humanoid", allSentientOptions);
  let numberOfSentientOptions = random.int(1, 3);
  let cultEncounters = withTag("cult", allEncounters);
  let cultWeakEncounters = belowThreatLevel(3, cultEncounters);
  let cultStrongEncounters = inThreatLevelRange(3, 4, cultEncounters);
  let cultBossEncounters = withThreatLevel(5, cultEncounters);
  let cultNameGen = new MUN.GenericNameGenerator();
  let c1 = ["DEN", "DOMAIN", "LAIR"];
  let c2 = ["BALEFUL", "VILE", "DARK", "DEMONIC"];
  let c3 = ["BROTHERHOOD", "ORDER"];
  for (let i = 0; i < c1.length; i++) {
    for (let j = 0; j < c2.length; j++) {
      for (let k = 0; k < c3.length; k++) {
        cultNameGen.patterns.push(`THE ${c1[i]} OF THE ${c2[j]} ${c3[k]}`);
      }
    }
  }
  let cultSentientOptions = byTag$1("corruptible", allSentientOptions);
  cultSentientOptions = randomUniqueSet(cultSentientOptions, numberOfSentientOptions);
  const allRoomThemes = all$h();
  let barracks = byName("barracks", allRoomThemes);
  let altar = byName("altar room", allRoomThemes);
  let cultRoomThemes = byTag("cult", allRoomThemes);
  let dungeonRoomThemes = byTag("dungeon", allRoomThemes);
  cultRoomThemes = cultRoomThemes.concat(dungeonRoomThemes);
  return new DungeonTheme(
    "cult",
    "forest",
    cultNameGen,
    cultWeakEncounters,
    cultStrongEncounters,
    cultBossEncounters,
    cultSentientOptions,
    ["stone tile"],
    cultRoomThemes,
    [new RoomRequirement(altar, 1, 1), new RoomRequirement(barracks, 1, 1)]
  );
}
function getTheme$2() {
  let allEncounters = all$1(false);
  let allSentientOptions = sentient();
  allSentientOptions = withCreatureType("humanoid", allSentientOptions);
  let numberOfSentientOptions = random.int(1, 3);
  let fortressEncounters = withTag("martial", allEncounters);
  let fortressSentientOptions = byTag$1("martial", allSentientOptions);
  fortressSentientOptions = randomUniqueSet(
    fortressSentientOptions,
    numberOfSentientOptions
  );
  for (let i = 0; i < fortressEncounters.length; i++) {
    if (fortressEncounters[i].tags.includes("soldiers")) {
      fortressEncounters[i].commonality += 20;
    }
  }
  let fortressWeakEncounters = belowThreatLevel(3, fortressEncounters);
  let fortressStrongEncounters = inThreatLevelRange(3, 4, fortressEncounters);
  let fortressBossEncounters = withThreatLevel(5, fortressEncounters);
  let fortressNameGen = new MUN.GenericNameGenerator();
  let p1 = ["FORTRESS", "STRONGHOLD", "DOMAIN", "DOMINION", "LAIR"];
  let p2 = ["DARK", "DREAD", "DIRE", "IRON", "BLOODY", "CURSED"];
  let p3 = ["LEGION", "ARMY"];
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      for (let k = 0; k < p3.length; k++) {
        fortressNameGen.patterns.push(`THE ${p1[i]} OF THE ${p2[j]} ${p3[k]}`);
      }
    }
  }
  const allRoomThemes = all$h();
  let barracks = byName("barracks", allRoomThemes);
  let dungeonRoomThemes = byTag("dungeon", allRoomThemes);
  let militaryRoomThemes = byTag("military", allRoomThemes);
  let fortressRoomThemes = militaryRoomThemes.concat(dungeonRoomThemes);
  return new DungeonTheme(
    "fortress",
    "hill",
    fortressNameGen,
    fortressWeakEncounters,
    fortressStrongEncounters,
    fortressBossEncounters,
    fortressSentientOptions,
    ["stone tile"],
    fortressRoomThemes,
    [new RoomRequirement(barracks, 1, 2)]
  );
}
function getTheme$1() {
  let allEncounters = all$1(false);
  let allSentientOptions = sentient();
  allSentientOptions = withCreatureType("humanoid", allSentientOptions);
  let numberOfSentientOptions = random.int(1, 2);
  let magicSentientOptions = allSentientOptions;
  magicSentientOptions = randomUniqueSet(
    magicSentientOptions,
    numberOfSentientOptions
  );
  let magicEncounters = withTag("magic", allEncounters);
  magicEncounters = magicEncounters.concat(all$6());
  let magicWeakEncounters = belowThreatLevel(3, magicEncounters);
  let magicStrongEncounters = inThreatLevelRange(3, 4, magicEncounters);
  let magicBossEncounters = withThreatLevel(5, magicEncounters);
  let magicNameGen = new MUN.GenericNameGenerator();
  let m1 = [`LABORATORY`, `LAIR`, `DOMAIN`, `DOMINION`];
  let m2 = ["MAD", "DREAD", "DARK", "CRAZED", "RECLUSIVE", "DOOMED", "CURSED"];
  let m3 = ["ARCHMAGE", "SORCERER", "WIZARD", "WITCH", "WARLOCK"];
  for (let i = 0; i < m1.length; i++) {
    for (let j = 0; j < m2.length; j++) {
      for (let k = 0; k < m3.length; k++) {
        magicNameGen.patterns.push(`THE ${m1[i]} OF THE ${m2[j]} ${m3[k]}`);
      }
    }
  }
  const allRoomThemes = all$h();
  const dungeonRoomThemes = byTag("dungeon", allRoomThemes);
  let mageRoomThemes = byTag("mage", allRoomThemes);
  mageRoomThemes = mageRoomThemes.concat(dungeonRoomThemes);
  return new DungeonTheme(
    "mage lair",
    "forest",
    magicNameGen,
    magicWeakEncounters,
    magicStrongEncounters,
    magicBossEncounters,
    magicSentientOptions,
    ["stone tile", "marble"],
    mageRoomThemes,
    []
  );
}
function getTheme() {
  let allSentientOptions = sentient();
  allSentientOptions = withCreatureType("humanoid", allSentientOptions);
  let numberOfSentientOptions = random.int(1, 2);
  let tombSentientOptions = byTag$1("martial", allSentientOptions);
  tombSentientOptions = randomUniqueSet(tombSentientOptions, numberOfSentientOptions);
  let tombEncounters = all$6();
  tombEncounters = tombEncounters.concat(all$3());
  let tombWeakEncounters = belowThreatLevel(2, tombEncounters);
  let tombStrongEncounters = inThreatLevelRange(3, 4, tombEncounters);
  let tombBossEncounters = withThreatLevel(5, tombEncounters);
  let tombNameGen = new MUN.GenericNameGenerator();
  let t1 = ["TOMB", "CRYPT", "CATACOMBS", "MAUSOLEUM", "BARROWS"];
  let t2 = [
    `THE DAMNED`,
    `THE FORGOTTEN`,
    `THE LOST`,
    `WAKING NIGHTMARES`,
    `FORGOTTEN SOULS`,
    `LOST SOULS`
  ];
  for (let i = 0; i < t1.length; i++) {
    for (let j = 0; j < t2.length; j++) {
      tombNameGen.patterns.push(`THE ${t1[i]} OF ${t2[j]}`);
    }
  }
  const allRoomThemes = all$h();
  const dungeonRoomThemes = byTag("dungeon", allRoomThemes);
  let tombRoomThemes = byTag("tomb", allRoomThemes);
  tombRoomThemes = tombRoomThemes.concat(dungeonRoomThemes);
  return new DungeonTheme(
    "tomb",
    "hill",
    tombNameGen,
    tombWeakEncounters,
    tombStrongEncounters,
    tombBossEncounters,
    tombSentientOptions,
    ["stone tile"],
    tombRoomThemes,
    []
  );
}
function all() {
  let result = [];
  result.push(getTheme$3());
  result.push(getTheme$2());
  result.push(getTheme$1());
  result.push(getTheme());
  return result;
}
class TreasureTableEntry {
  commonality;
  generator;
  constructor(commonality, generator) {
    this.commonality = commonality;
    this.generator = generator;
  }
}
class TreasureTable {
  entries;
  constructor(entries) {
    this.entries = entries;
  }
}
class TreasureGeneratorConfig {
  tables;
  constructor() {
    this.tables = [];
  }
}
class TreasureResultGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let result = [];
    for (const table of this.config.tables) {
      let possibleItems = table.entries;
      let t = RND.weighted(possibleItems);
      let gen = t.generator;
      let items = gen.generate();
      result = result.concat(items);
    }
    return result;
  }
}
class Key {
  name;
  description;
  value;
  lockId;
  quality;
  tags;
}
class ArtObject {
  name;
  description;
  value;
  quality;
  tags;
  constructor() {
    this.name = "an art object";
    this.description = "an art object";
    this.value = 10;
    this.quality = 2;
    this.tags = ["art object"];
  }
}
class ArtObjectGenerator {
  minValue;
  maxValue;
  count;
  constructor(min, max, count) {
    this.minValue = min;
    this.maxValue = max;
    this.count = count;
  }
  generate() {
    let objects = [];
    for (let i = 0; i < this.count; i++) {
      let object = new ArtObject();
      object.value = random.int(this.minValue, this.maxValue);
      object.name = getArtObjectForValue(this.minValue, this.maxValue);
      let worth = valueToCoins(object.value, false, false, false);
      object.description = `${Words.article(object.name)} ${object.name} worth ${worth}`;
      objects.push(object);
    }
    return objects;
  }
}
function getArtObjectForValue(minValue, maxValue) {
  const allOptions = getArtObjects();
  let options = [];
  for (let i = 0; i < allOptions.length; i++) {
    if (allOptions[i].value >= minValue && allOptions[i].value <= maxValue) {
      options.push(allOptions[i].name);
    }
  }
  return RND.item(options);
}
function getArtObjects() {
  return [
    {
      name: "silver ewer",
      value: 2500
    },
    {
      name: "carved bone statuette",
      value: 2500
    },
    {
      name: "small gold bracelet",
      value: 2500
    },
    {
      name: "cloth-of-gold vestments",
      value: 2500
    },
    {
      name: "black velvet mask stitched with silver thread",
      value: 2500
    },
    {
      name: "copper chalice with silver filigree",
      value: 2500
    },
    {
      name: "pair of engraved bone dice",
      value: 2500
    },
    {
      name: "small mirror set in a painted wood frame",
      value: 2500
    },
    {
      name: "embroidered silk handkerchief",
      value: 2500
    },
    {
      name: "gold locket with a painted portrait inside",
      value: 2500
    },
    {
      name: "gold ring set with bloodstones",
      value: 25e3
    },
    {
      name: "carved ivory statuette",
      value: 25e3
    },
    {
      name: "large gold bracelet",
      value: 25e3
    },
    {
      name: "silver necklace with a gemstone pendant",
      value: 25e3
    },
    {
      name: "bronze crown",
      value: 25e3
    },
    {
      name: "silk robe with gold embroidery",
      value: 25e3
    },
    {
      name: "large well-made tapestry",
      value: 25e3
    },
    {
      name: "brass mug with jade inlay",
      value: 25e3
    },
    {
      name: "box of turquoise animal figurines",
      value: 25e3
    },
    {
      name: "gold bird cage with electrum filigree",
      value: 25e3
    },
    {
      name: "silver chalice set with moonstones",
      value: 75e3
    },
    {
      name: "silver-plated steel longsword with jet set in hilt",
      value: 75e3
    },
    {
      name: "carved harp of exotic wood with ivory inlay and zircon gems",
      value: 75e3
    },
    {
      name: "small gold idol",
      value: 75e3
    },
    {
      name: "gold dragon comb set with red garnets as eyes",
      value: 75e3
    },
    {
      name: "bottle stopper cork embossed with gold leaf and set with amethysts",
      value: 75e3
    },
    {
      name: "ceremonial electrum dagger with a black pearl in the pommel",
      value: 75e3
    },
    {
      name: "silver and gold brooch",
      value: 75e3
    },
    {
      name: "obsidian statuette with gold fittings and inlay",
      value: 75e3
    },
    {
      name: "painted gold war mask",
      value: 75e3
    },
    {
      name: "fine gold chain set with a fire opal",
      value: 25e4
    },
    {
      name: "old masterpiece painting",
      value: 25e4
    },
    {
      name: "embroidered silk and velvet mantle set with numerous moonstones",
      value: 25e4
    },
    {
      name: "platinum bracelet set with a sapphire",
      value: 25e4
    },
    {
      name: "embroidered glove set with jewel chips",
      value: 25e4
    },
    {
      name: "jeweled anklet",
      value: 25e4
    },
    {
      name: "gold music box",
      value: 25e4
    },
    {
      name: "gold circlet set with four aquamarines",
      value: 25e4
    },
    {
      name: "eye patch with a mock eye set in blue sapphire and moonstone",
      value: 25e4
    },
    {
      name: "necklace string of small pink pearls",
      value: 25e4
    },
    {
      name: "jeweled gold crown",
      value: 75e4
    },
    {
      name: "jeweled platinum ring",
      value: 75e4
    },
    {
      name: "small gold stattuete set with rubies",
      value: 75e4
    },
    {
      name: "gold cup set with emeralds",
      value: 75e4
    },
    {
      name: "painted gold child's sarcophagus",
      value: 75e4
    },
    {
      name: "jade game board with solid gold playing pieces",
      value: 75e4
    },
    {
      name: "bejeweled ivory drinking horn with gold filigree",
      value: 75e4
    }
  ];
}
class BagOfCoins {
  name;
  description;
  value;
  quality;
  tags;
  constructor() {
    this.name = "a bag of coins";
    this.description = "a bag of coins";
    this.value = 10;
    this.quality = 1;
    this.tags = ["bag of coins"];
  }
}
class CoinGenerator {
  cp;
  sp;
  ep;
  gp;
  pp;
  constructor(cp, sp, ep, gp, pp) {
    this.cp = cp;
    this.sp = sp;
    this.ep = ep;
    this.gp = gp;
    this.pp = pp;
  }
  generate() {
    let bag = new BagOfCoins();
    let cp = 0;
    let sp = 0;
    let ep = 0;
    let gp = 0;
    let pp = 0;
    if (this.cp != "") {
      cp = roll(this.cp);
    }
    if (this.sp != "") {
      sp = roll(this.sp);
    }
    if (this.ep != "") {
      ep = roll(this.ep);
    }
    if (this.gp != "") {
      gp = roll(this.gp);
    }
    if (this.pp != "") {
      pp = roll(this.pp);
    }
    bag.value = cp + sp * 10 + ep * 50 + gp * 100 + pp * 1e3;
    let coinCount = cp + sp + ep + gp + pp;
    let container = RND.item(["bag", "pouch", "purse"]);
    if (coinCount > 1e3) {
      container = RND.item(["chest", "large chest"]);
    } else if (coinCount > 250) {
      container = RND.item(["chest", "satchel"]);
    } else if (coinCount > 100) {
      container = RND.item(["sack", "box"]);
    }
    bag.name = `a ${container} of coins`;
    bag.description = "a " + container + " of coins " + RND.item(["containing", "holding", "with"]) + " ";
    let moneys = [];
    if (cp > 0) {
      moneys.push(`${new Intl.NumberFormat().format(cp)} cp`);
    }
    if (sp > 0) {
      moneys.push(`${new Intl.NumberFormat().format(sp)} sp`);
    }
    if (ep > 0) {
      moneys.push(`${new Intl.NumberFormat().format(ep)} ep`);
    }
    if (gp > 0) {
      moneys.push(`${new Intl.NumberFormat().format(gp)} gp`);
    }
    if (pp > 0) {
      moneys.push(`${new Intl.NumberFormat().format(pp)} pp`);
    }
    bag.description += Words.arrayToPhrase(moneys);
    return [bag];
  }
}
class Gem {
  name;
  description;
  value;
  quality;
  tags;
  constructor() {
    this.name = "a gem";
    this.description = "a gem";
    this.value = 10;
    this.quality = 2;
    this.tags = ["gem"];
  }
}
class GemGenerator {
  minValue;
  maxValue;
  gemCount;
  constructor(min, max, gemCount) {
    this.minValue = min;
    this.maxValue = max;
    this.gemCount = gemCount;
  }
  generate() {
    let gems = [];
    for (let i = 0; i < this.gemCount; i++) {
      let gem = new Gem();
      gem.value = random.int(this.minValue, this.maxValue);
      if (gem.value < 1100) {
        gem.name = RND.item(getOrnamental());
      } else if (gem.value < 8100) {
        gem.name = RND.item(getSemiprecious());
      } else if (gem.value < 15100) {
        gem.name = RND.item(getFancy());
      } else if (gem.value < 50100) {
        gem.name = RND.item(getPrecious());
      } else if (gem.value < 100100) {
        gem.name = RND.item(getGemstones());
      } else {
        gem.name = RND.item(getJewels());
      }
      let worth = valueToCoins(gem.value, false, false, false);
      gem.description = `${Words.article(gem.name)} ${gem.name} worth ${worth}`;
      gems.push(gem);
    }
    return gems;
  }
}
function getOrnamental() {
  return [
    "banded agate",
    "eye agate",
    "moss agate",
    "azurite",
    "blue quartz",
    "hematite",
    "lapis lazuli",
    "malachite",
    "obsidian",
    "rhodochrosite",
    "tiger eye",
    "turquoise",
    "irregular freshwater pearl"
  ];
}
function getSemiprecious() {
  return [
    "bloodstone",
    "carnelian",
    "chalcedony",
    "chrysoprase",
    "citrine",
    "jasper",
    "moonstone",
    "onyx",
    "quartz",
    "sardonyx",
    "star rose quartz",
    "zircon"
  ];
}
function getFancy() {
  return [
    "amber",
    "amethyst",
    "chrysoberyl",
    "coral",
    "garnet",
    "jade",
    "jet",
    "pearl",
    "spinel",
    "tourmaline"
  ];
}
function getPrecious() {
  return ["alexandrite", "aquamarine", "black pearl", "blue spinel", "peridot", "topaz"];
}
function getGemstones() {
  return [
    "black opal",
    "blue sapphire",
    "emerald",
    "fire opal",
    "opal",
    "star ruby",
    "star sapphire",
    "yellow sapphire"
  ];
}
function getJewels() {
  return ["black sapphire", "diamond", "jacinth", "ruby"];
}
class MagicItemGenerator {
  minValue;
  maxValue;
  count;
  constructor(min, max, count) {
    this.minValue = min;
    this.maxValue = max;
    this.count = count;
  }
  generate() {
    let items = [];
    let possibleItems = all$l();
    for (let i = 0; i < this.count; i++) {
      let itemGenConfig = new ItemGeneratorConfig();
      itemGenConfig.pattern = RND.item(possibleItems);
      itemGenConfig.useMutator = true;
      itemGenConfig.minQuality = 2;
      itemGenConfig.maxQuality = 5;
      itemGenConfig.minValue = this.minValue;
      itemGenConfig.maxValue = this.maxValue;
      let itemGen = new ItemGenerator(itemGenConfig);
      let item = itemGen.generate();
      let worth = valueToCoins(item.value, false, false, false);
      item.description = `${Words.article(item.name)} ${item.name} worth ${worth}`;
      items.push(item);
    }
    return items;
  }
}
function horde$1() {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator("6d6x100", "3d6x100", "", "2d6x10", ""))
    ]),
    new TreasureTable([
      new TreasureTableEntry(8, new GemGenerator(900, 1e3, roll("2d6"))),
      new TreasureTableEntry(12, new ArtObjectGenerator(1500, 3500, roll("2d4"))),
      new TreasureTableEntry(8, new GemGenerator(4500, 5e3, roll("2d6")))
    ])
  ];
}
function individual$2() {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator("5d6", "", "", "", "")),
      new TreasureTableEntry(30, new CoinGenerator("", "4d6", "", "", "")),
      new TreasureTableEntry(10, new CoinGenerator("", "", "3d6", "", "")),
      new TreasureTableEntry(25, new CoinGenerator("", "", "", "3d6", "")),
      new TreasureTableEntry(5, new CoinGenerator("", "", "", "", "1d6"))
    ])
  ];
}
function horde() {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator("", "", "", "4d6x1000", "5d6x100"))
    ]),
    new TreasureTable([
      new TreasureTableEntry(20, new ArtObjectGenerator(2e4, 3e4, roll("2d4"))),
      new TreasureTableEntry(30, new GemGenerator(45e3, 5e4, roll("3d6"))),
      new TreasureTableEntry(8, new GemGenerator(95e3, 1e5, roll("3d6"))),
      new TreasureTableEntry(10, new ArtObjectGenerator(7e4, 8e4, roll("2d4")))
    ]),
    new TreasureTable([
      new TreasureTableEntry(5, new MagicItemGenerator(1e4, 3e4, roll("1d6")))
    ])
  ];
}
function individual$1() {
  return [
    new TreasureTable([
      new TreasureTableEntry(20, new CoinGenerator("", "4d6x100", "", "1d6x100", "")),
      new TreasureTableEntry(15, new CoinGenerator("", "", "1d6x100", "1d6x100", "")),
      new TreasureTableEntry(40, new CoinGenerator("", "", "", "2d6x100", "1d6x10")),
      new TreasureTableEntry(25, new CoinGenerator("", "", "", "2d6x100", "2d6x10"))
    ])
  ];
}
function individual() {
  return [
    new TreasureTable([
      new TreasureTableEntry(30, new CoinGenerator("4d6x100", "", "1d6x10", "", "")),
      new TreasureTableEntry(30, new CoinGenerator("", "6d6x10", "", "2d6x10", "")),
      new TreasureTableEntry(10, new CoinGenerator("", "", "1d6x100", "2d6x10", "")),
      new TreasureTableEntry(25, new CoinGenerator("", "", "", "4d6x10", "")),
      new TreasureTableEntry(5, new CoinGenerator("", "", "", "2d6x10", "3d6"))
    ])
  ];
}
class TreasureSpawn {
  minRoom;
  maxRoom;
  treasure;
  behavior;
  value;
  // in copper coins
  isCarried;
  isHidden;
  constructor() {
    this.minRoom = -1;
    this.maxRoom = -1;
    this.value = 1;
    this.treasure = [];
    this.isCarried = false;
    this.isHidden = false;
  }
}
function generate(config) {
  let themeOptions = all();
  let theme = RND.item(themeOptions);
  let dungeon = {
    environment: "",
    name: "",
    description: "",
    theme,
    rooms: [],
    doors: [],
    tiles: [],
    totalThreatLevel: 0,
    averageThreatLevel: 0
  };
  dungeon.environment = RND.item([
    "arctic",
    "coastal",
    "desert",
    "forest",
    "grassland",
    "hill",
    "mountain",
    "urban",
    "underdark"
  ]);
  dungeon.tiles = initializeTiles(config.width, config.height);
  dungeon.name = dungeon.theme.nameGenerator.generate(1)[0];
  dungeon = generateEntrance(dungeon, config.width, config.height);
  let numRooms = random.int(config.minRooms, config.maxRooms);
  dungeon = generateRooms(dungeon, numRooms, config.width, config.height);
  for (let i = 0; i < 2; i++) {
    dungeon = addDoorsToDungeon(dungeon);
  }
  dungeon = addLight(dungeon);
  let keySpawns = generateKeySpawns(dungeon);
  let encounterSpawns = [];
  let numberOfEncounters = 0;
  for (let i = 1; i < dungeon.rooms.length; i++) {
    let encounterChance = RND.simple(100);
    let encounterType = "none";
    if (i == dungeon.rooms.length - 1) {
      encounterType = "boss";
    } else if (encounterChance > 90) {
      encounterType = "strong";
    } else if (encounterChance > 30) {
      encounterType = "weak";
    }
    if (encounterType != "none") {
      let spawn = generateEncounterSpawn(dungeon, encounterType, i);
      encounterSpawns.push(spawn);
      numberOfEncounters++;
    }
  }
  let treasureSpawns = generateTreasureHordes(dungeon);
  dungeon = generateEncounters(dungeon, encounterSpawns);
  dungeon = generateKeys(dungeon, keySpawns);
  dungeon = generateTreasure(dungeon, treasureSpawns);
  dungeon.averageThreatLevel = Math.floor(dungeon.totalThreatLevel / numberOfEncounters);
  return dungeon;
}
function getDefaultConfig() {
  let climate = RND.item(all$k());
  let biomeGenConfig = getDefaultConfig$2();
  biomeGenConfig.climate = climate;
  let biomes = [];
  for (let i = 0; i < 5; i++) {
    biomeGenConfig.climate = RND.item(all$k());
    biomes.push(generate$3(biomeGenConfig));
  }
  return {
    width: 40,
    height: 50,
    maxRooms: 30,
    minRooms: 20,
    minThreatLevel: 0,
    maxThreatLevel: 5,
    possibleBiomes: biomes
  };
}
function addLight(dungeon) {
  let allMutators = all$j();
  let lights = withTag$1("light", allMutators);
  for (let i = 0; i < dungeon.rooms.length; i++) {
    if (RND.simple(100) > 60) {
      let lightMutator = RND.item(lights);
      dungeon.rooms[i] = lightMutator.mutate(dungeon.rooms[i]);
    }
  }
  return dungeon;
}
function addRoomToTiles(room, tiles) {
  for (let i = 0; i < room.vertices.length; i++) {
    tiles[room.vertices[i].y][room.vertices[i].x] = ROOM;
  }
  return tiles;
}
function generateEncounters(dungeon, encounterSpawns) {
  for (let i = 0; i < encounterSpawns.length; i++) {
    let maxRoom = encounterSpawns[i].maxRoom;
    if (maxRoom == -1) {
      maxRoom = dungeon.rooms.length - 1;
    }
    let minRoom = encounterSpawns[i].minRoom;
    let roomId = random.int(minRoom, maxRoom);
    let eGenConfig = encounterSpawns[i].encounterConfig;
    let encounter = generate$1(eGenConfig);
    dungeon.rooms[roomId].encounters.push(encounter);
    dungeon.totalThreatLevel += encounter.totalThreatLevel;
    if (encounterSpawns[i].treasureSpawns.length > 0) {
      for (let j = 0; j < encounterSpawns[i].treasureSpawns.length; j++) {
        let ts = encounterSpawns[i].treasureSpawns[j];
        for (let k = 0; k < encounter.groups.length; k++) {
          for (let l = 0; l < encounter.groups[k].mobs.length; l++) {
            if (RND.simple(100) > 50) {
              encounter.groups[k].mobs[l].carried.push(RND.item(ts.treasure));
            }
          }
        }
      }
    }
  }
  return dungeon;
}
function generateEncounterSpawn(dungeon, encounterType, roomId) {
  let config = getDefaultConfig$1();
  config.environment = dungeon.environment;
  config.sentientOptions = dungeon.theme.sentientOptions;
  let treasureTables = individual$2();
  if (encounterType == "boss") {
    config.template = RND.weighted(dungeon.theme.bossEncounterTemplates);
    config.minThreatLevel = 3;
    config.maxThreatLevel = 10;
    treasureTables = individual$1();
  } else if (encounterType == "strong") {
    config.template = RND.weighted(dungeon.theme.strongEncounterTemplates);
    treasureTables = individual();
  } else {
    config.template = RND.weighted(dungeon.theme.weakEncounterTemplates);
  }
  let spawn = { minRoom: roomId, maxRoom: roomId, encounterConfig: config, treasureSpawns: [] };
  let addTreasureToEncounter = false;
  if (spawn.encounterConfig.template === null) {
    throw new Error("Encounter template is null");
  }
  for (let j = 0; j < spawn.encounterConfig.template.groupTemplates.length; j++) {
    if (spawn.encounterConfig.template.groupTemplates[j].isSentient) {
      addTreasureToEncounter = true;
    }
  }
  let treasureConfig = new TreasureGeneratorConfig();
  treasureConfig.tables = treasureTables;
  let treasureGen = new TreasureResultGenerator(treasureConfig);
  let treasure = treasureGen.generate();
  let ts = new TreasureSpawn();
  ts.treasure = ts.treasure.concat(treasure);
  if (addTreasureToEncounter) {
    spawn.treasureSpawns.push(ts);
  }
  return spawn;
}
function generateEntrance(dungeon, mapWidth, mapHeight) {
  let entranceTheme = getEntrance();
  entranceTheme.flooringOptions = dungeon.theme.flooringOptions;
  let roomGenConfig = new RoomGeneratorConfig(mapWidth, mapHeight, entranceTheme);
  let roomGen = new RoomGenerator(roomGenConfig);
  let firstRoom = roomGen.generate();
  firstRoom.id = 0;
  dungeon.rooms.push(firstRoom);
  dungeon.tiles = addRoomToTiles(firstRoom, dungeon.tiles);
  return dungeon;
}
function generateKeySpawns(dungeon) {
  let keySpawns = [];
  for (let i = 0; i < dungeon.doors.length; i++) {
    if (dungeon.doors[i].lock !== null) {
      let keySpawn = new TreasureSpawn();
      keySpawn.behavior = `This key unlocks the door between room ${dungeon.doors[i].room1 + 1} and room ${dungeon.doors[i].room2 + 1} in ${dungeon.name}.`;
      keySpawn.minRoom = 0;
      keySpawn.maxRoom = dungeon.doors[i].room1;
      let key = new Key();
      key.name = "a key";
      let lock = dungeon.doors[i].lock;
      if (lock === null) {
        throw new Error("Door has no lock but expected one");
      }
      key.lockId = lock.id;
      let keyDescription = RND.item([
        `a ${RND.item(["simple", "plain", "rough"])} key`,
        `a ${RND.item(["small", "ornate", "shiny", "tarnished"])} key`
      ]);
      key.description = `${keyDescription} that unlocks the door between room ${dungeon.doors[i].room1 + 1} and room ${dungeon.doors[i].room2 + 1}`;
      key.value = random.int(1, 10);
      keySpawn.treasure.push(key);
      keySpawns.push(keySpawn);
    }
  }
  return keySpawns;
}
function generateKeys(dungeon, keySpawns) {
  for (let i = 0; i < keySpawns.length; i++) {
    let roomId = random.int(keySpawns[i].minRoom, keySpawns[i].maxRoom);
    if (dungeon.rooms[roomId].encounters.length > 0) {
      let e = RND.item(dungeon.rooms[roomId].encounters);
      let m = RND.item(e.groups[0].mobs);
      m.carried.push(keySpawns[i].treasure[0]);
    } else {
      dungeon.rooms[roomId].treasureCaches.push(keySpawns[i].treasure[0].description);
    }
  }
  return dungeon;
}
function generateRooms(dungeon, numRooms, mapWidth, mapHeight) {
  let id = 0;
  let roomGeneration = true;
  let failedIterations = 0;
  let failedMax = 5;
  for (let i = 0; i < dungeon.theme.requiredRooms.length; i++) {
    let rr = dungeon.theme.requiredRooms[i];
    let roomCount = random.int(rr.minCount, rr.maxCount);
    for (let j = 0; j < roomCount; j++) {
      let r = getPlaceableRoom(mapWidth, mapHeight, rr.theme, dungeon.rooms);
      if (r === null) {
        console.debug(`Room broke`, rr, dungeon.theme.name);
      } else {
        id += 1;
        r.id = id;
        dungeon.rooms.push(r);
        dungeon.tiles = addRoomToTiles(r, dungeon.tiles);
      }
    }
  }
  while (roomGeneration) {
    if (dungeon.rooms.length >= numRooms) {
      roomGeneration = false;
    } else {
      let roomTheme = RND.weighted(dungeon.theme.roomThemes);
      if (roomTheme.environment == dungeon.theme.mainEnvironment) {
        roomTheme.flooringOptions = dungeon.theme.flooringOptions;
      }
      let r = getPlaceableRoom(mapWidth, mapHeight, roomTheme, dungeon.rooms);
      if (r === null) {
        failedIterations++;
      } else {
        id += 1;
        r.id = id;
        dungeon.rooms.push(r);
        dungeon.tiles = addRoomToTiles(r, dungeon.tiles);
      }
      if (failedIterations > failedMax) {
        roomGeneration = false;
      }
    }
  }
  return dungeon;
}
function generateTreasure(dungeon, treasureSpawns) {
  for (let i = 0; i < treasureSpawns.length; i++) {
    let maxRoom = treasureSpawns[i].maxRoom;
    if (maxRoom == -1) {
      maxRoom = dungeon.rooms.length - 1;
    }
    let minRoom = treasureSpawns[i].minRoom;
    if (minRoom == -1) {
      minRoom = 1;
    }
    let roomId = random.int(minRoom, maxRoom);
    let descriptions = [];
    for (const t of treasureSpawns[i].treasure) {
      descriptions.push(t.description);
    }
    let treasureDescription = Words.arrayToPhrase(descriptions);
    if (treasureSpawns[i].isHidden) {
      treasureDescription += `, hidden somewhere in the room`;
      dungeon.rooms[roomId].treasureCaches.push(treasureDescription);
    } else if (treasureSpawns[i].isCarried) {
      let te = RND.item(dungeon.rooms[roomId].encounters);
      let mob = RND.item(te.groups[0].mobs);
      mob.carried.push(treasureDescription);
    } else {
      let containers = [];
      for (let i2 = 0; i2 < dungeon.rooms[roomId].features.length; i2++) {
        if (dungeon.rooms[roomId].features[i2].isContainer) {
          containers.push(i2);
        }
      }
      if (containers.length > 0) {
        if (RND.simple(100) > 10) {
          treasureDescription += ", inside " + dungeon.rooms[roomId].features[RND.item(containers)].name;
        }
        dungeon.rooms[roomId].treasureCaches.push(treasureDescription);
      } else {
        dungeon.rooms[roomId].treasureCaches.push(treasureDescription);
      }
    }
  }
  return dungeon;
}
function generateTreasureHordes(dungeon) {
  let hordeChance = 100;
  let treasureSpawns = [];
  let commonHordeTables = horde$1();
  let bossHordeTables = horde();
  for (let i = 1; i < dungeon.rooms.length; i++) {
    if (RND.simple(100) > hordeChance) {
      let hordeConfig = new TreasureGeneratorConfig();
      hordeConfig.tables = commonHordeTables;
      if (i == dungeon.rooms.length - 1) {
        hordeConfig.tables = bossHordeTables;
      }
      let treasureGen = new TreasureResultGenerator(hordeConfig);
      let treasure = treasureGen.generate();
      let horde2 = new TreasureSpawn();
      horde2.treasure = horde2.treasure.concat(treasure);
      treasureSpawns.push(horde2);
      hordeChance = 100;
    } else {
      hordeChance -= 2;
    }
  }
  return treasureSpawns;
}
function initializeTiles(width, height) {
  let v = [];
  for (let y = 0; y < height; y++) {
    let row = [];
    v[y] = row;
    for (let x = 0; x < width; x++) {
      v[y][x] = STONE;
    }
  }
  return v;
}
const css = {
  code: 'div.svelte-jl2xcj.svelte-jl2xcj,h1.svelte-jl2xcj.svelte-jl2xcj,h2.svelte-jl2xcj.svelte-jl2xcj,h3.svelte-jl2xcj.svelte-jl2xcj,h4.svelte-jl2xcj.svelte-jl2xcj,p.svelte-jl2xcj.svelte-jl2xcj,strong.svelte-jl2xcj.svelte-jl2xcj,ul.svelte-jl2xcj.svelte-jl2xcj,li.svelte-jl2xcj.svelte-jl2xcj,label.svelte-jl2xcj.svelte-jl2xcj,canvas.svelte-jl2xcj.svelte-jl2xcj,section.svelte-jl2xcj.svelte-jl2xcj{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-jl2xcj.svelte-jl2xcj{display:block}ul.svelte-jl2xcj.svelte-jl2xcj{list-style:none}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-jl2xcj.svelte-jl2xcj,h2.svelte-jl2xcj.svelte-jl2xcj,h3.svelte-jl2xcj.svelte-jl2xcj,h4.svelte-jl2xcj.svelte-jl2xcj{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-jl2xcj.svelte-jl2xcj{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-jl2xcj.svelte-jl2xcj{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-jl2xcj.svelte-jl2xcj{font-size:2rem;line-height:2rem}h4.svelte-jl2xcj.svelte-jl2xcj{font-size:1.5rem;line-height:1.5rem}p.svelte-jl2xcj.svelte-jl2xcj{margin:1rem 0}label.svelte-jl2xcj.svelte-jl2xcj{font-weight:700;margin-right:1rem}input.svelte-jl2xcj.svelte-jl2xcj{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-jl2xcj.svelte-jl2xcj{margin-bottom:1rem}ul.svelte-jl2xcj li.svelte-jl2xcj{list-style-type:disc;margin-left:2rem}strong.svelte-jl2xcj.svelte-jl2xcj{font-weight:700}section.main.svelte-jl2xcj.svelte-jl2xcj{padding:0.5rem}#seed.svelte-jl2xcj.svelte-jl2xcj{font-family:monospace}.fantasy.svelte-jl2xcj button.svelte-jl2xcj{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-jl2xcj button.svelte-jl2xcj:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-jl2xcj button.svelte-jl2xcj:disabled{background:#666;color:#777;border-color:#999}div.mobs.svelte-jl2xcj.svelte-jl2xcj{display:block;padding:0;margin:0}div.mob.svelte-jl2xcj.svelte-jl2xcj{border:1px solid black;padding:0.5rem;margin:0.5rem}div.mob.svelte-jl2xcj>h4.svelte-jl2xcj{display:block;font-size:1rem;margin:0;padding:0;width:100%;border-bottom:1px solid black}div.room-description.svelte-jl2xcj.svelte-jl2xcj{border:3px solid black;padding:0.5rem;margin:0.5rem}div.room-secrets.svelte-jl2xcj.svelte-jl2xcj{padding:0.5rem}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seed = RND.randomString(13);
  let minRooms = 20;
  let maxRooms = 30;
  let config = getDefaultConfig();
  config.minRooms = minRooms;
  config.maxRooms = maxRooms;
  let dungeon = generate(config);
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-negoxg_START -->${$$result.title = `<title>Dungeon Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-negoxg_END -->`, ""} <section class="fantasy main svelte-jl2xcj"><h1 class="svelte-jl2xcj" data-svelte-h="svelte-ouv5ej">Dungeon Generator</h1> <p class="svelte-jl2xcj" data-svelte-h="svelte-ma8c12">A dungeon generator.</p> <div class="input-group svelte-jl2xcj"><label for="seed" class="svelte-jl2xcj" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-jl2xcj"${add_attribute("value", seed, 0)}></div> <div class="input-group svelte-jl2xcj"><label for="minRooms" class="svelte-jl2xcj" data-svelte-h="svelte-1oarxv4">Min. Rooms</label> <input type="number" name="minRooms" id="minRooms" class="svelte-jl2xcj"${add_attribute("value", minRooms, 0)}></div> <div class="input-group svelte-jl2xcj"><label for="maxRooms" class="svelte-jl2xcj" data-svelte-h="svelte-fugdp8">Max. Rooms</label> <input type="number" name="maxRooms" id="maxRooms" class="svelte-jl2xcj"${add_attribute("value", maxRooms, 0)}></div> <button class="svelte-jl2xcj" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-jl2xcj" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-jl2xcj">${escape(dungeon.name)}</h2> <p class="svelte-jl2xcj"><strong class="svelte-jl2xcj" data-svelte-h="svelte-1kamiyt">Environment:</strong> ${escape(dungeon.environment)}</p> <p class="svelte-jl2xcj"><strong class="svelte-jl2xcj" data-svelte-h="svelte-1cj036k">Total Threat Level:</strong> ${escape(dungeon.totalThreatLevel)}</p> <p class="svelte-jl2xcj"><strong class="svelte-jl2xcj" data-svelte-h="svelte-1ejia3j">Average Threat Level:</strong> ${escape(dungeon.averageThreatLevel)}</p> <canvas id="mapCanvas" width="800" height="1000" class="svelte-jl2xcj"></canvas> ${each(dungeon.rooms, (room) => {
    return `<div class="room svelte-jl2xcj"><h3 class="svelte-jl2xcj">${escape(room.id + 1)}. ${escape(Words.title(room.name))}</h3> ${room.lightLevel == 0 ? `<p class="svelte-jl2xcj" data-svelte-h="svelte-94wbjp">This room is dark.</p>` : ``} <div class="room-description svelte-jl2xcj">${escape(room.description)} ${each(room.features, (feature) => {
      return `${escape(feature.description + " ")}`;
    })}</div> ${room.secrets != "" ? `<div class="room-secrets svelte-jl2xcj">${escape(room.secrets)} </div>` : ``} <div class="encounter svelte-jl2xcj">${each(room.encounters, (encounter) => {
      return `${each(encounter.groups, (group) => {
        return `<p class="svelte-jl2xcj">There ${group.mobs.length > 1 ? `are ${escape(group.mobs.length)}` : `is ${escape(Words.article(group.name))}`} ${escape(group.name)} here.</p> <div class="mobs svelte-jl2xcj">${each(group.mobs, (mob) => {
          return `<div class="mob svelte-jl2xcj"><h4 class="svelte-jl2xcj">${escape(mob.name)}, ${escape(mob.summary)} (TL ${escape(mob.threatLevel)})</h4> ${mob.abilities.length > 0 ? `<p class="svelte-jl2xcj" data-svelte-h="svelte-rzkllc">Abilities:</p> <ul class="svelte-jl2xcj">${each(mob.abilities, (ability) => {
            return `<li class="svelte-jl2xcj"><strong class="svelte-jl2xcj">${escape(ability.name)}:</strong> ${escape(ability.description)}</li>`;
          })} </ul>` : ``} ${mob.carried.length > 0 ? `<p class="svelte-jl2xcj" data-svelte-h="svelte-z9itxp">Carrying the following:</p> <ul class="svelte-jl2xcj">${each(mob.carried, (item) => {
            return `<li class="svelte-jl2xcj">${escape(item.description)}, worth ${escape(valueToCoins(item.value, false, false, false))}</li>`;
          })} </ul>` : ``} </div>`;
        })} </div>`;
      })}`;
    })}</div> ${room.treasureCaches.length > 0 ? `<div class="treasure svelte-jl2xcj"><h4 class="svelte-jl2xcj" data-svelte-h="svelte-1y7msnj">Treasure</h4> <ul class="svelte-jl2xcj">${each(room.treasureCaches, (cache) => {
      return `<li class="svelte-jl2xcj">${escape(cache)}</li>`;
    })}</ul> </div>` : ``} </div>`;
  })}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-d26240fc.js.map
