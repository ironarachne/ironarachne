/**
 * Editing a saved arms manufacturer, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming one model must not
 * disturb another, and renaming the company must not touch its catalogue — and it is what lets the
 * editing framework compare what is on screen against what was read to decide whether anything
 * needs saving.
 *
 * **Every text field is the user's.** The description was assembled at generation time from a
 * specialty, an outlook and a reputation drawn from three lists, and a model's description from a
 * base, its effects and its cosmetics; none of that is a table row the prose could be re-derived
 * from, so nothing here recomputes anything. Renaming the company deliberately does not rewrite
 * the description that opens with its old name: the two are separate decisions, and a form that
 * silently rewrote a user's prose would overrule them. The destructive command is a re-roll from
 * provenance, which is `arms_manufacturer_roll.ts` and a button of its own (4.3).
 *
 * A model's `cosmetics` and `effects` are the parts its description was assembled from. They are
 * stored, because the snapshot is the value, but they are not shown on the page and so have no
 * control here (4.1 covers what the user sees). Removing a model removes them with it.
 */

import type { Weapon } from '$lib/weapons';

import type { ArmsManufacturerSnapshot } from './arms_manufacturer_snapshot.js';

/** The parts of the manufacturer itself the page prints as text. */
export type ArmsManufacturerTextField = 'name' | 'description';

/** The parts of a model the page prints, plus the damage type the model carries. */
export type ArmsManufacturerModelTextField = 'name' | 'damage' | 'description';

function hasIndex(length: number, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((entry, position) => (position === index ? value : entry));
}

function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_entry, position) => position !== index);
}

export function setArmsManufacturerText(
  snapshot: ArmsManufacturerSnapshot,
  field: ArmsManufacturerTextField,
  value: string,
): ArmsManufacturerSnapshot {
  return { ...snapshot, [field]: value };
}

export function setArmsManufacturerModelText(
  snapshot: ArmsManufacturerSnapshot,
  index: number,
  field: ArmsManufacturerModelTextField,
  value: string,
): ArmsManufacturerSnapshot {
  return hasIndex(snapshot.models.length, index)
    ? {
        ...snapshot,
        models: replaceAt(snapshot.models, index, { ...snapshot.models[index], [field]: value }),
      }
    : snapshot;
}

/**
 * A blank model, made by this manufacturer.
 *
 * Blank rather than drawn from the weapon tables: the tool rolls a catalogue, so adding a model by
 * hand is a user saying "and this one too" about something they have in mind. The maker is the
 * company, because that is the one field a new row can be filled in truthfully; the generator
 * itself leaves `maker` empty, and nothing here rewrites the rolled ones.
 */
export function addArmsManufacturerModel(
  snapshot: ArmsManufacturerSnapshot,
): ArmsManufacturerSnapshot {
  const model: Weapon = {
    name: '',
    maker: snapshot.name,
    damage: '',
    cosmetics: [],
    effects: [],
    description: '',
  };
  return { ...snapshot, models: [...snapshot.models, model] };
}

export function removeArmsManufacturerModel(
  snapshot: ArmsManufacturerSnapshot,
  index: number,
): ArmsManufacturerSnapshot {
  return hasIndex(snapshot.models.length, index)
    ? { ...snapshot, models: removeAt(snapshot.models, index) }
    : snapshot;
}
