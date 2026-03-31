import * as RNG from '@ironarachne/rng';
import { createGrid, setTile, isInBounds } from '../grid/grid';
import type { RoomPrimitive, RoomStyle } from './types';

/**
 * Generates a localized room primitive grid.
 *
 * @param seed - The random seed for the generator
 * @param widthBound - Maximum width of the room boundary
 * @param heightBound - Maximum height of the room boundary
 * @param style - "rectangle", "circle", "l-shape", or "blob"
 */
export function generateRoom(
  seed: string,
  widthBound: number,
  heightBound: number,
  style: string,
): RoomPrimitive {
  const rng = new RNG.RNG(seed);
  const roomStyle = style as RoomStyle;

  // Constrain room boundaries (ensure they are at least 3x3 if bounds allow)
  const minW = Math.min(3, Math.max(1, widthBound));
  const minH = Math.min(3, Math.max(1, heightBound));

  const w = rng.int(minW, Math.max(minW, widthBound));
  const h = rng.int(minH, Math.max(minH, heightBound));

  const shape = createGrid<boolean>(w, h, false);

  switch (roomStyle) {
    case 'circle': {
      // Fill an ellipse that fits within w*h
      const cx = w / 2;
      const cy = h / 2;
      const a = (w - 0.5) / 2;
      const b = (h - 0.5) / 2;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = x + 0.5 - cx;
          const dy = y + 0.5 - cy;
          // Equation for inside of an ellipse: x^2 / a^2 + y^2 / b^2 <= 1
          if ((dx * dx) / (a * a) + (dy * dy) / (b * b) <= 1) {
            setTile(shape, x, y, true);
          }
        }
      }
      break;
    }

    case 'l-shape': {
      // Start with a full rectangle
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          setTile(shape, x, y, true);
        }
      }

      // Avoid carving everything out if bounds are very small
      if (w >= 3 && h >= 3) {
        // Carve out a corner leaving at least halls of width 1-2
        const cutW = rng.int(1, w - 2);
        const cutH = rng.int(1, h - 2);

        // Pick one of 4 corners (0: TopLeft, 1: TopRight, 2: BottomLeft, 3: BottomRight)
        const corner = rng.int(0, 3);
        const cornerX = corner === 1 || corner === 3 ? w - cutW : 0;
        const cornerY = corner >= 2 ? h - cutH : 0;

        for (let y = cornerY; y < cornerY + cutH; y++) {
          for (let x = cornerX; x < cornerX + cutW; x++) {
            setTile(shape, x, y, false);
          }
        }
      }
      break;
    }

    case 'blob': {
      // Random drunken walk
      let currX = Math.floor(w / 2);
      let currY = Math.floor(h / 2);

      // Aim for 60% internal fill density
      const targetArea = Math.max(1, Math.floor(w * h * 0.6));
      let currentArea = 0;

      let steps = 0;
      const maxSteps = w * h * 15; // safeguard

      while (currentArea < targetArea && steps < maxSteps) {
        // Only count flips towards area
        if (!shape.data[currY * w + currX]) {
          setTile(shape, currX, currY, true);
          currentArea++;
        }

        // Step logic
        const dir = rng.int(0, 3);
        let nextX = currX;
        let nextY = currY;
        if (dir === 0) nextY--;
        else if (dir === 1) nextX++;
        else if (dir === 2) nextY++;
        else nextX--;

        if (isInBounds(shape, nextX, nextY)) {
          currX = nextX;
          currY = nextY;
        } else {
          // Reset to center on boundary hit to keep blobs compact
          currX = Math.floor(w / 2);
          currY = Math.floor(h / 2);
        }

        steps++;
      }
      break;
    }

    case 'rectangle':
    default: {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          setTile(shape, x, y, true);
        }
      }
      break;
    }
  }

  return {
    width: w,
    height: h,
    style: roomStyle,
    shape,
  };
}
