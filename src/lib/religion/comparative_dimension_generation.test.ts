import { describe, expect, it } from 'vitest';
import { polytheism } from './categories';
import {
  activeReligionDimensionIdsForConfig,
  generateReligionDimensions,
} from './comparative_dimension_generation';
import type { ReligionCategory } from './religion_types';

const stubCategory: ReligionCategory = {
  name: 'stub',
  description: 'Stub category.',
  hasDeities: true,
  hasLeader: false,
  minDeities: 1,
  maxDeities: 3,
};

describe('generateReligionDimensions', () => {
  it('is deterministic for a fixed seed and category', () => {
    const a = generateReligionDimensions('fixed-seed-1', { category: polytheism });
    const b = generateReligionDimensions('fixed-seed-1', { category: polytheism });
    expect(a).toEqual(b);
  });

  it('omits excluded dimensions from output', () => {
    const d = generateReligionDimensions('omit-test', {
      category: stubCategory,
      dimensionGeneration: {
        excludedDimensions: ['material', 'ethical', 'mythological'],
      },
    });
    expect(d.material).toBeUndefined();
    expect(d.ethical).toBeUndefined();
    expect(d.mythological).toBeUndefined();
    expect(d.ritual).toBeDefined();
    expect(d.doctrinal).toBeDefined();
  });

  it('includedDimensions limits output to listed ids', () => {
    const d = generateReligionDimensions('include-test', {
      category: stubCategory,
      dimensionGeneration: {
        includedDimensions: ['doctrinal', 'ritual'],
      },
    });
    expect(Object.keys(d).sort()).toEqual(['doctrinal', 'ritual']);
  });

  it('applies doctrinal overrides after RNG', () => {
    const d = generateReligionDimensions('override-doc', {
      category: stubCategory,
      dimensionGeneration: {
        doctrinal: {
          authority: 'scripture',
          hasFormalCreed: true,
          scriptureCharacter: 'a fixed canon of revealed texts',
        },
      },
    });
    expect(d.doctrinal?.authority).toBe('scripture');
    expect(d.doctrinal?.hasFormalCreed).toBe(true);
    expect(d.doctrinal?.scriptureCharacter).toBe('a fixed canon of revealed texts');
  });
});

describe('activeReligionDimensionIdsForConfig', () => {
  it('returns all ids when config is undefined', () => {
    expect(activeReligionDimensionIdsForConfig(undefined).length).toBe(7);
  });

  it('respects excludedDimensions', () => {
    const ids = activeReligionDimensionIdsForConfig({
      excludedDimensions: ['ritual'],
    });
    expect(ids).not.toContain('ritual');
    expect(ids.length).toBe(6);
  });
});
