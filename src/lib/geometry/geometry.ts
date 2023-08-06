"use strict";

import Vertex from "./vertex.js";

export function distance(a: Vertex, b: Vertex) {
  let d = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

  return d;
}
