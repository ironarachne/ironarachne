import type { ArtifactKind } from '$lib/artifact_kinds';

/**
 * The builder's catalog path, which is how an AD&D character's provenance says it was hand-built
 * rather than rolled. Written out rather than imported from `$lib/tools` so that this module keeps
 * to the registries it belongs beside.
 */
const ADND_BUILDER_TOOL_PATH = '/fantasy/adnd/character/build';

import type { ArtifactEditorEntry, ArtifactEditorRegistry } from './workshop_types';

/**
 * What each artifact kind contributes to the panel it opens in, keyed by kind id.
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
 * the framework changed to accommodate culture, religion, or settlement, which is the claim these
 * entries exist to test: the second and third kinds each cost a registration and a component,
 * exactly as the first did — and the three are as unlike each other as the site has to offer. A
 * culture is a flat record, a religion is a list of sub-objects, and a settlement is sixteen
 * legitimate shapes of one kind, its enrichment being opt-in four times over.
 *
 * The rollers' specifiers reach past `$lib/culture`, `$lib/religion`, and `$lib/settlements` on
 * purpose: they are dynamic imports, which exist to split a chunk off, and going through an entry
 * point would pull the whole library — generation tables and all — back into the chunk that
 * opening any artifact loads.
 */
export const ARTIFACT_EDITORS: ArtifactEditorRegistry = {
  /**
   * A viewer and no editor, which is heraldry's honest state: it can draw itself and hand you an
   * SVG or a PNG (requirement 6.3), and it has no editing view (4.1). Registering it as an editor
   * to get the drawing would claim a readiness it does not have.
   *
   * The viewer is why `/saved-data` could be retired (#44): a saved coat of arms is seen and
   * downloaded here now, which was the one affordance that page had and the project view did not.
   */
  heraldry: {
    loadViewer: () => import('$components/heraldry/HeraldryArtifactView.svelte'),
  },
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
  settlement: {
    loadEditor: () => import('$components/locations/SettlementArtifactEditor.svelte'),
    loadRoller: async () => {
      const { readSettlementGeneratorConfig, rollSettlementSnapshot } =
        await import('$lib/settlements/settlement_roll.js');
      return (provenance) =>
        rollSettlementSnapshot(provenance.seed, readSettlementGeneratorConfig(provenance.config));
    },
  },
  character: {
    loadEditor: () => import('$components/characters/CharacterArtifactEditor.svelte'),
    loadRoller: async () => {
      const { readCharacterGeneratorConfig, rollCharacterSnapshot } =
        await import('$lib/characters/character_roll.js');
      return (provenance) =>
        rollCharacterSnapshot(provenance.seed, readCharacterGeneratorConfig(provenance.config));
    },
  },
  'character.dcc': {
    loadEditor: () => import('$components/characters/DccCharacterArtifactEditor.svelte'),
    loadRoller: async () => {
      const { readDccCharacterGeneratorConfig, rollDccCharacterSnapshot } =
        await import('$lib/dcc/dcc_character_roll.js');
      return (provenance) =>
        rollDccCharacterSnapshot(
          provenance.seed,
          readDccCharacterGeneratorConfig(provenance.config),
        );
    },
  },
  'character.swn': {
    loadEditor: () => import('$components/characters/SwnCharacterArtifactEditor.svelte'),
    loadRoller: async () => {
      const { readSwnCharacterGeneratorConfig, rollSwnCharacterSnapshot } =
        await import('$lib/swn/swn_character_roll.js');
      return (provenance) =>
        rollSwnCharacterSnapshot(
          provenance.seed,
          readSwnCharacterGeneratorConfig(provenance.config),
        );
    },
  },
  /**
   * The first kind whose editor is a tool rather than a component written for the purpose.
   *
   * `AdndCharacterArtifactEditor` is an adapter of about thirty lines around the builder at
   * `/fantasy/adnd/character/build`, which already asks every question that makes a character.
   * That is why #45 and #47 were designed to land together: writing a second editor beside a tool
   * that is already an editor would have been two things to keep in step, and requirement 2.1
   * wants one component working in a panel, on its own route, and here.
   */
  'character.adnd-2e': {
    loadEditor: () => import('$components/characters/AdndCharacterArtifactEditor.svelte'),
    /**
     * One kind, two provenance shapes, told apart by the tool path.
     *
     * A character from the generator re-rolls to a fresh draw. One from the builder had no dice
     * worth re-rolling, so it rebuilds from the decisions that made it — the same character again,
     * discarding edits made to the payload since. Both are the destructive operation requirement
     * 4.3 describes, and the surface's warning is honestly true of either.
     *
     * The two readers are separate on purpose and neither may accept the other's record. They
     * share a kind, so a reader that guessed would rebuild a character out of a generator's
     * settings.
     */
    loadRoller: async () => {
      const [roll, build] = await Promise.all([
        import('$lib/adnd/adnd_character_roll.js'),
        import('$lib/adnd/adnd_character_build.js'),
      ]);
      return (provenance) => {
        if (provenance.toolPath === ADND_BUILDER_TOOL_PATH) {
          return build.rebuildAdndCharacterSnapshot(
            provenance.seed,
            build.readAdndCharacterBuildRecord(provenance.config),
          );
        }
        return roll.rollAdndCharacterSnapshot(
          provenance.seed,
          roll.readAdndCharacterGeneratorConfig(provenance.config),
        );
      };
    },
  },
};

/** What a kind registered, or undefined when it registered nothing and opens on the generic view. */
export function artifactEditorEntry(
  kind: ArtifactKind,
  registry: ArtifactEditorRegistry = ARTIFACT_EDITORS,
): ArtifactEditorEntry | undefined {
  return registry[kind];
}

/**
 * Whether a kind can be **edited**, which is not the same as whether it registered anything.
 *
 * A kind with a viewer and no editor answers false here, and that is the point: "this artifact can
 * be changed" is a claim about 4.1 in docs/workshop.md, and a registry that answered true because
 * heraldry can draw itself would put a save button in front of a surface with nothing to save.
 */
export function hasArtifactEditor(
  kind: ArtifactKind,
  registry: ArtifactEditorRegistry = ARTIFACT_EDITORS,
): boolean {
  return artifactEditorEntry(kind, registry)?.loadEditor !== undefined;
}

/** Every kind with an editing view, in registry order. Viewer-only kinds are not among them. */
export function kindsWithArtifactEditors(
  registry: ArtifactEditorRegistry = ARTIFACT_EDITORS,
): ArtifactKind[] {
  return Object.keys(registry).filter((kind) => hasArtifactEditor(kind, registry));
}
