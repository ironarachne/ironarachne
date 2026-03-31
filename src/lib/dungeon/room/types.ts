import type { Grid } from '../grid/types';

export type RoomStyle = 'rectangle' | 'circle' | 'l-shape' | 'blob';

export type RoomPrimitive = {
  width: number;
  height: number;
  style: RoomStyle;
  shape: Grid<boolean>; // true represents floor, false represents empty/wall
};
