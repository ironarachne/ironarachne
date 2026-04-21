import * as Words from '@ironarachne/words';
import type { ReligionDimensionId, ReligionDimensions } from './comparative_dimension_types';
import { ALL_RELIGION_DIMENSION_IDS } from './comparative_dimension_types';
import type { ResolvedPolytheisticStanding } from './religion_complexity_types';
import type { ReligionCategory } from './religion_types';

const DIMENSION_ORDER: ReligionDimensionId[] = ALL_RELIGION_DIMENSION_IDS;

function isSingleDeityCategory(category: ReligionCategory): boolean {
  return category.hasDeities && category.minDeities === 1 && category.maxDeities === 1;
}

function narrativeSnippetForDimension(id: ReligionDimensionId, block: unknown): string {
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

export function composeReligionDescription(
  dimensions: ReligionDimensions,
  categoryDescription: string,
  pantheonLine: string | null,
  cosmologySummary: string | null,
): string {
  const parts: string[] = [categoryDescription.trim()];
  for (const id of DIMENSION_ORDER) {
    const block = dimensions[id];
    const summary = narrativeSnippetForDimension(id, block);
    if (summary) {
      parts.push(summary.trim());
    }
  }
  if (pantheonLine) {
    parts.push(pantheonLine.trim());
  }
  if (cosmologySummary) {
    parts.push(cosmologySummary.trim());
  }
  return Words.fixPunctuation(parts.filter(Boolean).join(' '));
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
