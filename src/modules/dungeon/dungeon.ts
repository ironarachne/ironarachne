'use strict';

import type Biome from '../environment/biomes/biome';
import Door from './door';
import DungeonTheme from './dungeontheme';
import Room from './rooms/room';

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
  }
}
