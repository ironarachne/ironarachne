/** Reproduce the measurements in docs/regions-workflow-audit.md. */
import { performance } from 'node:perf_hooks';
import { gzipSync } from 'node:zlib';

import { measureRegionTerrain } from '../src/lib/map/region_terrain.js';
import {
  regionToMapSvg,
  regionToMarkdown,
  regionToText,
} from '../src/lib/regions/region_presentation.js';
import { rollRegionSnapshot } from '../src/lib/regions/region_roll.js';

const seeds = process.argv.slice(2);
if (seeds.length === 0) {
  throw new Error('Pass one or more seeds, for example: alpha bravo charlie 5pkjdquccl04i');
}

const bytes = (value: string): number => Buffer.byteLength(value, 'utf8');

for (const seed of seeds) {
  const started = performance.now();
  const snapshot = rollRegionSnapshot(seed);
  const generatedMs = performance.now() - started;
  const svgStarted = performance.now();
  const svg = regionToMapSvg(snapshot);
  const svgMs = performance.now() - svgStarted;
  const payload = JSON.stringify(snapshot);
  const map = JSON.stringify(snapshot.map);
  const markdown = regionToMarkdown(snapshot);
  const pdfText = regionToText(snapshot);
  const metrics = measureRegionTerrain(snapshot.map);
  const land = snapshot.map.nodes.filter((node) => !node.isWater && !node.isOcean);
  const biomeCounts = Object.entries(
    land.reduce<Record<string, number>>((counts, node) => {
      counts[node.biomeId] = (counts[node.biomeId] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  console.log(
    JSON.stringify({
      seed,
      name: snapshot.name,
      climate: snapshot.environment.climate.name,
      overviewBiome: snapshot.environment.biome.name,
      overviewTerrain: {
        elevationMin: snapshot.environment.terrain.elevationMin,
        elevationMax: snapshot.environment.terrain.elevationMax,
        reliefEnergy: snapshot.environment.terrain.reliefEnergy,
      },
      description: snapshot.description,
      graph: {
        width: snapshot.map.width,
        height: snapshot.map.height,
        nodes: snapshot.map.nodes.length,
        landNodes: land.length,
        edges: snapshot.map.edges.length,
        corners: snapshot.map.corners.length,
        roadEdges: snapshot.map.edges.filter((edge) => edge.road).length,
        riverEdges: snapshot.map.edges.filter((edge) => edge.river > 0).length,
      },
      terrain: metrics,
      topBiomes: biomeCounts.slice(0, 4),
      settlements: snapshot.settlements.length,
      realms: snapshot.realms.length,
      organizations: snapshot.organizations.length,
      ms: { generate: Math.round(generatedMs), svg: Math.round(svgMs) },
      bytes: {
        payload: bytes(payload),
        payloadGzip: gzipSync(payload).length,
        map: bytes(map),
        svg: bytes(svg),
        markdown: bytes(markdown),
        pdfText: bytes(pdfText),
      },
    }),
  );
}
