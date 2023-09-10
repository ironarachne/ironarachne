import type Edge from "./edge.js";
import type Vertex from "./vertex.js";

export default interface Polygon {
  vertices: Vertex[];
  edges: Edge[];
}
