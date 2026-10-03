import type { FactBase, FactSource } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import { regionSemanticFactLists } from './region_resource_editing';
import type { RegionSemanticFact } from './region_resource_types';

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, entry]) => [key, canonical(entry)]),
  );
}

function environmentObservationCurrent(
  snapshot: RegionSnapshot,
  source: Extract<FactSource, { kind: 'environment' }>,
): boolean {
  try {
    const observed: unknown = JSON.parse(source.observedValue);
    const actual = snapshot.environment[source.field];
    // Geological provinces record makeup as sorted source sets; compare that same representation.
    const normalize = (value: unknown) => {
      if (source.field !== 'terrain' || typeof value !== 'object' || value === null) return value;
      const terrain = value as Record<string, unknown>;
      const makeup = terrain.geologicalMakeup as
        | { rockTypes?: unknown; soilTypes?: unknown }
        | undefined;
      if (!makeup || !Array.isArray(makeup.rockTypes) || !Array.isArray(makeup.soilTypes))
        return value;
      return {
        ...terrain,
        geologicalMakeup: {
          ...makeup,
          rockTypes: [...makeup.rockTypes].sort(),
          soilTypes: [...makeup.soilTypes].sort(),
        },
      };
    };
    return (
      JSON.stringify(canonical(normalize(actual))) ===
      JSON.stringify(canonical(normalize(observed)))
    );
  } catch {
    return false;
  }
}

function observationCurrent(
  snapshot: RegionSnapshot,
  source: Exclude<FactSource, { kind: 'fact' }>,
): boolean {
  if (source.kind === 'environment') return environmentObservationCurrent(snapshot, source);
  const entry =
    source.kind === 'map-node'
      ? snapshot.map.nodes.find((node) => node.id === source.nodeId)
      : snapshot.map.edges.find((edge) => edge.id === source.edgeId);
  return (
    entry !== undefined &&
    String(entry[source.property as keyof typeof entry]) === source.observedValue
  );
}

/** Check saved observations as well as flags; callers never regenerate or repair the source. */
export function regionContextEvidenceCurrent(
  snapshot: RegionSnapshot,
  fact: FactBase,
  visiting = new Set<string>(),
): boolean {
  if (visiting.has(fact.id) || fact.reason?.status === 'stale') return false;
  if (!fact.reason) return fact.origin !== 'generated';
  const next = new Set(visiting).add(fact.id);
  const entries = regionSemanticFactLists.flatMap<RegionSemanticFact>((key) => snapshot.facts[key]);
  return fact.reason.sources.every((source) => {
    if (source.kind !== 'fact') return observationCurrent(snapshot, source);
    const parent = entries.find((entry) => entry.id === source.factId);
    return parent !== undefined && regionContextEvidenceCurrent(snapshot, parent, next);
  });
}
