import type {
  CreatureHabitatAssignment,
  CreatureHabitatPresentation,
  CreatureHabitatProjection,
} from '$lib/creatures';
import type { Species } from '$lib/species';
import type { RegionSnapshot } from './region_snapshot';
import type { EcologyInhabitantFact } from './region_ecology_types';
import { regionContextEvidenceCurrent } from './region_context_evidence';

function supported(
  snapshot: RegionSnapshot,
  fact: EcologyInhabitantFact,
  habitatId: string,
): boolean {
  return (
    fact.category !== 'flora' &&
    fact.source.kind === 'species' &&
    fact.habitatIds.includes(habitatId) &&
    fact.reason !== undefined &&
    regionContextEvidenceCurrent(snapshot, fact)
  );
}

/** Read the current saved ecology; names in editable prose never select species. */
export function buildRegionCreatureContext(
  snapshot: RegionSnapshot,
  habitatId: string,
  catalog: readonly Species[],
  regionTargetId?: string,
): CreatureHabitatProjection {
  const habitat = snapshot.facts.habitats.find((entry) => entry.id === habitatId);
  if (!habitat)
    return {
      ok: false,
      reason: 'missing-habitat',
      message: 'This habitat is no longer in the region.',
    };
  if (!habitat.reason || !regionContextEvidenceCurrent(snapshot, habitat))
    return {
      ok: false,
      reason: 'stale-context',
      message: 'This habitat needs a current supporting explanation.',
    };
  const names = new Set(catalog.map((species) => species.name));
  const candidates = snapshot.facts.ecologyInhabitants
    .filter(
      (entry) =>
        supported(snapshot, entry, habitatId) &&
        entry.source.kind === 'species' &&
        names.has(entry.source.speciesName),
    )
    .map((entry) => ({
      inhabitantId: entry.id,
      speciesName: entry.source.kind === 'species' ? entry.source.speciesName : '',
      roles: [...entry.roles].sort(),
    }))
    .sort((a, b) =>
      a.inhabitantId < b.inhabitantId ? -1 : a.inhabitantId > b.inhabitantId ? 1 : 0,
    );
  if (!candidates.length)
    return {
      ok: false,
      reason: 'no-supported-species',
      message: 'This habitat has no current catalog-supported creature inhabitants.',
    };
  return {
    ok: true,
    context: { habitatId, candidates, ...(regionTargetId === undefined ? {} : { regionTargetId }) },
  };
}

export function describeRegionCreatureContext(
  snapshot: RegionSnapshot,
  assignment: CreatureHabitatAssignment,
): CreatureHabitatPresentation {
  const habitat = snapshot.facts.habitats.find((entry) => entry.id === assignment.habitatId);
  const inhabitant = snapshot.facts.ecologyInhabitants.find(
    (entry) => entry.id === assignment.inhabitantId,
  );
  const base = {
    habitatName: habitat?.name ?? '',
    inhabitantName: inhabitant?.name ?? '',
    roles: [...assignment.roles],
  };
  if (
    !habitat ||
    !inhabitant ||
    inhabitant.source.kind !== 'species' ||
    inhabitant.source.speciesName !== assignment.speciesName ||
    !inhabitant.habitatIds.includes(assignment.habitatId)
  )
    return {
      ...base,
      status: 'unresolved',
      description: 'The original habitat or inhabitant assignment is no longer available.',
    };
  if (
    !habitat.reason ||
    !regionContextEvidenceCurrent(snapshot, habitat) ||
    !supported(snapshot, inhabitant, habitat.id) ||
    JSON.stringify([...inhabitant.roles].sort()) !== JSON.stringify([...assignment.roles].sort())
  )
    return {
      ...base,
      status: 'stale',
      description: 'The supporting habitat or ecological role needs review.',
    };
  const roles = assignment.roles
    .map((role) => (role === 'other' ? 'unspecified ecological role' : role))
    .join(', ');
  return {
    ...base,
    status: 'current',
    description: `${inhabitant.name} belongs to ${habitat.name}; ecological role: ${roles}.`,
  };
}
