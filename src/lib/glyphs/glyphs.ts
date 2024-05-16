import type Arc from "$lib/geometry/arc";
import type ArcLine from "$lib/geometry/arc_line";
import type Edge from "$lib/geometry/edge";
import * as Geometry from "$lib/geometry/geometry";
import type Vertex from "$lib/geometry/vertex";
import * as RND from "@ironarachne/rng";
import random from "random";
import type GlyphGeneratorConfig from "./generator.config";
import type Glyph from "./glyph";
import type GlyphRenderConfig from "./render_config";

/**
 * This generates the edges of a glyph.
 */
export function generate(config: GlyphGeneratorConfig): Glyph {
  const numStrokes = random.int(config.minNumberOfStrokesPerRadical, config.maxNumberOfStrokesPerRadical);

  const originPoint = { x: 0, y: 0 };

  const actions = getActions();
  const glyph = {
    name: "test",
    represents: "test",
    points: [originPoint],
    image: "",
  };

  console.debug("numStrokes", numStrokes);

  for (let i = 0; i < numStrokes; i++) {
    const action = RND.weighted(actions);

    action.act(glyph);
    console.debug("action", action.name);
  }

  console.debug("glyph", glyph);

  frameGlyphInGrid(glyph, config.gridSize);

  return glyph;
}

/**
 * This renders a glyph as an image and returns it as a base64 string.
 *
 * @param config (GlyphRenderConfig) Configuration to use
 */
export function render(glyph: Glyph, config: GlyphRenderConfig): string {
  const canvas = document.createElement("canvas");
  canvas.width = config.width;
  canvas.height = config.height;

  const gridSize = config.width / config.gridSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("failed to create canvas context");
  }

  context.lineWidth = config.weight;
  context.strokeStyle = config.color;

  const points = glyph.points;

  // Draw the lines
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];

    context.beginPath();
    context.moveTo(a.x * gridSize, a.y * gridSize);
    context.lineTo(b.x * gridSize, b.y * gridSize);
    context.stroke();
    context.closePath();
  }

  // Draw the points
  for (let i = 0; i < points.length; i++) {
    drawPoint(context, points[i], gridSize);
  }

  return canvas.toDataURL();
}

function frameGlyphInGrid(glyph: Glyph, gridSize: number): void {
  const points = glyph.points;

  const minX = Math.min(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));

  const width = maxX - minX;
  const height = maxY - minY;

  const offsetX = (gridSize - width) / 2;
  const offsetY = (gridSize - height) / 2;

  for (let i = 0; i < points.length; i++) {
    points[i].x += offsetX;
    points[i].y += offsetY;
  }

  glyph.points = points;
}

function drawPoint(context: CanvasRenderingContext2D, point: Vertex, gridSize: number): void {
  context.beginPath();
  context.arc(point.x * gridSize, point.y * gridSize, 2, 0, 2 * Math.PI);
  context.fillStyle = "red";
  context.fill();
  context.closePath();
}

interface BuildAction {
  name: string;
  commonality: number;
  act: (glyph: Glyph) => void;
}

function getActions(): BuildAction[] {
  return [
    {
      name: "move up",
      commonality: 10,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x, y: a.y - 1 };

        glyph.points.push(b);
      },
    },
    {
      name: "move down",
      commonality: 10,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x, y: a.y + 1 };

        glyph.points.push(b);
      },
    },
    {
      name: "move left",
      commonality: 10,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x - 1, y: a.y };

        glyph.points.push(b);
      },
    },
    {
      name: "move right",
      commonality: 10,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x + 1, y: a.y };

        glyph.points.push(b);
      },
    },
    {
      name: "move up 2",
      commonality: 5,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x, y: a.y - 2 };

        glyph.points.push(b);
      },
    },
    {
      name: "move down 2",
      commonality: 5,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x, y: a.y + 2 };

        glyph.points.push(b);
      },
    },
    {
      name: "move left 2",
      commonality: 5,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x - 2, y: a.y };

        glyph.points.push(b);
      },
    },
    {
      name: "move right 2",
      commonality: 5,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x + 2, y: a.y };

        glyph.points.push(b);
      },
    },
    {
      name: "move diagonal up left",
      commonality: 5,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x - 1, y: a.y - 1 };

        glyph.points.push(b);
      },
    },
    {
      name: "move diagonal up right",
      commonality: 5,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x + 1, y: a.y - 1 };

        glyph.points.push(b);
      },
    },
    {
      name: "move diagonal down left",
      commonality: 5,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x - 1, y: a.y + 1 };

        glyph.points.push(b);
      },
    },
    {
      name: "move diagonal down right",
      commonality: 5,
      act: (glyph: Glyph) => {
        const lastPoint = glyph.points[glyph.points.length - 1];

        const a = lastPoint;
        const b = { x: a.x + 1, y: a.y + 1 };

        glyph.points.push(b);
      },
    },
  ];
}
