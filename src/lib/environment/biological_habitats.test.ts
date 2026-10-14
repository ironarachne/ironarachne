import { describe, expect, it } from 'vitest';
import { getBiologicalHabitatRules, supportsBiologicalHabitat } from './biological_habitats';
import { getPlantDefinitions, resolvePlantDefinition } from './plants';
import type { BiologicalHabitatPatch } from './biological_source_types';

describe('reviewed biological habitats', () => {
  it('requires every local gate, including the exact water kind and inclusive bounds', () => {
    const rule = getBiologicalHabitatRules('reed-margin')[0];
    const patch: BiologicalHabitatPatch = {
      environments: ['swamp'],
      temperature: 0,
      moisture: 0.6,
      landform: 'plain',
      water: ['freshwater-bank'],
    };
    expect(supportsBiologicalHabitat(patch, rule)).toBe(true);
    for (const change of [
      { environments: ['desert'] },
      { temperature: -1 },
      { temperature: 31 },
      { moisture: 0.59 },
      { moisture: 1.01 },
      { water: [] },
      { water: ['coastal-margin'] as BiologicalHabitatPatch['water'] },
    ])
      expect(supportsBiologicalHabitat({ ...patch, ...change }, rule)).toBe(false);
    expect(supportsBiologicalHabitat(patch, { ...rule, landforms: ['mountain'] })).toBe(false);
    expect(
      supportsBiologicalHabitat(
        { ...patch, landform: 'mountain' },
        { ...rule, landforms: ['mountain'] },
      ),
    ).toBe(true);
    expect(getBiologicalHabitatRules('unknown')).toEqual([]);
    expect(getBiologicalHabitatRules('cool-coast').map((entry) => entry.water)).toEqual([
      'coastal-margin',
    ]);
  });
  it('keeps ambiguous labels unqualified and returns independently editable catalog copies', () => {
    const plants = getPlantDefinitions();
    expect(new Set(plants.map((plant) => plant.id)).size).toBe(plants.length);
    expect(resolvePlantDefinition('reeds')?.id).toBe('common-reed');
    expect(resolvePlantDefinition('common reed')?.id).toBe('common-reed');
    expect(resolvePlantDefinition('cotton')?.id).toBe('cotton');
    for (const generic of [
      'oak tree',
      'pine tree',
      'clover',
      'grass',
      'wildflower',
      'wild carrot',
      'bean',
    ])
      expect(resolvePlantDefinition(generic)).toBeUndefined();
    expect(resolvePlantDefinition('perennial-ryegrass')?.forage).toEqual(['grazing']);
    expect(resolvePlantDefinition('white-clover')?.forage).toEqual(['flowering']);
    plants[0].habitats[0].temperature[0] = -999;
    plants[0].aliases.push('generic');
    expect(getPlantDefinitions()[0].habitats[0].temperature[0]).not.toBe(-999);
    expect(resolvePlantDefinition('generic')).toBeUndefined();
    for (const plant of plants) expect(plant.habitats.length).toBeGreaterThan(0);
  });
});
