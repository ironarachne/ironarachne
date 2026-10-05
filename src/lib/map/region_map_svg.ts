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
  cartographyFilterDefs,
  parchmentRect,
} from '$lib/cartography';
import { makeWaterClearanceTest } from './water_clearance';
import { assignTerrainGlyphs } from './terrain_glyph_assignment';
import { deriveDesertOasisSites, desertBiomeKind } from './desert_terrain';
import { REGION_LAND_FILL, REGION_WATER_FILL, terrainToneSvg } from './terrain_tones';
import { riverEnvelope } from './river_geometry';
import { riverNetworkError } from './river_validation';
import { TERRAIN_GLYPHS, TERRAIN_GLYPH_VARIANTS } from './terrain_glyph_catalog';
import { inkStrokePath } from './terrain_glyph_ink';
import { cappedTreeScale, isTreeGlyph, treeSizeCeiling } from './terrain_glyph_sizing';
import { CAPITAL_PENNANT, SETTLEMENT_BUILDING_VARIANTS } from './settlement_icon_catalog';
import { capitalPennantAnchor, placeSettlementIcon } from './settlement_icons';
import type { PlacedSettlementIcon } from './settlement_icon_types';
import type {
  PlacedTerrainGlyph,
  TerrainGlyphAssignment,
  TerrainGlyphFamily,
  TextBox,
} from './terrain_glyph_types';
import { buildRoadCentroidPolylines } from './road_polylines.js';
import {
  atMapEdge,
  connectedRiverReaches,
  riverChannelWidth,
  riverRibbon,
  sampleRiverCurve,
  subdivideRiverChordJittered,
} from './river_paths';

import type {
  RegionMapSvgSettlement,
  RegionMapSvgOptions,
  RegionMapSvgFeature,
} from './region_map_svg_types';
export type {
  RegionMapSvgSettlement,
  RegionMapSvgOptions,
  RegionMapSvgFeature,
} from './region_map_svg_types';

/** Default max pixel size; aspect ratio of map.width:map.height is preserved (fits inside this box). */
const DEFAULT_SVG_MAX_WIDTH = 900;
const DEFAULT_SVG_MAX_HEIGHT = 600;

const PARCHMENT_FILL = CARTOGRAPHY.ground.fill;

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
  nodeIds: Set<number>;
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
      out.push({ id: `waterBody${out.length}`, outline: verts, d, strokeKind, nodeIds: comp });
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
  riverOutlines: Vertex[][],
): void {
  if (map.rivers !== undefined) {
    const error = riverNetworkError(map, map.rivers);
    if (error) throw new Error(error);
    if (map.rivers.reaches.length === 0) return;
    {
      appendRiverNetwork(map, parts, waterPolygons, routeBoxes, riverOutlines);
      return;
    }
  }
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
    const bankOutline = riverRibbon(
      points,
      start,
      end,
      reach.source,
      STROKE_WIDTHS.hairline * scale,
      scale,
    );
    riverOutlines.push(bankOutline);
    banks.push(
      `<path data-river-edge="${reach.edge.id}" data-flow="${reach.edge.river}" d="${polygonToPathD(bankOutline)}"/>`,
    );
    channels.push(
      `<path d="${polygonToPathD(riverRibbon(points, start, end, reach.source, 0, scale))}"/>`,
    );
    if (!reach.source) joins.set(reach.from, Math.max(joins.get(reach.from) ?? 0, start));
    joins.set(reach.to, Math.max(joins.get(reach.to) ?? 0, end));
  }
  for (const [id, width] of joins) {
    const p = map.corners[id].point;
    riverOutlines.push(circleClearanceOutline(p, width / 2 + STROKE_WIDTHS.hairline * scale));
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
      `<g data-map-rivers="true" mask="url(#riverInk)"><g fill="${CARTOGRAPHY.palette.water.color}">${banks.join('\n')}</g><g fill="${REGION_WATER_FILL}">${channels.join('\n')}</g></g>`,
    );
}

/** Circumscribe drawn river join disks so clearance cannot slip between polygon chords. */
function circleClearanceOutline(center: Vertex, radius: number): Vertex[] {
  const outer = radius / Math.cos(Math.PI / 16);
  return Array.from({ length: 16 }, (_, i) => ({
    x: center.x + outer * Math.cos((i * Math.PI) / 8),
    y: center.y + outer * Math.sin((i * Math.PI) / 8),
  }));
}

/** Saved channels drive both ink and clearance. Only a bounded shoreline connector is transient. */
function appendRiverNetwork(
  map: RegionMap,
  parts: string[],
  waterPolygons: WaterPolygonItem[],
  routeBoxes: TextBox[],
  riverOutlines: Vertex[][],
): void {
  const network = map.rivers!;
  const scale = Math.min(map.width, map.height) / 35;
  const junctions = new Map(network.junctions.map((j) => [j.id, j]));
  const banks: string[] = [],
    channels: string[] = [];
  const joins = new Map<string, { width: number; interior: boolean }>();
  for (const saved of network.reaches) {
    const reach = { ...saved, samples: [...saved.samples] };
    const end = junctions.get(reach.toJunctionId)!;
    if (end.role.kind === 'outlet' && end.role.target.kind !== 'boundary') {
      const targetId = end.role.target.nodeId;
      const targetWater = waterPolygons.filter((water) => water.nodeIds.has(targetId));
      if (targetWater.length === 0) throw new Error(`River outlet ${end.id} has no drawn water`);
      const clear = makeWaterClearanceTest(
        targetWater.map((water) => water.outline),
        0,
      );
      if (clear([end.point])) {
        const shore = nearestWaterPoint(end.point, targetWater);
        if (!shore || Math.hypot(shore.x - end.point.x, shore.y - end.point.y) > 2 * scale)
          throw new Error(`River outlet ${end.id} cannot reach its processed shore`);
        const dx = shore.x - end.point.x,
          dy = shore.y - end.point.y,
          length = Math.hypot(dx, dy) || 1;
        reach.samples.push({
          point: {
            x: shore.x + (dx / length) * 0.15 * scale,
            y: shore.y + (dy / length) * 0.15 * scale,
          },
          waterWidth: reach.samples.at(-1)!.waterWidth,
        });
      }
    }
    const interior = network.origin === 'legacy' || saved.sizeClass !== 'stream';
    const bank = interior ? STROKE_WIDTHS.hairline * scale : 0;
    const bankOutline = riverEnvelope(reach, bank);
    riverOutlines.push(bankOutline);
    banks.push(
      `<path data-river-edge="${saved.drainageEdgeId}" data-flow="${saved.flow}" data-river-reach="${escapeXml(saved.id)}" data-river-kind="${saved.kind}" data-river-size="${saved.sizeClass}" d="${polygonToPathD(bankOutline)}"/>`,
    );
    if (interior) channels.push(`<path d="${polygonToPathD(riverEnvelope(reach))}"/>`);
    for (let i = 1; i < reach.samples.length; i++)
      routeBoxes.push(
        segmentBox(
          reach.samples[i - 1].point,
          reach.samples[i].point,
          Math.max(reach.samples[i - 1].waterWidth, reach.samples[i].waterWidth) / 2 +
            bank +
            0.1 * scale,
        ),
      );
    for (const [id, sample] of [
      [reach.fromJunctionId, saved.samples[0]],
      [reach.toJunctionId, saved.samples.at(-1)!],
    ] as const) {
      if (sample.waterWidth === 0) continue;
      const existing = joins.get(id);
      joins.set(id, {
        width: Math.max(existing?.width ?? 0, sample.waterWidth),
        interior: interior || (existing?.interior ?? false),
      });
    }
  }
  for (const [id, join] of joins) {
    const p = junctions.get(id)!.point;
    riverOutlines.push(
      circleClearanceOutline(
        p,
        join.width / 2 + (join.interior ? STROKE_WIDTHS.hairline * scale : 0),
      ),
    );
    banks.push(
      `<circle cx="${n(p.x)}" cy="${n(p.y)}" r="${n(join.width / 2 + (join.interior ? STROKE_WIDTHS.hairline * scale : 0))}"/>`,
    );
    if (join.interior)
      channels.push(`<circle cx="${n(p.x)}" cy="${n(p.y)}" r="${n(join.width / 2)}"/>`);
  }
  const cutouts = waterPolygons
    .map((water) => `<use href="#${water.id}" fill="${MASK_PAINT.hidden}"/>`)
    .join('');
  parts.push(
    `<defs><mask id="riverInk" maskUnits="userSpaceOnUse" x="0" y="0" width="${map.width}" height="${map.height}"><rect width="${map.width}" height="${map.height}" fill="${MASK_PAINT.visible}"/>${cutouts}</mask></defs>`,
  );
  const islands = network.islands
    .map(
      (island) =>
        `<path data-river-island="${escapeXml(island.id)}" d="${polygonToPathD(island.outline)}" fill="${REGION_LAND_FILL}" stroke="${CARTOGRAPHY.palette.water.color}" stroke-width="${n(STROKE_WIDTHS.hairline * scale)}"/>`,
    )
    .join('');
  if (banks.length)
    parts.push(
      `<g data-map-rivers="true" data-river-network-version="1" mask="url(#riverInk)"><g fill="${CARTOGRAPHY.palette.water.color}">${banks.join('\n')}</g><g fill="${REGION_WATER_FILL}">${channels.join('\n')}</g>${islands}</g>`,
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
  TERRAIN_GLYPH_VARIANTS.map((variant) => [variant.id, densifyOutline(variant.footprint)]),
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
function makeScatterNodeLookup(
  map: RegionMap,
  assignments: Map<number, TerrainGlyphAssignment>,
): (point: Vertex) => MapNode | undefined {
  const step = Math.max(map.width, map.height) / 32;
  const bins = new Map<string, MapNode[]>();
  for (const node of map.nodes) {
    if (!assignments.has(node.id)) continue;
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
  waterPolygons: WaterPolygonItem[],
  riverOutlines: Vertex[][],
): PlacedTerrainGlyph[] {
  if (map.width <= 0 || map.height <= 0) return [];
  const assignments = assignTerrainGlyphs(map);
  if (assignments.size === 0) return [];
  const mapScale = Math.min(map.width, map.height) / 35;
  const nodeAt = makeScatterNodeLookup(map, assignments);
  const seedKey = `region-glyphs:${map.width}:${map.height}:${map.nodes.length}`;
  // Candidate generation owns its stream; catalog selection never consumes its RNG draws.
  const candidates = generatePoissonDisk(
    map.width,
    map.height,
    TERRAIN_GLYPHS.hill.candidateSpacingFactor * mapScale,
    new RNG(seedKey),
    30,
    {
      accept: (point) => nodeAt(point) !== undefined,
      maxPoints: 12000,
    },
  );
  const containment = new Map(
    Object.values(TERRAIN_GLYPHS).map((definition) => [
      definition.family,
      makeRegionContainmentTest(map, (node) =>
        definition.family.startsWith('desert')
          ? !isWaterNode(node) && desertBiomeKind(node.biomeId) !== null
          : assignments.get(node.id)?.family === definition.family,
      ),
    ]),
  );
  const acceptSpacing = makeGlyphSpacingTest(mapScale);
  const clearOfRivers = makeWaterClearanceTest(riverOutlines, WATER_EDGE_MARGIN);
  const out: PlacedTerrainGlyph[] = [];
  const place = (anchor: Vertex, family: TerrainGlyphFamily, key: string): boolean => {
    const node = nodeAt(anchor)!;
    const definition = TERRAIN_GLYPHS[family];
    const variant = new RNG(`${key}:variant`).item(definition.variants);
    const styleRng = new RNG(`${key}:style`);
    const outline = SYMBOL_FIT_OUTLINES[variant.id];
    const mountain = family === 'mountain' || family === 'mountainHigh';
    const rawRotation = styleRng.float(-1, 1) * definition.rotationLimitDegrees;
    // Fit and cap trees at the same angle serialized into SVG, so rounding cannot break the ceiling.
    const rotation = isTreeGlyph(family) ? Number(rawRotation.toFixed(1)) : rawRotation;
    const baseScale = Math.max(
      symbolFontSizeForNode(node, map) * definition.scaleFactor,
      mapScale * (mountain ? 0.65 : isTreeGlyph(family) ? 0.35 : 0.5),
    );
    const treeCeiling = treeSizeCeiling(symbolFontSizeForNode(node, map), mapScale);
    const desiredScale = isTreeGlyph(family)
      ? cappedTreeScale(variant, rotation, baseScale, treeCeiling)
      : baseScale;
    const variedScale = desiredScale * (1 + styleRng.float(-1, 1) * (mountain ? 0.12 : 0.18));
    const wantedScale = isTreeGlyph(family)
      ? cappedTreeScale(variant, rotation, variedScale, treeCeiling)
      : variedScale;
    if (wantedScale <= 0) return false;
    const scale = largestFittingScale(
      anchor,
      outline,
      wantedScale,
      desiredScale * definition.minimumScaleRatio,
      rotation,
      node.id,
      containment.get(family)!,
      family.startsWith('desert')
        ? (outline) => clearOfWater(outline) && clearOfRivers(outline)
        : clearOfWater,
    );
    if (scale === null) return false;
    const halfWidth = Math.max(...variant.footprint.map((point) => Math.abs(point.x))) * scale;
    if (!acceptSpacing(anchor, halfWidth * 0.55)) return false;
    out.push({
      nodeId: node.id,
      variantId: variant.id,
      anchor,
      scale,
      rotationDegrees: rotation,
      bounds: glyphBox(anchor, outline, scale, rotation),
    });
    return true;
  };
  for (const site of deriveDesertOasisSites(map)) {
    if (new RNG(`${seedKey}:${site.id}:selection`).float(0, 1) >= 0.35) continue;
    const shore = waterPolygons.filter(
      (water) =>
        water.strokeKind === 'lake' &&
        water.nodeIds.size === site.waterNodeIds.length &&
        site.waterNodeIds.every((id) => water.nodeIds.has(id)),
    );
    if (shore.length === 0) continue;
    const land = new Set(site.shoreNodeIds);
    for (const [index, anchor] of candidates.entries()) {
      if (!land.has(nodeAt(anchor)!.id)) continue;
      const nearest = nearestWaterPoint(anchor, shore);
      if (!nearest || Math.hypot(anchor.x - nearest.x, anchor.y - nearest.y) > 2 * mapScale)
        continue;
      if (place(anchor, 'desertOasis', `${seedKey}:${site.id}:${index}:oasis`)) break;
    }
  }
  for (const [index, anchor] of candidates.entries()) {
    const node = nodeAt(anchor)!;
    const family = assignments.get(node.id)!.family;
    if (isTreeGlyph(family)) continue;
    const key = `${seedKey}:${node.id}:${index}`;
    if (new RNG(`${key}:density`).float(0, 1) >= TERRAIN_GLYPHS[family].densityRatio) continue;
    place(anchor, family, key);
  }
  if ([...assignments.values()].some(({ family }) => isTreeGlyph(family))) {
    const trees = generatePoissonDisk(
      map.width,
      map.height,
      TERRAIN_GLYPHS.treeDeciduous.candidateSpacingFactor * mapScale,
      new RNG(`${seedKey}:trees`),
      30,
      {
        accept: (point) => {
          const node = nodeAt(point);
          return node !== undefined && isTreeGlyph(assignments.get(node.id)!.family);
        },
        maxPoints: 12000,
      },
    );
    for (const [index, anchor] of trees.entries()) {
      const node = nodeAt(anchor)!;
      const family = assignments.get(node.id)!.family;
      const key = `${seedKey}:trees:${node.id}:${index}`;
      if (new RNG(`${key}:density`).float(0, 1) >= TERRAIN_GLYPHS[family].densityRatio) continue;
      place(anchor, family, key);
    }
  }
  return out;
}

/** One painter ordering for all terrain; each glyph is anchored at its ground contact. */
function appendScatterSymbolsBackToFront(symbols: PlacedTerrainGlyph[], parts: string[]): void {
  const ordered = [...symbols].sort((a, b) => a.anchor.y - b.anchor.y || a.anchor.x - b.anchor.x);
  for (const symbol of ordered) {
    parts.push(
      `<use href="#${symbol.variantId}" transform="translate(${symbol.anchor.x.toFixed(3)}, ${symbol.anchor.y.toFixed(3)}) rotate(${symbol.rotationDegrees.toFixed(1)}) scale(${symbol.scale.toFixed(3)})"/>`,
    );
  }
}

const MAP_TEXT_FONT_FAMILY = '&apos;Times New Roman&apos;, Times, serif';
/** Very dark brown, so map text reads as ink on parchment rather than fading into the terrain. */
const MAP_TEXT_INK = CARTOGRAPHY.palette.text.color;

/** Existing site scale supplies the category icon footprint in map units. */
function settlementMarkerRadius(node: MapNode, map: RegionMap): number {
  return Math.max(0.25, symbolFontSizeForNode(node, map) * 0.45);
}

/** Placed once, so painting and every reservation use identical geometry. */
function placeSettlementIcons(
  map: RegionMap,
  settlements: RegionMapSvgSettlement[],
): PlacedSettlementIcon[] {
  return settlements.flatMap((settlement) => {
    const node = map.nodes.find((node) => node.id === settlement.mapNodeId);
    return node
      ? [placeSettlementIcon(map, node, settlement, settlementMarkerRadius(node, map))]
      : [];
  });
}

function appendSettlements(map: RegionMap, icons: PlacedSettlementIcon[], parts: string[]): void {
  for (const placed of icons) {
    const { settlement, icon, anchor, scale, bounds } = placed;
    const site = map.nodes.find((node) => node.id === settlement.mapNodeId)!.center;
    const connector =
      site.x === anchor.x && site.y === anchor.y
        ? ''
        : `<path d="M ${n(site.x)} ${n(site.y)} L ${n(anchor.x)} ${n(anchor.y)}" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="0.04"/>`;
    const buildings = icon.buildings
      .map(
        (building) =>
          `<use data-settlement-building="${building.variantId}" href="#${building.variantId}" transform="translate(${n(building.anchor.x)} ${n(building.anchor.y)}) scale(${n(building.scale)})"/>`,
      )
      .join('');
    const pennant = capitalPennantAnchor(icon);
    const capital = icon.isCapital
      ? `<use data-capital-pennant="true" href="#${CAPITAL_PENNANT.id}" transform="translate(${n(pennant.x)} ${n(pennant.y)})"/>`
      : '';
    parts.push(
      `<g ${featureIdentity(settlement.id, 'settlement')} data-settlement-icon="${icon.category}" data-icon-bounds="${n(bounds.minX)} ${n(bounds.minY)} ${n(bounds.maxX)} ${n(bounds.maxY)}">${connector}<g transform="translate(${anchor.x} ${anchor.y}) scale(${scale})">${buildings}${capital}</g></g>`,
    );
  }
}

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
  // Measure the font size emitted by textElement, so rounding cannot expand a long label
  // beyond the bounds used to place it.
  fontSize = Number(fontSize.toFixed(3));
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

function layoutCompass(map: RegionMap, reserved: TextBox[], routeBoxes: TextBox[]): TextBox | null {
  const scale = Math.min(map.width, map.height) / 35;
  // Terrain, water, and routes are drawn below the compass. Only furniture and text are hard
  // obstacles; dense terrain must not make the compass disappear from an otherwise usable map.
  const obstacles = [...reserved, ...routeBoxes];
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
  markerBounds: TextBox,
  fontSize: number,
): LabelCandidate[] {
  const { x, y } = anchorPoint;
  const padding = fontSize * 0.2 + TEXT_BOX_PADDING;
  const right = markerBounds.maxX + padding;
  const left = markerBounds.minX - padding;
  const far =
    Math.max(
      x - markerBounds.minX,
      markerBounds.maxX - x,
      y - markerBounds.minY,
      markerBounds.maxY - y,
    ) *
      2 +
    padding;
  const above = markerBounds.minY - padding - fontSize * TEXT_DESCENT;
  const below = markerBounds.maxY + padding + fontSize * TEXT_ASCENT;
  const beside = y + fontSize * (TEXT_ASCENT - TEXT_DESCENT) * 0.5;
  return [
    { x, baselineY: above, anchor: 'middle' },
    { x: right, baselineY: beside, anchor: 'start' },
    { x: left, baselineY: beside, anchor: 'end' },
    { x, baselineY: below, anchor: 'middle' },
    { x: right, baselineY: above, anchor: 'start' },
    { x: left, baselineY: above, anchor: 'end' },
    { x: right, baselineY: below, anchor: 'start' },
    { x: left, baselineY: below, anchor: 'end' },
    { x, baselineY: y - far - fontSize * TEXT_DESCENT, anchor: 'middle' },
    { x, baselineY: y + far + fontSize * TEXT_ASCENT, anchor: 'middle' },
  ];
}

type PlaceableLabel = {
  id?: string;
  name: string;
  point: Vertex;
  markerBounds: TextBox;
  fontSize: number;
  /** Larger settlements are placed first, so they keep the spot directly above the marker. */
  priority: number;
};

function listPlaceableLabels(
  icons: PlacedSettlementIcon[],
  titleFontSize: number,
): PlaceableLabel[] {
  const out: PlaceableLabel[] = [];
  for (const placed of icons) {
    const s = placed.settlement;
    if (s.name === undefined || s.name.length === 0) continue;
    out.push({
      id: s.id,
      name: s.name,
      point: placed.anchor,
      markerBounds: placed.bounds,
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

  const candidates = labelCandidates(label.point, label.markerBounds, label.fontSize);
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
  icons: PlacedSettlementIcon[],
  titleFontSize: number,
  occupied: TextBox[],
): TextParts[] {
  const taken: TextBox[] = [];
  const parts: TextParts[] = [];

  for (const label of listPlaceableLabels(icons, titleFontSize)) {
    const placement = bestLabelPlacement(label, map, taken, occupied);
    if (placement === null) continue;

    taken.push(placement.box);
    parts.push(
      identifyText(
        textElement(
          label.name,
          placement.candidate.x,
          placement.candidate.baselineY,
          label.fontSize,
          placement.candidate.anchor,
          LABEL_HALO_EMS,
        ),
        label.id,
        'settlement',
      ),
    );
  }

  return parts;
}

function featureIdentity(id: string | undefined, kind: string): string {
  return id === undefined ? '' : `data-feature-id="${escapeXml(id)}" data-feature-kind="${kind}"`;
}

function identifyText(parts: TextParts, id: string | undefined, kind: string): TextParts {
  if (id === undefined) return parts;
  const identity = featureIdentity(id, kind);
  return {
    ...parts,
    halo: `<g ${identity}>${parts.halo}</g>`,
    ink: `<g ${identity}>${parts.ink}</g>`,
  };
}

/** Use an actual member cell nearest the footprint centre; never label a gap between patches. */
function featurePoint(feature: RegionMapSvgFeature, map: RegionMap): Vertex | undefined {
  const ids = new Set(feature.nodeIds);
  for (const edge of map.edges) {
    if (!feature.edgeIds.includes(edge.id)) continue;
    ids.add(edge.d0);
    if (edge.d1 !== undefined) ids.add(edge.d1);
  }
  const nodes = map.nodes.filter((node) => ids.has(node.id) && !isWaterNode(node));
  if (nodes.length === 0) return undefined;
  const x = nodes.reduce((sum, node) => sum + node.center.x, 0) / nodes.length;
  const y = nodes.reduce((sum, node) => sum + node.center.y, 0) / nodes.length;
  nodes.sort(
    (a, b) =>
      Math.hypot(a.center.x - x, a.center.y - y) - Math.hypot(b.center.x - x, b.center.y - y) ||
      a.id - b.id,
  );
  return nodes[0].center;
}

/** Optional facts yield to settlements and furniture. A symbol is emitted only with a clear label. */
function appendRegionalFeatures(
  map: RegionMap,
  features: RegionMapSvgFeature[],
  occupied: TextBox[],
  texts: TextParts[],
  body: string[],
): void {
  const scale = Math.min(map.width, map.height) / 35;
  const ranked = [...features].sort(
    (a, b) =>
      Number(b.kind === 'habitat') - Number(a.kind === 'habitat') ||
      b.nodeIds.length - a.nodeIds.length ||
      a.id.localeCompare(b.id),
  );
  let habitats = 0,
    notables = 0;
  for (const feature of ranked) {
    if (!feature.name.trim()) continue;
    if (feature.kind === 'habitat' ? habitats >= 4 : notables >= 4) continue;
    const point = featurePoint(feature, map);
    if (!point) continue;
    const radius = feature.kind === 'habitat' ? 0 : 0.3 * scale;
    const markerBox = {
      minX: point.x - radius - 0.08 * scale,
      maxX: point.x + radius + 0.08 * scale,
      minY: point.y - radius - 0.08 * scale,
      maxY: point.y + radius + 0.08 * scale,
    };
    const obstacles = [...occupied, ...texts.map((text) => text.box)];
    if (
      radius > 0 &&
      (!boxIsInsideMap(markerBox, map) || obstacles.some((box) => overlapArea(box, markerBox) > 0))
    )
      continue;
    const label = {
      name: feature.name,
      point,
      markerBounds: markerBox,
      fontSize: mapTitleFontSize(map) * (feature.kind === 'habitat' ? 0.26 : 0.22),
      priority: 0,
    };
    const placement = bestLabelPlacement(
      label,
      map,
      [],
      radius > 0 ? [...obstacles, markerBox] : obstacles,
    );
    if (!placement) continue;
    const text = textElement(
      feature.name,
      placement.candidate.x,
      placement.candidate.baselineY,
      label.fontSize,
      placement.candidate.anchor,
      LABEL_HALO_EMS,
    );
    texts.push(identifyText(text, feature.id, feature.kind));
    if (feature.kind === 'habitat') {
      habitats++;
      continue;
    }
    notables++;
    occupied.push(markerBox);
    const { x, y } = point;
    const d =
      feature.kind === 'hazard'
        ? `M ${n(x)} ${n(y - radius)} L ${n(x + radius)} ${n(y + radius)} L ${n(x - radius)} ${n(y + radius)} Z`
        : `M ${n(x)} ${n(y - radius)} L ${n(x + radius)} ${n(y)} L ${n(x)} ${n(y + radius)} L ${n(x - radius)} ${n(y)} Z`;
    body.push(
      `<path ${featureIdentity(feature.id, feature.kind)} data-feature-marker="true" d="${d}" fill="${PARCHMENT_FILL}" stroke="${MAP_TEXT_INK}" stroke-width="${n(STROKE_WIDTHS.hairline * scale)}"><title>${escapeXml(feature.name)}</title></path>`,
    );
  }
}

/** Expand each authored variant once; maps reference only the definitions they actually use. */
const TERRAIN_SYMBOL_DEFS = new Map(
  TERRAIN_GLYPH_VARIANTS.map((variant) => [
    variant.id,
    `<g id="${variant.id}"><path d="${variant.bodyPaths.join(' ')}" fill="${PARCHMENT_FILL}"/><path data-terrain-ink="true" d="${variant.strokes.map(inkStrokePath).join(' ')}" fill="${CARTOGRAPHY.palette.body.color}"/></g>`,
  ]),
);

const SETTLEMENT_SYMBOL_DEFS = new Map(
  [...SETTLEMENT_BUILDING_VARIANTS.map((variant) => variant.artwork), CAPITAL_PENNANT].map(
    (artwork) => [
      artwork.id,
      `<g id="${artwork.id}"><path d="${artwork.bodyPaths.join(' ')}" fill="${PARCHMENT_FILL}"/><path d="${artwork.strokes.map(inkStrokePath).join(' ')}" fill="${CARTOGRAPHY.palette.body.color}"/></g>`,
    ],
  ),
);

function svgDefs(
  map: RegionMap,
  symbols: PlacedTerrainGlyph[],
  icons: PlacedSettlementIcon[],
): string {
  const used = [...new Set(symbols.map((symbol) => symbol.variantId))].sort();
  return `<defs>${cartographyFilterDefs(map.width, map.height)}
${used.map((id) => TERRAIN_SYMBOL_DEFS.get(id)).join('\n')}
${[
  ...new Set(
    icons.flatMap((placed) => [
      ...placed.icon.buildings.map((b) => b.variantId),
      ...(placed.icon.isCapital ? [CAPITAL_PENNANT.id] : []),
    ]),
  ),
]
  .sort()
  .map((id) => SETTLEMENT_SYMBOL_DEFS.get(id))
  .join('\n')}</defs>`;
}

/**
 * Builds a region map on parchment: coast-following water hatching, rivers and roads, terrain
 * glyphs, named settlements, and selected saved habitat/landmark/hazard facts.
 */
export function buildRegionMapSvgString(map: RegionMap, options?: RegionMapSvgOptions): string {
  const w = map.width;
  const h = map.height;
  const title = options?.title ?? '';
  const settlements = options?.settlements ?? [];
  const icons = placeSettlementIcons(map, settlements);
  const reserved = icons.map((icon) => icon.bounds);
  const titleLayout = layoutMapTitle(title, map, reserved);

  const body: string[] = [];
  const routeBoxes: TextBox[] = [];
  const waterPolygons = listWaterPolygonsForMap(map);
  const clearOfWater = makeWaterClearanceTest(
    waterPolygons.map((item) => item.outline),
    WATER_EDGE_MARGIN,
  );
  if (titleLayout !== null) reserved.push(titleLayout.box);
  body.push(waterGeometryDefs(waterPolygons));
  body.push(
    terrainToneSvg(
      map,
      waterPolygons.map((item) => item.id),
    ),
  );
  appendWaterBodiesFromItems(waterPolygons, body, w, h);
  const riverOutlines: Vertex[][] = [];
  appendRivers(map, body, waterPolygons, routeBoxes, riverOutlines);
  const symbols = collectScatterSymbols(map, clearOfWater, waterPolygons, riverOutlines);
  const scatterLayerIndex = body.length;
  appendRoads(map, body, settlements, routeBoxes);
  appendSettlements(map, icons, body);

  // Only other-label crowding is soft. The sheet, cartouche, and marker boundaries are hard.
  const textParts = layoutSettlementLabels(
    map,
    icons,
    titleLayout === null
      ? mapTitleFontSize(map)
      : Math.min(mapTitleFontSize(map), (titleLayout.fontSize * 0.9) / MAX_LABEL_FRACTION_OF_TITLE),
    reserved,
  );
  const featureBoxStart = reserved.length;
  appendRegionalFeatures(map, options?.features ?? [], reserved, textParts, body);
  const featureBoxes = reserved.slice(featureBoxStart);
  if (titleLayout !== null) {
    textParts.push(titleLayout.parts);
  }
  const compass = layoutCompass(
    map,
    [...reserved, ...textParts.map((part) => part.box)],
    routeBoxes,
  );
  // Furniture reserves space in the illustration: do not hide terrain glyphs beneath its paper.
  const scatterLayer: string[] = [];
  appendScatterSymbolsBackToFront(
    symbols.filter(
      (symbol) =>
        !icons.some((icon) => overlapArea(symbol.bounds, icon.bounds) > 0) &&
        !featureBoxes.some((box) => overlapArea(symbol.bounds, box) > 0) &&
        (compass === null || overlapArea(symbol.bounds, compass) === 0),
    ),
    scatterLayer,
  );
  body.splice(scatterLayerIndex, 0, ...scatterLayer);
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
  const inner = `${svgDefs(map, symbols, icons)}
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
