import { describe, expect, it } from 'vitest';

import { mergeCultureChoices } from './culture_choices';
import type { Culture } from './culture_types';

function named(name: string, greeting = ''): Culture {
  return { name, greeting } as unknown as Culture;
}

describe('mergeCultureChoices', () => {
  it('offers both what the project holds and what the old scope still holds', () => {
    const merged = mergeCultureChoices([named('Emberfolk')], [named('Saltmarch')]);

    expect(merged.map((culture) => culture.name)).toEqual(['Emberfolk', 'Saltmarch']);
  });

  /**
   * Adoption copies the old scope into a project without emptying it, so the same culture is very
   * often in both. The project's copy is the one a user can edit, reference, and export.
   */
  it('keeps the project’s copy when both hold the same name', () => {
    const merged = mergeCultureChoices(
      [named('Emberfolk', 'from the project')],
      [named('Emberfolk', 'from the old scope')],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].greeting).toBe('from the project');
  });

  it('handles either side being empty', () => {
    expect(mergeCultureChoices([], [named('Saltmarch')]).map((c) => c.name)).toEqual(['Saltmarch']);
    expect(mergeCultureChoices([named('Emberfolk')], []).map((c) => c.name)).toEqual(['Emberfolk']);
    expect(mergeCultureChoices([], [])).toEqual([]);
  });
});
