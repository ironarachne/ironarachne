import { RNG } from '@ironarachne/rng';
// The category-only entry keeps generation/artifact dependencies out of the SVG renderer.
// The full settlement barrel closes a map → settlements → workshop → region-kind cycle.
import { all as settlementCategories } from '$lib/settlements/settlement_categories';
import type { Vertex } from '$lib/geometry';
import type { RegionMap, MapNode } from './map_graph';
import type { RegionMapSvgSettlement } from './region_map_svg_types';
import type { TextBox } from './terrain_glyph_types';
import type {
  PlacedSettlementIcon,
  SettlementIcon,
  SettlementIconCategory,
  SettlementIconBuilding,
} from './settlement_icon_types';
import {
  CAPITAL_PENNANT,
  SETTLEMENT_BUILDING_VARIANTS,
  SETTLEMENT_ICON_PROFILES,
  projectSettlementGround,
} from './settlement_icon_catalog';

export function normalizeSettlementIconCategory(
  name: string | undefined,
): SettlementIconCategory | undefined {
  const normalized = name?.trim().toLowerCase();
  return SETTLEMENT_ICON_PROFILES.find((profile) => profile.category === normalized)?.category;
}

export function resolveSettlementIconCategory(
  settlement: RegionMapSvgSettlement,
): SettlementIconCategory {
  const recognized = normalizeSettlementIconCategory(settlement.category);
  if (recognized) return recognized;
  const population = settlement.population;
  if (population === undefined || !Number.isFinite(population) || population <= 0) return 'hamlet';
  const categories = settlementCategories();
  const category =
    categories.find((category) => population <= category.maxSize) ??
    categories[categories.length - 1];
  return normalizeSettlementIconCategory(category.name)!;
}

export function transformIconBounds(points: Vertex[], anchor: Vertex, scale: number): TextBox {
  return {
    minX: Math.min(...points.map((p) => p.x * scale + anchor.x)),
    maxX: Math.max(...points.map((p) => p.x * scale + anchor.x)),
    minY: Math.min(...points.map((p) => p.y * scale + anchor.y)),
    maxY: Math.max(...points.map((p) => p.y * scale + anchor.y)),
  };
}
function union(boxes: TextBox[]): TextBox {
  return {
    minX: Math.min(...boxes.map((b) => b.minX)),
    minY: Math.min(...boxes.map((b) => b.minY)),
    maxX: Math.max(...boxes.map((b) => b.maxX)),
    maxY: Math.max(...boxes.map((b) => b.maxY)),
  };
}
export function settlementBuildingBounds(buildings: SettlementIconBuilding[]): TextBox {
  return union(
    buildings.map((building) =>
      transformIconBounds(
        SETTLEMENT_BUILDING_VARIANTS.find((variant) => variant.id === building.variantId)!.artwork
          .footprint,
        building.anchor,
        building.scale,
      ),
    ),
  );
}
/** Fixed artwork rises above the tallest roof; toggling capital status never changes buildings. */
export function capitalPennantAnchor(icon: SettlementIcon): Vertex {
  return { x: 0, y: settlementBuildingBounds(icon.buildings).minY + 1.7 };
}

export function composeSettlementIcon(
  map: RegionMap,
  node: MapNode,
  settlement: RegionMapSvgSettlement,
): SettlementIcon {
  const category = resolveSettlementIconCategory(settlement);
  const profile = SETTLEMENT_ICON_PROFILES.find((profile) => profile.category === category)!;
  const key = JSON.stringify([
    'region-settlement-icons:v1',
    map.width,
    map.height,
    settlement.id ?? node.id,
    node.center.x,
    node.center.y,
  ]);
  const rank = { tower: 0, hall: 1, cottage: 2 };
  const kinds = [...profile.buildingKinds].sort((a, b) => rank[a] - rank[b]);
  // Randomize slots within each row, keeping tall silhouettes in the rear.
  const slots = profile.slots
    .map((anchor, slotIndex) => ({
      anchor,
      slotIndex,
      row:
        profile.buildingKinds.length <= 2 ||
        slotIndex >= Math.ceil(profile.buildingKinds.length / 2)
          ? 1
          : 0,
      order: new RNG(`${key}:slot-order:${slotIndex}`).float(0, 1),
    }))
    .sort((a, b) => a.row - b.row || a.order - b.order);
  const buildings = slots
    .map(({ anchor, slotIndex }, i) => {
      const jitter = new RNG(`${key}:slot-jitter:${slotIndex}`);
      const variant = new RNG(`${key}:variant:${slotIndex}`).item(
        SETTLEMENT_BUILDING_VARIANTS.filter((variant) => variant.kind === kinds[i]),
      );
      const offset = projectSettlementGround(
        jitter.float(-0.015, 0.015),
        jitter.float(-0.015, 0.015),
      );
      return {
        variantId: variant.id,
        slotIndex,
        anchor: { x: anchor.x + offset.x, y: anchor.y + offset.y },
        scale: new RNG(`${key}:scale:${slotIndex}`).float(0.9, 1.05),
      };
    })
    .sort(
      (a, b) => a.anchor.y - b.anchor.y || a.anchor.x - b.anchor.x || a.slotIndex - b.slotIndex,
    );
  const icon: SettlementIcon = {
    category,
    buildings,
    isCapital: settlement.isCapital === true,
    bounds: settlementBuildingBounds(buildings),
  };
  if (icon.isCapital)
    icon.bounds = union([
      icon.bounds,
      transformIconBounds(CAPITAL_PENNANT.footprint, capitalPennantAnchor(icon), 1),
    ]);
  return icon;
}

function boxPoints(box: TextBox): Vertex[] {
  return [
    { x: box.minX, y: box.minY },
    { x: box.maxX, y: box.maxY },
  ];
}

/** Keep the saved road anchor, fitting actual artwork; exact edge sites get an inward connector. */
export function placeSettlementIcon(
  map: RegionMap,
  node: MapNode,
  settlement: RegionMapSvgSettlement,
  radius: number,
): PlacedSettlementIcon {
  const icon = composeSettlementIcon(map, node, settlement);
  const baseBounds = settlementBuildingBounds(icon.buildings);
  const profile = SETTLEMENT_ICON_PROFILES.find((profile) => profile.category === icon.category)!;
  const desired =
    (radius * profile.targetHalfWidthFactor) / Math.max(-baseBounds.minX, baseBounds.maxX);
  const b = icon.bounds;
  const { x, y } = node.center;
  const scale = Math.min(
    desired,
    x / -b.minX,
    (map.width - x) / b.maxX,
    y / -b.minY,
    (map.height - y) / b.maxY,
  );
  const fitted =
    scale > 0
      ? scale
      : Math.min(desired, map.width / (b.maxX - b.minX), map.height / (b.maxY - b.minY));
  const anchor = {
    x: Math.max(-b.minX * fitted, Math.min(map.width - b.maxX * fitted, x)),
    y: Math.max(-b.minY * fitted, Math.min(map.height - b.maxY * fitted, y)),
  };
  const bounds = transformIconBounds(boxPoints(b), anchor, fitted);
  return {
    settlement,
    icon,
    anchor,
    scale: fitted,
    bounds: union([bounds, { minX: x, maxX: x, minY: y, maxY: y }]),
  };
}
