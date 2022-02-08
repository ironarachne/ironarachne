'use strict';

import Vertex from "./vertex";
import Edge from "./edge";
import Triangle from "./triangle";
import Polygon from "./polygon";

export default class Mesh {
  edges: Edge[];
  nodes: Vertex[];
  triangles: Triangle[];
  polygons: Polygon[];

  constructor() {
    this.edges = [];
    this.nodes = [];
    this.triangles = [];
    this.polygons = [];
  }
}
