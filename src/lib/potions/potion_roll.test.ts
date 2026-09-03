import { describe, expect, it } from 'vitest';

import {
  defaultPotionGeneratorConfigRecord,
  readPotionGeneratorConfig,
  rollPotion,
  rollPotionSnapshot,
  toPotionGeneratorConfig,
} from './potion_roll';
import { toPotionSnapshot } from './potion_snapshot';

const CONFIG = defaultPotionGeneratorConfigRecord();

describe('rollPotion', () => {
  it('gives the same potion for the same seed and settings', () => {
    // Requirement 2.2. `generatePotion` was already pure; the page drew each new seed from a fresh
    // `RNG(Date.now())` inside every press.
    expect(toPotionSnapshot(rollPotion('fixed', CONFIG))).toEqual(
      toPotionSnapshot(rollPotion('fixed', CONFIG)),
    );
  });

  it('gives a different potion for a different seed', () => {
    expect(toPotionSnapshot(rollPotion('one', CONFIG))).not.toEqual(
      toPotionSnapshot(rollPotion('two', CONFIG)),
    );
  });

  it('rolls something from the catalog with the defaults', () => {
    const potion = rollPotion('catalog', CONFIG);

    expect(potion.displayName).not.toBe('');
    expect(potion.effect.name).not.toBe('');
    expect(potion.container.name).not.toBe('');
  });

  it('honours the two settings', () => {
    const full = toPotionGeneratorConfig({ allowHomebrew: true, allowProceduralNames: true });

    expect(full.allowHomebrew).toBe(true);
    expect(full.allowProceduralNames).toBe(true);
    // The catalog and the container rules stay the library's.
    expect(full.containerConfig.onlyLiquidContainers).toBe(true);
  });
});

describe('readPotionGeneratorConfig', () => {
  it('reads back what the page wrote', () => {
    const written = { allowHomebrew: true, allowProceduralNames: true };

    expect(readPotionGeneratorConfig(written)).toEqual(written);
  });

  it('falls back to the defaults for anything it does not recognise', () => {
    // A config written by a build that spelled these differently should re-roll the ordinary way
    // rather than from a field it misread.
    expect(readPotionGeneratorConfig({})).toEqual(CONFIG);
    expect(readPotionGeneratorConfig({ allowHomebrew: 'yes' }).allowHomebrew).toBe(false);
  });
});

describe('rollPotionSnapshot', () => {
  it('is the roller a re-roll takes, and matches the page', () => {
    expect(rollPotionSnapshot('seed', CONFIG)).toEqual(
      toPotionSnapshot(rollPotion('seed', CONFIG)),
    );
  });

  it('re-rolls the same potion a stored provenance describes', () => {
    // Requirement 4.3: the destructive command puts the rolled potion back.
    const provenance = { seed: 'stored', config: { allowHomebrew: true } };

    expect(
      rollPotionSnapshot(provenance.seed, readPotionGeneratorConfig(provenance.config)),
    ).toEqual(rollPotionSnapshot('stored', { allowHomebrew: true, allowProceduralNames: false }));
  });
});
