import { expect, describe, it } from 'vitest';
import { applyMutators, type Mutator } from './index';

type Target = { value: number; history: string[] };

function addingMutator(name: string, amount: number): Mutator<Target> {
  return {
    name,
    tags: [],
    mutate: (_seed, target) => ({
      value: target.value + amount,
      history: [...target.history, name],
    }),
  };
}

describe('applyMutators', () => {
  const target: Target = { value: 0, history: [] };

  it('returns the target untouched when there are no mutators', () => {
    expect(applyMutators('seed', target, [])).toEqual(target);
  });

  it('applies a single mutator', () => {
    expect(applyMutators('seed', target, [addingMutator('add-one', 1)])).toEqual({
      value: 1,
      history: ['add-one'],
    });
  });

  it('chains mutators, feeding each the previous result', () => {
    const result = applyMutators('seed', target, [
      addingMutator('add-one', 1),
      addingMutator('add-ten', 10),
    ]);

    expect(result).toEqual({ value: 11, history: ['add-one', 'add-ten'] });
  });

  it('applies mutators in order', () => {
    const doubling: Mutator<Target> = {
      name: 'double',
      tags: [],
      mutate: (_seed, current) => ({ ...current, value: current.value * 2 }),
    };
    const start: Target = { value: 3, history: [] };

    expect(applyMutators('seed', start, [doubling, addingMutator('add-one', 1)]).value).toBe(7);
    expect(applyMutators('seed', start, [addingMutator('add-one', 1), doubling]).value).toBe(8);
  });

  it('gives each mutator a distinct 16-character seed', () => {
    const seeds: string[] = [];
    const recorder: Mutator<Target> = {
      name: 'recorder',
      tags: [],
      mutate: (seed, current) => {
        seeds.push(seed);
        return current;
      },
    };

    applyMutators('seed', target, [recorder, recorder, recorder]);

    expect(seeds).toHaveLength(3);
    expect(new Set(seeds).size).toBe(3);
    for (const seed of seeds) {
      expect(seed).toHaveLength(16);
    }
  });

  it('derives mutator seeds deterministically from the supplied seed', () => {
    const seedsFor = (seed: string) => {
      const collected: string[] = [];
      const recorder: Mutator<Target> = {
        name: 'recorder',
        tags: [],
        mutate: (mutatorSeed, current) => {
          collected.push(mutatorSeed);
          return current;
        },
      };
      applyMutators(seed, target, [recorder, recorder]);
      return collected;
    };

    expect(seedsFor('alpha')).toEqual(seedsFor('alpha'));
    expect(seedsFor('alpha')).not.toEqual(seedsFor('beta'));
  });

  it('does not mutate the original target', () => {
    const original: Target = { value: 0, history: [] };
    applyMutators('seed', original, [addingMutator('add-one', 1)]);

    expect(original).toEqual({ value: 0, history: [] });
  });
});
