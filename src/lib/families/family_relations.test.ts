import { describe, expect, it } from 'vitest';

import { familyChildrenOf, familyMateOf, familyParentsOf } from './family_relations.js';

const members = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
const family = {
  members,
  relationships: [
    { originatorId: 'a', recipientId: 'b', type: { name: 'spouse' } },
    { originatorId: 'a', recipientId: 'c', type: { name: 'parent' } },
    { originatorId: 'b', recipientId: 'c', type: { name: 'parent' } },
    { originatorId: 'a', recipientId: 'd', type: { name: 'parent' } },
    { originatorId: 'c', recipientId: 'd', type: { name: 'sibling' } },
  ],
};

describe('the family relation readers', () => {
  it('find a mate from either end of the spouse edge', () => {
    expect(familyMateOf(family, members[0])).toBe(members[1]);
    expect(familyMateOf(family, members[1])).toBe(members[0]);
    expect(familyMateOf(family, members[2])).toBeUndefined();
  });

  it('find children and parents in member order', () => {
    expect(familyChildrenOf(family, members[0])).toEqual([members[2], members[3]]);
    expect(familyParentsOf(family, members[2])).toEqual([members[0], members[1]]);
    expect(familyParentsOf(family, members[0])).toEqual([]);
  });

  /** 3.3 and 5.4 together: an edge to someone who is gone answers nothing, and throws nothing. */
  it('tolerate an edge to a member who is not there', () => {
    const missing = { ...family, members: [members[0]] };

    expect(familyMateOf(missing, members[0])).toBeUndefined();
    expect(familyChildrenOf(missing, members[0])).toEqual([]);
  });
});
