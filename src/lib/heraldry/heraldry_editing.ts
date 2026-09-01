/**
 * Editing a stored coat of arms, one part at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — changing the field's tincture
 * must leave the charges alone, and adding a charge group must not disturb the field — and it is
 * what lets the editing framework compare what is on screen against what was read to decide
 * whether anything needs saving.
 *
 * `StoredDevice` was already the right vocabulary for this: a field by name, variations by name
 * with their tinctures by name, and charge groups by name. So the editor is a form over names, and
 * these functions are what a control calls.
 *
 * **The blazon is derived, never edited.** It is recomputed from the device after every change,
 * because a stored blazon that no longer describes the device is worse than no blazon at all. That
 * is the one thing heraldry needs here that culture's editing module did not, and it is why this
 * module reaches `heraldry_rehydrate.ts` — and through it the charge art. The editor has already
 * paid for that: drawing a stored device is what resolves charge names to glyphs.
 *
 * **Nothing re-rolls.** A change to one part is a change to that part; the destructive command is
 * a re-roll from provenance, which is `heraldry_roll.ts` and a button of its own (4.3).
 */

import * as Arrangements from './charge_group_arrangements/index.js';
import { getAllCharges } from './charge_data.js';
import { renderDeviceBlazon } from './device.js';
import * as Fields from './fields.js';
import { deviceFromStored } from './heraldry_rehydrate.js';
import type {
  HeraldrySnapshot,
  StoredChargeGroup,
  StoredDevice,
  StoredVariation,
} from './heraldry_snapshot.js';
import * as Tinctures from './tinctures.js';
import * as Variations from './variations.js';

/** What a variation slot falls back to when a change gives it a tincture it did not have. */
const FALLBACK_TINCTURE = 'argent' as const;

/** The position values the generator offers, and the only two the blazon knows how to say. */
export const HERALDRY_CHARGE_POSITIONS = ['normal', 'in chief'] as const;

export type HeraldryChargePosition = (typeof HERALDRY_CHARGE_POSITIONS)[number];

/** Every field division, by name, for a select. */
export function heraldryFieldNames(): string[] {
  return Fields.all().map((field) => field.name);
}

/** Every variation, by name. */
export function heraldryVariationNames(): string[] {
  return Variations.all().map((variation) => variation.name);
}

/** Every tincture, by name. Furs included: what a variation admits is a separate question. */
export function heraldryTinctureNames(): string[] {
  return Tinctures.all().map((tincture) => tincture.name);
}

/**
 * Every charge this build has, by name, in alphabetical order.
 *
 * Sorted here rather than in the component because it is a list of a thousand-odd names and the
 * order is a property of the list, not of one editor's markup.
 */
export function heraldryChargeNames(): string[] {
  return getAllCharges()
    .map((charge) => charge.name)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * The arrangements that can hold a given number of charges.
 *
 * A charge group's arrangement and its count are one decision in two fields — "three, two and one"
 * is not a way to arrange two charges — so an editor offers only the arrangements that fit, and
 * {@link setHeraldryChargeCount} repairs the pairing when the count changes.
 */
export function heraldryArrangementNamesForCount(numberOfCharges: number): string[] {
  return Arrangements.getAllChargeArrangements()
    .filter((arrangement) => arrangement.numberOfCharges === numberOfCharges)
    .map((arrangement) => arrangement.name);
}

/**
 * The blazon a stored device describes, or `undefined` when this build cannot read it.
 *
 * Undefined rather than a throw and rather than an empty string: a charge or a variation that has
 * been renamed since the arms were saved is a thing to leave the previous blazon standing for, not
 * to blank the description over.
 */
export function storedDeviceBlazon(device: StoredDevice): string | undefined {
  try {
    return renderDeviceBlazon(deviceFromStored(device));
  } catch {
    return undefined;
  }
}

/** A snapshot carrying a device, with the blazon rederived — or the old one kept if it cannot be. */
function withDevice(snapshot: HeraldrySnapshot, device: StoredDevice): HeraldrySnapshot {
  return { ...snapshot, device, blazon: storedDeviceBlazon(device) ?? snapshot.blazon };
}

/** A variation's tincture list, grown or trimmed to the count the variation actually takes. */
function fitTinctures(tinctureNames: string[], count: number): string[] {
  const fitted = tinctureNames.slice(0, count);
  while (fitted.length < count) {
    fitted.push(fitted[0] ?? tinctureNames[0] ?? FALLBACK_TINCTURE);
  }
  return fitted;
}

function fitVariation(variation: StoredVariation): StoredVariation {
  const count = Variations.byName(variation.variationName).tinctureCount;
  return { ...variation, tinctureNames: fitTinctures(variation.tinctureNames, count) };
}

/**
 * The variations a field division needs, from the ones it has.
 *
 * A field carries a fixed number of variations — one for plain, two for most divisions, three for
 * a pall — so changing the division changes how many there are. The ones already there are kept in
 * order, and any that is missing is a plain variation in the tincture of the one before it: a
 * newly divided field then reads as two halves of the same colour rather than as a black hole
 * where the second half should be.
 */
function fitVariations(variations: StoredVariation[], count: number): StoredVariation[] {
  const fitted = variations.slice(0, count).map(fitVariation);
  while (fitted.length < count) {
    const previous = fitted[fitted.length - 1];
    fitted.push(
      fitVariation({
        variationName: 'plain',
        tinctureNames: [previous?.tinctureNames[0] ?? FALLBACK_TINCTURE],
      }),
    );
  }
  return fitted;
}

/** The field division. The variation slots follow it, because a field decides how many it has. */
export function setHeraldryFieldName(
  snapshot: HeraldrySnapshot,
  fieldName: string,
): HeraldrySnapshot {
  const field = Fields.all().find((entry) => entry.name === fieldName);
  if (field === undefined) {
    return snapshot;
  }
  return withDevice(snapshot, {
    ...snapshot.device,
    fieldName,
    variations: fitVariations(snapshot.device.variations, field.variationCount),
  });
}

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
 * One variation slot's pattern.
 *
 * Its tinctures are refitted, because a variation takes one or two of them and the slot may be
 * holding the wrong number after the change. A fur in a slot whose new variation cannot bear furs
 * is left alone: the blazon and the drawing both cope, and silently swapping a user's ermine for
 * argent is the kind of help nobody asked for.
 */
export function setHeraldryVariationName(
  snapshot: HeraldrySnapshot,
  slotIndex: number,
  variationName: string,
): HeraldrySnapshot {
  if (!hasIndex(snapshot.device.variations.length, slotIndex)) {
    return snapshot;
  }
  if (!heraldryVariationNames().includes(variationName)) {
    return snapshot;
  }
  const variation = fitVariation({
    ...snapshot.device.variations[slotIndex],
    variationName,
  });
  return withDevice(snapshot, {
    ...snapshot.device,
    variations: replaceAt(snapshot.device.variations, slotIndex, variation),
  });
}

export function setHeraldryVariationTincture(
  snapshot: HeraldrySnapshot,
  slotIndex: number,
  tinctureIndex: number,
  tinctureName: string,
): HeraldrySnapshot {
  if (!hasIndex(snapshot.device.variations.length, slotIndex)) {
    return snapshot;
  }
  const variation = snapshot.device.variations[slotIndex];
  if (
    !hasIndex(variation.tinctureNames.length, tinctureIndex) ||
    !heraldryTinctureNames().includes(tinctureName)
  ) {
    return snapshot;
  }
  return withDevice(snapshot, {
    ...snapshot.device,
    variations: replaceAt(snapshot.device.variations, slotIndex, {
      ...variation,
      tinctureNames: replaceAt(variation.tinctureNames, tinctureIndex, tinctureName),
    }),
  });
}

function setChargeGroup(
  snapshot: HeraldrySnapshot,
  index: number,
  change: (group: StoredChargeGroup) => StoredChargeGroup,
): HeraldrySnapshot {
  if (!hasIndex(snapshot.device.chargeGroups.length, index)) {
    return snapshot;
  }
  return withDevice(snapshot, {
    ...snapshot.device,
    chargeGroups: replaceAt(
      snapshot.device.chargeGroups,
      index,
      change(snapshot.device.chargeGroups[index]),
    ),
  });
}

/** The charge itself. A name this build has no glyph for is refused rather than drawn as nothing. */
export function setHeraldryChargeName(
  snapshot: HeraldrySnapshot,
  index: number,
  chargeName: string,
): HeraldrySnapshot {
  if (!heraldryChargeNames().includes(chargeName)) {
    return snapshot;
  }
  return setChargeGroup(snapshot, index, (group) => ({ ...group, chargeName }));
}

export function setHeraldryChargeTincture(
  snapshot: HeraldrySnapshot,
  index: number,
  chargeTinctureName: string,
): HeraldrySnapshot {
  if (!heraldryTinctureNames().includes(chargeTinctureName)) {
    return snapshot;
  }
  return setChargeGroup(snapshot, index, (group) => ({ ...group, chargeTinctureName }));
}

/**
 * How many charges are in the group.
 *
 * The arrangement follows, because an arrangement is drawn for a particular number of charges:
 * three charges in "two charges horizontal center" would draw two of them. The first arrangement
 * that fits is taken, deterministically — a re-roll is the operation that involves dice, and this
 * is not one.
 */
export function setHeraldryChargeCount(
  snapshot: HeraldrySnapshot,
  index: number,
  numberOfCharges: number,
): HeraldrySnapshot {
  const names = heraldryArrangementNamesForCount(numberOfCharges);
  if (names.length === 0) {
    return snapshot;
  }
  return setChargeGroup(snapshot, index, (group) => ({
    ...group,
    numberOfCharges,
    arrangementName: names.includes(group.arrangementName) ? group.arrangementName : names[0],
  }));
}

/** How the charges sit. Only arrangements that hold the group's own count are accepted. */
export function setHeraldryChargeArrangement(
  snapshot: HeraldrySnapshot,
  index: number,
  arrangementName: string,
): HeraldrySnapshot {
  if (!hasIndex(snapshot.device.chargeGroups.length, index)) {
    return snapshot;
  }
  const group = snapshot.device.chargeGroups[index];
  if (!heraldryArrangementNamesForCount(group.numberOfCharges).includes(arrangementName)) {
    return snapshot;
  }
  return setChargeGroup(snapshot, index, (current) => ({ ...current, arrangementName }));
}

/**
 * Where the group sits on the shield.
 *
 * `normal` is stored as no position at all, which is how the generator writes it and how the
 * blazon reads: arms are not blazoned "in the ordinary place".
 */
export function setHeraldryChargePosition(
  snapshot: HeraldrySnapshot,
  index: number,
  position: string,
): HeraldrySnapshot {
  if (!HERALDRY_CHARGE_POSITIONS.includes(position as HeraldryChargePosition)) {
    return snapshot;
  }
  return setChargeGroup(snapshot, index, (group) => {
    const { position: _dropped, ...rest } = group;
    return position === 'normal' ? rest : { ...rest, position };
  });
}

/**
 * A new charge group: one charge, centred, in sable.
 *
 * The first charge in the alphabet rather than a random one, for the reason the arrangement is
 * chosen deterministically above — and sable because it is the tincture the charge tables carry by
 * default, so the new group starts as the tables' own idea of a charge rather than as a guess.
 */
export function addHeraldryChargeGroup(snapshot: HeraldrySnapshot): HeraldrySnapshot {
  const chargeName = heraldryChargeNames()[0];
  if (chargeName === undefined) {
    return snapshot;
  }
  const group: StoredChargeGroup = {
    chargeName,
    chargeTinctureName: 'sable',
    numberOfCharges: 1,
    arrangementName: heraldryArrangementNamesForCount(1)[0],
  };
  return withDevice(snapshot, {
    ...snapshot.device,
    chargeGroups: [...snapshot.device.chargeGroups, group],
  });
}

export function removeHeraldryChargeGroup(
  snapshot: HeraldrySnapshot,
  index: number,
): HeraldrySnapshot {
  if (!hasIndex(snapshot.device.chargeGroups.length, index)) {
    return snapshot;
  }
  return withDevice(snapshot, {
    ...snapshot.device,
    chargeGroups: removeAt(snapshot.device.chargeGroups, index),
  });
}
