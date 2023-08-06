"use strict";

import Door from "./door.js";
import DungeonTheme from "./dungeontheme.js";
import Room from "./rooms/room.js";

export default class Dungeon {
  name: string;
  description: string;
  theme: DungeonTheme;
  environment: string;
  totalThreatLevel: number;
  averageThreatLevel: number;
  rooms: Room[];
  doors: Door[];
  tiles: number[][];

  constructor() {
    this.doors = [];
    this.rooms = [];
    this.totalThreatLevel = 0;
  }
}
