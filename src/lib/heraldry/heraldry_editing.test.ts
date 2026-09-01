import { describe, expect, it } from 'vitest';

import {
  addHeraldryChargeGroup,
  heraldryArrangementNamesForCount,
  heraldryChargeNames,
  heraldryFieldNames,
  heraldryTinctureNames,
  heraldryVariationNames,
  removeHeraldryChargeGroup,
  setHeraldryChargeArrangement,
  setHeraldryChargeCount,
  setHeraldryChargeName,
  setHeraldryChargePosition,
  setHeraldryChargeTincture,
  setHeraldryFieldName,
  setHeraldryVariationName,
  setHeraldryVariationTincture,
  storedDeviceBlazon,
} from './heraldry_editing.js';
import { rollHeraldrySnapshot } from './heraldry_roll.js';
import { defaultHeraldryGeneratorOptions } from './heraldry_snapshot.js';

/** A coat of arms with a charge group on it, which most of these tests need. */
const arms = rollHeraldrySnapshot('editing-fixture', {
  ...defaultHeraldryGeneratorOptions(),
  numberOfChargesOption: 'one',
});

describe('editing a coat of arms', () => {
  /** Requirement 4.4: one part at a time, and nothing else moves. */
  it('changes the field and leaves the charges alone', () => {
    const edited = setHeraldryFieldName(arms, 'fess');

    expect(edited.device.fieldName).toBe('fess');
    expect(edited.device.chargeGroups).toEqual(arms.device.chargeGroups);
  });

  it('changes a charge and leaves the field alone', () => {
    const other = heraldryChargeNames().find(
      (name) => name !== arms.device.chargeGroups[0].chargeName,
    )!;
    const edited = setHeraldryChargeName(arms, 0, other);

    expect(edited.device.chargeGroups[0].chargeName).toBe(other);
    expect(edited.device.fieldName).toBe(arms.device.fieldName);
    expect(edited.device.variations).toEqual(arms.device.variations);
  });

  it('never writes into the snapshot it was given', () => {
    const before = structuredClone(arms);
    setHeraldryFieldName(arms, 'pall');
    setHeraldryChargeTincture(arms, 0, 'Or');

    expect(arms).toEqual(before);
  });

  /** The blazon is derived, and a blazon that no longer describes the device is worse than none. */
  it('rederives the blazon after every change', () => {
    const edited = setHeraldryChargeTincture(arms, 0, 'purpure');

    expect(edited.blazon).not.toBe(arms.blazon);
    expect(edited.blazon).toContain('purpure');
    expect(edited.blazon).toBe(storedDeviceBlazon(edited.device));
  });

  it('leaves the artifact name alone, because that is the user’s', () => {
    expect(setHeraldryChargeTincture(arms, 0, 'purpure').name).toBe(arms.name);
  });

  /**
   * A field decides how many variation slots it has, so changing the division grows or trims them.
   * A slot that appears takes the tincture of the one before it: a newly divided field reads as two
   * halves of the same colour rather than as a hole where the second half should be.
   */
  it('fits the variation slots to the division', () => {
    const plain = setHeraldryFieldName(arms, 'plain');
    expect(plain.device.variations).toHaveLength(1);

    const pall = setHeraldryFieldName(plain, 'pall');
    expect(pall.device.variations).toHaveLength(3);
    expect(pall.device.variations[1].tinctureNames[0]).toBe(
      plain.device.variations[0].tinctureNames[0],
    );
  });

  it('fits a variation’s tinctures to the pattern it was given', () => {
    const barry = setHeraldryVariationName(arms, 0, 'barry');
    expect(barry.device.variations[0].tinctureNames).toHaveLength(2);

    const plain = setHeraldryVariationName(barry, 0, 'plain');
    expect(plain.device.variations[0].tinctureNames).toHaveLength(1);
    // The first tincture is kept: narrowing a pattern is not a reason to repaint the field.
    expect(plain.device.variations[0].tinctureNames[0]).toBe(
      barry.device.variations[0].tinctureNames[0],
    );
  });

  it('sets one variation tincture without touching the other', () => {
    const barry = setHeraldryVariationName(arms, 0, 'barry');
    const edited = setHeraldryVariationTincture(barry, 0, 0, 'sable');

    expect(edited.device.variations[0].tinctureNames[0]).toBe('sable');
    expect(edited.device.variations[0].tinctureNames[1]).toBe(
      barry.device.variations[0].tinctureNames[1],
    );
  });

  /**
   * The arrangement and the count are one decision in two fields: an arrangement is drawn for a
   * particular number of charges, so changing the count repairs the pairing.
   */
  it('repairs the arrangement when the count changes', () => {
    const three = setHeraldryChargeCount(arms, 0, 3);

    expect(three.device.chargeGroups[0].numberOfCharges).toBe(3);
    expect(heraldryArrangementNamesForCount(3)).toContain(
      three.device.chargeGroups[0].arrangementName,
    );
  });

  it('keeps an arrangement that still fits the new count', () => {
    const three = setHeraldryChargeCount(arms, 0, 3);
    const named = setHeraldryChargeArrangement(three, 0, 'three charges two and one');
    const again = setHeraldryChargeCount(named, 0, 3);

    expect(again.device.chargeGroups[0].arrangementName).toBe('three charges two and one');
  });

  it('refuses an arrangement that does not hold the group’s count', () => {
    expect(setHeraldryChargeArrangement(arms, 0, 'three charges two and one')).toBe(arms);
  });

  /** `normal` is stored as no position at all: arms are not blazoned "in the ordinary place". */
  it('stores a normal position as no position', () => {
    const inChief = setHeraldryChargePosition(arms, 0, 'in chief');
    expect(inChief.device.chargeGroups[0].position).toBe('in chief');
    expect(inChief.blazon).toContain('in chief');

    const normal = setHeraldryChargePosition(inChief, 0, 'normal');
    expect(normal.device.chargeGroups[0].position).toBeUndefined();
    expect(normal.blazon).not.toContain('in chief');
  });

  it('adds and removes a charge group', () => {
    const added = addHeraldryChargeGroup(arms);

    expect(added.device.chargeGroups).toHaveLength(arms.device.chargeGroups.length + 1);
    expect(added.blazon).not.toBe(arms.blazon);

    const removed = removeHeraldryChargeGroup(added, added.device.chargeGroups.length - 1);
    expect(removed.device.chargeGroups).toEqual(arms.device.chargeGroups);
    expect(removed.blazon).toBe(arms.blazon);
  });

  /** A name from outside the tables is refused: the editor's selects only ever offer real ones. */
  it('refuses a name this build does not have', () => {
    expect(setHeraldryFieldName(arms, 'per nothing')).toBe(arms);
    expect(setHeraldryVariationName(arms, 0, 'squiggly')).toBe(arms);
    expect(setHeraldryVariationTincture(arms, 0, 0, 'plaid')).toBe(arms);
    expect(setHeraldryChargeName(arms, 0, 'a thing nobody drew')).toBe(arms);
    expect(setHeraldryChargeTincture(arms, 0, 'plaid')).toBe(arms);
    expect(setHeraldryChargePosition(arms, 0, 'sideways')).toBe(arms);
  });

  /** An index nothing is at is a no-op, not a throw: the editor is driven by a live list. */
  it('ignores an index that is not there', () => {
    expect(setHeraldryVariationName(arms, 99, 'plain')).toBe(arms);
    expect(setHeraldryVariationTincture(arms, 0, 99, 'sable')).toBe(arms);
    expect(setHeraldryChargeName(arms, 99, heraldryChargeNames()[0])).toBe(arms);
    expect(setHeraldryChargeCount(arms, 99, 2)).toBe(arms);
    expect(removeHeraldryChargeGroup(arms, 99)).toBe(arms);
  });
});

describe('the editor’s option lists', () => {
  it('offers the names the tables actually have', () => {
    expect(heraldryFieldNames()).toContain('plain');
    expect(heraldryVariationNames()).toContain('plain');
    expect(heraldryTinctureNames()).toContain('argent');
    expect(heraldryChargeNames().length).toBeGreaterThan(0);
  });

  it('sorts the charges, because there are a great many of them', () => {
    const names = heraldryChargeNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('offers only the arrangements that hold a given count', () => {
    expect(heraldryArrangementNamesForCount(1)).toHaveLength(1);
    expect(heraldryArrangementNamesForCount(3).length).toBeGreaterThan(1);
    expect(heraldryArrangementNamesForCount(9)).toEqual([]);
  });
});

describe('storedDeviceBlazon', () => {
  it('describes a device this build can read', () => {
    expect(storedDeviceBlazon(arms.device)).toBe(arms.blazon);
  });

  /** A charge renamed since the arms were saved leaves the previous blazon standing. */
  it('gives nothing back for a device it cannot resolve', () => {
    expect(
      storedDeviceBlazon({
        ...arms.device,
        chargeGroups: [{ ...arms.device.chargeGroups[0], chargeName: 'nothing of the sort' }],
      }),
    ).toBeUndefined();
  });

  it('keeps the old blazon when an edit cannot be described', () => {
    const broken = {
      ...arms,
      device: {
        ...arms.device,
        chargeGroups: [{ ...arms.device.chargeGroups[0], chargeName: 'nothing of the sort' }],
      },
    };

    expect(setHeraldryChargeCount(broken, 0, 2).blazon).toBe(arms.blazon);
  });
});
