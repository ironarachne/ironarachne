import { describe, expect, it } from 'vitest';
import { nonSentient } from '$lib/species';
import { generate, getDefaultCreatureGenerationConfig } from './creatures';
import { generateWithHabitatContext } from './creature_habitat';
import type { CreatureHabitatContext } from './creature_habitat_types';

const species = nonSentient().slice(0, 2);
const config = { ...getDefaultCreatureGenerationConfig(), speciesOptions: species };
const context: CreatureHabitatContext = {
  habitatId: 'habitat:forest',
  regionTargetId: 'region-one',
  candidates: species.map((entry, index) => ({
    inhabitantId: `inhabitant:${index}`,
    speciesName: entry.name,
    roles: ['other'],
  })),
};

describe('optional habitat generation', () => {
  it('reports a supported assignment, a link by ID, and a usable individual', () => {
    const result = generateWithHabitatContext('beast', config, context);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      context.candidates.some(
        (entry) =>
          entry.speciesName === result.creature.species.name &&
          entry.inhabitantId === result.assignment.inhabitantId,
      ),
    ).toBe(true);
    expect(result.assignment.habitatId).toBe(context.habitatId);
    expect(result.reference).toEqual({
      targetId: 'region-one',
      targetKind: 'region',
      role: 'habitat-context',
    });
    expect(result).not.toHaveProperty('region');
  });
  it('preserves standalone generation and leaves all inputs intact', () => {
    const before = generate('beast', config);
    const copy = JSON.stringify({ config, context });
    generateWithHabitatContext('beast', config, context);
    expect(generate('beast', config)).toEqual(before);
    expect(JSON.stringify({ config, context })).toBe(copy);
  });
  it('is repeatable with reordered lists and duplicate candidate records', () => {
    const first = generateWithHabitatContext('order', config, context);
    const second = generateWithHabitatContext(
      'order',
      { ...config, speciesOptions: [...species].reverse() },
      { ...context, candidates: [...context.candidates].reverse() },
    );
    expect(second).toEqual(first);
    const duplicate = { ...context.candidates[0], inhabitantId: 'zz-duplicate' };
    expect(
      generateWithHabitatContext('order', config, {
        ...context,
        candidates: [...context.candidates, duplicate],
      }),
    ).toEqual(first);
  });
  it('does not attach an artifact reference for an unsaved region', () => {
    expect(
      generateWithHabitatContext('beast', config, { ...context, regionTargetId: undefined }),
    ).not.toHaveProperty('reference');
  });
  it('omits unsupported options without falling back to standalone generation', () => {
    expect(generateWithHabitatContext('none', config, { ...context, habitatId: '' })).toMatchObject(
      { ok: false, reason: 'missing-habitat' },
    );
    expect(
      generateWithHabitatContext('none', config, { ...context, candidates: [] }),
    ).toMatchObject({ ok: false, reason: 'no-supported-species' });
    for (const change of [
      { ageCategoryNames: [] },
      { genderNames: [] },
      { genderNames: ['unknown'] },
      { ageCategoryNames: ['unknown'] },
    ])
      expect(generateWithHabitatContext('none', { ...config, ...change }, context)).toMatchObject({
        ok: false,
        reason: 'incompatible-options',
      });
    const broken = species.map((entry) => ({ ...entry, sizeGeneratorConfigMatrix: [] }));
    expect(
      generateWithHabitatContext('none', { ...config, speciesOptions: broken }, context),
    ).toMatchObject({ ok: false, reason: 'incompatible-options' });
  });
});
