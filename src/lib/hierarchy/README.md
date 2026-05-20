# Hierarchy library

This library models **abstract hierarchies** for world-building: who reports to whom, who swears fealty to whom, or how **ordered levels** (tiers, prestige bands) compare. It only deals with **structure and numbers**—names, titles, and other domain data live in your own types alongside these maps.

There are two complementary pieces:

1. **Parent forest** — a `Map` from each node id to its parent id, or `null` for a root. That is one or more **trees** (a forest): at most one parent per node, no cycles.
2. **Ordered levels** — a `Map` from each id to a **number**. Larger numbers mean **higher** standing when you compare with `compareByOrder` and friends.

## Features

- **Build and validate** a parent map (`validateChildToParent`, `isValidParentForest`); errors include unknown parents and cycles.
- **Query** a forest: roots, strict ancestors, depth, whether one node is strictly above another, descendants (BFS), and lowest common ancestor in one tree.
- **Compare, sort, and extrema** for numeric levels (`compareByOrder`, `sortIdsByOrder`, `minByOrder`, `maxByOrder`).
- **Optional** uniqueness of level numbers (`validateIdToOrder` with `requireUniqueOrder: true`) for strict tiers, or allow ties for shared “bands.”

## What is out of scope

This library does **not** model DAGs (multiple parents per node), lattices, or metadata on nodes. It is not tied to organizations, realms, or cultures; those can use these primitives in a later layer.

## Usage

### Importing

```typescript
import {
  childToParentFromEntries,
  validateChildToParent,
  getRoots,
  listAncestors,
  depth,
  listDescendants,
  lowestCommonAncestor,
  compareByOrder,
  sortIdsByOrder,
  validateIdToOrder,
} from '$lib/hierarchy';
```

### Parent forest

Every **node** that appears in the structure must be a **key** in the map. The value is that node’s parent id, or `null` if it is a **root** of a tree in the forest.

```typescript
const childToParent = childToParentFromEntries<string>([
  ['knight', 'baron'],
  ['baron', 'duke'],
  ['duke', null], // root of this tree
  ['commoner', null], // second tree in the same forest
]);

const errors = validateChildToParent(childToParent);
if (errors.length > 0) {
  // e.g. { kind: 'unknown_parent', childId, parentId }
  // e.g. { kind: 'cycle', nodes: [...] }
} else {
  getRoots(childToParent); // ['duke', 'commoner'] (order not guaranteed)
  listAncestors(childToParent, 'knight'); // ['baron', 'duke'] — not including 'knight'
  depth(childToParent, 'knight'); // 2
  listDescendants(childToParent, 'duke'); // nodes under the duke, BFS
  lowestCommonAncestor(childToParent, 'knight', 'baron'); // 'baron'
}
```

If any non-null `parent` id is not itself a key, validation returns **`unknown_parent`** errors and does **not** run the cycle check until those are fixed.

### Ordered levels

Use a second map for **numeric** rank or prestige. **Larger** values mean **higher** standing.

```typescript
const idToOrder = new Map<string, number>([
  ['peasant', 0],
  ['guild_member', 1],
  ['noble', 2],
]);

compareByOrder(idToOrder, 'peasant', 'noble'); // -1
sortIdsByOrder(['noble', 'peasant', 'guild_member'], idToOrder); // low → high by number

// Strict tiers: no two ids may share the same number
const strictErrors = validateIdToOrder(idToOrder, { requireUniqueOrder: true });

// Allow multiple ids in the same band
const bandErrors = validateIdToOrder(idToOrder, { requireUniqueOrder: false }); // always []
```

`sortIdsByOrder` places ids that are **missing** from the map at the **end** (after known ids), preserving their relative order among each other.

## Data shapes (types)

- **`ChildToParent`**: `ReadonlyMap<Id, Id | null>` — the parent-forest model.
- **`IdToOrder`**: `ReadonlyMap<Id, number>` — the ordered-level model.
- **Errors**: `ParentForestError` and `OrderedLevelError` (see `hierarchy_types.ts`).

In application code, node ids are usually strings (`HierarchyId`); you can use narrower string union or branded types for your own ids.
