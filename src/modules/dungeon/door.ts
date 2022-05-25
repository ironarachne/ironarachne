"use strict";

import Edge from "../geometry/edge";

export default class Door {
  room1: number;
  room2: number;
  edge: Edge;
  isLocked: boolean;
  isSecret: boolean;

  constructor() {
    this.isLocked = false;
    this.isSecret = false;
  }
}
