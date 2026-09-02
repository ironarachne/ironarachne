import { describe, expect, it } from 'vitest';

import {
  STAR_SYSTEM_MAX_PLANET_COUNT,
  readStarSystemGeneratorConfig,
  rollStarSystem,
  rollStarSystemSnapshot,
  starSystemPreviewSeed,
  starTypeNames,
  withReferencedPlanet,
} from './star_system_roll';

describe('rolling a star system', () => {
  it('gives the same system for the same seed and settings (2.2)', () => {
    expect(rollStarSystem('repeatable')).toEqual(rollStarSystem('repeatable'));
  });

  it('gives a different system for a different seed', () => {
    expect(rollStarSystem('one').name).not.toEqual(rollStarSystem('two').name);
  });

  it('honours a planet count', () => {
    const system = rollStarSystem('counted', { planetCount: 6 });
    expect(system.planets).toHaveLength(6);
    expect(system.planet_count).toEqual(6);
  });

  it('honours a star type', () => {
    const type = starTypeNames()[0];
    const system = rollStarSystem('typed', { starType: type });
    expect(system.stars[0].classification).toContain(type);
  });

  it('draws the planet count from the seed when the config leaves it open', () => {
    expect(rollStarSystem('open').planets.length).toEqual(rollStarSystem('open').planets.length);
  });

  it('sorts planets outward from the star', () => {
    const planets = rollStarSystem('sorted', { planetCount: 8 }).planets;
    const distances = planets.map((planet) => planet.orbital_distance);
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it('rolls a snapshot by the same path', () => {
    expect(rollStarSystemSnapshot('snapshotted').name).toEqual(rollStarSystem('snapshotted').name);
  });
});

describe('the preview seeds', () => {
  it('are derived from the roll seed and the body, not drawn as the previews are built', () => {
    // They used to be drawn as the rebuild ran, so changing the renderer redrew every body rather
    // than redrawing it differently, and the seed did not reproduce the previews.
    expect(starSystemPreviewSeed('abc', 'star0')).toEqual(starSystemPreviewSeed('abc', 'star0'));
    expect(starSystemPreviewSeed('abc', 'star0')).not.toEqual(
      starSystemPreviewSeed('abc', 'star1'),
    );
    expect(starSystemPreviewSeed('abc', 'star0')).not.toEqual(
      starSystemPreviewSeed('abd', 'star0'),
    );
  });
});

describe('composing a system with a saved planet (5.1)', () => {
  const system = rollStarSystem('composed', { planetCount: 5 });
  const saved = rollStarSystem('elsewhere', { planetCount: 1 }).planets[0];

  it('puts it in the system in place of one it rolled', () => {
    const composed = withReferencedPlanet(system, saved);
    expect(composed.planets).toHaveLength(system.planets.length);
    expect(composed.planets.map((planet) => planet.name)).toContain(saved.name);
  });

  it('keeps the planets sorted by orbit, so it sits where its own orbit puts it', () => {
    const distances = withReferencedPlanet(system, saved).planets.map(
      (planet) => planet.orbital_distance,
    );
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it('does not rename it to match its new neighbours', () => {
    // It is somebody's saved planet. Renaming it would be this tool editing another artifact.
    const composed = withReferencedPlanet(system, saved);
    expect(composed.planets.find((planet) => planet.name === saved.name)).toEqual(saved);
  });

  it('keeps the count honest', () => {
    expect(withReferencedPlanet(system, saved).planet_count).toEqual(system.planets.length);
  });

  it('gives a system with no planets the reference as its only one', () => {
    const empty = { ...system, planets: [], planet_count: 0 };
    const composed = withReferencedPlanet(empty, saved);
    expect(composed.planets).toEqual([saved]);
    expect(composed.planet_count).toEqual(1);
  });
});

describe('reading a stored generator config', () => {
  it('reads back what the page recorded', () => {
    const type = starTypeNames()[0];
    expect(readStarSystemGeneratorConfig({ planetCount: 7, starType: type })).toEqual({
      planetCount: 7,
      starType: type,
    });
  });

  it('drops a planet count outside what the page offers', () => {
    expect(readStarSystemGeneratorConfig({ planetCount: 0 }).planetCount).toBeUndefined();
    expect(
      readStarSystemGeneratorConfig({ planetCount: STAR_SYSTEM_MAX_PLANET_COUNT + 1 }).planetCount,
    ).toBeUndefined();
    expect(readStarSystemGeneratorConfig({ planetCount: 3.5 }).planetCount).toBeUndefined();
  });

  it('drops a star type this build no longer has', () => {
    expect(readStarSystemGeneratorConfig({ starType: 'hypergiant' }).starType).toBeUndefined();
  });

  it('reads an empty config as no settings at all', () => {
    expect(readStarSystemGeneratorConfig({})).toEqual({});
  });
});
