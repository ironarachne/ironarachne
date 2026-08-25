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
   * Heraldry draws itself and hands over an SVG or a PNG (requirement 6.3) without having an
   * editing view (4.1). That combination is why `/saved-data` could be retired: seeing a saved
   * coat of arms and downloading it was the one thing that page did and the project view did not.
   */
  it('gives heraldry a view and no editor', () => {
    const heraldry = artifactEditorEntry('heraldry');

    expect(heraldry?.loadViewer).toBeDefined();
    expect(heraldry?.loadEditor).toBeUndefined();
    expect(hasArtifactEditor('heraldry')).toBe(false);
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
