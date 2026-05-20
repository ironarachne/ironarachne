import { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import * as Data from './comparative_dimension_data';
import type {
  ReligionDimensionById,
  ReligionDimensionGenerationConfig,
  ReligionDimensionHints,
  ReligionDimensionId,
  ReligionDimensions,
} from './comparative_dimension_types';
import { ALL_RELIGION_DIMENSION_IDS as ALL_IDS } from './comparative_dimension_types';
import type { ReligionCategory } from './religion_types';

export type ReligionDimensionsGenerationInput = {
  category: ReligionCategory;
  dimensionGeneration?: ReligionDimensionGenerationConfig;
};

function resolveActiveDimensionIds(
  config: ReligionDimensionGenerationConfig | undefined,
): ReligionDimensionId[] {
  if (config?.includedDimensions && config.includedDimensions.length > 0) {
    return [...config.includedDimensions];
  }
  const excluded = new Set(config?.excludedDimensions ?? []);
  return ALL_IDS.filter((id) => !excluded.has(id));
}

function filterPool<T>(full: readonly T[], favored: T[] | undefined): T[] {
  if (!favored || favored.length === 0) {
    return [...full];
  }
  const set = new Set(favored);
  const hit = full.filter((x) => set.has(x));
  return hit.length > 0 ? hit : [...full];
}

function pickUniqueFromPool<T>(rng: RNG, pool: T[], count: number): T[] {
  if (pool.length === 0 || count <= 0) {
    return [];
  }
  const n = Math.min(count, pool.length);
  const copy = [...pool];
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    const idx = rng.int(0, copy.length - 1);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
}

function humanizePractice(
  kind: ReligionDimensionById['ritual']['primaryPractices'][number],
): string {
  return Words.title(kind.replace(/_/g, ' '));
}

const mythKindLabels: Record<ReligionDimensionById['mythological']['storyKinds'][number], string> =
  {
    creation: 'creation myths',
    hero: 'hero legends',
    apocalyptic: 'apocalyptic tales',
    moral: 'moral exempla',
    cosmological: 'cosmological lore',
  };

const institutionalStructurePhrase: Record<
  ReligionDimensionById['institutional']['structure'],
  string
> = {
  hierarchical: 'a steep hierarchy',
  congregational: 'congregational organization',
  diffuse: 'diffuse authority rooted in many local custodians',
};

function generateRitual(
  seed: string,
  hints: ReligionDimensionHints | undefined,
  active: boolean,
): ReligionDimensionById['ritual'] | null {
  if (!active) {
    return null;
  }
  const rng = new RNG(`${seed}-ritual`);
  const practicePool = filterPool(Data.ritualPracticePool, hints?.ritual?.favoredPractices);
  const practices = pickUniqueFromPool(rng, practicePool, rng.int(2, 4));
  const cadence = rng.item(Data.gatheringCadencePhrases);
  const place = rng.item(Data.gatheringPlaceKinds);
  let isLeaderLed = rng.simple(100) < 55;
  if (hints?.ritual?.preferLeaderLed === true) {
    isLeaderLed = true;
  }
  if (hints?.ritual?.preferLeaderLed === false) {
    isLeaderLed = false;
  }
  const practicesPhrase = Words.arrayToPhrase(practices.map(humanizePractice));
  const core = Words.buildSentence([
    'public worship leans on',
    practicesPhrase,
    ', and it usually unfolds in',
    place,
  ]);
  const leadership = isLeaderLed
    ? Words.buildSentence([
        'ordained or acknowledged leaders still guide most rites, even when lay helpers assist',
      ])
    : Words.buildSentence([
        'families and lay officers take turns leading, so responsibility stays close to the community',
      ]);
  const summary = Words.fixPunctuation(`${core} ${cadence} ${leadership}`);
  return {
    gatheringCadence: cadence,
    primaryPractices: practices,
    isLeaderLed,
    gatheringPlaceKind: place,
    summary,
  };
}

function generateExperiential(
  seed: string,
  hints: ReligionDimensionHints | undefined,
  active: boolean,
): ReligionDimensionById['experiential'] | null {
  if (!active) {
    return null;
  }
  const rng = new RNG(`${seed}-experiential`);
  const pool = filterPool(Data.experientialEmphasisPool, hints?.experiential?.favoredEmphases);
  const emphasis = rng.item(pool);
  const summaryByEmphasis: Record<ReligionDimensionById['experiential']['emphasis'], string> = {
    mystical: Words.buildSentence([
      'believers cultivate inward union through disciplined contemplation, and ecstatic breakthroughs are welcomed when they arrive',
    ]),
    conversion: Words.buildSentence([
      'a sudden reorientation of life is treated as one of the surest signs that faith has taken root',
    ]),
    vision: Words.buildSentence([
      'dreams, omens, and waking visions are read as messages that deserve a community response',
    ]),
    mixed: Words.buildSentence([
      'the tradition makes room for both quiet devotion and dramatic spiritual breakthroughs without choosing between them',
    ]),
    restrained: Words.buildSentence([
      'public enthusiasm stays muted, and people tend to show piety through steady duty and modest habit',
    ]),
  };
  return { emphasis, summary: summaryByEmphasis[emphasis] };
}

function generateMythological(
  seed: string,
  hints: ReligionDimensionHints | undefined,
  active: boolean,
): ReligionDimensionById['mythological'] | null {
  if (!active) {
    return null;
  }
  const rng = new RNG(`${seed}-mythological`);
  const pool = filterPool(Data.mythStoryKindPool, hints?.mythological?.favoredStoryKinds);
  const storyKinds = pickUniqueFromPool(rng, pool, rng.int(2, 3));
  const kindsPhrase = Words.arrayToPhrase(storyKinds.map((k) => mythKindLabels[k]));
  const centralMythSummary = rng.item([
    Words.buildSentence([
      'sacred narrative weaves',
      kindsPhrase,
      'into a single map of moral and cosmic order',
    ]),
    Words.buildSentence([
      'storytellers preserve',
      kindsPhrase,
      'as the charter for festivals, precedent, and customary law',
    ]),
    Words.buildSentence([
      'mythic cycles of',
      kindsPhrase,
      'are what people reach for when they need misfortune, legitimacy, or hope explained',
    ]),
  ]);
  return { storyKinds, centralMythSummary };
}

function generateDoctrinal(
  seed: string,
  hints: ReligionDimensionHints | undefined,
  active: boolean,
): ReligionDimensionById['doctrinal'] | null {
  if (!active) {
    return null;
  }
  const rng = new RNG(`${seed}-doctrinal`);
  const pool = filterPool(Data.doctrinalAuthorityPool, hints?.doctrinal?.favoredAuthorities);
  const authority = rng.item(pool);
  const hasFormalCreed = rng.simple(100) < 50;
  const scriptureCharacter =
    authority === 'scripture' ? rng.item(Data.scriptureCharacterPhrases) : null;
  const authorityPhrase: Record<ReligionDimensionById['doctrinal']['authority'], string> = {
    scripture: Words.buildSentence([
      'teaching authority finally rests on sacred books and on the interpreters those books authorize',
    ]),
    tradition: Words.buildSentence([
      'unwritten precedent and communal memory bind people more tightly than any single fixed text',
    ]),
    revelation: Words.buildSentence([
      'fresh oracles and prophetic speech can still revise what the community thinks it knows',
    ]),
    syncretic: Words.buildSentence([
      'doctrine openly blends borrowed teachings into a pragmatic whole that shifts with circumstance',
    ]),
    rational: Words.buildSentence([
      'arguments from ethics and cosmology sit beside revelation instead of replacing it',
    ]),
  };
  const creedClause = hasFormalCreed
    ? Words.buildSentence([
        'a formal creed bundles the non-negotiables for initiates and newcomers',
      ])
    : Words.buildSentence([
        'finer points of teaching stay open to debate among recognized teachers',
      ]);
  let summary = Words.fixPunctuation(`${authorityPhrase[authority]} ${creedClause}`);
  if (scriptureCharacter) {
    summary = Words.fixPunctuation(
      `${summary} ${Words.buildSentence(['written sources are described as', scriptureCharacter])}`,
    );
  }
  return {
    authority,
    hasFormalCreed,
    scriptureCharacter,
    summary,
  };
}

function generateEthical(
  seed: string,
  hints: ReligionDimensionHints | undefined,
  active: boolean,
): ReligionDimensionById['ethical'] | null {
  if (!active) {
    return null;
  }
  const rng = new RNG(`${seed}-ethical`);
  const pool = filterPool(Data.ethicalFramingPool, hints?.ethical?.favoredFramings);
  const framing = rng.item(pool);
  const precepts = pickUniqueFromPool(rng, [...Data.ethicalPreceptPool], rng.int(2, 4));
  const forbiddenActs = pickUniqueFromPool(rng, [...Data.ethicalForbiddenPool], rng.int(1, 3));
  const framingOpen: Record<ReligionDimensionById['ethical']['framing'], string> = {
    reciprocity: Words.buildSentence([
      'morality here is anchored in balanced exchange, mutual obligation, and the repair of relationships',
    ]),
    divine_command: Words.buildSentence([
      'rules are traced to explicit divine decrees that are not treated as optional advice',
    ]),
    virtue: Words.buildSentence([
      'character formation matters more than memorizing long lists of isolated prohibitions',
    ]),
    community_harmony: Words.buildSentence([
      'peace within the group outweighs individual preference when the two come into conflict',
    ]),
    karma_like: Words.buildSentence([
      'acts are believed to shape destiny across scales that are only partly visible in this life',
    ]),
    law_code: Words.buildSentence([
      'written prohibitions and careful casuistry give daily life a juridical rhythm',
    ]),
  };
  const duties = Words.buildSentence([
    'practitioners especially lift up',
    Words.arrayToPhrase(precepts),
    'as duties worth protecting',
  ]);
  const taboos = Words.buildSentence([
    'the harshest censure falls on',
    Words.arrayToPhrase(forbiddenActs),
  ]);
  const summary = Words.fixPunctuation(`${framingOpen[framing]} ${duties} ${taboos}`);
  return { framing, precepts, forbiddenActs, summary };
}

function generateInstitutional(
  seed: string,
  category: ReligionCategory,
  hints: ReligionDimensionHints | undefined,
  active: boolean,
): ReligionDimensionById['institutional'] | null {
  if (!active) {
    return null;
  }
  const rng = new RNG(`${seed}-institutional`);
  const pool = filterPool(Data.institutionalStructurePool, hints?.institutional?.favoredStructures);
  let structure = rng.item(pool);
  if (category.hasLeader && structure === 'diffuse' && rng.simple(100) < 60) {
    structure = rng.item(['hierarchical', 'congregational']);
  }
  const roles = pickUniqueFromPool(rng, [...Data.institutionalRolePool], rng.int(2, 4));
  const structurePhrase = institutionalStructurePhrase[structure];
  const summary = Words.buildSentence([
    'although titles vary from place to place,',
    Words.arrayToPhrase(roles),
    'still shoulder most teaching, discipline, and liturgical work under',
    structurePhrase,
  ]);
  return { structure, roles, summary };
}

function generateMaterial(
  seed: string,
  hints: ReligionDimensionHints | undefined,
  active: boolean,
): ReligionDimensionById['material'] | null {
  if (!active) {
    return null;
  }
  const rng = new RNG(`${seed}-material`);
  const objectCount = hints?.material?.emphasizeSacredObjects ? rng.int(4, 5) : rng.int(2, 3);
  const sacredObjects = pickUniqueFromPool(rng, [...Data.materialObjectPool], objectCount);
  const sacredSpaces = pickUniqueFromPool(rng, [...Data.materialSpacePool], rng.int(1, 3));
  const iconographyNotes = rng.item(Data.iconographyNotePool);
  const objectsPhrase = Words.arrayToPhrase(sacredObjects);
  const spacesPhrase = Words.arrayToPhrase(sacredSpaces);
  const summary = Words.fixPunctuation(
    `${Words.buildSentence(['sacred craft shows up in', objectsPhrase, ', while', spacesPhrase, 'mark holy sites on the ground'])} ${iconographyNotes}`,
  );
  return { sacredObjects, sacredSpaces, iconographyNotes, summary };
}

function applyOverrides(
  dimensions: ReligionDimensions,
  config: ReligionDimensionGenerationConfig,
): void {
  const o = config;
  if (o.ritual && dimensions.ritual) {
    dimensions.ritual = { ...dimensions.ritual, ...o.ritual };
  }
  if (o.experiential && dimensions.experiential) {
    dimensions.experiential = { ...dimensions.experiential, ...o.experiential };
  }
  if (o.mythological && dimensions.mythological) {
    dimensions.mythological = { ...dimensions.mythological, ...o.mythological };
  }
  if (o.doctrinal && dimensions.doctrinal) {
    dimensions.doctrinal = { ...dimensions.doctrinal, ...o.doctrinal };
  }
  if (o.ethical && dimensions.ethical) {
    dimensions.ethical = { ...dimensions.ethical, ...o.ethical };
  }
  if (o.institutional && dimensions.institutional) {
    dimensions.institutional = { ...dimensions.institutional, ...o.institutional };
  }
  if (o.material && dimensions.material) {
    dimensions.material = { ...dimensions.material, ...o.material };
  }
}

/** Exposed for tests: which dimension ids will be generated for this config. */
export function activeReligionDimensionIdsForConfig(
  config: ReligionDimensionGenerationConfig | undefined,
): ReligionDimensionId[] {
  return resolveActiveDimensionIds(config);
}

export function generateReligionDimensions(
  seed: string,
  input: ReligionDimensionsGenerationInput,
): ReligionDimensions {
  const config = input.dimensionGeneration ?? {};
  const activeSet = new Set(resolveActiveDimensionIds(config));
  const hints = input.category.dimensionHints;

  const out: ReligionDimensions = {};

  const r = generateRitual(seed, hints, activeSet.has('ritual'));
  if (r) {
    out.ritual = r;
  }
  const e = generateExperiential(seed, hints, activeSet.has('experiential'));
  if (e) {
    out.experiential = e;
  }
  const m = generateMythological(seed, hints, activeSet.has('mythological'));
  if (m) {
    out.mythological = m;
  }
  const d = generateDoctrinal(seed, hints, activeSet.has('doctrinal'));
  if (d) {
    out.doctrinal = d;
  }
  const eth = generateEthical(seed, hints, activeSet.has('ethical'));
  if (eth) {
    out.ethical = eth;
  }
  const ins = generateInstitutional(seed, input.category, hints, activeSet.has('institutional'));
  if (ins) {
    out.institutional = ins;
  }
  const mat = generateMaterial(seed, hints, activeSet.has('material'));
  if (mat) {
    out.material = mat;
  }

  applyOverrides(out, config);
  return out;
}
