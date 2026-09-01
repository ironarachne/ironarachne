/**
 * The single path from a seed to an organization, and the record of how it was rolled.
 *
 * Requirement 2.2 of docs/workshop.md wants the same seed and settings to give the same result.
 * `OrganizationGenerator.svelte` came close — the generator takes an RNG and the page reseeded it
 * from the seed box — but the name set was drawn from that same RNG *before* reseeding when "any"
 * was chosen, and the kind list the page offered was built from wherever the RNG happened to be.
 * Here the kind registry, the name set and the organization are each drawn from a stream named for
 * the seed and nothing else.
 *
 * The config record is the page's five controls, stated as a type so what the generator writes as
 * provenance and what a re-roll expects to find are one thing that drifts loudly.
 */

import { RNG } from '@ironarachne/rng';

import { getFantasyNameGeneratorSet, getFantasyNameGeneratorSetNames } from '$lib/names';

import { getDefaultOrganizationCharacterConfig } from './fantasy.js';
import { generateOrganization } from './generate_organization.js';
import { getOrganizationKindsForRegistry } from './kind_registry.js';
import type { OrganizationKindDefinition } from './organization_kind.js';
import { toOrganizationSnapshot, type OrganizationSnapshot } from './organization_snapshot.js';
import type {
  Organization,
  OrganizationGenre,
  OrganizationWorldContextPreset,
} from './organization_types.js';

/** The value the page's pickers use for "let the seed choose". */
export const ORGANIZATION_ANY = 'any' as const;

export type OrganizationGenreFilter = OrganizationGenre | typeof ORGANIZATION_ANY;
export type OrganizationSizePreset = 'small' | 'medium' | 'large';

const GENRES: OrganizationGenreFilter[] = ['any', 'fantasy', 'science_fiction'];
const SIZES: OrganizationSizePreset[] = ['small', 'medium', 'large'];
const WORLD_CONTEXTS: OrganizationWorldContextPreset[] = [
  'desert_route',
  'coastal',
  'mountain_pass',
  'river_trade',
  'tundra',
  'jungle_march',
  'void_ledger',
  'rim_wilderness',
  'dome_sprawl',
];

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * `nameGeneratorSet` is the resolved pattern set the people were named from. An organization
 * named from a culture records that culture's own pattern set here rather than the culture's id;
 * the link to the culture is an artifact reference beside the payload. Absent means the seed chose
 * one, as the page's "any" does.
 */
export type OrganizationGeneratorConfigRecord = {
  genre?: OrganizationGenreFilter;
  kindId?: string;
  size?: OrganizationSizePreset;
  nameGeneratorSet?: string;
  worldContextPreset?: OrganizationWorldContextPreset;
};

/** A part of the roll that the recorded config asked for and this build could not supply. */
export type OrganizationRollSubstitution = 'kindId' | 'nameGeneratorSet';

/** A rolled organization, and what the roll actually used where the config left a choice open. */
export type OrganizationRoll = {
  organization: Organization;
  nameGeneratorSet: string;
  substitutions: OrganizationRollSubstitution[];
};

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Anything unrecognisable is dropped rather than coerced: a config written by a build that spelled
 * these differently should fall back to the defaults, not roll an organization from a field it
 * misread.
 */
export function readOrganizationGeneratorConfig(
  config: Record<string, unknown>,
): OrganizationGeneratorConfigRecord {
  return {
    ...(GENRES.includes(config.genre as OrganizationGenreFilter)
      ? { genre: config.genre as OrganizationGenreFilter }
      : {}),
    ...(typeof config.kindId === 'string' && config.kindId !== '' ? { kindId: config.kindId } : {}),
    ...(SIZES.includes(config.size as OrganizationSizePreset)
      ? { size: config.size as OrganizationSizePreset }
      : {}),
    ...(typeof config.nameGeneratorSet === 'string' && config.nameGeneratorSet !== ''
      ? { nameGeneratorSet: config.nameGeneratorSet }
      : {}),
    ...(WORLD_CONTEXTS.includes(config.worldContextPreset as OrganizationWorldContextPreset)
      ? { worldContextPreset: config.worldContextPreset as OrganizationWorldContextPreset }
      : {}),
  };
}

/** The kinds a genre filter allows, from a registry built for this seed. */
export function organizationKindsForGenre(
  genre: OrganizationGenreFilter | undefined,
  rng: RNG,
): OrganizationKindDefinition[] {
  const all = getOrganizationKindsForRegistry(rng);
  return genre === undefined || genre === ORGANIZATION_ANY
    ? all
    : all.filter((kind) => kind.genre === genre);
}

/**
 * The kind id a roll passes on: the one asked for if this build has it in the genre, else "any".
 *
 * A kind this build no longer has, or one outside the genre the config also names, draws as "any"
 * would and is reported as a substitution. The generator would otherwise throw, and an
 * organization of the wrong sort is a better answer than none — and worth saying out loud.
 */
function resolveKindId(
  requested: string | undefined,
  kinds: OrganizationKindDefinition[],
): { kindId: string; substituted: boolean } {
  if (requested === undefined || requested === ORGANIZATION_ANY) {
    return { kindId: ORGANIZATION_ANY, substituted: false };
  }
  return kinds.some((kind) => kind.id === requested)
    ? { kindId: requested, substituted: false }
    : { kindId: ORGANIZATION_ANY, substituted: true };
}

function resolveNameGeneratorSet(
  requested: string | undefined,
  seed: string,
): { name: string; substituted: boolean } {
  const names = getFantasyNameGeneratorSetNames();
  if (requested === undefined || requested === '' || requested === ORGANIZATION_ANY) {
    return { name: new RNG(`${seed}-organization-name-set`).item(names), substituted: false };
  }
  return names.includes(requested)
    ? { name: requested, substituted: false }
    : { name: new RNG(`${seed}-organization-name-set`).item(names), substituted: true };
}

/**
 * Roll an organization from a seed and a set of options — the one path the generator page and a
 * re-roll both take.
 */
export function rollOrganization(
  seed: string,
  config: OrganizationGeneratorConfigRecord = {},
): OrganizationRoll {
  const substitutions: OrganizationRollSubstitution[] = [];
  const rng = new RNG(seed);

  const kinds = organizationKindsForGenre(config.genre, new RNG(`${seed}-organization-kinds`));
  const kind = resolveKindId(config.kindId, kinds);
  if (kind.substituted) {
    substitutions.push('kindId');
  }
  const nameSet = resolveNameGeneratorSet(config.nameGeneratorSet, seed);
  if (nameSet.substituted) {
    substitutions.push('nameGeneratorSet');
  }
  const generators = getFantasyNameGeneratorSet(
    nameSet.name,
    new RNG(`${seed}-organization-names`),
  );

  const characterConfig = getDefaultOrganizationCharacterConfig(seed);
  characterConfig.familyNameGenerator = generators.family;
  characterConfig.femaleFirstNameGenerator = generators.female;
  characterConfig.maleFirstNameGenerator = generators.male;

  const organization = generateOrganization({
    rng,
    characterConfig,
    genre: config.genre ?? ORGANIZATION_ANY,
    kindId: kind.kindId,
    ...(config.size === undefined ? {} : { size: { kind: 'preset', value: config.size } }),
    seedPrefix: 'page',
    ...(config.worldContextPreset === undefined
      ? {}
      : { worldContext: { kind: 'preset', preset: config.worldContextPreset } }),
  });

  return { organization, nameGeneratorSet: nameSet.name, substitutions };
}

/**
 * Roll a fresh organization as a snapshot — the destructive half of editing (requirement 4.3), and
 * what `ARTIFACT_EDITORS` registers as this kind's roller.
 *
 * A re-roll never wears referenced arms: the reference was a decision about the organization that
 * was, and the new one draws its own emblem.
 */
export function rollOrganizationSnapshot(
  seed: string,
  config: OrganizationGeneratorConfigRecord = {},
): OrganizationSnapshot {
  return toOrganizationSnapshot(rollOrganization(seed, config).organization);
}
