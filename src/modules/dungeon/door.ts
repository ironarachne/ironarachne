'use strict';

import Vertex from '../geometry/vertex';

export default class Door {
  room1: number;
  room2: number;
  tile: number;
  vertex: Vertex;
  description: string;
  isLocked: boolean;
  isSecret: boolean;

  constructor() {
    this.isLocked = false;
    this.isSecret = false;
  }
}
