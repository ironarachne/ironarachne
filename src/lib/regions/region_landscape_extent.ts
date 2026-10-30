import type { MapNode } from '$lib/map';
import type { RegionSnapshot } from './region_snapshot';
import type { LandscapeFootprintObservation } from './region_landscape_reading_types';

const numbers = (ids: number[]) => [...new Set(ids)].sort((a, b) => a - b);
const lexical = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Complete denominator and topology: additions must invalidate saved extent too. */
export function landscapeFootprintObservation(
  snapshot: Pick<RegionSnapshot, 'facts' | 'map'>,
  factIds: string[],
): LandscapeFootprintObservation {
  const cells = snapshot.map.nodes
    .filter((node) => !node.isWater && !node.isOcean)
    .sort((a, b) => a.id - b.id);
  const footprints = [...new Set(factIds)].sort(lexical).map((factId) => {
    const fact = [
      ...snapshot.facts.areas,
      ...snapshot.facts.denseForests,
      ...snapshot.facts.mountainRanges,
    ].find((fact) => fact.id === factId);
    return { factId, nodeIds: numbers(fact?.mapNodeIds ?? []) };
  });
  return {
    kind: 'landscape-footprint',
    footprints,
    landNodeIds: cells.map((node) => node.id),
    mapWidth: snapshot.map.width,
    mapHeight: snapshot.map.height,
    cells: cells.map((node) => ({
      nodeId: node.id,
      x: node.center.x,
      y: node.center.y,
      neighborIds: numbers(node.neighbors),
    })),
  };
}

export function landscapeObservationCurrent(
  snapshot: Pick<RegionSnapshot, 'facts' | 'map'>,
  observation: LandscapeFootprintObservation,
): boolean {
  const key = (value: LandscapeFootprintObservation) =>
    JSON.stringify([
      value.mapWidth,
      value.mapHeight,
      value.landNodeIds,
      value.footprints.map((entry) => [entry.factId, entry.nodeIds]),
      value.cells.map((cell) => [cell.nodeId, cell.x, cell.y, cell.neighborIds]),
    ]);
  return (
    key(observation) ===
    key(
      landscapeFootprintObservation(
        snapshot,
        observation.footprints.map((entry) => entry.factId),
      ),
    )
  );
}

const sectorNames = [
  'northwest',
  'north',
  'northeast',
  'west',
  'center',
  'east',
  'southwest',
  'south',
  'southeast',
];
const compassOrder = [
  'north',
  'northeast',
  'east',
  'southeast',
  'south',
  'southwest',
  'west',
  'northwest',
  'center',
];
const band = (value: number) => (value < 1 / 3 ? 0 : value > 2 / 3 ? 2 : 1);

/** Same sorted neighbor traversal as habitat components, without joining absent cells. */
function componentCount(nodes: Pick<MapNode, 'id' | 'neighbors'>[]): number {
  const remaining = new Map(nodes.map((node) => [node.id, node]));
  let count = 0;
  for (const node of nodes) {
    if (!remaining.delete(node.id)) continue;
    count++;
    const queue = [node];
    for (let i = 0; i < queue.length; i++) {
      for (const id of numbers(queue[i].neighbors)) {
        const next = remaining.get(id);
        if (next) {
          remaining.delete(id);
          queue.push(next);
        }
      }
    }
  }
  return count;
}

/** Interpret the entire footprint; wording never treats its centroid as its boundaries. */
export function landscapeExtent(observation: LandscapeFootprintObservation):
  | {
      phrase: string;
      location: string;
      small: boolean;
      count: number;
    }
  | undefined {
  const ids = numbers(observation.footprints.flatMap((entry) => entry.nodeIds));
  const landIds = new Set(observation.landNodeIds);
  if (
    !ids.length ||
    ids.some((id) => !landIds.has(id)) ||
    !Number.isFinite(observation.mapWidth) ||
    observation.mapWidth <= 0 ||
    !Number.isFinite(observation.mapHeight) ||
    observation.mapHeight <= 0
  )
    return undefined;
  const nodes = observation.cells.filter((cell) => ids.includes(cell.nodeId));
  if (
    nodes.length !== ids.length ||
    nodes.some((cell) => !Number.isFinite(cell.x) || !Number.isFinite(cell.y))
  )
    return undefined;
  const sectors = nodes.map(
    (cell) => band(cell.y / observation.mapHeight) * 3 + band(cell.x / observation.mapWidth),
  );
  const counts = Array.from(
    { length: 9 },
    (_, i) => sectors.filter((sector) => sector === i).length,
  );
  const disconnected =
    componentCount(nodes.map((cell) => ({ id: cell.nodeId, neighbors: cell.neighborIds }))) > 1;
  const small = ids.length < 3 || ids.length * 10 < landIds.size;
  const result = (phrase: string, location: string) => ({
    phrase,
    location,
    small,
    count: ids.length,
  });
  if (ids.length * 3 >= landIds.size * 2)
    return result(
      `covers much of the region${disconnected ? ' in separate stretches' : ''}`,
      'across much of the region',
    );
  const concentration = (indices: number[]) =>
    indices.reduce((sum, i) => sum + counts[i], 0) * 3 >= ids.length * 2;
  const corner = [0, 2, 8, 6].find((index) => concentration([index]));
  const axes: [string, number[]][] = [
    ['north', [0, 1, 2]],
    ['east', [2, 5, 8]],
    ['south', [6, 7, 8]],
    ['west', [0, 3, 6]],
  ];
  const direction =
    corner !== undefined
      ? sectorNames[corner]
      : concentration([4])
        ? 'center'
        : axes.find(([, indices]) => concentration(indices))?.[0];
  if (direction) {
    const where = direction === 'center' ? 'the center' : `the ${direction}`;
    return result(
      `${disconnected ? 'forms separate patches' : 'lies'} mainly in ${where}`,
      `in ${where}`,
    );
  }
  const occupied = counts.flatMap((count, index) => (count ? [index] : []));
  if (disconnected) {
    const leading = [...occupied].sort(
      (a, b) =>
        counts[b] - counts[a] ||
        compassOrder.indexOf(sectorNames[a]) - compassOrder.indexOf(sectorNames[b]),
    );
    const localized = leading.length <= 2;
    const where = localized
      ? `in the ${sectorNames[leading[0]]} and ${sectorNames[leading[1]]}`
      : 'across several parts of the region';
    return result(`forms separate patches ${where}`, where);
  }
  const xs = occupied.map((i) => i % 3),
    ys = occupied.map((i) => Math.floor(i / 3));
  const rectangleSize =
    (Math.max(...xs) - Math.min(...xs) + 1) * (Math.max(...ys) - Math.min(...ys) + 1);
  if (rectangleSize === occupied.length && occupied.length <= 3) {
    const from = sectorNames[occupied[0]],
      to = sectorNames[occupied.at(-1)!];
    return result(`extends from the ${from} into the ${to}`, `from the ${from} into the ${to}`);
  }
  return result(
    'stretches across several parts of the region',
    'across several parts of the region',
  );
}
