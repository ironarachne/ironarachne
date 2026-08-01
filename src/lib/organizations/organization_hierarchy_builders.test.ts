import { describe, expect, it } from 'vitest';
import { validateChildToParent, validateIdToOrder } from '$lib/hierarchy';
import { assertValidOrganizationHierarchy, leaderRoleIdFromHierarchy } from './member_mutations';
import { flatForest, lineChain } from './organization_hierarchy_builders';
import type { OrganizationHierarchy } from './organization_types';

describe('lineChain', () => {
  it('makes the first role the root and each next report to the previous', () => {
    const h = lineChain([
      { id: 'captain', roleName: 'Captain', order: 2 },
      { id: 'mate', roleName: 'Mate', order: 1 },
      { id: 'hand', roleName: 'Hand', order: 0 },
    ]);

    expect(h.childToParent.get('captain')).toBeNull();
    expect(h.childToParent.get('mate')).toBe('captain');
    expect(h.childToParent.get('hand')).toBe('mate');
    expect(h.roleById.get('hand')?.roleName).toBe('Hand');
    assertValidOrganizationHierarchy(h);
  });

  it('puts the highest order at the root, where the leader is looked up', () => {
    const h = lineChain([
      { id: 'captain', roleName: 'Captain', order: 2 },
      { id: 'mate', roleName: 'Mate', order: 1 },
    ]);
    expect(leaderRoleIdFromHierarchy(h.childToParent, h.idToOrder)).toBe('captain');
  });

  it('refuses to build a chain with no roles', () => {
    expect(() => lineChain([])).toThrow(/at least one role/);
  });

  it('accepts a single role as its own root', () => {
    const h = lineChain([{ id: 'only', roleName: 'Only', order: 0 }]);
    expect(h.childToParent.get('only')).toBeNull();
    assertValidOrganizationHierarchy(h);
  });
});

describe('flatForest', () => {
  it('roots every role separately so rank comes from order alone', () => {
    const h = flatForest([
      { id: 'elder', roleName: 'Elder', order: 2 },
      { id: 'speaker', roleName: 'Speaker', order: 1 },
      { id: 'member', roleName: 'Member', order: 0 },
    ]);

    for (const id of ['elder', 'speaker', 'member']) {
      expect(h.childToParent.get(id)).toBeNull();
    }
    expect(h.roleById.get('speaker')?.roleName).toBe('Speaker');
    expect(validateChildToParent(h.childToParent)).toEqual([]);
    expect(validateIdToOrder(h.idToOrder, { requireUniqueOrder: true })).toEqual([]);
    assertValidOrganizationHierarchy(h);
  });

  it('still yields a single leader, taken from the highest order', () => {
    const h = flatForest([
      { id: 'elder', roleName: 'Elder', order: 2 },
      { id: 'member', roleName: 'Member', order: 0 },
    ]);
    expect(leaderRoleIdFromHierarchy(h.childToParent, h.idToOrder)).toBe('elder');
  });

  it('builds an empty forest without complaint', () => {
    const h = flatForest([]);
    expect(h.childToParent.size).toBe(0);
    expect(leaderRoleIdFromHierarchy(h.childToParent, h.idToOrder)).toBeNull();
  });
});

describe('assertValidOrganizationHierarchy', () => {
  it('rejects two roles claiming the same rank', () => {
    const h = flatForest([
      { id: 'a', roleName: 'A', order: 1 },
      { id: 'b', roleName: 'B', order: 1 },
    ]);
    expect(() => assertValidOrganizationHierarchy(h)).toThrow(/Invalid idToOrder/);
  });

  it('rejects a role reporting to a parent that does not exist', () => {
    const broken: OrganizationHierarchy = {
      childToParent: new Map([
        ['a', null],
        ['b', 'ghost'],
      ]) as unknown as OrganizationHierarchy['childToParent'],
      idToOrder: new Map([
        ['a', 1],
        ['b', 0],
      ]),
      roleById: new Map([
        ['a', { roleName: 'A' }],
        ['b', { roleName: 'B' }],
      ]),
    };
    expect(() => assertValidOrganizationHierarchy(broken)).toThrow(/Invalid childToParent/);
  });
});
