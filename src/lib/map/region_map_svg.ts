import type { MapEdge, MapNode, RegionMap } from './map_graph.js';
import { generatePoissonDisk, type Vertex } from '$lib/geometry';
import { RNG } from '@ironarachne/rng';
import {
  CARTOGRAPHY,
  createWaterEdgeTreatment,
  createHatching,
  INK_EDGE_MAX_OFFSET,
  STROKE_WIDTHS,
  MASK_PAINT,
  hash01,
  toBipolar,
  cartographyFilterDefs,
  parchmentRect,
} from '$lib/cartography';
import { makeWaterClearanceTest } from './water_clearance';
import { buildRoadCentroidPolylines } from './road_polylines.js';
import {
  atMapEdge,
  connectedRiverReaches,
  riverChannelWidth,
  riverRibbon,
  sampleRiverCurve,
} from './river_paths';

export type RegionMapSvgSettlement = {
  mapNodeId?: number;
  isCapital?: boolean;
  name?: string;
  /** Drives label size, so a city reads larger than a hamlet. */
  population?: number;
};

/** Default max pixel size; aspect ratio of map.width:map.height is preserved (fits inside this box). */
const DEFAULT_SVG_MAX_WIDTH = 900;
const DEFAULT_SVG_MAX_HEIGHT = 600;

const PARCHMENT_FILL = CARTOGRAPHY.ground.fill;

export type RegionMapSvgOptions = {
  title?: string;
  settlements?: RegionMapSvgSettlement[];
};

/**
 * Coordinates are emitted at three decimals. The viewBox is in map units scaled by ~15 to reach pixel
 * size, so three decimals is well under a hundredth of a device pixel — full float precision only
 * inflates the file (17 characters per number, most of them noise no renderer can resolve).
 */
function n(value: number): string {
  return (Math.round(value * 1000) / 1000).toString();
}

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
  const parts = [`M ${n(first.x)} ${n(first.y)}`];
  for (let i = 1; i < vertices.length; i++) {
    parts.push(`L ${n(vertices[i].x)} ${n(vertices[i].y)}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

/** Roads follow the routed cell centres exactly, including branch junctions. */
function openRoadPolylinePathD(vertices: Vertex[]): string {
  if (vertices.length === 0) return '';
  const first = vertices[0]!;
  const bits = [`M ${n(first.x)} ${n(first.y)}`];
  for (let i = 1; i < vertices.length; i++) {
    const v = vertices[i]!;
    bits.push(`L ${n(v.x)} ${n(v.y)}`);
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

/** Coast ink and its inner parchment rim share the water's one stored SVG path. */
function appendOceanCoast(item: WaterPolygonItem, parts: string[]): void {
  parts.push(
    `<use href="#${item.id}" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.heavy}" stroke-linejoin="round" stroke-linecap="round"/>`,
    `<use href="#${item.id}" fill="none" stroke="${CARTOGRAPHY.ground.fill}" stroke-width="${STROKE_WIDTHS.medium}" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#${item.id}Clip)"/>`,
  );
}

type WaterPolygonItem = {
  id: string;
  outline: Vertex[];
  d: string;
  strokeKind: 'ocean' | 'lake';
};

function listWaterPolygonsForMap(map: RegionMap): WaterPolygonItem[] {
  const edges = createWaterEdgeTreatment(map.width, map.height);
  const out: WaterPolygonItem[] = [];
  const waterComps = connectedComponentsByNodeRule(map, isWaterNode);
  for (const comp of waterComps) {
    const adj = buildBoundaryAdjacency(map, comp);
    if (adj.size === 0) continue;
    const loops = traceBoundaryCornerLoops(adj);
    const strokeKind = waterClusterContainsOcean(comp, map) ? 'ocean' : 'lake';
    for (const loop of loops) {
      const points = loop.map((id) => map.corners[id]?.point);
      if (points.some((point) => point === undefined)) continue;
      const verts = edges
        .displace(points as Vertex[])
        .map((p) => ({ x: Number(n(p.x)), y: Number(n(p.y)) }));
      if (verts.length < 3) continue;
      const d = polygonToPathD(verts);
      if (!d) continue;
      out.push({ id: `waterBody${out.length}`, outline: verts, d, strokeKind });
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
function waterGeometryDefs(items: WaterPolygonItem[]): string {
  return `<defs>
${items
  .map(
    (item) => `<path data-water-body="${item.strokeKind}" d="${item.d}" id="${item.id}"/>
<clipPath id="${item.id}Clip"><use href="#${item.id}"/></clipPath>`,
  )
  .join('\n')}
</defs>`;
}

function appendWaterBodiesFromItems(
  items: WaterPolygonItem[],
  parts: string[],
  width: number,
  height: number,
): void {
  const scale = Math.min(width, height) / 35;
  for (const item of items) {
    const ocean = item.strokeKind === 'ocean';
    const largeLake = polygonArea(item.outline) >= 6 * scale * scale;
    const hatching = createHatching(
      {
        shoreline: item.outline,
        spacing: (ocean ? 0.45 : 0.28) * scale,
        falloff: 1.4,
        maxBands: ocean ? 4 : largeLake ? 2 : 0,
      },
      width,
      height,
    );
    const paths = hatching.toPaths();
    if (paths.length > 0)
      parts.push(`<g data-water-hatching="${item.strokeKind}" clip-path="url(#${item.id}Clip)">
${paths.map((path) => path.toSvg()).join('\n')}
</g>`);
    if (ocean) appendOceanCoast(item, parts);
    else
      parts.push(
        `<use href="#${item.id}" fill="none" stroke="${CARTOGRAPHY.palette.secondary.color}" stroke-width="${STROKE_WIDTHS.hairline}" stroke-linejoin="round" stroke-linecap="round" opacity="0.42"/>`,
      );
  }
}

function isMountainLandNode(node: MapNode): boolean {
  if (isWaterNode(node)) return false;
  if (node.elevation > 0.82) return true;
  if (node.elevation > 0.58) return true;
  const b = node.biomeId?.toLowerCase() ?? '';
  return b.includes('mountain') || b.includes('alpine');
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

/** Nearest point on the processed coast, used only for corners already touching mapped water. */
function nearestWaterPoint(point: Vertex, waterPolygons: WaterPolygonItem[]): Vertex | null {
  let best: Vertex | null = null;
  let distance = Infinity;
  for (const water of waterPolygons) {
    for (let i = 0; i < water.outline.length; i++) {
      const a = water.outline[i],
        b = water.outline[(i + 1) % water.outline.length];
      const dx = b.x - a.x,
        dy = b.y - a.y;
      const t = Math.max(
        0,
        Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy || 1)),
      );
      const candidate = { x: a.x + dx * t, y: a.y + dy * t };
      const d = Math.hypot(candidate.x - point.x, candidate.y - point.y);
      if (d < distance) {
        distance = d;
        best = candidate;
      }
    }
  }
  return best;
}

/** Prune dangling road branches without changing the stored routing graph. */
function connectedRoadMap(map: RegionMap, settlements: RegionMapSvgSettlement[]): RegionMap {
  const anchors = new Set(settlements.map((settlement) => settlement.mapNodeId));
  for (const node of map.nodes)
    if (isWaterNode(node) || atMapEdge(node.center, map)) anchors.add(node.id);
  const edges = map.edges.map((edge) => ({ ...edge }));
  let changed = true;
  while (changed) {
    changed = false;
    const incident = new Map<number, MapEdge[]>();
    for (const edge of edges) {
      if (!edge.road || edge.d1 === undefined) continue;
      for (const id of [edge.d0, edge.d1]) {
        const bucket = incident.get(id) ?? [];
        bucket.push(edge);
        incident.set(id, bucket);
      }
    }
    for (const [id, roads] of incident) {
      if (roads.length === 1 && !anchors.has(id)) {
        roads[0].road = 0;
        changed = true;
      }
    }
  }
  return { ...map, edges };
}

function appendRivers(
  map: RegionMap,
  parts: string[],
  waterPolygons: WaterPolygonItem[],
  routeBoxes: TextBox[],
): void {
  const scale = Math.min(map.width, map.height) / 35;
  const clearOfWater = makeWaterClearanceTest(
    waterPolygons.map((water) => water.outline),
    0,
  );
  const outlets = new Set<number>();
  const mouthPoints = new Map<number, Vertex>();
  for (const corner of map.corners) {
    if (atMapEdge(corner.point, map)) {
      outlets.add(corner.id);
      continue;
    }
    if (!corner.touches.some((id) => isWaterNode(map.nodes[id]))) continue;
    if (!clearOfWater([corner.point])) {
      outlets.add(corner.id);
      continue;
    }
    const shore = nearestWaterPoint(corner.point, waterPolygons);
    // Smoothing can pull the visible shore away from its original graph corner. Bridge only
    // this local drawing gap; a distant or nonexistent water body is a simulation defect.
    if (shore && Math.hypot(shore.x - corner.point.x, shore.y - corner.point.y) <= 2 * scale) {
      outlets.add(corner.id);
      const dx = shore.x - corner.point.x,
        dy = shore.y - corner.point.y;
      const length = Math.hypot(dx, dy) || 1;
      mouthPoints.set(corner.id, {
        x: shore.x + (dx / length) * 0.15 * scale,
        y: shore.y + (dy / length) * 0.15 * scale,
      });
    }
  }
  const reaches = connectedRiverReaches(map, outlets);
  const banks: string[] = [],
    channels: string[] = [];
  const joins = new Map<number, number>();
  for (const reach of reaches) {
    const from = map.corners[reach.from].point;
    const to = map.corners[reach.to].point;
    const salt =
      Math.min(reach.from, reach.to) * 49999 +
      Math.max(reach.from, reach.to) * 1103515245 +
      reach.edge.id * 1009;
    const knots = subdivideRiverChordJittered(from.x, from.y, to.x, to.y, salt);
    const mouth = mouthPoints.get(reach.to);
    if (mouth) knots.push(mouth);
    const points = sampleRiverCurve(knots);
    const start = riverChannelWidth(reach.startFlow, scale),
      end = riverChannelWidth(reach.endFlow, scale);
    for (let i = 1; i < points.length; i++)
      routeBoxes.push(
        segmentBox(
          points[i - 1],
          points[i],
          Math.max(start, end) / 2 + (STROKE_WIDTHS.hairline + 0.1) * scale,
        ),
      );
    banks.push(
      `<path data-river-edge="${reach.edge.id}" data-flow="${reach.edge.river}" d="${polygonToPathD(riverRibbon(points, start, end, reach.source, STROKE_WIDTHS.hairline * scale, scale))}"/>`,
    );
    channels.push(
      `<path d="${polygonToPathD(riverRibbon(points, start, end, reach.source, 0, scale))}"/>`,
    );
    if (!reach.source) joins.set(reach.from, Math.max(joins.get(reach.from) ?? 0, start));
    joins.set(reach.to, Math.max(joins.get(reach.to) ?? 0, end));
  }
  for (const [id, width] of joins) {
    const p = map.corners[id].point;
    banks.push(
      `<circle cx="${n(p.x)}" cy="${n(p.y)}" r="${n(width / 2 + STROKE_WIDTHS.hairline * scale)}"/>`,
    );
    channels.push(`<circle cx="${n(p.x)}" cy="${n(p.y)}" r="${n(width / 2)}"/>`);
  }
  // Paint all banks, then all channel interiors: tributaries join without crossbars, and no
  // headwater mask can erase a neighbouring reach. Clip only inside actual processed water.
  const cutouts = waterPolygons.map(
    (water) => `<use href="#${water.id}" fill="${MASK_PAINT.hidden}"/>`,
  );
  parts.push(
    `<defs><mask id="riverInk" maskUnits="userSpaceOnUse" x="0" y="0" width="${map.width}" height="${map.height}"><rect width="${map.width}" height="${map.height}" fill="${MASK_PAINT.visible}"/>${cutouts.join('')}</mask></defs>`,
  );
  if (banks.length)
    parts.push(
      `<g data-map-rivers="true" mask="url(#riverInk)"><g fill="${CARTOGRAPHY.palette.water.color}">${banks.join('\n')}</g><g fill="${PARCHMENT_FILL}">${channels.join('\n')}</g></g>`,
    );
}

function appendRoads(
  map: RegionMap,
  parts: string[],
  settlements: RegionMapSvgSettlement[],
  routeBoxes: TextBox[],
): void {
  const scale = Math.min(map.width, map.height) / 35;
  const polylines = buildRoadCentroidPolylines(connectedRoadMap(map, settlements));
  for (const points of polylines)
    for (let i = 1; i < points.length; i++)
      routeBoxes.push(segmentBox(points[i - 1], points[i], 0.3 * scale));
  const roads = polylines.map(openRoadPolylinePathD);
  if (roads.length) {
    const paths = roads.map((d) => `<path d="${d}"/>`).join('\n');
    parts.push(`<g data-map-roads="true" fill="none" stroke-linejoin="round" stroke-linecap="round">
<g stroke="${PARCHMENT_FILL}" stroke-width="${n(0.34 * scale)}">${paths}</g>
<g stroke="${CARTOGRAPHY.palette.secondary.color}" stroke-width="${n(0.06 * scale)}" opacity="0.45">${paths}</g>
<g stroke="${CARTOGRAPHY.palette.secondary.color}" stroke-width="${n(STROKE_WIDTHS.fine * scale)}" stroke-dasharray="0.45 0.4" opacity="0.92">${paths}</g>
</g>`);
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
 * Slack in map units between a glyph and its terrain region's raw-cell boundary. Retained from
 * the former terrain washes so removing them does not change glyph placement. Water clearance
 * is checked separately against the processed shore.
 */
const REGION_EDGE_MARGIN = 0.14;

// Half the heaviest coast stroke + maximum 2-axis ink displacement + SVG rounding slack.
const WATER_EDGE_MARGIN = STROKE_WIDTHS.heavy / 2 + INK_EDGE_MAX_OFFSET + 0.01;

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
 * never the outer edge into another terrain region.
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
  clearOfWater: (outline: Vertex[]) => boolean,
): number | null {
  const fits = (scale: number) => {
    const placed = outline.map((o) => outlinePointInMapSpace(anchor, o, scale, rotation));
    return placed.every((point) => contains(point, nodeId)) && clearOfWater(placed);
  };

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
  box: TextBox;
};

/** A shared disk index lets different glyph kinds keep partial overlap without stacking. */
function makeGlyphSpacingTest(cellSize: number): (point: Vertex, radius: number) => boolean {
  const bins = new Map<string, { point: Vertex; radius: number }[]>();
  let largestRadius = 0;
  return (point, radius) => {
    const col = Math.floor(point.x / cellSize);
    const row = Math.floor(point.y / cellSize);
    const reach = Math.ceil((radius + largestRadius + 0.003) / cellSize);
    for (let x = col - reach; x <= col + reach; x++) {
      for (let y = row - reach; y <= row + reach; y++) {
        for (const other of bins.get(`${x},${y}`) ?? []) {
          if (
            Math.hypot(point.x - other.point.x, point.y - other.point.y) <
            radius + other.radius + 0.003
          )
            return false;
        }
      }
    }
    const key = `${col},${row}`;
    const bin = bins.get(key) ?? [];
    bin.push({ point, radius });
    bins.set(key, bin);
    largestRadius = Math.max(largestRadius, radius);
    return true;
  };
}

/** Spatial bins avoid scanning every terrain cell for every Poisson candidate. */
function makeScatterNodeLookup(map: RegionMap): (point: Vertex) => MapNode | undefined {
  const step = Math.max(map.width, map.height) / 32;
  const bins = new Map<string, MapNode[]>();
  for (const node of map.nodes) {
    if (!isMountainLandNode(node) && !isForestNode(node)) continue;
    const box = getPolygonBoundingBox(node.polygon.vertices);
    for (let x = Math.floor(box.minX / step); x <= Math.floor(box.maxX / step); x++) {
      for (let y = Math.floor(box.minY / step); y <= Math.floor(box.maxY / step); y++) {
        const key = `${x},${y}`;
        const bin = bins.get(key) ?? [];
        bin.push(node);
        bins.set(key, bin);
      }
    }
  }
  return (point) =>
    bins
      .get(`${Math.floor(point.x / step)},${Math.floor(point.y / step)}`)
      ?.find((node) => isPointInPolygon(point, node.polygon.vertices));
}

function collectScatterSymbols(
  map: RegionMap,
  clearOfWater: (outline: Vertex[]) => boolean,
): ScatterSymbol[] {
  if (
    map.width <= 0 ||
    map.height <= 0 ||
    !map.nodes.some((node) => isMountainLandNode(node) || isForestNode(node))
  )
    return [];
  const mapScale = Math.min(map.width, map.height) / 35;
  // A map-relative floor leaves parchment between glyphs even when edge fitting shrinks them.
  // Larger glyphs are thinned further by the shared half-width check below.
  const candidateRadius = 1.1 * mapScale;
  const nodeAt = makeScatterNodeLookup(map);
  const rng = new RNG(`region-glyphs:${map.width}:${map.height}:${map.nodes.length}`);
  const candidates = generatePoissonDisk(map.width, map.height, candidateRadius, rng, 30, {
    accept: (point) => nodeAt(point) !== undefined,
    maxPoints: 12000,
  });
  const forestContains = makeRegionContainmentTest(
    map,
    (node) => isForestNode(node) && !isMountainLandNode(node),
  );
  const mountainContains = makeRegionContainmentTest(map, isMountainLandNode);
  const acceptSpacing = makeGlyphSpacingTest(mapScale);
  const out: ScatterSymbol[] = [];
  for (const anchor of candidates) {
    const node = nodeAt(anchor)!;
    const mountain = isMountainLandNode(node);
    const symbolId = mountain ? `mountain-${getMountainType(node)}` : `tree-${getForestType(node)}`;
    const outline = SYMBOL_FIT_OUTLINES[symbolId];
    const rotation = rng.float(-1, 1) * (mountain ? 3 : 5);
    const desiredScale = Math.max(
      symbolFontSizeForNode(node, map) * (mountain ? 0.9 : 0.6),
      mapScale * (mountain ? 0.65 : 0.5),
    );
    const wantedScale = desiredScale * (1 + rng.float(-1, 1) * (mountain ? 0.12 : 0.18));
    const scale = largestFittingScale(
      anchor,
      outline,
      wantedScale,
      desiredScale * (mountain ? 0.4 : 0.45),
      rotation,
      node.id,
      mountain ? mountainContains : forestContains,
      clearOfWater,
    );
    if (scale === null) continue;
    const halfWidth =
      Math.max(...SYMBOL_SILHOUETTES[symbolId].map((point) => Math.abs(point.x))) * scale;
    // The extra serialization slack in the index protects this minimum after SVG rounding.
    if (!acceptSpacing(anchor, halfWidth * 0.55)) continue;
    out.push({
      x: anchor.x,
      y: anchor.y,
      box: glyphBox(anchor, SYMBOL_FIT_OUTLINES[symbolId], scale, rotation),
      el: `<use href="#${symbolId}" transform="translate(${anchor.x.toFixed(3)}, ${anchor.y.toFixed(3)}) rotate(${rotation.toFixed(1)}) scale(${scale.toFixed(3)})"/>`,
    });
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

function getMountainType(node: MapNode): 'high' | 'low' | null {
  if (!isMountainLandNode(node)) return null;
  const b = node.biomeId?.toLowerCase() ?? '';
  if (node.elevation > 0.82 || b.includes('alpine') || b.includes('high mountain')) {
    return 'high';
  }
  return 'low';
}

const MAP_TEXT_FONT_FAMILY = '&apos;Times New Roman&apos;, Times, serif';
/** Very dark brown, so map text reads as ink on parchment rather than fading into the terrain. */
const MAP_TEXT_INK = CARTOGRAPHY.palette.text.color;

/** Marker radius in map units: the ring's radius, and the basis for the capital's star. */
function settlementMarkerRadius(node: MapNode, map: RegionMap): number {
  return Math.max(0.25, symbolFontSizeForNode(node, map) * 0.45);
}

/** How far the drawn marker reaches from its center — the star covers more ground than a ring. */
const CAPITAL_MARKER_EXTENT_FACTOR = 1.6;

/**
 * Half-extent of a settlement's marker. Label placement and marker reservation both measure from
 * this, so a label always clears the marker it belongs to instead of being pushed off the map.
 */
function settlementMarkerExtent(
  settlement: RegionMapSvgSettlement,
  node: MapNode,
  map: RegionMap,
): number {
  const radius = settlementMarkerRadius(node, map);
  return settlement.isCapital === true
    ? radius * CAPITAL_MARKER_EXTENT_FACTOR + 0.07
    : radius + STROKE_WIDTHS.fine / 2 + INK_EDGE_MAX_OFFSET;
}

function appendSettlements(
  map: RegionMap,
  settlements: RegionMapSvgSettlement[],
  parts: string[],
): void {
  const rings: string[] = [];
  const stars: string[] = [];
  for (const s of settlements) {
    if (s.mapNodeId === undefined) continue;
    const node = map.nodes[s.mapNodeId];
    if (!node) continue;
    const x = node.center.x;
    const y = node.center.y;
    const r = settlementMarkerRadius(node, map);
    if (s.isCapital) {
      // The capital star is the one prominent glyph on the sheet, so it keeps a shadow — drawn as an
      // offset copy rather than a blur filter, which for a single element is the same picture for far
      // less work.
      stars.push(
        `<text x="${n(x + 0.05)}" y="${n(y + 0.07)}" font-size="${n(r * 3)}" fill="${SYMBOL_SHADOW_INK}" fill-opacity="${SYMBOL_SHADOW_OPACITY}">${escapeXml('★')}</text>`,
        `<text x="${n(x)}" y="${n(y)}" font-size="${n(r * 3)}" fill="${CARTOGRAPHY.palette.text.color}">${escapeXml('★')}</text>`,
      );
    } else {
      rings.push(
        `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.fine}"/>`,
      );
    }
  }
  if (rings.length > 0) {
    parts.push(`<g filter="url(#inkEdge)">
${rings.join('\n')}
</g>`);
  }
  if (stars.length > 0) {
    parts.push(
      `<g font-family="Georgia, serif" text-anchor="middle" dominant-baseline="middle" font-weight="bold">
${stars.join('\n')}
</g>`,
    );
  }
}

type TextBox = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

/**
 * Conservative advance bounds for Times New Roman and its serif fallbacks. Export renderers such
 * as librsvg ignore textLength, so safety must come from reserved space, not forced glyph fitting.
 * Decomposed accents use their base letter's advance; unfamiliar characters get a full em.
 */
function estimateTextWidth(text: string, fontSize: number): number {
  let ems = 0;
  for (const ch of text.normalize('NFD')) {
    if (/\p{Mark}/u.test(ch)) continue;
    if (/\s/.test(ch)) ems += 0.34;
    else if (/[ijlIt.,;:'!|]/.test(ch)) ems += 0.4;
    else if (/[mwMW@%]/.test(ch)) ems += 1.05;
    else if (/[A-Z]/.test(ch)) ems += 0.8;
    else if (/[a-z0-9]/.test(ch)) ems += 0.6;
    else ems += 1.1;
  }
  return ems * fontSize;
}

/** Cap height above the baseline and descender below it, as fractions of the font size. */
const TEXT_ASCENT = 1.0;
const TEXT_DESCENT = 0.35;
/** Breathing room around a label so neighbouring text does not touch. */
const TEXT_BOX_PADDING = 0.12;

function textBox(
  text: string,
  x: number,
  baselineY: number,
  fontSize: number,
  anchor: 'middle' | 'start' | 'end',
): TextBox {
  const width = estimateTextWidth(text, fontSize);
  const padding = TEXT_BOX_PADDING + (fontSize * LABEL_HALO_EMS) / 2 + 0.005;
  const left = anchor === 'middle' ? x - width / 2 : anchor === 'start' ? x : x - width;
  return {
    minX: left - padding,
    maxX: left + width + padding,
    minY: baselineY - fontSize * TEXT_ASCENT - padding,
    maxY: baselineY + fontSize * TEXT_DESCENT + padding,
  };
}

function overlapArea(a: TextBox, b: TextBox): number {
  const width = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const height = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY);
  if (width <= 0 || height <= 0) return 0;
  return width * height;
}

function boxIsInsideMap(box: TextBox, map: RegionMap): boolean {
  return box.minX >= 0 && box.maxX <= map.width && box.minY >= 0 && box.maxY <= map.height;
}

/**
 * The two copies that make up one piece of map text. They are emitted in separate passes — every
 * halo on the sheet, then every ink — because a halo is an opaque parchment stroke reaching about a
 * tenth of an em beyond its glyphs, so a halo drawn after a neighbour's ink erases the bottom off
 * those letters. Interleaving the pair per label made the title, which is drawn last and is the
 * largest text on the sheet, eat into any settlement name it was placed near.
 */
type TextParts = {
  box: TextBox;
  halo: string;
  ink: string;
};

/**
 * A parchment halo behind the glyphs keeps a label readable over forest or a mountain range. It is
 * drawn as a separate stroked copy underneath rather than with `paint-order="stroke"`, which not
 * every renderer honours — where it is ignored the halo paints over the fill and the text washes out.
 */
function textElement(
  text: string,
  x: number,
  baselineY: number,
  fontSize: number,
  anchor: 'middle' | 'start' | 'end',
  haloEms: number,
): TextParts {
  const shared = `x="${x.toFixed(3)}" y="${baselineY.toFixed(3)}" font-family="${MAP_TEXT_FONT_FAMILY}" font-size="${fontSize.toFixed(3)}" text-anchor="${anchor}"`;
  const safe = escapeXml(text);
  const box = textBox(
    text,
    Number(x.toFixed(3)),
    Number(baselineY.toFixed(3)),
    Number(fontSize.toFixed(3)),
    anchor,
  );
  const bounds = [box.minX, box.minY, box.maxX, box.maxY].map(n).join(' ');
  return {
    box,
    halo: `<text ${shared} fill="none" stroke="${PARCHMENT_FILL}" stroke-width="${(fontSize * haloEms).toFixed(3)}" stroke-linejoin="round">${safe}</text>`,
    ink: `<text ${shared} data-text-box="${bounds}" fill="${MAP_TEXT_INK}">${safe}</text>`,
  };
}

/** The title sits on open parchment; settlement names have to cut through terrain symbols. */
const TITLE_HALO_EMS = 0.1;
const LABEL_HALO_EMS = 0.12;

type MapTitleLayout = {
  panel: string;
  fontSize: number;
  parts: TextParts;
  box: TextBox;
};

/** Sized off the sheet rather than the text, so every label can be measured against it. */
function mapTitleFontSize(map: RegionMap): number {
  return Math.max(1.2, Math.min(map.width * 0.05, map.height * 0.09, 4));
}

/** A restrained parchment panel, positioned clear of settlement markers and inside the sheet. */
function layoutMapTitle(title: string, map: RegionMap, markers: TextBox[]): MapTitleLayout | null {
  if (title.trim().length === 0) return null;
  const margin = Math.min(map.width, map.height) * 0.015;
  const availableWidth = map.width - margin * 2;
  const fontSize = Math.min(
    mapTitleFontSize(map) * 0.65,
    availableWidth / (estimateTextWidth(title, 1) + 1.6),
  );
  if (fontSize < 0.25) return null;
  // Leave room for a name beside a marker at the top edge, so moving the panel does not send
  // that name far down the map. Try a modestly smaller panel before moving it below a marker.
  const topLabelHeight =
    fontSize * 0.9 * (TEXT_ASCENT + TEXT_DESCENT + LABEL_HALO_EMS) + TEXT_BOX_PADDING * 2 + 0.01;
  const tops = [margin, ...markers.map((box) => Math.max(box.maxY, topLabelHeight) + margin)].sort(
    (a, b) => a - b,
  );
  for (const minY of tops) {
    for (const factor of [1, 0.95, 0.9, 0.85]) {
      const layout = titlePanelAt(title, map, fontSize * factor, minY);
      if (
        boxIsInsideMap(layout.box, map) &&
        !markers.some((marker) => overlapArea(layout.box, marker) > 0)
      )
        return layout;
    }
  }
  return null;
}

function titlePanelAt(
  title: string,
  map: RegionMap,
  fontSize: number,
  minY: number,
): MapTitleLayout {
  const padding = fontSize * 0.2;
  const label = textBox(title, map.width / 2, 0, fontSize, 'middle');
  const width = label.maxX - label.minX + padding * 2;
  const height = label.maxY - label.minY + padding * 2;
  const minX = (map.width - width) / 2;
  const box = { minX, maxX: minX + width, minY, maxY: minY + height };
  const stroke = Math.min(STROKE_WIDTHS.fine, fontSize * 0.05);
  // The reserved box includes the border; inset its centreline by half the stroke.
  const panel = `<rect id="title-cartouche" x="${n(minX + stroke / 2)}" y="${n(minY + stroke / 2)}" width="${n(width - stroke)}" height="${n(height - stroke)}" rx="${n(fontSize * 0.08)}" fill="${PARCHMENT_FILL}" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${n(stroke)}"/>`;
  return {
    panel,
    fontSize,
    box,
    parts: textElement(
      title,
      map.width / 2,
      minY + padding - label.minY,
      fontSize,
      'middle',
      TITLE_HALO_EMS,
    ),
  };
}

/** Use the same boxes and hard collision rule for compass, title, markers, and labels. */
function glyphBox(anchor: Vertex, outline: Vertex[], scale: number, rotation: number): TextBox {
  const angle = (rotation * Math.PI) / 180;
  const points = outline.map((point) => ({
    x: anchor.x + scale * (point.x * Math.cos(angle) - point.y * Math.sin(angle)),
    y: anchor.y + scale * (point.x * Math.sin(angle) + point.y * Math.cos(angle)),
  }));
  return {
    minX: Math.min(...points.map((point) => point.x)) - 0.15,
    maxX: Math.max(...points.map((point) => point.x)) + 0.15,
    minY: Math.min(...points.map((point) => point.y)) - 0.15,
    maxY: Math.max(...points.map((point) => point.y)) + 0.15,
  };
}

function segmentBox(a: Vertex, b: Vertex, padding: number): TextBox {
  return {
    minX: Math.min(a.x, b.x) - padding,
    maxX: Math.max(a.x, b.x) + padding,
    minY: Math.min(a.y, b.y) - padding,
    maxY: Math.max(a.y, b.y) + padding,
  };
}

function layoutCompass(
  map: RegionMap,
  reserved: TextBox[],
  symbols: ScatterSymbol[],
  water: WaterPolygonItem[],
  routeBoxes: TextBox[],
): TextBox | null {
  const scale = Math.min(map.width, map.height) / 35;
  const obstacles = [...reserved, ...routeBoxes, ...symbols.map((symbol) => symbol.box)];
  for (const body of water)
    for (let i = 0; i < body.outline.length; i++)
      obstacles.push(
        segmentBox(body.outline[i], body.outline[(i + 1) % body.outline.length], 0.3 * scale),
      );
  // Search from the corners inward; shrink modestly before giving up on a crowded drawing.
  for (const size of [1, 0.8, 0.6]) {
    const width = 3.4 * scale * size,
      height = 4.3 * scale * size;
    const gap = 0.5 * scale;
    const candidates: TextBox[] = [];
    for (let y = gap; y + height <= map.height - gap; y += scale)
      for (let x = gap; x + width <= map.width - gap; x += scale)
        candidates.push({ minX: x, maxX: x + width, minY: y, maxY: y + height });
    const cornerDistance = (box: TextBox) =>
      Math.min(box.minX, map.width - box.maxX) + Math.min(box.minY, map.height - box.maxY);
    candidates.sort(
      (a, b) => cornerDistance(a) - cornerDistance(b) || a.minY - b.minY || b.minX - a.minX,
    );
    const empty = candidates.find(
      (box) =>
        boxIsInsideMap(box, map) && !obstacles.some((obstacle) => overlapArea(box, obstacle) > 0),
    );
    if (empty) return empty;
  }
  return null;
}

function compassRose(box: TextBox): string {
  const size = (box.maxX - box.minX) / 3.4;
  const x = (box.minX + box.maxX) / 2,
    y = box.minY + 2.55 * size;
  const bounds = [box.minX, box.minY, box.maxX, box.maxY].map(n).join(' ');
  return `<g id="map-compass" data-reserved-box="${bounds}" transform="translate(${n(x)} ${n(y)}) scale(${n(size)})" aria-label="North">
<rect x="-1.65" y="-2.5" width="3.3" height="4.2" rx="1.4" fill="${PARCHMENT_FILL}"/>
<g stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.hairline}" stroke-linejoin="round">
<path d="M 0 -1.35 L 0.28 -0.28 L 1.35 0 L 0.28 0.28 L 0 1.35 L -0.28 0.28 L -1.35 0 L -0.28 -0.28 Z" fill="${PARCHMENT_FILL}"/>
<path d="M 0 -1.35 L 0 0 L -0.28 -0.28 Z M 1.35 0 L 0 0 L 0.28 -0.28 Z M 0 1.35 L 0 0 L 0.28 0.28 Z M -1.35 0 L 0 0 L -0.28 0.28 Z" fill="${CARTOGRAPHY.palette.body.color}"/>
</g>
<text x="0" y="-1.7" text-anchor="middle" font-family="${MAP_TEXT_FONT_FAMILY}" font-size="0.7" fill="${MAP_TEXT_INK}">N</text>
</g>`;
}

/** Two quiet ruled lines surround the clipped drawing, entirely inside the parchment margin. */
function mapFrame(map: RegionMap, marginX: number, marginY: number): string {
  return `<g id="map-frame" fill="none" stroke="${CARTOGRAPHY.palette.body.color}">${[0, 0.35]
    .map(
      (fraction, i) =>
        `<rect x="${n(-marginX * fraction)}" y="${n(-marginY * fraction)}" width="${n(map.width + marginX * fraction * 2)}" height="${n(map.height + marginY * fraction * 2)}" stroke-width="${n(((i === 0 ? STROKE_WIDTHS.fine : STROKE_WIDTHS.hairline) * Math.min(map.width, map.height)) / 35)}"/>`,
    )
    .join('')}</g>`;
}

/** Largest label a settlement may take, as a fraction of the title — the title has to stay biggest. */
const MAX_LABEL_FRACTION_OF_TITLE = 0.62;

/**
 * Population drives label size on a log scale, spread wide enough that a hamlet of 30 and a city of
 * 30,000 are plainly different sizes rather than a few pixels apart. Log scale because settlement
 * populations span orders of magnitude; a linear ramp would leave everything below a capital tiny.
 */
function settlementLabelFontSize(
  settlement: RegionMapSvgSettlement,
  titleFontSize: number,
): number {
  const population = Math.max(1, settlement.population ?? 1);
  const growth = Math.min(1, Math.log10(population) / 5);
  const capitalBoost = settlement.isCapital === true ? 1.1 : 1;
  const fraction = (0.22 + growth * 0.4) * capitalBoost;
  return titleFontSize * Math.min(fraction, MAX_LABEL_FRACTION_OF_TITLE);
}

type LabelCandidate = {
  x: number;
  baselineY: number;
  anchor: 'middle' | 'start' | 'end';
};

/**
 * Preferred placement is centered above the marker, the rest are fallbacks in decreasing order.
 * Offsets clear the marker by the text box's own padding, so the first choice is not rejected for
 * colliding with the very settlement it names.
 */
function labelCandidates(
  anchorPoint: Vertex,
  markerExtent: number,
  fontSize: number,
): LabelCandidate[] {
  const { x, y } = anchorPoint;
  const gap = markerExtent + fontSize * 0.2 + TEXT_BOX_PADDING;
  const far = gap * 2;
  const above = y - gap - fontSize * TEXT_DESCENT;
  const below = y + gap + fontSize * TEXT_ASCENT;
  const beside = y + fontSize * (TEXT_ASCENT - TEXT_DESCENT) * 0.5;
  return [
    { x, baselineY: above, anchor: 'middle' },
    { x: x + gap, baselineY: beside, anchor: 'start' },
    { x: x - gap, baselineY: beside, anchor: 'end' },
    { x, baselineY: below, anchor: 'middle' },
    { x: x + gap, baselineY: above, anchor: 'start' },
    { x: x - gap, baselineY: above, anchor: 'end' },
    { x: x + gap, baselineY: below, anchor: 'start' },
    { x: x - gap, baselineY: below, anchor: 'end' },
    { x, baselineY: y - far - fontSize * TEXT_DESCENT, anchor: 'middle' },
    { x, baselineY: y + far + fontSize * TEXT_ASCENT, anchor: 'middle' },
  ];
}

type PlaceableLabel = {
  name: string;
  point: Vertex;
  markerExtent: number;
  fontSize: number;
  /** Larger settlements are placed first, so they keep the spot directly above the marker. */
  priority: number;
};

function listPlaceableLabels(
  map: RegionMap,
  settlements: RegionMapSvgSettlement[],
  titleFontSize: number,
): PlaceableLabel[] {
  const out: PlaceableLabel[] = [];
  for (const s of settlements) {
    if (s.mapNodeId === undefined || s.name === undefined || s.name.length === 0) continue;
    const node = map.nodes[s.mapNodeId];
    if (!node) continue;
    out.push({
      name: s.name,
      point: node.center,
      markerExtent: settlementMarkerExtent(s, node, map),
      fontSize: settlementLabelFontSize(s, titleFontSize),
      priority: (s.isCapital === true ? 1e9 : 0) + (s.population ?? 0),
    });
  }
  return out.sort((a, b) => b.priority - a.priority);
}

type LabelPlacement = {
  candidate: LabelCandidate;
  box: TextBox;
  /** Overlap with other labels only; cartouche and marker collisions are forbidden. */
  collision: number;
};

/** Clamp candidates onto the sheet, reject hard obstacles, then minimize other-label overlap. */
function bestLabelPlacement(
  label: PlaceableLabel,
  map: RegionMap,
  taken: TextBox[],
  forbidden: TextBox[],
): LabelPlacement | null {
  let best: LabelPlacement | null = null;

  const candidates = labelCandidates(label.point, label.markerExtent, label.fontSize);
  // Names near a cartouche can move just beyond its top or bottom instead of being lost.
  for (const obstacle of forbidden) {
    candidates.push(
      {
        x: label.point.x,
        baselineY: obstacle.maxY + label.fontSize * (TEXT_ASCENT + 0.2) + TEXT_BOX_PADDING,
        anchor: 'middle',
      },
      {
        x: label.point.x,
        baselineY: obstacle.minY - label.fontSize * (TEXT_DESCENT + 0.2) - TEXT_BOX_PADDING,
        anchor: 'middle',
      },
    );
  }
  for (const original of candidates) {
    let candidate = { ...original };
    let box = textBox(
      label.name,
      candidate.x,
      candidate.baselineY,
      label.fontSize,
      candidate.anchor,
    );
    if (box.maxX - box.minX > map.width || box.maxY - box.minY > map.height) continue;
    const dx = Math.max(0, -box.minX) - Math.max(0, box.maxX - map.width);
    const dy = Math.max(0, -box.minY) - Math.max(0, box.maxY - map.height);
    candidate = { ...candidate, x: candidate.x + dx, baselineY: candidate.baselineY + dy };
    box = textBox(label.name, candidate.x, candidate.baselineY, label.fontSize, candidate.anchor);
    if (!boxIsInsideMap(box, map) || forbidden.some((obstacle) => overlapArea(box, obstacle) > 0))
      continue;

    const collision = taken.reduce((sum, other) => sum + overlapArea(box, other), 0);
    if (collision === 0) return { candidate, box, collision };
    if (best === null || collision < best.collision) {
      best = { candidate, box, collision };
    }
  }

  return best;
}

/** Places settlement names largest-settlement-first, so the biggest keep the spot above the marker. */
function layoutSettlementLabels(
  map: RegionMap,
  settlements: RegionMapSvgSettlement[],
  titleFontSize: number,
  occupied: TextBox[],
): TextParts[] {
  const taken: TextBox[] = [];
  const parts: TextParts[] = [];

  for (const label of listPlaceableLabels(map, settlements, titleFontSize)) {
    const placement = bestLabelPlacement(label, map, taken, occupied);
    if (placement === null) continue;

    taken.push(placement.box);
    parts.push(
      textElement(
        label.name,
        placement.candidate.x,
        placement.candidate.baselineY,
        label.fontSize,
        placement.candidate.anchor,
        LABEL_HALO_EMS,
      ),
    );
  }

  return parts;
}

/** Marker footprints, so a label never lands on another settlement's star or ring. */
function settlementMarkerBoxes(map: RegionMap, settlements: RegionMapSvgSettlement[]): TextBox[] {
  const out: TextBox[] = [];
  for (const s of settlements) {
    if (s.mapNodeId === undefined) continue;
    const node = map.nodes[s.mapNodeId];
    if (!node) continue;
    const r = settlementMarkerExtent(s, node, map);
    out.push({
      minX: node.center.x - r,
      maxX: node.center.x + r,
      minY: node.center.y - r,
      maxY: node.center.y + r,
    });
  }
  return out;
}

/**
 * Body outlines shared between a symbol's artwork and its baked shadow, so the two can never drift
 * apart. Only the outermost shape of each symbol is listed: a symbol's interior detail lines sit
 * inside its own silhouette, where a shadow would be hidden by the artwork drawn over it.
 */
const TREE_OAK_CANOPY_D =
  'M -0.8 -0.5 C -1.2 -0.8, -1.2 -1.4, -0.6 -1.6 C -0.8 -2.0, -0.2 -2.3, 0 -2.0 C 0.2 -2.3, 0.8 -2.0, 0.6 -1.6 C 1.2 -1.4, 1.2 -0.8, 0.8 -0.5 Z';
const TREE_PINE_BODY_D =
  'M 0 -2.0 L -0.6 -1.1 L -0.2 -1.1 L -0.8 -0.4 L 0.8 -0.4 L 0.2 -1.1 L 0.6 -1.1 Z';
const TREE_PALM_TRUNK_D = 'M 0 0 Q -0.15 -0.5, 0 -1.2';
const TREE_PALM_FRONDS_D =
  'M 0 -1.2 Q -0.4 -1.5, -0.8 -1.3 M 0 -1.2 Q -0.5 -1.7, -0.5 -0.9 M 0 -1.2 Q 0.1 -1.8, -0.1 -1.5 M 0 -1.2 Q 0.5 -1.7, 0.5 -0.9 M 0 -1.2 Q 0.4 -1.5, 0.8 -1.3';
const MOUNTAIN_HIGH_BODY_D = 'M -1.4 0 L -0.4 -1.8 L 0.1 -1.1 L 0.6 -1.5 L 1.4 0 Z';
const MOUNTAIN_LOW_BODY_D = 'M -1.0 0 L -0.3 -1.0 L 0.1 -0.6 L 0.5 -0.8 L 1.0 0 Z';

/**
 * Shadow ink baked into the symbol definitions as an offset copy of the silhouette, replacing the
 * per-instance `feDropShadow` filter that used to sit on every one of the ~1000 scattered glyphs.
 * Each filtered element costs its own offscreen buffer and blur pass, which dominated render time.
 * The offset runs slightly longer than the old filter's to read as soft without an actual blur.
 */
const SYMBOL_SHADOW_INK = CARTOGRAPHY.palette.body.color;
const SYMBOL_SHADOW_OPACITY = 0.3;
const SYMBOL_SHADOW_OFFSET = 'translate(0.05, 0.07)';

/** Offset silhouette drawn under a symbol's artwork; `stroked` widens thin art so it casts at all. */
function symbolShadowPath(d: string, stroked = false): string {
  const paint = stroked
    ? `fill="none" stroke="${SYMBOL_SHADOW_INK}" stroke-width="${STROKE_WIDTHS.fine}" stroke-opacity="${SYMBOL_SHADOW_OPACITY}" stroke-linecap="round"`
    : `fill="${SYMBOL_SHADOW_INK}" fill-opacity="${SYMBOL_SHADOW_OPACITY}" stroke="none"`;
  return `<path d="${d}" transform="${SYMBOL_SHADOW_OFFSET}" ${paint}/>`;
}

function svgDefs(map: RegionMap): string {
  return `<defs>
  ${cartographyFilterDefs(map.width, map.height)}
  <g id="tree-oak">
    ${symbolShadowPath(TREE_OAK_CANOPY_D)}
    <path d="M 0 0 L 0 -0.5" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.fine}" stroke-linecap="round"/>
    <path d="${TREE_OAK_CANOPY_D}" fill="${CARTOGRAPHY.ground.fill}" fill-opacity="0.95" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.fine}" stroke-linejoin="round"/>
  </g>
  <g id="tree-pine">
    ${symbolShadowPath(TREE_PINE_BODY_D)}
    <path d="M 0 0 L 0 -0.4" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.fine}" stroke-linecap="round"/>
    <path d="${TREE_PINE_BODY_D}" fill="${CARTOGRAPHY.ground.fill}" fill-opacity="0.95" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.fine}" stroke-linejoin="round"/>
  </g>
  <g id="tree-palm">
    ${symbolShadowPath(TREE_PALM_TRUNK_D, true)}
    ${symbolShadowPath(TREE_PALM_FRONDS_D, true)}
    <path d="${TREE_PALM_TRUNK_D}" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.fine}" stroke-linecap="round"/>
    <path d="${TREE_PALM_FRONDS_D}" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.hairline}" stroke-linecap="round"/>
  </g>
  <g id="mountain-high">
    ${symbolShadowPath(MOUNTAIN_HIGH_BODY_D)}
    <path d="${MOUNTAIN_HIGH_BODY_D}" fill="${CARTOGRAPHY.ground.fill}" fill-opacity="0.9" stroke="none"/>
    <path d="M -1.4 0 L -0.4 -1.8 L 0.1 -1.1 L 0.6 -1.5 L 1.4 0" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.fine}" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M -0.4 -1.8 L -0.6 -0.6" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.fine}" stroke-linecap="round"/>
    <path d="M 0.6 -1.5 L 0.4 -0.5" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.fine}" stroke-linecap="round"/>
    <path d="M -0.35 -1.5 L -0.2 -1.5 M -0.3 -1.2 L -0.1 -1.2 M -0.25 -0.9 L -0.05 -0.9 M -0.2 -0.6 L 0.0 -0.6" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.hairline}" stroke-linecap="round"/>
    <path d="M 0.65 -1.2 L 0.8 -1.2 M 0.6 -0.9 L 0.75 -0.9 M 0.55 -0.6 L 0.7 -0.6 M 0.5 -0.3 L 0.65 -0.3" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.hairline}" stroke-linecap="round"/>
  </g>
  <g id="mountain-low">
    ${symbolShadowPath(MOUNTAIN_LOW_BODY_D)}
    <path d="${MOUNTAIN_LOW_BODY_D}" fill="${CARTOGRAPHY.ground.fill}" fill-opacity="0.9" stroke="none"/>
    <path d="M -1.0 0 L -0.3 -1.0 L 0.1 -0.6 L 0.5 -0.8 L 1.0 0" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.hairline}" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M -0.3 -1.0 L -0.4 -0.3" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.hairline}" stroke-linecap="round"/>
    <path d="M 0.5 -0.8 L 0.4 -0.3" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${STROKE_WIDTHS.hairline}" stroke-linecap="round"/>
  </g>
</defs>`;
}

/**
 * Builds a region map on parchment: coast-following water hatching, rivers and roads, terrain
 * glyphs, and optional named settlements. Forests and ranges are represented only by their glyphs.
 */
export function buildRegionMapSvgString(map: RegionMap, options?: RegionMapSvgOptions): string {
  const w = map.width;
  const h = map.height;
  const title = options?.title ?? '';
  const settlements = options?.settlements ?? [];
  const reserved = settlementMarkerBoxes(map, settlements);
  const titleLayout = layoutMapTitle(title, map, reserved);

  const body: string[] = [];
  const routeBoxes: TextBox[] = [];
  const waterPolygons = listWaterPolygonsForMap(map);
  const clearOfWater = makeWaterClearanceTest(
    waterPolygons.map((item) => item.outline),
    WATER_EDGE_MARGIN,
  );
  const symbols = collectScatterSymbols(map, clearOfWater);
  if (titleLayout !== null) reserved.push(titleLayout.box);
  body.push(waterGeometryDefs(waterPolygons));
  appendWaterBodiesFromItems(waterPolygons, body, w, h);
  appendRivers(map, body, waterPolygons, routeBoxes);
  appendScatterSymbolsBackToFront(symbols, body);
  appendRoads(map, body, settlements, routeBoxes);
  appendSettlements(map, settlements, body);

  // Only other-label crowding is soft. The sheet, cartouche, and marker boundaries are hard.
  const textParts = layoutSettlementLabels(
    map,
    settlements,
    titleLayout === null
      ? mapTitleFontSize(map)
      : Math.min(mapTitleFontSize(map), (titleLayout.fontSize * 0.9) / MAX_LABEL_FRACTION_OF_TITLE),
    reserved,
  );
  if (titleLayout !== null) {
    textParts.push(titleLayout.parts);
  }
  const compass = layoutCompass(
    map,
    [...reserved, ...textParts.map((part) => part.box)],
    symbols,
    waterPolygons,
    routeBoxes,
  );
  const textLayer =
    textParts.length === 0
      ? ''
      : `<g id="map-text">
${textParts.map((t) => t.halo).join('\n')}
${textParts.map((t) => t.ink).join('\n')}
</g>`;

  const marginX = w * 0.05,
    marginY = h * 0.05;
  const sheetW = w + marginX * 2,
    sheetH = h + marginY * 2;
  const inner = `${svgDefs(map)}
<g transform="translate(${n(-marginX)} ${n(-marginY)})">${parchmentRect(sheetW, sheetH)}</g>
<defs><clipPath id="map-content-clip"><rect width="${w}" height="${h}"/></clipPath></defs>
<g id="map-content" clip-path="url(#map-content-clip)">
<g id="map-layers">
${body.join('\n')}
</g>
${titleLayout?.panel ?? ''}
${compass === null ? '' : compassRose(compass)}
${textLayer}
</g>
${mapFrame(map, marginX, marginY)}`;

  const scale = Math.min(DEFAULT_SVG_MAX_WIDTH / w, DEFAULT_SVG_MAX_HEIGHT / h);
  const pixelW = w * scale;
  const pixelH = h * scale;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(-marginX)} ${n(-marginY)} ${n(sheetW)} ${n(sheetH)}" width="${n(pixelW)}" height="${n(pixelH)}">
${inner}
</svg>`;
}
