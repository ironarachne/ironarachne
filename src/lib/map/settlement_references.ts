import type { Vertex } from '$lib/geometry';
import type { RegionMap } from './map_graph';
import type { PlacedSettlementIcon } from './settlement_icon_types';
import type { SettlementMapReference, SettlementKeyPlacement } from './settlement_reference_types';
import type { TextBox } from './terrain_glyph_types';
import { inscriptionBounds, mapTextStyle, mapTextWidth } from './region_map_typography';

export function settlementMapReferences(
  map: RegionMap,
  icons: PlacedSettlementIcon[],
): SettlementMapReference[] {
  const references = icons
    .filter(({ settlement }) => (settlement.name?.length ?? 0) > 0)
    .map(({ settlement, bounds }) => ({
      settlementId: settlement.id ?? `map-node:${settlement.mapNodeId}`,
      key: 0,
      name: settlement.name!,
      site: map.nodes.find((node) => node.id === settlement.mapNodeId)!.center,
      markerBounds: bounds,
    }))
    .sort((a, b) => a.settlementId.localeCompare(b.settlementId) || a.name.localeCompare(b.name));
  const ids = [...new Set(references.map((reference) => reference.settlementId))];
  return references.map((reference) => ({
    ...reference,
    key: ids.indexOf(reference.settlementId) + 1,
  }));
}

function overlaps(a: TextBox, b: TextBox): boolean {
  return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;
}

function keyBounds(key: number, origin: Vertex, fontSize: number): TextBox {
  return inscriptionBounds(String(key), mapTextStyle(fontSize), {
    kind: 'straight',
    origin,
    anchor: 'middle',
  });
}

function adjacentKeys(
  reference: SettlementMapReference,
  fontSize: number,
): SettlementKeyPlacement[] {
  const { markerBounds: box } = reference;
  const sample = keyBounds(reference.key, { x: 0, y: 0 }, fontSize);
  const gap = fontSize * 0.25 + 0.01;
  const x = (box.minX + box.maxX) / 2;
  const y = (box.minY + box.maxY) / 2 - (sample.minY + sample.maxY) / 2;
  const left = box.minX - sample.maxX - gap;
  const right = box.maxX - sample.minX + gap;
  const above = box.minY - sample.maxY - gap;
  const below = box.maxY - sample.minY + gap;
  return [
    { x, y: above },
    { x: right, y },
    { x: left, y },
    { x, y: below },
    { x: right, y: above },
    { x: left, y: above },
    { x: right, y: below },
    { x: left, y: below },
  ].map((origin) => ({
    settlementId: reference.settlementId,
    key: reference.key,
    kind: 'adjacent',
    bounds: keyBounds(reference.key, origin, fontSize),
    origin,
    leader: [],
  }));
}

/** Orthogonal leader segments reserve ink clearance as well as their centerlines. */
export function settlementLeaderBoxes(points: Vertex[], clearance: number): TextBox[] {
  return points.slice(1).map((point, index) => ({
    minX: Math.min(point.x, points[index].x) - clearance,
    maxX: Math.max(point.x, points[index].x) + clearance,
    minY: Math.min(point.y, points[index].y) - clearance,
    maxY: Math.max(point.y, points[index].y) + clearance,
  }));
}

/** A rectilinear visibility grid routes around the exact marker/furniture reservations. */
function routeLeader(
  start: Vertex,
  end: Vertex,
  obstacles: TextBox[],
  gap: number,
): Vertex[] | null {
  const xs = [
    ...new Set([start.x, end.x, ...obstacles.flatMap((b) => [b.minX - gap, b.maxX + gap])]),
  ].sort((a, b) => a - b);
  const ys = [
    ...new Set([start.y, end.y, ...obstacles.flatMap((b) => [b.minY - gap, b.maxY + gap])]),
  ].sort((a, b) => a - b);
  const width = xs.length;
  const startId = ys.indexOf(start.y) * width + xs.indexOf(start.x);
  const endId = ys.indexOf(end.y) * width + xs.indexOf(end.x);
  const point = (id: number): Vertex => ({ x: xs[id % width], y: ys[Math.floor(id / width)] });
  const cost = new Map([[startId, 0]]);
  const previous = new Map<number, number>();
  const open = new Set([startId]);
  while (open.size) {
    const id = [...open].reduce((best, next) => {
      const score = (value: number) =>
        cost.get(value)! + Math.abs(point(value).x - end.x) + Math.abs(point(value).y - end.y);
      return score(next) < score(best) ? next : best;
    });
    if (id === endId) {
      const path: Vertex[] = [];
      let current: number | undefined = id;
      while (current !== undefined) {
        path.unshift(point(current));
        current = previous.get(current);
      }
      // Remove collinear intermediate grid points without changing the routed path.
      return path.filter(
        (p, i) =>
          i === 0 ||
          i === path.length - 1 ||
          !(
            (path[i - 1].x === p.x && p.x === path[i + 1].x) ||
            (path[i - 1].y === p.y && p.y === path[i + 1].y)
          ),
      );
    }
    open.delete(id);
    const x = id % width,
      y = Math.floor(id / width);
    const neighbors = [
      x > 0 ? id - 1 : -1,
      x + 1 < width ? id + 1 : -1,
      y > 0 ? id - width : -1,
      y + 1 < ys.length ? id + width : -1,
    ];
    for (const next of neighbors.filter((value) => value >= 0)) {
      const a = point(id),
        b = point(next);
      const segment = settlementLeaderBoxes([a, b], gap * 0.25)[0];
      if (obstacles.some((box) => overlaps(segment, box))) continue;
      const nextCost = cost.get(id)! + Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      if (nextCost >= (cost.get(next) ?? Infinity)) continue;
      cost.set(next, nextCost);
      previous.set(next, id);
      open.add(next);
    }
  }
  return null;
}

/**
 * Backtrack key choices as a set: a locally attractive key must not strand another settlement's
 * leader. Gutter candidates are lazy, so ordinary maps never pay for routing a visibility grid.
 */
export function placeSettlementKeys(
  map: RegionMap,
  references: SettlementMapReference[],
  forbidden: TextBox[],
  fontSize: number,
): SettlementKeyPlacement[] {
  // Legacy callers can supply several names for one node without saved IDs. One locator
  // identifies that site; the index retains a separate literal row for every supplied name.
  const targets = [...new Set(references.map((r) => r.settlementId))].map((id) => {
    const aliases = references.filter((r) => r.settlementId === id);
    return {
      ...aliases[0],
      markerBounds: {
        minX: Math.min(...aliases.map((r) => r.markerBounds.minX)),
        minY: Math.min(...aliases.map((r) => r.markerBounds.minY)),
        maxX: Math.max(...aliases.map((r) => r.markerBounds.maxX)),
        maxY: Math.max(...aliases.map((r) => r.markerBounds.maxY)),
      },
    };
  });
  const local = new Map(
    targets.map((reference) => [
      reference.key,
      adjacentKeys(reference, fontSize).filter(
        ({ bounds }) =>
          bounds.minX >= 0 &&
          bounds.minY >= 0 &&
          bounds.maxX <= map.width &&
          bounds.maxY <= map.height &&
          !forbidden.some((box) => overlaps(bounds, box)),
      ),
    ]),
  );
  const order = [...targets].sort(
    (a, b) => local.get(a.key)!.length - local.get(b.key)!.length || a.key - b.key,
  );
  const gap = fontSize * 0.12;
  const gutterWidth =
    Math.max(...references.map((r) => mapTextWidth(String(r.key), mapTextStyle(fontSize)))) +
    fontSize * 2;
  function solve(
    index: number,
    placed: SettlementKeyPlacement[],
    occupied: TextBox[],
  ): SettlementKeyPlacement[] | null {
    if (index === order.length) return placed;
    const reference = order[index];
    for (const candidate of local.get(reference.key)!) {
      if (occupied.some((box) => overlaps(candidate.bounds, box))) continue;
      const result = solve(index + 1, [...placed, candidate], [...occupied, candidate.bounds]);
      if (result) return result;
    }
    const rowHeight = fontSize * 2.4;
    const rows = [
      ...new Set([reference.site.y, ...references.map((_, row) => rowHeight * (row + 1))]),
    ];
    for (const x of [-gutterWidth, map.width + gutterWidth]) {
      for (const y of rows) {
        const origin = { x, y };
        const bounds = keyBounds(reference.key, origin, fontSize);
        if ([...forbidden, ...occupied].some((box) => overlaps(bounds, box))) continue;
        const routeObstacles = [
          ...forbidden.filter(
            (box) =>
              !references.some(
                (r) => r.settlementId === reference.settlementId && r.markerBounds === box,
              ),
          ),
          ...occupied,
        ];
        const start = {
          x: x < 0 ? bounds.maxX + gap : bounds.minX - gap,
          y: (bounds.minY + bounds.maxY) / 2,
        };
        const leader = routeLeader(start, reference.site, [...routeObstacles, bounds], gap);
        if (!leader) continue;
        const candidate: SettlementKeyPlacement = {
          settlementId: reference.settlementId,
          key: reference.key,
          kind: 'gutter',
          bounds,
          origin,
          leader,
        };
        const result = solve(
          index + 1,
          [...placed, candidate],
          [...occupied, bounds, ...settlementLeaderBoxes(leader, gap * 0.25)],
        );
        if (result) return result;
      }
    }
    return null;
  }
  const result = solve(0, [], []);
  if (!result)
    throw new Error(
      'Settlement reference keys cannot be routed around the supplied overlapping map reservations',
    );
  return result.sort((a, b) => a.key - b.key);
}

/** Wrap by measured advances, retaining every character, including long unbroken authored names. */
export function settlementIndexLines(name: string, width: number, fontSize: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const { segment: character } of new Intl.Segmenter('en', {
    granularity: 'grapheme',
  }).segment(name)) {
    if (line && mapTextWidth(line + character, mapTextStyle(fontSize)) > width) {
      const wordBreak = line.lastIndexOf(' ');
      if (wordBreak > 0) {
        lines.push(line.slice(0, wordBreak + 1));
        line = line.slice(wordBreak + 1);
      } else {
        lines.push(line);
        line = '';
      }
    }
    // A very short preceding word can leave an almost-full remainder after a word break.
    if (line && mapTextWidth(line + character, mapTextStyle(fontSize)) > width) {
      lines.push(line);
      line = '';
    }
    line += character;
  }
  if (line) lines.push(line);
  return lines;
}
