'use strict';

export default class Vertex {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(b: Vertex): boolean {
    if (this.x == b.x && this.y == b.y) {
      return true;
    }

    return false;
  }
}
