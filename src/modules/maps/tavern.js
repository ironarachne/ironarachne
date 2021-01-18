import * as iarnd from "../random.js";

const random = require("random");

export function generate() {
  let tavernMap = generateMap(40, 30);

  let svg = renderMap(tavernMap);

  return svg;
}

function generateMap(width, height) {
  let map = {
    rooms: [],
    width: width,
    height: height,
  };

  let firstRoom = {
    center: {
      x: Math.floor(width/2),
      y: Math.floor(height/2),
    },
    vertices: [],
    width: Math.floor(random.float(width * 0.16, width * 0.33)),
    height: Math.floor(random.float(height * 0.16, height * 0.33)),
    edges: [],
    doors: [],
    type: "main",
  };

  let halfWidth = firstRoom.width/2;
  let halfHeight = firstRoom.height/2;

  if (firstRoom.width % 2 != 0) {
    firstRoom.center.x -= 0.5;
  }

  if (firstRoom.height % 2 != 0) {
    firstRoom.center.y -= 0.5;
  }

  firstRoom.vertices = [
    {
      x: firstRoom.center.x - halfWidth,
      y: firstRoom.center.y - halfHeight,
    },
    {
      x: firstRoom.center.x + halfWidth,
      y: firstRoom.center.y - halfHeight,
    },
    {
      x: firstRoom.center.x + halfWidth,
      y: firstRoom.center.y + halfHeight,
    },
    {
      x: firstRoom.center.x - halfWidth,
      y: firstRoom.center.y + halfHeight,
    },
  ];

  firstRoom.edges.push({A: firstRoom.vertices[0], B: firstRoom.vertices[1]});
  firstRoom.edges.push({A: firstRoom.vertices[1], B: firstRoom.vertices[2]});
  firstRoom.edges.push({A: firstRoom.vertices[2], B: firstRoom.vertices[3]});
  firstRoom.edges.push({A: firstRoom.vertices[3], B: firstRoom.vertices[0]});

  let doorEdge = iarnd.item(firstRoom.edges);

  let doorX = 0;
  let doorY = 0;
  let doorOrientation = "vertical";

  if (doorEdge.A.x == doorEdge.B.x) {
    doorX = doorEdge.A.x;
  } else {
    let min = Math.min(doorEdge.A.x, doorEdge.B.x) + 1;
    let max = Math.max(doorEdge.A.x, doorEdge.B.x) - 2;

    doorX = random.int(min, max) + 0.5;
    doorOrientation = "horizontal";
  }

  if (doorEdge.A.y == doorEdge.B.y) {
    doorY = doorEdge.A.y;
  } else {
    let min = Math.min(doorEdge.A.y, doorEdge.B.y) + 1;
    let max = Math.max(doorEdge.A.y, doorEdge.B.y) - 2;

    doorY = random.int(min, max) + 0.5;
  }

  firstRoom.doors.push({
    x: doorX,
    y: doorY,
    orientation: doorOrientation,
  });

  map.rooms.push(firstRoom);

  return map;
}

function renderMap(map) {
  let imageHeight = 600;
  let imageWidth = 800;

  let gridSize = imageHeight / map.height;

  let svg = '<svg width="' + imageWidth + '" height="' + imageHeight + '" viewBox="0 0 ' + imageWidth + ' ' + imageHeight + '" xmlns="http://www.w3.org/2000/svg" version="1.1">';

  svg += '<defs>';

  svg += '<pattern id="grid" width="' + gridSize + '" height="' + gridSize + '" patternUnits="userSpaceOnUse">';
  svg += '<rect width="' + gridSize + '" height="' + gridSize + '" fill="none" stroke="gray" stroke-width="1"/>';
  svg += '</pattern>';

  svg += '</defs>';

  svg += '<rect x="0" y="0" width="' + imageWidth + '" height="' + imageHeight + '" fill="url(#grid)" stroke="black" stroke-width="3" />';

  let doors = [];

  for (let i=0;i<map.rooms.length;i++) {
    let topX = (map.rooms[i].center.x - (map.rooms[i].width / 2));
    let topY = (map.rooms[i].center.y - (map.rooms[i].height / 2));
    let roomWidth = map.rooms[i].width * gridSize;
    let roomHeight = map.rooms[i].height * gridSize;

    let roomSVG = '<rect x="' + (topX * gridSize) + '" y="' + (topY * gridSize) + '" width="' + roomWidth + '" height="' + roomHeight + '"';

    roomSVG += ' stroke="black" fill="none" stroke-width="2" />';

    for (let j=0;j<map.rooms[i].doors.length;j++) {
      doors.push(map.rooms[i].doors[j]);
    }

    svg += roomSVG;
  }

  let doorThickness = gridSize / 3;
  let doorLength = gridSize;

  for (let i=0;i<doors.length;i++) {
    let doorTopLeftX = 0;
    let doorTopLeftY = 0;
    let doorWidth = 0;
    let doorHeight = 0;

    if (doors[i].orientation == "vertical") {
      doorTopLeftX = (doors[i].x * gridSize) - (doorThickness / 2);
      doorTopLeftY = (doors[i].y * gridSize) - (doorLength / 2);
      doorWidth = doorThickness;
      doorHeight = doorLength;
    } else {
      doorTopLeftX = (doors[i].x * gridSize) - (doorLength / 2);
      doorTopLeftY = (doors[i].y * gridSize) - (doorThickness / 2);
      doorWidth = doorLength;
      doorHeight = doorThickness;
    }

    let doorSVG = '<rect x="' + doorTopLeftX + '" y="' + doorTopLeftY + '" width="' + doorWidth + '" height="' + doorHeight + '" stroke="black" fill="white" />';

    svg += doorSVG;
  }

  svg += '</svg>';

  return svg;
}

