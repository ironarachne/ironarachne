/**
 * Editing a stored Uncharted Worlds character, one field at a time.
 *
 * Every function here takes a snapshot and returns a new one, changing nothing in place. That is
 * requirement 4.4 of docs/workshop.md satisfied by construction — renaming a character must not
 * disturb their stats, and correcting one career must not re-roll the rest — and it is what lets the
 * editing framework compare what is on screen against what was read to decide whether anything
 * needs saving.
 *
 * **There is no function for a skill's description, and that is the point.** The prose belongs to
 * the library, not to the user: it is derived on read from this build's tables so a wording fix
 * reaches a character saved last month (decision 3 of docs/readiness-characters.md). What a user
 * changes is *which* skill they have, and the description follows. The same holds for a career, an
 * origin and a workspace.
 *
 * An asset is the opposite case, and every part of one is editable: it was assembled at generation
 * time rather than looked up, so there is no table that owns its text.
 */

import { createAsset, createAssetType, createUpgrade, type StatBlock } from './character.js';
import type { StoredUwRow, UwCharacterSnapshot } from './uw_character_snapshot.js';

/** The identity and prose fields a user may rewrite. */
export const UW_TEXT_FIELDS = ['firstName', 'lastName', 'descriptors', 'advancement'] as const;

export type UwCharacterTextField = (typeof UW_TEXT_FIELDS)[number];

/** The five stats, in the order the sheet prints them. */
export const UW_STAT_FIELDS = [
  'physique',
  'mettle',
  'expertise',
  'influence',
  'interface',
] as const;

export type UwStatField = (typeof UW_STAT_FIELDS)[number];

/** The two lists of rulebook rows a character may hold more than one of. */
export type UwRowListField = 'careers' | 'skills';

/** The single rows a character holds exactly one of. */
export type UwRowField = 'origin' | 'workspace';

export function setUwCharacterText(
  snapshot: UwCharacterSnapshot,
  field: UwCharacterTextField,
  value: string,
): UwCharacterSnapshot {
  return { ...snapshot, [field]: value };
}

/**
 * One stat.
 *
 * A field the user has emptied arrives as `NaN` and is refused rather than stored: a character with
 * a Physique of `NaN` is a payload that fails its own kind's validation, which the user would meet
 * as a broken artifact rather than as a rejected keystroke.
 */
export function setUwCharacterStat(
  snapshot: UwCharacterSnapshot,
  field: UwStatField,
  value: number,
): UwCharacterSnapshot {
  if (!Number.isFinite(value)) {
    return snapshot;
  }
  const stats: StatBlock = { ...snapshot.stats, [field]: value };
  return { ...snapshot, stats };
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

/** The origin or the workspace, by name. Its description is this build's to supply. */
export function setUwCharacterRowName(
  snapshot: UwCharacterSnapshot,
  field: UwRowField,
  name: string,
): UwCharacterSnapshot {
  return { ...snapshot, [field]: { name } };
}

export function setUwCharacterRowListName(
  snapshot: UwCharacterSnapshot,
  list: UwRowListField,
  index: number,
  name: string,
): UwCharacterSnapshot {
  return hasIndex(snapshot[list].length, index)
    ? { ...snapshot, [list]: replaceAt(snapshot[list], index, { name }) }
    : snapshot;
}

export function addUwCharacterRow(
  snapshot: UwCharacterSnapshot,
  list: UwRowListField,
): UwCharacterSnapshot {
  const row: StoredUwRow = { name: '' };
  return { ...snapshot, [list]: [...snapshot[list], row] };
}

export function removeUwCharacterRow(
  snapshot: UwCharacterSnapshot,
  list: UwRowListField,
  index: number,
): UwCharacterSnapshot {
  return hasIndex(snapshot[list].length, index)
    ? { ...snapshot, [list]: removeAt(snapshot[list], index) }
    : snapshot;
}

/** The parts of an asset the sheet prints as text. */
export type UwAssetTextField = 'name' | 'description';

export function setUwCharacterAssetText(
  snapshot: UwCharacterSnapshot,
  index: number,
  field: UwAssetTextField,
  value: string,
): UwCharacterSnapshot {
  return hasIndex(snapshot.assets.length, index)
    ? {
        ...snapshot,
        assets: replaceAt(snapshot.assets, index, { ...snapshot.assets[index], [field]: value }),
      }
    : snapshot;
}

/** An asset's class, which is what says how much it can do and how many upgrades it carries. */
export function setUwCharacterAssetClass(
  snapshot: UwCharacterSnapshot,
  index: number,
  assetClass: number,
): UwCharacterSnapshot {
  return Number.isFinite(assetClass) && hasIndex(snapshot.assets.length, index)
    ? {
        ...snapshot,
        assets: replaceAt(snapshot.assets, index, { ...snapshot.assets[index], assetClass }),
      }
    : snapshot;
}

/** The asset's type — a Freighter, a Sidearm — which the name usually repeats in parentheses. */
export function setUwCharacterAssetTypeName(
  snapshot: UwCharacterSnapshot,
  index: number,
  name: string,
): UwCharacterSnapshot {
  return hasIndex(snapshot.assets.length, index)
    ? {
        ...snapshot,
        assets: replaceAt(snapshot.assets, index, {
          ...snapshot.assets[index],
          type: { ...snapshot.assets[index].type, name },
        }),
      }
    : snapshot;
}

export function addUwCharacterAsset(snapshot: UwCharacterSnapshot): UwCharacterSnapshot {
  // A blank asset of class 0 rather than a guessed one. Every part of an asset describes what the
  // draw gave it, and inventing a type and a class would put things on the sheet nothing stands
  // behind.
  return {
    ...snapshot,
    assets: [...snapshot.assets, createAsset('', '', 0, createAssetType('', ''), [])],
  };
}

export function removeUwCharacterAsset(
  snapshot: UwCharacterSnapshot,
  index: number,
): UwCharacterSnapshot {
  return hasIndex(snapshot.assets.length, index)
    ? { ...snapshot, assets: removeAt(snapshot.assets, index) }
    : snapshot;
}

export type UwUpgradeField = 'name' | 'description';

export function setUwCharacterUpgradeText(
  snapshot: UwCharacterSnapshot,
  assetIndex: number,
  upgradeIndex: number,
  field: UwUpgradeField,
  value: string,
): UwCharacterSnapshot {
  if (!hasIndex(snapshot.assets.length, assetIndex)) {
    return snapshot;
  }
  const asset = snapshot.assets[assetIndex];
  if (!hasIndex(asset.upgrades.length, upgradeIndex)) {
    return snapshot;
  }
  return {
    ...snapshot,
    assets: replaceAt(snapshot.assets, assetIndex, {
      ...asset,
      upgrades: replaceAt(asset.upgrades, upgradeIndex, {
        ...asset.upgrades[upgradeIndex],
        [field]: value,
      }),
    }),
  };
}

export function addUwCharacterUpgrade(
  snapshot: UwCharacterSnapshot,
  assetIndex: number,
): UwCharacterSnapshot {
  return hasIndex(snapshot.assets.length, assetIndex)
    ? {
        ...snapshot,
        assets: replaceAt(snapshot.assets, assetIndex, {
          ...snapshot.assets[assetIndex],
          upgrades: [...snapshot.assets[assetIndex].upgrades, createUpgrade('', '')],
        }),
      }
    : snapshot;
}

export function removeUwCharacterUpgrade(
  snapshot: UwCharacterSnapshot,
  assetIndex: number,
  upgradeIndex: number,
): UwCharacterSnapshot {
  if (!hasIndex(snapshot.assets.length, assetIndex)) {
    return snapshot;
  }
  const asset = snapshot.assets[assetIndex];
  return hasIndex(asset.upgrades.length, upgradeIndex)
    ? {
        ...snapshot,
        assets: replaceAt(snapshot.assets, assetIndex, {
          ...asset,
          upgrades: removeAt(asset.upgrades, upgradeIndex),
        }),
      }
    : snapshot;
}
