import type Vertex from './vertex';

export type PoissonDiskOptions = {
  /** Only accepted points are returned. Hidden samples still bridge disconnected accepted areas. */
  accept?: (point: Vertex) => boolean;
  /** Maximum returned points; omitted means fill the rectangle at the requested spacing. */
  maxPoints?: number;
};
