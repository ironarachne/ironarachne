/**
 * CLI: generate architectural styles and print to stdout.
 *
 * Run: npm run arch:style -- [options]
 *
 * Uses `tsx` (see package.json); this entrypoint only imports TypeScript from
 * `src/lib`—no Vite asset imports—so `vite-node` is not required here.
 */

import { parseArgs } from 'node:util';
import {
  describeArchitecturalStyle,
  generateArchitecturalStyle,
} from '../src/lib/architecture/index';
import type {
  ArchitecturalSiteContext,
  BuildingPurpose,
  DecorativeStyleId,
  PopulationDensityBand,
  SiteRelief,
  SiteSubstrate,
} from '../src/lib/architecture/architectural_style_types';
import { getBuildingMaterialResources } from '../src/lib/resources/building_materials';
import type { Resource } from '../src/lib/resources/resource_types';

const SUBSTRATES: SiteSubstrate[] = ['sandy', 'rocky', 'clay_rich', 'peat', 'mixed'];
const RELIEFS: SiteRelief[] = ['flat', 'rolling', 'mountainous'];
const PURPOSES: BuildingPurpose[] = [
  'residential',
  'defensive',
  'civic',
  'religious',
  'storage',
  'commercial',
];
const DECORATIONS: DecorativeStyleId[] = [
  'carved_stone',
  'painted_plaster',
  'tile_inlay',
  'metalwork',
  'wood_carving',
  'minimal',
];
const BANDS: PopulationDensityBand[] = ['low', 'medium', 'high'];

function printUsage(): void {
  console.log(`Usage: npm run arch:style -- [options]

Options:
  --seed, -s           RNG seed (default: timestamp-based)
  --count, -n          How many styles to generate (default: 1)
  --substrate          Site substrate: ${SUBSTRATES.join('|')} (default: mixed)
  --relief             Relief: ${RELIEFS.join('|')} (default: rolling)
  --density            Population density 0..1 (mutually exclusive with --band)
  --band               Density band: ${BANDS.join('|')} (default: medium if no --density)
  --purposes           Comma-separated: ${PURPOSES.join(',')} (default: residential)
  --decorations        Comma-separated: ${DECORATIONS.join(',')}
  --coastal            Coastal site
  --high-altitude      High altitude
  --flood-prone        Flood-prone site
  --json               Print JSON only (no prose banner)
  --help, -h           Show this help

Examples:
  npm run arch:style
  npm run arch:style -- --seed demo --substrate rocky --relief mountainous --band low
  npm run arch:style -- -n 3 --purposes residential,defensive --decorations minimal,carved_stone --json
`);
}

function splitCsv(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function parsePurposes(raw: string | undefined): BuildingPurpose[] {
  if (raw == null || raw === '') {
    return ['residential'];
  }
  const parts = splitCsv(raw);
  const out: BuildingPurpose[] = [];
  for (const p of parts) {
    if (!PURPOSES.includes(p as BuildingPurpose)) {
      console.error(`Unknown purpose "${p}". Valid: ${PURPOSES.join(', ')}`);
      process.exit(1);
    }
    out.push(p as BuildingPurpose);
  }
  return out.length > 0 ? out : ['residential'];
}

function parseDecorations(raw: string | undefined): DecorativeStyleId[] {
  if (raw == null || raw === '') {
    return ['minimal', 'painted_plaster', 'wood_carving'];
  }
  const parts = splitCsv(raw);
  const out: DecorativeStyleId[] = [];
  for (const p of parts) {
    if (!DECORATIONS.includes(p as DecorativeStyleId)) {
      console.error(`Unknown decoration "${p}". Valid: ${DECORATIONS.join(', ')}`);
      process.exit(1);
    }
    out.push(p as DecorativeStyleId);
  }
  return out.length > 0 ? out : ['minimal'];
}

function main(): void {
  const { values } = parseArgs({
    options: {
      seed: { type: 'string', short: 's' },
      count: { type: 'string', short: 'n' },
      substrate: { type: 'string' },
      relief: { type: 'string' },
      density: { type: 'string' },
      band: { type: 'string' },
      purposes: { type: 'string' },
      decorations: { type: 'string' },
      coastal: { type: 'boolean', default: false },
      'high-altitude': { type: 'boolean', default: false },
      'flood-prone': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    strict: false,
  });

  if (values.help) {
    printUsage();
    process.exit(0);
  }

  const baseSeed =
    typeof values.seed === 'string' && values.seed.length > 0
      ? values.seed
      : `arch-style-${Date.now()}`;

  let count = 1;
  if (typeof values.count === 'string') {
    const n = Number.parseInt(values.count, 10);
    if (!Number.isFinite(n) || n < 1 || n > 50) {
      console.error('--count must be between 1 and 50');
      process.exit(1);
    }
    count = n;
  }

  const substrateRaw = typeof values.substrate === 'string' ? values.substrate : 'mixed';
  if (!SUBSTRATES.includes(substrateRaw as SiteSubstrate)) {
    console.error(`--substrate must be one of: ${SUBSTRATES.join(', ')}`);
    process.exit(1);
  }
  const substrate = substrateRaw as SiteSubstrate;

  const reliefRaw = typeof values.relief === 'string' ? values.relief : 'rolling';
  if (!RELIEFS.includes(reliefRaw as SiteRelief)) {
    console.error(`--relief must be one of: ${RELIEFS.join(', ')}`);
    process.exit(1);
  }
  const relief = reliefRaw as SiteRelief;

  const hasDensity = typeof values.density === 'string' && values.density !== '';
  const hasBand = typeof values.band === 'string' && values.band !== '';
  if (hasDensity && hasBand) {
    console.error('Use either --density or --band, not both');
    process.exit(1);
  }

  let populationDensity: number | undefined;
  let populationDensityBand: PopulationDensityBand | undefined;
  if (hasDensity) {
    const d = Number.parseFloat(values.density!);
    if (!Number.isFinite(d) || d < 0 || d > 1) {
      console.error('--density must be a number between 0 and 1');
      process.exit(1);
    }
    populationDensity = d;
  } else if (hasBand) {
    if (!BANDS.includes(values.band as PopulationDensityBand)) {
      console.error(`--band must be one of: ${BANDS.join(', ')}`);
      process.exit(1);
    }
    populationDensityBand = values.band as PopulationDensityBand;
  } else {
    populationDensityBand = 'medium';
  }

  const purposes = parsePurposes(typeof values.purposes === 'string' ? values.purposes : undefined);
  const decorativeStyles = parseDecorations(
    typeof values.decorations === 'string' ? values.decorations : undefined,
  );

  const site: ArchitecturalSiteContext = {
    substrate,
    relief,
    coastal: values.coastal === true,
    high_altitude: values['high-altitude'] === true,
    flood_prone: values['flood-prone'] === true,
  };

  const resources: Resource[] = getBuildingMaterialResources();
  const jsonOnly = values.json === true;

  const styles = [];
  for (let i = 0; i < count; i++) {
    const seed = count > 1 ? `${baseSeed}-${i}` : baseSeed;
    const style = generateArchitecturalStyle({
      seed,
      availableResources: resources,
      purposes,
      populationDensity,
      populationDensityBand,
      decorativeStyles,
      site,
    });
    styles.push(style);
  }

  if (jsonOnly) {
    console.log(JSON.stringify(count === 1 ? styles[0] : styles, null, 2));
    return;
  }

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i];
    const header =
      count > 1 ? `\n--- Style ${i + 1}/${count} (seed: ${style.seed}) ---\n` : '\n';
    if (i === 0) {
      console.log(`Architectural style (base seed: ${baseSeed})`);
      console.log(
        `Site: substrate=${site.substrate}, relief=${site.relief}` +
          `${site.coastal ? ', coastal' : ''}` +
          `${site.high_altitude ? ', high_altitude' : ''}` +
          `${site.flood_prone ? ', flood_prone' : ''}`,
      );
      console.log(`Purposes: ${purposes.join(', ')}`);
      console.log(`Decorations requested: ${decorativeStyles.join(', ')}`);
      if (populationDensity != null) {
        console.log(`Population density: ${populationDensity}`);
      } else {
        console.log(`Population band: ${populationDensityBand}`);
      }
    }
    console.log(header);
    console.log(describeArchitecturalStyle(style));
    console.log('\nStructured summary:');
    console.log(
      JSON.stringify(
        {
          label: style.label,
          structuralSystem: style.structuralSystem,
          massing: style.massing,
          roof: style.roof,
          openings: style.openings,
          primaryMaterials: style.primaryMaterials,
          secondaryMaterials: style.secondaryMaterials,
          activeDecorations: style.activeDecorations,
          siteAdaptations: style.siteAdaptations,
          generatorHints: style.generatorHints,
        },
        null,
        2,
      ),
    );
  }
}

main();
