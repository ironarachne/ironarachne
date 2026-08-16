import type { ArtifactKind } from '$lib/artifact_kinds';

import type { ArtifactEditorEntry, ArtifactEditorRegistry } from './workshop_types';

/**
 * Which component edits each artifact kind, keyed by kind id.
 *
 * Assembled statically, in one list, exactly like `TOOL_PANELS` and `ARTIFACT_KINDS` beside it,
 * and for the same two reasons: a bundler can only split a dynamic import whose specifier it can
 * see, and a registry built by self-registration on import would be missing a kind depending on
 * which page the user happened to start from.
 *
 * **Most kinds are not here, and that is the shipped state.** #39 built the frame — the surface an
 * artifact opens in, the dirty/save lifecycle, the destructive re-roll — and an editing view for a
 * particular kind is part of taking *that tool* to Release-ready, per docs/workshop.md. A kind
 * with no entry here opens read-only, which is a state the surface renders rather than an error
 * it reports.
 *
 * Adding one is a line here and a component that takes {@link ArtifactEditorProps}. Nothing in
 * the framework changed to accommodate culture or religion, which is the claim these entries exist
 * to test: the second kind cost a registration and a component, exactly as the first did.
 *
 * The rollers' specifiers reach past `$lib/culture` and `$lib/religion` on purpose: they are
 * dynamic imports, which exist to split a chunk off, and going through an entry point would pull
 * the whole library — generation tables and all — back into the chunk that opening any artifact
 * loads.
 */
export const ARTIFACT_EDITORS: ArtifactEditorRegistry = {
  culture: {
    loadEditor: () => import('$components/factions/CultureArtifactEditor.svelte'),
    loadRoller: async () => {
      const { readCultureGeneratorConfig, rollCultureSnapshot } =
        await import('$lib/culture/culture_roll.js');
      return (provenance) =>
        rollCultureSnapshot(provenance.seed, readCultureGeneratorConfig(provenance.config));
    },
  },
  religion: {
    loadEditor: () => import('$components/factions/ReligionArtifactEditor.svelte'),
    loadRoller: async () => {
      const { readReligionGeneratorConfig, rollReligionSnapshot } =
        await import('$lib/religion/religion_roll.js');
      return (provenance) =>
        rollReligionSnapshot(provenance.seed, readReligionGeneratorConfig(provenance.config));
    },
  },
};

/** The editor registration for a kind, or undefined when it has none and opens read-only. */
export function artifactEditorEntry(
  kind: ArtifactKind,
  registry: ArtifactEditorRegistry = ARTIFACT_EDITORS,
): ArtifactEditorEntry | undefined {
  return registry[kind];
}

/** Whether a kind can be edited at all. Answers without loading the component. */
export function hasArtifactEditor(
  kind: ArtifactKind,
  registry: ArtifactEditorRegistry = ARTIFACT_EDITORS,
): boolean {
  return artifactEditorEntry(kind, registry) !== undefined;
}

/** Every kind with an editor registered, in registry order. */
export function kindsWithArtifactEditors(
  registry: ArtifactEditorRegistry = ARTIFACT_EDITORS,
): ArtifactKind[] {
  return Object.keys(registry);
}
