/**
 * Reading a family's relationships as the people they connect.
 *
 * A family's edges are id-based records — an originator, a recipient, a type — and nothing in the
 * payload refers to another object directly. That is what keeps `structuredClone` from ever
 * recursing, and it means every question about who is married to whom is a lookup over two flat
 * lists. These helpers are that lookup, written once so the page, the editor and the export all
 * read the same edges the same way rather than each carrying a copy.
 *
 * They are written over the *stored* shape's field names, which the live shape also has: a member
 * needs an `id`, and a relationship its two ids and a type name. Either a `Family` or a
 * `FamilySnapshot` fits.
 */

/** The parts of a member every reader here needs. */
export type FamilyMemberLike = { id: string };

/** The parts of a relationship every reader here needs. */
export type FamilyRelationshipLike = {
  originatorId: string;
  recipientId: string;
  type: { name: string };
};

/** The parts of a family every reader here needs. */
export type FamilyLike<TMember extends FamilyMemberLike> = {
  members: TMember[];
  relationships: FamilyRelationshipLike[];
};

/** The member a spouse edge joins to this one, or nothing. */
export function familyMateOf<TMember extends FamilyMemberLike>(
  family: FamilyLike<TMember>,
  member: TMember,
): TMember | undefined {
  const relationship = family.relationships.find(
    (r) =>
      r.type.name === 'spouse' && (r.originatorId === member.id || r.recipientId === member.id),
  );
  if (relationship === undefined) {
    return undefined;
  }
  const mateId =
    relationship.originatorId === member.id ? relationship.recipientId : relationship.originatorId;
  return family.members.find((m) => m.id === mateId);
}

/** The members this one is a parent of, in member order. */
export function familyChildrenOf<TMember extends FamilyMemberLike>(
  family: FamilyLike<TMember>,
  member: TMember,
): TMember[] {
  const childIds = family.relationships
    .filter((r) => r.type.name === 'parent' && r.originatorId === member.id)
    .map((r) => r.recipientId);
  return family.members.filter((m) => childIds.includes(m.id));
}

/** The members this one is a child of, in member order. */
export function familyParentsOf<TMember extends FamilyMemberLike>(
  family: FamilyLike<TMember>,
  member: TMember,
): TMember[] {
  const parentIds = family.relationships
    .filter((r) => r.type.name === 'parent' && r.recipientId === member.id)
    .map((r) => r.originatorId);
  return family.members.filter((m) => parentIds.includes(m.id));
}
