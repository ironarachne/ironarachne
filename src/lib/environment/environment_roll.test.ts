import { describe, expect, it } from 'vitest';

import {
  ENVIRONMENT_DEFAULT_ELEVATION,
  ENVIRONMENT_DEFAULT_LATITUDE,
  defaultEnvironmentGeneratorConfig,
  randomEnvironmentGeneratorConfig,
  readEnvironmentGeneratorConfig,
  rollEnvironment,
  rollEnvironmentSnapshot,
} from './environment_roll';

describe('rolling an environment', () => {
  it('gives the same environment for the same seed and settings (2.2)', () => {
    expect(rollEnvironment('repeatable')).toEqual(rollEnvironment('repeatable'));
  });

  it('gives the same environment twice from one config object', () => {
    // `generate` writes derived settings back into the config it is handed, so a roll that shared
    // one would differ from itself the second time. A fresh config per call is what stops that.
    const config = defaultEnvironmentGeneratorConfig();
    expect(rollEnvironment('shared-config', config)).toEqual(
      rollEnvironment('shared-config', config),
    );
  });

  it('gives a different environment for a different seed', () => {
    expect(rollEnvironment('one').description).not.toEqual(rollEnvironment('two').description);
  });

  it('honours the latitude it is given', () => {
    // A polar latitude and an equatorial one cannot produce the same climate from one seed.
    const polar = rollEnvironment('latitude', {
      ...defaultEnvironmentGeneratorConfig(),
      latitude: 85,
    });
    const tropical = rollEnvironment('latitude', {
      ...defaultEnvironmentGeneratorConfig(),
      latitude: 0,
    });
    expect(polar.climate.name).not.toEqual(tropical.climate.name);
  });

  it('rolls a snapshot by the same path', () => {
    expect(rollEnvironmentSnapshot('snapshotted').description).toEqual(
      rollEnvironment('snapshotted').description,
    );
  });
});

describe('the parameters the randomize button produces', () => {
  it('are the same for the same seed', () => {
    expect(randomEnvironmentGeneratorConfig('params')).toEqual(
      randomEnvironmentGeneratorConfig('params'),
    );
  });

  it('are drawn from a stream of their own, so they do not move the roll', () => {
    // The page presses Generate and Randomize independently. Sharing one stream would make what
    // Generate produced depend on how many times Randomize had been pressed.
    const before = rollEnvironment('independent');
    randomEnvironmentGeneratorConfig('independent');
    expect(rollEnvironment('independent')).toEqual(before);
  });

  it('stay inside the ranges the button has always used', () => {
    const config = randomEnvironmentGeneratorConfig('ranges');
    expect(Math.abs(config.latitude)).toBeLessThanOrEqual(70);
    expect(config.elevation).toBeGreaterThanOrEqual(0.1);
    expect(config.elevation).toBeLessThanOrEqual(0.8);
    expect(config.terrainVector.every((n) => Math.abs(n) <= 0.5)).toBe(true);
    expect(config.current.every((n) => Math.abs(n) <= 1)).toBe(true);
    expect(config.waterDirection.every((n) => Math.abs(n) <= 20)).toBe(true);
  });

  it('produces two-component vectors, which is what a config records', () => {
    expect(randomEnvironmentGeneratorConfig('shape').terrainVector).toHaveLength(2);
  });
});

describe('reading a stored generator config', () => {
  it('reads back what the page recorded', () => {
    const recorded = {
      latitude: 55,
      elevation: 0.6,
      erosionIterations: 5,
      erosionStrength: 4,
      reliefEnergy: 0.3,
      terrainVector: [0.2, -0.1],
      current: [0.5, 0.5],
      waterDirection: [10, -4],
    };
    expect(readEnvironmentGeneratorConfig(recorded)).toEqual(recorded);
  });

  it('falls back to the library defaults for anything it does not recognise', () => {
    const read = readEnvironmentGeneratorConfig({ latitude: 'north', elevation: null });
    expect(read.latitude).toEqual(ENVIRONMENT_DEFAULT_LATITUDE);
    expect(read.elevation).toEqual(ENVIRONMENT_DEFAULT_ELEVATION);
  });

  it('drops a vector of the wrong length rather than padding it', () => {
    // Guessing the missing component would roll an environment sloping in a direction nobody chose.
    expect(readEnvironmentGeneratorConfig({ terrainVector: [0.3] }).terrainVector).toEqual([0, 0]);
    expect(readEnvironmentGeneratorConfig({ current: 'east' }).current).toEqual([0, 0]);
  });

  it('drops a vector whose components are not numbers', () => {
    expect(readEnvironmentGeneratorConfig({ waterDirection: ['a', 'b'] }).waterDirection).toEqual([
      0, 0,
    ]);
  });

  it('reads an empty config as the defaults', () => {
    expect(readEnvironmentGeneratorConfig({})).toEqual(defaultEnvironmentGeneratorConfig());
  });
});
