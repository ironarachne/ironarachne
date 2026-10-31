import { inferStructuralAffordance, type Resource } from '$lib/resources';
import type {
  ArchitecturalMaterial,
  ArchitectureResourceInput,
  ArchitectureResources,
  MaterialFamily,
  MaterialForm,
  MaterialRole,
} from './architecture_types';

import { compareArchitectureIds, materialRoles } from './architecture_material_policy';
export { MATERIAL_FORMS, compareArchitectureIds } from './architecture_material_policy';
const CATALOG_FORMS: Record<string, MaterialForm> = {
  'oak timber': 'timber',
  'pine timber': 'timber',
  'bamboo pole': 'pole',
  'granite ashlar': 'block',
  'sandstone block': 'block',
  'slate tile': 'tile',
  'fired brick': 'brick',
  'adobe brick': 'brick',
  'rammed earth': 'compacted_earth',
  'lime plaster': 'plaster',
  'straw thatch': 'thatch',
  'reed thatch': 'thatch',
};
export function materialFamily(resource: Resource): MaterialFamily {
  const major = resource.major_type.toLowerCase();
  if (['wood', 'timber', 'bamboo'].includes(major)) return 'wood';
  if (['stone', 'earth', 'metal', 'glass', 'fabric', 'ceramic'].includes(major))
    return major as MaterialFamily;
  if (['brick', 'clay'].includes(major)) return major === 'brick' ? 'ceramic' : 'earth';
  if (['thatch', 'fibre', 'straw', 'plant-fiber'].includes(major)) return 'plant';
  if (['lime', 'gypsum', 'mineral'].includes(major)) return 'mineral';
  return 'other';
}
export function normalizeArchitectureMaterials(
  entries: ArchitectureResourceInput[],
): ArchitecturalMaterial[] {
  return [...entries]
    .sort(compareArchitectureIds)
    .filter((e) => ['available', 'limited'].includes(e.availability))
    .map((e) => {
      const family = materialFamily(e.resource);
      return {
        id: e.id,
        label: e.resource.name,
        family,
        form: e.form,
        roles: materialRoles(family, e.form),
        affordance: inferStructuralAffordance(e.resource),
        availability: e.availability,
        origin: e.origin,
        evidenceIds: [...e.evidenceIds].sort(),
      };
    });
}
/** Only the resources explicitly selected by the caller become available. Unknown names need a form mapping. */
export function architectureResourcesFromCatalog(
  resources: Resource[],
  mappings: Record<string, { id: string; form: MaterialForm }> = {},
): Extract<ArchitectureResources, { knowledge: 'known' }> {
  return {
    knowledge: 'known',
    entries: resources.map((resource) => ({
      id:
        mappings[resource.name]?.id ??
        `catalog:${resource.major_type}:${resource.minor_type}:${resource.name}`,
      resource,
      form: mappings[resource.name]?.form ?? CATALOG_FORMS[resource.name] ?? 'unknown',
      availability: 'available',
      origin: 'local',
      evidenceIds: [],
    })),
  };
}
export function usableMaterials(
  materials: ArchitecturalMaterial[],
  role: MaterialRole,
): ArchitecturalMaterial[] {
  const eligible = materials.filter((m) => m.roles.includes(role));
  return [...eligible].sort(
    (a, b) =>
      Number(b.availability === 'available') - Number(a.availability === 'available') ||
      compareArchitectureIds(a, b),
  );
}
