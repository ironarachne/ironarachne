import type { Family } from './family_types';
import type { Character } from '$lib/characters/character_types';
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

export function getFamilyGraph(family: Family): FamilyGraph {
  const nodes: FamilyGraphNode[] = [];
  const edges: FamilyGraphEdge[] = [];
  const generationMap = new Map<string, number>();

  // Identify generations
  // Start with members who have no parents in the family (Founders/Spouses who married in)
  // Actually, getting generations is tricky with spouses.
  // Let's assume the founder is generation 0.
  // If we have parent pointers, we can do it.
  // Family structure has relationships: 'parent' -> originator is parent, recipient is child.

  // Build adjacency for traversal
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string[]>();
  const spouseMap = new Map<string, string>(); // Assume monogamy for simple visualization layout, though data allows multiple

  for (const rel of family.relationships) {
    if (rel.type.name === 'parent') {
      if (!childrenMap.has(rel.originatorId)) childrenMap.set(rel.originatorId, []);
      childrenMap.get(rel.originatorId)?.push(rel.recipientId);

      if (!parentMap.has(rel.recipientId)) parentMap.set(rel.recipientId, []);
      parentMap.get(rel.recipientId)?.push(rel.originatorId);
    } else if (rel.type.name === 'spouse') {
      // Store one way or handle reciprocity
      spouseMap.set(rel.originatorId, rel.recipientId);
      spouseMap.set(rel.recipientId, rel.originatorId);
    }
  }

  // Assign generations via BFS/Recurse
  // Roots are those with no parents in the map OR those whose parents are not in the family (shouldn't happen for internal graph logic except for founders/outsiders)
  // Actually, founders have no parents in the family.

  const processed = new Set<string>();
  const queue: { id: string; gen: number }[] = [];

  // Find roots
  for (const member of family.members) {
    if (!parentMap.has(member.id)) {
      // Check if this person is a spouse of someone who HAS parents?
      // If they are married to someone with parents, they are in that generation.
      // If neither has parents, they are Gen 0 (Founders).

      const spouseId = spouseMap.get(member.id);
      if (spouseId && parentMap.has(spouseId)) {
        // Will be processed when spouse is processed?
        // We need to be careful not to miss them if we only start queue with "no parents".
        // We can handle "spouse matching" during traversal.
        continue;
      }
      queue.push({ id: member.id, gen: 0 });
    }
  }

  // Process queue
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (processed.has(current.id)) continue;

    processed.add(current.id);
    generationMap.set(current.id, current.gen);

    // Process spouse - Same generation
    const spouseId = spouseMap.get(current.id);
    if (spouseId && !processed.has(spouseId)) {
      generationMap.set(spouseId, current.gen);
      processed.add(spouseId);
      // Process spouse's children? (Should be same as current's usually)
      const spouseChildren = childrenMap.get(spouseId) || [];
      for (const childId of spouseChildren) {
        queue.push({ id: childId, gen: current.gen + 1 });
      }
    }

    // Process children
    const children = childrenMap.get(current.id) || [];
    for (const childId of children) {
      queue.push({ id: childId, gen: current.gen + 1 });
    }
  }

  // Basic Layout Calculation
  // Group by generation
  const levels: string[][] = [];
  generationMap.forEach((gen, id) => {
    if (!levels[gen]) levels[gen] = [];
    levels[gen].push(id);
  });

  // Sort levels to put spouses together and siblings together
  // This is a naive heuristic sort.
  for (let g = 0; g < levels.length; g++) {
    if (!levels[g]) continue;

    // If we are deeper than 0, try to sort by parent's X position (or parent's index in previous level)
    if (g > 0 && levels[g - 1]) {
      levels[g].sort((a, b) => {
        let parentsA = parentMap.get(a) || [];
        let parentsB = parentMap.get(b) || [];

        if (parentsA.length === 0) {
          const spouseA = spouseMap.get(a);
          if (spouseA) parentsA = parentMap.get(spouseA) || [];
        }
        if (parentsB.length === 0) {
          const spouseB = spouseMap.get(b);
          if (spouseB) parentsB = parentMap.get(spouseB) || [];
        }

        // Get avg parent index
        const idxA = getAvgParentIndex(parentsA, levels[g - 1]);
        const idxB = getAvgParentIndex(parentsB, levels[g - 1]);
        return idxA - idxB;
      });
    }

    // Ensure spouses are adjacent
    // Iterate and pull spouse next to person
    const sortedLevel: string[] = [];
    const seenInLevel = new Set<string>();

    for (const id of levels[g]) {
      if (seenInLevel.has(id)) continue;
      sortedLevel.push(id);
      seenInLevel.add(id);

      const spouseId = spouseMap.get(id);
      if (spouseId && generationMap.get(spouseId) === g && !seenInLevel.has(spouseId)) {
        sortedLevel.push(spouseId);
        seenInLevel.add(spouseId);
      }
    }
    levels[g] = sortedLevel;
  }

  // Assign Coordinates
  let maxLabelWidth = 0;
  for (const member of family.members) {
    const w1 = estimateTextWidth(member.firstName, 12);
    const symbol = getGenderSymbol(member.gender.name);
    const w2 = estimateTextWidth(member.lastName + ' ' + symbol, 10);
    // Wait, looking at getFamilyTreeSVG:
    // Line 0 (firstName) is size 12
    // Line 1 (lastName) is size 10
    if (w1 > maxLabelWidth) maxLabelWidth = w1;
    if (w2 > maxLabelWidth) maxLabelWidth = w2;
  }

  const NODE_WIDTH = Math.max(60, maxLabelWidth + 20); // Min width 60, padding 20
  const NODE_HEIGHT = 60;
  const X_GAP = 20;
  const Y_GAP = 100;
  const JITTER_STEP = 20;

  levels.forEach((levelIds, genIndex) => {
    if (!levelIds) return;
    let runningX = 0;

    const coupleJitterMap = new Map<string, number>();
    let nextJitter = 0;

    for (const id of levelIds) {
      const member = family.members.find((m) => m.id === id);

      let jitter = 0;
      let parents = parentMap.get(id) || [];
      if (parents.length === 0) {
        const spouseId = spouseMap.get(id);
        if (spouseId) {
          parents = parentMap.get(spouseId) || [];
        }
      }

      if (parents && parents.length > 0) {
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
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        data: member,
      });
      runningX += NODE_WIDTH + X_GAP;
    }
  });

  // Create Edges
  // Spouse Edges
  for (const [a, b] of spouseMap.entries()) {
    // Avoid duplicates (a->b, b->a)
    if (a < b) {
      edges.push({ source: a, target: b, type: 'spouse' });
    }
  }

  // Parent-Child Edges
  // Visual improvement: Connect Couple to Child, rather than Parent to Child?
  // In family trees, usually line drops from the "Spouse Link" to the child.
  // But graph data structure usually just has nodes/edges. Visualization handles drawing.
  // Using simple parent->child edges for the graph data.

  childrenMap.forEach((children, parentId) => {
    for (const childId of children) {
      edges.push({ source: parentId, target: childId, type: 'parent' });
    }
  });

  return { nodes, edges };
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
