import type { MapNode, RegionMap, RegionMapSvgOptions } from '../src/lib/map';

/** Dense sites, both map edges, reported names, and an unbroken authored name that cannot fit. */
export function settlementReferencesFixture(): { map: RegionMap; options: RegionMapSvgOptions } {
  const sites = [
    [0.2, 0.2],
    [19.8, 11.8],
    [8, 5],
    [11, 5],
    [8, 8],
    [11, 8],
  ];
  const nodes: MapNode[] = sites.map(([x, y], id) => ({
    id,
    center: { x, y },
    polygon: {
      vertices: [
        { x: x - 0.1, y: y - 0.1 },
        { x: x + 0.1, y: y - 0.1 },
        { x: x + 0.1, y: y + 0.1 },
        { x: x - 0.1, y: y + 0.1 },
      ],
      edges: [],
    },
    neighbors: [],
    edges: [],
    corners: [],
    elevation: 0.1,
    moisture: 0.5,
    temperature: 15,
    isWater: false,
    isOcean: false,
    isCoast: false,
    biomeId: 'temperate grassland',
  }));
  const names = [
    'Ilistair’s Folly',
    'Maenas',
    'East & West <Harbor>',
    'Éléonore',
    'W'.repeat(100),
    'The Long Settlement Name With Several Authored Words',
  ];
  const populations = [16533, 1501, 500, 100, 30, 70];
  return {
    map: { width: 20, height: 12, nodes, corners: [], edges: [] },
    options: {
      title: 'The Woods of Belvorn',
      settlements: nodes.map((node, index) => ({
        id: `settlement:${index + 1}`,
        mapNodeId: node.id,
        name: names[index],
        population: populations[index],
        isCapital: index === 0,
      })),
    },
  };
}

/** A narrow geographical crop forces its locator into a gutter, without moving the saved site. */
export function settlementGutterFixture(): { map: RegionMap; options: RegionMapSvgOptions } {
  const { map, options } = settlementReferencesFixture();
  map.width = 0.5;
  map.nodes = [
    {
      ...map.nodes[0],
      center: { x: 0.25, y: 6 },
      polygon: {
        vertices: [
          { x: 0.15, y: 5.9 },
          { x: 0.35, y: 5.9 },
          { x: 0.35, y: 6.1 },
          { x: 0.15, y: 6.1 },
        ],
        edges: [],
      },
    },
  ];
  options.title = '';
  options.settlements = [options.settlements![0]];
  return { map, options };
}
