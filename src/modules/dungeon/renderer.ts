"use strict";

import Door from "./door";
import Dungeon from "./dungeon";
import Room from "./room";

export default class DungeonRenderer {
  tileSize: number;
  imageWidth: number;
  imageHeight: number;

  constructor(imageWidth: number, imageHeight: number, mapHeight: number, mapWidth: number) {
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.tileSize = imageWidth / mapWidth;
  }

  render(dungeon: Dungeon, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.imageWidth, this.imageHeight);

    for (let i = 0; i < dungeon.rooms.length; i++) {
      this.drawRoom(ctx, dungeon.rooms[i]);
    }

    for (let i = 0; i < dungeon.doors.length; i++) {
      this.drawDoor(ctx, dungeon.doors[i]);
    }
  }

  drawDoor(ctx: CanvasRenderingContext2D, door: Door) {
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";

    let minX = Math.min(door.edge.a.x, door.edge.b.x);
    let minY = Math.min(door.edge.a.y, door.edge.b.y);

    // Vertical doors
    let x = (minX * this.tileSize) - (this.tileSize * 0.2);
    let y = (minY * this.tileSize) + (this.tileSize * 0.2);
    let w = this.tileSize * 0.3;
    let h = this.tileSize * 0.6;

    // Horizontal doors
    if (door.edge.getSlope() === 0) {
      x = (minX * this.tileSize) + (this.tileSize * 0.2);
      y = (minY * this.tileSize) - (this.tileSize * 0.2);
      w = this.tileSize * 0.6;
      h = this.tileSize * 0.3;
    }

    ctx.beginPath();

    ctx.lineWidth = 1.0;
    ctx.fillRect(x, y, w, h);
    ctx.rect(x, y, w, h);
    ctx.stroke();

    ctx.font = "10px eczar, serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";

    let m = door.edge.getMidpoint();
    m.x = m.x * this.tileSize;
    m.y = (m.y * this.tileSize) + (0.2 * this.tileSize);

    if (door.isSecret) {
      ctx.strokeText("S", m.x, m.y);
      ctx.fillText("S", m.x, m.y);
    }

    if (door.isLocked) {
      ctx.strokeText("L", m.x, m.y);
      ctx.fillText("L", m.x, m.y);
    }
  }

  drawRoom(ctx: CanvasRenderingContext2D, room: Room) {
    let edges = room.getTileEdges();

    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.strokeStyle = "grey";

    for (let i = 0; i < edges.length; i++) {
      ctx.moveTo(edges[i].a.x * this.tileSize, edges[i].a.y * this.tileSize);
      ctx.lineTo(edges[i].b.x * this.tileSize, edges[i].b.y * this.tileSize);
    }
    ctx.stroke();

    ctx.lineWidth = 2.0;
    ctx.strokeStyle = "black";
    ctx.beginPath();

    ctx.rect(
      (room.shape.vertices[0].x - 0.5) * this.tileSize,
      (room.shape.vertices[0].y - 0.5) * this.tileSize,
      room.getWidth() * this.tileSize,
      room.getHeight() * this.tileSize,
    );

    ctx.stroke();

    ctx.font = "20px eczar, serif";
    ctx.textAlign = "center";
    ctx.strokeStyle = "white";
    ctx.strokeText(`${room.id + 1}`, (room.center.x - 0.5) * this.tileSize, room.center.y * this.tileSize);
    ctx.fillStyle = "black";
    ctx.fillText(`${room.id + 1}`, (room.center.x - 0.5) * this.tileSize, room.center.y * this.tileSize);
  }
}
