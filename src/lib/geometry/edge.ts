"use strict";

import Vertex from "./vertex.js";

export default class Edge {
  a: Vertex;
  b: Vertex;

  equals(edge: Edge): boolean {
    if (this.a.x == edge.a.x && this.a.y == edge.a.y && this.b.x == edge.b.x && this.b.y == edge.b.y) {
      return true;
    } else if (this.a.x == edge.b.x && this.a.y == edge.b.y && this.b.x == edge.a.x && this.b.y == edge.a.y) {
      return true;
    }

    return false;
  }

  getMidpoint(): Vertex {
    let x = (this.a.x + this.b.x) / 2;
    let y = (this.a.y + this.b.y) / 2;

    return new Vertex(x, y);
  }

  getSlope(): number {
    return (this.b.y - this.a.y) / (this.b.x - this.a.x);
  }
}
