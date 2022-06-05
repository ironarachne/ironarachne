'use strict';

import Vertex from "./vertex";

// getAngleOfLine gets the angle of the line compared to the x-axis in degrees
export function getAngleOfLine(a: Vertex, b: Vertex): number {
  let dx = b.x - a.x;
  let dy = b.y - a.y;

  if (dx == 0) {
    if (dy > 0) {
      return 90;
    } else {
      return 270;
    }
  }

  let t = Math.atan2(dy, dx);
  t *= 180/Math.PI;
  if (t < 0) {
    t = 360 + t;
  }

  return t;
}

export function getDirectionFromOrigin(a: Vertex, b: Vertex): string {
  let angle = getAngleOfLine(a, b);

  if (angle >= 315 || angle <= 45) {
    return "east";
  } else if (angle > 45 && angle <= 135) {
    return "north";
  } else if (angle > 135 && angle <= 180) {
    return "west";
  }

  return "south";
}
