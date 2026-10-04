import type { MapNode, RegionMap } from './map_graph';
import { classifyRegionLandforms, type LandformClass } from './region_terrain';
import type { TerrainToneColor, TerrainToneFamily, TerrainToneLayer } from './terrain_tone_types';

const PALETTE: Record<TerrainToneFamily, TerrainToneColor> = {
  land: { red: 216, green: 198, blue: 173 },
  // Compensate for warm parchment showing through the wash so rendered water stays blue.
  water: { red: 230, green: 238, blue: 244 },
  tundra: { red: 233, green: 231, blue: 222 },
  desert: { red: 231, green: 216, blue: 174 },
  coniferForest: { red: 189, green: 203, blue: 193 },
  deciduousForest: { red: 199, green: 207, blue: 181 },
};
const RELIEF_FACTOR: Record<LandformClass, number> = {
  plain: 1,
  hill: 0.98,
  mountain: 0.94,
  highMountain: 0.9,
};

function toneFamily(node: MapNode): TerrainToneFamily {
  if (node.isOcean || node.isWater) return 'water';
  const biome = node.biomeId?.trim().toLowerCase() ?? '';
  if (/tundra|ice|polar/.test(biome)) return 'tundra';
  if (biome.includes('desert')) return 'desert';
  if (/forest|woodland/.test(biome)) {
    return /boreal|montane|coniferous|pine/.test(biome) ? 'coniferForest' : 'deciduousForest';
  }
  return 'land';
}

export function terrainToneCss(color: TerrainToneColor): string {
  return `rgb(${color.red},${color.green},${color.blue})`;
}

export const REGION_WATER_FILL = terrainToneCss(PALETTE.water);

/** Derived only from map facts; no random draws or changes to the saved map. */
export function buildTerrainToneLayer(map: RegionMap): TerrainToneLayer {
  const landforms = classifyRegionLandforms(map).byNodeId;
  return {
    // A fraction of typical cell diameter softens boundaries without losing small habitats.
    blurRadius: Math.sqrt((map.width * map.height) / Math.max(1, map.nodes.length)) * 0.24,
    opacity: 0.8,
    tones: map.nodes.map((node) => {
      const family = toneFamily(node);
      const color = PALETTE[family];
      const factor = RELIEF_FACTOR[landforms.get(node.id) ?? 'plain'];
      return {
        nodeId: node.id,
        family,
        color: {
          red: Math.round(color.red * factor),
          green: Math.round(color.green * factor),
          blue: Math.round(color.blue * factor),
        },
      };
    }),
  };
}

/** Water IDs reference the renderer's processed shoreline geometry, never raw cell edges. */
export function terrainToneSvg(map: RegionMap, waterIds: string[]): string {
  const layer = buildTerrainToneLayer(map);
  const tones = new Map(layer.tones.map((tone) => [tone.nodeId, tone]));
  const padding = layer.blurRadius * 4;
  const cells = map.nodes.flatMap((node) => {
    const tone = tones.get(node.id)!;
    if (tone.family === 'water' || node.polygon.vertices.length < 3) return [];
    const points = node.polygon.vertices
      .map((v) => `${v.x.toFixed(3)},${v.y.toFixed(3)}`)
      .join(' ');
    const color = terrainToneCss(tone.color);
    return [
      `<polygon points="${points}" fill="${color}" stroke="${color}" stroke-width="${layer.blurRadius * 0.03}" stroke-linejoin="round"/>`,
    ];
  });
  return `<defs>
<filter id="terrain-tone-blur" filterUnits="userSpaceOnUse" x="${-padding}" y="${-padding}" width="${map.width + padding * 2}" height="${map.height + padding * 2}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${layer.blurRadius}"/></filter>
<mask id="terrain-tone-land" maskUnits="userSpaceOnUse" x="0" y="0" width="${map.width}" height="${map.height}" style="mask-type:luminance"><rect width="${map.width}" height="${map.height}" fill="white"/>${waterIds.map((id) => `<use href="#${id}" fill="black"/>`).join('')}</mask>
</defs>
<g data-terrain-tones="true" opacity="${layer.opacity}">
<g mask="url(#terrain-tone-land)"><g filter="url(#terrain-tone-blur)">
<rect x="${-padding}" y="${-padding}" width="${map.width + padding * 2}" height="${map.height + padding * 2}" fill="${terrainToneCss(PALETTE.land)}"/>
${cells.join('\n')}
</g></g>
<g data-water-tones="true" fill="${REGION_WATER_FILL}">${waterIds.map((id) => `<use href="#${id}"/>`).join('')}</g>
</g>`;
}
