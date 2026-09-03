import { describe, expect, it } from 'vitest';

import {
  removeHoardItem,
  setHoardItemText,
  setHoardItemValue,
  setHoardTargetValue,
} from './treasure_hoard_editing';
import { defaultTreasureHoardConfigRecord, rollTreasureHoardSnapshot } from './treasure_hoard_roll';
import type { TreasureHoardSnapshot } from './treasure_hoard_snapshot';

const HOARD = rollTreasureHoardSnapshot('editing-seed', {
  ...defaultTreasureHoardConfigRecord(),
  value: 500,
});

/** The index of the first item that is packed inside a container, and the container holding it. */
function packedPair(hoard: TreasureHoardSnapshot): { itemIndex: number; containerId: string } {
  for (const container of hoard.items) {
    for (const id of container.contents ?? []) {
      const itemIndex = hoard.items.findIndex((item) => item.id === id);
      if (itemIndex >= 0) {
        return { itemIndex, containerId: container.id };
      }
    }
  }
  throw new Error('this hoard packed nothing into anything');
}

describe('setHoardItemText', () => {
  it('changes one item and nothing else', () => {
    const edited = setHoardItemText(HOARD, 0, 'name', 'the crown of a dead king');

    expect(edited.items[0].name).toBe('the crown of a dead king');
    expect(edited.items[1]).toEqual(HOARD.items[1]);
    expect(HOARD.items[0].name).not.toBe('the crown of a dead king');
  });

  it('does nothing for an item that is not there', () => {
    expect(setHoardItemText(HOARD, 999, 'name', 'nowhere')).toBe(HOARD);
    expect(setHoardItemText(HOARD, -1, 'name', 'nowhere')).toBe(HOARD);
  });
});

describe('setHoardItemValue', () => {
  it('takes the number given, flooring a cleared or negative one', () => {
    expect(setHoardItemValue(HOARD, 0, 4200).items[0].value).toBe(4200);
    expect(setHoardItemValue(HOARD, 0, Number.NaN).items[0].value).toBe(0);
    expect(setHoardItemValue(HOARD, 0, -1).items[0].value).toBe(0);
  });
});

describe('removeHoardItem', () => {
  it('takes one thing out', () => {
    const removed = removeHoardItem(HOARD, 0);

    expect(removed.items).toHaveLength(HOARD.items.length - 1);
    expect(removed.items.map((item) => item.id)).not.toContain(HOARD.items[0].id);
  });

  it('takes it out of whatever chest it was in', () => {
    // A chest naming an item that is no longer here reads as holding something invisible, and the
    // presentation would count it as packed and then find nothing to print.
    const { itemIndex, containerId } = packedPair(HOARD);
    const removedId = HOARD.items[itemIndex].id;
    const removed = removeHoardItem(HOARD, itemIndex);
    const container = removed.items.find((item) => item.id === containerId);

    expect(container?.contents).not.toContain(removedId);
    expect(HOARD.items.find((item) => item.id === containerId)?.contents).toContain(removedId);
  });

  it('leaves the numbers where they are', () => {
    // 4.2: a container's weight is not re-derived, and the target value is what the hoard was
    // *rolled for*, which stays true however much of it the party takes.
    const { containerId } = packedPair(HOARD);
    const before = HOARD.items.find((item) => item.id === containerId);
    const removed = removeHoardItem(HOARD, packedPair(HOARD).itemIndex);
    const after = removed.items.find((item) => item.id === containerId);

    expect(after?.currentWeight).toBe(before?.currentWeight);
    expect(removed.targetValue).toBe(HOARD.targetValue);
  });

  it('does nothing for an item that is not there', () => {
    expect(removeHoardItem(HOARD, 999)).toBe(HOARD);
  });

  it('empties completely, which is a hoard the party has carried off', () => {
    let emptied = HOARD;
    while (emptied.items.length > 0) {
      emptied = removeHoardItem(emptied, 0);
    }

    expect(emptied.items).toEqual([]);
    expect(emptied.targetValue).toBe(HOARD.targetValue);
  });
});

describe('setHoardTargetValue', () => {
  it('takes the number given, flooring a cleared or negative one', () => {
    expect(setHoardTargetValue(HOARD, 12_345).targetValue).toBe(12_345);
    expect(setHoardTargetValue(HOARD, Number.NaN).targetValue).toBe(0);
    expect(setHoardTargetValue(HOARD, -3).targetValue).toBe(0);
  });

  it('does not touch the items', () => {
    expect(setHoardTargetValue(HOARD, 1).items).toEqual(HOARD.items);
  });
});
