'use strict';

import Vertex from "./vertex";

export default class Edge {
  A: Vertex;
  B: Vertex;

  constructor(a: Vertex, b: Vertex) {
    this.A = a;
    this.B = b;
  }
}
