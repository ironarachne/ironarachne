import { roofFormsForMaterials } from './architecture_material_policy';
import type {
  ArchitectureContext,
  ArchitecturalMaterial,
  ArchitecturalVariant,
  GenerateArchitecturalStyleConfig,
  StructuralSystem,
  SurfaceTreatment,
  RoofTreatment,
} from './architecture_types';
import { usableMaterials } from './architecture_materials';
export const ARCHITECTURE_VERSION = 1 as const;
export function architectureOperationSeed(root: string, operation: string, id: string): string {
  return JSON.stringify(['architecture', ARCHITECTURE_VERSION, root, operation, id]);
}
export function structuralSystem(
  material: ArchitecturalMaterial,
  context: ArchitectureContext,
): StructuralSystem {
  if (context.construction === 'rock_cut') return 'excavated_rock';
  if (material.family === 'wood') return 'post_and_beam';
  if (material.family === 'earth') return 'cob_or_adobe';
  return 'load_bearing_masonry';
}
export function structuralCandidates(
  materials: ArchitecturalMaterial[],
  context: ArchitectureContext,
): ArchitecturalMaterial[] {
  const candidates = usableMaterials(materials, 'structure').filter((m) =>
    context.construction === 'rock_cut'
      ? m.form === 'native_rock' && m.origin === 'native'
      : m.form !== 'native_rock' &&
        ['timber', 'pole', 'block', 'brick', 'compacted_earth'].includes(m.form),
  );
  return candidates.filter((m) =>
    m.family === 'wood'
      ? m.affordance.tensileSuitability >= 0.3
      : m.affordance.compressiveSuitability >= 0.3,
  );
}
export function materialWeight(
  material: ArchitecturalMaterial,
  config: GenerateArchitecturalStyleConfig,
  context: ArchitectureContext,
): number {
  const strength =
    material.affordance.compressiveSuitability + material.affordance.tensileSuitability;
  const moisture =
    context.exposure === 'exposed' && config.biome.humidity >= 0.7 && material.family === 'earth'
      ? 0.4
      : 1;
  const coastal =
    context.exposure === 'exposed' && config.site.coastal
      ? 1 + material.affordance.weatherResistance * 0.2
      : 1;
  const terrain = config.site.relief === 'mountainous' && material.family === 'stone' ? 1.3 : 1;
  return Math.max(
    1,
    Math.round(
      (1 + strength) *
        moisture *
        terrain *
        coastal *
        (material.availability === 'limited' ? 0.5 : 1) *
        100,
    ),
  );
}
export function rainExposed(
  config: GenerateArchitecturalStyleConfig,
  context: ArchitectureContext,
): boolean {
  return (
    context.exposure === 'exposed' &&
    !!config.climate &&
    (config.climate.precipitationFrequency >= 0.6 || config.climate.precipitationAmount >= 0.6)
  );
}
export function roofCandidates(
  materials: ArchitecturalMaterial[],
  primary: ArchitecturalMaterial,
  context: ArchitectureContext,
  config: GenerateArchitecturalStyleConfig,
): RoofTreatment[] {
  if (context.exposure === 'buried' || context.construction !== 'built') return [];
  const frames = usableMaterials(materials, 'structure').filter(
    (m) =>
      ['timber', 'pole', 'slab', 'block', 'brick'].includes(m.form) &&
      (primary.family !== 'wood' || m.family === 'wood'),
  );
  const covers = usableMaterials(materials, 'roof_covering');
  return frames
    .flatMap((frame) =>
      covers.flatMap((cover) => {
        return roofFormsForMaterials(frame, cover).map((form) => ({
          form,
          pitch: ['flat', 'dome', 'barrel'].includes(form)
            ? ('low' as const)
            : cover.form === 'thatch' || rainExposed(config, context)
              ? ('steep' as const)
              : ('moderate' as const),
          structureMaterialId: frame.id,
          coveringMaterialId: cover.id,
          eaves: ['flat', 'dome', 'barrel'].includes(form)
            ? ('none' as const)
            : rainExposed(config, context) || config.biome.temperature >= 30
              ? ('deep' as const)
              : ('short' as const),
        }));
      }),
    )
    .filter(
      (roof) =>
        primary.family !== 'earth' ||
        (config.biome.humidity < 0.7 && !rainExposed(config, context)) ||
        roof.eaves === 'deep',
    );
}
export function baseSurfaces(
  primary: ArchitecturalMaterial | null,
  context: ArchitectureContext,
): SurfaceTreatment[] {
  const roles: SurfaceTreatment['role'][] =
    context.construction === 'built' && context.exposure !== 'buried'
      ? ['outer_wall', 'inner_wall', 'floor', 'ceiling']
      : ['inner_wall', 'floor', 'ceiling'];
  return roles.map((role) => ({
    role,
    materialId: primary?.id ?? null,
    finishMaterialId: null,
    finish:
      context.construction === 'natural'
        ? 'unworked'
        : context.construction === 'rock_cut'
          ? 'rough_cut'
          : 'dressed',
  }));
}
/** A bounded vernacular proportion vocabulary; grid footprints always take precedence. */
export function proportionPolicy(
  context: ArchitectureContext,
  cold: boolean,
): ArchitecturalVariant['proportions'] {
  const surface = context.construction === 'built' && context.exposure !== 'buried';
  return {
    storeys: surface
      ? {
          min: context.density === 'high' ? 2 : 1,
          max: context.density === 'high' ? 5 : context.density === 'medium' ? 3 : 2,
        }
      : null,
    widthDepthRatio: surface ? { min: cold ? 0.8 : 0.6, max: cold ? 1.2 : 1.6 } : null,
    wallHeightWidthRatio: {
      min: 0.25,
      max: context.purpose === 'religious' || context.purpose === 'scholarly' ? 1.2 : 0.8,
    },
  };
}
