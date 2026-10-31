import { createRegionEvidenceChecker } from './region_context_evidence';
import { regionSemanticFactLists } from './region_fact_lists';
import { compassPosition } from './region_prose';
import type { NotableFact, FactBase } from './region_fact_types';
import type { RegionSnapshot } from './region_snapshot';
import type {
  RegionNotableReading,
  RegionNotableSubject,
  RegionNotableReferenceContext,
} from './region_notable_reading_types';

export function notableSubjectName(
  snapshot: RegionSnapshot,
  subject: RegionNotableSubject,
  references: RegionNotableReferenceContext = {},
): string | undefined {
  if (subject.kind === 'fact')
    return regionSemanticFactLists
      .flatMap<FactBase>((key) => snapshot.facts[key])
      .find((fact) => fact.id === subject.factId)?.name;
  const target = subject.target;
  return target.kind === 'embedded'
    ? snapshot.settlements.find((entry) => entry.id === target.settlementId)?.snapshot.name
    : Object.hasOwn(references, target.targetId) && typeof references[target.targetId] === 'string'
      ? references[target.targetId]
      : undefined;
}

/** Only a known rule's unique, current role establishes an approach's identity. */
export function notableApproachRole(snapshot: RegionSnapshot, fact: NotableFact) {
  if (
    !/^fantasy:region:settlement-approach:v1$/.test(fact.reason?.ruleId ?? '') ||
    !createRegionEvidenceChecker(snapshot)(fact)
  )
    return undefined;
  const sources = fact.reason!.sources.filter((source) => source.kind === 'fact');
  if (sources.length !== 1) return undefined;
  const roles = snapshot.facts.settlementRoles.filter(
    (role) => role.id === sources[0].factId && role.id.startsWith('role:site:'),
  );
  const role = roles.length === 1 ? roles[0] : undefined;
  return role && fact.anchor?.nodeIds.some((id) => role.anchor.nodeIds.includes(id))
    ? role
    : undefined;
}

export function notableReading(snapshot: RegionSnapshot, fact: NotableFact): RegionNotableReading {
  const role = notableApproachRole(snapshot, fact);
  const forestIds = (fact.reason?.sources ?? []).flatMap((source) =>
    source.kind === 'fact' &&
    snapshot.facts.denseForests.some((forest) => forest.id === source.factId)
      ? [source.factId]
      : [],
  );
  const approach = /^fantasy:region:settlement-approach:v1$/.test(fact.reason?.ruleId ?? '');
  return {
    notableId: fact.id,
    headingKind: approach
      ? 'settlement-approach'
      : fact.kind === 'hazard'
        ? 'hazard'
        : fact.reason?.ruleId === 'fantasy:region:river-meeting:v1'
          ? 'road-river-meeting'
          : 'place',
    ...(role
      ? { subject: { kind: 'settlement' as const, target: role.settlement } }
      : forestIds.length === 1
        ? { subject: { kind: 'fact' as const, factId: forestIds[0] } }
        : {}),
    reason: {
      ruleId: 'fantasy:region:notable-reading:v1',
      status: fact.reason?.status ?? 'current',
      sources: [{ kind: 'fact', factId: fact.id }],
    },
    observations: [],
  };
}

export function notableReadingCurrent(snapshot: RegionSnapshot, reading: RegionNotableReading) {
  const fact = snapshot.facts.notables.find((entry) => entry.id === reading.notableId);
  if (!fact || fact.origin === 'authored') return false;
  const expected = notableReading(snapshot, fact);
  return (
    notableEvidenceKey(reading.subject) === notableEvidenceKey(expected.subject) &&
    reading.headingKind === expected.headingKind &&
    createRegionEvidenceChecker(snapshot)({
      ...fact,
      id: `reading:${fact.id}`,
      reason: reading.reason,
    })
  );
}

export function notableHeading(
  snapshot: RegionSnapshot,
  fact: NotableFact,
  references: RegionNotableReferenceContext = {},
): string {
  if (fact.origin === 'authored') return fact.name;
  const reading = notableReading(snapshot, fact);
  if (reading.headingKind === 'settlement-approach') {
    const name =
      reading.subject && notableSubjectName(snapshot, reading.subject, references)?.trim();
    return name ? `Approach to ${name}` : 'Settlement approach';
  }
  return fact.name.trim();
}

/** A compact live label, never a stored sentence or an inferred settlement center. */
export function notableLocation(snapshot: RegionSnapshot, fact: NotableFact): string | undefined {
  if (!createRegionEvidenceChecker(snapshot)(fact) || !fact.anchor) return undefined;
  const nodes = [...new Set(fact.anchor.nodeIds)].flatMap((id) =>
    snapshot.map.nodes.filter((node) => node.id === id && !node.isWater && !node.isOcean),
  );
  if (
    nodes.length !== 1 ||
    snapshot.map.width <= 0 ||
    snapshot.map.height <= 0 ||
    ![snapshot.map.width, snapshot.map.height, nodes[0].center?.x, nodes[0].center?.y].every(
      Number.isFinite,
    )
  )
    return undefined;
  return `${compassPosition(nodes[0].center.x / snapshot.map.width, nodes[0].center.y / snapshot.map.height)} region`;
}

export const notableEntryAnchor = (id: string) => `notable-${encodeURIComponent(id)}`;

/** Legacy reading can recognize an existing alias without selecting any new prose. */
export function legacyNotableForestAliases(snapshot: RegionSnapshot): Set<string> {
  const current = createRegionEvidenceChecker(snapshot);
  return new Set(
    snapshot.facts.denseForests
      .filter((forest) => {
        if (forest.origin === 'authored') return false;
        const aliases = snapshot.facts.notables.filter(
          (fact) =>
            fact.origin === 'generated' &&
            fact.reason?.ruleId === 'fantasy:region:dense-forest-landmark:v1' &&
            fact.reason.sources.filter((source) => source.kind === 'fact').length === 1 &&
            fact.reason.sources.some(
              (source) => source.kind === 'fact' && source.factId === forest.id,
            ),
        );
        return aliases.length === 1 && current(aliases[0]);
      })
      .map((forest) => forest.id),
  );
}

/** Export files sort object keys; evidence equality must not depend on property insertion order. */
export const notableEvidenceKey = (value: unknown) =>
  JSON.stringify(value, (_key, entry) =>
    entry && typeof entry === 'object' && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : entry,
  );
