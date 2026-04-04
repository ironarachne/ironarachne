export type Grid<T> = {
  width: number;
  height: number;
  data: T[];
};

export type CoordinateTuple = [number, number];

export type Neighbor<T> = {
  x: number;
  y: number;
  value: T;
};
