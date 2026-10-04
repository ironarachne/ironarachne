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
 * Map-wide upper bounds on tree width/height. For any angle in [-a,a], rotating a pair
 * separated by w horizontally leaves at least w*cos(a)-h*sin(a) horizontal separation.
 * This bounds the whole continuous rotation range, rather than sampling a few angles.
 * The small scale allowance accounts for the SVG's three-decimal serialization.
 */
export function treeSizeCeiling(minimumSymbolSize: number, mapScale: number): Vertex {
  let width = Infinity,
    height = Infinity;
  for (const family of ['hill', 'mountain', 'mountainHigh'] as const) {
    const definition = TERRAIN_GLYPHS[family];
    const desired = Math.max(
      minimumSymbolSize * definition.scaleFactor,
      mapScale * (family === 'hill' ? 0.5 : 0.65),
    );
    const minimum = Math.max(0, desired * definition.minimumScaleRatio - 0.0005);
    const angle = (definition.rotationLimitDegrees * Math.PI) / 180;
    for (const variant of definition.variants) {
      const span = footprintSpan(variant);
      width = Math.min(width, (span.x * Math.cos(angle) - span.y * Math.sin(angle)) * minimum);
      height = Math.min(height, (span.y * Math.cos(angle) - span.x * Math.sin(angle)) * minimum);
    }
  }
  return { x: Math.max(0, width * 0.75), y: Math.max(0, height * 0.75) };
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
