import { asRecord } from '$lib/artifact_kinds';
import type { ArtifactReference } from '$lib/artifacts';
import type {
  RegionalMaterialLink,
  RegionalMaterialPresentation,
} from './settlement_material_types';

const nonempty = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export function isRegionalMaterialLink(value: unknown): value is RegionalMaterialLink {
  const link = asRecord(value);
  const source = asRecord(link?.sourceSettlement);
  return (
    link !== null &&
    nonempty(link.regionTargetId) &&
    Object.keys(link).every((key) => key === 'regionTargetId' || key === 'sourceSettlement') &&
    source !== null &&
    ((source.kind === 'embedded' &&
      nonempty(source.settlementId) &&
      Object.keys(source).every((key) => key === 'kind' || key === 'settlementId')) ||
      (source.kind === 'artifact' &&
        nonempty(source.targetId) &&
        Object.keys(source).every((key) => key === 'kind' || key === 'targetId')))
  );
}

export function regionalMaterialReference(link: RegionalMaterialLink): ArtifactReference {
  return { targetId: link.regionTargetId, targetKind: 'region', role: 'material-context' };
}

/** A broken target is allowed; a link claiming a different input kind is not. */
export function regionalMaterialReferenceError(
  link: RegionalMaterialLink | null,
  references: readonly ArtifactReference[],
): string | null {
  const material = references.filter((entry) => entry.role === 'material-context');
  if (link === null)
    return material.length ? 'A material reference needs its saved settlement context.' : null;
  return material.length === 1 &&
    material[0].targetId === link.regionTargetId &&
    material[0].targetKind === 'region'
    ? null
    : 'Regional material context needs one matching region reference.';
}

export function unavailableRegionalMaterials(
  message = 'The linked region or source settlement is unavailable.',
): RegionalMaterialPresentation {
  return {
    status: 'unresolved',
    sourceName: 'Unavailable source',
    buildingMaterials: [],
    fuel: [],
    crafts: [],
    notices: [message],
  };
}
