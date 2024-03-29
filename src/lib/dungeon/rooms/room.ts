import type Encounter from "$lib/encounters/encounter.js";
import type Edge from "$lib/geometry/edge.js";
import * as Geometry from "$lib/geometry/geometry.js";
import type Polygon from "$lib/geometry/polygon.js";
import type Vertex from "$lib/geometry/vertex.js";
import * as Tiles from "../tiles.js";
import type RoomFeature from "./features/feature.js";
import RoomTheme from "./themes/theme.js";

export default class Room {
  id: number;
  name: string;
  description: string;
  secrets: string;
  shape: Polygon;
  tileMesh: Polygon[];
  tiles: number[][];
  vertices: Vertex[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  center: Vertex;
  lightLevel: number;
  features: RoomFeature[];
  treasureCaches: string[];
  encounters: Encounter[];
  theme: RoomTheme;
  doors: number[];

  constructor() {
    this.id = -1;
    this.name = "";
    this.tileMesh = [];
    this.encounters = [];
    this.features = [];
    this.doors = [];
    this.description = "";
    this.minX = 0;
    this.minY = 0;
    this.maxX = 0;
    this.maxY = 0;
    this.center = { x: 0, y: 0 };
    this.shape = { vertices: [], edges: [] };
    this.theme = new RoomTheme("", [], 0, 0, 0, 0, [], [], [], [], [], [], 0);
    this.secrets = "";
    this.tiles = [];
    this.treasureCaches = [];
    this.vertices = [];
    this.lightLevel = 0;
  }

  calculateTileMesh() {
    // deprecated
    let tiles = [];

    let minY = this.minY;
    let maxY = this.maxY;
    let minX = this.minX;
    let maxX = this.maxX;

    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        let n: Polygon = { vertices: [], edges: [] };
        n.vertices = [
          { x: x - 0.5, y: y - 0.5 },
          { x: x + 0.5, y: y - 0.5 },
          { x: x + 0.5, y: y + 0.5 },
          { x: x - 0.5, y: y + 0.5 },
        ];
        n.edges = Geometry.edgesFromVertices(n.vertices);
        tiles.push(n);
      }
    }

    this.tileMesh = tiles;
  }

  calculateTiles(mapWidth: number, mapHeight: number) {
    let newTiles: number[][] = [];
    for (let y = 0; y < mapHeight; y++) {
      let row: number[] = [];
      newTiles[y] = row;
      for (let x = 0; x < mapWidth; x++) {
        newTiles[y][x] = Tiles.STONE;
      }
    }

    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].y > newTiles.length - 1) {
        console.debug(
          `Vertices outside the bounds of the map: ${newTiles.length} newTiles.length, ${
            this.vertices[i].y
          } this.vertices[i].y`,
          this.vertices,
        );
      }
      newTiles[this.vertices[i].y][this.vertices[i].x] = Tiles.ROOM;
    }

    this.tiles = newTiles;
  }

  calculateVertices() {
    let v = [];

    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        if (this.tiles[y][x] != Tiles.STONE) {
          v.push({ x, y });
        }
      }
    }

    this.vertices = v;
  }

  getTileEdges(): Edge[] {
    // deprecated
    let result = [];

    for (let i = 0; i < this.tileMesh.length; i++) {
      for (let j = 0; j < this.tileMesh[i].edges.length; j++) {
        result.push(this.tileMesh[i].edges[j]);
      }
    }

    return result;
  }

  getCenter(): Vertex {
    let x = this.minX + (this.maxX - this.minX) / 2;
    let y = this.minY + (this.maxY - this.minY) / 2;

    return { x, y };
  }

  getMinX(): number {
    let result = this.vertices[0].x;

    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].x < result) {
        result = this.vertices[i].x;
      }
    }

    return result;
  }

  getMaxX(): number {
    let result = this.vertices[0].x;

    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].x > result) {
        result = this.vertices[i].x;
      }
    }

    return result;
  }

  getMinY(): number {
    let result = this.vertices[0].y;

    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].y < result) {
        result = this.vertices[i].y;
      }
    }

    return result;
  }

  getMaxY(): number {
    let result = this.vertices[0].y;

    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].y > result) {
        result = this.vertices[i].y;
      }
    }

    return result;
  }

  getHeight(): number {
    return this.maxY - this.minY;
  }

  getWidth(): number {
    return this.maxX - this.minX;
  }

  moveBy(mx: number, my: number, mapWidth: number, mapHeight: number) {
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].x += mx;
      this.vertices[i].y += my;
    }

    this.calculateTiles(mapWidth, mapHeight);
    this.minX = this.getMinX();
    this.maxX = this.getMaxX();
    this.minY = this.getMinY();
    this.maxY = this.getMaxY();
    this.center = this.getCenter();
  }

  moveTo(nx: number, ny: number, mapWidth: number, mapHeight: number) {
    const diffX = nx - this.minX;
    const diffY = ny - this.minY;

    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].x += diffX;
      this.vertices[i].y += diffY;
    }

    this.calculateTiles(mapWidth, mapHeight);
    this.minX = this.getMinX();
    this.maxX = this.getMaxX();
    this.minY = this.getMinY();
    this.maxY = this.getMaxY();
    this.center = this.getCenter();
  }
}
