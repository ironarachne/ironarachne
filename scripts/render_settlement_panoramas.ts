/** Reproducible review matrix. Run with vite-node; no files are written unless requested. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import {
  generateArchitectureState,
  architectureResourcesFromCatalog,
} from '../src/lib/architecture';
import { getBuildingMaterialResources } from '../src/lib/resources';
import { all } from '../src/lib/settlements';
import {
  buildSettlementPanorama,
  renderSettlementPanorama,
  sceneSegments,
  type PanoramaInput,
} from '../src/lib/settlement_illustration';
const { values } = parseArgs({
  options: {
    out: { type: 'string', default: '/tmp/settlement-panoramas' },
    seed: { type: 'string', default: 'panorama-review' },
  },
});
const destination = resolve(values.out!);
mkdirSync(destination, { recursive: true });
const biomes = [
  'temperate deciduous forest',
  'temperate grassland',
  'subtropical desert',
  'freshwater wetland',
  'intertidal zone',
  'boreal forest',
  'alpine tundra',
  'unknown',
];
const cards: string[] = [];
let maxSegments = 0;
let maxBytes = 0;
const start = performance.now();
for (const category of all())
  for (const [index, name] of biomes.entries()) {
    const biome = {
      name,
      temperature: name.includes('desert') ? 30 : 15,
      humidity: name.includes('desert') ? 0.1 : 0.6,
      altitude: name === 'alpine tundra' ? 0.9 : 0.3,
      isAquatic: name === 'intertidal zone',
      features: [],
      descriptions: [],
    };
    // Explicit curated resources make architecture visible in every review cell; not claimed local.
    const architecture = generateArchitectureState(
      {
        seed: `${values.seed}:${category.name}:${index}`,
        biome,
        resources: architectureResourcesFromCatalog(getBuildingMaterialResources()),
        site: { substrate: null, relief: null, coastal: null, floodProne: null },
        contexts: [
          {
            id: 'residential',
            construction: 'built',
            exposure: 'exposed',
            purpose: 'residential',
            density: 'medium',
            exteriorWindowsAllowed: true,
          },
        ],
        culturalPreferences: [],
      },
      12,
    );
    const input: PanoramaInput = {
      name: `${category.name}-${index}`,
      category,
      population: Math.round((category.minSize + category.maxSize) / 2),
      biome,
      terrain: {
        elevationMin: 0,
        elevationMax: 1,
        reliefEnergy: name === 'alpine tundra' ? 0.8 : 0.2,
        normalVector: [0, 0, 1],
        landforms: [],
        geologicalMakeup: { soilTypes: [], rockTypes: [] },
      },
      architecture,
    };
    const scene = buildSettlementPanorama(input);
    const svg = renderSettlementPanorama(scene);
    const file = `${category.name}-${index}.svg`;
    writeFileSync(resolve(destination, file), svg);
    maxSegments = Math.max(maxSegments, sceneSegments(scene));
    maxBytes = Math.max(maxBytes, Buffer.byteLength(svg));
    cards.push(
      `<figure><figcaption>${category.name} · ${name}</figcaption><img src="${file}" width="1000" height="300"></figure>`,
    );
  }
writeFileSync(
  resolve(destination, 'index.html'),
  `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Settlement panorama review</title><style>body{margin:20px;background:#f6f1e8;color:#4a3d32;font:16px Georgia}figure{margin:0 0 24px}img{display:block;width:100%;height:auto}figcaption{padding:8px}</style></head><body>${cards.join('')}</body></html>`,
);
console.log(
  JSON.stringify({
    destination,
    images: cards.length,
    milliseconds: Math.round(performance.now() - start),
    maxSegments,
    maxBytes,
  }),
);
