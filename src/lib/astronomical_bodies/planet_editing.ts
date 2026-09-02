/**
 * Editing a saved planet, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming one moon must not
 * disturb another, and rewriting a planet's description must not touch its mass — and it is what
 * lets the editing framework compare what is on screen against what was read to decide whether
 * anything needs saving.
 *
 * **What is editable is what the page shows** (4.1): the planet's name, description and
 * classification, its eleven measurements, whether it has an atmosphere and a ring system, each
 * moon's name, description, classification and measurements, and — where anyone lives there — the
 * civilization's name, description, population and technology level.
 *
 * **Nothing here recomputes anything.** Changing a planet's mass does not recompute its gravity,
 * even though `getGravityFromMassAndRadius` sits one import away. A referee who has set a gravity
 * has made a decision, and quietly overruling it from a formula is exactly what 4.2 forbids; the
 * generator is where the physics lives, and a re-roll is a button of its own (4.3).
 *
 * **A moon cannot be added.** A moon is a whole generated body — a classification, an orbit, a
 * mass and a description — and a blank one would be a row the export prints as nothing. A user who
 * wants another re-rolls.
 */

import type { Civilization } from '$lib/civilizations';

import type { AstronomicalBody } from './astronomical_bodies.js';
import type { PlanetSnapshot } from './planet_snapshot.js';

/** The three strings every astronomical body carries. */
export type BodyTextField = 'name' | 'description' | 'classification';

/** The measurements a user can change on a planet or a moon. */
export type BodyNumberField =
  | 'albedo'
  | 'axis_of_rotation'
  | 'gravity'
  | 'luminosity'
  | 'mass'
  | 'orbital_distance'
  | 'orbital_period'
  | 'radius'
  | 'rotation_period'
  | 'surface_pressure'
  | 'surface_temperature';

/** The two things a body either has or does not. */
export type BodyFlagField = 'has_atmosphere' | 'has_ring_system';

/** The civilization's two strings. */
export type CivilizationTextField = 'name' | 'description';

/** The civilization's two numbers. */
export type CivilizationNumberField = 'population' | 'technology_level';

function hasIndex(length: number, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((entry, position) => (position === index ? value : entry));
}

/** A number a control produced, or the value as it stands when the control produced nothing. */
function readable(value: number, current: number): number {
  return Number.isFinite(value) ? value : current;
}

export function setPlanetText(
  snapshot: PlanetSnapshot,
  field: BodyTextField,
  value: string,
): PlanetSnapshot {
  return { ...snapshot, [field]: value };
}

export function setPlanetNumber(
  snapshot: PlanetSnapshot,
  field: BodyNumberField,
  value: number,
): PlanetSnapshot {
  return { ...snapshot, [field]: readable(value, snapshot[field]) };
}

export function setPlanetFlag(
  snapshot: PlanetSnapshot,
  field: BodyFlagField,
  value: boolean,
): PlanetSnapshot {
  return { ...snapshot, [field]: value };
}

function editMoon(
  snapshot: PlanetSnapshot,
  index: number,
  change: (moon: AstronomicalBody) => AstronomicalBody,
): PlanetSnapshot {
  return hasIndex(snapshot.moons.length, index)
    ? { ...snapshot, moons: replaceAt(snapshot.moons, index, change(snapshot.moons[index])) }
    : snapshot;
}

export function setMoonText(
  snapshot: PlanetSnapshot,
  index: number,
  field: BodyTextField,
  value: string,
): PlanetSnapshot {
  return editMoon(snapshot, index, (moon) => ({ ...moon, [field]: value }));
}

export function setMoonNumber(
  snapshot: PlanetSnapshot,
  index: number,
  field: BodyNumberField,
  value: number,
): PlanetSnapshot {
  return editMoon(snapshot, index, (moon) => ({ ...moon, [field]: readable(value, moon[field]) }));
}

/** Take a moon out of the sky. The planet stays; what orbited it does not. */
export function removeMoon(snapshot: PlanetSnapshot, index: number): PlanetSnapshot {
  return hasIndex(snapshot.moons.length, index)
    ? { ...snapshot, moons: snapshot.moons.filter((_moon, position) => position !== index) }
    : snapshot;
}

/**
 * Applies a change to whoever lives here, and does nothing at all to an uninhabited planet.
 *
 * An empty world is the ordinary case rather than a fault, so this is a no-op there rather than a
 * place that invents a civilization to edit.
 */
function editCivilization(
  snapshot: PlanetSnapshot,
  change: (civilization: Civilization) => Civilization,
): PlanetSnapshot {
  return snapshot.civilization === undefined
    ? snapshot
    : { ...snapshot, civilization: change(snapshot.civilization) };
}

export function setCivilizationText(
  snapshot: PlanetSnapshot,
  field: CivilizationTextField,
  value: string,
): PlanetSnapshot {
  return editCivilization(snapshot, (civilization) => ({ ...civilization, [field]: value }));
}

export function setCivilizationNumber(
  snapshot: PlanetSnapshot,
  field: CivilizationNumberField,
  value: number,
): PlanetSnapshot {
  return editCivilization(snapshot, (civilization) => ({
    ...civilization,
    [field]: readable(value, civilization[field]),
  }));
}

/** Empty the planet of whoever lived there. The world stays; the people do not. */
export function removeCivilization(snapshot: PlanetSnapshot): PlanetSnapshot {
  const { civilization: _civilization, ...rest } = snapshot;
  return rest;
}
