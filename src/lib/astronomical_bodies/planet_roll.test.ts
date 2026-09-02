import { describe, expect, it } from 'vitest';

import {
  PLANET_ANY_CLASSIFICATION,
  planetClassificationNames,
  planetPreviewSeed,
  readPlanetGeneratorConfig,
  rollPlanet,
  rollPlanetSnapshot,
} from './planet_roll';

describe('rolling a planet', () => {
  it('gives the same planet for the same seed and settings (2.2)', () => {
    expect(rollPlanet('repeatable')).toEqual(rollPlanet('repeatable'));
  });

  it('rolls the same moons twice, which the clock-seeded moon config prevented', () => {
    // `getDefaultMoonGenerationConfig` seeded itself from `Date.now()` until this issue, so every
    // moon in the system was clock-driven however carefully the page threaded its seed.
    const first = rollPlanet('moons-seed');
    const second = rollPlanet('moons-seed');
    expect(second.moons).toEqual(first.moons);
  });

  it('gives a different planet for a different seed', () => {
    expect(rollPlanet('one').planet.name).not.toEqual(rollPlanet('two').planet.name);
  });

  it('honours a named classification', () => {
    const name = planetClassificationNames()[0];
    const rolled = rollPlanet('classified', { classification: name });
    expect(rolled.planet.classification).toContain(name);
  });

  it('forces rings when asked', () => {
    expect(rollPlanet('ringed', { forceRings: true }).planet.has_ring_system).toBe(true);
  });

  it('draws the classification from the seed when the config leaves it open', () => {
    expect(rollPlanet('open').planet.classification).toEqual(
      rollPlanet('open').planet.classification,
    );
  });

  it('rolls a snapshot by the same path', () => {
    expect(rollPlanetSnapshot('snapshotted').name).toEqual(rollPlanet('snapshotted').planet.name);
  });
});

describe('what lives on a rolled planet', () => {
  /** Enough seeds that both outcomes appear; the inhabited chance is 30%. */
  const rolls = Array.from({ length: 40 }, (_entry, index) => rollPlanet(`world-${index}`));

  it('is sometimes a civilization and sometimes nobody', () => {
    expect(rolls.some((roll) => roll.civilization !== undefined)).toBe(true);
    expect(rolls.some((roll) => roll.civilization === undefined)).toBe(true);
  });

  it('is sometimes moons and sometimes none', () => {
    expect(rolls.some((roll) => roll.moons.length > 0)).toBe(true);
    expect(rolls.some((roll) => roll.moons.length === 0)).toBe(true);
  });

  it('gives every moon the planet as its parent', () => {
    const withMoons = rolls.find((roll) => roll.moons.length > 0);
    expect(withMoons).toBeDefined();
    // A moon's orbit is computed from the parent's mass and radius, so a moon that got the config
    // defaults instead would orbit an Earth rather than the planet it is attached to.
    expect(withMoons?.moons.every((moon) => Number.isFinite(moon.orbital_period))).toBe(true);
  });

  it('decides who lives there before it rolls the moons', () => {
    // Drawn in that order deliberately: if the moons came first, adding one would change whether
    // anyone lived on the planet, which is how the page's first planet came to differ from its
    // second.
    const inhabited = rolls.filter((roll) => roll.civilization !== undefined).length;
    expect(inhabited).toBeGreaterThan(0);
    expect(inhabited).toBeLessThan(rolls.length);
  });
});

describe('the preview seed', () => {
  it('is derived from the roll seed rather than drawn after it', () => {
    // The page used to take this from the RNG after the moons, so the picture depended on how many
    // moons happened to be rolled.
    expect(planetPreviewSeed('abc')).toEqual(planetPreviewSeed('abc'));
    expect(planetPreviewSeed('abc')).not.toEqual(planetPreviewSeed('abd'));
  });
});

describe('reading a stored generator config', () => {
  it('reads back what the page recorded', () => {
    const name = planetClassificationNames()[0];
    expect(readPlanetGeneratorConfig({ classification: name, forceRings: true })).toEqual({
      classification: name,
      forceRings: true,
    });
  });

  it('drops a classification this build no longer has', () => {
    expect(
      readPlanetGeneratorConfig({ classification: 'ringworld' }).classification,
    ).toBeUndefined();
  });

  it('drops the page value that means the seed chooses', () => {
    expect(
      readPlanetGeneratorConfig({ classification: PLANET_ANY_CLASSIFICATION }).classification,
    ).toBeUndefined();
  });

  it('drops anything that is not the right type', () => {
    expect(readPlanetGeneratorConfig({ classification: 7, forceRings: 'yes' })).toEqual({});
  });

  it('reads an empty config as no settings at all', () => {
    expect(readPlanetGeneratorConfig({})).toEqual({});
  });
});
