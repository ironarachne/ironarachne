'use strict';

import MeshMap from "../meshmap";
import chroma from 'chroma-js';
import Edge from "../../../geometry/edge";

export default class MeshMapSVGRenderer {
  map: MeshMap;
  showGrid: boolean;

  constructor(map: MeshMap) {
    this.map = map;
    this.showGrid = false;
  }

  render(): string {
    const width = this.map.width * this.map.tileSize;
    const height = this.map.height * this.map.tileSize;
    const svgHeader = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" version="1.1">`;
    let svg = `${svgHeader}`;

    let coastEdges: Edge[] = [];

    for (let i=0;i<this.map.cells.length;i++) {
      let gridDisplay = '';
      if (this.showGrid) {
        gridDisplay = ' stroke="black"';
      }

      let points = '';

      for (let j=0;j<this.map.cells[i].polygon.nodes.length;j++) {
        points += this.map.cells[i].polygon.nodes[j].x + ',' + this.map.cells[i].polygon.nodes[j].y + ' ';
      }

      points = points.trimEnd();

      let tileColor = this.getColorForTile(this.map.cells[i].elevation, this.map.cells[i].humidity, this.map.cells[i].temperature);

      if (this.map.cells[i].hasCoast) {
        coastEdges = coastEdges.concat(this.map.cells[i].coastEdges);
      }

      svg += `<polygon points="${points}" fill="${tileColor}"${gridDisplay} />`;
    }

    for (let i=0;i<coastEdges.length;i++) {
      svg += `<path d="M${coastEdges[i].A.x} ${coastEdges[i].A.y} L${coastEdges[i].B.x} ${coastEdges[i].B.y}" stroke="black" />`;
    }

    for (let i=0;i<this.map.features.length;i++) {
      let radius = 2;
      let fontSize = 10;
      let textOffset = 15;
      let border = '';
      if (this.map.features[i].featureType == 'metropolis') {
        fontSize = 14;
        textOffset = 20;
        radius = 5;
        border = ' stroke="white" stroke-width="2"';
      } else if (this.map.features[i].featureType == 'city') {
        fontSize = 12;
        textOffset = 17;
        radius = 4;
      } else if (['town', 'borough'].includes(this.map.features[i].featureType)) {
        fontSize = 11;
        textOffset = 16;
        radius = 3;
      }
      svg += `<circle cx="${this.map.features[i].x * this.map.tileSize}" cy="${this.map.features[i].y * this.map.tileSize}" r="${radius}" fill="black"${border} />`;
      svg += `<text style="font: italic ${fontSize}px serif; fill: black;" x="${this.map.features[i].x * this.map.tileSize}" y="${(this.map.features[i].y * this.map.tileSize) + textOffset}" text-anchor="middle">${this.map.features[i].name}</text>`;
    }

    svg += '</svg>';

    return svg;
  }

  getColorForTile(elevation: number, humidity: number, temperature: number): string {
    let baseColor = this.getBaseColor(elevation, humidity, temperature);

    let color = chroma(baseColor);

    if (elevation > 0.8) {
      color = color.desaturate(Math.floor(elevation * 2));
      color = color.brighten(Math.floor(elevation * 2));

      return color.hex();
    }

    if (humidity > 0.6 && temperature > 0.5) {
      color = color.darken(Math.floor(humidity));
    }

    if (elevation < 0.1) {
      color = color.brighten(Math.floor(elevation * 5));
    }

    if (humidity < 0.4 && temperature > 0.5 && elevation < 0.5) {
      color = color.darken(humidity);
    }

    return color.hex();
  }

  getBaseColor(elevation: number, humidity: number, temperature: number): string {
    const MOUNTAIN = '#b5cca7';
    const MESA = '#756247';
    const DESERT = '#efeaa2';
    const GRASSLAND = '#449943';
    const FOREST = '#1b4f1a';
    const JUNGLE = '#196b32';
    const TUNDRA = '#e8f4f2';
    const OCEAN = '#1a1f63';

    if (elevation < 0.1) {
      return OCEAN;
    }

    if (elevation > 0.8) {
      return MOUNTAIN;
    }

    if (humidity < 0.2) {
      if (elevation > 0.6) {
        return MOUNTAIN;
      }

      if (temperature > 0.5) {
        if (elevation > 0.6) {
          return MESA;
        }

        return DESERT;
      }
    }

    if (humidity > 0.8) {
      if (temperature > 0.5) {
        return JUNGLE;
      }
    }

    if (temperature < 0.2) {
      return TUNDRA;
    }

    if (elevation > 0.2 && elevation < 0.8 && humidity > 0.5) {
      return FOREST;
    }

    return GRASSLAND;
  }
}
