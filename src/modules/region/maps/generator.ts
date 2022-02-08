'use strict';

import SimplexNoise from 'simplex-noise';
import RegionMapGeneratorConfig from './generatorconfig';
import RegionMap from './map';
import random from 'random';
import MapFeature from './feature';
import MeshMap from './meshmap';
import MapCell from './cell';
import Polygon from '../../geometry/polygon';
import Vertex from '../../geometry/vertex';
import Edge from '../../geometry/edge';

export default class RegionMapGenerator {
  config: RegionMapGeneratorConfig;
  noise1: SimplexNoise;
  noise2: SimplexNoise;

  constructor(config: RegionMapGeneratorConfig) {
    this.config = config;
    this.noise1 = new SimplexNoise(random.int(1, 300000));
    this.noise2 = new SimplexNoise(random.int(300001, 900000));
  }

  checkIfCoast(cell: MapCell, cells: MapCell[]): boolean {
    for (let i=0;i<cell.neighbors.length;i++) {
      let neighbor = cells[cell.neighbors[i]];
      if (neighbor.isOcean != cell.isOcean) {
        console.debug(cell, neighbor);
        return true;
      }
    }

    return false;
  }

  findCellNeighbors(cell: MapCell, cells: MapCell[]): number[] {
    let neighbors = [];

    for (let i=0;i<cells.length;i++) {
      if (this.sharesEdge(cell, cells[i])) {
        neighbors.push(i);
      }
    }

    return neighbors;
  }

  findCoastEdges(cell: MapCell, cells: MapCell[]): Edge[] {
    let edges = [];

    for (let i=0;i<cell.neighbors.length;i++) {
      let neighbor = cells[cell.neighbors[i]];
      if (neighbor.isOcean != cell.isOcean) {
        edges.push(this.getSharedEdge(cell, neighbor));
      }
    }

    return edges;
  }

  generate(): RegionMap {
    let map = new RegionMap(this.config.width, this.config.height);
    map.elevation = this.generateElevationMap(map.width, map.height);
    map.humidity = this.generateHumidityMap(map.width, map.height);
    map.temperature = this.generateTemperatureMap(map.width, map.height);
    map.features = this.placeFeatures(map);

    return map;
  }

  generateMesh(): MeshMap {
    let map = new MeshMap();
    map.width = this.config.width;
    map.height = this.config.height;
    map.tileSize = this.config.tileSize;
    let elevationMap = this.generateElevationMap(map.width, map.height);
    let temperatureMap = this.generateTemperatureMap(map.width, map.height);
    let humidityMap = this.generateHumidityMap(map.width, map.height);

    for (let y=0;y<map.height;y++) {
      for (let x=0;x<map.width;x++) {
        let cell = new MapCell();
        let x1 = x * map.tileSize;
        let x2 = x * map.tileSize + map.tileSize;
        let y1 = y * map.tileSize;
        let y2 = y * map.tileSize + map.tileSize;
        cell.centerX = Math.floor((x1 + x2) / 2);
        cell.centerY = Math.floor((y1 + y2) / 2);
        cell.polygon = new Polygon();
        cell.polygon.nodes = [new Vertex(x1, y1), new Vertex(x2, y1), new Vertex(x2, y2), new Vertex(x1, y2)];
        cell.polygon.edges = [new Edge(cell.polygon.nodes[0], cell.polygon.nodes[1]), new Edge(cell.polygon.nodes[1], cell.polygon.nodes[2]), new Edge(cell.polygon.nodes[2], cell.polygon.nodes[3]), new Edge(cell.polygon.nodes[3], cell.polygon.nodes[0])];
        cell.isOcean = elevationMap[y][x] < 0.10;
        cell.temperature = temperatureMap[y][x];
        cell.humidity = humidityMap[y][x];
        cell.elevation = elevationMap[y][x];
        cell.biome = this.getBiomeForCell(cell);
        map.cells.push(cell);
      }
    }

    for (let i=0;i<map.cells.length;i++) {
      map.cells[i].neighbors = this.findCellNeighbors(map.cells[i], map.cells);
      map.cells[i].hasCoast = this.checkIfCoast(map.cells[i], map.cells);
      if (map.cells[i].hasCoast) {
        map.cells[i].coastEdges = this.findCoastEdges(map.cells[i], map.cells);
      }
    }

    map.features = this.placeFeaturesMesh(map);

    return map;
  }

  generateElevationMap(width: number, height: number): number[][] {
    let value = [];
    for (let y = 0; y < height; y++) {
      value[y] = [];
      for (let x = 0; x < width; x++) {
        let nx = x/width - 0.5, ny = y/height - 0.5;
        let e = 1 * this.noiseElevation(1 * nx, 1 * ny) +
        0.5 * this.noiseElevation(2 * nx, 2 * ny) +
        0.25 * this.noiseElevation(4 * nx, 4 * ny);
        e = e / (1 + 0.5 + 0.25);
        e = Math.pow(e, 1.36);
        value[y][x] = this.config.elevationTransform(e);
      }
    }

    return value;
  }

  generateHumidityMap(width: number, height: number): number[][] {
    let value = [];
    for (let y = 0; y < height; y++) {
      value[y] = [];
      for (let x = 0; x < width; x++) {
        let nx = x/width - 0.5, ny = y/height - 0.5;
        let h = 1 * this.noiseHumidity(1 * nx, 1 * ny) +
        0.5 * this.noiseHumidity(2 * nx, 2 * ny) +
        0.25 * this.noiseHumidity(4 * nx, 4 * ny);
        h = h / (1 + 0.5 + 0.25);
        h = Math.pow(h, 1.36);
        value[y][x] = this.config.humidityTransform(h);
      }
    }

    return value;
  }

  generateTemperatureMap(width: number, height: number): number[][] {
    let value = [];
    for (let y = 0; y < height; y++) {
      value[y] = [];
      for (let x = 0; x < width; x++) {
        let nx = x/width - 0.5, ny = y/height - 0.5;
        let h = 1 * this.noiseTemperature(1 * nx, 1 * ny) +
        0.5 * this.noiseTemperature(2 * nx, 2 * ny) +
        0.25 * this.noiseTemperature(4 * nx, 4 * ny);
        h = h / (1 + 0.5 + 0.25);
        h = Math.pow(h, 1.36);
        h = 1.0 - h;
        value[y][x] = this.config.temperatureTransform(h);
      }
    }

    return value;
  }

  getBiomeForCell(cell: MapCell): string {
    if (cell.elevation > 0.8) {
      return 'mountain';
    }

    if (cell.elevation < 0.10) {
      return 'ocean';
    }

    if (cell.temperature < 0.20) {
      if (cell.humidity < 0.40) {
        return 'tundra';
      }
      return 'coniferous forest';
    }

    if (cell.temperature > 0.70) {
      if (cell.humidity < 0.20) {
        return 'desert';
      }

      return 'rainforest';
    }

    if (cell.humidity > 0.5) {
      return 'deciduous forest';
    }

    return 'grassland';
  }

  getSharedEdge(a: MapCell, b: MapCell): Edge|null {
    for (let i=0;i<a.polygon.edges.length;i++) {
      let edgeA = a.polygon.edges[i];
      for (let j=0;j<b.polygon.edges.length;j++) {
        let edgeB = b.polygon.edges[j];
        if (this.isEdgeEqual(edgeA, edgeB)) {
          return edgeA;
        }
      }
    }

    return null;
  }

  noiseElevation(nx: number, ny: number): number {
    // Rescale from -1.0:+1.0 to 0.0:1.0
    return this.noise1.noise2D(nx, ny) / 2 + 0.5;
  }

  noiseHumidity(nx: number, ny: number): number {
    // Rescale from -1.0:+1.0 to 0.0:1.0
    return this.noise2.noise2D(nx, ny) / 2 + 0.5;
  }

  noiseTemperature(nx: number, ny: number): number {
    // Rescale from -1.0:+1.0 to 0.0:1.0
    return this.noise1.noise2D(nx, ny) / 2 + 0.5;
  }

  placeFeatures(map: RegionMap): MapFeature[] {
    let placed = [];

    for (let i=0;i<this.config.features.length;i++) {
      let placement = this.config.features[i];
      placement.x = random.int(5, this.config.width - 5);
      placement.y = random.int(5, this.config.height - 5);
      placed.push(placement);
    }

    for (let i=0;i<3;i++) {
      for (let j=0;j<placed.length;j++) {
        for (let k=0;k<placed.length;k++) {
          if (placed[j].name != placed[k].name) {
            if (Math.abs(placed[j].x - placed[k].x) + Math.abs(placed[j].y - placed[k].y) < 5) {
              placed[j].x += random.int(-2, 2);
              placed[j].y += random.int(-2, 2);
            }
          }
        }

        let featureElevation = map.elevation[placed[j].y][placed[j].x];

        if (featureElevation < 0.1) {
          let highestElevation = featureElevation;
          let newX = placed[j].x;
          let newY = placed[j].y;
          if (map.elevation[placed[j].y - 1][placed[j].x - 1] > highestElevation) {
            newY = placed[j].y - 1;
            highestElevation = map.elevation[placed[j].y - 1][placed[j].x - 1];
          }
          if (map.elevation[placed[j].y - 1][placed[j].x] > highestElevation) {
            newY = placed[j].y - 1;
            highestElevation = map.elevation[placed[j].y - 1][placed[j].x];
          }
          if (map.elevation[placed[j].y - 1][placed[j].x + 1] > highestElevation) {
            newY = placed[j].y - 1;
            highestElevation = map.elevation[placed[j].y - 1][placed[j].x + 1];
          }
          if (map.elevation[placed[j].y + 1][placed[j].x - 1] > highestElevation) {
            newY = placed[j].y + 1;
            highestElevation = map.elevation[placed[j].y + 1][placed[j].x - 1];
          }
          if (map.elevation[placed[j].y + 1][placed[j].x] > highestElevation) {
            newY = placed[j].y + 1;
            highestElevation = map.elevation[placed[j].y + 1][placed[j].x];
          }
          if (map.elevation[placed[j].y + 1][placed[j].x + 1] > highestElevation) {
            newY = placed[j].y + 1;
            highestElevation = map.elevation[placed[j].y + 1][placed[j].x + 1];
          }
          if (map.elevation[placed[j].y][placed[j].x - 1] > highestElevation) {
            newY = placed[j].y + 1;
            highestElevation = map.elevation[placed[j].y][placed[j].x - 1];
          }
          if (map.elevation[placed[j].y][placed[j].x + 1] > highestElevation) {
            newY = placed[j].y + 1;
            highestElevation = map.elevation[placed[j].y][placed[j].x + 1];
          }

          placed[j].x = newX;
          placed[j].y = newY;
        }
        if (placed[j].x < 5) {
          placed[j].x = 5 + random.int(0, 4);
        }
        if (placed[j].x > this.config.width - 5) {
          placed[j].x = this.config.width - random.int(5, 10);
        }
        if (placed[j].y < 5) {
          placed[j].y = 5 + random.int(0, 4);
        }
        if (placed[j].y > this.config.height - 5) {
          placed[j].y = this.config.height - random.int(5, 10);
        }
      }
    }

    return placed;
  }

  placeFeaturesMesh(map: MeshMap): MapFeature[] {
    let placed = [];

    for (let i=0;i<this.config.features.length;i++) {
      let placement = this.config.features[i];
      placement.x = random.int(5, this.config.width - 5);
      placement.y = random.int(5, this.config.height - 5);
      placed.push(placement);
    }

    for (let i=0;i<3;i++) {
      for (let j=0;j<placed.length;j++) {
        for (let k=0;k<placed.length;k++) {
          if (placed[j].name != placed[k].name) {
            if (Math.abs(placed[j].x - placed[k].x) + Math.abs(placed[j].y - placed[k].y) < 5) {
              placed[j].x += random.int(-2, 2);
              placed[j].y += random.int(-2, 2);
            }
          }
        }

        if (placed[j].x < 5) {
          placed[j].x = 5 + random.int(0, 4);
        }
        if (placed[j].x > this.config.width - 5) {
          placed[j].x = this.config.width - random.int(5, 10);
        }
        if (placed[j].y < 5) {
          placed[j].y = 5 + random.int(0, 4);
        }
        if (placed[j].y > this.config.height - 5) {
          placed[j].y = this.config.height - random.int(5, 10);
        }
      }
    }

    return placed;
  }

  sharesEdge(a: MapCell, b: MapCell): boolean {
    for (let i=0;i<a.polygon.edges.length;i++) {
      let edgeA = a.polygon.edges[i];
      for (let j=0;j<b.polygon.edges.length;j++) {
        let edgeB = b.polygon.edges[j];
        if (this.isEdgeEqual(edgeA, edgeB)) {
          return true;
        }
      }
    }

    return false;
  }

  isEdgeEqual(edgeA: Edge, edgeB: Edge): boolean {
    return (edgeA.A.x == edgeB.A.x && edgeA.A.y == edgeB.A.y && edgeA.B.x == edgeB.B.x && edgeA.B.y == edgeA.B.y);
  }
}
