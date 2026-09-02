/**
 * Editing a saved star system, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming one planet must not
 * disturb another, and rewriting the system's description must not touch its stars — and it is what
 * lets the editing framework compare what is on screen against what was read to decide whether
 * anything needs saving.
 *
 * **What is editable is what the page shows** (4.1): the system's name and description, and every
 * star's and planet's name, description, classification and measurements. A body can be removed
 * from either list.
 *
 * **Nothing here recomputes anything.** Changing a star's radius does not recompute its
 * temperature, and moving a planet's orbital distance does not re-sort the list — the generator
 * sorts planets by orbit, and re-sorting under a referee who has just typed would move the row they
 * were working in. Both would be regenerating over the user's edits, which is what 4.2 forbids.
 *
 * **A body cannot be added.** A star or a planet is a whole generated object — a classification,
 * eleven measurements and a description — and a blank one would be a row the export prints as
 * nothing. A user who wants another re-rolls, or composes a saved planet in at generation time.
 */

import type { AstronomicalBody } from './astronomical_bodies.js';
import type { StarSystemSnapshot } from './star_system_snapshot.js';

/** Which of a system's two lists an edit applies to. */
export type StarSystemBodyList = 'stars' | 'planets';

/** The system's own two strings. */
export type StarSystemTextField = 'name' | 'description';

/** The three strings every astronomical body carries. */
export type SystemBodyTextField = 'name' | 'description' | 'classification';

/** The measurements a user can change on a star or a planet. */
export type SystemBodyNumberField =
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

export function setStarSystemText(
  snapshot: StarSystemSnapshot,
  field: StarSystemTextField,
  value: string,
): StarSystemSnapshot {
  return { ...snapshot, [field]: value };
}

function editBody(
  snapshot: StarSystemSnapshot,
  list: StarSystemBodyList,
  index: number,
  change: (body: AstronomicalBody) => AstronomicalBody,
): StarSystemSnapshot {
  const bodies = snapshot[list];
  return hasIndex(bodies.length, index)
    ? { ...snapshot, [list]: replaceAt(bodies, index, change(bodies[index])) }
    : snapshot;
}

export function setSystemBodyText(
  snapshot: StarSystemSnapshot,
  list: StarSystemBodyList,
  index: number,
  field: SystemBodyTextField,
  value: string,
): StarSystemSnapshot {
  return editBody(snapshot, list, index, (body) => ({ ...body, [field]: value }));
}

export function setSystemBodyNumber(
  snapshot: StarSystemSnapshot,
  list: StarSystemBodyList,
  index: number,
  field: SystemBodyNumberField,
  value: number,
): StarSystemSnapshot {
  return editBody(snapshot, list, index, (body) => ({
    ...body,
    [field]: readable(value, body[field]),
  }));
}

/** Take a body out of the system. The system stays; what orbited in it does not. */
export function removeSystemBody(
  snapshot: StarSystemSnapshot,
  list: StarSystemBodyList,
  index: number,
): StarSystemSnapshot {
  const bodies = snapshot[list];
  return hasIndex(bodies.length, index)
    ? { ...snapshot, [list]: bodies.filter((_body, position) => position !== index) }
    : snapshot;
}
