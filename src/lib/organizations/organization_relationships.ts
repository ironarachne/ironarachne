/**
 * How this organization connects to another one by id.
 * Additional kinds can be added as the world model grows.
 */
export type OrganizationRelationKind =
  | 'allied'
  | 'rival'
  | 'subsidiary'
  | 'parent'
  | 'client'
  | 'supplier'
  | 'vassal'
  | 'overlord';

export type OrganizationRelationship = {
  relatedOrganizationId: string;
  kind: OrganizationRelationKind;
};

type RNGWithInt = { int(min: number, max: number): number };

/**
 * For a small batch of co-generated organizations, add at most one random
 * symmetric rivalry when there are at least two orgs. Does not add duplicate edges.
 */
export function addRandomRivalryBetweenPairs(
  orgs: { id: string; relationships: OrganizationRelationship[] }[],
  rng: RNGWithInt,
): void {
  if (orgs.length < 2) {
    return;
  }
  if (rng.int(0, 100) > 40) {
    return;
  }
  const a = rng.int(0, orgs.length - 1);
  let b = rng.int(0, orgs.length - 1);
  let guard = 0;
  while (b === a && guard < 20) {
    b = rng.int(0, orgs.length - 1);
    guard++;
  }
  if (a === b) {
    return;
  }
  const idA = orgs[a].id;
  const idB = orgs[b].id;
  if (
    pairAlreadyLinked(orgs[a].relationships, idB) ||
    pairAlreadyLinked(orgs[b].relationships, idA)
  ) {
    return;
  }
  orgs[a].relationships.push({ relatedOrganizationId: idB, kind: 'rival' });
  orgs[b].relationships.push({ relatedOrganizationId: idA, kind: 'rival' });
}

function pairAlreadyLinked(rels: OrganizationRelationship[], otherId: string): boolean {
  return rels.some((r) => r.relatedOrganizationId === otherId);
}
