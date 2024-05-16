import type Vertex from "$lib/geometry/vertex";

export default interface Glyph {
  name: string;
  represents: string;
  points: Vertex[];
  image: string;
}
