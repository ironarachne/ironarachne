'use strict';

import type Biome from '../environment/biomes/biome';
import Door from './door';
import DungeonTheme from './dungeontheme';
import Room from './room';

export default class Dungeon {
  name: string;
  description: string;
  theme: DungeonTheme;
  biome: Biome;
  rooms: Room[];
  doors: Door[];
  tiles: number[][];

  constructor() {
    this.doors = [];
    this.rooms = [];
  }
}
