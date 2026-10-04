/** Controlled desert cartography review, without changing generated or saved geography. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { buildRegionMapSvgString, type RegionMap } from '../src/lib/map';

const { values } = parseArgs({ options: { out: { type: 'string', default: '/tmp/desert-maps' } } });
mkdirSync(values.out!, { recursive: true });

function fixture(waterId: number | null, cold = false): RegionMap {
  const count = 20,
    size = 5;
  const map: RegionMap = { width: 100, height: 100, nodes: [], edges: [], corners: [] };
  for (let row = 0; row < count; row++)
    for (let col = 0; col < count; col++) {
      const id = row * count + col,
        x = col * size,
        y = row * size;
      const chilly = cold || (row >= 14 && col < 14);
      map.nodes.push({
        id,
        center: { x: x + size / 2, y: y + size / 2 },
        polygon: {
          vertices: [
            { x, y },
            { x: x + size, y },
            { x: x + size, y: y + size },
            { x, y: y + size },
          ],
          edges: [],
        },
        neighbors: [
          col > 0 ? id - 1 : -1,
          col < count - 1 ? id + 1 : -1,
          row > 0 ? id - count : -1,
          row < count - 1 ? id + count : -1,
        ].filter((id) => id >= 0),
        edges: [],
        corners: [],
        elevation: col < 14 ? 0.1 : col < 17 ? 0.3 : col < 19 ? 0.6 : 1,
        moisture: 0.1,
        temperature: chilly ? 10 : 30,
        isWater: id === waterId,
        isOcean: false,
        isCoast: false,
        biomeId: id === waterId ? 'freshwater lake' : chilly ? 'cold desert' : 'subtropical desert',
      });
    }
  if (waterId !== null) {
    const lake = map.nodes[waterId];
    lake.corners = [0, 1, 2, 3];
    lake.edges = [0, 1, 2, 3];
    map.corners = lake.polygon.vertices.map((point, id) => ({
      id,
      point,
      touches: [waterId],
      protrudes: [id, (id + 3) % 4],
      adjacent: [(id + 1) % 4, (id + 3) % 4],
      elevation: 0,
      moisture: 1,
      temperature: cold ? 10 : 30,
      isWater: true,
      isOcean: false,
      isCoast: true,
      river: 0,
    }));
    map.edges = lake.polygon.vertices.map((point, id) => ({
      id,
      d0: waterId,
      v0: id,
      v1: (id + 1) % 4,
      river: 0,
      midpoint: {
        x: (point.x + lake.polygon.vertices[(id + 1) % 4].x) / 2,
        y: (point.y + lake.polygon.vertices[(id + 1) % 4].y) / 2,
      },
    }));
  }
  return map;
}

for (const [name, waterId, cold] of [
  ['mixed', 209, false],
  ['unselected-lake', 210, false],
  ['cold', 209, true],
  ['waterless', null, false],
] as const) {
  const map = fixture(waterId, cold);
  writeFileSync(
    join(values.out!, `${name}.svg`),
    buildRegionMapSvgString(map, {
      title: name === 'mixed' ? 'The Amber Wastes' : `Desert display: ${name}`,
      settlements: [{ mapNodeId: 104, name: 'Sunwatch', population: 600, category: 'village' }],
      features: [
        {
          id: 'dunes',
          name: cold ? 'Cold dunes' : 'Amber dunes',
          kind: 'habitat',
          nodeIds: [125, 145, 165],
          edgeIds: [],
        },
        {
          id: 'crags',
          name: 'Broken crags',
          kind: 'habitat',
          nodeIds: [155, 175, 195],
          edgeIds: [],
        },
      ],
    }),
  );
}
console.log(`Wrote desert map fixtures to ${values.out}`);
