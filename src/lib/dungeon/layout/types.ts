import type { Grid } from '../grid/types';
import type { RoomPrimitive } from '../room/types';

export type PlacedRoom = {
  x: number;
  y: number;
  primitive: RoomPrimitive;
};

export type DungeonLayout = {
  width: number;
  height: number;
  grid: Grid<boolean>; // true = traversable floor (rooms), false = untouched wall
  rooms: PlacedRoom[]; // The localized instances that combine to map the main grid
};
