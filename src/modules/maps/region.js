"use strict";

import { Delaunay } from "d3-delaunay";
const random = require("random");

export function generate(width, height) {
  let points = generatePoints(width, height);
  let delaunay = new Delaunay(points);
  let voronoi = delaunay.voronoi([0, 0, width, height]);

  let map = generateMap(voronoi);

  let svg = renderMap(map, width, height);

  return svg;
}

function generateMap(voronoi) {
  // "map" has two arrays - map cells, map borders
  // map cells have: is_water, is_ocean, is_coast, altitude, humidity, corners
  // map borders have: is_water, is_ocean, is_coast, corners

  let map = {
    cells: [],
    borders: [],
  };

  let cellPolygons = voronoi.cellPolygons();
  for (let cell of cellPolygons) {
    let newCell = {
      is_edge: false,
      is_water: false,
      is_ocean: false,
      is_coast: false,
      altitude: 0,
      humidity: 0,
      corners: cell,
    };
    if (newCell.is_edge) {
      newCell.is_water = true;
    }
    map.cells.push(newCell);
  }

  return map;
}

function generatePoints(width, height) {
  let density = 0.005;
  let numberOfPoints = width * height * density;
  let points = [];

  for (let i = 0; i < numberOfPoints; i++) {
    let x = random.int(0, width);
    let y = random.int(0, height);
    points.push(x);
    points.push(y);
  }

  return points;
}

function renderMap(map, width, height) {
  let svg =
    '<svg width="' +
    width +
    '" height="' +
    height +
    '" viewBox="0,0,' +
    width +
    "," +
    height +
    '">';

  map.cells.forEach(function (cell) {
    let color = "#33aa33";
    if (cell.is_water) {
      color = "#0011aa";
    }
    svg += '<polygon points="';
    cell.corners.forEach(function (corner) {
      svg += corner[0] + "," + corner[1] + " ";
    });
    svg += '" fill="' + color + '" stroke="' + color + '"/>';
  });

  svg += "</svg>";

  return svg;
}
