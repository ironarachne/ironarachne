"use strict";

import Edge from "./edge.js";
import Vertex from "./vertex.js";

export default class Polygon {
  vertices: Vertex[];
  edges: Edge[];

  edgesFromVertices(): Edge[] {
    let edges = [];

    for (let i = 0; i < this.vertices.length; i++) {
      let edge = new Edge();
      edge.a = this.vertices[i];
      if (i < this.vertices.length - 1) {
        edge.b = this.vertices[i + 1];
      } else {
        edge.b = this.vertices[0];
      }
      edges.push(edge);
    }

    return edges;
  }
}
