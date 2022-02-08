'use strict';

import MapCell from "./cell";
import MapFeature from "./feature";

export default class MeshMap {
  features: MapFeature[];
  cells: MapCell[];
  tileSize: number;
  width: number;
  height: number;

  constructor() {
    this.width = 0;
    this.height = 0;
    this.features = [];
    this.cells = [];
    this.tileSize = 10;
  }
}
