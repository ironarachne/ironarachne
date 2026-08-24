import { RNG } from '@ironarachne/rng';

import { getCharacterGenerationConfigForNameSet } from '$lib/characters';
import { getFantasyNameGeneratorSet, getFantasyNameGeneratorSetNames } from '$lib/names';

import { generate, getDefaultConfig } from './settlements.js';
import { toSettlementSnapshot, type SettlementSnapshot } from './settlement_snapshot.js';
import type { Settlement, SettlementSizeFilter } from './settlement_types.js';

/**
 * What the settlement generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type rather than read field by field at the call site so the two ends — what the
 * generator writes as provenance and what a re-roll expects to find there — are in one place and
 * drift loudly instead of quietly.
 */
export type SettlementGeneratorConfigRecord = {
  /**
   * The name pattern set the town, its notables, and its organizations were named from.
   *
   * A settlement built around a saved culture records the culture's own pattern set here rather
   * than the culture's id. That is what lets a re-roll produce names of the same tongue without
   * reaching back into the store for an artifact it has no way to ask for — the same bargain
   * `$lib/religion` makes for a pantheon named from a borrowed culture.
   */
  nameGeneratorSet?: string;
  size?: SettlementSizeFilter;
  includeTrade?: boolean;
  includeProblems?: boolean;
  includeOrganizations?: boolean;
  includeNotables?: boolean;
};

/**
 * A rolled settlement and the pattern set its names actually came from.
 *
 * The resolved set travels back out because a roll may choose one itself, and provenance has to
 * record what was used rather than what was asked for. "Any set" recorded as provenance would make
 * a re-roll a fresh draw, which is not what re-rolling an artifact means.
 */
export type SettlementRoll = {
  settlement: Settlement;
  nameGeneratorSet: string;
};

const SIZE_FILTERS: SettlementSizeFilter[] = ['small', 'medium', 'large', 'any'];

function isSizeFilter(value: unknown): value is SettlementSizeFilter {
  return SIZE_FILTERS.includes(value as SettlementSizeFilter);
}

function readBoolean(value: unknown, key: string): Record<string, boolean> {
  return typeof value === 'boolean' ? { [key]: value } : {};
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Provenance is `Record<string, unknown>` because the store cannot know what any tool puts in it,
 * so this is the boundary where that becomes typed. Anything unrecognisable is dropped rather than
 * coerced: a config written by a build that spelled these differently should fall back to the
 * defaults, not roll a settlement from a field it misread.
 */
export function readSettlementGeneratorConfig(
  config: Record<string, unknown>,
): SettlementGeneratorConfigRecord {
  return {
    ...(typeof config.nameGeneratorSet === 'string' && config.nameGeneratorSet !== ''
      ? { nameGeneratorSet: config.nameGeneratorSet }
      : {}),
    ...(isSizeFilter(config.size) ? { size: config.size } : {}),
    ...readBoolean(config.includeTrade, 'includeTrade'),
    ...readBoolean(config.includeProblems, 'includeProblems'),
    ...readBoolean(config.includeOrganizations, 'includeOrganizations'),
    ...readBoolean(config.includeNotables, 'includeNotables'),
  };
}

/**
 * The pattern set a roll should use, drawn from the seed when the caller did not name one.
 *
 * Drawn from a seed of its own rather than from the settlement's RNG, so that choosing a set
 * explicitly and having one chosen produce the same settlement given the same set. A draw taken
 * off the main stream would shift everything rolled after it.
 *
 * A set this build does not have falls back to the drawn one rather than throwing, which is the
 * opposite of what `$lib/culture` does with the same field, deliberately. A culture *is* its
 * naming traditions, so substituting them silently would hand back something that is not the
 * culture that was asked for; a settlement is a place that happens to have a name. Falling back
 * costs the tongue and keeps the settlement, and it keeps two paths working that would otherwise
 * fail on data nobody can fix — a re-roll of an artifact whose pattern set has since been dropped,
 * and a Generate driven by a culture adopted from `ironarachne.save.v1.*` with a set name this
 * build never had.
 */
function resolveNameGeneratorSet(seed: string, requested: string | undefined): string {
  const available = getFantasyNameGeneratorSetNames();
  if (requested !== undefined && available.includes(requested)) {
    return requested;
  }
  return new RNG(`${seed}-settlement-nameset`).item(available);
}

/**
 * Roll a settlement from a seed and a set of options — the one path both the generator page and a
 * re-roll take.
 *
 * Having one is the whole of requirement 2.2 here. The page used to build its own configuration
 * inline, drawing name sets and an environment off a shared RNG in an order nothing else could
 * reproduce, which made "same seed, same settlement" true only for as long as nobody touched the
 * page. A seed and this record now determine the output, and provenance stores exactly this
 * record.
 */
export function rollSettlement(
  seed: string,
  config: SettlementGeneratorConfigRecord = {},
): SettlementRoll {
  const nameGeneratorSet = resolveNameGeneratorSet(seed, config.nameGeneratorSet);
  const rng = new RNG(seed);
  const nameSet = getFantasyNameGeneratorSet(nameGeneratorSet, rng);
  const base = getDefaultConfig(rng);

  const enriched =
    config.includeTrade === true ||
    config.includeProblems === true ||
    config.includeOrganizations === true ||
    config.includeNotables === true;

  const settlement = generate({
    ...base,
    size: config.size ?? 'any',
    nameGenerator: nameSet.town,
    enrichment: enriched
      ? {
          seedPrefix: `${seed}-settlement`,
          includeTrade: config.includeTrade === true,
          includeProblems: config.includeProblems === true,
          includeOrganizations: config.includeOrganizations === true,
          ...(config.includeNotables === true
            ? { importantCharacterCount: { min: 1, max: 2 } }
            : {}),
          characterConfig: getCharacterGenerationConfigForNameSet(`${seed}-notable`, nameSet),
          genre: 'fantasy',
        }
      : undefined,
  });

  return { settlement, nameGeneratorSet };
}

/**
 * Roll a fresh settlement snapshot from a seed and the settings it was first made with — the
 * destructive half of editing (requirement 4.3), and the only path in the workshop that
 * regenerates a stored payload.
 */
export function rollSettlementSnapshot(
  seed: string,
  config: SettlementGeneratorConfigRecord = {},
): SettlementSnapshot {
  return toSettlementSnapshot(rollSettlement(seed, config).settlement);
}
