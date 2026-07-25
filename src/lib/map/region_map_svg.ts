import type { MapEdge, MapNode, RegionMap } from './map_graph.js';
import type Vertex from '../geometry/vertex.js';
import { buildRoadCentroidPolylines } from './road_polylines.js';

export type RegionMapSvgSettlement = {
  mapNodeId?: number;
  isCapital?: boolean;
};

/** Default max pixel size; aspect ratio of map.width:map.height is preserved (fits inside this box). */
const DEFAULT_SVG_MAX_WIDTH = 900;
const DEFAULT_SVG_MAX_HEIGHT = 600;

const PARCHMENT_FILL = '#ede4d3';

let oceanCoastInnerClipSerial = 0;
let riverTaperMaskSerial = 0;

export type RegionMapSvgOptions = {
  title?: string;
  settlements?: RegionMapSvgSettlement[];
};

type BiomeVisual = {
  symbol: string;
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isWaterNode(node: MapNode): boolean {
  return node.isOcean || node.isWater;
}

function polygonArea(vertices: Vertex[]): number {
  if (vertices.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    sum += vertices[i].x * vertices[j].y;
    sum -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(sum / 2);
}

function polygonToPathD(vertices: Vertex[]): string {
  if (vertices.length === 0) return '';
  const first = vertices[0];
  const parts = [`M ${first.x} ${first.y}`];
  for (let i = 1; i < vertices.length; i++) {
    parts.push(`L ${vertices[i].x} ${vertices[i].y}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

function mapHasOcean(map: RegionMap): boolean {
  return map.nodes.some((n) => n.isOcean);
}

/** Lighten a `#rrggbb` color toward white (t in 0..1). */
function mixHexWithWhite(hex: string, t: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const L = (x: number) => Math.min(255, Math.round(x + (255 - x) * t));
  const rr = L(r).toString(16).padStart(2, '0');
  const gg = L(g).toString(16).padStart(2, '0');
  const bb = L(b).toString(16).padStart(2, '0');
  return `#${rr}${gg}${bb}`;
}

/** Darken a `#rrggbb` color toward black (t in 0..1). */
function mixHexWithBlack(hex: string, t: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const L = (x: number) => Math.max(0, Math.round(x * (1 - t)));
  const rr = L(r).toString(16).padStart(2, '0');
  const gg = L(g).toString(16).padStart(2, '0');
  const bb = L(b).toString(16).padStart(2, '0');
  return `#${rr}${gg}${bb}`;
}

/** Deterministic [0, 1) — stable SVG output per edge geometry. */
function hash01(a: number, b: number, c: number): number {
  const t = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453123;
  return t - Math.floor(t);
}

/** Map u in [0,1) to [-1, 1]. */
function toBipolar(u: number): number {
  return u * 2 - 1;
}

/** Extra points along a Voronoi boundary chord; Voronoi corners stay fixed — only these move. */
function interiorPointsAlongBoundaryChord(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  salt: number,
): Vertex[] {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 1e-10) return [];

  const nx = -dy / len;
  const ny = dx / len;
  const count = Math.max(1, Math.min(4, Math.floor(len / 2.1)));
  const out: Vertex[] = [];

  for (let j = 1; j <= count; j++) {
    const t = j / (count + 1);
    const bx = x0 + dx * t;
    const by = y0 + dy * t;
    const h = hash01(salt, j * 2.718281828, t * 3.14159265);
    const ampScale = 0.012 + hash01(salt * 1.3, j, len) * 0.018;
    const off = toBipolar(h) * len * ampScale;
    out.push({ x: bx + nx * off, y: by + ny * off });
  }
  return out;
}

/** Open path: cubic Beziers through points (Catmull-Rom → Bézier, /6 tension). */
function openRoadPolylinePathD(vertices: Vertex[]): string {
  if (vertices.length === 0) return '';
  const first = vertices[0]!;
  const bits = [`M ${first.x} ${first.y}`];
  for (let i = 1; i < vertices.length; i++) {
    const v = vertices[i]!;
    bits.push(`L ${v.x} ${v.y}`);
  }
  return bits.join(' ');
}

function openCurvePathDThroughPoints(vertices: Vertex[]): string {
  const n = vertices.length;
  if (n === 0) return '';
  if (n === 1) {
    const p = vertices[0]!;
    return `M ${p.x} ${p.y}`;
  }
  const first = vertices[0]!;
  const bits = [`M ${first.x} ${first.y}`];
  for (let i = 0; i < n - 1; i++) {
    const p0 = i === 0 ? first : vertices[i - 1]!;
    const p1 = vertices[i]!;
    const p2 = vertices[i + 1]!;
    const p3 = i + 2 < n ? vertices[i + 2]! : p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    bits.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`);
  }
  return bits.join(' ');
}

/**
 * One Voronoi river edge: halve twice → four segments (interior knots at ¼, ½, ¾).
 * Only those interior points are nudged, perpendicular to the original chord; endpoints stay fixed.
 */
function subdivideRiverChordJittered(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  salt: number,
): Vertex[] {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 1e-10) {
    return [
      { x: x0, y: y0 },
      { x: x1, y: y1 },
    ];
  }
  const nx = -dy / len;
  const ny = dx / len;
  const verts: Vertex[] = [{ x: x0, y: y0 }];
  for (let k = 1; k <= 3; k++) {
    const t = k / 4;
    const bx = x0 + dx * t;
    const by = y0 + dy * t;
    const h = hash01(salt, k * 2.718281828, t * 3.14159265);
    const ampScale = 0.022 + hash01(salt * 1.3, k, len) * 0.034;
    const off = toBipolar(h) * len * ampScale;
    verts.push({ x: bx + nx * off, y: by + ny * off });
  }
  verts.push({ x: x1, y: y1 });
  return verts;
}

type RiverCornerIncidence = { edge: MapEdge; other: number };

function buildRiverCornerAdjacency(map: RegionMap): Map<number, RiverCornerIncidence[]> {
  const adj = new Map<number, RiverCornerIncidence[]>();
  for (const e of map.edges) {
    if (e.river <= 0) continue;
    const add = (a: number, b: number) => {
      if (!adj.has(a)) adj.set(a, []);
      adj.get(a)!.push({ edge: e, other: b });
    };
    add(e.v0, e.v1);
    add(e.v1, e.v0);
  }
  return adj;
}

function riverIncidentsSorted(
  adj: Map<number, RiverCornerIncidence[]>,
  corner: number,
  pred: (it: RiverCornerIncidence) => boolean,
): RiverCornerIncidence[] {
  return (adj.get(corner) ?? []).filter(pred).sort((a, b) => a.edge.id - b.edge.id);
}

function extendRiverChainLeft(
  adj: Map<number, RiverCornerIncidence[]>,
  used: Set<number>,
  startCorner: number,
  excludeEdge: MapEdge,
): MapEdge[] {
  const out: MapEdge[] = [];
  let c = startCorner;
  let exclude: MapEdge | null = excludeEdge;
  while (true) {
    const opts = riverIncidentsSorted(
      adj,
      c,
      (it) => !used.has(it.edge.id) && (exclude === null || it.edge.id !== exclude.id),
    );
    if (opts.length !== 1) break;
    const { edge, other } = opts[0]!;
    out.unshift(edge);
    used.add(edge.id);
    c = other;
    exclude = null;
  }
  return out;
}

function extendRiverChainRight(
  adj: Map<number, RiverCornerIncidence[]>,
  used: Set<number>,
  startCorner: number,
): MapEdge[] {
  const out: MapEdge[] = [];
  let c = startCorner;
  while (true) {
    const opts = riverIncidentsSorted(adj, c, (it) => !used.has(it.edge.id));
    if (opts.length !== 1) break;
    const { edge, other } = opts[0]!;
    out.push(edge);
    used.add(edge.id);
    c = other;
  }
  return out;
}

function extractOrderedRiverChain(
  adj: Map<number, RiverCornerIncidence[]>,
  used: Set<number>,
  seed: MapEdge,
): MapEdge[] {
  const left = extendRiverChainLeft(adj, used, seed.v0, seed);
  used.add(seed.id);
  const right = extendRiverChainRight(adj, used, seed.v1);
  return [...left, seed, ...right];
}

function listOrderedRiverChains(map: RegionMap): MapEdge[][] {
  const adj = buildRiverCornerAdjacency(map);
  const used = new Set<number>();
  const chains: MapEdge[][] = [];
  for (const e of map.edges) {
    if (e.river <= 0 || used.has(e.id)) continue;
    chains.push(extractOrderedRiverChain(adj, used, e));
  }
  return chains;
}

function sharedMapEdgeCorner(a: MapEdge, b: MapEdge): number | null {
  if (a.v0 === b.v0 || a.v0 === b.v1) return a.v0;
  if (a.v1 === b.v0 || a.v1 === b.v1) return a.v1;
  return null;
}

/** Chain order is upstream-to-downstream along the extracted path; corners stay fixed between edges. */
function riverChainToSubdividedVertices(map: RegionMap, chain: MapEdge[]): Vertex[] | null {
  if (chain.length === 0) return null;
  const all: Vertex[] = [];

  for (let i = 0; i < chain.length; i++) {
    const e = chain[i]!;
    const c0 = map.corners[e.v0];
    const c1 = map.corners[e.v1];
    if (!c0 || !c1) return null;

    let fromC: number;
    let toC: number;
    if (i === 0) {
      if (chain.length === 1) {
        fromC = e.v0;
        toC = e.v1;
      } else {
        const sh = sharedMapEdgeCorner(chain[0]!, chain[1]!)!;
        fromC = sh === e.v0 ? e.v1 : e.v0;
        toC = sh;
      }
    } else {
      const sh = sharedMapEdgeCorner(chain[i - 1]!, e)!;
      fromC = sh;
      toC = sh === e.v0 ? e.v1 : e.v0;
    }

    const pFrom = map.corners[fromC]!.point;
    const pTo = map.corners[toC]!.point;
    const vLo = Math.min(fromC, toC);
    const vHi = Math.max(fromC, toC);
    const salt = vLo * 49999 + vHi * 1103515245 + e.id * 1009;
    const seg = subdivideRiverChordJittered(pFrom.x, pFrom.y, pTo.x, pTo.y, salt);

    if (i === 0) {
      all.push(...seg);
    } else {
      all.push(...seg.slice(1));
    }
  }

  return all;
}

/** Ordered corner ids from Hierholzer (last may repeat first). */
function cornerLoopToVertices(map: RegionMap, loop: number[]): Vertex[] {
  const trimmed =
    loop.length > 1 && loop[0] === loop[loop.length - 1] ? loop.slice(0, -1) : [...loop];
  const n = trimmed.length;
  if (n < 3) return [];

  const pts: Vertex[] = [];
  for (let i = 0; i < n; i++) {
    const ca = trimmed[i]!;
    const cb = trimmed[(i + 1) % n]!;
    const pa = map.corners[ca]?.point;
    const pb = map.corners[cb]?.point;
    if (!pa || !pb) return [];

    if (i === 0) {
      pts.push({ x: pa.x, y: pa.y });
    }
    const salt = ca * 49999 + cb * 1103515245 + i * 1009;
    for (const p of interiorPointsAlongBoundaryChord(pa.x, pa.y, pb.x, pb.y, salt)) {
      pts.push(p);
    }
  }
  return pts;
}

function isComponentBoundaryEdge(edge: MapEdge, component: Set<number>): boolean {
  const in0 = component.has(edge.d0);
  const in1 = edge.d1 !== undefined && component.has(edge.d1);
  if (edge.d1 === undefined) {
    return in0;
  }
  return in0 !== in1;
}

function buildBoundaryAdjacency(map: RegionMap, component: Set<number>): Map<number, number[]> {
  const adj = new Map<number, number[]>();
  const link = (a: number, b: number) => {
    if (!adj.has(a)) adj.set(a, []);
    const list = adj.get(a)!;
    if (!list.includes(b)) list.push(b);
  };

  for (const e of map.edges) {
    if (!isComponentBoundaryEdge(e, component)) continue;
    link(e.v0, e.v1);
    link(e.v1, e.v0);
  }
  return adj;
}

function cloneBoundaryAdjacency(adj: Map<number, number[]>): Map<number, number[]> {
  const rem = new Map<number, number[]>();
  for (const [k, v] of adj) {
    rem.set(k, [...v]);
  }
  return rem;
}

function removeUndirectedBoundaryEdge(rem: Map<number, number[]>, a: number, b: number): void {
  const la = rem.get(a);
  const lb = rem.get(b);
  if (!la || !lb) return;
  const ia = la.indexOf(b);
  const ib = lb.indexOf(a);
  if (ia >= 0) la.splice(ia, 1);
  if (ib >= 0) lb.splice(ib, 1);
}

function hierholzerVertexCircuit(rem: Map<number, number[]>, start: number): number[] {
  const stack: number[] = [start];
  const out: number[] = [];

  while (stack.length > 0) {
    const u = stack[stack.length - 1]!;
    const nb = rem.get(u) ?? [];
    if (nb.length > 0) {
      const w = nb[nb.length - 1]!;
      removeUndirectedBoundaryEdge(rem, u, w);
      stack.push(w);
    } else {
      out.push(stack.pop()!);
    }
  }

  out.reverse();
  return out;
}

function findCornerWithUnusedEdge(rem: Map<number, number[]>): number | null {
  for (const [c, nb] of rem) {
    if (nb.length > 0) return c;
  }
  return null;
}

function pickHierholzerStart(rem: Map<number, number[]>): number | null {
  const any = findCornerWithUnusedEdge(rem);
  if (any === null) return null;

  const odd: number[] = [];
  for (const [v, nb] of rem) {
    if (nb.length % 2 === 1) odd.push(v);
  }
  if (odd.length >= 2) {
    return odd[0]!;
  }
  return any;
}

function traceBoundaryCornerLoops(adj: Map<number, number[]>): number[][] {
  const rem = cloneBoundaryAdjacency(adj);
  const loops: number[][] = [];

  while (true) {
    const start = pickHierholzerStart(rem);
    if (start === null) break;

    const circuit = hierholzerVertexCircuit(rem, start);
    if (circuit.length < 2) continue;

    const closed = circuit.length >= 2 && circuit[0] === circuit[circuit.length - 1];
    const cornerLoop = closed ? circuit.slice(0, -1) : circuit;
    if (cornerLoop.length >= 3) {
      loops.push(cornerLoop);
    }
  }

  return loops;
}

function connectedComponentsByNodeRule(
  map: RegionMap,
  inCluster: (node: MapNode) => boolean,
): Set<number>[] {
  const visited = new Set<number>();
  const components: Set<number>[] = [];

  for (const node of map.nodes) {
    if (!inCluster(node) || visited.has(node.id)) continue;
    const comp = new Set<number>();
    const stack = [node.id];
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      comp.add(id);
      for (const nb of map.nodes[id].neighbors) {
        if (visited.has(nb)) continue;
        if (inCluster(map.nodes[nb])) stack.push(nb);
      }
    }
    components.push(comp);
  }
  return components;
}

/**
 * Outer dark coast ink, then a lighter blue stroke clipped to the ocean interior so it reads as an
 * inner rim inside the fill (not a second outer line like the old parchment channel).
 */
function appendOceanCoastPathD(d: string, parts: string[], oceanFillHex: string): void {
  const clipId = `oceIn${oceanCoastInnerClipSerial++}`;
  const innerBlue = mixHexWithWhite(oceanFillHex, 0.26);
  parts.push(
    `<defs><clipPath id="${clipId}"><path d="${d}"/></clipPath></defs>`,
    `<path d="${d}" fill="none" stroke="#1e2a32" stroke-width="0.36" stroke-linejoin="round" stroke-linecap="round"/>`,
    `<path d="${d}" fill="none" stroke="${innerBlue}" stroke-width="0.2" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#${clipId})"/>`,
  );
}

function appendLakeCoastPathD(d: string, parts: string[], lakeFillHex: string): void {
  const strokeColor = mixHexWithBlack(lakeFillHex, 0.4);
  parts.push(
    `<path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="0.11" stroke-linejoin="round" stroke-linecap="round" opacity="0.42"/>`,
  );
}

function appendFilledRegionPathD(
  parts: string[],
  d: string,
  fill: string,
  fillOpacity: number,
  strokeKind: 'ocean' | 'lake' | 'mountain',
): void {
  const ink = 'url(#inkEdge)';
  parts.push(
    `<path d="${d}" fill="${fill}" fill-opacity="${fillOpacity}" stroke="none" filter="${ink}"/>`,
  );
  if (strokeKind === 'ocean') {
    appendOceanCoastPathD(d, parts, fill);
  } else if (strokeKind === 'lake') {
    appendLakeCoastPathD(d, parts, fill);
  } else {
    parts.push(
      `<path d="${d}" fill="none" stroke="#6e6252" stroke-width="0.11" stroke-linejoin="round" stroke-linecap="round" opacity="0.62" filter="url(#inkEdge)"/>`,
    );
  }
}

function appendClosedRegionFromLoops(
  map: RegionMap,
  loops: number[][],
  parts: string[],
  fill: string,
  fillOpacity: number,
  strokeKind: 'ocean' | 'lake' | 'mountain',
): void {
  for (const loop of loops) {
    const verts = cornerLoopToVertices(map, loop);
    if (verts.length < 3) continue;
    const d = polygonToPathD(verts);
    if (!d) continue;
    appendFilledRegionPathD(parts, d, fill, fillOpacity, strokeKind);
  }
}

type WaterPolygonItem = {
  d: string;
  fill: string;
  fillOpacity: number;
  strokeKind: 'ocean' | 'lake';
};

function listWaterPolygonsForMap(map: RegionMap): WaterPolygonItem[] {
  const oceanFill = '#9eb8c9';
  const lakeFill = '#a8caba';
  const fillOpacity = 0.92;
  const out: WaterPolygonItem[] = [];
  const waterComps = connectedComponentsByNodeRule(map, isWaterNode);
  for (const comp of waterComps) {
    const adj = buildBoundaryAdjacency(map, comp);
    if (adj.size === 0) continue;
    const loops = traceBoundaryCornerLoops(adj);
    const strokeKind = waterClusterContainsOcean(comp, map) ? 'ocean' : 'lake';
    const fill = strokeKind === 'ocean' ? oceanFill : lakeFill;
    for (const loop of loops) {
      const verts = cornerLoopToVertices(map, loop);
      if (verts.length < 3) continue;
      const d = polygonToPathD(verts);
      if (!d) continue;
      out.push({ d, fill, fillOpacity, strokeKind });
    }
  }
  return out;
}

function waterClusterContainsOcean(comp: Set<number>, map: RegionMap): boolean {
  for (const id of comp) {
    if (map.nodes[id]?.isOcean) return true;
  }
  return false;
}

/**
 * One connected-water component = BFS through all water (ocean + lake). If any cell is ocean, the
 * whole cluster is drawn as ocean (coastal lakes merge into the sea shape); lake-only clusters stay
 * inland lakes.
 */
function appendWaterBodiesFromItems(items: WaterPolygonItem[], parts: string[]): void {
  for (const item of items) {
    appendFilledRegionPathD(parts, item.d, item.fill, item.fillOpacity, item.strokeKind);
  }
}

function isMountainLandNode(node: MapNode): boolean {
  if (isWaterNode(node)) return false;
  if (node.elevation > 0.82) return true;
  if (node.elevation > 0.58) return true;
  const b = node.biomeId?.toLowerCase() ?? '';
  return b.includes('mountain') || b.includes('alpine');
}

function appendMountainTerrainBodies(map: RegionMap, parts: string[]): void {
  const comps = connectedComponentsByNodeRule(map, isMountainLandNode);
  const fill = '#bdb2a1';
  const fillOpacity = 0.9;

  for (const comp of comps) {
    const adj = buildBoundaryAdjacency(map, comp);
    if (adj.size === 0) continue;
    const loops = traceBoundaryCornerLoops(adj);
    appendClosedRegionFromLoops(map, loops, parts, fill, fillOpacity, 'mountain');
  }
}

/** Outer chart edge when the region includes sea — matches double-line ocean style. */
function appendChartDoubleLineIfOcean(map: RegionMap, parts: string[]): void {
  if (!mapHasOcean(map)) return;
  const w = map.width;
  const h = map.height;
  parts.push(
    `<rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="#1e2a32" stroke-width="0.38"/>`,
    `<rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="${PARCHMENT_FILL}" stroke-width="0.14"/>`,
  );
}

function nearestNeighborDistance(node: MapNode, map: RegionMap): number {
  let best = Infinity;
  for (const nid of node.neighbors) {
    const nb = map.nodes[nid];
    if (!nb) continue;
    const dx = nb.center.x - node.center.x;
    const dy = nb.center.y - node.center.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < best) best = d;
  }
  if (!Number.isFinite(best) || best === 0) {
    const a = polygonArea(node.polygon.vertices);
    return Math.max(0.5, Math.sqrt(a / Math.PI));
  }
  return best;
}

function symbolFontSizeForNode(node: MapNode, map: RegionMap): number {
  const d = nearestNeighborDistance(node, map);
  const fromArea = Math.sqrt(polygonArea(node.polygon.vertices) / Math.PI);
  const base = Math.min(d, fromArea * 1.2) * 0.55;
  return Math.max(0.35, Math.min(2.8, base));
}

/**
 * Land-only symbols (mirrors ASCII biome intent); water is shown by coast fills, not glyphs.
 */
function biomeSymbolForLandNode(node: MapNode): BiomeVisual {
  const b = node.biomeId?.toLowerCase() || '';

  if (isMountainLandNode(node)) {
    return { symbol: '' };
  }
  if (node.elevation > 0.85) {
    return { symbol: '▲' };
  }
  if (b.includes('forest') || b.includes('woodland')) {
    return { symbol: '' };
  }
  if (b.includes('desert') || b.includes('arid') || b.includes('dry')) {
    return { symbol: '∴' };
  }
  if (b.includes('tundra') || b.includes('ice') || b.includes('polar')) {
    return { symbol: '✻' };
  }
  if (b.includes('grassland') || b.includes('plains') || b.includes('savanna')) {
    return { symbol: '·' };
  }
  if (b.includes('tropical') || b.includes('jungle')) {
    return { symbol: '❧' };
  }
  if (node.elevation > 0.6) {
    return { symbol: '△' };
  }
  if (node.elevation > 0.4) {
    return { symbol: '⌂' };
  }
  return { symbol: ',' };
}

function polylineLength(vertices: Vertex[]): number {
  let s = 0;
  for (let i = 1; i < vertices.length; i++) {
    const a = vertices[i - 1]!;
    const b = vertices[i]!;
    s += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return s;
}

function minDistanceToWaterCellCenter(x: number, y: number, map: RegionMap): number {
  let best = Infinity;
  for (const n of map.nodes) {
    if (!isWaterNode(n)) continue;
    const d = Math.hypot(n.center.x - x, n.center.y - y);
    if (d < best) best = d;
  }
  return best;
}

/** Endpoint of the river chain farthest from water; used to taper stroke to nothing there. */
function riverDryEndAndTaperRadius(
  vertices: Vertex[],
  map: RegionMap,
): { dry: Vertex; taperR: number } {
  const first = vertices[0]!;
  const last = vertices[vertices.length - 1]!;
  const da = minDistanceToWaterCellCenter(first.x, first.y, map);
  const db = minDistanceToWaterCellCenter(last.x, last.y, map);
  const dry = da >= db ? first : last;
  const len = polylineLength(vertices);
  const taperR = Math.max(0.65, Math.min(5.5, len * 0.2));
  return { dry, taperR };
}

function appendRiverDryEndTaperMaskDef(
  map: RegionMap,
  dry: Vertex,
  taperR: number,
  serial: number,
  parts: string[],
): string {
  const gid = `rvTapG${serial}`;
  const mid = `rvTapM${serial}`;
  const w = map.width;
  const h = map.height;
  parts.push(
    `<radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${dry.x}" cy="${dry.y}" r="${taperR}" fx="${dry.x}" fy="${dry.y}">
    <stop offset="0" stop-color="rgb(0,0,0)"/>
    <stop offset="0.42" stop-color="rgb(210,210,210)"/>
    <stop offset="1" stop-color="rgb(255,255,255)"/>
  </radialGradient>
  <mask id="${mid}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${gid})"/>
  </mask>`,
  );
  return mid;
}

function appendRiversAndRoads(
  map: RegionMap,
  parts: string[],
  waterPolygons: WaterPolygonItem[],
): void {
  const w = map.width;
  const h = map.height;
  const maskId = 'riverHideOverWater';

  const riverTaperDefs: string[] = [];
  const riverLines: string[] = [];
  for (const chain of listOrderedRiverChains(map)) {
    const rv = riverChainToSubdividedVertices(map, chain);
    if (!rv || rv.length < 2) continue;
    const d = openCurvePathDThroughPoints(rv);
    const pathEl = `<path d="${d}" fill="none" stroke="#5a7a6e" stroke-width="0.2" stroke-linejoin="round" stroke-linecap="round" opacity="0.88" filter="url(#inkEdge)"/>`;
    const { dry, taperR } = riverDryEndAndTaperRadius(rv, map);
    const sid = riverTaperMaskSerial++;
    const taperMaskId = appendRiverDryEndTaperMaskDef(map, dry, taperR, sid, riverTaperDefs);
    riverLines.push(`<g mask="url(#${taperMaskId})">${pathEl}</g>`);
  }

  for (const poly of buildRoadCentroidPolylines(map)) {
    const d = openRoadPolylinePathD(poly);
    parts.push(
      `<path d="${d}" fill="none" stroke="#5c4a3a" stroke-width="0.14" stroke-dasharray="0.45 0.4" stroke-linejoin="round" stroke-linecap="round" opacity="0.92" filter="url(#inkEdge)"/>`,
    );
  }

  if (riverLines.length === 0) return;

  const defsInner: string[] = [...riverTaperDefs];
  if (waterPolygons.length > 0) {
    const cutouts = waterPolygons.map((wp) => `<path d="${wp.d}" fill="black"/>`).join('\n    ');
    defsInner.push(
      `<mask id="${maskId}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
    <rect x="0" y="0" width="${w}" height="${h}" fill="white"/>
    ${cutouts}
  </mask>`,
    );
  }
  parts.push(`<defs>
${defsInner.join('\n')}
</defs>`);

  if (waterPolygons.length > 0) {
    parts.push(`<g mask="url(#${maskId})">${riverLines.join('\n')}</g>`);
  } else {
    parts.push(...riverLines);
  }
}

function isForestNode(node: MapNode): boolean {
  if (isWaterNode(node)) return false;
  const b = node.biomeId?.toLowerCase() ?? '';
  return b.includes('forest') || b.includes('woodland');
}

function getForestType(node: MapNode): 'oak' | 'pine' | 'palm' | null {
  if (!isForestNode(node)) return null;
  const b = node.biomeId?.toLowerCase() ?? '';
  if (b.includes('tropical') || b.includes('mangrove') || b.includes('jungle')) {
    return 'palm';
  }
  if (
    b.includes('boreal') ||
    b.includes('montane') ||
    b.includes('coniferous') ||
    b.includes('pine')
  ) {
    return 'pine';
  }
  return 'oak';
}

function getPolygonBoundingBox(vertices: Vertex[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const v of vertices) {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  }
  return { minX, maxX, minY, maxY };
}

function isPointInPolygon(p: Vertex, vertices: Vertex[]): boolean {
  let inside = false;
  const n = vertices.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = vertices[i].x,
      yi = vertices[i].y;
    const xj = vertices[j].x,
      yj = vertices[j].y;
    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Silhouette of each scattered glyph in symbol space, anchored at its base (0, 0) with -y pointing
 * up. Placement uses these to keep a glyph inside the terrain region it belongs to, so the outlines
 * must stay in step with the symbol geometry in `svgDefs`.
 */
const SYMBOL_SILHOUETTES: Record<string, Vertex[]> = {
  'tree-oak': [
    { x: 0, y: 0 },
    { x: -0.8, y: -0.5 },
    { x: -1.2, y: -1.1 },
    { x: -0.7, y: -1.8 },
    { x: 0, y: -2.2 },
    { x: 0.7, y: -1.8 },
    { x: 1.2, y: -1.1 },
    { x: 0.8, y: -0.5 },
  ],
  'tree-pine': [
    { x: 0, y: 0 },
    { x: -0.8, y: -0.4 },
    { x: -0.6, y: -1.1 },
    { x: 0, y: -2.0 },
    { x: 0.6, y: -1.1 },
    { x: 0.8, y: -0.4 },
  ],
  'tree-palm': [
    { x: 0, y: 0 },
    { x: -0.8, y: -1.3 },
    { x: -0.55, y: -1.75 },
    { x: 0, y: -1.85 },
    { x: 0.55, y: -1.75 },
    { x: 0.8, y: -1.3 },
  ],
  'mountain-high': [
    { x: -1.4, y: 0 },
    { x: -0.4, y: -1.8 },
    { x: 0.1, y: -1.1 },
    { x: 0.6, y: -1.5 },
    { x: 1.4, y: 0 },
  ],
  'mountain-low': [
    { x: -1.0, y: 0 },
    { x: -0.3, y: -1.0 },
    { x: 0.1, y: -0.6 },
    { x: 0.5, y: -0.8 },
    { x: 1.0, y: 0 },
  ],
};

/** Adds the midpoint of every silhouette leg so a long straight side cannot span a region boundary. */
function densifyOutline(points: Vertex[]): Vertex[] {
  const out: Vertex[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    out.push(a, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  }
  return out;
}

const SYMBOL_FIT_OUTLINES: Record<string, Vertex[]> = Object.fromEntries(
  Object.entries(SYMBOL_SILHOUETTES).map(([id, points]) => [id, densifyOutline(points)]),
);

/**
 * Slack in map units between a glyph and its region's edge. The drawn edge is not the raw cell
 * boundary this test uses: `cornerLoopToVertices` jitters it and `inkEdge` displaces the fill again,
 * so a glyph has to stand back from the boundary by roughly the sum of both wobbles.
 */
const REGION_EDGE_MARGIN = 0.14;

/** Cells within two graph steps — the only cells a glyph anchored in `nodeId` can reach. */
function localCellNeighborhood(map: RegionMap, nodeId: number): number[] {
  const near = new Set<number>([nodeId]);
  for (const first of map.nodes[nodeId]?.neighbors ?? []) {
    near.add(first);
    for (const second of map.nodes[first]?.neighbors ?? []) {
      near.add(second);
    }
  }
  return [...near];
}

/**
 * Point-in-terrain-region test for glyph placement. Region membership is what matters, not cell
 * membership: a glyph may straddle the interior cell boundaries of its own range or forest, but
 * never the outer edge where the region's fill stops.
 */
function makeRegionContainmentTest(
  map: RegionMap,
  inRegion: (node: MapNode) => boolean,
): (point: Vertex, nodeId: number) => boolean {
  const cache = new Map<number, MapNode[]>();

  const cellsNear = (nodeId: number): MapNode[] => {
    const cached = cache.get(nodeId);
    if (cached !== undefined) return cached;
    const cells = localCellNeighborhood(map, nodeId)
      .map((id) => map.nodes[id])
      .filter((n): n is MapNode => n !== undefined && inRegion(n));
    cache.set(nodeId, cells);
    return cells;
  };

  return (point, nodeId) =>
    cellsNear(nodeId).some((n) => isPointInPolygon(point, n.polygon.vertices));
}

function rotatePoint(p: Vertex, degrees: number): Vertex {
  const a = (degrees * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos };
}

/** One silhouette point placed in map space, pushed a margin further out from the glyph's base. */
function outlinePointInMapSpace(
  anchor: Vertex,
  outlinePoint: Vertex,
  scale: number,
  rotation: number,
): Vertex {
  const r = rotatePoint(outlinePoint, rotation);
  const len = Math.hypot(r.x, r.y);
  const ux = len > 1e-9 ? r.x / len : 0;
  const uy = len > 1e-9 ? r.y / len : 1;
  return {
    x: anchor.x + r.x * scale + ux * REGION_EDGE_MARGIN,
    y: anchor.y + r.y * scale + uy * REGION_EDGE_MARGIN,
  };
}

/** Bisection steps used to shrink a glyph onto the largest size that still fits its region. */
const SCALE_FIT_STEPS = 6;

/**
 * Largest scale at or below `wanted` whose whole silhouette stays inside the region, or null when
 * even `minimum` overflows — near a region's edge a glyph shrinks to a foothill rather than
 * spilling its base onto neighbouring terrain.
 */
function largestFittingScale(
  anchor: Vertex,
  outline: Vertex[],
  wanted: number,
  minimum: number,
  rotation: number,
  nodeId: number,
  contains: (point: Vertex, nodeId: number) => boolean,
): number | null {
  const fits = (scale: number) =>
    outline.every((o) => contains(outlinePointInMapSpace(anchor, o, scale, rotation), nodeId));

  if (fits(wanted)) return wanted;
  if (!fits(minimum)) return null;

  let low = minimum;
  let high = wanted;
  for (let i = 0; i < SCALE_FIT_STEPS; i++) {
    const mid = (low + high) / 2;
    if (fits(mid)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return low;
}

/** A placed glyph plus the base point it stands on, which is what the draw order sorts by. */
type ScatterSymbol = {
  x: number;
  y: number;
  el: string;
};

type ScatterSpec = {
  /** Symbols per square map unit of cell area. */
  density: number;
  hashSalt: number;
  scaleJitter: number;
  rotationJitter: number;
  /** Fraction of the desired scale below which a glyph is dropped instead of shrunk further. */
  minScaleFactor: number;
  inRegion: (node: MapNode) => boolean;
  symbolIdForNode: (node: MapNode) => string | null;
  scaleForNode: (node: MapNode) => number;
};

const SCATTER_PLACEMENT_ATTEMPTS = 40;

function collectScatterSymbols(map: RegionMap, spec: ScatterSpec): ScatterSymbol[] {
  const contains = makeRegionContainmentTest(map, spec.inRegion);
  const out: ScatterSymbol[] = [];

  for (const node of map.nodes) {
    const symbolId = spec.symbolIdForNode(node);
    if (symbolId === null) continue;
    const outline = SYMBOL_FIT_OUTLINES[symbolId];
    if (outline === undefined) continue;

    const wantedCount = Math.round(polygonArea(node.polygon.vertices) * spec.density);
    if (wantedCount <= 0) continue;

    const bbox = getPolygonBoundingBox(node.polygon.vertices);
    const desiredScale = spec.scaleForNode(node);
    const minimumScale = desiredScale * spec.minScaleFactor;

    let seedCounter = 0;
    const nextRandom = () => hash01(node.id, ++seedCounter, spec.hashSalt);

    let placed = 0;
    for (let attempt = 0; attempt < SCATTER_PLACEMENT_ATTEMPTS && placed < wantedCount; attempt++) {
      const anchor = {
        x: bbox.minX + nextRandom() * (bbox.maxX - bbox.minX),
        y: bbox.minY + nextRandom() * (bbox.maxY - bbox.minY),
      };
      const rotation = toBipolar(nextRandom()) * spec.rotationJitter;
      const wantedScale = desiredScale * (1 + toBipolar(nextRandom()) * spec.scaleJitter);
      if (!isPointInPolygon(anchor, node.polygon.vertices)) continue;

      const scale = largestFittingScale(
        anchor,
        outline,
        wantedScale,
        minimumScale,
        rotation,
        node.id,
        contains,
      );
      if (scale === null) continue;

      out.push({
        x: anchor.x,
        y: anchor.y,
        el: `<use href="#${symbolId}" transform="translate(${anchor.x.toFixed(3)}, ${anchor.y.toFixed(3)}) rotate(${rotation.toFixed(1)}) scale(${scale.toFixed(3)})" filter="url(#symbolShadow)"/>`,
      });
      placed++;
    }
  }

  return out;
}

/**
 * Painter's algorithm over the scattered glyphs: every one is anchored at its base, so drawing in
 * order of increasing base y makes a symbol nearer the bottom of the map overlap the ones standing
 * behind it. Trees and mountains share the ordering, so a tree in front of a peak covers its slope.
 */
function appendScatterSymbolsBackToFront(symbols: ScatterSymbol[], parts: string[]): void {
  const ordered = [...symbols].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const symbol of ordered) {
    parts.push(symbol.el);
  }
}

/** Tree height relative to the cell's symbol size. */
const TREE_SCALE_FACTOR = 0.42;

function collectForestScatterSymbols(map: RegionMap): ScatterSymbol[] {
  return collectScatterSymbols(map, {
    density: 0.45,
    hashSalt: 17.31,
    scaleJitter: 0.18,
    rotationJitter: 5,
    minScaleFactor: 0.45,
    inRegion: isForestNode,
    symbolIdForNode: (node) => {
      const forestType = getForestType(node);
      return forestType === null ? null : `tree-${forestType}`;
    },
    scaleForNode: (node) => symbolFontSizeForNode(node, map) * TREE_SCALE_FACTOR,
  });
}

function appendForestTerrainBodies(map: RegionMap, parts: string[]): void {
  const comps = connectedComponentsByNodeRule(map, isForestNode);
  const fill = '#c2d7c2'; // Soft sage green
  const fillOpacity = 0.42;

  for (const comp of comps) {
    const adj = buildBoundaryAdjacency(map, comp);
    if (adj.size === 0) continue;
    const loops = traceBoundaryCornerLoops(adj);
    appendClosedRegionFromLoops(map, loops, parts, fill, fillOpacity, 'lake');
  }
}

function getMountainType(node: MapNode): 'high' | 'low' | null {
  if (!isMountainLandNode(node)) return null;
  const b = node.biomeId?.toLowerCase() ?? '';
  if (node.elevation > 0.82 || b.includes('alpine') || b.includes('high mountain')) {
    return 'high';
  }
  return 'low';
}

/** Peak height relative to the cell's symbol size; a peak stays narrower than the cell it sits in. */
const MOUNTAIN_SCALE_FACTOR = 0.7;

function collectMountainScatterSymbols(map: RegionMap): ScatterSymbol[] {
  return collectScatterSymbols(map, {
    density: 0.4,
    hashSalt: 23.87,
    scaleJitter: 0.12,
    rotationJitter: 3,
    minScaleFactor: 0.4,
    inRegion: isMountainLandNode,
    symbolIdForNode: (node) => {
      const mountainType = getMountainType(node);
      return mountainType === null ? null : `mountain-${mountainType}`;
    },
    scaleForNode: (node) => symbolFontSizeForNode(node, map) * MOUNTAIN_SCALE_FACTOR,
  });
}

function appendLandBiomeSymbols(map: RegionMap, parts: string[]): void {
  const shadow = 'url(#symbolShadow)';
  for (const node of map.nodes) {
    if (isWaterNode(node)) continue;
    const { symbol } = biomeSymbolForLandNode(node);
    const fs = symbolFontSizeForNode(node, map);
    const x = node.center.x;
    const y = node.center.y;
    parts.push(
      `<text x="${x}" y="${y}" font-family="Georgia, serif" font-size="${fs}" fill="#4a3d32" text-anchor="middle" dominant-baseline="middle" filter="${shadow}">${escapeXml(symbol)}</text>`,
    );
  }
}

function appendSettlements(
  map: RegionMap,
  settlements: RegionMapSvgSettlement[],
  parts: string[],
): void {
  for (const s of settlements) {
    if (s.mapNodeId === undefined) continue;
    const n = map.nodes[s.mapNodeId];
    if (!n) continue;
    const x = n.center.x;
    const y = n.center.y;
    const r = Math.max(0.25, symbolFontSizeForNode(n, map) * 0.45);
    if (s.isCapital) {
      parts.push(
        `<text x="${x}" y="${y}" font-family="Georgia, serif" font-size="${r * 3}" fill="#5c2828" text-anchor="middle" dominant-baseline="middle" font-weight="bold" filter="url(#symbolShadow)">${escapeXml('★')}</text>`,
      );
    } else {
      parts.push(
        `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#4a3228" stroke-width="0.12" filter="url(#inkEdge)"/>`,
      );
    }
  }
}

function svgDefs(): string {
  return `<defs>
  <filter id="paperGrain" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" seed="42"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.38  0 0 0 0.12 0" in="noise" result="colored"/>
    <feBlend in="SourceGraphic" in2="colored" mode="multiply"/>
  </filter>
  <filter id="inkEdge" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="turb"/>
    <feDisplacementMap in="SourceGraphic" in2="turb" scale="0.28" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="symbolShadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0.03" dy="0.05" stdDeviation="0.06" flood-color="#3d2e24" flood-opacity="0.35"/>
  </filter>
  <g id="tree-oak">
    <path d="M 0 0 L 0 -0.5" fill="none" stroke="#4a3d32" stroke-width="0.15" stroke-linecap="round"/>
    <path d="M -0.8 -0.5 C -1.2 -0.8, -1.2 -1.4, -0.6 -1.6 C -0.8 -2.0, -0.2 -2.3, 0 -2.0 C 0.2 -2.3, 0.8 -2.0, 0.6 -1.6 C 1.2 -1.4, 1.2 -0.8, 0.8 -0.5 Z" fill="#c3d9b0" fill-opacity="0.95" stroke="#4a3d32" stroke-width="0.12" stroke-linejoin="round"/>
  </g>
  <g id="tree-pine">
    <path d="M 0 0 L 0 -0.4" fill="none" stroke="#4a3d32" stroke-width="0.15" stroke-linecap="round"/>
    <path d="M 0 -2.0 L -0.6 -1.1 L -0.2 -1.1 L -0.8 -0.4 L 0.8 -0.4 L 0.2 -1.1 L 0.6 -1.1 Z" fill="#b2cdac" fill-opacity="0.95" stroke="#4a3d32" stroke-width="0.12" stroke-linejoin="round"/>
  </g>
  <g id="tree-palm">
    <path d="M 0 0 Q -0.15 -0.5, 0 -1.2" fill="none" stroke="#4a3d32" stroke-width="0.15" stroke-linecap="round"/>
    <path d="M 0 -1.2 Q -0.4 -1.5, -0.8 -1.3 M 0 -1.2 Q -0.5 -1.7, -0.5 -0.9 M 0 -1.2 Q 0.1 -1.8, -0.1 -1.5 M 0 -1.2 Q 0.5 -1.7, 0.5 -0.9 M 0 -1.2 Q 0.4 -1.5, 0.8 -1.3" fill="none" stroke="#4a3d32" stroke-width="0.1" stroke-linecap="round"/>
  </g>
  <g id="mountain-high">
    <path d="M -1.4 0 L -0.4 -1.8 L 0.1 -1.1 L 0.6 -1.5 L 1.4 0 Z" fill="#dcd2c4" fill-opacity="0.9" stroke="none"/>
    <path d="M -1.4 0 L -0.4 -1.8 L 0.1 -1.1 L 0.6 -1.5 L 1.4 0" fill="none" stroke="#4a3d32" stroke-width="0.12" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M -0.4 -1.8 L -0.6 -0.6" fill="none" stroke="#4a3d32" stroke-width="0.12" stroke-linecap="round"/>
    <path d="M 0.6 -1.5 L 0.4 -0.5" fill="none" stroke="#4a3d32" stroke-width="0.12" stroke-linecap="round"/>
    <path d="M -0.35 -1.5 L -0.2 -1.5 M -0.3 -1.2 L -0.1 -1.2 M -0.25 -0.9 L -0.05 -0.9 M -0.2 -0.6 L 0.0 -0.6" stroke="#4a3d32" stroke-width="0.08" stroke-linecap="round"/>
    <path d="M 0.65 -1.2 L 0.8 -1.2 M 0.6 -0.9 L 0.75 -0.9 M 0.55 -0.6 L 0.7 -0.6 M 0.5 -0.3 L 0.65 -0.3" stroke="#4a3d32" stroke-width="0.08" stroke-linecap="round"/>
  </g>
  <g id="mountain-low">
    <path d="M -1.0 0 L -0.3 -1.0 L 0.1 -0.6 L 0.5 -0.8 L 1.0 0 Z" fill="#e5dec9" fill-opacity="0.9" stroke="none"/>
    <path d="M -1.0 0 L -0.3 -1.0 L 0.1 -0.6 L 0.5 -0.8 L 1.0 0" fill="none" stroke="#4a3d32" stroke-width="0.1" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M -0.3 -1.0 L -0.4 -0.3" fill="none" stroke="#4a3d32" stroke-width="0.1" stroke-linecap="round"/>
    <path d="M 0.5 -0.8 L 0.4 -0.3" fill="none" stroke="#4a3d32" stroke-width="0.1" stroke-linecap="round"/>
  </g>
</defs>`;
}

/**
 * Builds an SVG string for a region map: parchment land; ocean/lake/mountain areas as one closed path
 * per region (Hierholzer boundary + jittered mid-edge vertices; Voronoi corners fixed); rivers/roads;
 * biome symbols; optional settlements.
 */
export function buildRegionMapSvgString(map: RegionMap, options?: RegionMapSvgOptions): string {
  const w = map.width;
  const h = map.height;
  const title = options?.title;
  const settlements = options?.settlements ?? [];

  const body: string[] = [];
  const waterPolygons = listWaterPolygonsForMap(map);
  body.push(
    `<rect width="${w}" height="${h}" fill="${PARCHMENT_FILL}" filter="url(#paperGrain)"/>`,
  );
  appendWaterBodiesFromItems(waterPolygons, body);
  appendMountainTerrainBodies(map, body);
  appendForestTerrainBodies(map, body);
  appendRiversAndRoads(map, body, waterPolygons);
  appendChartDoubleLineIfOcean(map, body);
  appendLandBiomeSymbols(map, body);
  appendScatterSymbolsBackToFront(
    [...collectForestScatterSymbols(map), ...collectMountainScatterSymbols(map)],
    body,
  );
  appendSettlements(map, settlements, body);

  const titleEl =
    title !== undefined && title.length > 0
      ? `<text x="${w / 2}" y="${Math.min(2.2, h * 0.06)}" font-family="Georgia, serif" font-size="${Math.min(1.8, w * 0.035)}" fill="#3d3228" text-anchor="middle" filter="url(#symbolShadow)">${escapeXml(title)}</text>`
      : '';

  const inner = `${svgDefs()}
<g id="map-layers">
${body.join('\n')}
</g>
${titleEl}`;

  const scale = Math.min(DEFAULT_SVG_MAX_WIDTH / w, DEFAULT_SVG_MAX_HEIGHT / h);
  const pixelW = w * scale;
  const pixelH = h * scale;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${pixelW}" height="${pixelH}">
${inner}
</svg>`;
}
