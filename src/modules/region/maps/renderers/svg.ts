'use strict';

import RegionMap from "../map";
import chroma from 'chroma-js';

export default class RegionMapSVGRenderer {
  map: RegionMap;
  showStats: boolean;
  showGrid: boolean;

  constructor(map: RegionMap) {
    this.map = map;
    this.showStats = false;
    this.showGrid = false;
  }

  render(width: number, height: number): string {
    const svgHeader = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" version="1.1">`;
    let svg = `${svgHeader}`;

    const tileWidth = Math.floor(width/this.map.width);
    const tileHeight = Math.floor(height/this.map.height);

    for (let y=0;y<this.map.height;y++) {
      for (let x=0;x<this.map.width;x++) {
        let xCoord = x * tileWidth;
        let yCoord = y * tileHeight;
        let tileColor = this.getColorForTile(this.map.elevation[y][x], this.map.humidity[y][x], this.map.temperature[y][x]);
        let gridDisplay = '';
        if (this.showGrid) {
          gridDisplay = ' stroke="black"';
        }
        svg += `<rect width="${tileWidth}" height="${tileHeight}" x="${xCoord}" y="${yCoord}" fill="${tileColor}"${gridDisplay} />`;
        if (this.showStats) {
          svg += `<text style="font: italic 8px sans-serif; fill: black;" x="${xCoord + 2}" y="${yCoord + 12}">${this.map.elevation[y][x].toFixed(2)}</text>`;
          svg += `<text style="font: italic 8px sans-serif; fill: blue;" x="${xCoord + 2}" y="${yCoord + 19}">${this.map.humidity[y][x].toFixed(2)}</text>`;
          svg += `<text style="font: italic 8px sans-serif; fill: red;" x="${xCoord + 2}" y="${yCoord + 27}">${this.map.temperature[y][x].toFixed(2)}</text>`;
        }
      }
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
      svg += `<circle cx="${this.map.features[i].x * tileWidth}" cy="${this.map.features[i].y * tileHeight}" r="${radius}" fill="black"${border} />`;
      svg += `<text style="font: italic ${fontSize}px serif; fill: black;" x="${this.map.features[i].x * tileWidth}" y="${(this.map.features[i].y * tileHeight) + textOffset}" text-anchor="middle">${this.map.features[i].name}</text>`;
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
