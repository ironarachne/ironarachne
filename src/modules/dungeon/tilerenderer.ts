'use strict';

import Vertex from '../geometry/vertex';
import Dungeon from './dungeon';
import * as Tiles from './tiles';

export default class DungeonTileRenderer {
  tileSize: number;
  mapHeight: number;
  mapWidth: number;
  imageWidth: number;
  imageHeight: number;

  constructor(imageWidth: number, imageHeight: number, mapHeight: number, mapWidth: number) {
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;
    this.tileSize = imageWidth / mapWidth;
  }

  render(dungeon: Dungeon, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.imageWidth, this.imageHeight);

    let showCoords = false;

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        let tile = dungeon.tiles[y][x];

        if (tile == Tiles.H_DOOR) {
          renderHDoor(ctx, x, y, this.tileSize);
        } else if (tile == Tiles.V_DOOR) {
          renderVDoor(ctx, x, y, this.tileSize);
        } else if (tile == Tiles.ROOM) {
          renderRoom(ctx, x, y, this.tileSize);
        } else {
          renderStone(ctx, x, y, this.tileSize);
        }

        if (showCoords) {
          renderCoords(ctx, x, y, this.tileSize);
        }
      }
    }

    for (let i = 0; i < dungeon.rooms.length; i++) {
      let x = dungeon.rooms[i].center.x * this.tileSize;
      let y = dungeon.rooms[i].center.y * this.tileSize;

      ctx.beginPath();
      ctx.strokeStyle = '#5698DA';
      ctx.fillStyle = '#5698DA';
      ctx.font = '20px Eczar';
      ctx.fillText(`${dungeon.rooms[i].id + 1}`, x, y);
      ctx.strokeText(`${dungeon.rooms[i].id + 1}`, x, y);
    }
  }
}

function renderCoords(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  let mx = x * tileSize;
  let my = y * tileSize;

  ctx.beginPath();
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'red';
  ctx.font = '8px sans-serif';
  ctx.fillText(`${x},${y}`, mx, my);
}

function renderGrid(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  let mx = x * tileSize;
  let my = y * tileSize;

  ctx.fillRect(mx, my, tileSize, tileSize);

  ctx.strokeStyle = '#85BBF1';
  ctx.strokeRect(mx, my, tileSize, tileSize);
}

function renderHDoor(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.fillStyle = 'white';
  ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

  renderGrid(ctx, x, y, tileSize);

  ctx.beginPath();
  ctx.strokeStyle = '#85BBF1';

  let t = new Vertex(x * tileSize + tileSize / 2, y * tileSize);
  let b = new Vertex(x * tileSize + tileSize / 2, y * tileSize + tileSize);

  ctx.moveTo(t.x, t.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();

  ctx.fillRect(
    x * tileSize + tileSize * 0.35,
    y * tileSize + tileSize * 0.2,
    tileSize * 0.3,
    tileSize * 0.6,
  );

  ctx.strokeRect(
    x * tileSize + tileSize * 0.35,
    y * tileSize + tileSize * 0.2,
    tileSize * 0.3,
    tileSize * 0.6,
  );
}

function renderStone(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.fillStyle = '#A4CFF9';

  let mx = x * tileSize;
  let my = y * tileSize;

  ctx.fillRect(mx, my, tileSize, tileSize);
}

function renderRoom(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.fillStyle = 'white';

  let mx = x * tileSize;
  let my = y * tileSize;

  ctx.fillRect(mx, my, tileSize, tileSize);

  renderGrid(ctx, x, y, tileSize);
}

function renderVDoor(ctx: CanvasRenderingContext2D, x: number, y: number, tileSize: number) {
  ctx.fillStyle = 'white';
  ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

  renderGrid(ctx, x, y, tileSize);

  ctx.beginPath();
  ctx.strokeStyle = '#85BBF1';

  let l = new Vertex(x * tileSize, y * tileSize + tileSize / 2);
  let r = new Vertex(x * tileSize + tileSize, y * tileSize + tileSize / 2);

  ctx.moveTo(l.x, l.y);
  ctx.lineTo(r.x, r.y);
  ctx.stroke();

  ctx.fillRect(
    x * tileSize + tileSize * 0.2,
    y * tileSize + tileSize * 0.35,
    tileSize * 0.6,
    tileSize * 0.3,
  );

  ctx.strokeRect(
    x * tileSize + tileSize * 0.2,
    y * tileSize + tileSize * 0.35,
    tileSize * 0.6,
    tileSize * 0.3,
  );
}
