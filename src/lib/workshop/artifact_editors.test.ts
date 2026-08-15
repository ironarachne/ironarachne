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
   * The parity the tool panels have with the tool catalog, applied here. It passes vacuously
   * today — no kind has an editor yet — and it is what stops the first one being registered
   * against a kind id that nothing stores, which would be an editor no artifact could ever reach.
   */
  it('registers editors only for kinds this build can store', () => {
    const kinds = registeredArtifactKinds().map((entry) => entry.kind);

    expect(kindsWithArtifactEditors().filter((kind) => !kinds.includes(kind))).toEqual([]);
  });
});
