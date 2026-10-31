import type { RNG } from '@ironarachne/rng';
import type {
  ArchitecturalMaterial,
  ArchitecturalProfile,
  ArchitecturalVariant,
  ArchitectureContext,
  GenerateArchitecturalStyleConfig,
  MotifKind,
} from './architecture_types';
import { usableMaterials } from './architecture_materials';
import { BUILDING_ADDITION_CATALOG } from './building_additions_data';
import {
  baseSurfaces,
  materialWeight,
  proportionPolicy,
  roofCandidates,
  structuralCandidates,
  structuralSystem,
} from './architecture_policy';

function chooseMotif(
  config: GenerateArchitecturalStyleConfig,
  material: ArchitecturalMaterial | null,
  rng: RNG,
): MotifKind {
  if (!material?.roles.includes('ornament')) return 'none';
  const preferences = [...config.culturalPreferences]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .filter((p) => p.weight > 0);
  return preferences.length
    ? rng.weighted(
        preferences.map((p) => ({
          value: p.motif,
          commonality: Math.max(1, Math.round(p.weight * 100)),
        })),
      )
    : 'none';
}
function buildVariants(
  config: GenerateArchitecturalStyleConfig,
  context: ArchitectureContext,
  materials: ArchitecturalMaterial[],
  primary: ArchitecturalMaterial | null,
  rng: RNG,
): ArchitecturalVariant[] {
  const roofs = primary ? roofCandidates(materials, primary, context, config) : [];
  if (context.construction === 'built' && context.exposure !== 'buried' && !roofs.length) return [];
  const floor = context.construction === 'built' ? usableMaterials(materials, 'floor')[0] : primary;
  if (context.construction === 'built' && !floor) return [];
  const ceilings = materials.filter(
    (m) =>
      m.roles.includes('structure') &&
      (['timber', 'pole', 'slab'].includes(m.form) ||
        (['stone', 'ceramic'].includes(m.family) && ['block', 'brick'].includes(m.form))),
  );
  if (context.construction === 'built' && context.exposure === 'buried' && !ceilings.length)
    return [];
  const wallMaterial = primary?.id ?? null;
  const variants: ArchitecturalVariant[] = [];
  for (let index = 0; index < 4; index++) {
    const roof = roofs.length ? rng.item(roofs) : null;
    const overhead =
      context.construction === 'built'
        ? roof
          ? materials.find((m) => m.id === roof.structureMaterialId)
          : ceilings[index % ceilings.length]
        : primary;
    const board = usableMaterials(materials, 'enclosure').find((m) => m.form === 'board');
    const surfaces = baseSurfaces(primary, context).map((s) =>
      s.role === 'floor'
        ? { ...s, materialId: floor?.id ?? null }
        : s.role === 'ceiling' && overhead
          ? { ...s, materialId: overhead.id }
          : s,
    );
    const finish = usableMaterials(materials, 'finish')[
      index % Math.max(1, usableMaterials(materials, 'finish').length)
    ];
    if (finish && context.construction !== 'natural' && index % 2 === 1) {
      const wall = surfaces.find((s) => s.role === 'inner_wall');
      if (wall) {
        wall.finish = finish.form === 'tile' ? 'tiled' : 'plastered';
        wall.finishMaterialId = finish.id;
      }
    }
    const fills = usableMaterials(materials, 'window_fill');
    const fill = fills.length ? fills[index % fills.length] : null;
    const windows: ArchitecturalVariant['windows'] = context.exteriorWindowsAllowed
      ? {
          count:
            context.purpose === 'defensive' ||
            config.biome.temperature < 10 ||
            (config.climate?.temperatureMin ?? 1) < 0
              ? 'sparse'
              : index % 2
                ? 'rich'
                : 'moderate',
          arrangement: 'regular_grid',
          shape: primary?.family === 'stone' ? 'segmental_arch' : 'rectangular',
          fill:
            fill?.form === 'pane'
              ? 'glazed'
              : fill?.form === 'bar'
                ? 'grille'
                : fill?.form === 'board'
                  ? 'shuttered'
                  : fill?.form === 'woven'
                    ? 'membrane'
                    : 'open',
          fillMaterialId: fill?.id ?? null,
          shutterMaterialId: board?.id ?? null,
        }
      : null;
    const features: ArchitecturalVariant['features'] = [];
    if (context.construction !== 'natural' && wallMaterial) {
      if (config.biome.temperature >= 30 && context.exposure === 'exposed')
        features.push({
          id: 'deep_reveal',
          kind: 'deep_reveal',
          materialId: wallMaterial,
          evidenceIds: [],
        });
      if (config.site.floodProne && context.exposure === 'exposed')
        features.push({
          id: 'raised_plinth',
          kind: 'raised_plinth',
          materialId: wallMaterial,
          evidenceIds: [],
        });
      if (config.site.relief === 'mountainous' && context.exposure === 'exposed')
        features.push({
          id: 'terraced_foundation',
          kind: 'terraced_foundation',
          materialId: wallMaterial,
          evidenceIds: [],
        });
    }
    if (primary && context.construction === 'built' && context.exposure === 'exposed') {
      const additions = BUILDING_ADDITION_CATALOG.filter(
        (e) =>
          e.eligiblePurposes.some((p) => p === context.purpose) &&
          (!e.requiresWood || primary.family === 'wood') &&
          (!e.requiresMasonry || ['stone', 'ceramic'].includes(primary.family)) &&
          (e.kind !== 'roof_terrace' || roof?.form === 'flat') &&
          (!['oriel_window', 'bay_projection'].includes(e.kind) || windows !== null),
      );
      if (additions.length && index % 2 === 1) {
        const addition = rng.weighted(additions.map((e) => ({ value: e, commonality: e.weight })));
        features.push({
          id: addition.kind,
          kind: addition.kind,
          materialId: primary.id,
          evidenceIds: [],
        });
      }
    }
    const variant: ArchitecturalVariant = {
      id: '',
      surfaces,
      roof,
      windows,
      supports:
        context.construction === 'natural'
          ? 'none'
          : context.construction === 'rock_cut'
            ? 'rock_pillars'
            : primary?.family === 'wood'
              ? 'timber_posts'
              : 'piers',
      supportMaterialId: context.construction === 'natural' ? null : wallMaterial,
      ceiling:
        context.construction === 'natural'
          ? 'natural'
          : context.construction === 'rock_cut'
            ? index % 2
              ? 'carved_vault'
              : 'carved_flat'
            : primary?.family === 'wood'
              ? 'beamed'
              : index % 2
                ? 'barrel_vault'
                : 'flat',
      massing:
        context.construction === 'built' && context.exposure !== 'buried'
          ? config.site.relief === 'mountainous'
            ? 'terraced_steps'
            : context.density === 'low'
              ? 'linear_spread'
              : 'compact_blocks'
          : null,
      proportions: proportionPolicy(
        context,
        context.exposure !== 'buried' &&
          (config.biome.temperature < 10 || (config.climate?.temperatureMin ?? 1) < 0),
      ),
      features,
    };
    // A roof's frame also defines its interior ceiling, never a mismatched masonry vault beneath timber.
    if (overhead && context.construction === 'built')
      variant.ceiling = ['timber', 'pole'].includes(overhead.form)
        ? 'beamed'
        : overhead.form === 'slab'
          ? 'flat'
          : 'barrel_vault';
    if (roof?.form === 'dome') variant.ceiling = 'dome';
    if (roof?.form === 'barrel') variant.ceiling = 'barrel_vault';
    if (!variants.some((v) => JSON.stringify({ ...v, id: '' }) === JSON.stringify(variant)))
      variants.push({ ...variant, id: `${context.id}:variant:${variants.length}` });
  }
  return variants;
}
export function generateArchitectureProfile(
  config: GenerateArchitecturalStyleConfig,
  context: ArchitectureContext,
  materials: ArchitecturalMaterial[],
  rng: RNG,
): ArchitecturalProfile | null {
  const feasible = structuralCandidates(materials, context).filter(
    (m) =>
      context.construction !== 'built' ||
      context.exposure === 'buried' ||
      roofCandidates(materials, m, context, config).length > 0,
  );
  const candidates = feasible.some((m) => m.availability === 'available')
    ? feasible.filter((m) => m.availability === 'available')
    : feasible;
  const primary =
    context.construction === 'natural'
      ? (materials.find((m) => m.form === 'native_rock' && m.origin === 'native') ?? null)
      : candidates.length
        ? rng.weighted(
            candidates.map((m) => ({ value: m, commonality: materialWeight(m, config, context) })),
          )
        : null;
  if (!primary && context.construction !== 'natural') return null;
  const variants = buildVariants(config, context, materials, primary, rng);
  if (!variants.length) return null;
  const motif = context.construction === 'natural' ? 'none' : chooseMotif(config, primary, rng);
  if (motif !== 'none' && primary && ['wood', 'stone'].includes(primary.family))
    for (const variant of variants)
      variant.features.push({
        id: 'motif',
        kind: primary.family === 'wood' ? 'wood_carving' : 'stone_carving',
        materialId: primary.id,
        evidenceIds: [],
      });
  const frames =
    context.construction === 'natural'
      ? []
      : usableMaterials(materials, 'structure').filter((m) =>
          context.construction === 'rock_cut' ? m.id === primary?.id : m.form !== 'native_rock',
        );
  return {
    id: context.id,
    context: structuredClone(context),
    primaryMaterialId: primary?.id ?? null,
    structure:
      context.construction === 'natural'
        ? 'unworked'
        : primary &&
            ['stone', 'ceramic'].includes(primary.family) &&
            variants.every(
              (v) =>
                materials.find(
                  (m) => m.id === v.surfaces.find((s) => s.role === 'ceiling')?.materialId,
                )?.family === 'wood',
            ) &&
            rng.int(1, 100) > 50
          ? 'hybrid_timber_and_masonry'
          : structuralSystem(primary!, context),
    motif,
    portals:
      context.construction === 'natural'
        ? ['natural']
        : context.construction === 'rock_cut'
          ? ['rough_cut', 'round_arch']
          : primary?.family === 'wood'
            ? ['rectangular']
            : ['rectangular', 'round_arch', 'pointed_arch'],
    frameMaterialIds: frames.map((m) => m.id),
    leafMaterialIds:
      context.construction === 'natural'
        ? []
        : usableMaterials(materials, 'door_leaf').map((m) => m.id),
    variants,
  };
}
