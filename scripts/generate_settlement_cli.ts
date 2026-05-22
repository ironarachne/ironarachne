/**
 * CLI: generate one or more settlements and print JSON to stdout.
 *
 * Run: npm run settlement:cli -- [options]
 *
 * Uses `vite-node` so `$lib` / package resolution matches the app (see `package.json`).
 */

import { parseArgs } from 'node:util';
import { RNG } from '@ironarachne/rng';
import * as MUN from '@ironarachne/made-up-names';
import * as Settlements from '../src/lib/settlements/index.js';
import * as Names from '../src/lib/names/index.js';
import { getDefaultCharacterGenerationConfig } from '../src/lib/characters/character_generation.js';
import type {
  SettlementEnrichmentConfig,
  SettlementGeneratorConfig,
  SettlementSizeFilter,
} from '../src/lib/settlements/settlement_types.js';

const SIZES: SettlementSizeFilter[] = ['any', 'small', 'medium', 'large'];
const ORG_GENRES = ['fantasy', 'science_fiction', 'any'] as const;

function printUsage(): void {
  const races = MUN.getSupportedClassicRaceNamePatternSets().join(', ');
  console.log(`Usage: npm run settlement:cli -- [options]

Options:
  --seed, -s          RNG seed (default: "cli-" + timestamp)
  --size              ${SIZES.join('|')} (default: any)
  --name-set          Fantasy name pattern set for town names, or "any" (default: any)
  --trade             Include trade lists and blurb
  --problems          Include acute and creeping problems
  --organizations     Include local organizations
  --notables          Include 1–2 important characters
  --all-enrichment    Turn on trade, problems, organizations, and notables
  --org-genre         ${ORG_GENRES.join('|')} (default: fantasy) when --organizations
  --count, -n         How many settlements (default: 1). Seeds append -0, -1, …
  --ndjson            One JSON object per line when count > 1
  --help, -h          This help

Available --name-set values when not "any": ${races}

Examples:
  npm run settlement:cli
  npm run settlement:cli -- --seed review --size large --all-enrichment
  npm run settlement:cli -- -s x --trade --problems
  npm run settlement:cli -- -n 3 --ndjson
`);
}

function assertSize(v: string): SettlementSizeFilter {
  if (SIZES.includes(v as SettlementSizeFilter)) {
    return v as SettlementSizeFilter;
  }
  throw new Error(`Invalid --size: ${v}. Use one of: ${SIZES.join(', ')}`);
}

function assertOrgGenre(v: string): (typeof ORG_GENRES)[number] {
  if (ORG_GENRES.includes(v as (typeof ORG_GENRES)[number])) {
    return v as (typeof ORG_GENRES)[number];
  }
  throw new Error(`Invalid --org-genre: ${v}. Use one of: ${ORG_GENRES.join(', ')}`);
}

function buildConfig(
  rng: RNG,
  size: SettlementSizeFilter,
  nameSetName: string,
  wantTrade: boolean,
  wantProblems: boolean,
  wantOrgs: boolean,
  wantNotables: boolean,
  orgGenre: (typeof ORG_GENRES)[number],
  seedForChars: string,
): SettlementGeneratorConfig {
  const config = Settlements.getDefaultConfig(rng);
  config.size = size;
  const allSets = Names.getAllFantasyNameGeneratorSets(rng);
  if (nameSetName === 'any') {
    config.nameGenerator = rng.item(allSets).town;
  } else {
    if (!MUN.getSupportedClassicRaceNamePatternSets().includes(nameSetName)) {
      throw new Error(`Unknown --name-set "${nameSetName}". Use "any" or a supported pattern set.`);
    }
    config.nameGenerator = Names.getFantasyNameGeneratorSet(nameSetName, rng).town;
  }

  const anyEnrich = wantTrade || wantProblems || wantOrgs || wantNotables;
  if (anyEnrich) {
    const enrichment: SettlementEnrichmentConfig = {
      seedPrefix: `cli-${seedForChars}`,
      includeTrade: wantTrade,
      includeProblems: wantProblems,
      includeOrganizations: wantOrgs,
      genre: orgGenre,
      importantCharacterCount: wantNotables ? { min: 1, max: 2 } : undefined,
    };
    if (wantOrgs || wantNotables) {
      enrichment.characterConfig = getDefaultCharacterGenerationConfig(`${seedForChars}-settlement-cli`);
    }
    config.enrichment = enrichment;
  } else {
    config.enrichment = undefined;
  }

  return config;
}

function main(): void {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      seed: { type: 'string', short: 's' },
      size: { type: 'string', default: 'any' },
      'name-set': { type: 'string', default: 'any' },
      trade: { type: 'boolean', default: false },
      problems: { type: 'boolean', default: false },
      organizations: { type: 'boolean', default: false },
      notables: { type: 'boolean', default: false },
      'all-enrichment': { type: 'boolean', default: false },
      'org-genre': { type: 'string', default: 'fantasy' },
      count: { type: 'string', short: 'n', default: '1' },
      ndjson: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    printUsage();
    return;
  }

  const wantTrade = values.trade || values['all-enrichment'];
  const wantProblems = values.problems || values['all-enrichment'];
  const wantOrgs = values.organizations || values['all-enrichment'];
  const wantNotables = values.notables || values['all-enrichment'];
  const size = assertSize(values.size ?? 'any');
  const orgGenre = assertOrgGenre(values['org-genre'] ?? 'fantasy');
  const nameSetName = values['name-set'] ?? 'any';
  const count = Math.max(1, Math.min(50, parseInt(values.count ?? '1', 10) || 1));
  const baseSeed = values.seed ?? `cli-${Date.now()}`;

  if (count > 1 && values.ndjson) {
    for (let i = 0; i < count; i++) {
      const sliceSeed = `${baseSeed}-n${i}`;
      const rng = new RNG(sliceSeed);
      const config = buildConfig(
        rng,
        size,
        nameSetName,
        wantTrade,
        wantProblems,
        wantOrgs,
        wantNotables,
        orgGenre,
        sliceSeed,
      );
      const settlement = Settlements.generate(config);
      console.log(JSON.stringify(settlement));
    }
    return;
  }

  const out: ReturnType<typeof Settlements.generate>[] = [];
  for (let i = 0; i < count; i++) {
    const sliceSeed = count === 1 ? baseSeed : `${baseSeed}-n${i}`;
    const rng = new RNG(sliceSeed);
    const config = buildConfig(
      rng,
      size,
      nameSetName,
      wantTrade,
      wantProblems,
      wantOrgs,
      wantNotables,
      orgGenre,
      sliceSeed,
    );
    out.push(Settlements.generate(config));
  }
  if (count === 1) {
    console.log(JSON.stringify(out[0], null, 2));
  } else {
    console.log(JSON.stringify(out, null, 2));
  }
}

main();
