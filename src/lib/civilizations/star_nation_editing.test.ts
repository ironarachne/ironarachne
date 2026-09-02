import { describe, expect, it } from 'vitest';

import { getCivilizationDescription } from './civilizations';
import { homePlanetRegionOf, homeSystemRegionOf } from './star_nation';
import {
  restoreStarNationDescription,
  setStarNationEconomyType,
  setStarNationGovernmentType,
  setStarNationHomePlanet,
  setStarNationHomeSystemName,
  setStarNationMilitaryQuality,
  setStarNationNumber,
  setStarNationPlanetName,
  setStarNationRegionPopulation,
  setStarNationText,
} from './star_nation_editing';
import { rollStarNationSnapshot } from './star_nation_roll';
import { civilizationFromStarNationSnapshot } from './star_nation_snapshot';

const snapshot = rollStarNationSnapshot('editing-fixture', { planetCount: 3 });

describe('editing a star nation', () => {
  it('sets a text field and leaves the rest alone', () => {
    const edited = setStarNationText(snapshot, 'name', 'Kingdom of Vesh');

    expect(edited.name).toBe('Kingdom of Vesh');
    expect(edited.description).toBe(snapshot.description);
    expect(edited.homeSystem).toBe(snapshot.homeSystem);
    expect(snapshot.name).not.toBe('Kingdom of Vesh');
  });

  it('sets a figure without touching the description', () => {
    const edited = setStarNationNumber(snapshot, 'population', 12);

    expect(edited.population).toBe(12);
    expect(edited.description).toBe(snapshot.description);
  });

  it('clamps the technology level to the table', () => {
    expect(setStarNationNumber(snapshot, 'technologyLevel', 40).technologyLevel).toBe(10);
    expect(setStarNationNumber(snapshot, 'technologyLevel', -3).technologyLevel).toBe(0);
    expect(setStarNationNumber(snapshot, 'technologyLevel', 8.4).technologyLevel).toBe(8);
  });

  it('holds the counts to whole numbers with a floor', () => {
    expect(
      setStarNationNumber(snapshot, 'homeSystemPopulatedPlanets', -2).homeSystemPopulatedPlanets,
    ).toBe(0);
    expect(setStarNationNumber(snapshot, 'populatedPlanets', 2.5).populatedPlanets).toBe(3);
    expect(setStarNationNumber(snapshot, 'systemsControlled', 0).systemsControlled).toBe(1);
    expect(setStarNationRegionPopulation(snapshot, 0, -5).regionsOfControl[0].population).toBe(0);
  });

  it('ignores a figure that is not a number, as a cleared input reports', () => {
    expect(setStarNationNumber(snapshot, 'population', Number.NaN)).toBe(snapshot);
    expect(setStarNationMilitaryQuality(snapshot, Number.NaN)).toBe(snapshot);
    expect(setStarNationRegionPopulation(snapshot, 0, Number.NaN)).toBe(snapshot);
  });

  it('clamps the military quality to the table', () => {
    expect(setStarNationMilitaryQuality(snapshot, 0).military.quality).toBe(1);
    expect(setStarNationMilitaryQuality(snapshot, 99).military.quality).toBe(10);
    expect(setStarNationMilitaryQuality(snapshot, 4).military.size).toBe(snapshot.military.size);
  });

  it('sets the government and the economy from the tables by name', () => {
    const edited = setStarNationEconomyType(
      setStarNationGovernmentType(snapshot, 'Theocracy'),
      'Barter',
    );

    expect(edited.governmentType.name).toBe('Theocracy');
    expect(edited.governmentType.adjective).toBe('theocratic');
    expect(edited.economyType.name).toBe('Barter');
    expect(edited.economyType.adjective).toBe('barter');
  });

  it('leaves a row the tables lack unchanged', () => {
    expect(setStarNationGovernmentType(snapshot, 'Hive Mind')).toBe(snapshot);
    expect(setStarNationEconomyType(snapshot, 'Post-scarcity')).toBe(snapshot);
  });

  it('moves the homeworld and renames the planet region with it', () => {
    const index = (snapshot.homePlanetIndex + 1) % snapshot.homeSystem.planets.length;
    const edited = setStarNationHomePlanet(snapshot, index);

    expect(edited.homePlanetIndex).toBe(index);
    expect(homePlanetRegionOf(edited)?.name).toBe(snapshot.homeSystem.planets[index].name);
    expect(homeSystemRegionOf(edited)?.name).toBe(homeSystemRegionOf(snapshot)?.name);
  });

  it('leaves a homeworld outside the system unchanged', () => {
    expect(setStarNationHomePlanet(snapshot, 3)).toBe(snapshot);
    expect(setStarNationHomePlanet(snapshot, -1)).toBe(snapshot);
    expect(setStarNationHomePlanet(snapshot, 0.5)).toBe(snapshot);
  });

  it('renames the home system and the region that stands for it', () => {
    const edited = setStarNationHomeSystemName(snapshot, 'Tau Ceti');

    expect(edited.homeSystem.name).toBe('Tau Ceti');
    expect(homeSystemRegionOf(edited)?.name).toBe('Tau Ceti');
    expect(homePlanetRegionOf(edited)?.name).toBe(homePlanetRegionOf(snapshot)?.name);
  });

  it('renames a planet, and the planet region only when it is the homeworld', () => {
    const home = snapshot.homePlanetIndex;
    const other = (home + 1) % snapshot.homeSystem.planets.length;

    const renamedHome = setStarNationPlanetName(snapshot, home, 'Vesh Prime');
    expect(renamedHome.homeSystem.planets[home].name).toBe('Vesh Prime');
    expect(homePlanetRegionOf(renamedHome)?.name).toBe('Vesh Prime');

    const renamedOther = setStarNationPlanetName(snapshot, other, 'Vesh Minor');
    expect(renamedOther.homeSystem.planets[other].name).toBe('Vesh Minor');
    expect(homePlanetRegionOf(renamedOther)?.name).toBe(homePlanetRegionOf(snapshot)?.name);

    expect(setStarNationPlanetName(snapshot, 9, 'Nowhere')).toBe(snapshot);
  });

  it('sets one region’s population and leaves the other', () => {
    const edited = setStarNationRegionPopulation(snapshot, 1, 500);

    expect(edited.regionsOfControl[1].population).toBe(500);
    expect(edited.regionsOfControl[0]).toBe(snapshot.regionsOfControl[0]);
    expect(setStarNationRegionPopulation(snapshot, 5, 500)).toBe(snapshot);
  });

  it('rebuilds the description from the figures only on request', () => {
    const changed = setStarNationText(
      setStarNationGovernmentType(snapshot, 'Theocracy'),
      'description',
      'Their own words.',
    );
    expect(changed.description).toBe('Their own words.');

    const restored = restoreStarNationDescription(changed);
    expect(restored.description).toBe(
      getCivilizationDescription(civilizationFromStarNationSnapshot(changed)),
    );
    expect(restored.description).toContain('theocratic');
  });
});
