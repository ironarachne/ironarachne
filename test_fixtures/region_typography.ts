import { denseForestFixture } from '../scripts/region_dense_forest_fixture';
import type { RegionMap, RegionMapSvgOptions, SettlementIconCategory } from '../src/lib/map';
import { buildRiverNetwork, detectMountainRanges, detectDenseForests } from '../src/lib/map';
import { mountainRangeFixture } from '../scripts/region_mountain_range_fixture';

/** Winding, named channel with a confluence and a boundary outlet, on controlled dry terrain. */
export function typographyRiverFixture(network = true): {
  map: RegionMap;
  options: RegionMapSvgOptions;
} {
  const map = mountainRangeFixture();
  for (const node of map.nodes) node.elevation = 0.1;
  const corner = (x: number, y: number) =>
    map.corners.find((c) => c.point.x === x && c.point.y === y)!;
  const main: Array<[number, number]> = [
    [4, 16],
    [6, 16],
    [8, 16],
    [10, 16],
    [12, 16],
    [12, 18],
    [14, 18],
    [16, 18],
    [18, 18],
    [20, 18],
    [22, 18],
    [24, 18],
    [26, 18],
    [28, 18],
    [30, 18],
    [32, 18],
    [34, 18],
    [36, 18],
    [38, 18],
    [40, 18],
  ];
  const tributary: Array<[number, number]> = [
    [20, 10],
    [20, 12],
    [20, 14],
    [20, 16],
    [20, 18],
  ];
  const edges: number[] = [];
  for (const [index, path] of [main, tributary].entries()) {
    for (let i = 0; i < path.length - 1; i++) {
      const from = corner(...path[i]),
        to = corner(...path[i + 1]);
      from.downslope = to.id;
      const edge = map.edges.find(
        (e) => (e.v0 === from.id && e.v1 === to.id) || (e.v1 === from.id && e.v0 === to.id),
      )!;
      edge.river = index === 1 ? 1 : i < 9 ? 4 : 5;
      if (index === 0) edges.push(edge.id);
    }
  }
  if (network) map.rivers = buildRiverNetwork(map);
  return {
    map,
    options: {
      title: 'The River Marches',
      rivers: [{ id: 'route:river:review', name: 'Aster River', edgeIds: edges }],
    },
  };
}

/** Category hierarchy, long title, area, and point landmark in one fixed geography. */
export function typographyPlacesFixture(): { map: RegionMap; options: RegionMapSvgOptions } {
  const map = mountainRangeFixture();
  for (const node of map.nodes) node.elevation = 0.1;
  const site = (x: number, y: number) =>
    map.nodes.find((node) => node.center.x === x && node.center.y === y)!.id;
  const categories: SettlementIconCategory[] = [
    'hamlet',
    'village',
    'town',
    'borough',
    'city',
    'metropolis',
  ];
  return {
    map,
    options: {
      title: 'The Long Principality of Widewater',
      settlements: categories.map((category, i) => ({
        id: `settlement:${i}`,
        mapNodeId: site(5 + i * 6, 9),
        name: ['Lowby', 'Willow', 'Stoneford', 'Eastgate', 'High Haven', 'Crownport'][i],
        category,
        population: [100, 500, 1000, 3000, 10000, 50000][i],
        isCapital: i === 1,
      })),
      features: [
        {
          id: 'landmark:mill',
          name: 'The Old Mill',
          kind: 'landmark',
          nodeIds: [site(31, 21)],
          edgeIds: [],
        },
        {
          id: 'area:woods',
          name: 'Greenwood',
          kind: 'habitat',
          nodeIds: map.nodes
            .filter((node) => node.center.x < 25 && node.center.y > 15 && node.center.y < 27)
            .map((node) => node.id),
          edgeIds: [],
        },
      ],
    },
  };
}

export function typographyRangeFixture(): { map: RegionMap; options: RegionMapSvgOptions } {
  const map = mountainRangeFixture(true);
  const ranges = detectMountainRanges(map).map((range, index) => ({
    ...range,
    id: `range:mountain:${range.mapNodeIds[0]}`,
    name: index === 0 ? 'Greyback Mountains' : 'East Ridge',
  }));
  return { map, options: { title: 'The Mountain Marches', mountainRanges: ranges } };
}

export function typographyForestFixture(): { map: RegionMap; options: RegionMapSvgOptions } {
  const map = denseForestFixture();
  const forest = { ...detectDenseForests(map)[0], id: 'forest:dense:review' };
  return {
    map,
    options: {
      title: 'The Forest Marches',
      denseForests: [forest],
      features: [
        {
          id: 'landmark:' + forest.id,
          name: 'Greywood',
          kind: 'landmark',
          nodeIds: forest.mapNodeIds,
          edgeIds: [],
        },
      ],
    },
  };
}
