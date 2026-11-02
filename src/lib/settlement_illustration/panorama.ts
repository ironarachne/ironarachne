import { RNG } from '@ironarachne/rng';
import { create } from 'xmlbuilder2';
import { CARTOGRAPHY } from '$lib/cartography';
import { canonical, n, path, polygon } from './geometry';
import { resolvePanoramaProfile } from './profile';
import { drawPlant } from './plants';
import { drawBuilding } from './buildings';
import type {
  PanoramaInput,
  PanoramaScene,
  PanoramaLayer,
  ScenePath,
} from './settlement_illustration_types';

export function buildSettlementPanorama(input: PanoramaInput): PanoramaScene {
  const profile = resolvePanoramaProfile(input);
  const architecture = input.architecture;
  const rng = new RNG(
    'settlement-panorama:1:' +
      canonical({
        name: input.name,
        category: input.category.name,
        population: input.population,
        biome: {
          name: input.biome.name,
          temperature: input.biome.temperature,
          humidity: input.biome.humidity,
          altitude: input.biome.altitude,
          isAquatic: input.biome.isAquatic,
        },
        relief: input.terrain.reliefEnergy,
        architecture: { style: architecture.style, examples: architecture.examples },
      }),
  );
  const layers: PanoramaLayer[] = ['sky', 'background', 'terrain', 'settlement', 'foreground'].map(
    (kind) => ({ kind: kind as PanoramaLayer['kind'], paths: [] }),
  );
  const [sky, background, terrain, settlement, foreground] = layers;
  for (let i = 0; i < 4 + Math.round(input.biome.humidity * 8); i++) {
    const x = rng.float(-80, 930);
    const y = rng.float(15, 92);
    const width = rng.float(45, 180);
    sky.paths.push(
      path(
        `M${n(x)},${n(y)}q${n(width * 0.15)},${n(-rng.float(6, 17))} ${n(width * 0.3)},-4q${n(width * 0.1)},-18 ${n(width * 0.25)},-8q${n(width * 0.3)},-7 ${n(width * 0.45)},12`,
        'none',
        'secondary',
        0.65,
        0.42,
      ),
    );
    sky.paths.push(
      path(`M${n(x + width * 0.15)},${n(y + 5)}h${n(width * 0.7)}`, 'none', 'secondary', 0.4, 0.3),
    );
  }
  const mountains =
    profile.landscape === 'highland' ||
    input.terrain.reliefEnergy > 0.6 ||
    input.biome.altitude > 0.7;
  for (let band = 0; band < 3; band++) {
    const points: number[][] = [];
    for (let x = -40; x <= 1040; x += 40)
      points.push([x, 120 + band * 22 - rng.float(0, mountains ? 95 - band * 15 : 20)]);
    background.paths.push({
      ...polygon([...points, [1040, 240], [-40, 240]], band === 0 ? 'light' : 'paper', 'secondary'),
      opacity: 0.4 + band * 0.17,
    });
    for (let i = 1; i < points.length - 1; i++) {
      const [x, y] = points[i];
      if (y < points[i - 1][1])
        background.paths.push(
          path(
            `M${n(x)},${n(y)}l${n(rng.float(7, 18))},${n(20 + band * 4)}l-5,12`,
            'none',
            'secondary',
            0.6,
            0.5,
          ),
        );
    }
  }
  const ground = (x: number) => 211 + Math.sin(x / 180) * 9 + Math.sin(x / 55) * 2;
  terrain.paths.push(
    polygon(
      [
        [-10, 205],
        ...Array.from({ length: 52 }, (_, i) => [i * 20, ground(i * 20)]),
        [1020, 310],
        [-10, 310],
      ],
      'paper',
      'secondary',
    ),
  );
  const wet = ['wetland', 'coastal'].includes(profile.landscape);
  for (let i = 0; i < 85; i++) {
    const x = rng.float(0, 1000);
    const y = rng.float(220, 300);
    terrain.paths.push(
      path(
        `M${n(x)},${n(y)}q${n(rng.float(10, 25))},${wet ? 0 : n(rng.float(-3, 3))} ${n(rng.float(25, 80))},0`,
        'none',
        wet ? 'water' : 'secondary',
        0.4,
        0.3,
      ),
    );
  }
  const plantCount = Math.round(profile.vegetationDensity * 68);
  for (let i = 0; i < plantCount; i++) {
    const x = rng.float(0, 1000);
    const y = ground(x) - rng.float(12, 27);
    background.paths.push(
      ...drawPlant({ kind: profile.vegetation, x, y, scale: rng.float(1.5, 3) }, rng),
    );
  }
  const buildings: PanoramaScene['buildings'] = [];
  if (architecture.style && architecture.examples.length) {
    const columns = Math.min(16, Math.max(3, Math.ceil(Math.sqrt(profile.buildingCount * 2))));
    const rows = Math.ceil(profile.buildingCount / columns);
    for (let i = 0; i < profile.buildingCount; i++) {
      const row = Math.floor(i / columns);
      const inRow = Math.min(columns, profile.buildingCount - row * columns);
      const x =
        500 -
        profile.settlementSpread / 2 +
        (((i % columns) + 0.5) * profile.settlementSpread) / inRow +
        rng.float(-5, 5);
      const y = ground(x) - 22 + (row / rows) * 39;
      const example = architecture.examples[i % architecture.examples.length];
      const scale =
        (1.25 + (row / rows) * 0.5) * Math.min(1, 3 / Math.max(1, example.wallHeightWidthRatio));
      const building = drawBuilding(architecture.style, example, x, y, scale);
      if (building) buildings.push(building);
    }
  }
  buildings.sort((a, b) => a.y - b.y || a.x - b.x);
  for (const building of buildings) settlement.paths.push(...building.paths);
  for (let i = 0; i < Math.round(profile.vegetationDensity * 16); i++) {
    const x = i % 2 ? rng.float(10, 170) : rng.float(830, 990);
    foreground.paths.push(
      ...drawPlant(
        { kind: profile.vegetation, x, y: rng.float(265, 300), scale: rng.float(2, 4) },
        rng,
      ),
    );
  }
  // A global bound supplements the per-grammar cap. Remove decoration, never building structure.
  const scene = { version: 1, width: 1000, height: 300, layers, buildings };
  for (const layer of [foreground, background, terrain, sky]) {
    while (sceneSegments(scene) > 20000 && layer.paths.length) layer.paths.pop();
  }
  if (sceneSegments(scene) > 20000) throw new Error('Panorama architecture exceeds drawing budget');
  return scene;
}
export function sceneSegments(scene: PanoramaScene): number {
  return scene.layers.reduce(
    (sum, layer) =>
      sum + layer.paths.reduce((count, p) => count + (p.d.match(/[MLQCHVZ]/gi)?.length ?? 0), 0),
    0,
  );
}
export function renderSettlementPanorama(scene: PanoramaScene): string {
  const root = create().ele('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: `0 0 ${n(scene.width)} ${n(scene.height)}`,
    width: scene.width,
    height: scene.height,
  });
  root.ele('rect', { width: scene.width, height: scene.height, fill: CARTOGRAPHY.ground.fill });
  const fills = {
    paper: CARTOGRAPHY.ground.fill,
    light: '#e1d6c3',
    shade: '#c8b79e',
    none: 'none',
  };
  for (const layer of scene.layers) {
    const group = root.ele('g', {
      'data-layer': layer.kind,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
    });
    for (const p of layer.paths) {
      validatePath(p);
      group.ele('path', {
        d: p.d,
        fill: fills[p.fill],
        stroke: p.ink === 'none' ? 'none' : CARTOGRAPHY.palette[p.ink].color,
        'stroke-width': p.strokeWidth,
        opacity: p.opacity,
      });
    }
  }
  return root.end({ headless: true });
}
function validatePath(p: ScenePath): void {
  if (
    !/^[MLQCHVZmlqchvz0-9.,\s+-]+$/.test(p.d) ||
    !Number.isFinite(p.strokeWidth) ||
    !Number.isFinite(p.opacity)
  )
    throw new Error('Invalid panorama path');
}
