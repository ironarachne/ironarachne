/**
 * String identifiers for nodes in a hierarchy. Keep serializable;
 * call keys may use branded stricter types in domain code.
 */
export type HierarchyId = string;

/**
 * A parent-forest: each node appears exactly once; each has at most one
 * parent (value is null for roots of trees in the forest).
 */
export type ChildToParent<Id extends string = HierarchyId> = ReadonlyMap<Id, Id | null>;

export type ParentForestError =
  | { kind: 'unknown_parent'; childId: string; parentId: string }
  | { kind: 'cycle'; nodes: string[] };

/** Tri-state from `compareByOrder` in `ordered_levels`. */
export type CompareOrder = -1 | 0 | 1;

export type OrderedLevelError = {
  kind: 'duplicate_order';
  order: number;
  firstId: string;
  secondId: string;
};

export type IdToOrder<Id extends string = HierarchyId> = ReadonlyMap<Id, number>;
