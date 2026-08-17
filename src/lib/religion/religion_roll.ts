import { RNG } from '@ironarachne/rng';

import { getFantasyNameGeneratorSet } from '$lib/names';
import { CommonSpecies, type Species } from '$lib/species';

import { all as allCategories } from './categories';
import type {
  PolytheisticStandingMode,
  SpiritCosmologyDepthMode,
} from './religion_complexity_types';
import { generateReligion } from './religion_generation';
import { toReligionSnapshot, type ReligionSnapshot } from './religion_snapshot';
import type { ReligionCategory } from './religion_types';

/**
 * What the religion generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type rather than read field by field at the call site so the two ends — what the
 * generator writes to an artifact's provenance and what a re-roll expects to find there — drift
 * loudly instead of quietly.
 *
 * `nameGeneratorSet` is the one field here that is not also a generator option. It is the name
 * pattern set the deities and the religion were named from, and it is recorded because that is
 * what makes a re-roll faithful to a religion that borrowed a **saved culture's** names: the
 * culture's own snapshot stores the set by name, so the roll can rebuild the same one without
 * reaching back into the store for an artifact it has no way to ask for.
 */
export type ReligionGeneratorConfigRecord = {
  nameGeneratorSet?: string;
  selectedCategories?: string[];
  selectedSpecies?: string[];
  polytheisticStanding?: PolytheisticStandingMode;
  spiritCosmologyDepth?: SpiritCosmologyDepthMode;
  useSavedCulture?: boolean;
  savedCultureName?: string;
  lockSeed?: boolean;
};

const POLYTHEISTIC_STANDINGS: PolytheisticStandingMode[] = [
  'random',
  'egalitarian',
  'hierarchical',
  'balanced',
];

const SPIRIT_DEPTHS: SpiritCosmologyDepthMode[] = ['random', 'none', 'shallow', 'moderate', 'deep'];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

function isPolytheisticStanding(value: unknown): value is PolytheisticStandingMode {
  return typeof value === 'string' && (POLYTHEISTIC_STANDINGS as string[]).includes(value);
}

function isSpiritCosmologyDepth(value: unknown): value is SpiritCosmologyDepthMode {
  return typeof value === 'string' && (SPIRIT_DEPTHS as string[]).includes(value);
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Provenance is `Record<string, unknown>` because the store cannot know what any tool records in
 * it, so this is the boundary where that becomes typed. Anything unrecognisable is dropped rather
 * than coerced: a config written by a build that spelled these differently should fall back to the
 * defaults, not roll a religion from a field it misread.
 */
export function readReligionGeneratorConfig(
  config: Record<string, unknown>,
): ReligionGeneratorConfigRecord {
  const nameGeneratorSet = optionalString(config.nameGeneratorSet);
  const savedCultureName = optionalString(config.savedCultureName);
  return {
    ...(nameGeneratorSet === undefined ? {} : { nameGeneratorSet }),
    ...(isStringArray(config.selectedCategories)
      ? { selectedCategories: config.selectedCategories }
      : {}),
    ...(isStringArray(config.selectedSpecies) ? { selectedSpecies: config.selectedSpecies } : {}),
    ...(isPolytheisticStanding(config.polytheisticStanding)
      ? { polytheisticStanding: config.polytheisticStanding }
      : {}),
    ...(isSpiritCosmologyDepth(config.spiritCosmologyDepth)
      ? { spiritCosmologyDepth: config.spiritCosmologyDepth }
      : {}),
    ...(typeof config.useSavedCulture === 'boolean'
      ? { useSavedCulture: config.useSavedCulture }
      : {}),
    ...(savedCultureName === undefined ? {} : { savedCultureName }),
    ...(typeof config.lockSeed === 'boolean' ? { lockSeed: config.lockSeed } : {}),
  };
}

/**
 * The categories a roll may draw from, as the recorded names resolve against this build.
 *
 * Names this build does not have are dropped rather than substituted, and a config that names
 * none of them falls back to every category — which is what the generator offers a user who has
 * ticked nothing off. Rolling from an empty pool is the one thing that cannot be done.
 */
function categoriesFor(names: string[] | undefined): ReligionCategory[] {
  const categories = allCategories();
  if (names === undefined) {
    return categories;
  }
  const chosen = categories.filter((category) => names.includes(category.name));
  return chosen.length > 0 ? chosen : categories;
}

/** The species a roll's deities may resemble. Human is the generator's own default. */
function speciesFor(names: string[] | undefined): Species[] {
  const sentient = CommonSpecies.sentient();
  const chosen = (names ?? []).filter((name) => sentient.some((species) => species.name === name));
  return (chosen.length > 0 ? chosen : ['human']).map((name) =>
    CommonSpecies.byName(name, sentient),
  );
}

/**
 * Roll a fresh religion from a seed and the settings it was first made with.
 *
 * The destructive half of editing (requirement 4.3): the payload is the truth everywhere else, and
 * this is the one path that regenerates one. It rebuilds the whole snapshot, options included, so
 * what comes back is a religion artifact rather than a religion that has to be wrapped by the
 * caller.
 *
 * It throws rather than substituting when the recorded name pattern set is not one this build has.
 * The editing framework catches that and keeps the artifact the user still has on screen, which is
 * a better answer than quietly rolling a pantheon whose gods are named from somewhere else.
 */
export function rollReligionSnapshot(
  seed: string,
  config: ReligionGeneratorConfigRecord = {},
): ReligionSnapshot {
  const rng = new RNG(seed);
  const names = getFantasyNameGeneratorSet(config.nameGeneratorSet ?? 'human', rng);
  const categories = categoriesFor(config.selectedCategories);
  const species = speciesFor(config.selectedSpecies);
  const polytheisticStanding = config.polytheisticStanding ?? 'random';
  const spiritCosmologyDepth = config.spiritCosmologyDepth ?? 'random';

  const religion = generateReligion(seed, {
    categories,
    deitySpeciesOptions: species,
    nameGenerator: names.family,
    femaleNameGenerator: names.female,
    maleNameGenerator: names.male,
    polytheisticStanding,
    spiritCosmologyDepth,
  });

  return toReligionSnapshot(religion, seed, {
    lockSeed: config.lockSeed ?? false,
    selectedCategories: categories.map((category) => category.name),
    selectedSpecies: species.map((entry) => entry.name),
    polytheisticStanding,
    spiritCosmologyDepth,
    useSavedCulture: config.useSavedCulture ?? false,
    ...(config.savedCultureName === undefined ? {} : { savedCultureName: config.savedCultureName }),
  });
}
