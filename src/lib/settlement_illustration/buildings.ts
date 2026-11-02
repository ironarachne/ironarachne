import type {
  ArchitecturalInstance,
  ArchitecturalStyle,
  ArchitecturalVariant,
  WindowShape,
} from '$lib/architecture';
import { n, path, polygon } from './geometry';
import type { BuildingPlacement, ScenePath } from './settlement_illustration_types';

/** A side-on elevation of a saved example; this function makes no random choices. */
export function drawBuilding(
  style: ArchitecturalStyle,
  example: ArchitecturalInstance,
  x: number,
  y: number,
  scale: number,
): BuildingPlacement | null {
  const profile = style.profiles.find((p) => p.id === example.profileId);
  const variant = profile?.variants.find((v) => v.id === example.variantId);
  if (
    !profile ||
    !variant?.roof ||
    profile.context.construction !== 'built' ||
    profile.context.exposure === 'buried' ||
    example.storeys === null
  )
    return null;
  const roof = variant.roof;
  const w = 24;
  const h = w * example.wallHeightWidthRatio;
  const pt = (a: number, b: number) => `${n(x + a * scale)},${n(y + b * scale)}`;
  const poly = (points: number[][], fill: 'paper' | 'light' | 'shade' = 'paper') =>
    polygon(
      points.map(([a, b]) => [x + a * scale, y + b * scale]),
      fill,
    );
  const paths: ScenePath[] = [
    poly([
      [0, 0],
      [w, 0],
      [w, -h],
      [0, -h],
    ]),
  ];
  const e = roof.eaves === 'deep' ? 3 : roof.eaves === 'short' ? 1.2 : 0;
  const rise = w * (roof.pitch === 'steep' ? 0.65 : roof.pitch === 'moderate' ? 0.38 : 0.14);
  const roofPoints = roofOutline(roof.form, w, h, rise, e);
  if (roof.form === 'dome') {
    const center = w / 2;
    const base = -h;
    const radius = w / 2 + e;
    const apex = base - w * 0.65;
    paths.push(
      path(
        `M${pt(center - radius, base)}Q${pt(center - radius, apex)} ${pt(center, apex)}Q${pt(center + radius, apex)} ${pt(center + radius, base)}Z`,
        'light',
      ),
    );
    paths.push(
      path(
        `M${pt(center, apex)}Q${pt(center - radius * 0.4, base - 8)} ${pt(center - radius * 0.35, base)}M${pt(center, apex)}Q${pt(center + radius * 0.4, base - 8)} ${pt(center + radius * 0.35, base)}`,
        'none',
        'secondary',
        0.4,
      ),
    );
  } else {
    paths.push(poly(roofPoints, 'light'));
  }
  // Fine strokes on the visible wall encode actual enclosure material, not biome stereotypes.
  const wall = variant.surfaces.find((s) => s.role === 'outer_wall');
  const material = style.materials.find((m) => m.id === wall?.materialId);
  if (wall && !['plastered', 'painted', 'smooth'].includes(wall.finish)) {
    if (material?.family === 'wood' || material?.form === 'board') {
      for (let a = 3; a < w; a += 4)
        paths.push(path(`M${pt(a, -h + 1)}L${pt(a, -1)}`, 'none', 'secondary', 0.35));
    } else if (material && ['stone', 'ceramic'].includes(material.family)) {
      for (let b = -4, row = 0; b > -h; b -= 4, row++) {
        paths.push(path(`M${pt(0, b)}L${pt(w, b)}`, 'none', 'secondary', 0.3));
        for (let a = row % 2 ? 4 : 8; a < w; a += 8)
          paths.push(path(`M${pt(a, b)}L${pt(a, Math.max(-h, b - 4))}`, 'none', 'secondary', 0.3));
      }
    }
  }
  const covering = style.materials.find((m) => m.id === roof.coveringMaterialId);
  if (covering && roof.form !== 'dome') {
    // Clip horizontal material courses to the elevation, including separate cross-gable peaks.
    // There is no receding roof plane or visible side wall in this projection.
    for (let v = -h - 2; v > Math.min(...roofPoints.map((p) => p[1])); v -= 3) {
      const crossings = roofPoints
        .flatMap(([ax, ay], index) => {
          const [bx, by] = roofPoints[(index + 1) % roofPoints.length];
          return (ay <= v && by > v) || (by <= v && ay > v)
            ? [ax + ((v - ay) * (bx - ax)) / (by - ay)]
            : [];
        })
        .sort((a, b) => a - b);
      for (let i = 0; i + 1 < crossings.length; i += 2)
        paths.push(
          path(
            `M${pt(crossings[i], v)}L${pt(crossings[i + 1], v)}`,
            'none',
            'secondary',
            covering.form === 'thatch' ? 0.65 : 0.3,
          ),
        );
    }
  }
  paths.push(...openings(variant, example.storeys, w, h, pt));
  const portal = profile.portals[0];
  if (portal)
    paths.push(
      path(
        opening(
          11,
          -0.5,
          4,
          Math.min(h * 0.45, 9),
          portal === 'pointed_arch'
            ? 'lancet'
            : portal === 'round_arch'
              ? 'segmental_arch'
              : 'rectangular',
          pt,
        ),
        'shade',
        'body',
        0.5,
      ),
    );
  // Only explicitly placed additions are visible; an eligible catalog feature is not a building fact.
  for (const id of example.placedFeatureIds) {
    const feature = variant.features.find((f) => f.id === id);
    if (feature?.kind === 'raised_plinth' || feature?.kind === 'terraced_foundation')
      paths.push(
        poly(
          [
            [-2, 1],
            [w + 2, 1],
            [w + 2, 3],
            [-2, 3],
          ],
          'light',
        ),
      );
    if (feature?.kind === 'balcony' || feature?.kind === 'loggia' || feature?.kind === 'arcade')
      paths.push(
        poly(
          [
            [-1, -h / 2],
            [w + 1, -h / 2],
            [w + 1, -h / 2 + 2],
            [-1, -h / 2 + 2],
          ],
          'light',
        ),
      );
  }
  return { exampleId: example.id, x, y, scale, paths };
}

export function roofOutline(
  form: NonNullable<ArchitecturalVariant['roof']>['form'],
  w: number,
  h: number,
  rise: number,
  e: number,
): number[][] {
  const left = -e;
  const right = w + e;
  const base = -h;
  switch (form) {
    case 'flat':
      return [
        [left, base - 1],
        [right, base - 1],
        [right, base],
        [left, base],
      ];
    case 'shed':
      return [
        [left, base - rise],
        [right, base],
        [left, base],
      ];
    case 'hip':
      return [
        [left, base],
        [w * 0.35, base - rise],
        [w * 0.65, base - rise],
        [right, base],
      ];
    case 'gambrel':
      return [
        [left, base],
        [w * 0.18, base - rise * 0.72],
        [w / 2, base - rise],
        [w * 0.82, base - rise * 0.72],
        [right, base],
      ];
    case 'mansard':
      return [
        [left, base],
        [w * 0.2, base - rise],
        [w * 0.8, base - rise],
        [right, base],
      ];
    case 'cross_gable':
      return [
        [left, base],
        [w * 0.27, base - rise],
        [w * 0.52, base - rise * 0.2],
        [w * 0.76, base - rise * 0.85],
        [right, base],
      ];
    case 'dome':
    case 'barrel':
      return Array.from({ length: 13 }, (_, i) => {
        const angle = (Math.PI * i) / 12;
        return [
          w / 2 - Math.cos(angle) * (w / 2 + e),
          base - Math.sin(angle) * (form === 'dome' ? w * 0.45 : rise),
        ];
      });
    case 'gable':
      return [
        [left, base],
        [w / 2, base - rise],
        [right, base],
      ];
  }
}
function opening(
  x: number,
  y: number,
  w: number,
  h: number,
  shape: WindowShape,
  pt: (x: number, y: number) => string,
): string {
  if (shape === 'full_round')
    return `M${pt(x, y - h / 2)}Q${pt(x, y - h)} ${pt(x + w / 2, y - h)}Q${pt(x + w, y - h)} ${pt(x + w, y - h / 2)}Q${pt(x + w, y)} ${pt(x + w / 2, y)}Q${pt(x, y)} ${pt(x, y - h / 2)}Z`;
  if (shape === 'lancet')
    return `M${pt(x, y)}L${pt(x, y - h * 0.6)}Q${pt(x, y - h * 0.8)} ${pt(x + w / 2, y - h)}Q${pt(x + w, y - h * 0.8)} ${pt(x + w, y - h * 0.6)}L${pt(x + w, y)}Z`;
  if (shape === 'segmental_arch')
    return `M${pt(x, y)}L${pt(x, y - h * 0.75)}Q${pt(x + w / 2, y - h * 1.2)} ${pt(x + w, y - h * 0.75)}L${pt(x + w, y)}Z`;
  return `M${pt(x, y)}L${pt(x, y - h)}L${pt(x + w, y - h)}L${pt(x + w, y)}Z`;
}
function openings(
  variant: ArchitecturalVariant,
  storeys: number,
  w: number,
  h: number,
  pt: (x: number, y: number) => string,
): ScenePath[] {
  const win = variant.windows;
  if (!win) return [];
  const paths: ScenePath[] = [];
  const count = win.count === 'sparse' ? 1 : win.count === 'moderate' ? 2 : 3;
  for (let row = 0; row < storeys; row++) {
    for (let col = 0; col < count; col++) {
      const x = ((col + 0.5) * w) / count;
      const y = (-h * (row + 0.4)) / storeys;
      const height = Math.min(5, (h / storeys) * 0.3);
      paths.push(
        path(
          opening(
            x - 1.5,
            y,
            3,
            ['small_square', 'full_round'].includes(win.shape) ? 3 : height,
            win.shape,
            pt,
          ),
          'shade',
          'body',
          0.4,
        ),
      );
      if (win.fill === 'lattice' || win.fill === 'grille')
        paths.push(path(`M${pt(x, y)}L${pt(x, y - height)}`, 'none', 'secondary', 0.35));
      if (win.fill === 'shuttered')
        paths.push(
          path(
            `M${pt(x - 2, y)}L${pt(x - 2, y - height)}M${pt(x + 2, y)}L${pt(x + 2, y - height)}`,
            'none',
            'body',
            0.6,
          ),
        );
    }
  }
  return paths;
}
