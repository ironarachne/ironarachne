import { distancePointToSegmentSquared } from '$lib/geometry';
import type { Vertex } from '$lib/geometry';

/** Distance inside the water, capped beyond the furthest band. Outside water is zero. */
export function sampleWaterDistance(
  shoreline: Vertex[],
  width: number,
  height: number,
  step: number,
  reach: number,
) {
  const columns = Math.ceil(width / step) + 3;
  const rows = Math.ceil(height / step) + 3;
  const values = new Float64Array(columns * rows);
  const cap = reach + step * 2;
  const edges = shoreline.map((a, i) => ({ a, b: shoreline[(i + 1) % shoreline.length] }));

  // Scanline parity uses the whole closed water boundary, including the off-map closing runs.
  for (let row = 0; row < rows; row++) {
    const y = (row - 1) * step;
    const crossings = edges
      .filter(({ a, b }) => a.y > y !== b.y > y)
      .map(({ a, b }) => a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y))
      .sort((a, b) => a - b);
    let crossing = 0;
    for (let column = 0; column < columns; column++) {
      const x = (column - 1) * step;
      while (crossing < crossings.length && crossings[crossing] <= x) crossing++;
      if (crossing % 2 === 1) values[row * columns + column] = cap * cap;
    }
  }

  // Only actual shore near the viewport produces bands; the padded crop must not become a coast.
  const visible = edges.filter(
    ({ a, b }) =>
      Math.max(a.x, b.x) >= -step &&
      Math.min(a.x, b.x) <= width + step &&
      Math.max(a.y, b.y) >= -step &&
      Math.min(a.y, b.y) <= height + step,
  );
  for (const { a, b } of visible) {
    const left = Math.max(0, Math.floor((Math.min(a.x, b.x) - cap) / step) + 1);
    const right = Math.min(columns - 1, Math.ceil((Math.max(a.x, b.x) + cap) / step) + 1);
    const top = Math.max(0, Math.floor((Math.min(a.y, b.y) - cap) / step) + 1);
    const bottom = Math.min(rows - 1, Math.ceil((Math.max(a.y, b.y) + cap) / step) + 1);
    for (let row = top; row <= bottom; row++) {
      for (let column = left; column <= right; column++) {
        const index = row * columns + column;
        if (values[index] === 0) continue;
        const point = { x: (column - 1) * step, y: (row - 1) * step };
        values[index] = Math.min(values[index], distancePointToSegmentSquared(point, a, b));
      }
    }
  }
  for (let i = 0; i < values.length; i++) values[i] = Math.sqrt(values[i]);
  return { columns, rows, values, step };
}
