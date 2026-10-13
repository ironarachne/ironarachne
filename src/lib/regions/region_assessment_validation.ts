import type { RegionMap } from '$lib/map';

const record = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const text = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
const topics = [
  'resource-presence',
  'resource-exploitation',
  'cultivated-crop',
  'domesticated-source',
  'sustainable-yield',
  'water-purity',
  'river-presence',
  'road-at-river',
  'safe-crossing',
  'river-navigability',
];
export function regionSourcesError(
  sources: unknown,
  stale: boolean,
  map: RegionMap,
  factIds: Set<string>,
): string | null {
  if (!Array.isArray(sources)) return 'region evidence requires sources';
  for (const value of sources) {
    const source = record(value);
    if (!source) return 'region evidence has an invalid source';
    let present = false;
    if (source.kind === 'fact') {
      if (!text(source.factId)) return 'region evidence has an invalid fact source';
      present = factIds.has(String(source.factId));
    } else if (source.kind === 'map-node' || source.kind === 'map-edge') {
      const node = source.kind === 'map-node';
      const id = node ? source.nodeId : source.edgeId;
      const properties = node
        ? ['elevation', 'temperature', 'moisture', 'isWater', 'isOcean', 'isCoast', 'biomeId']
        : ['river', 'road'];
      if (
        !Number.isInteger(id) ||
        !properties.includes(String(source.property)) ||
        typeof source.observedValue !== 'string'
      )
        return 'region evidence has an invalid map source';
      present = (node ? map.nodes : map.edges).some((entry) => entry.id === id);
    } else if (source.kind === 'environment') {
      if (
        !['climate', 'terrain', 'biome', 'waterSystem', 'dominantEcosystem', 'ecosystems'].includes(
          String(source.field),
        ) ||
        typeof source.observedValue !== 'string'
      )
        return 'region evidence has an invalid environment source';
      present = true;
    } else return 'region evidence has an unknown source kind';
    if (!present && !stale) return 'current region evidence cites an unknown source';
  }
  return null;
}
export function regionAssessmentsError(
  value: unknown,
  stale: boolean,
  map: RegionMap,
  factIds: Set<string>,
): string | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) return 'region assessments must be a list';
  const seen = new Set<string>();
  for (const entry of value) {
    const assessment = record(entry);
    if (
      !assessment ||
      !topics.includes(String(assessment.topic)) ||
      seen.has(String(assessment.topic)) ||
      !['confirmed', 'inferred', 'unknown'].includes(String(assessment.status)) ||
      !text(assessment.explanation)
    )
      return 'region assessment has an invalid topic, status or explanation';
    seen.add(String(assessment.topic));
    const error = regionSourcesError(assessment.sources, stale, map, factIds);
    if (error) return error;
    if (assessment.status !== 'unknown' && !(assessment.sources as unknown[]).length)
      return 'supported region assessment requires evidence';
  }
  return null;
}
export function regionOverviewReasonError(
  value: unknown,
  map: RegionMap,
  factIds: Set<string>,
): string | null {
  if (value === undefined) return null;
  const reason = record(value);
  if (
    !reason ||
    !text(reason.ruleId) ||
    !['current', 'stale'].includes(String(reason.status)) ||
    !Array.isArray(reason.sources) ||
    !reason.sources.length
  )
    return 'region overview has an invalid reason';
  return regionSourcesError(reason.sources, reason.status === 'stale', map, factIds);
}
