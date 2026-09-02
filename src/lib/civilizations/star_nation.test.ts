import { describe, expect, it } from 'vitest';

import { homePlanetOf, homePlanetRegionOf, homeSystemRegionOf } from './star_nation';
import { rollStarNation } from './star_nation_roll';

const nation = rollStarNation('helpers-fixture', { planetCount: 2 });

describe('the star nation region helpers', () => {
  it('find each region by its type, whatever the order', () => {
    const reversed = { ...nation, regionsOfControl: [...nation.regionsOfControl].reverse() };

    expect(homeSystemRegionOf(reversed)?.region_type.name).toBe('Star System');
    expect(homePlanetRegionOf(reversed)?.region_type.name).toBe('Planet');
  });

  it('answer undefined when a region is missing', () => {
    expect(homeSystemRegionOf({ regionsOfControl: [] })).toBeUndefined();
    expect(homePlanetRegionOf({ regionsOfControl: [] })).toBeUndefined();
  });

  it('find the homeworld by index, or nothing outside the system', () => {
    expect(homePlanetOf(nation)).toBe(nation.homeSystem.planets[nation.homePlanetIndex]);
    expect(homePlanetOf({ ...nation, homePlanetIndex: 7 })).toBeUndefined();
  });
});
