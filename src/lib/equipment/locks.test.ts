import { describe, expect, it } from 'vitest';
import type { LockType } from './equipment_types';
import { generateRandomLock, getDefaultLockGeneratorConfig } from './locks';

const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

describe('getDefaultLockGeneratorConfig', () => {
  it('allows both lock types across the full difficulty range', () => {
    const config = getDefaultLockGeneratorConfig();

    expect(config.allowedLockTypes).toEqual(['mechanical', 'magical']);
    expect(config.minDifficulty).toBe(1);
    expect(config.maxDifficulty).toBe(10);
    expect(config.chanceOfBeingLocked).toBe(0.5);
  });
});

describe('generateRandomLock', () => {
  const config = getDefaultLockGeneratorConfig();

  it('is reproducible from a seed', () => {
    expect(generateRandomLock('seed-a', config)).toEqual(generateRandomLock('seed-a', config));
  });

  it('varies with the seed', () => {
    const ids = new Set(seeds.map((seed) => generateRandomLock(seed, config).id));

    expect(ids.size).toBe(seeds.length);
  });

  it('produces a well-formed lock', () => {
    const lock = generateRandomLock('seed-a', config);

    expect(lock.id).toMatch(/^lock-/);
    expect(lock.itemMajorType).toBe('lock');
    expect(lock.itemMinorType).toBe(lock.lockType);
    expect(lock.densityCategory).toBe('dense');
    expect(lock.properties).toEqual([]);
    expect(lock.description).toContain(String(lock.difficulty));
  });

  it('capitalises the lock type in the name', () => {
    for (const seed of seeds) {
      const lock = generateRandomLock(seed, config);

      expect(lock.name).toBe(`${lock.lockType === 'magical' ? 'Magical' : 'Mechanical'} Lock`);
    }
  });

  it('stays inside the configured difficulty range', () => {
    for (const seed of seeds) {
      const lock = generateRandomLock(seed, { minDifficulty: 3, maxDifficulty: 5 });

      expect(lock.difficulty).toBeGreaterThanOrEqual(3);
      expect(lock.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it('defaults the difficulty range when it is not configured', () => {
    for (const seed of seeds) {
      const lock = generateRandomLock(seed, {});

      expect(lock.difficulty).toBeGreaterThanOrEqual(1);
      expect(lock.difficulty).toBeLessThanOrEqual(10);
    }
  });

  it('restricts itself to the allowed lock types', () => {
    for (const seed of seeds) {
      const lock = generateRandomLock(seed, { allowedLockTypes: ['magical'] });

      expect(lock.lockType).toBe('magical');
    }
  });

  it('picks from both types when both are allowed', () => {
    const types = new Set<LockType>(seeds.map((seed) => generateRandomLock(seed, config).lockType));

    expect(types.size).toBe(2);
  });

  it('always locks at a chance of 1', () => {
    for (const seed of seeds) {
      expect(generateRandomLock(seed, { chanceOfBeingLocked: 1 }).isLocked).toBe(true);
    }
  });

  it('never locks at a chance of 0', () => {
    for (const seed of seeds) {
      expect(generateRandomLock(seed, { chanceOfBeingLocked: 0 }).isLocked).toBe(false);
    }
  });

  it('prices and weights a lock by its difficulty', () => {
    const easy = generateRandomLock('seed-a', { minDifficulty: 1, maxDifficulty: 1 });
    const hard = generateRandomLock('seed-a', { minDifficulty: 10, maxDifficulty: 10 });

    expect(easy.value).toBe(15);
    expect(hard.value).toBe(60);
    expect(hard.weight).toBeGreaterThan(easy.weight);
  });

  it.each([
    [1, 'common'],
    [3, 'common'],
    [4, 'uncommon'],
    [6, 'uncommon'],
    [7, 'rare'],
    [8, 'rare'],
    [9, 'epic'],
    [10, 'epic'],
  ])('rates difficulty %i as %s', (difficulty, rarity) => {
    const lock = generateRandomLock('seed-a', {
      minDifficulty: difficulty,
      maxDifficulty: difficulty,
    });

    expect(lock.rarity).toBe(rarity);
  });
});
