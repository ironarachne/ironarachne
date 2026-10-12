import type { MapNode, RegionMap } from '../src/lib/map';

/** Controlled geography: curved mountain ridge and isolated peak; optional lake interruption. */
export function mountainRangeFixture(curved = false, lake = false): RegionMap {
  const width = 40,
    height = 30,
    size = 2,
    columns = width / size,
    rows = height / size;
  const nodes: MapNode[] = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < columns; x++) {
      const ridgeY = curved && x >= 8 && x <= 12 ? 8 : 7;
      const ridge =
        x >= 3 && x <= 16 && (y === ridgeY || (curved && (x === 8 || x === 12) && y === 7));
      const vertices = [
        { x: x * size, y: y * size },
        { x: (x + 1) * size, y: y * size },
        { x: (x + 1) * size, y: (y + 1) * size },
        { x: x * size, y: (y + 1) * size },
      ];
      nodes.push({
        id: y * columns + x,
        center: { x: (x + 0.5) * size, y: (y + 0.5) * size },
        polygon: { vertices, edges: vertices.map((a, i) => ({ a, b: vertices[(i + 1) % 4] })) },
        elevation: ridge ? (x % 3 === 0 ? 0.6 : 1) : x === 17 && y === 4 ? 1 : 0,
        isWater: lake && x === 10 && y >= 6 && y <= 9,
        isOcean: false,
        isCoast: false,
        moisture: 0.5,
        temperature: 15,
        biomeId: 'temperate grassland',
        neighbors: [],
        edges: [],
        corners: [],
      });
    }
  const map: RegionMap = { width, height, nodes, edges: [], corners: [] };
  const cornerId = (x: number, y: number) => y * (columns + 1) + x;
  for (let y = 0; y <= rows; y++)
    for (let x = 0; x <= columns; x++) {
      map.corners.push({
        id: cornerId(x, y),
        point: { x: x * size, y: y * size },
        touches: [],
        protrudes: [],
        adjacent: [],
        elevation: 0,
        moisture: 0.5,
        temperature: 15,
        isWater: false,
        isOcean: false,
        isCoast: false,
        river: 0,
      });
    }
  const edgeLookup = new Map<string, number>();
  for (const node of nodes) {
    const x = node.id % columns,
      y = Math.floor(node.id / columns);
    node.corners = [cornerId(x, y), cornerId(x + 1, y), cornerId(x + 1, y + 1), cornerId(x, y + 1)];
    node.corners.forEach((id) => map.corners[id].touches.push(node.id));
    for (let i = 0; i < node.corners.length; i++) {
      const a = node.corners[i],
        b = node.corners[(i + 1) % node.corners.length];
      const key = [a, b].sort((u, v) => u - v).join(':');
      const existing = edgeLookup.get(key);
      if (existing !== undefined) {
        const edge = map.edges[existing];
        edge.d1 = node.id;
        node.edges.push(existing);
        node.neighbors.push(edge.d0);
        nodes[edge.d0].neighbors.push(node.id);
        continue;
      }
      const id = map.edges.length;
      edgeLookup.set(key, id);
      node.edges.push(id);
      const start = map.corners[a].point,
        end = map.corners[b].point;
      map.edges.push({
        id,
        d0: node.id,
        v0: a,
        v1: b,
        river: 0,
        midpoint: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
      });
      map.corners[a].protrudes.push(id);
      map.corners[b].protrudes.push(id);
      map.corners[a].adjacent.push(b);
      map.corners[b].adjacent.push(a);
    }
  }
  return map;
}
