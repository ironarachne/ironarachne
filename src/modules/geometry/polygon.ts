'use strict';

import Edge from "./edge";
import Vertex from "./vertex";

export default class Polygon {
  edges: Edge[];
  nodes: Vertex[];

  constructor() {
    this.edges = [];
    this.nodes = [];
  }
}
