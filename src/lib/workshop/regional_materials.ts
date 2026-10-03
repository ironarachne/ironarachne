import { readArtifact, type ArtifactReference } from '$lib/artifacts';
import type { RegionalMaterialLink, RegionalMaterialPresentation } from '$lib/settlements';
// Metadata-only helpers avoid loading generators in the workshop shell.
import {
  regionalMaterialReferenceError,
  unavailableRegionalMaterials,
} from '$lib/settlements/settlement_artifact_kind';
import type { RegionSnapshot } from '$lib/regions';
import { ARTIFACT_KINDS } from './artifact_kind_catalog';

/** Resolve once per display/export. No recursive traversal of a settlement's own context. */
export async function resolveRegionalMaterials(
  projectId: string,
  link: RegionalMaterialLink,
  references: readonly ArtifactReference[],
): Promise<RegionalMaterialPresentation> {
  const error = regionalMaterialReferenceError(link, references);
  if (error) return unavailableRegionalMaterials(error);
  const read = await readArtifact(ARTIFACT_KINDS, projectId, link.regionTargetId);
  if (!read || !read.ok || read.artifact.kind !== 'region') return unavailableRegionalMaterials();
  const { describeRegionMaterials } = await import('$lib/regions/region_material_context');
  const snapshot = read.artifact.payload as RegionSnapshot;
  const result = describeRegionMaterials(snapshot, link.sourceSettlement);
  if (link.sourceSettlement.kind === 'artifact') {
    const id = link.sourceSettlement.targetId;
    const ref = read.artifact.references.find(
      (entry) => entry.targetId === id && entry.targetKind === 'settlement',
    );
    const source = ref ? await readArtifact(ARTIFACT_KINDS, projectId, id) : undefined;
    if (!source || !source.ok || source.artifact.kind !== 'settlement')
      return unavailableRegionalMaterials('The referenced source settlement is unavailable.');
    result.sourceName = source.artifact.name;
  }
  return result;
}
