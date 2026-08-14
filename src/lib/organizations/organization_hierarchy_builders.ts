import { childToParentFromEntries } from '$lib/hierarchy';
import type { ChildToParent, HierarchyId } from '$lib/hierarchy';
import type { OrganizationHierarchy, RoleId } from './organization_types.js';

type RoleDef = { id: RoleId; roleName: string; order: number };

/**
 * Single-root chain: first role is the root (highest `order`); each next reports to the previous.
 * Larger `order` = higher standing.
 */
export function lineChain(roles: readonly RoleDef[]): OrganizationHierarchy {
  if (roles.length === 0) {
    throw new Error('lineChain requires at least one role');
  }
  const entries: [RoleId, RoleId | null][] = [[roles[0].id, null]];
  for (let i = 1; i < roles.length; i++) {
    entries.push([roles[i].id, roles[i - 1].id as HierarchyId]);
  }
  const childToParent = childToParentFromEntries(entries) as ChildToParent<RoleId>;
  const idToOrder: Map<RoleId, number> = new Map(roles.map((r) => [r.id, r.order]));
  const roleById = new Map(roles.map((r) => [r.id, { roleName: r.roleName }]));
  return {
    childToParent,
    idToOrder,
    roleById,
  };
}

/**
 * A flat org: all roles are roots in separate trees (a forest) with the same parent null.
 * Use when every role is a peer under an abstract "organization" and order distinguishes rank.
 * Actually for a "flat" single leader + everyone else as peers, use two role ids: leader, member
 * with one root leader and N members? Simpler: one root (leader) and one other rank "member" as child? That's not flat.
 * "Flat" = every node has parent null: multiple trees. then order distinguishes across forest.
 * validateChildToParent allows multiple roots. So roles all have parent null - each is own tree.
 */
export function flatForest(roles: readonly RoleDef[]): OrganizationHierarchy {
  const entries: [RoleId, RoleId | null][] = roles.map((r) => [r.id, null]);
  const childToParent = childToParentFromEntries(entries) as ChildToParent<RoleId>;
  const idToOrder: Map<RoleId, number> = new Map(roles.map((r) => [r.id, r.order]));
  const roleById = new Map(roles.map((r) => [r.id, { roleName: r.roleName }]));
  return { childToParent, idToOrder, roleById };
}
