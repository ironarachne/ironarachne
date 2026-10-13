import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { RNG } from '@ironarachne/rng';
import { buildRegionMapSvgString } from '../src/lib/map';
import { getFantasyNameGeneratorSet } from '../src/lib/names';
import { generate, getDefaultConfig, regionToMapSvg, toRegionSnapshot } from '../src/lib/regions';
import { WATER_REVIEW_MAPS } from '../test_fixtures/region_water_maps';

const { values } = parseArgs({
  options: { out: { type: 'string', default: '/tmp/region-water-review' } },
});
const output = values.out!;
mkdirSync(output, { recursive: true });
const renderers = new Map<string, () => string>();
for (const [name, map] of Object.entries(WATER_REVIEW_MAPS))
  renderers.set(name, () => buildRegionMapSvgString(map, { title: `Water study: ${name}` }));
for (const seed of ['alpha', 'bravo', 'charlie']) {
  const rng = new RNG(seed);
  const config = getDefaultConfig(rng);
  config.nameGeneratorSet = getFantasyNameGeneratorSet('tiefling', rng);
  config.mapWidth = 60;
  config.mapHeight = 35;
  const snapshot = toRegionSnapshot(generate(config));
  renderers.set(seed, () => regionToMapSvg(snapshot));
}
const metrics = [];
for (const [name, render] of renderers) {
  render();
  const times = [];
  let svg = '';
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    svg = render();
    times.push(performance.now() - start);
  }
  writeFileSync(join(output, `${name}.svg`), svg);
  metrics.push({ name, bytes: Buffer.byteLength(svg), medianMs: times.sort((a, b) => a - b)[2] });
}
writeFileSync(join(output, 'metrics.json'), `${JSON.stringify(metrics, null, 2)}\n`);
console.log(`Wrote water review maps and measurements to ${output}`);
