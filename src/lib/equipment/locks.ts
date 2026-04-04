import type { Lock, LockGeneratorConfig, LockType } from './equipment_types';
import { RNG } from '@ironarachne/rng';

export function getDefaultLockGeneratorConfig(): LockGeneratorConfig {
  return {
    allowedLockTypes: ['mechanical', 'magical'],
    minDifficulty: 1,
    maxDifficulty: 10,
    chanceOfBeingLocked: 0.5,
  };
}

export function generateRandomLock(seed: string, config: LockGeneratorConfig): Lock {
  const rng = new RNG(seed);

  const lockType: LockType = config.allowedLockTypes
    ? rng.item(config.allowedLockTypes)
    : rng.item(['mechanical', 'magical']);
  const difficulty = rng.int(
    config.minDifficulty !== undefined ? config.minDifficulty : 1,
    config.maxDifficulty !== undefined ? config.maxDifficulty : 10,
  );
  const isLocked =
    rng.float(0, 1) < (config.chanceOfBeingLocked !== undefined ? config.chanceOfBeingLocked : 0.5)
      ? true
      : false;

  return {
    id: `lock-${rng.randomString(13)}`,
    name: `${lockType.charAt(0).toUpperCase() + lockType.slice(1)} Lock`,
    description: `A ${lockType} lock with difficulty level ${difficulty}.`,
    value: 10 + difficulty * 5,
    rarity:
      difficulty <= 3 ? 'common' : difficulty <= 6 ? 'uncommon' : difficulty <= 8 ? 'rare' : 'epic',
    itemMajorType: 'lock',
    itemMinorType: lockType,
    lockType,
    difficulty,
    isLocked,
    densityCategory: 'dense',
    weight: 0.5 + difficulty * 0.1,
    properties: [],
  };
}
