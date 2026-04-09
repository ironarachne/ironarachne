import type { MapEdge, MapNode, RegionMap } from './map_graph.js';
import type Vertex from '../geometry/vertex.js';

export type RegionMapSvgSettlement = {
  mapNodeId?: number;
  isCapital?: boolean;
};

/** Default max pixel size; aspect ratio of map.width:map.height is preserved (fits inside this box). */
const DEFAULT_SVG_MAX_WIDTH = 900;
const DEFAULT_SVG_MAX_HEIGHT = 600;

const PARCHMENT_FILL = '#ede4d3';

let oceanCoastInnerClipSerial = 0;

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

function isComponentBoundaryEdge(edge: MapEdge, component: Set<number>, map: RegionMap): boolean {
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
    if (!isComponentBoundaryEdge(e, component, map)) continue;
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

  if (node.elevation > 0.85) {
    return { symbol: '▲' };
  }
  if (b.includes('forest') || b.includes('woodland')) {
    return { symbol: '♣' };
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

function appendRiversAndRoads(
  map: RegionMap,
  parts: string[],
  waterPolygons: WaterPolygonItem[],
): void {
  const w = map.width;
  const h = map.height;
  const maskId = 'riverHideOverWater';

  const riverLines: string[] = [];
  for (const edge of map.edges) {
    const c0 = map.corners[edge.v0];
    const c1 = map.corners[edge.v1];
    if (!c0 || !c1) continue;
    const x0 = c0.point.x;
    const y0 = c0.point.y;
    const x1 = c1.point.x;
    const y1 = c1.point.y;
    if (edge.river > 0) {
      riverLines.push(
        `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#5a7a6e" stroke-width="0.2" stroke-linecap="round" opacity="0.88" filter="url(#inkEdge)"/>`,
      );
    }
    if (edge.road && edge.road > 0) {
      parts.push(
        `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#5c4a3a" stroke-width="0.14" stroke-dasharray="0.45 0.4" stroke-linecap="round" opacity="0.92" filter="url(#inkEdge)"/>`,
      );
    }
  }

  if (riverLines.length === 0) return;

  if (waterPolygons.length > 0) {
    const cutouts = waterPolygons
      .map((wp) => `<path d="${wp.d}" fill="black"/>`)
      .join('\n    ');
    parts.push(
      `<defs><mask id="${maskId}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">
    <rect x="0" y="0" width="${w}" height="${h}" fill="white"/>
    ${cutouts}
  </mask></defs>`,
      `<g mask="url(#${maskId})">${riverLines.join('\n')}</g>`,
    );
  } else {
    parts.push(...riverLines);
  }
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

function appendSettlements(map: RegionMap, settlements: RegionMapSvgSettlement[], parts: string[]): void {
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
  body.push(`<rect width="${w}" height="${h}" fill="${PARCHMENT_FILL}" filter="url(#paperGrain)"/>`);
  appendWaterBodiesFromItems(waterPolygons, body);
  appendMountainTerrainBodies(map, body);
  appendRiversAndRoads(map, body, waterPolygons);
  appendChartDoubleLineIfOcean(map, body);
  appendLandBiomeSymbols(map, body);
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
