import type { FillRole, InkRole, ScenePath } from './settlement_illustration_types';
export function n(value: number): string {
  if (!Number.isFinite(value)) throw new Error('Non-finite panorama coordinate');
  return String(Math.round(value * 100) / 100);
}
export function path(
  d: string,
  fill: FillRole = 'none',
  ink: InkRole = 'body',
  strokeWidth = 0.7,
  opacity = 1,
): ScenePath {
  return { d, fill, ink, strokeWidth, opacity };
}
export function polygon(
  points: number[][],
  fill: FillRole = 'paper',
  ink: InkRole = 'body',
): ScenePath {
  return path(
    points.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)},${n(y)}`).join(' ') + ' Z',
    fill,
    ink,
  );
}
/** Sorting object keys makes equivalent snapshots independent of insertion order. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object')
    return (
      '{' +
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => JSON.stringify(key) + ':' + canonical(item))
        .join(',') +
      '}'
    );
  return JSON.stringify(value) ?? 'null';
}
