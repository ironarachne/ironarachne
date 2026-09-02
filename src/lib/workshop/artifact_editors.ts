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
   * The kind that was viewer-only until #51, and the reason `loadViewer` exists at all.
   *
   * A saved coat of arms could be drawn and downloaded, and not changed — honest while it was
   * true, and requirement 4.1 is what stood between heraldry and Release-ready. The editor draws
   * the arms beside the controls and still hands over the SVG and the PNG, so nothing the viewer
   * did was traded away to gain it.
   *
   * `loadViewer` stays in the registry's vocabulary. A kind that can be shown and not sensibly
   * edited is a state the surface should still be able to render, and this entry having outgrown
   * it is not a reason to make the next one unrepresentable.
   */
  heraldry: {
    loadEditor: () => import('$components/heraldry/HeraldryArtifactEditor.svelte'),
    loadRoller: async () => {
      const { readHeraldryGeneratorConfig, rollHeraldrySnapshot } =
        await import('$lib/heraldry/heraldry_roll.js');
      return (provenance) =>
        rollHeraldrySnapshot(provenance.seed, readHeraldryGeneratorConfig(provenance.config));
    },
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
  'character.uncharted-worlds': {
    loadEditor: () => import('$components/characters/UwCharacterArtifactEditor.svelte'),
    loadRoller: async () => {
      const { readUwCharacterGeneratorConfig, rollUwCharacterSnapshot } =
        await import('$lib/unchartedworlds/uw_character_roll.js');
      return (provenance) =>
        rollUwCharacterSnapshot(provenance.seed, readUwCharacterGeneratorConfig(provenance.config));
    },
  },
  organization: {
    loadEditor: () => import('$components/factions/OrganizationArtifactEditor.svelte'),
    /** The page's five controls, read back through the roll module's own reader. */
    loadRoller: async () => {
      const { readOrganizationGeneratorConfig, rollOrganizationSnapshot } =
        await import('$lib/organizations/organization_roll.js');
      return (provenance) =>
        rollOrganizationSnapshot(
          provenance.seed,
          readOrganizationGeneratorConfig(provenance.config),
        );
    },
  },
  family: {
    loadEditor: () => import('$components/factions/FamilyArtifactEditor.svelte'),
    /** Every control on the page, read back through the roll module's own reader. */
    loadRoller: async () => {
      const { readFamilyGeneratorConfig, rollFamilySnapshot } =
        await import('$lib/families/family_roll.js');
      return (provenance) =>
        rollFamilySnapshot(provenance.seed, readFamilyGeneratorConfig(provenance.config));
    },
  },
  encounter: {
    loadEditor: () => import('$components/factions/EncounterArtifactEditor.svelte'),
    /** The page's two controls, read back through the roll module's own reader. */
    loadRoller: async () => {
      const { readEncounterGeneratorConfig, rollEncounterSnapshot } =
        await import('$lib/encounters/encounter_roll.js');
      return (provenance) =>
        rollEncounterSnapshot(provenance.seed, readEncounterGeneratorConfig(provenance.config));
    },
  },
  'star-nation': {
    loadEditor: () => import('$components/factions/StarNationArtifactEditor.svelte'),
    /** The page's one control besides the seed, read back through the roll module's own reader. */
    loadRoller: async () => {
      const { readStarNationGeneratorConfig, rollStarNationSnapshot } =
        await import('$lib/civilizations/star_nation_roll.js');
      return (provenance) =>
        rollStarNationSnapshot(provenance.seed, readStarNationGeneratorConfig(provenance.config));
    },
  },
  'chop-shop': {
    loadEditor: () => import('$components/locations/ChopShopArtifactEditor.svelte'),
    /** The seed and nothing else: the page has one control, and the paragraph is the whole roll. */
    loadRoller: async () => {
      const { rollChopShopSnapshot } = await import('$lib/chopshop/chop_shop_roll.js');
      return (provenance) => rollChopShopSnapshot(provenance.seed);
    },
  },
  dungeon: {
    loadEditor: () => import('$components/locations/DungeonArtifactEditor.svelte'),
    /** The page's six controls, read back through the roll module's own reader. */
    loadRoller: async () => {
      const { readDungeonGeneratorConfig, rollDungeonSnapshot } =
        await import('$lib/dungeon/dungeon_roll.js');
      return (provenance) =>
        rollDungeonSnapshot(provenance.seed, readDungeonGeneratorConfig(provenance.config));
    },
  },
  environment: {
    loadEditor: () => import('$components/locations/EnvironmentArtifactEditor.svelte'),
    /** The page's eleven number fields, read back through the roll module's own reader. */
    loadRoller: async () => {
      const { readEnvironmentGeneratorConfig, rollEnvironmentSnapshot } =
        await import('$lib/environment/environment_roll.js');
      return (provenance) =>
        rollEnvironmentSnapshot(provenance.seed, readEnvironmentGeneratorConfig(provenance.config));
    },
  },
  planet: {
    loadEditor: () => import('$components/locations/PlanetArtifactEditor.svelte'),
    /** The page's two controls, read back through the roll module's own reader. */
    loadRoller: async () => {
      const { readPlanetGeneratorConfig, rollPlanetSnapshot } =
        await import('$lib/astronomical_bodies/planet_roll.js');
      return (provenance) =>
        rollPlanetSnapshot(provenance.seed, readPlanetGeneratorConfig(provenance.config));
    },
  },
  'star-system': {
    loadEditor: () => import('$components/locations/StarSystemArtifactEditor.svelte'),
    /** The page's two controls, read back through the roll module's own reader. */
    loadRoller: async () => {
      const { readStarSystemGeneratorConfig, rollStarSystemSnapshot } =
        await import('$lib/astronomical_bodies/star_system_roll.js');
      return (provenance) =>
        rollStarSystemSnapshot(provenance.seed, readStarSystemGeneratorConfig(provenance.config));
    },
  },
  region: {
    loadEditor: () => import('$components/locations/RegionArtifactEditor.svelte'),
    /** The page's one control besides the seed, read back through the roll module's own reader. */
    loadRoller: async () => {
      const { readRegionGeneratorConfig, rollRegionSnapshot } =
        await import('$lib/regions/region_roll.js');
      return (provenance) =>
        rollRegionSnapshot(provenance.seed, readRegionGeneratorConfig(provenance.config));
    },
  },
  'arms-manufacturer': {
    loadEditor: () => import('$components/factions/ArmsManufacturerArtifactEditor.svelte'),
    /**
     * The seed and nothing else: this tool has one control, and how many models a company lists
     * and which weapon types it favours are the generator's decisions, so there is no config to
     * read back.
     */
    loadRoller: async () => {
      const { rollArmsManufacturerSnapshot } =
        await import('$lib/arms_manufacturer/arms_manufacturer_roll.js');
      return (provenance) => rollArmsManufacturerSnapshot(provenance.seed);
    },
  },
  'velgarth-gifts': {
    loadEditor: () => import('$components/characters/VelgarthGiftsArtifactEditor.svelte'),
    /**
     * The seed and nothing else: this tool has one control, and the bounds on how many Gifts a
     * character has are the setting's rather than the user's, so there is no config to read back.
     */
    loadRoller: async () => {
      const { rollVelgarthGiftsSnapshot } =
        await import('$lib/velgarth_gifts/velgarth_gifts_roll.js');
      return (provenance) => rollVelgarthGiftsSnapshot(provenance.seed);
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
