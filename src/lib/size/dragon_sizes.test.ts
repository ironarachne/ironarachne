import { describe, expect, it } from 'vitest';
import { dragonLifespanTrueWyrm } from '$lib/age/dragon_life_stages';
import { dragonTrueWyrmSizeMatrix } from '$lib/size/dragon_sizes';

describe('dragonTrueWyrmSizeMatrix', () => {
  it('maps every dragon age category on female and male rows', () => {
    const ages = dragonLifespanTrueWyrm().map((a) => a.name);
    const matrix = dragonTrueWyrmSizeMatrix();

    expect(matrix.map((r) => r.gender)).toEqual(['female', 'male']);

    for (const row of matrix) {
      const entryNames = row.entries.map((e) => e.ageCategoryName);
      expect(entryNames).toEqual(ages);
    }
  });

  it('grows monotonically in snout-tail length, height, and mass across age bands', () => {
    const matrix = dragonTrueWyrmSizeMatrix();
    const row = matrix[0]!;

    let prevMaxLen = 0;
    let prevMaxHt = 0;
    let prevMaxWt = 0;

    for (const e of row.entries) {
      const { minHeight, maxHeight, minLength, maxLength, minWeight, maxWeight } =
        e.sizeGeneratorConfig;
      expect(minHeight).toBeGreaterThan(prevMaxHt);
      expect(maxHeight).toBeGreaterThanOrEqual(minHeight);
      expect(minLength).toBeGreaterThan(prevMaxLen);
      expect(maxLength).toBeGreaterThanOrEqual(minLength);
      expect(minWeight).toBeGreaterThan(prevMaxWt);
      expect(maxWeight).toBeGreaterThanOrEqual(minWeight);
      prevMaxLen = maxLength;
      prevMaxHt = maxHeight;
      prevMaxWt = maxWeight;
    }
  });

  it('mirrors mass to weight for each entry', () => {
    const matrix = dragonTrueWyrmSizeMatrix();

    for (const row of matrix) {
      for (const e of row.entries) {
        const c = e.sizeGeneratorConfig;
        expect(c.minMass).toBe(c.minWeight);
        expect(c.maxMass).toBe(c.maxWeight);
      }
    }
  });
});
