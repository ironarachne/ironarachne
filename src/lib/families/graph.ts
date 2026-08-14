import type { Family } from './family_types';
import type { Character } from '$lib/characters';
import { create } from 'xmlbuilder2';

export interface FamilyGraph {
  nodes: FamilyGraphNode[];
  edges: FamilyGraphEdge[];
}

export interface FamilyGraphNode {
  id: string;
  label: string;
  generation: number;
  x: number;
  y: number;
  width: number;
  height: number;
  // Undefined when the node's id has no matching family member, the same case the `label`
  // fallback above covers.
  data: Character | undefined;
}

export interface FamilyGraphEdge {
  source: string;
  target: string;
  type: 'spouse' | 'parent';
}

const MIN_NODE_WIDTH = 60;
const NODE_LABEL_PADDING = 20;
const NODE_HEIGHT = 60;
const X_GAP = 20;
const Y_GAP = 100;
const JITTER_STEP = 20;

/**
 * The family's relationships rearranged for traversal: who each person's children and parents
 * are, and who they are married to.
 *
 * `spouseMap` holds one entry per partner pointing at the other, so a lookup works from either
 * side. It assumes monogamy — the data allows more, but a legible tree layout does not.
 */
type FamilyRelations = {
  childrenMap: Map<string, string[]>;
  parentMap: Map<string, string[]>;
  spouseMap: Map<string, string>;
};

function buildFamilyRelations(family: Family): FamilyRelations {
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string[]>();
  const spouseMap = new Map<string, string>();

  for (const rel of family.relationships) {
    if (rel.type.name === 'parent') {
      if (!childrenMap.has(rel.originatorId)) childrenMap.set(rel.originatorId, []);
      childrenMap.get(rel.originatorId)?.push(rel.recipientId);

      if (!parentMap.has(rel.recipientId)) parentMap.set(rel.recipientId, []);
      parentMap.get(rel.recipientId)?.push(rel.originatorId);
    } else if (rel.type.name === 'spouse') {
      spouseMap.set(rel.originatorId, rel.recipientId);
      spouseMap.set(rel.recipientId, rel.originatorId);
    }
  }

  return { childrenMap, parentMap, spouseMap };
}

/**
 * Everyone the tree can start from: a member with no parents in the family, who is not married
 * into a generation by a partner who does have parents. Those married-in partners are picked up
 * during the walk instead, so that they land in their spouse's generation rather than at the top.
 */
function findRootIds(family: Family, relations: FamilyRelations): string[] {
  const roots: string[] = [];

  for (const member of family.members) {
    if (relations.parentMap.has(member.id)) {
      continue;
    }

    const spouseId = relations.spouseMap.get(member.id);

    if (spouseId && relations.parentMap.has(spouseId)) {
      continue;
    }

    roots.push(member.id);
  }

  return roots;
}

/**
 * Walks down from the founders, numbering each generation. A spouse is pulled into the same
 * generation as the partner who reached them, and their children queue up one generation below.
 */
function assignGenerations(family: Family, relations: FamilyRelations): Map<string, number> {
  const generationMap = new Map<string, number>();
  const processed = new Set<string>();
  const queue: { id: string; gen: number }[] = findRootIds(family, relations).map((id) => ({
    id,
    gen: 0,
  }));

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (processed.has(current.id)) continue;

    processed.add(current.id);
    generationMap.set(current.id, current.gen);

    const spouseId = relations.spouseMap.get(current.id);
    if (spouseId && !processed.has(spouseId)) {
      generationMap.set(spouseId, current.gen);
      processed.add(spouseId);

      const spouseChildren = relations.childrenMap.get(spouseId) || [];
      for (const childId of spouseChildren) {
        queue.push({ id: childId, gen: current.gen + 1 });
      }
    }

    const children = relations.childrenMap.get(current.id) || [];
    for (const childId of children) {
      queue.push({ id: childId, gen: current.gen + 1 });
    }
  }

  return generationMap;
}

/**
 * The ids of each generation, indexed by generation number. Sparse: a generation nobody was
 * assigned to leaves a hole, and every caller skips holes rather than filling them.
 */
function groupIntoLevels(generationMap: Map<string, number>): string[][] {
  const levels: string[][] = [];

  generationMap.forEach((gen, id) => {
    if (!levels[gen]) levels[gen] = [];
    levels[gen].push(id);
  });

  return levels;
}

/** The parents a person is positioned under — their own, or their spouse's if they married in. */
function positioningParents(id: string, relations: FamilyRelations): string[] {
  const parents = relations.parentMap.get(id) || [];

  if (parents.length > 0) {
    return parents;
  }

  const spouseId = relations.spouseMap.get(id);

  return spouseId ? relations.parentMap.get(spouseId) || [] : [];
}

/**
 * Orders one generation left to right: children follow the order of their parents in the
 * generation above, and each person is immediately followed by their spouse.
 *
 * This is a naive heuristic — it does not attempt to minimise crossings — but it keeps couples
 * together and siblings near their parents, which is most of what makes a tree readable.
 */
function orderLevel(
  levelIds: string[],
  previousLevel: string[] | undefined,
  relations: FamilyRelations,
  generationMap: Map<string, number>,
  generation: number,
): string[] {
  const ordered = [...levelIds];

  if (previousLevel) {
    ordered.sort((a, b) => {
      const idxA = getAvgParentIndex(positioningParents(a, relations), previousLevel);
      const idxB = getAvgParentIndex(positioningParents(b, relations), previousLevel);

      return idxA - idxB;
    });
  }

  const withSpousesAdjacent: string[] = [];
  const seenInLevel = new Set<string>();

  for (const id of ordered) {
    if (seenInLevel.has(id)) continue;
    withSpousesAdjacent.push(id);
    seenInLevel.add(id);

    const spouseId = relations.spouseMap.get(id);
    if (spouseId && generationMap.get(spouseId) === generation && !seenInLevel.has(spouseId)) {
      withSpousesAdjacent.push(spouseId);
      seenInLevel.add(spouseId);
    }
  }

  return withSpousesAdjacent;
}

function orderLevels(
  levels: string[][],
  relations: FamilyRelations,
  generationMap: Map<string, number>,
): string[][] {
  const ordered: string[][] = [];

  for (let g = 0; g < levels.length; g++) {
    if (!levels[g]) continue;

    ordered[g] = orderLevel(
      levels[g],
      g > 0 ? ordered[g - 1] : undefined,
      relations,
      generationMap,
      g,
    );
  }

  return ordered;
}

/**
 * Wide enough for the longest label any node will carry. `getFamilyTreeSVG` draws the first
 * name at font size 12 and the last name and gender symbol beneath it at 10, so both lines are
 * measured.
 */
function nodeWidthFor(family: Family): number {
  let maxLabelWidth = 0;

  for (const member of family.members) {
    const firstNameWidth = estimateTextWidth(member.firstName, 12);
    const symbol = getGenderSymbol(member.gender.name);
    const lastNameWidth = estimateTextWidth(member.lastName + ' ' + symbol, 10);

    if (firstNameWidth > maxLabelWidth) maxLabelWidth = firstNameWidth;
    if (lastNameWidth > maxLabelWidth) maxLabelWidth = lastNameWidth;
  }

  return Math.max(MIN_NODE_WIDTH, maxLabelWidth + NODE_LABEL_PADDING);
}

/**
 * Places each generation on its own row, left to right in the order `orderLevels` settled on.
 *
 * Siblings by the same couple share a small vertical offset, cycling through three of them, so
 * that the lines dropping into a crowded generation do not all land on one horizontal line.
 */
function layoutNodes(
  family: Family,
  levels: string[][],
  relations: FamilyRelations,
  nodeWidth: number,
): FamilyGraphNode[] {
  const nodes: FamilyGraphNode[] = [];

  levels.forEach((levelIds, genIndex) => {
    if (!levelIds) return;
    let runningX = 0;

    const coupleJitterMap = new Map<string, number>();
    let nextJitter = 0;

    for (const id of levelIds) {
      const member = family.members.find((m) => m.id === id);
      const parents = positioningParents(id, relations);

      let jitter = 0;

      if (parents.length > 0) {
        const parentsKey = parents.slice().sort().join('-');
        if (!coupleJitterMap.has(parentsKey)) {
          coupleJitterMap.set(parentsKey, nextJitter);
          nextJitter = (nextJitter + JITTER_STEP) % (JITTER_STEP * 3);
        }
        jitter = coupleJitterMap.get(parentsKey) || 0;
      }

      nodes.push({
        id: id,
        label: member
          ? `${member.firstName}\n${member.lastName} ${getGenderSymbol(member.gender.name)}`
          : 'Unknown',
        generation: genIndex,
        x: runningX,
        y: genIndex * (NODE_HEIGHT + Y_GAP) + jitter,
        width: nodeWidth,
        height: NODE_HEIGHT,
        data: member,
      });
      runningX += nodeWidth + X_GAP;
    }
  });

  return nodes;
}

/**
 * One edge per marriage and one per parent-child link.
 *
 * A marriage appears twice in `spouseMap`, once from each side; taking only the pair where the
 * source id sorts first keeps a single edge. Parent-child links stay as they are in the data —
 * whether a renderer drops the line from the couple or from each parent is its own decision.
 */
function buildEdges(relations: FamilyRelations): FamilyGraphEdge[] {
  const edges: FamilyGraphEdge[] = [];

  for (const [a, b] of relations.spouseMap.entries()) {
    if (a < b) {
      edges.push({ source: a, target: b, type: 'spouse' });
    }
  }

  relations.childrenMap.forEach((children, parentId) => {
    for (const childId of children) {
      edges.push({ source: parentId, target: childId, type: 'parent' });
    }
  });

  return edges;
}

export function getFamilyGraph(family: Family): FamilyGraph {
  const relations = buildFamilyRelations(family);
  const generationMap = assignGenerations(family, relations);
  const levels = orderLevels(groupIntoLevels(generationMap), relations, generationMap);

  return {
    nodes: layoutNodes(family, levels, relations, nodeWidthFor(family)),
    edges: buildEdges(relations),
  };
}

function getAvgParentIndex(parentIds: string[], prevLevel: string[]): number {
  if (parentIds.length === 0) return 0;
  let sum = 0;
  let count = 0;
  for (const pid of parentIds) {
    const idx = prevLevel.indexOf(pid);
    if (idx !== -1) {
      sum += idx;
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}

function getGenderSymbol(gender: string): string {
  if (gender === 'male') return '♂';
  if (gender === 'female') return '♀';
  return '⚥';
}

function estimateTextWidth(text: string, fontSize: number): number {
  // Crude estimation: Average 0.6em per char?
  // Sans-serif variable width...
  // Let's go with 0.6 * fontSize * length;
  return text.length * fontSize * 0.7;
}

export function getFamilyTreeSVG(family: Family): string {
  const graph = getFamilyGraph(family);

  // Bounds
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  graph.nodes.forEach((n) => {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  });

  const padding = 20;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  const root = create().ele('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: `${minX - padding} ${minY - padding} ${width} ${height}`,
    width: width,
    height: height,
    style: 'font-family: sans-serif;',
  });

  // Draw Edges
  // Handle Spouse edges (Horizontal line between centers)
  // Handle Parent edges (Vertical from bottom of parent to top of child)
  // Ideally, for couple -> child, we find the center of the couple.

  // Helper to find node
  const getNode = (id: string) => graph.nodes.find((n) => n.id === id);

  // Filter edges
  const spouseEdges = graph.edges.filter((e) => e.type === 'spouse');
  const parentEdges = graph.edges.filter((e) => e.type === 'parent');

  // Draw Spouse Edges
  for (const edge of spouseEdges) {
    const s = getNode(edge.source);
    const t = getNode(edge.target);
    if (s && t) {
      const sx = s.x + s.width / 2;
      const sy = s.y + s.height / 2;
      const tx = t.x + t.width / 2;
      const ty = t.y + t.height / 2;

      root.ele('line', {
        x1: sx,
        y1: sy,
        x2: tx,
        y2: ty,
        stroke: 'black',
        'stroke-width': 2,
      });
    }
  }

  // Draw Parent Edges efficiently
  // Group children by parents to draw nice forks?
  // Simple implementation: Line from bottom center of parent to top center of child.
  // Improvement: If parents are married, draw from the middle of the spouse line.

  // Group by child to find all parents
  const childParentsMap = new Map<string, string[]>();
  for (const edge of parentEdges) {
    if (!childParentsMap.has(edge.target)) childParentsMap.set(edge.target, []);
    childParentsMap.get(edge.target)?.push(edge.source);
  }

  childParentsMap.forEach((parents, childId) => {
    const child = getNode(childId);
    if (!child) return;

    let startX = 0;
    let startY = 0;

    if (parents.length === 1) {
      const p = getNode(parents[0]);
      if (p) {
        startX = p.x + p.width / 2;
        startY = p.y + p.height;
      }
    } else if (parents.length >= 2) {
      // Find separation between parents (assuming spouses)
      const p1 = getNode(parents[0]);
      const p2 = getNode(parents[1]);
      if (p1 && p2) {
        startX = (p1.x + p1.width / 2 + p2.x + p2.width / 2) / 2;
        startY = p1.y + p1.height / 2; // Start from middle of them (spouse line height)
      }
    }

    // Draw line
    // Simple straight line or elbow? Elbow is better.
    // Start -> Turn -> Child Top
    const childTopX = child.x + child.width / 2;
    const childTopY = child.y;

    const midY = (startY + childTopY) / 2;

    root.ele('path', {
      d: `M ${startX} ${startY} V ${midY} H ${childTopX} V ${childTopY}`,
      stroke: 'black',
      'stroke-width': 1,
      fill: 'none',
    });
  });

  // Draw Nodes
  for (const node of graph.nodes) {
    const g = root.ele('g', { transform: `translate(${node.x}, ${node.y})` });

    g.ele('rect', {
      width: node.width,
      height: node.height,
      fill: 'white',
      stroke: 'black',
      rx: 5,
    });

    const lines = node.label.split('\n');
    g.ele('text', {
      x: node.width / 2,
      y: node.height / 2 - 5,
      'text-anchor': 'middle',
      'font-size': 12,
    }).txt(lines[0]);

    if (lines[1]) {
      g.ele('text', {
        x: node.width / 2,
        y: node.height / 2 + 15,
        'text-anchor': 'middle',
        'font-size': 10,
      }).txt(lines[1]);
    }
  }

  return root.end({ prettyPrint: true });
}
