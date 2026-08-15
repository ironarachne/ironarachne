import { createArtifact, type Artifact, type ArtifactWriteResult } from '$lib/artifacts';

import { ARTIFACT_KINDS } from './artifact_kind_catalog';
import type { ToolArtifactDraft } from './workshop_types';

/**
 * Save what a tool made into a project.
 *
 * The one entry point a generator needs, whether it is mounted in a workshop panel or sitting on
 * its own route: both hand over the same draft and both get back the same result. It is here
 * rather than in `$lib/artifacts` because it is the point where a *tool* — a catalog path and the
 * build's registry of kinds — meets the store, and the store deliberately knows about neither.
 *
 * The result is never `void`. An unknown kind, a payload its own kind refuses, and a database
 * that would not take the write all come back as a rejection the caller has to show the user,
 * with the generated content still on screen.
 *
 * References travel with the draft, so a tool that was handed a saved artifact records the link in
 * the same write that stores what it made. They are not checked against the project: the store
 * tolerates a reference to something that is gone by design, and a picker whose target is deleted
 * between choosing and saving must cost the user the link, not the artifact.
 */
export function saveToolArtifact(
  projectId: string,
  draft: ToolArtifactDraft,
): Promise<ArtifactWriteResult<Artifact>> {
  return createArtifact(ARTIFACT_KINDS, {
    projectId,
    kind: draft.kind,
    payload: draft.payload,
    name: draft.name,
    tags: draft.tags,
    references: draft.references,
    ...(draft.seed === undefined
      ? {}
      : {
          provenance: {
            toolPath: draft.toolPath,
            seed: draft.seed,
            config: draft.config ?? {},
          },
        }),
  });
}
