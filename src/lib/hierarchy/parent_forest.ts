import type { ParentForestError } from './hierarchy_types.js';

/**
 * Edges: child → parent, or a root (parent null) for a child that is itself a root.
 * Later entries for the same `child` override earlier ones.
 */
export function childToParentFromEntries<Id extends string>(
  entries: readonly (readonly [Id, Id | null])[],
): ReadonlyMap<Id, Id | null> {
  return new Map(entries);
}

/**
 * If the returned array is empty, the map describes one or more trees (a forest)
 * with child→parent pointers. Otherwise the map is not a valid parent forest.
 */
export function validateChildToParent<Id extends string>(
  m: ReadonlyMap<Id, Id | null>,
): ParentForestError[] {
  const errors: ParentForestError[] = [];
  for (const [child, parent] of m) {
    if (parent !== null && !m.has(parent)) {
      errors.push({ kind: 'unknown_parent', childId: child, parentId: parent });
    }
  }
  if (errors.length > 0) {
    return errors;
  }

  const visited = new Set<Id>();
  for (const start of m.keys()) {
    if (visited.has(start)) {
      continue;
    }
    const path: Id[] = [];
    const inPath = new Set<Id>();
    let x: Id | null = start;
    for (;;) {
      if (x === null) {
        for (const n of path) {
          visited.add(n);
        }
        break;
      }
      if (visited.has(x)) {
        for (const n of path) {
          visited.add(n);
        }
        break;
      }
      if (inPath.has(x)) {
        const from = path.indexOf(x);
        errors.push({ kind: 'cycle', nodes: from >= 0 ? path.slice(from) : [x] });
        return errors;
      }
      inPath.add(x);
      path.push(x);
      const p: Id | null = m.get(x) ?? null;
      x = p;
    }
  }
  return errors;
}

export function isValidParentForest<Id extends string>(m: ReadonlyMap<Id, Id | null>): boolean {
  return validateChildToParent(m).length === 0;
}

/**
 * All nodes with no parent in the forest.
 */
export function getRoots<Id extends string>(m: ReadonlyMap<Id, Id | null>): Id[] {
  const r: Id[] = [];
  for (const [id, parent] of m) {
    if (parent === null) {
      r.push(id);
    }
  }
  return r;
}

/**
 * Strict ancestors: immediate parent, then up to the root; does not include `id`.
 * If `id` is missing from the map, returns an empty list.
 */
export function listAncestors<Id extends string>(m: ReadonlyMap<Id, Id | null>, id: Id): Id[] {
  if (!m.has(id)) {
    return [];
  }
  const res: Id[] = [];
  const seen = new Set<Id>();
  let cur: Id | null = m.get(id) ?? null;
  while (cur !== null) {
    if (seen.has(cur)) {
      break;
    }
    seen.add(cur);
    res.push(cur);
    cur = m.get(cur) ?? null;
  }
  return res;
}

/**
 * Number of parent edges to the root. Roots have depth 0. Missing `id` yields 0.
 */
export function depth<Id extends string>(m: ReadonlyMap<Id, Id | null>, id: Id): number {
  return listAncestors(m, id).length;
}

/**
 * True if `ancestorId` is a strict ancestor of `descendantId` (on the parent walk from descendant).
 */
export function isStrictAncestorOf<Id extends string>(
  m: ReadonlyMap<Id, Id | null>,
  ancestorId: Id,
  descendantId: Id,
): boolean {
  return listAncestors(m, descendantId).includes(ancestorId);
}

/**
 * Children of each non-null parent id.
 */
export function buildChildrenMap<Id extends string>(
  m: ReadonlyMap<Id, Id | null>,
): ReadonlyMap<Id, Id[]> {
  const out = new Map<Id, Id[]>();
  for (const [child, parent] of m) {
    if (parent === null) {
      continue;
    }
    const list = out.get(parent);
    if (list) {
      list.push(child);
    } else {
      out.set(parent, [child]);
    }
  }
  return out;
}

/**
 * All nodes in the subtrees under `id` (not including `id`). BFS.
 */
export function listDescendants<Id extends string>(
  m: ReadonlyMap<Id, Id | null>,
  id: Id,
): Id[] {
  const children = buildChildrenMap(m);
  const res: Id[] = [];
  const queue: Id[] = children.get(id)?.slice() ?? [];
  const seen = new Set<Id>();
  while (queue.length > 0) {
    const c = queue.shift()!;
    if (seen.has(c)) {
      continue;
    }
    seen.add(c);
    res.push(c);
    const next = children.get(c);
    if (next) {
      queue.push(...next);
    }
  }
  return res;
}

/**
 * Lowest common ancestor in the same tree, or `null` if the chain from either id
 * never reaches a common node (e.g. different components) or a node is missing.
 */
export function lowestCommonAncestor<Id extends string>(
  m: ReadonlyMap<Id, Id | null>,
  a: Id,
  b: Id,
): Id | null {
  if (!m.has(a) || !m.has(b)) {
    return null;
  }
  if (a === b) {
    return a;
  }
  const ancestorsA = new Set<Id>([a, ...listAncestors(m, a)]);
  let cur: Id | null = b;
  const seenB = new Set<Id>();
  while (cur !== null && !seenB.has(cur)) {
    if (ancestorsA.has(cur)) {
      return cur;
    }
    seenB.add(cur);
    cur = m.get(cur) ?? null;
  }
  return null;
}
