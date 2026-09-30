type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
const nonempty = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const uniqueList = (value: unknown, allowed: Set<string>): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((id) => nonempty(id) && allowed.has(id)) &&
  new Set(value).size === value.length;
const roles = new Set([
  'producer',
  'grazer',
  'predator',
  'scavenger',
  'decomposer',
  'pollinator',
  'habitat-engineer',
  'other',
]);

/** Base identities/reasons are checked by regionFactsError; these are the ecology graph rules. */
export function ecologyFactsError(
  facts: RecordValue,
  habitatIds: Set<string>,
  settlementValid: (value: unknown) => boolean,
): string | null {
  const inhabitants = facts.ecologyInhabitants as RecordValue[];
  const byId = new Map(inhabitants.map((entry) => [entry.id, entry]));
  for (const entry of inhabitants) {
    if (!['flora', 'fauna', 'fantastical'].includes(String(entry.category)))
      return 'region inhabitant has an unknown category';
    if (
      !uniqueList(entry.roles, roles) ||
      (entry.roles.includes('other') && entry.roles.length !== 1)
    )
      return 'region inhabitant has invalid roles';
    if (!uniqueList(entry.habitatIds, habitatIds))
      return 'region inhabitant needs unique existing habitats';
    const source = record(entry.source);
    if (
      source === null ||
      !(
        (source.kind === 'species' && nonempty(source.speciesName)) ||
        (source.kind === 'described' && nonempty(source.label)) ||
        (source.kind === 'creature-artifact' &&
          nonempty(source.targetId) &&
          nonempty(source.speciesName))
      )
    )
      return 'region inhabitant has an invalid source';
  }
  const relationKeys = new Set<string>();
  for (const entry of facts.ecologyRelationships as RecordValue[]) {
    const subject = byId.get(entry.subjectId);
    const relation = record(entry.relation);
    if (subject === undefined || relation === null || !uniqueList(entry.habitatIds, habitatIds))
      return 'region ecology relationship needs a subject and unique existing habitats';
    if (!entry.habitatIds.every((id) => (subject.habitatIds as string[]).includes(id)))
      return 'region ecology relationship habitats do not match its subject';
    let endpoints: unknown[];
    if (relation.kind === 'used-by') {
      if (
        !settlementValid(relation.settlement) ||
        !['food', 'material', 'domestication'].includes(String(relation.use))
      )
        return 'region ecology use has an invalid settlement or use';
      if (relation.use === 'domestication' && subject.category === 'flora')
        return 'region ecology cannot domesticate flora';
      const target = record(relation.settlement)!;
      endpoints = [
        entry.subjectId,
        target.kind,
        target.settlementId ?? target.targetId,
        relation.use,
      ];
    } else {
      if (!['feeds-on', 'competes-with', 'pollinates', 'pest-of'].includes(String(relation.kind)))
        return 'region ecology relationship has an unknown kind';
      const target = byId.get(relation.targetId);
      if (target === undefined || target.id === subject.id)
        return 'region ecology relationship has a missing or identical target';
      if (!entry.habitatIds.every((id) => (target.habitatIds as string[]).includes(id)))
        return 'region ecology relationship habitats do not match its target';
      if (
        relation.kind === 'pollinates' &&
        (!(subject.roles as string[]).includes('pollinator') || target.category !== 'flora')
      )
        return 'region ecology pollination needs a pollinator and flora';
      endpoints = [entry.subjectId, relation.targetId];
      if (relation.kind === 'competes-with') endpoints.sort();
    }
    const key = JSON.stringify([relation.kind, endpoints, [...entry.habitatIds].sort()]);
    if (relationKeys.has(key)) return 'region ecology contains duplicate relationships';
    relationKeys.add(key);
  }
  return null;
}
