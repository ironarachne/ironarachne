import { describe, expect, it } from 'vitest';

import { rollStarNation } from './star_nation_roll';
import {
  civilizationFromStarNationSnapshot,
  starNationFromSnapshot,
  toStarNationSnapshot,
} from './star_nation_snapshot';

const nation = rollStarNation('snapshot-fixture', { planetCount: 4 });

describe('the star nation snapshot', () => {
  /** Requirement 7.2: lossless for everything the page shows. */
  it('round-trips a rolled nation', () => {
    expect(starNationFromSnapshot(toStarNationSnapshot(nation))).toEqual(nation);
  });

  it('flattens the civilization into the stored record', () => {
    const snapshot = toStarNationSnapshot(nation);

    expect(snapshot.name).toBe(nation.civilization.name);
    expect(snapshot.technologyLevel).toBe(nation.civilization.technology_level);
    expect(snapshot.governmentType).toEqual(nation.civilization.government_type);
    expect(civilizationFromStarNationSnapshot(snapshot)).toEqual(nation.civilization);
  });

  it('round-trips a nation with no regions, which is an ordinary state', () => {
    const bare = { ...nation, regionsOfControl: [] };

    expect(starNationFromSnapshot(toStarNationSnapshot(bare))).toEqual(bare);
  });

  it('keeps a description a user has changed rather than recomputing it', () => {
    const edited = toStarNationSnapshot(nation);
    edited.description = 'They are mostly harmless.';

    expect(starNationFromSnapshot(edited).civilization.description).toBe(
      'They are mostly harmless.',
    );
  });

  it('is free of the functions IndexedDB refuses', () => {
    expect(() => structuredClone(toStarNationSnapshot(nation))).not.toThrow();
  });

  it('does not hand out the objects it was given', () => {
    const snapshot = toStarNationSnapshot(nation);
    snapshot.homeSystem.planets[0].name = 'Something else entirely';
    snapshot.regionsOfControl[0].population = 1;
    snapshot.governmentType.name_options.push('{name} Hegemony');
    snapshot.homeSystem.planets.pop();

    expect(nation.homeSystem.planets[0].name).not.toBe('Something else entirely');
    expect(nation.regionsOfControl[0].population).not.toBe(1);
    expect(nation.civilization.government_type.name_options).not.toContain('{name} Hegemony');
    expect(nation.homeSystem.planets.length).toBe(snapshot.homeSystem.planets.length + 1);
  });

  it('does not hand a restored value the snapshot’s own objects', () => {
    const snapshot = toStarNationSnapshot(nation);
    const restored = starNationFromSnapshot(snapshot);
    restored.homeSystem.stars[0].name = 'Sol';
    restored.regionsOfControl[1].region_type.name = 'Moon';

    expect(snapshot.homeSystem.stars[0].name).not.toBe('Sol');
    expect(snapshot.regionsOfControl[1].region_type.name).not.toBe('Moon');
  });
});
