"use strict";

import Edge from "../geometry/edge";
import Polygon from "../geometry/polygon";
import Vertex from "../geometry/vertex";

export default class Room {
  id: number;
  description: string;
  shape: Polygon;
  tileMesh: Polygon[];
  center: Vertex;
  features: string[];

  constructor() {
    this.tileMesh = [];
    this.features = [];
  }

  calculateTileMesh() {
    let tiles = [];

    let minY = this.getMinY();
    let maxY = this.getMaxY();
    let minX = this.getMinX();
    let maxX = this.getMaxX();

    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        let n = new Polygon();
        n.vertices = [
          new Vertex(x - 0.5, y - 0.5),
          new Vertex(x + 0.5, y - 0.5),
          new Vertex(x + 0.5, y + 0.5),
          new Vertex(x - 0.5, y + 0.5),
        ];
        n.edges = n.edgesFromVertices();
        tiles.push(n);
      }
    }

    this.tileMesh = tiles;
  }

  getTileEdges(): Edge[] {
    let result = [];

    for (let i = 0; i < this.tileMesh.length; i++) {
      for (let j = 0; j < this.tileMesh[i].edges.length; j++) {
        result.push(this.tileMesh[i].edges[j]);
      }
    }

    return result;
  }

  getCenter(): Vertex {
    let minX = this.getMinX();
    let maxX = this.getMaxX();
    let minY = this.getMinY();
    let maxY = this.getMaxY();
    let x = minX + ((maxX - minX) / 2);
    let y = minY + ((maxY - minY) / 2);

    return new Vertex(x, y);
  }

  getMinX(): number {
    return Math.min(
      this.shape.vertices[0].x,
      this.shape.vertices[1].x,
      this.shape.vertices[2].x,
      this.shape.vertices[3].x,
    );
  }

  getMaxX(): number {
    return Math.max(
      this.shape.vertices[0].x,
      this.shape.vertices[1].x,
      this.shape.vertices[2].x,
      this.shape.vertices[3].x,
    );
  }

  getMinY(): number {
    return Math.min(
      this.shape.vertices[0].y,
      this.shape.vertices[1].y,
      this.shape.vertices[2].y,
      this.shape.vertices[3].y,
    );
  }

  getMaxY(): number {
    return Math.max(
      this.shape.vertices[0].y,
      this.shape.vertices[1].y,
      this.shape.vertices[2].y,
      this.shape.vertices[3].y,
    );
  }

  getHeight(): number {
    return this.getMaxY() - this.getMinY();
  }

  getWidth(): number {
    return this.getMaxX() - this.getMinX();
  }

  move(y: number, x: number) {
    for (let i = 0; i < this.shape.vertices.length; i++) {
      this.shape.vertices[i].y += y;
      this.shape.vertices[i].x += x;
    }
    this.shape.edges = this.shape.edgesFromVertices();
    this.center = this.getCenter();
    this.calculateTileMesh();
  }
}
