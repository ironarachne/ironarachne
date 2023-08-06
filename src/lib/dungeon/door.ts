"use strict";

import Vertex from "../geometry/vertex.js";
import Lock from "./lock.js";

export default class Door {
  room1: number;
  room2: number;
  tile: number;
  vertex: Vertex;
  description: string;
  lock: Lock | null;
  isSecret: boolean;

  constructor() {
    this.lock = null;
    this.isSecret = false;
  }
}
