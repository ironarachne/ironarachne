import { describe, expect, it } from 'vitest';
import { populationDensityToBand } from './population_density';

describe('populationDensityToBand', () => {
  it('maps scalars to the three bands', () => {
    expect(populationDensityToBand(0)).toBe('low');
    expect(populationDensityToBand(0.34)).toBe('low');
    expect(populationDensityToBand(0.35)).toBe('medium');
    expect(populationDensityToBand(0.69)).toBe('medium');
    expect(populationDensityToBand(0.7)).toBe('high');
    expect(populationDensityToBand(1)).toBe('high');
  });

  it('clamps values outside 0–1 rather than inventing a band', () => {
    expect(populationDensityToBand(-5)).toBe('low');
    expect(populationDensityToBand(42)).toBe('high');
  });
});
