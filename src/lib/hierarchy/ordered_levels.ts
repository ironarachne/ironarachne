import type { CompareOrder, OrderedLevelError } from './hierarchy_types.js';

/**
 * Compare `a` and `b` by their mapped numbers. **Larger** level means **higher** standing.
 * Returns `null` if either id is not in the map.
 */
export function compareByOrder<Id extends string>(
  m: ReadonlyMap<Id, number>,
  a: Id,
  b: Id,
): CompareOrder | null {
  const oa = m.get(a);
  const ob = m.get(b);
  if (oa === undefined || ob === undefined) {
    return null;
  }
  if (oa < ob) {
    return -1;
  }
  if (oa > ob) {
    return 1;
  }
  return 0;
}

/**
 * Sort by ascending numeric order (low tier first / lower standing first with "larger = higher" semantics).
 * Ids that are not in the map are placed at the end, in stable order relative to other missing ids.
 */
export function sortIdsByOrder<Id extends string>(ids: readonly Id[], m: ReadonlyMap<Id, number>): Id[] {
  return [...ids].sort((x, y) => {
    const ox = m.get(x);
    const oy = m.get(y);
    if (ox === undefined && oy === undefined) {
      return 0;
    }
    if (ox === undefined) {
      return 1;
    }
    if (oy === undefined) {
      return -1;
    }
    if (ox !== oy) {
      return ox - oy;
    }
    return 0;
  });
}

/**
 * The id in `ids` with the **smallest** order value, or `null` if `ids` is empty or
 * no id appears in the map.
 */
export function minByOrder<Id extends string>(
  m: ReadonlyMap<Id, number>,
  ids: readonly Id[],
): Id | null {
  let best: Id | null = null;
  let bestV = 0;
  for (const id of ids) {
    const v = m.get(id);
    if (v === undefined) {
      continue;
    }
    if (best === null || v < bestV) {
      bestV = v;
      best = id;
    }
  }
  return best;
}

/**
 * The id in `ids` with the **largest** order value, or `null` if `ids` is empty or
 * no id appears in the map.
 */
export function maxByOrder<Id extends string>(
  m: ReadonlyMap<Id, number>,
  ids: readonly Id[],
): Id | null {
  let best: Id | null = null;
  let bestV = 0;
  for (const id of ids) {
    const v = m.get(id);
    if (v === undefined) {
      continue;
    }
    if (best === null || v > bestV) {
      bestV = v;
      best = id;
    }
  }
  return best;
}

/**
 * When `requireUniqueOrder` is true, reports one error per colliding pair (deterministic: first
 * by scan order, second by id) for duplicate numeric levels.
 * When false, the map is always considered valid.
 */
export function validateIdToOrder<Id extends string>(
  m: ReadonlyMap<Id, number>,
  options: { requireUniqueOrder: boolean },
): OrderedLevelError[] {
  if (!options.requireUniqueOrder) {
    return [];
  }
  const errors: OrderedLevelError[] = [];
  const byOrder = new Map<number, Id>();
  for (const [id, order] of m) {
    const existing = byOrder.get(order);
    if (existing !== undefined) {
      // Stable pair order: existing first, new id second
      errors.push({
        kind: 'duplicate_order',
        order,
        firstId: existing,
        secondId: id,
      });
    } else {
      byOrder.set(order, id);
    }
  }
  return errors;
}

/**
 * `true` if {@link validateIdToOrder} would return an empty list with the same options.
 */
export function isValidIdToOrder<Id extends string>(
  m: ReadonlyMap<Id, number>,
  options: { requireUniqueOrder: boolean },
): boolean {
  return validateIdToOrder(m, options).length === 0;
}
