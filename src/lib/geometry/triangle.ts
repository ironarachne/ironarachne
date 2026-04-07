import type Edge from './edge.js';
import type Vertex from './vertex.js';

export default interface Triangle {
  a: Vertex;
  b: Vertex;
  c: Vertex;
  edges: [Edge, Edge, Edge];
}
