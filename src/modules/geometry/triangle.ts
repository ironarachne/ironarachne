'use strict';

import Vertex from "./vertex";
import Edge from "./edge";

export default class Triangle {
  A: Vertex;
  B: Vertex;
  C: Vertex;
  AB: Edge;
  BC: Edge;
  CA: Edge;
}
