import { mkdirSync, writeFileSync } from 'node:fs';
import { denseForestFixture } from './region_dense_forest_fixture';
import { detectDenseForests, buildRegionMapSvgString } from '../src/lib/map';
import { rollRegionSnapshot, regionToMapSvg } from '../src/lib/regions';

const destination = process.argv[2] ?? '/tmp/ironarachne-dense-forests';
mkdirSync(destination, { recursive: true });
const biomes = [
  'temperate deciduous forest',
  'boreal forest',
  'tropical rainforest',
  'mangrove forest',
  'mediterranean woodland',
  'temperate rainforest',
];
for (const [index, biome] of biomes.entries()) {
  const map = denseForestFixture(biome);
  const denseForests = detectDenseForests(map).map((patch) => ({
    ...patch,
    id: `forest:dense:${patch.mapNodeIds[0]}`,
  }));
  const landmark = {
    id: `landmark:${denseForests[0].id}`,
    name: 'Greywood',
    kind: 'landmark' as const,
    nodeIds: denseForests[0].mapNodeIds,
    edgeIds: [],
  };
  const svg = buildRegionMapSvgString(map, { title: biome, denseForests, features: [landmark] });
  writeFileSync(`${destination}/forest-${index}.svg`, svg);
  if (index === 0)
    writeFileSync(`${destination}/before.svg`, buildRegionMapSvgString(map, { title: biome }));
  console.log(`${biome}: ${denseForests.length} patches; ${svg.length} SVG characters`);
}
for (const seed of ['alpha', 'bravo', 'charlie', 'dense-forest', 'forest-419']) {
  const snapshot = rollRegionSnapshot(seed, { affiliation: 'unaffiliated' });
  writeFileSync(`${destination}/${seed}.svg`, regionToMapSvg(snapshot));
  console.log(`${seed}: ${snapshot.facts.denseForests.length} saved forest patches`);
}
