import { describe, expect, it } from 'vitest';
import { getProcessingRecipes, matchesProcessingInput } from './processing';
import { getPlantProducts } from './plant_products';

describe('qualitative processing recipes', () => {
  it('defines stable unique recipes with explicit required fuel/material/water inputs', () => {
    const recipes = getProcessingRecipes();
    expect(new Set(recipes.map((entry) => entry.id)).size).toBe(recipes.length);
    expect(new Set(recipes.map((entry) => entry.family))).toEqual(
      new Set(['timber', 'fiber', 'textile', 'iron', 'food', 'stone']),
    );
    for (const recipe of recipes) {
      expect(recipe.inputs.length).toBeGreaterThan(0);
      expect(recipe.requirements.length).toBeGreaterThan(0);
    }
    expect(
      recipes.find((entry) => entry.outputKey === 'iron-tools')!.inputs.map((entry) => entry.role),
    ).toEqual(['material', 'fuel', 'material']);
    expect(
      recipes
        .find((entry) => entry.outputKey === 'prepared-flax')!
        .inputs.some((entry) => entry.role === 'water'),
    ).toBe(true);
    expect(
      recipes
        .find((entry) => entry.outputKey === 'smoked-provisions')!
        .inputs.some((entry) => entry.role === 'fuel'),
    ).toBe(true);
  });
  it('matches typed metadata and distinguishes textile fiber from reeds and unknown plants', () => {
    const textile = getProcessingRecipes().find((entry) => entry.outputKey === 'prepared-flax')!
      .inputs[0].selector;
    expect(matchesProcessingInput(textile, getPlantProducts('flax')[0])).toBe(true);
    expect(matchesProcessingInput(textile, getPlantProducts('reeds')[0])).toBe(false);
    expect(matchesProcessingInput(textile, getPlantProducts('papyrus')[0])).toBe(false);
    expect(getPlantProducts('unknown')).toEqual([]);
    expect(getPlantProducts('constructor')).toEqual([]);
    expect(
      matchesProcessingInput(textile, { ...getPlantProducts('flax')[0], name: 'hemp stems' }),
    ).toBe(false);
    expect(
      matchesProcessingInput(
        { kind: 'product', productKey: 'charcoal' },
        { productKey: 'charcoal' },
      ),
    ).toBe(true);
    expect(
      matchesProcessingInput({ kind: 'product', productKey: 'charcoal' }, { productKey: 'coal' }),
    ).toBe(false);
    expect(matchesProcessingInput(textile, { productKey: 'flax' })).toBe(false);
    expect(
      matchesProcessingInput({ kind: 'product', productKey: 'flax' }, getPlantProducts('flax')[0]),
    ).toBe(false);
    const iron = getProcessingRecipes().find((entry) => entry.outputKey === 'bloomery-iron')!
      .inputs[0].selector;
    expect(
      matchesProcessingInput(iron, {
        ...getPlantProducts('flax')[0],
        major_type: 'metal',
        name: 'copper ore',
      }),
    ).toBe(false);
    expect(
      matchesProcessingInput(iron, {
        ...getPlantProducts('flax')[0],
        major_type: 'metal',
        name: 'iron ore',
      }),
    ).toBe(true);
  });
});
