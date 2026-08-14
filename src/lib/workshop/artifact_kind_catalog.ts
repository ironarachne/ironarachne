import {
  createArtifactKindRegistry,
  getArtifactKind,
  listArtifactKinds,
  readArtifactPayloadForKind,
  registerArtifactKind,
  type AnyArtifactKindEntry,
  type ArtifactKind,
  type ArtifactKindRegistry,
  type PayloadResult,
} from '$lib/artifact_kinds';
// Deep on purpose, and measured against the bundle, for the reason
// `persistent_save/saved_data_catalog.ts` gives for these same three libraries: their entry
// points reach a generator and from there the species tables. Assembling this registry through
// them costs 296 KB in the chunk that imports it; through the kind modules it costs 4 KB.
// Everything in the workshop touches this registry, so that difference is paid by any page that
// so much as lists what a project contains.
import { cultureArtifactKind } from '$lib/culture/culture_artifact_kind';
import { heraldryArtifactKind } from '$lib/heraldry/heraldry_artifact_kind';
import { religionArtifactKind } from '$lib/religion/religion_artifact_kind';

/**
 * Assembled statically, in a single list, exactly like `TOOL_PANELS` beside it and the tool
 * catalog it mirrors. Self-registration on import was the alternative and it is worse: a kind
 * would exist only once something happened to load its library, so whether an import could read
 * a culture would depend on which page the user was on when they started it.
 *
 * Adding a kind is one line here and an `defineArtifactKind` entry in the owning library. No
 * generic code — the store, export, the project view — changes to accommodate it.
 */
function buildArtifactKindRegistry(): ArtifactKindRegistry {
  const registry = createArtifactKindRegistry();
  registerArtifactKind(registry, heraldryArtifactKind);
  registerArtifactKind(registry, cultureArtifactKind);
  registerArtifactKind(registry, religionArtifactKind);
  return registry;
}

/** Every artifact kind this build understands. */
export const ARTIFACT_KINDS: ArtifactKindRegistry = buildArtifactKindRegistry();

/** The entry for a kind, or undefined when this build does not have it. */
export function artifactKindEntry(kind: ArtifactKind): AnyArtifactKindEntry | undefined {
  return getArtifactKind(ARTIFACT_KINDS, kind);
}

/** Every registered kind, in registration order. */
export function registeredArtifactKinds(): AnyArtifactKindEntry[] {
  return listArtifactKinds(ARTIFACT_KINDS);
}

/**
 * Reads a stored payload whose kind and version come from the data itself — what storage and
 * import both hand over. Unknown kinds, unreadable versions, and failed migrations all come back
 * as a rejection carrying its reason, so one bad record costs that record alone.
 */
export function readRegisteredArtifactPayload(
  kind: ArtifactKind,
  payload: unknown,
  fromVersion: number,
): PayloadResult<unknown> {
  return readArtifactPayloadForKind(ARTIFACT_KINDS, kind, payload, fromVersion);
}
