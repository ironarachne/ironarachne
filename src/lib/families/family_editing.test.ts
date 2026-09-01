import { describe, expect, it } from 'vitest';

import { removeFamilyMember, setFamilyMemberName, setFamilyName } from './family_editing.js';
import { familyChildrenOf, familyMateOf } from './family_relations.js';
import { rollFamilySnapshot } from './family_roll.js';

/** A family with a head, a spouse and children, so removals have edges to take with them. */
const family = rollFamilySnapshot('editing-fixture', { speciesName: 'human', generations: 3 });

describe('editing a family', () => {
  it('has a fixture worth testing', () => {
    expect(family.members.length).toBeGreaterThan(2);
    expect(family.relationships.length).toBeGreaterThan(0);
  });

  it('renames the house and leaves its members alone', () => {
    const edited = setFamilyName(family, 'Ashford');

    expect(edited.name).toBe('Ashford');
    expect(edited.members).toEqual(family.members);
    expect(edited.members[0].lastName).toBe(family.members[0].lastName);
  });

  /** Requirement 4.4: one field at a time, and nothing else moves. */
  it('renames one member and keeps the display name in step', () => {
    const edited = setFamilyMemberName(family, 0, 'firstName', 'Tam');

    expect(edited.members[0].firstName).toBe('Tam');
    expect(edited.members[0].name).toBe(`Tam ${family.members[0].lastName}`);
    expect(edited.members.slice(1)).toEqual(family.members.slice(1));
    expect(edited.relationships).toEqual(family.relationships);
  });

  it('changes a surname without touching the first name', () => {
    const edited = setFamilyMemberName(family, 1, 'lastName', 'Ashford');

    expect(edited.members[1].lastName).toBe('Ashford');
    expect(edited.members[1].firstName).toBe(family.members[1].firstName);
    expect(edited.members[1].name).toBe(`${family.members[1].firstName} Ashford`);
  });

  it('never writes into the snapshot it was given', () => {
    const before = structuredClone(family);
    setFamilyName(family, 'x');
    setFamilyMemberName(family, 0, 'firstName', 'x');
    removeFamilyMember(family, 0);

    expect(family).toEqual(before);
  });

  it('removes a member and every edge that named them', () => {
    const removed = family.members[0];
    const edited = removeFamilyMember(family, 0);

    expect(edited.members.map((m) => m.id)).not.toContain(removed.id);
    expect(edited.memberIds).not.toContain(removed.id);
    expect(
      edited.relationships.some(
        (r) => r.originatorId === removed.id || r.recipientId === removed.id,
      ),
    ).toBe(false);
    expect(edited.relationships.length).toBeLessThan(family.relationships.length);
  });

  it('leaves the rest of the graph readable after a removal', () => {
    const founder = family.members[0];
    const children = familyChildrenOf(family, founder);
    const edited = removeFamilyMember(family, 0);
    const mate = familyMateOf(family, founder);

    for (const child of children) {
      const stillThere = edited.members.find((m) => m.id === child.id);
      expect(stillThere).toBeDefined();
    }
    if (mate !== undefined) {
      const mateAfter = edited.members.find((m) => m.id === mate.id)!;
      expect(familyMateOf(edited, mateAfter)).toBeUndefined();
    }
  });

  it('clears the head when the head is removed, and keeps it otherwise', () => {
    const withHead = { ...family, headId: family.members[0].id };

    expect(removeFamilyMember(withHead, 0).headId).toBeUndefined();
    expect(removeFamilyMember(withHead, 1).headId).toBe(family.members[0].id);
  });

  it('can empty a family, which is an ordinary state', () => {
    let current = family;
    while (current.members.length > 0) {
      current = removeFamilyMember(current, 0);
    }

    expect(current.members).toEqual([]);
    expect(current.relationships).toEqual([]);
    expect(current.memberIds).toEqual([]);
    expect(current.name).toBe(family.name);
  });

  /** An index nothing is at is a no-op, not a throw: the editor is driven by a live list. */
  it('ignores an index that is not there', () => {
    expect(setFamilyMemberName(family, 99, 'firstName', 'x')).toBe(family);
    expect(setFamilyMemberName(family, -1, 'firstName', 'x')).toBe(family);
    expect(removeFamilyMember(family, 0.5)).toBe(family);
    expect(removeFamilyMember(family, 99)).toBe(family);
  });
});
