/** Reproduce the six-biome fixture and warm-render measurements without changing geography. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { RNG } from '@ironarachne/rng';
import { buildBaseMapGraph, buildRegionMapSvgString } from '../src/lib/map';
import { Regions, toRegionSnapshot, regionToMapSvg } from '../src/lib/regions';

const { values } = parseArgs({
  options: { out: { type: 'string', default: '/tmp/region-biome-review' } },
});
const output = values.out!;
mkdirSync(output, { recursive: true });
const biomes = [
  'tropical savanna',
  'montane grassland',
  'ice cap',
  'mangrove forest',
  'mediterranean woodland',
  'temperate rainforest',
];
const comparisons = [
  'temperate grassland',
  'tundra',
  'subtropical desert',
  'tropical rainforest',
  'temperate deciduous forest',
  'boreal forest',
];
const mixed = buildBaseMapGraph({
  width: 120,
  height: 80,
  pointSpacing: 6,
  seed: 'six-biomes',
  rng: new RNG('six-biomes'),
});
for (const node of mixed.nodes) {
  const column = Math.min(5, Math.floor(node.center.x / 20));
  node.biomeId = node.center.y > 60 ? comparisons[column] : biomes[column];
  node.elevation = node.center.y < 8 ? [0.3, 0.6, 0.9][column % 3] : 0.1;
  node.isWater = node.center.y > 42 && node.center.y < 51;
  if (node.isWater) node.biomeId = 'lake';
  node.moisture = 0.6;
  node.temperature = 15;
}
for (const corner of mixed.corners) {
  const touching = corner.touches.map((id) => mixed.nodes[id]);
  corner.isWater = touching.every((node) => node.isWater);
  corner.isCoast = touching.some((node) => node.isWater) && touching.some((node) => !node.isWater);
}
const town = mixed.nodes.find(
  (node) => node.center.x > 95 && node.center.y > 25 && node.center.y < 35,
)!;
const renderers = new Map<string, () => string>([
  [
    'mixed',
    () =>
      buildRegionMapSvgString(mixed, {
        title: 'Six biomes',
        settlements: [{ mapNodeId: town.id, name: 'Cedarwatch', category: 'town' }],
      }),
  ],
]);
for (const seed of ['alpha', 'bravo', 'charlie']) {
  const config = Regions.getDefaultConfig(new RNG(seed));
  config.mapWidth = 60;
  config.mapHeight = 35;
  const snapshot = toRegionSnapshot(Regions.generate(config));
  renderers.set(seed, () => regionToMapSvg(snapshot));
}
const metrics = [];
for (const [name, render] of renderers) {
  render();
  const times: number[] = [];
  let svg = '';
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    svg = render();
    times.push(performance.now() - start);
  }
  writeFileSync(join(output, `${name}.svg`), svg);
  metrics.push({
    name,
    bytes: Buffer.byteLength(svg),
    glyphs: [...svg.matchAll(/<use href="#[^"]+" transform="translate/g)].length,
    medianMs: times.sort((a, b) => a - b)[2],
  });
}
writeFileSync(join(output, 'metrics.json'), `${JSON.stringify(metrics, null, 2)}\n`);
console.log(`Wrote region review maps and measurements to ${output}`);
