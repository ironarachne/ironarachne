import type Door from "./door.js";
import type DungeonTheme from "./dungeon_theme.js";
import type Room from "./rooms/room.js";

export default interface Dungeon {
  name: string;
  description: string;
  theme: DungeonTheme;
  environment: string;
  totalThreatLevel: number;
  averageThreatLevel: number;
  rooms: Room[];
  doors: Door[];
  tiles: number[][];
}
