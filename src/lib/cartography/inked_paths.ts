import { STROKE_WIDTHS } from './cartography';
import type { Ink, InkedPath, StrokeWeight } from './cartography_types';
import type { Vertex } from '$lib/geometry';

function attribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** One connected contour, serialized as one unfilled SVG path. */
export function createInkedPath(
  points: Vertex[],
  ink: Ink,
  weight: StrokeWeight,
  closed: boolean,
): InkedPath {
  return {
    points,
    ink,
    weight,
    closed,
    toSvg: () => {
      if (points.length < 2) return '';
      const d =
        points
          .map(
            (p, i) => `${i === 0 ? 'M' : 'L'} ${Number(p.x.toFixed(3))} ${Number(p.y.toFixed(3))}`,
          )
          .join(' ') + (closed ? ' Z' : '');
      return `<path d="${d}" fill="none" stroke="${attribute(ink.color)}" stroke-width="${STROKE_WIDTHS[weight]}" stroke-opacity="${Number(ink.opacity.toFixed(3))}" stroke-linejoin="round" stroke-linecap="round"/>`;
    },
  };
}
