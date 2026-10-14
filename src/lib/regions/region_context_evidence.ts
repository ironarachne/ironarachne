import { sourceSpecificSummaryIds } from './region_evidence';
import type { FactBase, FactSource } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import { regionSemanticFactLists } from './region_fact_lists';
import type { RegionSemanticFact } from './region_resource_types';

type EvidenceContext = Pick<RegionSnapshot, 'facts' | 'map' | 'environment'>;

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
  snapshot: EvidenceContext,
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

/** Check saved observations as well as flags; callers never regenerate or repair the source. */
export function createRegionEvidenceChecker(snapshot: EvidenceContext) {
  const entries = new Map(
    regionSemanticFactLists
      .flatMap<RegionSemanticFact>((key) => snapshot.facts[key])
      .map((entry) => [entry.id, entry]),
  );
  const nodes = new Map(snapshot.map.nodes.map((node) => [node.id, node]));
  const edges = new Map(snapshot.map.edges.map((edge) => [edge.id, edge]));
  const observations = new Map<string, boolean>();
  const observationCurrent = (source: Exclude<FactSource, { kind: 'fact' }>) => {
    const key = JSON.stringify(source);
    const cached = observations.get(key);
    if (cached !== undefined) return cached;
    const entry =
      source.kind === 'map-node'
        ? nodes.get(source.nodeId)
        : source.kind === 'map-edge'
          ? edges.get(source.edgeId)
          : undefined;
    const current =
      source.kind === 'environment'
        ? environmentObservationCurrent(snapshot, source)
        : entry !== undefined &&
          String(entry[source.property as keyof typeof entry]) === source.observedValue;
    observations.set(key, current);
    return current;
  };
  const checked = new Map<string, boolean>();
  const check = (entry: FactBase, path: Set<string>): boolean => {
    if (path.has(entry.id) || entry.reason?.status === 'stale') return false;
    const cached = checked.get(entry.id);
    if (cached !== undefined) return cached;
    if (!entry.reason) return entry.origin !== 'generated';
    const next = new Set(path).add(entry.id);
    const sources = [
      ...entry.reason.sources,
      ...(entry.assessments ?? []).flatMap((assessment) => assessment.sources),
    ];
    const selected = sourceSpecificSummaryIds(entry);
    const current = sources
      .filter((source) => source.kind !== 'fact' || !selected.has(source.factId))
      .every((source) => {
        if (source.kind !== 'fact') return observationCurrent(source);
        const parent = entries.get(source.factId);
        return parent !== undefined && check(parent, next);
      });
    checked.set(entry.id, current);
    return current;
  };
  return (fact: FactBase, visiting = new Set<string>()) => check(fact, visiting);
}

export function regionContextEvidenceCurrent(
  snapshot: EvidenceContext,
  fact: FactBase,
  visiting = new Set<string>(),
): boolean {
  return createRegionEvidenceChecker(snapshot)(fact, visiting);
}
