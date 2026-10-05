import type { Vertex } from '$lib/geometry';
import { TERRAIN_GLYPHS } from './terrain_glyph_catalog';
import type { TerrainGlyphFamily, TerrainGlyphVariant } from './terrain_glyph_types';

export function isTreeGlyph(family: TerrainGlyphFamily): boolean {
  return family === 'treeDeciduous' || family === 'treeConifer' || family === 'treePalm';
}

/** Unrotated span of the complete conservative footprint, including ink and ground marks. */
function footprintSpan(variant: TerrainGlyphVariant): Vertex {
  const xs = variant.footprint.map((point) => point.x);
  const ys = variant.footprint.map((point) => point.y);
  return { x: Math.max(...xs) - Math.min(...xs), y: Math.max(...ys) - Math.min(...ys) };
}

/**
 * Trees occupy at most 75% of a nominal relief glyph's longest dimension.
 * Compare local nominal profiles: boundary fitting and an unrelated tiny cell must
 * not shrink an entire forest. A hill is wide and low, so comparing both axes
 * separately would make every tree as short as the hill's shallow silhouette.
 * Rotation bounds and the allowance keep serialized SVG within the ceiling.
 */
export function treeSizeCeiling(symbolSize: number, mapScale: number): Vertex {
  let diameter = Infinity;
  for (const family of ['hill', 'mountain', 'mountainHigh'] as const) {
    const definition = TERRAIN_GLYPHS[family];
    const desired = Math.max(
      symbolSize * definition.scaleFactor,
      mapScale * (family === 'hill' ? 0.5 : 0.65),
    );
    const scale = Math.max(0, desired - 0.0005);
    const angle = (definition.rotationLimitDegrees * Math.PI) / 180;
    for (const variant of definition.variants) {
      const span = footprintSpan(variant);
      const width = span.x * Math.cos(angle) - span.y * Math.sin(angle);
      const height = span.y * Math.cos(angle) - span.x * Math.sin(angle);
      diameter = Math.min(diameter, Math.max(width, height) * scale);
    }
  }
  const limit = Math.max(0, diameter * 0.75);
  return { x: limit, y: limit };
}

/** Cap after style variation; subtract half a serialized scale unit so rounding cannot grow it. */
export function cappedTreeScale(
  variant: TerrainGlyphVariant,
  rotationDegrees: number,
  wanted: number,
  ceiling: Vertex,
): number {
  const angle = (rotationDegrees * Math.PI) / 180;
  const rotated = variant.footprint.map(({ x, y }) => ({
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  }));
  const xs = rotated.map((point) => point.x),
    ys = rotated.map((point) => point.y);
  const limit = Math.min(
    ceiling.x / (Math.max(...xs) - Math.min(...xs)),
    ceiling.y / (Math.max(...ys) - Math.min(...ys)),
  );
  return Math.max(0, Math.min(wanted, limit - 0.0005));
}
