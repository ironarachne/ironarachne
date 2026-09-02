/**
 * Editing a saved environment, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — rewriting one biome feature must
 * not disturb another, and renaming a season must not touch its adjustments — and it is what lets
 * the editing framework compare what is on screen against what was read to decide whether anything
 * needs saving.
 *
 * **What is editable is what the page shows** (4.1), which after this change is everything an
 * environment holds: its own description, the biome, the climate and its seasons, the terrain and
 * its geology, and the water system. The fields are grouped by the part they belong to and keyed by
 * a field union rather than written out one function per field, which is the shape
 * `settlement_editing.ts` already uses for a payload of this size — twenty-odd one-line functions
 * differing only in a key is a table pretending to be code.
 *
 * **Nothing here recomputes anything.** Raising a biome's temperature does not reclassify it, and
 * changing the terrain's slope does not re-erode it. Both would be regenerating over the user's
 * edits, which is exactly what 4.2 forbids; a user who wants the arithmetic back re-rolls, and the
 * re-roll is a button of its own (4.3).
 *
 * **Ecosystems are not editable, and that is honest rather than an omission.** `Ecosystems.generate`
 * is a documented stub returning a nameless ecosystem with no flora and no fauna, so there is
 * nothing on the page to edit — the presentation drops the section entirely. When the sub-generator
 * is written, this is where its edits go.
 */

import type { EnvironmentSnapshot } from './environment_snapshot.js';

/** The biome measurements a user can change. */
export type BiomeNumberField = 'temperature' | 'altitude' | 'humidity';

/** The biome's two lists of sentences. */
export type BiomeListField = 'descriptions' | 'features';

/** The climate's two strings. */
export type ClimateTextField = 'name' | 'description';

/** The climate measurements a user can change. */
export type ClimateNumberField =
  | 'cloudCover'
  | 'temperature'
  | 'temperatureMin'
  | 'temperatureMax'
  | 'precipitationAmount'
  | 'precipitationFrequency'
  | 'humidity';

/** What a season shifts. */
export type SeasonAdjustmentField = 'temperatureAdjustment' | 'humidityAdjustment';

/** The terrain measurements a user can change. */
export type TerrainNumberField = 'elevationMin' | 'elevationMax' | 'reliefEnergy';

/** The terrain's list of landforms, and the two lists its geology is made of. */
export type TerrainListField = 'landforms' | 'soilTypes' | 'rockTypes';

/** The water measurements a user can change. */
export type WaterNumberField = 'surfaceLevel' | 'temperature';

function hasIndex(length: number, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((entry, position) => (position === index ? value : entry));
}

function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_entry, position) => position !== index);
}

/**
 * One component of a direction vector, left alone when the component is not there.
 *
 * A vector's length is the generator's business — the climate's wind and the terrain's slope are
 * three-component, and the page offers the two that mean something across a surface — so this
 * addresses a component that exists rather than growing the vector to fit an index.
 */
function setComponent(vector: number[], index: number, value: number): number[] {
  return hasIndex(vector.length, index) && Number.isFinite(value)
    ? replaceAt(vector, index, value)
    : vector;
}

/** A number a control produced, or the value as it stands when the control produced nothing. */
function readable(value: number, current: number): number {
  return Number.isFinite(value) ? value : current;
}

export function setEnvironmentDescription(
  snapshot: EnvironmentSnapshot,
  description: string,
): EnvironmentSnapshot {
  return { ...snapshot, description };
}

export function setBiomeName(snapshot: EnvironmentSnapshot, name: string): EnvironmentSnapshot {
  return { ...snapshot, biome: { ...snapshot.biome, name } };
}

export function setBiomeNumber(
  snapshot: EnvironmentSnapshot,
  field: BiomeNumberField,
  value: number,
): EnvironmentSnapshot {
  return {
    ...snapshot,
    biome: { ...snapshot.biome, [field]: readable(value, snapshot.biome[field]) },
  };
}

export function setBiomeAquatic(
  snapshot: EnvironmentSnapshot,
  isAquatic: boolean,
): EnvironmentSnapshot {
  return { ...snapshot, biome: { ...snapshot.biome, isAquatic } };
}

export function setBiomeListEntry(
  snapshot: EnvironmentSnapshot,
  field: BiomeListField,
  index: number,
  value: string,
): EnvironmentSnapshot {
  const list = snapshot.biome[field];
  return hasIndex(list.length, index)
    ? { ...snapshot, biome: { ...snapshot.biome, [field]: replaceAt(list, index, value) } }
    : snapshot;
}

export function removeBiomeListEntry(
  snapshot: EnvironmentSnapshot,
  field: BiomeListField,
  index: number,
): EnvironmentSnapshot {
  const list = snapshot.biome[field];
  return hasIndex(list.length, index)
    ? { ...snapshot, biome: { ...snapshot.biome, [field]: removeAt(list, index) } }
    : snapshot;
}

/** Add an empty sentence for the user to write into. Not a generated one: this is not a re-roll. */
export function addBiomeListEntry(
  snapshot: EnvironmentSnapshot,
  field: BiomeListField,
): EnvironmentSnapshot {
  return { ...snapshot, biome: { ...snapshot.biome, [field]: [...snapshot.biome[field], ''] } };
}

export function setClimateText(
  snapshot: EnvironmentSnapshot,
  field: ClimateTextField,
  value: string,
): EnvironmentSnapshot {
  return { ...snapshot, climate: { ...snapshot.climate, [field]: value } };
}

export function setClimateNumber(
  snapshot: EnvironmentSnapshot,
  field: ClimateNumberField,
  value: number,
): EnvironmentSnapshot {
  return {
    ...snapshot,
    climate: { ...snapshot.climate, [field]: readable(value, snapshot.climate[field]) },
  };
}

export function setClimateWindComponent(
  snapshot: EnvironmentSnapshot,
  index: number,
  value: number,
): EnvironmentSnapshot {
  return {
    ...snapshot,
    climate: { ...snapshot.climate, wind: setComponent(snapshot.climate.wind, index, value) },
  };
}

function editSeason(
  snapshot: EnvironmentSnapshot,
  index: number,
  change: (
    season: EnvironmentSnapshot['climate']['seasons'][number],
  ) => EnvironmentSnapshot['climate']['seasons'][number],
): EnvironmentSnapshot {
  const { seasons } = snapshot.climate;
  return hasIndex(seasons.length, index)
    ? {
        ...snapshot,
        climate: {
          ...snapshot.climate,
          seasons: replaceAt(seasons, index, change(seasons[index])),
        },
      }
    : snapshot;
}

export function setSeasonName(
  snapshot: EnvironmentSnapshot,
  index: number,
  name: string,
): EnvironmentSnapshot {
  return editSeason(snapshot, index, (season) => ({ ...season, name }));
}

export function setSeasonAdjustment(
  snapshot: EnvironmentSnapshot,
  index: number,
  field: SeasonAdjustmentField,
  value: number,
): EnvironmentSnapshot {
  return editSeason(snapshot, index, (season) => ({
    ...season,
    [field]: readable(value, season[field]),
  }));
}

export function setTerrainNumber(
  snapshot: EnvironmentSnapshot,
  field: TerrainNumberField,
  value: number,
): EnvironmentSnapshot {
  return {
    ...snapshot,
    terrain: { ...snapshot.terrain, [field]: readable(value, snapshot.terrain[field]) },
  };
}

export function setTerrainSlopeComponent(
  snapshot: EnvironmentSnapshot,
  index: number,
  value: number,
): EnvironmentSnapshot {
  return {
    ...snapshot,
    terrain: {
      ...snapshot.terrain,
      normalVector: setComponent(snapshot.terrain.normalVector, index, value),
    },
  };
}

function terrainList(snapshot: EnvironmentSnapshot, field: TerrainListField): string[] {
  return field === 'landforms'
    ? snapshot.terrain.landforms
    : snapshot.terrain.geologicalMakeup[field];
}

function withTerrainList(
  snapshot: EnvironmentSnapshot,
  field: TerrainListField,
  list: string[],
): EnvironmentSnapshot {
  return field === 'landforms'
    ? { ...snapshot, terrain: { ...snapshot.terrain, landforms: list } }
    : {
        ...snapshot,
        terrain: {
          ...snapshot.terrain,
          geologicalMakeup: { ...snapshot.terrain.geologicalMakeup, [field]: list },
        },
      };
}

export function setTerrainListEntry(
  snapshot: EnvironmentSnapshot,
  field: TerrainListField,
  index: number,
  value: string,
): EnvironmentSnapshot {
  const list = terrainList(snapshot, field);
  return hasIndex(list.length, index)
    ? withTerrainList(snapshot, field, replaceAt(list, index, value))
    : snapshot;
}

export function removeTerrainListEntry(
  snapshot: EnvironmentSnapshot,
  field: TerrainListField,
  index: number,
): EnvironmentSnapshot {
  const list = terrainList(snapshot, field);
  return hasIndex(list.length, index)
    ? withTerrainList(snapshot, field, removeAt(list, index))
    : snapshot;
}

export function addTerrainListEntry(
  snapshot: EnvironmentSnapshot,
  field: TerrainListField,
): EnvironmentSnapshot {
  return withTerrainList(snapshot, field, [...terrainList(snapshot, field), '']);
}

export function setWaterType(
  snapshot: EnvironmentSnapshot,
  waterType: string,
): EnvironmentSnapshot {
  return { ...snapshot, waterSystem: { ...snapshot.waterSystem, waterType } };
}

export function setWaterNumber(
  snapshot: EnvironmentSnapshot,
  field: WaterNumberField,
  value: number,
): EnvironmentSnapshot {
  return {
    ...snapshot,
    waterSystem: {
      ...snapshot.waterSystem,
      [field]: readable(value, snapshot.waterSystem[field]),
    },
  };
}

export function setWaterCurrentComponent(
  snapshot: EnvironmentSnapshot,
  index: number,
  value: number,
): EnvironmentSnapshot {
  return {
    ...snapshot,
    waterSystem: {
      ...snapshot.waterSystem,
      current: setComponent(snapshot.waterSystem.current, index, value),
    },
  };
}
