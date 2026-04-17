import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import * as Regions from '../src/lib/regions/regions.js';
import { buildRegionMapSvgString } from '../src/lib/map/region_map_svg.js';
import {
  buildRoadCentroidPolylines,
  minDistanceSquaredToRoadPolylines,
  minDistanceSquaredToRivers,
} from '../src/lib/map/road_polylines.js';

function getBiomeChar(node: any): string {
  if (node.isOcean) return '\x1b[34m~\x1b[0m'; // Blue wave
  if (node.isWater) return '\x1b[36m=\x1b[0m'; // Cyan equals

  const b = node.biomeId?.toLowerCase() || '';

  // Mountains / High elevation override (if high enough)
  if (node.elevation > 0.85) return '\x1b[37m^\x1b[0m'; // White peak

  if (b.includes('forest') || b.includes('woodland')) return '\x1b[32mF\x1b[0m'; // Green F
  if (b.includes('desert') || b.includes('arid') || b.includes('dry')) return '\x1b[33mD\x1b[0m'; // Yellow D
  if (b.includes('tundra') || b.includes('ice') || b.includes('polar')) return '\x1b[37mT\x1b[0m'; // White T
  if (b.includes('grassland') || b.includes('plains') || b.includes('savanna'))
    return '\x1b[32m.\x1b[0m'; // Green dot
  if (b.includes('tropical') || b.includes('jungle')) return '\x1b[32mY\x1b[0m'; // Green Y

  // Default land based on elevation
  if (node.elevation > 0.6) return '\x1b[90m^\x1b[0m'; // Gray ^ for mountains/hills
  if (node.elevation > 0.4) return '\x1b[90mm\x1b[0m'; // Gray m for hills

  return `\x1b[32m,\x1b[0m`; // Green comma as fallback for unknown land
}

function printUsage(): void {
  console.log(`Usage: vite-node scripts/render_region_map.ts [--svg-out <path> | -o <path>]

  --svg-out, -o   Write sepia SVG map to this file (ASCII still prints to stdout).

Example:
  npm run render:region -- --svg-out ./region_map.svg
`);
}

function renderMap() {
  const { values } = parseArgs({
    options: {
      'svg-out': { type: 'string', short: 'o' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: false,
  });

  if (values.help) {
    printUsage();
    process.exit(0);
  }

  const svgOutPath = typeof values['svg-out'] === 'string' ? values['svg-out'] : undefined;

  console.log('Generating Region Map...\n');

  const config = Regions.getDefaultConfig();
  // Adjust config sizes to fit terminal better
  config.mapWidth = 60;
  config.mapHeight = 35;

  const region = Regions.generate(config);
  const map = region.map;

  if (svgOutPath !== undefined && svgOutPath.length > 0) {
    const svg = buildRegionMapSvgString(map, {
      title: region.name,
      settlements: region.settlements.map((s, i) => ({
        mapNodeId: s.mapNodeId,
        isCapital: i === 0,
      })),
    });
    writeFileSync(svgOutPath, svg, 'utf8');
    console.log(`Wrote SVG to ${svgOutPath}\n`);
  }
  const biomes = new Set(region.map.nodes.map((n) => n.biomeId));
  const minElev = Math.min(...region.map.nodes.map((n) => n.elevation));
  const maxElev = Math.max(...region.map.nodes.map((n) => n.elevation));
  console.log(`Elevs: Min ${minElev.toFixed(2)}, Max ${maxElev.toFixed(2)}`);
  console.log('Biomes generated: ', Array.from(biomes).join(', '));
  const temps = region.map.nodes.map((n) => n.temperature);
  console.log(
    `Temps: Min ${Math.min(...temps).toFixed(1)}, Max ${Math.max(...temps).toFixed(1)}, Avg ${(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)}`,
  );
  const moistures = region.map.nodes.map((n) => n.moisture);
  console.log(
    `Moist: Min ${Math.min(...moistures).toFixed(2)}, Max ${Math.max(...moistures).toFixed(2)}`,
  );
  console.log(`==========================================`);
  console.log(`Region: ${region.name}`);
  console.log(`Nodes:  ${map.nodes.length}`);
  console.log(`Towns:  ${region.settlements.length}`);
  console.log(`==========================================\n`);

  // To prevent the map from looking squished vertically, we double the horizontal resolution
  const aspectOffset = 2;
  const gridWidth = map.width * aspectOffset;
  const gridHeight = map.height;

  const roadPolylines = buildRoadCentroidPolylines(map);

  // Render base land (roads/rivers: distance to segment, not edge midpoint — avoids disjoint parallel hits)
  const grid: string[][] = [];
  const lineHitSq = 1.0;
  for (let y = 0; y < gridHeight; y++) {
    const row: string[] = [];
    for (let x = 0; x < gridWidth; x++) {
      const px = x / aspectOffset;
      const py = y;

      let nearestNode = map.nodes[0];
      let nearestDist = Infinity;

      for (const node of map.nodes) {
        const dx = node.center.x - px;
        const dy = node.center.y - py;
        const distSq = dx * dx + dy * dy;

        if (distSq < nearestDist) {
          nearestDist = distSq;
          nearestNode = node;
        }
      }

      const roadDistSq = minDistanceSquaredToRoadPolylines(roadPolylines, px, py);
      const riverDistSq = minDistanceSquaredToRivers(map, px, py);

      if (roadDistSq < lineHitSq) {
        row.push('\x1b[33m#\x1b[0m'); // Brown/Yellow Road
      } else if (riverDistSq < lineHitSq) {
        row.push('\x1b[36m|\x1b[0m'); // River cyan |
      } else {
        row.push(getBiomeChar(nearestNode));
      }
    }
    grid.push(row);
  }

  // Render settlements directly onto the grid
  for (let i = 0; i < region.settlements.length; i++) {
    const s = region.settlements[i];
    if (s.mapNodeId !== undefined) {
      const sNode = map.nodes[s.mapNodeId];
      let sx = Math.floor(sNode.center.x * aspectOffset);
      let sy = Math.floor(sNode.center.y);

      // Keep within bounds safely
      sx = Math.max(0, Math.min(gridWidth - 1, sx));
      sy = Math.max(0, Math.min(gridHeight - 1, sy));

      // First settlement generated in Region is always Capital
      const isCapital = i === 0;
      grid[sy][sx] = isCapital ? '\x1b[31;1m*\x1b[0m' : '\x1b[31mo\x1b[0m';
    }
  }

  // Print grid
  for (let y = 0; y < gridHeight; y++) {
    console.log(grid[y].join(''));
  }

  console.log('\nLegend:');
  console.log('\x1b[34m~\x1b[0m = Ocean    \x1b[36m=\x1b[0m = Lake     \x1b[32mF\x1b[0m = Forest');
  console.log(
    '\x1b[33mD\x1b[0m = Desert   \x1b[37mT\x1b[0m = Tundra   \x1b[37m^\x1b[0m = Peak (\x1b[90mm\x1b[0m = Hill)',
  );
  console.log(
    '\x1b[32m.\x1b[0m = Plains   \x1b[31;1m*\x1b[0m = Capital  \x1b[31mo\x1b[0m = Town\n\x1b[33m#\x1b[0m = Road\n',
  );

  // List Settlements
  console.log('Settlements in Region:');
  for (let i = 0; i < region.settlements.length; i++) {
    const s = region.settlements[i];
    const isCapital = i === 0;
    const typeLabel = isCapital ? 'Capital' : s.category.name;
    const padding = ' '.repeat(Math.max(0, 20 - s.name.length));
    console.log(
      ` - ${s.name}${padding} | ${typeLabel.padEnd(8)} | Population: ${s.population.toString().padStart(6)} | Map Node: ${s.mapNodeId}`,
    );
  }
  console.log('\nDone!');
}

renderMap();
