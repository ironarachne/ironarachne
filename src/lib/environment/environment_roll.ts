/**
 * The single path from a seed to an environment, and the record of how it was rolled.
 *
 * `EnvironmentGenerator.svelte` was closer to requirement 2.2 than most of the pass: it held one
 * `RNG`, reseeded it from the seed box on every press, and `Environments.generate` is a pure
 * function of the config it is handed. What it lacked was a record — eleven number fields sat in a
 * `$state` config that nothing wrote down, so a saved environment could not say what latitude or
 * relief energy produced it, and "the same seed" reproduced a different place under different
 * settings. This module is that record and the roll it feeds.
 *
 * The eleven fields are the page's, and nothing else. The four sub-configs are not among them:
 * `generate` overwrites every field of them it uses from the top-level settings, so recording them
 * would be recording values that are discarded before they are read.
 */

import { RNG } from '@ironarachne/rng';

import type Environment from './environment.js';
import { generate, getDefaultConfig } from './environments.js';
import { toEnvironmentSnapshot, type EnvironmentSnapshot } from './environment_snapshot.js';

/** The page's defaults, which are the library's defaults, named once so both can read them. */
export const ENVIRONMENT_DEFAULT_LATITUDE = 35;
export const ENVIRONMENT_DEFAULT_ELEVATION = 0.35;
export const ENVIRONMENT_DEFAULT_EROSION_ITERATIONS = 3;
export const ENVIRONMENT_DEFAULT_EROSION_STRENGTH = 2;
export const ENVIRONMENT_DEFAULT_RELIEF_ENERGY = 0.05;

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. The three vectors are stored as
 * `[x, y]`: the generator's are three-component, but the third is always zero because these are
 * directions across a surface, and recording a component no control can set would be recording the
 * shape of a type rather than a decision.
 */
export type EnvironmentGeneratorConfigRecord = {
  latitude: number;
  elevation: number;
  erosionIterations: number;
  erosionStrength: number;
  reliefEnergy: number;
  terrainVector: number[];
  current: number[];
  waterDirection: number[];
};

/** The settings a roll starts from with nothing recorded: the library's own defaults. */
export function defaultEnvironmentGeneratorConfig(): EnvironmentGeneratorConfigRecord {
  return {
    latitude: ENVIRONMENT_DEFAULT_LATITUDE,
    elevation: ENVIRONMENT_DEFAULT_ELEVATION,
    erosionIterations: ENVIRONMENT_DEFAULT_EROSION_ITERATIONS,
    erosionStrength: ENVIRONMENT_DEFAULT_EROSION_STRENGTH,
    reliefEnergy: ENVIRONMENT_DEFAULT_RELIEF_ENERGY,
    terrainVector: [0, 0],
    current: [0, 0],
    waterDirection: [0, 0],
  };
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * A stored two-component vector, or the default.
 *
 * A vector of the wrong length is dropped rather than padded: a config that recorded one number
 * where two were meant is a config this build cannot read, and guessing the missing component
 * would roll an environment sloping in a direction nobody chose.
 */
function readVector(value: unknown, fallback: number[]): number[] {
  if (!Array.isArray(value) || value.length < 2) {
    return [...fallback];
  }
  const [x, y] = value;
  return typeof x === 'number' && Number.isFinite(x) && typeof y === 'number' && Number.isFinite(y)
    ? [x, y]
    : [...fallback];
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Anything unrecognisable falls back to the library's default for that field rather than being
 * coerced: a config written by a build that spelled these differently should roll the default
 * environment, not one built from a field it misread.
 */
export function readEnvironmentGeneratorConfig(
  config: Record<string, unknown>,
): EnvironmentGeneratorConfigRecord {
  const defaults = defaultEnvironmentGeneratorConfig();
  return {
    latitude: readNumber(config.latitude, defaults.latitude),
    elevation: readNumber(config.elevation, defaults.elevation),
    erosionIterations: readNumber(config.erosionIterations, defaults.erosionIterations),
    erosionStrength: readNumber(config.erosionStrength, defaults.erosionStrength),
    reliefEnergy: readNumber(config.reliefEnergy, defaults.reliefEnergy),
    terrainVector: readVector(config.terrainVector, defaults.terrainVector),
    current: readVector(config.current, defaults.current),
    waterDirection: readVector(config.waterDirection, defaults.waterDirection),
  };
}

/** A recorded `[x, y]` as the three-component vector the generator works in. */
function toGeneratorVector(vector: number[]): number[] {
  return [vector[0], vector[1], 0];
}

/**
 * Roll an environment from a seed and a set of settings — the one path the page and a re-roll take.
 *
 * A fresh config is built per call rather than shared, because `generate` writes the settings it
 * derives back into the config it is handed: reusing one would make the second roll from the same
 * seed differ from the first.
 */
export function rollEnvironment(
  seed: string,
  config: EnvironmentGeneratorConfigRecord = defaultEnvironmentGeneratorConfig(),
): Environment {
  const generatorConfig = getDefaultConfig(new RNG(seed));
  generatorConfig.latitude = config.latitude;
  generatorConfig.elevation = config.elevation;
  generatorConfig.erosionIterations = config.erosionIterations;
  generatorConfig.erosionStrength = config.erosionStrength;
  generatorConfig.reliefEnergy = config.reliefEnergy;
  generatorConfig.terrainVector = toGeneratorVector(config.terrainVector);
  generatorConfig.current = toGeneratorVector(config.current);
  generatorConfig.waterDirection = toGeneratorVector(config.waterDirection);

  return generate(generatorConfig);
}

/**
 * The settings the page's "Randomize Parameters" button produces, as a function of a seed.
 *
 * Drawn from a stream of its own so that randomizing the parameters and rolling the environment do
 * not move each other: the page presses these two buttons independently, and a shared stream would
 * make what Generate produced depend on how many times Randomize had been pressed. The ranges are
 * the ones the button has always used.
 */
export function randomEnvironmentGeneratorConfig(seed: string): EnvironmentGeneratorConfigRecord {
  const rng = new RNG(`${seed}-parameters`);
  return {
    ...defaultEnvironmentGeneratorConfig(),
    latitude: rng.float(-70, 70),
    elevation: rng.float(0.1, 0.8),
    waterDirection: [rng.float(-20, 20), rng.float(-20, 20)],
    current: [rng.float(-1, 1), rng.float(-1, 1)],
    terrainVector: [rng.float(-0.5, 0.5), rng.float(-0.5, 0.5)],
  };
}

/**
 * Roll a fresh environment as a snapshot — the destructive half of editing (requirement 4.3), and
 * what `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollEnvironmentSnapshot(
  seed: string,
  config: EnvironmentGeneratorConfigRecord = defaultEnvironmentGeneratorConfig(),
): EnvironmentSnapshot {
  return toEnvironmentSnapshot(rollEnvironment(seed, config));
}
