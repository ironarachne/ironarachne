import { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import type { ReligionDimensionId, ReligionDimensions } from './comparative_dimension_types';
import { ALL_RELIGION_DIMENSION_IDS } from './comparative_dimension_types';
import type { ResolvedPolytheisticStanding } from './religion_complexity_types';
import type { ReligionCategory } from './religion_types';

const DIMENSION_ORDER: ReligionDimensionId[] = ALL_RELIGION_DIMENSION_IDS;

function isSingleDeityCategory(category: ReligionCategory): boolean {
  return category.hasDeities && category.minDeities === 1 && category.maxDeities === 1;
}

/** Human-readable paragraph for one dimension block (matches composition order). */
export function summaryTextForReligionDimension(id: ReligionDimensionId, block: unknown): string {
  if (!block || typeof block !== 'object') {
    return '';
  }
  const o = block as Record<string, unknown>;
  if (typeof o.summary === 'string') {
    return o.summary;
  }
  if (id === 'mythological' && typeof o.centralMythSummary === 'string') {
    return o.centralMythSummary;
  }
  return '';
}

/** @deprecated Prefer {@link composeReligionOverviewDescription} for user-facing blurbs; kept for tooling. */
export function composeReligionDescription(
  dimensions: ReligionDimensions,
  categoryDescription: string,
  pantheonLine: string | null,
  cosmologySummary: string | null,
  nonTheisticTraditionSummary: string | null,
): string {
  const parts: string[] = [categoryDescription.trim()];
  for (const id of DIMENSION_ORDER) {
    const block = dimensions[id];
    const summary = summaryTextForReligionDimension(id, block);
    if (summary) {
      parts.push(summary.trim());
    }
  }
  if (nonTheisticTraditionSummary) {
    parts.push(nonTheisticTraditionSummary.trim());
  }
  if (pantheonLine) {
    parts.push(pantheonLine.trim());
  }
  if (cosmologySummary) {
    parts.push(cosmologySummary.trim());
  }
  return Words.fixPunctuation(parts.filter(Boolean).join(' '));
}

function stripTrailingPeriod(s: string): string {
  return s.replace(/\.\s*$/, '').trim();
}

function firstSentence(text: string): string {
  const t = text.trim();
  if (!t) {
    return '';
  }
  const dot = t.search(/\.\s+[A-Z]/);
  if (dot !== -1) {
    return `${t.slice(0, dot + 1).trim()}`;
  }
  const simple = t.split('. ')[0]?.trim() ?? t;
  return simple.endsWith('.') ? simple : `${simple}.`;
}

function lowercaseFirstChar(s: string): string {
  const t = s.trim();
  if (!t) {
    return t;
  }
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function nonTheisticStructureClause(categoryName: string): string {
  const clauses: Record<string, string> = {
    animism:
      'moral weight is negotiated place by place through spirits of water, weather, craft, and threshold rather than through enthroned gods',
    totemism:
      'kin and land are chartered through living emblems, initiation, and marriage law instead of through a sky pantheon',
    'ancestor worship':
      'the dead stay near as judges and kin, so shrines, meals, and disputes answer to lineage memory',
    shamanism:
      'skilled mediators travel the spirit world in trance and bargain, where fixed temples matter less than journeys',
  };
  return (
    clauses[categoryName] ??
    'authority stays diffuse across custom, dream, and landscape rather than concentrated in a single divine court'
  );
}

function overviewTypeStructureSentence(
  category: ReligionCategory,
  polytheisticStanding: ResolvedPolytheisticStanding | null,
): string {
  const base = stripTrailingPeriod(category.description);
  if (!category.hasDeities) {
    return Words.buildSentence([base, ', in which', nonTheisticStructureClause(category.name)]);
  }
  if (isSingleDeityCategory(category)) {
    return Words.buildSentence([
      base,
      ', in which law, story, and cult all bend toward one unrivaled sovereign',
    ]);
  }
  const standingClause =
    polytheisticStanding === 'egalitarian'
      ? 'its high gods are approached as powers of comparable dignity, with local custom deciding which altar burns brightest'
      : polytheisticStanding === 'balanced'
        ? 'divine patrons surge and fade with city, season, and oath rather than locking into one eternal ladder'
        : 'cult and treasure pile unevenly on a handful of famous names, even when myth names many powers';
  return Words.buildSentence([base, ', in which', standingClause]);
}

function collectOverviewAspectCandidates(
  dimensions: ReligionDimensions,
  cosmologySummary: string | null,
  nonTheisticTraditionSummary: string | null,
): string[] {
  const out: string[] = [];
  for (const id of DIMENSION_ORDER) {
    const s = summaryTextForReligionDimension(id, dimensions[id]);
    if (s) {
      out.push(s.trim());
    }
  }
  if (cosmologySummary?.trim()) {
    out.push(cosmologySummary.trim());
  }
  if (nonTheisticTraditionSummary?.trim()) {
    out.push(nonTheisticTraditionSummary.trim());
  }
  return out;
}

/**
 * Short blurb for `Religion.description`: type and structure, plus one highlighted aspect.
 * Detailed facets stay in structured fields and UI sections.
 */
export function composeReligionOverviewDescription(
  seed: string,
  category: ReligionCategory,
  dimensions: ReligionDimensions,
  cosmologySummary: string | null,
  nonTheisticTraditionSummary: string | null,
  polytheisticStanding: ResolvedPolytheisticStanding | null,
): string {
  const rng = new RNG(`${seed}-overview`);
  const typeStructure = overviewTypeStructureSentence(category, polytheisticStanding);
  const candidates = collectOverviewAspectCandidates(
    dimensions,
    cosmologySummary,
    nonTheisticTraditionSummary,
  );
  if (candidates.length === 0) {
    return Words.fixPunctuation(
      `${typeStructure} ${Words.buildSentence(['its festivals and taboos still give everyday life a fiercely argued moral shape'])}`,
    );
  }
  const aspect = lowercaseFirstChar(stripTrailingPeriod(firstSentence(rng.item(candidates))));
  const hookIntroPhrase = rng.item([
    'one thread worth tracing is that',
    'a knot worth untangling is that',
    'something interesting is that',
  ]);
  const hook = Words.buildSentence([hookIntroPhrase, aspect]);
  return Words.fixPunctuation(`${typeStructure} ${hook}`);
}

export function composePantheonDescriptionLine(
  category: ReligionCategory,
  deityCount: number,
  leaderName: string | null,
  soleDeityName: string | null,
  polytheisticStanding: ResolvedPolytheisticStanding | null,
): string {
  if (isSingleDeityCategory(category)) {
    if (soleDeityName) {
      return Words.buildSentence([
        soleDeityName,
        'is the sole divine sovereign whom this tradition addresses without peer or rival',
      ]);
    }
    return Words.buildSentence([
      'devotion gathers around',
      Words.quantify(1, 'deity'),
      'acknowledged as unrivaled in cult and story',
    ]);
  }

  const baseShared = Words.buildSentence([
    'the pantheon numbers',
    Words.quantify(deityCount, 'deity'),
    'whose stories cross and contest in shrine, song, and law',
  ]);

  if (polytheisticStanding === 'egalitarian') {
    return Words.fixPunctuation(
      `${baseShared} ${Words.buildSentence([
        'they are honored as coequal powers, and which altar burns brightest is left to local conscience rather than to a fixed celestial ladder',
      ])}`,
    );
  }

  if (polytheisticStanding === 'balanced') {
    return Words.fixPunctuation(
      `${baseShared} ${Words.buildSentence([
        'precedence stays fluid, and patrons surge or fade with city, season, oath, and crisis instead of locking into one eternal ranking',
      ])}`,
    );
  }

  const base = Words.buildSentence([
    'the pantheon numbers',
    Words.quantify(deityCount, 'deity'),
    'who share cult and story across many shrines and tales',
  ]);
  if (leaderName && deityCount > 1) {
    return Words.fixPunctuation(
      `${base} ${Words.buildSentence([leaderName, 'is widely honored as first among them'])}`,
    );
  }
  return Words.fixPunctuation(
    `${base} ${Words.buildSentence([
      'in practice, worship clusters unevenly, and a handful of names draw far more vow and treasure than the rest',
    ])}`,
  );
}
