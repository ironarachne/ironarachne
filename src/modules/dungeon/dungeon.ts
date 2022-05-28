"use strict";

import type Biome from "../environment/biomes/biome";
import Door from "./door";
import Room from "./room";

export default class Dungeon {
  name: string;
  description: string;
  biome: Biome;
  rooms: Room[];
  doors: Door[];
  tiles: number[][];

  constructor() {
    this.rooms = [];
    this.doors = [];
  }
}
