/**
 * The single path from a seed to a family, and the record of how it was rolled.
 *
 * Requirement 2.2 of docs/workshop.md wants the same seed and settings to give the same result.
 * `FamilyGenerator.svelte` came close — the generator itself takes seeds throughout — but the
 * name generators were built from the page's own RNG, whose position depended on how many times
 * Generate had been pressed and whether "any" species had drawn from it, so a locked seed
 * reproduced the people and not their names. Here the species, the name set and the family are
 * each drawn from a stream named for the seed and nothing else.
 *
 * The config record is the page's controls, all of them, stated as a type so what the generator
 * writes as provenance and what a re-roll expects to find are one thing that drifts loudly. It is
 * long because the page is: every chance and switch is a control the user can set.
 */

import { RNG } from '@ironarachne/rng';

import { getFantasyNameGeneratorSet, getFantasyNameGeneratorSetNames } from '$lib/names';
import { CommonSpecies, type Species } from '$lib/species';

import { generateFamilyGeneration, generateNewFamily } from './families.js';
import { toFamilySnapshot, type FamilySnapshot } from './family_snapshot.js';
import type { Family, FamilyGenerationConfig } from './family_types.js';

/** The value the page's species picker uses for "let the seed choose". */
export const FAMILY_ANY_SPECIES = 'any' as const;

/** Whose surname the children take. */
export type FamilyLastNameTradition = 'male' | 'female';

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * `nameGeneratorSet` is the resolved pattern set the family was named from. A family named from a
 * culture records that culture's own pattern set here rather than the culture's id, so a re-roll
 * produces names of the same tongue without reaching back into the store; the link to the culture
 * is an artifact reference and lives beside the payload. Absent means "the set that suits the
 * species".
 */
export type FamilyGeneratorConfigRecord = {
  speciesName?: string;
  nameGeneratorSet?: string;
  lastNameTradition?: FamilyLastNameTradition;
  generations?: number;
  minMembersPerGeneration?: number;
  maxMembersPerGeneration?: number;
  fertilityChance?: number;
  infantMortalityChance?: number;
  allowAdoption?: boolean;
  adoptionChance?: number;
  allowIllegitimateChildren?: boolean;
  illegitimateChildChance?: number;
  allowMultipleMarriages?: boolean;
  multipleMarriageChance?: number;
  allowSameGenderMarriage?: boolean;
  sameGenderMarriageChance?: number;
  allowCrossSpeciesMarriages?: boolean;
  crossSpeciesMarriageChance?: number;
};

/** The page's defaults, which are also what a re-roll falls back to for a field it cannot read. */
export const FAMILY_DEFAULT_GENERATIONS = 3 as const;
export const FAMILY_DEFAULT_MIN_MEMBERS = 2 as const;
export const FAMILY_DEFAULT_MAX_MEMBERS = 5 as const;
export const FAMILY_DEFAULT_FERTILITY_CHANCE = 0.8 as const;
export const FAMILY_DEFAULT_INFANT_MORTALITY_CHANCE = 0.01 as const;
/** More than this is slow, and the page has always said so. */
export const FAMILY_MAX_GENERATIONS = 10 as const;

/** A part of the roll that the recorded config asked for and this build could not supply. */
export type FamilyRollSubstitution = 'species' | 'nameGeneratorSet';

/** A rolled family, and what the roll actually used where the config left a choice open. */
export type FamilyRoll = {
  family: Family;
  speciesName: string;
  nameGeneratorSet: string;
  substitutions: FamilyRollSubstitution[];
};

const BOOLEAN_FIELDS = [
  'allowAdoption',
  'allowIllegitimateChildren',
  'allowMultipleMarriages',
  'allowSameGenderMarriage',
  'allowCrossSpeciesMarriages',
] as const;

const CHANCE_FIELDS = [
  'fertilityChance',
  'infantMortalityChance',
  'adoptionChance',
  'illegitimateChildChance',
  'multipleMarriageChance',
  'sameGenderMarriageChance',
  'crossSpeciesMarriageChance',
] as const;

const COUNT_FIELDS = ['generations', 'minMembersPerGeneration', 'maxMembersPerGeneration'] as const;

function isChance(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Anything unrecognisable is dropped rather than coerced: a chance outside 0–1, a count that is not
 * a whole number, a tradition that is not a gender the page offers. A config written by a build
 * that spelled these differently should fall back to the defaults, not roll a family from a field
 * it misread.
 */
export function readFamilyGeneratorConfig(
  config: Record<string, unknown>,
): FamilyGeneratorConfigRecord {
  const read: FamilyGeneratorConfigRecord = {};
  if (typeof config.speciesName === 'string' && config.speciesName !== '') {
    read.speciesName = config.speciesName;
  }
  if (typeof config.nameGeneratorSet === 'string' && config.nameGeneratorSet !== '') {
    read.nameGeneratorSet = config.nameGeneratorSet;
  }
  if (config.lastNameTradition === 'male' || config.lastNameTradition === 'female') {
    read.lastNameTradition = config.lastNameTradition;
  }
  for (const field of BOOLEAN_FIELDS) {
    if (typeof config[field] === 'boolean') {
      read[field] = config[field];
    }
  }
  for (const field of CHANCE_FIELDS) {
    if (isChance(config[field])) {
      read[field] = config[field];
    }
  }
  for (const field of COUNT_FIELDS) {
    if (isCount(config[field])) {
      read[field] = config[field];
    }
  }
  return read;
}

/**
 * The species a roll uses: the one named, or one the seed chooses from every sentient species.
 *
 * A species this build no longer has draws as "any" would and is reported as a substitution,
 * because a family of the wrong people is worth saying out loud.
 */
function resolveSpecies(
  requested: string | undefined,
  seed: string,
): { species: Species; substituted: boolean } {
  const available = CommonSpecies.sentient();
  if (requested !== undefined && requested !== FAMILY_ANY_SPECIES) {
    const found = available.find((species) => species.name === requested);
    if (found !== undefined) {
      return { species: found, substituted: false };
    }
  }
  return {
    species: CommonSpecies.randomWeighted(available, new RNG(`${seed}-family-species`)),
    substituted: requested !== undefined && requested !== FAMILY_ANY_SPECIES,
  };
}

/** The build's name set for a species, or `human` for one it has no patterns for. */
function fantasyNameSetForSpecies(speciesName: string): string {
  const normalized = speciesName.toLowerCase();
  return getFantasyNameGeneratorSetNames().includes(normalized) ? normalized : 'human';
}

function resolveNameGeneratorSet(
  requested: string | undefined,
  speciesName: string,
): { name: string; substituted: boolean } {
  const fallback = fantasyNameSetForSpecies(speciesName);
  if (requested === undefined || requested === '') {
    return { name: fallback, substituted: false };
  }
  return getFantasyNameGeneratorSetNames().includes(requested)
    ? { name: requested, substituted: false }
    : { name: fallback, substituted: true };
}

/**
 * The gender whose surname the children take, from the species' own list.
 *
 * A species with no gender of that name — some have neither `male` nor `female` — takes its first,
 * rather than throwing as the page used to. The tradition is a preference, not a constraint the
 * species can fail.
 */
function resolveDominantGender(species: Species, tradition: FamilyLastNameTradition): string {
  return (
    species.genders.find((gender) => gender.name === tradition)?.name ??
    species.genders[0]?.name ??
    tradition
  );
}

/**
 * Roll a family from a seed and a set of options — the one path the generator page and a re-roll
 * both take.
 *
 * The name generators are built from a stream of their own, `` `${seed}-family-names` ``, so that
 * the choice of naming source cannot shift which people the same seed produces.
 */
export function rollFamily(seed: string, config: FamilyGeneratorConfigRecord = {}): FamilyRoll {
  const substitutions: FamilyRollSubstitution[] = [];

  const species = resolveSpecies(config.speciesName, seed);
  if (species.substituted) {
    substitutions.push('species');
  }
  const nameSet = resolveNameGeneratorSet(config.nameGeneratorSet, species.species.name);
  if (nameSet.substituted) {
    substitutions.push('nameGeneratorSet');
  }
  const generators = getFantasyNameGeneratorSet(nameSet.name, new RNG(`${seed}-family-names`));

  const generations = Math.min(
    config.generations ?? FAMILY_DEFAULT_GENERATIONS,
    FAMILY_MAX_GENERATIONS,
  );
  const generationConfig: FamilyGenerationConfig = {
    speciesOptions: [species.species],
    familyNameGenerator: generators.family,
    femaleNameGenerator: generators.female,
    maleNameGenerator: generators.male,
    generations: Math.max(1, generations),
    minMembersPerGeneration: config.minMembersPerGeneration ?? FAMILY_DEFAULT_MIN_MEMBERS,
    maxMembersPerGeneration: config.maxMembersPerGeneration ?? FAMILY_DEFAULT_MAX_MEMBERS,
    dominantGender: resolveDominantGender(species.species, config.lastNameTradition ?? 'male'),
    fertilityChance: config.fertilityChance ?? FAMILY_DEFAULT_FERTILITY_CHANCE,
    infantMortalityChance: config.infantMortalityChance ?? FAMILY_DEFAULT_INFANT_MORTALITY_CHANCE,
    allowAdoption: config.allowAdoption ?? false,
    adoptionChance: config.adoptionChance ?? 0,
    allowIllegitimateChildren: config.allowIllegitimateChildren ?? false,
    illegitimateChildChance: config.illegitimateChildChance ?? 0,
    allowMultipleMarriages: config.allowMultipleMarriages ?? false,
    multipleMarriageChance: config.multipleMarriageChance ?? 0,
    allowSameGenderMarriage: config.allowSameGenderMarriage ?? false,
    sameGenderMarriageChance: config.sameGenderMarriageChance ?? 0,
    allowCrossSpeciesMarriages: config.allowCrossSpeciesMarriages ?? false,
    crossSpeciesMarriageChance: config.crossSpeciesMarriageChance ?? 0,
  };

  const family = generateFamilyGeneration(
    seed,
    generationConfig,
    generateNewFamily(seed, generationConfig),
  );

  return {
    family,
    speciesName: species.species.name,
    nameGeneratorSet: nameSet.name,
    substitutions,
  };
}

/**
 * Roll a fresh family as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollFamilySnapshot(
  seed: string,
  config: FamilyGeneratorConfigRecord = {},
): FamilySnapshot {
  return toFamilySnapshot(rollFamily(seed, config).family);
}
