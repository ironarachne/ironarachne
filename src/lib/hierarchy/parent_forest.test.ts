import { describe, expect, it } from 'vitest';
import {
  buildChildrenMap,
  childToParentFromEntries,
  depth,
  getRoots,
  isStrictAncestorOf,
  isValidParentForest,
  listAncestors,
  listDescendants,
  lowestCommonAncestor,
  validateChildToParent,
} from './parent_forest';

describe('parent_forest', () => {
  describe('validateChildToParent', () => {
    it('returns empty for a two-node chain and single root', () => {
      const m = childToParentFromEntries<string>([
        ['a', 'b'],
        ['b', null],
      ]);
      expect(validateChildToParent(m)).toEqual([]);
    });

    it('returns empty for a multi-root forest', () => {
      const m = childToParentFromEntries<string>([
        ['a', null],
        ['b', null],
        ['c', 'a'],
      ]);
      expect(validateChildToParent(m)).toEqual([]);
    });

    it('returns unknown_parent when a parent is not a key', () => {
      const m = childToParentFromEntries<string>([
        ['a', 'missing'],
        ['b', null],
      ]);
      const err = validateChildToParent(m);
      expect(err).toHaveLength(1);
      expect(err[0]).toEqual({
        kind: 'unknown_parent',
        childId: 'a',
        parentId: 'missing',
      });
    });

    it('returns cycle when the parent links loop', () => {
      const m = childToParentFromEntries<string>([
        ['a', 'b'],
        ['b', 'a'],
      ]);
      const err = validateChildToParent(m);
      expect(err).toHaveLength(1);
      expect(err[0]?.kind).toBe('cycle');
      if (err[0]?.kind === 'cycle') {
        expect(err[0].nodes[0]).toBe('a');
        expect(new Set(err[0].nodes).size).toBe(2);
      }
    });
  });

  it('getRoots lists all null-parent nodes', () => {
    const m = childToParentFromEntries<string>([
      ['a', null],
      ['b', 'a'],
      ['c', null],
    ]);
    expect(new Set(getRoots(m))).toEqual(new Set(['a', 'c']));
  });

  it('listAncestors walks toward the root in order', () => {
    const m = childToParentFromEntries<string>([
      ['x', 'a'],
      ['a', 'b'],
      ['b', null],
    ]);
    expect(listAncestors(m, 'x')).toEqual(['a', 'b']);
  });

  it('depth counts edges to the root', () => {
    const m = childToParentFromEntries<string>([
      ['c', 'b'],
      ['b', 'a'],
      ['a', null],
    ]);
    expect(depth(m, 'a')).toBe(0);
    expect(depth(m, 'b')).toBe(1);
    expect(depth(m, 'c')).toBe(2);
  });

  it('isStrictAncestorOf is true for intermediate ancestors', () => {
    const m = childToParentFromEntries<string>([
      ['c', 'b'],
      ['b', 'a'],
      ['a', null],
    ]);
    expect(isStrictAncestorOf(m, 'a', 'c')).toBe(true);
    expect(isStrictAncestorOf(m, 'b', 'c')).toBe(true);
    expect(isStrictAncestorOf(m, 'c', 'a')).toBe(false);
  });

  it('buildChildrenMap groups children by parent', () => {
    const m = childToParentFromEntries<string>([
      ['c1', 'a'],
      ['c2', 'a'],
      ['a', null],
    ]);
    const ch = buildChildrenMap(m);
    expect(ch.get('a')?.length).toBe(2);
    expect(new Set(ch.get('a'))).toEqual(new Set(['c1', 'c2']));
  });

  it('listDescendants includes deep descendants in BFS order from each parent', () => {
    const m = childToParentFromEntries<string>([
      ['d', 'c'],
      ['c', 'b'],
      ['b', 'a'],
      ['a', null],
    ]);
    expect(listDescendants(m, 'a')).toEqual(['b', 'c', 'd']);
  });

  it('lowestCommonAncestor returns the first hit walking up from b', () => {
    const m = childToParentFromEntries<string>([
      ['a', 'r'],
      ['b', 'r'],
      ['r', null],
    ]);
    expect(lowestCommonAncestor(m, 'a', 'b')).toBe('r');
  });

  it('isValidParentForest is true iff validation is empty', () => {
    const good = childToParentFromEntries<string>([
      ['a', null],
      ['b', 'a'],
    ]);
    expect(isValidParentForest(good)).toBe(true);
    const bad = childToParentFromEntries<string>([['a', 'x']]);
    expect(isValidParentForest(bad)).toBe(false);
  });
});
