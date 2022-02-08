'use strict';

import Edge from "../../geometry/edge";
import Polygon from "../../geometry/polygon";

export default class MapCell {
  centerX: number;
  centerY: number;
  polygon: Polygon;
  isOcean: boolean;
  hasCoast: boolean;
  coastEdges: Edge[];
  elevation: number;
  humidity: number;
  temperature: number;
  biome: string;
  neighbors: number[];

  constructor() {
    this.isOcean = false;
    this.hasCoast = false;
    this.coastEdges = [];
    this.neighbors = [];
  }
}
