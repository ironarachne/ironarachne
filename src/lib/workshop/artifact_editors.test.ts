import { describe, expect, it } from 'vitest';

import { registeredArtifactKinds } from './artifact_kind_catalog';
import {
  ARTIFACT_EDITORS,
  artifactEditorEntry,
  hasArtifactEditor,
  kindsWithArtifactEditors,
} from './artifact_editors';
import type { ArtifactEditorRegistry } from './workshop_types';

const registry: ArtifactEditorRegistry = {
  culture: { loadEditor: () => Promise.resolve({ default: (() => undefined) as never }) },
  religion: {
    loadEditor: () => Promise.resolve({ default: (() => undefined) as never }),
    loadRoller: () => Promise.resolve(() => ({})),
  },
  // Registered, and not editable. The state heraldry is actually in.
  heraldry: { loadViewer: () => Promise.resolve({ default: (() => undefined) as never }) },
};

/**
 * Long enough to compile every editor component on the site, which is what the test below does.
 *
 * That number grows with each tool the readiness pass finishes. It crossed the 5s default at
 * seventeen editors and would have crossed it under load before that — a gate that fails on how
 * busy the machine is teaches people to rerun it rather than read it.
 */
const EVERY_EDITOR_TIMEOUT_MS = 30_000;

describe('the artifact editor registry', () => {
  it('answers whether a kind can be edited without loading anything', () => {
    expect(hasArtifactEditor('culture', registry)).toBe(true);
    expect(hasArtifactEditor('not-a-kind', registry)).toBe(false);
  });

  /**
   * A kind that registered a view and no editing view answers **false**. "This can be edited" is a
   * claim about requirement 4.1 in docs/workshop.md, and a registry that said true because
   * heraldry can draw itself would put a save button in front of a surface with nothing to save.
   */
  it('does not call a kind editable because it can draw itself', () => {
    expect(artifactEditorEntry('heraldry', registry)?.loadViewer).toBeDefined();
    expect(hasArtifactEditor('heraldry', registry)).toBe(false);
    expect(kindsWithArtifactEditors(registry)).not.toContain('heraldry');
  });

  it('hands back the registration, roller and all', () => {
    expect(artifactEditorEntry('religion', registry)?.loadRoller).toBeDefined();
    expect(artifactEditorEntry('culture', registry)?.loadRoller).toBeUndefined();
    expect(artifactEditorEntry('not-a-kind', registry)).toBeUndefined();
  });

  it('lists the kinds it holds, in registry order', () => {
    expect(kindsWithArtifactEditors(registry)).toEqual(['culture', 'religion']);
  });

  it('reads the build’s own registry when it is not given one', () => {
    expect(kindsWithArtifactEditors()).toEqual(
      Object.keys(ARTIFACT_EDITORS).filter((kind) => hasArtifactEditor(kind)),
    );
    expect(hasArtifactEditor('not-a-kind')).toBe(false);
  });

  /**
   * The parity the tool panels have with the tool catalog, applied here: an editor registered
   * against a kind id nothing stores would be an editor no artifact could ever reach.
   */
  it('gives the AD&D character kind both an editor and a roller', () => {
    // The editor is the builder tool itself rather than a component written for the purpose, and
    // the roller is what makes a saved character re-rollable from the seed it was generated with.
    const entry = artifactEditorEntry('character.adnd-2e');

    expect(entry?.loadEditor).toBeDefined();
    expect(entry?.loadRoller).toBeDefined();
    expect(hasArtifactEditor('character.adnd-2e')).toBe(true);
  });

  it('rebuilds a hand-built character and re-rolls a generated one', async () => {
    // One kind, two provenance shapes. The branch is on the tool path, and getting it wrong would
    // rebuild a character out of the generator's settings — which reads as an empty character
    // rather than as an error, so it is worth pinning.
    const roll = await artifactEditorEntry('character.adnd-2e')!.loadRoller!();

    const built = roll({
      toolPath: '/fantasy/adnd/character/build',
      seed: 'seed',
      config: {
        raceName: 'human',
        className: 'fighter',
        alignment: 'true neutral',
        subraceName: '',
        attributes: {
          strength: 14,
          dexterity: 13,
          constitution: 12,
          intelligence: 11,
          wisdom: 10,
          charisma: 9,
        },
        hp: 8,
        startingWealthCp: 1000,
        selectedWeaponNames: [],
        selectedArmorNames: [],
        starterSpellPicks: [],
        thiefSkillPoints: {},
        firstName: 'Aldric',
        lastName: 'Vane',
      },
    }) as { raceName: string; hp: number; firstName: string };

    expect(built.raceName).toBe('human');
    expect(built.hp).toBe(8);
    expect(built.firstName).toBe('Aldric');

    const generated = roll({
      toolPath: '/fantasy/adnd/character',
      seed: 'seed',
      config: { includeKits: true },
    }) as { raceName: string };

    expect(generated.raceName).not.toBe('');
  });

  it('registers editors only for kinds this build can store', () => {
    const kinds = registeredArtifactKinds().map((entry) => entry.kind);

    expect(Object.keys(ARTIFACT_EDITORS).filter((kind) => !kinds.includes(kind))).toEqual([]);
  });

  /**
   * Heraldry was the viewer-only kind until #51: it drew itself and handed over an SVG or a PNG
   * (requirement 6.3) and could not be changed (4.1). It has an editor now, and the assertion is
   * by name rather than by count for the reason culture's is — the point of taking *that tool* to
   * Release-ready is that that tool is editable.
   *
   * `loadViewer` staying in the vocabulary is asserted separately, in the registry's own shape
   * test above: a kind that can be shown and not sensibly edited is still a state the surface can
   * render, and no entry using it today does not make it wrong.
   */
  it('gives heraldry an editor and a roller', () => {
    const heraldry = artifactEditorEntry('heraldry');

    expect(heraldry?.loadEditor).toBeDefined();
    expect(heraldry?.loadRoller).toBeDefined();
    expect(hasArtifactEditor('heraldry')).toBe(true);
  });

  it('rolls an organization from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('organization')!.loadRoller!();
    const rolled = roll({
      toolPath: '/fantasy/organization',
      seed: 'registry-seed',
      config: { genre: 'fantasy', kindId: 'noble_house' },
    }) as { name: string; kindId: string };

    expect(rolled.name).not.toBe('');
    expect(rolled.kindId).toBe('noble_house');
  });

  /**
   * Every editor's loader resolves to a component. The specifiers are written out in full for
   * the bundler's sake, which is also how one can be mistyped without anything noticing until a
   * user opens that kind — this is the one place they are all followed.
   */
  it(
    'loads a component for every registered editor',
    async () => {
      for (const kind of kindsWithArtifactEditors()) {
        const loaded = await artifactEditorEntry(kind)!.loadEditor!();

        expect(loaded.default, kind).toBeDefined();
      }
    },
    EVERY_EDITOR_TIMEOUT_MS,
  );

  it('rolls a chop shop from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('chop-shop')!.loadRoller!();
    const rolled = roll({ toolPath: '/chop-shop', seed: 'registry-seed', config: {} }) as {
      text: string;
    };

    expect(rolled.text).not.toBe('');
    expect(rolled).toEqual(roll({ toolPath: '/chop-shop', seed: 'registry-seed', config: {} }));
  });

  it('rolls a dungeon from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('dungeon')!.loadRoller!();
    const rolled = roll({
      toolPath: '/fantasy/dungeon',
      seed: 'registry-seed',
      config: { width: 20, height: 20, blueprintName: 'Tomb' },
    }) as { name: string; theme: { blueprint: { name: string } } };

    expect(rolled.name).not.toBe('');
    // The recorded blueprint is honoured rather than redrawn, which is the whole claim provenance
    // makes about a re-roll.
    expect(rolled.theme.blueprint.name).toBe('Tomb');
  });

  it('rolls an environment from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('environment')!.loadRoller!();
    const provenance = {
      toolPath: '/environment' as const,
      seed: 'registry-seed',
      config: { latitude: 82 },
    };
    const rolled = roll(provenance) as { climate: { name: string }; description: string };

    expect(rolled.description).not.toBe('');
    // The recorded latitude is honoured rather than redrawn, which is the whole claim provenance
    // makes about a re-roll: a polar latitude cannot produce a tropical climate.
    expect(rolled.climate.name).not.toBe('tropical');
    expect(rolled).toEqual(roll(provenance));
  });

  it('rolls a planet from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('planet')!.loadRoller!();
    const provenance = {
      toolPath: '/planet' as const,
      seed: 'registry-seed',
      config: { forceRings: true },
    };
    const rolled = roll(provenance) as { name: string; has_ring_system: boolean };

    expect(rolled.name).not.toBe('');
    // The recorded setting is honoured rather than redrawn, which is the whole claim provenance
    // makes about a re-roll.
    expect(rolled.has_ring_system).toBe(true);
    expect(rolled).toEqual(roll(provenance));
  });

  it('rolls a star system from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('star-system')!.loadRoller!();
    const provenance = {
      toolPath: '/star-system' as const,
      seed: 'registry-seed',
      config: { planetCount: 4 },
    };
    const rolled = roll(provenance) as { name: string; planets: unknown[] };

    expect(rolled.name).not.toBe('');
    // The recorded count is honoured rather than redrawn, which is the whole claim provenance
    // makes about a re-roll.
    expect(rolled.planets).toHaveLength(4);
    expect(rolled).toEqual(roll(provenance));
  });

  it('rolls a region from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('region')!.loadRoller!();
    const provenance = { toolPath: '/region' as const, seed: 'registry-seed', config: {} };
    const rolled = roll(provenance) as { name: string; map: { nodes: unknown[] } };

    expect(rolled.name).not.toBe('');
    expect(rolled.map.nodes.length).toBeGreaterThan(0);
    expect(rolled).toEqual(roll(provenance));
  });

  it('rolls a drug from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('drug')!.loadRoller!();
    const provenance = { toolPath: '/drug' as const, seed: 'registry-seed', config: {} };
    const rolled = roll(provenance) as { name: string; drugTypeName: string };

    expect(rolled.name).not.toBe('');
    expect(rolled.drugTypeName).not.toBe('');
    expect(rolled).toEqual(roll(provenance));
  });

  it('rolls a star nation from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('star-nation')!.loadRoller!();
    const rolled = roll({
      toolPath: '/star-nation',
      seed: 'registry-seed',
      config: { planetCount: 4 },
    }) as { name: string; homeSystem: { planets: unknown[] } };

    expect(rolled.name).not.toBe('');
    expect(rolled.homeSystem.planets).toHaveLength(4);
  });

  it('rolls a family from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('family')!.loadRoller!();
    const rolled = roll({
      toolPath: '/fantasy/family',
      seed: 'registry-seed',
      config: { speciesName: 'human', generations: 2 },
    }) as { name: string; members: { speciesName: string }[] };

    expect(rolled.name).not.toBe('');
    expect(rolled.members.length).toBeGreaterThan(0);
    expect(rolled.members[0].speciesName).toBe('human');
  });

  it('rolls an encounter from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('encounter')!.loadRoller!();
    const rolled = roll({
      toolPath: '/fantasy/encounter',
      seed: 'registry-seed',
      config: { templateName: 'pack of ghouls' },
    }) as { name: string; groups: unknown[] };

    expect(rolled.name).toBe('pack of ghouls');
    expect(rolled.groups.length).toBeGreaterThan(0);
  });

  it('rolls an arms manufacturer from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('arms-manufacturer')!.loadRoller!();
    const rolled = roll({
      toolPath: '/arms-manufacturer',
      seed: 'registry-seed',
      config: {},
    }) as { name: string; models: unknown[] };

    expect(rolled.name).not.toBe('');
    expect(rolled.models.length).toBeGreaterThan(0);
  });

  /**
   * The seed and nothing else, which is what this kind's provenance holds: the tool has one
   * control, and how many Gifts a character has is the setting's business rather than the user's.
   */
  it('rolls a set of Velgarth gifts from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('velgarth-gifts')!.loadRoller!();
    const rolled = roll({
      toolPath: '/velgarth-gifts',
      seed: 'registry-seed',
      config: {},
    }) as { gifts: { name: string }[] };

    expect(rolled.gifts.length).toBeGreaterThan(0);
    expect(rolled.gifts[0].name).not.toBe('');
  });

  it('rolls a coat of arms from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('heraldry')!.loadRoller!();
    const rolled = roll({
      toolPath: '/heraldry',
      seed: 'registry-seed',
      config: { heraldryTag: 'any' },
    }) as { blazon: string };

    expect(rolled.blazon).not.toBe('');
  });

  /**
   * Culture is the first kind through the slot #39 built (#40). Asserted by name rather than by
   * "at least one", because the point of taking a tool to Release-ready is that *that tool* is
   * editable — a passing count would survive the entry being swapped for any other kind.
   */
  it('gives culture an editor and a roller', () => {
    const culture = artifactEditorEntry('culture');

    expect(culture?.loadEditor).toBeDefined();
    expect(culture?.loadRoller).toBeDefined();
  });

  it('rolls a culture from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('culture')!.loadRoller!();
    const rolled = roll({
      toolPath: '/culture',
      seed: 'registry-roll',
      config: { nameGeneratorSet: 'dwarf' },
    }) as { name: string };

    expect(typeof rolled.name).toBe('string');
    expect(rolled.name).not.toBe('');
  });

  /**
   * Religion is the second kind through the slot (#41), and the one that says whether the slot is
   * a slot at all: it went in as a registration and a component, with nothing here changed to
   * accommodate a payload shaped nothing like a culture's.
   */
  it('gives religion an editor and a roller', () => {
    const religion = artifactEditorEntry('religion');

    expect(religion?.loadEditor).toBeDefined();
    expect(religion?.loadRoller).toBeDefined();
  });

  it('rolls a religion from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('religion')!.loadRoller!();
    const rolled = roll({
      toolPath: '/fantasy/religion',
      seed: 'registry-roll',
      config: { selectedCategories: ['polytheism'], nameGeneratorSet: 'dwarf' },
    }) as { name: string; religion: { pantheon: unknown } };

    expect(typeof rolled.name).toBe('string');
    expect(rolled.name).not.toBe('');
    expect(rolled.religion.pantheon).not.toBeNull();
  });

  /**
   * Settlement is the third (#20), and the only one whose payload was built against the contract
   * from scratch rather than retrofitted from an existing snapshot. Nothing here changed to take
   * it either, which is the claim these three entries exist to keep testing.
   */
  it('gives settlement an editor and a roller', () => {
    const settlement = artifactEditorEntry('settlement');

    expect(settlement?.loadEditor).toBeDefined();
    expect(settlement?.loadRoller).toBeDefined();
  });

  it('rolls a settlement from provenance through the registered roller', async () => {
    const roll = await artifactEditorEntry('settlement')!.loadRoller!();
    const provenance = {
      toolPath: '/fantasy/settlement' as const,
      seed: 'registry-roll',
      config: { nameGeneratorSet: 'dwarf', size: 'large', includeNotables: true },
    };
    const rolled = roll(provenance) as { name: string; importantPeople?: unknown[] };

    expect(typeof rolled.name).toBe('string');
    expect(rolled.name).not.toBe('');
    expect(rolled.importantPeople?.length).toBeGreaterThan(0);
    // Requirement 2.2 through the registry rather than only in the library: the same provenance
    // rolls the same settlement, which is what makes re-rolling an unedited artifact safe.
    expect(roll(provenance)).toEqual(rolled);
  });
});
