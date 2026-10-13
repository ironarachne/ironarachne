import {
  denseForestCanopy,
  denseCanopyFitOutline,
  denseCanopyBrushInk,
  denseCanopyTrunks,
  denseCanopyPoint,
  denseCanopyContainsPoint,
  connectedDenseCanopies,
} from './dense_forest_artwork';
import type { PlacedDenseForestGlyph } from './dense_forest_types';
import { denseForestGeometryError } from './dense_forests';
import { mountainSaddle } from './mountain_range_artwork';
import {
  mountainSpineLength,
  mountainRangeGeometryError,
  mountainSegmentContained,
} from './mountain_ranges';
import type { PlacedMountainRangeGlyph } from './mountain_range_types';
import type { MapEdge, MapNode, RegionMap } from './map_graph.js';
import { generatePoissonDisk, type Vertex } from '$lib/geometry';
import { RNG } from '@ironarachne/rng';
import {
  CARTOGRAPHY,
  createWaterEdgeTreatment,
  createWaterArtwork,
  INK_EDGE_MAX_OFFSET,
  STROKE_WIDTHS,
  MASK_PAINT,
  cartographyFilterDefs,
  parchmentRect,
  type InkedPath,
} from '$lib/cartography';
import { makeWaterClearanceTest } from './water_clearance';
import { assignTerrainGlyphs } from './terrain_glyph_assignment';
import { deriveDesertOasisSites, desertBiomeKind } from './desert_terrain';
import {
  REGION_LAND_FILL,
  REGION_WATER_FILL,
  terrainGlyphFills,
  terrainToneSvg,
} from './terrain_tones';
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
  RegionMapSvgDenseForest,
  RegionMapSvgMountainRange,
  RegionMapSvgSettlement,
  RegionMapSvgOptions,
  RegionMapSvgFeature,
} from './region_map_svg_types';
export type {
  RegionMapSvgDenseForest,
  RegionMapSvgMountainRange,
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
  exclusions: Vertex[][],
): void {
  const scale = Math.min(width, height) / 35;
  for (const item of items) {
    const ocean = item.strokeKind === 'ocean';
    const artwork = createWaterArtwork({
      shoreline: item.outline,
      kind: item.strokeKind,
      width,
      height,
      // Land-side shore marks must also stay out of every neighboring water body.
      exclusions: [
        ...exclusions,
        ...items.filter((other) => other !== item).map((other) => other.outline),
      ],
    });
    for (const [attribute, paths] of [
      ['water-hatching', artwork.ripples],
      ['shore-hatching', artwork.shoreHatching],
      ['water-waves', artwork.waves],
    ] as const) {
      if (paths.length === 0) continue;
      const containment =
        attribute === 'shore-hatching'
          ? 'mask="url(#terrain-tone-land)"'
          : `clip-path="url(#${item.id}Clip)"`;
      parts.push(`<g data-${attribute}="${item.strokeKind}" ${containment}>
${attribute === 'water-waves' ? compactWaterPaths(paths, scale).replaceAll('stroke-linejoin="round"', 'stroke-linejoin="miter" stroke-miterlimit="3"') : compactWaterPaths(paths, scale)}
</g>`);
    }
    parts.push(
      `<use data-water-coast="${item.strokeKind}" href="#${item.id}" fill="none" stroke="${CARTOGRAPHY.palette.body.color}" stroke-width="${n((ocean ? STROKE_WIDTHS.heavy : STROKE_WIDTHS.medium) * scale)}" stroke-linejoin="round" stroke-linecap="round"/>`,
    );
  }
}

/** Batch equal inks as SVG subpaths: broken ripples need gaps, not repeated paint attributes. */
function compactWaterPaths(paths: InkedPath[], scale: number): string {
  const groups = new Map<string, InkedPath[]>();
  for (const path of paths) {
    const key = `${path.weight}:${path.ink.color}:${path.ink.opacity}`;
    const group = groups.get(key) ?? [];
    group.push(path);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => {
      const commands = group.map((path) => path.toSvg().match(/ d="([^"]+)"/)![1]).join(' ');
      return group[0]
        .toSvg()
        .replace(/ d="[^"]+"/, ` d="${commands}"`)
        .replace(
          /stroke-width="[^"]+"/,
          `stroke-width="${n(STROKE_WIDTHS[group[0].weight] * scale)}"`,
        );
    })
    .join('\n');
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

function waterEdgeMargin(map: RegionMap): number {
  return (
    (STROKE_WIDTHS.heavy * Math.min(map.width, map.height)) / 35 / 2 + INK_EDGE_MAX_OFFSET + 0.01
  );
}

/** Cells within two graph steps — the only cells a glyph anchored in `nodeId` can reach. */
function localCellNeighborhood(byId: Map<number, MapNode>, nodeId: number): number[] {
  const near = new Set<number>([nodeId]);
  for (const first of byId.get(nodeId)?.neighbors ?? []) {
    near.add(first);
    for (const second of byId.get(first)?.neighbors ?? []) {
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
  const byId = new Map(map.nodes.map((node) => [node.id, node]));

  const cellsNear = (nodeId: number): MapNode[] => {
    const cached = cache.get(nodeId);
    if (cached !== undefined) return cached;
    const cells = localCellNeighborhood(byId, nodeId)
      .map((id) => byId.get(id))
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

/** Stable positions along saved spines; skipped placements leave breaks in the chain. */
function collectRangeSymbols(
  map: RegionMap,
  ranges: RegionMapSvgMountainRange[],
  clear: (outline: Vertex[]) => boolean,
  acceptSpacing: (point: Vertex, radius: number) => boolean,
  reserved: TextBox[],
  nodeAt: (point: Vertex) => MapNode | undefined,
): PlacedMountainRangeGlyph[] {
  const out: PlacedMountainRangeGlyph[] = [];
  const byId = new Map(map.nodes.map((node) => [node.id, node]));
  const mapScale = Math.min(map.width, map.height) / 35;
  const free = (bounds: TextBox) => reserved.every((box) => overlapArea(bounds, box) === 0);
  const assignments = assignTerrainGlyphs(map);
  const ranked = [...ranges].sort(
    (a, b) =>
      mountainSpineLength(map, b.spineNodeIds) - mountainSpineLength(map, a.spineNodeIds) ||
      a.id.localeCompare(b.id),
  );
  for (const range of ranked) {
    if (mountainRangeGeometryError(map, range) !== null) continue;
    const members = new Set(range.mapNodeIds);
    const cells = range.mapNodeIds.map((id) => byId.get(id)!);
    const contains = makeRegionContainmentTest(map, (node) => members.has(node.id));
    const spine = range.spineNodeIds.map((id) => byId.get(id)!.center);
    const lengths = [0];
    for (let i = 1; i < spine.length; i++)
      lengths.push(
        lengths[i - 1] + Math.hypot(spine[i].x - spine[i - 1].x, spine[i].y - spine[i - 1].y),
      );
    const total = lengths.at(-1)!;
    const steps = Math.max(1, Math.ceil(total / (1.25 * mapScale)));
    let previous: PlacedMountainRangeGlyph | undefined;
    for (let position = 0; position <= steps; position++) {
      const along = (total * position) / steps;
      const segment = Math.max(
        0,
        Math.min(spine.length - 2, lengths.findIndex((length) => length >= along) - 1),
      );
      const ratio = (along - lengths[segment]) / (lengths[segment + 1] - lengths[segment]);
      const anchor = {
        x: spine[segment].x + (spine[segment + 1].x - spine[segment].x) * ratio,
        y: spine[segment].y + (spine[segment + 1].y - spine[segment].y) * ratio + 0.3 * mapScale,
      };
      const node = nodeAt(anchor);
      if (!node || !members.has(node.id)) {
        previous = undefined;
        continue;
      }
      const assignment = assignments.get(node.id)!;
      const definition = TERRAIN_GLYPHS[assignment.family];
      const key = `region-range:${range.id}:${position}`;
      const variant = new RNG(`${key}:variant`).item(definition.variants);
      const style = new RNG(`${key}:style`);
      const desired = Math.max(
        symbolFontSizeForNode(node, map) * definition.scaleFactor,
        mapScale * 0.65,
      );
      const rotation = Number((style.float(-1, 1) * definition.rotationLimitDegrees).toFixed(1));
      const scale = largestFittingScale(
        anchor,
        SYMBOL_FIT_OUTLINES[variant.id],
        desired * style.float(0.88, 1.12),
        desired * 0.4,
        rotation,
        node.id,
        contains,
        clear,
      );
      if (scale === null) {
        previous = undefined;
        continue;
      }
      const bounds = glyphBox(anchor, SYMBOL_FIT_OUTLINES[variant.id], scale, rotation);
      if (!free(bounds)) {
        previous = undefined;
        continue;
      }
      const radius = Math.max(...variant.footprint.map((p) => Math.abs(p.x))) * scale * 0.25;
      if (!acceptSpacing(anchor, radius)) {
        previous = undefined;
        continue;
      }
      const placed: PlacedMountainRangeGlyph = {
        nodeId: node.id,
        variantId: variant.id,
        anchor,
        scale,
        rotationDegrees: rotation,
        bounds,
        rangeId: range.id,
        position,
      };
      if (previous && previous.position === position - 1) {
        const saddle = mountainSaddle(previous, placed);
        if (
          free(saddle.bounds) &&
          clear(saddle.outline) &&
          saddle.outline.every((p, i) =>
            mountainSegmentContained(p, saddle.outline[(i + 1) % saddle.outline.length], cells),
          )
        )
          placed.saddle = saddle;
      }
      out.push(placed);
      previous = placed;
    }
  }
  return out;
}

function collectScatterSymbols(
  map: RegionMap,
  clearOfWater: (outline: Vertex[]) => boolean,
  waterPolygons: WaterPolygonItem[],
  riverOutlines: Vertex[][],
  ranges: RegionMapSvgMountainRange[],
  reserved: TextBox[],
  forests: RegionMapSvgDenseForest[],
): (PlacedTerrainGlyph | PlacedMountainRangeGlyph | PlacedDenseForestGlyph)[] {
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
  const forestByNode = new Map(
    forests.flatMap((forest) => forest.mapNodeIds.map((id) => [id, forest.id] as const)),
  );
  const forestContainment = new Map(
    forests.map((forest) => {
      const ids = new Set(forest.mapNodeIds);
      return [forest.id, makeRegionContainmentTest(map, (node) => ids.has(node.id))];
    }),
  );
  // Match road cell-centre segments by ID, including graphs with non-index node IDs.
  const byId = new Map(map.nodes.map((node) => [node.id, node]));
  const roadOutlines = map.edges.flatMap((edge) => {
    const a = byId.get(edge.d0)?.center,
      b = edge.d1 === undefined ? undefined : byId.get(edge.d1)?.center;
    if (!(edge.road && edge.road > 0) || !a || !b) return [];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (length === 0) return [];
    const dx = ((b.y - a.y) / length) * 0.12 * mapScale,
      dy = ((a.x - b.x) / length) * 0.12 * mapScale;
    return [
      [
        { x: a.x + dx, y: a.y + dy },
        { x: b.x + dx, y: b.y + dy },
        { x: b.x - dx, y: b.y - dy },
        { x: a.x - dx, y: a.y - dy },
      ],
    ];
  });
  const clearOfRoads = makeWaterClearanceTest(roadOutlines, 0.08 * mapScale);
  const acceptSpacing = makeGlyphSpacingTest(mapScale);
  const clearOfRivers = makeWaterClearanceTest(riverOutlines, WATER_EDGE_MARGIN);
  const out: (PlacedTerrainGlyph | PlacedMountainRangeGlyph | PlacedDenseForestGlyph)[] = [];
  const rangeClear = (outline: Vertex[]) => clearOfWater(outline) && clearOfRivers(outline);
  collectRangeSymbols(map, ranges, rangeClear, acceptSpacing, reserved, nodeAt).forEach((symbol) =>
    out.push(symbol),
  );
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
    // Low grass, scrub, reeds, and ice need half the minimum scale of other open terrain.
    const minimumScaleFactor = mountain
      ? 0.65
      : isTreeGlyph(family)
        ? 0.35
        : family === 'marsh' ||
            family === 'prairie' ||
            family === 'tundra' ||
            family === 'montaneGrass' ||
            family === 'iceCap'
          ? 0.25
          : 0.5;
    const baseScale = Math.max(
      symbolFontSizeForNode(node, map) * definition.scaleFactor,
      mapScale * minimumScaleFactor,
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
    const bounds = glyphBox(anchor, outline, scale, rotation);
    if (!acceptSpacing(anchor, halfWidth * 0.55)) return false;
    out.push({
      nodeId: node.id,
      variantId: variant.id,
      anchor,
      scale,
      rotationDegrees: rotation,
      bounds,
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
  // A close staggered lattice produces overlapping bodies. Its independent jitter stream
  // preserves every ordinary scatter candidate and style draw outside the saved patches.
  if (forests.length) {
    const step = 0.55 * mapScale;
    for (const forest of forests) {
      const members = map.nodes.filter((node) => forest.mapNodeIds.includes(node.id));
      const points = members.flatMap((node) => node.polygon.vertices);
      const minX = Math.min(...points.map((p) => p.x)),
        maxX = Math.max(...points.map((p) => p.x));
      const minY = Math.min(...points.map((p) => p.y)),
        maxY = Math.max(...points.map((p) => p.y));
      let attempts = 0;
      for (let row = Math.floor(minY / step); row * step <= maxY && attempts < 12000; row++)
        for (let col = Math.floor(minX / step); col * step <= maxX && attempts < 12000; col++) {
          attempts++;
          const key = `${seedKey}:dense:${forest.id}:${row}:${col}`;
          const jitter = new RNG(`${key}:position`);
          const anchor = {
            x: (col + (row % 2 ? 0.5 : 0)) * step + jitter.float(-0.4, 0.4) * step,
            y: row * step + jitter.float(-0.4, 0.4) * step,
          };
          const node = nodeAt(anchor);
          if (!node || forestByNode.get(node.id) !== forest.id) continue;
          const styleRng = new RNG(`${key}:cloud`);
          const canopy = denseForestCanopy(styleRng);
          const outline = denseCanopyFitOutline(canopy);
          const rotation = Number(styleRng.float(-8, 8).toFixed(1));
          const desiredScale = mapScale * styleRng.float(0.75, 1.05);
          const scale = largestFittingScale(
            anchor,
            outline,
            desiredScale,
            desiredScale * 0.42,
            rotation,
            node.id,
            forestContainment.get(forest.id)!,
            (outline) => clearOfWater(outline) && clearOfRivers(outline) && clearOfRoads(outline),
          );
          if (scale === null) continue;
          const bounds = glyphBox(anchor, outline, scale, rotation);
          if (reserved.some((box) => overlapArea(bounds, box) > 0)) continue;
          out.push({
            nodeId: node.id,
            variantId: TERRAIN_GLYPHS[assignments.get(node.id)!.family].variants[0].id,
            anchor,
            scale,
            rotationDegrees: rotation,
            bounds,
            forestId: forest.id,
            canopy,
            interiorInk: new RNG(`${key}:detail`).float(0, 1) < 0.3,
          });
        }
    }
  }
  const trials = out.filter((glyph): glyph is PlacedDenseForestGlyph => 'forestId' in glyph);
  const canopies = connectedDenseCanopies(trials);
  const accepted = new Set(canopies);
  const discarded = new Set(trials.filter((glyph) => !accepted.has(glyph)));
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
      if (canopies.some((glyph) => denseCanopyContainsPoint(glyph, anchor, 0.12 * mapScale)))
        continue;
      const key = `${seedKey}:trees:${node.id}:${index}`;
      if (new RNG(`${key}:density`).float(0, 1) >= TERRAIN_GLYPHS[family].densityRatio) continue;
      place(anchor, family, key);
    }
  }
  return out.filter((glyph) => !('forestId' in glyph) || !discarded.has(glyph));
}

/** A dense canopy has more shaded foliage than the surrounding scattered woodland. */
function darkForestFill(fill: string): string {
  return fill.replace(/\d+/g, (channel) => String(Math.round(Number(channel) * 0.94)));
}

/** One painter ordering for all terrain; each glyph is anchored at its ground contact. */
function appendScatterSymbolsBackToFront(
  map: RegionMap,
  symbols: (PlacedTerrainGlyph | PlacedMountainRangeGlyph | PlacedDenseForestGlyph)[],
  parts: string[],
  forestTrunkClear: (glyph: PlacedDenseForestGlyph, outline: Vertex[]) => boolean,
): void {
  const fills = terrainGlyphFills(map);
  const ordered = [...symbols].sort((a, b) => a.anchor.y - b.anchor.y || a.anchor.x - b.anchor.x);
  const paintedForests = new Set<string>();
  for (const symbol of ordered) {
    if ('forestId' in symbol) {
      if (paintedForests.has(symbol.forestId)) continue;
      paintedForests.add(symbol.forestId);
      const trees = ordered.filter(
        (placed): placed is PlacedDenseForestGlyph =>
          'forestId' in placed && placed.forestId === symbol.forestId,
      );
      const transform = (tree: PlacedDenseForestGlyph) =>
        `translate(${tree.anchor.x.toFixed(3)} ${tree.anchor.y.toFixed(3)}) rotate(${tree.rotationDegrees.toFixed(1)}) scale(${tree.scale.toFixed(3)})`;
      const trunks = trees.flatMap((tree, index) => {
        const strokes = denseCanopyTrunks(
          tree,
          trees,
          new RNG(`forest-trunks:${symbol.forestId}:${index}`),
        );
        if (!strokes.length) return [];
        const points = strokes
          .flatMap((stroke) =>
            stroke.segments.flatMap((segment) => [
              segment.start,
              segment.control1,
              segment.control2,
              segment.end,
            ]),
          )
          .map((point) => denseCanopyPoint(tree, point));
        const x0 = Math.min(...points.map((p) => p.x)) - 0.04 * tree.scale,
          x1 = Math.max(...points.map((p) => p.x)) + 0.04 * tree.scale;
        const y0 = Math.min(...points.map((p) => p.y)) - 0.04 * tree.scale,
          y1 = Math.max(...points.map((p) => p.y)) + 0.04 * tree.scale;
        const outline = [
          { x: x0, y: y0 },
          { x: x1, y: y0 },
          { x: x1, y: y1 },
          { x: x0, y: y1 },
        ];
        if (!forestTrunkClear(tree, outline)) return [];
        return [
          `<path data-forest-trunk="true" transform="${transform(tree)}" d="${strokes.map(inkStrokePath).join(' ')}" fill="${CARTOGRAPHY.palette.body.color}"/>`,
        ];
      });
      const bodies = trees.map(
        (tree) =>
          `<path data-forest-canopy="true" data-canopy-outline="${denseCanopyFitOutline(tree.canopy)
            .map((point) => denseCanopyPoint(tree, point))
            .map((point) => `${n(point.x)},${n(point.y)}`)
            .join(
              ' ',
            )}" data-canopy-bounds="${n(tree.bounds.minX)} ${n(tree.bounds.minY)} ${n(tree.bounds.maxX)} ${n(tree.bounds.maxY)}" transform="${transform(tree)}" d="${tree.canopy.body}" fill="${darkForestFill(fills.get(tree.nodeId)!)}"/>`,
      );
      const brush = trees.map(
        (tree) =>
          `<path transform="${transform(tree)}" d="${denseCanopyBrushInk(tree, trees)}" fill="${CARTOGRAPHY.palette.body.color}"/>`,
      );
      parts.push(
        `<g data-dense-forest-id="${escapeXml(symbol.forestId)}"><g data-forest-trunks="true">${trunks.join('')}</g><g filter="url(#dense-forest-outline)">${bodies.join('')}</g><g data-forest-interior-ink="true">${brush.join('')}</g></g>`,
      );
      continue;
    }
    if ('rangeId' in symbol && symbol.saddle) {
      parts.push(
        `<g data-range-saddle="${escapeXml(symbol.rangeId)}"><path d="${symbol.saddle.body}" fill="${fills.get(symbol.nodeId)}"/><path d="${symbol.saddle.ink}" fill="${CARTOGRAPHY.palette.body.color}"/></g>`,
      );
    }
    parts.push(
      `<use${'rangeId' in symbol ? ` data-range-id="${escapeXml(symbol.rangeId)}"` : ''} href="#${symbol.variantId}" transform="translate(${symbol.anchor.x.toFixed(3)}, ${symbol.anchor.y.toFixed(3)}) rotate(${symbol.rotationDegrees.toFixed(1)}) scale(${symbol.scale.toFixed(3)})" fill="${fills.get(symbol.nodeId)}"/>`,
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
  forestLandmarkIds: Set<string> = new Set(),
): void {
  const scale = Math.min(map.width, map.height) / 35;
  const ranked = features.every((feature) => feature.kind === 'range')
    ? features
    : [...features].sort(
        (a, b) =>
          Number(b.kind === 'habitat') - Number(a.kind === 'habitat') ||
          b.nodeIds.length - a.nodeIds.length ||
          a.id.localeCompare(b.id),
      );
  let habitats = 0,
    notables = 0;
  for (const feature of ranked) {
    if (!feature.name.trim()) continue;
    if (
      feature.kind === 'habitat' ? habitats >= 4 : feature.kind === 'range' ? false : notables >= 4
    )
      continue;
    const point = featurePoint(feature, map);
    if (!point) continue;
    const forestLabel = forestLandmarkIds.has(feature.id);
    const radius =
      feature.kind === 'habitat' || feature.kind === 'range' || forestLabel ? 0 : 0.3 * scale;
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
      fontSize:
        mapTitleFontSize(map) *
        (feature.kind === 'habitat' || feature.kind === 'range' || forestLabel ? 0.26 : 0.22),
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
    if (feature.kind === 'range') continue;
    if (feature.kind === 'habitat') {
      habitats++;
      continue;
    }
    notables++;
    if (forestLabel) continue;
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
    `<g id="${variant.id}"><path d="${variant.bodyPaths.join(' ')}"/><path data-terrain-ink="true" d="${variant.strokes.map(inkStrokePath).join(' ')}" fill="${CARTOGRAPHY.palette.body.color}"/></g>`,
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
  const used = [
    ...new Set(
      symbols.filter((symbol) => !('forestId' in symbol)).map((symbol) => symbol.variantId),
    ),
  ].sort();
  return `<defs>${cartographyFilterDefs(map.width, map.height)}
<filter id="dense-forest-outline" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feMorphology in="SourceGraphic" operator="dilate" radius="${n((Math.min(map.width, map.height) / 35) * 0.015)}" result="canopy"/><feMorphology in="canopy" operator="dilate" radius="${n((Math.min(map.width, map.height) / 35) * 0.025)}" result="edge"/><feFlood flood-color="${CARTOGRAPHY.palette.body.color}"/><feComposite in2="edge" operator="in"/><feMerge><feMergeNode/><feMergeNode in="canopy"/></feMerge></filter>
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
  const forests = (options?.denseForests ?? []).filter(
    (forest) => denseForestGeometryError(map, forest) === null,
  );
  const forestLandmarkIds = new Set(forests.map((forest) => `landmark:${forest.id}`));
  const icons = placeSettlementIcons(map, settlements);
  const reserved = icons.map((icon) => icon.bounds);
  const titleLayout = layoutMapTitle(title, map, reserved);

  const body: string[] = [];
  const routeBoxes: TextBox[] = [];
  const waterPolygons = listWaterPolygonsForMap(map);
  const clearOfWater = makeWaterClearanceTest(
    waterPolygons.map((item) => item.outline),
    waterEdgeMargin(map),
  );
  if (titleLayout !== null) reserved.push(titleLayout.box);
  body.push(waterGeometryDefs(waterPolygons));
  body.push(
    terrainToneSvg(
      map,
      waterPolygons.map((item) => item.id),
    ),
  );
  const waterLayerIndex = body.length;
  const riverOutlines: Vertex[][] = [];
  appendRivers(map, body, waterPolygons, routeBoxes, riverOutlines);
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
  appendRegionalFeatures(
    map,
    (options?.mountainRanges ?? [])
      .filter((range) => mountainRangeGeometryError(map, range) === null)
      .sort(
        (a, b) =>
          mountainSpineLength(map, b.spineNodeIds) - mountainSpineLength(map, a.spineNodeIds) ||
          a.id.localeCompare(b.id),
      )
      .map((range) => ({
        id: range.id,
        name: range.name,
        kind: 'range' as const,
        nodeIds: range.spineNodeIds,
        edgeIds: [],
      })),
    reserved,
    textParts,
    body,
  );
  appendRegionalFeatures(
    map,
    options?.features ?? [],
    reserved,
    textParts,
    body,
    forestLandmarkIds,
  );
  const featureBoxes = reserved.slice(featureBoxStart);
  if (titleLayout !== null) {
    textParts.push(titleLayout.parts);
  }
  const compass = layoutCompass(
    map,
    [...reserved, ...textParts.map((part) => part.box)],
    routeBoxes,
  );
  const waterLayer: string[] = [];
  appendWaterBodiesFromItems(
    waterPolygons,
    waterLayer,
    w,
    h,
    [...reserved, ...textParts.map((part) => part.box), ...(compass === null ? [] : [compass])].map(
      (box) => [
        { x: box.minX, y: box.minY },
        { x: box.maxX, y: box.minY },
        { x: box.maxX, y: box.maxY },
        { x: box.minX, y: box.maxY },
      ],
    ),
  );
  const rangeReservations = [...reserved, ...featureBoxes, ...(compass === null ? [] : [compass])];
  const symbols = collectScatterSymbols(
    map,
    clearOfWater,
    waterPolygons,
    riverOutlines,
    options?.mountainRanges ?? [],
    rangeReservations,
    forests,
  );
  // Furniture reserves space in the illustration: do not hide terrain glyphs beneath its paper.
  const scatterLayer: string[] = [];
  const forestMembers = new Map(forests.map((forest) => [forest.id, new Set(forest.mapNodeIds)]));
  const trunkContains = new Map(
    forests.map((forest) => [
      forest.id,
      makeRegionContainmentTest(map, (node) => forestMembers.get(forest.id)!.has(node.id)),
    ]),
  );
  const trunkRoads = map.edges
    .filter((edge) => (edge.road ?? 0) > 0)
    .flatMap((edge) => {
      const a = map.nodes.find((node) => node.id === edge.d0)?.center;
      const b = map.nodes.find((node) => node.id === edge.d1)?.center;
      if (!a || !b) return [];
      const margin = (Math.min(w, h) / 35) * 0.2;
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      if (!length) return [];
      const dx = ((b.y - a.y) / length) * margin,
        dy = ((a.x - b.x) / length) * margin;
      return [
        [
          { x: a.x + dx, y: a.y + dy },
          { x: b.x + dx, y: b.y + dy },
          { x: b.x - dx, y: b.y - dy },
          { x: a.x - dx, y: a.y - dy },
        ],
      ];
    });
  const clearTrunkRoutes = makeWaterClearanceTest(
    [...riverOutlines, ...trunkRoads],
    WATER_EDGE_MARGIN,
  );
  appendScatterSymbolsBackToFront(
    map,
    symbols.filter(
      (symbol) =>
        !icons.some((icon) => overlapArea(symbol.bounds, icon.bounds) > 0) &&
        !featureBoxes.some((box) => overlapArea(symbol.bounds, box) > 0) &&
        (compass === null || overlapArea(symbol.bounds, compass) === 0),
    ),
    scatterLayer,
    (glyph, outline) =>
      clearOfWater(outline) &&
      clearTrunkRoutes(outline) &&
      outline.every((point) => trunkContains.get(glyph.forestId)!(point, glyph.nodeId)) &&
      !rangeReservations.some((box) => overlapArea(getPolygonBoundingBox(outline), box) > 0),
  );
  body.splice(scatterLayerIndex, 0, ...scatterLayer);
  body.splice(waterLayerIndex, 0, ...waterLayer);
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
