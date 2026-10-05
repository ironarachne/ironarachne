/** Controlled map showing the approved tree artwork at actual renderer placement scales. */
import { writeFileSync } from 'node:fs';
import { buildRegionMapSvgString, type RegionMap } from '../../src/lib/map';

const biomes = [
  'temperate deciduous forest',
  'boreal forest',
  'tropical rainforest',
  'temperate grassland',
  'temperate grassland',
  'temperate grassland',
  '',
  '',
  '',
];
const elevations = [0.1, 0.1, 0.1, 0.35, 0.6, 0.9, 0.1, 0.1, 0.1];
const map: RegionMap = {
  width: 30,
  height: 30,
  nodes: biomes.map((biomeId, id) => {
    const x = (id % 3) * 10,
      y = Math.floor(id / 3) * 10;
    return {
      id,
      biomeId,
      elevation: elevations[id],
      center: { x: x + 5, y: y + 5 },
      polygon: {
        vertices: [
          { x, y },
          { x: x + 10, y },
          { x: x + 10, y: y + 10 },
          { x, y: y + 10 },
        ],
        edges: [],
      },
      neighbors: [],
      edges: [],
      corners: [],
      moisture: 0.8,
      temperature: 20,
      isWater: false,
      isOcean: false,
      isCoast: false,
    };
  }),
  edges: [],
  corners: [],
};
const svg = buildRegionMapSvgString(map);
writeFileSync('docs/region-tree-icons-389/fixture.svg', svg);
console.log(
  'Wrote fixture.svg: top row deciduous/conifer/palm; middle row hill/mountain/high mountain.',
);
