/** Semantic preview: npm run arch:style -- --seed demo --biome forest --materials 'oak timber,granite ashlar,reed thatch' */
import { parseArgs } from 'node:util';
import {
  generateArchitectureState,
  architectureResourcesFromCatalog,
  UNKNOWN_ARCHITECTURAL_SITE,
  type ConstructionKind,
  type Exposure,
} from '../src/lib/architecture';
import { BiomeClassifications } from '../src/lib/environment';
import { getBuildingMaterialResources } from '../src/lib/resources';

const { values } = parseArgs({
  options: {
    seed: { type: 'string', short: 's' },
    biome: { type: 'string' },
    materials: { type: 'string' },
    context: { type: 'string', default: 'built' },
    exposure: { type: 'string', default: 'exposed' },
    json: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
});
if (values.help) {
  console.log(
    "Usage: npm run arch:style -- --seed SEED --biome BIOME --materials 'oak timber,granite ashlar,reed thatch' [--context built|rock_cut|natural] [--exposure exposed|sheltered|buried] [--json]\nUse --materials '' for a known empty palette. Omit --materials for unknown resources.",
  );
} else {
  if (!values.seed || !values.biome) throw new Error('An explicit --seed and --biome are required');
  const classification = BiomeClassifications.getAll().find(
    (b) => b.name.toLowerCase() === values.biome?.toLowerCase(),
  );
  if (!classification) throw new Error(`Unknown biome: ${values.biome}`);
  if (
    !['built', 'rock_cut', 'natural'].includes(values.context) ||
    !['exposed', 'sheltered', 'buried'].includes(values.exposure)
  )
    throw new Error('Unknown construction context or exposure');
  const names = values.materials
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const palette = getBuildingMaterialResources();
  if (names?.some((name) => !palette.some((r) => r.name === name)))
    throw new Error('Unknown material; choose names from the curated building material catalog');
  const construction = values.context as ConstructionKind;
  const exposure = values.exposure as Exposure;
  const state = generateArchitectureState(
    {
      seed: values.seed,
      biome: {
        name: classification.name,
        temperature: (classification.temperatureMin + classification.temperatureMax) / 2,
        humidity: (classification.humidityMin + classification.humidityMax) / 2,
        altitude: (classification.altitudeMin + classification.altitudeMax) / 2,
        isAquatic: classification.isAquatic,
        features: [],
        descriptions: [],
      },
      site: UNKNOWN_ARCHITECTURAL_SITE,
      resources:
        names === undefined
          ? { knowledge: 'unknown', entries: [] }
          : architectureResourcesFromCatalog(palette.filter((r) => names.includes(r.name))),
      contexts: [
        {
          id: 'preview',
          construction,
          exposure,
          purpose: construction === 'natural' ? 'natural' : 'residential',
          density: 'medium',
          exteriorWindowsAllowed: construction === 'built' && exposure !== 'buried',
        },
      ],
      culturalPreferences: [],
    },
    construction === 'built' ? 12 : 0,
  );
  console.log(
    values.json
      ? JSON.stringify(state, null, 2)
      : (state.summary ??
          `Architecture ${state.kind}: ${state.diagnostics.map((d) => d.code).join(', ')}`),
  );
}
