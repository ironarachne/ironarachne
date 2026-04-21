import { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import type {
  ReligionCosmology,
  SpiritCosmologyDepthMode,
  SpiritEchelon,
  SpiritEchelonKind,
} from './religion_complexity_types';

const ECHELON_KIND_POOL: SpiritEchelonKind[] = [
  'messenger_host',
  'rebel_host',
  'nature_spirit',
  'ancestor_presence',
  'exalted_exemplar',
  'psychopomp',
  'tutelary',
];

const LABELS_BY_KIND: Record<SpiritEchelonKind, string[]> = {
  messenger_host: [
    'radiant messengers',
    'couriers of the high court',
    'winged heralds',
    'choirs that carry decrees from the summit',
  ],
  rebel_host: [
    'outcast powers',
    'broken courtiers',
    'hosts that chose exile over obedience',
    'rivals who haunt the margins of the sacred map',
  ],
  nature_spirit: [
    'genius loci',
    'guardians of watershed and grove',
    'spirits that lease power to place',
    'old intelligences of stone and storm',
  ],
  ancestor_presence: [
    'remembered dead who still speak',
    'lineage shades',
    'household ancestors',
    'the stacked dead who counsel the living',
  ],
  exalted_exemplar: [
    'canonized exemplars',
    'saints whose virtues became law',
    'teachers raised into legend',
    'blessed dead invoked by name',
  ],
  psychopomp: [
    'ferry-beings',
    'guides at the threshold',
    'wardens of the crossing',
    'escorts who walk souls between worlds',
  ],
  tutelary: [
    'city patrons',
    'tutelary watchers',
    'guardian powers sworn to a people',
    'local sovereigns beneath the highest throne',
  ],
};

function resolveEchelonCount(mode: SpiritCosmologyDepthMode | undefined, rng: RNG): number {
  const m = mode ?? 'random';
  const resolved: Exclude<SpiritCosmologyDepthMode, 'random'> =
    m === 'random' ? rng.item(['none', 'shallow', 'moderate', 'deep']) : m;
  if (resolved === 'none') {
    return 0;
  }
  if (resolved === 'shallow') {
    return rng.int(1, 2);
  }
  if (resolved === 'moderate') {
    return rng.int(3, 4);
  }
  return rng.int(5, 7);
}

function rankDepthForCosmology(echelonCount: number, rng: RNG): number {
  if (echelonCount >= 5) {
    return rng.int(2, 3);
  }
  if (echelonCount >= 3) {
    return rng.int(1, 3);
  }
  return rng.int(1, 2);
}

function buildEchelon(seed: string, kind: SpiritEchelonKind, rankDepth: number): SpiritEchelon {
  const rng = new RNG(`${seed}-${kind}`);
  const label = rng.item(LABELS_BY_KIND[kind]);
  const depthPhrase =
    rankDepth === 1
      ? Words.buildSentence(['lore treats this order as nearly flat'])
      : Words.buildSentence([
          'lore describes',
          String(rankDepth),
          'nested ranks or courts inside this order',
        ]);
  const summaryByKind: Record<SpiritEchelonKind, string> = {
    messenger_host: Words.buildSentence([
      label,
      'are said to relay will from the summit and to police oaths sworn in daylight',
    ]),
    rebel_host: Words.buildSentence([
      label,
      'linger as tempters, accusers, or tragic mirrors depending on the hymn you hear',
    ]),
    nature_spirit: Words.buildSentence([
      label,
      'must be placated before fields, forges, or fleets move with any confidence',
    ]),
    ancestor_presence: Words.buildSentence([
      label,
      'receive offerings beside the high gods and may veto a plan the living thought pious',
    ]),
    exalted_exemplar: Words.buildSentence([
      label,
      'anchor festivals, and their stories do moral work that raw law cannot',
    ]),
    psychopomp: Words.buildSentence([
      label,
      'make the geography of death navigable, or at least negotiable',
    ]),
    tutelary: Words.buildSentence([
      label,
      'broker local luck and can embarrass a high god who neglects their contract',
    ]),
  };
  return {
    kind,
    label,
    rankDepth,
    summary: Words.fixPunctuation(`${summaryByKind[kind]} ${depthPhrase}`),
  };
}

export function generateReligionCosmology(
  seed: string,
  depthMode: SpiritCosmologyDepthMode | undefined,
  rng: RNG,
): ReligionCosmology | null {
  const count = resolveEchelonCount(depthMode, rng);
  if (count === 0) {
    return null;
  }
  const kinds = pickDistinctKinds(`${seed}-kinds`, count);
  const echelons: SpiritEchelon[] = [];
  for (let i = 0; i < kinds.length; i++) {
    const depth = rankDepthForCosmology(count, new RNG(`${seed}-depth-${i}`));
    echelons.push(buildEchelon(`${seed}-ech-${i}`, kinds[i], depth));
  }
  const orderPhrase = Words.arrayToPhrase(echelons.map((e) => e.label));
  const summary = Words.buildSentence([
    'between mortals and the highest powers, tradition also counts',
    orderPhrase,
    'as real players with their own feuds, favors, and jurisdictions',
  ]);
  return { echelons, summary };
}

function pickDistinctKinds(seed: string, count: number): SpiritEchelonKind[] {
  const pool = [...ECHELON_KIND_POOL];
  const n = Math.min(count, pool.length);
  const out: SpiritEchelonKind[] = [];
  const stream = new RNG(seed);
  for (let i = 0; i < n; i++) {
    const idx = stream.int(0, pool.length - 1);
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return out;
}
