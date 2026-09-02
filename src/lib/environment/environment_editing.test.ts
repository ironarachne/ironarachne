import { describe, expect, it } from 'vitest';

import {
  addBiomeListEntry,
  addTerrainListEntry,
  removeBiomeListEntry,
  removeTerrainListEntry,
  setBiomeAquatic,
  setBiomeListEntry,
  setBiomeName,
  setBiomeNumber,
  setClimateNumber,
  setClimateText,
  setClimateWindComponent,
  setEnvironmentDescription,
  setSeasonAdjustment,
  setSeasonName,
  setTerrainListEntry,
  setTerrainNumber,
  setTerrainSlopeComponent,
  setWaterCurrentComponent,
  setWaterNumber,
  setWaterType,
} from './environment_editing';
import { rollEnvironmentSnapshot } from './environment_roll';

const snapshot = rollEnvironmentSnapshot('editing-seed');

describe('the fixture these edits are made against', () => {
  it('has the lists and seasons the edits below address', () => {
    // Without this the list cases pass vacuously: replacing entry zero of an empty list changes
    // nothing, and an unchanged snapshot equals itself.
    expect(snapshot.biome.features.length).toBeGreaterThan(0);
    expect(snapshot.biome.descriptions.length).toBeGreaterThan(0);
    expect(snapshot.climate.seasons.length).toBeGreaterThan(0);
    expect(snapshot.terrain.geologicalMakeup.soilTypes.length).toBeGreaterThan(0);
  });
});

describe('editing an environment', () => {
  it('rewrites its description and nothing else', () => {
    const edited = setEnvironmentDescription(snapshot, 'A cold place under a low sky.');
    expect(edited.description).toEqual('A cold place under a low sky.');
    expect(edited.biome).toEqual(snapshot.biome);
    expect(edited.climate).toEqual(snapshot.climate);
  });

  it('leaves the original untouched', () => {
    const before = snapshot.description;
    setEnvironmentDescription(snapshot, 'somewhere else');
    expect(snapshot.description).toEqual(before);
  });
});

describe('editing the biome', () => {
  it('renames it without reclassifying anything', () => {
    // 4.2: raising a temperature must not silently pick a different biome.
    const edited = setBiomeName(snapshot, 'blasted heath');
    expect(edited.biome.name).toEqual('blasted heath');
    expect(edited.biome.temperature).toEqual(snapshot.biome.temperature);
  });

  it('sets each of its measurements', () => {
    for (const field of ['temperature', 'altitude', 'humidity'] as const) {
      expect(setBiomeNumber(snapshot, field, 0.5).biome[field]).toEqual(0.5);
    }
    expect(setBiomeNumber(snapshot, 'humidity', 0.5).biome.name).toEqual(snapshot.biome.name);
  });

  it('leaves a measurement alone when the control produced nothing', () => {
    expect(setBiomeNumber(snapshot, 'humidity', Number.NaN).biome.humidity).toEqual(
      snapshot.biome.humidity,
    );
  });

  it('says whether it is water', () => {
    expect(setBiomeAquatic(snapshot, true).biome.isAquatic).toBe(true);
    expect(setBiomeAquatic(snapshot, false).biome.isAquatic).toBe(false);
  });

  it('rewrites one sentence in a list and leaves its neighbours', () => {
    const edited = setBiomeListEntry(snapshot, 'features', 0, 'Ash drifts against the rocks.');
    expect(edited.biome.features[0]).toEqual('Ash drifts against the rocks.');
    expect(edited.biome.features.slice(1)).toEqual(snapshot.biome.features.slice(1));
    expect(edited.biome.descriptions).toEqual(snapshot.biome.descriptions);
  });

  it('removes one sentence and adds an empty one to write into', () => {
    const removed = removeBiomeListEntry(snapshot, 'descriptions', 0);
    expect(removed.biome.descriptions.length).toEqual(snapshot.biome.descriptions.length - 1);
    // Empty rather than generated: adding a line is an edit, not a re-roll.
    const added = addBiomeListEntry(snapshot, 'descriptions');
    expect(added.biome.descriptions.at(-1)).toEqual('');
  });

  it('ignores an index that is not there', () => {
    expect(setBiomeListEntry(snapshot, 'features', 999, 'nowhere')).toEqual(snapshot);
    expect(removeBiomeListEntry(snapshot, 'features', -1)).toEqual(snapshot);
  });
});

describe('editing the climate', () => {
  it('rewrites its name and its paragraph', () => {
    const named = setClimateText(snapshot, 'name', 'perpetual dusk');
    expect(setClimateText(named, 'description', 'It never warms.').climate).toMatchObject({
      name: 'perpetual dusk',
      description: 'It never warms.',
    });
  });

  it('sets each of its measurements', () => {
    for (const field of [
      'cloudCover',
      'temperature',
      'temperatureMin',
      'temperatureMax',
      'precipitationAmount',
      'precipitationFrequency',
      'humidity',
    ] as const) {
      expect(setClimateNumber(snapshot, field, 0.25).climate[field]).toEqual(0.25);
    }
  });

  it('sets one component of the wind and leaves the others', () => {
    const edited = setClimateWindComponent(snapshot, 0, 1.5);
    expect(edited.climate.wind[0]).toEqual(1.5);
    expect(edited.climate.wind.slice(1)).toEqual(snapshot.climate.wind.slice(1));
  });

  it('leaves a vector alone for a component it does not have', () => {
    expect(setClimateWindComponent(snapshot, 9, 1).climate.wind).toEqual(snapshot.climate.wind);
  });

  it('renames one season without touching what it adjusts', () => {
    const edited = setSeasonName(snapshot, 0, 'the long thaw');
    expect(edited.climate.seasons[0].name).toEqual('the long thaw');
    expect(edited.climate.seasons[0].temperatureAdjustment).toEqual(
      snapshot.climate.seasons[0].temperatureAdjustment,
    );
    expect(edited.climate.seasons.slice(1)).toEqual(snapshot.climate.seasons.slice(1));
  });

  it('sets what a season adjusts', () => {
    expect(
      setSeasonAdjustment(snapshot, 0, 'temperatureAdjustment', -12).climate.seasons[0]
        .temperatureAdjustment,
    ).toEqual(-12);
    expect(
      setSeasonAdjustment(snapshot, 0, 'humidityAdjustment', 0.3).climate.seasons[0]
        .humidityAdjustment,
    ).toEqual(0.3);
  });

  it('ignores a season that is not there', () => {
    expect(setSeasonName(snapshot, 99, 'nowhere')).toEqual(snapshot);
    expect(setSeasonAdjustment(snapshot, 99, 'humidityAdjustment', 1)).toEqual(snapshot);
  });
});

describe('editing the terrain', () => {
  it('sets each of its measurements without re-eroding anything', () => {
    for (const field of ['elevationMin', 'elevationMax', 'reliefEnergy'] as const) {
      expect(setTerrainNumber(snapshot, field, 0.4).terrain[field]).toEqual(0.4);
    }
    expect(setTerrainNumber(snapshot, 'reliefEnergy', 0.4).terrain.landforms).toEqual(
      snapshot.terrain.landforms,
    );
  });

  it('sets one component of the slope', () => {
    expect(setTerrainSlopeComponent(snapshot, 1, -0.3).terrain.normalVector[1]).toEqual(-0.3);
  });

  it('rewrites a landform and each of the two geology lists', () => {
    expect(
      setTerrainListEntry(snapshot, 'soilTypes', 0, 'black loam').terrain.geologicalMakeup
        .soilTypes[0],
    ).toEqual('black loam');
    const withLandform = addTerrainListEntry(snapshot, 'landforms');
    expect(
      setTerrainListEntry(
        withLandform,
        'landforms',
        withLandform.terrain.landforms.length - 1,
        'esker',
      ).terrain.landforms.at(-1),
    ).toEqual('esker');
  });

  it('removes one entry from a geology list and leaves the other list alone', () => {
    const edited = removeTerrainListEntry(snapshot, 'soilTypes', 0);
    expect(edited.terrain.geologicalMakeup.soilTypes.length).toEqual(
      snapshot.terrain.geologicalMakeup.soilTypes.length - 1,
    );
    expect(edited.terrain.geologicalMakeup.rockTypes).toEqual(
      snapshot.terrain.geologicalMakeup.rockTypes,
    );
  });

  it('ignores an index that is not there', () => {
    expect(setTerrainListEntry(snapshot, 'rockTypes', 999, 'nowhere')).toEqual(snapshot);
    expect(removeTerrainListEntry(snapshot, 'landforms', 999)).toEqual(snapshot);
  });
});

describe('editing the water system', () => {
  it('sets the water type and its measurements', () => {
    expect(setWaterType(snapshot, 'brackish').waterSystem.waterType).toEqual('brackish');
    for (const field of ['surfaceLevel', 'temperature'] as const) {
      expect(setWaterNumber(snapshot, field, 3).waterSystem[field]).toEqual(3);
    }
  });

  it('sets one component of the current', () => {
    const edited = setWaterCurrentComponent(snapshot, 0, 0.8);
    expect(edited.waterSystem.current[0]).toEqual(0.8);
    expect(edited.waterSystem.current.slice(1)).toEqual(snapshot.waterSystem.current.slice(1));
  });
});
