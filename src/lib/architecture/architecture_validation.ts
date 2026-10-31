import type {
  ArchitecturalStyle,
  ArchitecturalInstance,
  ArchitectureSubject,
  ArchitectureValidation,
  ArchitecturalMaterial,
  ArchitecturalProfile,
  ArchitecturalVariant,
  ArchitectureState,
} from './architecture_types';
import {
  MATERIAL_FORMS,
  materialRoles,
  roofFormsForMaterials,
} from './architecture_material_policy';
import {
  climateShape,
  CONDITIONS,
  contextShape,
  FEATURES,
  FINISHES,
  finite,
  list,
  MOTIFS,
  nullable,
  oneOf,
  PORTALS,
  PURPOSES,
  record,
  siteShape,
  strings,
  text,
  uniqueIds,
  validation,
} from './architecture_schema';

function range(v: unknown): boolean {
  return record(v) && finite(v.min) && finite(v.max) && v.min > 0 && v.min <= v.max;
}
function proportions(v: unknown): boolean {
  return (
    record(v) &&
    nullable(
      v.storeys,
      (r) =>
        range(r) &&
        record(r) &&
        Number.isInteger(r.min) &&
        Number.isInteger(r.max) &&
        (r.max as number) <= 6,
    ) &&
    nullable(v.widthDepthRatio, range) &&
    range(v.wallHeightWidthRatio)
  );
}
function materialShape(v: unknown): boolean {
  return (
    record(v) &&
    text(v.id) &&
    text(v.label) &&
    oneOf(v.family, [
      'wood',
      'stone',
      'earth',
      'ceramic',
      'plant',
      'metal',
      'mineral',
      'glass',
      'fabric',
      'other',
    ]) &&
    oneOf(v.form, MATERIAL_FORMS) &&
    strings(v.roles) &&
    oneOf(v.availability, ['available', 'limited']) &&
    oneOf(v.origin, ['local', 'imported', 'salvaged', 'native']) &&
    strings(v.evidenceIds) &&
    record(v.affordance) &&
    strings(v.affordance.roles) &&
    oneOf(v.affordance.spanCategory, ['short', 'medium', 'long']) &&
    [
      'compressiveSuitability',
      'tensileSuitability',
      'earthworkSuitability',
      'thermalMass',
      'weatherResistance',
    ].every(
      (k) =>
        finite((v.affordance as Record<string, unknown>)[k]) &&
        (v.affordance as Record<string, number>)[k] >= 0 &&
        (v.affordance as Record<string, number>)[k] <= 1,
    )
  );
}
function variantShape(v: unknown): boolean {
  return (
    record(v) &&
    text(v.id) &&
    list(
      v.surfaces,
      (s) =>
        record(s) &&
        oneOf(s.role, ['outer_wall', 'inner_wall', 'floor', 'ceiling']) &&
        nullable(s.materialId, text) &&
        oneOf(s.finish, FINISHES) &&
        nullable(s.finishMaterialId, text),
    ) &&
    nullable(
      v.roof,
      (r) =>
        record(r) &&
        oneOf(r.form, [
          'flat',
          'shed',
          'gable',
          'hip',
          'gambrel',
          'mansard',
          'cross_gable',
          'dome',
          'barrel',
        ]) &&
        oneOf(r.pitch, ['low', 'moderate', 'steep']) &&
        oneOf(r.eaves, ['none', 'short', 'deep']) &&
        text(r.coveringMaterialId) &&
        text(r.structureMaterialId),
    ) &&
    nullable(
      v.windows,
      (w) =>
        record(w) &&
        oneOf(w.count, ['sparse', 'moderate', 'rich']) &&
        oneOf(w.arrangement, [
          'regular_grid',
          'punched_staggered',
          'vertical_banded_pairs',
          'horizontal_ribbon',
          'clerestory_row',
          'courtyard_oriented',
          'corner_towers',
        ]) &&
        oneOf(w.shape, ['rectangular', 'segmental_arch', 'full_round', 'lancet', 'small_square']) &&
        oneOf(w.fill, ['open', 'shuttered', 'lattice', 'glazed', 'membrane', 'grille']) &&
        nullable(w.fillMaterialId, text) &&
        nullable(w.shutterMaterialId, text),
    ) &&
    oneOf(v.supports, ['none', 'timber_posts', 'piers', 'columns', 'rock_pillars']) &&
    nullable(v.supportMaterialId, text) &&
    oneOf(v.ceiling, [
      'flat',
      'beamed',
      'barrel_vault',
      'groin_vault',
      'dome',
      'carved_flat',
      'carved_vault',
      'natural',
    ]) &&
    nullable(v.massing, (m) =>
      oneOf(m, ['compact_blocks', 'courtyard_clusters', 'linear_spread', 'terraced_steps']),
    ) &&
    proportions(v.proportions) &&
    list(
      v.features,
      (f) =>
        record(f) &&
        text(f.id) &&
        oneOf(f.kind, FEATURES) &&
        nullable(f.materialId, text) &&
        strings(f.evidenceIds),
    )
  );
}
function profileShape(v: unknown): boolean {
  return (
    record(v) &&
    text(v.id) &&
    contextShape(v.context) &&
    nullable(v.primaryMaterialId, text) &&
    oneOf(v.structure, [
      'post_and_beam',
      'load_bearing_masonry',
      'cob_or_adobe',
      'hybrid_timber_and_masonry',
      'excavated_rock',
      'unworked',
    ]) &&
    oneOf(v.motif, MOTIFS) &&
    list(v.portals, (p) => oneOf(p, PORTALS)) &&
    strings(v.frameMaterialIds) &&
    strings(v.leafMaterialIds) &&
    list(v.variants, variantShape)
  );
}
function hasRole(
  materials: ArchitecturalMaterial[],
  id: string | null,
  role: ArchitecturalMaterial['roles'][number],
): boolean {
  return id !== null && materials.some((m) => m.id === id && m.roles.includes(role));
}
function constructionSurfacesCompatible(
  v: ArchitecturalVariant,
  p: ArchitecturalProfile,
  materials: ArchitecturalMaterial[],
): boolean {
  if (p.context.construction === 'natural') return true;
  const ceiling = materials.find(
    (m) => m.id === v.surfaces.find((s) => s.role === 'ceiling')?.materialId,
  );
  if (
    v.surfaces.some(
      (s) =>
        !hasRole(
          materials,
          s.materialId,
          s.role === 'floor' ? 'floor' : s.role === 'ceiling' ? 'structure' : 'enclosure',
        ),
    )
  )
    return false;
  if (p.context.construction === 'rock_cut') return ceiling?.form === 'native_rock';
  if (p.context.exposure !== 'buried' && (!v.proportions.storeys || !v.proportions.widthDepthRatio))
    return false;
  if (v.ceiling === 'beamed')
    return ceiling?.family === 'wood' && ['timber', 'pole'].includes(ceiling.form);
  if (v.ceiling === 'flat') return ceiling?.form === 'slab';
  return (
    ['barrel_vault', 'groin_vault', 'dome'].includes(v.ceiling) &&
    !!ceiling &&
    ['stone', 'ceramic'].includes(ceiling.family) &&
    ['block', 'brick'].includes(ceiling.form)
  );
}
function featuresCompatible(v: ArchitecturalVariant, materials: ArchitecturalMaterial[]): boolean {
  return v.features.every((f) => {
    const material = materials.find((m) => m.id === f.materialId);
    if (!material) return false;
    if (f.kind === 'stone_carving')
      return material.family === 'stone' && material.roles.includes('ornament');
    if (f.kind === 'wood_carving')
      return material.family === 'wood' && material.roles.includes('ornament');
    if (f.kind === 'tile_inlay') return material.form === 'tile';
    if (f.kind === 'metal_fittings')
      return material.family === 'metal' && ['bar', 'sheet'].includes(material.form);
    if (f.kind === 'roof_terrace' && v.roof?.form !== 'flat') return false;
    if (['bay_projection', 'oriel_window'].includes(f.kind) && !v.windows) return false;
    if (f.kind === 'flying_buttress' && !['stone', 'ceramic'].includes(material.family))
      return false;
    return material.roles.includes('structure');
  });
}
function variantCompatible(
  v: ArchitecturalVariant,
  p: ArchitecturalProfile,
  materials: ArchitecturalMaterial[],
): boolean {
  const get = (id: string | null) => materials.find((m) => m.id === id);
  const natural = p.context.construction === 'natural';
  const buried = p.context.exposure === 'buried';
  if (!constructionSurfacesCompatible(v, p, materials) || !featuresCompatible(v, materials))
    return false;
  if (
    new Set(v.surfaces.map((s) => s.role)).size !== v.surfaces.length ||
    !['inner_wall', 'floor', 'ceiling'].every((role) => v.surfaces.some((s) => s.role === role))
  )
    return false;
  if (
    v.surfaces.some((s) => (s.materialId === null ? !natural : !get(s.materialId))) ||
    v.surfaces.some((s) =>
      ['plastered', 'tiled', 'painted'].includes(s.finish)
        ? !hasRole(materials, s.finishMaterialId, 'finish') ||
          s.finish === 'painted' ||
          (s.finish === 'tiled'
            ? get(s.finishMaterialId)?.form !== 'tile'
            : get(s.finishMaterialId)?.form !== 'plaster')
        : s.finishMaterialId !== null,
    )
  )
    return false;
  if (
    buried &&
    (v.roof ||
      v.windows ||
      v.massing ||
      v.proportions.storeys ||
      v.proportions.widthDepthRatio ||
      v.surfaces.some((s) => s.role === 'outer_wall'))
  )
    return false;
  if (!p.context.exteriorWindowsAllowed && v.windows) return false;
  if (
    natural &&
    (v.roof ||
      v.windows ||
      v.massing ||
      v.features.length ||
      v.ceiling !== 'natural' ||
      v.supports !== 'none' ||
      v.proportions.storeys ||
      v.proportions.widthDepthRatio ||
      v.surfaces.some(
        (s) =>
          s.finish !== 'unworked' ||
          (s.materialId !== null && get(s.materialId)?.form !== 'native_rock'),
      ))
  )
    return false;
  if (
    p.context.construction === 'rock_cut' &&
    (v.roof || !['carved_flat', 'carved_vault'].includes(v.ceiling))
  )
    return false;
  if (
    v.supports === 'none'
      ? v.supportMaterialId !== null
      : !hasRole(materials, v.supportMaterialId, 'structure')
  )
    return false;
  if (
    (v.supports === 'timber_posts' &&
      !['timber', 'pole'].includes(get(v.supportMaterialId)?.form ?? '')) ||
    (v.supports === 'rock_pillars' && get(v.supportMaterialId)?.form !== 'native_rock')
  )
    return false;
  if (
    v.features.some((f) => !f.id || (f.materialId !== null && !get(f.materialId))) ||
    !uniqueIds(v.features)
  )
    return false;
  if (
    buried &&
    v.features.some(
      (f) =>
        ![
          'stone_carving',
          'wood_carving',
          'tile_inlay',
          'metal_fittings',
          'ventilation_shaft',
          'drain_channel',
        ].includes(f.kind),
    )
  )
    return false;
  if (v.roof) {
    const r = v.roof;
    const cover = get(r.coveringMaterialId);
    const frame = get(r.structureMaterialId);
    if (
      !cover?.roles.includes('roof_covering') ||
      !frame?.roles.includes('structure') ||
      !roofFormsForMaterials(frame, cover).includes(r.form)
    )
      return false;
    if (['flat', 'dome', 'barrel'].includes(r.form) && (r.pitch !== 'low' || r.eaves !== 'none'))
      return false;
    if (cover.form === 'thatch' && r.pitch !== 'steep') return false;
    const expectedCeiling =
      r.form === 'dome'
        ? 'dome'
        : r.form === 'barrel'
          ? 'barrel_vault'
          : frame.form === 'slab'
            ? 'flat'
            : 'beamed';
    if (v.ceiling !== expectedCeiling) return false;
  } else if (p.context.construction === 'built' && !buried) return false;
  if (v.windows) {
    const w = v.windows;
    const fill = get(w.fillMaterialId);
    const forms = {
      open: [],
      shuttered: ['board'],
      lattice: ['board'],
      glazed: ['pane'],
      membrane: ['woven'],
      grille: ['bar'],
    };
    if (
      w.fill === 'open'
        ? w.fillMaterialId !== null
        : !fill?.roles.includes('window_fill') || !forms[w.fill].includes(fill.form)
    )
      return false;
    if (w.shutterMaterialId !== null && get(w.shutterMaterialId)?.form !== 'board') return false;
  }
  return true;
}
/** No generation tables, runtime resources, Svelte, or renderers are loaded on the artifact read path. */
export function validateArchitecturalStyle(value: unknown): ArchitectureValidation {
  if (
    !record(value) ||
    value.schemaVersion !== 1 ||
    value.generatorVersion !== 1 ||
    !text(value.id) ||
    !text(value.seed) ||
    !record(value.origin) ||
    !text(value.origin.biomeName) ||
    !['temperature', 'humidity', 'altitude'].every((k) =>
      finite((value.origin as Record<string, unknown>)[k]),
    ) ||
    !finite(value.origin.humidity) ||
    value.origin.humidity < 0 ||
    value.origin.humidity > 1 ||
    typeof value.origin.isAquatic !== 'boolean' ||
    value.origin.isAquatic ||
    !siteShape(value.origin.site) ||
    !oneOf(value.origin.resourceKnowledge, ['known', 'unknown']) ||
    !text(value.origin.inputFingerprint) ||
    (value.origin.climate !== undefined && !climateShape(value.origin.climate)) ||
    !list(value.materials, materialShape) ||
    !list(value.profiles, profileShape)
  )
    return validation(false);
  const style = value as unknown as ArchitecturalStyle;
  if (
    !style.id ||
    !uniqueIds(style.materials) ||
    !uniqueIds(style.profiles) ||
    style.materials.some(
      (m) =>
        new Set(m.roles).size !== m.roles.length ||
        m.roles.length !== materialRoles(m.family, m.form).length ||
        !m.roles.every((role) => materialRoles(m.family, m.form).includes(role)) ||
        (m.form === 'native_rock' && m.origin !== 'native'),
    )
  )
    return validation(false);
  return validation(
    style.profiles.every((p) => {
      const primary = style.materials.find((m) => m.id === p.primaryMaterialId);
      const expected =
        p.context.construction === 'natural'
          ? 'unworked'
          : p.context.construction === 'rock_cut'
            ? 'excavated_rock'
            : primary?.family === 'wood'
              ? 'post_and_beam'
              : primary?.family === 'earth'
                ? 'cob_or_adobe'
                : 'load_bearing_masonry';
      return (
        p.id === p.context.id &&
        (p.structure === expected ||
          (p.structure === 'hybrid_timber_and_masonry' &&
            !!primary &&
            ['stone', 'ceramic'].includes(primary.family) &&
            p.variants.every(
              (v) =>
                style.materials.find(
                  (m) => m.id === v.surfaces.find((s) => s.role === 'ceiling')?.materialId,
                )?.family === 'wood',
            ))) &&
        (p.context.construction === 'natural'
          ? p.motif === 'none' && p.frameMaterialIds.length === 0 && p.leafMaterialIds.length === 0
          : hasRole(style.materials, p.primaryMaterialId, 'structure') &&
            (p.context.construction === 'rock_cut'
              ? primary?.form === 'native_rock'
              : primary?.form !== 'native_rock')) &&
        p.portals.length > 0 &&
        p.frameMaterialIds.every((id) => hasRole(style.materials, id, 'structure')) &&
        p.leafMaterialIds.every((id) => hasRole(style.materials, id, 'door_leaf')) &&
        p.variants.length >= 1 &&
        p.variants.length <= 4 &&
        uniqueIds(p.variants) &&
        p.variants.every((v) => variantCompatible(v, p, style.materials))
      );
    }),
  );
}
function instanceShape(v: unknown): boolean {
  return (
    record(v) &&
    ['id', 'profileId', 'variantId'].every((k) => text(v[k])) &&
    oneOf(v.currentPurpose, PURPOSES) &&
    nullable(v.storeys, finite) &&
    nullable(v.widthDepthRatio, finite) &&
    finite(v.wallHeightWidthRatio) &&
    oneOf(v.condition, CONDITIONS) &&
    strings(v.placedFeatureIds) &&
    list(
      v.connections,
      (c) =>
        record(c) &&
        text(c.connectionId) &&
        oneOf(c.portal, PORTALS) &&
        nullable(c.frameMaterialId, text) &&
        nullable(c.leafMaterialId, text) &&
        oneOf(c.finish, FINISHES),
    )
  );
}
export function validateArchitecturalInstance(
  value: unknown,
  style: ArchitecturalStyle,
  subject?: ArchitectureSubject,
): ArchitectureValidation {
  if (!instanceShape(value)) return validation(false);
  const instance = value as ArchitecturalInstance;
  const p = style.profiles.find((p) => p.id === instance.profileId);
  const v = p?.variants.find((v) => v.id === instance.variantId);
  if (!p || !v || !instance.id) return validation(false);
  const inRange = (value: number | null, range: { min: number; max: number } | null) =>
    range ? value !== null && value >= range.min && value <= range.max : value === null;
  return validation(
    inRange(instance.storeys, v.proportions.storeys) &&
      (instance.storeys === null || Number.isInteger(instance.storeys)) &&
      (subject?.widthDepthRatio !== null && subject?.widthDepthRatio !== undefined
        ? instance.widthDepthRatio === subject.widthDepthRatio
        : v.proportions.widthDepthRatio === null
          ? instance.widthDepthRatio === null || instance.widthDepthRatio > 0
          : inRange(instance.widthDepthRatio, v.proportions.widthDepthRatio)) &&
      inRange(instance.wallHeightWidthRatio, v.proportions.wallHeightWidthRatio) &&
      instance.placedFeatureIds.every((id) =>
        id === 'supports' ? v.supports !== 'none' : v.features.some((f) => f.id === id),
      ) &&
      new Set(instance.connections.map((c) => c.connectionId)).size ===
        instance.connections.length &&
      instance.connections.every(
        (c) =>
          p.portals.includes(c.portal) &&
          (c.frameMaterialId === null || p.frameMaterialIds.includes(c.frameMaterialId)) &&
          (c.leafMaterialId === null || p.leafMaterialIds.includes(c.leafMaterialId)) &&
          (!subject ||
            subject.connections.some(
              (r) => r.id === c.connectionId && (r.kind === 'door' || c.leafMaterialId === null),
            )),
      ) &&
      (!subject ||
        (subject.id === instance.id &&
          subject.profileId === instance.profileId &&
          subject.condition === instance.condition &&
          subject.currentPurpose === instance.currentPurpose &&
          instance.placedFeatureIds.every((id) => subject.placedFeatureIds.includes(id)))),
  );
}
export function validateArchitectureState(value: unknown): ArchitectureValidation {
  if (
    !record(value) ||
    !oneOf(value.kind, ['legacy', 'unavailable', 'generated', 'partial']) ||
    !nullable(value.summary, text) ||
    !list(
      value.diagnostics,
      (d) =>
        record(d) &&
        oneOf(d.code, [
          'invalid_input',
          'unknown_resources',
          'insufficient_resources',
          'unknown_material_form',
          'unsupported_context',
          'unsupported_feature',
        ]) &&
        nullable(d.contextId, text) &&
        strings(d.resourceIds),
    ) ||
    !Array.isArray(value.examples) ||
    value.examples.length > 12
  )
    return validation(false);
  if (value.kind === 'legacy' || value.kind === 'unavailable')
    return validation(
      value.style === null &&
        value.examples.length === 0 &&
        (value.kind !== 'legacy' ||
          (value.summary === null && (value.diagnostics as unknown[]).length === 0)),
    );
  if (!validateArchitecturalStyle(value.style).ok) return validation(false);
  const state = value as unknown as ArchitectureState;
  return validation(
    state.style !== null &&
      (state.kind !== 'generated' || state.style.profiles.length > 0) &&
      state.examples.every((e) => validateArchitecturalInstance(e, state.style!).ok) &&
      uniqueIds(state.examples),
  );
}
