import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';

import { generateCulture } from '$lib/culture';
import { getFantasyNameGeneratorSet } from '$lib/names';

import {
  REGION_ANY_NAME_SET,
  readRegionGeneratorConfig,
  regionNameSetNames,
  rollRegion,
  rollRegionSnapshot,
} from './region_roll';

describe('rolling a region', () => {
  it('gives the same region for the same seed (2.2)', () => {
    // The whole determinism claim, and the one the library could not make before: its default
    // config seeded both its RNG *and* its fallback name generator set from the clock.
    expect(rollRegion('repeatable').region).toEqual(rollRegion('repeatable').region);
  });

  it('gives a different region for a different seed', () => {
    expect(rollRegion('one').region.name).not.toEqual(rollRegion('two').region.name);
  });

  it('reports the name set it used, which is what provenance records', () => {
    const rolled = rollRegion('reported');
    expect(regionNameSetNames()).toContain(rolled.nameSet);
  });

  it('honours a named set', () => {
    const name = regionNameSetNames()[1];
    expect(rollRegion('named', { nameSet: name }).nameSet).toEqual(name);
  });

  it('falls back to the seed when the named set is one this build does not have', () => {
    // A re-roll that cannot happen at all is a worse answer than one from a set the user did not
    // pick, which is the position `resolveEncounterTemplates` takes for the same situation.
    const rolled = rollRegion('unknown-set', { nameSet: 'atlantean' });
    expect(regionNameSetNames()).toContain(rolled.nameSet);
  });

  it('leaves the dominant culture null when none is supplied', () => {
    // The generator used to leave `{} as Culture` here — an empty object claiming to be a Culture.
    expect(rollRegion('uncultured').region.dominantCulture).toBeNull();
  });

  it('takes its names from a supplied culture, and says so by reporting that set', () => {
    const culture = generateCulture('culture-seed', {
      nameGenerators: getFantasyNameGeneratorSet('tiefling', new RNG('culture-names')),
    });
    const rolled = rollRegion('cultured', {}, culture);
    expect(rolled.region.dominantCulture).toEqual(culture);
    expect(rolled.nameSet).toEqual(culture.nameGenerators.name);
  });

  it('rolls a snapshot by the same path', () => {
    expect(rollRegionSnapshot('snapshotted').name).toEqual(rollRegion('snapshotted').region.name);
  });

  it('produces a map, settlements and realms', () => {
    const region = rollRegion('populated').region;
    expect(region.map.nodes.length).toBeGreaterThan(0);
    expect(region.realms.length).toBeGreaterThan(0);
    expect(region.settlements.length).toBeGreaterThan(0);
  });
});

describe('the name sets on offer', () => {
  it('are the same list however the RNG is seeded', () => {
    // The page builds its select from this and the roll resolves against it; two different lists
    // would mean a control offering a set the roll could not find.
    expect(regionNameSetNames(new RNG('one'))).toEqual(regionNameSetNames(new RNG('two')));
  });
});

describe('reading a stored generator config', () => {
  it('reads back what the page recorded', () => {
    const name = regionNameSetNames()[0];
    expect(readRegionGeneratorConfig({ nameSet: name })).toEqual({ nameSet: name });
  });

  it('drops a name set this build no longer has', () => {
    expect(readRegionGeneratorConfig({ nameSet: 'atlantean' })).toEqual({});
  });

  it('drops the page value that means the seed chooses', () => {
    expect(readRegionGeneratorConfig({ nameSet: REGION_ANY_NAME_SET })).toEqual({});
  });

  it('reads an empty config as no settings at all', () => {
    expect(readRegionGeneratorConfig({})).toEqual({});
    expect(readRegionGeneratorConfig({ nameSet: 7 })).toEqual({});
  });
});
