import { describe, expect, it } from 'vitest';
import { isGasGiantPlanetClassification } from './planet_canvas_classification';

describe('isGasGiantPlanetClassification', () => {
  it('is true only for gas giant planet', () => {
    expect(isGasGiantPlanetClassification('gas giant planet')).toBe(true);
    expect(isGasGiantPlanetClassification('garden planet')).toBe(false);
    expect(isGasGiantPlanetClassification('ocean planet')).toBe(false);
  });
});
