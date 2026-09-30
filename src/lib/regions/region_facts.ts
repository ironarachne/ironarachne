import { ecologyFactsError } from './region_ecology_validation';
import type { RegionMap } from '$lib/map';
import type { RegionFacts, RegionSettlement } from './region_fact_types.js';

export function emptyRegionFacts(state: RegionFacts['state']): RegionFacts {
  return {
    version: 2,
    state,
    areas: [],
    habitats: [],
    settlementRoles: [],
    notables: [],
    resources: [],
    routes: [],
    claims: [],
    ecologyInhabitants: [],
    ecologyRelationships: [],
  };
}

type RecordValue = Record<string, unknown>;
const object = (value: unknown): RecordValue | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
const nonempty = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const ids = (value: unknown, valid: Set<number>): boolean =>
  Array.isArray(value) && value.every((id) => Number.isInteger(id) && valid.has(id));
const strings = (value: unknown, valid?: Set<string>): boolean =>
  Array.isArray(value) &&
  value.every((id) => nonempty(id) && (valid === undefined || valid.has(id)));
const graphIds = (entries: unknown[]): Set<number> =>
  new Set(
    entries.flatMap((entry) => {
      const id = object(entry)?.id;
      return Number.isInteger(id) ? [id as number] : [];
    }),
  );

/** Validates the semantic graph against this exact saved map, never a regenerated map. */
export function regionFactsError(
  value: unknown,
  map: RegionMap,
  settlements: RegionSettlement[],
): string | null {
  const facts = object(value);
  if (
    facts === null ||
    facts.version !== 2 ||
    !['current', 'legacy'].includes(String(facts.state))
  ) {
    return 'region facts have an unsupported version or state';
  }
  const keys = [
    'areas',
    'habitats',
    'settlementRoles',
    'notables',
    'resources',
    'routes',
    'claims',
    'ecologyInhabitants',
    'ecologyRelationships',
  ] as const;
  if (keys.some((key) => !Array.isArray(facts[key]))) return 'region facts need all nine lists';
  const entries = keys.flatMap((key) => facts[key] as unknown[]);
  const factIds = new Set<string>();
  for (const key of keys) {
    for (const entry of facts[key] as unknown[]) {
      const fact = object(entry);
      const prefix =
        key === 'areas'
          ? 'area:'
          : key === 'habitats'
            ? 'habitat:'
            : key === 'settlementRoles'
              ? 'role:'
              : key === 'resources'
                ? 'resource:'
                : key === 'routes'
                  ? 'route:'
                  : key === 'ecologyInhabitants'
                    ? 'inhabitant:'
                    : key === 'ecologyRelationships'
                      ? 'ecology:'
                      : key === 'claims'
                        ? 'claim:'
                        : `${fact?.kind}:`;
      if (
        fact === null ||
        !nonempty(fact.id) ||
        !fact.id.startsWith(prefix) ||
        fact.id.length === prefix.length ||
        factIds.has(fact.id) ||
        typeof fact.name !== 'string' ||
        typeof fact.description !== 'string' ||
        !['generated', 'authored'].includes(String(fact.origin))
      )
        return 'region facts contain an invalid or duplicate identity';
      factIds.add(fact.id);
    }
  }
  const nodeIds = graphIds(map.nodes);
  const edgeIds = graphIds(map.edges);
  const areaIds = new Set((facts.areas as RecordValue[]).map((area) => area.id as string));
  const habitatIds = new Set(
    (facts.habitats as RecordValue[]).map((habitat) => habitat.id as string),
  );
  const notableIds = new Set(
    (facts.notables as RecordValue[]).map((notable) => notable.id as string),
  );
  const settlementIds = new Set(settlements.map((settlement) => settlement.id));
  const anchorValid = (value: unknown): boolean => {
    const anchor = object(value);
    return anchor !== null && ids(anchor.nodeIds, nodeIds) && ids(anchor.edgeIds, edgeIds);
  };
  const settlementTargetValid = (value: unknown): boolean => {
    const target = object(value);
    return (
      target !== null &&
      ((target.kind === 'embedded' &&
        nonempty(target.settlementId) &&
        settlementIds.has(target.settlementId)) ||
        (target.kind === 'artifact' && nonempty(target.targetId)))
    );
  };
  for (const entry of facts.areas as RecordValue[]) {
    if (!ids(entry.mapNodeIds, nodeIds)) return 'region area cites an unknown map node';
  }
  for (const key of ['habitats', 'settlementRoles', 'notables'] as const) {
    for (const entry of facts[key] as RecordValue[]) {
      if (!strings(entry.areaIds, areaIds)) return 'region fact cites an unknown area';
      if ((key === 'settlementRoles' || entry.anchor !== undefined) && !anchorValid(entry.anchor)) {
        return 'region fact anchor cites an unknown map feature';
      }
      if (key === 'notables' && !['landmark', 'hazard'].includes(String(entry.kind))) {
        return 'region notable has an unknown kind';
      }
      if (key === 'settlementRoles') {
        if (!settlementTargetValid(entry.settlement))
          return 'region role cites an unknown settlement';
      }
    }
  }
  for (const entry of facts.resources as RecordValue[]) {
    if (!['freshwater', 'arable-land', 'fish', 'timber'].includes(String(entry.kind))) {
      return 'region resource has an unknown kind';
    }
    if (!strings(entry.areaIds, areaIds) || !strings(entry.habitatIds, habitatIds)) {
      return 'region resource cites an unknown area or habitat';
    }
    if (entry.anchor !== undefined && !anchorValid(entry.anchor)) {
      return 'region resource anchor cites an unknown map feature';
    }
    const anchor = object(entry.anchor);
    if (
      (entry.areaIds as string[]).length === 0 &&
      (anchor === null ||
        ((anchor.nodeIds as number[]).length === 0 && (anchor.edgeIds as number[]).length === 0))
    ) {
      return 'region resource has no location';
    }
  }
  const mapEdges = new Map(
    map.edges.flatMap((edge) => {
      const record = object(edge);
      return record !== null && Number.isInteger(record.id)
        ? ([[record.id as number, record]] as const)
        : [];
    }),
  );
  for (const entry of facts.routes as RecordValue[]) {
    if (!['road', 'river'].includes(String(entry.kind))) return 'region route has an unknown kind';
    if (!strings(entry.areaIds, areaIds)) return 'region route cites an unknown area';
    if (!anchorValid(entry.anchor)) return 'region route anchor cites an unknown map feature';
    const anchor = entry.anchor as { edgeIds: number[] };
    if (anchor.edgeIds.length === 0) return 'region route has no map edges';
    if (!Array.isArray(entry.endpoints) || entry.endpoints.length !== 2) {
      return 'region route needs exactly two endpoints';
    }
    const endpointKeys: string[] = [];
    for (const value of entry.endpoints) {
      const endpoint = object(value);
      if (endpoint === null) return 'region route has an invalid endpoint';
      if (endpoint.kind === 'settlement' && settlementTargetValid(endpoint.settlement)) {
        const target = object(endpoint.settlement)!;
        endpointKeys.push(
          `${target.kind}:${target.kind === 'embedded' ? target.settlementId : target.targetId}`,
        );
      } else if (
        endpoint.kind === 'notable' &&
        nonempty(endpoint.notableId) &&
        notableIds.has(endpoint.notableId)
      ) {
        endpointKeys.push(`notable:${endpoint.notableId}`);
      } else if (
        endpoint.kind === 'boundary' &&
        Number.isInteger(endpoint.edgeId) &&
        mapEdges.get(endpoint.edgeId as number)?.d1 === undefined &&
        anchor.edgeIds.includes(endpoint.edgeId as number)
      ) {
        endpointKeys.push(`boundary:${endpoint.edgeId}`);
      } else {
        return 'region route endpoint cites an unknown place or boundary';
      }
    }
    if (endpointKeys[0] === endpointKeys[1]) return 'region route endpoints are identical';
  }
  for (const entry of facts.claims as RecordValue[]) {
    if (
      !nonempty(entry.subjectId) ||
      !factIds.has(entry.subjectId) ||
      !strings(entry.relatedIds, factIds)
    ) {
      return 'region claim cites an unknown fact';
    }
  }
  const ecologyError = ecologyFactsError(facts, habitatIds, settlementTargetValid);
  if (ecologyError !== null) return ecologyError;
  for (const entry of entries) {
    const reason = object((entry as RecordValue).reason);
    if ((entry as RecordValue).reason === undefined) continue;
    if (
      reason === null ||
      !nonempty(reason.ruleId) ||
      !['current', 'stale'].includes(String(reason.status)) ||
      !Array.isArray(reason.sources) ||
      reason.sources.length === 0
    )
      return 'region fact has an invalid reason';
    for (const sourceValue of reason.sources) {
      const source = object(sourceValue);
      if (source === null) return 'region reason has an invalid source';
      if (!['fact', 'map-node', 'map-edge', 'environment'].includes(String(source.kind))) {
        return 'region reason has an unknown source kind';
      }
      if (
        (source.kind === 'fact' && !nonempty(source.factId)) ||
        (source.kind === 'map-node' &&
          (!Number.isInteger(source.nodeId) ||
            ![
              'elevation',
              'moisture',
              'temperature',
              'isWater',
              'isOcean',
              'isCoast',
              'biomeId',
            ].includes(String(source.property)) ||
            typeof source.observedValue !== 'string')) ||
        (source.kind === 'map-edge' &&
          (!Number.isInteger(source.edgeId) ||
            !['river', 'road'].includes(String(source.property)) ||
            typeof source.observedValue !== 'string')) ||
        (source.kind === 'environment' &&
          (![
            'climate',
            'terrain',
            'biome',
            'waterSystem',
            'dominantEcosystem',
            'ecosystems',
          ].includes(String(source.field)) ||
            typeof source.observedValue !== 'string'))
      )
        return 'region reason has an invalid source';
      const present =
        source.kind === 'fact'
          ? factIds.has(source.factId as string)
          : source.kind === 'map-node'
            ? nodeIds.has(source.nodeId as number)
            : source.kind === 'map-edge'
              ? edgeIds.has(source.edgeId as number)
              : true;
      if (!present && reason.status !== 'stale')
        return 'current region reason cites an unknown source';
    }
  }
  return null;
}
