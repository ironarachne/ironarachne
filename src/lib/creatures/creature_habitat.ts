import { RNG } from '@ironarachne/rng';
import { getSizeConfig } from '$lib/size';
import type { Species } from '$lib/species';
import { generate } from './creatures';
import type { CreatureGenerationConfig } from './creature_types';
import type { ContextualCreatureResult, CreatureHabitatContext } from './creature_habitat_types';

function optionsCompatible(species: Species, config: CreatureGenerationConfig): boolean {
  if (!config.ageCategoryNames.length || !config.genderNames.length) return false;
  if (
    !config.ageCategoryNames.every((name) => species.ageCategories.some((age) => age.name === name))
  )
    return false;
  if (!config.genderNames.every((name) => species.genders.some((gender) => gender.name === name)))
    return false;
  try {
    for (const age of config.ageCategoryNames)
      for (const gender of config.genderNames)
        getSizeConfig(gender, age, species.sizeGeneratorConfigMatrix);
    return true;
  } catch {
    return false;
  }
}

/** Opt-in generation; the standalone generator and its random stream are unchanged. */
export function generateWithHabitatContext(
  seed: string,
  config: CreatureGenerationConfig,
  context: CreatureHabitatContext,
): ContextualCreatureResult {
  if (!context.habitatId.trim())
    return { ok: false, reason: 'missing-habitat', message: 'Choose a supported habitat.' };
  const candidates = [...context.candidates].sort((a, b) =>
    a.inhabitantId < b.inhabitantId
      ? -1
      : a.inhabitantId > b.inhabitantId
        ? 1
        : a.speciesName < b.speciesName
          ? -1
          : a.speciesName > b.speciesName
            ? 1
            : 0,
  );
  const names = new Set(candidates.map((candidate) => candidate.speciesName));
  const species = [
    ...new Map(
      config.speciesOptions
        .filter((entry) => names.has(entry.name) && entry.commonality > 0)
        .map((entry) => [entry.name, entry]),
    ).values(),
  ].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  if (!species.length)
    return {
      ok: false,
      reason: 'no-supported-species',
      message: 'No configured species has current support in this habitat.',
    };
  const selected = new RNG(`${seed}:habitat-species:v1`).weighted(
    species.map((value) => ({ value, commonality: value.commonality })),
  );
  if (!optionsCompatible(selected, config))
    return {
      ok: false,
      reason: 'incompatible-options',
      message: `The requested age or gender options are unsupported by ${selected.name}.`,
    };
  const candidate = candidates.find((entry) => entry.speciesName === selected.name)!;
  return {
    ok: true,
    creature: generate(`${seed}:habitat-individual:v1`, { ...config, speciesOptions: [selected] }),
    assignment: { ...candidate, habitatId: context.habitatId, roles: [...candidate.roles].sort() },
    ...(context.regionTargetId?.trim()
      ? {
          reference: {
            targetId: context.regionTargetId,
            targetKind: 'region',
            role: 'habitat-context',
          },
        }
      : {}),
  };
}
