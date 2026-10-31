import type { MaterialFamily, MaterialForm, MaterialRole } from './architecture_types';
export const MATERIAL_FORMS: MaterialForm[] = [
  'timber',
  'pole',
  'block',
  'brick',
  'compacted_earth',
  'tile',
  'slab',
  'board',
  'thatch',
  'plaster',
  'sheet',
  'pane',
  'woven',
  'bar',
  'native_rock',
  'unknown',
];
export function compareArchitectureIds(a: { id: string }, b: { id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
/** Role eligibility is stricter than physical affordances: rock is not already a quarried tile. */
export function materialRoles(family: MaterialFamily, form: MaterialForm): MaterialRole[] {
  if (family === 'wood' && ['timber', 'pole'].includes(form))
    return ['structure', 'enclosure', 'ornament'];
  if (family === 'wood' && form === 'board')
    return ['enclosure', 'roof_covering', 'floor', 'door_leaf', 'window_fill', 'ornament'];
  if (
    ['stone', 'ceramic', 'earth'].includes(family) &&
    ['block', 'brick', 'compacted_earth'].includes(form)
  )
    return ['structure', 'enclosure', 'floor', 'ornament'];
  if (family === 'stone' && form === 'native_rock')
    return ['structure', 'enclosure', 'floor', 'ornament'];
  if (['stone', 'ceramic'].includes(family) && ['tile', 'slab'].includes(form))
    return form === 'slab'
      ? ['structure', 'roof_covering', 'floor', 'ornament']
      : ['roof_covering', 'finish', 'floor', 'ornament'];
  if (family === 'plant' && form === 'thatch') return ['roof_covering'];
  if (['mineral', 'earth'].includes(family) && form === 'plaster') return ['finish'];
  if (family === 'metal' && form === 'sheet') return ['roof_covering', 'door_leaf', 'ornament'];
  if (family === 'metal' && form === 'bar') return ['window_fill', 'ornament'];
  if (family === 'glass' && form === 'pane') return ['window_fill'];
  if (['plant', 'fabric'].includes(family) && form === 'woven') return ['window_fill', 'ornament'];
  return [];
}

/** Pure compatibility vocabulary shared by generation and synchronous snapshot validation. */
export function roofFormsForMaterials(
  frame: Pick<import('./architecture_types').ArchitecturalMaterial, 'family' | 'form'>,
  cover: Pick<import('./architecture_types').ArchitecturalMaterial, 'form'>,
): import('./architecture_types').RoofForm[] {
  if (['timber', 'pole'].includes(frame.form))
    return cover.form === 'thatch'
      ? ['gable', 'hip']
      : cover.form === 'slab'
        ? ['flat']
        : ['flat', 'shed', 'gable', 'hip', 'gambrel', 'mansard', 'cross_gable'];
  if (frame.form === 'slab') return cover.form === 'thatch' ? [] : ['flat'];
  if (
    ['stone', 'ceramic'].includes(frame.family) &&
    ['block', 'brick'].includes(frame.form) &&
    cover.form === 'tile'
  )
    return ['dome', 'barrel'];
  return [];
}
