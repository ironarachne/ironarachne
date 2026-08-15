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
};

describe('the artifact editor registry', () => {
  it('answers whether a kind can be edited without loading anything', () => {
    expect(hasArtifactEditor('culture', registry)).toBe(true);
    expect(hasArtifactEditor('heraldry', registry)).toBe(false);
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
    expect(kindsWithArtifactEditors()).toEqual(Object.keys(ARTIFACT_EDITORS));
    expect(hasArtifactEditor('not-a-kind')).toBe(false);
  });

  /**
   * The parity the tool panels have with the tool catalog, applied here: an editor registered
   * against a kind id nothing stores would be an editor no artifact could ever reach.
   */
  it('registers editors only for kinds this build can store', () => {
    const kinds = registeredArtifactKinds().map((entry) => entry.kind);

    expect(kindsWithArtifactEditors().filter((kind) => !kinds.includes(kind))).toEqual([]);
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
});
